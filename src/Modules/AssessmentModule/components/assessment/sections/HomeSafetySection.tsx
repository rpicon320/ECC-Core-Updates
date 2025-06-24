import React, { useRef, useState } from 'react'
import { Home, AlertCircle, Camera, Upload, X, Flag, Mic, MicOff, Loader2 } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface HomeSafetySectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

export default function HomeSafetySection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: HomeSafetySectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false)
  const [isDrafting, setIsDrafting] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Check for speech recognition support on component mount
  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSpeechSupported(!!SpeechRecognition)
  }, [])

  const homeTypes = [
    'Single Family',
    'Apartment', 
    'Retirement/Senior Community',
    'Assisted Living Facility (ALF)',
    'Skilled Nursing Facility (SNF)'
  ]

  const floorPlanOptions = ['Single Level', 'Multiple Floors']

  const safetyItems = [
    { key: 'steps_handrails', label: 'Steps inside/outside? Are handrails present (both sides)?' },
    { key: 'driveway_accessible', label: 'Is the driveway easily accessible (flat/level/incline)?' },
    { key: 'adequate_parking', label: 'Adequate parking?' },
    { key: 'garage_automatic', label: 'Garage door automatic?' },
    { key: 'landscaping_clear', label: 'Landscaping clear of obstacles?' },
    { key: 'doorbell_audible', label: 'Doorbell audible throughout house?' },
    { key: 'basement_attic', label: 'Basement and/or attic?' },
    { key: 'handicapped_access', label: 'Handicapped access?' },
    { key: 'doorways_accessible', label: 'Walk easily through doorways?' },
    { key: 'doors_windows_operable', label: 'Operable doors/windows?' },
    { key: 'clutter_hoarding', label: 'Clutter or hoarding concerns?' },
    { key: 'trip_hazards', label: 'Trip hazards (cords, rugs, clutter)?' },
    { key: 'nonslip_flooring', label: 'Non-slip flooring?' },
    { key: 'entry_lighting', label: 'Entry well-lighted?' },
    { key: 'smoke_co2_detectors', label: 'Smoke and CO2 detectors working?' },
    { key: 'fire_extinguisher', label: 'Fire extinguisher present?' }
  ]

  const urgencyOptions = ['Non-Urgent', 'Urgent']

  // Handle home type selection (multiple checkboxes)
  const handleHomeTypeChange = (homeType: string, checked: boolean) => {
    const currentTypes = (data.home_types as string[]) || []
    const newTypes = checked
      ? [...currentTypes, homeType]
      : currentTypes.filter(type => type !== homeType)
    onUpdateField('home_types', newTypes)
  }

  // Handle photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const currentPhotos = (data.home_safety_photos as string[]) || []
    
    // Check if adding these photos would exceed the limit
    if (currentPhotos.length + files.length > 5) {
      alert('Maximum 5 photos allowed per assessment')
      return
    }

    // Convert files to base64
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const base64 = e.target?.result as string
          const updatedPhotos = [...(data.home_safety_photos as string[]) || [], base64]
          onUpdateField('home_safety_photos', updatedPhotos)
        }
        reader.readAsDataURL(file)
      }
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove photo
  const removePhoto = (index: number) => {
    const currentPhotos = (data.home_safety_photos as string[]) || []
    const updatedPhotos = currentPhotos.filter((_, i) => i !== index)
    onUpdateField('home_safety_photos', updatedPhotos)
  }

  // Get flagged safety items for summary
  const getFlaggedItems = () => {
    return safetyItems.filter(item => data[`${item.key}_safety_flag`])
  }

  // AI-powered text enhancement
  const enhanceTextWithAI = async (rawText: string): Promise<string> => {
    try {
      // Simulate AI processing - in production, this would call an actual AI service
      // For demo purposes, we'll enhance the text with professional formatting
      
      const enhancedText = await new Promise<string>((resolve) => {
        setTimeout(() => {
          // Basic text enhancement logic
          let enhanced = rawText.trim()
          
          // Capitalize first letter of sentences
          enhanced = enhanced.replace(/(^|\. )([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
          
          // Add professional structure if it's a basic description
          if (enhanced.length > 20 && !enhanced.includes('Assessment:')) {
            enhanced = `Home Safety Assessment Summary:\n\n${enhanced}\n\nRecommendations: Based on the assessment findings, further evaluation and potential safety modifications may be warranted to ensure optimal home safety for the client.`
          }
          
          // Ensure proper punctuation
          if (enhanced && !enhanced.endsWith('.') && !enhanced.endsWith('!') && !enhanced.endsWith('?')) {
            enhanced += '.'
          }
          
          resolve(enhanced)
        }, 2000) // Simulate AI processing time
      })
      
      return enhancedText
    } catch (error) {
      console.error('AI enhancement failed:', error)
      return rawText // Return original text if AI fails
    }
  }

  // Start speech recognition
  const startDictation = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    
    let finalTranscript = ''
    
    recognition.onstart = () => {
      setIsListening(true)
    }
    
    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }
    }
    
    recognition.onend = async () => {
      setIsListening(false)
      
      if (finalTranscript.trim()) {
        setIsDrafting(true)
        try {
          const enhancedText = await enhanceTextWithAI(finalTranscript.trim())
          onUpdateField('home_safety_summary', enhancedText)
        } catch (error) {
          // Fallback to original transcript if AI enhancement fails
          onUpdateField('home_safety_summary', finalTranscript.trim())
        } finally {
          setIsDrafting(false)
        }
      }
    }
    
    recognition.onerror = (event: any) => {
      setIsListening(false)
      console.error('Speech recognition error:', event.error)
      
      let errorMessage = 'Speech recognition failed. '
      switch (event.error) {
        case 'no-speech':
          errorMessage += 'No speech was detected. Please try again.'
          break
        case 'audio-capture':
          errorMessage += 'No microphone was found. Please check your microphone settings.'
          break
        case 'not-allowed':
          errorMessage += 'Microphone access was denied. Please allow microphone access and try again.'
          break
        default:
          errorMessage += 'Please try again.'
      }
      
      alert(errorMessage)
    }
    
    recognitionRef.current = recognition
    recognition.start()
  }

  // Stop speech recognition
  const stopDictation = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const flaggedItems = getFlaggedItems()

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Home className="h-6 w-6 mr-2 text-yellow-500" />
          Home Safety Assessment
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

        {/* 1. Home Type & Layout */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">1. Home Type & Layout</h3>
          
          {/* Type of Home */}
          <div className="mb-6">
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-3">Type of Home</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {homeTypes.map((homeType) => (
                  <label key={homeType} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={((data.home_types as string[]) || []).includes(homeType)}
                      onChange={(e) => handleHomeTypeChange(homeType, e.target.checked)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">{homeType}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Floor Plan */}
          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-3">Floor Plan</legend>
              <div className="flex items-center space-x-6">
                {floorPlanOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="floor_plan"
                      value={option}
                      checked={data.floor_plan === option}
                      onChange={(e) => onUpdateField('floor_plan', e.target.value)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* 2. Photo Upload for Safety Concerns */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">2. Photo Documentation</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Take or Upload Photos of Noted Safety Concerns
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Maximum 5 photos per assessment. Current: {((data.home_safety_photos as string[]) || []).length}/5
              </p>
              
              {!isReadOnly && (
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={((data.home_safety_photos as string[]) || []).length >= 5}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={isReadOnly}
              />
            </div>

            {/* Photo Thumbnails */}
            {((data.home_safety_photos as string[]) || []).length > 0 && (
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Uploaded Photos:</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {((data.home_safety_photos as string[]) || []).map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Safety concern ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      {!isReadOnly && (
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {((data.home_safety_photos as string[]) || []).length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-4">No photos provided.</p>
            )}
          </div>
        </div>

        {/* 3. Safety Features Checklist */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">3. Safety Features Checklist</h3>
          
          <div className="space-y-4">
            {safetyItems.map((item) => (
              <div 
                key={item.key} 
                className={`border rounded-lg p-4 ${
                  data[`${item.key}_safety_flag`] ? 'bg-red-50 border-red-200' : 'bg-gray-50'
                }`}
              >
                <div className="space-y-4">
                  {/* Question and Yes/No */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    </div>
                    
                    <div className="flex items-center space-x-6 flex-shrink-0">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={item.key}
                          checked={data[item.key] === true}
                          onChange={() => onUpdateField(item.key, true)}
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
                          name={item.key}
                          checked={data[item.key] === false}
                          onChange={() => onUpdateField(item.key, false)}
                          disabled={isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            isReadOnly ? 'cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="ml-2 text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Safety Concern Flag */}
                  <div className="flex items-center">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={data[`${item.key}_safety_flag`] as boolean || false}
                        onChange={(e) => onUpdateField(`${item.key}_safety_flag`, e.target.checked)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 border-red-500 text-red-600 focus:ring-red-500 rounded ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <Flag className="h-4 w-4 text-red-600" />
                      <span className="text-red-600 font-semibold text-sm">❌ Mark as Safety Concern</span>
                    </label>
                  </div>

                  {/* Urgency Level (if flagged) */}
                  {data[`${item.key}_safety_flag`] && (
                    <div className="ml-6 pt-2 border-t border-red-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Urgency Level:
                      </label>
                      <select
                        value={data[`${item.key}_urgency`] as string || 'Non-Urgent'}
                        onChange={(e) => onUpdateField(`${item.key}_urgency`, e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        {urgencyOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Comment Box */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comments:
                    </label>
                    <textarea
                      value={data[`${item.key}_comment`] as string || ''}
                      onChange={(e) => onUpdateField(`${item.key}_comment`, e.target.value)}
                      disabled={isReadOnly}
                      rows={2}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Additional details or observations..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Room-Specific Setup */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">4. Room-Specific Assessment</h3>
          
          <div className="space-y-6">
            {/* Kitchen */}
            <div className="border rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">Kitchen</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kitchen Description:
                  </label>
                  <textarea
                    value={data.kitchen_description as string || ''}
                    onChange={(e) => onUpdateField('kitchen_description', e.target.value)}
                    disabled={isReadOnly}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Describe kitchen layout, accessibility, and general condition..."
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Appliances functional?</span>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="appliances_functional"
                        checked={data.appliances_functional === true}
                        onChange={() => onUpdateField('appliances_functional', true)}
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
                        name="appliances_functional"
                        checked={data.appliances_functional === false}
                        onChange={() => onUpdateField('appliances_functional', false)}
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

            {/* Bathroom */}
            <div className="border rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">Bathroom</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathroom Setup:
                  </label>
                  <textarea
                    value={data.bathroom_setup as string || ''}
                    onChange={(e) => onUpdateField('bathroom_setup', e.target.value)}
                    disabled={isReadOnly}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Describe bathroom accessibility, safety features, and layout..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Commodes at correct height?</span>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="commodes_correct_height"
                          checked={data.commodes_correct_height === true}
                          onChange={() => onUpdateField('commodes_correct_height', true)}
                          disabled={isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            isReadOnly ? 'cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="ml-1 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="commodes_correct_height"
                          checked={data.commodes_correct_height === false}
                          onChange={() => onUpdateField('commodes_correct_height', false)}
                          disabled={isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            isReadOnly ? 'cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="ml-1 text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Grab bars present?</span>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="grab_bars_present"
                          checked={data.grab_bars_present === true}
                          onChange={() => onUpdateField('grab_bars_present', true)}
                          disabled={isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            isReadOnly ? 'cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="ml-1 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="grab_bars_present"
                          checked={data.grab_bars_present === false}
                          onChange={() => onUpdateField('grab_bars_present', false)}
                          disabled={isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            isReadOnly ? 'cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="ml-1 text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Shower or bath seat?</span>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="shower_bath_seat"
                          checked={data.shower_bath_seat === true}
                          onChange={() => onUpdateField('shower_bath_seat', true)}
                          disabled={isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            isReadOnly ? 'cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="ml-1 text-sm text-gray-700">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="shower_bath_seat"
                          checked={data.shower_bath_seat === false}
                          onChange={() => onUpdateField('shower_bath_seat', false)}
                          disabled={isReadOnly}
                          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                            isReadOnly ? 'cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="ml-1 text-sm text-gray-700">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bedroom */}
            <div className="border rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-900 mb-4">Bedroom Safety</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Is the bed too high or too low?</span>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bed_height_issue"
                        checked={data.bed_height_issue === true}
                        onChange={() => onUpdateField('bed_height_issue', true)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-1 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bed_height_issue"
                        checked={data.bed_height_issue === false}
                        onChange={() => onUpdateField('bed_height_issue', false)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-1 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Phone access at night?</span>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="phone_access_night"
                        checked={data.phone_access_night === true}
                        onChange={() => onUpdateField('phone_access_night', true)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-1 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="phone_access_night"
                        checked={data.phone_access_night === false}
                        onChange={() => onUpdateField('phone_access_night', false)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-1 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Adequate lighting?</span>
                  <div className="flex items-center space-x-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bedroom_adequate_lighting"
                        checked={data.bedroom_adequate_lighting === true}
                        onChange={() => onUpdateField('bedroom_adequate_lighting', true)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-1 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bedroom_adequate_lighting"
                        checked={data.bedroom_adequate_lighting === false}
                        onChange={() => onUpdateField('bedroom_adequate_lighting', false)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-1 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Safety Summary & Flags */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">5. Safety Summary & Assessment</h3>
          
          <div className="space-y-6">
            {/* Overall Safety Concerns Toggle */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.safety_concerns_identified as boolean || false}
                  onChange={(e) => onUpdateField('safety_concerns_identified', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  <strong>Safety Concerns Identified:</strong> Check if any safety issues were found during this assessment.
                </span>
              </label>
            </div>

            {/* Flagged Items Summary */}
            {flaggedItems.length > 0 && (
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <h4 className="text-md font-medium text-red-900 mb-3 flex items-center">
                  <Flag className="h-5 w-5 mr-2" />
                  Safety Concerns Flagged ({flaggedItems.length})
                </h4>
                <ul className="space-y-2">
                  {flaggedItems.map((item) => (
                    <li key={item.key} className="flex items-center text-sm">
                      <span className="text-red-600 mr-2">❌</span>
                      <span className="text-red-800">{item.label}</span>
                      {data[`${item.key}_urgency`] && (
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          data[`${item.key}_urgency`] === 'Urgent' 
                            ? 'bg-red-200 text-red-800' 
                            : 'bg-yellow-200 text-yellow-800'
                        }`}>
                          {data[`${item.key}_urgency`]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {flaggedItems.length === 0 && (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <p className="text-green-800 text-sm">
                  ✅ No safety concerns flagged at this time.
                </p>
              </div>
            )}

            {/* Home Safety Summary with Dictate Button */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Home Safety Summary
                </label>
                
                {/* Dictate Button */}
                {!isReadOnly && (
                  <div className="flex items-center space-x-2">
                    {speechSupported ? (
                      <>
                        {!isListening && !isDrafting && (
                          <button
                            type="button"
                            onClick={startDictation}
                            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                            title="Click to start dictating your case note"
                          >
                            <Mic className="h-4 w-4 mr-2" />
                            🎙️ Dictate & Draft Case Note
                          </button>
                        )}
                        
                        {isListening && (
                          <button
                            type="button"
                            onClick={stopDictation}
                            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm animate-pulse"
                          >
                            <MicOff className="h-4 w-4 mr-2" />
                            Stop Recording
                          </button>
                        )}
                        
                        {isDrafting && (
                          <div className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Drafting your note...
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-gray-500">
                        Speech recognition not supported in this browser
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Privacy Notice */}
              {!isReadOnly && speechSupported && (
                <p className="text-xs text-gray-500 mb-2">
                  <strong>Privacy Notice:</strong> Audio is processed locally and never stored. Only the final transcribed text is saved.
                </p>
              )}
              
              <textarea
                value={data.home_safety_summary as string || ''}
                onChange={(e) => onUpdateField('home_safety_summary', e.target.value)}
                disabled={isReadOnly || isDrafting}
                rows={6}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly || isDrafting ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Provide assessor's recommendations, impressions, and overall home safety evaluation. Include any immediate actions needed and long-term recommendations... (You can also use the Dictate button to speak your notes)"
              />
              
              {/* Dictation Status */}
              {isListening && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                  🎤 Listening... Speak clearly into your microphone. Click "Stop Recording" when finished.
                </div>
              )}
              
              {isDrafting && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                  ✨ AI is enhancing your dictated text into a professional case note...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assessment Status Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-2">Assessment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Photos Uploaded:</strong> {((data.home_safety_photos as string[]) || []).length}/5</p>
              <p><strong>Safety Items Assessed:</strong> {safetyItems.filter(item => data[item.key] !== undefined).length}/{safetyItems.length}</p>
              <p><strong>Safety Concerns Flagged:</strong> {flaggedItems.length}</p>
            </div>
            <div>
              <p><strong>Overall Safety Concerns:</strong> {data.safety_concerns_identified ? 'Yes' : 'No'}</p>
              <p><strong>Urgent Items:</strong> {flaggedItems.filter(item => data[`${item.key}_urgency`] === 'Urgent').length}</p>
              <p><strong>Summary Completed:</strong> {data.home_safety_summary ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}