import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Users, Briefcase, Calendar, Award, TrendingUp, Activity, Target, Zap, Eye } from 'lucide-react'

const statsData = [
  { name: 'Alumni Connections', value: 1247, change: '+12%', icon: Users, color: 'blue', growth: [1000, 1100, 1150, 1200, 1247], status: 'good', trend: 'up' },
  { name: 'Job Applications', value: 23, change: '+5%', icon: Briefcase, color: 'green', growth: [15, 18, 20, 22, 23], status: 'good', trend: 'up' },
  { name: 'Events Attended', value: 15, change: '+3%', icon: Calendar, color: 'purple', growth: [8, 10, 12, 14, 15], status: 'warning', trend: 'up' },
  { name: 'Endorsements', value: 42, change: '+8%', icon: Award, color: 'orange', growth: [25, 30, 35, 38, 42], status: 'good', trend: 'up' },
  { name: 'Salary Potential', value: 95000, change: '+15%', icon: TrendingUp, color: 'emerald', growth: [70000, 80000, 85000, 90000, 95000], status: 'excellent', trend: 'up' }
]

const getBgClass = (color) => {
  const classes = {
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
    green: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
    orange: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
    emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20'
  };
  return classes[color] || 'from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20';
};

const getColorPrefix = (color) => {
  const prefixes = {
    blue: 'blue',
    green: 'emerald',
    purple: 'purple',
    orange: 'orange',
    emerald: 'emerald'
  };
  return prefixes[color] || 'slate';
};

const getTextClass = (color) => {
  const classes = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-emerald-600 dark:text-emerald-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    emerald: 'text-emerald-600 dark:text-emerald-400'
  };
  return classes[color] || 'text-slate-600 dark:text-slate-400';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedStat, setSelectedStat] = useState(null);
  const [animatedValues, setAnimatedValues] = useState({});
  const [hoveredChart, setHoveredChart] = useState(null);

  useEffect(() => {
    statsData.forEach((stat, index) => {
      setTimeout(() => {
        animateValue(stat.name, 0, stat.value, 1000);
      }, index * 200);
    });
  }, []);

  const animateValue = (name, start, end, duration) => {
    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);
      
      setAnimatedValues(prev => ({
        ...prev,
        [name]: currentValue
      }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const formatValue = (value, name) => {
    if (name === 'Salary Potential') {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  };

  const getStatusColor = (status) => {
    const colors = {
      excellent: 'bg-green-500',
      good: 'bg-green-400', 
      warning: 'bg-yellow-400',
      danger: 'bg-red-500',
      neutral: 'bg-gray-400'
    };
    return colors[status] || 'bg-gray-400';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      excellent: 'text-green-600 dark:text-green-400',
      good: 'text-green-600 dark:text-green-400',
      warning: 'text-yellow-600 dark:text-yellow-400', 
      danger: 'text-red-600 dark:text-red-400',
      neutral: 'text-gray-600 dark:text-gray-400'
    };
    return colors[status] || 'text-gray-600';
  };

  const StatusLine = ({ status, width = '100%' }) => {
    return (
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getStatusColor(status)} transition-all duration-500`}
          style={{ width: width }}
        />
      </div>
    );
  };

  const QuickActions = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { icon: Briefcase, label: 'Find Jobs', color: 'emerald', route: '/jobs' },
        { icon: Users, label: 'Network', color: 'blue', route: '/alumni' },
        { icon: Calendar, label: 'Events', color: 'purple', route: '/events' },
        { icon: Target, label: 'Career Hub', color: 'orange', route: '/career' }
      ].map((action, index) => (
        <button
          key={index}
          onClick={() => navigate(action.route)}
          className={`group relative overflow-hidden bg-gradient-to-r ${getBgClass(action.color)} p-4 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer`}
        >
          <div className="relative z-10">
            <action.icon className={`w-6 h-6 ${getTextClass(action.color)} mb-2 group-hover:scale-110 transition-transform`} />
            <p className={`text-sm font-medium ${getTextClass(action.color)}`}>{action.label}</p>
          </div>
          <div className="absolute inset-0 bg-white/20 dark:bg-black/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
        </button>
      ))}
    </div>
  );

  const MiniChart = ({ data, color, height = 40 }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <div className="flex items-end space-x-1" style={{ height: `${height}px` }}>
        {data.map((value, index) => {
          const percentage = ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className={`flex-1 bg-${color}-500 rounded-t transition-all duration-300 hover:bg-${color}-600`}
              style={{ height: `${Math.max(percentage, 5)}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's your overview</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Live Data</span>
        </div>
      </div>

      {/* Interactive Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsData.map((stat, index) => (
          <div
            key={index}
            onClick={() => setSelectedStat(selectedStat === index ? null : index)}
            className={`group relative overflow-hidden bg-gradient-to-br ${getBgClass(stat.color)} p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${selectedStat === index ? 'ring-2 ring-' + getColorPrefix(stat.color) + '-500' : ''}`}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${getTextClass(stat.color)} group-hover:scale-110 transition-transform`} />
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(stat.status)} animate-pulse`} />
                  <span className={`text-xs font-semibold px-2 py-1 bg-white/50 dark:bg-black/30 rounded-full ${getTextClass(stat.color)}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {formatValue(animatedValues[stat.name] || 0, stat.name)}
              </h3>
              <p className={`text-sm font-medium ${getTextClass(stat.color)}`}>{stat.name}</p>
              
              {/* Status Line */}
              <div className="mt-3">
                <StatusLine status={stat.status} width="85%" />
              </div>
              
              {/* Mini Chart */}
              {selectedStat === index && (
                <div className="mt-4 pt-4 border-t border-white/20 dark:border-black/20">
                  <MiniChart data={stat.growth} color={getColorPrefix(stat.color)} />
                </div>
              )}
            </div>
            
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent dark:from-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <Eye className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[
              { name: 'Job applications', count: 12, status: 'excellent', trend: 'up' },
              { name: 'Profile views', count: 8, status: 'good', trend: 'up' },
              { name: 'Messages', count: 5, status: 'warning', trend: 'down' },
              { name: 'Event RSVPs', count: 3, status: 'danger', trend: 'down' }
            ].map((activity, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredChart(index)}
                onMouseLeave={() => setHoveredChart(null)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(activity.status)} animate-pulse`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{activity.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.count}</p>
                    <p className="text-xs text-slate-500">this week</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)} bg-opacity-20`}>
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(activity.status)}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Activity Status Summary */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Activity</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-gradient-to-r from-green-400 to-yellow-400 rounded-full" />
                </div>
                <span className="text-sm font-semibold text-green-600">Good</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Completion</h3>
            <Zap className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            {[
              { name: 'Basic Info', progress: 100, color: 'emerald', status: 'excellent' },
              { name: 'Skills', progress: 75, color: 'blue', status: 'good' },
              { name: 'Experience', progress: 60, color: 'purple', status: 'warning' },
              { name: 'Portfolio', progress: 40, color: 'orange', status: 'danger' }
            ].map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(item.status)} animate-pulse`} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-semibold ${getStatusTextColor(item.status)}`}>{item.progress}%</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(item.status)} bg-opacity-20`}>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-600 rounded-full transition-all duration-500 hover:shadow-lg`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Overall Progress Summary */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Completion</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">68.75%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full transition-all duration-500" style={{ width: '68.75%' }} />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">Complete your profile to get better matches</span>
              <span className={`text-xs font-semibold ${getStatusTextColor('warning')}`}>Needs Work</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard

