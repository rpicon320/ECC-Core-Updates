import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Edit, Trash2, Shield, User, Key, Users, UserCheck, Link, RefreshCw, Copy, Eye, EyeOff, Mail, AlertTriangle } from 'lucide-react'
import { User as UserType, ClientUser, Client } from '../lib/mockData'
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getClientUsers,
  getClients,
  updateClient,
  updateClientUser,
  generateNewAccessCode,
  resendVerificationEmail
} from '../lib/firestoreService'
import { isValidStaffEmailDomain } from '../lib/emailService'

export default function Admin() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'staff' | 'clients' | 'templates'>('staff')
  const [users, setUsers] = useState<UserType[]>([])
  const [clientUsers, setClientUsers] = useState<ClientUser[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserForm, setShowUserForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAccessCodes, setShowAccessCodes] = useState<Record<string, boolean>>({})

  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'care_manager' as 'admin' | 'care_manager',
    title: '',
    phone: '',
  })

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchData()
    }
  }, [profile])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersData, clientUsersData, clientsData] = await Promise.all([
        getUsers(),
        getClientUsers(),
        getClients()
      ])
      setUsers(usersData)
      setClientUsers(clientUsersData)
      setClients(clientsData)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate email domain
      if (!isValidStaffEmailDomain(userFormData.email)) {
        throw new Error('Staff users must have an @eldercareva.com email address')
      }

      const users = await getUsers()
      
      // Check if email already exists
      if (users.some(u => u.email === userFormData.email)) {
        throw new Error('A user with this email already exists')
      }

      const newUserData = {
        email: userFormData.email,
        password: userFormData.password,
        full_name: userFormData.full_name,
        role: userFormData.role,
        title: userFormData.title || null,
        phone: userFormData.phone || null,
        signature_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: profile?.id,
        is_active: true,
        email_verified: false,
      }

      await createUser(newUserData)

      setSuccess('User created successfully! A verification email has been sent to their email address.')
      setShowUserForm(false)
      setUserFormData({
        email: '',
        password: '',
        full_name: '',
        role: 'care_manager',
        title: '',
        phone: '',
      })
      fetchData()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate email domain if email is being updated
      if (userFormData.email !== selectedUser.email && !isValidStaffEmailDomain(userFormData.email)) {
        throw new Error('Staff users must have an @eldercareva.com email address')
      }

      const updates = {
        email: userFormData.email,
        full_name: userFormData.full_name,
        role: userFormData.role,
        title: userFormData.title || null,
        phone: userFormData.phone || null,
      }

      await updateUser(selectedUser.id, updates)

      if (userFormData.email !== selectedUser.email) {
        setSuccess('User updated successfully! A new verification email has been sent due to email change.')
      } else {
        setSuccess('User updated successfully!')
      }
      
      setShowUserForm(false)
      setSelectedUser(null)
      fetchData()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async (userId: string, userType: 'staff' | 'client') => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const emailSent = await resendVerificationEmail(userId, userType)
      if (emailSent) {
        setSuccess('Verification email sent successfully!')
      } else {
        setError('Failed to send verification email. Please try again.')
      }
      
      fetchData()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await deleteUser(userId)
      setSuccess('User deactivated successfully!')
      fetchData()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateNewAccessCode = async (clientId: string) => {
    if (!confirm('Are you sure you want to generate a new access code? The old code will no longer work.')) {
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const newAccessCode = await generateNewAccessCode(clientId)
      setSuccess(`New access code generated: ${newAccessCode}`)
      fetchData()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAccessCode = (accessCode: string) => {
    navigator.clipboard.writeText(accessCode)
    setSuccess('Access code copied to clipboard!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const toggleShowAccessCode = (clientId: string) => {
    setShowAccessCodes(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }))
  }

  const openEditForm = (user: UserType) => {
    setSelectedUser(user)
    setUserFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
      title: user.title || '',
      phone: user.phone || '',
    })
    setShowUserForm(true)
  }

  const openCreateForm = () => {
    setSelectedUser(null)
    setUserFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'care_manager',
      title: '',
      phone: '',
    })
    setShowUserForm(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isAccessCodeExpiring = (client: Client) => {
    if (!client.access_code_expires) return false
    const expirationDate = new Date(client.access_code_expires)
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiration <= 14
  }

  if (profile?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Management</h1>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('staff')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'staff'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Staff Users
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'clients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserCheck className="h-4 w-4 inline mr-2" />
                Client Access Management
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Staff Users Tab */}
        {activeTab === 'staff' && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Staff Users (Admins & Care Managers)</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Staff users must have an @eldercareva.com email address and verify their email before accessing the system.
                </p>
              </div>
              <button
                onClick={openCreateForm}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Staff User
              </button>
            </div>

            {showUserForm && (
              <div className="mb-6 bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedUser ? 'Edit Staff User' : 'Create New Staff User'}
                </h3>
                
                <form onSubmit={selectedUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="user@eldercareva.com"
                      />
                      <p className="text-xs text-gray-500 mt-1">Must be an @eldercareva.com email address</p>
                    </div>

                    {!selectedUser && (
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          id="password"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                          required
                          minLength={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        value={userFormData.full_name}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role *
                      </label>
                      <select
                        id="role"
                        value={userFormData.role}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'care_manager' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="care_manager">Care Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={userFormData.title}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., RN, LMSW"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={userFormData.phone}
                        onChange={(e) => setUserFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Email Verification Required</h4>
                    <p className="text-sm text-blue-800">
                      {selectedUser ? 
                        'If you change the email address, a new verification email will be sent and the user will need to verify before accessing the system.' :
                        'A verification email will be sent to the user. They must verify their email address before they can sign in.'
                      }
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserForm(false)
                        setSelectedUser(null)
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Saving...' : (selectedUser ? 'Update User' : 'Create User')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {loading && !showUserForm ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                <div className="text-sm text-gray-500 flex items-center">
                                  {user.email}
                                  {!user.email_verified && (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" title="Email not verified" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.role === 'admin' ? (
                                <Shield className="h-4 w-4 text-red-500 mr-2" />
                              ) : (
                                <User className="h-4 w-4 text-blue-500 mr-2" />
                              )}
                              <span className="text-sm text-gray-900">
                                {user.role === 'admin' ? 'Administrator' : 'Care Manager'}
                              </span>
                            </div>
                            {user.title && (
                              <div className="text-sm text-gray-500">{user.title}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.phone || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.is_active 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.is_active ? 'Active' : 'Inactive'}
                              </span>
                              <div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  user.email_verified 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {user.email_verified ? 'Verified' : 'Unverified'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openEditForm(user)}
                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                title="Edit user"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {!user.email_verified && (
                                <button
                                  onClick={() => handleResendVerification(user.id, 'staff')}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Resend verification email"
                                >
                                  <Mail className="h-4 w-4" />
                                </button>
                              )}
                              {user.id !== profile?.id && (
                                <button
                                  onClick={() => handleDeactivateUser(user.id)}
                                  className="text-red-600 hover:text-red-900 p-1"
                                  title="Deactivate user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Client Access Management Tab */}
        {activeTab === 'clients' && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Client Portal Access Management</h2>
              <p className="text-sm text-gray-600">
                Manage client access codes for secure portal authentication. Clients use their name, date of birth, and access code to log in.
              </p>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading clients...</p>
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
                          Access Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clients.map((client) => {
                        const isExpiring = isAccessCodeExpiring(client)
                        const isExpired = client.access_code_expires && new Date(client.access_code_expires) < new Date()
                        
                        return (
                          <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <UserCheck className="h-5 w-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {client.preferred_name || client.first_name} {client.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    DOB: {formatDate(client.date_of_birth)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <code className={`text-sm font-mono px-2 py-1 rounded ${
                                  showAccessCodes[client.id] ? 'bg-gray-100' : 'bg-gray-200'
                                }`}>
                                  {showAccessCodes[client.id] ? client.access_code : '••••••••'}
                                </code>
                                <button
                                  onClick={() => toggleShowAccessCode(client.id)}
                                  className="text-gray-400 hover:text-gray-600 p-1"
                                  title={showAccessCodes[client.id] ? 'Hide access code' : 'Show access code'}
                                >
                                  {showAccessCodes[client.id] ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                                {showAccessCodes[client.id] && (
                                  <button
                                    onClick={() => handleCopyAccessCode(client.access_code!)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="Copy access code"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className={`${
                                isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-600' : 'text-gray-900'
                              }`}>
                                {client.access_code_expires ? formatDate(client.access_code_expires) : 'Never'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                isExpired 
                                  ? 'bg-red-100 text-red-800' 
                                  : isExpiring 
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {isExpired ? 'Expired' : isExpiring ? 'Expiring Soon' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => handleGenerateNewAccessCode(client.id)}
                                  className="text-blue-600 hover:text-blue-900 p-1"
                                  title="Generate new access code"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </button>
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

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Client Portal Access Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Clients authenticate using their first name, last name, date of birth, and access code</li>
                <li>• Access codes are automatically generated and expire after 90 days for security</li>
                <li>• Use the refresh button to generate a new access code when needed</li>
                <li>• Provide the access code to clients securely (phone, secure email, or in person)</li>
                <li>• Clients can only view their own personal information - no access to other client data</li>
                <li>• Monitor expiration dates and proactively generate new codes for active clients</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}