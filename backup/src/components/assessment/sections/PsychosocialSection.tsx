import React, { useState } from 'react'
import { Users, AlertCircle, Sparkles, Loader2 } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface PsychosocialSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

export default function PsychosocialSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: PsychosocialSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const socialSupportOptions = [
    'Caregiver',
    'Family', 
    'Friends',
    'Faith Community',
    'Community Group',
    'Other'
  ]

  const riskLevels = ['Low', 'Moderate', 'High']

  // Handle social support checkbox changes
  const handleSocialSupportChange = (support: string, checked: boolean) => {
    const currentSupports = (data.main_social_supports as string[]) || []
    const newSupports = checked
      ? [...currentSupports, support]
      : currentSupports.filter(s => s !== support)
    
    onUpdateField('main_social_supports', newSupports)
    
    // Clear "Other" text if unchecking "Other"
    if (support === 'Other' && !checked) {
      onUpdateField('main_social_supports_other', '')
    }
  }

  // AI Summary Generation
  const generateAISummary = async () => {
    setIsGeneratingSummary(true)
    
    try {
      // Collect all psychosocial data for analysis
      const psychosocialData = {
        regularSupportProviders: data.regular_support_providers as string || '',
        adequateSupport: data.adequate_support,
        neededSupportTypes: data.needed_support_types as string || '',
        mainSocialSupports: (data.main_social_supports as string[]) || [],
        socialSupportsOther: data.main_social_supports_other as string || '',
        religiousConnection: data.religious_spiritual_connection,
        religiousDetails: data.religious_spiritual_details as string || '',
        experiencesLoneliness: data.experiences_loneliness,
        lonelinessDetails: data.loneliness_details as string || '',
        feelsSafeAtHome: data.feels_safe_at_home,
        homeSafetyDetails: data.home_safety_details as string || '',
        recentLossesTrauma: data.recent_losses_trauma,
        lossesTraumaComments: data.losses_trauma_comments as string || '',
        miracleQuestionResponse: data.miracle_question_response as string || '',
        goal1: data.goal_1 as string || '',
        goal2: data.goal_2 as string || '',
        goal3: data.goal_3 as string || '',
        psychosocialObservations: data.psychosocial_observations as string || '',
        riskLevel: data.psychosocial_risk_level as string || '',
        caregiverStrainNoted: data.caregiver_strain_noted as boolean || false
      }

      // Simulate AI processing with enhanced logic
      const aiSummary = await generateProfessionalSummary(psychosocialData)
      
      // Update the summary field
      onUpdateField('psychosocial_summary', aiSummary)
      
    } catch (error) {
      console.error('Failed to generate AI summary:', error)
      alert('Failed to generate summary. Please try again or write manually.')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  // Enhanced AI Summary Generation Logic - Updated to use paragraph format
  const generateProfessionalSummary = async (data: any): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let summary = ''
        
        // Client identification and living situation
        summary += 'PSYCHOSOCIAL ASSESSMENT SUMMARY:\n\n'
        
        // Support System Analysis - Paragraph format
        summary += 'SUPPORT SYSTEM: '
        if (data.regularSupportProviders) {
          summary += `Client reports receiving regular support from ${data.regularSupportProviders.toLowerCase()}. `
        }
        
        if (data.adequateSupport === true) {
          summary += 'Client feels they have adequate support at this time. '
        } else if (data.adequateSupport === false) {
          summary += 'Client reports feeling they do not have adequate support. '
          if (data.neededSupportTypes) {
            summary += `Specific support needs identified include: ${data.neededSupportTypes.toLowerCase()}. `
          }
        }

        // Social connections
        if (data.mainSocialSupports.length > 0) {
          const supports = data.mainSocialSupports.join(', ').toLowerCase()
          summary += `Primary social supports include ${supports}. `
          if (data.socialSupportsOther) {
            summary += `Additional support noted: ${data.socialSupportsOther.toLowerCase()}. `
          }
        }

        summary += '\n\n'

        // Spiritual and Community Connections - Paragraph format
        summary += 'SPIRITUAL/COMMUNITY ENGAGEMENT: '
        if (data.religiousConnection === true) {
          summary += 'Client maintains connection to religious or spiritual community. '
          if (data.religiousDetails) {
            summary += `Details: ${data.religiousDetails}. `
          }
        } else if (data.religiousConnection === false) {
          summary += 'Client reports no current religious or spiritual community connection. '
        }

        summary += '\n\n'

        // Emotional Well-being and Safety - Paragraph format
        summary += 'EMOTIONAL WELL-BEING: '
        if (data.experiencesLoneliness === true) {
          summary += 'Client reports experiencing loneliness on a regular basis. '
          if (data.lonelinessDetails) {
            summary += `Contributing factors: ${data.lonelinessDetails.toLowerCase()}. `
          }
        } else if (data.experiencesLoneliness === false) {
          summary += 'Client does not report regular feelings of loneliness. '
        }

        if (data.feelsSafeAtHome === true) {
          summary += 'Client reports feeling safe in their home environment. '
        } else if (data.feelsSafeAtHome === false) {
          summary += 'Client has expressed concerns about safety in their home environment. '
          if (data.homeSafetyDetails) {
            summary += `Specific concerns: ${data.homeSafetyDetails.toLowerCase()}. `
          }
        }

        summary += '\n\n'

        // Recent Changes and Trauma - Paragraph format
        if (data.recentLossesTrauma === true) {
          summary += 'RECENT LIFE CHANGES: Client has experienced recent losses, trauma, or major life changes. '
          if (data.lossesTraumaComments) {
            summary += `Details: ${data.lossesTraumaComments}. `
          }
          summary += '\n\n'
        }

        // Goals and Aspirations - Paragraph format
        summary += 'CLIENT GOALS AND ASPIRATIONS: '
        if (data.miracleQuestionResponse) {
          summary += `When asked about their ideal life scenario, client expressed: "${data.miracleQuestionResponse}" `
        }

        const goals = [data.goal1, data.goal2, data.goal3].filter(goal => goal && goal.trim())
        if (goals.length > 0) {
          summary += `Client's stated goals include: ${goals.join('; ')}. `
        }

        summary += '\n\n'

        // Strengths and Protective Factors - Paragraph format
        summary += 'STRENGTHS AND PROTECTIVE FACTORS: '
        const strengths = []
        
        if (data.adequateSupport === true) strengths.push('adequate support system')
        if (data.mainSocialSupports.length > 2) strengths.push('diverse social connections')
        if (data.religiousConnection === true) strengths.push('spiritual/community engagement')
        if (data.feelsSafeAtHome === true) strengths.push('secure home environment')
        if (goals.length > 0) strengths.push('clear goal orientation')
        if (data.miracleQuestionResponse) strengths.push('insight and future-focused thinking')

        if (strengths.length > 0) {
          summary += `Client demonstrates ${strengths.join(', ')}. `
        } else {
          summary += 'Client shows resilience and willingness to engage in assessment process. '
        }

        summary += '\n\n'

        // Risk Assessment - Paragraph format
        summary += 'RISK ASSESSMENT: '
        if (data.riskLevel) {
          summary += `Psychosocial risk level assessed as ${data.riskLevel.toLowerCase()}. `
        }
        if (data.caregiverStrainNoted) {
          summary += 'Caregiver strain has been noted and requires attention. '
        }

        // Areas for intervention
        const interventionAreas = []
        if (data.adequateSupport === false) interventionAreas.push('support system enhancement')
        if (data.experiencesLoneliness === true) interventionAreas.push('social isolation')
        if (data.feelsSafeAtHome === false) interventionAreas.push('home safety concerns')
        if (data.recentLossesTrauma === true) interventionAreas.push('grief/trauma processing')
        if (data.caregiverStrainNoted) interventionAreas.push('caregiver support')

        if (interventionAreas.length > 0) {
          summary += `Areas requiring intervention include: ${interventionAreas.join(', ')}. `
        }

        summary += '\n\n'

        // Short-term Plan (30-90 days) - Keep as structured list
        summary += 'SHORT-TERM PLAN (30-90 days):\n'
        const shortTermActions = []
        
        if (data.adequateSupport === false) {
          shortTermActions.push('• Connect with local support services and community resources')
        }
        if (data.experiencesLoneliness === true) {
          shortTermActions.push('• Explore social engagement opportunities such as senior centers or community groups')
        }
        if (data.feelsSafeAtHome === false) {
          shortTermActions.push('• Conduct comprehensive home safety assessment and implement immediate safety modifications')
        }
        if (data.recentLossesTrauma === true) {
          shortTermActions.push('• Provide grief counseling referral and emotional support resources')
        }
        if (data.caregiverStrainNoted) {
          shortTermActions.push('• Assess caregiver needs and provide respite care options')
        }

        if (shortTermActions.length === 0) {
          shortTermActions.push('• Maintain current support systems and monitor for changes')
          shortTermActions.push('• Schedule follow-up assessment in 60 days')
        }

        summary += shortTermActions.join('\n') + '\n\n'

        // Long-term Plan (6-12 months) - Keep as structured list
        summary += 'LONG-TERM PLAN (6-12 months):\n'
        const longTermActions = []

        if (goals.length > 0) {
          longTermActions.push('• Work systematically toward achieving client-stated goals')
        }
        if (data.experiencesLoneliness === true || data.adequateSupport === false) {
          longTermActions.push('• Build sustainable social network and peer relationships')
        }
        if (data.riskLevel === 'High' || data.riskLevel === 'Moderate') {
          longTermActions.push('• Implement comprehensive psychosocial intervention plan with regular monitoring')
        }
        
        longTermActions.push('• Maintain mental wellness supports and prevent social isolation')
        longTermActions.push('• Reassess psychosocial functioning and adjust care plan as needed')

        summary += longTermActions.join('\n')

        // Professional observations - Paragraph format
        if (data.psychosocialObservations) {
          summary += '\n\nADDITIONAL CLINICAL OBSERVATIONS: ' + data.psychosocialObservations
        }

        resolve(summary)
      }, 3000) // Simulate AI processing time
    })
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Users className="h-6 w-6 mr-2 text-teal-500" />
          Section 9 – Psychosocial & Support System
        </h2>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Support Network & Social Well-Being */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">👥 Support Network & Social Well-Being</h3>
          
          <div className="space-y-6">
            {/* Who provides support */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who provides support to you on a regular basis?
              </label>
              <textarea
                value={data.regular_support_providers as string || ''}
                onChange={(e) => onUpdateField('regular_support_providers', e.target.value)}
                disabled={isReadOnly}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Describe who provides regular support (family members, friends, caregivers, etc.)..."
              />
            </div>

            {/* Adequate support */}
            <div className="border rounded-lg p-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Do you feel you have adequate support?
                </p>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adequate_support"
                      checked={data.adequate_support === true}
                      onChange={() => onUpdateField('adequate_support', true)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="adequate_support"
                      checked={data.adequate_support === false}
                      onChange={() => onUpdateField('adequate_support', false)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Conditional support needs */}
              {data.adequate_support === false && (
                <div className="ml-6 pt-3 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    If "No," what type of support do you feel you need?
                  </label>
                  <textarea
                    value={data.needed_support_types as string || ''}
                    onChange={(e) => onUpdateField('needed_support_types', e.target.value)}
                    disabled={isReadOnly}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Describe what additional support would be helpful..."
                  />
                </div>
              )}
            </div>

            {/* Main social supports */}
            <div>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-3">
                  Who are your main social supports?
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {socialSupportOptions.map((support) => (
                    <label key={support} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={((data.main_social_supports as string[]) || []).includes(support)}
                        onChange={(e) => handleSocialSupportChange(support, e.target.checked)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-2 text-sm text-gray-700">{support}</span>
                    </label>
                  ))}
                </div>
                
                {/* Other text field */}
                {((data.main_social_supports as string[]) || []).includes('Other') && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Please specify other social support:
                    </label>
                    <input
                      type="text"
                      value={data.main_social_supports_other as string || ''}
                      onChange={(e) => onUpdateField('main_social_supports_other', e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Describe other social support"
                    />
                  </div>
                )}
              </fieldset>
            </div>

            {/* Religious/spiritual connection */}
            <div className="border rounded-lg p-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Are you connected to a religious or spiritual group?
                </p>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="religious_spiritual_connection"
                      checked={data.religious_spiritual_connection === true}
                      onChange={() => onUpdateField('religious_spiritual_connection', true)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="religious_spiritual_connection"
                      checked={data.religious_spiritual_connection === false}
                      onChange={() => onUpdateField('religious_spiritual_connection', false)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Optional text field for religious/spiritual details */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details (optional):
                </label>
                <input
                  type="text"
                  value={data.religious_spiritual_details as string || ''}
                  onChange={(e) => onUpdateField('religious_spiritual_details', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Name of group, frequency of attendance, etc."
                />
              </div>
            </div>

            {/* Loneliness */}
            <div className="border rounded-lg p-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Do you experience loneliness on a regular basis?
                </p>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="experiences_loneliness"
                      checked={data.experiences_loneliness === true}
                      onChange={() => onUpdateField('experiences_loneliness', true)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="experiences_loneliness"
                      checked={data.experiences_loneliness === false}
                      onChange={() => onUpdateField('experiences_loneliness', false)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Optional loneliness details */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details (optional):
                </label>
                <textarea
                  value={data.loneliness_details as string || ''}
                  onChange={(e) => onUpdateField('loneliness_details', e.target.value)}
                  disabled={isReadOnly}
                  rows={2}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Describe frequency, triggers, or circumstances..."
                />
              </div>
            </div>

            {/* Home safety */}
            <div className="border rounded-lg p-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Do you feel safe in your home?
                </p>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="feels_safe_at_home"
                      checked={data.feels_safe_at_home === true}
                      onChange={() => onUpdateField('feels_safe_at_home', true)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="feels_safe_at_home"
                      checked={data.feels_safe_at_home === false}
                      onChange={() => onUpdateField('feels_safe_at_home', false)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Optional home safety details */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Details (optional):
                </label>
                <textarea
                  value={data.home_safety_details as string || ''}
                  onChange={(e) => onUpdateField('home_safety_details', e.target.value)}
                  disabled={isReadOnly}
                  rows={2}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Describe any safety concerns or specific issues..."
                />
              </div>
            </div>

            {/* Recent losses/trauma */}
            <div className="border rounded-lg p-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Any recent losses, trauma, or major life changes?
                </p>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recent_losses_trauma"
                      checked={data.recent_losses_trauma === true}
                      onChange={() => onUpdateField('recent_losses_trauma', true)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="recent_losses_trauma"
                      checked={data.recent_losses_trauma === false}
                      onChange={() => onUpdateField('recent_losses_trauma', false)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Comment box for losses/trauma */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments:
                </label>
                <textarea
                  value={data.losses_trauma_comments as string || ''}
                  onChange={(e) => onUpdateField('losses_trauma_comments', e.target.value)}
                  disabled={isReadOnly}
                  rows={3}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="Describe any recent losses, trauma, or major life changes..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* The Miracle Question */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🌟 The Miracle Question</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              "If a miracle happened overnight and everything in your life was better, what would be different when you woke up?"
            </label>
            <textarea
              value={data.miracle_question_response as string || ''}
              onChange={(e) => onUpdateField('miracle_question_response', e.target.value)}
              disabled={isReadOnly}
              rows={6}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Describe what would be different in your ideal life..."
            />
          </div>
        </div>

        {/* Client and/or Family Goals */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Client and/or Family Goals</h3>
          <p className="text-sm text-gray-600 mb-4">
            What are the top three goals you and/or your family have right now?
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal 1
              </label>
              <input
                type="text"
                value={data.goal_1 as string || ''}
                onChange={(e) => onUpdateField('goal_1', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter first goal..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal 2
              </label>
              <input
                type="text"
                value={data.goal_2 as string || ''}
                onChange={(e) => onUpdateField('goal_2', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter second goal..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal 3
              </label>
              <input
                type="text"
                value={data.goal_3 as string || ''}
                onChange={(e) => onUpdateField('goal_3', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Enter third goal..."
              />
            </div>
          </div>
        </div>

        {/* Psychosocial Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🧠 Psychosocial Summary (Care Manager Notes)</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Psychosocial Observations and Concerns
            </label>
            <p className="text-sm text-gray-600 mb-2">
              For documentation of mood, engagement, caregiver dynamics, etc.
            </p>
            <textarea
              value={data.psychosocial_observations as string || ''}
              onChange={(e) => onUpdateField('psychosocial_observations', e.target.value)}
              disabled={isReadOnly}
              rows={6}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
              placeholder="Document observations about mood, engagement, family dynamics, caregiver relationships, social interactions, and any psychosocial concerns..."
            />
          </div>
        </div>

        {/* Risk Assessment Enhancements */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🔺 Risk Assessment Enhancements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Psychosocial Risk Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Psychosocial Risk Level
              </label>
              <select
                value={data.psychosocial_risk_level as string || ''}
                onChange={(e) => onUpdateField('psychosocial_risk_level', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Select risk level</option>
                {riskLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Caregiver Strain */}
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.caregiver_strain_noted as boolean || false}
                  onChange={(e) => onUpdateField('caregiver_strain_noted', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Caregiver Strain Noted?
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* AI-Powered Psychosocial Summary */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">✨ AI-Generated Psychosocial Summary</h3>
          
          <div className="space-y-4">
            {/* Generate Button */}
            {!isReadOnly && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Generate a comprehensive, professional summary based on all psychosocial assessment data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateAISummary}
                  disabled={isGeneratingSummary}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate AI Summary
                    </>
                  )}
                </button>
              </div>
            )}

            {/* AI Processing Status */}
            {isGeneratingSummary && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center">
                  <Loader2 className="h-5 w-5 text-purple-600 animate-spin mr-3" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">AI is analyzing psychosocial data...</p>
                    <p className="text-xs text-purple-700">
                      Synthesizing support systems, goals, strengths, and creating care plans...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Text Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Psychosocial Summary (Auto-Generated)
                </label>
                {data.psychosocial_summary && (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ AI Summary Generated
                  </span>
                )}
              </div>
              <textarea
                value={data.psychosocial_summary as string || ''}
                onChange={(e) => onUpdateField('psychosocial_summary', e.target.value)}
                disabled={isReadOnly || isGeneratingSummary}
                rows={12}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly || isGeneratingSummary ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Click 'Generate AI Summary' to create a comprehensive psychosocial assessment summary, or write your own professional summary here. The AI will analyze all assessment data to create a client-centered clinical summary with strengths, goals, and care plans."
              />
              <p className="text-xs text-gray-500 mt-2">
                <strong>Note:</strong> Care Manager can edit or completely rewrite the AI-generated summary as needed. 
                This summary will be included in the PDF export and final assessment report.
              </p>
            </div>
          </div>
        </div>

        {/* Assessment Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-2">Assessment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Adequate Support:</strong> {
                data.adequate_support === true ? 'Yes' : 
                data.adequate_support === false ? 'No' : 'Not answered'
              }</p>
              <p><strong>Social Supports:</strong> {((data.main_social_supports as string[]) || []).length} selected</p>
              <p><strong>Goals Identified:</strong> {
                [data.goal_1, data.goal_2, data.goal_3].filter(goal => goal && (goal as string).trim()).length
              }/3</p>
            </div>
            <div>
              <p><strong>Risk Level:</strong> {data.psychosocial_risk_level || 'Not assessed'}</p>
              <p><strong>Caregiver Strain:</strong> {data.caregiver_strain_noted ? 'Noted' : 'Not noted'}</p>
              <p><strong>AI Summary:</strong> {data.psychosocial_summary ? 'Generated' : 'Not generated'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}