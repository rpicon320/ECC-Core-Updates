import React, { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Search, Sparkles, Upload, Download, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { 
  getMedications, 
  createMedication, 
  updateMedication, 
  deleteMedication,
  generateMedicationDescription,
  generateBulkMedicationData,
  initializeMedicationsDatabase,
  type Medication 
} from '../lib/firestoreService'

export default function MedicationsLibrary() {
  const { user } = useAuth()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState<{success: number, failed: number, errors: string[]}>({success: 0, failed: 0, errors: []})
  const [isBulkGenerating, setIsBulkGenerating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState<{current: number, total: number, currentMedication: string}>({current: 0, total: 0, currentMedication: ''})
  const [bulkResults, setBulkResults] = useState<{success: number, failed: number, errors: string[]}>({success: 0, failed: 0, errors: []})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    doses: [''],
    frequencies: [''],
    usedFor: '',
    potentialSideEffects: '',
    description: ''
  })

  useEffect(() => {
    loadMedications()
  }, [])

  const loadMedications = async () => {
    try {
      setLoading(true)
      // Initialize database if needed
      await initializeMedicationsDatabase()
      const fetchedMedications = await getMedications()
      setMedications(fetchedMedications)
    } catch (error) {
      console.error('Error loading medications:', error)
      setError('Failed to load medications')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      doses: [''],
      frequencies: [''],
      usedFor: '',
      potentialSideEffects: '',
      description: ''
    })
    setEditingMedication(null)
    setShowForm(false)
  }

  const openForm = (medication?: Medication) => {
    if (medication) {
      setFormData({
        name: medication.name,
        doses: medication.doses.length > 0 ? medication.doses : [''],
        frequencies: medication.frequencies.length > 0 ? medication.frequencies : [''],
        usedFor: medication.usedFor || '',
        potentialSideEffects: medication.potentialSideEffects || '',
        description: medication.description || ''
      })
      setEditingMedication(medication)
    } else {
      resetForm()
    }
    setShowForm(true)
  }

  const handleDoseChange = (index: number, value: string) => {
    const newDoses = [...formData.doses]
    newDoses[index] = value
    setFormData({ ...formData, doses: newDoses })
  }

  const addDose = () => {
    setFormData({ ...formData, doses: [...formData.doses, ''] })
  }

  const removeDose = (index: number) => {
    if (formData.doses.length > 1) {
      const newDoses = formData.doses.filter((_, i) => i !== index)
      setFormData({ ...formData, doses: newDoses })
    }
  }

  const handleFrequencyChange = (index: number, value: string) => {
    const newFrequencies = [...formData.frequencies]
    newFrequencies[index] = value
    setFormData({ ...formData, frequencies: newFrequencies })
  }

  const addFrequency = () => {
    setFormData({ ...formData, frequencies: [...formData.frequencies, ''] })
  }

  const removeFrequency = (index: number) => {
    if (formData.frequencies.length > 1) {
      const newFrequencies = formData.frequencies.filter((_, i) => i !== index)
      setFormData({ ...formData, frequencies: newFrequencies })
    }
  }

  const handleAIGenerate = async () => {
    if (!formData.name || !formData.usedFor) {
      setError('Please provide medication name and usage before generating description')
      setTimeout(() => setError(''), 5000)
      return
    }

    setIsGeneratingDescription(true)
    try {
      const result = await generateMedicationDescription({
        name: formData.name,
        usedFor: formData.usedFor,
        doses: formData.doses.filter(d => d.trim()),
        frequencies: formData.frequencies.filter(f => f.trim())
      })

      if (result.success) {
        setFormData({ ...formData, description: result.description })
        setSuccess('AI-generated description added successfully!')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(result.error || 'Failed to generate description')
        setTimeout(() => setError(''), 8000)
      }
    } catch (error: any) {
      console.error('Error generating medication description:', error)
      setError(error?.message || 'Failed to generate description')
      setTimeout(() => setError(''), 8000)
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Medication name is required')
      setTimeout(() => setError(''), 5000)
      return
    }

    const filteredDoses = formData.doses.filter(dose => dose.trim())
    const filteredFrequencies = formData.frequencies.filter(freq => freq.trim())

    if (filteredDoses.length === 0) {
      setError('At least one dose is required')
      setTimeout(() => setError(''), 5000)
      return
    }

    if (filteredFrequencies.length === 0) {
      setError('At least one frequency is required')
      setTimeout(() => setError(''), 5000)
      return
    }

    try {
      const medicationData = {
        name: formData.name.trim(),
        doses: filteredDoses,
        frequencies: filteredFrequencies,
        usedFor: formData.usedFor.trim(),
        potentialSideEffects: formData.potentialSideEffects.trim(),
        description: formData.description.trim(),
        isActive: true,
        createdBy: user?.id || user?.email || 'unknown',
        createdAt: new Date(),
        lastModified: new Date()
      }

      if (editingMedication) {
        await updateMedication(editingMedication.id!, medicationData)
        setSuccess('Medication updated successfully!')
      } else {
        await createMedication(medicationData)
        setSuccess('Medication created successfully!')
      }

      setTimeout(() => setSuccess(''), 5000)
      resetForm()
      await loadMedications()
    } catch (error) {
      console.error('Error saving medication:', error)
      setError('Failed to save medication. Please try again.')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleDelete = async (medication: Medication) => {
    if (!confirm(`Are you sure you want to delete "${medication.name}"?`)) {
      return
    }

    try {
      await deleteMedication(medication.id!)
      setSuccess('Medication deleted successfully!')
      setTimeout(() => setSuccess(''), 5000)
      await loadMedications()
    } catch (error) {
      console.error('Error deleting medication:', error)
      setError('Failed to delete medication')
      setTimeout(() => setError(''), 5000)
    }
  }

  const handleBulkUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      setTimeout(() => setError(''), 5000)
      return
    }

    setUploading(true)
    setUploadResults({success: 0, failed: 0, errors: []})

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length === 0) {
        setError('CSV file is empty')
        setTimeout(() => setError(''), 5000)
        return
      }

      // Remove header if it exists (check if first line contains "name" or "medication")
      const startIndex = lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('medication') ? 1 : 0
      const medicationNames = lines.slice(startIndex).map(line => line.split(',')[0].trim()).filter(name => name)

      if (medicationNames.length === 0) {
        setError('No valid medication names found in CSV')
        setTimeout(() => setError(''), 5000)
        return
      }

      let successCount = 0
      let failedCount = 0
      const errors: string[] = []

      for (const name of medicationNames) {
        try {
          if (!name) continue

          // Check if medication already exists
          const existingMedication = medications.find(med => 
            med.name.toLowerCase() === name.toLowerCase()
          )

          if (existingMedication) {
            failedCount++
            errors.push(`${name}: Already exists`)
            continue
          }

          const medicationData = {
            name: name,
            doses: [''], // Empty dose - user can edit later
            frequencies: [''], // Empty frequency - user can edit later
            usedFor: '', // Empty - user can edit later
            potentialSideEffects: '', // Empty - user can edit later
            description: '', // Empty - user can edit later
            isActive: true,
            createdBy: user?.id || user?.email || 'unknown',
            createdAt: new Date(),
            lastModified: new Date()
          }

          await createMedication(medicationData)
          successCount++
        } catch (error) {
          failedCount++
          errors.push(`${name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      setUploadResults({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // Show only first 10 errors
      })

      if (successCount > 0) {
        setSuccess(`Successfully uploaded ${successCount} medication${successCount === 1 ? '' : 's'}`)
        setTimeout(() => setSuccess(''), 5000)
        await loadMedications()
      }

    } catch (error) {
      console.error('Error processing CSV:', error)
      setError('Failed to process CSV file')
      setTimeout(() => setError(''), 5000)
    } finally {
      setUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const downloadTemplate = () => {
    const csvContent = 'Medication Name\nLisinopril\nMetformin\nAtorvastatin\nLevothyroxine\nOmeprazole'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'medication_names_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const handleBulkGenerate = async () => {
    if (!user) {
      setError('You must be logged in to generate medication data')
      setTimeout(() => setError(''), 5000)
      return
    }

    // Get medications that need AI generation (those with empty doses, frequencies, or usedFor)
    const medicationsToGenerate = medications.filter(med => 
      med.name && (
        !med.doses?.length || 
        med.doses.every(d => !d.trim()) ||
        !med.frequencies?.length || 
        med.frequencies.every(f => !f.trim()) ||
        !med.usedFor?.trim()
      )
    )

    if (medicationsToGenerate.length === 0) {
      setError('No medications found that need AI generation')
      setTimeout(() => setError(''), 5000)
      return
    }

    const confirmed = window.confirm(
      `This will generate AI-powered doses, frequencies, and usage information for ${medicationsToGenerate.length} medications. This may take several minutes and use OpenAI API credits. Continue?`
    )

    if (!confirmed) return

    setIsBulkGenerating(true)
    setBulkProgress({current: 0, total: medicationsToGenerate.length, currentMedication: ''})
    setBulkResults({success: 0, failed: 0, errors: []})

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    try {
      for (let i = 0; i < medicationsToGenerate.length; i++) {
        const medication = medicationsToGenerate[i]
        setBulkProgress({
          current: i + 1,
          total: medicationsToGenerate.length,
          currentMedication: medication.name
        })

        try {
          const result = await generateBulkMedicationData(medication.name)
          
          if (result.success && result.data) {
            // Update the medication with generated data
            const updatedData = {
              doses: result.data.doses.filter(d => d.trim()),
              frequencies: result.data.frequencies.filter(f => f.trim()),
              usedFor: result.data.usedFor || '',
              potentialSideEffects: result.data.potentialSideEffects || ''
            }

            await updateMedication(medication.id!, updatedData)
            successCount++
          } else {
            failedCount++
            errors.push(`${medication.name}: ${result.error || 'Unknown error'}`)
          }
        } catch (error) {
          failedCount++
          errors.push(`${medication.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }

        // Small delay to avoid overwhelming the API
        if (i < medicationsToGenerate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      setBulkResults({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // Show only first 10 errors
      })

      if (successCount > 0) {
        setSuccess(`Successfully generated data for ${successCount} medication${successCount === 1 ? '' : 's'}`)
        setTimeout(() => setSuccess(''), 5000)
        await loadMedications()
      }

      if (failedCount > 0) {
        setError(`Failed to generate data for ${failedCount} medication${failedCount === 1 ? '' : 's'}. Check the results below for details.`)
        setTimeout(() => setError(''), 8000)
      }

    } catch (error) {
      console.error('Error during bulk generation:', error)
      setError('Failed to complete bulk generation')
      setTimeout(() => setError(''), 5000)
    } finally {
      setIsBulkGenerating(false)
      setBulkProgress({current: 0, total: 0, currentMedication: ''})
    }
  }

  const filteredMedications = medications.filter(medication =>
    medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medication.usedFor?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64 animate-in fade-in duration-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-500 animate-pulse">Loading medications...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Medications Library</h2>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
          >
            <Download className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            Template
          </button>
          <button
            onClick={handleBulkUpload}
            disabled={uploading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-400 flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <Upload className={`w-4 h-4 transition-transform duration-200 ${uploading ? 'animate-pulse' : 'group-hover:scale-110'}`} />
            {uploading ? 'Uploading...' : 'Bulk Upload'}
          </button>
          <button
            onClick={handleBulkGenerate}
            disabled={isBulkGenerating}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-400 flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            <Sparkles className={`w-4 h-4 transition-transform duration-200 ${isBulkGenerating ? 'animate-spin' : 'group-hover:scale-110'}`} />
            {isBulkGenerating ? 'Generating...' : 'Bulk Generate AI'}
          </button>
          <button
            onClick={() => openForm()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 group"
          >
            <Plus className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-90" />
            Add New Medication
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        style={{ display: 'none' }}
      />

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Upload Results */}
      {(uploadResults.success > 0 || uploadResults.failed > 0) && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-medium text-blue-900 mb-2">Upload Results</h3>
          <div className="text-sm text-blue-800">
            <p>✅ Successfully uploaded: {uploadResults.success} medication{uploadResults.success === 1 ? '' : 's'}</p>
            {uploadResults.failed > 0 && (
              <p>❌ Failed: {uploadResults.failed} medication{uploadResults.failed === 1 ? '' : 's'}</p>
            )}
            {uploadResults.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">View Error Details</summary>
                <ul className="mt-1 ml-4 space-y-1">
                  {uploadResults.errors.map((error, index) => (
                    <li key={index} className="text-xs text-red-600">• {error}</li>
                  ))}
                  {uploadResults.failed > uploadResults.errors.length && (
                    <li className="text-xs text-gray-600">... and {uploadResults.failed - uploadResults.errors.length} more errors</li>
                  )}
                </ul>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Bulk Generation Progress */}
      {isBulkGenerating && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded">
          <h3 className="font-medium text-purple-900 mb-2">AI Generation in Progress</h3>
          <div className="text-sm text-purple-800">
            <p>Processing medication {bulkProgress.current} of {bulkProgress.total}</p>
            <p className="font-medium">Current: {bulkProgress.currentMedication}</p>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1 text-purple-600">
              {Math.round((bulkProgress.current / bulkProgress.total) * 100)}% Complete
            </p>
          </div>
        </div>
      )}

      {/* Bulk Generation Results */}
      {(bulkResults.success > 0 || bulkResults.failed > 0) && !isBulkGenerating && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded">
          <h3 className="font-medium text-purple-900 mb-2">AI Generation Results</h3>
          <div className="text-sm text-purple-800">
            <p>✅ Successfully generated: {bulkResults.success} medication{bulkResults.success === 1 ? '' : 's'}</p>
            {bulkResults.failed > 0 && (
              <p>❌ Failed: {bulkResults.failed} medication{bulkResults.failed === 1 ? '' : 's'}</p>
            )}
            {bulkResults.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-purple-600">View Error Details</summary>
                <ul className="mt-1 ml-4 space-y-1">
                  {bulkResults.errors.map((error, index) => (
                    <li key={index} className="text-xs text-red-600">• {error}</li>
                  ))}
                  {bulkResults.failed > bulkResults.errors.length && (
                    <li className="text-xs text-gray-600">... and {bulkResults.failed - bulkResults.errors.length} more errors</li>
                  )}
                </ul>
              </details>
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6 animate-in slide-in-from-top-4 duration-300">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 transition-all duration-200 group-focus-within:text-blue-500 group-focus-within:scale-110" />
          <input
            type="text"
            placeholder="Search medications by name or usage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 focus:shadow-lg"
          />
        </div>
      </div>

      {/* Medications Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden animate-in slide-in-from-bottom-4 duration-400">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition-colors duration-200 hover:text-gray-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition-colors duration-200 hover:text-gray-700">
                  Doses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition-colors duration-200 hover:text-gray-700">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition-colors duration-200 hover:text-gray-700">
                  Used For
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider transition-colors duration-200 hover:text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedications.map((medication, index) => (
                <tr 
                  key={medication.id} 
                  className="hover:bg-gray-50 transition-all duration-200 hover:shadow-sm animate-in slide-in-from-left-4 ease-out"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{medication.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {medication.doses.slice(0, 2).map((dose, index) => (
                        <span 
                          key={index} 
                          className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1 transition-all duration-200 hover:bg-blue-200 hover:scale-105 animate-in fade-in zoom-in-95"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {dose}
                        </span>
                      ))}
                      {medication.doses.length > 2 && (
                        <span className="text-xs text-gray-500 animate-in fade-in delay-200">+{medication.doses.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {medication.frequencies.slice(0, 2).map((freq, index) => (
                        <span 
                          key={index} 
                          className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1 transition-all duration-200 hover:bg-green-200 hover:scale-105 animate-in fade-in zoom-in-95"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {freq}
                        </span>
                      ))}
                      {medication.frequencies.length > 2 && (
                        <span className="text-xs text-gray-500 animate-in fade-in delay-200">+{medication.frequencies.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {medication.usedFor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openForm(medication)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-all duration-200 hover:scale-110 active:scale-95 group"
                      >
                        <Edit2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                      </button>
                      <button
                        onClick={() => handleDelete(medication)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-110 active:scale-95 group"
                      >
                        <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMedications.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? 'No medications found matching your search.' : 'No medications in the library yet.'}
            </div>
            {!searchTerm && (
              <button
                onClick={() => openForm()}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add First Medication
              </button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 ease-out">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editingMedication ? 'Edit Medication' : 'Add New Medication'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {editingMedication ? 'Update medication information' : 'Add a new medication to the library'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Medication Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter medication name (e.g., Lisinopril, Metformin)"
                  required
                />
                <p className="text-xs text-gray-500">Enter the generic or brand name of the medication</p>
              </div>

              {/* Doses */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Available Doses <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.doses.map((dose, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={dose}
                        onChange={(e) => handleDoseChange(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., 5mg, 10mg, 25mg"
                      />
                      {formData.doses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDose(index)}
                          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addDose}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Dose
                </button>
                <p className="text-xs text-gray-500">Add all available strengths for this medication</p>
              </div>

              {/* Frequencies */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Frequency Options <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {formData.frequencies.map((frequency, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={frequency}
                        onChange={(e) => handleFrequencyChange(index, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Once daily, Twice daily, As needed"
                      />
                      {formData.frequencies.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFrequency(index)}
                          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFrequency}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Frequency
                </button>
                <p className="text-xs text-gray-500">Add common dosing frequencies for this medication</p>
              </div>

              {/* Two-column layout for Used For and Side Effects */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Used For */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Used For
                  </label>
                  <textarea
                    value={formData.usedFor}
                    onChange={(e) => setFormData({ ...formData, usedFor: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="What conditions or symptoms is this medication used to treat?"
                  />
                  <p className="text-xs text-gray-500">Describe the primary therapeutic uses</p>
                </div>


              </div>

              {/* Description with AI Generate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-900">
                    Professional Description
                  </label>
                  <button
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={isGeneratingDescription || !formData.name}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 text-sm font-medium transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder="Professional clinical description for care managers and healthcare staff (optional)"
                />
                <p className="text-xs text-gray-500">Use AI to generate professional medical descriptions or write your own</p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Fields marked with <span className="text-red-500">*</span> are required
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2 group"
                  >
                    {editingMedication ? (
                      <>
                        <Edit2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        Update Medication
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-90" />
                        Create Medication
                      </>
                    )}
                  </button>
                </div>
              </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}