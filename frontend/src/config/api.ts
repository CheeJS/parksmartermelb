// API Configuration
// In development: Uses proxy to backend (localhost:5000)
// In production: Uses relative URLs (same domain as frontend)

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// For development, we use relative URLs thanks to the proxy in package.json
// For production, we also use relative URLs assuming frontend and backend are on same domain
export const API_BASE_URL = '';

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
  return `${API_BASE_URL}${endpoint}`;
};

// Environment info for debugging
export const API_CONFIG = {
  isDevelopment: IS_DEVELOPMENT,
  isProduction: IS_PRODUCTION,
  baseUrl: API_BASE_URL,
  environment: process.env.NODE_ENV || 'development'
};

console.log('🔧 API Configuration:', API_CONFIG);
