import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Brain, AlertCircle, Play, Pause, RotateCcw, Check } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface SlumsAssessmentSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

// Timer Component for Question 6
const AnimalTimer = ({ isReadOnly }: { isReadOnly: boolean }) => {
  const [timeLeft, setTimeLeft] = useState(60)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Create audio context for notification sound
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      
      // Store for later use
      audioRef.current = { play: () => {
        const osc = audioContext.createOscillator()
        const gain = audioContext.createGain()
        osc.connect(gain)
        gain.connect(audioContext.destination)
        osc.frequency.setValueAtTime(800, audioContext.currentTime)
        gain.gain.setValueAtTime(0.1, audioContext.currentTime)
        osc.start()
        osc.stop(audioContext.currentTime + 0.2)
      }} as any
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0 && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsFinished(true)
            // Play notification sound
            if (audioRef.current?.play) {
              audioRef.current.play()
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, isFinished])

  const handleStart = () => {
    if (!isFinished && timeLeft > 0) {
      setIsRunning(true)
    }
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsFinished(false)
    setTimeLeft(60)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (isReadOnly) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`text-2xl font-mono font-bold ${
            timeLeft <= 10 ? 'text-red-600' : 'text-blue-600'
          }`}>
            {formatTime(timeLeft)}
          </div>
          {isFinished && (
            <div className="flex items-center text-green-600 font-medium">
              <Check className="h-4 w-4 mr-1" />
              Time Complete
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStart}
            disabled={isRunning || isFinished || timeLeft === 0}
            className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Play className="h-4 w-4 mr-1" />
            Start
          </button>
          
          <button
            onClick={handlePause}
            disabled={!isRunning}
            className="flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Pause className="h-4 w-4 mr-1" />
            Pause
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </button>
        </div>
      </div>
      
      <p className="text-xs text-blue-600 mt-2">
        Timer will automatically stop at 60 seconds with audio notification
      </p>
    </div>
  )
}

// Drawing Canvas Component
const DrawingCanvas = ({ 
  width = 300, 
  height = 300, 
  value, 
  onChange, 
  isReadOnly,
  shape = 'circle',
  className = ''
}: {
  width?: number
  height?: number
  value?: string
  onChange?: (value: string) => void
  isReadOnly: boolean
  shape?: 'circle' | 'triangle'
  className?: string
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setContext(ctx)
    
    // Set canvas size
    canvas.width = width
    canvas.height = height
    
    // Draw background and shape outline
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, width, height)
    
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    
    if (shape === 'circle') {
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, Math.min(width, height) / 2 - 10, 0, 2 * Math.PI)
      ctx.stroke()
    } else if (shape === 'triangle') {
      ctx.beginPath()
      ctx.moveTo(width / 2, 20)
      ctx.lineTo(20, height - 20)
      ctx.lineTo(width - 20, height - 20)
      ctx.closePath()
      ctx.stroke()
    }
    
    // Load existing drawing if available
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
      img.src = value
    }
  }, [width, height, shape, value])

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isReadOnly || !context) return
    
    setIsDrawing(true)
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    context.beginPath()
    context.moveTo(x, y)
    context.strokeStyle = 'black'
    context.lineWidth = 2
    context.lineCap = 'round'
  }, [isReadOnly, context])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || isReadOnly || !context) return
    
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    context.lineTo(x, y)
    context.stroke()
  }, [isDrawing, isReadOnly, context])

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    
    // Save drawing as base64
    if (canvasRef.current && onChange) {
      const dataURL = canvasRef.current.toDataURL()
      onChange(dataURL)
    }
  }, [isDrawing, onChange])

  const clearCanvas = () => {
    if (isReadOnly || !context) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    // Clear and redraw background/outline
    context.fillStyle = 'white'
    context.fillRect(0, 0, width, height)
    
    context.strokeStyle = 'black'
    context.lineWidth = 2
    
    if (shape === 'circle') {
      context.beginPath()
      context.arc(width / 2, height / 2, Math.min(width, height) / 2 - 10, 0, 2 * Math.PI)
      context.stroke()
    } else if (shape === 'triangle') {
      context.beginPath()
      context.moveTo(width / 2, 20)
      context.lineTo(20, height - 20)
      context.lineTo(width - 20, height - 20)
      context.closePath()
      context.stroke()
    }
    
    if (onChange) {
      onChange('')
    }
  }

  return (
    <div className={`border border-gray-300 rounded-lg p-4 bg-white ${className}`}>
      <canvas
        ref={canvasRef}
        className="border border-gray-400 cursor-crosshair touch-none"
        style={{ touchAction: 'none' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      {!isReadOnly && (
        <button
          onClick={clearCanvas}
          className="mt-2 px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  )
}

export default function SlumsAssessmentSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: SlumsAssessmentSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'

  // Calculate total score
  const calculateTotalScore = () => {
    const scores = [
      data.slums_q1_score,
      data.slums_q2_score,
      data.slums_q3_score,
      data.slums_q5_spent_score,
      data.slums_q5_left_score,
      data.slums_q6_score,
      data.slums_q7_score,
      data.slums_q8_649_score,
      data.slums_q8_8537_score,
      data.slums_q9_score,
      data.slums_q10_x_score,
      data.slums_q10_largest_score,
      data.slums_q11_name_score,
      data.slums_q11_work_score,
      data.slums_q11_when_score,
      data.slums_q11_state_score
    ]
    
    return scores.reduce((total, score) => total + (Number(score) || 0), 0)
  }

  const getInterpretation = (score: number, educationLevel: string) => {
    if (educationLevel === 'High School Graduate') {
      if (score >= 27) return 'Normal'
      if (score >= 21) return 'Mild Neurocognitive Disorder'
      return 'Dementia'
    } else {
      if (score >= 25) return 'Normal'
      if (score >= 20) return 'Mild Neurocognitive Disorder'
      return 'Dementia'
    }
  }

  const totalScore = calculateTotalScore()
  const interpretation = getInterpretation(totalScore, data.cognitive_education_level as string || '')

  // Handle word recall checkboxes
  const handleRecallChange = (word: string, checked: boolean) => {
    const currentRecalled = (data.slums_q7_objects_recalled as string[]) || []
    const newRecalled = checked
      ? [...currentRecalled, word]
      : currentRecalled.filter(w => w !== word)
    
    onUpdateField('slums_q7_objects_recalled', newRecalled)
    onUpdateField('slums_q7_score', newRecalled.length)
  }

  const recallWords = ['Apple', 'Pen', 'Tie', 'House', 'Car']
  const recalledWords = (data.slums_q7_objects_recalled as string[]) || []

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Brain className="h-6 w-6 mr-2 text-indigo-500" />
          SLUMS Assessment
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
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client's Education Level
          </label>
          <select
            value={data.cognitive_education_level as string || ''}
            onChange={(e) => onUpdateField('cognitive_education_level', e.target.value)}
            disabled={isReadOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          >
            <option value="">Select education level</option>
            <option value="High School Graduate">High School Graduate</option>
            <option value="Less than High School">Less than High School</option>
          </select>
        </div>

        {/* Question 1: Day of Week */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">1. What day of the week is it? (1 point)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client's Answer</label>
              <select
                value={data.slums_q1_day_answer as string || ''}
                onChange={(e) => {
                  onUpdateField('slums_q1_day_answer', e.target.value)
                  const isCorrect = e.target.value === new Date().toLocaleDateString('en-US', { weekday: 'long' })
                  onUpdateField('slums_q1_score', isCorrect ? 1 : 0)
                }}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select day</option>
                <option value="Sunday">Sunday</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Other">Other</option>
              </select>
              
              {data.slums_q1_day_answer === 'Other' && (
                <input
                  type="text"
                  placeholder="Please specify"
                  value={data.slums_q1_day_other as string || ''}
                  onChange={(e) => onUpdateField('slums_q1_day_other', e.target.value)}
                  disabled={isReadOnly}
                  className={`mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              <select
                value={data.slums_q1_score as number || 0}
                onChange={(e) => onUpdateField('slums_q1_score', parseInt(e.target.value))}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question 2: Year */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">2. What is the year? (1 point)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client's Answer</label>
              <input
                type="text"
                value={data.slums_q2_year_answer as string || ''}
                onChange={(e) => {
                  onUpdateField('slums_q2_year_answer', e.target.value)
                  const currentYear = new Date().getFullYear().toString()
                  const isCorrect = e.target.value === currentYear
                  onUpdateField('slums_q2_score', isCorrect ? 1 : 0)
                }}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter year"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              <select
                value={data.slums_q2_score as number || 0}
                onChange={(e) => onUpdateField('slums_q2_score', parseInt(e.target.value))}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question 3: State */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">3. What state are we in? (1 point)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client's Answer</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              <select
                value={data.slums_q3_score as number || 0}
                onChange={(e) => onUpdateField('slums_q3_score', parseInt(e.target.value))}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
            </div>
          </div>
        </div>

        {/* Question 4: Registration */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">4. Please remember these five objects. I will ask you what they are later.</h3>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-lg font-medium text-center">Apple, Pen, Tie, House, Car</p>
            <p className="text-sm text-gray-600 mt-2 text-center">Read objects clearly. No scoring for this question.</p>
          </div>
        </div>

        {/* Question 5: Math */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">5. You had $100 and you spent $23. How much do you have left?</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How much did you spend? <span className="text-blue-600 font-semibold">($23)</span> (1 point)
                </label>
                <input
                  type="text"
                  value={data.slums_q5_spent_answer as string || ''}
                  onChange={(e) => {
                    onUpdateField('slums_q5_spent_answer', e.target.value)
                    const isCorrect = e.target.value.includes('23')
                    onUpdateField('slums_q5_spent_score', isCorrect ? 1 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Client's answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <select
                  value={data.slums_q5_spent_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q5_spent_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How much do you have left? <span className="text-blue-600 font-semibold">($77)</span> (2 points)
                </label>
                <input
                  type="text"
                  value={data.slums_q5_left_answer as string || ''}
                  onChange={(e) => {
                    onUpdateField('slums_q5_left_answer', e.target.value)
                    const isCorrect = e.target.value.includes('77')
                    onUpdateField('slums_q5_left_score', isCorrect ? 2 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Client's answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <select
                  value={data.slums_q5_left_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q5_left_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Question 6: Animals with Timer */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">6. You have 1 minute. Tell me as many animals as you can. (3 points)</h3>
          
          <AnimalTimer isReadOnly={isReadOnly} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Animals</label>
              <input
                type="number"
                min="0"
                value={data.slums_q6_animals_count as number || 0}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 0
                  onUpdateField('slums_q6_animals_count', count)
                  // Score: 0-4 animals = 0 points, 5-9 = 1 point, 10-14 = 2 points, 15+ = 3 points
                  let score = 0
                  if (count >= 15) score = 3
                  else if (count >= 10) score = 2
                  else if (count >= 5) score = 1
                  onUpdateField('slums_q6_score', score)
                }}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              <select
                value={data.slums_q6_score as number || 0}
                onChange={(e) => onUpdateField('slums_q6_score', parseInt(e.target.value))}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            <p>Scoring: 0-4 animals = 0 points, 5-9 = 1 point, 10-14 = 2 points, 15+ = 3 points</p>
          </div>
        </div>

        {/* Question 7: Word Recall */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">7. What were those five objects I asked you to remember? (5 points)</h3>
          
          <div className="space-y-3">
            {recallWords.map((word) => (
              <label key={word} className="flex items-center">
                <input
                  type="checkbox"
                  checked={recalledWords.includes(word)}
                  onChange={(e) => handleRecallChange(word, e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-2 text-sm text-gray-700">{word}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">
              Objects Recalled: {recalledWords.length} / 5 (Score: {recalledWords.length} points)
            </p>
          </div>
        </div>

        {/* Question 8: Numbers Backward */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">8. I am going to give you a series of numbers and I want you to give them to me backwards.</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">87 (Practice - 0 points)</p>
              <input
                type="text"
                value={data.slums_q8_87_answer as string || ''}
                onChange={(e) => onUpdateField('slums_q8_87_answer', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Client's answer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">649 (1 point)</p>
                <input
                  type="text"
                  value={data.slums_q8_649_answer as string || ''}
                  onChange={(e) => {
                    onUpdateField('slums_q8_649_answer', e.target.value)
                    const isCorrect = e.target.value.trim() === '946'
                    onUpdateField('slums_q8_649_correct', isCorrect)
                    onUpdateField('slums_q8_649_score', isCorrect ? 1 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Client's answer"
                />
              </div>
              <div>
                <label className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={data.slums_q8_649_correct as boolean || false}
                    onChange={(e) => {
                      onUpdateField('slums_q8_649_correct', e.target.checked)
                      onUpdateField('slums_q8_649_score', e.target.checked ? 1 : 0)
                    }}
                    disabled={isReadOnly}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      isReadOnly ? 'cursor-not-allowed' : ''
                    }`}
                  />
                  <span className="ml-2 text-sm text-gray-700">Correct (946)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">8537 (2 points)</p>
                <input
                  type="text"
                  value={data.slums_q8_8537_answer as string || ''}
                  onChange={(e) => {
                    onUpdateField('slums_q8_8537_answer', e.target.value)
                    const isCorrect = e.target.value.trim() === '7358'
                    onUpdateField('slums_q8_8537_correct', isCorrect)
                    onUpdateField('slums_q8_8537_score', isCorrect ? 2 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Client's answer"
                />
              </div>
              <div>
                <label className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    checked={data.slums_q8_8537_correct as boolean || false}
                    onChange={(e) => {
                      onUpdateField('slums_q8_8537_correct', e.target.checked)
                      onUpdateField('slums_q8_8537_score', e.target.checked ? 2 : 0)
                    }}
                    disabled={isReadOnly}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      isReadOnly ? 'cursor-not-allowed' : ''
                    }`}
                  />
                  <span className="ml-2 text-sm text-gray-700">Correct (7358)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Question 9: Clock Drawing */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">9. This is a clock face. Please put in the hour markers and the time at ten minutes to eleven o'clock. (4 points)</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <DrawingCanvas
                width={300}
                height={300}
                value={data.slums_q9_clock_drawing as string}
                onChange={(value) => onUpdateField('slums_q9_clock_drawing', value)}
                isReadOnly={isReadOnly}
                shape="circle"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score (0-4 points)</label>
                <select
                  value={data.slums_q9_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q9_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Scoring Criteria:</strong></p>
                <p>• Hour markers present (2 points)</p>
                <p>• Time correctly set to 10:50 (2 points)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Question 10A: Triangle Drawing */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">10 A. Please place an X in the triangle. (1 point)</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <DrawingCanvas
                width={300}
                height={300}
                value={data.slums_q10_triangle_drawing as string}
                onChange={(value) => onUpdateField('slums_q10_triangle_drawing', value)}
                isReadOnly={isReadOnly}
                shape="triangle"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.slums_q10_x_correct as boolean || false}
                  onChange={(e) => {
                    onUpdateField('slums_q10_x_correct', e.target.checked)
                    onUpdateField('slums_q10_x_score', e.target.checked ? 1 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-2 text-sm text-gray-700">X correctly placed in triangle (1 point)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Question 10B: Shape Recognition */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">10 B. Which number represents the largest shape? (1 point)</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex items-center justify-center space-x-8 p-6 bg-gray-50 rounded-lg">
              {/* Square - Largest (25% bigger) */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 border-2 border-black mx-auto mb-2"></div>
                <span className="text-lg font-bold">1</span>
              </div>
              
              {/* Triangle */}
              <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-2">
                  <div 
                    className="absolute inset-0 bg-green-500 border-2 border-black"
                    style={{
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                    }}
                  ></div>
                </div>
                <span className="text-lg font-bold">2</span>
              </div>
              
              {/* Rectangle */}
              <div className="text-center">
                <div className="w-12 h-8 bg-red-500 border-2 border-black mx-auto mb-2"></div>
                <span className="text-lg font-bold">3</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client's Answer</label>
                <input
                  type="text"
                  value={data.slums_q10_largest_answer as string || ''}
                  onChange={(e) => {
                    onUpdateField('slums_q10_largest_answer', e.target.value)
                    const isCorrect = e.target.value.trim() === '1'
                    onUpdateField('slums_q10_largest_correct', isCorrect)
                    onUpdateField('slums_q10_largest_score', isCorrect ? 1 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Enter number (1, 2, or 3)"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.slums_q10_largest_correct as boolean || false}
                  onChange={(e) => {
                    onUpdateField('slums_q10_largest_correct', e.target.checked)
                    onUpdateField('slums_q10_largest_score', e.target.checked ? 1 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-2 text-sm text-gray-700">Correct (Answer: 1)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Question 11: Story Recall */}
        <div className="mb-8 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">11. I am going to tell you a story. Please listen carefully because afterwards, I'm going to ask you some questions about it.</h3>
          
          <div className="bg-yellow-50 p-4 rounded-lg mb-4">
            <p className="text-sm font-medium">
              "Jill was a very successful stockbroker. She made a lot of money on the stock market. She then met Jack, a devastatingly handsome man. She married him and had three children. They lived in Chicago. She then stopped work and stayed home to bring up her children. When they were teenagers, she went back to work. She and Jack lived happily ever after."
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What was the female's name? <span className="text-blue-600 font-semibold">(Jill)</span> (2 points)</label>
                <input
                  type="text"
                  value={data.slums_q11_name_answer as string || ''}
                  onChange={(e) => {
                    onUpdateField('slums_q11_name_answer', e.target.value)
                    const isCorrect = e.target.value.toLowerCase().includes('jill')
                    onUpdateField('slums_q11_name_score', isCorrect ? 2 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Client's answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <select
                  value={data.slums_q11_name_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q11_name_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">When did she go back to work? <span className="text-blue-600 font-semibold">(When they were teenagers)</span> (2 points)</label>
                <input
                  type="text"
                  value={data.slums_q11_when_answer as string || ''}
                  onChange={(e) => {
                    onUpdateField('slums_q11_when_answer', e.target.value)
                    const answer = e.target.value.toLowerCase()
                    const isCorrect = answer.includes('teenager') || answer.includes('teens')
                    onUpdateField('slums_q11_when_score', isCorrect ? 2 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Client's answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <select
                  value={data.slums_q11_when_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q11_when_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What work did she do? <span className="text-blue-600 font-semibold">(Stockbroker)</span> (2 points)</label>
                <input
                  type="text"
                  value={data.slums_q11_work_answer as string || ''}
                  onChange={(e) => {
                    onUpdateField('slums_q11_work_answer', e.target.value)
                    const isCorrect = e.target.value.toLowerCase().includes('stockbroker') || e.target.value.toLowerCase().includes('stock broker')
                    onUpdateField('slums_q11_work_score', isCorrect ? 2 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Client's answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <select
                  value={data.slums_q11_work_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q11_work_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">What state did she live in? <span className="text-blue-600 font-semibold">(Chicago/Illinois)</span> (2 points)</label>
                <input
                  type="text"
                  value={data.slums_q11_state_answer as string || ''}
                  onChange={(e) => {
                    onUpdateField('slums_q11_state_answer', e.target.value)
                    const answer = e.target.value.toLowerCase()
                    const isCorrect = answer.includes('chicago') || answer.includes('illinois')
                    onUpdateField('slums_q11_state_score', isCorrect ? 2 : 0)
                  }}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Client's answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                <select
                  value={data.slums_q11_state_score as number || 0}
                  onChange={(e) => onUpdateField('slums_q11_state_score', parseInt(e.target.value))}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                >
                  <option value={0}>0</option>
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Total Score and Interpretation */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SLUMS Assessment Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalScore}</div>
              <div className="text-sm text-gray-600">Total Score (out of 30)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{interpretation}</div>
              <div className="text-sm text-gray-600">Interpretation</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Education Level</div>
              <div className="text-lg font-medium">{data.cognitive_education_level || 'Not specified'}</div>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Scoring Guidelines:</strong></p>
            <p>High School Graduate: Normal ≥27, MCI 21-26, Dementia ≤20</p>
            <p>Less than High School: Normal ≥25, MCI 20-24, Dementia ≤19</p>
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
            placeholder="Additional observations, client behavior, environmental factors, etc."
          />
        </div>
      </div>
    </div>
  )
}