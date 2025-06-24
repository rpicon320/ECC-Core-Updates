import React from 'react';
import { CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react';

const TaskTrackerModule: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Tracker</h1>
              <p className="text-gray-600">Manage and track care management tasks</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-4">
                <CheckSquare className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600 mb-6">
                The Task Tracker module is currently under development. This feature will include:
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <CheckSquare className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Task Management</h3>
                  <p className="text-sm text-gray-600">Create, assign, and track care management tasks and follow-ups</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Due Date Tracking</h3>
                  <p className="text-sm text-gray-600">Set deadlines and receive notifications for upcoming tasks</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Priority Management</h3>
                  <p className="text-sm text-gray-600">Prioritize tasks by urgency and importance for better workflow</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Progress Tracking</h3>
                  <p className="text-sm text-gray-600">Monitor task completion rates and team productivity metrics</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-8">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                In Development
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTrackerModule;