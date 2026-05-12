import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AlumniNetwork from './pages/AlumniNetwork'
import Jobs from './pages/Jobs'
import Events from './pages/Events'
import CareerHub from './pages/CareerHub'
import PrivateRoute from './components/PrivateRoute'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const { user, loading } = useAuth()
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (user) {
      const socket = io('http://localhost:5000');
      socket.emit('register_user', user._id || user.id);
      
      socket.on('receive_connection_request', (data) => {
        setNotification(`${data.fromUserName} has requested to connect with you!`);
        setTimeout(() => setNotification(null), 5000);
      });
      
      return () => socket.disconnect();
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 relative">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/alumni" element={<PrivateRoute><AlumniNetwork /></PrivateRoute>} />
          <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute><Events /></PrivateRoute>} />
          <Route path="/career" element={<PrivateRoute><CareerHub /></PrivateRoute>} />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </main>
      {notification && (
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce flex items-center gap-3">
          <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          <span className="font-semibold">{notification}</span>
        </div>
      )}
    </div>
  )
}

export default AppContent

