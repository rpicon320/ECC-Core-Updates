import React from 'react'
import { Plus, Trash2, Heart, AlertCircle } from 'lucide-react'
import { SectionData, ValidationError } from '../../../types/assessment'

interface MedicalHistorySectionProps {
  sectionData: SectionData
  onUpdateField: (field: string, value: unknown) => void
  onUpdateSection: (data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
}

export default function MedicalHistorySection({
  sectionData,
  onUpdateField,
  validationErrors,
  mode
}: MedicalHistorySectionProps) {
  const data = sectionData.data
  const isReadOnly = mode === 'view' || mode === 'print'

  const medicalConditions = [
    { key: 'heartDisease', label: 'Heart Disease' },
    { key: 'highBloodPressure', label: 'High Blood Pressure' },
    { key: 'stroke', label: 'Stroke' },
    { key: 'lungDisease', label: 'Lung Disease' },
    { key: 'diabetes', label: 'Diabetes' },
    { key: 'renalDisease', label: 'Renal Disease' },
    { key: 'cancer', label: 'Cancer' },
    { key: 'arthritis', label: 'Arthritis' },
    { key: 'visionImpairment', label: 'Vision Impairment' },
    { key: 'hearingImpairment', label: 'Hearing Impairment' },
    { key: 'historyOfFalls', label: 'History of Falls' },
    { key: 'woundsSkinBreakdown', label: 'Wounds/Skin Breakdown' },
    { key: 'alcoholUse', label: 'Alcohol Use' },
    { key: 'smoking', label: 'Smoking' },
    { key: 'other', label: 'Other' },
  ]

  const addAllergy = () => {
    const currentAllergies = (data.allergies as any[]) || []
    onUpdateField('allergies', [
      ...currentAllergies,
      { allergenName: '', reaction: '', severity: '', notes: '' }
    ])
  }

  const updateAllergy = (index: number, field: string, value: string) => {
    const currentAllergies = [...((data.allergies as any[]) || [])]
    currentAllergies[index] = { ...currentAllergies[index], [field]: value }
    onUpdateField('allergies', currentAllergies)
  }

  const removeAllergy = (index: number) => {
    const currentAllergies = (data.allergies as any[]) || []
    onUpdateField('allergies', currentAllergies.filter((_, i) => i !== index))
  }

  const addSurgery = () => {
    const currentSurgeries = (data.surgicalHistory as any[]) || []
    onUpdateField('surgicalHistory', [
      ...currentSurgeries,
      { surgeryType: '', date: '', details: '' }
    ])
  }

  const updateSurgery = (index: number, field: string, value: string) => {
    const currentSurgeries = [...((data.surgicalHistory as any[]) || [])]
    currentSurgeries[index] = { ...currentSurgeries[index], [field]: value }
    onUpdateField('surgicalHistory', currentSurgeries)
  }

  const removeSurgery = (index: number) => {
    const currentSurgeries = (data.surgicalHistory as any[]) || []
    onUpdateField('surgicalHistory', currentSurgeries.filter((_, i) => i !== index))
  }

  const addMedication = () => {
    const currentMedications = (data.currentMedications as any[]) || []
    onUpdateField('currentMedications', [
      ...currentMedications,
      { medicationName: '', dose: '', frequency: '', prescribedFor: '', prescribedBy: '' }
    ])
  }

  const updateMedication = (index: number, field: string, value: string) => {
    const currentMedications = [...((data.currentMedications as any[]) || [])]
    currentMedications[index] = { ...currentMedications[index], [field]: value }
    onUpdateField('currentMedications', currentMedications)
  }

  const removeMedication = (index: number) => {
    const currentMedications = (data.currentMedications as any[]) || []
    onUpdateField('currentMedications', currentMedications.filter((_, i) => i !== index))
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Heart className="h-6 w-6 mr-2 text-red-500" />
          Medical History
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

        {/* Medical Conditions */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Conditions</h3>
          <div className="space-y-4">
            {medicalConditions.map((condition) => (
              <div key={condition.key} className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={data[condition.key] as boolean || false}
                      onChange={(e) => onUpdateField(condition.key, e.target.checked)}
                      disabled={isReadOnly}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                        isReadOnly ? 'cursor-not-allowed' : ''
                      }`}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">{condition.label}</span>
                  </label>
                </div>
                
                {data[condition.key] && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comments/Details
                    </label>
                    <textarea
                      value={data[`${condition.key}Comment`] as string || ''}
                      onChange={(e) => onUpdateField(`${condition.key}Comment`, e.target.value)}
                      disabled={isReadOnly}
                      rows={2}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Provide additional details..."
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addAllergy}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Allergy
              </button>
            )}
          </div>
          
          {((data.allergies as any[]) || []).length === 0 ? (
            <p className="text-gray-500 italic">No allergies recorded. Click "Add Allergy" to add one.</p>
          ) : (
            <div className="space-y-4">
              {((data.allergies as any[]) || []).map((allergy, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allergen
                      </label>
                      <input
                        type="text"
                        value={allergy.allergenName || ''}
                        onChange={(e) => updateAllergy(index, 'allergenName', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="e.g., Penicillin"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reaction
                      </label>
                      <input
                        type="text"
                        value={allergy.reaction || ''}
                        onChange={(e) => updateAllergy(index, 'reaction', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="e.g., Rash, Swelling"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severity
                      </label>
                      <select
                        value={allergy.severity || ''}
                        onChange={(e) => updateAllergy(index, 'severity', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="">Select severity</option>
                        <option value="Mild">Mild</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                        <option value="Life-threatening">Life-threatening</option>
                      </select>
                    </div>
                    {!isReadOnly && (
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeAllergy(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={allergy.notes || ''}
                      onChange={(e) => updateAllergy(index, 'notes', e.target.value)}
                      disabled={isReadOnly}
                      rows={2}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Additional notes about this allergy..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current Medications */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Current Medications</h3>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addMedication}
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </button>
            )}
          </div>
          
          {((data.currentMedications as any[]) || []).length === 0 ? (
            <p className="text-gray-500 italic">No medications recorded. Click "Add Medication" to add one.</p>
          ) : (
            <div className="space-y-4">
              {((data.currentMedications as any[]) || []).map((medication, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medication Name
                      </label>
                      <input
                        type="text"
                        value={medication.medicationName || ''}
                        onChange={(e) => updateMedication(index, 'medicationName', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="e.g., Lisinopril"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dose
                      </label>
                      <input
                        type="text"
                        value={medication.dose || ''}
                        onChange={(e) => updateMedication(index, 'dose', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="e.g., 10mg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <input
                        type="text"
                        value={medication.frequency || ''}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="e.g., Once daily"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prescribed For
                      </label>
                      <input
                        type="text"
                        value={medication.prescribedFor || ''}
                        onChange={(e) => updateMedication(index, 'prescribedFor', e.target.value)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="e.g., High blood pressure"
                      />
                    </div>
                    {!isReadOnly && (
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prescribed By
                    </label>
                    <input
                      type="text"
                      value={medication.prescribedBy || ''}
                      onChange={(e) => updateMedication(index, 'prescribedBy', e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="e.g., Dr. Smith, Cardiologist"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vaccinations */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Vaccinations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={data.vaccinationFlu as boolean || false}
                  onChange={(e) => onUpdateField('vaccinationFlu', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Flu Vaccine</span>
              </label>
              {data.vaccinationFlu && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Received
                  </label>
                  <input
                    type="date"
                    value={data.vaccinationFluDate as string || ''}
                    onChange={(e) => onUpdateField('vaccinationFluDate', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={data.vaccinationPneumonia as boolean || false}
                  onChange={(e) => onUpdateField('vaccinationPneumonia', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Pneumonia Vaccine</span>
              </label>
              {data.vaccinationPneumonia && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Received
                  </label>
                  <input
                    type="date"
                    value={data.vaccinationPneumoniaDate as string || ''}
                    onChange={(e) => onUpdateField('vaccinationPneumoniaDate', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <label className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={data.vaccinationCovid as boolean || false}
                  onChange={(e) => onUpdateField('vaccinationCovid', e.target.checked)}
                  disabled={isReadOnly}
                  className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    isReadOnly ? 'cursor-not-allowed' : ''
                  }`}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">COVID-19 Vaccine</span>
              </label>
              {data.vaccinationCovid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Received
                  </label>
                  <input
                    type="date"
                    value={data.vaccinationCovidDate as string || ''}
                    onChange={(e) => onUpdateField('vaccinationCovidDate', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Healthcare Provider Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Healthcare Provider Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="primaryCarePhysicianName" className="block text-sm font-medium text-gray-700 mb-1">
                Primary Care Physician Name
              </label>
              <input
                type="text"
                id="primaryCarePhysicianName"
                value={data.primaryCarePhysicianName as string || ''}
                onChange={(e) => onUpdateField('primaryCarePhysicianName', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ?  'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="Dr. John Smith"
              />
            </div>
            <div>
              <label htmlFor="primaryCarePhysicianPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Primary Care Physician Phone
              </label>
              <input
                type="tel"
                id="primaryCarePhysicianPhone"
                value={data.primaryCarePhysicianPhone as string || ''}
                onChange={(e) => onUpdateField('primaryCarePhysicianPhone', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}