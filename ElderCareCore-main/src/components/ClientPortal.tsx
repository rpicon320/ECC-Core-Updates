import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Calendar, Phone, Mail, MapPin, FileText, LogOut, Shield, Key } from 'lucide-react'
import { getAssessmentsByClient } from '../lib/firestoreService'
import { Client, Assessment } from '../lib/mockData'

export default function ClientPortal() {
  const { user, userType, signOut } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user || userType !== 'client') return

      try {
        setLoading(true)
        const client = user as Client

        // Get assessments for this client
        const clientAssessments = await getAssessmentsByClient(client.id)
        setAssessments(clientAssessments)
      } catch (error) {
        console.error('Error fetching client data:', error)
        setError('Failed to load your information. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [user, userType])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getFullAddress = (client: Client) => {
    const parts = [
      client.address_line1,
      client.address_line2,
      client.city,
      client.state,
      client.zip_code
    ].filter(Boolean)
    return parts.join(', ')
  }

  const getAssessmentStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full"
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'draft':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const isAccessCodeExpiring = (client: Client) => {
    if (!client.access_code_expires) return false
    const expirationDate = new Date(client.access_code_expires)
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 14 // Show warning if expiring within 14 days
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Information</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No client information found.</p>
        </div>
      </div>
    )
  }

  const client = user as Client

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/ECCcolorchart_edited.webp"
                alt="ElderCare Connections"
              />
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Client Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {client.preferred_name || client.first_name}
              </span>
              <button
                onClick={signOut}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Access Code Expiration Warning */}
          {isAccessCodeExpiring(client) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Key className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Access Code Expiring Soon</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your access code will expire on {formatDate(client.access_code_expires!)}. 
                    Please contact your care manager for a new access code.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Name</p>
                        <p className="text-gray-900">
                          {client.preferred_name || client.first_name} {client.last_name}
                          {client.preferred_name && (
                            <span className="text-gray-500 text-sm ml-2">
                              (Legal: {client.first_name} {client.last_name})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                          <p className="text-gray-900">{formatDate(client.date_of_birth)}</p>
                        </div>
                      </div>

                      {client.gender && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Gender</p>
                          <p className="text-gray-900">{client.gender}</p>
                        </div>
                      )}

                      {client.marital_status && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">Marital Status</p>
                          <p className="text-gray-900">{client.marital_status}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    {client.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <p className="text-gray-900">{formatPhone(client.phone)}</p>
                        </div>
                      </div>
                    )}

                    {client.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-gray-900">{client.email}</p>
                        </div>
                      </div>
                    )}

                    {getFullAddress(client) && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Address</p>
                          <div className="text-gray-900">
                            {client.address_line1 && <p>{client.address_line1}</p>}
                            {client.address_line2 && <p>{client.address_line2}</p>}
                            {(client.city || client.state || client.zip_code) && (
                              <p>
                                {[client.city, client.state, client.zip_code]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {client.poc_full_name && (
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-gray-900">{client.poc_full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Relationship</p>
                      <p className="text-gray-900">{client.poc_relationship}</p>
                    </div>
                    {client.poc_phone_cell && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-gray-900">{formatPhone(client.poc_phone_cell)}</p>
                      </div>
                    )}
                    {client.poc_email && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900">{client.poc_email}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assessment History */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Assessment History
              </h2>
            </div>

            <div className="p-6">
              {assessments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No assessments available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.map((assessment) => (
                    <div key={assessment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Assessment - {formatDate(assessment.created_at)}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Last updated: {formatDate(assessment.updated_at)}
                          </p>
                        </div>
                        <span className={getAssessmentStatusBadge(assessment.status)}>
                          {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Information
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Access Code</h3>
                  <p className="text-gray-900 font-mono">{client.access_code}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Expires</h3>
                  <p className="text-gray-900">
                    {client.access_code_expires ? formatDate(client.access_code_expires) : 'Never'}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Security Note:</strong> Your access code is unique to you and expires for security. 
                  Contact your care manager if you need a new access code.
                </p>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Important Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• This portal provides access to your personal information only</li>
              <li>• For questions about your care plan, please contact your care manager</li>
              <li>• Assessment details are available upon request from your care team</li>
              <li>• If you notice any incorrect information, please contact ElderCare Connections</li>
              <li>• Your access is secured with a unique access code that expires periodically</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}