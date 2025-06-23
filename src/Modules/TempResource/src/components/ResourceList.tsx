import React, { useState, useMemo } from 'react';
import { 
  Search, Building2, MapPin, Phone, Mail, Globe, User, Tag, 
  CheckCircle, Clock, Edit3, Trash2 
} from 'lucide-react';
import { useResources } from '../hooks/useResources';
import { useAuth } from './AuthWrapper';
import { Resource } from '../types/resource';
import { getAllCategories } from '../data/categories';
import toast, { Toaster } from 'react-hot-toast';

interface ResourceListProps {
  onEdit?: (resource: Resource) => void;
}

const ResourceList: React.FC<ResourceListProps> = ({ onEdit }) => {
  const {
    resources,
    loading,
    error,
    deleteResource,   // Hard delete
    archiveResource,  // Soft delete
  } = useResources();

  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('ecc') || true;

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch =
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        resource.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.subcategory.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = !typeFilter || resource.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [resources, searchTerm, typeFilter]);

  const availableCategories = useMemo(() => {
    return getAllCategories();
  }, []);

  // ✅ TOGGLE: switch between hard delete and soft delete here:
  const USE_SOFT_DELETE = true;

  const handleRemove = (id: string, logoUrl?: string) => {
    if (USE_SOFT_DELETE) {
      return archiveResource(id);
    } else {
      return deleteResource(id, logoUrl);
    }
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
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            ECC Resource Directory
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredResources.length} of {resources.length} resources available
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200">
          <User className="w-4 h-4" />
          <span>Anyone can add/edit • {isAdmin ? 'Admin can delete or archive' : 'View only'}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, service type, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="w-full lg:w-64">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Service Types</option>
              {availableCategories.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter
              ? 'Try adjusting your search or filters'
              : 'No resources have been added yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onEdit={onEdit}
              onRemove={handleRemove} // ✅ Unified remove handler!
              isAdmin={isAdmin}
              canEdit={!!user}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ResourceCardProps {
  resource: Resource;
  onEdit?: (resource: Resource) => void;
  onRemove: (id: string, logoUrl?: string) => void;
  isAdmin: boolean;
  canEdit: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onEdit, onRemove, isAdmin, canEdit }) => {
  const handleRemove = async () => {
    if (!isAdmin) {
      toast.error('Only administrators can remove resources.');
      return;
    }

    const action = window.confirm(`Are you sure you want to ${'archive'} "${resource.name}"?`);
    if (!action) return;

    const promise = onRemove(resource.id, resource.logoUrl);

    toast.promise(
      promise,
      {
        loading: `${'Archiving'} resource...`,
        success: `${'Resource archived successfully!'}`,
        error: `Failed to ${'archive'} resource.`,
      },
      { duration: 3000 }
    );

    try {
      await promise;
    } catch {
      // handled by toast
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              {resource.logoUrl ? (
                <img
                  src={resource.logoUrl}
                  alt={`${resource.name} logo`}
                  className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-white"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {resource.name}
                </h3>
                {resource.verified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" title="Verified Resource" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-500" title="Pending Verification" />
                )}
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

          <div className="flex items-center gap-2">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(resource)}
                className="text-gray-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg"
                title="Edit resource"
              >
                <Edit3 className="w-5 h-5" />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={handleRemove}
                className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg"
                title="Remove resource (Admin only)"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceList;
