import React from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Mail, 
  Users, 
  FileText, 
  TrendingUp,
  Clock,
  Bell,
  Plus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardModule: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Open Tasks',
      description: 'View and manage your pending tasks',
      icon: CheckSquare,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      action: () => navigate('/tasks'),
      available: true
    },
    {
      title: "Today's Appointments",
      description: 'Check your scheduled appointments',
      icon: Calendar,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      action: () => navigate('/calendar'),
      available: true
    },
    {
      title: 'Access Email',
      description: 'Open your email client',
      icon: Mail,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
      action: () => window.open('mailto:', '_blank'),
      available: true
    },
    {
      title: 'Client Reports',
      description: 'Generate and view client reports',
      icon: FileText,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      action: () => {},
      available: false
    },
    {
      title: 'Analytics',
      description: 'View performance metrics and insights',
      icon: TrendingUp,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      action: () => {},
      available: false
    },
    {
      title: 'Notifications',
      description: 'Manage alerts and notifications',
      icon: Bell,
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600',
      action: () => {},
      available: false
    }
  ];

  const stats = [
    {
      label: 'Active Clients',
      value: '24',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Pending Tasks',
      value: '8',
      icon: CheckSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'This Week',
      value: '12',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Assessments',
      value: '6',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.first_name || profile?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your care management today.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow-md p-6 transition-all duration-200 ${
                    action.available
                      ? 'cursor-pointer hover:shadow-lg transform hover:scale-105'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={action.available ? action.action : undefined}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${action.color} ${action.available ? action.hoverColor : ''} transition-colors`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {action.description}
                      </p>
                      {!action.available && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              Coming Soon
            </span>
          </div>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Activity tracking will show your recent actions and system updates.
            </p>
            <p className="text-sm text-gray-400">
              This feature is currently under development.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardModule;