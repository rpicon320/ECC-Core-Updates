import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'
import { Plus, Search, Eye, Calendar, User, FileText, Download, Edit3, Trash2, AlertCircle } from 'lucide-react'
import { Assessment, Client } from '../../../lib/mockData'
import { getAssessments } from '../services/assessmentService'
import { getClients } from '../../../lib/firestoreService'

export default function Assessments() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleteRequestConfirm, setDeleteRequestConfirm] = useState<string | null>(null)

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
    navigate('/assessments/new')
  }

  const handleViewAssessment = (assessment: Assessment) => {
    navigate(`/assessments/${assessment.id}`)
  }

  const handleEditAssessment = (assessment: Assessment) => {
    navigate(`/assessments/${assessment.id}`)
  }

  const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      // Import deleteAssessment function
      const { deleteAssessment } = await import('../services/assessmentService')
      await deleteAssessment(assessmentId)
      
      // Refresh the data
      await fetchData()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting assessment:', error)
      alert('Failed to delete assessment. Please try again.')
    }
  }

  const confirmDelete = (assessmentId: string) => {
    setDeleteConfirm(assessmentId)
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  const handleRequestDelete = async (assessmentId: string) => {
    try {
      // Create a deletion request notification for admin
      const { createNotification } = await import('../../../lib/firestoreService')
      const assessment = assessments.find(a => a.id === assessmentId)
      const client = getClientInfo(assessment?.client_id || '')
      const clientName = getClientName(assessment?.client_id || '')
      
      await createNotification({
        type: 'assessment_deletion_request',
        title: 'Assessment Deletion Request',
        message: `${user?.first_name} ${user?.last_name} has requested to delete an assessment for ${clientName}`,
        recipient_role: 'admin',
        data: {
          assessment_id: assessmentId,
          requester_id: user?.id,
          requester_name: `${user?.first_name} ${user?.last_name}`,
          client_name: clientName,
          assessment_date: assessment?.created_at
        },
        created_by: user?.id,
        status: 'pending'
      })
      
      setDeleteRequestConfirm(null)
      alert('Deletion request sent to admin for approval.')
    } catch (error) {
      console.error('Error creating deletion request:', error)
      alert('Failed to send deletion request. Please try again.')
    }
  }

  const confirmDeleteRequest = (assessmentId: string) => {
    setDeleteRequestConfirm(assessmentId)
  }

  const cancelDeleteRequest = () => {
    setDeleteRequestConfirm(null)
  }

  // Check if user can edit a specific assessment
  const canEditAssessment = (assessment: Assessment) => {
    if (user?.role === 'admin') return true
    // Staff can edit if they created it or are assigned to the client
    return assessment.created_by === user?.id || assessment.assigned_staff_id === user?.id
  }

  // Check if user can delete assessments
  const canDeleteAssessment = () => {
    return user?.role === 'admin'
  }

  const getClientName = (clientId: string) => {
    if (!clientId) {
      console.log('No client ID provided for assessment')
      return 'No Client Selected'
    }
    
    const client = clients.find(c => c.id === clientId)
    if (!client) {
      console.log('Client not found for ID:', clientId, 'Available clients:', clients.map(c => c.id))
      return 'Unknown Client'
    }
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
                            {/* All staff can view */}
                            <button
                              onClick={() => handleViewAssessment(assessment)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                              title="View assessment"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {/* Only assigned staff and admins can edit */}
                            {canEditAssessment(assessment) && (
                              <button
                                onClick={() => handleEditAssessment(assessment)}
                                className="text-emerald-600 hover:text-emerald-900 p-1 hover:bg-emerald-50 rounded transition-colors"
                                title="Edit assessment"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                            )}
                            
                            {/* Only admins can delete directly */}
                            {canDeleteAssessment() && (
                              <button
                                onClick={() => confirmDelete(assessment.id)}
                                className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                                title="Delete assessment"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            
                            {/* Staff can request deletion */}
                            {!canDeleteAssessment() && user?.role !== 'client' && (
                              <button
                                onClick={() => confirmDeleteRequest(assessment.id)}
                                className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded transition-colors"
                                title="Request deletion"
                              >
                                <AlertCircle className="h-4 w-4" />
                              </button>
                            )}
                            
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Delete Assessment</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this assessment? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAssessment(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Request Confirmation Modal */}
      {deleteRequestConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Request Assessment Deletion</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  This will send a deletion request to the administrator for approval. You will be notified when the request is reviewed.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={cancelDeleteRequest}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRequestDelete(deleteRequestConfirm)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}