import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../../contexts/AuthContext'
import { AssessmentProvider, useAssessment } from '../../context/AssessmentContext'
import { ArrowLeft, Save, FileText, User, Calendar, AlertCircle, CheckCircle, Clock, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Client } from '../../../../lib/mockData'
import { getClients } from '../../../../lib/firestoreService'
import ErrorBoundary from '../../../../components/common/ErrorBoundary'
import LoadingSpinner from '../../../../components/common/LoadingSpinner'
import ProgressIndicator from '../../../../components/common/ProgressIndicator'
import NavigationSidebar from './components/NavigationSidebar'
import SectionRenderer from './components/SectionRenderer'

// Main form component that uses the context
function AssessmentFormContent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { state, actions } = useAssessment()
  const [clients, setClients] = useState<Client[]>([])
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await getClients()
        setClients(clientsData)
      } catch (error) {
        console.error('Error fetching clients:', error)
      }
    }
    fetchClients()
    
    // Expose assessment context to window for child components
    window.assessmentContext = { updateClientId: actions.updateClientId }
    
    return () => {
      delete window.assessmentContext
    }
  }, [actions.updateClientId])

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state.hasUnsavedChanges])

  const handleClose = () => {
    if (state.hasUnsavedChanges) {
      setShowUnsavedWarning(true)
    } else {
      navigate('/assessments')
    }
  }

  const handleSave = async (status: 'draft' | 'complete' = 'draft') => {
    try {
      await actions.saveAssessment(status)
      if (status === 'complete') {
        setTimeout(() => navigate('/assessments'), 1500)
      }
    } catch (error) {
      console.error('Failed to save assessment:', error)
      // Show user-friendly error message
      if (error.message?.includes('select a client')) {
        alert('Please select a client before saving the assessment.')
      } else {
        alert('Failed to save assessment. Please try again.')
      }
    }
  }

  const handleTabSwitch = async (newSection: any) => {
    if (state.hasUnsavedChanges) {
      try {
        await actions.saveAssessment('draft')
        return true
      } catch (error) {
        console.error('Failed to save before tab switch:', error)
        return false
      }
    }
    return true
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 150))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 70))
  }

  const handleZoomReset = () => {
    setZoomLevel(100)
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return 'Unknown Client'
    return client.preferred_name 
      ? `${client.preferred_name} ${client.last_name}`
      : `${client.first_name} ${client.last_name}`
  }

  // Calculate completion percentage based on completed sections
  const getCompletionPercentage = () => {
    const sectionKeys = Object.keys(state.data.sections)
    const completedSections = sectionKeys.filter(key => state.data.sections[key as keyof typeof state.data.sections]?.isComplete).length
    return Math.round((completedSections / sectionKeys.length) * 100)
  }

  if (state.isLoading) {
    return <LoadingSpinner message="Loading assessment..." />
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${state.mode === 'print' ? 'print:bg-white' : ''}`}>
      <div className="max-w-full">
        {/* Header */}
        <header className={`bg-white shadow-sm border-b sticky top-0 z-20 ${state.mode === 'print' ? 'print:hidden' : ''}`}>
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  aria-label="Close assessment form"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {state.data.id ? 'Edit Assessment' : 'New Assessment'}
                  </h1>
                  {state.data.clientId && (
                    <p className="text-gray-600 flex items-center mt-1 text-sm sm:text-base">
                      <User className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{getClientName(state.data.clientId)}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Progress Indicator */}
                <div className="flex items-center space-x-3">
                  <ProgressIndicator 
                    percentage={getCompletionPercentage()}
                    showLabel={false}
                    className="w-32"
                  />
                  <span className="text-sm font-medium text-blue-600 whitespace-nowrap">
                    {getCompletionPercentage()}% Complete
                  </span>
                </div>
                
                {/* Auto-save Status */}
                <div className="flex items-center text-sm text-gray-500 whitespace-nowrap">
                  {state.isSaving ? (
                    <>
                      <Clock className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : state.hasUnsavedChanges ? (
                    <>
                      <AlertCircle className="h-4 w-4 mr-1 text-yellow-500" />
                      Unsaved changes
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                      All changes saved
                    </>
                  )}
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 70}
                    className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleZoomReset}
                    className="px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-white rounded transition-colors min-w-[3rem]"
                    title="Reset zoom"
                  >
                    {zoomLevel}%
                  </button>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 150}
                    className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => handleSave('draft')}
                    disabled={state.isSaving}
                    className="flex items-center px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    <Save className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{state.isSaving ? 'Saving...' : 'Save Draft'}</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                  <button
                    onClick={() => handleSave('complete')}
                    disabled={state.isSaving || !state.data.clientId}
                    className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    <FileText className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Complete Assessment</span>
                    <span className="sm:hidden">Complete</span>
                  </button>
                  <button
                    onClick={() => actions.exportData('print')}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Sidebar with Progress */}
        <NavigationSidebar 
          currentSection={state.currentSection}
          sections={state.data.sections}
          onSectionChange={actions.setCurrentSection}
          validationErrors={state.validationErrors}
          hasUnsavedChanges={state.hasUnsavedChanges}
          onTabSwitch={handleTabSwitch}
          className={state.mode === 'print' ? 'print:hidden' : ''}
        />

        {/* Main Content with Zoom */}
        <main className="p-4 sm:p-6 pb-24">
          <ErrorBoundary>
            <div 
              className="bg-white shadow-sm rounded-lg max-w-full overflow-hidden transition-transform duration-200 origin-top"
              style={{ 
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center'
              }}
            >
              <SectionRenderer
                currentSection={state.currentSection}
                sectionData={state.data.sections[state.currentSection]}
                clients={clients}
                onUpdateField={actions.updateField}
                onUpdateSection={actions.updateSection}
                validationErrors={state.validationErrors[state.currentSection] || []}
                mode={state.mode}
                onSectionChange={actions.setCurrentSection}
              />
            </div>
          </ErrorBoundary>
        </main>
      </div>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Unsaved Changes
            </h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Do you want to save before leaving?
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowUnsavedWarning(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUnsavedWarning(false)
                  navigate('/assessments')
                }}
                className="px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
              >
                Leave without saving
              </button>
              <button
                onClick={async () => {
                  await handleSave('draft')
                  setShowUnsavedWarning(false)
                  navigate('/assessments')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save and leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Main wrapper component with provider
export default function AssessmentForm() {
  const { id } = useParams<{ id: string }>()
  const assessmentId = id === 'new' ? undefined : id

  return (
    <AssessmentProvider assessmentId={assessmentId}>
      <AssessmentFormContent />
    </AssessmentProvider>
  )
}