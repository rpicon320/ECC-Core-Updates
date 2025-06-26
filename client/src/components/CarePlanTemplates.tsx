import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Calendar, Target, AlertTriangle, Lightbulb, Upload, Download, FileText, Settings, FolderOpen, ChevronDown, ChevronRight, List, Undo2, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { 
  getCarePlanTemplates, 
  createCarePlanTemplate, 
  updateCarePlanTemplate, 
  deleteCarePlanTemplate, 
  deleteAllCarePlanTemplates,
  batchCreateCarePlanTemplates,
  getCarePlanCategories,
  saveCarePlanCategories,
  CarePlanTemplate,
  Recommendation
} from '../lib/firestoreService'

// Standardized care plan categories - these are the only allowed categories
const standardizedCategories = [
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
]

// Complete concerns mapping for all 16 standardized categories
const concerns = {
  'Behavioral and Emotional Concerns': [
    'Depression/Anxiety',
    'Grief and Loss',
    'Behavioral Changes',
    'Sleep Disturbances',
    'Emotional Support',
    'Agitation',
    'Confusion',
    'Wandering'
  ],
  'Cognitive': [
    'Memory Loss',
    'Confusion',
    'Decision Making',
    'Safety Awareness',
    'Communication Difficulties',
    'Orientation Issues'
  ],
  'Daily habits and routines': [
    'Activities of Daily Living',
    'Instrumental Activities',
    'Mobility Issues',
    'Personal Hygiene',
    'Meal Preparation',
    'Household Management'
  ],
  'End of life': [
    'Advance Directives',
    'Comfort Care',
    'Pain Management',
    'Family Communication',
    'Spiritual Support',
    'Hospice Services'
  ],
  'Family and Caregiver Support': [
    'Caregiver Burden',
    'Family Communication',
    'Support Network Development',
    'Respite Care',
    'Education and Training',
    'Stress Management'
  ],
  'Financial': [
    'Budget Management',
    'Healthcare Costs',
    'Insurance Coverage',
    'Benefits Access',
    'Financial Exploitation Prevention',
    'Money Management'
  ],
  'Healthcare Navigation': [
    'Healthcare Team Communication',
    'Appointment Scheduling',
    'Medical Records Management',
    'Insurance Coordination',
    'Provider Communication',
    'Health System Navigation'
  ],
  'Housing': [
    'Home Modifications',
    'Accessibility Issues',
    'Housing Stability',
    'Environmental Safety',
    'Relocation Planning',
    'Independent Living'
  ],
  'Legal': [
    'Healthcare Directives',
    'Power of Attorney',
    'Legal Documentation',
    'Guardianship Issues',
    'Rights Protection',
    'Estate Planning'
  ],
  'Medical/health status': [
    'Chronic Disease Management',
    'Symptom Monitoring',
    'Healthcare Appointments',
    'Emergency Response Plan',
    'Health Maintenance',
    'Preventive Care'
  ],
  'Medications': [
    'Medication Adherence',
    'Polypharmacy',
    'Side Effects',
    'Medication Storage',
    'Medication Management',
    'Drug Interactions'
  ],
  'Nutrition': [
    'Poor Appetite',
    'Weight Loss/Gain',
    'Swallowing Difficulties',
    'Dietary Restrictions',
    'Malnutrition',
    'Hydration'
  ],
  'Psychosocial': [
    'Social Isolation',
    'Community Engagement',
    'Mental Health',
    'Relationships',
    'Recreation',
    'Quality of Life'
  ],
  'Safety': [
    'Fall Risk',
    'Home Safety Hazards',
    'Driving Safety',
    'Emergency Preparedness',
    'Medication Safety',
    'Cognitive Safety'
  ],
  'Support services': [
    'Service Coordination',
    'Resource Access',
    'Transportation',
    'Home Care Services',
    'Community Programs',
    'Emergency Services'
  ],
  'Other': [
    'Communication',
    'Technology',
    'Cultural/Spiritual',
    'Pet Care',
    'Miscellaneous'
  ]
}

export default function CarePlanTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<CarePlanTemplate[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CarePlanTemplate | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    concern: '',
    goal: '',
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
  
  // Accordion state management
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, CarePlanTemplate[]>)

  // Removed old localStorage loading - now handled by loadData() in the main useEffect



  // Loading state
  const [loading, setLoading] = useState(true)
  
  // Track if categories have been fixed (to hide the button)
  const [categoriesFixed, setCategoriesFixed] = useState(false)

  // Standardized categories - these are the only allowed categories
  const standardCategories = [
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
  ]

  // Load templates and categories from Firestore
  const loadData = async () => {
    setLoading(true)
    try {
      console.log('Loading templates from Firestore...')
      
      // Force a fresh fetch from Firestore
      const templatesData = await getCarePlanTemplates()
      const categoriesData = await getCarePlanCategories()
      
      console.log('Loaded templates:', templatesData.length)
      console.log('Template IDs:', templatesData.map(t => t.id))
      
      setTemplates(templatesData)
      
      // Always use standardized categories
      setCategories(standardCategories)
      
      // Save standardized categories to Firestore to ensure consistency
      await saveCarePlanCategories(standardCategories)
    } catch (error) {
      console.error('Error loading care plan data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Function to clean up and standardize template categories
  const cleanupTemplateCategories = async (silent = false) => {
    if (!silent && !confirm('This will standardize all template categories to match the approved list. Any templates with non-standard categories will be moved to "Other" or closest match. Continue?')) {
      return
    }

    try {
      setLoading(true)
      
      // Create mapping for common variations to standard categories
      const categoryMapping: { [key: string]: string } = {
        'Medical Management': 'Medical/health status',
        'Safety & Risk Assessment': 'Safety',
        'Functional Independence': 'Daily habits and routines',
        'Social & Family Support': 'Family and Caregiver Support',
        'Mental Health & Wellbeing': 'Behavioral and Emotional Concerns',
        'Nutrition & Hydration': 'Nutrition',
        'Medication Management': 'Medications',
        'Care Coordination': 'Healthcare Navigation',
        'Housing & Environment': 'Housing',
        'Transportation': 'Other',
        'Financial Planning': 'Financial',
        'Legal & Advance Directives': 'Legal',
        'Activities': 'Daily habits and routines',
        'Communication': 'Other',
        'Environment': 'Housing',
        'Family': 'Family and Caregiver Support',
        'Cognitive and Memory Issues': 'Cognitive',
        'Social Support and Engagement': 'Psychosocial',
        'Activities of Daily Living': 'Daily habits and routines',
        'Mobility and Movement': 'Other',
        'Environmental Concerns': 'Housing',
        'Technology and Equipment': 'Other',
        'Spiritual and Cultural': 'Psychosocial',
        'Quality of Life': 'Psychosocial'
      }

      let updatedCount = 0
      const updatePromises = templates.map(async (template) => {
        let newCategory = template.category
        
        // Check if category needs to be standardized
        if (!standardCategories.includes(template.category)) {
          newCategory = categoryMapping[template.category] || 'Other'
          
          if (template.id && newCategory !== template.category) {
            await updateCarePlanTemplate(template.id, { category: newCategory })
            updatedCount++
          }
        }
      })

      await Promise.all(updatePromises)
      
      // Reload data to show changes
      await loadData()
      
      // Mark categories as fixed to hide the button
      setCategoriesFixed(true)
      
      if (!silent) {
        if (updatedCount > 0) {
          alert(`Successfully standardized ${updatedCount} template categories.`)
        } else {
          alert('All template categories are already standardized.')
        }
      }
    } catch (error) {
      console.error('Error cleaning up categories:', error)
      if (!silent) {
        alert('Error standardizing categories. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Initialize data on component mount and run fix categories once
  useEffect(() => {
    const initializeData = async () => {
      await loadData()
      // Auto-run the fix categories function once (silently)
      if (!categoriesFixed) {
        await cleanupTemplateCategories(true)
      }
    }
    initializeData()
  }, [])

  const resetForm = () => {
    setFormData({
      category: '',
      concern: '',
      goal: '',
      barrier: '',
      targetDate: '',
      isOngoing: false,
      recommendations: []
    })
    setNewRecommendation({ text: '', priority: 'medium' })
    setSelectedCategory('')
  }

  const openForm = (template?: CarePlanTemplate) => {
    if (template) {
      setEditingTemplate(template)
      setFormData({
        category: template.category,
        concern: template.concern,
        goal: template.goal,
        barrier: template.barrier,
        targetDate: template.targetDate || '',
        isOngoing: template.isOngoing,
        recommendations: template.recommendations
      })
      setSelectedCategory(template.category)
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

  const saveTemplate = async () => {
    if (!formData.category || !formData.concern || !formData.goal || !formData.barrier) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const templateData = {
        category: formData.category,
        concern: formData.concern,
        goal: formData.goal,
        barrier: formData.barrier,
        targetDate: formData.isOngoing ? undefined : formData.targetDate,
        isOngoing: formData.isOngoing,
        recommendations: formData.recommendations,
        createdBy: (user as any)?.firstName && (user as any)?.lastName ? `${(user as any).firstName} ${(user as any).lastName}` : 'Unknown',
        createdAt: editingTemplate?.createdAt || new Date(),
        lastModified: new Date()
      }

      if (editingTemplate && editingTemplate.id) {
        await updateCarePlanTemplate(editingTemplate.id, templateData)
      } else {
        await createCarePlanTemplate(templateData)
      }

      await loadData() // Reload data to get latest changes
      closeForm()
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error saving template. Please try again.')
    }
  }

  const deleteTemplate = async (id: string) => {
    if (confirm('Are you sure you want to delete this care plan template?')) {
      try {
        await deleteCarePlanTemplate(id)
        await loadData() // Reload data to reflect changes
      } catch (error) {
        console.error('Error deleting template:', error)
        alert('Error deleting template. Please try again.')
      }
    }
  }

  const undoLastBulkUpload = async () => {
    if (!confirm('Are you sure you want to undo the last bulk upload? This will remove templates created in the last 30 minutes.')) {
      return
    }

    try {
      setLoading(true)
      
      // Get current timestamp minus 30 minutes
      const thirtyMinutesAgo = new Date()
      thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30)
      
      // Find templates created in the last 30 minutes
      const recentTemplates = templates.filter(template => {
        const createdAt = template.createdAt instanceof Date ? template.createdAt : new Date(template.createdAt)
        return createdAt > thirtyMinutesAgo
      })

      if (recentTemplates.length === 0) {
        alert('No templates found from the last 30 minutes to undo.')
        return
      }

      if (!confirm(`Found ${recentTemplates.length} templates from the last 30 minutes. Delete these templates?`)) {
        return
      }

      // Delete recent templates
      const deletePromises = recentTemplates.map(template => 
        template.id ? deleteCarePlanTemplate(template.id) : Promise.resolve()
      )
      
      await Promise.all(deletePromises)
      await loadData() // Refresh the data
      
      alert(`Successfully removed ${recentTemplates.length} templates from the last bulk upload.`)
    } catch (error) {
      console.error('Error undoing bulk upload:', error)
      alert('Error undoing bulk upload. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deleteAllTemplates = async () => {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL care plan templates from Firestore. This action cannot be undone. Are you absolutely sure?')) {
      return
    }

    try {
      setLoading(true)
      console.log('Deleting all templates from Firestore...')
      
      // Get fresh data from Firestore to ensure we have the latest
      const freshTemplates = await getCarePlanTemplates()
      console.log('Found templates in Firestore to delete:', freshTemplates.length)
      
      if (freshTemplates.length === 0) {
        console.log('No templates found in Firestore')
        setTemplates([])
        alert('No templates found in Firestore to delete.')
        return
      }
      
      // Use batch delete for better performance
      const deletedCount = await deleteAllCarePlanTemplates()
      console.log('Batch delete completed, deleted count:', deletedCount)
      
      // Clear local state
      setTemplates([])
      
      // Reload to confirm deletion
      await loadData()
      
      alert(`Successfully deleted ${deletedCount} templates from Firestore. Only empty categories remain.`)
    } catch (error) {
      console.error('Error deleting templates from Firestore:', error)
      alert('Error deleting templates from Firestore. Please try again.')
    } finally {
      setLoading(false)
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
      'Category,Concern,Goal,Barrier,Recommendations (separate multiple with |)',
      'Medical/health status,Medication adherence issues,Client will take medications as prescribed daily,Limited understanding of medication importance,Set up pill organizer|Provide medication education|Schedule regular check-ins',
      'Safety,Fall risk at home,Client will safely navigate home environment without falls,Cluttered walkways and poor lighting,Install grab bars|Improve lighting|Clear walkways|Provide walker',
      'Daily habits and routines,Difficulty with bathing,Client will maintain personal hygiene independently,Mobility limitations and fear of falling,Shower chair installation|Grab bar placement|Personal care assistance|Safety assessment'
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

  // Proper CSV parser that handles quoted fields with commas
  const parseCSVLine = (line: string): string[] => {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  const parseCSV = (text: string): CarePlanTemplate[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row')
    }
    
    const headers = parseCSVLine(lines[0])
    console.log('CSV Headers:', headers)
    
    // Validate header format
    const expectedHeaders = ['Category', 'Concern', 'Goal', 'Barrier', 'Recommendations']
    const hasValidHeaders = expectedHeaders.every((header, index) => 
      headers[index] && headers[index].toLowerCase().includes(header.toLowerCase())
    )
    
    if (!hasValidHeaders) {
      throw new Error(`CSV must have headers: ${expectedHeaders.join(', ')}. Found: ${headers.join(', ')}`)
    }
    
    const templates: CarePlanTemplate[] = []
    let validCount = 0
    let skippedCount = 0

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i])
      
      if (row.length < 4) {
        skippedCount++
        continue // Skip invalid rows
      }

      // Clean up field values by removing extra quotes
      const cleanField = (field: string) => field.replace(/^["']|["']$/g, '').trim()
      
      const category = cleanField(row[0] || '')
      const concern = cleanField(row[1] || '')
      const goal = cleanField(row[2] || '')
      const barrier = cleanField(row[3] || '')
      const recommendationsText = cleanField(row[4] || '')
      
      // Validate that category is one of our standardized categories
      const normalizedCategory = category.toLowerCase()
      const validCategory = standardizedCategories.find(cat => 
        cat.toLowerCase() === normalizedCategory || 
        cat.toLowerCase().includes(normalizedCategory) ||
        normalizedCategory.includes(cat.toLowerCase())
      )
      
      if (!validCategory) {
        console.log(`Skipping row ${i}: invalid category "${category}". Must be one of the 16 standardized categories.`)
        skippedCount++
        continue
      }

      // Validate minimum field lengths
      if (!concern || concern.length < 5 || !goal || goal.length < 5 || !barrier || barrier.length < 5) {
        console.log(`Skipping row ${i}: fields too short. Concern: "${concern}", Goal: "${goal}", Barrier: "${barrier}"`)
        skippedCount++
        continue
      }

      const recommendationTexts = recommendationsText ? 
        recommendationsText.split('|').map(r => r.trim()).filter(r => r) : []
      
      const recommendations: Recommendation[] = recommendationTexts.map((text, index) => ({
        id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`,
        text,
        priority: 'medium' as const
      }))

      const template: CarePlanTemplate = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        category: validCategory, // Use the matched standardized category
        concern,
        goal,
        barrier,
        targetDate: '',
        isOngoing: false,
        recommendations,
        createdBy: (user as any)?.firstName && (user as any)?.lastName ? `${(user as any).firstName} ${(user as any).lastName}` : 'CSV Import',
        createdAt: new Date(),
        lastModified: new Date()
      }

      console.log(`Valid template ${validCount + 1}:`, template.category, '-', template.concern)
      templates.push(template)
      validCount++
    }

    console.log(`Import summary: ${validCount} valid templates, ${skippedCount} rows skipped`)
    
    if (validCount === 0) {
      throw new Error('No valid templates found. Please check that your CSV has the correct format with valid categories and complete data.')
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
      console.log('Starting CSV upload process...')
      const text = await uploadFile.text()
      console.log('CSV file read, content length:', text.length)
      setUploadProgress(50)
      
      const newTemplates = parseCSV(text)
      console.log('Parsed templates:', newTemplates.length)
      console.log('First template:', newTemplates[0])
      setUploadProgress(80)
      
      if (newTemplates.length === 0) {
        setUploadError('No valid templates found in the CSV file')
        return
      }

      // Add new templates to Firestore
      console.log('Adding templates to Firestore...')
      await batchCreateCarePlanTemplates(newTemplates)
      console.log('Templates added successfully, reloading data...')
      await loadData() // Reload to get latest data
      setUploadProgress(100)
      
      setTimeout(() => {
        setShowUploadModal(false)
        setUploadFile(null)
        setUploadProgress(0)
        alert(`Successfully imported ${newTemplates.length} care plan templates!`)
      }, 500)
      
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Error processing file: ' + (error as Error).message)
      setUploadProgress(0)
    }
  }

  // Category management functions
  const addCategory = async () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      try {
        const updatedCategories = [...categories, newCategoryName.trim()].sort()
        await saveCarePlanCategories(updatedCategories)
        setCategories(updatedCategories)
        setNewCategoryName('')
        setAddingNewCategory(false)
      } catch (error) {
        console.error('Error adding category:', error)
        alert('Error adding category. Please try again.')
      }
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

  const updateCategory = async (oldName: string, newName: string) => {
    try {
      const updatedCategories = categories.map(cat => cat === oldName ? newName.trim() : cat).sort()
      await saveCarePlanCategories(updatedCategories)
      setCategories(updatedCategories)
      
      // Update any templates that use this category
      const templatesWithOldCategory = templates.filter(template => template.category === oldName)
      for (const template of templatesWithOldCategory) {
        await updateCarePlanTemplate(template.id!, { 
          category: newName.trim(),
          lastModified: new Date()
        })
      }
      
      await loadData() // Reload to get latest data
      setEditingCategory(null)
      setEditingValue('')
      setShowConfirmTooltip(null)
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error updating category. Please try again.')
    }
  }

  const deleteCategory = async (categoryName: string) => {
    if (confirm(`Are you sure you want to delete the category "${categoryName}"? This will also delete all templates in this category.`)) {
      try {
        const updatedCategories = categories.filter(cat => cat !== categoryName)
        await saveCarePlanCategories(updatedCategories)
        setCategories(updatedCategories)
        
        // Delete templates that use this category
        const templatesWithCategory = templates.filter(template => template.category === categoryName)
        for (const template of templatesWithCategory) {
          await deleteCarePlanTemplate(template.id!)
        }
        
        await loadData() // Reload to get latest data
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Error deleting category. Please try again.')
      }
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
                onClick={undoLastBulkUpload}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center"
                disabled={loading}
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Undo Last Upload
              </button>
              {!categoriesFixed && (
                <button
                  onClick={() => cleanupTemplateCategories(false)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 flex items-center"
                  disabled={loading || templates.length === 0}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Fix Categories
                </button>
              )}
              <button
                onClick={deleteAllTemplates}
                className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 flex items-center"
                disabled={loading || templates.length === 0}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Delete All Templates
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
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading care plan templates...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Show helpful message when no templates exist at all */}
              {templates.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Start Creating Templates</h4>
                      <p className="text-sm text-blue-600">Expand any category below and click "Add Template" to create your first care plan template.</p>
                    </div>
                  </div>
                </div>
              )}
              
              {standardCategories.map(category => {
                const categoryTemplates = templatesByCategory[category] || []
                return (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border-b border-gray-200 flex items-center justify-between text-left transition-colors"
                  >
                    <div className="flex items-center">
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 mr-3" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500 mr-3" />
                      )}
                      <h3 className="font-medium text-gray-900">{category}</h3>
                      <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                        {categoryTemplates.length}
                      </span>
                    </div>
                    <List className="h-4 w-4 text-gray-400" />
                  </button>

                  {/* Templates List or Empty State */}
                  {expandedCategories.has(category) && (
                    <div className="divide-y divide-gray-100">
                      {categoryTemplates.length > 0 ? categoryTemplates.map(template => (
                        <div key={template.id} className="p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <h4 className="font-medium text-gray-900 mr-3">{template.concern}</h4>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => openForm(template)}
                                    className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                    title="Edit"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => template.id && deleteTemplate(template.id)}
                                    className="text-red-600 hover:bg-red-50 p-1 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              
                              <p className="text-sm text-blue-600 mb-2 italic">Goal: {template.goal}</p>
                              
                              <div className="flex items-start mb-2">
                                <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{template.barrier}</span>
                              </div>

                              {template.recommendations.length > 0 && (
                                <div className="flex items-start">
                                  <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <div className="text-sm text-gray-600">
                                    <div className="font-medium mb-1">Recommendations ({template.recommendations.length}):</div>
                                    <ul className="list-disc list-inside space-y-1">
                                      {template.recommendations.slice(0, 3).map((rec, index) => (
                                        <li key={index} className="text-gray-600">{rec.text}</li>
                                      ))}
                                      {template.recommendations.length > 3 && (
                                        <li className="text-gray-500 italic">+{template.recommendations.length - 3} more...</li>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-500">Created by: {template.createdBy}</span>
                                <span className="text-xs text-gray-400">
                                  Modified: {template.lastModified.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-4 text-center bg-gray-50">
                          <p className="text-gray-500 mb-3">No templates in this category yet</p>
                          <button
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category: category }))
                              openForm()
                            }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Add Template
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                )
              })}
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
                  onChange={(e) => {
                    const selectedCategory = e.target.value
                    setFormData(prev => ({ ...prev, category: selectedCategory }))
                    setSelectedCategory(selectedCategory)
                  }}
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
                  Area of Concern *
                </label>
                <textarea
                  value={formData.concern}
                  onChange={(e) => setFormData(prev => ({ ...prev, concern: e.target.value }))}
                  rows={2}
                  placeholder="Describe the specific area of concern..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal *
                </label>
                <textarea
                  value={formData.goal}
                  onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
                  rows={3}
                  placeholder="Describe the desired outcome or goal..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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
                      type="button"
                      onClick={addRecommendation}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex-shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Debug: Show count */}
                <div className="text-sm text-gray-600 mb-2">
                  Current recommendations: {formData.recommendations.length}
                </div>

                {/* Recommendations List */}
                {formData.recommendations.length > 0 && (
                  <div className="space-y-2 border border-blue-200 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Added Recommendations:</h4>
                    {formData.recommendations.map(rec => (
                      <div key={rec.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-3">
                        <div className="flex items-center flex-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-3 ${getPriorityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                          <span className="text-gray-900">{rec.text}</span>
                        </div>
                        <button
                          type="button"
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
                    <div className="space-y-1 text-gray-700">
                      <div>1. Category</div>
                      <div>2. Concern</div>
                      <div>3. Goal</div>
                      <div>4. Barrier</div>
                      <div>5. Recommendations (separate multiple with |)</div>
                    </div>
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