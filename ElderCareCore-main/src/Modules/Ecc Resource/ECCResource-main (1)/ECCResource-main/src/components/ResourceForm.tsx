import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, X, Building2, Mail, Phone, Globe, User, MapPin, Tag, FileText, Shield, Star } from 'lucide-react';
import { useResources } from '../hooks/useFirebase';
import { useAuth } from './AuthWrapper';
import { Resource, ResourceFormData } from '../types/resource';
import { getAllCategories, getCategoryHierarchy } from '../data/categories';
import ECCFavoriteStar from './ECCFavoriteStar';

interface ResourceFormProps {
  editingResource?: Resource | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ editingResource, onSuccess, onCancel }) => {
  const { addResource, updateResource, uploadLogo, toggleECCFavorite } = useResources();
  const { user } = useAuth();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [categoryHierarchy, setCategoryHierarchy] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Anyone can add/edit resources now
  const canAddEdit = !!user; // Any authenticated user can add/edit
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('ecc') || true; // Force admin for testing

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ResourceFormData>();

  const watchedFields = watch();

  // Load available categories on component mount
  useEffect(() => {
    setAvailableCategories(getAllCategories());
    setCategoryHierarchy(getCategoryHierarchy());
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (editingResource) {
      setValue('name', editingResource.name);
      setValue('type', editingResource.type);
      setValue('subcategory', editingResource.subcategory);
      setValue('address', editingResource.address);
      setValue('phone', editingResource.phone);
      setValue('email', editingResource.email);
      setValue('website', editingResource.website);
      setValue('contact_person', editingResource.contact_person);
      setValue('description', editingResource.description);
      setValue('tags', editingResource.tags.join(', '));
      setValue('service_area', editingResource.service_area);
      
      if (editingResource.logoUrl) {
        setLogoPreview(editingResource.logoUrl);
      }
    }
  }, [editingResource, setValue]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  const handleLogoFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogoFile = () => {
    setLogoFile(null);
    setLogoPreview(editingResource?.logoUrl || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleECCFavorite = async () => {
    if (!editingResource?.id || !isAdmin) return;
    await toggleECCFavorite(editingResource.id, !editingResource.isECCFavorite);
  };

  const onSubmit = async (data: ResourceFormData) => {
    if (!canAddEdit) {
      alert('You must be logged in to add or edit resources.');
      return;
    }

    try {
      setUploading(true);
      
      let logoUrl = editingResource?.logoUrl || '';
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile, editingResource?.id);
      }

      const resourceData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        logoUrl,
        verified: editingResource?.verified || false,
        // Preserve existing ECC Favorite status when editing
        isECCFavorite: editingResource?.isECCFavorite || false,
      };

      if (editingResource) {
        await updateResource(editingResource.id!, resourceData);
      } else {
        await addResource(resourceData);
      }

      reset();
      removeLogoFile();
      onSuccess?.();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Error saving resource. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!canAddEdit) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="px-8 py-12 text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600 mb-4">You must be logged in to add or edit resources.</p>
          <button
            onClick={onCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-6 h-6 text-blue-600" />
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h2>
            <p className="text-gray-600 mt-2">
              {editingResource 
                ? 'Update the resource information below.'
                : 'Fill out the information below to add a new resource to the directory.'
              }
            </p>
            <div className="mt-2 text-sm text-blue-700 bg-blue-100 px-3 py-1 rounded-full inline-block">
              ✅ Open to all authenticated users
            </div>
          </div>
          
          {/* ECC Favorite Toggle for Admins when editing */}
          {editingResource && isAdmin && (
            <div className="flex flex-col items-center gap-2">
              <ECCFavoriteStar
                isECCFavorite={editingResource.isECCFavorite}
                onToggle={handleToggleECCFavorite}
                size="lg"
              />
              <span className="text-xs text-gray-600 text-center">
                Staff/Admin Only
              </span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-8">
        {/* Logo Upload Section */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Organization Logo
          </label>
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {logoPreview ? (
              <div className="relative inline-block">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-w-32 max-h-32 object-contain rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={removeLogoFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-700">Drop your logo here</p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Choose File
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleLogoFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Organization Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('name', { required: 'Organization name is required' })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter organization name"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Service Type *
            </label>
            <select
              {...register('type', { required: 'Service type is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              style={{ fontSize: '14px', lineHeight: '1.4' }}
            >
              <option value="">Select service type</option>
              {Object.entries(categoryHierarchy).map(([groupName, categories]) => (
                <optgroup key={groupName} label={`${groupName}`} className="font-semibold text-gray-900 bg-gray-100">
                  {categories.map(category => (
                    <option key={category} value={category} className="pl-4 font-normal text-gray-700">
                      {category}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.type && (
              <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Don't see your service type? Use the <strong>"Add Service Type"</strong> button in the navigation above to add a custom one.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Subcategory / Specialty
            </label>
            <input
              {...register('subcategory')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., Memory Care, Cardiac Rehab"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Service Area
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('service_area')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., Downtown, Citywide, Regional"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            Contact Information
          </h3>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                {...register('address')}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Enter full address including city, state, zip"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('email', {
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="contact@organization.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('website')}
                  type="url"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://www.organization.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Primary Contact Person
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('contact_person')}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Smith, Director"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description and Tags */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <textarea
                {...register('description')}
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe the services, mission, and key information about this organization..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Tags & Keywords
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                {...register('tags')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="senior care, medicare, assisted living, therapy (comma separated)"
              />
            </div>
            <p className="text-sm text-gray-500">Separate tags with commas to help with search and filtering</p>
          </div>
        </div>

        {/* ECC Favorite Section for Admins */}
        {isAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-600" />
              ECC Favorite Status (Staff/Admin Only)
            </h3>
            <div className="flex items-center gap-4">
              <ECCFavoriteStar
                isECCFavorite={editingResource?.isECCFavorite || false}
                onToggle={editingResource ? handleToggleECCFavorite : () => {}}
                size="lg"
              />
              <div className="flex-1">
                <p className="text-blue-800 text-sm">
                  {editingResource?.isECCFavorite 
                    ? 'This resource is marked as an ECC Favorite and will be highlighted to users.'
                    : 'Mark this resource as an ECC Favorite to highlight it to users.'
                  }
                </p>
                {!editingResource && (
                  <p className="text-blue-600 text-xs mt-1">
                    Note: ECC Favorite status can only be set after the resource is created.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
          >
            {(isSubmitting || uploading) && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {uploading ? 'Uploading Logo...' : isSubmitting ? (editingResource ? 'Updating Resource...' : 'Creating Resource...') : (editingResource ? 'Update Resource' : 'Create Resource')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceForm;