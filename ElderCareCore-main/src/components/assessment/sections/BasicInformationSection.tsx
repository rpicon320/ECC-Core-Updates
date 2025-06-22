import React, { useEffect, useState } from 'react'
import { User, Calendar, Phone, Mail, MapPin, AlertCircle } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'
import { Client } from '../../../lib/mockData'
import { getClients } from '../../../lib/firestoreService'

interface BasicInformationSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
  clients: Client[]
}

export default function BasicInformationSection({
  sectionData,
  onUpdateField,
  onUpdateSection,
  validationErrors,
  mode,
  clients: propClients
}: BasicInformationSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'
  const [clients, setClients] = useState<Client[]>(propClients || [])
  const [loadingClients, setLoadingClients] = useState(false)

  // Fetch clients if not provided via props
  useEffect(() => {
    const fetchClients = async () => {
      if (!propClients || propClients.length === 0) {
        try {
          setLoadingClients(true)
          console.log('Fetching clients for dropdown...')
          const clientsData = await getClients()
          console.log('Fetched clients:', clientsData.length)
          setClients(clientsData)
        } catch (error) {
          console.error('Error fetching clients:', error)
          // Fallback to demo data if Firestore fails
          try {
            const { mockClients } = await import('../../../lib/mockData')
            setClients(mockClients)
            console.log('Using fallback demo clients:', mockClients.length)
          } catch (fallbackError) {
            console.error('Error loading fallback clients:', fallbackError)
          }
        } finally {
          setLoadingClients(false)
        }
      } else {
        setClients(propClients)
      }
    }

    fetchClients()
  }, [propClients])

  const consultationReasons = [
    'Initial Assessment',
    'Follow-up Assessment',
    'Care Plan Review',
    'Medication Management',
    'Safety Concerns',
    'Family Request',
    'Provider Referral',
    'Insurance Requirement',
    'Other'
  ]

  const selectedClient = clients.find(c => c.id === data.clientId)

  const handleConsultationReasonChange = (reason: string, checked: boolean) => {
    const currentReasons = (data.consultationReasons as string[]) || []
    const newReasons = checked
      ? [...currentReasons, reason]
      : currentReasons.filter(r => r !== reason)
    
    onUpdateField('consultationReasons', newReasons)
    
    // If "Other" is unchecked, clear the other reason field
    if (reason === 'Other' && !checked) {
      onUpdateField('consultationReasonsOther', '')
    }
  }

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

  const getFieldError = (fieldName: string) => {
    return validationErrors.find(error => error.field === fieldName)
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <User className="h-6 w-6 mr-2 text-blue-500" />
          Basic Information
        </h2>
        
        {/* Validation Errors Summary */}
        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Client Selection */}
        <div className="mb-8">
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
            Select Client *
          </label>
          {loadingClients ? (
            <div className="flex items-center justify-center py-4 border border-gray-300 rounded-md bg-gray-50">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-gray-600">Loading clients...</span>
            </div>
          ) : (
            <select
              id="clientId"
              value={data.clientId as string || ''}
              onChange={(e) => onUpdateField('clientId', e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('clientId') ? 'border-red-300' : 'border-gray-300'
              } ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required
              aria-describedby={getFieldError('clientId') ? 'clientId-error' : undefined}
            >
              <option value="">
                {clients.length === 0 ? 'No clients available' : 'Choose a client...'}
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.preferred_name || client.first_name} {client.last_name} - DOB: {formatDate(client.date_of_birth)}
                </option>
              ))}
            </select>
          )}
          {getFieldError('clientId') && (
            <p id="clientId-error" className="mt-1 text-sm text-red-600">
              {getFieldError('clientId')?.message}
            </p>
          )}
          {clients.length === 0 && !loadingClients && (
            <p className="mt-1 text-sm text-yellow-600">
              No clients found. Please add clients first in the Clients section.
            </p>
          )}
        </div>

        {/* Client Information Display */}
        {selectedClient && (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Client Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Name</p>
                    <p className="text-gray-900">
                      {selectedClient.preferred_name || selectedClient.first_name} {selectedClient.last_name}
                      {selectedClient.preferred_name && (
                        <span className="text-gray-500 text-sm ml-2">
                          (Legal: {selectedClient.first_name} {selectedClient.last_name})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                    <p className="text-gray-900">{formatDate(selectedClient.date_of_birth)}</p>
                  </div>
                </div>

                {selectedClient.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-gray-900">{formatPhone(selectedClient.phone)}</p>
                    </div>
                  </div>
                )}

                {selectedClient.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-blue-600 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-gray-900">{selectedClient.email}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {getFullAddress(selectedClient) && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Address</p>
                      <div className="text-gray-900">
                        {selectedClient.address_line1 && <p>{selectedClient.address_line1}</p>}
                        {selectedClient.address_line2 && <p>{selectedClient.address_line2}</p>}
                        {(selectedClient.city || selectedClient.state || selectedClient.zip_code) && (
                          <p>
                            {[selectedClient.city, selectedClient.state, selectedClient.zip_code]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedClient.poc_full_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-700">Point of Contact</p>
                    <p className="text-gray-900">{selectedClient.poc_full_name}</p>
                    <p className="text-gray-600 text-sm">{selectedClient.poc_relationship}</p>
                    {selectedClient.poc_phone_cell && (
                      <p className="text-gray-600 text-sm">{formatPhone(selectedClient.poc_phone_cell)}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Assessment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label htmlFor="assessmentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Date
            </label>
            <input
              type="date"
              id="assessmentDate"
              value={data.assessmentDate as string || new Date().toISOString().split('T')[0]}
              onChange={(e) => onUpdateField('assessmentDate', e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div>
            <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-1">
              Completion Date
            </label>
            <input
              type="date"
              id="completionDate"
              value={data.completionDate as string || ''}
              onChange={(e) => onUpdateField('completionDate', e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>

        {/* Consultation Reasons */}
        <div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-3">
              Reason(s) for Consultation (Select all that apply)
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {consultationReasons.map((reason) => (
                <label key={reason} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={((data.consultationReasons as string[]) || []).includes(reason)}
                    onChange={(e) => handleConsultationReasonChange(reason, e.target.checked)}
                    disabled={isReadOnly}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      isReadOnly ? 'cursor-not-allowed' : ''
                    }`}
                  />
                  <span className="ml-2 text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
          </fieldset>
          
          {((data.consultationReasons as string[]) || []).includes('Other') && (
            <div className="mt-4">
              <label htmlFor="consultationReasonsOther" className="block text-sm font-medium text-gray-700 mb-1">
                Please specify other reason
              </label>
              <input
                type="text"
                id="consultationReasonsOther"
                value={data.consultationReasonsOther as string || ''}
                onChange={(e) => onUpdateField('consultationReasonsOther', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Describe the other reason for consultation"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}