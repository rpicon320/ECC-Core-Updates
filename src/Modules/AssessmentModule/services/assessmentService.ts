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
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import { Assessment } from '../../../lib/mockData'

// Collection name
const ASSESSMENTS_COLLECTION = 'assessments'

// Get all assessments, optionally filtered by user ID
export const getAssessments = async (userId?: string): Promise<Assessment[]> => {
  try {
    const assessmentsRef = collection(db, ASSESSMENTS_COLLECTION)
    let q = query(assessmentsRef, orderBy('created_at', 'desc'))
    
    // Filter by user if provided (for non-admin users)
    if (userId) {
      q = query(assessmentsRef, where('created_by', '==', userId), orderBy('created_at', 'desc'))
    }
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
    } as Assessment))
  } catch (error) {
    console.error('Error fetching assessments:', error)
    // Return demo assessments if Firestore fails
    const { mockAssessments } = await import('../../../lib/mockData')
    return mockAssessments
  }
}

// Get assessment by ID
export const getAssessmentById = async (assessmentId: string): Promise<Assessment | null> => {
  try {
    const assessmentRef = doc(db, ASSESSMENTS_COLLECTION, assessmentId)
    const assessmentDoc = await getDoc(assessmentRef)
    
    if (assessmentDoc.exists()) {
      const data = assessmentDoc.data()
      return {
        id: assessmentDoc.id,
        ...data,
        created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
        updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Assessment
    }
    return null
  } catch (error) {
    console.error('Error fetching assessment:', error)
    return null
  }
}

// Get assessments by client ID
export const getAssessmentsByClient = async (clientId: string): Promise<Assessment[]> => {
  try {
    const assessmentsRef = collection(db, ASSESSMENTS_COLLECTION)
    const q = query(
      assessmentsRef, 
      where('client_id', '==', clientId), 
      orderBy('created_at', 'desc')
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: doc.data().updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
    } as Assessment))
  } catch (error) {
    console.error('Error fetching client assessments:', error)
    return []
  }
}

// Create a new assessment
export const createAssessment = async (assessmentData: Omit<Assessment, 'id'>): Promise<Assessment> => {
  try {
    const assessmentsRef = collection(db, ASSESSMENTS_COLLECTION)
    
    // Convert date strings to Firestore timestamps
    const preparedData = {
      ...assessmentData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    }
    
    const docRef = await addDoc(assessmentsRef, preparedData)
    const newDoc = await getDoc(docRef)
    
    const data = newDoc.data() || {}
    
    console.log('Assessment created successfully:', docRef.id)
    return {
      id: docRef.id,
      ...data,
      created_at: data.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
      updated_at: data.updated_at?.toDate?.()?.toISOString() || new Date().toISOString()
    } as Assessment
  } catch (error) {
    console.error('Error creating assessment:', error)
    throw error
  }
}

// Update an existing assessment
export const updateAssessment = async (assessmentId: string, updates: Partial<Assessment>): Promise<void> => {
  try {
    const assessmentRef = doc(db, ASSESSMENTS_COLLECTION, assessmentId)
    
    // Add updated timestamp
    const preparedUpdates = {
      ...updates,
      updated_at: serverTimestamp()
    }
    
    await updateDoc(assessmentRef, preparedUpdates)
    console.log('Assessment updated successfully:', assessmentId)
  } catch (error) {
    console.error('Error updating assessment:', error)
    throw error
  }
}

// Delete an assessment
export const deleteAssessment = async (assessmentId: string): Promise<void> => {
  try {
    const assessmentRef = doc(db, ASSESSMENTS_COLLECTION, assessmentId)
    await deleteDoc(assessmentRef)
    console.log('Assessment deleted successfully:', assessmentId)
  } catch (error) {
    console.error('Error deleting assessment:', error)
    throw error
  }
}