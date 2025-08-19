import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Chart } from 'chart.js';
import '../styles/Map.css';
import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import { SecureAutocomplete } from '../components/SecureAutocomplete';
import { PlaceDetails } from '../services/secureGoogleMapsService';

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
  padding: 3rem 0;
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

const ClearHighlightButton = styled.button`
  background: #E53E3E;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #C53030;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
`;

const ParkingName = styled.h3`
  color: #2D3748;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
  margin: 0;
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
  background: #E6FFFA;
  border: 1px solid #9AE6B4;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
`;

const SpotCard = styled.div`
  background: #F8F9FA;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;

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
  gap: 0.5rem;
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
  const [homeStats, setHomeStats] = useState<HomeStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Parking search state
  const [destinationLocation, setDestinationLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [parkingResults, setParkingResults] = useState<SimpleParkingSpot[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [topParkingSpots, setTopParkingSpots] = useState<TopParkingSpot[]>([]);
  const [destinationInputValue, setDestinationInputValue] = useState('');
  const [lastSearchUpdate, setLastSearchUpdate] = useState<Date | null>(null);
  
  // Add state for last map update and loading state
  const [lastMapUpdate, setLastMapUpdate] = useState<Date | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  
  // Add state for highlighted parking spot
  const [highlightedParkingName, setHighlightedParkingName] = useState<string | null>(null);

  // Handle place selection from secure autocomplete
  const handlePlaceSelected = useCallback((place: PlaceDetails) => {
    console.log('📍 Destination selected:', place);
    if (place.geometry?.location) {
      const newLocation = {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        address: place.formatted_address || place.name || ''
      };
      console.log('✅ Destination set:', newLocation);
      setDestinationLocation(newLocation);
      setDestinationInputValue(newLocation.address);
    } else {
      console.log('❌ No geometry/location found in place');
    }
  }, []);

  // Function to load map data (declared early to avoid hoisting issues)
  const loadMapData = useCallback(async () => {
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
      const [parkingResponse, occupancyResponse, liveResponse, offStreetResponse] = await Promise.all([
        fetch(buildApiUrl(API_ENDPOINTS.parking)),
        fetch(buildApiUrl(API_ENDPOINTS.occupancy)),
        fetch(buildApiUrl(API_ENDPOINTS.live)),
        fetch(buildApiUrl(API_ENDPOINTS.offStreet))
      ]);

      const [parkingData, occupancyData, liveData, offStreetData] = await Promise.all([
        parkingResponse.json(),
        occupancyResponse.json(),
        liveResponse.json(),
        offStreetResponse.json()
      ]);

      const parkingArray: Parking[] = parkingData.data;
      const occupancyArray: Occupancy[] = occupancyData.data;
      const liveArray: LiveParking[] = liveData.data;
      const offStreetArray = offStreetData.data;

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
          ${occupancy? `<div style="width: 500px; height: 400px;">` : `<div style="width: 250px; height: 150px;">`}
            <h4>${p.RoadSegmentDescription}</h4>
            <div><strong>Available Parks:</strong> ${p.available_parks}</div>
            <div><strong>Restriction:</strong> ${p.Restriction_Days} ${p.Restriction_Start} - ${p.Restriction_End}</div>
            <div style="margin-top: 10px;">
              <a href="https://www.google.com/maps/search/?api=1&query=${p.Latitude},${p.Longitude}" 
                 target="_blank" 
                 style="display: inline-flex; align-items: center; gap: 5px; background: #2C5282; color: white; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                🗺️ Open in Maps
              </a>
            </div>
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
                <div style="margin-top: 10px;">
                  <a href="https://www.google.com/maps/search/?api=1&query=${parking.latitude},${parking.longitude}" 
                     target="_blank" 
                     style="display: inline-flex; align-items: center; gap: 5px; background: #2C5282; color: white; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                    🗺️ Open in Maps
                  </a>
                </div>
              </div>`
            )
            .openOn((mapContainer as any).leafletMap);
        });
      });

      // Add off-street parking data as red circles
      console.log('🏢 Adding off-street parking locations:', offStreetArray.length);
      offStreetArray.forEach((offStreet: any) => {
        const redCircle = L.circle([offStreet.latitude, offStreet.longitude], {
          color: 'red',
          fillColor: '#ff0000',
          fillOpacity: 0.6,
          radius: 20,
        }).addTo(overviewLayer);

        const popupContent = `
          <div style="width: 300px; max-width: 300px;">
            <h4 style="margin: 0 0 10px 0; color: #C53030;">🏢 Off-Street Parking</h4>
            <div><strong>Address:</strong> ${offStreet.building_address}</div>
            <div style="margin: 10px 0;">
              <strong>Early Bird:</strong> 
              <span style="color: ${offStreet.early_bird && offStreet.early_bird !== 'No early bird offer available' ? '#2F855A' : '#C53030'};">
                ${offStreet.early_bird || 'No early bird offer available'}
              </span>
            </div>
            <div style="margin-top: 15px;">
              <a href="https://www.google.com/maps/search/?api=1&query=${offStreet.latitude},${offStreet.longitude}" 
                 target="_blank" 
                 style="display: inline-flex; align-items: center; gap: 5px; background: #C53030; color: white; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                🗺️ Open in Maps
              </a>
            </div>
          </div>
        `;

        redCircle.bindPopup(popupContent, {maxWidth: 320, minWidth: 300});
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
    
    // Add destination marker to map
    const mapContainer = document.getElementById('map');
    if (mapContainer && (mapContainer as any).leafletMap) {
      const L = (window as any).L;
      const map = (mapContainer as any).leafletMap;
      
      // Remove existing destination marker if it exists
      if ((mapContainer as any).destinationMarker) {
        map.removeLayer((mapContainer as any).destinationMarker);
      }
      
      // Create custom destination marker with better styling
      const destinationIcon = L.divIcon({
        html: `
          <div style="
            background: #2C5282;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              color: white;
              font-size: 12px;
              font-weight: bold;
            ">📍</div>
          </div>
        `,
        className: 'destination-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -15]
      });
      
      // Add destination marker
      const destinationMarker = L.marker([location.lat, location.lng], { 
        icon: destinationIcon,
        zIndexOffset: 1000 // Ensure it appears on top
      }).addTo(map);
      
      // Add popup to destination marker
      destinationMarker.bindPopup(`
        <div style="text-align: center; min-width: 200px;">
          <h4 style="margin: 0 0 10px 0; color: #2C5282;">🎯 Your Destination</h4>
          <div style="margin-bottom: 10px; color: #4A5568; font-weight: 500;">${location.address}</div>
          <div style="margin-top: 15px;">
            <a href="https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}" 
               target="_blank" 
               style="display: inline-flex; align-items: center; gap: 5px; background: linear-gradient(135deg, #2C5282 0%, #48BB78 100%); color: white; padding: 8px 12px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
              🗺️ Open in Maps
            </a>
          </div>
        </div>
      `, {maxWidth: 250});
      
      // Store reference for later removal
      (mapContainer as any).destinationMarker = destinationMarker;
      
      // Center map on destination with appropriate zoom
      map.setView([location.lat, location.lng], 15);
    }
    
    try {
      const requestBody = {
        destinationLat: location.lat,
        destinationLng: location.lng,
        radius: 1 // 1km radius
      };
      
      console.log('📤 Sending parking search request to:', buildApiUrl(API_ENDPOINTS.simpleParkingSearch));
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.simpleParkingSearch), {
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

  // Handle manual parking search (button click)
  const handleParkingSearch = async () => {
    if (!destinationLocation) {
      console.log('❌ No destination selected');
      return;
    }
    
    await searchParkingForLocation(destinationLocation);
  };

  // Function to open location in maps
  const openInMaps = (latitude: string | number, longitude: string | number, name: string) => {
    const lat = parseFloat(latitude.toString());
    const lng = parseFloat(longitude.toString());
    
    // Create a universal maps URL that works across devices
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    
    // Open in new tab/window
    window.open(mapsUrl, '_blank');
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
          
          // Create custom "You are here" marker
          const userLocationIcon = L.divIcon({
            html: `
              <div style="
                background: #48BB78;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  color: white;
                  font-size: 12px;
                  font-weight: bold;
                ">📍</div>
              </div>
            `,
            className: 'user-location-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
            popupAnchor: [0, -15]
          });
          
          L.marker([lat, lng], { icon: userLocationIcon }).addTo(map).bindPopup('You are here').openPopup();
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

      // Add mode control with better styling
      let ModeControl = L.Control.extend({
        options: { position: 'topright' },
        onAdd: function(map:any) {
          let container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom mode-toggle-button');
          container.innerHTML = `
            <div style="
              background: linear-gradient(135deg, #2C5282 0%, #48BB78 100%);
              color: white;
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 600;
              font-size: 14px;
              cursor: pointer;
              user-select: none;
              text-align: center;
              min-width: 100px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2);
              transition: all 0.2s ease;
            " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)'">
              Overview Mode
          </div>
        `;

          // Prevent click from affecting the map
          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.disableScrollPropagation(container);

          container.onclick = function() {
                const mapContainer = document.getElementById('map');
                const currentMode = (mapContainer as any).currentMode;
                const overviewLayer = (mapContainer as any).overviewLayer;
                const detailLayer = (mapContainer as any).detailLayer;
                const buttonContent = container.querySelector('div');
                
                // Get the legend control reference
                const legendControlInstance = (mapContainer as any).legendControl;

            if (currentMode === 'overview') {
              map.removeLayer(overviewLayer);
              map.addLayer(detailLayer);
                  (mapContainer as any).currentMode = 'detail';
              if (buttonContent) {
                buttonContent.innerHTML = 'View Individual Parks';
                buttonContent.style.background = 'linear-gradient(135deg, #48BB78 0%, #2C5282 100%)';
              }
              // Update legend for detail mode
              if (legendControlInstance && legendControlInstance.getContainer() && (legendControlInstance.getContainer() as any).updateContent) {
                (legendControlInstance.getContainer() as any).updateContent('detail');
              }
            } else {
              map.removeLayer(detailLayer);
              map.addLayer(overviewLayer);
                  (mapContainer as any).currentMode = 'overview';
              if (buttonContent) {
                buttonContent.innerHTML = 'Overview Mode';
                buttonContent.style.background = 'linear-gradient(135deg, #2C5282 0%, #48BB78 100%)';
              }
              // Update legend for overview mode
              if (legendControlInstance && legendControlInstance.getContainer() && (legendControlInstance.getContainer() as any).updateContent) {
                (legendControlInstance.getContainer() as any).updateContent('overview');
              }
            }
          };

          return container;
        }
      });
      
      // Add legend control with dynamic content
      let LegendControl = L.Control.extend({
        options: { position: 'bottomleft' },
    onAdd: function(map:any) {
          let container = L.DomUtil.create('div', 'leaflet-control leaflet-control-legend');
          
          // Function to update legend content based on mode
          const updateLegendContent = (mode: string) => {
            if (mode === 'overview') {
              container.innerHTML = `
                <div style="
                  background: white;
                  padding: 12px;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                  border: 1px solid #E2E8F0;
                  font-size: 12px;
                  line-height: 1.4;
                  max-width: 250px;
                ">
                  <h4 style="margin: 0 0 8px 0; color: #2C5282; font-size: 14px; font-weight: 600;">Map Legend - Overview</h4>
                  <div style="display: flex; align-items: center; margin: 4px 0;">
                    <div style="width: 16px; height: 16px; background: #30f; border-radius: 50%; margin-right: 8px; opacity: 0.7;"></div>
                    <span style="color: #4A5568;">Street Parking Areas (Click for details & occupancy chart)</span>
                  </div>
                  <div style="display: flex; align-items: center; margin: 4px 0;">
                    <div style="width: 16px; height: 16px; background: #ff0000; border-radius: 50%; margin-right: 8px; opacity: 0.7;"></div>
                    <span style="color: #4A5568;">Off-Street Parking Buildings (Click for details)</span>
                  </div>

                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E2E8F0; color: #718096; font-size: 11px;">
                    💡 Switch to Individual Parks mode to see sensor details
                  </div>
                </div>
              `;
            } else {
              container.innerHTML = `
                <div style="
                  background: white;
                  padding: 12px;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                  border: 1px solid #E2E8F0;
                  font-size: 12px;
                  line-height: 1.4;
                  max-width: 250px;
                ">
                  <h4 style="margin: 0 0 8px 0; color: #2C5282; font-size: 14px; font-weight: 600;">Map Legend - Individual Parks</h4>
                  <div style="display: flex; align-items: center; margin: 4px 0;">
                    <div style="width: 8px; height: 8px; background: green; border-radius: 50%; margin-right: 12px;"></div>
                    <span style="color: #4A5568;">Available Parking Space</span>
                  </div>
                  <div style="display: flex; align-items: center; margin: 4px 0;">
                    <div style="width: 8px; height: 8px; background: red; border-radius: 50%; margin-right: 12px;"></div>
                    <span style="color: #4A5568;">Occupied Parking Space</span>
                  </div>
                  <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #E2E8F0; color: #718096; font-size: 11px;">
                    💡 Click individual dots to see last update time
                  </div>
                </div>
              `;
            }
          };
          
          // Initialize with overview mode
          updateLegendContent('overview');
          
          // Store reference for updating
          (container as any).updateContent = updateLegendContent;

      // Prevent click from affecting the map
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);

      return container;
    }
  });
      
      const legendControlInstance = new LegendControl();
  map.addControl(new ModeControl());
      map.addControl(legendControlInstance);
      
      // Store legend control reference for access from mode control
      (mapContainer as any).legendControl = legendControlInstance;

  // Load initial map data on first render
  loadMapData();
  }
}, [loadMapData]);

  // Format distance helper function
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  // Function to highlight a parking spot on the map
  const highlightParkingSpot = useCallback((spotName: string, latitude: number, longitude: number) => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer || !(mapContainer as any).leafletMap) return;

    const L = (window as any).L;
    const overviewLayer = (mapContainer as any).overviewLayer;
    
    // Clear any existing highlight
    clearParkingHighlight();
    
    // Find and highlight the parking spot
    overviewLayer.eachLayer((layer: any) => {
      if (layer instanceof L.Circle) {
        const layerLatLng = layer.getLatLng();
        // Check if this circle matches our target location (with small tolerance for floating point)
        if (Math.abs(layerLatLng.lat - latitude) < 0.0001 && 
            Math.abs(layerLatLng.lng - longitude) < 0.0001) {
          
          // Store original style for restoration
          const originalStyle = {
            color: layer.options.color,
            fillColor: layer.options.fillColor,
            fillOpacity: layer.options.fillOpacity,
            radius: layer.options.radius
          };
          (layer as any)._originalStyle = originalStyle;
          
          // Apply highlight style
          layer.setStyle({
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.6,
            radius: 25
          });
          
          // Store reference for clearing later
          (mapContainer as any).highlightedCircle = layer;
          setHighlightedParkingName(spotName);
          
          return false; // Break the loop
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to clear parking highlight
  const clearParkingHighlight = useCallback(() => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const highlightedCircle = (mapContainer as any).highlightedCircle;
    if (highlightedCircle && (highlightedCircle as any)._originalStyle) {
      // Restore original style
      highlightedCircle.setStyle((highlightedCircle as any)._originalStyle);
      delete (highlightedCircle as any)._originalStyle;
    }
    
    // Clear references
    (mapContainer as any).highlightedCircle = null;
    setHighlightedParkingName(null);
  }, []);

  // Master refresh function to update all data
  const refreshAllData = useCallback(async () => {
    console.log('🔄 Refreshing all data...');
    
    // Clear any existing highlights since we're refreshing the map
    clearParkingHighlight();
    
    // Refresh home stats
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.homeStats));
      if (response.ok) {
        const result = await response.json();
        setHomeStats(result.data);
      }
    } catch (error) {
      console.error('Error refreshing home stats:', error);
    }
    
    // Refresh top parking spots
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.topParking));
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
  }, [destinationLocation, hasSearched, loadMapData, searchParkingForLocation, clearParkingHighlight]);

  // Initial data load and setup master refresh interval
  useEffect(() => {
    const loadInitialData = async () => {
      // Load initial stats
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.homeStats));
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
        const response = await fetch(buildApiUrl(API_ENDPOINTS.topParking));
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
    }, 10 * 60 * 1000); // 10 minutes
    
    return () => clearInterval(masterInterval);
  }, [refreshAllData]);

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
              Enter your destination to find available parking spots with real-time data from Melbourne's parking network. Results are sorted by distance from your destination.
            </SearchSubtitle>
            
            <SearchForm>
              <SecureAutocomplete
                placeholder="Enter destination address..."
                onPlaceSelected={handlePlaceSelected}
                value={destinationInputValue}
                onChange={setDestinationInputValue}
              />
              <SearchButton 
                onClick={handleParkingSearch}
                disabled={isSearching || !destinationLocation}
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
                  parkingResults.slice(0, 8).map((spot) => (
                    <ParkingCard key={spot.id} onClick={()=>{
                        const mapContainer = document.getElementById('map');
                        window.scrollTo({top:(65 / 100) * (document.documentElement.scrollHeight - window.innerHeight), behavior:'smooth'})
                        const map = (mapContainer as any).leafletMap;
                        map.setView([parseFloat(spot.latitude),parseFloat(spot.longitude)], 17);
                        
                        // Highlight the parking spot
                        highlightParkingSpot(spot.name, parseFloat(spot.latitude), parseFloat(spot.longitude));
                    }}>
                      <ParkingHeader>
                        <ParkingName>{spot.name}</ParkingName>
                        <MapsIcon 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            openInMaps(spot.latitude, spot.longitude, spot.name);
                          }}
                          title="Open in Map"
                        >
                          Open in Map
                        </MapsIcon>
                      </ParkingHeader>
                      <ParkingInfo>
                        <InfoItem>
                          <span>📍</span>
                          <span style={{ fontWeight: 'bold', color: '#2C5282' }}>{formatDistance(spot.distanceFromDestination)} away</span>
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
               <div style={{ 
                 background: 'linear-gradient(135deg, #F0FFF4 0%, #E6FFFA 100%)', 
                 padding: '12px 16px', 
                 borderRadius: '8px 8px 0 0', 
                 borderBottom: '1px solid #E2E8F0',
                 fontSize: '14px',
                 color: '#2F855A',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '8px'
               }}>
                 <span>🗺️</span>
                 <span><strong>Interactive Map:</strong> Click blue circles for parking details • Use toggle button to view individual sensors</span>
               </div>
               <div id="map" style={{ height: '900px', width: '100%', borderRadius: '0 0 1rem 1rem' }}></div>
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
                        window.scrollTo({top:(50 / 100) * (document.documentElement.scrollHeight - window.innerHeight), behavior:'smooth'})
                        const map = (mapContainer as any).leafletMap;
                        map.setView([topParkingSpots[0].latitude,topParkingSpots[0].longitude], 17);
                        
                        // Highlight the parking spot
                        highlightParkingSpot(topParkingSpots[0].name, topParkingSpots[0].latitude, topParkingSpots[0].longitude);
                    }}>
                    <SpotName>{topParkingSpots[0]?.name}</SpotName>
                    <SpotDetails>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span><strong>{topParkingSpots[0]?.availableSpots}</strong> spots available</span>
                        <HighlightBadge>Highest</HighlightBadge>
                      </div>
                      <MapsIcon 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          openInMaps(topParkingSpots[0].latitude, topParkingSpots[0].longitude, topParkingSpots[0].name);
                        }}
                        title="Open in Map"
                      >
                        Open in Map
                      </MapsIcon>
                    </SpotDetails>
                  </TopSpotCard>

                  {topParkingSpots.slice(1, 5).map((spot, index) => (
                    <SpotCard key={spot.id} onClick={()=>{
                        const mapContainer = document.getElementById('map');
                        window.scrollTo({top:(55 / 100) * (document.documentElement.scrollHeight - window.innerHeight), behavior:'smooth'})
                        const map = (mapContainer as any).leafletMap;
                        map.setView([spot.latitude,spot.longitude], 17);
                        
                        // Highlight the parking spot
                        highlightParkingSpot(spot.name, spot.latitude, spot.longitude);
                    }}>
                      <SpotName>{spot.name}</SpotName>
                      <SpotDetails>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span><strong>{spot.availableSpots}</strong> spots available</span>
                          <span style={{ 
                            background: '#E2E8F0', 
                            color: '#4A5568',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>#{index + 2}</span>
                        </div>
                        <MapsIcon 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            openInMaps(spot.latitude, spot.longitude, spot.name);
                          }}
                          title="Open in Map"
                        >
                          Open in Map
                        </MapsIcon>
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
                {highlightedParkingName && (
                  <>
                    <br />
                    <span style={{ color: '#10B981', fontWeight: 'bold' }}>
                      📍 Highlighted: {highlightedParkingName}
                    </span>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <RefreshButton 
                  onClick={refreshAllData}
                  disabled={isMapLoading}
                >
                  {isMapLoading ? 'Refreshing...' : 'Refresh All Data'}
                </RefreshButton>
                {highlightedParkingName && (
                  <ClearHighlightButton 
                    onClick={clearParkingHighlight}
                    title="Clear highlighted parking spot"
                  >
                    Clear Highlight
                  </ClearHighlightButton>
                )}
              </div>
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
              <TransportTitle>🚌 Public Transport Network (Within 10km of CBD)</TransportTitle>
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