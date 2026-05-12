import { useState, useEffect } from 'react'
import { Calendar, MapPin, Video, Users, Plus, X } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const Events = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', type: 'networking', isVirtual: false, registrationLink: ''
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events')
      setEvents(res.data.events || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const rsvpEvent = (event) => {
  // If external registration link is provided, redirect to it
  if (event.registrationLink && event.registrationLink.trim() !== '') {
    window.open(event.registrationLink, '_blank');
    return;
  }

  // Otherwise, use the internal RSVP system
  alert(`RSVP for event ${event.title}!`);
}

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/events', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      alert('Failed to create event');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Calendar className="w-12 h-12 text-purple-600" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Events & Webinars
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Stay connected with upcoming alumni events</p>
          </div>
        </div>
        {(user) && (
          <button onClick={() => setShowModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center space-x-2 px-6 py-2 rounded-xl font-semibold transition-all shadow-lg self-start">
            <Plus size={20} />
            <span>Create Event</span>
          </button>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-purple-600 text-white">
              <h2 className="text-xl font-bold">Host New Event</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Event Title</label>
                <input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Description</label>
                <textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-xl h-24 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Event Type</label>
                  <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                    <option value="networking">Networking</option>
                    <option value="webinar">Webinar</option>
                    <option value="career_fair">Career Fair</option>
                    <option value="workshop">Workshop</option>
                    <option value="alumni_meet">Alumni Meet</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Date & Time</label>
                  <input type="datetime-local" required value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-center mt-2">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Location/Link</label>
                  <input required value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" id="isVirtual" checked={formData.isVirtual} onChange={e=>setFormData({...formData, isVirtual: e.target.checked})} className="w-4 h-4" />
                  <label htmlFor="isVirtual" className="text-sm dark:text-slate-300">Is Virtual?</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">External Registration Link (Optional)</label>
                <input type="url" value={formData.registrationLink} onChange={e=>setFormData({...formData, registrationLink: e.target.value})} placeholder="https://eventbrite.com/event-123" className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">If provided, users will be redirected to this link for registration</p>
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 mt-4 font-semibold shadow-lg">Publish Event</button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar className="w-20 h-20 text-slate-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No events scheduled</h3>
          <p className="text-slate-600 dark:text-slate-400">Check back soon for upcoming opportunities</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event._id} className="card group hover:shadow-xl border-l-4 border-purple-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">{event.type.toUpperCase()}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{event.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
                {event.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <MapPin size={16} />
                  <span>{event.location || 'Virtual'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <Users size={16} />
                  <span>{event.attendees?.length || 0} RSVPs</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => rsvpEvent(event)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
                >
                  Register Now
                </button>
                <button
                  onClick={() => rsvpEvent(event)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-3 px-4 rounded-xl font-semibold border border-slate-300 dark:border-slate-600 transition-all text-sm"
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Events

