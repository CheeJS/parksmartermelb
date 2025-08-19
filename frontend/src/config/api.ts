// API Configuration
// In development: Uses proxy to backend (localhost:5000)
// In production: Uses full URL to DigitalOcean backend

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// API Base URL configuration
// Development: Empty string (uses proxy from package.json)
// Production: Uses environment variable or default backend URL
export const API_BASE_URL = IS_DEVELOPMENT 
  ? '' 
  : (process.env.REACT_APP_API_URL);

// Export individual endpoint builders for better maintainability
export const API_ENDPOINTS = {
  // Parking endpoints
  parking: '/api/parking',
  occupancy: '/api/occupancy',
  live: '/api/live',
  offStreet: '/api/off-street',
  simpleParkingSearch: '/api/simple-parking-search',
  homeStats: '/api/home-stats',
  topParking: '/api/top-parking',
  
  // Transport endpoints
  transportStops: '/api/transport-stops',
  parkingRecommendations: '/api/parking-recommendations',
  
  // Historical data endpoints
  carOwnership: '/api/car-ownership',
  popularAreas: '/api/popular-areas',
  vehicleOwnership: '/api/vehicle-ownership',
  population: '/api/population',
  vehicleCensus: '/api/vehicle-census',
  carOwnershipAnalysis: '/api/car-ownership-analysis',
  simpleTest: '/api/simple-test',

  // Google Maps API endpoints (secure backend proxy)
  placesSearch: '/api/places/search',
  placesDetails: '/api/places/details',
  geocoding: '/api/geocoding'
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  // Only log in development
  if (IS_DEVELOPMENT) {
    console.log(`🔗 Building API URL: ${endpoint} -> ${fullUrl}`);
  }
  return fullUrl;
};

// Environment info for debugging (only in development)
export const API_CONFIG = {
  isDevelopment: IS_DEVELOPMENT,
  isProduction: IS_PRODUCTION,
  baseUrl: API_BASE_URL,
  environment: process.env.NODE_ENV || 'development',
  reactAppApiUrl: process.env.REACT_APP_API_URL
};

// Only log configuration in development
if (IS_DEVELOPMENT) {
  console.log('🔧 API Configuration:', API_CONFIG);
  console.log('🌐 Final API Base URL:', API_BASE_URL);
}
