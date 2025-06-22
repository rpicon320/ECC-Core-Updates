import React from 'react'
import { CheckCircle } from 'lucide-react'

interface ProgressIndicatorProps {
  percentage: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProgressIndicator({ 
  percentage, 
  showLabel = false, 
  size = 'md',
  className = ''
}: ProgressIndicatorProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const isComplete = percentage >= 100

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 min-w-0">
          {isComplete ? (
            <span className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </span>
          ) : (
            `${percentage}%`
          )}
        </span>
      )}
      
      <div className={`flex-1 bg-gray-200 rounded-full ${sizeClasses[size]} min-w-24`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-blue-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}