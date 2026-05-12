import { useState, useEffect } from 'react'
import { Users, UserPlus, Award, Search } from 'lucide-react'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useAuth } from '../contexts/AuthContext'

const AlumniNetwork = () => {
  const { user } = useAuth()
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAlumni()
  }, [])

  const fetchAlumni = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/alumni')
      setAlumni(res.data.alumni || [])
    } catch (error) {
      console.error('Error fetching alumni:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAlumni = alumni.filter(alum => 
    alum.name.toLowerCase().includes(search.toLowerCase()) ||
    alum.university.toLowerCase().includes(search.toLowerCase())
  )

  const handleConnect = (id) => {
    const socket = io('http://localhost:5000');
    socket.emit('send_connection_request', {
      fromUserId: user._id || user.id,
      fromUserName: user.name,
      toUserId: id
    });
    alert(`Connect request sent!`);
    setTimeout(() => socket.disconnect(), 1000);
  }

  const handleEndorse = (id, skill) => {
    alert(`Endorsed ${skill} for user ${id}!`)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Alumni Network
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Connect with {alumni.length}+ alumni</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary flex items-center space-x-2 px-6">
            <UserPlus size={20} />
            <span>New Connection</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search alumni by name or university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Alumni Grid */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full card p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading alumni...</p>
            </div>
          ) : filteredAlumni.length === 0 ? (
            <div className="col-span-full card p-12 text-center">
              <Users className="w-20 h-20 text-slate-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No alumni found</h3>
              <p className="text-slate-600 dark:text-slate-400">Try a different search term</p>
            </div>
          ) : (
            filteredAlumni.map((alum) => (
              <div key={alum._id} className="card hover:shadow-2xl group overflow-hidden">
                <div className="flex items-start space-x-4 p-6 pb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {alum.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {alum.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{alum.university}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                      Grad {alum.graduationYear || '???'}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                    {alum.bio || 'Passionate alumni ready to connect!'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(alum.skills || []).slice(0, 4).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleConnect(alum._id)}
                      className="flex-1 btn-primary py-2 text-sm font-semibold"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => handleEndorse(alum._id, 'JavaScript')}
                      className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-all font-medium text-sm"
                    >
                      <Award size={16} className="inline mr-1" />
                      Endorse
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AlumniNetwork

