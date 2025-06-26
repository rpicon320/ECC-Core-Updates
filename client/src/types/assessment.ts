// Core TypeScript interfaces for the assessment system
export interface AuditEntry {
  id: string
  timestamp: Date
  userId: string
  action: 'create' | 'update' | 'delete' | 'submit' | 'save'
  section?: string
  field?: string
  oldValue?: unknown
  newValue?: unknown
  description: string
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface SectionData {
  isComplete: boolean
  isValid: boolean
  lastUpdated: Date
  data: Record<string, unknown>
  validationErrors: ValidationError[]
  completionPercentage?: number
}

export type SectionKey = 
  | 'basic' 
  | 'medical' 
  | 'health_symptoms'
  | 'functional' 
  | 'cognitive' 
  | 'slums'
  | 'mental' 
  | 'safety' 
  | 'directives' 
  | 'psychosocial' 
  | 'hobbies' 
  | 'providers' 
  | 'care_plan'
  | 'services' 
  | 'summary'

export interface AssessmentData {
  id: string
  version: number
  lastModified: Date
  sections: Record<SectionKey, SectionData>
  status: 'draft' | 'complete'
  audit: AuditEntry[]
  clientId: string
  createdBy: string
  completedBy?: string
  reviewedBy?: string
  metadata: {
    autoSaveEnabled: boolean
    lastAutoSave?: Date
    totalTimeSpent: number
    sessionStartTime: Date
    completionPercentage?: number
  }
}

export interface AssessmentFormState {
  data: AssessmentData
  currentSection: SectionKey
  isLoading: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean
  validationErrors: Record<string, ValidationError[]>
  mode: 'edit' | 'view' | 'print'
}

export interface AssessmentContextType {
  state: AssessmentFormState
  actions: {
    updateSection: (section: SectionKey, data: Partial<SectionData>) => void
    updateField: (section: SectionKey, field: string, value: unknown) => void
    setCurrentSection: (section: SectionKey) => void
    saveAssessment: (status?: 'draft' | 'complete') => Promise<void>
    validateSection: (section: SectionKey) => ValidationError[]
    validateAll: () => Record<string, ValidationError[]>
    exportData: (format: 'json' | 'pdf' | 'print') => void
    resetForm: () => void
    setMode: (mode: 'edit' | 'view' | 'print') => void
    calculateBasicSectionProgress: () => number
  }
}