import React from 'react'
import { Brain, AlertCircle } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface CognitiveAssessmentSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

export default function CognitiveAssessmentSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: CognitiveAssessmentSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'

  const frequencyOptions = ['Rarely', 'Sometimes', 'Often', 'Regularly']
  const supportOptions = ['None', 'Weak', 'Moderate', 'Strong']

  const memoryQuestions = [
    {
      key: 'memory_concerns',
      question: 'Do you experience memory concerns?'
    },
    {
      key: 'others_concerns',
      question: 'Have others expressed concerns about your memory or cognitive function?'
    },
    {
      key: 'significant_dates',
      question: 'Do you struggle to remember significant dates or events?'
    },
    {
      key: 'disorientation',
      question: 'Have you experienced disorientation or confusion about your location?'
    }
  ]

  const handleYesNoChange = (questionKey: string, value: boolean) => {
    onUpdateField(questionKey, value)
    // Clear frequency if switching to No
    if (!value) {
      onUpdateField(`${questionKey}_frequency`, '')
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Brain className="h-6 w-6 mr-2 text-purple-500" />
          Cognitive Assessment
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

        {/* Memory Screening Questions */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">1. Memory Screening Questions</h3>
          <p className="text-sm text-gray-600 mb-6">
            Each question requires a Yes/No response. Select "Yes" to reveal a frequency dropdown.
          </p>
          
          <div className="space-y-6">
            {memoryQuestions.map((question) => (
              <div key={question.key} className="border rounded-lg p-4 bg-gray-50">
                <div className="space-y-4">
                  {/* Yes/No Question */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      {question.question}
                    </p>
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={question.key}
                          checked={data[question.key] === true}
                          onChange={() => handleYesNoChange(question.key, true)}
                          disabled={isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            isReadOnly ? 'cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="ml-2 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={question.key}
                          checked={data[question.key] === false}
                          onChange={() => handleYesNoChange(question.key, false)}
                          disabled={isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            isReadOnly ? 'cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="ml-2 text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Conditional Frequency Dropdown */}
                  {data[question.key] === true && (
                    <div className="ml-6 pt-3 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select frequency:
                      </label>
                      <select
                        value={data[`${question.key}_frequency`] as string || ''}
                        onChange={(e) => onUpdateField(`${question.key}_frequency`, e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="">Select frequency</option>
                        {frequencyOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cognitive Judgment Scenarios */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">2. Cognitive Judgment Scenarios</h3>
          <p className="text-sm text-gray-600 mb-6">
            Provide detailed responses to the following situations:
          </p>
          
          <div className="space-y-6">
            {/* Stove Fire Scenario */}
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your response to a stove fire:
              </label>
              <textarea
                value={data.stove_fire_response as string || ''}
                onChange={(e) => onUpdateField('stove_fire_response', e.target.value)}
                disabled={isReadOnly}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Describe the steps you would take if you encountered a fire on your stove..."
              />
            </div>

            {/* Chest Pain Scenario */}
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your actions if experiencing chest pain at night:
              </label>
              <textarea
                value={data.chest_pain_response as string || ''}
                onChange={(e) => onUpdateField('chest_pain_response', e.target.value)}
                disabled={isReadOnly}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Describe what you would do if you experienced chest pain during the night..."
              />
            </div>
          </div>
        </div>

        {/* Support Assessment */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">3. Support Assessment</h3>
          
          <div className="space-y-6">
            {/* Support System Evaluation */}
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Support System Evaluation
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {supportOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="support_system"
                      value={option}
                      checked={data.support_system === option}
                      onChange={(e) => onUpdateField('support_system', e.target.value)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cognitive Baseline Documentation */}
            <div className="border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cognitive Baseline Documentation
              </label>
              <textarea
                value={data.cognitive_baseline_notes as string || ''}
                onChange={(e) => onUpdateField('cognitive_baseline_notes', e.target.value)}
                disabled={isReadOnly}
                rows={6}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Document detailed notes about the client's cognitive baseline, observations, patterns, and any additional relevant information..."
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="cognitive_additional_notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Cognitive Assessment Notes
          </label>
          <textarea
            id="cognitive_additional_notes"
            value={data.cognitive_additional_notes as string || ''}
            onChange={(e) => onUpdateField('cognitive_additional_notes', e.target.value)}
            disabled={isReadOnly}
            rows={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Additional observations, recommendations, or notes about the cognitive assessment..."
          />
        </div>
      </div>
    </div>
  )
}