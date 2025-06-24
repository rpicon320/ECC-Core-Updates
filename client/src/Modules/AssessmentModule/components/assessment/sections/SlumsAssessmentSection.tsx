import React, { useState } from 'react'
import { ClipboardList, Brain, AlertCircle, CheckCircle, X } from 'lucide-react'
import { SectionData, ValidationError } from '../../../../../types/assessment'

interface SlumsAssessmentSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

export default function SlumsAssessmentSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: SlumsAssessmentSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'
  const [showInstructions, setShowInstructions] = useState(false)

  // Education level options
  const educationLevels = [
    'High School Graduate',
    'Less than High School'
  ]

  // Calculate total score
  const calculateTotalScore = () => {
    let totalScore = 0
    
    // Question 1: Day
    totalScore += data.slums_q1_score as number || 0
    
    // Question 2: Year
    totalScore += data.slums_q2_score as number || 0
    
    // Question 3: State
    totalScore += data.slums_q3_score as number || 0
    
    // Question 5: Math
    totalScore += (data.slums_q5_spent_score as number || 0) + (data.slums_q5_left_score as number || 0)
    
    // Question 6: Animals
    totalScore += data.slums_q6_score as number || 0
    
    // Question 7: Recall
    totalScore += data.slums_q7_score as number || 0
    
    // Question 8: Numbers
    totalScore += data.slums_q8_score as number || 0
    
    // Question 9: Clock
    totalScore += data.slums_q9_score as number || 0
    
    // Question 10: Triangle
    totalScore += data.slums_q10_score as number || 0
    
    // Question 11: Story
    totalScore += (data.slums_q11_name_score as number || 0) + 
                 (data.slums_q11_work_score as number || 0) + 
                 (data.slums_q11_when_score as number || 0) + 
                 (data.slums_q11_state_score as number || 0)
    
    return totalScore
  }

  // Get interpretation based on score and education level
  const getInterpretation = (score: number, educationLevel: string | undefined) => {
    if (!educationLevel) return 'Please select education level for interpretation'
    
    if (educationLevel === 'High School Graduate') {
      if (score >= 27) return 'Normal Cognition'
      if (score >= 21 && score <= 26) return 'Mild Cognitive Impairment'
      if (score <= 20) return 'Dementia'
    } else { // Less than High School
      if (score >= 25) return 'Normal Cognition'
      if (score >= 20 && score <= 24) return 'Mild Cognitive Impairment'
      if (score <= 19) return 'Dementia'
    }
    
    return 'Unable to determine'
  }

  const totalScore = calculateTotalScore()
  const interpretation = getInterpretation(totalScore, data.cognitive_education_level as string)

  // Get interpretation color
  const getInterpretationColor = (interpretation: string) => {
    if (interpretation.includes('Normal')) return 'text-green-600'
    if (interpretation.includes('Mild')) return 'text-yellow-600'
    if (interpretation.includes('Dementia')) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <ClipboardList className="h-6 w-6 mr-2 text-indigo-500" />
          SLUMS Cognitive Assessment
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

        {/* Instructions Toggle */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Brain className="h-4 w-4" />
            {showInstructions ? 'Hide SLUMS Instructions' : 'Show SLUMS Instructions'}
          </button>
          
          {showInstructions && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <h3 className="text-md font-medium text-blue-900 mb-2">
                  Saint Louis University Mental Status (SLUMS) Examination
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInstructions(false)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 text-sm text-blue-800">
                <p>
                  <strong>Purpose:</strong> The SLUMS is a 30-point screening tool designed to detect mild cognitive impairment and dementia.
                </p>
                <p>
                  <strong>Administration:</strong> This assessment should be administered by a trained healthcare professional. The questions should be asked in order, and the patient should not be allowed to look at the form.
                </p>
                <p>
                  <strong>Scoring:</strong> The maximum score is 30 points. Interpretation depends on the patient's education level:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>High School Education:</strong>
                    <ul className="pl-5">
                      <li>27-30: Normal cognition</li>
                      <li>21-26: Mild cognitive impairment</li>
                      <li>1-20: Dementia</li>
                    </ul>
                  </li>
                  <li><strong>Less than High School Education:</strong>
                    <ul className="pl-5">
                      <li>25-30: Normal cognition</li>
                      <li>20-24: Mild cognitive impairment</li>
                      <li>1-19: Dementia</li>
                    </ul>
                  </li>
                </ul>
                <p>
                  <strong>Important Note:</strong> This assessment form is for documentation purposes. The actual SLUMS examination requires specific materials and proper administration by a healthcare professional.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Education Level */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Education Level</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Education Level *
              </label>
              <select
                value={data.cognitive_education_level as string || ''}
                onChange={(e) => onUpdateField('cognitive_education_level', e.target.value)}
                disabled={isReadOnly}
                className={`w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select education level</option>
                {educationLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Required for proper scoring interpretation
              </p>
            </div>
          </div>
        </div>

        {/* SLUMS Questions */}
        <div className="mb-8 space-y-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SLUMS Assessment Questions</h3>
          
          {/* Question 1: Day */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              1. What day of the week is it? (1 point)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient's Answer
                </label>
                <input
                  type="text"
                  value={data.slums_q1_day_answer as string || ''}
                  onChange={(e) => onUpdateField('slums_q1_day_answer', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter patient's answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score
                </label>
                <select
                  value={data.slums_q1_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q1_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0 - Incorrect</option>
                  <option value={1}>1 - Correct</option>
                </select>
              </div>
            </div>
          </div>

          {/* Question 2: Year */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              2. What is the year? (1 point)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient's Answer
                </label>
                <input
                  type="text"
                  value={data.slums_q2_year_answer as string || ''}
                  onChange={(e) => onUpdateField('slums_q2_year_answer', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter patient's answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score
                </label>
                <select
                  value={data.slums_q2_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q2_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0 - Incorrect</option>
                  <option value={1}>1 - Correct</option>
                </select>
              </div>
            </div>
          </div>

          {/* Question 3: State */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              3. What state are we in? (1 point)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient's Answer
                </label>
                <input
                  type="text"
                  value={data.slums_q3_state_answer as string || ''}
                  onChange={(e) => onUpdateField('slums_q3_state_answer', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter patient's answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score
                </label>
                <select
                  value={data.slums_q3_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q3_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0 - Incorrect</option>
                  <option value={1}>1 - Correct</option>
                </select>
              </div>
            </div>
          </div>

          {/* Question 4: Memory Task (No scoring) */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h4 className="text-md font-medium text-blue-900 mb-3">
              4. Memory Task: Remember these 5 objects (No points)
            </h4>
            <p className="text-sm text-blue-800 mb-4">
              Tell the patient: "I will give you a series of 5 objects to remember. Please repeat them after me: Apple, Pen, Tie, House, Car."
            </p>
            <p className="text-xs text-blue-700 italic">
              Note: This is a registration task only. No points are awarded. The patient will be asked to recall these objects in Question 7.
            </p>
          </div>

          {/* Question 5: Math */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              5. Math Questions (3 points total)
            </h4>
            
            {/* Q5a: Spent */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <p className="text-sm text-gray-700 mb-3">
                5a. "You have $100 and you go to the store and buy a dozen apples for $3 and a tricycle for $20. How much did you spend?" (1 point)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient's Answer
                  </label>
                  <input
                    type="text"
                    value={data.slums_q5_spent_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q5_spent_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter patient's answer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score
                  </label>
                  <select
                    value={data.slums_q5_spent_score as number || 0}
                    onChange={(e) => onUpdateField('slums_q5_spent_score', parseInt(e.target.value))}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value={0}>0 - Incorrect</option>
                    <option value={1}>1 - Correct ($23)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Q5b: Left */}
            <div>
              <p className="text-sm text-gray-700 mb-3">
                5b. "How much do you have left?" (2 points)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient's Answer
                  </label>
                  <input
                    type="text"
                    value={data.slums_q5_left_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q5_left_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter patient's answer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score
                  </label>
                  <select
                    value={data.slums_q5_left_score as number || 0}
                    onChange={(e) => onUpdateField('slums_q5_left_score', parseInt(e.target.value))}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value={0}>0 - Incorrect</option>
                    <option value={2}>2 - Correct ($77)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Question 6: Animals */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              6. Animal Naming (3 points)
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              "Name as many animals as you can in 1 minute."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Animals
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={data.slums_q6_animals_count as number || 0}
                  onChange={(e) => onUpdateField('slums_q6_animals_count', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score
                </label>
                <select
                  value={data.slums_q6_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q6_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0 - 0-4 animals</option>
                  <option value={1}>1 - 5-9 animals</option>
                  <option value={2}>2 - 10-14 animals</option>
                  <option value={3}>3 - 15+ animals</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Animals Named (Optional)
              </label>
              <textarea
                value={data.slums_q6_animals_list as string || ''}
                onChange={(e) => onUpdateField('slums_q6_animals_list', e.target.value)}
                disabled={isReadOnly}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="List animals named by patient (optional)"
              />
            </div>
          </div>

          {/* Question 7: Recall */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              7. Recall the 5 objects from Question 4 (5 points)
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              "Earlier I asked you to remember 5 objects. Please tell me what they were."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Objects Recalled
                </label>
                <select
                  value={data.slums_q7_objects_recalled as number || 0}
                  onChange={(e) => onUpdateField('slums_q7_objects_recalled', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0 objects</option>
                  <option value={1}>1 object</option>
                  <option value={2}>2 objects</option>
                  <option value={3}>3 objects</option>
                  <option value={4}>4 objects</option>
                  <option value={5}>5 objects</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score
                </label>
                <select
                  value={data.slums_q7_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q7_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0 - 0 objects</option>
                  <option value={1}>1 - 1 object</option>
                  <option value={2}>2 - 2 objects</option>
                  <option value={3}>3 - 3 objects</option>
                  <option value={4}>4 - 4 objects</option>
                  <option value={5}>5 - 5 objects</option>
                </select>
              </div>
            </div>
          </div>

          {/* Question 8: Numbers */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              8. Digit Span (3 points total)
            </h4>
            
            {/* Q8a: 87 */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <p className="text-sm text-gray-700 mb-3">
                8a. "I am going to give you a series of numbers and I would like you to give them to me backwards. For example, if I say 42, you would say 24."
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    "87" - Patient's Answer
                  </label>
                  <input
                    type="text"
                    value={data.slums_q8_87_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q8_87_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter patient's answer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is a practice item, no points awarded
                  </p>
                </div>
              </div>
            </div>
            
            {/* Q8b: 649 */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              <p className="text-sm text-gray-700 mb-3">
                8b. "649" (1 point)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient's Answer
                  </label>
                  <input
                    type="text"
                    value={data.slums_q8_649_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q8_649_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter patient's answer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct? (1 point)
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={data.slums_q8_649_correct === true}
                        onChange={() => onUpdateField('slums_q8_649_correct', true)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes (946)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={data.slums_q8_649_correct === false}
                        onChange={() => onUpdateField('slums_q8_649_correct', false)}
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
            </div>
            
            {/* Q8c: 8537 */}
            <div>
              <p className="text-sm text-gray-700 mb-3">
                8c. "8537" (2 points)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient's Answer
                  </label>
                  <input
                    type="text"
                    value={data.slums_q8_8537_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q8_8537_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter patient's answer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct? (2 points)
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={data.slums_q8_8537_correct === true}
                        onChange={() => onUpdateField('slums_q8_8537_correct', true)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes (7358)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={data.slums_q8_8537_correct === false}
                        onChange={() => onUpdateField('slums_q8_8537_correct', false)}
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
            </div>
            
            {/* Q8 Total Score */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question 8 Total Score
              </label>
              <select
                value={data.slums_q8_score as number || 0}
                onChange={(e) => onUpdateField('slums_q8_score', parseInt(e.target.value))}
                disabled={isReadOnly}
                className={`w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value={0}>0 - Both incorrect</option>
                <option value={1}>1 - Only 649 correct</option>
                <option value={3}>3 - Both correct</option>
              </select>
            </div>
          </div>

          {/* Question 9: Clock Drawing */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              9. Clock Drawing (4 points)
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              "This circle represents a clock face. Please put in the hours like a clock and then set the time to 11:10."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clock Drawing Score
                </label>
                <select
                  value={data.slums_q9_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q9_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0 - Not representative of a clock</option>
                  <option value={1}>1 - Hour hand only pointing to 11</option>
                  <option value={2}>2 - Hour pointing to 11, minute not to 10</option>
                  <option value={3}>3 - Hour pointing to 11, minute pointing to 2</option>
                  <option value={4}>4 - Hour pointing to 11, minute pointing to 10</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={data.slums_q9_clock_drawing as string || ''}
                  onChange={(e) => onUpdateField('slums_q9_clock_drawing', e.target.value)}
                  disabled={isReadOnly}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Notes about clock drawing (optional)"
                />
              </div>
            </div>
          </div>

          {/* Question 10: Triangle */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              10. Visual-Spatial Task (2 points total)
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              "I am going to show you a triangle and a square. You need to place an X in the triangle."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  X in Triangle? (1 point)
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={data.slums_q10_x_correct === true}
                      onChange={() => onUpdateField('slums_q10_x_correct', true)}
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
                      checked={data.slums_q10_x_correct === false}
                      onChange={() => onUpdateField('slums_q10_x_correct', false)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Which is larger? (1 point)
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={data.slums_q10_largest_correct === true}
                      onChange={() => onUpdateField('slums_q10_largest_correct', true)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Correct</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={data.slums_q10_largest_correct === false}
                      onChange={() => onUpdateField('slums_q10_largest_correct', false)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Incorrect</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={data.slums_q10_triangle_drawing as string || ''}
                onChange={(e) => onUpdateField('slums_q10_triangle_drawing', e.target.value)}
                disabled={isReadOnly}
                rows={2}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Notes about visual-spatial task (optional)"
              />
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question 10 Total Score
              </label>
              <select
                value={data.slums_q10_score as number || 0}
                onChange={(e) => onUpdateField('slums_q10_score', parseInt(e.target.value))}
                disabled={isReadOnly}
                className={`w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value={0}>0 - Both incorrect</option>
                <option value={1}>1 - One correct</option>
                <option value={2}>2 - Both correct</option>
              </select>
            </div>
          </div>

          {/* Question 11: Story Recall */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              11. Story Recall (8 points total)
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              "I am going to read you a short story. Please listen carefully because afterwards, I'm going to ask you some questions about it."
            </p>
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-blue-800 italic">
                "Jill was a very successful stockbroker. She made a lot of money on the stock market. She then met Jack, a devastatingly handsome man. She married him and had three children. They lived in Chicago. She then stopped work and stayed at home to bring up her children. When they were teenagers, she went back to work. She and Jack lived happily ever after."
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Q11a: Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    "What was the woman's name?" (2 points)
                  </label>
                  <input
                    type="text"
                    value={data.slums_q11_name_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q11_name_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter patient's answer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score
                  </label>
                  <select
                    value={data.slums_q11_name_score as number || 0}
                    onChange={(e) => onUpdateField('slums_q11_name_score', parseInt(e.target.value))}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value={0}>0 - Incorrect</option>
                    <option value={2}>2 - Correct (Jill)</option>
                  </select>
                </div>
              </div>
              
              {/* Q11b: Work */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    "What work did she do?" (2 points)
                  </label>
                  <input
                    type="text"
                    value={data.slums_q11_work_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q11_work_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter patient's answer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score
                  </label>
                  <select
                    value={data.slums_q11_work_score as number || 0}
                    onChange={(e) => onUpdateField('slums_q11_work_score', parseInt(e.target.value))}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value={0}>0 - Incorrect</option>
                    <option value={2}>2 - Correct (stockbroker)</option>
                  </select>
                </div>
              </div>
              
              {/* Q11c: When */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    "When did she go back to work?" (2 points)
                  </label>
                  <input
                    type="text"
                    value={data.slums_q11_when_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q11_when_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter patient's answer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score
                  </label>
                  <select
                    value={data.slums_q11_when_score as number || 0}
                    onChange={(e) => onUpdateField('slums_q11_when_score', parseInt(e.target.value))}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value={0}>0 - Incorrect</option>
                    <option value={2}>2 - Correct (when children were teenagers)</option>
                  </select>
                </div>
              </div>
              
              {/* Q11d: State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    "What state did she live in?" (2 points)
                  </label>
                  <input
                    type="text"
                    value={data.slums_q11_state_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q11_state_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter patient's answer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score
                  </label>
                  <select
                    value={data.slums_q11_state_score as number || 0}
                    onChange={(e) => onUpdateField('slums_q11_state_score', parseInt(e.target.value))}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value={0}>0 - Incorrect</option>
                    <option value={2}>2 - Correct (Chicago/Illinois)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLUMS Total Score */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SLUMS Total Score</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalScore}</div>
                <div className="text-sm text-gray-600">Total Score (out of 30)</div>
              </div>
              <div className="text-center">
                <div className={`text-xl font-semibold ${getInterpretationColor(interpretation)}`}>
                  {interpretation}
                </div>
                <div className="text-sm text-gray-600">Interpretation</div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-blue-200">
              <h4 className="text-md font-medium text-blue-900 mb-2">Scoring Interpretation:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-800">High School Education:</p>
                  <ul className="text-blue-700 space-y-1 pl-5">
                    <li>• 27-30: Normal Cognition</li>
                    <li>• 21-26: Mild Cognitive Impairment</li>
                    <li>• 1-20: Dementia</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-blue-800">Less than High School Education:</p>
                  <ul className="text-blue-700 space-y-1 pl-5">
                    <li>• 25-30: Normal Cognition</li>
                    <li>• 20-24: Mild Cognitive Impairment</li>
                    <li>• 1-19: Dementia</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label htmlFor="cognitive_notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional SLUMS Assessment Notes
          </label>
          <textarea
            id="cognitive_notes"
            value={data.cognitive_notes as string || ''}
            onChange={(e) => onUpdateField('cognitive_notes', e.target.value)}
            disabled={isReadOnly}
            rows={4}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
            placeholder="Additional observations, recommendations, or notes about the SLUMS assessment..."
          />
        </div>
      </div>
    </div>
  )
}