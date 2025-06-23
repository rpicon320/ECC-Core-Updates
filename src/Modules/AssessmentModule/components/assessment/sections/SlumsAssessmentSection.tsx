import React, { useState } from 'react'
import { Brain, AlertCircle, CheckCircle, XCircle, Download, Upload, Trash2 } from 'lucide-react'
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
  
  // State for drawing canvas
  const [isDrawingClock, setIsDrawingClock] = useState(false)
  const [isDrawingTriangle, setIsDrawingTriangle] = useState(false)
  
  // Education level options
  const educationLevels = [
    'High School Graduate',
    'Less than High School'
  ]
  
  // Calculate total score
  const calculateTotalScore = () => {
    let total = 0
    
    // Add up all the individual question scores
    total += (data.slums_q1_score as number) || 0
    total += (data.slums_q2_score as number) || 0
    total += (data.slums_q3_score as number) || 0
    total += (data.slums_q5_spent_score as number) || 0
    total += (data.slums_q5_left_score as number) || 0
    total += (data.slums_q6_score as number) || 0
    total += (data.slums_q7_score as number) || 0
    
    // Q8 - Numbers backward
    if (data.slums_q8_649_correct) total += 1
    if (data.slums_q8_8537_correct) total += 2
    
    // Q9 - Clock drawing
    total += (data.slums_q9_score as number) || 0
    
    // Q10 - Triangle
    if (data.slums_q10_x_correct) total += 1
    if (data.slums_q10_largest_correct) total += 1
    
    // Q11 - Story recall
    total += (data.slums_q11_name_score as number) || 0
    total += (data.slums_q11_work_score as number) || 0
    total += (data.slums_q11_when_score as number) || 0
    total += (data.slums_q11_state_score as number) || 0
    
    return total
  }
  
  // Get interpretation based on score and education level
  const getInterpretation = (score: number) => {
    const educationLevel = data.cognitive_education_level as string
    
    if (educationLevel === 'High School Graduate') {
      if (score >= 27) return 'Normal'
      if (score >= 21 && score <= 26) return 'Mild Neurocognitive Disorder'
      return 'Dementia'
    } else {
      // Less than high school education
      if (score >= 25) return 'Normal'
      if (score >= 20 && score <= 24) return 'Mild Neurocognitive Disorder'
      return 'Dementia'
    }
  }
  
  const totalScore = calculateTotalScore()
  const interpretation = getInterpretation(totalScore)
  
  // Update total score and interpretation when component renders
  React.useEffect(() => {
    onUpdateField('cognitive_slums_total_score', totalScore)
    onUpdateField('cognitive_slums_interpretation', interpretation)
  }, [totalScore, interpretation])
  
  // Handle score changes for individual questions
  const handleScoreChange = (questionKey: string, score: number) => {
    onUpdateField(questionKey, score)
  }
  
  // Toggle correct/incorrect for yes/no questions
  const handleCorrectToggle = (questionKey: string, isCorrect: boolean) => {
    onUpdateField(questionKey, isCorrect)
  }
  
  // Handle file upload for drawings
  const handleDrawingUpload = (questionKey: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      onUpdateField(questionKey, base64)
    }
    reader.readAsDataURL(file)
  }
  
  // Remove drawing
  const handleRemoveDrawing = (questionKey: string) => {
    onUpdateField(questionKey, '')
  }
  
  // Handle recalled objects for Q7
  const handleRecalledObjectChange = (index: number, value: string) => {
    const currentObjects = [...((data.slums_q7_objects_recalled as string[]) || [])]
    currentObjects[index] = value
    onUpdateField('slums_q7_objects_recalled', currentObjects)
    
    // Calculate score based on number of correctly recalled objects
    const score = currentObjects.filter(obj => obj.trim()).length
    onUpdateField('slums_q7_score', score)
  }
  
  // Add recalled object input
  const addRecalledObject = () => {
    const currentObjects = [...((data.slums_q7_objects_recalled as string[]) || [])]
    if (currentObjects.length < 5) {
      onUpdateField('slums_q7_objects_recalled', [...currentObjects, ''])
    }
  }
  
  // Remove recalled object input
  const removeRecalledObject = (index: number) => {
    const currentObjects = [...((data.slums_q7_objects_recalled as string[]) || [])]
    const updatedObjects = currentObjects.filter((_, i) => i !== index)
    onUpdateField('slums_q7_objects_recalled', updatedObjects)
    
    // Update score
    const score = updatedObjects.filter(obj => obj.trim()).length
    onUpdateField('slums_q7_score', score)
  }
  
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Brain className="h-6 w-6 mr-2 text-indigo-500" />
          SLUMS Examination (Saint Louis University Mental Status)
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
        
        {/* Education Level */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Education Level</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select education level:
              </label>
              <div className="flex items-center space-x-6">
                {educationLevels.map((level) => (
                  <label key={level} className="flex items-center">
                    <input
                      type="radio"
                      name="cognitive_education_level"
                      value={level}
                      checked={data.cognitive_education_level === level}
                      onChange={() => onUpdateField('cognitive_education_level', level)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Question 1: Day */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">1. What day of the week is it?</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q1_day_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q1_day_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter day of week"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-1):
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q1_score', 0)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q1_score as number) === 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q1_score', 1)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q1_score as number) === 1
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct (1)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question 2: Year */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">2. What is the year?</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q2_year_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q2_year_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter year"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-1):
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q2_score', 0)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q2_score as number) === 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q2_score', 1)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q2_score as number) === 1
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct (1)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question 3: State */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">3. What state are we in?</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q3_state_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q3_state_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter state"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-1):
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q3_score', 0)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q3_score as number) === 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q3_score', 1)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q3_score as number) === 1
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct (1)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question 4: Memory Task (no scoring) */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">4. Memory Task</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-blue-50">
              <p className="text-blue-800 mb-4">
                <strong>Instructions:</strong> I am going to say five objects for you to remember. 
                Please repeat them after I have said all five.
              </p>
              <ul className="list-disc list-inside text-blue-700 mb-4">
                <li>Apple</li>
                <li>Pen</li>
                <li>Tie</li>
                <li>House</li>
                <li>Car</li>
              </ul>
              <p className="text-blue-800 italic">
                Note: You may repeat objects until patient can repeat all 5, but only count as one trial.
                Do not score this item - it is a registration task only.
              </p>
            </div>
          </div>
        </div>
        
        {/* Question 5: Math */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">5. Math Questions</h3>
          <div className="space-y-4">
            {/* Q5a: How much is $100 minus $7? */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                5a. How much is $100 minus $7?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q5_spent_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q5_spent_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter answer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-1):
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q5_spent_score', 0)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q5_spent_score as number) === 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q5_spent_score', 1)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q5_spent_score as number) === 1
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct (1)
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Q5b: And keep subtracting $7... */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                5b. And keep subtracting $7, how much is left now?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q5_left_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q5_left_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter answer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-2):
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q5_left_score', 0)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q5_left_score as number) === 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      0 correct
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q5_left_score', 1)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q5_left_score as number) === 1
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      1 correct (1)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q5_left_score', 2)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q5_left_score as number) === 2
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      2-4 correct (2)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question 6: Animal Naming */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">6. Animal Naming</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Name as many animals as you can in 1 minute.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of animals:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={data.slums_q6_animals_count as number || 0}
                    onChange={(e) => onUpdateField('slums_q6_animals_count', parseInt(e.target.value) || 0)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-3):
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q6_score', 0)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q6_score as number) === 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      0-4 (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q6_score', 1)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q6_score as number) === 1
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      5-9 (1)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q6_score', 2)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q6_score as number) === 2
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      10-14 (2)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q6_score', 3)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q6_score as number) === 3
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      15+ (3)
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Animals named (optional):
                </label>
                <textarea
                  value={data.slums_q6_animals_list as string || ''}
                  onChange={(e) => onUpdateField('slums_q6_animals_list', e.target.value)}
                  disabled={isReadOnly}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="List animals named (optional)"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Question 7: Memory Recall */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">7. Memory Recall</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                What were the five objects I asked you to remember earlier?
              </p>
              
              <div className="space-y-3">
                {/* Recalled objects inputs */}
                {((data.slums_q7_objects_recalled as string[]) || []).map((object, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={object}
                      onChange={(e) => handleRecalledObjectChange(index, e.target.value)}
                      disabled={isReadOnly}
                      className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder={`Recalled object ${index + 1}`}
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeRecalledObject(index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Add object button */}
                {!isReadOnly && ((data.slums_q7_objects_recalled as string[]) || []).length < 5 && (
                  <button
                    type="button"
                    onClick={addRecalledObject}
                    className="flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    + Add recalled object
                  </button>
                )}
                
                {/* Score display */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Score: {(data.slums_q7_score as number) || 0} / 5
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    1 point for each correctly recalled object (max 5)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question 8: Numbers Backward */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">8. Numbers Backward</h3>
          <div className="space-y-4">
            {/* 8a: 87 */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                8a. I am going to give you a series of numbers and I would like you to give them to me backwards. 
                For example, if I say 42, you would say 24.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    87 (Practice - not scored)
                  </label>
                  <input
                    type="text"
                    value={data.slums_q8_87_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q8_87_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter answer"
                  />
                </div>
              </div>
            </div>
            
            {/* 8b: 649 */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                8b. 649
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q8_649_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q8_649_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter answer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct? (1 point)
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleCorrectToggle('slums_q8_649_correct', false)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        data.slums_q8_649_correct === false
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCorrectToggle('slums_q8_649_correct', true)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        data.slums_q8_649_correct === true
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 8c: 8537 */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                8c. 8537
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q8_8537_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q8_8537_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter answer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct? (2 points)
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleCorrectToggle('slums_q8_8537_correct', false)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        data.slums_q8_8537_correct === false
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCorrectToggle('slums_q8_8537_correct', true)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        data.slums_q8_8537_correct === true
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question 9: Clock Drawing */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">9. Clock Drawing</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                This is a clock face. Please put in the hour markers and the time at 10 minutes to 11 o'clock.
              </p>
              
              {/* Clock Drawing Upload/Display */}
              <div className="mb-4">
                {data.slums_q9_clock_drawing ? (
                  <div className="relative inline-block">
                    <img 
                      src={data.slums_q9_clock_drawing as string}
                      alt="Clock drawing"
                      className="max-w-full h-auto border border-gray-300 rounded-lg"
                      style={{ maxHeight: '200px' }}
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDrawing('slums_q9_clock_drawing')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  !isReadOnly && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-4">Upload a photo of the clock drawing</p>
                      <div className="flex justify-center space-x-4">
                        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleDrawingUpload('slums_q9_clock_drawing', e.target.files[0])}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsDrawingClock(true)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Draw Now
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
              
              {/* Clock Drawing Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score (0-4):
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleScoreChange('slums_q9_score', 0)}
                    disabled={isReadOnly}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      (data.slums_q9_score as number) === 0
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  >
                    0 points
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreChange('slums_q9_score', 1)}
                    disabled={isReadOnly}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      (data.slums_q9_score as number) === 1
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  >
                    1 point
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreChange('slums_q9_score', 2)}
                    disabled={isReadOnly}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      (data.slums_q9_score as number) === 2
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  >
                    2 points
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreChange('slums_q9_score', 3)}
                    disabled={isReadOnly}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      (data.slums_q9_score as number) === 3
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  >
                    3 points
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScoreChange('slums_q9_score', 4)}
                    disabled={isReadOnly}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      (data.slums_q9_score as number) === 4
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  >
                    4 points
                  </button>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-600">
                <p><strong>Scoring guide:</strong></p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Hour markers only = 1 point</li>
                  <li>Time correct = 2 points</li>
                  <li>Hour markers and time correct = 4 points</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question 10: Visual-Spatial */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">10. Visual-Spatial Task</h3>
          <div className="space-y-4">
            {/* 10a: Place X in Triangle */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                10a. Place an X in the triangle.
              </p>
              
              {/* Triangle Drawing Upload/Display */}
              <div className="mb-4">
                {data.slums_q10_triangle_drawing ? (
                  <div className="relative inline-block">
                    <img 
                      src={data.slums_q10_triangle_drawing as string}
                      alt="Triangle drawing"
                      className="max-w-full h-auto border border-gray-300 rounded-lg"
                      style={{ maxHeight: '200px' }}
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDrawing('slums_q10_triangle_drawing')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  !isReadOnly && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-4">Upload a photo of the triangle drawing</p>
                      <div className="flex justify-center space-x-4">
                        <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleDrawingUpload('slums_q10_triangle_drawing', e.target.files[0])}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsDrawingTriangle(true)}
                          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Draw Now
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
              
              {/* X in Triangle Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  X in Triangle Correct? (1 point)
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => handleCorrectToggle('slums_q10_x_correct', false)}
                    disabled={isReadOnly}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      data.slums_q10_x_correct === false
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Incorrect
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCorrectToggle('slums_q10_x_correct', true)}
                    disabled={isReadOnly}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      data.slums_q10_x_correct === true
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Correct
                  </button>
                </div>
              </div>
            </div>
            
            {/* 10b: Which figure is largest? */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                10b. Which of these figures is largest?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q10_largest_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q10_largest_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter answer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct? (1 point)
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleCorrectToggle('slums_q10_largest_correct', false)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        data.slums_q10_largest_correct === false
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCorrectToggle('slums_q10_largest_correct', true)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        data.slums_q10_largest_correct === true
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question 11: Story Recall */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">11. Story Recall</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-blue-50 mb-4">
              <p className="text-blue-800 mb-4">
                <strong>Instructions:</strong> I am going to tell you a story. Please listen carefully because afterwards, 
                I'm going to ask you some questions about it.
              </p>
              <p className="text-blue-800 font-medium">
                Jill was a very successful stockbroker. She made a lot of money on the stock market. 
                She then met Jack, a devastatingly handsome man. She married him and had three children. 
                They lived in Chicago. She then stopped work and stayed at home to bring up her children. 
                When they were teenagers, she went back to work. She and Jack lived happily ever after.
              </p>
            </div>
            
            {/* 11a: What was the woman's name? */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                11a. What was the woman's name?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q11_name_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q11_name_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter answer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-2):
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q11_name_score', 0)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q11_name_score as number) === 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q11_name_score', 2)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q11_name_score as number) === 2
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct (2)
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 11b: What work did she do? */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                11b. What work did she do?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q11_work_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q11_work_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter answer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-2):
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q11_work_score', 0)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q11_work_score as number) === 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q11_work_score', 2)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q11_work_score as number) === 2
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct (2)
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 11c: When did she go back to work? */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                11c. When did she go back to work?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q11_when_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q11_when_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter answer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-2):
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q11_when_score', 0)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q11_when_score as number) === 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q11_when_score', 2)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q11_when_score as number) === 2
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct (2)
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 11d: What state did she live in? */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">
                11d. What state did she live in?
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer:
                  </label>
                  <input
                    type="text"
                    value={data.slums_q11_state_answer as string || ''}
                    onChange={(e) => onUpdateField('slums_q11_state_answer', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Enter answer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-2):
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q11_state_score', 0)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q11_state_score as number) === 0
                          ? 'bg-red-100 text-red-700 border border-red-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScoreChange('slums_q11_state_score', 2)}
                      disabled={isReadOnly}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        (data.slums_q11_state_score as number) === 2
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct (2)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Total Score and Interpretation */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SLUMS Total Score and Interpretation</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-800 mb-2">Total Score</p>
                  <div className="text-4xl font-bold text-blue-600">{totalScore} / 30</div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm font-medium text-blue-800 mb-2">Interpretation</p>
                  <div className={`text-xl font-semibold ${
                    interpretation === 'Normal' 
                      ? 'text-green-600' 
                      : interpretation === 'Mild Neurocognitive Disorder'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}>
                    {interpretation}
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Based on score and education level: {data.cognitive_education_level || 'Not specified'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-2">Interpretation Guide:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-blue-900">High School Education:</p>
                    <ul className="text-blue-700 space-y-1 mt-1">
                      <li>27-30: Normal</li>
                      <li>21-26: Mild Neurocognitive Disorder</li>
                      <li>1-20: Dementia</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">Less Than High School:</p>
                    <ul className="text-blue-700 space-y-1 mt-1">
                      <li>25-30: Normal</li>
                      <li>20-24: Mild Neurocognitive Disorder</li>
                      <li>1-19: Dementia</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Notes */}
        <div>
          <label htmlFor="cognitive_notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
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
            placeholder="Enter any additional observations or notes about the SLUMS assessment..."
          />
        </div>
      </div>
    </div>
  )
}