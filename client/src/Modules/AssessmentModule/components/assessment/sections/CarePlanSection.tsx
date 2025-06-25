import React from 'react'
import { FileText, Calendar, Users, Target, AlertCircle, CheckCircle } from 'lucide-react'
import { useAssessment } from '../../../context/AssessmentContext'

export default function CarePlanSection() {
  const { state, actions } = useAssessment()
  const data = state.data.sections.care_plan?.data || {}

  const updateField = (field: string, value: any) => {
    actions.updateField('care_plan', field, value)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-emerald-600 px-6 py-4">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-white mr-3" />
            <h2 className="text-xl font-semibold text-white">Care Plan Development</h2>
          </div>
          <p className="text-emerald-100 mt-2 text-sm">
            Comprehensive care planning based on assessment findings
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Care Plan Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Care Plan Status</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Development Status
                </label>
                <select
                  value={data.development_status || ''}
                  onChange={(e) => updateField('development_status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select status</option>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="draft">Draft Complete</option>
                  <option value="under_review">Under Review</option>
                  <option value="finalized">Finalized</option>
                  <option value="implemented">Implemented</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={data.target_completion_date || ''}
                  onChange={(e) => updateField('target_completion_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Care Goals */}
          <div>
            <div className="flex items-center mb-4">
              <Target className="h-5 w-5 text-emerald-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Primary Care Goals</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short-term Goals (1-3 months)
                </label>
                <textarea
                  value={data.short_term_goals || ''}
                  onChange={(e) => updateField('short_term_goals', e.target.value)}
                  rows={3}
                  placeholder="Enter short-term care goals..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Long-term Goals (6+ months)
                </label>
                <textarea
                  value={data.long_term_goals || ''}
                  onChange={(e) => updateField('long_term_goals', e.target.value)}
                  rows={3}
                  placeholder="Enter long-term care goals..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Priority Areas */}
          <div>
            <div className="flex items-center mb-4">
              <AlertCircle className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Priority Care Areas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Medical Management',
                'Safety Concerns',
                'Functional Support',
                'Social Engagement',
                'Mental Health',
                'Nutrition',
                'Medication Management',
                'Emergency Planning'
              ].map((area) => (
                <label key={area} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.priority_areas?.includes(area) || false}
                    onChange={(e) => {
                      const currentAreas = data.priority_areas || []
                      const newAreas = e.target.checked
                        ? [...currentAreas, area]
                        : currentAreas.filter((a: string) => a !== area)
                      updateField('priority_areas', newAreas)
                    }}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Care Team Coordination */}
          <div>
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Care Team Coordination</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Care Coordinator
                </label>
                <input
                  type="text"
                  value={data.primary_coordinator || ''}
                  onChange={(e) => updateField('primary_coordinator', e.target.value)}
                  placeholder="Name and role of primary coordinator"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Communication Plan
                </label>
                <textarea
                  value={data.communication_plan || ''}
                  onChange={(e) => updateField('communication_plan', e.target.value)}
                  rows={3}
                  placeholder="Describe how the care team will communicate and coordinate..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Implementation Timeline */}
          <div>
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Implementation Timeline</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Immediate Actions (Next 30 days)
                </label>
                <textarea
                  value={data.immediate_actions || ''}
                  onChange={(e) => updateField('immediate_actions', e.target.value)}
                  rows={3}
                  placeholder="List actions to be taken within the next 30 days..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Schedule
                </label>
                <textarea
                  value={data.followup_schedule || ''}
                  onChange={(e) => updateField('followup_schedule', e.target.value)}
                  rows={2}
                  placeholder="Describe the schedule for follow-up assessments and plan reviews..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Notes and Additional Considerations */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
            <textarea
              value={data.additional_notes || ''}
              onChange={(e) => updateField('additional_notes', e.target.value)}
              rows={4}
              placeholder="Any additional considerations, special instructions, or notes for the care plan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Section Completion */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Care Plan section will be marked complete when key fields are filled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}