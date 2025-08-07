import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

const ChartContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChartTitle = styled.h2`
  color: #2D3748;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const FilterContainer = styled.div`
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

  &:focus {
    outline: none;
    border-color: #2C5282;
  }
`;

const HistoricalTrends = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [location, setLocation] = useState('all');

  // Sample data - replace with real data from your backend
  const parkingOccupancyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Average Occupancy Rate (%)',
        data: [75, 82, 80, 85, 90, 70, 65],
        borderColor: '#2C5282',
        backgroundColor: 'rgba(44, 82, 130, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const peakHoursData = {
    labels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'],
    datasets: [
      {
        label: 'Average Vehicles per Hour',
        data: [120, 180, 160, 150, 200, 190, 100],
        backgroundColor: '#48BB78',
      },
    ],
  };

  return (
    <PageContainer>
      <Header>
        <PageTitle>Historical Parking Trends</PageTitle>
        <Description>
          Analyze parking patterns and make informed decisions with our comprehensive historical data
        </Description>
      </Header>

      <FilterContainer>
        <Select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </Select>

        <Select 
          value={location} 
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="all">All Areas</option>
          <option value="cbd">CBD</option>
          <option value="docklands">Docklands</option>
          <option value="southbank">Southbank</option>
        </Select>
      </FilterContainer>

      <ChartContainer>
        <ChartTitle>Parking Occupancy Over Time</ChartTitle>
        <Line 
          data={parkingOccupancyData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
              },
            },
          }}
        />
      </ChartContainer>

      <ChartContainer>
        <ChartTitle>Peak Hours Analysis</ChartTitle>
        <Bar 
          data={peakHoursData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </ChartContainer>
    </PageContainer>
  );
};

export default HistoricalTrends;