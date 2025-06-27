import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth'
import { db, auth } from './firebase'
import { User, ClientUser, Client, Assessment } from './mockData'
import { sendVerificationEmail, generateVerificationLink, isValidStaffEmailDomain } from './emailService'

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  CLIENT_USERS: 'client_users',
  CLIENTS: 'clients',
  ASSESSMENTS: 'assessments',
  CARE_PLAN_TEMPLATES: 'care_plan_templates',
  CARE_PLAN_CATEGORIES: 'care_plan_categories',
  MEDICAL_DIAGNOSES: 'medical_diagnoses',
  MEDICAL_DIAGNOSIS_CATEGORIES: 'medical_diagnosis_categories',
  MEDICATIONS: 'medications'
} as const

// Generate unique ID (Firestore will auto-generate, but keeping for compatibility)
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Generate access code
export const generateAccessCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate verification token
export const generateVerificationToken = (): string => {
  return Math.random().toString(36).substr(2, 15) + Math.random().toString(36).substr(2, 15)
}

// Error handling wrapper
const handleFirestoreError = (error: any, operation: string) => {
  console.error(`Firestore ${operation} error:`, error)
  
  // For demo purposes, don't throw errors - just log them and continue
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Continuing despite Firestore error in ${operation}`)
    return
  }
  
  throw new Error(`Failed to ${operation}: ${error.message}`)
}

// Convert Firestore timestamp to ISO string
const convertTimestamp = (timestamp: any): string => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toISOString()
  }
  return timestamp || new Date().toISOString()
}

// Convert data for Firestore (replace Date objects with serverTimestamp)
const prepareForFirestore = (data: any) => {
  const prepared = { ...data }
  
  // Convert date strings to Firestore timestamps for new documents
  if (prepared.created_at && typeof prepared.created_at === 'string') {
    prepared.created_at = serverTimestamp()
  }
  if (prepared.updated_at && typeof prepared.updated_at === 'string') {
    prepared.updated_at = serverTimestamp()
  }
  
  return prepared
}

// Convert data from Firestore (convert timestamps to ISO strings)
const convertFromFirestore = (doc: any) => {
  const data = doc.data()
  return {
    id: doc.id,
    ...data,
    created_at: convertTimestamp(data.created_at),
    updated_at: convertTimestamp(data.updated_at)
  }
}

// ============================================================================
// FIREBASE AUTH INTEGRATION
// ============================================================================

export const createFirebaseUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    handleFirestoreError(error, 'create Firebase user')
    throw error
  }
}

export const signInFirebaseUser = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    handleFirestoreError(error, 'sign in Firebase user')
    throw error
  }
}

export const signOutFirebaseUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    handleFirestoreError(error, 'sign out Firebase user')
  }
}

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

export const verifyEmail = async (token: string, userType: 'staff' | 'client'): Promise<boolean> => {
  try {
    const collectionName = userType === 'staff' ? COLLECTIONS.USERS : COLLECTIONS.CLIENT_USERS
    const usersRef = collection(db, collectionName)
    const q = query(usersRef, where('verification_token', '==', token))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0]
      await updateDoc(userDoc.ref, {
        email_verified: true,
        verification_token: null,
        updated_at: serverTimestamp()
      })
      return true
    }
    
    return false
  } catch (error) {
    handleFirestoreError(error, 'verify email')
    return false
  }
}

export const resendVerificationEmail = async (userId: string, userType: 'staff' | 'client'): Promise<boolean> => {
  try {
    const collectionName = userType === 'staff' ? COLLECTIONS.USERS : COLLECTIONS.CLIENT_USERS
    const userRef = doc(db, collectionName, userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      const userData = convertFromFirestore(userDoc) as User | ClientUser
      
      if (userData.email_verified) {
        throw new Error('Email is already verified')
      }
      
      const newToken = generateVerificationToken()
      const verificationLink = generateVerificationLink(newToken, userType)
      
      // Update user with new token
      await updateDoc(userRef, {
        verification_token: newToken,
        verification_sent_at: serverTimestamp()
      })
      
      // Send verification email
      const emailSent = await sendVerificationEmail({
        to_email: userData.email,
        to_name: userData.full_name,
        verification_link: verificationLink,
        user_type: userType
      })
      
      return emailSent
    }
    
    return false
  } catch (error) {
    handleFirestoreError(error, 'resend verification email')
    return false
  }
}

// ============================================================================
// STAFF USER MANAGEMENT (Admin & Care Managers) - WITH FIREBASE AUTH
// ============================================================================

export const getUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS)
    const snapshot = await getDocs(usersRef)
    
    return snapshot.docs.map(doc => convertFromFirestore(doc) as User)
  } catch (error) {
    handleFirestoreError(error, 'fetch users')
    // Return demo users if Firestore fails
    return [
      {
        id: 'demo-admin',
        email: 'admin@eldercareva.com',
        full_name: 'Demo Admin',
        role: 'admin',
        title: 'Administrator',
        phone: '(555) 123-4567',
        signature_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        email_verified: true,
      },
      {
        id: 'demo-manager',
        email: 'manager@eldercareva.com',
        full_name: 'Demo Care Manager',
        role: 'care_manager',
        title: 'RN, Care Manager',
        phone: '(555) 234-5678',
        signature_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
        email_verified: true,
      }
    ]
  }
}

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return convertFromFirestore(userDoc) as User
    }
    return null
  } catch (error) {
    handleFirestoreError(error, 'fetch user')
    return null
  }
}

export const getUserByFirebaseUid = async (firebaseUid: string): Promise<User | null> => {
  try {
    const usersRef = collection(db, COLLECTIONS.USERS)
    const q = query(usersRef, where('firebase_uid', '==', firebaseUid))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      return convertFromFirestore(snapshot.docs[0]) as User
    }
    return null
  } catch (error) {
    handleFirestoreError(error, 'fetch user by Firebase UID')
    return null
  }
}

export const createUser = async (userData: Omit<User, 'id'> & { password: string }): Promise<User> => {
  try {
    // Validate email domain for staff users
    if (!isValidStaffEmailDomain(userData.email)) {
      throw new Error('Staff users must have an @eldercareva.com email address')
    }
    
    const usersRef = collection(db, COLLECTIONS.USERS)
    
    const userDataWithoutPassword = {
      ...userData,
      email_verified: true, // For demo purposes, mark as verified
      verification_token: null,
      verification_sent_at: null
    }
    
    // Remove password from Firestore data (Firebase handles auth)
    const { password, ...firestoreData } = userDataWithoutPassword
    
    const preparedData = prepareForFirestore(firestoreData)
    
    const docRef = await addDoc(usersRef, preparedData)
    const newDoc = await getDoc(docRef)
    const newUser = convertFromFirestore(newDoc) as User
    
    return newUser
  } catch (error) {
    handleFirestoreError(error, 'create user')
    throw error
  }
}

export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    // If email is being updated, validate domain
    if (updates.email && !isValidStaffEmailDomain(updates.email)) {
      throw new Error('Staff users must have an @eldercareva.com email address')
    }
    
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    let preparedUpdates = {
      ...updates,
      updated_at: serverTimestamp()
    }
    
    await updateDoc(userRef, preparedUpdates)
    console.log('User updated successfully:', userId)
  } catch (error) {
    handleFirestoreError(error, 'update user')
  }
}

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    await updateDoc(userRef, { is_active: false, updated_at: serverTimestamp() })
  } catch (error) {
    handleFirestoreError(error, 'deactivate user')
  }
}

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    // For demo purposes, check against demo credentials
    if (email === 'admin@eldercareva.com' && password === 'admin123') {
      const users = await getUsers()
      return users.find(u => u.role === 'admin') || null
    }
    
    if (email === 'manager@eldercareva.com' && password === 'manager123') {
      const users = await getUsers()
      return users.find(u => u.role === 'care_manager') || null
    }
    
    return null
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// ============================================================================
// CLIENT AUTHENTICATION (Secure Access Code System)
// ============================================================================

export const authenticateClientWithAccessCode = async (
  firstName: string, 
  lastName: string, 
  dateOfBirth: string, 
  accessCode: string
): Promise<Client | null> => {
  try {
    const clientsRef = collection(db, COLLECTIONS.CLIENTS)
    const q = query(
      clientsRef, 
      where('first_name', '==', firstName),
      where('last_name', '==', lastName),
      where('date_of_birth', '==', dateOfBirth),
      where('access_code', '==', accessCode.toUpperCase())
    )
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const clientDoc = snapshot.docs[0]
      const clientData = convertFromFirestore(clientDoc) as Client
      
      // Check if access code is still valid
      if (clientData.access_code_expires) {
        const expirationDate = new Date(clientData.access_code_expires)
        if (expirationDate < new Date()) {
          return null // Access code expired
        }
      }
      
      return clientData
    }
    
    return null
  } catch (error) {
    handleFirestoreError(error, 'authenticate client with access code')
    return null
  }
}

// ============================================================================
// CLIENT USER MANAGEMENT (Client Portal Users) - WITH EMAIL VERIFICATION
// ============================================================================

export const getClientUsers = async (): Promise<ClientUser[]> => {
  try {
    const clientUsersRef = collection(db, COLLECTIONS.CLIENT_USERS)
    const snapshot = await getDocs(clientUsersRef)
    
    return snapshot.docs.map(doc => convertFromFirestore(doc) as ClientUser)
  } catch (error) {
    handleFirestoreError(error, 'fetch client users')
    return []
  }
}

export const getClientUserById = async (userId: string): Promise<ClientUser | null> => {
  try {
    const userRef = doc(db, COLLECTIONS.CLIENT_USERS, userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return convertFromFirestore(userDoc) as ClientUser
    }
    return null
  } catch (error) {
    handleFirestoreError(error, 'fetch client user')
    return null
  }
}

export const createClientUser = async (userData: Omit<ClientUser, 'id'>): Promise<ClientUser> => {
  try {
    const clientUsersRef = collection(db, COLLECTIONS.CLIENT_USERS)
    
    // Generate verification token
    const verificationToken = generateVerificationToken()
    const verificationLink = generateVerificationLink(verificationToken, 'client')
    
    const userDataWithVerification = {
      ...userData,
      email_verified: false,
      verification_token: verificationToken,
      verification_sent_at: new Date().toISOString()
    }
    
    const preparedData = prepareForFirestore(userDataWithVerification)
    
    const docRef = await addDoc(clientUsersRef, preparedData)
    const newDoc = await getDoc(docRef)
    const newUser = convertFromFirestore(newDoc) as ClientUser
    
    // Send verification email
    try {
      await sendVerificationEmail({
        to_email: userData.email,
        to_name: userData.full_name,
        verification_link: verificationLink,
        user_type: 'client'
      })
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail user creation if email fails, but log it
    }
    
    return newUser
  } catch (error) {
    handleFirestoreError(error, 'create client user')
    throw error
  }
}

export const updateClientUser = async (userId: string, updates: Partial<ClientUser>): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.CLIENT_USERS, userId)
    let preparedUpdates = {
      ...updates,
      updated_at: serverTimestamp()
    }
    
    await updateDoc(userRef, preparedUpdates)
  } catch (error) {
    handleFirestoreError(error, 'update client user')
  }
}

export const authenticateClientUser = async (email: string, password: string): Promise<ClientUser | null> => {
  try {
    const clientUsersRef = collection(db, COLLECTIONS.CLIENT_USERS)
    const q = query(clientUsersRef, where('email', '==', email), where('is_active', '==', true))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0]
      const userData = convertFromFirestore(userDoc) as ClientUser
      
      if (userData.password === password) {
        // Check if email is verified
        if (!userData.email_verified) {
          throw new Error('Please verify your email address before signing in. Check your email for a verification link.')
        }
        
        // Update last login
        await updateClientUser(userData.id, { last_login: new Date().toISOString() })
        return userData
      }
    }
    
    return null
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    handleFirestoreError(error, 'authenticate client user')
    return null
  }
}

// ============================================================================
// UNIFIED AUTHENTICATION (Handles both staff and client users)
// ============================================================================

export const authenticateAnyUser = async (email: string, password: string): Promise<{ user: User | ClientUser; type: 'staff' | 'client' } | null> => {
  try {
    // Only try staff authentication for email/password
    const staffUser = await authenticateUser(email, password)
    if (staffUser) {
      return { user: staffUser, type: 'staff' }
    }
    
    return null
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    handleFirestoreError(error, 'authenticate any user')
    return null
  }
}

// ============================================================================
// CLIENT MANAGEMENT
// ============================================================================

export const getClients = async (userId?: string): Promise<Client[]> => {
  try {
    const clientsRef = collection(db, COLLECTIONS.CLIENTS)
    let q = query(clientsRef, orderBy('created_at', 'desc'))
    
    // Filter by user if provided (for non-admin users)
    if (userId) {
      q = query(clientsRef, where('created_by', '==', userId), orderBy('created_at', 'desc'))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => convertFromFirestore(doc) as Client)
  } catch (error) {
    handleFirestoreError(error, 'fetch clients')
    // Return demo clients if Firestore fails
    const { mockClients } = await import('./mockData')
    return mockClients
  }
}

export const getClientById = async (clientId: string): Promise<Client | null> => {
  try {
    const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId)
    const clientDoc = await getDoc(clientRef)
    
    if (clientDoc.exists()) {
      return convertFromFirestore(clientDoc) as Client
    }
    return null
  } catch (error) {
    handleFirestoreError(error, 'fetch client')
    return null
  }
}

export const getClientByUserId = async (userId: string): Promise<Client | null> => {
  try {
    const clientsRef = collection(db, COLLECTIONS.CLIENTS)
    const q = query(clientsRef, where('portal_user_id', '==', userId))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      return convertFromFirestore(snapshot.docs[0]) as Client
    }
    return null
  } catch (error) {
    handleFirestoreError(error, 'fetch client by user id')
    return null
  }
}

export const createClient = async (clientData: Omit<Client, 'id'>): Promise<Client> => {
  try {
    const clientsRef = collection(db, COLLECTIONS.CLIENTS)
    
    // Generate access code for new clients
    const dataWithAccessCode = {
      ...clientData,
      access_code: generateAccessCode(),
      access_code_expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
      has_portal_access: false
    }
    
    const preparedData = prepareForFirestore(dataWithAccessCode)
    
    const docRef = await addDoc(clientsRef, preparedData)
    const newDoc = await getDoc(docRef)
    
    console.log('Client created successfully:', docRef.id)
    return convertFromFirestore(newDoc) as Client
  } catch (error) {
    handleFirestoreError(error, 'create client')
    throw error
  }
}

export const updateClient = async (clientId: string, updates: Partial<Client>): Promise<void> => {
  try {
    const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId)
    const preparedUpdates = {
      ...updates,
      updated_at: serverTimestamp()
    }
    
    await updateDoc(clientRef, preparedUpdates)
    console.log('Client updated successfully:', clientId)
  } catch (error) {
    handleFirestoreError(error, 'update client')
  }
}

export const deleteClient = async (clientId: string): Promise<void> => {
  try {
    const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId)
    await deleteDoc(clientRef)
  } catch (error) {
    handleFirestoreError(error, 'delete client')
  }
}

export const generateNewAccessCode = async (clientId: string): Promise<string> => {
  try {
    const newAccessCode = generateAccessCode()
    const newExpiration = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
    
    await updateClient(clientId, {
      access_code: newAccessCode,
      access_code_expires: newExpiration
    })
    
    return newAccessCode
  } catch (error) {
    handleFirestoreError(error, 'generate new access code')
    throw error
  }
}

// ============================================================================
// INITIALIZE CLIENT DIRECTORY
// ============================================================================

export const initializeClientDirectory = async (): Promise<void> => {
  try {
    console.log('Initializing client directory in Firestore...')
    
    // Check if clients collection already has data
    const clientsRef = collection(db, COLLECTIONS.CLIENTS)
    const snapshot = await getDocs(query(clientsRef, limit(1)))
    
    if (!snapshot.empty) {
      console.log('Client directory already exists')
      return
    }
    
    // Import mock clients
    const { mockClients } = await import('./mockData')
    
    // Create clients in batches
    const batch = writeBatch(db)
    
    mockClients.forEach(clientData => {
      const docRef = doc(clientsRef)
      const preparedData = prepareForFirestore({
        ...clientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        access_code: generateAccessCode(),
        access_code_expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        has_portal_access: false
      })
      batch.set(docRef, preparedData)
    })
    
    await batch.commit()
    console.log('Client directory initialized successfully!')
    
  } catch (error) {
    console.error('Failed to initialize client directory:', error)
    handleFirestoreError(error, 'initialize client directory')
  }
}

// ============================================================================
// ASSESSMENT MANAGEMENT
// ============================================================================

export const getAssessments = async (userId?: string): Promise<Assessment[]> => {
  try {
    const assessmentsRef = collection(db, COLLECTIONS.ASSESSMENTS)
    let q = query(assessmentsRef, orderBy('created_at', 'desc'))
    
    // Filter by user if provided (for non-admin users)
    if (userId) {
      q = query(assessmentsRef, where('created_by', '==', userId), orderBy('created_at', 'desc'))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => convertFromFirestore(doc) as Assessment)
  } catch (error) {
    handleFirestoreError(error, 'fetch assessments')
    // Return demo assessments if Firestore fails
    const { mockAssessments } = await import('./mockData')
    return mockAssessments
  }
}

export const getAssessmentById = async (assessmentId: string): Promise<Assessment | null> => {
  try {
    const assessmentRef = doc(db, COLLECTIONS.ASSESSMENTS, assessmentId)
    const assessmentDoc = await getDoc(assessmentRef)
    
    if (assessmentDoc.exists()) {
      return convertFromFirestore(assessmentDoc) as Assessment
    }
    return null
  } catch (error) {
    handleFirestoreError(error, 'fetch assessment')
    return null
  }
}

export const getAssessmentsByClient = async (clientId: string): Promise<Assessment[]> => {
  try {
    const assessmentsRef = collection(db, COLLECTIONS.ASSESSMENTS)
    const q = query(
      assessmentsRef, 
      where('client_id', '==', clientId), 
      orderBy('created_at', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => convertFromFirestore(doc) as Assessment)
  } catch (error) {
    handleFirestoreError(error, 'fetch client assessments')
    return []
  }
}

export const createAssessment = async (assessmentData: Omit<Assessment, 'id'>): Promise<Assessment> => {
  try {
    const assessmentsRef = collection(db, COLLECTIONS.ASSESSMENTS)
    const preparedData = prepareForFirestore(assessmentData)
    
    const docRef = await addDoc(assessmentsRef, preparedData)
    const newDoc = await getDoc(docRef)
    
    console.log('Assessment created successfully:', docRef.id)
    return convertFromFirestore(newDoc) as Assessment
  } catch (error) {
    handleFirestoreError(error, 'create assessment')
    throw error
  }
}

export const updateAssessment = async (assessmentId: string, updates: Partial<Assessment>): Promise<void> => {
  try {
    const assessmentRef = doc(db, COLLECTIONS.ASSESSMENTS, assessmentId)
    const preparedUpdates = {
      ...updates,
      updated_at: serverTimestamp()
    }
    
    await updateDoc(assessmentRef, preparedUpdates)
    console.log('Assessment updated successfully:', assessmentId)
  } catch (error) {
    handleFirestoreError(error, 'update assessment')
  }
}

export const deleteAssessment = async (assessmentId: string): Promise<void> => {
  try {
    const assessmentRef = doc(db, COLLECTIONS.ASSESSMENTS, assessmentId)
    await deleteDoc(assessmentRef)
  } catch (error) {
    handleFirestoreError(error, 'delete assessment')
  }
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export const batchCreateUsers = async (users: (Omit<User, 'id'> & { password: string })[]): Promise<void> => {
  try {
    // Create users one by one since we need Firebase Auth
    for (const userData of users) {
      await createUser(userData)
    }
  } catch (error) {
    handleFirestoreError(error, 'batch create users')
  }
}

export const batchCreateClientUsers = async (clientUsers: Omit<ClientUser, 'id'>[]): Promise<void> => {
  try {
    const batch = writeBatch(db)
    const clientUsersRef = collection(db, COLLECTIONS.CLIENT_USERS)
    
    clientUsers.forEach(userData => {
      const docRef = doc(clientUsersRef)
      const preparedData = prepareForFirestore({
        ...userData,
        email_verified: false, // Require verification for client users
        verification_token: generateVerificationToken()
      })
      batch.set(docRef, preparedData)
    })
    
    await batch.commit()
  } catch (error) {
    handleFirestoreError(error, 'batch create client users')
  }
}

export const batchCreateClients = async (clients: Omit<Client, 'id'>[]): Promise<void> => {
  try {
    const batch = writeBatch(db)
    const clientsRef = collection(db, COLLECTIONS.CLIENTS)
    
    clients.forEach(clientData => {
      const docRef = doc(clientsRef)
      const preparedData = prepareForFirestore({
        ...clientData,
        access_code: generateAccessCode(),
        access_code_expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        has_portal_access: false
      })
      batch.set(docRef, preparedData)
    })
    
    await batch.commit()
    console.log('Batch created clients successfully')
  } catch (error) {
    handleFirestoreError(error, 'batch create clients')
  }
}

// ============================================================================
// INITIALIZATION AND MIGRATION
// ============================================================================

export const initializeFirestoreData = async (): Promise<void> => {
  try {
    // Check if data already exists
    const usersSnapshot = await getDocs(collection(db, COLLECTIONS.USERS))
    
    if (usersSnapshot.empty) {
      console.log('Initializing Firestore with demo data...')
      
      // Create demo users
      const demoUsers = [
        {
          email: 'admin@eldercareva.com',
          password: 'admin123',
          full_name: 'Admin User',
          role: 'admin' as const,
          title: 'Administrator',
          phone: '(555) 123-4567',
          signature_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          email_verified: true,
        },
        {
          email: 'manager@eldercareva.com',
          password: 'manager123',
          full_name: 'Care Manager',
          role: 'care_manager' as const,
          title: 'RN, Care Manager',
          phone: '(555) 234-5678',
          signature_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          email_verified: true,
        }
      ]
      
      // Create staff users
      await batchCreateUsers(demoUsers)
      
      // Initialize client directory
      await initializeClientDirectory()
      
      // Import mock data for assessments
      const { mockAssessments } = await import('./mockData')
      
      // Create assessments
      const batch = writeBatch(db)
      const assessmentsRef = collection(db, COLLECTIONS.ASSESSMENTS)
      
      mockAssessments.forEach(assessmentData => {
        const docRef = doc(assessmentsRef)
        const preparedData = prepareForFirestore({
          ...assessmentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        batch.set(docRef, preparedData)
      })
      
      await batch.commit()
      
      console.log('Firestore initialization complete!')
    } else {
      // Even if users exist, make sure client directory is initialized
      await initializeClientDirectory()
    }
  } catch (error) {
    console.error('Failed to initialize Firestore:', error)
    // Don't throw error - continue with demo mode
  }
}

// ============================================================================
// MIGRATION FROM LOCALSTORAGE
// ============================================================================

// Notification management
export interface Notification {
  id?: string;
  type: string;
  title: string;
  message: string;
  recipient_role?: string;
  recipient_id?: string;
  data?: any;
  created_by: string;
  created_at?: Date;
  status: 'pending' | 'approved' | 'rejected' | 'read';
  reviewed_by?: string;
  reviewed_at?: Date;
}

export const createNotification = async (notificationData: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> => {
  try {
    const notification: Notification = {
      ...notificationData,
      created_at: new Date(),
      id: generateId()
    };

    const notificationsCollection = collection(db, 'notifications');
    await addDoc(notificationsCollection, notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getNotifications = async (role?: string, userId?: string): Promise<Notification[]> => {
  try {
    const notificationsCollection = collection(db, 'notifications');
    let q = query(notificationsCollection, orderBy('created_at', 'desc'));
    
    if (role && role !== 'admin') {
      q = query(notificationsCollection, 
        where('recipient_id', '==', userId),
        orderBy('created_at', 'desc')
      );
    } else if (role === 'admin') {
      q = query(notificationsCollection,
        where('recipient_role', '==', 'admin'),
        orderBy('created_at', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate(),
      reviewed_at: doc.data().reviewed_at?.toDate()
    } as Notification));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

export const updateNotificationStatus = async (notificationId: string, status: string, reviewedBy?: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    const updateData: any = {
      status,
      reviewed_at: new Date()
    };
    
    if (reviewedBy) {
      updateData.reviewed_by = reviewedBy;
    }
    
    await updateDoc(notificationRef, updateData);
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

export const migrateFromLocalStorage = async (): Promise<void> => {
  try {
    // Check if localStorage has data
    const localUsers = localStorage.getItem('eldercare_users')
    const localClients = localStorage.getItem('eldercare_clients')
    const localAssessments = localStorage.getItem('eldercare_assessments')
    
    if (localUsers || localClients || localAssessments) {
      console.log('Migrating data from localStorage to Firestore...')
      
      // Migrate clients
      if (localClients) {
        const clients = JSON.parse(localClients) as Client[]
        await batchCreateClients(clients.map(client => ({
          ...client,
          created_at: client.created_at || new Date().toISOString(),
          updated_at: client.updated_at || new Date().toISOString(),
          has_portal_access: false, // Default to no portal access for migrated clients
          access_code: generateAccessCode(),
          access_code_expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        })))
      }
      
      // Migrate assessments
      if (localAssessments) {
        const assessments = JSON.parse(localAssessments) as Assessment[]
        const batch = writeBatch(db)
        const assessmentsRef = collection(db, COLLECTIONS.ASSESSMENTS)
        
        assessments.forEach(assessmentData => {
          const docRef = doc(assessmentsRef)
          const preparedData = prepareForFirestore({
            ...assessmentData,
            created_at: assessmentData.created_at || new Date().toISOString(),
            updated_at: assessmentData.updated_at || new Date().toISOString()
          })
          batch.set(docRef, preparedData)
        })
        
        await batch.commit()
      }
      
      // Clear localStorage after successful migration
      localStorage.removeItem('eldercare_users')
      localStorage.removeItem('eldercare_clients')
      localStorage.removeItem('eldercare_assessments')
      localStorage.removeItem('eldercare_current_user')
      
      console.log('Migration from localStorage complete!')
    }
  } catch (error) {
    console.error('Failed to migrate from localStorage:', error)
  }
}

// Care Plan Template Types
export interface Recommendation {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
}

export interface CarePlanTemplate {
  id?: string
  category: string
  concern: string
  goal: string
  barrier: string
  targetDate?: string
  isOngoing: boolean
  recommendations: Recommendation[]
  createdBy: string
  createdAt: Date
  lastModified: Date
}

// Care Plan Templates CRUD Operations
export const getCarePlanTemplates = async (): Promise<CarePlanTemplate[]> => {
  try {
    const templatesRef = collection(db, COLLECTIONS.CARE_PLAN_TEMPLATES)
    const q = query(templatesRef, orderBy('lastModified', 'desc'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date()
      } as CarePlanTemplate
    })
  } catch (error) {
    console.error('Error fetching care plan templates:', error)
    return []
  }
}

export const getCarePlanTemplateById = async (templateId: string): Promise<CarePlanTemplate | null> => {
  try {
    const templateRef = doc(db, COLLECTIONS.CARE_PLAN_TEMPLATES, templateId)
    const templateDoc = await getDoc(templateRef)
    
    if (templateDoc.exists()) {
      const data = templateDoc.data()
      return {
        id: templateDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date()
      } as CarePlanTemplate
    }
    
    return null
  } catch (error) {
    console.error('Error fetching care plan template:', error)
    return null
  }
}

export const createCarePlanTemplate = async (templateData: Omit<CarePlanTemplate, 'id'>): Promise<CarePlanTemplate> => {
  try {
    const templatesRef = collection(db, COLLECTIONS.CARE_PLAN_TEMPLATES)
    const preparedData = prepareForFirestore({
      ...templateData,
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp()
    })
    
    const docRef = await addDoc(templatesRef, preparedData)
    
    return {
      id: docRef.id,
      ...templateData
    } as CarePlanTemplate
  } catch (error) {
    console.error('Error creating care plan template:', error)
    throw error
  }
}

export const updateCarePlanTemplate = async (templateId: string, updates: Partial<CarePlanTemplate>): Promise<void> => {
  try {
    const templateRef = doc(db, COLLECTIONS.CARE_PLAN_TEMPLATES, templateId)
    
    // Check if document exists first
    const docSnap = await getDoc(templateRef)
    if (!docSnap.exists()) {
      console.error('Template document does not exist:', templateId)
      throw new Error('Template not found')
    }
    
    const preparedUpdates = prepareForFirestore({
      ...updates,
      lastModified: serverTimestamp()
    })
    
    await updateDoc(templateRef, preparedUpdates)
  } catch (error) {
    console.error('Error updating care plan template:', error)
    throw error
  }
}

export const deleteCarePlanTemplate = async (templateId: string): Promise<void> => {
  try {
    console.log('Attempting to delete template:', templateId)
    const templateRef = doc(db, COLLECTIONS.CARE_PLAN_TEMPLATES, templateId)
    
    // Check if document exists before trying to delete
    const docSnap = await getDoc(templateRef)
    if (!docSnap.exists()) {
      console.warn('Template document does not exist:', templateId)
      return // Don't throw error for non-existent docs
    }
    
    await deleteDoc(templateRef)
    console.log('Successfully deleted template:', templateId)
  } catch (error) {
    console.error('Error deleting care plan template:', templateId, error)
    throw error
  }
}

export const deleteAllCarePlanTemplates = async (): Promise<number> => {
  try {
    console.log('Starting bulk delete of all care plan templates...')
    
    // Get all templates first
    const templatesRef = collection(db, COLLECTIONS.CARE_PLAN_TEMPLATES)
    const querySnapshot = await getDocs(templatesRef)
    
    if (querySnapshot.empty) {
      console.log('No templates found to delete')
      return 0
    }
    
    console.log('Found templates to delete:', querySnapshot.size)
    
    // Use batch delete for better performance
    const batch = writeBatch(db)
    let deleteCount = 0
    
    querySnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
      deleteCount++
      console.log('Adding to batch delete:', doc.id)
    })
    
    // Commit the batch
    await batch.commit()
    console.log('Batch delete completed, deleted:', deleteCount)
    
    return deleteCount
  } catch (error) {
    console.error('Error in bulk delete operation:', error)
    throw error
  }
}

export const batchCreateCarePlanTemplates = async (templates: Omit<CarePlanTemplate, 'id'>[]): Promise<void> => {
  try {
    const batch = writeBatch(db)
    const templatesRef = collection(db, COLLECTIONS.CARE_PLAN_TEMPLATES)
    
    templates.forEach(templateData => {
      const docRef = doc(templatesRef)
      const preparedData = prepareForFirestore({
        ...templateData,
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp()
      })
      batch.set(docRef, preparedData)
    })
    
    await batch.commit()
  } catch (error) {
    console.error('Error batch creating care plan templates:', error)
    throw error
  }
}

// Care Plan Categories CRUD Operations
export const getCarePlanCategories = async (): Promise<string[]> => {
  try {
    const categoriesRef = collection(db, COLLECTIONS.CARE_PLAN_CATEGORIES)
    const querySnapshot = await getDocs(categoriesRef)
    
    if (querySnapshot.empty) {
      // Initialize with default categories if none exist
      const defaultCategories = [
        'Activities of daily living',
        'Behavioral/Emotional',
        'Care coordination',
        'Cognitive',
        'Daily habits and routines',
        'Environmental safety',
        'Family/Caregiver support',
        'Financial',
        'Legal',
        'Medical/health status',
        'Mobility and movement',
        'Nutrition and hydration',
        'Safety',
        'Social engagement',
        'Spirituality',
        'Transportation'
      ]
      
      await saveCarePlanCategories(defaultCategories)
      return defaultCategories
    }
    
    return querySnapshot.docs.map(doc => doc.data().name).sort()
  } catch (error) {
    console.error('Error fetching care plan categories:', error)
    return []
  }
}

export const saveCarePlanCategories = async (categories: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db)
    const categoriesRef = collection(db, COLLECTIONS.CARE_PLAN_CATEGORIES)
    
    // Clear existing categories
    const existingSnapshot = await getDocs(categoriesRef)
    existingSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    // Add new categories
    categories.forEach(category => {
      const docRef = doc(categoriesRef)
      batch.set(docRef, { name: category })
    })
    
    await batch.commit()
  } catch (error) {
    console.error('Error saving care plan categories:', error)
    throw error
  }
}

// ========== Medical Diagnosis Library ==========

export interface MedicalDiagnosis {
  id?: string
  code: string
  name: string
  category: string
  description?: string
  commonSymptoms?: string[]
  riskFactors?: string[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  lastModified: Date
}

export const getMedicalDiagnoses = async (): Promise<MedicalDiagnosis[]> => {
  try {
    const diagnosesRef = collection(db, COLLECTIONS.MEDICAL_DIAGNOSES)
    const querySnapshot = await getDocs(diagnosesRef)
    
    return querySnapshot.docs
      .map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          code: data.code || '',
          name: data.name || '',
          category: data.category || '',
          description: data.description || '',
          commonSymptoms: data.commonSymptoms || [],
          riskFactors: data.riskFactors || [],
          isActive: data.isActive ?? true,
          createdBy: data.createdBy || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          lastModified: data.lastModified?.toDate() || new Date()
        }
      })
      .filter(diagnosis => diagnosis.isActive)
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Error fetching medical diagnoses:', error)
    throw error
  }
}

export const getMedicalDiagnosisById = async (diagnosisId: string): Promise<MedicalDiagnosis | null> => {
  try {
    const docRef = doc(db, COLLECTIONS.MEDICAL_DIAGNOSES, diagnosisId)
    const docSnapshot = await getDoc(docRef)
    
    if (!docSnapshot.exists()) {
      return null
    }
    
    const data = docSnapshot.data()
    return {
      id: docSnapshot.id,
      code: data.code || '',
      name: data.name || '',
      category: data.category || '',
      description: data.description || '',
      commonSymptoms: data.commonSymptoms || [],
      riskFactors: data.riskFactors || [],
      isActive: data.isActive ?? true,
      createdBy: data.createdBy || '',
      createdAt: data.createdAt?.toDate() || new Date(),
      lastModified: data.lastModified?.toDate() || new Date()
    }
  } catch (error) {
    console.error('Error fetching medical diagnosis:', error)
    throw error
  }
}

export const createMedicalDiagnosis = async (diagnosisData: Omit<MedicalDiagnosis, 'id'>): Promise<MedicalDiagnosis> => {
  try {
    const diagnosesRef = collection(db, COLLECTIONS.MEDICAL_DIAGNOSES)
    const docRef = await addDoc(diagnosesRef, {
      ...diagnosisData,
      createdAt: Timestamp.now(),
      lastModified: Timestamp.now()
    })
    
    const diagnosis: MedicalDiagnosis = {
      id: docRef.id,
      ...diagnosisData
    }
    
    return diagnosis
  } catch (error) {
    console.error('Error creating medical diagnosis:', error)
    throw error
  }
}

export const updateMedicalDiagnosis = async (diagnosisId: string, updates: Partial<MedicalDiagnosis>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.MEDICAL_DIAGNOSES, diagnosisId)
    const updateData = {
      ...updates,
      lastModified: Timestamp.now()
    }
    delete updateData.id
    delete updateData.createdAt
    
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating medical diagnosis:', error)
    throw error
  }
}

export const deleteMedicalDiagnosis = async (diagnosisId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTIONS.MEDICAL_DIAGNOSES, diagnosisId)
    await updateDoc(docRef, {
      isActive: false,
      lastModified: Timestamp.now()
    })
  } catch (error) {
    console.error('Error deleting medical diagnosis:', error)
    throw error
  }
}

export const batchCreateMedicalDiagnoses = async (diagnoses: Omit<MedicalDiagnosis, 'id'>[]): Promise<void> => {
  try {
    const batch = writeBatch(db)
    const diagnosesRef = collection(db, 'medical_diagnoses')
    
    diagnoses.forEach(diagnosis => {
      const docRef = doc(diagnosesRef)
      batch.set(docRef, {
        ...diagnosis,
        createdAt: Timestamp.now(),
        lastModified: Timestamp.now()
      })
    })
    
    await batch.commit()
  } catch (error) {
    console.error('Error batch creating medical diagnoses:', error)
    throw error
  }
}

export const getMedicalDiagnosisCategories = async (): Promise<string[]> => {
  try {
    const diagnosesRef = collection(db, 'medical_diagnoses')
    const q = query(diagnosesRef, where('isActive', '==', true))
    const querySnapshot = await getDocs(q)
    
    const categories = new Set<string>()
    querySnapshot.docs.forEach(doc => {
      const data = doc.data()
      if (data.category) {
        categories.add(data.category)
      }
    })
    
    return Array.from(categories).sort()
  } catch (error) {
    console.error('Error fetching medical diagnosis categories:', error)
    throw error
  }
}

export const initializeSampleMedicalDiagnoses = async (): Promise<void> => {
  try {
    // Check if we already have data
    const diagnosesRef = collection(db, 'medical_diagnoses')
    const querySnapshot = await getDocs(query(diagnosesRef, limit(1)))
    
    if (!querySnapshot.empty) {
      return // Data already exists
    }
    
    const sampleDiagnoses: Omit<MedicalDiagnosis, 'id'>[] = [
      {
        code: 'I10',
        name: 'Essential hypertension',
        category: 'Cardiovascular',
        description: 'High blood pressure with no known cause',
        commonSymptoms: ['Often asymptomatic', 'Headaches', 'Dizziness', 'Fatigue'],
        riskFactors: ['Age', 'Family history', 'Obesity', 'High sodium diet', 'Sedentary lifestyle'],
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        lastModified: new Date()
      },
      {
        code: 'E11.9',
        name: 'Type 2 diabetes mellitus without complications',
        category: 'Endocrine & Metabolic',
        description: 'Non-insulin dependent diabetes mellitus',
        commonSymptoms: ['Increased thirst', 'Frequent urination', 'Fatigue', 'Blurred vision', 'Slow healing wounds'],
        riskFactors: ['Age over 45', 'Overweight', 'Family history', 'Physical inactivity', 'Previous gestational diabetes'],
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        lastModified: new Date()
      },
      {
        code: 'E78.5',
        name: 'Hyperlipidemia, unspecified',
        category: 'Endocrine & Metabolic',
        description: 'Elevated levels of lipids in the blood',
        commonSymptoms: ['Usually asymptomatic', 'May cause chest pain if severe', 'Yellowish deposits around eyes'],
        riskFactors: ['Diet high in saturated fats', 'Lack of exercise', 'Genetics', 'Age', 'Diabetes'],
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        lastModified: new Date()
      },
      {
        code: 'J44.1',
        name: 'Chronic obstructive pulmonary disease with acute exacerbation',
        category: 'Respiratory',
        description: 'Progressive lung disease with acute worsening of symptoms',
        commonSymptoms: ['Shortness of breath', 'Chronic cough', 'Sputum production', 'Wheezing'],
        riskFactors: ['Smoking', 'Air pollution exposure', 'Occupational dust exposure', 'Age', 'Alpha-1 deficiency'],
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        lastModified: new Date()
      },
      {
        code: 'F32.9',
        name: 'Major depressive disorder, single episode, unspecified',
        category: 'Neurological & Mental Health',
        description: 'Single episode of major depression without specified severity',
        commonSymptoms: ['Persistent sadness', 'Loss of interest', 'Fatigue', 'Sleep disturbances', 'Appetite changes'],
        riskFactors: ['Family history', 'Trauma', 'Chronic illness', 'Substance abuse', 'Social isolation'],
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        lastModified: new Date()
      },
      {
        code: 'M79.2',
        name: 'Neuralgia and neuritis, unspecified',
        category: 'Musculoskeletal',
        description: 'Nerve pain and inflammation of unspecified cause',
        commonSymptoms: ['Sharp shooting pain', 'Burning sensation', 'Tingling', 'Numbness', 'Muscle weakness'],
        riskFactors: ['Age', 'Diabetes', 'Previous injury', 'Infection', 'Autoimmune conditions'],
        isActive: true,
        createdBy: 'system',
        createdAt: new Date(),
        lastModified: new Date()
      }
    ]
    
    await batchCreateMedicalDiagnoses(sampleDiagnoses)
    console.log('Sample medical diagnoses initialized')
  } catch (error) {
    console.error('Error initializing sample medical diagnoses:', error)
    throw error
  }
}

// Initialize Medical Diagnosis Database Collections
export const initializeMedicalDiagnosisDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing Medical Diagnosis Database...')
    
    // Initialize categories first
    await initializeMedicalDiagnosisCategories()
    
    // Initialize sample data if collections are empty
    await initializeSampleMedicalDiagnoses()
    
    console.log('Medical Diagnosis Database initialized successfully')
  } catch (error) {
    console.error('Error initializing Medical Diagnosis Database:', error)
    throw error
  }
}

// Initialize Medical Diagnosis Categories
export const initializeMedicalDiagnosisCategories = async (): Promise<void> => {
  try {
    const categoriesRef = collection(db, COLLECTIONS.MEDICAL_DIAGNOSIS_CATEGORIES)
    const querySnapshot = await getDocs(categoriesRef)
    
    if (querySnapshot.empty) {
      const defaultCategories = [
        'Cardiovascular',
        'Respiratory', 
        'Neurological',
        'Endocrine',
        'Gastrointestinal',
        'Musculoskeletal',
        'Mental Health',
        'Infectious Diseases',
        'Oncology',
        'Dermatological',
        'Genitourinary',
        'Hematological',
        'Ophthalmological',
        'ENT (Ear, Nose, Throat)',
        'Other'
      ]
      
      const batch = writeBatch(db)
      defaultCategories.forEach(category => {
        const docRef = doc(categoriesRef)
        batch.set(docRef, {
          name: category,
          isActive: true,
          createdAt: Timestamp.now(),
          lastModified: Timestamp.now()
        })
      })
      
      await batch.commit()
      console.log('Medical diagnosis categories initialized')
    }
  } catch (error) {
    console.error('Error initializing medical diagnosis categories:', error)
    throw error
  }
}

// ========== Medications Library ==========

export interface Medication {
  id?: string
  name: string
  doses: string[]
  frequencies: string[]
  usedFor?: string
  potentialSideEffects?: string
  description?: string
  isActive: boolean
  createdBy: string
  createdAt: Date
  lastModified: Date
}

export const getMedications = async (): Promise<Medication[]> => {
  try {
    const medicationsRef = collection(db, COLLECTIONS.MEDICATIONS)
    const q = query(medicationsRef, where('isActive', '==', true), orderBy('name'))
    const querySnapshot = await getDocs(q)
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name || '',
        doses: data.doses || [],
        frequencies: data.frequencies || [],
        usedFor: data.usedFor || '',
        potentialSideEffects: data.potentialSideEffects || '',
        description: data.description || '',
        isActive: data.isActive ?? true,
        createdBy: data.createdBy || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date()
      } as Medication
    })
  } catch (error) {
    console.error('Error fetching medications:', error)
    return []
  }
}

export const getMedicationById = async (medicationId: string): Promise<Medication | null> => {
  try {
    const medicationRef = doc(db, COLLECTIONS.MEDICATIONS, medicationId)
    const medicationDoc = await getDoc(medicationRef)
    
    if (medicationDoc.exists()) {
      const data = medicationDoc.data()
      return {
        id: medicationDoc.id,
        name: data.name || '',
        doses: data.doses || [],
        frequencies: data.frequencies || [],
        usedFor: data.usedFor || '',
        potentialSideEffects: data.potentialSideEffects || '',
        description: data.description || '',
        isActive: data.isActive ?? true,
        createdBy: data.createdBy || '',
        createdAt: data.createdAt?.toDate() || new Date(),
        lastModified: data.lastModified?.toDate() || new Date()
      } as Medication
    }
    
    return null
  } catch (error) {
    console.error('Error fetching medication:', error)
    return null
  }
}

export const createMedication = async (medicationData: Omit<Medication, 'id'>): Promise<Medication> => {
  try {
    const medicationsRef = collection(db, COLLECTIONS.MEDICATIONS)
    const preparedData = prepareForFirestore({
      ...medicationData,
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp()
    })
    
    const docRef = await addDoc(medicationsRef, preparedData)
    
    return {
      id: docRef.id,
      ...medicationData
    } as Medication
  } catch (error) {
    console.error('Error creating medication:', error)
    throw error
  }
}

export const updateMedication = async (medicationId: string, updates: Partial<Medication>): Promise<void> => {
  try {
    const medicationRef = doc(db, COLLECTIONS.MEDICATIONS, medicationId)
    
    // Check if document exists first
    const docSnap = await getDoc(medicationRef)
    if (!docSnap.exists()) {
      console.error('Medication document does not exist:', medicationId)
      throw new Error('Medication not found')
    }
    
    const preparedUpdates = prepareForFirestore({
      ...updates,
      lastModified: serverTimestamp()
    })
    
    await updateDoc(medicationRef, preparedUpdates)
  } catch (error) {
    console.error('Error updating medication:', error)
    throw error
  }
}

export const deleteMedication = async (medicationId: string): Promise<void> => {
  try {
    const medicationRef = doc(db, COLLECTIONS.MEDICATIONS, medicationId)
    
    // Check if document exists before trying to delete
    const docSnap = await getDoc(medicationRef)
    if (!docSnap.exists()) {
      console.warn('Medication document does not exist:', medicationId)
      return // Don't throw error for non-existent docs
    }
    
    // Soft delete by setting isActive to false
    await updateDoc(medicationRef, {
      isActive: false,
      lastModified: serverTimestamp()
    })
  } catch (error) {
    console.error('Error deleting medication:', medicationId, error)
    throw error
  }
}

export const batchCreateMedications = async (medications: Omit<Medication, 'id'>[]): Promise<void> => {
  try {
    const batch = writeBatch(db)
    const medicationsRef = collection(db, COLLECTIONS.MEDICATIONS)
    
    medications.forEach(medicationData => {
      const docRef = doc(medicationsRef)
      const preparedData = prepareForFirestore({
        ...medicationData,
        createdAt: serverTimestamp(),
        lastModified: serverTimestamp()
      })
      batch.set(docRef, preparedData)
    })
    
    await batch.commit()
  } catch (error) {
    console.error('Error batch creating medications:', error)
    throw error
  }
}

export const initializeSampleMedications = async (): Promise<void> => {
  try {
    const medicationsRef = collection(db, COLLECTIONS.MEDICATIONS)
    const existingMedications = await getDocs(medicationsRef)
    
    if (existingMedications.empty) {
      const sampleMedications: Omit<Medication, 'id'>[] = [
        {
          name: 'Lisinopril',
          doses: ['5mg', '10mg', '20mg'],
          frequencies: ['Once daily', 'Twice daily'],
          usedFor: 'High blood pressure, heart failure, and kidney protection in diabetes',
          potentialSideEffects: 'Dry cough, dizziness, hyperkalemia, angioedema (rare)',
          description: 'ACE inhibitor commonly used for cardiovascular protection and blood pressure management',
          isActive: true,
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date()
        },
        {
          name: 'Metformin',
          doses: ['500mg', '850mg', '1000mg'],
          frequencies: ['Once daily', 'Twice daily', 'Three times daily'],
          usedFor: 'Type 2 diabetes mellitus, prediabetes, PCOS',
          potentialSideEffects: 'Gastrointestinal upset, lactic acidosis (rare), vitamin B12 deficiency',
          description: 'First-line oral antidiabetic medication that improves insulin sensitivity',
          isActive: true,
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date()
        },
        {
          name: 'Atorvastatin',
          doses: ['10mg', '20mg', '40mg', '80mg'],
          frequencies: ['Once daily (evening)'],
          usedFor: 'High cholesterol, cardiovascular disease prevention',
          potentialSideEffects: 'Muscle pain, liver enzyme elevation, memory issues (rare)',
          description: 'HMG-CoA reductase inhibitor for cholesterol management and cardiovascular protection',
          isActive: true,
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date()
        },
        {
          name: 'Levothyroxine',
          doses: ['25mcg', '50mcg', '75mcg', '100mcg', '125mcg'],
          frequencies: ['Once daily (morning, empty stomach)'],
          usedFor: 'Hypothyroidism, thyroid hormone replacement',
          potentialSideEffects: 'Hyperthyroid symptoms if overdosed, cardiac palpitations, insomnia',
          description: 'Synthetic thyroid hormone replacement therapy for hypothyroidism',
          isActive: true,
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date()
        },
        {
          name: 'Omeprazole',
          doses: ['20mg', '40mg'],
          frequencies: ['Once daily', 'Twice daily'],
          usedFor: 'GERD, peptic ulcer disease, Zollinger-Ellison syndrome',
          potentialSideEffects: 'Headache, diarrhea, increased infection risk with long-term use',
          description: 'Proton pump inhibitor for acid suppression and gastric protection',
          isActive: true,
          createdBy: 'system',
          createdAt: new Date(),
          lastModified: new Date()
        }
      ]
      
      await batchCreateMedications(sampleMedications)
      console.log('Sample medications initialized')
    }
  } catch (error) {
    console.error('Error initializing sample medications:', error)
  }
}

export const initializeMedicationsDatabase = async (): Promise<void> => {
  try {
    console.log('Initializing Medications Database...')
    await initializeSampleMedications()
    console.log('Medications Database initialized successfully')
  } catch (error) {
    console.error('Error initializing medications database:', error)
  }
}

export const generateMedicationDescription = async (medicationData: {
  name: string
  usedFor: string
  doses?: string[]
  frequencies?: string[]
}): Promise<{ success: boolean; description?: string; error?: string }> => {
  try {
    const response = await fetch('/api/generate-medication-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medicationData),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to generate description')
    }

    return { success: true, description: result.description }
  } catch (error: any) {
    console.error('Error generating medication description:', error)
    
    let errorMessage = 'Failed to generate description'
    if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
      errorMessage = 'OpenAI API quota exceeded. Please check your billing at platform.openai.com'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return { success: false, error: errorMessage }
  }
}