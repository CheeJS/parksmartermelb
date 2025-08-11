/**
 * Public Transport Service
 * Handles fetching public transport stops and parking recommendations from database
 */

export interface PublicTransportStop {
  id: number;
  stop_id: string;
  stop_name: string;
  transport_type: string;
  stop_lat: number;
  stop_lon: number;
  distanceMeters?: number; // Added when calculating distance
}

export interface ParkingRecommendation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'Street Parking' | 'Shopping Center' | 'Transit Hub' | 'EV Charging' | 'Bike Parking';
  available: boolean;
  availableSpots?: number;
  totalSpots?: number;
  price: string;
  isEcoFriendly: boolean;
  nearbyStops: PublicTransportStop[];
  walkToNearestTransit: number; // meters
  distanceFromDestination: number; // meters
  restrictionDays?: string;
  restrictionStart?: string;
  restrictionEnd?: string;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Fetch public transport stops from database
 * @param lat - Center latitude for search
 * @param lng - Center longitude for search  
 * @param radiusKm - Search radius in kilometers (default 2km)
 * @returns Promise of transport stops
 */
export async function fetchNearbyTransportStops(
  lat: number, 
  lng: number, 
  radiusKm: number = 2
): Promise<PublicTransportStop[]> {
  try {
    // Use the backend API endpoint

    const apiUrl = process.env.REACT_APP_API_URL || 'https://api.parksmartermelb.me';
    const response = await fetch(`${apiUrl}/api/transport-stops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: lat,
        longitude: lng,
        radius: radiusKm
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const stops: PublicTransportStop[] = await response.json();
    
    console.log(`🚌 Received ${stops.length} transport stops from API`);
    
    // The backend already calculates and sorts by distance, but ensure distanceMeters is set
    return stops.map(stop => ({
      ...stop,
      distanceMeters: stop.distanceMeters || calculateDistance(lat, lng, stop.stop_lat, stop.stop_lon)
    }));

  } catch (error) {
    console.error('❌ Error fetching transport stops from API:', error);
    // Return empty array if API fails - no mock data
    return [];
  }
}

/**
 * Find parking recommendations near destination using real database data
 * @param destinationLat - Destination latitude
 * @param destinationLng - Destination longitude
 * @returns Promise of parking recommendations
 */
export async function findParkingNearDestination(
  destinationLat: number,
  destinationLng: number
): Promise<ParkingRecommendation[]> {
  try {
    // Use the backend API endpoint for real parking data
    const apiUrl = process.env.REACT_APP_API_URL || 'https://api.parksmartermelb.me';
    const response = await fetch(`${apiUrl}/api/parking-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destinationLat,
        destinationLng,
        radius: 1 // 1km radius for parking search
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const recommendations: ParkingRecommendation[] = await response.json();
    
    console.log(`🅿️ Received ${recommendations.length} parking recommendations from API`);
    
    return recommendations;
    
  } catch (error) {
    console.error('❌ Error fetching parking recommendations from API:', error);
    // Return empty array if API fails - no mock data
    return [];
  }
}

/**
 * Format distance for display
 * @param meters - Distance in meters
 * @returns Formatted string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format walk time estimate
 * @param meters - Distance in meters
 * @returns Estimated walk time string
 */
export function formatWalkTime(meters: number): string {
  const walkingSpeedMps = 1.4; // Average walking speed in meters per second
  const seconds = meters / walkingSpeedMps;
  const minutes = Math.round(seconds / 60);
  
  if (minutes < 1) return '<1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} mins`;
}
