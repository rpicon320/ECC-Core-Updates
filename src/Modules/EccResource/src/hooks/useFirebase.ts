import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import { db, storage } from '../lib/firebase';
import { Resource } from '../types/resource';

export const useResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all resources from Firestore, sorted A-Z.
   */
  const fetchResources = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'resources'), orderBy('sortKey', 'asc'));
      const querySnapshot = await getDocs(q);

      const resourcesData: Resource[] = [];
      querySnapshot.forEach((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnap.data();
        resourcesData.push({
          id: docSnap.id,
          ...data,
          isECCFavorite: data.isECCFavorite || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Resource);
      });

      setResources(resourcesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to fetch resources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  /**
   * Add a new resource to Firestore.
   */
  const addResource = async (resourceData: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'resources'), {
        ...resourceData,
        sortKey: resourceData.name.toLowerCase().trim(),
        isECCFavorite: resourceData.isECCFavorite || false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await fetchResources();
      return docRef.id;
    } catch (err) {
      console.error('Error adding resource:', err);
      throw new Error('Failed to add resource.');
    }
  };

  /**
   * Update an existing resource in Firestore.
   */
  const updateResource = async (id: string, updates: Partial<Resource>) => {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      if (updates.name) {
        updateData.sortKey = updates.name.toLowerCase().trim();
      }

      const resourceRef = doc(db, 'resources', id);
      await updateDoc(resourceRef, updateData);

      await fetchResources();
    } catch (err) {
      console.error('Error updating resource:', err);
      throw new Error('Failed to update resource.');
    }
  };

  /**
   * Delete a resource from Firestore & its logo from Storage.
   */
  const deleteResource = async (id: string, logoUrl?: string) => {
    try {
      const resourceRef = doc(db, 'resources', id);
      await deleteDoc(resourceRef);

      if (logoUrl) {
        await deleteLogo(logoUrl);
      }

      await fetchResources();
    } catch (err) {
      console.error('Error deleting resource:', err);
      throw new Error('Failed to delete resource.');
    }
  };

  /**
   * Toggle the ECC Favorite flag.
   */
  const toggleECCFavorite = async (id: string, isFav: boolean) => {
    try {
      const resourceRef = doc(db, 'resources', id);
      await updateDoc(resourceRef, {
        isECCFavorite: isFav,
        updatedAt: serverTimestamp(),
      });

      await fetchResources();
    } catch (err) {
      console.error('Error toggling ECC Favorite:', err);
      throw new Error('Failed to toggle ECC Favorite.');
    }
  };

  /**
   * Check for duplicate name + address.
   */
  const checkDuplicate = async (name: string, address: string): Promise<boolean> => {
    try {
      const q = query(
        collection(db, 'resources'),
        where('name', '==', name.trim()),
        where('address', '==', address.trim())
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (err) {
      console.error('Error checking duplicates:', err);
      return false;
    }
  };

  /**
   * Upload a logo file to Firebase Storage.
   */
  const uploadLogo = async (file: File, resourceId?: string): Promise<string> => {
    try {
      const fileName = resourceId
        ? `${resourceId}_${file.name}`
        : `${Date.now()}_${file.name}`;

      const storageRef = ref(storage, `logos/${fileName}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw new Error('Failed to upload logo.');
    }
  };

  /**
   * Delete a logo from Firebase Storage.
   */
  const deleteLogo = async (logoUrl: string) => {
    try {
      const logoRef = ref(storage, logoUrl);
      await deleteObject(logoRef);
    } catch (err) {
      console.error('Error deleting logo:', err);
    }
  };

  return {
    resources,
    loading,
    error,
    addResource,
    updateResource,
    deleteResource,
    toggleECCFavorite,
    checkDuplicate,
    uploadLogo,
    deleteLogo,
    refreshResources: fetchResources,
  };
};
