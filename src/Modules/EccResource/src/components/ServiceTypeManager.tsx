import React, { useState, useEffect } from 'react';
import { Plus, X, Settings, Trash2, Edit3, Check } from 'lucide-react';
import { getAllCategories, addCustomCategory, getCustomCategories, RESOURCE_CATEGORIES } from '../data/categories';

interface ServiceTypeManagerProps {
  onClose?: () => void;
}

const ServiceTypeManager: React.FC<ServiceTypeManagerProps> = ({ onClose }) => {
  const [customType, setCustomType] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    setAvailableCategories(getAllCategories());
    setCustomCategories(getCustomCategories());
  }, []);

  const handleAddCustomType = () => {
    if (customType.trim()) {
      addCustomCategory(customType.trim());
      setAvailableCategories(getAllCategories());
      setCustomCategories(getCustomCategories());
      setCustomType('');
    }
  };

  const handleDeleteCustomType = (categoryToDelete: string) => {
    if (typeof window !== 'undefined') {
      const existing = getCustomCategories();
      const updated = existing.filter(cat => cat !== categoryToDelete);
      localStorage.setItem('customResourceCategories', JSON.stringify(updated));
      setCustomCategories(updated);
      setAvailableCategories(getAllCategories());
    }
  };

  const handleEditCustomType = (index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditingValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const existing = getCustomCategories();
      const oldValue = existing[editingIndex];
      existing[editingIndex] = editingValue.trim();
      localStorage.setItem('customResourceCategories', JSON.stringify(existing));
      setCustomCategories(existing);
      setAvailableCategories(getAllCategories());
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Manage Service Types</h2>
              <p className="text-gray-600 mt-1">
                Add custom service types or manage existing ones
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-8">
        {/* Add New Service Type */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            Add New Service Type
          </h3>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Enter new service type name"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomType()}
            />
            <button
              onClick={handleAddCustomType}
              disabled={!customType.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Service Type
            </button>
          </div>
        </div>

        {/* Default Service Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Default Service Types ({RESOURCE_CATEGORIES.length})
          </h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {RESOURCE_CATEGORIES.map((category, index) => (
                <div
                  key={index}
                  className="bg-white px-3 py-2 rounded border border-gray-200 text-sm text-gray-700"
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            These are the default service types and cannot be modified.
          </p>
        </div>

        {/* Custom Service Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Custom Service Types ({customCategories.length})
          </h3>
          
          {customCategories.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Custom Service Types</h4>
              <p className="text-gray-500">
                Add custom service types using the form above to extend the default categories.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {customCategories.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3"
                >
                  {editingIndex === index ? (
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="text-green-600 hover:text-green-700 p-1 hover:bg-green-100 rounded"
                        title="Save changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
                        title="Cancel editing"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-blue-900 font-medium">{category}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCustomType(index, category)}
                          className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-100 rounded transition-colors"
                          title="Edit service type"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomType(category)}
                          className="text-red-600 hover:text-red-700 p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete service type"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How to Use Custom Service Types:</h4>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Custom service types will appear in the dropdown when adding/editing resources</li>
            <li>• They can be used in CSV imports just like default service types</li>
            <li>• Custom types are stored locally in your browser</li>
            <li>• You can edit or delete custom types at any time</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceTypeManager;