import React from 'react';
import { Calendar, Clock, Users } from 'lucide-react';

const CalendarModule: React.FC = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600">Schedule and manage appointments</p>
            </div>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-4">
                <Calendar className="h-10 w-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Coming Soon</h2>
              <p className="text-gray-600 mb-6">
                The Calendar module is currently under development. This feature will include:
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Appointment Scheduling</h3>
                  <p className="text-sm text-gray-600">Schedule and manage client appointments with automated reminders</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Staff Coordination</h3>
                  <p className="text-sm text-gray-600">Coordinate schedules across care managers and staff members</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-gray-900">Calendar Views</h3>
                  <p className="text-sm text-gray-600">Multiple calendar views including daily, weekly, and monthly layouts</p>
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

export default CalendarModule;