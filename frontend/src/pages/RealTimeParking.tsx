import React, { useState } from 'react';
import styled from 'styled-components';

const ParkingContainer = styled.div`
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

const MapContainer = styled.div`
  height: 500px;
  background-color: #F7FAFC;
  border-radius: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4A5568;
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

const RealTimeParking = () => {
  const [showEcoSpots, setShowEcoSpots] = useState(false);
  const [showAccessible, setShowAccessible] = useState(false);

  return (
    <ParkingContainer>
      <Header>
        <PageTitle>Real-Time Parking Availability</PageTitle>
        <Description>
          Find available parking spots across Melbourne CBD with live updates and predictions
        </Description>
      </Header>

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

      <MapContainer>
        {/* Placeholder for Leaflet/Mapbox map */}
        Interactive map with real-time parking data will be integrated here
      </MapContainer>

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
    </ParkingContainer>
  );
};

export default RealTimeParking;