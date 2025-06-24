import React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { SectionKey, SectionData, ValidationError } from '../../../../../types/assessment'
import { Client } from '../../../../../lib/mockData'
import BasicInformationSection from '../sections/BasicInformationSection'
import MedicalHistorySection from '../sections/MedicalHistorySection'
import HealthSymptomsSection from '../sections/HealthSymptomsSection'
import FunctionalAssessmentSection from '../sections/FunctionalAssessmentSection'
import CognitiveAssessmentSection from '../sections/CognitiveAssessmentSection'
import SlumsAssessmentSection from '../sections/SlumsAssessmentSection'
import MentalHealthSection from '../sections/MentalHealthSection'
import HomeSafetySection from '../sections/HomeSafetySection'
import AdvanceDirectivesSection from '../sections/AdvanceDirectivesSection'
import PsychosocialSection from '../sections/PsychosocialSection'
import HobbiesSection from '../sections/HobbiesSection'
import CareProvidersSection from '../sections/CareProvidersSection'
import CareServicesSection from '../sections/CareServicesSection'
import FinalSummarySection from '../sections/FinalSummarySection'

interface SectionRendererProps {
  currentSection: SectionKey
  sectionData: SectionData
  clients: Client[]
  onUpdateField: (section: SectionKey, field: string, value: unknown) => void
  onUpdateSection: (section: SectionKey, data: Partial<SectionData>) => void
  validationErrors: ValidationError[]
  mode: 'edit' | 'view' | 'print'
  onSectionChange: (section: SectionKey) => void
}

const sectionConfig = {
  basic: { label: 'Client Information' },
  medical: { label: 'Medical History' },
  health_symptoms: { label: 'Health & Symptoms' },
  functional: { label: 'Functional Status' },
  cognitive: { label: 'Cognition' },
  slums: { label: 'SLUMS Assessment' },
  mental: { label: 'Mental Health' },
  safety: { label: 'Home Safety' },
  directives: { label: 'Advance Directives' },
  psychosocial: { label: 'Psychosocial' },
  hobbies: { label: 'Hobbies & Interests' },
  providers: { label: 'Care Providers' },
  services: { label: 'Care Services' },
  summary: { label: 'Final Summary' }
}

export default function SectionRenderer({
  currentSection,
  sectionData,
  clients,
  onUpdateField,
  onUpdateSection,
  validationErrors,
  mode,
  onSectionChange
}: SectionRendererProps) {
  const sectionKeys = Object.keys(sectionConfig) as SectionKey[]
  const currentIndex = sectionKeys.indexOf(currentSection)
  const isFirstSection = currentIndex === 0
  const isLastSection = currentIndex === sectionKeys.length - 1

  const goToPrevious = () => {
    if (!isFirstSection) {
      const previousSection = sectionKeys[currentIndex - 1]
      // Backward navigation - preserve all completion statuses
      onSectionChange(previousSection)
    }
  }

  const goToNext = () => {
    if (!isLastSection) {
      // Forward navigation - mark current section as completed
      onUpdateSection(currentSection, {
        isComplete: true,
        lastUpdated: new Date()
      })
      
      const nextSection = sectionKeys[currentIndex + 1]
      onSectionChange(nextSection)
    }
  }

  const commonProps = {
    sectionData,
    onUpdateField: (field: string, value: unknown) => onUpdateField(currentSection, field, value),
    onUpdateSection: (data: Partial<SectionData>) => onUpdateSection(currentSection, data),
    validationErrors,
    mode,
    clients
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'basic':
        return <BasicInformationSection {...commonProps} />
      
      case 'medical':
        return <MedicalHistorySection {...commonProps} />
      
      case 'health_symptoms':
        return <HealthSymptomsSection {...commonProps} />
      
      case 'functional':
        return <FunctionalAssessmentSection {...commonProps} />
      
      case 'cognitive':
        return <CognitiveAssessmentSection {...commonProps} />
      
      case 'slums':
        return <SlumsAssessmentSection {...commonProps} />
      
      case 'mental':
        return <MentalHealthSection {...commonProps} />
      
      case 'safety':
        return <HomeSafetySection {...commonProps} />
      
      case 'directives':
        return <AdvanceDirectivesSection {...commonProps} />
      
      case 'psychosocial':
        return <PsychosocialSection {...commonProps} />
      
      case 'hobbies':
        return <HobbiesSection {...commonProps} />
      
      case 'providers':
        return <CareProvidersSection {...commonProps} />
      
      case 'services':
        return <CareServicesSection {...commonProps} />
      
      case 'summary':
        return <FinalSummarySection {...commonProps} />
      
      default:
        return (
          <div className="p-6 text-center">
            <p className="text-gray-500">Section not found</p>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Section Content */}
      <div className="flex-1">
        {renderSection()}
      </div>

      {/* Bottom Navigation - Only show in edit mode */}
      {mode === 'edit' && (
        <div className="sticky bottom-0 bg-white border-t shadow-lg z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                disabled={isFirstSection}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous section"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </button>

              {/* Section Info */}
              <div className="flex flex-col items-center text-center">
                <span className="text-sm font-medium text-gray-900">
                  {sectionConfig[currentSection].label}
                </span>
                <span className="text-xs text-gray-500">
                  Section {currentIndex + 1} of {sectionKeys.length}
                </span>
              </div>

              {/* Next Button */}
              <button
                onClick={goToNext}
                disabled={isLastSection}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next section"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}