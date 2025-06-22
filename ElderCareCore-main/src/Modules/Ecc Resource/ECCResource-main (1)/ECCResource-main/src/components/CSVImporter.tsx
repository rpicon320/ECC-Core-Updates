import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle, AlertCircle, X, Download, Database } from 'lucide-react';
import { useResources } from '../hooks/useFirebase';
import { useAuth } from './AuthWrapper';
import { getAllCategories } from '../data/categories';

interface CSVImporterProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

interface CSVRow {
  name: string;
  type: string;
  subcategory: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  contact_person: string;
  description: string;
  tags: string;
  service_area: string;
}

interface ImportResult {
  success: number;
  errors: string[];
  duplicates: number;
}

const CSVImporter: React.FC<CSVImporterProps> = ({ onSuccess, onClose }) => {
  const { addResource, checkDuplicate } = useResources();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is admin
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('ecc') || true; // Force admin for testing

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const validateRow = (row: CSVRow): string[] => {
    const errors: string[] = [];
    const availableCategories = getAllCategories();
    
    if (!row.name?.trim()) errors.push('Name is required');
    if (!row.type?.trim()) errors.push('Type is required');
    if (row.type && !availableCategories.includes(row.type)) {
      errors.push(`Invalid type: ${row.type}. Must be one of the predefined categories or "Other"`);
    }
    if (row.email && !/^\S+@\S+$/i.test(row.email)) {
      errors.push('Invalid email format');
    }
    if (row.website && !row.website.startsWith('http')) {
      errors.push('Website must start with http:// or https://');
    }

    return errors;
  };

  const processCSV = async () => {
    if (!file || !isAdmin) return;

    setImporting(true);
    const importResult: ImportResult = {
      success: 0,
      errors: [],
      duplicates: 0
    };

    try {
      console.log('🔥 Starting CSV import to production Firestore database...');
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data as CSVRow[];
          console.log(`📊 Processing ${rows.length} rows from CSV...`);
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNumber = i + 2; // +2 because of header and 0-based index

            try {
              // Validate row
              const validationErrors = validateRow(row);
              if (validationErrors.length > 0) {
                importResult.errors.push(`Row ${rowNumber}: ${validationErrors.join(', ')}`);
                continue;
              }

              // Check for duplicates in production database
              const isDuplicate = await checkDuplicate(row.name.trim(), row.address?.trim() || '');
              if (isDuplicate) {
                importResult.duplicates++;
                importResult.errors.push(`Row ${rowNumber}: Duplicate resource (${row.name} at ${row.address})`);
                continue;
              }

              // Process tags
              const tags = row.tags ? row.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

              // Create resource data
              const resourceData = {
                name: row.name.trim(),
                type: row.type.trim(),
                subcategory: row.subcategory?.trim() || '',
                address: row.address?.trim() || '',
                phone: row.phone?.trim() || '',
                email: row.email?.trim() || '',
                website: row.website?.trim() || '',
                contact_person: row.contact_person?.trim() || '',
                description: row.description?.trim() || '',
                tags,
                service_area: row.service_area?.trim() || '',
                logoUrl: '',
                verified: false, // Default to false for imported resources
              };

              // Add to production Firestore database
              console.log(`💾 Saving resource ${rowNumber}: ${resourceData.name}`);
              await addResource(resourceData);
              importResult.success++;

            } catch (error) {
              console.error(`❌ Error importing row ${rowNumber}:`, error);
              importResult.errors.push(`Row ${rowNumber}: Failed to import - ${error}`);
            }
          }

          console.log(`✅ CSV import completed: ${importResult.success} successful, ${importResult.duplicates} duplicates, ${importResult.errors.length - importResult.duplicates} errors`);
          setResult(importResult);
          setImporting(false);
          
          if (importResult.success > 0) {
            onSuccess?.();
          }
        },
        error: (error) => {
          console.error('❌ CSV parsing error:', error);
          importResult.errors.push(`CSV parsing error: ${error.message}`);
          setResult(importResult);
          setImporting(false);
        }
      });
    } catch (error) {
      console.error('❌ Import failed:', error);
      importResult.errors.push(`Import failed: ${error}`);
      setResult(importResult);
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      'name,type,subcategory,address,phone,email,website,contact_person,description,tags,service_area',
      'Sample Senior Center,Senior Centers with Workshops,Educational Programs,"123 Main St, City, State 12345",(555) 123-4567,info@seniorcenter.com,https://seniorcenter.com,John Smith,"Community center offering workshops and activities for seniors","senior activities, workshops, community",Citywide',
      'Memory Care Facility,Memory Care Facilities,Alzheimer\'s Care,"456 Oak Ave, City, State 12345",(555) 987-6543,contact@memorycare.com,https://memorycare.com,Sarah Johnson,"Specialized memory care facility for dementia and Alzheimer\'s patients","memory care, alzheimer\'s, dementia, specialized care",Regional',
      'Custom Service Provider,Other,Specialized Care,"789 Pine St, City, State 12345",(555) 555-0123,info@customservice.com,https://customservice.com,Mike Davis,"Custom service provider for specialized elder care needs","custom, specialized, elder care",Local'
    ].join('\n');

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resource_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600 mb-4">Only administrators can import CSV files.</p>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Import Resources from CSV</h2>
                <p className="text-sm text-blue-700 mt-1">
                  🔥 Production Mode: Data will be stored permanently in Firebase
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Production Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-orange-900 mb-1">Production Database</h3>
                <p className="text-orange-700 text-sm">
                  All imported resources will be permanently stored in your production Firestore database (eccapp-fcc81). 
                  This data will be available when your app goes live.
                </p>
              </div>
            </div>
          </div>

          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 mb-1">Need a template?</h3>
                <p className="text-blue-700 text-sm mb-3">
                  Download our CSV template with sample data and proper column headers.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">
              Select CSV File
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
              {file ? (
                <div className="space-y-4">
                  <FileText className="w-12 h-12 text-green-600 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">Drop your CSV file here</p>
                    <p className="text-sm text-gray-500">or click to browse files</p>
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
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
            </div>
          </div>

          {/* CSV Format Requirements */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">CSV Format Requirements:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Required columns:</strong> name, type</li>
              <li>• <strong>Type</strong> must match one of the predefined categories or "Other"</li>
              <li>• <strong>Tags</strong> should be comma-separated within the cell</li>
              <li>• <strong>Duplicates</strong> are detected by matching name + address</li>
              <li>• <strong>Custom types</strong> can be added using the "+ Service Type" button</li>
            </ul>
          </div>

          {/* Import Results */}
          {result && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Import Results - Stored in Production Database
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">{result.success}</div>
                    <div className="text-sm text-green-700">Imported</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-600">{result.duplicates}</div>
                    <div className="text-sm text-yellow-700">Duplicates</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-600">{result.errors.length - result.duplicates}</div>
                    <div className="text-sm text-red-700">Errors</div>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">Issues Found:</h4>
                  <div className="max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700 mb-1">• {error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {result ? 'Close' : 'Cancel'}
            </button>
            {file && !result && (
              <button
                onClick={processCSV}
                disabled={importing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
              >
                {importing && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {importing ? 'Importing to Production...' : 'Import to Production Database'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVImporter;