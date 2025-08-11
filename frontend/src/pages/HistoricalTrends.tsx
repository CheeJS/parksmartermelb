import React, { useState, useEffect } from 'react';
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
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { 
  fetchCarOwnershipAnalysis, 
  calculateInfrastructureProjections,
  formatDisplayValue,
  validateAnalysisData,
  type CarOwnershipAnalysisData,
  type OwnershipRate 
} from '../services/historicalTrendsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PageContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;
`;

const PageTitle = styled.h1`
  color: #2C5282;
  margin-bottom: 1rem;
  font-size: 2.5rem;
`;

const Description = styled.p`
  color: #4A5568;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const MetricsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
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

const InsightsContainer = styled.div`
  margin-top: 3rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, #f1f8ff 0%, #e3f2fd 100%);
  border-radius: 16px;
  border: 1px solid #bbdefb;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const InsightsTitle = styled.h3`
  color: #1565c0;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #1565c0, #42a5f5);
    border-radius: 2px;
  }
`;

const InsightsList = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border-left: 4px solid #42a5f5;
    line-height: 1.7;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
    
    strong {
      color: #1565c0;
      font-weight: 600;
    }
    
    ul {
      margin-top: 1rem;
      padding-left: 1.5rem;
      
      li {
        margin: 0.8rem 0;
        padding: 0.5rem 0;
        background: none;
        box-shadow: none;
        border-radius: 0;
        border-left: none;
        list-style: none;
        position: relative;
        transform: none;
        
        &:hover {
          transform: none;
          box-shadow: none;
        }
        
        &::before {
          content: '▸';
          color: #42a5f5;
          font-weight: bold;
          position: absolute;
          left: -1rem;
        }
      }
    }
  }
`;

const SectionDivider = styled.div`
  margin: 3rem 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
`;

const FullWidthChartsSection = styled.div`
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  padding: 2rem 1rem;
  background: #f8fafc;
`;

const ChartsFlexContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 0;
  width: 100%;
  max-width: none;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const ChartWrapper = styled.div`
  flex: 1;
  min-width: 0; /* Prevents flex items from overflowing */
`;

const RecommendationsContainer = styled.div`
  background: #E6FFFA;
  border-left: 4px solid #38B2AC;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const DataTableContainer = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #E2E8F0;
  }
  
  th {
    background-color: #F7FAFC;
    font-weight: 600;
    color: #2D3748;
  }
  
  tr:hover {
    background-color: #F7FAFC;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #718096;
  font-style: italic;
`;

const DataSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }
  
  .value {
    font-size: 2rem;
    font-weight: 800;
    color: #1e40af;
    background: linear-gradient(90deg, #1e40af, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
  }
  
  .label {
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #4A5568;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #E2E8F0;
  border-top: 4px solid #2C5282;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  background: #FED7D7;
  border: 1px solid #FC8181;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin: 2rem 0;
  color: #C53030;
  text-align: center;
`;

const RetryButton = styled.button`
  background: #2C5282;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background: #2B6CB0;
  }
`;

const HistoricalTrends = () => {
  const [analysisData, setAnalysisData] = useState<CarOwnershipAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching car ownership data...');
      const data = await fetchCarOwnershipAnalysis();
      setAnalysisData(data);
      console.log('✅ Car ownership data loaded successfully');
      
    } catch (err) {
      console.error('❌ Error loading car ownership data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingSpinner />
          <p>Loading car ownership data from Azure database...</p>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Show error state
  if (error || !analysisData) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h3>Unable to Load Data</h3>
          <p>{error || 'Failed to load car ownership analysis data.'}</p>
          <RetryButton onClick={loadAnalysisData}>
            Retry Loading
          </RetryButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // Chart data for ownership rate trends
  const ownershipChartData = {
    labels: analysisData.ownershipRates.map(rate => rate.year.toString()),
    datasets: [
      {
        label: 'Cars per 1,000 Residents',
        data: analysisData.ownershipRates.map(rate => rate.rate),
        borderColor: '#2C5282',
        backgroundColor: 'rgba(44, 82, 130, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Chart data for absolute numbers
  const absoluteChartData = {
    labels: analysisData.ownershipRates.map(rate => rate.year.toString()),
    datasets: [
      {
        label: 'Total Vehicle Registrations',
        data: analysisData.ownershipRates.map(rate => rate.vehicles),
        backgroundColor: '#48BB78',
        borderColor: '#38A169',
        borderWidth: 2,
      },
      {
        label: 'Population',
        data: analysisData.ownershipRates.map(rate => rate.population),
        backgroundColor: '#ED8936',
        borderColor: '#DD6B20',
        borderWidth: 2,
      },
    ],
  };

  return (
    <PageContainer>
        <Header>
    <PageTitle>Historical Trends - Population Growth & Urban Congestion</PageTitle>
    <Description>
      Analyze population growth trends in Melbourne CBD from 2009-2021 and understand how increasing population 
      impacts urban congestion, infrastructure demand, and transportation planning.
    </Description>
  </Header>

      {/* Side-by-Side Charts Layout - Full Width */}
      <FullWidthChartsSection>
         <ChartsFlexContainer>
         {/* Population Growth Chart - Left Side */}
         {analysisData.populationData && analysisData.populationData.length > 0 && (
           <ChartWrapper>
             <ChartContainer>
               <ChartTitle>Population Growth Trend Over Time</ChartTitle>
               <Line 
                 data={{
                   labels: analysisData.populationData.map(data => data.year.toString()),
                   datasets: [
                     {
                       label: 'Melbourne CBD Population',
                       data: analysisData.populationData.map(data => data.population),
                       borderColor: '#48BB78',
                       backgroundColor: 'rgba(72, 187, 120, 0.1)',
                       fill: true,
                       tension: 0.4,
                       pointRadius: 6,
                       pointHoverRadius: 8,
                       pointBackgroundColor: '#48BB78',
                       pointBorderColor: '#ffffff',
                       pointBorderWidth: 2,
                     },
                   ],
                 }}
                 options={{
                   responsive: true,
                   plugins: {
                     legend: {
                       position: 'top' as const,
                     },
                     tooltip: {
                       callbacks: {
                         label: (context) => {
                           return `Population: ${Number(context.parsed.y).toLocaleString()} residents`;
                         }
                       }
                     }
                   },
                   scales: {
                     y: {
                       beginAtZero: false,
                       title: {
                         display: true,
                         text: 'Population'
                       },
                       ticks: {
                         callback: function(value) {
                           return Number(value).toLocaleString();
                         }
                       }
                     },
                     x: {
                       title: {
                         display: true,
                         text: 'Year'
                       }
                     }
                   },
                 }}
               />
             </ChartContainer>
           </ChartWrapper>
         )}

         {/* Car Ownership Rate Chart - Right Side */}
         {analysisData.ownershipRates && analysisData.ownershipRates.length > 0 && (
           <ChartWrapper>
             <ChartContainer>
               <ChartTitle>Car Ownership Rate Trends Over Time</ChartTitle>
               <Line 
                 data={{
                   labels: analysisData.ownershipRates.map(rate => rate.year.toString()),
                   datasets: [
                     {
                       label: 'Cars per 1,000 Residents',
                       data: analysisData.ownershipRates.map(rate => rate.rate),
                       borderColor: '#2C5282',
                       backgroundColor: 'rgba(44, 82, 130, 0.1)',
                       fill: true,
                       tension: 0.4,
                       pointRadius: 6,
                       pointHoverRadius: 8,
                       pointBackgroundColor: '#2C5282',
                       pointBorderColor: '#ffffff',
                       pointBorderWidth: 2,
                     },
                   ],
                 }}
                 options={{
                   responsive: true,
                   plugins: {
                     legend: {
                       position: 'top' as const,
                     },
                     tooltip: {
                       callbacks: {
                         label: (context) => {
                           return `${context.dataset.label}: ${context.parsed.y} cars per 1,000 residents`;
                         }
                       }
                     }
                   },
                   scales: {
                     y: {
                       beginAtZero: false,
                       title: {
                         display: true,
                         text: 'Cars per 1,000 Residents'
                       }
                     },
                     x: {
                       title: {
                         display: true,
                         text: 'Year'
                       }
                     }
                   },
                 }}
               />
             </ChartContainer>
           </ChartWrapper>
         )}
         </ChartsFlexContainer>
       </FullWidthChartsSection>
      {/* Population Growth Analysis */}
      {analysisData.populationData && analysisData.populationData.length > 0 && (
        <>
          <DataTableContainer>
            <ChartTitle>Melbourne CBD Population Growth (2009-2021)</ChartTitle>
            
            <DataSummary>
              <SummaryCard>
                <div className="value">{analysisData.populationData.length}</div>
                <div className="label">Years of Data</div>
              </SummaryCard>
              <SummaryCard>
                <div className="value">{formatDisplayValue(analysisData.populationData[0]?.population, 'population')}</div>
                <div className="label">Starting Population ({analysisData.populationData[0]?.year})</div>
              </SummaryCard>
              <SummaryCard>
                <div className="value">{formatDisplayValue(analysisData.populationData[analysisData.populationData.length - 1]?.population, 'population')}</div>
                <div className="label">Latest Population ({analysisData.populationData[analysisData.populationData.length - 1]?.year})</div>
              </SummaryCard>
              <SummaryCard>
                <div className="value">
                  {(() => {
                    const first = analysisData.populationData[0]?.population;
                    const last = analysisData.populationData[analysisData.populationData.length - 1]?.population;
                    if (first && last) {
                      const growth = ((last - first) / first * 100);
                      return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
                    }
                    return '--';
                  })()}
                </div>
                <div className="label">Total Growth</div>
              </SummaryCard>
            </DataSummary>
            
            <DataTable>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Population</th>
                  <th>Year-over-Year Change</th>
                  <th>Growth Rate (%)</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.populationData.map((row, index) => {
                  const prevRow = index > 0 ? analysisData.populationData[index - 1] : null;
                  const change = prevRow ? row.population - prevRow.population : 0;
                  const growthRate = prevRow ? ((change / prevRow.population) * 100) : 0;
                  
                  return (
                    <tr key={row.year}>
                      <td><strong>{row.year}</strong></td>
                      <td>{formatDisplayValue(row.population, 'population')}</td>
                      <td style={{ color: change >= 0 ? '#48BB78' : '#F56565' }}>
                        {index === 0 ? '--' : `${change >= 0 ? '+' : ''}${change.toLocaleString()}`}
                      </td>
                      <td style={{ color: growthRate >= 0 ? '#48BB78' : '#F56565' }}>
                        {index === 0 ? '--' : `${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
          </DataTableContainer>        
                 </>
       )}

       

      

      <SectionDivider />

      {/* Population Growth & Congestion Analysis */}
      <InsightsContainer>
        <InsightsTitle>Population Growth Impact on Urban Congestion</InsightsTitle>
        <InsightsList>
          <li>
            <strong>Population Growth Pressure:</strong> As Melbourne CBD population increases, more residents require daily 
            transportation, creating greater demand for roads, public transport, and parking infrastructure. Even modest 
            population growth can significantly amplify peak-hour congestion.
          </li>
          <li>
            <strong>Infrastructure Strain:</strong> Population growth directly impacts:
            <ul style={{marginTop: '0.5rem'}}>
              <li><strong>Road Networks:</strong> More residents = more trips, overwhelming existing road capacity</li>
              <li><strong>Public Transport:</strong> Increased demand on trains, trams, and buses during peak periods</li>
              <li><strong>Parking Demand:</strong> Growing competition for limited CBD parking spaces</li>
              <li><strong>Pedestrian Flow:</strong> Crowded footpaths and crossings during busy periods</li>
            </ul>
          </li>
          <li>
            <strong>Congestion Multiplier Effect:</strong> Urban congestion doesn't scale linearly with population. A 20% 
            population increase can result in 50%+ longer travel times due to network capacity constraints and bottleneck effects.
          </li>
          <li>
            <strong>Additional Congestion Factors:</strong> Beyond population growth, other key factors influence congestion:
            <ul style={{marginTop: '0.5rem'}}>
              <li><strong>Economic Activity:</strong> Business growth, tourism, and events increase non-resident traffic</li>
              <li><strong>Urban Development:</strong> New construction can temporarily disrupt traffic flow</li>
              <li><strong>Transport Mode Choice:</strong> Preference for private vehicles vs. public transport</li>
              <li><strong>Work Patterns:</strong> Remote work, flexible hours, and staggered schedules affect peak demand</li>
              <li><strong>Weather & Seasonality:</strong> Events, school holidays, and weather impact travel patterns</li>
            </ul>
          </li>
          <li>
            <strong>Strategic Planning Implications:</strong> Understanding population growth trends enables proactive 
            infrastructure planning, including transport capacity expansion, smart traffic management systems, and policies 
            encouraging sustainable transport modes to mitigate congestion before it becomes critical.
          </li>
        </InsightsList>
      </InsightsContainer>
    </PageContainer>
  );
};

export default HistoricalTrends;
