export interface Product {
  id?: string;
  name: string;
  category: string;
  brand: string;
  model?: string;
  description: string;
  features: string[];
  price_range: string;
  where_to_buy: string[];
  website?: string;
  image_url?: string;
  rating?: number;
  review_count?: number;
  medicaid_covered?: boolean;
  medicare_covered?: boolean;
  insurance_notes?: string;
  user_guide_url?: string;
  video_demo_url?: string;
  tags: string[];
  recommended_for: string[];
  safety_features: string[];
  ease_of_use_rating?: number;
  durability_rating?: number;
  value_rating?: number;
  ecc_notes?: string;
  date_reviewed?: Date;
  last_updated?: Date;
  isActive: boolean;
  reviews?: ProductReview[];
  rating_breakdown?: RatingBreakdown;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_name: string;
  user_role: 'care_manager' | 'client' | 'family_member' | 'healthcare_provider';
  overall_rating: number;
  ease_of_use_rating: number;
  durability_rating: number;
  value_rating: number;
  safety_rating: number;
  title: string;
  review_text: string;
  pros: string[];
  cons: string[];
  recommended_for: string[];
  helpful_votes: number;
  verified_purchase: boolean;
  client_condition?: string;
  usage_duration: string;
  would_recommend: boolean;
  created_at: Date;
  updated_at: Date;
  is_featured: boolean;
  admin_response?: AdminResponse;
}

export interface AdminResponse {
  response_text: string;
  responder_name: string;
  response_date: Date;
}

export interface RatingBreakdown {
  overall: { [key: number]: number };
  ease_of_use: { [key: number]: number };
  durability: { [key: number]: number };
  value: { [key: number]: number };
  safety: { [key: number]: number };
}

export interface ReviewFormData {
  overall_rating: number;
  ease_of_use_rating: number;
  durability_rating: number;
  value_rating: number;
  safety_rating: number;
  title: string;
  review_text: string;
  pros: string;
  cons: string;
  recommended_for: string;
  client_condition: string;
  usage_duration: string;
  would_recommend: boolean;
}

export interface ProductFormData {
  name: string;
  category: string;
  brand: string;
  model: string;
  description: string;
  features: string;
  price_range: string;
  where_to_buy: string;
  website: string;
  medicaid_covered: boolean;
  medicare_covered: boolean;
  insurance_notes: string;
  user_guide_url: string;
  video_demo_url: string;
  tags: string;
  recommended_for: string;
  safety_features: string;
  ecc_notes: string;
}

export const PRODUCT_CATEGORIES = [
  'Bathroom Safety',
  'Communication Devices',
  'Comfort & Positioning',
  'Daily Living Aids',
  'Dementia & Memory Care Aids',
  'Exercise & Fitness',
  'Fall Prevention',
  'Home Safety & Security',
  'Incontinence Products',
  'Medical Alert Systems',
  'Medication Management',
  'Mobility Aids',
  'Monitoring Devices',
  'Nutrition & Hydration',
  'Other',
  'Personal Care & Grooming',
  'Rehabilitation & Therapy',
  'Sleep & Bedding',
  'Transportation Aids',
  'Vision & Hearing Aids',
  'Wound Care'
] as const;