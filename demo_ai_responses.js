// Demo of enhanced AI responses
const getCareerFallbackResponse = (message, user, conversationHistory = []) => {
  const lowerMessage = message.toLowerCase();
  const userSkills = user.skills || [];
  const userYear = lowerMessage.includes('2nd year') || lowerMessage.includes('second year') ? 'second' : 
                   lowerMessage.includes('1st year') || lowerMessage.includes('first year') ? 'first' :
                   lowerMessage.includes('3rd year') || lowerMessage.includes('third year') ? 'third' : 
                   lowerMessage.includes('4th year') || lowerMessage.includes('final year') ? 'final' : 'unknown';
  
  const userDepartment = lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence') ? 'AI&DS' :
                        lowerMessage.includes('cs') || lowerMessage.includes('computer') ? 'CSE' :
                        lowerMessage.includes('mech') || lowerMessage.includes('mechanical') ? 'MECH' :
                        lowerMessage.includes('ece') || lowerMessage.includes('electronics') ? 'ECE' : 'General';
  
  // Check for conversation context to avoid repetition
  const lastResponses = conversationHistory.slice(-3).map(m => m.content.toLowerCase());
  
  // Greeting responses with variety
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    const greetings = [
      `Hello ${user.name}! I'm your AI career guide. I can help you with skill development, career paths, interview preparation, and industry insights. What's on your mind today?`,
      `Hi there ${user.name}! Great to see you. I'm here to help with your career journey. Are you looking for guidance on skills, job opportunities, or something else?`,
      `Hey ${user.name}! Welcome to your career assistant. I can provide personalized advice based on your background. What would you like to explore?`
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  // Enhanced skill recommendations with context awareness
  if (lowerMessage.includes('skill') || lowerMessage.includes('learn') || lowerMessage.includes('extra')) {
    // Avoid repeating the same skill advice
    if (lastResponses.some(resp => resp.includes('javascript') || resp.includes('react'))) {
      // Provide different skills if already mentioned
      if (userDepartment === 'AI&DS') {
        return `Since you're in AI&DS, beyond the basics, focus on: Advanced ML frameworks (TensorFlow, PyTorch), Cloud platforms (AWS, Azure), Data engineering tools (Apache Spark, Kafka), MLOps practices, and specialized areas like NLP or Computer Vision. Also consider learning Docker/Kubernetes for deployment.`;
      } else if (userYear === 'second') {
        return `For your second year, build on fundamentals with: Data structures & algorithms, Database management, Version control (Git), Basic web development, and start exploring your department's core subjects. Consider joining technical clubs and hackathons for practical experience.`;
      } else {
        return `Expand your skill set with: Cloud computing (AWS/Azure), DevOps tools, System design, Testing frameworks, and Soft skills (communication, teamwork). Also explore emerging technologies relevant to your field.`;
      }
    }
    
    // First-time skill recommendations
    if (userDepartment === 'AI&DS') {
      return `As an AI&DS student, focus on these key areas: Programming (Python, R), ML/DL frameworks (TensorFlow, PyTorch), Mathematics (Linear Algebra, Statistics), Data tools (Pandas, NumPy), and Cloud platforms. Start with Python fundamentals, then move to ML basics, and work on real datasets.`;
    } else if (userYear === 'second') {
      return `For your second year, prioritize: Strong programming fundamentals, Data structures & algorithms, Basic web development, Database concepts, and Communication skills. These foundations will make advanced topics easier later. Start building small projects to apply what you learn.`;
    } else {
      return `Based on current market demands, focus on: Programming languages (JavaScript, Python), Web technologies (React, Node.js), Database skills, Cloud platforms, and Problem-solving abilities. The key is consistency - practice daily and build projects that solve real problems.`;
    }
  }
  
  // Career path guidance
  if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('future')) {
    if (userDepartment === 'AI&DS') {
      return `AI&DS opens doors to: Data Scientist, ML Engineer, AI Researcher, Data Analyst, Research Scientist, and AI Consultant. Focus on building strong projects, publishing papers, and internships. The field is growing rapidly - start specializing in areas that interest you most.`;
    } else if (userYear === 'second') {
      return `You're at the perfect time to explore! Consider internships, open-source contributions, and building a portfolio. Research different roles, talk to alumni in various fields, and don't worry about having everything figured out yet. Exploration is key at this stage.`;
    } else {
      return `Your career options are expanding! Consider roles in software development, data science, cloud engineering, or product management. The key is finding what genuinely interests you. Try different projects, talk to professionals, and don't be afraid to pivot.`;
    }
  }
  
  // Interview and preparation advice
  if (lowerMessage.includes('interview') || lowerMessage.includes('prepare') || lowerMessage.includes('placement')) {
    return `For interview success: 1) Master data structures & algorithms 2) Practice system design questions 3) Prepare behavioral examples using STAR method 4) Research companies thoroughly 5) Do mock interviews regularly. Start 3-4 months before placement season for best results.`;
  }
  
  // Salary and compensation
  if (lowerMessage.includes('salary') || lowerMessage.includes('package') || lowerMessage.includes('ctc')) {
    return `Current fresher packages: Tier 1 colleges: 15-40 LPA, Tier 2: 8-20 LPA, Tier 3: 4-12 LPA. AI/ML roles often pay 20-50% premium. Focus on skills that pay well: Cloud, AI/ML, DevOps, and strong problem-solving. Internships can lead to pre-placement offers with better packages.`;
  }
  
  // Default intelligent response
  const defaultResponses = [
    `That's a thoughtful question! Based on your background, I'd recommend focusing on building practical skills through projects. The best way to learn is by doing - start small, be consistent, and gradually take on more complex challenges.`,
    `Great question! The key to success is continuous learning and adaptability. Technology changes fast, but strong fundamentals and problem-solving skills will always be valuable. What specific area interests you most?`,
    `I understand you're looking for guidance. Remember that everyone's journey is different - focus on understanding concepts deeply rather than just memorizing. Would you like me to elaborate on any particular topic?`
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// Demo with different scenarios
const mockUser = { name: "Student", skills: [], role: "student" };

console.log("🤖 ENHANCED AI RESPONSES DEMO");
console.log("=" * 50);

const scenarios = [
  {
    input: "hi I am in 2nd year AI&DS department, what skills to learn for future growth?",
    context: "First interaction - AI&DS student"
  },
  {
    input: "extra skills to be learned?",
    context: "Follow-up question - should give different response"
  },
  {
    input: "what career options after AI&DS?",
    context: "Career guidance request"
  },
  {
    input: "how to prepare for placements?",
    context: "Interview preparation"
  },
  {
    input: "what about salary packages?",
    context: "Salary information"
  }
];

scenarios.forEach((scenario, index) => {
  console.log(`\n📝 Scenario ${index + 1}: ${scenario.context}`);
  console.log(`User: "${scenario.input}"`);
  console.log(`AI: "${getCareerFallbackResponse(scenario.input, mockUser, [])}"`);
  console.log("-" * 50);
});

console.log("\n🎉 Enhanced AI Features:");
console.log("✅ Context-aware responses");
console.log("✅ Department-specific advice");
console.log("✅ Year-based recommendations");
console.log("✅ Conversation memory to avoid repetition");
console.log("✅ Multiple response variations");
console.log("✅ Industry-relevant content");
