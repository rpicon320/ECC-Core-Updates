import React, { useState } from 'react';
import { Search, MapPin, Building2, Phone, Globe, Mail, User, Plus, CheckCircle, AlertCircle, X, Loader, ExternalLink, Sparkles, Key } from 'lucide-react';
import { useResources } from '../hooks/useFirebase';
import { mockGeocodingSearch, mockPlacesTextSearch, mockEnhanceResource, GeocodingRequest, PlacesTextSearchRequest, EnhanceResourceRequest } from '../lib/api';

interface ResourceSearcherProps {
  onClose?: () => void;
  onAddResource?: () => void;
}

interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  business_status?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface EnhancedResource {
  original: PlaceResult;
  enhanced: {
    name: string;
    type: string;
    subcategory: string;
    description: string;
    tags: string[];
    contact_person: string;
    service_area: string;
  };
  isDuplicate: boolean;
  isProcessing: boolean;
}

const ResourceSearcher: React.FC<ResourceSearcherProps> = ({ onClose, onAddResource }) => {
  const { checkDuplicate, addResource } = useResources();
  const [searchQuery, setSearchQuery] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<EnhancedResource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(true);

  const searchPlaces = async () => {
    if (!searchQuery.trim() || !zipCode.trim()) {
      setError('Please enter both a search query and ZIP code');
      return;
    }

    setSearching(true);
    setError(null);
    setResults([]);

    try {
      console.log('🔍 Searching for:', searchQuery, 'in ZIP:', zipCode);
      
      let geocodingData;
      let placesData;
      
      if (useMockData) {
        // Use mock data for demonstration
        console.log('📋 Using mock data for demonstration');
        
        // Step 1: Mock Geocoding API
        geocodingData = await mockGeocodingSearch({
          address: zipCode
        });
        
        if (!geocodingData.results || geocodingData.results.length === 0) {
          throw new Error('ZIP code not found');
        }
        
        const location = geocodingData.results[0].geometry.location;
        console.log('📍 Geocoded location:', location);
        
        // Step 2: Mock Places Text Search API
        placesData = await mockPlacesTextSearch({
          query: `${searchQuery} in ${zipCode}`,
          location: location,
          radius: 16093 // 10 miles in meters
        });
        
      } else {
        // Real API calls (would need server-side implementation)
        
        // Step 1: Geocoding API
        const geocodingResponse = await fetch('/api/geocoding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: zipCode
          }),
        });

        if (!geocodingResponse.ok) {
          throw new Error('Failed to geocode ZIP code - API not configured');
        }

        geocodingData = await geocodingResponse.json();
        
        if (!geocodingData.results || geocodingData.results.length === 0) {
          throw new Error('ZIP code not found');
        }
        
        const location = geocodingData.results[0].geometry.location;
        
        // Step 2: Places Text Search API
        const placesResponse = await fetch('/api/places-text-search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `${searchQuery} in ${zipCode}`,
            location: location,
            radius: 16093 // 10 miles in meters
          }),
        });

        if (!placesResponse.ok) {
          throw new Error('Failed to search places - API not configured');
        }

        placesData = await placesResponse.json();
      }

      const places: PlaceResult[] = placesData.results || [];
      console.log(`📍 Found ${places.length} places for "${searchQuery}"`);

      // Step 3: Process each place
      const enhancedResults: EnhancedResource[] = [];

      for (const place of places.slice(0, 10)) { // Limit to 10 results
        const enhancedResource: EnhancedResource = {
          original: place,
          enhanced: {
            name: place.name,
            type: searchQuery, // Use the user's typed query as the type
            subcategory: '',
            description: '',
            tags: [],
            contact_person: '',
            service_area: `${zipCode} area`,
          },
          isDuplicate: false,
          isProcessing: true,
        };

        enhancedResults.push(enhancedResource);
      }

      setResults(enhancedResults);

      // Step 4: Enhance each result with AI and check for duplicates
      for (let i = 0; i < enhancedResults.length; i++) {
        const result = enhancedResults[i];
        
        try {
          // Check for duplicates
          const isDuplicate = await checkDuplicate(
            result.original.name,
            result.original.formatted_address
          );

          // Enhance with AI (mock or real)
          let aiData;
          
          if (useMockData) {
            aiData = await mockEnhanceResource({
              name: result.original.name,
              address: result.original.formatted_address,
              types: result.original.types,
              selectedType: searchQuery,
              rating: result.original.rating,
              userRatingsTotal: result.original.user_ratings_total,
            });
          } else {
            const aiResponse = await fetch('/api/enhance-resource', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: result.original.name,
                address: result.original.formatted_address,
                types: result.original.types,
                selectedType: searchQuery,
                rating: result.original.rating,
                userRatingsTotal: result.original.user_ratings_total,
              }),
            });

            if (aiResponse.ok) {
              aiData = await aiResponse.json();
            } else {
              throw new Error('AI enhancement failed');
            }
          }

          result.enhanced = {
            ...result.enhanced,
            ...aiData,
            type: searchQuery, // Always use the user's typed query as the type
          };

          result.isDuplicate = isDuplicate;
          result.isProcessing = false;

          // Update the results array
          setResults([...enhancedResults]);

        } catch (error) {
          console.error('Error processing result:', error);
          result.isProcessing = false;
          result.enhanced.description = 'Unable to generate description - API not configured';
          setResults([...enhancedResults]);
        }
      }

    } catch (error) {
      console.error('Search error:', error);
      setError('Search functionality requires API configuration. Currently showing demo data.');
      
      // Show demo results even on error
      if (useMockData) {
        try {
          const demoGeocodingData = await mockGeocodingSearch({ address: zipCode });
          const location = demoGeocodingData.results[0].geometry.location;
          
          const demoData = await mockPlacesTextSearch({
            query: `${searchQuery} in ${zipCode}`,
            location: location,
            radius: 16093
          });
          
          const demoResults: EnhancedResource[] = demoData.results.map(place => ({
            original: place,
            enhanced: {
              name: place.name,
              type: searchQuery,
              subcategory: 'Demo Category',
              description: 'This is demonstration data showing how the feature would work with real APIs.',
              tags: ['demo', 'example', searchQuery.toLowerCase()],
              contact_person: 'Demo Contact',
              service_area: `${zipCode} area`,
            },
            isDuplicate: false,
            isProcessing: false,
          }));
          
          setResults(demoResults);
        } catch (demoError) {
          console.error('Demo data error:', demoError);
        }
      }
    } finally {
      setSearching(false);
    }
  };

  const handleAddToDirectory = async (enhancedResource: EnhancedResource) => {
    try {
      const resourceData = {
        name: enhancedResource.enhanced.name,
        type: enhancedResource.enhanced.type,
        subcategory: enhancedResource.enhanced.subcategory,
        address: enhancedResource.original.formatted_address,
        phone: enhancedResource.original.formatted_phone_number || '',
        email: '', // Not available from Places API
        website: enhancedResource.original.website || '',
        contact_person: enhancedResource.enhanced.contact_person,
        description: enhancedResource.enhanced.description,
        tags: enhancedResource.enhanced.tags,
        service_area: enhancedResource.enhanced.service_area,
        logoUrl: '',
        verified: false, // New resources need verification
      };

      await addResource(resourceData);
      
      // Update the result to show it's been added
      const updatedResults = results.map(r => 
        r.original.place_id === enhancedResource.original.place_id 
          ? { ...r, isDuplicate: true } 
          : r
      );
      setResults(updatedResults);

    } catch (error) {
      console.error('Error adding resource:', error);
      alert('Failed to add resource to directory');
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-6 h-6 text-orange-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Search for Unlisted Resources</h2>
              <p className="text-gray-600 mt-1">
                Find local providers using free text search + Google Places API
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* Demo Mode Toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Key className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-blue-900">API Configuration</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useMockData}
                    onChange={(e) => setUseMockData(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-blue-700">Use Demo Data</span>
                </label>
              </div>
              <p className="text-blue-700 text-sm mb-3">
                {useMockData 
                  ? 'Currently using demonstration data to show how the feature works.'
                  : 'Attempting to use real APIs (requires server-side configuration).'
                }
              </p>
              <div className="text-blue-700 text-sm space-y-1">
                <p><strong>Required APIs:</strong></p>
                <p>• <strong>Google Geocoding API:</strong> Convert ZIP code to lat/lng coordinates</p>
                <p>• <strong>Google Places Text Search API:</strong> Find businesses with free text queries</p>
                <p>• <strong>OpenAI GPT-3.5:</strong> Enhance descriptions and categorization</p>
                <p>• <strong>Search Radius:</strong> 10 miles from ZIP code center</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Search Parameters
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                What are you looking for? *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="e.g., wheelchair ramp installer, elder law attorney, memory care facility"
                />
              </div>
              <p className="text-xs text-gray-500">
                Type any service or provider type - be as specific as you want!
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                ZIP Code *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="Enter ZIP code (e.g., 62701)"
                  maxLength={5}
                />
              </div>
              <p className="text-xs text-gray-500">
                We'll search within 10 miles of this ZIP code
              </p>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={searchPlaces}
              disabled={searching || !searchQuery.trim() || !zipCode.trim()}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
            >
              {searching ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  {useMockData ? 'Loading Demo Data...' : 'Searching...'}
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  {useMockData ? 'Show Demo Results' : 'Search Local Providers'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Examples */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">💡 Search Examples:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-green-800 text-sm">
            <div className="space-y-1">
              <p>• <strong>"wheelchair ramp installer"</strong></p>
              <p>• <strong>"elder law attorney"</strong></p>
              <p>• <strong>"home health aide"</strong></p>
              <p>• <strong>"memory care facility"</strong></p>
            </div>
            <div className="space-y-1">
              <p>• <strong>"physical therapy clinic"</strong></p>
              <p>• <strong>"senior transportation"</strong></p>
              <p>• <strong>"meal delivery service"</strong></p>
              <p>• <strong>"medical equipment rental"</strong></p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Found {results.length} Results for "{searchQuery}"
                {useMockData && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium ml-2">
                    DEMO DATA
                  </span>
                )}
              </h3>
              <div className="text-sm text-gray-500">
                Within 10 miles of {zipCode} • Enhanced with AI
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((result) => (
                <ResourceResultCard
                  key={result.original.place_id}
                  result={result}
                  onAddToDirectory={handleAddToDirectory}
                  isDemo={useMockData}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            How This Feature Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-blue-800 text-sm">
            <div className="space-y-2">
              <p><strong>1. Geocoding</strong></p>
              <p>Convert ZIP code to precise lat/lng coordinates</p>
            </div>
            <div className="space-y-2">
              <p><strong>2. Places Search</strong></p>
              <p>Find businesses matching your free text query within 10 miles</p>
            </div>
            <div className="space-y-2">
              <p><strong>3. AI Enhancement</strong></p>
              <p>GPT-3.5 cleans data and generates professional descriptions</p>
            </div>
            <div className="space-y-2">
              <p><strong>4. Smart Integration</strong></p>
              <p>Check duplicates and add to directory with one click</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface ResourceResultCardProps {
  result: EnhancedResource;
  onAddToDirectory: (result: EnhancedResource) => void;
  isDemo?: boolean;
  searchQuery: string;
}

const ResourceResultCard: React.FC<ResourceResultCardProps> = ({ result, onAddToDirectory, isDemo, searchQuery }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all relative">
      {/* Demo Badge */}
      {isDemo && (
        <div className="absolute top-3 right-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            DEMO
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 truncate">
            {result.enhanced.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
              {result.enhanced.type}
            </span>
            {result.enhanced.subcategory && (
              <span className="text-gray-500 text-xs">{result.enhanced.subcategory}</span>
            )}
          </div>
        </div>

        {result.original.rating && (
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              ⭐ {result.original.rating}
            </div>
            <div className="text-xs text-gray-500">
              ({result.original.user_ratings_total} reviews)
            </div>
          </div>
        )}
      </div>

      {/* AI-Enhanced Description */}
      {result.isProcessing ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Loader className="w-4 h-4 animate-spin" />
          <span>Enhancing with AI...</span>
        </div>
      ) : (
        result.enhanced.description && (
          <div className="mb-4">
            <p className="text-gray-600 text-sm line-clamp-3">
              {result.enhanced.description}
            </p>
            {isDemo && (
              <p className="text-xs text-blue-600 mt-1 italic">
                ✨ AI-generated description (demo)
              </p>
            )}
          </div>
        )
      )}

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <span className="flex-1">{result.original.formatted_address}</span>
        </div>

        {result.original.formatted_phone_number && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{result.original.formatted_phone_number}</span>
          </div>
        )}

        {result.original.website && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <a
              href={result.original.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors truncate flex items-center gap-1"
            >
              {result.original.website.replace(/^https?:\/\//, '')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Tags */}
      {result.enhanced.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {result.enhanced.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {result.enhanced.tags.length > 3 && (
            <span className="text-gray-500 text-xs px-2 py-1">
              +{result.enhanced.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="pt-4 border-t border-gray-100">
        {result.isDuplicate ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            <span>Already in Directory</span>
          </div>
        ) : (
          <button
            onClick={() => onAddToDirectory(result)}
            disabled={result.isProcessing}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add to Resource Directory
          </button>
        )}
      </div>
    </div>
  );
};

export default ResourceSearcher;