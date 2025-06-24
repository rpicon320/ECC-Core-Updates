// API utilities for external service integration
// This file contains client-side API helpers

export interface GeocodingRequest {
  address: string;
}

export interface PlacesTextSearchRequest {
  query: string;
  location: {
    lat: number;
    lng: number;
  };
  radius: number;
}

export interface EnhanceResourceRequest {
  name: string;
  address: string;
  types: string[];
  selectedType: string;
  rating?: number;
  userRatingsTotal?: number;
}

export interface EnhancedResourceData {
  name: string;
  type: string;
  subcategory: string;
  description: string;
  tags: string[];
  contact_person: string;
  service_area: string;
}

// Mock Geocoding API response
export const mockGeocodingSearch = async (request: GeocodingRequest) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock geocoding results for common ZIP codes
  const mockGeocodingResults: Record<string, any> = {
    '62701': {
      results: [{
        geometry: {
          location: { lat: 39.7817, lng: -89.6501 }
        },
        formatted_address: 'Springfield, IL 62701, USA'
      }]
    },
    '60601': {
      results: [{
        geometry: {
          location: { lat: 41.8781, lng: -87.6298 }
        },
        formatted_address: 'Chicago, IL 60601, USA'
      }]
    },
    '90210': {
      results: [{
        geometry: {
          location: { lat: 34.0901, lng: -118.4065 }
        },
        formatted_address: 'Beverly Hills, CA 90210, USA'
      }]
    }
  };
  
  // Return mock result or default to Springfield, IL
  return mockGeocodingResults[request.address] || mockGeocodingResults['62701'];
};

// Mock Places Text Search API response
export const mockPlacesTextSearch = async (request: PlacesTextSearchRequest) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock results based on the search query
  const searchQuery = request.query.toLowerCase();
  
  let mockResults = [];
  
  if (searchQuery.includes('wheelchair') || searchQuery.includes('ramp')) {
    mockResults = [
      {
        place_id: 'mock_wheelchair_1',
        name: 'Accessible Home Solutions',
        formatted_address: '123 Mobility Lane, Springfield, IL 62701',
        formatted_phone_number: '(555) 123-RAMP',
        website: 'https://accessiblehomesolutions.com',
        rating: 4.8,
        user_ratings_total: 156,
        types: ['home_goods_store', 'establishment'],
        business_status: 'OPERATIONAL',
        geometry: { location: { lat: 39.7817, lng: -89.6501 } }
      },
      {
        place_id: 'mock_wheelchair_2',
        name: 'Mobility Plus Equipment',
        formatted_address: '456 Independence Ave, Springfield, IL 62702',
        formatted_phone_number: '(555) 987-MOVE',
        rating: 4.5,
        user_ratings_total: 89,
        types: ['health', 'establishment'],
        business_status: 'OPERATIONAL',
        geometry: { location: { lat: 39.7901, lng: -89.6440 } }
      }
    ];
  } else if (searchQuery.includes('elder law') || searchQuery.includes('attorney')) {
    mockResults = [
      {
        place_id: 'mock_attorney_1',
        name: 'Elder Care Legal Services',
        formatted_address: '789 Justice Blvd, Springfield, IL 62703',
        formatted_phone_number: '(555) LAW-HELP',
        website: 'https://eldercarelegal.com',
        rating: 4.9,
        user_ratings_total: 203,
        types: ['lawyer', 'establishment'],
        business_status: 'OPERATIONAL',
        geometry: { location: { lat: 39.7956, lng: -89.6298 } }
      },
      {
        place_id: 'mock_attorney_2',
        name: 'Senior Rights Law Firm',
        formatted_address: '321 Legal Plaza, Springfield, IL 62704',
        formatted_phone_number: '(555) 555-RIGHTS',
        website: 'https://seniorrightslaw.com',
        rating: 4.7,
        user_ratings_total: 145,
        types: ['lawyer', 'establishment'],
        business_status: 'OPERATIONAL',
        geometry: { location: { lat: 39.8012, lng: -89.6187 } }
      }
    ];
  } else if (searchQuery.includes('memory care') || searchQuery.includes('alzheimer')) {
    mockResults = [
      {
        place_id: 'mock_memory_1',
        name: 'Golden Memories Care Center',
        formatted_address: '555 Memory Lane, Springfield, IL 62705',
        formatted_phone_number: '(555) MEMORY-1',
        website: 'https://goldenmemoriescare.com',
        rating: 4.6,
        user_ratings_total: 178,
        types: ['health', 'establishment'],
        business_status: 'OPERATIONAL',
        geometry: { location: { lat: 39.7723, lng: -89.6612 } }
      },
      {
        place_id: 'mock_memory_2',
        name: 'Sunrise Memory Care Village',
        formatted_address: '777 Caring Way, Springfield, IL 62706',
        formatted_phone_number: '(555) CARE-NOW',
        rating: 4.4,
        user_ratings_total: 92,
        types: ['health', 'establishment'],
        business_status: 'OPERATIONAL',
        geometry: { location: { lat: 39.7634, lng: -89.6723 } }
      }
    ];
  } else {
    // Generic results for any other search
    mockResults = [
      {
        place_id: 'mock_generic_1',
        name: `${request.query} Services LLC`,
        formatted_address: '123 Service St, Springfield, IL 62701',
        formatted_phone_number: '(555) 123-4567',
        website: 'https://example-service.com',
        rating: 4.2,
        user_ratings_total: 87,
        types: ['health', 'establishment'],
        business_status: 'OPERATIONAL',
        geometry: { location: { lat: 39.7817, lng: -89.6501 } }
      },
      {
        place_id: 'mock_generic_2',
        name: `Professional ${request.query} Center`,
        formatted_address: '456 Professional Blvd, Springfield, IL 62702',
        formatted_phone_number: '(555) 987-6543',
        rating: 4.0,
        user_ratings_total: 56,
        types: ['health', 'establishment'],
        business_status: 'OPERATIONAL',
        geometry: { location: { lat: 39.7901, lng: -89.6440 } }
      }
    ];
  }
  
  return { results: mockResults };
};

export const mockEnhanceResource = async (request: EnhanceResourceRequest): Promise<EnhancedResourceData> => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock AI enhancement based on the input
  const searchQuery = request.selectedType.toLowerCase();
  
  if (searchQuery.includes('wheelchair') || searchQuery.includes('ramp')) {
    return {
      name: request.name,
      type: request.selectedType,
      subcategory: 'Home Accessibility Equipment',
      description: `Professional wheelchair ramp installation and accessibility equipment provider. Specializes in custom ramps, stairlifts, and home modifications to improve mobility and independence for seniors and individuals with disabilities.`,
      tags: ['wheelchair ramps', 'accessibility', 'home modification', 'mobility equipment', 'ADA compliance'],
      contact_person: 'Accessibility Specialist',
      service_area: 'Central Illinois'
    };
  } else if (searchQuery.includes('elder law') || searchQuery.includes('attorney')) {
    return {
      name: request.name,
      type: request.selectedType,
      subcategory: 'Elder Law & Estate Planning',
      description: `Experienced elder law attorney specializing in estate planning, Medicaid planning, guardianship, and legal issues affecting seniors and their families. Provides compassionate legal guidance for complex elder care decisions.`,
      tags: ['elder law', 'estate planning', 'medicaid planning', 'guardianship', 'wills', 'trusts'],
      contact_person: 'Senior Partner',
      service_area: 'Sangamon County'
    };
  } else if (searchQuery.includes('memory care') || searchQuery.includes('alzheimer')) {
    return {
      name: request.name,
      type: request.selectedType,
      subcategory: 'Specialized Memory Care',
      description: `Dedicated memory care facility providing specialized care for individuals with Alzheimer's disease, dementia, and other memory-related conditions. Features secure environment, trained staff, and therapeutic programs designed for memory care residents.`,
      tags: ['memory care', 'alzheimer\'s care', 'dementia care', 'secure facility', 'therapeutic programs'],
      contact_person: 'Memory Care Director',
      service_area: 'Springfield Metro Area'
    };
  } else {
    return {
      name: request.name,
      type: request.selectedType,
      subcategory: 'Professional Services',
      description: `Professional ${request.selectedType.toLowerCase()} provider serving the local community with quality services tailored to meet the unique needs of seniors and their families. Committed to providing compassionate, reliable care and support.`,
      tags: [request.selectedType.toLowerCase(), 'professional services', 'senior care', 'local provider'],
      contact_person: 'Service Coordinator',
      service_area: 'Local Area'
    };
  }
};