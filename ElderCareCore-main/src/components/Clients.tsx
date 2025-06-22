import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Search, Edit, Eye, Calendar, Phone, Mail, MapPin } from 'lucide-react'
import ClientForm from './ClientForm'
import { Client } from '../lib/mockData'
import { getClients } from '../lib/firestoreService'

export default function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')

  useEffect(() => {
    fetchClients()
  }, [user])

  const fetchClients = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      // Admin users can see all clients, others see only their own
      const clientsData = await getClients(user.role === 'admin' ? undefined : user.id)
      setClients(clientsData)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClientSaved = () => {
    fetchClients()
    setShowForm(false)
    setSelectedClient(null)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setShowForm(true)
  }

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setViewMode('detail')
  }

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase()
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      (client.preferred_name && client.preferred_name.toLowerCase().includes(searchLower)) ||
      client.date_of_birth.includes(searchTerm) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.email && client.email.toLowerCase().includes(searchLower))
    )
  })

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

  if (showForm) {
    return (
      <ClientForm
        client={selectedClient}
        onSave={handleClientSaved}
        onCancel={() => {
          setShowForm(false)
          setSelectedClient(null)
        }}
      />
    )
  }

  if (viewMode === 'detail' && selectedClient) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => {
                setViewMode('list')
                setSelectedClient(null)
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Clients
            </button>
            <button
              onClick={() => handleEditClient(selectedClient)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </button>
          </div>

          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-blue-50 border-b">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedClient.preferred_name || selectedClient.first_name} {selectedClient.last_name}
              </h1>
              {selectedClient.preferred_name && (
                <p className="text-gray-600">
                  Legal name: {selectedClient.first_name} {selectedClient.last_name}
                </p>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                      <p className="text-gray-900">{formatDate(selectedClient.date_of_birth)}</p>
                    </div>
                  </div>

                  {selectedClient.phone && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-gray-900">{formatPhone(selectedClient.phone)}</p>
                      </div>
                    </div>
                  )}

                  {selectedClient.email && (
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900">{selectedClient.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {getFullAddress(selectedClient) && (
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
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
                </div>
              </div>

              {selectedClient.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                  <div className="bg-gray-50 rounded-md p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedClient.notes}</p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-md p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assessments</h3>
                <p className="text-gray-600 italic">Assessment forms will be available in Phase 2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Client Directory</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Client
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients by name, date of birth, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading clients...</p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm ? 'No clients found matching your search.' : 'No clients added yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date of Birth
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {client.preferred_name || client.first_name} {client.last_name}
                            </p>
                            {client.preferred_name && (
                              <p className="text-sm text-gray-500">
                                Legal: {client.first_name} {client.last_name}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(client.date_of_birth)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {client.phone && <p>{formatPhone(client.phone)}</p>}
                            {client.email && <p className="text-gray-500">{client.email}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.city && client.state ? `${client.city}, ${client.state}` : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewClient(client)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditClient(client)}
                              className="text-indigo-600 hover:text-indigo-900 p-1"
                              title="Edit client"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}