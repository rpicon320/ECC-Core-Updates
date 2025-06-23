import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  AssessmentData, 
  AssessmentFormState, 
  AssessmentContextType, 
  SectionKey, 
  SectionData, 
  ValidationError,
  AuditEntry 
} from '../../../types/assessment'
import { getAssessmentById, createAssessment, updateAssessment } from '../services/assessmentService'
import { Assessment } from '../../../lib/mockData'

// Action types for reducer
type AssessmentAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_CURRENT_SECTION'; payload: SectionKey }
  | { type: 'UPDATE_SECTION'; payload: { section: SectionKey; data: Partial<SectionData> } }
  | { type: 'UPDATE_FIELD'; payload: { section: SectionKey; field: string; value: unknown } }
  | { type: 'SET_VALIDATION_ERRORS'; payload: Record<string, ValidationError[]> }
  | { type: 'SET_UNSAVED_CHANGES'; payload: boolean }
  | { type: 'SET_MODE'; payload: 'edit' | 'view' | 'print' }
  | { type: 'INITIALIZE_ASSESSMENT'; payload: AssessmentData }
  | { type: 'ADD_AUDIT_ENTRY'; payload: AuditEntry }
  | { type: 'AUTO_SAVE_SUCCESS'; payload: Date }
  | { type: 'UPDATE_PROGRESS'; payload: number }

// Define required fields for each section for progress calculation
const REQUIRED_FIELDS: Record<SectionKey, string[]> = {
  basic: ['clientId', 'assessmentDate', 'consultationReasons'],
  medical: ['allergies', 'currentMedications', 'primaryCarePhysicianName'],
  functional: [
    'adl_bathing', 'adl_dressing', 'adl_toileting', 'adl_transferring', 'adl_continence', 'adl_feeding',
    'iadl_phone', 'iadl_shopping', 'iadl_food_prep', 'iadl_housekeeping', 'iadl_laundry', 
    'iadl_transportation', 'iadl_medications', 'iadl_finances'
  ],
  cognitive: ['memory_concerns', 'others_concerns', 'significant_dates', 'disorientation'],
  slums: [
    'cognitive_education_level', 'slums_q1_day_answer', 'slums_q2_year_answer', 'slums_q3_state_answer',
    'slums_q5_spent_answer', 'slums_q5_left_answer', 'slums_q6_animals_count', 'slums_q7_objects_recalled',
    'slums_q8_649_answer', 'slums_q8_8537_answer', 'slums_q9_clock_drawing', 'slums_q10_triangle_drawing',
    'slums_q11_name_answer', 'slums_q11_work_answer', 'slums_q11_when_answer', 'slums_q11_state_answer'
  ],
  mental: [
    'gds_q1', 'gds_q2', 'gds_q3', 'gds_q4', 'gds_q5', 'gds_q6', 'gds_q7', 'gds_q8',
    'gds_q9', 'gds_q10', 'gds_q11', 'gds_q12', 'gds_q13', 'gds_q14', 'gds_q15'
  ],
  safety: ['home_types', 'floor_plan', 'safety_concerns_identified'],
  directives: ['has_poa', 'has_living_will', 'has_advance_directives'],
  psychosocial: ['regular_support_providers', 'adequate_support', 'main_social_supports'],
  hobbies: ['enjoy_for_fun', 'current_hobbies', 'social_preference'],
  providers: [], // Dynamic based on added providers
  services: ['services_requested', 'priority_level'],
  summary: ['additional_comments', 'assessment_completion_date']
}

// Helper functions (moved up to be available for initialState)
function initializeEmptySections(): Record<SectionKey, SectionData> {
  const sections: Record<SectionKey, SectionData> = {} as Record<SectionKey, SectionData>
  
  const sectionKeys: SectionKey[] = [
    'basic', 'medical', 'functional', 'cognitive', 'slums', 'mental', 
    'safety', 'directives', 'psychosocial', 'hobbies', 
    'providers', 'services', 'summary'
  ]
  
  sectionKeys.forEach(key => {
    sections[key] = {
      isComplete: false,
      isValid: true,
      lastUpdated: new Date(),
      data: {},
      validationErrors: [],
      completionPercentage: 0
    }
  })
  
  return sections
}

// Calculate completion percentage for a section
function calculateSectionCompletion(sectionKey: SectionKey, sectionData: SectionData): number {
  const requiredFields = REQUIRED_FIELDS[sectionKey]
  if (requiredFields.length === 0) {
    // For sections without predefined required fields (like providers), check if any data exists
    const dataKeys = Object.keys(sectionData.data)
    return dataKeys.length > 0 ? 100 : 0
  }

  let completedFields = 0
  
  requiredFields.forEach(field => {
    const value = sectionData.data[field]
    
    // Check if field is completed based on its type
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) completedFields++
      } else if (typeof value === 'boolean') {
        completedFields++ // Boolean fields are always considered complete when set
      } else if (typeof value === 'number') {
        if (value >= 0) completedFields++ // Numbers >= 0 are considered complete
      } else if (typeof value === 'string') {
        if (value.trim().length > 0) completedFields++
      } else {
        completedFields++ // Other types (objects, etc.) are considered complete if not null/undefined
      }
    }
  })

  return Math.round((completedFields / requiredFields.length) * 100)
}

// Calculate overall assessment completion percentage
function calculateOverallCompletion(sections: Record<SectionKey, SectionData>): number {
  const sectionKeys = Object.keys(sections) as SectionKey[]
  let totalCompletion = 0

  sectionKeys.forEach(key => {
    const completion = calculateSectionCompletion(key, sections[key])
    totalCompletion += completion
  })

  return Math.round(totalCompletion / sectionKeys.length)
}

// Generate unique ID for new assessments
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Initial state
const initialState: AssessmentFormState = {
  data: {
    id: '',
    version: 1,
    lastModified: new Date(),
    sections: initializeEmptySections(),
    status: 'draft',
    audit: [],
    clientId: '',
    createdBy: '',
    metadata: {
      autoSaveEnabled: true,
      totalTimeSpent: 0,
      sessionStartTime: new Date(),
      completionPercentage: 0
    }
  },
  currentSection: 'basic',
  isLoading: false,
  isSaving: false,
  hasUnsavedChanges: false,
  validationErrors: {},
  mode: 'edit'
}

// Reducer function
function assessmentReducer(state: AssessmentFormState, action: AssessmentAction): AssessmentFormState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }
    
    case 'SET_CURRENT_SECTION':
      return { ...state, currentSection: action.payload }
    
    case 'UPDATE_SECTION':
      const updatedSections = {
        ...state.data.sections,
        [action.payload.section]: {
          ...state.data.sections[action.payload.section],
          ...action.payload.data,
          lastUpdated: new Date()
        }
      }
      
      // Recalculate completion for the updated section
      const sectionCompletion = calculateSectionCompletion(action.payload.section, updatedSections[action.payload.section])
      updatedSections[action.payload.section].completionPercentage = sectionCompletion
      updatedSections[action.payload.section].isComplete = sectionCompletion >= 80 // Consider 80%+ as complete
      
      // Recalculate overall completion
      const overallCompletion = calculateOverallCompletion(updatedSections)
      
      return {
        ...state,
        data: {
          ...state.data,
          sections: updatedSections,
          lastModified: new Date(),
          metadata: {
            ...state.data.metadata,
            completionPercentage: overallCompletion
          }
        },
        hasUnsavedChanges: true
      }
    
    case 'UPDATE_FIELD':
      const { section, field, value } = action.payload
      const newSections = {
        ...state.data.sections,
        [section]: {
          ...state.data.sections[section],
          data: {
            ...state.data.sections[section]?.data,
            [field]: value
          },
          lastUpdated: new Date()
        }
      }
      
      // Recalculate completion for the updated section
      const fieldSectionCompletion = calculateSectionCompletion(section, newSections[section])
      newSections[section].completionPercentage = fieldSectionCompletion
      newSections[section].isComplete = fieldSectionCompletion >= 80
      
      // Recalculate overall completion
      const fieldOverallCompletion = calculateOverallCompletion(newSections)
      
      return {
        ...state,
        data: {
          ...state.data,
          sections: newSections,
          lastModified: new Date(),
          metadata: {
            ...state.data.metadata,
            completionPercentage: fieldOverallCompletion
          }
        },
        hasUnsavedChanges: true
      }
    
    case 'SET_VALIDATION_ERRORS':
      return { ...state, validationErrors: action.payload }
    
    case 'SET_UNSAVED_CHANGES':
      return { ...state, hasUnsavedChanges: action.payload }
    
    case 'SET_MODE':
      return { ...state, mode: action.payload }
    
    case 'INITIALIZE_ASSESSMENT':
      // Recalculate completion percentages when initializing
      const initializedSections = { ...action.payload.sections }
      Object.keys(initializedSections).forEach(key => {
        const sectionKey = key as SectionKey
        const completion = calculateSectionCompletion(sectionKey, initializedSections[sectionKey])
        initializedSections[sectionKey].completionPercentage = completion
        initializedSections[sectionKey].isComplete = completion >= 80
      })
      
      const initialOverallCompletion = calculateOverallCompletion(initializedSections)
      
      return {
        ...state,
        data: {
          ...action.payload,
          sections: initializedSections,
          metadata: {
            ...action.payload.metadata,
            completionPercentage: initialOverallCompletion
          }
        },
        hasUnsavedChanges: false
      }
    
    case 'ADD_AUDIT_ENTRY':
      return {
        ...state,
        data: {
          ...state.data,
          audit: [...state.data.audit, action.payload]
        }
      }
    
    case 'AUTO_SAVE_SUCCESS':
      return {
        ...state,
        data: {
          ...state.data,
          metadata: {
            ...state.data.metadata,
            lastAutoSave: action.payload
          }
        },
        hasUnsavedChanges: false
      }
    
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        data: {
          ...state.data,
          metadata: {
            ...state.data.metadata,
            completionPercentage: action.payload
          }
        }
      }
    
    default:
      return state
  }
}

// Context
const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined)

// Provider component
interface AssessmentProviderProps {
  children: React.ReactNode
  assessmentId?: string
}

export function AssessmentProvider({ children, assessmentId }: AssessmentProviderProps) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(assessmentReducer, initialState)

  // Initialize assessment data
  useEffect(() => {
    const initializeAssessment = async () => {
      if (assessmentId) {
        // Load existing assessment
        try {
          dispatch({ type: 'SET_LOADING', payload: true })
          const existingAssessment = await getAssessmentById(assessmentId)
          
          if (existingAssessment) {
            // Convert legacy assessment to new format
            const assessmentData: AssessmentData = {
              id: existingAssessment.id,
              version: 1,
              lastModified: new Date(existingAssessment.updated_at),
              sections: initializeSections(existingAssessment),
              status: existingAssessment.status,
              audit: [],
              clientId: existingAssessment.client_id,
              createdBy: existingAssessment.created_by,
              metadata: {
                autoSaveEnabled: true,
                totalTimeSpent: 0,
                sessionStartTime: new Date(),
                completionPercentage: 0
              }
            }
            
            dispatch({ type: 'INITIALIZE_ASSESSMENT', payload: assessmentData })
          }
        } catch (error) {
          console.error('Failed to load assessment:', error)
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else if (user) {
        // Create new assessment - always initialize with empty sections
        const newAssessment: AssessmentData = {
          id: generateId(),
          version: 1,
          lastModified: new Date(),
          sections: initializeEmptySections(),
          status: 'draft',
          audit: [],
          clientId: '',
          createdBy: user.id,
          metadata: {
            autoSaveEnabled: true,
            totalTimeSpent: 0,
            sessionStartTime: new Date(),
            completionPercentage: 0
          }
        }
        
        dispatch({ type: 'INITIALIZE_ASSESSMENT', payload: newAssessment })
      }
    }

    initializeAssessment()
  }, [assessmentId, user])

  // Auto-save functionality
  useEffect(() => {
    if (!state.data.metadata.autoSaveEnabled || !state.hasUnsavedChanges) return

    const autoSaveTimer = setTimeout(() => {
      saveAssessment('draft')
    }, 30000) // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer)
  }, [state.hasUnsavedChanges, state.data])

  // Validation functions
  const validateSection = useCallback((section: SectionKey): ValidationError[] => {
    const sectionData = state.data.sections[section]
    const errors: ValidationError[] = []

    // Basic validation rules
    switch (section) {
      case 'basic':
        if (!state.data.clientId) {
          errors.push({
            field: 'clientId',
            message: 'Client selection is required',
            severity: 'error'
          })
        }
        break
      
      case 'medical':
        // Add medical history validation
        break
      
      // Add more section-specific validations
    }

    return errors
  }, [state.data])

  const validateAll = useCallback((): Record<string, ValidationError[]> => {
    const allErrors: Record<string, ValidationError[]> = {}
    
    Object.keys(state.data.sections).forEach(section => {
      const errors = validateSection(section as SectionKey)
      if (errors.length > 0) {
        allErrors[section] = errors
      }
    })

    return allErrors
  }, [state.data.sections, validateSection])

  // Action handlers
  const updateSection = useCallback((section: SectionKey, data: Partial<SectionData>) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { section, data } })
    
    // Add audit entry
    const auditEntry: AuditEntry = {
      id: generateId(),
      timestamp: new Date(),
      userId: user?.id || '',
      action: 'update',
      section,
      description: `Updated ${section} section`
    }
    dispatch({ type: 'ADD_AUDIT_ENTRY', payload: auditEntry })
  }, [user])

  const updateField = useCallback((section: SectionKey, field: string, value: unknown) => {
    const oldValue = state.data.sections[section]?.data[field]
    
    dispatch({ type: 'UPDATE_FIELD', payload: { section, field, value } })
    
    // Add audit entry for field changes
    const auditEntry: AuditEntry = {
      id: generateId(),
      timestamp: new Date(),
      userId: user?.id || '',
      action: 'update',
      section,
      field,
      oldValue,
      newValue: value,
      description: `Updated field ${field} in ${section} section`
    }
    dispatch({ type: 'ADD_AUDIT_ENTRY', payload: auditEntry })
  }, [state.data.sections, user])

  const setCurrentSection = useCallback((section: SectionKey) => {
    dispatch({ type: 'SET_CURRENT_SECTION', payload: section })
  }, [])

  const saveAssessment = useCallback(async (status: 'draft' | 'complete' = 'draft') => {
    if (!user) return

    dispatch({ type: 'SET_SAVING', payload: true })

    try {
      // Convert to legacy format for storage
      const legacyAssessment = convertToLegacyFormat(state.data, status)
      
      if (state.data.id && assessmentId) {
        // Update existing assessment
        await updateAssessment(state.data.id, legacyAssessment)
      } else {
        // Create new assessment
        const newAssessment = await createAssessment({
          ...legacyAssessment,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        
        // Update the assessment ID in state
        dispatch({ 
          type: 'INITIALIZE_ASSESSMENT', 
          payload: { 
            ...state.data, 
            id: newAssessment.id 
          } 
        })
      }
      
      // Update state
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false })
      if (status === 'draft') {
        dispatch({ type: 'AUTO_SAVE_SUCCESS', payload: new Date() })
      }
      
      // Add audit entry
      const auditEntry: AuditEntry = {
        id: generateId(),
        timestamp: new Date(),
        userId: user.id,
        action: status === 'complete' ? 'submit' : 'save',
        description: `Assessment ${status === 'complete' ? 'completed' : 'saved'}`
      }
      dispatch({ type: 'ADD_AUDIT_ENTRY', payload: auditEntry })
      
    } catch (error) {
      console.error('Failed to save assessment:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }, [state.data, user, assessmentId])

  const exportData = useCallback((format: 'json' | 'pdf' | 'print') => {
    switch (format) {
      case 'json':
        const dataStr = JSON.stringify(state.data, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `assessment-${state.data.id}.json`
        link.click()
        break
      
      case 'print':
        dispatch({ type: 'SET_MODE', payload: 'print' })
        setTimeout(() => window.print(), 100)
        break
      
      case 'pdf':
        // PDF export would be implemented here
        console.log('PDF export not yet implemented')
        break
    }
  }, [state.data])

  const resetForm = useCallback(() => {
    dispatch({ type: 'INITIALIZE_ASSESSMENT', payload: initialState.data })
  }, [])

  const setMode = useCallback((mode: 'edit' | 'view' | 'print') => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }, [])

  const contextValue: AssessmentContextType = {
    state,
    actions: {
      updateSection,
      updateField,
      setCurrentSection,
      saveAssessment,
      validateSection,
      validateAll,
      exportData,
      resetForm,
      setMode
    }
  }

  return (
    <AssessmentContext.Provider value={contextValue}>
      {children}
    </AssessmentContext.Provider>
  )
}

// Hook to use the context
export function useAssessment() {
  const context = useContext(AssessmentContext)
  if (context === undefined) {
    throw new Error('useAssessment must be used within an AssessmentProvider')
  }
  return context
}

// Helper functions
function initializeSections(assessment: Assessment): Record<SectionKey, SectionData> {
  const sections: Record<SectionKey, SectionData> = {} as Record<SectionKey, SectionData>
  
  const sectionKeys: SectionKey[] = [
    'basic', 'medical', 'functional', 'cognitive', 'slums', 'mental', 
    'safety', 'directives', 'psychosocial', 'hobbies', 
    'providers', 'services', 'summary'
  ]
  
  sectionKeys.forEach(key => {
    const sectionData = {
      isComplete: false,
      isValid: true,
      lastUpdated: new Date(assessment.updated_at),
      data: extractSectionData(assessment, key),
      validationErrors: [],
      completionPercentage: 0
    }
    
    // Calculate completion percentage
    sectionData.completionPercentage = calculateSectionCompletion(key, sectionData)
    sectionData.isComplete = sectionData.completionPercentage >= 80
    
    sections[key] = sectionData
  })
  
  return sections
}

function extractSectionData(assessment: Assessment, section: SectionKey): Record<string, unknown> {
  // Extract relevant data for each section from the legacy assessment format
  switch (section) {
    case 'basic':
      return {
        clientId: assessment.client_id,
        consultationReasons: assessment.consultation_reasons || [],
        consultationReasonsOther: assessment.consultation_reasons_other || ''
      }
    case 'medical':
      return {
        allergies: assessment.allergies || [],
        surgicalHistory: assessment.surgical_history || [],
        currentMedications: assessment.current_medications || [],
        // Add other medical fields
      }
    case 'slums':
      return {
        cognitive_education_level: assessment.cognitive_education_level,
        slums_q1_day_answer: assessment.slums_q1_day_answer,
        slums_q1_score: assessment.slums_q1_score,
        slums_q2_year_answer: assessment.slums_q2_year_answer,
        slums_q2_score: assessment.slums_q2_score,
        slums_q3_state_answer: assessment.slums_q3_state_answer,
        slums_q3_score: assessment.slums_q3_score,
        slums_q5_spent_answer: assessment.slums_q5_spent_answer,
        slums_q5_spent_score: assessment.slums_q5_spent_score,
        slums_q5_left_answer: assessment.slums_q5_left_answer,
        slums_q5_left_score: assessment.slums_q5_left_score,
        slums_q6_animals_count: assessment.slums_q6_animals_count,
        slums_q6_animals_list: assessment.slums_q6_animals_list,
        slums_q6_score: assessment.slums_q6_score,
        slums_q7_objects_recalled: assessment.slums_q7_objects_recalled,
        slums_q7_score: assessment.slums_q7_score,
        slums_q8_87_answer: assessment.slums_q8_87_answer,
        slums_q8_649_answer: assessment.slums_q8_649_answer,
        slums_q8_649_correct: assessment.slums_q8_649_correct,
        slums_q8_8537_answer: assessment.slums_q8_8537_answer,
        slums_q8_8537_correct: assessment.slums_q8_8537_correct,
        slums_q9_clock_drawing: assessment.slums_q9_clock_drawing,
        slums_q9_score: assessment.slums_q9_score,
        slums_q10_triangle_drawing: assessment.slums_q10_triangle_drawing,
        slums_q10_x_correct: assessment.slums_q10_x_correct,
        slums_q10_largest_answer: assessment.slums_q10_largest_answer,
        slums_q10_largest_correct: assessment.slums_q10_largest_correct,
        slums_q11_name_answer: assessment.slums_q11_name_answer,
        slums_q11_name_score: assessment.slums_q11_name_score,
        slums_q11_work_answer: assessment.slums_q11_work_answer,
        slums_q11_work_score: assessment.slums_q11_work_score,
        slums_q11_when_answer: assessment.slums_q11_when_answer,
        slums_q11_when_score: assessment.slums_q11_when_score,
        slums_q11_state_answer: assessment.slums_q11_state_answer,
        slums_q11_state_score: assessment.slums_q11_state_score,
        cognitive_slums_total_score: assessment.cognitive_slums_total_score,
        cognitive_slums_interpretation: assessment.cognitive_slums_interpretation,
        cognitive_notes: assessment.cognitive_notes
      }
    // Add other sections
    default:
      return {}
  }
}

// Helper function to clean undefined values from an object
function cleanUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues)
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) {
        cleaned[key] = null
      } else if (value === null) {
        cleaned[key] = null
      } else if (typeof value === 'object') {
        cleaned[key] = cleanUndefinedValues(value)
      } else {
        cleaned[key] = value
      }
    }
    return cleaned
  }
  
  return obj
}

function convertToLegacyFormat(data: AssessmentData, status: 'draft' | 'complete'): Partial<Assessment> {
  // Convert new format back to legacy format for storage
  const legacyData = {
    client_id: data.clientId,
    created_by: data.createdBy,
    status,
    // Map section data back to legacy fields
    consultation_reasons: data.sections.basic?.data.consultationReasons as string[] || [],
    consultation_reasons_other: data.sections.basic?.data.consultationReasonsOther as string || null,
    allergies: data.sections.medical?.data.allergies as any[] || [],
    surgical_history: data.sections.medical?.data.surgicalHistory as any[] || [],
    current_medications: data.sections.medical?.data.currentMedications as any[] || [],
    mental_health_gds_responses: new Array(15).fill(false),
    functional_equipment: [],
    care_providers: [],
    care_services_requested: [],
    assessment_signatures: [],
    // SLUMS fields
    cognitive_education_level: data.sections.slums?.data.cognitive_education_level as string,
    slums_q1_day_answer: data.sections.slums?.data.slums_q1_day_answer as string,
    slums_q1_score: data.sections.slums?.data.slums_q1_score as number,
    slums_q2_year_answer: data.sections.slums?.data.slums_q2_year_answer as string,
    slums_q2_score: data.sections.slums?.data.slums_q2_score as number,
    slums_q3_state_answer: data.sections.slums?.data.slums_q3_state_answer as string,
    slums_q3_score: data.sections.slums?.data.slums_q3_score as number,
    slums_q5_spent_answer: data.sections.slums?.data.slums_q5_spent_answer as string,
    slums_q5_spent_score: data.sections.slums?.data.slums_q5_spent_score as number,
    slums_q5_left_answer: data.sections.slums?.data.slums_q5_left_answer as string,
    slums_q5_left_score: data.sections.slums?.data.slums_q5_left_score as number,
    slums_q6_animals_count: data.sections.slums?.data.slums_q6_animals_count as number,
    slums_q6_animals_list: data.sections.slums?.data.slums_q6_animals_list as string,
    slums_q6_score: data.sections.slums?.data.slums_q6_score as number,
    slums_q7_objects_recalled: data.sections.slums?.data.slums_q7_objects_recalled as string[],
    slums_q7_score: data.sections.slums?.data.slums_q7_score as number,
    slums_q8_87_answer: data.sections.slums?.data.slums_q8_87_answer as string,
    slums_q8_649_answer: data.sections.slums?.data.slums_q8_649_answer as string,
    slums_q8_649_correct: data.sections.slums?.data.slums_q8_649_correct as boolean,
    slums_q8_8537_answer: data.sections.slums?.data.slums_q8_8537_answer as string,
    slums_q8_8537_correct: data.sections.slums?.data.slums_q8_8537_correct as boolean,
    slums_q9_clock_drawing: data.sections.slums?.data.slums_q9_clock_drawing as string,
    slums_q9_score: data.sections.slums?.data.slums_q9_score as number,
    slums_q10_triangle_drawing: data.sections.slums?.data.slums_q10_triangle_drawing as string,
    slums_q10_x_correct: data.sections.slums?.data.slums_q10_x_correct as boolean,
    slums_q10_largest_answer: data.sections.slums?.data.slums_q10_largest_answer as string,
    slums_q10_largest_correct: data.sections.slums?.data.slums_q10_largest_correct as boolean,
    slums_q11_name_answer: data.sections.slums?.data.slums_q11_name_answer as string,
    slums_q11_name_score: data.sections.slums?.data.slums_q11_name_score as number,
    slums_q11_work_answer: data.sections.slums?.data.slums_q11_work_answer as string,
    slums_q11_work_score: data.sections.slums?.data.slums_q11_work_score as number,
    slums_q11_when_answer: data.sections.slums?.data.slums_q11_when_answer as string,
    slums_q11_when_score: data.sections.slums?.data.slums_q11_when_score as number,
    slums_q11_state_answer: data.sections.slums?.data.slums_q11_state_answer as string,
    slums_q11_state_score: data.sections.slums?.data.slums_q11_state_score as number,
    cognitive_slums_total_score: data.sections.slums?.data.cognitive_slums_total_score as number,
    cognitive_slums_interpretation: data.sections.slums?.data.cognitive_slums_interpretation as string,
    cognitive_notes: data.sections.slums?.data.cognitive_notes as string
  }
  
  // Clean all undefined values before returning
  return cleanUndefinedValues(legacyData)
}