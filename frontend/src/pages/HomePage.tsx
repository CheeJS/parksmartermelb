import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { Chart } from 'chart.js';
import '../styles/Map.css';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.parksmartermelb.me';

const MapControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  background-color: white;
  color: #4A5568;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #2C5282;
  }
`;

const FilterButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#48BB78' : '#E2E8F0'};
  border-radius: 0.5rem;
  background-color: ${props => props.active ? '#F0FFF4' : 'white'};
  color: ${props => props.active ? '#2F855A' : '#4A5568'};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? '#F0FFF4' : '#F7FAFC'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatLabel = styled.div`
  color: #4A5568;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  color: #2C5282;
  font-size: 1.5rem;
  font-weight: 600;
`;

const HomeContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
`;

const Hero = styled.section`
  background: linear-gradient(135deg, #2C5282 0%, #48BB78 100%);
  color: white;
  padding: 6rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('/KrustyPeakLogo.png') no-repeat center;
    background-size: 200px;
    opacity: 0.1;
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.4rem;
  max-width: 800px;
  margin: 0 auto 2rem;
  opacity: 0.95;
  line-height: 1.6;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const HeroLogo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
`;

const ContentSection = styled.section`
  padding: 2rem 0;
  background: white;
`;

const MapSection = styled.div`
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  margin-bottom: 2rem;
  height: 650px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #E2E8F0;
  
  #map {
    border-radius: 1rem;
    overflow: hidden;
  }
`;

const MapContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const MapWrapper = styled.div`
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #E2E8F0;
`;

const MapSidebar = styled.div`
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #E2E8F0;
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 1rem;
`;

const FeatureCard = styled(Link)`
  background-color: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const FeatureTitle = styled.h3`
  color: #2C5282;
  margin-bottom: 1rem;
  font-size: 1.25rem;
`;

const FeatureDescription = styled.p`
  color: #4A5568;
  line-height: 1.5;
`;

const DataInfo = styled.div`
  background: #F0FFF4;
  border: 1px solid #C6F6D5;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: center;
  color: #2F855A;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const RefreshButton = styled.button`
  background: #48BB78;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #38A169;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TransportBreakdown = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TransportTitle = styled.h3`
  color: #2C5282;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  text-align: center;
`;

const TransportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const TransportItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: #F7FAFC;
  border-radius: 0.5rem;
  border: 2px solid #E2E8F0;
`;

const TransportType = styled.div`
  font-weight: 600;
  color: #2C5282;
  margin-bottom: 0.5rem;
  text-transform: capitalize;
`;

const TransportCount = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #48BB78;
`;

// Smart Parking Search Components
const SearchSection = styled.section`
  background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%);
  padding: 3rem 0;
`;

const SearchContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 3rem;
  align-items: start;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const SearchMain = styled.div`
  background: white;
  border-radius: 1.5rem;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #E2E8F0;
`;

const SearchTitle = styled.h2`
  color: #2D3748;
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
`;

const SearchSubtitle = styled.p`
  color: #4A5568;
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const SearchForm = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 1rem 1.5rem;
  border: 2px solid #E2E8F0;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2C5282;
    box-shadow: 0 0 0 3px rgba(44, 82, 130, 0.1);
  }

  &::placeholder {
    color: #A0AEC0;
  }
`;

const SearchButton = styled.button`
  background: linear-gradient(135deg, #2C5282 0%, #48BB78 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: fit-content;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(44, 82, 130, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ParkingResults = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const ParkingCard = styled.div`
  background: #F8F9FA;
  border: 1px solid #E2E8F0;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ParkingHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ParkingName = styled.h3`
  color: #2D3748;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
  margin: 0;
`;

const AvailabilityBadge = styled.span<{ available: boolean }>`
  background: ${props => props.available ? '#C6F6D5' : '#FEB2B2'};
  color: ${props => props.available ? '#2F855A' : '#C53030'};
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ParkingInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  font-size: 0.9rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4A5568;

  span:first-child {
    font-size: 1rem;
  }
`;

// Sidebar Components
const Sidebar = styled.div`
  background: white;
  border-radius: 1.5rem;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid #E2E8F0;
  height: fit-content;
  position: sticky;
  top: 2rem;
`;

const SidebarTitle = styled.h3`
  color: #2D3748;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SidebarSubtitle = styled.p`
  color: #4A5568;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.4;
`;

const TopSpotCard = styled.div`
  background: linear-gradient(135deg, #F0FFF4 0%, #C6F6D5 100%);
  border: 1px solid #9AE6B4;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
`;

const SpotCard = styled.div`
  background: #F8F9FA;
  border: 1px solid #E2E8F0;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SpotName = styled.div`
  color: #2D3748;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
`;

const SpotDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #4A5568;
`;

const HighlightBadge = styled.span`
  background: linear-gradient(135deg, #2C5282 0%, #48BB78 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
`;

interface HomeStats {
  totalAvailableSpots: number;
  totalLocations: number;
  locationsWithSpots: number;
  totalTransportStops: number;
  transportTypes: Array<{transport_type: string, count: number}>;
  lastUpdated: string;
}

interface SimpleParkingSpot {
  id: string;
  name: string;
  availableSpots: number;
  distanceFromDestination: number;
  restrictionDays?: string;
  restrictionStart?: string;
  restrictionEnd?: string;
  price?: string;
  latitude: string;
  longitude: string
}

interface TopParkingSpot {
  id: string;
  name: string;
  availableSpots: number;
  totalSpots: number;
  price?: string;
  longitude: number,
  latitude: number
}

interface Parking {
  RoadSegmentDescription:string,
  available_parks:number,
  Location:string,
  Restriction_Days:string,
  Restriction_Start:string,
  Restriction_End:string,
  Restriction_Display:string,
  Latitude:number,
  Longitude:number
}

interface LiveParking {
  status_timestamp:string,
  status_description:string,
  latitude:number,
  longitude:number
}

interface Occupancy {
  RoadSegmentDescription: string,
  [time: string]: number | string; 
}

const HomePage = () => {
  const [showEcoSpots, setShowEcoSpots] = useState(false);
  const [showAccessible, setShowAccessible] = useState(false);
  const [homeStats, setHomeStats] = useState<HomeStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Parking search state
  const [destinationLocation, setDestinationLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [parkingResults, setParkingResults] = useState<SimpleParkingSpot[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [topParkingSpots, setTopParkingSpots] = useState<TopParkingSpot[]>([]);
  const [destinationInputValue, setDestinationInputValue] = useState('');
  const [lastSearchUpdate, setLastSearchUpdate] = useState<Date | null>(null);
  
  // Add state for last map update and loading state
  const [lastMapUpdate, setLastMapUpdate] = useState<Date | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(false);

  // Google Maps setup
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  // Function to load map data (declared early to avoid hoisting issues)
  const loadMapData = useCallback(async () => {
    console.log('🔄 Loading map data...');
    setIsMapLoading(true);
    
    const mapContainer = document.getElementById('map');
    
    if (!mapContainer || !(mapContainer as any).leafletMap) {
      console.log('❌ Map not initialized yet');
      setIsMapLoading(false);
      return;
    }

    const L = (window as any).L;
    const overviewLayer = (mapContainer as any).overviewLayer;
    const detailLayer = (mapContainer as any).detailLayer;

    if (!overviewLayer || !detailLayer) {
      console.log('❌ Map layers not initialized yet');
      setIsMapLoading(false);
      return;
    }

    try {
      // Clear existing layers
      overviewLayer.clearLayers();
      detailLayer.clearLayers();

      // Fetch fresh data
      const [parkingResponse, occupancyResponse, liveResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/parking`),
        fetch(`${API_BASE_URL}/api/occupancy`),
        fetch(`${API_BASE_URL}/api/live`)
      ]);

      const [parkingData, occupancyData, liveData] = await Promise.all([
        parkingResponse.json(),
        occupancyResponse.json(),
        liveResponse.json()
      ]);

      const parkingArray: Parking[] = parkingData.data;
      const occupancyArray: Occupancy[] = occupancyData.data;
      const liveArray: LiveParking[] = liveData.data;

      // Create a lookup map for occupancy
      const occupancyMap = new Map<string, Occupancy>();
      occupancyArray.forEach(o => occupancyMap.set(o.RoadSegmentDescription, o));

      // Add parking overview data
      parkingArray.forEach((p, index) => {
        const occupancy = occupancyMap.get(p.RoadSegmentDescription);

        const circle = L.circle([p.Latitude, p.Longitude], {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.3,
          radius: 15,
        }).addTo(overviewLayer);

        const canvasId = `popupChart-${index}-${Date.now()}`;

        const occupancyChartHTML = occupancy
          ? `<canvas id="${canvasId}" width="500" height="250" style="display: block; margin: 0 auto;"></canvas>`
          : '<div>No occupancy data available</div>';

        const popupContent = `
          ${occupancy? `<div style="width: 500px; height: 350px;">` : `<div style="width: 250px; height: 100px;">`}
            <h4>${p.RoadSegmentDescription}</h4>
            <div><strong>Available Parks:</strong> ${p.available_parks}</div>
            <div><strong>Restriction:</strong> ${p.Restriction_Days} ${p.Restriction_Start} - ${p.Restriction_End}</div>
            ${occupancyChartHTML}
          </div>
        `;

        circle.bindPopup(popupContent, {maxWidth: 500, minWidth: 200});

        // Draw chart if occupancy data exists
        circle.on('popupopen', () => {
          if (!occupancy) return;

          const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const labels = Object.keys(occupancy).filter(k => k !== 'RoadSegmentDescription');
          const dataPoints = labels.map(label => Number((occupancy[label] as string).replace('%', '')) / 100);

          new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [{
                label: 'Occupancy',
                data: dataPoints,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
              }]
            },
            options: {
              responsive: false,
              animation: false,
              scales: {
                x: {
                  ticks: {
                    minRotation: 90,
                    maxRotation: 90,
                    autoSkip: true,
                    maxTicksLimit: 12
                  }
                },
                y: {
                  beginAtZero: true
                }
              },
              plugins: {
                legend: { display: false }
              }
            }
          });
        });
      });

      // Add live parking detail data
      liveArray.forEach((parking: LiveParking) => {
        const point = L.circle([parking.latitude, parking.longitude], {
          radius: 1,
          color: parking.status_description === "Present" ? "green" : "red",
          fillOpacity: 0.8
        }).addTo(detailLayer);

        point.on('click', () => {
          L.popup()
            .setLatLng([parking.latitude, parking.longitude])
            .setContent(
              `<div>
                <strong>Last updated:</strong> ${parking.status_timestamp}<br>
              </div>`
            )
            .openOn((mapContainer as any).leafletMap);
        });
      });

      setLastMapUpdate(new Date());
      console.log('✅ Map data refreshed successfully');

    } catch (error) {
      console.error('❌ Error loading map data:', error);
    } finally {
      setIsMapLoading(false);
    }
  }, []);

  // Simplified parking search function (declared early)
  const searchParkingForLocation = useCallback(async (location: {lat: number, lng: number, address: string}) => {
    console.log('🔍 Searching parking for:', location.address, 'at coordinates:', location.lat, location.lng);
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const requestBody = {
        destinationLat: location.lat,
        destinationLng: location.lng,
        radius: 1 // 1km radius
      };
      
      console.log('📤 Sending parking search request to:', `${API_BASE_URL}/api/simple-parking-search`);
      
      const response = await fetch(`${API_BASE_URL}/api/simple-parking-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📥 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Found', result.data?.length || 0, 'parking spots');
        setParkingResults(result.data || []);
        setLastSearchUpdate(new Date());
      } else {
        const errorText = await response.text();
        console.error('❌ API error:', response.status, errorText);
        setParkingResults([]);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setParkingResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any state

  // Master refresh function to update all data
  const refreshAllData = useCallback(async () => {
    console.log('🔄 Refreshing all data...');
    
    // Refresh home stats
    try {
      const response = await fetch(`${API_BASE_URL}/api/home-stats`);
      if (response.ok) {
        const result = await response.json();
        setHomeStats(result.data);
      }
    } catch (error) {
      console.error('Error refreshing home stats:', error);
    }
    
    // Refresh top parking spots
    try {
      const response = await fetch(`${API_BASE_URL}/api/top-parking`);
      if (response.ok) {
        const result = await response.json();
        setTopParkingSpots(result.data);
      }
    } catch (error) {
      console.error('Error refreshing top parking spots:', error);
    }
    
    // Refresh map data
    await loadMapData();
    
    // Refresh search results if user has searched
    if (destinationLocation && hasSearched) {
      await searchParkingForLocation(destinationLocation);
    }
    
    console.log('✅ All data refreshed successfully');
  }, [destinationLocation, hasSearched, loadMapData, searchParkingForLocation]);

  // Initial data load and setup master refresh interval
  useEffect(() => {
    const loadInitialData = async () => {
      // Load initial stats
      try {
        const response = await fetch(`${API_BASE_URL}/api/home-stats`);
        if (response.ok) {
          const result = await response.json();
          setHomeStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching initial home stats:', error);
      } finally {
        setIsLoadingStats(false);
      }

      // Load initial top parking spots
      try {
        const response = await fetch(`${API_BASE_URL}/api/top-parking`);
        if (response.ok) {
          const result = await response.json();
          setTopParkingSpots(result.data);
        }
      } catch (error) {
        console.error('Error fetching initial top parking spots:', error);
      }
    };
    
    // Load initial data
    loadInitialData();
    
    // Set up single master refresh interval for all data
    const masterInterval = setInterval(() => {
      console.log('🕐 Master refresh timer triggered');
      refreshAllData();
    }, 10 * 60 * 1000);
    
    return () => clearInterval(masterInterval);
  }, [refreshAllData]);

  // Autocomplete callbacks
  const onDestinationLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    setDestinationAutocomplete(autocomplete);
  }, []);

  const onDestinationPlaceChanged = () => {
    if (destinationAutocomplete) {
      const place = destinationAutocomplete.getPlace();
      console.log('📍 Destination selected:', place);
      if (place.geometry?.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || place.name || ''
        };
        console.log('✅ Destination set:', newLocation);
        setDestinationLocation(newLocation);
        setDestinationInputValue(newLocation.address);
        
        // Automatically search for parking when destination is selected
        searchParkingForLocation(newLocation);
      } else {
        console.log('❌ No geometry/location found in place');
      }
    } else {
      console.log('❌ No destination autocomplete available');
    }
  };

  // Handle manual parking search (button click)
  const handleParkingSearch = async () => {
    if (!destinationLocation) {
      console.log('❌ No destination selected');
      return;
    }
    
    await searchParkingForLocation(destinationLocation);
  };

  // Initialize map once
  useEffect(() => {
    const mapContainer = document.getElementById('map');

    // Check if the map is already initialized
    if (mapContainer && !(mapContainer as any)._leaflet_id) {
      const L = (window as any).L;

      // Default fallback location
      const defaultLatLng = [-37.8136, 144.9631];

      // Initialize map
      const map = L.map('map').setView(defaultLatLng, 13);

      // Store map instance for later access
      (mapContainer as any).leafletMap = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      // Try to get user geolocation
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            map.setView([lat, lng], 15);
            L.marker([lat, lng]).addTo(map).bindPopup('You are here').openPopup();
          },
          (error) => {
            console.error('Geolocation error:', error);
          }
        );
      }

      // Initialize layer groups
      const overviewLayer = L.layerGroup().addTo(map);
      const detailLayer = L.layerGroup();

      // Store layer references for updating
      (mapContainer as any).overviewLayer = overviewLayer;
      (mapContainer as any).detailLayer = detailLayer;
      (mapContainer as any).currentMode = 'overview';

      // Add mode control
      let ModeControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function(map:any) {
          let container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
          container.innerHTML = 'Overview';

          // Prevent click from affecting the map
          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.disableScrollPropagation(container);

          container.onclick = function() {
            const mapContainer = document.getElementById('map');
            const currentMode = (mapContainer as any).currentMode;
            const overviewLayer = (mapContainer as any).overviewLayer;
            const detailLayer = (mapContainer as any).detailLayer;

            if (currentMode === 'overview') {
              map.removeLayer(overviewLayer);
              map.addLayer(detailLayer);
              (mapContainer as any).currentMode = 'detail';
              container.innerHTML = 'Detail';
            } else {
              map.removeLayer(detailLayer);
              map.addLayer(overviewLayer);
              (mapContainer as any).currentMode = 'overview';
              container.innerHTML = 'Overview';
            }
          };

          return container;
        }
      });
      
      map.addControl(new ModeControl());
    }
  }, []);

  // Format distance helper function
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <HomeContainer>
      <Hero>
        <Container>
          <LogoContainer>
            <HeroLogo src="/KrustyPeakLogo.png" alt="Krusty Peak Logo" />
          </LogoContainer>
          <HeroTitle>Smart Parking for Melbourne</HeroTitle>
          <HeroSubtitle>
            Real-time parking data from Melbourne's street parking network. Find available spots, check time restrictions, and discover nearby public transport connections.
          </HeroSubtitle>
        </Container>
      </Hero>

      <SearchSection>
        <Container>
          <SearchMain>
            <SearchTitle>🔍 Find Parking Near Your Destination</SearchTitle>
            <SearchSubtitle>
              Enter your destination to find available parking spots with real-time data from Melbourne's parking network.
            </SearchSubtitle>
            
            <SearchForm>
              {isLoaded ? (
                <Autocomplete
                  onLoad={onDestinationLoad}
                  onPlaceChanged={onDestinationPlaceChanged}
                >
                  <SearchInput
                    type="text"
                    placeholder="Enter destination address..."
                    value={destinationInputValue}
                    onChange={(e) => setDestinationInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleParkingSearch()}
                  />
                </Autocomplete>
              ) : (
                <SearchInput
                  type="text"
                  placeholder="Loading Google Places..."
                  disabled
                />
              )}
              <SearchButton 
                onClick={handleParkingSearch}
                disabled={isSearching || !destinationLocation || !isLoaded}
              >
                {isSearching ? 'Searching...' : 'Find Parking'}
              </SearchButton>
            </SearchForm>
            {hasSearched && (
              <>
                {lastSearchUpdate && (
                  <div style={{
                    textAlign: 'center',
                    color: '#4A5568',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    padding: '0.5rem',
                    backgroundColor: '#F7FAFC',
                    borderRadius: '0.5rem'
                  }}>
                    🔄 Search results last updated: {lastSearchUpdate.toLocaleTimeString()}
                  </div>
                )}
                <ParkingResults>
                {parkingResults.length > 0 ? (
                  parkingResults.slice(0, 5).map((spot) => (
                    <ParkingCard key={spot.id} onClick={()=>{
                        const mapContainer = document.getElementById('map');
                        window.scrollTo({top:1600, behavior:'smooth'})
                        const map = (mapContainer as any).leafletMap;
                        map.setView([parseFloat(spot.latitude),parseFloat(spot.longitude)], 17)
                    }}>
                      <ParkingHeader>
                        <ParkingName>{spot.name}</ParkingName>
                        <AvailabilityBadge available={spot.availableSpots > 0}>
                          {spot.availableSpots > 0 ? 'Available' : 'Not Available'}
                        </AvailabilityBadge>
                      </ParkingHeader>
                      <ParkingInfo>
                        <InfoItem>
                          <span>📍</span>
                          <span>{formatDistance(spot.distanceFromDestination)} away</span>
                        </InfoItem>
                        <InfoItem>
                          <span>🅿️</span>
                          <span>{spot.availableSpots} spots</span>
                        </InfoItem>
                        {spot.restrictionDays && spot.restrictionStart && spot.restrictionEnd && (
                          <InfoItem>
                            <span>🕐</span>
                            <span>{spot.restrictionDays} {spot.restrictionStart.slice(0,5)}-{spot.restrictionEnd.slice(0,5)}</span>
                          </InfoItem>
                        )}
                        {spot.price && (
                          <InfoItem>
                            <span>💰</span>
                            <span>{spot.price}</span>
                          </InfoItem>
                        )}
                      </ParkingInfo>
                    </ParkingCard>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem',
                    color: '#4A5568',
                    fontSize: '1.1rem'
                  }}>
                    {isSearching ? 'Searching for parking...' : 'No parking found near this destination. Try a different location.'}
                  </div>
                )}
              </ParkingResults>
              </>
            )}
          </SearchMain>
        </Container>
      </SearchSection>

      <ContentSection>
        <Container>
          <MapContainer>
            <MapWrapper>
              <div id="map" style={{ height: '700px', width: '100%', borderRadius: '1rem' }}></div>
            </MapWrapper>
            <MapSidebar>
              <SidebarTitle>
                🏆 Highest Availability
              </SidebarTitle>
              <SidebarSubtitle>
                Melbourne parking spots with the most available spaces right now
              </SidebarSubtitle>

              {topParkingSpots.length > 0 ? (
                <>
                  <TopSpotCard onClick={()=>{
                        const mapContainer = document.getElementById('map');
                        window.scrollTo({top:950, behavior:'smooth'})
                        const map = (mapContainer as any).leafletMap;
                        map.setView([topParkingSpots[0].latitude,topParkingSpots[0].longitude], 17)
                    }}>
                    <SpotName>{topParkingSpots[0]?.name}</SpotName>
                    <SpotDetails>
                      <span><strong>{topParkingSpots[0]?.availableSpots}</strong> spots available</span>
                      <HighlightBadge>Highest</HighlightBadge>
                    </SpotDetails>
                  </TopSpotCard>

                  {topParkingSpots.slice(1, 5).map((spot, index) => (
                    <SpotCard key={spot.id} onClick={()=>{
                        const mapContainer = document.getElementById('map');
                        window.scrollTo({top:950, behavior:'smooth'})
                        const map = (mapContainer as any).leafletMap;
                        map.setView([spot.latitude,spot.longitude], 17)
                    }}>
                      <SpotName>{spot.name}</SpotName>
                      <SpotDetails>
                        <span><strong>{spot.availableSpots}</strong> spots available</span>
                        <span>#{index + 2}</span>
                      </SpotDetails>
                    </SpotCard>
                  ))}
                </>
              ) : (
                <div style={{ 
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#4A5568'
                }}>
                  Loading top spots...
                </div>
              )}
            </MapSidebar>
          </MapContainer>
        </Container>
      </ContentSection>

      <ContentSection>
        <Container>
          {!isLoadingStats && (
            <DataInfo>
              <div>
                🔄 Data updated every 10 minutes | 
                {homeStats && ` Stats: ${new Date(homeStats.lastUpdated).toLocaleTimeString()}`}
                {lastMapUpdate && ` | Map: ${lastMapUpdate.toLocaleTimeString()}`}
              </div>
              <RefreshButton 
                onClick={refreshAllData}
                disabled={isMapLoading}
              >
                {isMapLoading ? 'Refreshing...' : 'Refresh All Data'}
              </RefreshButton>
            </DataInfo>
          )}

          <StatsGrid>
            <StatCard>
              <StatLabel>Available Parking Spots</StatLabel>
              <StatValue>
                {isLoadingStats ? '...' : (homeStats?.totalAvailableSpots || 0)}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Total Parking Locations</StatLabel>
              <StatValue>
                {isLoadingStats ? '...' : (homeStats?.totalLocations || 0)}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Public Transport Stops</StatLabel>
              <StatValue>
                {isLoadingStats ? '...' : (homeStats?.totalTransportStops || 0)}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Locations with Available Spots</StatLabel>
              <StatValue>
                {isLoadingStats ? '...' : (homeStats?.locationsWithSpots || 0)}
              </StatValue>
            </StatCard>
          </StatsGrid>

          {!isLoadingStats && homeStats?.transportTypes && homeStats.transportTypes.length > 0 && (
            <TransportBreakdown>
              <TransportTitle>🚌 Public Transport Network</TransportTitle>
              <TransportGrid>
                {homeStats.transportTypes.map(transport => (
                  <TransportItem key={transport.transport_type}>
                    <TransportType>{transport.transport_type}</TransportType>
                    <TransportCount>{transport.count}</TransportCount>
                  </TransportItem>
                ))}
              </TransportGrid>
            </TransportBreakdown>
          )}
        </Container>
      </ContentSection>

      <ContentSection>
        <Container>
          <FeaturesGrid>
        <FeatureCard to="/">
          <FeatureTitle>
            <span role="img" aria-label="parking">🅿️</span> Live Parking Data
          </FeatureTitle>
          <FeatureDescription>
            Interactive map showing real-time parking availability from Melbourne's street parking sensors, updated every 10 minutes
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard to="/">
          <FeatureTitle>
            <span role="img" aria-label="leaf">🌱</span> Smart Parking Recommendations
          </FeatureTitle>
          <FeatureDescription>
            Find parking within 250m of public transport. Calculate carbon emissions and get eco-friendly suggestions based on your destination
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard to="/trends">
          <FeatureTitle>
            <span role="img" aria-label="chart">📊</span> Historical Trends
          </FeatureTitle>
          <FeatureDescription>
            Analyze parking patterns over time to understand peak hours, seasonal trends, and make better travel planning decisions
          </FeatureDescription>
        </FeatureCard>
          </FeaturesGrid>
        </Container>
      </ContentSection>
    </HomeContainer>
  );
};

export default HomePage;