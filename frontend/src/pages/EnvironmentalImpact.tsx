import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { calculateRoute } from '../services/routesService';
import { calculateCO2Emissions, getEmissionColor, getEmissionRating, formatEmissions } from '../utils/emissionCalculator';
import { findParkingNearDestination, formatDistance, formatWalkTime, ParkingRecommendation } from '../services/publicTransportService';

  type TravelMode = 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER' | 'TRANSIT';



interface Location {
  lat: number;
  lng: number;
  address: string;
}





const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%);
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #2C5282 0%, #2D3748 100%);
  color: white;
  padding: 4rem 2rem 3rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const PageTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  font-size: 1.25rem;
  line-height: 1.6;
  opacity: 0.95;
  max-width: 800px;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
  font-size: 1.1rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const InfoSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 1px solid #E2E8F0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  }
`;

const InfoIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const InfoTitle = styled.h3`
  color: #2D3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const InfoText = styled.p`
  color: #4A5568;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const LocationSearchContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 1px solid #E2E8F0;
  margin-bottom: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #48BB78 0%, #38A169 100%);
    border-radius: 1rem 0 0 1rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #EBF8FF 0%, #BEE3F8 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const SectionTitle = styled.h2`
  color: #2D3748;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const TipsSection = styled.div`
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  border-radius: 1rem;
  padding: 2rem;
  margin: 3rem 0;
  border: 1px solid #BBF7D0;
`;

const TipsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
`;

const TipItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  color: #2D3748;
  line-height: 1.6;

  &::before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #48BB78;
    color: white;
    border-radius: 50%;
    font-weight: bold;
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  min-width: 0; /* Allows flex item to shrink below content size */
`;



const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  font-size: 1rem;
  height: 48px; /* Fixed height for consistency */
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #48BB78;
    box-shadow: 0 0 0 1px #48BB78;
  }
`;

const Button = styled.button`
  background: #48BB78;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
  height: 48px; /* Match input field height */
  white-space: nowrap;
  min-width: fit-content;

  &:hover {
    background: #38A169;
  }

  &:disabled {
    background: #A0AEC0;
    cursor: not-allowed;
  }
`;

const CalculateButton = styled.button`
  background: #2C5282;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  width: 100%;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #2A4365;
  }

  &:disabled {
    background: #A0AEC0;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #FED7D7;
  color: #C53030;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.9rem;
  border: 1px solid #FEB2B2;
`;

const ResultsContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  border: 1px solid #E2E8F0;
  margin-top: 2rem;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #2C5282 0%, #2A4365 100%);
    border-radius: 1rem 0 0 1rem;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ResultCard = styled.div`
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ResultIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const ResultTitle = styled.h3`
  color: #2D3748;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const ResultEmission = styled.div<{ color: string }>`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.color};
  margin-bottom: 0.5rem;
`;

const EmissionDetails = styled.div`
  font-size: 0.75rem;
  color: #4A5568;
  margin-top: 0.5rem;
  line-height: 1.4;
`;

const ComparisonBadge = styled.span<{ isPositive: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  margin-top: 0.5rem;
  background: ${props => props.isPositive ? '#C6F6D5' : '#FED7D7'};
  color: ${props => props.isPositive ? '#2F855A' : '#C53030'};
`;

const ResultDescription = styled.p`
  color: #4A5568;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
`;

const RouteInfo = styled.div`
  background: #EBF8FF;
  border: 1px solid #90CDF4;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const DistanceText = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2D3748;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ContentArea = styled.div`
  min-width: 0;
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
  
  @media (max-width: 1024px) {
    position: static;
  }
`;

const ParkingSpotCard = styled.div`
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #48BB78;
    box-shadow: 0 2px 8px rgba(72, 187, 120, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ParkingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const ParkingName = styled.div`
  font-weight: 600;
  color: #2D3748;
  font-size: 0.95rem;
`;

const MapsIcon = styled.button`
  background: #2B5797;
  color: white;
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  font-weight: 500;
  
  &:hover {
    background: #1A365D;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ParkingInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #4A5568;
`;

const GreenBadge = styled.span`
  background: #C6F6D5;
  color: #2F855A;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const YellowBadge = styled.span`
  background: #FED7AA;
  color: #C05621;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const RedBadge = styled.span`
  background: #FEB2B2;
  color: #C53030;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const ParkingPrice = styled.div`
  font-weight: 600;
  color: #2D3748;
  font-size: 0.9rem;
`;

const EnvironmentalImpact = () => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [startAutocomplete, setStartAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [endAutocomplete, setEndAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [travelTimes, setTravelTimes] = useState<Record<TravelMode, string>>({
    'DRIVE': '',
    'TRANSIT': '',
    'TWO_WHEELER': '',
    'BICYCLE': '',
    'WALK': ''
  });
  
  // Function to open location in maps
  const openInMaps = (latitude: string | number, longitude: string | number, name: string) => {
    const lat = parseFloat(latitude.toString());
    const lng = parseFloat(longitude.toString());
    
    // Create a universal maps URL that works across devices
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
    // Open in new tab/window
    window.open(mapsUrl, '_blank');
  };
  const [routeError, setRouteError] = useState<string>('');
  const [parkingRecommendations, setParkingRecommendations] = useState<ParkingRecommendation[]>([]);
  const [isLoadingParking, setIsLoadingParking] = useState(false);
  
  // Input field values for controlled components
  const [startInputValue, setStartInputValue] = useState('');
  const [endInputValue, setEndInputValue] = useState('');

  // Travel mode options with descriptions
  const travelModes = [
    {
      mode: 'DRIVE' as TravelMode,
      title: 'Drive',
      icon: '🚗',
      description: 'Travel by passenger car'
    },
    {
      mode: 'TRANSIT' as TravelMode,
      title: 'Public',
      icon: '🚌',
      description: 'Travel by public transit routes, where available'
    },
    {
      mode: 'TWO_WHEELER' as TravelMode,
      title: 'Motor',
      icon: '🏍️',
      description: 'Two-wheeled, motorized vehicle. For example, motorcycle'
    },
    {
      mode: 'BICYCLE' as TravelMode,
      title: 'Bicycle',
      icon: '🚴',
      description: 'Travel by bicycle'
    },
    {
      mode: 'WALK' as TravelMode,
      title: 'Walk',
      icon: '🚶',
      description: 'Travel by walking'
    }
  ];

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  // Fetch parking recommendations when destination changes
  useEffect(() => {
    const fetchParkingRecommendations = async () => {
      if (!endLocation) {
        console.log('🅿️ No destination selected, clearing parking recommendations');
        setParkingRecommendations([]);
        return;
      }

      console.log('🅿️ Fetching parking recommendations for:', endLocation.address, 'at coordinates:', endLocation.lat, endLocation.lng);
      setIsLoadingParking(true);
      try {
        const recommendations = await findParkingNearDestination(
          endLocation.lat,
          endLocation.lng
        );
        console.log('🅿️ Received', recommendations.length, 'parking recommendations');
        setParkingRecommendations(recommendations);
      } catch (error) {
        console.error('❌ Error fetching parking recommendations:', error);
        setParkingRecommendations([]);
      } finally {
        setIsLoadingParking(false);
      }
    };

    fetchParkingRecommendations();
  }, [endLocation]);

  const onStartLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setStartAutocomplete(autocomplete);
  }, []);

  const onEndLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setEndAutocomplete(autocomplete);
  }, []);

  const onStartPlaceChanged = () => {
    if (startAutocomplete) {
      const place = startAutocomplete.getPlace();
      if (place.geometry?.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || place.name || ''
        };
        setStartLocation(newLocation);
        setStartInputValue(newLocation.address);
      }
    }
  };

  const onEndPlaceChanged = () => {
    if (endAutocomplete) {
      const place = endAutocomplete.getPlace();
      if (place.geometry?.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || place.name || ''
        };
        setEndLocation(newLocation);
        setEndInputValue(newLocation.address);
        console.log('🎯 New destination selected:', newLocation.address, 'Coordinates:', newLocation.lat, newLocation.lng);
      }
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Try to get a readable address using reverse geocoding
          let address = 'Current Location';
          
          try {
            if (window.google && window.google.maps) {
              const geocoder = new window.google.maps.Geocoder();
              const response = await new Promise<google.maps.GeocoderResponse>((resolve, reject) => {
                geocoder.geocode(
                  { location: { lat, lng } },
                  (results, status) => {
                    if (status === 'OK') {
                      resolve({ results: results || [] } as google.maps.GeocoderResponse);
                    } else {
                      reject(new Error(`Geocoding failed: ${status}`));
                    }
                  }
                );
              });
              
              if (response.results && response.results.length > 0) {
                address = response.results[0].formatted_address || 'Current Location';
              }
            }
          } catch (error) {
            console.warn('Could not get address for current location:', error);
            // Fall back to showing coordinates
            address = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          }
          
          const newLocation = { lat, lng, address };
          setStartLocation(newLocation);
          setStartInputValue(address);
        },
        (error) => {
          console.error('Error getting current location:', error);
          let errorMessage = 'Error getting your current location. Please try entering it manually.';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location services and try again.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please try entering your location manually.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const calculateEmissions = async () => {
    if (!startLocation || !endLocation) {
      alert('Please enter both starting point and destination');
      return;
    }

    setIsCalculating(true);
    setRouteError('');
    
    try {
      // Calculate routes for specific travel modes (Motor uses Drive travel time)
      const routePromises = travelModes
        .filter(mode => mode.mode !== 'TWO_WHEELER') // Skip TWO_WHEELER, we'll use Drive time for Motor
        .map(async (mode) => {
          try {
            console.log(`🔄 Starting calculation for ${mode.title} (${mode.mode})`);
            const result = await calculateRoute(
              startLocation,
              endLocation,
              mode.mode
            );
            console.log(`✅ Completed calculation for ${mode.title}:`, result);
            return {
              mode: mode.mode,
              result: result
            };
          } catch (error) {
            console.error(`❌ Error calculating route for ${mode.title} (${mode.mode}):`, error);
            return {
              mode: mode.mode,
              result: { 
                success: false, 
                error: `Failed to calculate ${mode.title} route: ${error instanceof Error ? error.message : 'Unknown error'}`
              }
            };
          }
        });

      const routeResults = await Promise.all(routePromises);
      console.log('📊 All route results:', routeResults);
      
      // Use driving route for distance (most reliable)
      const driveResult = routeResults.find(r => r.mode === 'DRIVE')?.result;
      
      if (driveResult?.success && driveResult.distance && driveResult.duration) {
        setDistance(driveResult.distance.kilometers);
        setDuration(driveResult.duration.text);
        
        // Set travel times for each mode
        const newTravelTimes: Record<TravelMode, string> = {
          'DRIVE': '',
          'TRANSIT': '',
          'TWO_WHEELER': '',
          'BICYCLE': '',
          'WALK': ''
        };
        
        routeResults.forEach(({ mode, result }) => {
          if (result.success && result.duration) {
            newTravelTimes[mode] = result.duration.text;
            console.log(`✅ Set travel time for ${mode}: ${result.duration.text}`);
          } else {
            newTravelTimes[mode] = 'N/A';
            console.warn(`⚠️ No travel time for ${mode}:`, result.error);
          }
        });
        
        // Use Drive travel time for Motor (TWO_WHEELER)
        if (driveResult.success && driveResult.duration) {
          newTravelTimes['TWO_WHEELER'] = driveResult.duration.text;
          console.log(`✅ Set Motor travel time (using Drive time): ${driveResult.duration.text}`);
        }
        
        console.log('🕐 Final travel times:', newTravelTimes);
        setTravelTimes(newTravelTimes);
        setIsCalculated(true);
      } else {
        console.error('❌ Drive result failed:', driveResult);
        setRouteError(driveResult?.error || 'Failed to calculate route');
      }
    } catch (error) {
      console.error('Error calculating routes:', error);
      setRouteError('Network error occurred while calculating routes');
    } finally {
      setIsCalculating(false);
    }
  };

  const getEmissionData = (mode: TravelMode) => {
    if (!distance) return { value: '0', color: '#48BB78', rating: 'Not calculated' };
    const distanceKm = parseFloat(distance);
    
    // Use the new accurate emission calculator
    const result = calculateCO2Emissions(distanceKm, mode);
    
    return {
      value: formatEmissions(result.totalEmissions),
      rawValue: result.totalEmissions,
      color: getEmissionColor(result.totalEmissions),
      rating: getEmissionRating(result.totalEmissions),
      perKm: result.emissionsPerKm,
      fuelConsumed: result.fuelConsumed,
      vehicleType: result.vehicleType,
      methodology: result.methodology,
      comparison: result.comparison
    };
  };





  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <PageContainer>
      <HeroSection>
        <HeroContent>
          <PageTitle>🌍 Environmental Impact Calculator</PageTitle>
        <Description>
            Make informed decisions about your travel. Calculate carbon emissions, 
            compare transport options, and discover eco-friendly parking near public transit.
        </Description>
          

        </HeroContent>
      </HeroSection>

      <ContentWrapper>
        <InfoSection>
          <InfoCard>
            <InfoIcon>🅿️</InfoIcon>
            <InfoTitle>Real-Time Parking Data</InfoTitle>
            <InfoText>
              Live parking availability from Melbourne's street parking network. See exactly how many 
              spots are available and when parking restrictions apply.
            </InfoText>
          </InfoCard>
          
          <InfoCard>
            <InfoIcon>🚌</InfoIcon>
            <InfoTitle>Transit Integration</InfoTitle>
            <InfoText>
              Find parking within 250m of train, tram, and bus stops. Our system shows which specific 
              transport services are nearby to help you plan multimodal journeys.
            </InfoText>
          </InfoCard>
          
          <InfoCard>
            <InfoIcon>🌱</InfoIcon>
            <InfoTitle>Eco-Friendly Choices</InfoTitle>
            <InfoText>
              Parking spots are automatically labeled as eco-friendly when within 250m of public 
              transport, encouraging sustainable travel choices for your final destination.
            </InfoText>
          </InfoCard>
        </InfoSection>

        <MainContent>
        <ContentArea>
      <LocationSearchContainer>
        <SectionHeader>
          <SectionIcon>📍</SectionIcon>
          <SectionTitle>Plan Your Journey</SectionTitle>
        </SectionHeader>
        <FlexRow>
          <InputWrapper>
            <Autocomplete
              onLoad={onStartLoad}
              onPlaceChanged={onStartPlaceChanged}
            >
              <SearchInput
                type="text"
                placeholder="Enter starting point"
                value={startInputValue}
                onChange={(e) => setStartInputValue(e.target.value)}
              />
            </Autocomplete>
          </InputWrapper>
          <Button onClick={getCurrentLocation}>
            Use Current Location
          </Button>
        </FlexRow>
        <Autocomplete
          onLoad={onEndLoad}
          onPlaceChanged={onEndPlaceChanged}
        >
          <SearchInput
            type="text"
            placeholder="Enter destination"
            value={endInputValue}
            onChange={(e) => setEndInputValue(e.target.value)}
          />
        </Autocomplete>
        
        <CalculateButton 
          onClick={calculateEmissions}
          disabled={!startLocation || !endLocation || isCalculating}
        >
          {isCalculating ? (
            <>
              <LoadingSpinner />
              Calculating Routes & Emissions...
            </>
          ) : (
            'Calculate Travel Times & Emissions'
          )}
        </CalculateButton>
        
        {routeError && (
          <ErrorMessage>
            ⚠️ {routeError}
          </ErrorMessage>
        )}
      </LocationSearchContainer>

      <ResultsContainer>
        <SectionHeader>
          <SectionIcon>📊</SectionIcon>
          <SectionTitle>Emission Analysis</SectionTitle>
        </SectionHeader>
        
        {isCalculated ? (
          <>
            <RouteInfo>
              <DistanceText>
                📍 {startLocation?.address} → 🎯 {endLocation?.address}
              </DistanceText>
              <div style={{ 
                marginTop: '0.75rem', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '2rem',
                color: '#4A5568',
                fontSize: '0.95rem'
              }}>
                <div><strong>Distance:</strong> {distance} km</div>
                <div><strong>Duration:</strong> {duration}</div>
              </div>
            </RouteInfo>

            <ResultsGrid>
              {travelModes.map((mode) => {
                const emission = getEmissionData(mode.mode);
                const travelTime = travelTimes[mode.mode];
                
                return (
                  <ResultCard key={mode.mode}>
                    <ResultIcon>{mode.icon}</ResultIcon>
                    <ResultTitle>{mode.title}</ResultTitle>
                    <ResultEmission color={emission.color}>
                      {emission.value} CO₂
                    </ResultEmission>
                    <div style={{ fontSize: '0.85rem', color: emission.color, fontWeight: '600' }}>
                      {emission.rating}
                    </div>
                    {travelTime && (
                      <div style={{ 
                        fontSize: '0.9rem', 
                        color: '#2D3748', 
                        fontWeight: '600',
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        background: '#EDF2F7',
                        borderRadius: '0.25rem'
                      }}>
                        🕐 {travelTime}
                      </div>
                    )}
                    {emission.rawValue && emission.rawValue > 0 && (
                      <EmissionDetails>
                        <div>📊 {emission.perKm?.toFixed(3)} kg CO₂/km</div>
                        {mode.mode === 'TRANSIT' ? (
                          <div>👥 Per passenger basis</div>
                        ) : (
                          <div>⛽ {emission.fuelConsumed?.toFixed(1)}L fuel</div>
                        )}
                        {emission.comparison && emission.comparison.vsAverage < 0 && (
                          <ComparisonBadge isPositive={true}>
                            {Math.abs(emission.comparison.vsAverage).toFixed(0)}% less than car
                          </ComparisonBadge>
                        )}
                        {emission.comparison && emission.comparison.vsAverage > 0 && (
                          <ComparisonBadge isPositive={false}>
                            {emission.comparison.vsAverage.toFixed(0)}% more than car
                          </ComparisonBadge>
                        )}
                        {emission.comparison && emission.comparison.vsAverage === 0 && (
                          <ComparisonBadge isPositive={false}>
                            Average car emissions
                          </ComparisonBadge>
                        )}
                      </EmissionDetails>
                    )}
                    <ResultDescription style={{ marginTop: '0.75rem' }}>
                      {mode.description}
                    </ResultDescription>
                  </ResultCard>
                );
              })}
            </ResultsGrid>
          </>
        ) : (
          <>
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#4A5568',
              fontSize: '1.1rem'
            }}>
              Enter your route details and click "Calculate" to see carbon emissions for all transport modes
            </div>

            <ResultsGrid>
              {travelModes.map((mode) => (
                <ResultCard key={mode.mode} style={{ opacity: 0.6 }}>
                  <ResultIcon>{mode.icon}</ResultIcon>
                  <ResultTitle>{mode.title}</ResultTitle>
                  <ResultEmission color="#A0AEC0">
                    -- kg CO₂
                  </ResultEmission>
                  <div style={{ fontSize: '0.85rem', color: '#A0AEC0', fontWeight: '600' }}>
                    Awaiting calculation
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#A0AEC0', 
                    fontWeight: '600',
                    marginTop: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: '#F7FAFC',
                    borderRadius: '0.25rem'
                  }}>
                    🕐 -- min
                  </div>
                  <ResultDescription style={{ marginTop: '0.75rem' }}>
                    {mode.description}
                  </ResultDescription>
                </ResultCard>
              ))}
            </ResultsGrid>
          </>
        )}
      </ResultsContainer>
        </ContentArea>

        <Sidebar>
          <SectionHeader style={{ padding: '0', marginBottom: '1rem' }}>
            <SectionIcon>🅿️</SectionIcon>
            <div>
              <SectionTitle style={{ fontSize: '1.2rem' }}>Smart Parking</SectionTitle>
              <div style={{ fontSize: '0.8rem', color: '#4A5568', marginTop: '0.25rem' }}>
                Near Public Transit
              </div>
            </div>
          </SectionHeader>
                    <div style={{ 
            fontSize: '0.85rem', 
            color: '#4A5568', 
            marginBottom: '1rem',
            lineHeight: '1.4'
          }}>
            Park within 250m of public transport for eco-friendly choices
          </div>
          
          {isLoadingParking ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#4A5568'
            }}>
              <LoadingSpinner />
              Finding parking near destination...
            </div>
          ) : parkingRecommendations.length > 0 ? (
            <>
              {parkingRecommendations.slice(0, 3).map((spot) => (
                <ParkingSpotCard key={spot.id}>
                  <ParkingHeader>
                    <ParkingName>{spot.name}</ParkingName>
                    <MapsIcon 
                      onClick={(e) => {
                        e.stopPropagation();
                        openInMaps(spot.lat, spot.lng, spot.name);
                      }}
                      title="Open in Map"
                    >
                      Open in Map
                    </MapsIcon>
                  </ParkingHeader>
                  
                  <ParkingInfo>
                    <InfoRow>
                      <span>📍</span>
                      <span>{formatDistance(spot.distanceFromDestination)} from destination</span>
                    </InfoRow>
                    
                    <InfoRow>
                      <span>🚶</span>
                      <span>{formatWalkTime(spot.walkToNearestTransit)} to transit</span>
                    </InfoRow>
                    
                    <InfoRow>
                      <span>🚌</span>
                      <span>
                        {spot.nearbyStops.length > 0 
                          ? spot.nearbyStops.map(s => s.transport_type).filter((type, index, arr) => arr.indexOf(type) === index).join(', ')
                          : 'No nearby transit'}
                      </span>
                    </InfoRow>
                    
                    <InfoRow>
                      <span>🅿️</span>
                      <span>{spot.availableSpots || 0} spots available</span>
                    </InfoRow>
                    
                    {spot.restrictionDays && spot.restrictionStart && spot.restrictionEnd && (
                      <InfoRow>
                        <span>🕐</span>
                        <span>{spot.restrictionDays} {spot.restrictionStart.slice(0,5)}-{spot.restrictionEnd.slice(0,5)}</span>
                      </InfoRow>
                    )}
                
                    
                    <InfoRow>
                      <ParkingPrice>{spot.price}</ParkingPrice>
                      {spot.nearbyStops.length > 0 && spot.walkToNearestTransit <= 250 ? (
                        <GreenBadge>
                          🌱 Eco-Friendly
                        </GreenBadge>
                      ) : spot.nearbyStops.length > 0 && spot.walkToNearestTransit <= 500 ? (
                        <YellowBadge>
                          ⚠️ Near Transit
                        </YellowBadge>
                      ) : (
                        <RedBadge>
                          🚶 No Nearby Transit
                        </RedBadge>
                      )}
                    </InfoRow>
                  </ParkingInfo>
                </ParkingSpotCard>
              ))}
              
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#4A5568', 
                textAlign: 'center',
                marginTop: '1rem',
                fontStyle: 'italic'
              }}>
                {parkingRecommendations.filter(p => p.nearbyStops.length > 0 && p.walkToNearestTransit <= 250).length} eco-friendly spots with nearby transit
              </div>
            </>
          ) : endLocation ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '1.5rem 0',
              color: '#4A5568',
              fontSize: '0.9rem'
            }}>
              No parking data available for this destination
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '1.5rem 0',
              color: '#4A5568',
              fontSize: '0.9rem'
            }}>
              Enter a destination to see parking recommendations
          </div>
          )}
        </Sidebar>
      </MainContent>

      <TipsSection>
        <SectionHeader>
          <SectionIcon>💡</SectionIcon>
          <SectionTitle>Smart Parking Tips</SectionTitle>
        </SectionHeader>
        
        <TipsList>
          <TipItem>
            <strong>Look for Green Labels:</strong> Choose parking spots marked as "Eco-Friendly" - they're within 250m of public transport.
          </TipItem>
          <TipItem>
            <strong>Check Transit Options:</strong> Our system shows which trains, trams, and buses are near each parking spot to help plan your journey.
          </TipItem>
          <TipItem>
            <strong>Real-Time Availability:</strong> Use live parking data to see exactly how many spots are available before you arrive.
          </TipItem>
          <TipItem>
            <strong>Time Restrictions:</strong> Check parking time limits and restriction hours to avoid fines and plan your stay accordingly.
          </TipItem>
          <TipItem>
            <strong>Multimodal Journey:</strong> Park once and use Melbourne's extensive tram, train, and bus network for the rest of your journey.
          </TipItem>
        </TipsList>
      </TipsSection>

      <InfoSection style={{ marginTop: '3rem' }}>
        <InfoCard>
          <InfoIcon>📈</InfoIcon>
          <InfoTitle>Your Impact Matters</InfoTitle>
          <InfoText>
            If every Melbourne commuter reduced their emissions by just 10%, we could save 
            over 500,000 tonnes of CO₂ annually - equivalent to planting 2 million trees.
          </InfoText>
        </InfoCard>
                
        <InfoCard>
          <InfoIcon>🔄</InfoIcon>
          <InfoTitle>Real-Time Updates</InfoTitle>
          <InfoText>
            Our system updates every 10 minutes with the latest parking data to give you the most accurate information.
          </InfoText>
        </InfoCard>
      </InfoSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default EnvironmentalImpact;