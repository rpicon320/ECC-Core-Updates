import React from 'react'
import { BookOpen, ExternalLink } from 'lucide-react'

export default function Resources() {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Resources</h1>
        
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Resource Directory Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            The comprehensive resource directory will be available in Phase 3 of the application development.
            This will include local services, healthcare providers, support groups, and other valuable resources
            for elder care.
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Planned Features:</h3>
            <ul className="text-left text-blue-800 space-y-1">
              <li>• Local healthcare providers and specialists</li>
              <li>• Support groups and community services</li>
              <li>• Emergency contacts and hotlines</li>
              <li>• Educational materials and guides</li>
              <li>• Financial assistance programs</li>
              <li>• Transportation services</li>
              <li>• Home care and assisted living options</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}