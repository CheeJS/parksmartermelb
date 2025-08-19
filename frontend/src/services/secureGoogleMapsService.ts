/**
 * Secure Google Maps Service
 * Handles place searches and geocoding through backend API to keep API key secure
 */

import { buildApiUrl, API_ENDPOINTS } from '../config/api';

export interface PlacePrediction {
  place_id: string;
  description: string;
  main_text?: string;
  secondary_text?: string;
  types: string[];
}

export interface PlaceGeometry {
  location: {
    lat: number;
    lng: number;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: PlaceGeometry;
}

export interface GeocodingResult {
  formatted_address: string;
  geometry: PlaceGeometry;
  place_id: string;
  types: string[];
}

/**
 * Search for places using backend Google Maps API proxy
 * @param input Search query string
 * @param types Array of place types to filter by
 * @param location Optional location bias
 * @param radius Search radius in meters
 * @returns Promise of place predictions
 */
export async function searchPlaces(
  input: string,
  types?: string[], // Make types optional to use backend default
  location?: { lat: number; lng: number },
  radius: number = 50000
): Promise<PlacePrediction[]> {
  try {
    const requestBody: any = {
      input,
      location,
      radius
    };

    // Only include types if specifically provided
    if (types && types.length > 0) {
      requestBody.types = types;
    }

    const response = await fetch(buildApiUrl(API_ENDPOINTS.placesSearch), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to search places');
    }

  } catch (error) {
    console.error('❌ Error searching places:', error);
    throw error;
  }
}

/**
 * Get place details including coordinates from place_id
 * @param placeId Google Places place_id
 * @param fields Fields to retrieve from place details
 * @returns Promise of place details
 */
export async function getPlaceDetails(
  placeId: string,
  fields: string[] = ['geometry', 'name', 'formatted_address']
): Promise<PlaceDetails> {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.placesDetails), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        place_id: placeId,
        fields
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to get place details');
    }

  } catch (error) {
    console.error('❌ Error getting place details:', error);
    throw error;
  }
}

/**
 * Geocode an address to get coordinates
 * @param address Address string to geocode
 * @param components Optional components to restrict search
 * @returns Promise of geocoding results
 */
export async function geocodeAddress(
  address: string,
  components?: { country?: string; [key: string]: string | undefined }
): Promise<GeocodingResult[]> {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.geocoding), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        components: components || { country: 'AU' }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error(result.message || 'Failed to geocode address');
    }

  } catch (error) {
    console.error('❌ Error geocoding address:', error);
    throw error;
  }
}

/**
 * Custom autocomplete hook replacement for secure backend API calls
 * This replaces the Google Maps JavaScript API autocomplete functionality
 */
export class SecureAutocomplete {
  private input: HTMLInputElement;
  private onPlaceSelected?: (place: PlaceDetails) => void;
  private predictions: PlacePrediction[] = [];
  private selectedIndex: number = -1;

  constructor(input: HTMLInputElement, options?: {
    types?: string[];
    onPlaceSelected?: (place: PlaceDetails) => void;
  }) {
    this.input = input;
    this.onPlaceSelected = options?.onPlaceSelected;
    
    this.setupEventListeners();
  }

  private setupEventListeners() {
    let searchTimeout: NodeJS.Timeout;

    this.input.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      if (value.length >= 3) {
        searchTimeout = setTimeout(() => {
          this.searchPlaces(value);
        }, 300); // Debounce search
      }
    });

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' && this.selectedIndex < this.predictions.length - 1) {
        e.preventDefault();
        this.selectedIndex++;
        this.highlightPrediction();
      } else if (e.key === 'ArrowUp' && this.selectedIndex > 0) {
        e.preventDefault();
        this.selectedIndex--;
        this.highlightPrediction();
      } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
        e.preventDefault();
        this.selectPrediction(this.predictions[this.selectedIndex]);
      }
    });
  }

  private async searchPlaces(input: string) {
    try {
      this.predictions = await searchPlaces(input);
      this.showPredictions();
    } catch (error) {
      console.error('Error in autocomplete search:', error);
    }
  }

  private showPredictions() {
    // Implementation would create a dropdown with predictions
    // This is a simplified version - you'd want to create actual UI elements
    console.log('Predictions:', this.predictions);
  }

  private highlightPrediction() {
    // Highlight the selected prediction in the dropdown
  }

  private async selectPrediction(prediction: PlacePrediction) {
    try {
      const placeDetails = await getPlaceDetails(prediction.place_id);
      this.input.value = prediction.description;
      
      if (this.onPlaceSelected) {
        this.onPlaceSelected(placeDetails);
      }
    } catch (error) {
      console.error('Error selecting place:', error);
    }
  }

  // Public method to get selected place (mimics Google Maps API)
  getPlace(): PlaceDetails | null {
    // Return the currently selected place details
    return null; // Simplified implementation
  }
}
