import React from 'react'
import { Activity, AlertCircle } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface FunctionalAssessmentSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

export default function FunctionalAssessmentSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: FunctionalAssessmentSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'

  const adlActivities = [
    { key: 'bathing', label: 'Bathing' },
    { key: 'dressing', label: 'Dressing' },
    { key: 'toileting', label: 'Toileting' },
    { key: 'transferring', label: 'Transferring' },
    { key: 'continence', label: 'Continence' },
    { key: 'feeding', label: 'Feeding' }
  ]

  const iadlActivities = [
    { key: 'phone', label: 'Using Telephone' },
    { key: 'shopping', label: 'Shopping' },
    { key: 'food_prep', label: 'Food Preparation' },
    { key: 'housekeeping', label: 'Housekeeping' },
    { key: 'laundry', label: 'Laundry' },
    { key: 'transportation', label: 'Transportation' },
    { key: 'medications', label: 'Managing Medications' },
    { key: 'finances', label: 'Managing Finances' }
  ]

  const scoreOptions = [
    { value: 0, label: 'Unable to perform' },
    { value: 1, label: 'Needs assistance' },
    { value: 2, label: 'Independent' }
  ]

  const equipmentOptions = [
    'Walker', 'Cane', 'Wheelchair', 'Shower chair', 'Grab bars',
    'Raised toilet seat', 'Hospital bed', 'Oxygen', 'Other'
  ]

  const calculateADLTotal = () => {
    return adlActivities.reduce((total, activity) => {
      const score = data[`adl_${activity.key}`] as number || 0
      return total + score
    }, 0)
  }

  const calculateIADLTotal = () => {
    return iadlActivities.reduce((total, activity) => {
      const score = data[`iadl_${activity.key}`] as number || 0
      return total + score
    }, 0)
  }

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    const currentEquipment = (data.equipment as string[]) || []
    const newEquipment = checked
      ? [...currentEquipment, equipment]
      : currentEquipment.filter(e => e !== equipment)
    
    onUpdateField('equipment', newEquipment)
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Activity className="h-6 w-6 mr-2 text-green-500" />
          Functional Assessment
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

        {/* Activities of Daily Living (ADLs) */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activities of Daily Living (ADLs)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Rate each activity: 0 = Unable to perform, 1 = Needs assistance, 2 = Independent
          </p>
          
          <div className="space-y-4">
            {adlActivities.map((activity) => (
              <div key={activity.key} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {activity.label}
                    </label>
                    <select
                      value={data[`adl_${activity.key}`] as number || 0}
                      onChange={(e) => onUpdateField(`adl_${activity.key}`, parseInt(e.target.value))}
                      disabled={isReadOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    >
                      {scoreOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.value} - {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={data[`adl_${activity.key}_comment`] as string || ''}
                      onChange={(e) => onUpdateField(`adl_${activity.key}_comment`, e.target.value)}
                      disabled={isReadOnly}
                      rows={2}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Additional details..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              ADL Total Score: {calculateADLTotal()} / 12
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Higher scores indicate greater independence
            </p>
          </div>
        </div>

        {/* Instrumental Activities of Daily Living (IADLs) */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Instrumental Activities of Daily Living (IADLs)</h3>
          <p className="text-sm text-gray-600 mb-4">
            Rate each activity: 0 = Unable to perform, 1 = Needs assistance, 2 = Independent
          </p>
          
          <div className="space-y-4">
            {iadlActivities.map((activity) => (
              <div key={activity.key} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {activity.label}
                    </label>
                    <select
                      value={data[`iadl_${activity.key}`] as number || 0}
                      onChange={(e) => onUpdateField(`iadl_${activity.key}`, parseInt(e.target.value))}
                      disabled={isReadOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    >
                      {scoreOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.value} - {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comments
                    </label>
                    <textarea
                      value={data[`iadl_${activity.key}_comment`] as string || ''}
                      onChange={(e) => onUpdateField(`iadl_${activity.key}_comment`, e.target.value)}
                      disabled={isReadOnly}
                      rows={2}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Additional details..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              IADL Total Score: {calculateIADLTotal()} / 16
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Higher scores indicate greater independence
            </p>
          </div>
        </div>

        {/* Equipment and Assistive Devices */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment and Assistive Devices</h3>
          <fieldset>
            <legend className="sr-only">Select all equipment currently used</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {equipmentOptions.map((equipment) => (
                <label key={equipment} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={((data.equipment as string[]) || []).includes(equipment)}
                    onChange={(e) => handleEquipmentChange(equipment, e.target.checked)}
                    disabled={isReadOnly}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      isReadOnly ? 'cursor-not-allowed' : ''
                    }`}
                  />
                  <span className="ml-2 text-sm text-gray-700">{equipment}</span>
                </label>
              ))}
            </div>
          </fieldset>
          
          {((data.equipment as string[]) || []).includes('Other') && (
            <div className="mt-4">
              <label htmlFor="equipmentOther" className="block text-sm font-medium text-gray-700 mb-1">
                Please specify other equipment
              </label>
              <input
                type="text"
                id="equipmentOther"
                value={data.equipmentOther as string || ''}
                onChange={(e) => onUpdateField('equipmentOther', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Describe other equipment used"
              />
            </div>
          )}
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="functionalNotes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Functional Assessment Notes
          </label>
          <textarea
            id="functionalNotes"
            value={data.functionalNotes as string || ''}
            onChange={(e) => onUpdateField('functionalNotes', e.target.value)}
            disabled={isReadOnly}
            rows={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Additional observations about functional status, mobility, safety concerns, etc."
          />
        </div>
      </div>
    </div>
  )
}