import React from 'react'
import { Utensils, Zap, Pill, Moon, AlertCircle } from 'lucide-react'
import { SectionData, ValidationError } from '../../../../../types/assessment'

interface HealthSymptomsSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

export default function HealthSymptomsSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: HealthSymptomsSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'

  const nutritionStatusOptions = [
    'Well-nourished',
    'At risk for malnutrition',
    'Mildly malnourished',
    'Moderately malnourished',
    'Severely malnourished'
  ]

  const painLevelOptions = [
    { value: 0, label: '0 - No pain' },
    { value: 1, label: '1 - Minimal pain' },
    { value: 2, label: '2 - Mild pain' },
    { value: 3, label: '3 - Uncomfortable' },
    { value: 4, label: '4 - Moderate pain' },
    { value: 5, label: '5 - Distressing' },
    { value: 6, label: '6 - Intense pain' },
    { value: 7, label: '7 - Very intense' },
    { value: 8, label: '8 - Utterly horrible' },
    { value: 9, label: '9 - Excruciating' },
    { value: 10, label: '10 - Unimaginable' }
  ]

  const adherenceOptions = [
    'Excellent (Takes all medications as prescribed)',
    'Good (Rarely misses doses)',
    'Fair (Sometimes misses doses)',
    'Poor (Frequently misses doses)',
    'Very Poor (Rarely takes medications)'
  ]

  const sleepQualityOptions = [
    'Excellent (7-9 hours, restful)',
    'Good (6-7 hours, mostly restful)',
    'Fair (5-6 hours, some disturbances)',
    'Poor (4-5 hours, frequent disturbances)',
    'Very Poor (Less than 4 hours, severe disturbances)'
  ]

  const painLocations = [
    'Head/Neck', 'Shoulders', 'Arms/Hands', 'Chest', 'Back', 
    'Abdomen', 'Hips', 'Legs/Feet', 'Joints', 'Muscles'
  ]

  const getFieldError = (fieldName: string) => {
    return validationErrors.find(error => error.field === fieldName)
  }

  const handlePainLocationChange = (location: string, checked: boolean) => {
    const currentLocations = (data.pain_locations as string[]) || []
    const newLocations = checked
      ? [...currentLocations, location]
      : currentLocations.filter(loc => loc !== location)
    
    onUpdateField('pain_locations', newLocations)
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Zap className="h-6 w-6 mr-2 text-orange-500" />
          Health and Symptom Management
        </h2>
        
        {/* Validation Errors Summary */}
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

        {/* Nutritional Assessment */}
        <div className="bg-green-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-green-900 mb-4 flex items-center">
            <Utensils className="h-5 w-5 mr-2" />
            Nutritional Assessment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nutrition_status" className="block text-sm font-medium text-gray-700 mb-2">
                Nutritional Status *
              </label>
              <select
                id="nutrition_status"
                value={data.nutrition_status as string || ''}
                onChange={(e) => onUpdateField('nutrition_status', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-md focus:ring-green-500 focus:border-green-500 ${
                  getFieldError('nutrition_status') ? 'border-red-300' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required
              >
                <option value="">Select nutritional status...</option>
                {nutritionStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="weight_status" className="block text-sm font-medium text-gray-700 mb-2">
                Weight Status
              </label>
              <select
                id="weight_status"
                value={data.weight_status as string || ''}
                onChange={(e) => onUpdateField('weight_status', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select weight status...</option>
                <option value="underweight">Underweight</option>
                <option value="normal">Normal weight</option>
                <option value="overweight">Overweight</option>
                <option value="obese">Obese</option>
              </select>
            </div>

            <div>
              <label htmlFor="appetite" className="block text-sm font-medium text-gray-700 mb-2">
                Appetite
              </label>
              <select
                id="appetite"
                value={data.appetite as string || ''}
                onChange={(e) => onUpdateField('appetite', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select appetite level...</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="very_poor">Very Poor</option>
              </select>
            </div>

            <div>
              <label htmlFor="dietary_restrictions" className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Restrictions
              </label>
              <input
                type="text"
                id="dietary_restrictions"
                value={data.dietary_restrictions as string || ''}
                onChange={(e) => onUpdateField('dietary_restrictions', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="e.g., diabetic diet, low sodium"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="nutrition_concerns" className="block text-sm font-medium text-gray-700 mb-2">
              Nutritional Concerns or Notes
            </label>
            <textarea
              id="nutrition_concerns"
              value={data.nutrition_concerns as string || ''}
              onChange={(e) => onUpdateField('nutrition_concerns', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Describe any nutritional concerns, feeding difficulties, or special dietary needs..."
            />
          </div>
        </div>

        {/* Pain Assessment */}
        <div className="bg-red-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-red-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Pain Assessment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="pain_level" className="block text-sm font-medium text-gray-700 mb-2">
                Current Pain Level (0-10 Scale) *
              </label>
              <select
                id="pain_level"
                value={data.pain_level as string || ''}
                onChange={(e) => onUpdateField('pain_level', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-md focus:ring-red-500 focus:border-red-500 ${
                  getFieldError('pain_level') ? 'border-red-300' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required
              >
                <option value="">Select pain level...</option>
                {painLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pain_frequency" className="block text-sm font-medium text-gray-700 mb-2">
                Pain Frequency
              </label>
              <select
                id="pain_frequency"
                value={data.pain_frequency as string || ''}
                onChange={(e) => onUpdateField('pain_frequency', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select frequency...</option>
                <option value="constant">Constant</option>
                <option value="frequent">Frequent (daily)</option>
                <option value="occasional">Occasional (weekly)</option>
                <option value="rare">Rare (monthly or less)</option>
                <option value="none">No pain</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-3">
                Pain Locations (Select all that apply)
              </legend>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {painLocations.map((location) => (
                  <label key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={((data.pain_locations as string[]) || []).includes(location)}
                      onChange={(e) => handlePainLocationChange(location, e.target.checked)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="mt-4">
            <label htmlFor="pain_management" className="block text-sm font-medium text-gray-700 mb-2">
              Current Pain Management Strategies
            </label>
            <textarea
              id="pain_management"
              value={data.pain_management as string || ''}
              onChange={(e) => onUpdateField('pain_management', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Describe current medications, therapies, or other pain management approaches..."
            />
          </div>
        </div>

        {/* Medication Management */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
            <Pill className="h-5 w-5 mr-2" />
            Medication Management
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="medication_adherence" className="block text-sm font-medium text-gray-700 mb-2">
                Medication Adherence *
              </label>
              <select
                id="medication_adherence"
                value={data.medication_adherence as string || ''}
                onChange={(e) => onUpdateField('medication_adherence', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  getFieldError('medication_adherence') ? 'border-red-300' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required
              >
                <option value="">Select adherence level...</option>
                {adherenceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="medication_assistance" className="block text-sm font-medium text-gray-700 mb-2">
                Assistance with Medications
              </label>
              <select
                id="medication_assistance"
                value={data.medication_assistance as string || ''}
                onChange={(e) => onUpdateField('medication_assistance', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select assistance level...</option>
                <option value="independent">Independent</option>
                <option value="reminder">Needs reminders</option>
                <option value="supervision">Needs supervision</option>
                <option value="assistance">Needs physical assistance</option>
                <option value="total_care">Requires total assistance</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="medication_concerns" className="block text-sm font-medium text-gray-700 mb-2">
              Medication Concerns or Side Effects
            </label>
            <textarea
              id="medication_concerns"
              value={data.medication_concerns as string || ''}
              onChange={(e) => onUpdateField('medication_concerns', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Describe any medication concerns, side effects, or management issues..."
            />
          </div>
        </div>

        {/* Sleep Assessment */}
        <div className="bg-purple-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-purple-900 mb-4 flex items-center">
            <Moon className="h-5 w-5 mr-2" />
            Sleep Assessment
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="sleep_quality" className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Quality *
              </label>
              <select
                id="sleep_quality"
                value={data.sleep_quality as string || ''}
                onChange={(e) => onUpdateField('sleep_quality', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                  getFieldError('sleep_quality') ? 'border-red-300' : 'border-gray-300'
                } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required
              >
                <option value="">Select sleep quality...</option>
                {sleepQualityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="sleep_hours" className="block text-sm font-medium text-gray-700 mb-2">
                Average Hours of Sleep per Night
              </label>
              <input
                type="number"
                id="sleep_hours"
                min="0"
                max="24"
                step="0.5"
                value={data.sleep_hours as string || ''}
                onChange={(e) => onUpdateField('sleep_hours', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="e.g., 7.5"
              />
            </div>

            <div>
              <label htmlFor="sleep_difficulties" className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Difficulties
              </label>
              <select
                id="sleep_difficulties"
                value={data.sleep_difficulties as string || ''}
                onChange={(e) => onUpdateField('sleep_difficulties', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select primary difficulty...</option>
                <option value="none">No difficulties</option>
                <option value="falling_asleep">Difficulty falling asleep</option>
                <option value="staying_asleep">Difficulty staying asleep</option>
                <option value="early_waking">Early morning waking</option>
                <option value="restless">Restless sleep</option>
                <option value="nightmares">Nightmares/bad dreams</option>
              </select>
            </div>

            <div>
              <label htmlFor="sleep_aids" className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Aids Used
              </label>
              <input
                type="text"
                id="sleep_aids"
                value={data.sleep_aids as string || ''}
                onChange={(e) => onUpdateField('sleep_aids', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="e.g., melatonin, prescription medications, none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor="sleep_notes" className="block text-sm font-medium text-gray-700 mb-2">
              Sleep Environment and Additional Notes
            </label>
            <textarea
              id="sleep_notes"
              value={data.sleep_notes as string || ''}
              onChange={(e) => onUpdateField('sleep_notes', e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Describe sleep environment, bedtime routine, or other relevant sleep information..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}