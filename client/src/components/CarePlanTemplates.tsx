import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, Calendar, Target, AlertTriangle, Lightbulb } from 'lucide-react'
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
  smartGoal: string
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
    smartGoal: '',
    targetDate: '',
    isOngoing: false,
    recommendations: [] as Recommendation[]
  })

  const [newRecommendation, setNewRecommendation] = useState({
    text: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  })

  useEffect(() => {
    loadTemplates()
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

  const resetForm = () => {
    setFormData({
      category: '',
      concern: '',
      barrier: '',
      smartGoal: '',
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
        smartGoal: template.smartGoal,
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
      smartGoal: formData.smartGoal,
      targetDate: formData.isOngoing ? undefined : formData.targetDate,
      isOngoing: formData.isOngoing,
      recommendations: formData.recommendations,
      createdBy: user?.name || 'Unknown',
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-white mr-3" />
              <h2 className="text-xl font-semibold text-white">Care Plan Templates</h2>
            </div>
            <button
              onClick={() => openForm()}
              className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </button>
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
                    
                    <div className="flex items-start">
                      <Target className="h-4 w-4 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 line-clamp-2">{template.smartGoal}</span>
                    </div>

                    {template.recommendations.length > 0 && (
                      <div className="flex items-center">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="text-gray-500 text-xs">
                          {template.recommendations.length} recommendation{template.recommendations.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-gray-500">
                        {template.isOngoing ? 'Ongoing' : template.targetDate ? new Date(template.targetDate).toLocaleDateString() : 'No target date'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {template.lastModified.toLocaleDateString()}
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

              {/* SMART Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMART Goal *
                </label>
                <textarea
                  value={formData.smartGoal}
                  onChange={(e) => setFormData(prev => ({ ...prev, smartGoal: e.target.value }))}
                  rows={3}
                  placeholder="Specific, Measurable, Achievable, Relevant, Time-bound goal..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Target Date / Ongoing */}
              <div>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="ongoing"
                    checked={formData.isOngoing}
                    onChange={(e) => setFormData(prev => ({ ...prev, isOngoing: e.target.checked, targetDate: e.target.checked ? '' : prev.targetDate }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="ongoing" className="ml-2 text-sm text-gray-700">
                    This is an ongoing goal (no target date)
                  </label>
                </div>
                
                {!formData.isOngoing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
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
    </div>
  )
}