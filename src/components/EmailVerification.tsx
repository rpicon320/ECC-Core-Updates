import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-react'
import { verifyEmail } from '../lib/firestoreService'

export default function EmailVerification() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyUserEmail = async () => {
      const token = searchParams.get('token')
      const userType = searchParams.get('type') as 'staff' | 'client'

      if (!token || !userType) {
        setStatus('error')
        setMessage('Invalid verification link. Please check your email for the correct link.')
        return
      }

      try {
        const verified = await verifyEmail(token, userType)
        
        if (verified) {
          setStatus('success')
          setMessage('Your email has been successfully verified! You can now sign in to your account.')
        } else {
          setStatus('error')
          setMessage('Verification failed. The link may be expired or invalid. Please contact support for assistance.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred during verification. Please try again or contact support.')
      }
    }

    verifyUserEmail()
  }, [searchParams])

  const handleBackToLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            className="mx-auto h-16 w-auto"
            src="/ECCcolorchart_edited.webp"
            alt="ElderCare Connections"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Email Verification
          </h2>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            {status === 'verifying' && (
              <>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Verifying your email...
                </h3>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Email Verified Successfully!
                </h3>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <button
                  onClick={handleBackToLogin}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Verification Failed
                </h3>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleBackToLogin}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </button>
                  <div className="text-sm text-gray-500">
                    Need help? Contact support at{' '}
                    <a href="mailto:support@eldercareva.com" className="text-blue-600 hover:text-blue-800">
                      support@eldercareva.com
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Email Verification Required</h4>
              <p className="text-sm text-blue-800">
                All new users must verify their email address before accessing the ElderCare Connections system. 
                This ensures secure access and helps us maintain the integrity of our platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}