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

// Helper functions defined first
function initializeEmptySections(): Record<SectionKey, SectionData> {
  const sections = {} as Record<SectionKey, SectionData>
  const sectionKeys: SectionKey[] = ['basic', 'medical', 'health_symptoms', 'functional', 'cognitive', 'slums', 'mental', 'safety', 'directives', 'psychosocial', 'hobbies', 'providers', 'care_plan', 'services', 'summary']
  
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

function initializeSections(assessment: Assessment): Record<SectionKey, SectionData> {
  const sections = initializeEmptySections()
  sections.basic.data = { ...assessment }
  return sections
}

function convertToLegacyFormat(sections: Record<SectionKey, SectionData>): Record<string, unknown> {
  const legacy: Record<string, unknown> = {}
  
  Object.entries(sections).forEach(([sectionKey, sectionData]) => {
    Object.entries(sectionData.data).forEach(([field, value]) => {
      legacy[field] = value
    })
  })
  
  return legacy
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function calculateSectionCompletion(sectionKey: SectionKey, sectionData: SectionData): number {
  const requiredFields = REQUIRED_FIELDS[sectionKey]
  if (requiredFields.length === 0) {
    const dataKeys = Object.keys(sectionData.data)
    return dataKeys.length > 0 ? 100 : 0
  }

  let completedFields = 0
  requiredFields.forEach(field => {
    const value = sectionData.data[field]
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) completedFields++
      } else if (typeof value === 'boolean' || typeof value === 'number' || (typeof value === 'string' && value.trim().length > 0)) {
        completedFields++
      } else {
        completedFields++
      }
    }
  })
  return Math.round((completedFields / requiredFields.length) * 100)
}

function calculateOverallCompletion(sections: Record<SectionKey, SectionData>): number {
  const sectionKeys = Object.keys(sections) as SectionKey[]
  let totalCompletion = 0
  sectionKeys.forEach(key => {
    totalCompletion += calculateSectionCompletion(key, sections[key])
  })
  return Math.round(totalCompletion / sectionKeys.length)
}

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
  | { type: 'UPDATE_CLIENT_ID'; payload: string }

const REQUIRED_FIELDS: Record<SectionKey, string[]> = {
  basic: ['clientId', 'assessmentDate', 'completionDate', 'consultationReasons'],
  medical: ['allergies', 'currentMedications', 'primaryCarePhysicianName'],
  health_symptoms: ['nutrition_status', 'pain_level', 'medication_adherence', 'sleep_quality'],
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
  providers: [],
  care_plan: [],
  services: ['services_requested', 'priority_level'],
  summary: ['additional_comments', 'assessment_completion_date']
}

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

function assessmentReducer(state: AssessmentFormState, action: AssessmentAction): AssessmentFormState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload }
    
    case 'SET_CURRENT_SECTION':
      return { ...state, currentSection: action.payload }
    
    case 'UPDATE_SECTION':
      return {
        ...state,
        data: {
          ...state.data,
          sections: {
            ...state.data.sections,
            [action.payload.section]: {
              ...state.data.sections[action.payload.section],
              ...action.payload.data,
              lastUpdated: new Date()
            }
          },
          lastModified: new Date()
        },
        hasUnsavedChanges: true
      }
    
    case 'UPDATE_FIELD':
      return {
        ...state,
        data: {
          ...state.data,
          sections: {
            ...state.data.sections,
            [action.payload.section]: {
              ...state.data.sections[action.payload.section],
              data: {
                ...state.data.sections[action.payload.section].data,
                [action.payload.field]: action.payload.value
              },
              lastUpdated: new Date()
            }
          },
          lastModified: new Date()
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
      return {
        ...state,
        data: action.payload,
        hasUnsavedChanges: false,
        validationErrors: {}
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
        }
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
    
    case 'UPDATE_CLIENT_ID':
      return {
        ...state,
        data: {
          ...state.data,
          clientId: action.payload
        },
        hasUnsavedChanges: true
      }
    
    default:
      return state
  }
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined)

interface AssessmentProviderProps {
  children: React.ReactNode
  assessmentId?: string
}

export function AssessmentProvider({ children, assessmentId }: AssessmentProviderProps) {
  const { user } = useAuth()
  const [state, dispatch] = useReducer(assessmentReducer, initialState)

  useEffect(() => {
    const initializeAssessment = async () => {
      if (assessmentId) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true })
          const existingAssessment = await getAssessmentById(assessmentId)
          if (existingAssessment) {
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
        const newAssessment: AssessmentData = {
          id: '', // Start with empty ID - will be set when first saved to Firestore
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

  // Save assessment function with proper draft management
  const saveAssessment = useCallback(async (status: 'draft' | 'complete' = 'draft') => {
    if (!user) {
      console.error('No user available for saving assessment')
      return
    }

    try {
      dispatch({ type: 'SET_SAVING', payload: true })

      // Ensure clientId is available from the basic section data
      const clientId = state.data.clientId || state.data.sections.basic?.data?.clientId || ''
      
      if (!clientId) {
        console.error('No client ID provided for assessment');
        throw new Error('Please select a client before saving the assessment');
      }
      
      const assessmentPayload = {
        client_id: clientId,
        created_by: state.data.createdBy,
        status,
        ...convertToLegacyFormat(state.data.sections)
      }
      
      console.log('Saving assessment with client_id:', clientId)

      let savedAssessment
      
      // Check if this assessment has already been saved to Firestore
      if (state.data.id) {
        try {
          // Try to update the existing assessment
          await updateAssessment(state.data.id, assessmentPayload)
          savedAssessment = { id: state.data.id, ...assessmentPayload }
          console.log('Updated existing assessment:', state.data.id)
        } catch (error) {
          console.log('Error updating assessment, creating new one:', error)
          // If update fails, create a new assessment
          savedAssessment = await createAssessment(assessmentPayload)
          console.log('Created new assessment (after update error):', savedAssessment.id)
          
          // Update the local state with the new Firestore ID
          dispatch({
            type: 'INITIALIZE_ASSESSMENT',
            payload: {
              ...state.data,
              id: savedAssessment.id,
              clientId: clientId // Ensure clientId is preserved
            }
          })
        }
      } else {
        // Create new assessment (no ID means never saved before)
        savedAssessment = await createAssessment(assessmentPayload)
        console.log('Created new assessment:', savedAssessment.id)
        
        // Update the local state with the new Firestore ID
        dispatch({
          type: 'INITIALIZE_ASSESSMENT',
          payload: {
            ...state.data,
            id: savedAssessment.id,
            clientId: clientId // Ensure clientId is preserved
          }
        })
      }

      // Add audit entry
      const auditEntry: AuditEntry = {
        id: generateId(),
        timestamp: new Date(),
        userId: user.id,
        action: 'save',
        description: `Assessment ${status === 'draft' ? 'draft saved' : 'completed'}`
      }
      dispatch({ type: 'ADD_AUDIT_ENTRY', payload: auditEntry })
      dispatch({ type: 'SET_UNSAVED_CHANGES', payload: false })
      
      console.log(`Assessment ${status} saved successfully`)
    } catch (error) {
      console.error('Failed to save assessment:', error)
      throw error
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false })
    }
  }, [state.data, user])

  // Auto-save useEffect
  useEffect(() => {
    if (!state.data.metadata.autoSaveEnabled || !state.hasUnsavedChanges) return
    const autoSaveTimer = setTimeout(() => {
      saveAssessment('draft')
    }, 30000)
    return () => clearTimeout(autoSaveTimer)
  }, [state.hasUnsavedChanges, saveAssessment])

  // Action handlers
  const updateSection = useCallback((section: SectionKey, data: Partial<SectionData>) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { section, data } })
  }, [])

  const updateField = useCallback((section: SectionKey, field: string, value: unknown) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { section, field, value } })
    
    // If updating clientId in basic section, also update the main clientId
    if (section === 'basic' && field === 'clientId') {
      console.log('Updating clientId to:', value)
      dispatch({
        type: 'UPDATE_CLIENT_ID',
        payload: value as string
      })
    }
  }, [])

  const setCurrentSection = useCallback((section: SectionKey) => {
    dispatch({ type: 'SET_CURRENT_SECTION', payload: section })
  }, [])

  // Calculate progress percentage for basic section (Page 1)
  const calculateBasicSectionProgress = useCallback((): number => {
    const basicData = state.data.sections.basic.data
    let completedFields = 0
    const totalRequiredFields = 4 // clientId, assessmentDate, completionDate, consultationReasons
    
    // Check if client is selected
    if (basicData.clientId && typeof basicData.clientId === 'string' && basicData.clientId.trim() !== '') {
      completedFields++
    }
    
    // Check if assessment date is filled
    if (basicData.assessmentDate && typeof basicData.assessmentDate === 'string' && basicData.assessmentDate.trim() !== '') {
      completedFields++
    }
    
    // Check if completion date is filled
    if (basicData.completionDate && typeof basicData.completionDate === 'string' && basicData.completionDate.trim() !== '') {
      completedFields++
    }
    
    // Check if at least one consultation reason is selected
    if (basicData.consultationReasons && Array.isArray(basicData.consultationReasons) && basicData.consultationReasons.length > 0) {
      completedFields++
    }
    
    return Math.round((completedFields / totalRequiredFields) * 100)
  }, [state.data.sections.basic.data])

  const validateSection = useCallback((section: SectionKey): ValidationError[] => {
    const requiredFields = REQUIRED_FIELDS[section] || []
    const sectionData = state.data.sections[section]
    const errors: ValidationError[] = []

    requiredFields.forEach(field => {
      const value = sectionData.data[field]
      
      // Special validation for consultation reasons (must have at least one selected)
      if (field === 'consultationReasons') {
        if (!value || !Array.isArray(value) || value.length === 0) {
          errors.push({
            field,
            message: 'At least one reason for consultation must be selected',
            severity: 'error'
          })
        }
      } else {
        // Standard validation for other fields
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push({
            field,
            message: `${field.replace(/_/g, ' ')} is required`,
            severity: 'error'
          })
        }
      }
    })

    // Update completion percentage for basic section
    if (section === 'basic') {
      const completionPercentage = calculateBasicSectionProgress()
      dispatch({
        type: 'UPDATE_SECTION',
        payload: {
          section: 'basic',
          data: { completionPercentage }
        }
      })
    }

    return errors
  }, [state.data.sections, calculateBasicSectionProgress])

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

  const exportData = useCallback((format: 'json' | 'pdf' | 'print') => {
    console.log(`Exporting assessment data in ${format} format`)
  }, [])

  const resetForm = useCallback(() => {
    const newAssessment: AssessmentData = {
      id: '', // Start with empty ID - will be set when first saved to Firestore
      version: 1,
      lastModified: new Date(),
      sections: initializeEmptySections(),
      status: 'draft',
      audit: [],
      clientId: '',
      createdBy: user?.id || '',
      metadata: {
        autoSaveEnabled: true,
        totalTimeSpent: 0,
        sessionStartTime: new Date(),
        completionPercentage: 0
      }
    }
    dispatch({ type: 'INITIALIZE_ASSESSMENT', payload: newAssessment })
  }, [user])

  const setMode = useCallback((mode: 'edit' | 'view' | 'print') => {
    dispatch({ type: 'SET_MODE', payload: mode })
  }, [])

  const actions = {
    updateSection,
    updateField,
    setCurrentSection,
    saveAssessment,
    validateSection,
    validateAll,
    exportData,
    resetForm,
    setMode,
    calculateBasicSectionProgress
  }

  return (
    <AssessmentContext.Provider value={{ state, actions }}>
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment() {
  const context = useContext(AssessmentContext)
  if (!context) throw new Error('useAssessment must be used within an AssessmentProvider')
  return context
}