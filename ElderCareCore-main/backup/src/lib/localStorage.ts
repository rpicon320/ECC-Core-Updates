// Local storage utilities for Phase 1
import { User, Client, Assessment, mockUsers, mockClients, mockAssessments } from './mockData'

const USERS_KEY = 'eldercare_users'
const CLIENTS_KEY = 'eldercare_clients'
const ASSESSMENTS_KEY = 'eldercare_assessments'
const CURRENT_USER_KEY = 'eldercare_current_user'

// Initialize localStorage with mock data if empty
export const initializeLocalStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers))
  }
  if (!localStorage.getItem(CLIENTS_KEY)) {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(mockClients))
  }
  if (!localStorage.getItem(ASSESSMENTS_KEY)) {
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(mockAssessments))
  }
}

// User management
export const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY)
  return users ? JSON.parse(users) : []
}

export const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY)
  return user ? JSON.parse(user) : null
}

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
  }
}

// Client management
export const getClients = (): Client[] => {
  const clients = localStorage.getItem(CLIENTS_KEY)
  return clients ? JSON.parse(clients) : []
}

export const saveClients = (clients: Client[]) => {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
}

// Assessment management
export const getAssessments = (): Assessment[] => {
  const assessments = localStorage.getItem(ASSESSMENTS_KEY)
  return assessments ? JSON.parse(assessments) : []
}

export const saveAssessments = (assessments: Assessment[]) => {
  localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(assessments))
}

// Authentication
export const authenticateUser = (email: string, password: string): User | null => {
  const users = getUsers()
  const user = users.find(u => u.email === email && u.password === password)
  return user || null
}

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}