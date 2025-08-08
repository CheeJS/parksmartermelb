import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { calculateRoute } from '../services/routesService';

  type TravelMode = 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER' | 'TRANSIT';



interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface ParkingSpot {
  id: string;
  name: string;
  type: 'Street Parking' | 'Shopping Center' | 'Transit Hub' | 'EV Charging' | 'Bike Parking';
  available: boolean;
  availableSpots?: number;
  totalSpots?: number;
  price: string;
  walkToTransit: string;
  nearbyTransit: string[];
  isEcoFriendly: boolean;
  distance: string;
}



const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  color: #2C5282;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: #4A5568;
  font-size: 1.1rem;
  line-height: 1.5;
`;

const CardTitle = styled.h3`
  color: #2D3748;
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const LocationSearchContainer = styled.div`
  margin-bottom: 2rem;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
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

const ResultEmission = styled.div<{ isZero: boolean }>`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.isZero ? '#48BB78' : '#E53E3E'};
  margin-bottom: 0.5rem;
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

const SidebarTitle = styled.h3`
  color: #2D3748;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const AvailabilityBadge = styled.span<{ available: boolean }>`
  background: ${props => props.available ? '#C6F6D5' : '#FED7D7'};
  color: ${props => props.available ? '#2F855A' : '#C53030'};
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
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
  const [routeError, setRouteError] = useState<string>('');

  // Travel mode options with descriptions
  const travelModes = [
    {
      mode: 'DRIVE' as TravelMode,
      title: 'Drive',
      icon: '🚗',
      description: 'Travel by passenger car'
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
    },
    {
      mode: 'TWO_WHEELER' as TravelMode,
      title: 'Motorcycle',
      icon: '🏍️',
      description: 'Two-wheeled, motorized vehicle. For example, motorcycle'
    },
    {
      mode: 'TRANSIT' as TravelMode,
      title: 'Public Transit',
      icon: '🚌',
      description: 'Travel by public transit routes, where available'
    }
  ];

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

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
        setStartLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || ''
        });
      }
    }
  };

  const onEndPlaceChanged = () => {
    if (endAutocomplete) {
      const place = endAutocomplete.getPlace();
      if (place.geometry?.location) {
        setEndLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || ''
        });
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
          
          setStartLocation({
            lat,
            lng,
            address
          });
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
      const result = await calculateRoute(
        startLocation,
        endLocation,
        'DRIVE' // Default to driving for distance calculation
      );

      if (result.success && result.distance && result.duration) {
        setDistance(result.distance.kilometers);
        setDuration(result.duration.text);
        setIsCalculated(true);
      } else {
        setRouteError(result.error || 'Failed to calculate route');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setRouteError('Network error occurred while calculating route');
    } finally {
      setIsCalculating(false);
    }
  };

  const getEmissionData = (mode: TravelMode) => {
    if (!distance) return '0';
    const distanceKm = parseFloat(distance);
    
    // Carbon emission factors (kg CO2 per km)
    const emissionFactors = {
      DRIVE: 0.21, // Average car
      TWO_WHEELER: 0.13, // Motorcycle
      TRANSIT: 0.06, // Public transport
      BICYCLE: 0, // Zero emissions
      WALK: 0 // Zero emissions
    };

    return (distanceKm * emissionFactors[mode]).toFixed(2);
  };

  // Mock parking data - prioritizes eco-friendly spots near public transport
  const getParkingRecommendations = (): ParkingSpot[] => {
    return [
      {
        id: '1',
        name: 'Flinders Street Station Parking',
        type: 'Transit Hub' as const,
        available: true,
        availableSpots: 23,
        totalSpots: 150,
        price: '$4/hour',
        walkToTransit: '1 min',
        nearbyTransit: ['Tram', 'Train', 'Bus'],
        isEcoFriendly: true,
        distance: '0.8km'
      },
      {
        id: '2',
        name: 'Southern Cross EV Charging',
        type: 'EV Charging' as const,
        available: true,
        availableSpots: 5,
        totalSpots: 12,
        price: '$6/hour + charging',
        walkToTransit: '2 min',
        nearbyTransit: ['Train', 'Bus'],
        isEcoFriendly: true,
        distance: '1.2km'
      },
      {
        id: '3',
        name: 'Collins Street Bike Parking',
        type: 'Bike Parking' as const,
        available: true,
        availableSpots: 15,
        totalSpots: 20,
        price: 'Free',
        walkToTransit: '1 min',
        nearbyTransit: ['Tram'],
        isEcoFriendly: true,
        distance: '0.5km'
      },
      {
        id: '4',
        name: 'Parliament Station P&R',
        type: 'Transit Hub' as const,
        available: true,
        availableSpots: 8,
        totalSpots: 80,
        price: '$3.50/hour',
        walkToTransit: '0 min',
        nearbyTransit: ['Train', 'Tram'],
        isEcoFriendly: true,
        distance: '1.5km'
      },
      {
        id: '5',
        name: 'QV Shopping Center',
        type: 'Shopping Center' as const,
        available: false,
        availableSpots: 0,
        totalSpots: 200,
        price: '$5/hour',
        walkToTransit: '8 min',
        nearbyTransit: ['Tram'],
        isEcoFriendly: false,
        distance: '2.1km'
      }
    ].sort((a, b) => {
      // Sort by eco-friendly first, then by availability, then by walk time
      if (a.isEcoFriendly !== b.isEcoFriendly) return b.isEcoFriendly ? 1 : -1;
      if (a.available !== b.available) return b.available ? 1 : -1;
      return parseInt(a.walkToTransit) - parseInt(b.walkToTransit);
    });
  };



  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <PageContainer>
      <Header>
        <PageTitle>Environmental Impact</PageTitle>
        <Description>
          Compare different transport options and their environmental impact to make sustainable choices
        </Description>
      </Header>

      <MainContent>
        <ContentArea>
      <LocationSearchContainer>
        <CardTitle>Route Details</CardTitle>
        <FlexRow>
          <InputWrapper>
            <Autocomplete
              onLoad={onStartLoad}
              onPlaceChanged={onStartPlaceChanged}
            >
              <SearchInput
                type="text"
                placeholder="Enter starting point"
                defaultValue={startLocation?.address || ''}
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
            defaultValue={endLocation?.address || ''}
          />
        </Autocomplete>
        
        <CalculateButton 
          onClick={calculateEmissions}
          disabled={!startLocation || !endLocation || isCalculating}
        >
          {isCalculating ? (
            <>
              <LoadingSpinner />
              Calculating Route...
            </>
          ) : (
            'Calculate Carbon Emissions'
          )}
        </CalculateButton>
        
        {routeError && (
          <ErrorMessage>
            ⚠️ {routeError}
          </ErrorMessage>
        )}
      </LocationSearchContainer>

      <ResultsContainer>
        <CardTitle>Carbon Emission Results</CardTitle>
        
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
                const isZero = parseFloat(emission) === 0;
                
                return (
                  <ResultCard key={mode.mode}>
                    <ResultIcon>{mode.icon}</ResultIcon>
                    <ResultTitle>{mode.title}</ResultTitle>
                    <ResultEmission isZero={isZero}>
                      {isZero ? '0' : emission} kg CO₂
                    </ResultEmission>
                    <ResultDescription>{mode.description}</ResultDescription>
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
                  <ResultEmission isZero={false}>
                    -- kg CO₂
                  </ResultEmission>
                  <ResultDescription>{mode.description}</ResultDescription>
                </ResultCard>
              ))}
            </ResultsGrid>
          </>
        )}
      </ResultsContainer>
        </ContentArea>

        <Sidebar>
          <SidebarTitle>
            🅿️ Recommended Parking
          </SidebarTitle>
          <div style={{ 
            fontSize: '0.85rem', 
            color: '#4A5568', 
            marginBottom: '1rem',
            lineHeight: '1.4'
          }}>
            Park near public transport for a greener journey
          </div>
          
          {isCalculated ? (
            <>
              {getParkingRecommendations().slice(0, 4).map((spot) => (
                <ParkingSpotCard key={spot.id}>
                  <ParkingHeader>
                    <ParkingName>{spot.name}</ParkingName>
                    <AvailabilityBadge available={spot.available}>
                      {spot.available ? 'Available' : 'Full'}
                    </AvailabilityBadge>
                  </ParkingHeader>
                  
                  <ParkingInfo>
                    <InfoRow>
                      <span>📍</span>
                      <span>{spot.distance} away</span>
                    </InfoRow>
                    
                    <InfoRow>
                      <span>🚶</span>
                      <span>{spot.walkToTransit} walk to transit</span>
                    </InfoRow>
                    
                    <InfoRow>
                      <span>🚌</span>
                      <span>{spot.nearbyTransit.join(', ')}</span>
                    </InfoRow>
                    
                    {spot.availableSpots && spot.totalSpots && (
                      <InfoRow>
                        <span>🅿️</span>
                        <span>{spot.availableSpots}/{spot.totalSpots} spots</span>
                      </InfoRow>
                    )}
                    
                    <InfoRow>
                      <ParkingPrice>{spot.price}</ParkingPrice>
                      {spot.isEcoFriendly && (
                        <GreenBadge>
                          🌱 Eco Choice
                        </GreenBadge>
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
                Updated 2 minutes ago
              </div>
            </>
          ) : (
            <>
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem 0',
                color: '#4A5568',
                fontSize: '0.9rem'
              }}>
                Calculate your route to see recommended parking spots near your destination
          </div>
              
              {getParkingRecommendations().slice(0, 3).map((spot) => (
                <ParkingSpotCard key={spot.id} style={{ opacity: 0.5 }}>
                  <ParkingHeader>
                    <ParkingName>{spot.name}</ParkingName>
                    <AvailabilityBadge available={true}>
                      --
                    </AvailabilityBadge>
                  </ParkingHeader>
                  
                  <ParkingInfo>
                    <InfoRow>
                      <span>📍</span>
                      <span>-- away</span>
                    </InfoRow>
                    
                    <InfoRow>
                      <span>🚶</span>
                      <span>-- walk to transit</span>
                    </InfoRow>
                    
                    <InfoRow>
                      <span>🚌</span>
                      <span>Transit options</span>
                    </InfoRow>
                    
                    <InfoRow>
                      <ParkingPrice>--</ParkingPrice>
                      {spot.isEcoFriendly && (
                        <GreenBadge>
                          🌱 Eco Choice
                        </GreenBadge>
                      )}
                    </InfoRow>
                  </ParkingInfo>
                </ParkingSpotCard>
              ))}
            </>
          )}
        </Sidebar>
      </MainContent>
    </PageContainer>
  );
};

export default EnvironmentalImpact;