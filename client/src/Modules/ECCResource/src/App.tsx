import React, { useState } from 'react';
import { Plus, List, Building2, LogOut, User, Shield, Upload, Settings, Search } from 'lucide-react';
import ResourceForm from './components/ResourceForm';
import HomePage from './components/HomePage';
import CSVImporter from './components/CSVImporter';
import ServiceTypeManager from './components/ServiceTypeManager';
import ResourceSearcher from './components/ResourceSearcher';
import { useAuth } from '../../../contexts/AuthContext';
import { Resource } from './types/resource';

type View = 'home' | 'form' | 'import' | 'service-types' | 'search';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const { user, logout } = useAuth();

  // Check if user is admin (for admin-only features like CSV import and deletion)
  const isAdmin = user?.email?.includes('admin') || user?.email?.includes('ecc') || true; // Force admin for testing

  const handleAddNew = () => {
    console.log('Add new clicked, user email:', user?.email);
    setEditingResource(null);
    setCurrentView('form');
  };

  const handleImportCSV = () => {
    setCurrentView('import');
  };

  const handleServiceTypes = () => {
    setCurrentView('service-types');
  };

  const handleSearchResources = () => {
    setCurrentView('search');
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setCurrentView('form');
  };

  const handleFormSuccess = () => {
    setCurrentView('home');
    setEditingResource(null);
  };

  const handleFormCancel = () => {
    setCurrentView('home');
    setEditingResource(null);
  };

  const handleImportSuccess = () => {
    setCurrentView('home');
  };

  const handleImportClose = () => {
    setCurrentView('home');
  };

  const handleServiceTypesClose = () => {
    setCurrentView('home');
  };

  const handleSearchClose = () => {
    setCurrentView('home');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Fixed Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar with Title and User Profile */}
          <div className="flex items-center justify-between py-4">
            {/* Main Title */}
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ECC Resource Directory
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Comprehensive directory of elder care and community resources
                </p>
              </div>
            </div>

            {/* User Profile - Top Right */}
            <div className="flex items-center gap-3">
              {/* Testing Mode Badge */}
              <div className="hidden md:flex items-center gap-2 text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full border border-yellow-200">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span className="font-medium">Testing Mode</span>
              </div>

              {/* User Profile Card */}
              <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.email || 'user@test.com'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      {isAdmin ? (
                        <>
                          <Shield className="w-3 h-3" />
                          <span>Administrator</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          <span>User</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Navigation Bar */}
          <div className="border-t border-gray-100 py-3">
            <nav className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setCurrentView('home')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap ${
                  currentView === 'home'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span>Browse Resources</span>
              </button>

              <button
                onClick={handleAddNew}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap ${
                  currentView === 'form'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>

              <button
                onClick={handleSearchResources}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap ${
                  currentView === 'search'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search Unlisted</span>
              </button>

              <button
                onClick={handleServiceTypes}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap ${
                  currentView === 'service-types'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Add Service Type</span>
              </button>

              {/* Admin-only features */}
              {isAdmin && (
                <button
                  onClick={handleImportCSV}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap ${
                    currentView === 'import'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Import CSV</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {currentView === 'home' && (
            <HomePage onEdit={handleEdit} />
          )}
          
          {currentView === 'form' && (
            <ResourceForm
              editingResource={editingResource}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          )}

          {currentView === 'search' && (
            <ResourceSearcher
              onClose={handleSearchClose}
              onAddResource={handleAddNew}
            />
          )}

          {currentView === 'service-types' && (
            <ServiceTypeManager
              onClose={handleServiceTypesClose}
            />
          )}

          {currentView === 'import' && isAdmin && (
            <CSVImporter
              onSuccess={handleImportSuccess}
              onClose={handleImportClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Export AppContent directly since AuthProvider is handled at the main app level
export { AppContent as App };
export default AppContent;