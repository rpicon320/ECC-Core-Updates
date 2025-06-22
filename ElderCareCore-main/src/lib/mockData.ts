// Mock data for Phase 1 - local state management
export interface User {
  id: string
  firebase_uid?: string // Firebase Auth UID
  email: string
  password?: string // Only used for creation, not stored in Firestore
  full_name: string
  role: 'admin' | 'care_manager'
  title: string | null
  phone: string | null
  signature_url: string | null
  created_at: string
  updated_at: string
  created_by?: string // Who created this user (for admin tracking)
  is_active: boolean
  email_verified: boolean // Email verification status
  verification_token?: string // For email verification
}

export interface ClientUser {
  id: string
  email: string
  password: string
  full_name: string
  role: 'client'
  client_id: string // Links to Client record
  created_at: string
  updated_at: string
  is_active: boolean
  last_login?: string
  access_code?: string // Admin-generated access code for authentication
  access_code_expires?: string // Expiration date for access code
  email_verified: boolean // Email verification status
  verification_token?: string // For email verification
  verification_sent_at?: string // When verification email was sent
}

export interface Client {
  id: string
  first_name: string
  last_name: string
  preferred_name: string | null
  date_of_birth: string
  age?: number // auto-calculated
  gender?: 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say'
  marital_status?: 'Single' | 'Married' | 'Widowed' | 'Divorced' | 'Separated'
  religion?: string
  primary_language?: string
  veteran_status?: boolean
  living_arrangement?: 'Alone' | 'With spouse' | 'With family' | 'Assisted Living' | 'Memory Care' | 'Nursing Facility'
  mobility_status?: 'Independent' | 'Cane' | 'Walker' | 'Wheelchair' | 'Bedbound'
  
  // Contact Information
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  phone: string | null // Home phone
  cell_phone?: string | null
  email: string | null
  
  // Point of Contact (POC)
  poc_full_name?: string
  poc_relationship?: string
  poc_poa_type?: 'Medical' | 'Financial' | 'Both' | 'None'
  poc_phone_home?: string
  poc_phone_cell?: string
  poc_phone_work?: string
  poc_email?: string
  
  // Assessment Meta-Info
  initial_contact_date?: string
  assessment_date?: string
  
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  
  // Client portal access
  has_portal_access: boolean
  portal_user_id?: string // Links to ClientUser
  access_code?: string // Admin-generated access code
  access_code_expires?: string // Expiration date for access code
}

export interface Assessment {
  id: string
  client_id: string
  created_by: string
  status: 'draft' | 'completed'
  created_at: string
  updated_at: string
  
  // Section 2: Medical History
  // Consultation Reasons (Multi-select)
  consultation_reasons?: string[]
  consultation_reasons_other?: string
  
  // Allergies - New table format
  allergies?: Array<{
    allergen_name: string
    reaction: string
    severity: string
    notes: string
  }>
  
  // Surgical History - New table format
  surgical_history?: Array<{
    surgery_type: string
    date: string
    details: string
  }>
  
  // Medical Conditions (Yes/No + Comments) - Removed allergies
  medical_heart_disease?: boolean
  medical_heart_disease_comment?: string
  medical_high_blood_pressure?: boolean
  medical_high_blood_pressure_comment?: string
  medical_stroke?: boolean
  medical_stroke_comment?: string
  medical_lung_disease?: boolean
  medical_lung_disease_comment?: string
  medical_diabetes?: boolean
  medical_diabetes_comment?: string
  medical_renal_disease?: boolean
  medical_renal_disease_comment?: string
  medical_cancer?: boolean
  medical_cancer_comment?: string
  medical_arthritis?: boolean
  medical_arthritis_comment?: string
  medical_vision_impairment?: boolean
  medical_vision_impairment_comment?: string
  medical_hearing_impairment?: boolean
  medical_hearing_impairment_comment?: string
  medical_history_of_falls?: boolean
  medical_history_of_falls_comment?: string
  medical_wounds_skin_breakdown?: boolean
  medical_wounds_skin_breakdown_comment?: string
  medical_alcohol_use?: boolean
  medical_alcohol_use_comment?: string
  medical_smoking?: boolean
  medical_smoking_comment?: string
  medical_other?: boolean
  medical_other_comment?: string
  
  // Vaccinations - Updated with date fields
  vaccination_flu?: boolean
  vaccination_flu_date?: string
  vaccination_pneumonia?: boolean
  vaccination_pneumonia_date?: string
  vaccination_covid?: boolean
  vaccination_covid_date?: string
  
  // Additional Fields
  primary_care_physician_name?: string
  primary_care_physician_phone?: string
  dnr_status?: boolean
  advance_directive?: boolean
  advance_directive_file?: string // File name for uploaded document
  fall_history_6_months?: boolean
  fall_history_count?: number
  hospitalizations_12_months?: boolean
  hospitalizations_explanation?: string
  
  // Current Medications Table
  current_medications?: Array<{
    medication_name: string
    dose: string
    frequency: string
    prescribed_for: string
    prescribed_by: string
  }>
  
  // Section 3: Functional Assessment
  // Activities of Daily Living (ADLs) - 0-2 point scale
  functional_adl_bathing?: number
  functional_adl_bathing_comment?: string
  functional_adl_dressing?: number
  functional_adl_dressing_comment?: string
  functional_adl_toileting?: number
  functional_adl_toileting_comment?: string
  functional_adl_transferring?: number
  functional_adl_transferring_comment?: string
  functional_adl_continence?: number
  functional_adl_continence_comment?: string
  functional_adl_feeding?: number
  functional_adl_feeding_comment?: string
  functional_adl_total_score?: number
  
  // Instrumental Activities of Daily Living (IADLs) - 0-2 point scale
  functional_iadl_phone?: number
  functional_iadl_phone_comment?: string
  functional_iadl_shopping?: number
  functional_iadl_shopping_comment?: string
  functional_iadl_food_prep?: number
  functional_iadl_food_prep_comment?: string
  functional_iadl_housekeeping?: number
  functional_iadl_housekeeping_comment?: string
  functional_iadl_laundry?: number
  functional_iadl_laundry_comment?: string
  functional_iadl_transportation?: number
  functional_iadl_transportation_comment?: string
  functional_iadl_medications?: number
  functional_iadl_medications_comment?: string
  functional_iadl_finances?: number
  functional_iadl_finances_comment?: string
  functional_iadl_total_score?: number
  
  // Equipment and Additional Functional Information
  functional_equipment?: string[] // Array of equipment used
  functional_nutrition_notes?: string
  functional_notes?: string
  
  // Section 4: SLUMS Cognitive Assessment (Official Version)
  cognitive_education_level?: 'High School Graduate' | 'Less than High School'
  
  // SLUMS Q1: What day of the week is it? (1 point)
  slums_q1_day_answer?: string
  slums_q1_score?: number
  
  // SLUMS Q2: What is the year? (1 point)
  slums_q2_year_answer?: string
  slums_q2_score?: number
  
  // SLUMS Q3: What state are we in? (1 point)
  slums_q3_state_answer?: string
  slums_q3_score?: number
  
  // SLUMS Q4: Remember five objects (registration only)
  // No scoring for this question
  
  // SLUMS Q5: Math questions (3 points total)
  slums_q5_spent_answer?: string
  slums_q5_spent_score?: number // 1 point
  slums_q5_left_answer?: string
  slums_q5_left_score?: number // 2 points
  slums_q5_score?: number // total for Q5
  
  // SLUMS Q6: Name animals (3 points)
  slums_q6_animals_count?: number
  slums_q6_animals_list?: string
  slums_q6_score?: number
  
  // SLUMS Q7: Recall five objects (5 points)
  slums_q7_objects_recalled?: string[]
  slums_q7_score?: number
  
  // SLUMS Q8: Numbers backward (3 points total)
  slums_q8_87_answer?: string // 0 points
  slums_q8_649_answer?: string
  slums_q8_649_correct?: boolean // 1 point
  slums_q8_8537_answer?: string
  slums_q8_8537_correct?: boolean // 2 points
  slums_q8_score?: number
  
  // SLUMS Q9: Clock drawing (4 points)
  slums_q9_clock_drawing?: string // base64 image
  slums_q9_score?: number
  
  // SLUMS Q10: Visual task (2 points total)
  slums_q10_triangle_drawing?: string // base64 image for X in triangle
  slums_q10_x_correct?: boolean // 1 point
  slums_q10_largest_answer?: string
  slums_q10_largest_correct?: boolean // 1 point
  slums_q10_score?: number
  
  // SLUMS Q11: Story recall (8 points total)
  slums_q11_name_answer?: string
  slums_q11_name_score?: number // 2 points
  slums_q11_work_answer?: string
  slums_q11_work_score?: number // 2 points
  slums_q11_when_answer?: string
  slums_q11_when_score?: number // 2 points
  slums_q11_state_answer?: string
  slums_q11_state_score?: number // 2 points
  slums_q11_score?: number
  
  // SLUMS Total Score and Interpretation
  cognitive_slums_total_score?: number
  cognitive_slums_interpretation?: string
  cognitive_notes?: string
  
  // Section 5: GDS-15 Depression Scale
  mental_health_gds_responses?: boolean[] // 15 responses
  mental_health_gds_score?: number
  mental_health_gds_interpretation?: string
  mental_health_mood_description?: string
  mental_health_anxiety_level?: 'None' | 'Mild' | 'Moderate' | 'Severe'
  mental_health_depression_symptoms?: string[]
  mental_health_coping_strategies?: string[]
  mental_health_professional_support?: boolean
  mental_health_medication?: string[]
  mental_health_notes?: string
  
  // Section 6: Cognition (Detailed)
  cognition_managing_money?: string
  cognition_managing_medications?: string
  cognition_driving?: string
  cognition_concerns?: string[]
  cognition_notes?: string
  
  // Section 7: Informal Depression Indicators
  informal_depression_behaviors?: string[]
  informal_depression_notes?: string
  
  // Section 8: Home Safety
  home_safety_risk_areas?: string[]
  home_safety_photos?: string[] // base64 images
  home_safety_recommendations?: string
  home_safety_notes?: string
  
  // Section 9: Advance Directives
  advance_directives_poa?: boolean
  advance_directives_poa_first_name?: string
  advance_directives_poa_last_name?: string
  advance_directives_poa_phone?: string
  advance_directives_poa_email?: string
  advance_directives_mpoa?: boolean
  advance_directives_mpoa_first_name?: string
  advance_directives_mpoa_last_name?: string
  advance_directives_mpoa_phone?: string
  advance_directives_mpoa_email?: string
  advance_directives_documents?: string[] // file paths or base64
  
  // Section 10: Psychosocial
  psychosocial_miracle_question?: string
  psychosocial_goal_1?: string
  psychosocial_goal_2?: string
  psychosocial_goal_3?: string
  psychosocial_risk_level?: 'Low' | 'Moderate' | 'High' | 'Critical'
  
  // Section 11: Hobbies & Interests
  hobbies_activities?: string[]
  hobbies_reengagement_opportunities?: string[]
  hobbies_additional?: string
  
  // Section 12: Care Provider Directory
  care_providers?: Array<{
    name: string
    type: string
    phone: string
    notes: string
  }>
  
  // Section 13: Care Management Services Requested
  care_services_requested?: string[]
  care_services_priority?: 'Low' | 'Moderate' | 'High'
  care_services_notes?: string
  
  // Section 14: Final Summary & Signatures
  final_summary?: string
  care_manager_name?: string
  care_manager_role?: string
  signature_data?: string // base64 image
  signature_date?: string
  
  // Assessment Completion
  assessment_completed_by?: string
  assessment_completion_date?: string
  assessment_review_date?: string
  assessment_signatures?: Array<{
    name: string
    title: string
    signature: string // base64 image
    date: string
  }>
}

// Generate access code
const generateAccessCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate verification token
const generateVerificationToken = (): string => {
  return Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15)
}

// Initial mock users (admin and care managers only) - passwords will be handled by Firebase Auth
export const mockUsers: User[] = []

// Initial mock client users (separate from staff) - removed for secure access
export const mockClientUsers: ClientUser[] = []

// Initial mock clients (updated with access codes)
export const mockClients: Client[] = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Smith',
    preferred_name: null,
    date_of_birth: '1945-03-15',
    age: 79,
    gender: 'Male',
    marital_status: 'Widowed',
    religion: 'Catholic',
    primary_language: 'English',
    veteran_status: true,
    living_arrangement: 'Alone',
    mobility_status: 'Walker',
    phone: '(555) 345-6789',
    cell_phone: '(555) 345-6790',
    email: 'john.smith@email.com',
    address_line1: '123 Main Street',
    address_line2: 'Apt 2B',
    city: 'Springfield',
    state: 'CA',
    zip_code: '90210',
    poc_full_name: 'Sarah Smith',
    poc_relationship: 'Daughter',
    poc_poa_type: 'Both',
    poc_phone_home: '(555) 567-8901',
    poc_phone_cell: '(555) 567-8902',
    poc_email: 'sarah.smith@email.com',
    initial_contact_date: '2024-01-15',
    assessment_date: '2024-01-20',
    notes: 'Prefers morning appointments. Has mobility issues.',
    created_by: 'admin-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    has_portal_access: false,
    access_code: generateAccessCode(),
    access_code_expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
  },
  {
    id: '2',
    first_name: 'Mary',
    last_name: 'Johnson',
    preferred_name: 'Mae',
    date_of_birth: '1938-07-22',
    age: 86,
    gender: 'Female',
    marital_status: 'Widowed',
    religion: 'Methodist',
    primary_language: 'English',
    veteran_status: false,
    living_arrangement: 'With family',
    mobility_status: 'Independent',
    phone: '(555) 456-7890',
    email: 'mae.johnson@email.com',
    address_line1: '456 Oak Avenue',
    address_line2: null,
    city: 'Springfield',
    state: 'CA',
    zip_code: '90211',
    poc_full_name: 'Robert Johnson',
    poc_relationship: 'Son',
    poc_poa_type: 'Medical',
    poc_phone_cell: '(555) 567-8901',
    poc_email: 'robert.johnson@email.com',
    initial_contact_date: '2024-01-10',
    assessment_date: '2024-01-18',
    notes: 'Family contact: daughter Sarah (555) 567-8901',
    created_by: 'admin-user-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    has_portal_access: false,
    access_code: generateAccessCode(),
    access_code_expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
  }
]

// Initial mock assessments
export const mockAssessments: Assessment[] = [
  {
    id: '1',
    client_id: '1',
    created_by: 'admin-user-id',
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    cognitive_notes: 'Initial cognitive assessment in progress',
    mental_health_gds_responses: new Array(15).fill(false),
    consultation_reasons: [],
    current_medications: [],
    allergies: [],
    surgical_history: [],
    functional_equipment: [],
  }
]