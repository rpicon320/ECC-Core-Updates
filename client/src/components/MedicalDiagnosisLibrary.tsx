import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Upload, Download, Search, X, Check, AlertTriangle, Package, Tag, CheckCircle, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { 
  MedicalDiagnosis,
  getMedicalDiagnoses,
  createMedicalDiagnosis,
  updateMedicalDiagnosis,
  deleteMedicalDiagnosis,
  batchCreateMedicalDiagnoses,
  initializeSampleMedicalDiagnoses,
  getMedicalDiagnosisCategories,
  initializeMedicalDiagnosisDatabase
} from '../lib/firestoreService'
import { generateDiagnosisDescription } from '../lib/openaiService'



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
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: ''
  })

  useEffect(() => {
    initializeAndLoadDiagnoses()
  }, [])

  const initializeAndLoadDiagnoses = async () => {
    try {
      setLoading(true)
      console.log('Initializing Medical Diagnosis Database...')
      
      // Initialize the database first
      await initializeMedicalDiagnosisDatabase()
      
      // Then load the data
      await loadDiagnoses()
    } catch (error) {
      console.error('Error initializing database:', error)
      setError('Database initialization failed. Please check Firestore configuration.')
    } finally {
      setLoading(false)
    }
  }

  const loadDiagnoses = async () => {
    try {
      setLoading(true)
      
      // Try to load diagnoses from Firestore
      const diagnosesData = await getMedicalDiagnoses()
      setDiagnoses(diagnosesData)
      
      // Extract categories from loaded diagnoses
      const extractedCategories = Array.from(new Set(diagnosesData.map(d => d.category))).sort()
      setCategories(extractedCategories.length > 0 ? extractedCategories : [
        'Cardiovascular', 'Endocrine & Metabolic', 'Respiratory', 
        'Neurological & Mental Health', 'Musculoskeletal', 'Other'
      ])
      
      // If we have no data, try to initialize sample data
      if (diagnosesData.length === 0) {
        console.log('No diagnoses found, initializing sample data...')
        await initializeSampleMedicalDiagnoses()
        // Reload after initialization
        const newDiagnosesData = await getMedicalDiagnoses()
        setDiagnoses(newDiagnosesData)
        
        // Update categories after initialization
        const newCategories = Array.from(new Set(newDiagnosesData.map(d => d.category))).sort()
        setCategories(newCategories)
      }
    } catch (err) {
      console.error('Error loading diagnoses:', err)
      // Show specific error message about Firestore configuration
      if (err instanceof Error && err.message.includes('failed-precondition')) {
        setError('Firestore database not configured. Please contact administrator to set up the database.')
      } else {
        setError(`Failed to load diagnoses: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
      
      // Set default categories even if loading fails
      setCategories([
        'Cardiovascular', 'Endocrine & Metabolic', 'Respiratory', 
        'Neurological & Mental Health', 'Musculoskeletal', 'Other'
      ])
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

  const handleEditCategory = async (oldName: string, newName: string) => {
    if (!newName.trim()) {
      setError('Category name is required')
      return
    }

    if (newName.trim() === oldName) {
      setEditingCategory(null)
      setEditCategoryName('')
      return
    }

    if (categories.includes(newName.trim())) {
      setError('Category already exists')
      return
    }

    try {
      // Update category in local array
      const updatedCategories = categories.map(cat => cat === oldName ? newName.trim() : cat).sort()
      setCategories(updatedCategories)
      
      // Update any diagnoses that use this category
      const updatedDiagnoses = diagnoses.map(diagnosis => 
        diagnosis.category === oldName 
          ? { ...diagnosis, category: newName.trim() }
          : diagnosis
      )
      setDiagnoses(updatedDiagnoses)
      
      setEditingCategory(null)
      setEditCategoryName('')
      setSuccess(`Category renamed from "${oldName}" to "${newName.trim()}"`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update category')
      console.error('Error updating category:', err)
    }
  }

  const handleBulkGenerateDescriptions = async () => {
    setIsGeneratingDescription(true)
    setError('')
    setSuccess('')

    try {
      const diagnosesWithoutDescriptions = diagnoses.filter(d => !d.description || d.description.trim() === '')
      
      if (diagnosesWithoutDescriptions.length === 0) {
        setSuccess('All diagnoses already have descriptions!')
        setTimeout(() => setSuccess(''), 3000)
        return
      }

      setSuccess(`Generating descriptions for ${diagnosesWithoutDescriptions.length} diagnoses...`)
      let completed = 0

      for (const diagnosis of diagnosesWithoutDescriptions) {
        try {
          const result = await generateDiagnosisDescription({
            name: diagnosis.name,
            category: diagnosis.category
          })

          if (result.success) {
            await updateMedicalDiagnosis(diagnosis.id!, { description: result.description })
            completed++
            setSuccess(`Generated ${completed}/${diagnosesWithoutDescriptions.length} descriptions...`)
          } else {
            console.error(`Failed to generate description for ${diagnosis.name}:`, result.error)
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (error) {
          console.error(`Error generating description for ${diagnosis.name}:`, error)
        }
      }

      setSuccess(`Successfully generated descriptions for ${completed} diagnoses!`)
      setTimeout(() => setSuccess(''), 5000)
      
      // Reload diagnoses to show the new descriptions
      await loadDiagnoses()
    } catch (error) {
      console.error('Error in bulk generation:', error)
      setError('Failed to generate descriptions. Please try again.')
      setTimeout(() => setError(''), 8000)
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleGenerateDescription = async () => {
    if (!formData.name.trim() || !formData.category) {
      setError('Please enter a diagnosis name and select a category first')
      return
    }

    setIsGeneratingDescription(true)
    setError('')

    try {
      const result = await generateDiagnosisDescription({
        name: formData.name.trim(),
        category: formData.category
      })

      if (result.success) {
        setFormData(prev => ({ ...prev, description: result.description }))
        setSuccess('AI description generated successfully!')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(result.error || 'Failed to generate description')
        setTimeout(() => setError(''), 8000) // Clear error after 8 seconds
      }
    } catch (error) {
      console.error('Error generating description:', error)
      setError('Failed to generate description. Please try again.')
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      // Check if any diagnoses use this category
      const diagnosesUsingCategory = diagnoses.filter(d => d.category === categoryName)
      
      if (diagnosesUsingCategory.length > 0) {
        setError(`Cannot delete category "${categoryName}" because it is used by ${diagnosesUsingCategory.length} diagnosis(es)`)
        return
      }

      // Remove category from local array
      const updatedCategories = categories.filter(cat => cat !== categoryName)
      setCategories(updatedCategories)
      
      setSuccess(`Category "${categoryName}" deleted successfully`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete category')
      console.error('Error deleting category:', err)
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
        code: selectedDiagnosis?.code || '',
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

      // Reset form data
      setFormData({ name: '', category: '', description: '' })
      setSelectedDiagnosis(null)
      
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file)
        setError('')
      } else {
        setError('Please select a CSV file')
      }
    }
  }

  const handleCsvUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first')
      return
    }

    try {
      setLoading(true)
      const text = await selectedFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        setError('CSV file must contain at least a header row and one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const requiredHeaders = ['name', 'category']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        setError(`Missing required columns: ${missingHeaders.join(', ')}`)
        return
      }

      const nameIndex = headers.indexOf('name')
      const categoryIndex = headers.indexOf('category')
      const descriptionIndex = headers.indexOf('description')

      const newDiagnoses: Omit<MedicalDiagnosis, 'id'>[] = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        
        const name = values[nameIndex]
        const category = values[categoryIndex]
        const description = descriptionIndex >= 0 ? values[descriptionIndex] : ''

        if (!name || !category) {
          setError(`Row ${i + 1}: Name and category are required`)
          return
        }

        const diagnosis: Omit<MedicalDiagnosis, 'id'> = {
          code: '', // Not used in simplified form
          name,
          category,
          description,
          commonSymptoms: [], // Not used in simplified form
          riskFactors: [], // Not used in simplified form
          isActive: true,
          createdBy: user?.id || 'admin',
          createdAt: new Date(),
          lastModified: new Date()
        }
        newDiagnoses.push(diagnosis)
      }

      console.log('Attempting to save diagnoses to Firestore:', newDiagnoses)
      await batchCreateMedicalDiagnoses(newDiagnoses)
      console.log('Diagnoses saved successfully, reloading...')
      await loadDiagnoses() // Reload the list
      setSuccess(`Imported ${newDiagnoses.length} diagnoses successfully`)
      setShowCsvUpload(false)
      setSelectedFile(null)
      setIsDragOver(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to import CSV file: ${errorMessage}`)
      console.error('Error importing CSV:', err)
    } finally {
      setLoading(false)
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
            onClick={handleBulkGenerateDescriptions}
            disabled={isGeneratingDescription}
            className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isGeneratingDescription ? 'Generating...' : 'AI Generate All'}
          </button>
          <button
            onClick={() => setShowCategoryManager(true)}
            className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Tag className="h-4 w-4 mr-2" />
            Manage Categories
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
                      Name
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
                        <div className="text-sm font-medium text-gray-900">{diagnosis.name}</div>
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openForm(diagnosis)}
                          className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded mr-2 transition-colors"
                          title="Edit diagnosis"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(diagnosis.id!)}
                          className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete diagnosis"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
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
                  onClick={() => {
                    setShowForm(false)
                    setSelectedDiagnosis(null)
                    setFormData({ name: '', category: '', description: '' })
                    setError('')
                  }}
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={!formData.name.trim() || !formData.category || isGeneratingDescription}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Generate AI description"
                    >
                      <Sparkles className="h-3 w-3 mr-1" />
                      {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
                    </button>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Brief description of the diagnosis (or use AI Generate button)"
                  />
                  {isGeneratingDescription && (
                    <div className="mt-1 text-xs text-purple-600 flex items-center">
                      <div className="inline-block animate-spin rounded-full h-3 w-3 border-b border-purple-600 mr-1"></div>
                      Generating AI description...
                    </div>
                  )}
                </div>



                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setSelectedDiagnosis(null)
                      setFormData({ name: '', category: '', description: '' })
                      setError('')
                    }}
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

      {/* Category Manager Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Manage Categories</h3>
                <button
                  onClick={() => {
                    setShowCategoryManager(false)
                    setShowCategoryForm(false)
                    setNewCategoryName('')
                    setEditingCategory(null)
                    setEditCategoryName('')
                    setError('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Category
                </button>
              </div>

              {/* Add Category Form */}
              {showCategoryForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <form onSubmit={(e) => { e.preventDefault(); handleCreateCategory(); }} className="space-y-3">
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
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Add Category
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCategoryForm(false)
                          setNewCategoryName('')
                        }}
                        className="px-3 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Categories List */}
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {categories.map((category, index) => {
                    const diagnosisCount = diagnoses.filter(d => d.category === category).length
                    return (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          {editingCategory === category ? (
                            <form 
                              onSubmit={(e) => { 
                                e.preventDefault(); 
                                handleEditCategory(category, editCategoryName); 
                              }}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="text"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="p-1 text-green-600 hover:text-green-800"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory(null)
                                  setEditCategoryName('')
                                }}
                                className="p-1 text-gray-600 hover:text-gray-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </form>
                          ) : (
                            <div className="flex items-center">
                              <span className="font-medium">{category}</span>
                              <span className="ml-2 text-sm text-gray-500">
                                ({diagnosisCount} diagnosis{diagnosisCount !== 1 ? 'es' : ''})
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {editingCategory !== category && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingCategory(category)
                                setEditCategoryName(category)
                              }}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Edit category"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete category"
                              disabled={diagnosisCount > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowCategoryManager(false)
                    setShowCategoryForm(false)
                    setNewCategoryName('')
                    setEditingCategory(null)
                    setEditCategoryName('')
                    setError('')
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Done
                </button>
              </div>
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
                  onClick={() => {
                    setShowCsvUpload(false)
                    setSelectedFile(null)
                    setIsDragOver(false)
                    setError('')
                  }}
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

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${isDragOver 
                    ? 'border-blue-500 bg-blue-50' 
                    : selectedFile 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }
                `}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="flex flex-col items-center">
                  {selectedFile ? (
                    <>
                      <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                      <p className="text-sm font-medium text-green-700 mb-1">
                        File Selected
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Click here or drag another file to replace
                      </p>
                    </>
                  ) : isDragOver ? (
                    <>
                      <Upload className="h-12 w-12 text-blue-500 mb-3" />
                      <p className="text-sm font-medium text-blue-700">
                        Release to upload CSV file
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Drag and drop your CSV file here
                      </p>
                      <p className="text-xs text-gray-500">
                        or click to browse files
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCsvUpload(false)
                    setSelectedFile(null)
                    setIsDragOver(false)
                    setError('')
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCsvUpload}
                  disabled={!selectedFile || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}