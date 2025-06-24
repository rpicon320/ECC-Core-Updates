import React, { useState, useRef, useEffect } from 'react'
import { 
  User, 
  Heart, 
  Activity, 
  Brain, 
  Smile, 
  Home, 
  FileText, 
  Users, 
  Palette, 
  Stethoscope, 
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react'
import { SectionKey, SectionData, ValidationError } from '../../../../../types/assessment'

interface NavigationSidebarProps {
  currentSection: SectionKey
  sections: Record<SectionKey, SectionData>
  onSectionChange: (section: SectionKey) => void
  validationErrors: Record<string, ValidationError[]>
  className?: string
  hasUnsavedChanges?: boolean
  onTabSwitch?: (newSection: SectionKey) => Promise<boolean>
}

const sectionConfig = {
  basic: { label: 'Client Information', icon: User, color: 'blue' },
  medical: { label: 'Medical History', icon: Heart, color: 'red' },
  health_symptoms: { label: 'Health & Symptoms', icon: Stethoscope, color: 'orange' },
  functional: { label: 'Functional Status', icon: Activity, color: 'green' },
  cognitive: { label: 'Cognition', icon: Brain, color: 'purple' },
  slums: { label: 'SLUMS Assessment', icon: ClipboardList, color: 'indigo' },
  mental: { label: 'Mental Health', icon: Smile, color: 'pink' },
  safety: { label: 'Home Safety', icon: Home, color: 'yellow' },
  directives: { label: 'Advance Directives', icon: FileText, color: 'indigo' },
  psychosocial: { label: 'Psychosocial', icon: Users, color: 'teal' },
  hobbies: { label: 'Hobbies & Interests', icon: Palette, color: 'orange' },
  providers: { label: 'Care Providers', icon: Stethoscope, color: 'cyan' },
  services: { label: 'Care Services', icon: Settings, color: 'gray' },
  summary: { label: 'Final Summary', icon: FileText, color: 'slate' }
}

export default function NavigationSidebar({
  currentSection,
  sections,
  onSectionChange,
  validationErrors,
  className = '',
  hasUnsavedChanges = false,
  onTabSwitch
}: NavigationSidebarProps) {
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
  const [pendingSection, setPendingSection] = useState<SectionKey | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const sectionKeys = Object.keys(sectionConfig) as SectionKey[]

  // Check scroll state
  const checkScrollState = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    )
  }

  useEffect(() => {
    checkScrollState()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollState)
      const resizeObserver = new ResizeObserver(checkScrollState)
      resizeObserver.observe(container)
      
      return () => {
        container.removeEventListener('scroll', checkScrollState)
        resizeObserver.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    // Scroll active tab into view
    const container = scrollContainerRef.current
    if (!container) return

    const activeTab = container.querySelector(`[data-section="${currentSection}"]`) as HTMLElement
    if (activeTab) {
      const containerRect = container.getBoundingClientRect()
      const tabRect = activeTab.getBoundingClientRect()
      
      if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
        activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center' })
      }
    }
  }, [currentSection])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 200
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount

    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' })
  }

  const handleSectionClick = async (sectionKey: SectionKey) => {
    if (sectionKey === currentSection) return

    if (hasUnsavedChanges && onTabSwitch) {
      setPendingSection(sectionKey)
      setShowUnsavedWarning(true)
      return
    }

    onSectionChange(sectionKey)
  }

  const handleConfirmSwitch = async () => {
    if (pendingSection && onTabSwitch) {
      const canSwitch = await onTabSwitch(pendingSection)
      if (canSwitch) {
        onSectionChange(pendingSection)
      }
    }
    setShowUnsavedWarning(false)
    setPendingSection(null)
  }

  const handleCancelSwitch = () => {
    setShowUnsavedWarning(false)
    setPendingSection(null)
  }

  const getSectionStatus = (sectionKey: SectionKey) => {
    const section = sections[sectionKey]
    const hasErrors = validationErrors[sectionKey]?.length > 0
    
    if (hasErrors) return 'error'
    if (section?.isComplete) return 'complete'
    if (section?.lastUpdated && Object.keys(section.data).length > 0) return 'in-progress'
    return 'not-started'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getTabClasses = (sectionKey: SectionKey, status: string) => {
    const isActive = currentSection === sectionKey
    const baseClasses = "relative flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap cursor-pointer group min-w-[120px] max-w-[200px] flex-shrink-0 touch-manipulation"
    
    if (isActive) {
      return `${baseClasses} bg-blue-100 text-blue-700 shadow-sm border-2 border-blue-200`
    }
    
    switch (status) {
      case 'complete':
        return `${baseClasses} text-gray-700 hover:bg-green-50 hover:text-green-700 border border-transparent hover:border-green-200`
      case 'error':
        return `${baseClasses} text-gray-700 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200`
      case 'in-progress':
        return `${baseClasses} text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 border border-transparent hover:border-yellow-200`
      default:
        return `${baseClasses} text-gray-600 hover:bg-gray-100 hover:text-gray-700 border border-transparent hover:border-gray-200`
    }
  }

  // Calculate completion percentage based on completed sections
  const getCompletionPercentage = () => {
    const totalSections = sectionKeys.length
    const completedSections = sectionKeys.filter(key => sections[key]?.isComplete).length
    return Math.round((completedSections / totalSections) * 100)
  }

  const completionPercentage = getCompletionPercentage()
  const completedSections = sectionKeys.filter(key => sections[key]?.isComplete).length

  return (
    <>
      <nav className={`bg-white shadow-sm border-b sticky top-16 z-10 ${className}`} role="navigation" aria-label="Assessment sections">
        <div className="relative">
          {/* Left scroll button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-0 bottom-0 z-20 bg-white shadow-md border-r px-2 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Right scroll button */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-0 bottom-0 z-20 bg-white shadow-md border-l px-2 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Scrollable tabs container */}
          <div
            ref={scrollContainerRef}
            className={`flex overflow-x-auto scrollbar-hide gap-2 p-4 ${
              canScrollLeft ? 'pl-12' : ''
            } ${canScrollRight ? 'pr-12' : ''}`}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {sectionKeys.map((sectionKey) => {
              const config = sectionConfig[sectionKey]
              const status = getSectionStatus(sectionKey)
              const Icon = config.icon
              const errorCount = validationErrors[sectionKey]?.length || 0
              
              return (
                <button
                  key={sectionKey}
                  data-section={sectionKey}
                  onClick={() => handleSectionClick(sectionKey)}
                  className={getTabClasses(sectionKey, status)}
                  aria-current={currentSection === sectionKey ? 'page' : undefined}
                  aria-describedby={errorCount > 0 ? `${sectionKey}-errors` : undefined}
                  title={`${config.label} - ${status === 'complete' ? 'Completed' : 'In Progress'}`}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <Icon className="h-5 w-5 mr-2 flex-shrink-0" />
                    <div className="flex flex-col items-start min-w-0">
                      <span className="truncate">{config.label}</span>
                      <span className="text-xs text-gray-500">
                        {status === 'complete' ? 'Complete' : status === 'in-progress' ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    {errorCount > 0 && (
                      <span 
                        className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex-shrink-0"
                        id={`${sectionKey}-errors`}
                        aria-label={`${errorCount} validation errors`}
                      >
                        {errorCount}
                      </span>
                    )}
                    {getStatusIcon(status)}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="border-t bg-gray-50 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Overall Progress:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className="font-medium text-blue-600 min-w-[3rem]">
                    {completionPercentage}% Complete
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-600">
                  {completedSections} / {sectionKeys.length}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Errors:</span>
              <span className="font-medium text-red-600">
                {Object.values(validationErrors).reduce((sum, errors) => sum + errors.length, 0)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Unsaved Changes
            </h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes in the current section. Do you want to save before switching tabs?
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={handleCancelSwitch}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCancelSwitch()
                  if (pendingSection) {
                    onSectionChange(pendingSection)
                  }
                }}
                className="px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
              >
                Switch without saving
              </button>
              <button
                onClick={handleConfirmSwitch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save and switch
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}