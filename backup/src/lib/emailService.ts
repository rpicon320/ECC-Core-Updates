import emailjs from 'emailjs-com'

// EmailJS configuration
const EMAILJS_SERVICE_ID = 'service_eldercare'
const EMAILJS_TEMPLATE_ID = 'template_verification'
const EMAILJS_USER_ID = 'user_eldercare'

// Initialize EmailJS (in production, these would be environment variables)
emailjs.init(EMAILJS_USER_ID)

export interface EmailVerificationData {
  to_email: string
  to_name: string
  verification_link: string
  user_type: 'staff' | 'client'
}

export const sendVerificationEmail = async (data: EmailVerificationData): Promise<boolean> => {
  try {
    // In a real application, you would configure EmailJS with your actual service
    // For now, we'll simulate sending an email
    console.log('Sending verification email to:', data.to_email)
    console.log('Verification link:', data.verification_link)
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In production, uncomment this to actually send emails:
    /*
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: data.to_email,
        to_name: data.to_name,
        verification_link: data.verification_link,
        user_type: data.user_type === 'staff' ? 'Staff Member' : 'Client',
        company_name: 'ElderCare Connections'
      }
    )
    
    return result.status === 200
    */
    
    // For demo purposes, always return true
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
}

export const sendAccessCodeEmail = async (clientEmail: string, clientName: string, accessCode: string): Promise<boolean> => {
  try {
    console.log('Sending access code email to:', clientEmail)
    console.log('Access code:', accessCode)
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In production, you would send the actual email here
    return true
  } catch (error) {
    console.error('Failed to send access code email:', error)
    return false
  }
}

// Generate verification link
export const generateVerificationLink = (token: string, userType: 'staff' | 'client'): string => {
  const baseUrl = window.location.origin
  return `${baseUrl}/verify-email?token=${token}&type=${userType}`
}

// Validate email domain for staff users
export const isValidStaffEmailDomain = (email: string): boolean => {
  return email.toLowerCase().endsWith('@eldercareva.com')
}

// Email validation regex
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}