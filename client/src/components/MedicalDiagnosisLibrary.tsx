import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload, Download, Search, X, Check, AlertTriangle, Package, Tag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { 
  MedicalDiagnosis,
  getMedicalDiagnoses,
  createMedicalDiagnosis,
  updateMedicalDiagnosis,
  deleteMedicalDiagnosis,
  batchCreateMedicalDiagnoses,
  initializeSampleMedicalDiagnoses,
  getMedicalDiagnosisCategories
} from '../lib/firestoreService'



const DIAGNOSIS_CATEGORIES = [
  'Cardiovascular',
  'Respiratory', 
  'Neurological & Mental Health',
  'Musculoskeletal',
  'Endocrine & Metabolic',
  'Gastrointestinal',
  'Urological & Renal',
  'Cancer & Hematological',
  'Dermatological',
  'Sensory & Miscellaneous',
  'Other'
]

export default function MedicalDiagnosisLibrary() {
  const { user } = useAuth()
  const [diagnoses, setDiagnoses] = useState<MedicalDiagnosis[]>([])
  const [categories, setCategories] = useState<string[]>(DIAGNOSIS_CATEGORIES)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<MedicalDiagnosis | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showCsvUpload, setShowCsvUpload] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: ''
  })

  useEffect(() => {
    loadDiagnoses()
  }, [])

  const loadDiagnoses = async () => {
    try {
      setLoading(true)
      // Initialize sample data if needed
      await initializeSampleMedicalDiagnoses()
      
      // Load diagnoses from Firestore
      const diagnosesData = await getMedicalDiagnoses()
      setDiagnoses(diagnosesData)
    } catch (err) {
      setError('Failed to load diagnoses')
      console.error('Error loading diagnoses:', err)
    } finally {
      setLoading(false)
    }
  }

  const openForm = (diagnosis?: MedicalDiagnosis) => {
    if (diagnosis) {
      setSelectedDiagnosis(diagnosis)
      setFormData({
        name: diagnosis.name,
        category: diagnosis.category,
        description: diagnosis.description || ''
      })
    } else {
      setSelectedDiagnosis(null)
      setFormData({
        name: '',
        category: '',
        description: ''
      })
    }
    setShowForm(true)
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setError('Category name is required')
      return
    }

    if (categories.includes(newCategoryName.trim())) {
      setError('Category already exists')
      return
    }

    try {
      // Add new category to the local array
      const updatedCategories = [...categories, newCategoryName.trim()].sort()
      setCategories(updatedCategories)
      setNewCategoryName('')
      setShowCategoryForm(false)
      setSuccess(`Category "${newCategoryName.trim()}" created successfully. Create a diagnosis with this category to save it permanently.`)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      setError('Failed to create category')
      console.error('Error creating category:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.category) {
      setError('Diagnosis name and category are required')
      return
    }

    try {
      const diagnosisData: Omit<MedicalDiagnosis, 'id'> = {
        code: '',
        name: formData.name.trim(),  
        category: formData.category,
        description: formData.description.trim(),
        commonSymptoms: [],
        riskFactors: [],
        isActive: true,
        createdBy: user?.id || 'admin',
        createdAt: selectedDiagnosis?.createdAt || new Date(),
        lastModified: new Date()
      }

      if (selectedDiagnosis) {
        // Update existing diagnosis
        await updateMedicalDiagnosis(selectedDiagnosis.id!, diagnosisData)
        setSuccess('Diagnosis updated successfully')
      } else {
        // Create new diagnosis
        await createMedicalDiagnosis(diagnosisData)
        setSuccess('Diagnosis created successfully')
      }

      // Reload diagnoses
      await loadDiagnoses()
      setShowForm(false)
      setError('')
    } catch (err) {
      setError('Failed to save diagnosis')
      console.error('Error saving diagnosis:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMedicalDiagnosis(id)
      await loadDiagnoses() // Reload the list
      setSuccess('Diagnosis deleted successfully')
      setShowDeleteConfirm(null)
    } catch (err) {
      setError('Failed to delete diagnosis')
      console.error('Error deleting diagnosis:', err)
    }
  }

  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const requiredHeaders = ['name', 'category']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        setError(`Missing required columns: ${missingHeaders.join(', ')}`)
        return
      }

      const newDiagnoses: Omit<MedicalDiagnosis, 'id'>[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const diagnosisData: any = {}
        
        headers.forEach((header, index) => {
          diagnosisData[header] = values[index] || ''
        })

        if (diagnosisData.name && diagnosisData.category) {
          const diagnosis: Omit<MedicalDiagnosis, 'id'> = {
            code: diagnosisData.code || '',
            name: diagnosisData.name,
            category: diagnosisData.category,
            description: diagnosisData.description || '',
            commonSymptoms: diagnosisData.commonsymptoms ? diagnosisData.commonsymptoms.split(';').map((s: string) => s.trim()) : [],
            riskFactors: diagnosisData.riskfactors ? diagnosisData.riskfactors.split(';').map((s: string) => s.trim()) : [],
            isActive: true,
            createdBy: user?.id || 'admin',
            createdAt: new Date(),
            lastModified: new Date()
          }
          newDiagnoses.push(diagnosis)
        }
      }

      await batchCreateMedicalDiagnoses(newDiagnoses)
      await loadDiagnoses() // Reload the list
      setSuccess(`Imported ${newDiagnoses.length} diagnoses successfully`)
      setShowCsvUpload(false)
    } catch (err) {
      setError('Failed to import CSV file')
      console.error('Error importing CSV:', err)
    }
  }

  const exportToCsv = () => {
    const headers = ['Code', 'Name', 'Category', 'Description', 'Common Symptoms', 'Risk Factors']
    const csvContent = [
      headers.join(','),
      ...filteredDiagnoses.map(d => [
        d.code,
        `"${d.name}"`,
        d.category,
        `"${d.description || ''}"`,
        `"${d.commonSymptoms?.join('; ') || ''}"`,
        `"${d.riskFactors?.join('; ') || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'medical-diagnoses.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredDiagnoses = diagnoses.filter(diagnosis => {
    const matchesSearch = !searchTerm || 
      diagnosis.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'All' || diagnosis.category === selectedCategory
    
    return matchesSearch && matchesCategory && diagnosis.isActive
  })

  const getCategoryCount = (category: string) => {
    return diagnoses.filter(d => d.category === category && d.isActive).length
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Medical Diagnosis Library</h2>
          <p className="text-sm text-gray-600">
            Manage medical diagnoses organized by category for use in assessments
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Category
          </button>
          <button
            onClick={() => setShowCsvUpload(true)}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </button>
          <button
            onClick={() => openForm()}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Diagnosis
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code, name, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Categories ({diagnoses.filter(d => d.isActive).length})</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category} ({getCategoryCount(category)})
            </option>
          ))}
        </select>
      </div>

      {/* Diagnoses List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading diagnoses...</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {filteredDiagnoses.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No diagnoses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first medical diagnosis'
                }
              </p>
              {!searchTerm && selectedCategory === 'All' && (
                <button
                  onClick={() => openForm()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Diagnosis
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code & Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDiagnoses.map((diagnosis) => (
                    <tr key={diagnosis.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{diagnosis.code}</div>
                          <div className="text-sm text-gray-600">{diagnosis.name}</div>
                          {diagnosis.commonSymptoms && diagnosis.commonSymptoms.length > 0 && (
                            <div className="mt-1 text-xs text-blue-600">
                              Symptoms: {diagnosis.commonSymptoms.slice(0, 2).join(', ')}
                              {diagnosis.commonSymptoms.length > 2 && '...'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Tag className="h-3 w-3 mr-1" />
                          {diagnosis.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {diagnosis.description || 'No description provided'}
                        </div>
                        {diagnosis.riskFactors && diagnosis.riskFactors.length > 0 && (
                          <div className="mt-1 text-xs text-orange-600">
                            Risk factors: {diagnosis.riskFactors.slice(0, 2).join(', ')}
                            {diagnosis.riskFactors.length > 2 && '...'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openForm(diagnosis)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(diagnosis.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedDiagnosis ? 'Edit Diagnosis' : 'Add New Diagnosis'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Essential hypertension"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Brief description of the diagnosis"
                  />
                </div>



                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {selectedDiagnosis ? 'Update' : 'Create'} Diagnosis
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Delete Diagnosis</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this diagnosis? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Category</h3>
                <button
                  onClick={() => {
                    setShowCategoryForm(false)
                    setNewCategoryName('')
                    setError('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateCategory(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter category name"
                    required
                    autoFocus
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false)
                      setNewCategoryName('')
                      setError('')
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCsvUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Import CSV File</h3>
                <button
                  onClick={() => setShowCsvUpload(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Upload a CSV file with the following required columns:
                </p>
                <ul className="text-xs text-gray-500 mb-4 space-y-1">
                  <li>• <strong>name</strong> - Diagnosis name (required)</li>
                  <li>• <strong>category</strong> - Category name (required)</li>
                  <li>• <strong>description</strong> - Brief description (optional)</li>
                </ul>
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCsvUpload(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}