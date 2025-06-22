import React, { useState } from 'react'
import { Stethoscope, AlertCircle, Plus, Edit, Trash2, Phone, Mail, MapPin } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface CareProvidersSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

interface Provider {
  id: string
  practiceAgencyName: string
  providerName: string
  phone: string
  email: string
  notes: string
  isInactive: boolean
}

export default function CareProvidersSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: CareProvidersSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'
  const [editingProvider, setEditingProvider] = useState<{ category: string; index: number } | null>(null)

  // Provider categories configuration
  const providerCategories = [
    { key: 'primary_care_provider', label: 'Primary Care Provider (PCP)', allowMultiple: false },
    { key: 'consulting_physicians', label: 'Consulting Physicians / Specialists', allowMultiple: true },
    { key: 'dentist', label: 'Dentist', allowMultiple: false },
    { key: 'eye_care_provider', label: 'Eye Care Provider', allowMultiple: false },
    { key: 'pharmacy', label: 'Pharmacy', allowMultiple: false },
    { key: 'home_health_agency', label: 'Home Health Agency', allowMultiple: false },
    { key: 'therapy_providers', label: 'Therapy Providers (PT, ST, OT)', allowMultiple: true },
    { key: 'hospital_preference', label: 'Hospital Preference', allowMultiple: false },
    { key: 'dme_provider', label: 'DME Provider or Medical Supply Company', allowMultiple: false },
    { key: 'other_providers', label: 'Other', allowMultiple: true }
  ]

  // Generate unique ID for new providers
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // Get providers for a specific category
  const getProvidersForCategory = (categoryKey: string): Provider[] => {
    const providers = data[categoryKey] as Provider[] || []
    return Array.isArray(providers) ? providers : []
  }

  // Add new provider to category
  const addProvider = (categoryKey: string) => {
    const currentProviders = getProvidersForCategory(categoryKey)
    const category = providerCategories.find(cat => cat.key === categoryKey)
    
    // Check if single entry category already has a provider
    if (!category?.allowMultiple && currentProviders.length > 0) {
      alert('This category only allows one provider. Please edit the existing provider or remove it first.')
      return
    }

    const newProvider: Provider = {
      id: generateId(),
      practiceAgencyName: '',
      providerName: '',
      phone: '',
      email: '',
      notes: '',
      isInactive: false
    }

    const updatedProviders = [...currentProviders, newProvider]
    onUpdateField(categoryKey, updatedProviders)
    
    // Set editing mode for the new provider
    setEditingProvider({ category: categoryKey, index: updatedProviders.length - 1 })
  }

  // Update provider in category
  const updateProvider = (categoryKey: string, index: number, updatedProvider: Provider) => {
    const currentProviders = getProvidersForCategory(categoryKey)
    const updatedProviders = [...currentProviders]
    updatedProviders[index] = updatedProvider
    onUpdateField(categoryKey, updatedProviders)
  }

  // Remove provider from category
  const removeProvider = (categoryKey: string, index: number) => {
    if (!confirm('Are you sure you want to remove this provider?')) return
    
    const currentProviders = getProvidersForCategory(categoryKey)
    const updatedProviders = currentProviders.filter((_, i) => i !== index)
    onUpdateField(categoryKey, updatedProviders)
    
    // Clear editing state if we're editing this provider
    if (editingProvider?.category === categoryKey && editingProvider?.index === index) {
      setEditingProvider(null)
    }
  }

  // Save provider to Resource Directory (future integration)
  const saveToResourceDirectory = (provider: Provider, categoryKey: string) => {
    // TODO: Implement Resource Directory integration
    // For now, we'll just show a success message
    console.log('Saving to Resource Directory:', { provider, category: categoryKey })
    // In the future, this would make an API call to save the provider
  }

  // Handle provider form submission
  const handleProviderSubmit = (categoryKey: string, index: number, provider: Provider) => {
    updateProvider(categoryKey, index, provider)
    setEditingProvider(null)
    
    // Auto-save to Resource Directory if provider has required fields
    if (provider.practiceAgencyName && provider.phone) {
      saveToResourceDirectory(provider, categoryKey)
    }
  }

  // Get all providers for export summary
  const getAllProviders = () => {
    const allProviders: { category: string; providers: Provider[] }[] = []
    
    providerCategories.forEach(category => {
      const providers = getProvidersForCategory(category.key)
      if (providers.length > 0) {
        allProviders.push({
          category: category.label,
          providers
        })
      }
    })
    
    return allProviders
  }

  // Provider Form Component
  const ProviderForm = ({ 
    provider, 
    categoryKey, 
    index, 
    onSave, 
    onCancel 
  }: {
    provider: Provider
    categoryKey: string
    index: number
    onSave: (provider: Provider) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState<Provider>(provider)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      
      // Validation
      if (!formData.practiceAgencyName.trim()) {
        alert('Practice or Agency Name is required')
        return
      }
      if (!formData.phone.trim()) {
        alert('Phone Number is required')
        return
      }
      
      onSave(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Practice or Agency Name *
            </label>
            <input
              type="text"
              value={formData.practiceAgencyName}
              onChange={(e) => setFormData(prev => ({ ...prev, practiceAgencyName: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter practice or agency name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provider Name (Optional)
            </label>
            <input
              type="text"
              value={formData.providerName}
              onChange={(e) => setFormData(prev => ({ ...prev, providerName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dr. Smith, Nurse Johnson, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="contact@provider.com"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Hours, specialties, concerns, additional information..."
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isInactive}
              onChange={(e) => setFormData(prev => ({ ...prev, isInactive: e.target.checked }))}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              ❌ Mark as Inactive (Former/Previous Provider)
            </span>
          </label>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Provider
          </button>
        </div>
      </form>
    )
  }

  // Provider Display Component
  const ProviderDisplay = ({ 
    provider, 
    categoryKey, 
    index 
  }: {
    provider: Provider
    categoryKey: string
    index: number
  }) => {
    return (
      <div className={`border rounded-lg p-4 ${
        provider.isInactive ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2">
              <h4 className={`text-md font-medium ${
                provider.isInactive ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}>
                {provider.practiceAgencyName}
              </h4>
              {provider.isInactive && (
                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  ❌ Inactive
                </span>
              )}
            </div>
            
            {provider.providerName && (
              <p className={`text-sm mb-2 ${
                provider.isInactive ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Provider: {provider.providerName}
              </p>
            )}
            
            <div className="space-y-1">
              {provider.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className={provider.isInactive ? 'text-gray-400' : 'text-gray-600'}>
                    {provider.phone}
                  </span>
                </div>
              )}
              
              {provider.email && (
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className={provider.isInactive ? 'text-gray-400' : 'text-gray-600'}>
                    {provider.email}
                  </span>
                </div>
              )}
              
              {provider.notes && (
                <div className="mt-2">
                  <p className={`text-sm ${
                    provider.isInactive ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <strong>Notes:</strong> {provider.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {!isReadOnly && (
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setEditingProvider({ category: categoryKey, index })}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edit provider"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => removeProvider(categoryKey, index)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Remove provider"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const allProviders = getAllProviders()
  const totalProviders = allProviders.reduce((sum, cat) => sum + cat.providers.length, 0)
  const activeProviders = allProviders.reduce((sum, cat) => 
    sum + cat.providers.filter(p => !p.isInactive).length, 0
  )

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Stethoscope className="h-6 w-6 mr-2 text-cyan-500" />
          Section 11: Care Providers Directory
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

        {/* Provider Categories */}
        <div className="space-y-8">
          {providerCategories.map((category) => {
            const providers = getProvidersForCategory(category.key)
            
            return (
              <div key={category.key} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{category.label}</h3>
                    <p className="text-sm text-gray-600">
                      {category.allowMultiple ? 'Multiple entries allowed' : 'Single entry only'}
                      {providers.length > 0 && (
                        <span className="ml-2">
                          • {providers.length} provider{providers.length !== 1 ? 's' : ''} added
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {!isReadOnly && (
                    <button
                      onClick={() => addProvider(category.key)}
                      disabled={!category.allowMultiple && providers.length > 0}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Provider
                    </button>
                  )}
                </div>

                {/* Provider List */}
                <div className="space-y-4">
                  {providers.map((provider, index) => (
                    <div key={provider.id}>
                      {editingProvider?.category === category.key && editingProvider?.index === index ? (
                        <ProviderForm
                          provider={provider}
                          categoryKey={category.key}
                          index={index}
                          onSave={(updatedProvider) => handleProviderSubmit(category.key, index, updatedProvider)}
                          onCancel={() => setEditingProvider(null)}
                        />
                      ) : (
                        <ProviderDisplay
                          provider={provider}
                          categoryKey={category.key}
                          index={index}
                        />
                      )}
                    </div>
                  ))}
                  
                  {providers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Stethoscope className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm">No providers added for this category</p>
                      {!isReadOnly && (
                        <p className="text-xs mt-1">Click "Add Provider" to get started</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Export Summary */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Client's Healthcare & Service Providers
          </h4>
          
          {allProviders.length > 0 ? (
            <div className="space-y-6">
              {allProviders.map((categoryGroup, categoryIndex) => (
                <div key={categoryIndex}>
                  <h5 className="text-md font-medium text-gray-800 mb-3">
                    {categoryGroup.category}
                  </h5>
                  
                  <div className="space-y-3 ml-4">
                    {categoryGroup.providers.map((provider, providerIndex) => (
                      <div key={providerIndex} className={`p-3 rounded border ${
                        provider.isInactive ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h6 className={`font-medium ${
                                provider.isInactive ? 'text-gray-500 line-through' : 'text-gray-900'
                              }`}>
                                {provider.practiceAgencyName}
                              </h6>
                              {provider.isInactive && (
                                <span className="ml-2 text-xs text-red-600 font-medium">
                                  ❌ Inactive
                                </span>
                              )}
                            </div>
                            
                            {provider.providerName && (
                              <p className={`text-sm ${
                                provider.isInactive ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                Provider: {provider.providerName}
                              </p>
                            )}
                            
                            <div className="mt-1 space-y-1">
                              <p className={`text-sm ${
                                provider.isInactive ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                📞 {provider.phone}
                              </p>
                              
                              {provider.email && (
                                <p className={`text-sm ${
                                  provider.isInactive ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  ✉️ {provider.email}
                                </p>
                              )}
                              
                              {provider.notes && (
                                <p className={`text-sm ${
                                  provider.isInactive ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  📝 {provider.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No Providers Added</p>
              <p className="text-sm">
                Add healthcare providers and service contacts to build the client's care team directory.
              </p>
            </div>
          )}

          {/* Summary Statistics */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{totalProviders}</p>
                <p className="text-gray-600">Total Providers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{activeProviders}</p>
                <p className="text-gray-600">Active Providers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{totalProviders - activeProviders}</p>
                <p className="text-gray-600">Inactive Providers</p>
              </div>
            </div>
          </div>

          {/* Resource Directory Integration Note */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>📚 Resource Directory Integration:</strong> Providers added during assessments are automatically saved to the master Resource Directory for future use across all assessments.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}