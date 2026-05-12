import { useState, useEffect } from 'react'
import { Briefcase, DollarSign, MapPin, Calendar as CalIcon, Plus, X } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext'

const Jobs = () => {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '', company: '', description: '', employmentType: 'Full-time', location: 'Remote', salary_min: 0, salary_max: 0, applicationLink: ''
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jobs')
      setJobs(res.data.jobs || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyJob = async (job) => {
    // If external application link is provided, redirect to it
    if (job.applicationLink && job.applicationLink.trim() !== '') {
      window.open(job.applicationLink, '_blank');
      return;
    }

    // Otherwise, use the internal application system
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/jobs/${job._id}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the jobs list to reflect the application
      fetchJobs();
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to job:', error);
      alert(error.response?.data?.message || 'Failed to apply to job');
    }
  }

  const hasUserApplied = (job) => {
    if (!job.applicants || !user) return false;
    return job.applicants.some(applicant => applicant.user === user.id);
  }

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        employmentType: formData.employmentType,
        location: formData.location,
        salaryRange: { min: parseInt(formData.salary_min), max: parseInt(formData.salary_max) },
        applicationLink: formData.applicationLink
      };
      await axios.post('http://localhost:5000/api/jobs', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowModal(false);
      fetchJobs();
    } catch (err) {
      alert('Failed to post job');
    }
  }

  const estimateSalary = () => {
    window.open('http://localhost:5000/api/jobs/salary-estimate?experienceYears=3&skillCount=5&location=SF&university=Stanford')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Briefcase className="w-12 h-12 text-emerald-600" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
              Job Board
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Discover career opportunities</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={estimateSalary} className="bg-white dark:bg-slate-800 border border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center space-x-2 px-6 py-2 rounded-xl font-semibold transition-all">
            <DollarSign size={20} />
            <span>Salary Calculator</span>
          </button>
          {user && (
            <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-2 px-6 py-2 rounded-xl font-semibold transition-all shadow-lg">
              <Plus size={20} />
              <span>Post Job</span>
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-emerald-600 text-white">
              <h2 className="text-xl font-bold">Post a New Job</h2>
              <button onClick={() => setShowModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Job Title</label>
                  <input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Company</label>
                  <input required value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Description</label>
                <textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-xl h-24 dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Employment Type</label>
                  <select value={formData.employmentType} onChange={e=>setFormData({...formData, employmentType: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white">
                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Location</label>
                  <input required value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Min Salary (USD)</label>
                  <input type="number" required value={formData.salary_min} onChange={e=>setFormData({...formData, salary_min: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-slate-300">Max Salary (USD)</label>
                  <input type="number" required value={formData.salary_max} onChange={e=>setFormData({...formData, salary_max: e.target.value})} className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">External Application Link (Optional)</label>
                <input type="url" value={formData.applicationLink} onChange={e=>setFormData({...formData, applicationLink: e.target.value})} placeholder="https://company.com/careers/job-123" className="w-full p-2 border rounded-xl dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">If provided, users will be redirected to this link when applying</p>
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 mt-4 font-semibold shadow-lg">Publish Job</button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p>Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-20 h-20 text-slate-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No jobs yet</h3>
          <p className="text-slate-600 dark:text-slate-400">Be the first to post an opportunity</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="card group hover:shadow-2xl overflow-hidden">
              <div className="flex items-start space-x-4 p-6 pb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-1">
                    {job.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-2">{job.company}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-sm rounded-full font-medium">
                      {job.employmentType || 'Full-time'}
                    </span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm rounded-full font-medium">
                      {job.location}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-6">
                    {job.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                      <DollarSign size={16} />
                      <span>${job.salaryRange?.min || 'Negotiable'} - ${job.salaryRange?.max || 'Negotiable'}</span>
                      {job.skillsRequired?.slice(0, 2).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {job.applicants && job.applicants.length > 0 && (
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs rounded">
                          {job.applicants.length} applicants
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {hasUserApplied(job) ? (
                        <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-sm rounded-full font-medium">
                          Applied ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => applyJob(job)}
                          className="btn-primary py-2 px-6 text-sm font-semibold"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Jobs

