import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useEffect } from 'react'

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
  height: 400px;
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


    fetch('http://localhost:5000/api/parking')
    .then((res) => res.json())
    .then((data) => {
      data.data.forEach((obj:Parking)=>{
        // Add a circle
        const circle = L.circle([obj.Latitude,obj.Longitude], {
          color: 'blue',           // Circle stroke color
          fillColor: '#30f',       // Fill color
          fillOpacity: 0.3,        // Fill opacity
          radius: 5            // Radius in meters
        }).addTo(map);

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

      <MapSection>
        <div id="map" style={{ height: '400px', width: '100%' }}></div>
      </MapSection>

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