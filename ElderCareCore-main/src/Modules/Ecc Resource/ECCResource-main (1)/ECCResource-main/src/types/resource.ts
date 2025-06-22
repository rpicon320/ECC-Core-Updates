export interface Resource {
  id?: string;
  name: string;
  type: string;
  subcategory: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  contact_person: string;
  description: string;
  tags: string[];
  service_area: string;
  logoUrl: string;
  verified: boolean;
  // ECC Favorite field only
  isECCFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceFormData {
  name: string;
  type: string;
  subcategory: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  contact_person: string;
  description: string;
  tags: string;
  service_area: string;
}