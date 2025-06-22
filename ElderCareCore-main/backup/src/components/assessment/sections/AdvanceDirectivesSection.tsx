import React, { useRef } from 'react'
import { FileText, AlertCircle, Upload, X, Plus, Trash2, Download } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface AdvanceDirectivesSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

interface POAContact {
  type?: string
  firstName: string
  lastName: string
  phone: string
  email: string
}

interface MPOAContact {
  firstName: string
  lastName: string
  phone: string
  email: string
}

export default function AdvanceDirectivesSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: AdvanceDirectivesSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'
  const fileInputRef = useRef<HTMLInputElement>(null)

  const poaTypes = ['Medical', 'Financial', 'Both']

  // Handle document upload
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const currentDocuments = (data.uploaded_documents as any[]) || []
    
    // Check if adding these files would exceed the limit
    if (currentDocuments.length + files.length > 5) {
      alert('Maximum 5 documents allowed per assessment')
      return
    }

    // Process files
    Array.from(files).forEach(file => {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      
      if (allowedTypes.includes(file.type)) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: e.target?.result as string,
            uploadDate: new Date().toISOString()
          }
          const updatedDocuments = [...currentDocuments, fileData]
          onUpdateField('uploaded_documents', updatedDocuments)
        }
        reader.readAsDataURL(file)
      } else {
        alert(`File type not supported: ${file.name}. Please upload PDF, JPEG, PNG, or DOCX files.`)
      }
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove document
  const removeDocument = (index: number) => {
    const currentDocuments = (data.uploaded_documents as any[]) || []
    const updatedDocuments = currentDocuments.filter((_, i) => i !== index)
    onUpdateField('uploaded_documents', updatedDocuments)
  }

  // POA Contact Management
  const addPOAContact = () => {
    const currentContacts = (data.poa_contacts as POAContact[]) || []
    if (currentContacts.length < 2) {
      const newContact: POAContact = {
        type: 'Medical',
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
      }
      onUpdateField('poa_contacts', [...currentContacts, newContact])
    }
  }

  const updatePOAContact = (index: number, field: keyof POAContact, value: string) => {
    const currentContacts = [...((data.poa_contacts as POAContact[]) || [])]
    if (currentContacts[index]) {
      currentContacts[index] = { ...currentContacts[index], [field]: value }
      onUpdateField('poa_contacts', currentContacts)
    }
  }

  const removePOAContact = (index: number) => {
    const currentContacts = (data.poa_contacts as POAContact[]) || []
    const updatedContacts = currentContacts.filter((_, i) => i !== index)
    onUpdateField('poa_contacts', updatedContacts)
  }

  // MPOA Contact Management
  const addMPOAContact = () => {
    const currentContacts = (data.mpoa_contacts as MPOAContact[]) || []
    if (currentContacts.length < 2) {
      const newContact: MPOAContact = {
        firstName: '',
        lastName: '',
        phone: '',
        email: ''
      }
      onUpdateField('mpoa_contacts', [...currentContacts, newContact])
    }
  }

  const updateMPOAContact = (index: number, field: keyof MPOAContact, value: string) => {
    const currentContacts = [...((data.mpoa_contacts as MPOAContact[]) || [])]
    if (currentContacts[index]) {
      currentContacts[index] = { ...currentContacts[index], [field]: value }
      onUpdateField('mpoa_contacts', currentContacts)
    }
  }

  const removeMPOAContact = (index: number) => {
    const currentContacts = (data.mpoa_contacts as MPOAContact[]) || []
    const updatedContacts = currentContacts.filter((_, i) => i !== index)
    onUpdateField('mpoa_contacts', updatedContacts)
  }

  // Get missing documents for summary
  const getMissingDocuments = () => {
    const missing = []
    if (!data.has_poa) missing.push('Power of Attorney')
    if (!data.has_living_will) missing.push('Living Will')
    if (!data.has_advance_directives) missing.push('Advance Directives')
    return missing
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const poaContacts = (data.poa_contacts as POAContact[]) || []
  const mpoaContacts = (data.mpoa_contacts as MPOAContact[]) || []
  const uploadedDocuments = (data.uploaded_documents as any[]) || []
  const missingDocuments = getMissingDocuments()

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <FileText className="h-6 w-6 mr-2 text-indigo-500" />
          Advanced Directives & Financial Planning
        </h2>

        {/* Validation Errors */}
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

        {/* Legal Documents Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">1. Legal Documents</h3>
          
          <div className="space-y-6">
            {/* Power of Attorney */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.has_poa as boolean || false}
                    onChange={(e) => {
                      onUpdateField('has_poa', e.target.checked)
                      if (!e.target.checked) {
                        onUpdateField('poa_contacts', [])
                      }
                    }}
                    disabled={isReadOnly}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      isReadOnly ? 'cursor-not-allowed' : ''
                    }`}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Do you have a Power of Attorney (POA)?
                  </span>
                </label>
              </div>

              {/* POA Contacts */}
              {data.has_poa && (
                <div className="ml-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-900">Power of Attorney Contacts</h4>
                    {!isReadOnly && poaContacts.length < 2 && (
                      <button
                        type="button"
                        onClick={addPOAContact}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add {poaContacts.length === 0 ? 'Primary' : 'Second'} POA
                      </button>
                    )}
                  </div>

                  {poaContacts.map((contact, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-700">
                          {index === 0 ? 'Primary' : 'Secondary'} Power of Attorney
                        </h5>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => removePOAContact(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove contact"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            value={contact.type || ''}
                            onChange={(e) => updatePOAContact(index, 'type', e.target.value)}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="">Select type</option>
                            {poaTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={contact.firstName}
                            onChange={(e) => updatePOAContact(index, 'firstName', e.target.value)}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="First name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={contact.lastName}
                            onChange={(e) => updatePOAContact(index, 'lastName', e.target.value)}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="Last name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => updatePOAContact(index, 'phone', e.target.value)}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="(555) 123-4567"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updatePOAContact(index, 'email', e.target.value)}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {poaContacts.length === 0 && (
                    <p className="text-sm text-gray-500 italic ml-6">
                      Click "Add Primary POA" to add contact information.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Medical Power of Attorney */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.has_mpoa as boolean || false}
                    onChange={(e) => {
                      onUpdateField('has_mpoa', e.target.checked)
                      if (!e.target.checked) {
                        onUpdateField('mpoa_contacts', [])
                      }
                    }}
                    disabled={isReadOnly}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      isReadOnly ? 'cursor-not-allowed' : ''
                    }`}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Do you have a Medical Power of Attorney (MPOA)?
                  </span>
                </label>
              </div>

              {/* MPOA Contacts */}
              {data.has_mpoa && (
                <div className="ml-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-900">Medical Power of Attorney Contacts</h4>
                    {!isReadOnly && mpoaContacts.length < 2 && (
                      <button
                        type="button"
                        onClick={addMPOAContact}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add {mpoaContacts.length === 0 ? 'Primary' : 'Second'} MPOA
                      </button>
                    )}
                  </div>

                  {mpoaContacts.map((contact, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-700">
                          {index === 0 ? 'Primary' : 'Secondary'} Medical Power of Attorney
                        </h5>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => removeMPOAContact(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove contact"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={contact.firstName}
                            onChange={(e) => updateMPOAContact(index, 'firstName', e.target.value)}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="First name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={contact.lastName}
                            onChange={(e) => updateMPOAContact(index, 'lastName', e.target.value)}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="Last name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => updateMPOAContact(index, 'phone', e.target.value)}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="(555) 123-4567"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateMPOAContact(index, 'email', e.target.value)}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                              isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {mpoaContacts.length === 0 && (
                    <p className="text-sm text-gray-500 italic ml-6">
                      Click "Add Primary MPOA" to add contact information.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Other Legal Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={data.family_providers_have_copies as boolean || false}
                  onChange={(e) => onUpdateField('family_providers_have_copies', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-3 text-sm text-gray-700">
                  Do your family and medical providers have copies?
                </span>
              </label>

              <label className="flex items-center p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={data.has_living_will as boolean || false}
                  onChange={(e) => onUpdateField('has_living_will', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-3 text-sm text-gray-700">
                  Do you have a living will?
                </span>
              </label>

              <label className="flex items-center p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={data.has_advance_directives as boolean || false}
                  onChange={(e) => onUpdateField('has_advance_directives', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-3 text-sm text-gray-700">
                  Do you have any end-of-life or advanced directives?
                </span>
              </label>

              <label className="flex items-center p-3 border rounded-lg">
                <input
                  type="checkbox"
                  checked={data.has_funeral_arrangements as boolean || false}
                  onChange={(e) => onUpdateField('has_funeral_arrangements', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-3 text-sm text-gray-700">
                  Do you have premade funeral arrangements?
                </span>
              </label>
            </div>

            {/* Advance Directives Notes */}
            {data.has_advance_directives && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End-of-life or Advanced Directives Notes
                </label>
                <textarea
                  value={data.advance_directives_notes as string || ''}
                  onChange={(e) => onUpdateField('advance_directives_notes', e.target.value)}
                  disabled={isReadOnly}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Additional details about advance directives..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Financial & Benefits Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">2. Financial & Benefits</h3>
          
          <div className="space-y-6">
            {/* VA Benefits */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={data.receives_va_benefits as boolean || false}
                  onChange={(e) => onUpdateField('receives_va_benefits', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Do you currently receive any VA benefits?
                </span>
              </label>

              {data.receives_va_benefits && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VA Benefits Notes
                  </label>
                  <textarea
                    value={data.va_benefits_notes as string || ''}
                    onChange={(e) => onUpdateField('va_benefits_notes', e.target.value)}
                    disabled={isReadOnly}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Details about VA benefits received..."
                  />
                </div>
              )}
            </div>

            {/* Financial Advisor */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={data.has_financial_advisor as boolean || false}
                  onChange={(e) => onUpdateField('has_financial_advisor', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Do you have a financial advisor?
                </span>
              </label>

              {data.has_financial_advisor && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Financial Advisor Name/Contact
                  </label>
                  <input
                    type="text"
                    value={data.financial_advisor_contact as string || ''}
                    onChange={(e) => onUpdateField('financial_advisor_contact', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Name, phone, or contact information"
                  />
                </div>
              )}
            </div>

            {/* Attorney */}
            <div className="border rounded-lg p-4">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={data.has_attorney as boolean || false}
                  onChange={(e) => onUpdateField('has_attorney', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Do you have an attorney?
                </span>
              </label>

              {data.has_attorney && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attorney Name/Contact
                  </label>
                  <input
                    type="text"
                    value={data.attorney_contact as string || ''}
                    onChange={(e) => onUpdateField('attorney_contact', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Name, phone, or contact information"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">3. Document Upload</h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-md font-medium text-gray-900 mb-2">
                Upload POA or Advanced Directive Documents (Optional)
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Accepted formats: PDF, JPEG, PNG, DOCX. Maximum 5 files. Current: {uploadedDocuments.length}/5
              </p>
              
              {!isReadOnly && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadedDocuments.length >= 5}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                multiple
                onChange={handleDocumentUpload}
                className="hidden"
                disabled={isReadOnly}
              />
            </div>

            {/* Uploaded Documents List */}
            {uploadedDocuments.length > 0 && (
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Uploaded Documents:</h5>
                <div className="space-y-2">
                  {uploadedDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(doc.size)} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            // Create download link
                            const link = document.createElement('a')
                            link.href = doc.data
                            link.download = doc.name
                            link.click()
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Download document"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {!isReadOnly && (
                          <button
                            onClick={() => removeDocument(index)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Remove document"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadedDocuments.length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-4">No documents uploaded.</p>
            )}
          </div>
        </div>

        {/* Missing Documents Summary */}
        {missingDocuments.length > 0 && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-md font-medium text-yellow-900 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Missing Key Documents
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              {missingDocuments.map((doc, index) => (
                <li key={index}>• {doc} not indicated</li>
              ))}
            </ul>
            <p className="text-xs text-yellow-700 mt-2">
              Consider discussing these important legal documents with the client.
            </p>
          </div>
        )}

        {/* Assessment Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-2">Assessment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>POA Contacts:</strong> {poaContacts.length}/2</p>
              <p><strong>MPOA Contacts:</strong> {mpoaContacts.length}/2</p>
              <p><strong>Documents Uploaded:</strong> {uploadedDocuments.length}/5</p>
            </div>
            <div>
              <p><strong>Has Living Will:</strong> {data.has_living_will ? 'Yes' : 'No'}</p>
              <p><strong>Has Advance Directives:</strong> {data.has_advance_directives ? 'Yes' : 'No'}</p>
              <p><strong>Missing Documents:</strong> {missingDocuments.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}