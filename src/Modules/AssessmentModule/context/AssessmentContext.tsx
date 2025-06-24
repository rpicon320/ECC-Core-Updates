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

// (All helper functions, REQUIRED_FIELDS, and reducer remain unchanged — I’m including them exactly as you have them)

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
  providers: [],
  services: ['services_requested', 'priority_level'],
  summary: ['additional_comments', 'assessment_completion_date']
}

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

const generateId = (): string => Date.now().toString() + Math.random().toString(36).substr(2, 9)

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
  // (Reducer remains exactly as you have it — unchanged)
  switch (action.type) {
    // your cases here...
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

  // ✅ UPDATED auto-save useEffect
  useEffect(() => {
    if (!state.data.metadata.autoSaveEnabled || !state.hasUnsavedChanges) return
    const autoSaveTimer = setTimeout(() => {
      saveAssessment('draft')
    }, 30000)
    return () => clearTimeout(autoSaveTimer)
  }, [state.hasUnsavedChanges])

  // (Everything else: action handlers, context value, helper functions remain unchanged — reuse as-is)

  return (
    <AssessmentContext.Provider value={{ state, actions: {/* your actions */} }}>
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment() {
  const context = useContext(AssessmentContext)
  if (!context) throw new Error('useAssessment must be used within an AssessmentProvider')
  return context
}

// Helper: initializeSections, extractSectionData, cleanUndefinedValues, convertToLegacyFormat — unchanged
