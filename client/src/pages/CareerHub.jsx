import { useState, useRef, useEffect } from 'react'
import { Target, Brain, Video, Send, Upload, FileText, User, Bot, X } from 'lucide-react'
import axios from 'axios'

const AIChatWindow = ({ title, endpoint, requireResume, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || (requireResume && !hasResume && messages.length === 0)) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:5000/api/career/${endpoint}`, {
        message: userMsg,
        sessionId: sessionId,
        initResumeContext: requireResume && !sessionId ? resumeText : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessionId(res.data.sessionId);
      setMessages(prev => [...prev, { role: 'model', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: 'Ops! An error occurred connecting to the AI.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate resume parsing
      setResumeText(`Candidate uploaded resume: ${file.name}. High experience in web development.`);
      setHasResume(true);
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" /> {title}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {requireResume && !hasResume ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
              <Upload className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2 dark:text-white">Upload Your Resume</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              To provide the best mock interview experience, the AI needs context about your background.
            </p>
            <label className="btn-primary cursor-pointer px-8 py-3">
              Select Resume (PDF/DOC)
              <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} />
            </label>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 mt-10">
                  <p>Say hi to start the {title} session!</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                    {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                  </div>
                  <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center"><Bot size={16} className="text-white" /></div>
                  <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl rounded-tl-none flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                />
                <button onClick={handleSend} disabled={isTyping} className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors disabled:opacity-50">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const CareerHub = () => {
  const [activeChat, setActiveChat] = useState(null); // 'career', 'interview', null

  return (
    <div className="space-y-8 relative">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Career Hub
          </h1>
          <p className="text-slate-600 dark:text-slate-400">AI-powered career guidance via Google Gemini</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card p-8 border-l-4 border-emerald-500">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Target className="w-8 h-8 text-emerald-600" />
            AI Career Path Guide
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Chat with our intelligent AI to figure out how to level up your skills, discover new career trajectories, and plan your professional growth.</p>
          <button onClick={() => setActiveChat('career')} className="btn-primary w-full py-3 shadow-lg hover:shadow-xl">
            Start Career Chat
          </button>
        </div>

        <div className="card p-8 border-l-4 border-purple-500">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
            <Video className="w-8 h-8 text-purple-600" />
            Mock Interviews
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Sharpen your interviewing skills with our contextual AI. Our bot will parse your resume and give you personalized, technical questions.</p>
          <button onClick={() => setActiveChat('interview')} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-3 font-semibold shadow-lg hover:shadow-xl transition-all">
            Start Mock Interview
          </button>
        </div>
      </div>

      {activeChat === 'career' && (
        <AIChatWindow 
          title="Career Assistant" 
          endpoint="chat" 
          requireResume={false} 
          onClose={() => setActiveChat(null)} 
        />
      )}

      {activeChat === 'interview' && (
        <AIChatWindow 
          title="Mock Interview Simulator" 
          endpoint="mock-interview" 
          requireResume={true} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  )
}

export default CareerHub
