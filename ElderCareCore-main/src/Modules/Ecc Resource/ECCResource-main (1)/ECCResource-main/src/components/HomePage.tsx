import React, { useState, useMemo } from 'react';
import { Search, Building2, MapPin, Phone, Mail, Globe, User, Tag, Filter, CheckCircle, Clock, Edit3, Shield, Trash2, Grid3X3, List, ChevronDown, ChevronRight, Home, Brain, Guitar as Hospital, Heart, Stethoscope, Scale, DollarSign, Car, Wrench, UtensilsCrossed, Users, Building, Activity, UserCheck, Briefcase, GraduationCap, FileText, Headphones, Medal, Truck, HandHeart, Calendar, Settings, Shield as ShieldIcon, Star } from 'lucide-react';
import { useResources } from '../hooks/useFirebase';
import { useAuth } from './AuthWrapper';
import { Resource } from '../types/resource';
import { getAllCategories, getCategoryHierarchy, getMainCategories } from '../data/categories';
import ECCFavoriteStar from './ECCFavoriteStar';

interface HomePageProps {
  onEdit?: (resource: Resource) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onEdit }) => {
  const { resources, loading, error, toggleECCFavorite } = useResources();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'categories' | 'list'>('categories');
  const [expandedMainCategories, setExpandedMainCategories] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Check if user is admin (for admin-only features like deletion)
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('ecc') || true; // Force admin for testing

  const availableCategories = useMemo(() => {
    return getAllCategories(); // Already sorted alphabetically in the function
  }, []);

  const categoryHierarchy = useMemo(() => {
    return getCategoryHierarchy();
  }, []);

  const mainCategories = useMemo(() => {
    return getMainCategories();
  }, []);

  // Get category counts and resources by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableCategories.forEach(category => {
      counts[category] = resources.filter(resource => resource.type === category).length;
    });
    return counts;
  }, [resources, availableCategories]);

  const mainCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(categoryHierarchy).forEach(([mainCategory, subcategories]) => {
      counts[mainCategory] = subcategories.reduce((total, subcat) => {
        return total + (categoryCounts[subcat] || 0);
      }, 0);
    });
    return counts;
  }, [categoryHierarchy, categoryCounts]);

  const resourcesByCategory = useMemo(() => {
    const byCategory: Record<string, Resource[]> = {};
    availableCategories.forEach(category => {
      byCategory[category] = resources
        .filter(resource => resource.type === category)
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort resources A-Z within each category
    });
    return byCategory;
  }, [resources, availableCategories]);

  const filteredResources = useMemo(() => {
    let filtered = resources.filter(resource => {
      const matchesSearch = 
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || resource.type === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort filtered resources alphabetically by name
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [resources, searchTerm, selectedCategory]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setViewMode('list');
  };

  const handleResetFilter = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setViewMode('categories');
    setExpandedMainCategories(new Set());
  };

  const handleViewModeChange = (mode: 'categories' | 'list') => {
    setViewMode(mode);
    if (mode === 'categories') {
      setSelectedCategory('');
    }
  };

  const toggleMainCategoryExpansion = (mainCategory: string) => {
    const newExpanded = new Set(expandedMainCategories);
    if (newExpanded.has(mainCategory)) {
      newExpanded.delete(mainCategory);
    } else {
      newExpanded.add(mainCategory);
    }
    setExpandedMainCategories(newExpanded);
  };

  const handleToggleECCFavorite = async (resource: Resource) => {
    if (!resource.id) return;
    await toggleECCFavorite(resource.id, !resource.isECCFavorite);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading resources...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 border border-blue-100 shadow-sm">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Find the Right Care Resources
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover comprehensive elder care services, healthcare providers, and support resources in your community
            </p>
          </div>

          {/* Main Search Bar */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search by service name, type, description, or keywords..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value && viewMode === 'categories') {
                    setViewMode('list');
                  }
                }}
                className="w-full pl-12 pr-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white"
              />
            </div>

            {/* Service Type Dropdown */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  if (e.target.value) {
                    setViewMode('list');
                  } else {
                    setViewMode('categories');
                  }
                }}
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm bg-white appearance-none cursor-pointer"
              >
                <option value="">All Service Types</option>
                {Object.entries(categoryHierarchy).map(([groupName, categories]) => (
                  <optgroup key={groupName} label={`${groupName}`}>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category} ({categoryCounts[category] || 0})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Search Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {viewMode === 'list' ? filteredResources.length : resources.length} Resources
              </span>
              <span className="flex items-center gap-2">
                <List className="w-4 h-4" />
                {mainCategories.length} Main Categories
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-600" />
                {resources.filter(r => r.isECCFavorite).length} ECC Favorites
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle and Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedCategory ? `${selectedCategory} Services` : 
             searchTerm ? 'Search Results' : 
             viewMode === 'list' ? 'All Resources' : 'Service Categories'}
          </h2>
          {(selectedCategory || searchTerm || viewMode === 'list') && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredResources.length} found
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('categories')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                viewMode === 'categories'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="View as category accordion"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Categories</span>
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="View as resource list"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">Resources</span>
            </button>
          </div>

          {/* Filters Button */}
          <button
            onClick={handleToggleFilters}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${
              showFilters
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Toggle filters panel"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          
          {/* Clear Filters Button */}
          {(selectedCategory || searchTerm) && (
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'categories' ? (
        <ServiceCategoriesAccordion
          mainCategories={mainCategories}
          categoryHierarchy={categoryHierarchy}
          mainCategoryCounts={mainCategoryCounts}
          categoryCounts={categoryCounts}
          resourcesByCategory={resourcesByCategory}
          expandedMainCategories={expandedMainCategories}
          onToggleMainCategory={toggleMainCategoryExpansion}
          onCategoryClick={handleCategoryClick}
          onEdit={onEdit}
          onToggleECCFavorite={handleToggleECCFavorite}
          isAdmin={isAdmin}
          canEdit={!!user}
          searchTerm={searchTerm}
        />
      ) : (
        <ResourcesList
          resources={filteredResources}
          onEdit={onEdit}
          onToggleECCFavorite={handleToggleECCFavorite}
          isAdmin={isAdmin}
          canEdit={!!user}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          onBackToCategories={() => handleViewModeChange('categories')}
        />
      )}

      {/* User Access Info */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Access Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800 text-sm">
          <div className="space-y-2">
            <p><strong>✅ Resource Viewing:</strong> All users</p>
            <p><strong>✅ Resource Creation:</strong> All authenticated users</p>
            <p><strong>✅ Resource Editing:</strong> All authenticated users</p>
          </div>
          <div className="space-y-2">
            <p><strong>✅ User:</strong> {user?.email || 'user@test.com'}</p>
            <p><strong>✅ Access Level:</strong> {isAdmin ? 'Administrator' : 'User'}</p>
            <p><strong>🔒 Admin Features:</strong> {isAdmin ? 'CSV Import, Deletion' : 'View Only'}</p>
            <p><strong>⭐ ECC Favorites:</strong> {isAdmin ? 'Can Toggle' : 'View Only'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ServiceCategoriesAccordionProps {
  mainCategories: string[];
  categoryHierarchy: Record<string, string[]>;
  mainCategoryCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  resourcesByCategory: Record<string, Resource[]>;
  expandedMainCategories: Set<string>;
  onToggleMainCategory: (mainCategory: string) => void;
  onCategoryClick: (category: string) => void;
  onEdit?: (resource: Resource) => void;
  onToggleECCFavorite: (resource: Resource) => void;
  isAdmin: boolean;
  canEdit: boolean;
  searchTerm: string;
}

const ServiceCategoriesAccordion: React.FC<ServiceCategoriesAccordionProps> = ({
  mainCategories,
  categoryHierarchy,
  mainCategoryCounts,
  categoryCounts,
  resourcesByCategory,
  expandedMainCategories,
  onToggleMainCategory,
  onCategoryClick,
  onEdit,
  onToggleECCFavorite,
  isAdmin,
  canEdit,
  searchTerm
}) => {
  // Filter main categories based on search term
  const filteredMainCategories = useMemo(() => {
    if (!searchTerm) return mainCategories;
    return mainCategories.filter(mainCategory => {
      const mainMatches = mainCategory.toLowerCase().includes(searchTerm.toLowerCase());
      const subcategoriesMatch = categoryHierarchy[mainCategory]?.some(subcat =>
        subcat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resourcesByCategory[subcat]?.some(resource =>
          resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
      return mainMatches || subcategoriesMatch;
    });
  }, [mainCategories, searchTerm, categoryHierarchy, resourcesByCategory]);

  // Get professional main category icon from Lucide React
  const getMainCategoryIcon = (mainCategory: string) => {
    const categoryLower = mainCategory.toLowerCase();
    
    if (categoryLower.includes('living') || categoryLower.includes('housing')) {
      return Home;
    } else if (categoryLower.includes('medical facilities')) {
      return Hospital;
    } else if (categoryLower.includes('in-home') || categoryLower.includes('community-based')) {
      return Heart;
    } else if (categoryLower.includes('support services') || categoryLower.includes('programs')) {
      return Users;
    } else if (categoryLower.includes('medical') && categoryLower.includes('clinical')) {
      return Stethoscope;
    } else if (categoryLower.includes('financial') || categoryLower.includes('legal') || categoryLower.includes('insurance')) {
      return Scale;
    } else if (categoryLower.includes('equipment') || categoryLower.includes('safety')) {
      return Wrench;
    } else if (categoryLower.includes('transportation') || categoryLower.includes('delivery')) {
      return Car;
    } else if (categoryLower.includes('community resources') || categoryLower.includes('government')) {
      return Building;
    } else {
      return Building2; // Default icon
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {searchTerm ? `Categories matching "${searchTerm}"` : 'Browse Service Categories'}
        </h2>
        <p className="text-gray-600">
          {searchTerm 
            ? `${filteredMainCategories.length} main categories found`
            : 'Click on any main category to explore subcategories and resources'
          }
        </p>
      </div>

      {filteredMainCategories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500">
            Try adjusting your search terms or browse all categories
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {filteredMainCategories.map((mainCategory, index) => (
            <MainCategoryAccordionItem
              key={mainCategory}
              mainCategory={mainCategory}
              subcategories={categoryHierarchy[mainCategory] || []}
              totalCount={mainCategoryCounts[mainCategory] || 0}
              categoryCounts={categoryCounts}
              resourcesByCategory={resourcesByCategory}
              IconComponent={getMainCategoryIcon(mainCategory)}
              isExpanded={expandedMainCategories.has(mainCategory)}
              onToggle={() => onToggleMainCategory(mainCategory)}
              onCategoryClick={onCategoryClick}
              onEdit={onEdit}
              onToggleECCFavorite={onToggleECCFavorite}
              isAdmin={isAdmin}
              canEdit={canEdit}
              isLast={index === filteredMainCategories.length - 1}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface MainCategoryAccordionItemProps {
  mainCategory: string;
  subcategories: string[];
  totalCount: number;
  categoryCounts: Record<string, number>;
  resourcesByCategory: Record<string, Resource[]>;
  IconComponent: React.ComponentType<{ className?: string }>;
  isExpanded: boolean;
  onToggle: () => void;
  onCategoryClick: (category: string) => void;
  onEdit?: (resource: Resource) => void;
  onToggleECCFavorite: (resource: Resource) => void;
  isAdmin: boolean;
  canEdit: boolean;
  isLast: boolean;
  searchTerm: string;
}

const MainCategoryAccordionItem: React.FC<MainCategoryAccordionItemProps> = ({
  mainCategory,
  subcategories,
  totalCount,
  categoryCounts,
  resourcesByCategory,
  IconComponent,
  isExpanded,
  onToggle,
  onCategoryClick,
  onEdit,
  onToggleECCFavorite,
  isAdmin,
  canEdit,
  isLast,
  searchTerm
}) => {
  // Filter subcategories based on search term
  const filteredSubcategories = useMemo(() => {
    if (!searchTerm) return subcategories;
    return subcategories.filter(subcat =>
      subcat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resourcesByCategory[subcat]?.some(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [subcategories, searchTerm, resourcesByCategory]);

  return (
    <div className={`${!isLast ? 'border-b border-gray-200' : ''}`}>
      {/* Main Category Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 text-left"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Professional Icon - Larger and Bolder */}
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          
          {/* Main Category Name */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate">
              {mainCategory}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredSubcategories.length} subcategories • {totalCount} total resources
            </p>
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        <div className="flex items-center gap-3">
          <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-sm">
            {totalCount}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-6 h-6 text-gray-500 transition-transform duration-200" />
          ) : (
            <ChevronRight className="w-6 h-6 text-gray-500 transition-transform duration-200" />
          )}
        </div>
      </button>

      {/* Expanded Subcategories */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        {isExpanded && (
          <div className="px-6 pb-6 bg-gradient-to-r from-gray-50 to-blue-50">
            {filteredSubcategories.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No subcategories match your search</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-4 pl-4 border-l-4 border-blue-400 bg-white rounded-r-lg py-2">
                  <strong>{filteredSubcategories.length}</strong> subcategories in <strong>{mainCategory}</strong>
                </div>
                
                {/* Subcategories List */}
                <div className="space-y-2">
                  {filteredSubcategories.map((subcategory) => (
                    <SubcategoryItem
                      key={subcategory}
                      subcategory={subcategory}
                      count={categoryCounts[subcategory] || 0}
                      resources={resourcesByCategory[subcategory] || []}
                      onCategoryClick={onCategoryClick}
                      onEdit={onEdit}
                      onToggleECCFavorite={onToggleECCFavorite}
                      isAdmin={isAdmin}
                      canEdit={canEdit}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface SubcategoryItemProps {
  subcategory: string;
  count: number;
  resources: Resource[];
  onCategoryClick: (category: string) => void;
  onEdit?: (resource: Resource) => void;
  onToggleECCFavorite: (resource: Resource) => void;
  isAdmin: boolean;
  canEdit: boolean;
}

const SubcategoryItem: React.FC<SubcategoryItemProps> = ({
  subcategory,
  count,
  resources,
  onCategoryClick,
  onEdit,
  onToggleECCFavorite,
  isAdmin,
  canEdit
}) => {
  const [showResources, setShowResources] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Subcategory Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => onCategoryClick(subcategory)}
          className="flex-1 text-left hover:text-blue-600 transition-colors"
        >
          <h4 className="font-semibold text-gray-900 text-lg">
            {subcategory}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {count} {count === 1 ? 'resource' : 'resources'} available
          </p>
        </button>
        
        <div className="flex items-center gap-3">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {count}
          </span>
          {count > 0 && (
            <button
              onClick={() => setShowResources(!showResources)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title={showResources ? 'Hide resources' : 'Show resources'}
            >
              {showResources ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Resources Preview */}
      {showResources && count > 0 && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="space-y-3">
            {resources.slice(0, 3).map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Small Logo */}
                    <div className="flex-shrink-0">
                      {resource.logoUrl ? (
                        <img
                          src={resource.logoUrl}
                          alt={`${resource.name} logo`}
                          className="w-10 h-10 object-contain rounded border border-gray-200 bg-white"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                    
                    {/* Resource Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-gray-900 truncate text-sm">
                          {resource.name}
                        </h5>
                        <ECCFavoriteStar
                          isECCFavorite={resource.isECCFavorite}
                          onToggle={() => onToggleECCFavorite(resource)}
                          size="sm"
                        />
                      </div>
                      {resource.address && (
                        <p className="text-xs text-gray-500 truncate">
                          {resource.address}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {canEdit && onEdit && (
                      <button
                        onClick={() => onEdit(resource)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded"
                        title="Edit resource"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {resources.length > 3 && (
              <button
                onClick={() => onCategoryClick(subcategory)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors"
              >
                View all {count} resources in {subcategory}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ResourcesListProps {
  resources: Resource[];
  onEdit?: (resource: Resource) => void;
  onToggleECCFavorite: (resource: Resource) => void;
  isAdmin: boolean;
  canEdit: boolean;
  selectedCategory: string;
  searchTerm: string;
  onBackToCategories?: () => void;
}

const ResourcesList: React.FC<ResourcesListProps> = ({
  resources,
  onEdit,
  onToggleECCFavorite,
  isAdmin,
  canEdit,
  selectedCategory,
  searchTerm,
  onBackToCategories
}) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
        <p className="text-gray-500 mb-4">
          {searchTerm || selectedCategory
            ? 'Try adjusting your search or filters'
            : 'No resources have been added yet'
          }
        </p>
        {(searchTerm || selectedCategory) && onBackToCategories && (
          <button
            onClick={onBackToCategories}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <List className="w-4 h-4" />
            Browse All Categories
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List Header with Category Info */}
      {selectedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">{selectedCategory}</h3>
              <p className="text-blue-700 text-sm">
                Showing {resources.length} {resources.length === 1 ? 'resource' : 'resources'} in alphabetical order
              </p>
            </div>
            {onBackToCategories && (
              <button
                onClick={onBackToCategories}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <List className="w-4 h-4" />
                Back to Categories
              </button>
            )}
          </div>
        </div>
      )}

      {/* Resources Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onEdit={onEdit}
            onToggleECCFavorite={onToggleECCFavorite}
            isAdmin={isAdmin}
            canEdit={canEdit}
          />
        ))}
      </div>
    </div>
  );
};

interface ResourceCardProps {
  resource: Resource;
  onEdit?: (resource: Resource) => void;
  onToggleECCFavorite: (resource: Resource) => void;
  isAdmin: boolean;
  canEdit: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  onEdit, 
  onToggleECCFavorite, 
  isAdmin, 
  canEdit 
}) => {
  const handleDelete = async () => {
    if (!isAdmin) {
      alert('Only administrators can delete resources.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${resource.name}"? This action cannot be undone.`)) {
      try {
        // TODO: Implement delete functionality in useResources hook
        console.log('Delete resource:', resource.id);
        alert('Delete functionality will be implemented with proper Firebase rules.');
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Failed to delete resource. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden hover-lift">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Logo - Increased size and improved styling */}
            <div className="flex-shrink-0">
              {resource.logoUrl ? (
                <img
                  src={resource.logoUrl}
                  alt={`${resource.name} logo`}
                  className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-white shadow-sm p-2"
                  style={{
                    imageRendering: 'crisp-edges',
                    imageRendering: '-webkit-optimize-contrast',
                    imageRendering: 'optimize-contrast'
                  }}
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center shadow-sm">
                  <Building2 className="w-10 h-10 text-blue-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {resource.name}
                </h3>
                {resource.verified ? (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" title="Verified Resource" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" title="Pending Verification" />
                )}
                <ECCFavoriteStar
                  isECCFavorite={resource.isECCFavorite}
                  onToggle={() => onToggleECCFavorite(resource)}
                  size="md"
                />
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  {resource.type}
                </span>
                {resource.subcategory && (
                  <span className="text-gray-500 text-xs">{resource.subcategory}</span>
                )}
              </div>

              {resource.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {resource.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(resource)}
                className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                title="Edit resource"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                title="Delete resource (Admin only)"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="px-6 pb-4 space-y-3">
        {resource.address && (
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{resource.address}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {resource.phone && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a
                href={`tel:${resource.phone}`}
                className="hover:text-blue-600 transition-colors font-medium"
              >
                {resource.phone}
              </a>
            </div>
          )}

          {resource.email && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <a
                href={`mailto:${resource.email}`}
                className="hover:text-blue-600 transition-colors truncate"
              >
                {resource.email}
              </a>
            </div>
          )}
        </div>

        {resource.website && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a
              href={resource.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors truncate font-medium"
            >
              {resource.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {resource.contact_person && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{resource.contact_person}</span>
          </div>
        )}
      </div>

      {/* Tags and Service Area */}
      {(resource.tags.length > 0 || resource.service_area) && (
        <div className="px-6 pb-4 space-y-3">
          {resource.tags.length > 0 && (
            <div className="flex items-start gap-2">
              <Tag className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {resource.tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium"
                  >
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 4 && (
                  <span className="text-gray-500 text-xs px-2 py-1">
                    +{resource.tags.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {resource.service_area && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                Service Area: {resource.service_area}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Added {resource.createdAt.toLocaleDateString()}</span>
          {resource.updatedAt.getTime() !== resource.createdAt.getTime() && (
            <span>Updated {resource.updatedAt.toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;