interface RouteRequest {
  origin: {
    address?: string;
    location?: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
  };
  destination: {
    address?: string;
    location?: {
      latLng: {
        latitude: number;
        longitude: number;
      };
    };
  };
  travelMode: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER' | 'TRANSIT';
  routingPreference?: 'TRAFFIC_AWARE' | 'TRAFFIC_UNAWARE';
  computeAlternativeRoutes?: boolean;
  routeModifiers?: {
    avoidTolls?: boolean;
    avoidHighways?: boolean;
    avoidFerries?: boolean;
  };
  languageCode?: string;
  units?: 'METRIC' | 'IMPERIAL';
}

interface LocationInput {
  lat?: number;
  lng?: number;
  address: string;
}

interface RouteResponse {
  routes: Array<{
    duration: string;
    distanceMeters: number;
    polyline: {
      encodedPolyline: string;
    };
  }>;
}

interface RouteResult {
  success: boolean;
  distance?: {
    meters: number;
    kilometers: string;
    text: string;
  };
  duration?: {
    seconds: number;
    text: string;
  };
  error?: string;
}

const createLocationPayload = (location: LocationInput) => {
  // If it's "Current Location" and we have coordinates, use coordinates
  if (location.address === 'Current Location' && location.lat && location.lng) {
    return {
      location: {
        latLng: {
          latitude: location.lat,
          longitude: location.lng
        }
      }
    };
  }
  // Otherwise use the address
  return {
    address: location.address
  };
};

export const calculateRoute = async (
  origin: LocationInput,
  destination: LocationInput,
  travelMode: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER' | 'TRANSIT' = 'DRIVE'
): Promise<RouteResult> => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      error: 'Google Maps API key not configured'
    };
  }

  const requestBody: RouteRequest = {
    origin: createLocationPayload(origin),
    destination: createLocationPayload(destination),
    travelMode,
    computeAlternativeRoutes: false,
    routeModifiers: travelMode === 'TRANSIT' ? undefined : {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false
    },
    languageCode: 'en-US',
    units: 'METRIC'
  };

  try {
    console.log(`🚀 Calculating route for ${travelMode}:`, {
      origin: requestBody.origin,
      destination: requestBody.destination,
      travelMode
    });

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP error for ${travelMode}:`, response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    const data: RouteResponse = await response.json();
    console.log(`✅ Received response for ${travelMode}:`, data);

    if (!data.routes || data.routes.length === 0) {
      console.warn(`⚠️ No routes found for ${travelMode}`);
      return {
        success: false,
        error: `No routes found for ${travelMode}`
      };
    }

    const route = data.routes[0];
    const distanceMeters = route.distanceMeters;
    const distanceKm = distanceMeters / 1000;
    
    // Parse duration from ISO 8601 format (e.g., "1234s")
    const durationMatch = route.duration.match(/(\d+)s/);
    const durationSeconds = durationMatch ? parseInt(durationMatch[1]) : 0;
    const durationMinutes = Math.round(durationSeconds / 60);

    return {
      success: true,
      distance: {
        meters: distanceMeters,
        kilometers: distanceKm.toFixed(1),
        text: distanceKm < 1 
          ? `${distanceMeters}m` 
          : `${distanceKm.toFixed(1)}km`
      },
      duration: {
        seconds: durationSeconds,
        text: durationMinutes < 60 
          ? `${durationMinutes} min${durationMinutes !== 1 ? 's' : ''}` 
          : `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
      }
    };

  } catch (error) {
    console.error('Error calculating route:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
