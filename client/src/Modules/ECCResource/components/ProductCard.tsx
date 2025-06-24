import React from 'react';
import { 
  Star, 
  DollarSign, 
  Shield, 
  ExternalLink, 
  FileText, 
  MessageSquare,
  Edit3
} from 'lucide-react';
import { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onViewReviews: (product: Product) => void;
  onEdit?: (product: Product) => void;
  isAdmin?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onViewReviews, 
  onEdit, 
  isAdmin = false 
}) => {
  const renderStarRating = (rating: number, reviewCount?: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          ({rating}) {reviewCount && `• ${reviewCount} reviews`}
        </span>
      </div>
    );
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <span className="text-sm">No image available</span>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Header with Product Name and Edit Button */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {product.brand} {product.model && `• ${product.model}`}
            </p>
            
            {/* Category Badge */}
            <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {product.category}
            </span>
          </div>
          
          {isAdmin && onEdit && (
            <button
              onClick={() => onEdit(product)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors ml-2"
              title="Edit product"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {truncateDescription(product.description)}
        </p>

        {/* Rating */}
        {product.rating && (
          <div className="mb-4">
            {renderStarRating(product.rating, product.review_count)}
          </div>
        )}

        {/* Price and Insurance */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-green-600">
            <DollarSign className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{product.price_range}</span>
          </div>
          
          {(product.medicare_covered || product.medicaid_covered || product.fsa_hsa_eligible) && (
            <div className="flex items-center text-blue-600">
              <Shield className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">
                {[
                  product.medicare_covered && 'Medicare',
                  product.medicaid_covered && 'Medicaid', 
                  product.fsa_hsa_eligible && 'FSA/HSA'
                ].filter(Boolean).join('/')}
              </span>
            </div>
          )}
        </div>

        {/* Recommended For Tags */}
        {product.recommended_for && product.recommended_for.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Recommended for:</p>
            <div className="flex flex-wrap gap-1">
              {product.recommended_for.slice(0, 2).map((item, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                >
                  {item}
                </span>
              ))}
              {product.recommended_for.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{product.recommended_for.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary Actions Row */}
          <div className="flex flex-wrap gap-2">
            {/* Reviews Button */}
            {product.reviews_url ? (
              <a
                href={product.reviews_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Reviews ({product.review_count || 'See all'})
              </a>
            ) : (
              <button
                onClick={() => onViewReviews(product)}
                className="flex items-center px-3 py-2 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700 transition-colors"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Reviews ({product.review_count || 3})
              </button>
            )}
            
            {/* Learn More Button */}
            {product.website && (
              <a
                href={product.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Learn More
              </a>
            )}
            
            {/* Guide Button */}
            {product.user_guide_url && (
              <a
                href={product.user_guide_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
              >
                <FileText className="h-4 w-4 mr-1" />
                Guide
              </a>
            )}
          </div>

          {/* Retailer Links Row */}
          {product.retailer_links && product.retailer_links.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Shop at:</p>
              <div className="flex flex-wrap gap-2">
                {product.retailer_links.slice(0, 3).map((retailer, index) => (
                  <a
                    key={index}
                    href={retailer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded border border-orange-200 hover:bg-orange-200 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {retailer.name}
                  </a>
                ))}
                {product.retailer_links.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{product.retailer_links.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;