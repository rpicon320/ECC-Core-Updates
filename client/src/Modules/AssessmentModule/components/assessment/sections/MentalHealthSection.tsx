import React from 'react'
import { Smile, AlertCircle } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface MentalHealthSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

export default function MentalHealthSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: MentalHealthSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'

  // GDS-15 Questions with depression-indicative answers
  const gdsQuestions = [
    { id: 1, question: "Are you basically satisfied with your life?", indicativeAnswer: false },
    { id: 2, question: "Have you dropped many of your activities and interests?", indicativeAnswer: true },
    { id: 3, question: "Do you feel that your life is empty?", indicativeAnswer: true },
    { id: 4, question: "Do you often get bored?", indicativeAnswer: true },
    { id: 5, question: "Are you in good spirits most of the time?", indicativeAnswer: false },
    { id: 6, question: "Are you afraid that something bad is going to happen to you?", indicativeAnswer: true },
    { id: 7, question: "Do you feel happy most of the time?", indicativeAnswer: false },
    { id: 8, question: "Do you often feel helpless?", indicativeAnswer: true },
    { id: 9, question: "Do you prefer to stay at home, rather than going out and doing new things?", indicativeAnswer: true },
    { id: 10, question: "Do you feel you have more problems with memory than most people?", indicativeAnswer: true },
    { id: 11, question: "Do you think it is wonderful to be alive?", indicativeAnswer: false },
    { id: 12, question: "Do you feel pretty worthless the way you are now?", indicativeAnswer: true },
    { id: 13, question: "Do you feel full of energy?", indicativeAnswer: false },
    { id: 14, question: "Do you feel that your situation is hopeless?", indicativeAnswer: true },
    { id: 15, question: "Do you think that most people are better off than you are?", indicativeAnswer: true }
  ]

  // Calculate GDS-15 total score
  const calculateGDSScore = () => {
    let totalScore = 0
    gdsQuestions.forEach((question) => {
      const response = data[`gds_q${question.id}`]
      if (response === question.indicativeAnswer) {
        totalScore += 1
      }
    })
    return totalScore
  }

  // Get interpretation based on score
  const getGDSInterpretation = (score: number) => {
    if (score >= 0 && score <= 5) return "Normal"
    if (score >= 6 && score <= 9) return "Mild depression suggested"
    if (score >= 10 && score <= 15) return "Moderate to severe depression suggested"
    return "Invalid score"
  }

  const totalScore = calculateGDSScore()
  const interpretation = getGDSInterpretation(totalScore)

  // Handle GDS response change
  const handleGDSResponse = (questionId: number, value: boolean) => {
    onUpdateField(`gds_q${questionId}`, value)
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Smile className="h-6 w-6 mr-2 text-pink-500" />
          Mental Health Assessment
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

        {/* GDS-15 Assessment */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Geriatric Depression Scale (GDS-15)</h3>
          <p className="text-sm text-gray-600 mb-6">
            Please answer each question with Yes or No based on how you have felt over the past week.
          </p>

          <div className="space-y-4">
            {gdsQuestions.map((question) => (
              <div key={question.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      {question.id}. {question.question}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-6 flex-shrink-0">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`gds_q${question.id}`}
                        checked={data[`gds_q${question.id}`] === true}
                        onChange={() => handleGDSResponse(question.id, true)}
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
                        name={`gds_q${question.id}`}
                        checked={data[`gds_q${question.id}`] === false}
                        onChange={() => handleGDSResponse(question.id, false)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* GDS Score and Interpretation */}
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-4">GDS-15 Results</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalScore}</div>
                <div className="text-sm text-gray-600">Total Score (out of 15)</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${
                  totalScore <= 5 ? 'text-green-600' : 
                  totalScore <= 9 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {interpretation}
                </div>
                <div className="text-sm text-gray-600">Interpretation</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Scoring Guidelines:</strong></p>
              <p>• 0–5: Normal</p>
              <p>• 6–9: Mild depression suggested</p>
              <p>• 10–15: Moderate to severe depression suggested</p>
            </div>

            {/* Display formatted result */}
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="font-medium text-gray-900">
                Score: {totalScore} – {interpretation}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Assessment Fields */}
        <div className="space-y-6">
          {/* Assessor's Notes */}
          <div>
            <label htmlFor="assessor_notes" className="block text-sm font-medium text-gray-700 mb-2">
              Assessor's Notes or Observations
            </label>
            <textarea
              id="assessor_notes"
              value={data.assessor_notes as string || ''}
              onChange={(e) => onUpdateField('assessor_notes', e.target.value)}
              disabled={isReadOnly}
              rows={4}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Optional notes about client's presentation, behavior, or additional observations during the assessment..."
            />
          </div>

          {/* Referral Recommendation */}
          <div className="border rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={data.mental_health_referral as boolean || false}
                onChange={(e) => onUpdateField('mental_health_referral', e.target.checked)}
                disabled={isReadOnly}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 ${
                  isReadOnly ? 'cursor-not-allowed' : ''
                }`}
              />
              <span className="ml-3 text-sm text-gray-700">
                <strong>Referral to Mental Health Provider:</strong><br />
                Referral to mental health provider recommended based on GDS score and/or clinical presentation.
              </span>
            </label>
          </div>

          {/* Staff Review Confirmation */}
          <div className="border rounded-lg p-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.staff_review_confirmed as boolean || false}
                onChange={(e) => onUpdateField('staff_review_confirmed', e.target.checked)}
                disabled={isReadOnly}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  isReadOnly ? 'cursor-not-allowed' : ''
                }`}
              />
              <span className="ml-3 text-sm font-medium text-gray-700">
                <strong>Staff Review Confirmation:</strong> Reviewed by Assessor.
              </span>
            </label>
          </div>
        </div>

        {/* Form Status Summary */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-2">Assessment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>GDS-15 Responses:</strong> {gdsQuestions.filter(q => data[`gds_q${q.id}`] !== undefined).length}/15 completed</p>
              <p><strong>Total Score:</strong> {totalScore}</p>
              <p><strong>Interpretation:</strong> {interpretation}</p>
            </div>
            <div>
              <p><strong>Referral Recommended:</strong> {data.mental_health_referral ? 'Yes' : 'No'}</p>
              <p><strong>Reviewed by Assessor:</strong> {data.staff_review_confirmed ? 'Yes' : 'No'}</p>
              <p><strong>Form Status:</strong> {
                gdsQuestions.every(q => data[`gds_q${q.id}`] !== undefined) && 
                data.staff_review_confirmed ? 'Complete' : 'Incomplete'
              }</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}