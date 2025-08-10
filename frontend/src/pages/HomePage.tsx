import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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
  margin-bottom: 2rem;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Hero = styled.section`
  background: linear-gradient(135deg, #2C5282 0%, #48BB78 100%);
  color: white;
  padding: 4rem 2rem;
  border-radius: 1rem;
  margin-bottom: 3rem;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
`;

const MapSection = styled.div`
  background-color: #F7FAFC;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 3rem;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #4A5568;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
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

const HomePage = () => {
  const [showEcoSpots, setShowEcoSpots] = useState(false);
  const [showAccessible, setShowAccessible] = useState(false);

  useEffect(() => {
  const mapContainer = document.getElementById('map');

  // Check if the map is already initialized
  if (mapContainer && !(mapContainer as any)._leaflet_id) {
    const L = (window as any).L;

    // Default fallback location
    const defaultLatLng = [-37.8136, 144.9631];

    // Initialize map
    const map = L.map('map').setView(defaultLatLng, 13);

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

    // Put this somewhere else...
    interface Parking {
      RoadSegmentDescription:String,
      available_parks:number,
      Location:String,
      Restriction_Days:String,
      Restriction_Start:String,
      Restriction_End:String,
      Restriction_Display:String,
      Latitude:number,
      Longitude:number
    }

    interface LiveParking {
      Status_Timestamp:string,
      Status_Description:string,
      Latitude:number,
      Longitude:number
    }

    // Two layer groups
    let overviewLayer = L.layerGroup().addTo(map); // for bay center points
    let detailLayer = L.layerGroup();              // for individual spots

    fetch('http://localhost:5000/api/parking')
    .then((res) => res.json())
    .then((data) => {
      data.data.forEach((obj:Parking)=>{
        // Add a circle
        const circle = L.circle([obj.Latitude,obj.Longitude], {
          color: 'blue',           // Circle stroke color
          fillColor: '#30f',       // Fill color
          fillOpacity: 0.3,        // Fill opacity
          radius: 15            // Radius in meters
        }).addTo(overviewLayer);

        // Add click event to show number in a popup
        circle.on('click', () => {
          L.popup()
            .setLatLng([obj.Latitude,obj.Longitude])
            .setContent(
              `<div>
                <strong>RoadSegmentDescription:</strong> ${obj.RoadSegmentDescription}<br>
                <strong>Available Parks:</strong> ${obj.available_parks}<br>
                <strong>Restriction Days:</strong> ${obj.Restriction_Days}<br>
                <strong>Restriction Start:</strong> ${obj.Restriction_Start}<br>
                <strong>Restriction End:</strong> ${obj.Restriction_End}<br>
                <strong>Restriction Display:</strong> ${obj.Restriction_Display}
              </div>`
            )
            .openOn(map);
        });
      })
    })
    .catch((err) => console.error(err));

    fetch('http://localhost:5000/api/live')
    .then((res) => res.json())
    .then((data) => {
      data.data.forEach((parking:LiveParking)=>{
        const point = L.circle([parking.Latitude,parking.Longitude], {
          radius: 1,
          // should do data preprocessing beforehand...
          color: parking.Status_Description === "Present"? "green" : "red",
          fillOpacity: 0.8

        }).addTo(detailLayer);
        point.on('click', () => {
          L.popup()
            .setLatLng([parking.Latitude,parking.Longitude])
            .setContent(
              `<div>
                <strong>Last updated:</strong> ${parking.Status_Timestamp}<br>
              </div>`
            )
            .openOn(map);
        });
      })
    })
    .catch((err) => console.error(err));

    // Show/hide based on zoom
    map.on('zoomend', () => {
      if (map.getZoom() >= 18) {
        if (map.hasLayer(overviewLayer)) map.removeLayer(overviewLayer);
        if (!map.hasLayer(detailLayer)) map.addLayer(detailLayer);
      } else {
        if (map.hasLayer(detailLayer)) map.removeLayer(detailLayer);
        if (!map.hasLayer(overviewLayer)) map.addLayer(overviewLayer);
      }
    });
  }
}, []);

  return (
    <HomeContainer>
      <Hero>
        <HeroTitle>Smart Parking for a Sustainable Melbourne</HeroTitle>
        <HeroSubtitle>
          Find real-time parking, understand trends, and make eco-friendly travel decisions
        </HeroSubtitle>
      </Hero>

      <MapControls>
        <Select defaultValue="all">
          <option value="all">All Areas</option>
          <option value="cbd">CBD</option>
          <option value="docklands">Docklands</option>
          <option value="southbank">Southbank</option>
        </Select>

        <FilterButton
          active={showEcoSpots}
          onClick={() => setShowEcoSpots(!showEcoSpots)}
        >
          <span role="img" aria-label="eco">🌱</span> Eco-Friendly Spots
        </FilterButton>

        <FilterButton
          active={showAccessible}
          onClick={() => setShowAccessible(!showAccessible)}
        >
          <span role="img" aria-label="accessible">♿</span> Accessible Parking
        </FilterButton>
      </MapControls>

      <MapSection>
        <div id="map" style={{ height: '600px', width: '100%' }}></div>
      </MapSection>

      <StatsGrid>
        <StatCard>
          <StatLabel>Available Spots</StatLabel>
          <StatValue>247</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Average Occupancy</StatLabel>
          <StatValue>78%</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Eco-Friendly Spots</StatLabel>
          <StatValue>42</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>Peak Time</StatLabel>
          <StatValue>2:30 PM</StatValue>
        </StatCard>
      </StatsGrid>

      <FeaturesGrid>
        <FeatureCard to="/parking">
          <FeatureTitle>
            <span role="img" aria-label="parking">🚗</span> Real-Time Parking
          </FeatureTitle>
          <FeatureDescription>
            Find available parking spots in real-time with live sensor data and congestion predictions
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard to="/plan">
          <FeatureTitle>
            <span role="img" aria-label="leaf">🌱</span> Plan a Greener Trip
          </FeatureTitle>
          <FeatureDescription>
            Compare carbon footprints of different travel options and find eco-friendly parking spots
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard to="/trends">
          <FeatureTitle>
            <span role="img" aria-label="chart">📊</span> Insights
          </FeatureTitle>
          <FeatureDescription>
            Explore historical trends in parking availability and understand population growth patterns
          </FeatureDescription>
        </FeatureCard>
      </FeaturesGrid>
    </HomeContainer>
  );
};

export default HomePage;