import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Product } from '../types/product';

const PRODUCTS_COLLECTION = 'ecc_preferred_products';

// Helper function to convert Firestore data to Product
const convertFirestoreToProduct = (doc: any): Product => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    date_reviewed: data.date_reviewed?.toDate(),
    last_updated: data.last_updated?.toDate(),
  };
};

// Helper function to convert Product to Firestore data
const convertProductToFirestore = (product: Partial<Product>) => {
  const firestoreData = { ...product };
  delete firestoreData.id; // Remove ID as it's handled by Firestore
  
  // Convert dates to Firestore Timestamps
  if (firestoreData.date_reviewed) {
    firestoreData.date_reviewed = Timestamp.fromDate(new Date(firestoreData.date_reviewed));
  }
  if (firestoreData.last_updated) {
    firestoreData.last_updated = Timestamp.fromDate(new Date(firestoreData.last_updated));
  }
  
  return firestoreData;
};

export const productService = {
  // Get all active products
  async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('isActive', '==', true),
        orderBy('name')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(convertFirestoreToProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get products by category
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, PRODUCTS_COLLECTION),
        where('category', '==', category),
        where('isActive', '==', true),
        orderBy('name')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(convertFirestoreToProduct);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Get single product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return convertFirestoreToProduct(docSnap);
      }
      return null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  },

  // Create new product
  async createProduct(productData: Omit<Product, 'id'>): Promise<string> {
    try {
      const firestoreData = convertProductToFirestore({
        ...productData,
        last_updated: new Date(),
        isActive: true
      });
      
      const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), firestoreData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update existing product
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const firestoreData = convertProductToFirestore({
        ...updates,
        last_updated: new Date()
      });
      
      await updateDoc(docRef, firestoreData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product (soft delete by setting isActive to false)
  async deleteProduct(id: string): Promise<void> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      await updateDoc(docRef, {
        isActive: false,
        last_updated: Timestamp.fromDate(new Date())
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Search products by name or description
  async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for production, consider using Algolia or similar
      const allProducts = await this.getAllProducts();
      const searchLower = searchTerm.toLowerCase();
      
      return allProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.brand.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Initialize with sample data (one-time setup)
  async initializeSampleData(): Promise<void> {
    try {
      // Check if data already exists
      const existing = await this.getAllProducts();
      if (existing.length > 0) {
        console.log('Sample data already exists, skipping initialization');
        return;
      }

      const sampleProducts: Omit<Product, 'id'>[] = [
        {
          name: 'Guardian Medical Alert System',
          category: 'Medical Alert Systems',
          brand: 'Guardian',
          model: 'GPS Mobile',
          description: 'Advanced medical alert system with GPS tracking and two-way communication.',
          features: ['GPS Tracking', 'Two-way Communication', 'Waterproof', 'Long Battery Life', '24/7 Monitoring'],
          price_range: '$40-60/month',
          where_to_buy: ['Guardian Direct', 'Amazon', 'Best Buy'],
          website: 'https://www.guardianprotection.com',
          retailer_links: [
            { name: 'Guardian Direct', url: 'https://www.guardianprotection.com/shop', is_affiliate: false },
            { name: 'Amazon', url: 'https://amazon.com/guardian-medical-alert', is_affiliate: true },
            { name: 'Best Buy', url: 'https://bestbuy.com/guardian-alert', is_affiliate: false }
          ],
          image_url: '',
          rating: 4.5,
          review_count: 1247,
          reviews_url: 'https://amazon.com/guardian-medical-alert/reviews',
          medicaid_covered: false,
          medicare_covered: true,
          fsa_hsa_eligible: false,
          insurance_notes: 'Covered under Medicare Part B with doctor prescription',
          user_guide_url: 'https://example.com/guide',
          video_demo_url: '',
          tags: ['medical alert', 'GPS', 'emergency', 'mobile'],
          recommended_for: ['Active seniors', 'Those with medical conditions', 'Outdoor activities'],
          safety_features: ['24/7 monitoring', 'GPS location', 'Emergency contacts', 'Medical history access'],
          ease_of_use_rating: 4,
          durability_rating: 5,
          value_rating: 4,
          ecc_notes: 'Excellent choice for active seniors who want mobile protection.',
          date_reviewed: new Date('2024-08-15'),
          last_updated: new Date(),
          isActive: true
        },
        {
          name: 'Drive Medical Rollator Walker',
          category: 'Mobility Aids',
          brand: 'Drive Medical',
          model: 'R728BL',
          description: 'Lightweight aluminum rollator with seat, storage, and hand brakes.',
          features: ['Padded Seat', 'Storage Pouch', 'Hand Brakes', 'Adjustable Height', 'Foldable'],
          price_range: '$80-120',
          where_to_buy: ['Amazon', 'Walmart', 'CVS', 'Medical Supply Stores'],
          website: 'https://www.drivemedical.com',
          retailer_links: [
            { name: 'Amazon', url: 'https://amazon.com/drive-medical-rollator', is_affiliate: true },
            { name: 'Walmart', url: 'https://walmart.com/drive-rollator', is_affiliate: false },
            { name: 'CVS', url: 'https://cvs.com/medical-equipment/rollator', is_affiliate: false }
          ],
          image_url: '',
          rating: 4.3,
          review_count: 892,
          reviews_url: 'https://amazon.com/drive-medical-rollator/reviews',
          medicaid_covered: true,
          medicare_covered: true,
          fsa_hsa_eligible: false,
          insurance_notes: 'Requires doctor prescription and medical necessity documentation',
          user_guide_url: 'https://example.com/walker-guide',
          video_demo_url: '',
          tags: ['walker', 'rollator', 'mobility', 'seat'],
          recommended_for: ['Walking assistance', 'Outdoor use', 'Shopping trips'],
          safety_features: ['Hand brakes', 'Locking mechanism', 'Reflective strips', 'Wide base'],
          ease_of_use_rating: 5,
          durability_rating: 4,
          value_rating: 5,
          ecc_notes: 'Popular choice for clients transitioning from canes to walkers.',
          date_reviewed: new Date('2024-09-10'),
          last_updated: new Date(),
          isActive: true
        },
        {
          name: 'PillPro Automatic Dispenser',
          category: 'Medication Management',
          brand: 'PillPro',
          model: 'MD-2000',
          description: 'Smart medication dispenser with alarms, smartphone connectivity, and secure storage.',
          features: ['28-day capacity', 'Multiple alarms', 'Smartphone app', 'Lockable', 'Large display'],
          price_range: '$150-200',
          where_to_buy: ['Amazon', 'CVS', 'Walgreens', 'Direct from manufacturer'],
          website: 'https://www.pillpro.com',
          image_url: '',
          rating: 4.7,
          review_count: 543,
          reviews_url: 'https://amazon.com/pill-pro-dispenser/reviews',
          medicaid_covered: false,
          medicare_covered: false,
          fsa_hsa_eligible: true,
          insurance_notes: 'Not typically covered by insurance, but HSA/FSA eligible',
          user_guide_url: 'https://example.com/pill-dispenser-guide',
          video_demo_url: '',
          tags: ['medication', 'dispenser', 'smart', 'reminder'],
          recommended_for: ['Multiple medications', 'Memory concerns', 'Caregiver monitoring'],
          safety_features: ['Tamper-resistant', 'Overdose prevention', 'Emergency contacts', 'Missed dose alerts'],
          ease_of_use_rating: 4,
          durability_rating: 5,
          value_rating: 4,
          ecc_notes: 'Excellent for clients with complex medication regimens.',
          date_reviewed: new Date('2024-10-05'),
          last_updated: new Date(),
          isActive: true
        }
      ];

      // Create all sample products
      for (const product of sampleProducts) {
        await this.createProduct(product);
      }

      console.log('Sample product data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }
};