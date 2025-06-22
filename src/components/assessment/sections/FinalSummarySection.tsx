import React, { useState, useRef, useEffect } from 'react'
import { FileText, AlertCircle, Plus, Trash2, Sparkles, Loader2, RotateCcw, User, Calendar } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'
import { Client } from '../../../lib/mockData'

interface FinalSummarySectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
  clients: Client[]
}

interface CareManager {
  id: string
  fullName: string
  roleTitle: string
  email: string
  phone: string
  signature: string
}

// Signature Pad Component
const SignaturePad = ({ 
  value, 
  onChange, 
  isReadOnly, 
  label 
}: {
  value: string
  onChange: (signature: string) => void
  isReadOnly: boolean
  label: string
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
    canvas.width = 400
    canvas.height = 150
    
    // Draw background
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Load existing signature if available
    if (value) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
      }
      img.src = value
    }
  }, [value])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    
    // Save signature as base64
    if (canvasRef.current && onChange) {
      const dataURL = canvasRef.current.toDataURL()
      onChange(dataURL)
    }
  }

  const clearSignature = () => {
    if (isReadOnly || !context) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    // Clear canvas
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    onChange('')
  }

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="border border-gray-400 rounded">
        <canvas
          ref={canvasRef}
          className="cursor-crosshair touch-none w-full"
          style={{ touchAction: 'none', maxWidth: '400px', height: '150px' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      {!isReadOnly && (
        <div className="mt-2 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Signature – Use stylus or finger if on tablet
          </p>
          <button
            type="button"
            onClick={clearSignature}
            className="flex items-center px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </button>
        </div>
      )}
    </div>
  )
}

export default function FinalSummarySection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode,
  clients
}: FinalSummarySectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  // Generate unique ID for new care managers
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // Get care managers list
  const getCareManagers = (): CareManager[] => {
    return (data.care_managers as CareManager[]) || []
  }

  // Add new care manager
  const addCareManager = () => {
    const currentManagers = getCareManagers()
    const newManager: CareManager = {
      id: generateId(),
      fullName: '',
      roleTitle: '',
      email: '',
      phone: '',
      signature: ''
    }
    onUpdateField('care_managers', [...currentManagers, newManager])
  }

  // Update care manager
  const updateCareManager = (index: number, field: keyof CareManager, value: string) => {
    const currentManagers = [...getCareManagers()]
    if (currentManagers[index]) {
      currentManagers[index] = { ...currentManagers[index], [field]: value }
      onUpdateField('care_managers', currentManagers)
    }
  }

  // Remove care manager
  const removeCareManager = (index: number) => {
    if (!confirm('Are you sure you want to remove this care manager?')) return
    
    const currentManagers = getCareManagers()
    const updatedManagers = currentManagers.filter((_, i) => i !== index)
    onUpdateField('care_managers', updatedManagers)
  }

  // Get client information for AI summary
  const getClientInfo = () => {
    const clientId = data.clientId || sectionData.data.clientId
    if (!clientId) return null
    
    return clients.find(c => c.id === clientId)
  }

  // AI Summary Generation
  const generateAISummary = async () => {
    setIsGeneratingSummary(true)
    
    try {
      // Collect all assessment data for comprehensive analysis
      const client = getClientInfo()
      if (!client) {
        throw new Error('Client information not found')
      }

      // Simulate comprehensive AI analysis
      const aiSummary = await generateComprehensiveAssessmentSummary(client, sectionData)
      
      // Update the summary field
      onUpdateField('visit_summary', aiSummary)
      
    } catch (error) {
      console.error('Failed to generate AI summary:', error)
      alert('Failed to generate summary. Please try again or write manually.')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  // Enhanced AI Summary Generation Logic
  const generateComprehensiveAssessmentSummary = async (client: Client, allSectionData: any): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let summary = ''
        
        // Client identification and assessment overview
        const clientName = client.preferred_name || client.first_name
        summary += `COMPREHENSIVE ASSESSMENT SUMMARY\n\n`
        summary += `Client: ${clientName} ${client.last_name}\n`
        summary += `Date of Birth: ${new Date(client.date_of_birth).toLocaleDateString()}\n`
        summary += `Assessment Date: ${data.assessment_completion_date || new Date().toLocaleDateString()}\n\n`
        
        // Assessment findings overview
        summary += `ASSESSMENT FINDINGS:\n\n`
        summary += `${clientName} participated in a comprehensive geriatric assessment conducted by ElderCare Connections. `
        summary += `The assessment encompassed multiple domains including medical history, functional status, cognitive evaluation, `
        summary += `psychosocial factors, home safety, and care coordination needs. `
        
        // Medical and functional status
        summary += `Medical review revealed [medical conditions and medications documented]. `
        summary += `Functional assessment indicated [ADL/IADL status and equipment needs]. `
        summary += `Cognitive evaluation showed [cognitive status and any concerns]. `
        
        // Psychosocial and support systems
        summary += `Psychosocial assessment identified [support systems and social connections]. `
        summary += `Home safety evaluation noted [safety concerns and recommendations]. `
        
        summary += `\n\nRECOMMendations FROM ELDERCARE CONNECTIONS:\n\n`
        
        // Care coordination recommendations
        summary += `Based on the comprehensive assessment findings, ElderCare Connections recommends the following interventions:\n\n`
        
        summary += `1. IMMEDIATE PRIORITIES:\n`
        summary += `• Coordinate with primary care provider for ongoing medical management\n`
        summary += `• Address any identified safety concerns in the home environment\n`
        summary += `• Ensure appropriate support services are in place\n\n`
        
        summary += `2. ONGOING CARE COORDINATION:\n`
        summary += `• Regular monitoring of functional status and safety\n`
        summary += `• Coordination between healthcare providers and family members\n`
        summary += `• Connection to community resources as appropriate\n\n`
        
        summary += `3. FAMILY AND CAREGIVER SUPPORT:\n`
        summary += `• Education regarding identified conditions and care needs\n`
        summary += `• Support for family members and caregivers\n`
        summary += `• Assistance with care planning and decision-making\n\n`
        
        // ElderCare Connections care plan
        summary += `HOW ELDERCARE CONNECTIONS PLANS TO HELP:\n\n`
        summary += `ElderCare Connections will provide ongoing care management services tailored to ${clientName}'s specific needs. `
        summary += `Our comprehensive approach includes:\n\n`
        
        summary += `• CARE COORDINATION: Serving as the central point of contact for all healthcare providers, `
        summary += `ensuring seamless communication and coordinated care delivery.\n\n`
        
        summary += `• ADVOCACY: Advocating for ${clientName}'s needs and preferences in all healthcare settings, `
        summary += `ensuring that care plans align with personal goals and values.\n\n`
        
        summary += `• MONITORING AND ASSESSMENT: Regular check-ins to monitor changes in condition, `
        summary += `functional status, and care needs, with prompt intervention when concerns arise.\n\n`
        
        summary += `• FAMILY SUPPORT: Providing education, resources, and emotional support to family members `
        summary += `and caregivers to enhance their ability to provide effective care.\n\n`
        
        summary += `• RESOURCE CONNECTION: Identifying and connecting ${clientName} and family to appropriate `
        summary += `community resources, services, and support programs.\n\n`
        
        summary += `• CRISIS INTERVENTION: Available for urgent situations and care transitions, `
        summary += `providing immediate support and coordination during challenging times.\n\n`
        
        // Follow-up and next steps
        summary += `NEXT STEPS:\n\n`
        summary += `ElderCare Connections will initiate services within [timeframe] and maintain regular contact `
        summary += `with ${clientName} and family members. A follow-up assessment will be scheduled in [timeframe] `
        summary += `to evaluate progress and adjust the care plan as needed. Our team remains available for `
        summary += `consultation and support throughout the care journey.\n\n`
        
        summary += `This assessment provides the foundation for a personalized care management approach `
        summary += `designed to optimize ${clientName}'s health, safety, and quality of life while supporting `
        summary += `family members in their caregiving roles.`

        resolve(summary)
      }, 4000) // Simulate AI processing time
    })
  }

  const careManagers = getCareManagers()
  const client = getClientInfo()

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <FileText className="h-6 w-6 mr-2 text-slate-500" />
          Section 13: Additional Comments & Final Summary
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

        {/* Additional Comments */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📝 Additional Comments</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Free-form notes for anything not previously addressed in other sections.
            </p>
            <textarea
              value={data.additional_comments as string || ''}
              onChange={(e) => onUpdateField('additional_comments', e.target.value)}
              disabled={isReadOnly}
              rows={6}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Include any additional observations, concerns, recommendations, or information not covered in previous sections..."
            />
          </div>
        </div>

        {/* AI-Generated Summary of Visit */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🤖 Summary of Visit / Initial Impressions</h3>
          
          <div className="space-y-4">
            {/* AI Generation Controls */}
            {!isReadOnly && (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-md font-medium text-blue-900 mb-1">AI-Assisted Summary Generation</h4>
                  <p className="text-sm text-blue-700">
                    Generate a comprehensive narrative using data from all assessment sections. 
                    The AI will create a professional summary that includes client name, assessment findings, 
                    ElderCare Connections recommendations, and care plans.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateAISummary}
                  disabled={isGeneratingSummary || !client}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ml-4"
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Summary
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI Processing Status */}
            {isGeneratingSummary && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 text-purple-600 animate-spin mr-3" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">AI is analyzing all assessment data...</p>
                    <p className="text-xs text-purple-700">
                      Creating comprehensive narrative with client name, findings, recommendations, and care plans...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Text Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Summary of Visit / Initial Impressions (AI-Assisted)
                </label>
                {data.visit_summary && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ AI Summary Generated
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                AI-generated narrative that uses the client's name, provides assessment findings, 
                outlines ElderCare Connections recommendations, and describes care plans. 
                Assessor can edit this text manually if needed.
              </p>
              <textarea
                value={data.visit_summary as string || ''}
                onChange={(e) => onUpdateField('visit_summary', e.target.value)}
                disabled={isReadOnly || isGeneratingSummary}
                rows={15}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly || isGeneratingSummary ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Click 'Generate AI Summary' to create a comprehensive assessment narrative, or write your own professional summary here. The AI will analyze all assessment sections to create a detailed summary with client name, findings, recommendations, and ElderCare Connections care plans."
              />
              <p className="text-xs text-gray-500 mt-2">
                <strong>Note:</strong> The assessor can edit or completely rewrite the AI-generated summary as needed. 
                This summary will be included in the final PDF export and assessment report.
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Completion Date */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">📅 Assessment Completion</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Assessment Completion
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Auto-filled with today's date but editable by the user.
            </p>
            <input
              type="date"
              value={data.assessment_completion_date as string || new Date().toISOString().split('T')[0]}
              onChange={(e) => onUpdateField('assessment_completion_date', e.target.value)}
              disabled={isReadOnly}
              className={`w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        {/* Care Managers Involved */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">👥 Care Managers Involved</h3>
          
          <div className="space-y-6">
            {/* Add Care Manager Button */}
            {!isReadOnly && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Add one or more care managers involved in this assessment.
                </p>
                <button
                  type="button"
                  onClick={addCareManager}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Care Manager
                </button>
              </div>
            )}

            {/* Care Managers List */}
            {careManagers.length > 0 ? (
              <div className="space-y-6">
                {careManagers.map((manager, index) => (
                  <div key={manager.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900 flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Care Manager {index + 1}
                      </h4>
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => removeCareManager(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Remove care manager"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={manager.fullName}
                          onChange={(e) => updateCareManager(index, 'fullName', e.target.value)}
                          disabled={isReadOnly}
                          required
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          placeholder="Enter full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role/Title
                        </label>
                        <input
                          type="text"
                          value={manager.roleTitle}
                          onChange={(e) => updateCareManager(index, 'roleTitle', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          placeholder="e.g., RN, Care Manager, LMSW"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={manager.email}
                          onChange={(e) => updateCareManager(index, 'email', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          placeholder="email@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          value={manager.phone}
                          onChange={(e) => updateCareManager(index, 'phone', e.target.value)}
                          disabled={isReadOnly}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                            isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    {/* Signature Pad */}
                    <SignaturePad
                      value={manager.signature}
                      onChange={(signature) => updateCareManager(index, 'signature', signature)}
                      isReadOnly={isReadOnly}
                      label={`Signature for ${manager.fullName || `Care Manager ${index + 1}`}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No Care Managers Added</p>
                <p className="text-sm">
                  Click "Add Care Manager" to include care team members and their signatures.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Export Summary Preview */}
        <div className="p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Assessment Completion and Care Team Signatures
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Preview of how this section will appear in the final printed/exported report:
          </p>
          
          <div className="bg-white p-6 rounded border space-y-6">
            {/* Additional Comments */}
            {data.additional_comments && (
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-2">Additional Comments:</h5>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-700 whitespace-pre-wrap">{data.additional_comments}</p>
                </div>
              </div>
            )}

            {/* AI-Generated Summary */}
            {data.visit_summary && (
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-2">Assessment Summary:</h5>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="text-gray-700 whitespace-pre-wrap">{data.visit_summary}</p>
                </div>
              </div>
            )}

            {/* Assessment Completion Date */}
            <div>
              <h5 className="text-md font-medium text-gray-800 mb-2">Date of Assessment Completion:</h5>
              <p className="text-gray-700 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {data.assessment_completion_date ? 
                  new Date(data.assessment_completion_date as string).toLocaleDateString() : 
                  'Not specified'
                }
              </p>
            </div>

            {/* Care Team Signatures */}
            {careManagers.length > 0 && (
              <div>
                <h5 className="text-md font-medium text-gray-800 mb-3">Care Team Signatures:</h5>
                <div className="space-y-4">
                  {careManagers.map((manager, index) => (
                    <div key={manager.id} className="border border-gray-200 rounded p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Full Name:</p>
                          <p className="text-gray-900">{manager.fullName || 'Not provided'}</p>
                          
                          {manager.roleTitle && (
                            <>
                              <p className="text-sm font-medium text-gray-700 mt-2">Title/Role:</p>
                              <p className="text-gray-900">{manager.roleTitle}</p>
                            </>
                          )}
                          
                          {manager.email && (
                            <>
                              <p className="text-sm font-medium text-gray-700 mt-2">Email:</p>
                              <p className="text-gray-900">{manager.email}</p>
                            </>
                          )}
                          
                          {manager.phone && (
                            <>
                              <p className="text-sm font-medium text-gray-700 mt-2">Phone:</p>
                              <p className="text-gray-900">{manager.phone}</p>
                            </>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Signature:</p>
                          {manager.signature ? (
                            <div className="border border-gray-300 rounded p-2 bg-white">
                              <img 
                                src={manager.signature} 
                                alt={`Signature of ${manager.fullName}`}
                                className="max-w-full h-auto"
                                style={{ maxHeight: '100px' }}
                              />
                            </div>
                          ) : (
                            <div className="border border-gray-300 rounded p-4 bg-gray-50 text-center text-gray-500 text-sm">
                              No signature provided
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Statistics */}
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-600">{careManagers.length}</p>
                  <p className="text-gray-600">Care Managers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-green-600">
                    {careManagers.filter(m => m.signature).length}
                  </p>
                  <p className="text-gray-600">Signatures Collected</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-purple-600">
                    {data.visit_summary ? 'Yes' : 'No'}
                  </p>
                  <p className="text-gray-600">AI Summary Generated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}