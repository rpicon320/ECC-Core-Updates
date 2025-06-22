import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Search, Edit, Eye, Calendar, User, FileText, Download, ArrowLeft } from 'lucide-react'
import { Assessment, Client } from '../lib/mockData'
import { getAssessments, getClients } from '../lib/firestoreService'
import AssessmentFormComponent from './assessment/AssessmentForm'

export default function Assessments() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Fetch assessments and clients in parallel
      const [assessmentsData, clientsData] = await Promise.all([
        getAssessments(user.role === 'admin' ? undefined : user.id),
        getClients(user.role === 'admin' ? undefined : user.id)
      ])
      
      setAssessments(assessmentsData)
      setClients(clientsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNewAssessment = () => {
    setEditingAssessment(null)
    setShowForm(true)
  }

  const handleEditAssessment = (assessment: Assessment) => {
    setEditingAssessment(assessment)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAssessment(null)
    fetchData() // Refresh data when form closes
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return 'Unknown Client'
    return client.preferred_name 
      ? `${client.preferred_name} ${client.last_name}`
      : `${client.first_name} ${client.last_name}`
  }

  const getClientInfo = (clientId: string) => {
    return clients.find(c => c.id === clientId)
  }

  const filteredAssessments = assessments.filter(assessment => {
    const client = getClientInfo(assessment.client_id)
    const clientName = getClientName(assessment.client_id)
    const searchLower = searchTerm.toLowerCase()
    
    return (
      clientName.toLowerCase().includes(searchLower) ||
      assessment.status.toLowerCase().includes(searchLower) ||
      (client?.date_of_birth && client.date_of_birth.includes(searchTerm))
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
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

  const handleExportPDF = (assessmentId: string) => {
    // TODO: Implement PDF export functionality
    alert('PDF export functionality will be implemented')
  }

  // Show the assessment form if showForm is true
  if (showForm) {
    return (
      <AssessmentFormComponent 
        assessment={editingAssessment}
        onClose={handleFormClose}
      />
    )
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading assessments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Assessments</h1>
          <button
            onClick={handleNewAssessment}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assessment
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assessments by client name, status, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No assessments found matching your search.' : 'No assessments created yet.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleNewAssessment}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Assessment
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    {user?.role === 'admin' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created By
                      </th>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssessments.map((assessment) => {
                    const client = getClientInfo(assessment.client_id)
                    return (
                      <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {getClientName(assessment.client_id)}
                              </div>
                              {client && (
                                <div className="text-sm text-gray-500">
                                  DOB: {formatDate(client.date_of_birth)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(assessment.status)}>
                            {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {formatDate(assessment.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(assessment.updated_at)}
                        </td>
                        {user?.role === 'admin' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {/* TODO: Get creator name from user ID */}
                            Care Manager
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditAssessment(assessment)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                              title="View/Edit assessment"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {assessment.status === 'completed' && (
                              <button
                                onClick={() => handleExportPDF(assessment.id)}
                                className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                                title="Export to PDF"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}