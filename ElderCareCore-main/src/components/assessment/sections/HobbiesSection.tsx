import React from 'react'
import { Palette, AlertCircle } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface HobbiesSectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

export default function HobbiesSection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: HobbiesSectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'

  const socialPreferenceOptions = ['Alone', 'With others', 'Mix']

  const activityTags = [
    'Music',
    'Gardening',
    'Reading',
    'Card games',
    'Puzzles',
    'TV/movies',
    'Church or spiritual activities',
    'Exercise or walking',
    'Arts & crafts',
    'Pets/animal interaction',
    'Other'
  ]

  // Handle activity tag changes
  const handleActivityTagChange = (tag: string, checked: boolean) => {
    const currentTags = (data.activity_tags as string[]) || []
    const newTags = checked
      ? [...currentTags, tag]
      : currentTags.filter(t => t !== tag)
    
    onUpdateField('activity_tags', newTags)
    
    // Clear "Other" text if unchecking "Other"
    if (tag === 'Other' && !checked) {
      onUpdateField('activity_tags_other', '')
    }
    
    // Clear re-engagement flag if unchecking tag
    if (!checked) {
      onUpdateField(`${tag.toLowerCase().replace(/[^a-z0-9]/g, '_')}_reengagement_flag`, false)
    }
  }

  // Handle re-engagement flag changes
  const handleReengagementFlagChange = (tag: string, checked: boolean) => {
    const fieldName = `${tag.toLowerCase().replace(/[^a-z0-9]/g, '_')}_reengagement_flag`
    onUpdateField(fieldName, checked)
  }

  // Get current activity tags
  const currentActivityTags = (data.activity_tags as string[]) || []

  // Get re-engagement opportunities for export
  const getReengagementOpportunities = () => {
    return activityTags.filter(tag => {
      const fieldName = `${tag.toLowerCase().replace(/[^a-z0-9]/g, '_')}_reengagement_flag`
      return data[fieldName] === true
    })
  }

  const reengagementOpportunities = getReengagementOpportunities()

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Palette className="h-6 w-6 mr-2 text-orange-500" />
          Section 10: Hobbies, Interests, and Preferences
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

        {/* Client Lifestyle & Enjoyment Questions */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">🗂️ Client Lifestyle & Enjoyment Questions</h3>
          
          <div className="space-y-6">
            {/* What do you enjoy doing for fun? */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do you enjoy doing for fun?
              </label>
              <textarea
                value={data.enjoy_for_fun as string || ''}
                onChange={(e) => onUpdateField('enjoy_for_fun', e.target.value)}
                disabled={isReadOnly}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Describe activities, hobbies, or pastimes you enjoy..."
              />
            </div>

            {/* Current hobbies or interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What hobbies or interests do you currently engage in?
              </label>
              <textarea
                value={data.current_hobbies as string || ''}
                onChange={(e) => onUpdateField('current_hobbies', e.target.value)}
                disabled={isReadOnly}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="List hobbies and interests you are actively participating in..."
              />
            </div>

            {/* Past hobbies no longer able to do */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What hobbies or interests did you used to enjoy but are no longer able to do?
              </label>
              <textarea
                value={data.past_hobbies as string || ''}
                onChange={(e) => onUpdateField('past_hobbies', e.target.value)}
                disabled={isReadOnly}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Describe activities you used to enjoy but can no longer participate in..."
              />
            </div>

            {/* Want to try or return to activities */}
            <div className="border rounded-lg p-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Are there any hobbies or activities you'd like to try or return to?
                </p>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="want_to_try_return"
                      checked={data.want_to_try_return === true}
                      onChange={() => onUpdateField('want_to_try_return', true)}
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
                      name="want_to_try_return"
                      checked={data.want_to_try_return === false}
                      onChange={() => onUpdateField('want_to_try_return', false)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>

              {/* Conditional text box */}
              {data.want_to_try_return === true && (
                <div className="ml-6 pt-3 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please describe the hobbies or activities you'd like to try or return to:
                  </label>
                  <textarea
                    value={data.want_to_try_return_details as string || ''}
                    onChange={(e) => onUpdateField('want_to_try_return_details', e.target.value)}
                    disabled={isReadOnly}
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Describe activities you'd like to try or return to..."
                  />
                </div>
              )}
            </div>

            {/* Social preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Do you enjoy spending time alone, with others, or a mix of both?
              </label>
              <div className="flex flex-wrap items-center gap-6">
                {socialPreferenceOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="social_preference"
                      value={option}
                      checked={data.social_preference === option}
                      onChange={(e) => onUpdateField('social_preference', e.target.value)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Favorite entertainment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Do you have a favorite TV show, book, music, or movie genre?
              </label>
              <textarea
                value={data.favorite_entertainment as string || ''}
                onChange={(e) => onUpdateField('favorite_entertainment', e.target.value)}
                disabled={isReadOnly}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Describe your favorite TV shows, books, music genres, movies, etc..."
              />
            </div>

            {/* Cultural/spiritual practices */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Are there any specific cultural, spiritual, or personal practices that are important to you?
              </label>
              <textarea
                value={data.cultural_spiritual_practices as string || ''}
                onChange={(e) => onUpdateField('cultural_spiritual_practices', e.target.value)}
                disabled={isReadOnly}
                rows={4}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Describe any cultural traditions, spiritual practices, or personal routines that are meaningful to you..."
              />
            </div>
          </div>
        </div>

        {/* Activity Tags & Re-engagement Opportunities */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🏷️ Activity Tags & Re-engagement Opportunities</h3>
          <p className="text-sm text-gray-600 mb-4">
            Select common hobbies/interests that apply, and mark any as re-engagement opportunities.
          </p>
          
          <div className="space-y-4">
            {activityTags.map((tag) => {
              const isSelected = currentActivityTags.includes(tag)
              const reengagementFieldName = `${tag.toLowerCase().replace(/[^a-z0-9]/g, '_')}_reengagement_flag`
              const isReengagementOpportunity = data[reengagementFieldName] === true
              
              return (
                <div key={tag} className={`border rounded-lg p-4 ${
                  isReengagementOpportunity ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    {/* Activity Tag Checkbox */}
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleActivityTagChange(tag, e.target.checked)}
                        disabled={isReadOnly}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                          isReadOnly ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">{tag}</span>
                    </label>

                    {/* Re-engagement Opportunity Checkbox */}
                    {isSelected && (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isReengagementOpportunity}
                          onChange={(e) => handleReengagementFlagChange(tag, e.target.checked)}
                          disabled={isReadOnly}
                          className={`h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded ${
                            isReadOnly ? 'cursor-not-allowed' : ''
                          }`}
                        />
                        <span className="ml-2 text-sm font-medium text-yellow-700">
                          Mark as Re-engagement Opportunity
                        </span>
                      </label>
                    )}
                  </div>

                  {/* Other text field */}
                  {tag === 'Other' && isSelected && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Please specify other activity:
                      </label>
                      <input
                        type="text"
                        value={data.activity_tags_other as string || ''}
                        onChange={(e) => onUpdateField('activity_tags_other', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="Describe the other activity or hobby"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Re-engagement Opportunities Summary */}
          {reengagementOpportunities.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-md font-medium text-yellow-900 mb-2">
                🎯 Re-engagement Opportunities Identified ({reengagementOpportunities.length})
              </h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                {reengagementOpportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-yellow-600 mr-2">•</span>
                    {opportunity}
                    {opportunity === 'Other' && data.activity_tags_other && (
                      <span className="ml-1">: {data.activity_tags_other}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Assessment Summary for Export */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">Client Interests, Preferences, and Activity Engagement</h4>
          
          <div className="space-y-4 text-sm">
            {/* Currently Enjoyed Activities */}
            <div>
              <p className="font-medium text-gray-700 mb-1">Currently Enjoyed:</p>
              <div className="ml-4">
                {data.current_hobbies && (
                  <p className="text-gray-600 mb-2">• {data.current_hobbies}</p>
                )}
                {currentActivityTags.length > 0 && (
                  <p className="text-gray-600">
                    • Selected activities: {currentActivityTags.join(', ')}
                    {data.activity_tags_other && currentActivityTags.includes('Other') && 
                      ` (Other: ${data.activity_tags_other})`
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Past Activities */}
            {data.past_hobbies && (
              <div>
                <p className="font-medium text-gray-700 mb-1">Past Activities (No Longer Done):</p>
                <p className="text-gray-600 ml-4">• {data.past_hobbies}</p>
              </div>
            )}

            {/* Re-engagement Opportunities */}
            {reengagementOpportunities.length > 0 && (
              <div>
                <p className="font-medium text-yellow-700 mb-1">🎯 Re-engagement Opportunities:</p>
                <div className="ml-4">
                  {reengagementOpportunities.map((opportunity, index) => (
                    <p key={index} className="text-yellow-600">
                      • {opportunity}
                      {opportunity === 'Other' && data.activity_tags_other && 
                        `: ${data.activity_tags_other}`
                      }
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Social Preference */}
            {data.social_preference && (
              <div>
                <p className="font-medium text-gray-700 mb-1">Social Preference:</p>
                <p className="text-gray-600 ml-4">• {data.social_preference}</p>
              </div>
            )}

            {/* Entertainment Preferences */}
            {data.favorite_entertainment && (
              <div>
                <p className="font-medium text-gray-700 mb-1">Entertainment Preferences:</p>
                <p className="text-gray-600 ml-4">• {data.favorite_entertainment}</p>
              </div>
            )}

            {/* Cultural/Spiritual Practices */}
            {data.cultural_spiritual_practices && (
              <div>
                <p className="font-medium text-gray-700 mb-1">Cultural/Spiritual Practices:</p>
                <p className="text-gray-600 ml-4">• {data.cultural_spiritual_practices}</p>
              </div>
            )}
          </div>

          {/* Summary Statistics */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-500">
              <p><strong>Activity Tags Selected:</strong> {currentActivityTags.length}</p>
              <p><strong>Re-engagement Opportunities:</strong> {reengagementOpportunities.length}</p>
              <p><strong>Social Preference:</strong> {data.social_preference || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}