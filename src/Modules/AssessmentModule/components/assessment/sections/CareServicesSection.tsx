import React from 'react'
import { Settings, AlertCircle } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface CareServicesSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

export default function CareServicesSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: CareServicesSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'

  const serviceOptions = [
    'Cognitive/Memory Support',
    'Medical Advocacy & Coordination',
    'Medication Management Oversight',
    'Hospitalization & Discharge Coordination',
    'Home Safety Oversight',
    'Long-Term Planning',
    'Housing Transition/Placement Assistance',
    'End-of-Life Support & Guidance',
    'POA/Advance Directive Support',
    'Coordination with Family/POA',
    'Coordination with Providers/Community Services',
    'Emotional Support & Counseling',
    'Ongoing Wellness Check-ins',
    'Crisis Intervention',
    'Medicaid or LTC Application Support',
    'Legal/Financial Coordination',
    'Other'
  ]

  const priorityOptions = [
    'Urgent — Immediate intervention required',
    'High Priority — Start services within 1 week',
    'Moderate Priority — Services needed in next 2–4 weeks',
    'Future Planning — No immediate action, long-term guidance'
  ]

  // Handle service selection changes
  const handleServiceChange = (service: string, checked: boolean) => {
    const currentServices = (data.services_requested as string[]) || []
    const newServices = checked
      ? [...currentServices, service]
      : currentServices.filter(s => s !== service)
    
    onUpdateField('services_requested', newServices)
    
    // Clear "Other" text if unchecking "Other"
    if (service === 'Other' && !checked) {
      onUpdateField('services_requested_other', '')
    }
  }

  const selectedServices = (data.services_requested as string[]) || []

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Settings className="h-6 w-6 mr-2 text-gray-500" />
          Section 12: Care Management Services Requested
        </h2>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Service Options */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🗂️ Service Options</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              What care management services are being requested at this time?
            </label>
            
            <fieldset>
              <legend className="sr-only">Select all care management services that are being requested</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceOptions.map((service) => (
                  <label key={service} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service)}
                      onChange={(e) => handleServiceChange(service, e.target.checked)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-3 text-sm text-gray-700 leading-5">{service}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            
            {/* Other service specification */}
            {selectedServices.includes('Other') && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please specify other care management service:
                </label>
                <input
                  type="text"
                  value={data.services_requested_other as string || ''}
                  onChange={(e) => onUpdateField('services_requested_other', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Describe the other care management service needed"
                />
              </div>
            )}
          </div>
        </div>

        {/* Priority Level */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">⏱️ Priority Level</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How urgent is the need for services?
            </label>
            
            <fieldset>
              <legend className="sr-only">Select the urgency level for care management services</legend>
              <div className="space-y-3">
                {priorityOptions.map((priority) => (
                  <label key={priority} className="flex items-start">
                    <input
                      type="radio"
                      name="priority_level"
                      value={priority}
                      checked={data.priority_level === priority}
                      onChange={(e) => onUpdateField('priority_level', e.target.value)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-0.5 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-3 text-sm text-gray-700 leading-5">{priority}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* Care Manager Notes */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📝 Care Manager Notes</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes Regarding Care Management Needs
            </label>
            <p className="text-sm text-gray-600 mb-3">
              To capture clarifying details, expectations, or special instructions.
            </p>
            <textarea
              value={data.care_manager_notes as string || ''}
              onChange={(e) => onUpdateField('care_manager_notes', e.target.value)}
              disabled={isReadOnly}
              rows={6}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Provide additional details about care management needs, client expectations, family preferences, timeline considerations, special instructions, or any other relevant information..."
            />
          </div>
        </div>

        {/* Export Summary */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Care Management Services Requested or Recommended
          </h4>
          
          {selectedServices.length > 0 ? (
            <div className="space-y-4">
              {/* Services List */}
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-3">Requested Services:</h5>
                <ul className="space-y-2">
                  {selectedServices.map((service, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-1">•</span>
                      <span className="text-gray-700">
                        {service}
                        {service === 'Other' && data.services_requested_other && (
                          <span className="text-gray-600"> - {data.services_requested_other}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Priority Level */}
              {data.priority_level && (
                <div>
                  <h5 className="text-md font-medium text-gray-800 mb-2">Priority Level:</h5>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    (data.priority_level as string).includes('Urgent') ? 'bg-red-100 text-red-800' :
                    (data.priority_level as string).includes('High Priority') ? 'bg-orange-100 text-orange-800' :
                    (data.priority_level as string).includes('Moderate Priority') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {data.priority_level}
                  </p>
                </div>
              )}

              {/* Care Manager Notes */}
              {data.care_manager_notes && (
                <div>
                  <h5 className="text-md font-medium text-gray-800 mb-2">Additional Notes:</h5>
                  <div className="bg-white p-4 rounded border">
                    <p className="text-gray-700 whitespace-pre-wrap">{data.care_manager_notes}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No Services Requested</p>
              <p className="text-sm">
                Select care management services above to build the service request summary.
              </p>
            </div>
          )}

          {/* Summary Statistics */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{selectedServices.length}</p>
                <p className="text-gray-600">Services Requested</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">
                  {data.priority_level ? 
                    (data.priority_level as string).split(' —')[0] : 
                    'Not Set'
                  }
                </p>
                <p className="text-gray-600">Priority Level</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">
                  {data.care_manager_notes ? 'Yes' : 'No'}
                </p>
                <p className="text-gray-600">Additional Notes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}