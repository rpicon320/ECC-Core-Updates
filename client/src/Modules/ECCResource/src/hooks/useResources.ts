import { useState, useEffect } from 'react';
import { Resource } from '../types/resource';

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockResources: Resource[] = [
      {
        id: '1',
        name: 'Golden Years Senior Center',
        type: 'Senior Centers with Workshops',
        subcategory: 'Educational Programs',
        address: '123 Main St, Springfield, IL 62701',
        phone: '(555) 123-4567',
        email: 'info@goldenyears.org',
        website: 'https://www.goldenyears.org',
        contact_person: 'Jane Smith',
        description: 'A community center offering workshops, activities, and support for seniors.',
        tags: ['senior activities', 'workshops', 'community'],
        service_area: 'Springfield',
        logoUrl: '',
        verified: true,
        isECCFavorite: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Sunrise Memory Care',
        type: 'Memory Care Facilities',
        subcategory: 'Alzheimer\'s Care',
        address: '456 Oak Ave, Springfield, IL 62702',
        phone: '(555) 987-6543',
        email: 'contact@sunrisememory.com',
        website: 'https://www.sunrisememory.com',
        contact_person: 'Robert Johnson',
        description: 'Specialized memory care facility for dementia and Alzheimer\'s patients.',
        tags: ['memory care', 'alzheimer\'s', 'dementia', 'specialized care'],
        service_area: 'Springfield Metro Area',
        logoUrl: '',
        verified: true,
        isECCFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Home Mobility Solutions',
        type: 'Home Modification Contractors',
        subcategory: 'Accessibility Modifications',
        address: '789 Elm St, Springfield, IL 62703',
        phone: '(555) 456-7890',
        email: 'info@homemobility.com',
        website: 'https://www.homemobility.com',
        contact_person: 'Michael Brown',
        description: 'Specializing in home modifications for seniors and individuals with mobility challenges.',
        tags: ['home modifications', 'accessibility', 'ramps', 'grab bars'],
        service_area: 'Central Illinois',
        logoUrl: '',
        verified: false,
        isECCFavorite: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setResources(mockResources);
  }, []);

  const addResource = async (resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newResource: Resource = {
        ...resourceData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setResources(prev => [...prev, newResource]);
      return newResource.id;
    } catch (err) {
      console.error('Error adding resource:', err);
      throw new Error('Failed to add resource.');
    }
  };

  const updateResource = async (id: string, updates: Partial<Resource>) => {
    try {
      setResources(prev => 
        prev.map(resource => 
          resource.id === id 
            ? { ...resource, ...updates, updatedAt: new Date() } 
            : resource
        )
      );
    } catch (err) {
      console.error('Error updating resource:', err);
      throw new Error('Failed to update resource.');
    }
  };

  const deleteResource = async (id: string, logoUrl?: string) => {
    try {
      setResources(prev => prev.filter(resource => resource.id !== id));
    } catch (err) {
      console.error('Error deleting resource:', err);
      throw new Error('Failed to delete resource.');
    }
  };

  const archiveResource = async (id: string) => {
    try {
      // In a real app, this would set an "archived" flag instead of removing
      setResources(prev => prev.filter(resource => resource.id !== id));
    } catch (err) {
      console.error('Error archiving resource:', err);
      throw new Error('Failed to archive resource.');
    }
  };

  const toggleECCFavorite = async (id: string, isFav: boolean) => {
    try {
      setResources(prev => 
        prev.map(resource => 
          resource.id === id 
            ? { ...resource, isECCFavorite: isFav, updatedAt: new Date() } 
            : resource
        )
      );
    } catch (err) {
      console.error('Error toggling ECC Favorite:', err);
      throw new Error('Failed to toggle ECC Favorite.');
    }
  };

  const checkDuplicate = async (name: string, address: string): Promise<boolean> => {
    return resources.some(
      resource => 
        resource.name.toLowerCase() === name.toLowerCase() && 
        resource.address.toLowerCase() === address.toLowerCase()
    );
  };

  const uploadLogo = async (file: File, resourceId?: string): Promise<string> => {
    // Mock implementation - in a real app, this would upload to Firebase Storage
    return URL.createObjectURL(file);
  };

  return {
    resources,
    loading,
    error,
    addResource,
    updateResource,
    deleteResource,
    archiveResource,
    toggleECCFavorite,
    checkDuplicate,
    uploadLogo,
    refreshResources: () => {}
  };
};