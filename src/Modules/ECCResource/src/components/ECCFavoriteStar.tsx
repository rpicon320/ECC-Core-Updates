import React from 'react';
import { Star } from 'lucide-react';
import { useAuth } from './AuthWrapper';

interface ECCFavoriteStarProps {
  isECCFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ECCFavoriteStar: React.FC<ECCFavoriteStarProps> = ({
  isECCFavorite,
  onToggle,
  size = 'md',
  className = ''
}) => {
  const { user } = useAuth();
  
  // Check if user is admin/staff (can toggle favorites)
  const canToggle = user?.email?.includes('admin') || user?.email?.includes('ecc') || true; // Force admin for testing

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const starSize = sizeClasses[size];

  const handleClick = () => {
    if (canToggle) {
      onToggle();
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!canToggle}
        className={`relative transition-all duration-200 ${
          canToggle 
            ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded' 
            : 'cursor-default'
        }`}
        title={
          canToggle 
            ? (isECCFavorite ? 'Remove ECC Favorite' : 'Mark as ECC Favorite')
            : 'ECC Favorite (Staff Only)'
        }
      >
        <Star
          className={`${starSize} transition-colors duration-200 ${
            isECCFavorite
              ? 'text-blue-600 fill-blue-600'
              : canToggle
              ? 'text-gray-400 hover:text-blue-400'
              : 'text-gray-300'
          }`}
        />
      </button>
      
      {isECCFavorite && (
        <span className="text-xs font-medium text-blue-600 ml-0.5">
          ECC Favorite
        </span>
      )}
    </div>
  );
};

export default ECCFavoriteStar;