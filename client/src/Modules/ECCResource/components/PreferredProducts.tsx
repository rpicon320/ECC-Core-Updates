import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  X,
  ArrowLeft,
  Grid3X3,
  List
} from 'lucide-react';
import { Product, PRODUCT_CATEGORIES } from '../types/product';
import { useAuth } from '../../../contexts/AuthContext';
import ProductReviewSystem from './ProductReviewSystem';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';

interface PreferredProductsProps {
  onClose?: () => void;
}

const PreferredProducts: React.FC<PreferredProductsProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showReviews, setShowReviews] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin') || user?.email?.includes('ecc') || true;

  // Mock data for demonstration
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Guardian Medical Alert System',
      category: 'Medical Alert Systems',
      brand: 'Guardian',
      model: 'Mobile 2.0',
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
      insurance_notes: 'Covered under Medicare Part B with doctor prescription',
      user_guide_url: 'https://example.com/guide',
      video_demo_url: 'https://example.com/demo',
      tags: ['medical alert', 'emergency', 'seniors', 'safety'],
      recommended_for: ['Living alone', 'History of falls', 'Chronic conditions'],
      safety_features: ['Automatic fall detection', 'Emergency button', 'Two-way speaker'],
      ease_of_use_rating: 5,
      durability_rating: 4,
      value_rating: 4,
      ecc_notes: 'Highly recommended for clients with mobility issues. Easy setup and reliable service.',
      date_reviewed: new Date('2024-01-15'),
      last_updated: new Date('2024-12-01'),
      isActive: true
    },
    {
      id: '2',
      name: 'Drive Medical Rollator Walker',
      category: 'Mobility Aids',
      brand: 'Drive Medical',
      model: 'R728RD',
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
      insurance_notes: 'Requires doctor prescription and medical necessity documentation',
      user_guide_url: 'https://example.com/walker-guide',
      video_demo_url: '',
      tags: ['walker', 'mobility', 'lightweight', 'seniors'],
      recommended_for: ['Mobility assistance', 'Balance issues', 'Outdoor walking'],
      safety_features: ['Hand brakes', 'Wide base', 'Non-slip grips'],
      ease_of_use_rating: 4,
      durability_rating: 5,
      value_rating: 5,
      ecc_notes: 'Excellent value for money. Very popular with our clients.',
      date_reviewed: new Date('2024-02-10'),
      last_updated: new Date('2024-11-15'),
      isActive: true
    },
    {
      id: '3',
      name: 'Pill-Pro Automatic Pill Dispenser',
      category: 'Medication Management',
      brand: 'PillPack',
      model: 'Pro-28',
      description: 'Automated pill dispenser with alarms and smartphone connectivity.',
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
      insurance_notes: 'Not typically covered by insurance, but HSA/FSA eligible',
      user_guide_url: 'https://example.com/pill-dispenser-guide',
      video_demo_url: 'https://example.com/pill-demo',
      tags: ['medication', 'reminder', 'automatic', 'safety'],
      recommended_for: ['Multiple medications', 'Memory issues', 'Medication adherence'],
      safety_features: ['Locking mechanism', 'Tamper-proof', 'Medication tracking'],
      ease_of_use_rating: 3,
      durability_rating: 4,
      value_rating: 4,
      ecc_notes: 'Great for clients who struggle with medication compliance. Setup requires family assistance.',
      date_reviewed: new Date('2024-03-20'),
      last_updated: new Date('2024-12-01'),
      isActive: true
    },
    {
      id: '4',
      name: 'Memory Care Clock & Calendar',
      category: 'Dementia & Memory Care Aids',
      brand: 'DayClox',
      model: 'Memory Loss Digital Calendar Day Clock',
      description: 'Large display digital clock showing day, date, and time period designed for dementia patients.',
      features: ['Extra large display', 'Day/night indicator', 'Auto-dimming', 'Multiple alarms', 'Battery backup'],
      price_range: '$60-80',
      where_to_buy: ['Amazon', 'Best Buy', 'Walmart', 'Medical supply stores'],
      website: 'https://www.dayclox.com',
      image_url: '',
      rating: 4.4,
      review_count: 892,
      medicaid_covered: false,
      medicare_covered: false,
      insurance_notes: 'Not covered by insurance, but may qualify for HSA/FSA',
      user_guide_url: 'https://example.com/memory-clock-guide',
      video_demo_url: '',
      tags: ['dementia', 'memory', 'orientation', 'time', 'calendar'],
      recommended_for: ['Early dementia', 'Memory loss', 'Orientation issues'],
      safety_features: ['Battery backup', 'Large clear display', 'Simple interface'],
      ease_of_use_rating: 5,
      durability_rating: 4,
      value_rating: 5,
      ecc_notes: 'Highly effective for maintaining time orientation. Popular with families managing early-stage dementia.',
      date_reviewed: new Date('2024-04-10'),
      last_updated: new Date('2024-12-01'),
      isActive: true
    },
    {
      id: '5',
      name: 'Premium Memory Foam Mattress Topper',
      category: 'Sleep & Bedding',
      brand: 'Tempur-Pedic',
      model: 'TEMPUR-Topper Supreme',
      description: 'Memory foam mattress topper designed to relieve pressure points and improve sleep quality.',
      features: ['3-inch memory foam', 'Pressure relief', 'Temperature regulation', 'Removable cover', '10-year warranty'],
      price_range: '$200-400',
      where_to_buy: ['Tempur-Pedic stores', 'Amazon', 'Mattress Firm', 'Costco'],
      website: 'https://www.tempurpedic.com',
      image_url: '',
      rating: 4.3,
      review_count: 1247,
      medicaid_covered: false,
      medicare_covered: true,
      insurance_notes: 'May be covered with doctor prescription for pressure ulcer prevention',
      user_guide_url: 'https://example.com/mattress-topper-guide',
      video_demo_url: '',
      tags: ['sleep', 'comfort', 'pressure relief', 'memory foam', 'bedding'],
      recommended_for: ['Pressure ulcer prevention', 'Sleep issues', 'Joint pain'],
      safety_features: ['Hypoallergenic materials', 'Certified foam', 'Fire resistant'],
      ease_of_use_rating: 4,
      durability_rating: 5,
      value_rating: 3,
      ecc_notes: 'Excellent for clients with pressure ulcer risks or chronic pain affecting sleep.',
      date_reviewed: new Date('2024-05-15'),
      last_updated: new Date('2024-12-01'),
      isActive: true
    },
    {
      id: '7',
      name: 'Grab Bar Safety Set',
      category: 'Bathroom Safety',
      brand: 'Moen',
      model: 'SecureMount',
      description: 'Professional-grade grab bars for bathroom safety with secure mounting system.',
      features: ['Stainless steel', 'Concealed mounting', 'ADA compliant', 'Multiple sizes', 'Lifetime warranty'],
      price_range: '$40-120',
      where_to_buy: ['Home Depot', 'Lowe\'s', 'Amazon', 'Medical supply stores'],
      website: 'https://www.moen.com',
      image_url: '',
      rating: 4.8,
      review_count: 1456,
      medicaid_covered: true,
      medicare_covered: true,
      insurance_notes: 'Covered with doctor prescription for fall prevention',
      user_guide_url: 'https://example.com/grab-bar-installation',
      video_demo_url: '',
      tags: ['bathroom', 'safety', 'grab bar', 'fall prevention'],
      recommended_for: ['Fall prevention', 'Bathroom safety', 'Mobility assistance'],
      safety_features: ['Secure mounting', 'Weight tested', 'Non-slip grip'],
      ease_of_use_rating: 5,
      durability_rating: 5,
      value_rating: 4,
      ecc_notes: 'Essential for bathroom safety. Professional installation recommended for optimal security.',
      date_reviewed: new Date('2024-07-01'),
      last_updated: new Date('2024-12-01'),
      isActive: true
    },
    {
      id: '6',
      name: 'Resistance Band Therapy Set',
      category: 'Rehabilitation & Therapy',
      brand: 'TheraBand',
      model: 'Professional Resistance Band Set',
      description: 'Physical therapy resistance bands for strength training and rehabilitation exercises.',
      features: ['5 resistance levels', 'Door anchor', 'Exercise guide', 'Carrying case', 'Latex-free option'],
      price_range: '$25-40',
      where_to_buy: ['Amazon', 'Dick\'s Sporting Goods', 'Physical therapy clinics', 'CVS'],
      website: 'https://www.theraband.com',
      image_url: '',
      rating: 4.6,
      review_count: 743,
      medicaid_covered: true,
      medicare_covered: true,
      insurance_notes: 'Often covered when prescribed by physical therapist',
      user_guide_url: 'https://example.com/resistance-band-guide',
      video_demo_url: 'https://example.com/therapy-exercises',
      tags: ['rehabilitation', 'exercise', 'therapy', 'strength', 'recovery'],
      recommended_for: ['Post-surgery recovery', 'Arthritis', 'Strength building'],
      safety_features: ['Progressive resistance', 'Non-slip handles', 'Safety instructions'],
      ease_of_use_rating: 4,
      durability_rating: 5,
      value_rating: 5,
      ecc_notes: 'Excellent for maintaining strength and mobility. Easy to use at home with proper guidance.',
      date_reviewed: new Date('2024-06-01'),
      last_updated: new Date('2024-12-01'),
      isActive: true
    }
  ]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !selectedCategory || product.category === selectedCategory;

      return matchesSearch && matchesCategory && product.isActive;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowAddForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleViewReviews = (product: Product) => {
    setSelectedProduct(product);
    setShowReviews(true);
  };

  const handleCloseReviews = () => {
    setShowReviews(false);
    setSelectedProduct(null);
  };



  if (showAddForm) {
    return (
      <ProductForm
        product={editingProduct}
        onSave={(productData) => {
          console.log('Product saved:', productData);
          // Here you would typically save to your backend
          handleCloseForm();
        }}
        onCancel={handleCloseForm}
      />
    );
  }

  // Product Reviews Modal
  if (showReviews && selectedProduct) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedProduct.name} - Reviews
              </h2>
              <p className="text-gray-600 mt-1">{selectedProduct.brand} {selectedProduct.model}</p>
            </div>
            <button
              onClick={handleCloseReviews}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <ProductReviewSystem
              product={selectedProduct}
              onReviewSubmit={(review) => {
                console.log('New review submitted:', review);
                // Here you would typically save the review to your backend
              }}
              onReviewUpdate={(reviewId, helpful) => {
                console.log('Review helpful vote:', reviewId, helpful);
                // Here you would typically update the helpful count
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="h-6 w-6 mr-2 text-emerald-600" />
              ElderCare Preferred Products
            </h1>
            <p className="text-gray-600 mt-1">
              Curated products recommended by our care management team
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={handleAddProduct}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-600">
              {filteredProducts.length} products found
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'
      }`}>
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onViewReviews={handleViewReviews}
            onEdit={isAdmin ? handleEditProduct : undefined}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filter criteria.'
              : 'No preferred products have been added yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PreferredProducts;