import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { User, ClientUser, Client } from '../lib/mockData'
import { 
  getUserByFirebaseUid,
  getClientUserById,
  getClientByUserId,
  getClientById,
  updateUser,
  updateClientUser,
  authenticateAnyUser,
  authenticateClientWithAccessCode,
  initializeFirestoreData,
  migrateFromLocalStorage,
  signOutFirebaseUser,
  getUsers
} from '../lib/firestoreService'

interface AuthContextType {
  user: User | Client | null
  profile: User | Client | null
  userType: 'staff' | 'client' | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInClient: (firstName: string, lastName: string, dateOfBirth: string, accessCode: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User | Client>) => Promise<{ error: any }>
  isAdmin: () => boolean
  isCareManager: () => boolean
  isClient: () => boolean
  canAccessClients: () => boolean
  canAccessAssessments: () => boolean
  canAccessAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | Client | null>(null)
  const [userType, setUserType] = useState<'staff' | 'client' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Initialize Firestore data if needed
        await initializeFirestoreData()
        
        // Migrate from localStorage if needed
        await migrateFromLocalStorage()
        
        // Check for existing session first
        const savedUser = localStorage.getItem('eldercare_current_user')
        const savedUserType = localStorage.getItem('eldercare_user_type')
        
        if (savedUser && savedUserType) {
          try {
            const parsedUser = JSON.parse(savedUser)
            setUser(parsedUser)
            setUserType(savedUserType as 'staff' | 'client')
            console.log('Restored session for:', parsedUser.full_name)
            return
          } catch (error) {
            console.error('Error parsing saved user:', error)
            localStorage.removeItem('eldercare_current_user')
            localStorage.removeItem('eldercare_user_type')
          }
        }
        
        // If no saved session, try to get admin user for demo
        console.log('No saved session, attempting to get admin user for demo...')
        
        try {
          const users = await getUsers()
          const adminUser = users.find(u => u.role === 'admin' && u.is_active)
          
          if (adminUser) {
            setUser(adminUser)
            setUserType('staff')
            localStorage.setItem('eldercare_current_user', JSON.stringify(adminUser))
            localStorage.setItem('eldercare_user_type', 'staff')
            console.log('Auto-login successful:', adminUser.full_name)
          } else {
            console.log('No admin user found, creating demo user...')
            // Create a temporary demo user
            const demoUser: User = {
              id: 'demo-admin-' + Date.now(),
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
            }
            setUser(demoUser)
            setUserType('staff')
            localStorage.setItem('eldercare_current_user', JSON.stringify(demoUser))
            localStorage.setItem('eldercare_user_type', 'staff')
            console.log('Created demo user:', demoUser.full_name)
          }
        } catch (error) {
          console.error('Error during auto-login:', error)
          // Create a fallback demo user
          const fallbackUser: User = {
            id: 'fallback-admin-' + Date.now(),
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
          }
          setUser(fallbackUser)
          setUserType('staff')
          localStorage.setItem('eldercare_current_user', JSON.stringify(fallbackUser))
          localStorage.setItem('eldercare_user_type', 'staff')
          console.log('Created fallback user:', fallbackUser.full_name)
        }
        
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Even if initialization fails, create a demo user
        const emergencyUser: User = {
          id: 'emergency-admin-' + Date.now(),
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
        }
        setUser(emergencyUser)
        setUserType('staff')
        localStorage.setItem('eldercare_current_user', JSON.stringify(emergencyUser))
        localStorage.setItem('eldercare_user_type', 'staff')
        console.log('Created emergency user:', emergencyUser.full_name)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const authResult = await authenticateAnyUser(email, password)
      if (authResult) {
        setUser(authResult.user)
        setUserType(authResult.type)
        localStorage.setItem('eldercare_current_user', JSON.stringify(authResult.user))
        localStorage.setItem('eldercare_user_type', authResult.type)
        return { error: null }
      } else {
        return { error: { message: 'Invalid email or password' } }
      }
    } catch (error) {
      return { error }
    }
  }

  const signInClient = async (firstName: string, lastName: string, dateOfBirth: string, accessCode: string) => {
    try {
      const client = await authenticateClientWithAccessCode(firstName, lastName, dateOfBirth, accessCode)
      if (client) {
        setUser(client)
        setUserType('client')
        localStorage.setItem('eldercare_current_user', JSON.stringify(client))
        localStorage.setItem('eldercare_user_type', 'client')
        return { error: null }
      } else {
        return { error: { message: 'Invalid credentials or access code expired' } }
      }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      if (userType === 'staff') {
        await signOutFirebaseUser()
      }
      setUser(null)
      setUserType(null)
      localStorage.removeItem('eldercare_current_user')
      localStorage.removeItem('eldercare_user_type')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (updates: Partial<User | Client>) => {
    if (!user || !userType) return { error: new Error('No user logged in') }

    try {
      if (userType === 'staff') {
        await updateUser(user.id, updates as Partial<User>)
      } else {
        await updateClientUser(user.id, updates as Partial<ClientUser>)
      }
      
      // Update local state
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('eldercare_current_user', JSON.stringify(updatedUser))
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Role checking functions
  const isAdmin = () => {
    return userType === 'staff' && (user as User)?.role === 'admin'
  }

  const isCareManager = () => {
    return userType === 'staff' && (user as User)?.role === 'care_manager'
  }

  const isClient = () => {
    return userType === 'client'
  }

  const canAccessClients = () => {
    return userType === 'staff' // Both admin and care managers can access clients
  }

  const canAccessAssessments = () => {
    return userType === 'staff' // Both admin and care managers can access assessments
  }

  const canAccessAdmin = () => {
    return isAdmin() // Only admins can access admin panel
  }

  const value = {
    user,
    profile: user, // For compatibility with existing components
    userType,
    loading,
    signIn,
    signInClient,
    signOut,
    updateProfile,
    isAdmin,
    isCareManager,
    isClient,
    canAccessClients,
    canAccessAssessments,
    canAccessAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}