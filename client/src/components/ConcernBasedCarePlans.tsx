import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Edit, Trash2, Target, ChevronDown, ChevronRight, Lightbulb, AlertTriangle, Settings, Download, Upload, Undo2, AlertCircle, Check, X } from 'lucide-react'

// Enhanced data structure for concern-based care plans
interface Recommendation {
  id: string
  text: string
  priority: 'high' | 'medium' | 'low'
  selected?: boolean
}

interface ConcernCarePlan {
  id?: string
  category: string
  concern: string // This is the main title
  goal: string
  barrier: string
  allRecommendations: Recommendation[] // All available recommendations
  selectedRecommendations: string[] // IDs of selected recommendations
  targetDate?: string
  isOngoing: boolean
  createdBy: string
  createdAt: Date
  lastModified: Date
}

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

export default function ConcernBasedCarePlans() {
  const { user } = useAuth()
  const [carePlans, setCarePlans] = useState<ConcernCarePlan[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ConcernCarePlan | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    concern: '',
    goal: '',
    barrier: '',
    targetDate: '',
    isOngoing: false,
    allRecommendations: [] as Recommendation[],
    selectedRecommendations: [] as string[]
  })

  const [newRecommendation, setNewRecommendation] = useState({
    text: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  })

  // Group care plans by category
  const plansByCategory = carePlans.reduce((acc, plan) => {
    if (!acc[plan.category]) {
      acc[plan.category] = []
    }
    acc[plan.category].push(plan)
    return acc
  }, {} as Record<string, ConcernCarePlan[]>)

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
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
        allRecommendations: [...prev.allRecommendations, recommendation]
      }))
      setNewRecommendation({ text: '', priority: 'medium' })
    }
  }

  const removeRecommendation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      allRecommendations: prev.allRecommendations.filter(r => r.id !== id),
      selectedRecommendations: prev.selectedRecommendations.filter(rid => rid !== id)
    }))
  }

  const toggleRecommendationSelection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedRecommendations: prev.selectedRecommendations.includes(id)
        ? prev.selectedRecommendations.filter(rid => rid !== id)
        : [...prev.selectedRecommendations, id]
    }))
  }

  const openForm = (plan?: ConcernCarePlan) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        category: plan.category,
        concern: plan.concern,
        goal: plan.goal,
        barrier: plan.barrier,
        targetDate: plan.targetDate || '',
        isOngoing: plan.isOngoing,
        allRecommendations: plan.allRecommendations,
        selectedRecommendations: plan.selectedRecommendations
      })
    } else {
      setEditingPlan(null)
      setFormData({
        category: '',
        concern: '',
        goal: '',
        barrier: '',
        targetDate: '',
        isOngoing: false,
        allRecommendations: [],
        selectedRecommendations: []
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingPlan(null)
  }

  const savePlan = () => {
    if (!formData.category || !formData.concern || !formData.goal || !formData.barrier) {
      alert('Please fill in all required fields')
      return
    }

    const planData: ConcernCarePlan = {
      id: editingPlan?.id || Date.now().toString(),
      category: formData.category,
      concern: formData.concern,
      goal: formData.goal,
      barrier: formData.barrier,
      targetDate: formData.isOngoing ? undefined : formData.targetDate,
      isOngoing: formData.isOngoing,
      allRecommendations: formData.allRecommendations,
      selectedRecommendations: formData.selectedRecommendations,
      createdBy: (user as any)?.firstName ? `${(user as any).firstName} ${(user as any).lastName}` : 'Unknown',
      createdAt: editingPlan?.createdAt || new Date(),
      lastModified: new Date()
    }

    if (editingPlan) {
      setCarePlans(prev => prev.map(p => p.id === editingPlan.id ? planData : p))
    } else {
      setCarePlans(prev => [...prev, planData])
    }

    closeForm()
  }

  const deletePlan = (id: string) => {
    if (confirm('Are you sure you want to delete this care plan?')) {
      setCarePlans(prev => prev.filter(p => p.id !== id))
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
              <h2 className="text-xl font-semibold text-white">Concern-Based Care Plans</h2>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => openForm()}
                className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Care Plan
              </button>
            </div>
          </div>
          <p className="text-blue-100 mt-2 text-sm">
            Create and manage concern-based care plans with multiple recommendation options
          </p>
        </div>

        {/* Care Plans List */}
        <div className="p-6">
          {carePlans.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No care plans yet</h3>
              <p className="text-gray-500 mb-4">Create your first concern-based care plan to get started</p>
              <button
                onClick={() => openForm()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Care Plan
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {standardizedCategories.map(category => {
                const categoryPlans = plansByCategory[category] || []
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
                          {categoryPlans.length}
                        </span>
                      </div>
                    </button>

                    {/* Care Plans List */}
                    {expandedCategories.has(category) && (
                      <div className="divide-y divide-gray-100">
                        {categoryPlans.length > 0 ? categoryPlans.map(plan => (
                          <div key={plan.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {/* Concern as Title */}
                                <div className="flex items-center mb-2">
                                  <h4 className="font-medium text-gray-900 mr-3 text-lg">"{plan.concern}"</h4>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => openForm(plan)}
                                      className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                                      title="Edit"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => plan.id && deletePlan(plan.id)}
                                      className="text-red-600 hover:bg-red-50 p-1 rounded"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                                
                                {/* Goal */}
                                <p className="text-sm text-blue-600 mb-2 italic">Goal: {plan.goal}</p>
                                
                                {/* Barrier */}
                                <div className="flex items-start mb-2">
                                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm text-gray-600">{plan.barrier}</span>
                                </div>

                                {/* Selected Recommendations */}
                                {plan.selectedRecommendations.length > 0 && (
                                  <div className="flex items-start">
                                    <Lightbulb className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-gray-600">
                                      <div className="font-medium mb-1">Recommendations ({plan.selectedRecommendations.length}):</div>
                                      <ul className="list-disc list-inside space-y-1">
                                        {plan.allRecommendations
                                          .filter(rec => plan.selectedRecommendations.includes(rec.id))
                                          .map(rec => (
                                            <li key={rec.id} className="text-gray-600">{rec.text}</li>
                                          ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                  <span className="text-xs text-gray-500">Created by: {plan.createdBy}</span>
                                  <span className="text-xs text-gray-400">
                                    Modified: {plan.lastModified.toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="p-4 text-center bg-gray-50">
                            <p className="text-gray-500 mb-3">No care plans in this category yet</p>
                            <button
                              onClick={() => {
                                setFormData(prev => ({ ...prev, category: category }))
                                openForm()
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Add Care Plan
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {editingPlan ? 'Edit Care Plan' : 'New Care Plan'}
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
                  {standardizedCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Concern (Title) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Concern (Title) *
                </label>
                <input
                  type="text"
                  value={formData.concern}
                  onChange={(e) => setFormData(prev => ({ ...prev, concern: e.target.value }))}
                  placeholder="e.g., Mr./Mrs. Client is showing signs of confusion and memory loss"
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
                  rows={2}
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
                  rows={2}
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
                <div className="space-y-3 mb-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newRecommendation.text}
                      onChange={(e) => setNewRecommendation(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter recommendation..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* List of All Recommendations with Selection */}
                {formData.allRecommendations.length > 0 && (
                  <div className="border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Select recommendations to include:
                    </h4>
                    <div className="space-y-2">
                      {formData.allRecommendations.map(recommendation => (
                        <div key={recommendation.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.selectedRecommendations.includes(recommendation.id)}
                            onChange={() => toggleRecommendationSelection(recommendation.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="flex-1 text-sm text-gray-700">{recommendation.text}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(recommendation.priority)}`}>
                            {recommendation.priority}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRecommendation(recommendation.id)}
                            className="text-red-600 hover:bg-red-50 p-1 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Target Date */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isOngoing}
                    onChange={(e) => setFormData(prev => ({ ...prev, isOngoing: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">Ongoing (no target date)</label>
                </div>
                {!formData.isOngoing && (
                  <div className="flex-1">
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={savePlan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingPlan ? 'Update' : 'Create'} Care Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}