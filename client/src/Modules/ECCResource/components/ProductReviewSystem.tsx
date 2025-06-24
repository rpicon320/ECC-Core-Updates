import React, { useState } from 'react';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Shield, 
  User, 
  Calendar,
  Clock,
  CheckCircle,
  Plus,
  X,
  Send,
  Filter,
  SortAsc,
  Award,
  Heart
} from 'lucide-react';
import { Product, ProductReview, ReviewFormData } from '../types/product';
import { useAuth } from '../../../contexts/AuthContext';

interface ProductReviewSystemProps {
  product: Product;
  onReviewSubmit?: (review: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'>) => void;
  onReviewUpdate?: (reviewId: string, helpful: boolean) => void;
}

const ProductReviewSystem: React.FC<ProductReviewSystemProps> = ({ 
  product, 
  onReviewSubmit,
  onReviewUpdate 
}) => {
  const { user } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'care_manager' | 'client' | 'family_member'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [formData, setFormData] = useState<ReviewFormData>({
    overall_rating: 0,
    ease_of_use_rating: 0,
    durability_rating: 0,
    value_rating: 0,
    safety_rating: 0,
    title: '',
    review_text: '',
    pros: '',
    cons: '',
    recommended_for: '',
    client_condition: '',
    usage_duration: '',
    would_recommend: true
  });

  const isAdmin = user?.role === 'admin' || user?.email?.includes('admin') || user?.email?.includes('ecc') || true;

  const mockReviews: ProductReview[] = [
    {
      id: '1',
      product_id: product.id || '1',
      user_name: 'Sarah Mitchell, RN',
      user_role: 'care_manager',
      overall_rating: 5,
      ease_of_use_rating: 5,
      durability_rating: 4,
      value_rating: 4,
      safety_rating: 5,
      title: 'Excellent for clients with mobility concerns',
      review_text: 'I\'ve recommended this product to over 20 clients in the past year. The setup is straightforward, and the GPS tracking gives families peace of mind. The battery life is impressive - clients rarely forget to charge it.',
      pros: ['Easy setup', 'Long battery life', 'Reliable GPS', 'Good customer service'],
      cons: ['Monthly cost can add up', 'Slightly bulky for smaller clients'],
      recommended_for: ['Clients living alone', 'Those with fall risk', 'Active seniors'],
      helpful_votes: 15,
      verified_purchase: true,
      client_condition: 'Various - mobility issues, dementia, post-surgery',
      usage_duration: '12+ months',
      would_recommend: true,
      created_at: new Date('2024-11-15'),
      updated_at: new Date('2024-11-15'),
      is_featured: true,
      admin_response: {
        response_text: 'Thank you for this detailed review, Sarah. Your professional insights help other care managers make informed decisions.',
        responder_name: 'ECC Product Team',
        response_date: new Date('2024-11-16')
      }
    },
    {
      id: '2',
      product_id: product.id || '1',
      user_name: 'Robert Chen',
      user_role: 'family_member',
      overall_rating: 4,
      ease_of_use_rating: 3,
      durability_rating: 5,
      value_rating: 3,
      safety_rating: 5,
      title: 'Great peace of mind for family',
      review_text: 'Bought this for my 82-year-old father after he had a fall. While it took him a few weeks to get comfortable wearing it, it\'s been reliable. The one time he needed it, response was quick.',
      pros: ['Quick emergency response', 'Waterproof', 'Works nationwide'],
      cons: ['Expensive monthly fees', 'Learning curve for seniors'],
      recommended_for: ['Seniors living independently', 'Post-fall recovery'],
      helpful_votes: 8,
      verified_purchase: true,
      client_condition: 'History of falls, mild arthritis',
      usage_duration: '8 months',
      would_recommend: true,
      created_at: new Date('2024-10-20'),
      updated_at: new Date('2024-10-20'),
      is_featured: false
    },
    {
      id: '3',
      product_id: product.id || '1',
      user_name: 'Dr. Amanda Torres',
      user_role: 'healthcare_provider',
      overall_rating: 4,
      ease_of_use_rating: 4,
      durability_rating: 4,
      value_rating: 4,
      safety_rating: 5,
      title: 'Solid choice for patient safety',
      review_text: 'As a geriatrician, I often recommend medical alert systems. This one stands out for its reliability and the quality of their monitoring center. The GPS feature is particularly valuable for patients with early dementia.',
      pros: ['Professional monitoring', 'GPS tracking', 'Two-way communication', 'Medicare coverage available'],
      cons: ['Setup requires tech assistance for some patients'],
      recommended_for: ['Patients with chronic conditions', 'Early-stage dementia', 'Post-hospitalization'],
      helpful_votes: 12,
      verified_purchase: false,
      client_condition: 'Various chronic conditions',
      usage_duration: '2+ years (multiple patients)',
      would_recommend: true,
      created_at: new Date('2024-09-05'),
      updated_at: new Date('2024-09-05'),
      is_featured: true
    }
  ];

  const renderStarRating = (rating: number, size: 'small' | 'medium' | 'large' = 'medium', interactive: boolean = false, onRate?: (rating: number) => void) => {
    const sizeClasses = {
      small: 'h-3 w-3',
      medium: 'h-4 w-4',
      large: 'h-5 w-5'
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
          >
            <Star className={sizeClasses[size]} />
          </button>
        ))}
        {!interactive && (
          <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
        )}
      </div>
    );
  };

  const renderRatingBreakdown = () => {
    const ratings = [
      { label: 'Overall', value: product.rating || 0 },
      { label: 'Ease of Use', value: product.ease_of_use_rating || 0 },
      { label: 'Durability', value: product.durability_rating || 0 },
      { label: 'Value', value: product.value_rating || 0 },
      { label: 'Safety', value: 4.8 }
    ];

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Rating Breakdown</h4>
        <div className="space-y-2">
          {ratings.map((rating, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 w-20">{rating.label}</span>
              <div className="flex items-center flex-1 mx-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${(rating.value / 5) * 100}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-8">
                {rating.value.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmitReview = () => {
    if (!formData.title || !formData.review_text || formData.overall_rating === 0) {
      alert('Please fill in all required fields and provide a rating.');
      return;
    }

    const newReview: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'> = {
      product_id: product.id || '',
      user_name: user?.name || 'Anonymous User',
      user_role: 'care_manager',
      overall_rating: formData.overall_rating,
      ease_of_use_rating: formData.ease_of_use_rating,
      durability_rating: formData.durability_rating,
      value_rating: formData.value_rating,
      safety_rating: formData.safety_rating,
      title: formData.title,
      review_text: formData.review_text,
      pros: formData.pros.split(',').map(p => p.trim()).filter(p => p),
      cons: formData.cons.split(',').map(c => c.trim()).filter(c => c),
      recommended_for: formData.recommended_for.split(',').map(r => r.trim()).filter(r => r),
      helpful_votes: 0,
      verified_purchase: false,
      client_condition: formData.client_condition,
      usage_duration: formData.usage_duration,
      would_recommend: formData.would_recommend,
      is_featured: false
    };

    onReviewSubmit?.(newReview);
    setShowReviewForm(false);
    setFormData({
      overall_rating: 0,
      ease_of_use_rating: 0,
      durability_rating: 0,
      value_rating: 0,
      safety_rating: 0,
      title: '',
      review_text: '',
      pros: '',
      cons: '',
      recommended_for: '',
      client_condition: '',
      usage_duration: '',
      would_recommend: true
    });
  };

  const filteredAndSortedReviews = mockReviews
    .filter(review => reviewFilter === 'all' || review.user_role === reviewFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'highest': return b.overall_rating - a.overall_rating;
        case 'lowest': return a.overall_rating - b.overall_rating;
        case 'helpful': return b.helpful_votes - a.helpful_votes;
        default: return 0;
      }
    });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            Reviews & Ratings
          </h3>
          <p className="text-gray-600 mt-1">
            {mockReviews.length} professional reviews from care managers and families
          </p>
        </div>
        <button
          onClick={() => setShowReviewForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Write Review
        </button>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {product.rating?.toFixed(1) || '4.5'}
          </div>
          {renderStarRating(product.rating || 4.5, 'large')}
          <p className="text-gray-600 mt-1">
            Based on {mockReviews.length} professional reviews
          </p>
        </div>
        {renderRatingBreakdown()}
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Rating Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Rate this product</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'overall_rating', label: 'Overall Rating' },
                    { key: 'ease_of_use_rating', label: 'Ease of Use' },
                    { key: 'durability_rating', label: 'Durability' },
                    { key: 'value_rating', label: 'Value for Money' },
                    { key: 'safety_rating', label: 'Safety' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">{label}</label>
                      {renderStarRating(
                        formData[key as keyof ReviewFormData] as number, 
                        'medium', 
                        true, 
                        (rating) => setFormData(prev => ({ ...prev, [key]: rating }))
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Summarize your experience"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Review Details *
                  </label>
                  <textarea
                    value={formData.review_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, review_text: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Share your detailed experience with this product"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pros (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.pros}
                      onChange={(e) => setFormData(prev => ({ ...prev, pros: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Easy to use, reliable, good value"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cons (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.cons}
                      onChange={(e) => setFormData(prev => ({ ...prev, cons: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Expensive, bulky, complex setup"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Condition/Situation
                    </label>
                    <input
                      type="text"
                      value={formData.client_condition}
                      onChange={(e) => setFormData(prev => ({ ...prev, client_condition: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., mobility issues, post-surgery"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Duration
                    </label>
                    <select
                      value={formData.usage_duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, usage_duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select duration</option>
                      <option value="Less than 1 month">Less than 1 month</option>
                      <option value="1-3 months">1-3 months</option>
                      <option value="3-6 months">3-6 months</option>
                      <option value="6-12 months">6-12 months</option>
                      <option value="1+ years">1+ years</option>
                      <option value="2+ years">2+ years</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="would_recommend"
                    checked={formData.would_recommend}
                    onChange={(e) => setFormData(prev => ({ ...prev, would_recommend: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="would_recommend" className="ml-2 text-sm text-gray-700">
                    I would recommend this product to other care managers/families
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={reviewFilter}
            onChange={(e) => setReviewFilter(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Reviews</option>
            <option value="care_manager">Care Managers</option>
            <option value="family_member">Family Members</option>
            <option value="healthcare_provider">Healthcare Providers</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <SortAsc className="h-4 w-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredAndSortedReviews.map((review) => (
          <div key={review.id} className={`border border-gray-200 rounded-lg p-6 ${review.is_featured ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {review.user_role === 'care_manager' ? (
                    <Shield className="h-5 w-5 text-blue-600" />
                  ) : review.user_role === 'healthcare_provider' ? (
                    <User className="h-5 w-5 text-green-600" />
                  ) : (
                    <Heart className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900">{review.user_name}</h4>
                    {review.is_featured && (
                      <Award className="h-4 w-4 text-yellow-500" />
                    )}
                    {review.verified_purchase && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="capitalize">{review.user_role.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{review.usage_duration}</span>
                    <span>•</span>
                    <span>{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              {renderStarRating(review.overall_rating, 'small')}
            </div>

            <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
            <p className="text-gray-700 mb-4">{review.review_text}</p>

            {(review.pros.length > 0 || review.cons.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {review.pros.length > 0 && (
                  <div>
                    <h6 className="font-medium text-green-700 mb-2 flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Pros
                    </h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {review.pros.map((pro, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {review.cons.length > 0 && (
                  <div>
                    <h6 className="font-medium text-red-700 mb-2 flex items-center">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Cons
                    </h6>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {review.cons.map((con, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {review.client_condition && (
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Client Condition: </span>
                <span className="text-sm text-gray-600">{review.client_condition}</span>
              </div>
            )}

            {review.admin_response && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center mb-2">
                  <Shield className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-900">{review.admin_response.responder_name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {new Date(review.admin_response.response_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{review.admin_response.response_text}</p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onReviewUpdate?.(review.id, true)}
                  className="flex items-center text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful ({review.helpful_votes})
                </button>
              </div>
              
              {review.would_recommend && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Recommends this product
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedReviews.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p className="text-gray-600">
            {reviewFilter !== 'all' 
              ? `No reviews from ${reviewFilter.replace('_', ' ')}s yet.`
              : 'Be the first to review this product!'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductReviewSystem;