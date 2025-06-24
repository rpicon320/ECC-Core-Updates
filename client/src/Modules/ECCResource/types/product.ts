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
  'Mobility Aids',
  'Bathroom Safety',
  'Home Safety & Security',
  'Medical Alert Systems',
  'Daily Living Aids',
  'Communication Devices',
  'Medication Management',
  'Fall Prevention',
  'Vision & Hearing Aids',
  'Comfort & Positioning',
  'Exercise & Fitness',
  'Nutrition & Hydration',
  'Incontinence Products',
  'Wound Care',
  'Monitoring Devices',
  'Other'
] as const;