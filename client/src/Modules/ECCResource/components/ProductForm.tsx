import React, { useState, useEffect } from 'react';
import { Plus, X, ExternalLink, Search } from 'lucide-react';
import { Product, ProductFormData, PRODUCT_CATEGORIES, RetailerLink } from '../types/product';

interface ProductFormProps {
  product?: Product | null;
  onSave: (productData: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    brand: '',
    model: '',
    description: '',
    features: '',
    price_range: '',
    where_to_buy: '',
    website: '',
    medicaid_covered: false,
    medicare_covered: false,
    insurance_notes: '',
    user_guide_url: '',
    video_demo_url: '',
    tags: '',
    recommended_for: '',
    safety_features: '',
    ecc_notes: ''
  });

  const [retailerLinks, setRetailerLinks] = useState<RetailerLink[]>([]);
  const [newRetailer, setNewRetailer] = useState({ name: '', url: '' });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        brand: product.brand || '',
        model: product.model || '',
        description: product.description || '',
        features: product.features?.join(', ') || '',
        price_range: product.price_range || '',
        where_to_buy: product.where_to_buy?.join(', ') || '',
        website: product.website || '',
        medicaid_covered: product.medicaid_covered || false,
        medicare_covered: product.medicare_covered || false,
        insurance_notes: product.insurance_notes || '',
        user_guide_url: product.user_guide_url || '',
        video_demo_url: product.video_demo_url || '',
        tags: product.tags?.join(', ') || '',
        recommended_for: product.recommended_for?.join(', ') || '',
        safety_features: product.safety_features?.join(', ') || '',
        ecc_notes: product.ecc_notes || ''
      });
      setRetailerLinks(product.retailer_links || []);
    }
  }, [product]);

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRetailerLink = () => {
    if (newRetailer.name && newRetailer.url) {
      setRetailerLinks(prev => [...prev, { ...newRetailer, is_affiliate: false }]);
      setNewRetailer({ name: '', url: '' });
    }
  };

  const removeRetailerLink = (index: number) => {
    setRetailerLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickSearch = (retailer: string) => {
    const searchQuery = encodeURIComponent(`${formData.name} ${formData.brand}`);
    let searchUrl = '';
    
    switch (retailer) {
      case 'google':
        searchUrl = `https://shopping.google.com/search?q=${searchQuery}`;
        break;
      case 'amazon':
        searchUrl = `https://www.amazon.com/s?k=${searchQuery}`;
        break;
      case 'walmart':
        searchUrl = `https://www.walmart.com/search?q=${searchQuery}`;
        break;
    }
    
    if (searchUrl) {
      window.open(searchUrl, '_blank');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Partial<Product> = {
      id: product?.id,
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      model: formData.model,
      description: formData.description,
      features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      price_range: formData.price_range,
      where_to_buy: formData.where_to_buy.split(',').map(w => w.trim()).filter(w => w),
      retailer_links: retailerLinks,
      website: formData.website,
      medicaid_covered: formData.medicaid_covered,
      medicare_covered: formData.medicare_covered,
      insurance_notes: formData.insurance_notes,
      user_guide_url: formData.user_guide_url,
      video_demo_url: formData.video_demo_url,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      recommended_for: formData.recommended_for.split(',').map(r => r.trim()).filter(r => r),
      safety_features: formData.safety_features.split(',').map(s => s.trim()).filter(s => s),
      ecc_notes: formData.ecc_notes,
      isActive: true,
      last_updated: new Date()
    };

    onSave(productData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select category</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Price and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., $50-100, $200+, Contact for pricing"
                value={formData.price_range}
                onChange={(e) => handleInputChange('price_range', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Official Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Retailer Links Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Retailer Links
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSearch('google')}
                  className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Google Shopping
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('amazon')}
                  className="flex items-center px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Amazon
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSearch('walmart')}
                  className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  <Search className="h-3 w-3 mr-1" />
                  Walmart
                </button>
              </div>
            </div>

            {/* Existing Retailer Links */}
            {retailerLinks.length > 0 && (
              <div className="space-y-2 mb-4">
                {retailerLinks.map((link, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="font-medium text-sm">{link.name}:</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-blue-600 hover:text-blue-800 text-sm truncate"
                    >
                      {link.url}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeRetailerLink(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Retailer Link */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Retailer name (e.g., Amazon)"
                value={newRetailer.name}
                onChange={(e) => setNewRetailer(prev => ({ ...prev, name: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
              <input
                type="url"
                placeholder="Product URL"
                value={newRetailer.url}
                onChange={(e) => setNewRetailer(prev => ({ ...prev, url: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addRetailerLink}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Insurance Coverage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Insurance Coverage
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.medicare_covered}
                  onChange={(e) => handleInputChange('medicare_covered', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Medicare covered</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.medicaid_covered}
                  onChange={(e) => handleInputChange('medicaid_covered', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Medicaid covered</span>
              </label>
            </div>
            {(formData.medicare_covered || formData.medicaid_covered) && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Insurance coverage notes"
                  value={formData.insurance_notes}
                  onChange={(e) => handleInputChange('insurance_notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features (comma-separated)
              </label>
              <textarea
                rows={2}
                value={formData.features}
                onChange={(e) => handleInputChange('features', e.target.value)}
                placeholder="Feature 1, Feature 2, Feature 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recommended For (comma-separated)
              </label>
              <textarea
                rows={2}
                value={formData.recommended_for}
                onChange={(e) => handleInputChange('recommended_for', e.target.value)}
                placeholder="Use case 1, Use case 2, Use case 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* ECC Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ECC Care Team Notes
            </label>
            <textarea
              rows={3}
              value={formData.ecc_notes}
              onChange={(e) => handleInputChange('ecc_notes', e.target.value)}
              placeholder="Internal notes for care managers about this product..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;