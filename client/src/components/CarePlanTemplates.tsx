import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Calendar, Target, AlertTriangle, Lightbulb, Upload, Download, FileText, Settings, FolderOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface Recommendation {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
}

interface CarePlanTemplate {
  id: string
  category: string
  concern: string
  barrier: string
  targetDate?: string
  isOngoing: boolean
  recommendations: Recommendation[]
  createdBy: string
  createdAt: Date
  lastModified: Date
}

const categories = [
  'Medical Management',
  'Safety & Risk Assessment', 
  'Functional Independence',
  'Social & Family Support',
  'Mental Health & Wellbeing',
  'Nutrition & Hydration',
  'Medication Management',
  'Care Coordination',
  'Housing & Environment',
  'Transportation',
  'Financial Planning',
  'Legal & Advance Directives'
]

const concerns = {
  'Medical Management': [
    'Chronic Disease Management',
    'Medication Adherence',
    'Symptom Monitoring',
    'Healthcare Appointments',
    'Emergency Response Plan'
  ],
  'Safety & Risk Assessment': [
    'Fall Risk',
    'Home Safety Hazards',
    'Wandering/Elopement Risk',
    'Cognitive Impairment Safety',
    'Emergency Preparedness'
  ],
  'Functional Independence': [
    'Activities of Daily Living',
    'Instrumental Activities',
    'Mobility Issues',
    'Vision/Hearing Impairment',
    'Cognitive Function'
  ],
  'Social & Family Support': [
    'Social Isolation',
    'Family Caregiver Stress',
    'Community Engagement',
    'Support System Gaps',
    'Communication Issues'
  ],
  'Mental Health & Wellbeing': [
    'Depression/Anxiety',
    'Grief and Loss',
    'Behavioral Changes',
    'Sleep Disturbances',
    'Agitation/Aggression'
  ],
  'Nutrition & Hydration': [
    'Poor Appetite',
    'Weight Loss/Gain',
    'Swallowing Difficulties',
    'Meal Preparation',
    'Dietary Restrictions'
  ],
  'Medication Management': [
    'Multiple Medications',
    'Side Effects',
    'Compliance Issues',
    'Drug Interactions',
    'Cost Concerns'
  ],
  'Care Coordination': [
    'Multiple Providers',
    'Communication Gaps',
    'Service Coordination',
    'Transition Planning',
    'Documentation Issues'
  ],
  'Housing & Environment': [
    'Home Modifications Needed',
    'Unsafe Living Conditions',
    'Housing Instability',
    'Environmental Barriers',
    'Accessibility Issues'
  ],
  'Transportation': [
    'Limited Transportation',
    'Driving Safety Concerns',
    'Public Transit Barriers',
    'Medical Appointment Access',
    'Independence Limitations'
  ],
  'Financial Planning': [
    'Limited Financial Resources',
    'Insurance Coverage Gaps',
    'Benefit Eligibility',
    'Long-term Care Funding',
    'Financial Exploitation Risk'
  ],
  'Legal & Advance Directives': [
    'Missing Legal Documents',
    'Decision-Making Capacity',
    'Guardian/Conservator Needs',
    'Healthcare Directives',
    'Estate Planning'
  ]
}

export default function CarePlanTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<CarePlanTemplate[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CarePlanTemplate | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [availableConcerns, setAvailableConcerns] = useState<string[]>([])

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    concern: '',
    barrier: '',
    targetDate: '',
    isOngoing: false,
    recommendations: [] as Recommendation[]
  })

  const [newRecommendation, setNewRecommendation] = useState({
    text: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  })

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')

  // Category management
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [categories, setCategories] = useState<string[]>([
    'Behavioral and Emotional Concerns',
    'Cognitive', 
    'Daily habits and routines',
    'End of life',
    'Family and Caregiver Support',
    'Financial',
    'Healthcare Navigation',
    'Housing',
    'Legal',
    'Medical/health status',
    'Medications',
    'Nutrition',
    'Psychosocial',
    'Safety',
    'Support services',
    'Other'
  ])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingNewCategory, setAddingNewCategory] = useState(false)
  const [editingValue, setEditingValue] = useState('')
  const [showConfirmTooltip, setShowConfirmTooltip] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
    loadCategories()
  }, [])

  useEffect(() => {
    if (formData.category) {
      setAvailableConcerns(concerns[formData.category as keyof typeof concerns] || [])
      setFormData(prev => ({ ...prev, concern: '' }))
    }
  }, [formData.category])

  const loadTemplates = () => {
    const saved = localStorage.getItem('carePlanTemplates')
    if (saved) {
      const parsed = JSON.parse(saved).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        lastModified: new Date(t.lastModified)
      }))
      setTemplates(parsed)
    }
  }

  const saveTemplates = (newTemplates: CarePlanTemplate[]) => {
    localStorage.setItem('carePlanTemplates', JSON.stringify(newTemplates))
    setTemplates(newTemplates)
  }

  const loadCategories = () => {
    const saved = localStorage.getItem('carePlanCategories')
    if (saved) {
      setCategories(JSON.parse(saved))
    }
  }

  const saveCategories = (newCategories: string[]) => {
    localStorage.setItem('carePlanCategories', JSON.stringify(newCategories))
    setCategories(newCategories)
  }

  const resetForm = () => {
    setFormData({
      category: '',
      concern: '',
      barrier: '',
      targetDate: '',
      isOngoing: false,
      recommendations: []
    })
    setNewRecommendation({ text: '', priority: 'medium' })
    setSelectedCategory('')
    setAvailableConcerns([])
  }

  const openForm = (template?: CarePlanTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        category: template.category,
        concern: template.concern,
        barrier: template.barrier,
        targetDate: template.targetDate || '',
        isOngoing: template.isOngoing,
        recommendations: template.recommendations
      })
      setSelectedCategory(template.category)
      setAvailableConcerns(concerns[template.category as keyof typeof concerns] || [])
    } else {
      setEditingTemplate(null)
      resetForm()
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingTemplate(null)
    resetForm()
  }

  const addRecommendation = () => {
    if (newRecommendation.text.trim()) {
      const recommendation: Recommendation = {
        id: Date.now().toString(),
        text: newRecommendation.text.trim(),
        priority: newRecommendation.priority
      }
      setFormData(prev => ({
        ...prev,
        recommendations: [...prev.recommendations, recommendation]
      }))
      setNewRecommendation({ text: '', priority: 'medium' })
    }
  }

  const removeRecommendation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter(r => r.id !== id)
    }))
  }

  const saveTemplate = () => {
    if (!formData.category || !formData.concern || !formData.barrier || !formData.smartGoal) {
      alert('Please fill in all required fields')
      return
    }

    const now = new Date()
    const template: CarePlanTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      category: formData.category,
      concern: formData.concern,
      barrier: formData.barrier,
      targetDate: formData.isOngoing ? undefined : formData.targetDate,
      isOngoing: formData.isOngoing,
      recommendations: formData.recommendations,
      createdBy: user?.full_name || 'Unknown',
      createdAt: editingTemplate?.createdAt || now,
      lastModified: now
    }

    if (editingTemplate) {
      const updated = templates.map(t => t.id === editingTemplate.id ? template : t)
      saveTemplates(updated)
    } else {
      saveTemplates([...templates, template])
    }

    closeForm()
  }

  const deleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this care plan template?')) {
      const filtered = templates.filter(t => t.id !== id)
      saveTemplates(filtered)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const downloadTemplate = () => {
    const csvContent = [
      'Category,Concern,Barrier,Recommendations (separate multiple with |)',
      'Medical/health status,Medication adherence issues,Limited understanding of medication importance,Set up pill organizer|Provide medication education|Schedule regular check-ins',
      'Safety,Fall risk at home,Cluttered walkways and poor lighting,Install grab bars|Improve lighting|Clear walkways|Provide walker',
      'Daily habits and routines,Difficulty with bathing,Mobility limitations and fear of falling,Shower chair installation|Grab bar placement|Personal care assistance|Safety assessment'
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'care_plan_templates.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const parseCSV = (text: string): CarePlanTemplate[] => {
    const lines = text.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',')
    const templates: CarePlanTemplate[] = []

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',')
      if (row.length < 5) continue // Skip invalid rows

      const recommendationTexts = row[5] ? row[5].split('|').map(r => r.trim()).filter(r => r) : []
      const recommendationPriorities = row[6] ? row[6].split('|').map(p => p.trim()).filter(p => p) : []
      
      const recommendations: Recommendation[] = recommendationTexts.map((text, index) => ({
        id: `${Date.now()}-${index}`,
        text,
        priority: (recommendationPriorities[index] as 'high' | 'medium' | 'low') || 'medium'
      }))

      const template: CarePlanTemplate = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        category: row[0]?.trim() || '',
        concern: row[1]?.trim() || '',
        barrier: row[2]?.trim() || '',
        targetDate: row[3]?.trim() || '',
        isOngoing: row[4]?.toLowerCase() === 'true',
        recommendations,
        createdBy: user?.full_name || 'CSV Import',
        createdAt: new Date(),
        lastModified: new Date()
      }

      // Validate required fields
      if (template.category && template.concern && template.barrier) {
        templates.push(template)
      }
    }

    return templates
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setUploadFile(file)
      setUploadError('')
    } else {
      setUploadError('Please select a valid CSV file')
    }
  }

  const processUpload = async () => {
    if (!uploadFile) return

    setUploadProgress(10)
    setUploadError('')

    try {
      const text = await uploadFile.text()
      setUploadProgress(50)
      
      const newTemplates = parseCSV(text)
      setUploadProgress(80)
      
      if (newTemplates.length === 0) {
        setUploadError('No valid templates found in the CSV file')
        return
      }

      // Add new templates to existing ones
      const updatedTemplates = [...templates, ...newTemplates]
      saveTemplates(updatedTemplates)
      setUploadProgress(100)
      
      setTimeout(() => {
        setShowUploadModal(false)
        setUploadFile(null)
        setUploadProgress(0)
        alert(`Successfully imported ${newTemplates.length} care plan templates!`)
      }, 500)
      
    } catch (error) {
      setUploadError('Error processing file: ' + (error as Error).message)
      setUploadProgress(0)
    }
  }

  // Category management functions
  const addCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      const updatedCategories = [...categories, newCategoryName.trim()].sort()
      saveCategories(updatedCategories)
      setNewCategoryName('')
      setAddingNewCategory(false)
    }
  }

  const startEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName)
    setEditingValue(categoryName)
    setShowConfirmTooltip(null)
  }

  const cancelEditCategory = () => {
    setEditingCategory(null)
    setEditingValue('')
    setShowConfirmTooltip(null)
  }

  const confirmUpdateCategory = (oldName: string, newName: string) => {
    if (newName.trim() && oldName !== newName.trim()) {
      if (categories.includes(newName.trim())) {
        alert('A category with this name already exists.')
        return
      }
      
      const templateCount = getCategoryUsageCount(oldName)
      if (templateCount > 0) {
        setShowConfirmTooltip(oldName)
        return
      }
      
      updateCategory(oldName, newName)
    } else if (newName.trim() === oldName) {
      setEditingCategory(null)
      setEditingValue('')
    }
  }

  const updateCategory = (oldName: string, newName: string) => {
    const updatedCategories = categories.map(cat => cat === oldName ? newName.trim() : cat).sort()
    saveCategories(updatedCategories)
    
    // Update any templates that use this category
    const updatedTemplates = templates.map(template => 
      template.category === oldName 
        ? { ...template, category: newName.trim(), lastModified: new Date() }
        : template
    )
    saveTemplates(updatedTemplates)
    
    setEditingCategory(null)
    setEditingValue('')
    setShowConfirmTooltip(null)
  }

  const deleteCategory = (categoryName: string) => {
    if (confirm(`Are you sure you want to delete the category "${categoryName}"? This will also delete all templates in this category.`)) {
      const updatedCategories = categories.filter(cat => cat !== categoryName)
      saveCategories(updatedCategories)
      
      // Delete templates that use this category
      const updatedTemplates = templates.filter(template => template.category !== categoryName)
      saveTemplates(updatedTemplates)
    }
  }

  const getCategoryUsageCount = (categoryName: string) => {
    return templates.filter(template => template.category === categoryName).length
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">Care Plan Templates</h2>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCategoryManager(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage Categories
              </button>
              <button
                onClick={downloadTemplate}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </button>
              <button
                onClick={() => openForm()}
                className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </button>
            </div>
          </div>
          <p className="text-blue-100 mt-2 text-sm">
            Create and manage reusable care plan templates for consistent care planning
          </p>
        </div>

        {/* Templates List */}
        <div className="p-6">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
              <p className="text-gray-500 mb-4">Create your first care plan template to get started</p>
              <button
                onClick={() => openForm()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Template
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map(template => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full mb-2">
                        {template.category}
                      </span>
                      <h3 className="font-medium text-gray-900 text-sm">{template.concern}</h3>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => openForm(template)}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 line-clamp-2">{template.barrier}</span>
                    </div>
                    


                    {template.recommendations.length > 0 && (
                      <div className="flex items-center">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-gray-500 text-xs">
                          {template.recommendations.length} recommendation{template.recommendations.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-2 border-t">
                      <span className="text-xs text-gray-400">
                        Modified: {template.lastModified.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {editingTemplate ? 'Edit Care Plan Template' : 'New Care Plan Template'}
                </h3>
                <button
                  onClick={closeForm}
                  className="text-white hover:bg-blue-700 p-1 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Concern */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concern *
                </label>
                <select
                  value={formData.concern}
                  onChange={(e) => setFormData(prev => ({ ...prev, concern: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.category}
                >
                  <option value="">Select a concern</option>
                  {availableConcerns.map(concern => (
                    <option key={concern} value={concern}>{concern}</option>
                  ))}
                </select>
              </div>

              {/* Barrier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barrier *
                </label>
                <textarea
                  value={formData.barrier}
                  onChange={(e) => setFormData(prev => ({ ...prev, barrier: e.target.value }))}
                  rows={3}
                  placeholder="Describe the barrier or challenge..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>





              {/* Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recommendations
                </label>
                
                {/* Add New Recommendation */}
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newRecommendation.text}
                      onChange={(e) => setNewRecommendation(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter recommendation..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && addRecommendation()}
                    />
                    <select
                      value={newRecommendation.priority}
                      onChange={(e) => setNewRecommendation(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                    <button
                      onClick={addRecommendation}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Recommendations List */}
                {formData.recommendations.length > 0 && (
                  <div className="space-y-2">
                    {formData.recommendations.map(rec => (
                      <div key={rec.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-3">
                        <div className="flex items-center flex-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-3 ${getPriorityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                          <span className="text-gray-900">{rec.text}</span>
                        </div>
                        <button
                          onClick={() => removeRecommendation(rec.id)}
                          className="text-red-600 hover:bg-red-50 p-1 rounded ml-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                onClick={closeForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="bg-orange-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Bulk Upload Care Plan Templates</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadFile(null)
                    setUploadProgress(0)
                    setUploadError('')
                  }}
                  className="text-white hover:bg-orange-700 p-1 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-3">Upload a CSV file with care plan templates. Make sure your file follows the correct format.</p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                  <div className="flex items-start">
                    <FileText className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-blue-800 font-medium text-sm">Need the template format?</p>
                      <button
                        onClick={downloadTemplate}
                        className="text-blue-600 hover:text-blue-800 text-sm underline mt-1"
                      >
                        Download CSV template with examples
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {uploadFile && (
                <div className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-600 mr-2" />
                    <span className="text-sm text-gray-900">{uploadFile.name}</span>
                  </div>
                </div>
              )}

              {uploadProgress > 0 && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                  {uploadError}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-yellow-800 text-xs">
                    <p className="font-medium">CSV Format Requirements:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Headers: Category, Concern, Barrier, Target Date, Is Ongoing, Recommendations, Recommendation Priorities</li>
                      <li>Separate multiple recommendations with | (pipe character)</li>
                      <li>Use "true" or "false" for Is Ongoing column</li>
                      <li>Date format: YYYY-MM-DD</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadFile(null)
                  setUploadProgress(0)
                  setUploadError('')
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={uploadProgress > 0 && uploadProgress < 100}
              >
                Cancel
              </button>
              <button
                onClick={processUpload}
                disabled={!uploadFile || uploadProgress > 0}
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadProgress > 0 ? 'Processing...' : 'Upload Templates'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <FolderOpen className="h-5 w-5 mr-2" />
                  Manage Categories
                </h3>
                <button
                  onClick={() => {
                    setShowCategoryManager(false)
                    setEditingCategory(null)
                    setAddingNewCategory(false)
                    setNewCategoryName('')
                    setEditingValue('')
                    setShowConfirmTooltip(null)
                  }}
                  className="text-white hover:bg-purple-700 p-1 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-600">
                    Manage care plan template categories. Changes will affect all existing templates.
                  </p>
                  <button
                    onClick={() => setAddingNewCategory(true)}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Category
                  </button>
                </div>

                {addingNewCategory && (
                  <div className="bg-gray-50 rounded-md p-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter new category name"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') addCategory()
                          if (e.key === 'Escape') {
                            setAddingNewCategory(false)
                            setNewCategoryName('')
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={addCategory}
                        className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700"
                      >
                        <Save className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => {
                          setAddingNewCategory(false)
                          setNewCategoryName('')
                        }}
                        className="bg-gray-400 text-white px-2 py-1 rounded text-sm hover:bg-gray-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {categories.map((category, index) => (
                  <div key={category} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 relative">
                        {editingCategory === category ? (
                          <div className="relative">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="w-full px-2 py-1 border border-purple-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  confirmUpdateCategory(category, editingValue)
                                }
                                if (e.key === 'Escape') {
                                  cancelEditCategory()
                                }
                              }}
                              onBlur={() => {
                                // Delay to allow clicking confirmation tooltip
                                setTimeout(() => {
                                  if (!showConfirmTooltip) {
                                    confirmUpdateCategory(category, editingValue)
                                  }
                                }, 150)
                              }}
                              autoFocus
                            />
                            
                            {/* Confirmation Tooltip */}
                            {showConfirmTooltip === category && (
                              <div className="absolute top-full left-0 mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg z-10 w-64">
                                <div className="flex items-start">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm">
                                    <p className="font-medium text-yellow-800 mb-1">Confirm Category Update</p>
                                    <p className="text-yellow-700 mb-3">
                                      This will update {getCategoryUsageCount(category)} template{getCategoryUsageCount(category) !== 1 ? 's' : ''} from "{category}" to "{editingValue}".
                                    </p>
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={() => updateCategory(category, editingValue)}
                                        className="bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700"
                                      >
                                        Confirm
                                      </button>
                                      <button
                                        onClick={() => {
                                          setShowConfirmTooltip(null)
                                          cancelEditCategory()
                                        }}
                                        className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium text-gray-900">{category}</span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({getCategoryUsageCount(category)} template{getCategoryUsageCount(category) !== 1 ? 's' : ''})
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-3">
                        {editingCategory === category ? (
                          <>
                            <button
                              onClick={() => confirmUpdateCategory(category, editingValue)}
                              className="text-green-600 hover:bg-green-50 p-1 rounded"
                              title="Save changes"
                            >
                              <Save className="h-3 w-3" />
                            </button>
                            <button
                              onClick={cancelEditCategory}
                              className="text-gray-600 hover:bg-gray-50 p-1 rounded"
                              title="Cancel edit"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditCategory(category)}
                              className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                              title="Edit category"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteCategory(category)}
                              className="text-red-600 hover:bg-red-50 p-1 rounded"
                              title="Delete category"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No categories found. Add a new category to get started.</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {categories.length} categories total
              </div>
              <button
                onClick={() => {
                  setShowCategoryManager(false)
                  setEditingCategory(null)
                  setAddingNewCategory(false)
                  setNewCategoryName('')
                  setEditingValue('')
                  setShowConfirmTooltip(null)
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}