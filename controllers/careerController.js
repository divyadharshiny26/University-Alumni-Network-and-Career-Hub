const User = require('../models/User');
const Mentorship = require('../models/Mentorship');
const ChatSession = require('../models/ChatSession');
const { recommendCareers, matchMentors } = require('../utils/aiRecs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// @desc Get career recommendations
// @route GET /api/career/recommendations
const getCareerRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('skills');
    const recommendations = recommendCareers(user.skills || []);
    res.json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
};

// @desc Get mentorship matches
// @route GET /api/career/mentorship-matches
const getMentorshipMatches = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('skills');
    const potentialMentors = await User.find({ 
      role: 'alumni', 
      $expr: { $gt: [{ $size: '$skills' }, 2] } 
    }).select('name skills avatar bio').limit(10);
    
    const matches = matchMentors(user.skills || [], potentialMentors);
    res.json({ success: true, matches });
  } catch (error) {
    next(error);
  }
};

// @desc Request mentorship
// @route POST /api/career/mentorship-request
const requestMentorship = async (req, res, next) => {
  try {
    const { mentorId, goals } = req.body;
    const mentorship = await Mentorship.create({
      mentor: mentorId,
      mentee: req.user.id,
      goals
    });
    res.status(201).json({ success: true, mentorship });
  } catch (error) {
    next(error);
  }
};

// @desc Chat with AI (Career Bot)
// @route POST /api/career/chat
const chatWithAI = async (req, res, next) => {
  try {
    const { message, sessionId } = req.body;
    const user = await User.findById(req.user.id);
    
    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
    } else {
      session = await ChatSession.create({ user: req.user.id, sessionType: 'career_chat' });
    }

    let responseText;
    
    // Try Gemini API first
    if (genAI) {
      try {
        const sysInst = `You are a career advisory AI helping ${user.name}, who is a ${user.role} with skills: ${user.skills.join(', ')}. Keep answers brief and encouraging.`;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
          history: session.messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
        });

        const result = await chat.sendMessage(message);
        responseText = result.response.text();
      } catch (aiError) {
        console.log('Gemini API unavailable, using enhanced fallback responses');
        responseText = getCareerFallbackResponse(message, user, session.messages);
      }
    } else {
      responseText = getCareerFallbackResponse(message, user, session.messages);
    }

    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'model', content: responseText });
    await session.save();

    res.json({ success: true, response: responseText, sessionId: session._id });
  } catch (error) {
    next(error);
  }
};

// @desc Start/Continue Mock Interview
// @route POST /api/career/mock-interview
const mockInterview = async (req, res, next) => {
  try {
    const { message, sessionId, initResumeContext } = req.body;
    const user = await User.findById(req.user.id);
    
    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
    } else {
      session = await ChatSession.create({ 
        user: req.user.id, 
        sessionType: 'mock_interview',
        resumeContext: initResumeContext || user.skills.join(', ')
      });
    }

    let responseText;
    
    // Try Gemini API first
    if (genAI) {
      try {
        const sysInst = `You are an expert technical interviewer. The candidate is ${user.name}. Resume/Context: ${session.resumeContext}. Ask one interview question at a time. Evaluate their answer, then ask the next. Handle control commands like "enough", "feedback", "stop", "help" appropriately.`;
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const chat = model.startChat({
          history: session.messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
        });

        const result = await chat.sendMessage(message || 'Hi, I am ready to begin my interview.');
        responseText = result.response.text();
      } catch (aiError) {
        console.log('Gemini API unavailable, using enhanced fallback interview responses');
        responseText = getInterviewFallbackResponse(message, session.messages.length, user, session.messages);
      }
    } else {
      responseText = getInterviewFallbackResponse(message, session.messages.length, user, session.messages);
    }

    if (message) session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'model', content: responseText });
    await session.save();

    res.json({ success: true, response: responseText, sessionId: session._id });
  } catch (error) {
    next(error);
  }
};

// Enhanced AI with better training data and context awareness
const getCareerFallbackResponse = (message, user, conversationHistory = []) => {
  const lowerMessage = message.toLowerCase();
  const userSkills = user.skills || [];
  
  // Analyze conversation context to avoid repetition
  const recentUserMessages = conversationHistory.filter(m => m.role === 'user').slice(-3).map(m => m.content.toLowerCase());
  const recentAiResponses = conversationHistory.filter(m => m.role === 'model').slice(-3).map(m => m.content.toLowerCase());
  
  // Extract user context from message
  const userYear = lowerMessage.includes('2nd year') || lowerMessage.includes('second year') ? 'second' : 
                   lowerMessage.includes('1st year') || lowerMessage.includes('first year') ? 'first' :
                   lowerMessage.includes('3rd year') || lowerMessage.includes('third year') ? 'third' : 
                   lowerMessage.includes('4th year') || lowerMessage.includes('final year') ? 'final' : 'unknown';
  
  const userDepartment = lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence') ? 'AI&DS' :
                        lowerMessage.includes('cs') || lowerMessage.includes('computer') ? 'CSE' :
                        lowerMessage.includes('mech') || lowerMessage.includes('mechanical') ? 'MECH' :
                        lowerMessage.includes('ece') || lowerMessage.includes('electronics') ? 'ECE' : 'General';
  
  // Check if we've recently given similar advice
  const recentlyDiscussedSkills = recentAiResponses.some(resp => 
    resp.includes('javascript') || resp.includes('react') || resp.includes('python') || resp.includes('skills')
  );
  
  // Greeting responses with variety and context
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    if (recentUserMessages.includes('hello') || recentUserMessages.includes('hi')) {
      return `Welcome back ${user.name}! Did you have any follow-up questions from our last conversation, or is there something new you'd like to explore today?`;
    }
    
    const greetings = [
      `Hello ${user.name}! I'm your AI career guide. I can help with skill development, career paths, interview prep, and industry insights. What's on your mind today?`,
      `Hi there ${user.name}! Great to connect. I'm here to help with your career journey. Are you looking for guidance on skills, job opportunities, or something else?`,
      `Hey ${user.name}! Welcome to your career assistant. I can provide personalized advice based on your background. What would you like to explore?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Enhanced skill recommendations with better context
  if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('extra') || lowerMessage.includes('what should')) {
    // Check if we've already discussed skills recently
    if (recentlyDiscussedSkills) {
      // Provide different angle on skills
      if (userDepartment === 'AI&DS') {
        return `Beyond technical skills, focus on: Research methodology, Academic writing, Presentation skills, Networking at conferences, and Building a portfolio on GitHub. Also consider Kaggle competitions and internships for practical experience.`;
      } else if (userYear === 'second') {
        return `For holistic development, work on: Communication skills, Team collaboration, Time management, Problem-solving approach, and Building a personal brand. Join technical clubs, participate in hackathons, and start a tech blog.`;
      } else {
        return `Complement your technical skills with: Business acumen, Project management, Client communication, Leadership abilities, and Industry awareness. Read tech blogs, attend meetups, and stay updated with market trends.`;
      }
    }
    
    // First-time or different skill recommendations
    if (userDepartment === 'AI&DS') {
      return `As an AI&DS student, prioritize: Python programming, Statistics & Probability, Linear Algebra, ML frameworks (TensorFlow/PyTorch), Data visualization tools, and Cloud platforms. Start with Python basics, then move to data analysis, and gradually explore ML algorithms.`;
    } else if (userYear === 'second') {
      return `For your second year, focus on: Programming fundamentals (Python/JavaScript), Data structures & algorithms, Basic web development, Database concepts, and Communication skills. These foundations will make advanced topics easier later.`;
    } else {
      return `Based on current industry demands, develop: Strong programming skills, Web technologies, Cloud computing basics, Database knowledge, and Problem-solving abilities. The key is consistent practice and building real projects.`;
    }
  }
  
  // Career path guidance with more specific advice
  if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('future') || lowerMessage.includes('options')) {
    if (userDepartment === 'AI&DS') {
      return `AI&DS offers diverse paths: Data Scientist (analyze patterns), ML Engineer (build models), AI Researcher (push boundaries), Data Analyst (business insights), AI Consultant (advise companies), or Research Scientist. Start with internships, build ML projects, and consider higher studies if research interests you.`;
    } else if (userYear === 'second') {
      return `You're at the perfect exploration stage! Try different domains: Web development, mobile apps, data science, cloud computing, or cybersecurity. Do internships, personal projects, and talk to alumni in different fields. It's okay to not have everything figured out yet.`;
    } else {
      return `Your career options are expanding! Consider: Software development, Data science, Cloud engineering, Product management, or DevOps. Research roles that align with your interests, build relevant skills, and network with professionals in those areas.`;
    }
  }
  
  // Interview and preparation with detailed guidance
  if (lowerMessage.includes('interview') || lowerMessage.includes('prepare') || lowerMessage.includes('placement')) {
    return `For interview success: 1) Master DS&A (LeetCode practice) 2) Build projects to discuss 3) Prepare STAR method examples 4) Research companies thoroughly 5) Practice mock interviews. Start 3-4 months early, focus on fundamentals, and don't memorize - understand concepts deeply.`;
  }
  
  // Salary and compensation with realistic expectations
  if (lowerMessage.includes('salary') || lowerMessage.includes('package') || lowerMessage.includes('ctc') || lowerMessage.includes('earn')) {
    return `Current fresher packages: Tier 1: 15-40 LPA, Tier 2: 8-20 LPA, Tier 3: 4-12 LPA. AI/ML roles pay 20-50% premium. Focus on high-paying skills: Cloud, AI/ML, DevOps, and strong problem-solving. Good internships can lead to PPOs with better packages. Location also impacts salary significantly.`;
  }
  
  // Project and portfolio advice
  if (lowerMessage.includes('project') || lowerMessage.includes('portfolio') || lowerMessage.includes('build')) {
    return `Build impactful projects! For AI&DS: Try sentiment analysis, recommendation systems, or computer vision apps. For general CS: Create web apps, mobile apps, or contribute to open-source. Document everything on GitHub, write clean code, and include a README with setup instructions.`;
  }
  
  // Handle follow-up questions and continuation
  if (lowerMessage.includes('more') || lowerMessage.includes('elaborate') || lowerMessage.includes('explain') || lowerMessage.includes('tell me')) {
    return `I'd be happy to elaborate! Could you specify which area you'd like me to expand on? For example: more about specific skills, career paths in your field, interview preparation strategies, or something else entirely?`;
  }
  
  // Handle thanks and appreciation
  if (lowerMessage.includes('thank') || lowerMessage.includes('helpful') || lowerMessage.includes('good')) {
    return `You're welcome ${user.name}! I'm glad I could help. Remember that career development is a journey - keep learning, stay curious, and don't hesitate to ask questions anytime. Is there anything else you'd like to explore?`;
  }
  
  // Default intelligent responses with variety
  const defaultResponses = [
    `That's a great question! To give you the most relevant advice, could you tell me more about your current situation - what year you're in, your department, and what specific areas interest you most?`,
    `I'd love to help you with that! Based on your query, I think focusing on practical skills through projects would be valuable. What specific domain or technology area catches your interest the most?`,
    `Excellent question! The best approach depends on your goals. Are you more interested in immediate job opportunities, long-term career growth, or exploring different fields? This will help me give you more targeted advice.`
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

const getInterviewFallbackResponse = (message, messageCount, user, conversationHistory = []) => {
  const lowerMessage = message.toLowerCase();
  
  // Handle interview control commands
  if (lowerMessage.includes('enough') || lowerMessage.includes('stop') || lowerMessage.includes('finish')) {
    return `I understand you'd like to stop. Here's your interview feedback: You've demonstrated good technical knowledge. For improvement, focus on providing more detailed examples and practicing STAR method for behavioral questions. Would you like specific feedback on any of your answers?`;
  }
  
  if (lowerMessage.includes('suggestion') || lowerMessage.includes('feedback') || lowerMessage.includes('performance') || lowerMessage.includes('how did i do')) {
    return `Based on your responses, you show good understanding of core concepts. Strengths: Clear explanations, fundamental knowledge. Areas to improve: Add real-world examples, explain trade-offs, mention best practices. Overall performance: Good! Keep practicing and you'll do great in actual interviews.`;
  }
  
  if (lowerMessage.includes('hint') || lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
    return `No worries! Let me help. Think about: What problem does this concept solve? Can you give a real example? When would you use this in practice? Take your time and break it down step by step.`;
  }
  
  if (!message || messageCount === 0) {
    return `Hello ${user.name}! Welcome to your mock interview. I'll ask technical questions and provide feedback. You can say "enough" to stop or "feedback" for performance review. Ready? Let's start: Can you tell me about a recent project you're proud of and what technologies you used?`;
  }
  
  // Check if this is an answer to a question (odd message count)
  if (messageCount % 2 === 1) {
    // This is user's answer - provide feedback and ask next question
    const feedbackResponses = [
      "Good explanation! You've covered the key points. ",
      "Nice answer! Your understanding is clear. ",
      "Well done! That's a solid response. ",
      "Great thinking! You've explained it well. ",
      "Excellent! Your approach shows good knowledge. "
    ];
    
    const improvementTips = [
      "Next time, try adding a real-world example to make it even better.",
      "Consider mentioning when you'd use this in a practical scenario.",
      "You could also discuss any limitations or trade-offs.",
      "Try to be more specific about implementation details.",
      "Good! Now let's move to the next question."
    ];
    
    const feedback = feedbackResponses[Math.floor(Math.random() * feedbackResponses.length)];
    const tip = improvementTips[Math.floor(Math.random() * improvementTips.length)];
    
    // Get next question
    const questionIndex = Math.floor(messageCount / 2);
    const interviewQuestions = [
      "What's the difference between let, const, and var in JavaScript?",
      "Can you explain the concept of closures in JavaScript?",
      "How do you handle asynchronous operations in JavaScript?",
      "What is React Hooks and why would you use them?",
      "Explain the virtual DOM in React.",
      "Can you explain the difference between SQL and NoSQL databases?",
      "What is the purpose of middleware in Node.js?",
      "How would you optimize a web application's performance?",
      "What's the difference between GET and POST requests?",
      "Explain RESTful API design principles."
    ];
    
    const nextQuestion = interviewQuestions[questionIndex % interviewQuestions.length];
    
    return `${feedback}${tip} Now for my next question: ${nextQuestion}`;
  }
  
  // This should not happen in normal flow, but handle it
  return "I'm here to help you practice. Would you like to continue with questions or would you prefer some feedback on your performance so far?";
};

module.exports = {
  getCareerRecommendations,
  getMentorshipMatches,
  requestMentorship,
  chatWithAI,
  mockInterview
};
