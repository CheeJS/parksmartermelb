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
  background: #F7FAFC;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const InsightsTitle = styled.h3`
  color: #2C5282;
  margin-bottom: 1rem;
  font-size: 1.3rem;
`;

const InsightsList = styled.ul`
  color: #4A5568;
  line-height: 1.6;
  
  li {
    margin-bottom: 0.8rem;
  }
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
  background: #EDF2F7;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2C5282;
  }
  
  .label {
    font-size: 0.9rem;
    color: #4A5568;
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
      
      console.log('🔄 Fetching car ownership data from Azure database...');
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
        <PageTitle>Historical Trends - Car Ownership Analysis</PageTitle>
        <Description>
          Analyze historical trends in car ownership rates for Melbourne using vehicle registration and population data from 2009-2021.
          <br/><strong>Formula: (Number of Registered Vehicles ÷ Population) × 1,000</strong>
        </Description>
      </Header>

      {/* Car Ownership Rate Calculation Results */}
      <DataTableContainer>
        <ChartTitle>Historical Car Ownership Rates (Per 1,000 Residents)</ChartTitle>
        
        {analysisData.ownershipRates && analysisData.ownershipRates.length > 0 ? (
          <>
            <DataSummary>
              <SummaryCard>
                <div className="value">{analysisData.ownershipRates.length}</div>
                <div className="label">Years Calculated</div>
              </SummaryCard>
              <SummaryCard>
                <div className="value">{formatDisplayValue(analysisData.metrics.currentRate, 'rate')}</div>
                <div className="label">Latest Rate (per 1,000)</div>
              </SummaryCard>
              <SummaryCard>
                <div className="value">{analysisData.ownershipRates[analysisData.ownershipRates.length - 1]?.year || '--'}</div>
                <div className="label">Latest Year</div>
              </SummaryCard>
            </DataSummary>
            
            <DataTable>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Population</th>
                  <th>Registered Vehicles</th>
                  <th>Ownership Rate<br/>(per 1,000 residents)</th>
                  <th>Calculation</th>
                </tr>
              </thead>
              <tbody>
                {analysisData.ownershipRates.map((row) => (
                  <tr key={row.year}>
                    <td><strong>{row.year}</strong></td>
                    <td>{formatDisplayValue(row.population, 'population')}</td>
                    <td>{formatDisplayValue(row.vehicles, 'vehicles')}</td>
                    <td><strong>{formatDisplayValue(row.rate, 'rate')}</strong></td>
                    <td>({formatDisplayValue(row.vehicles, 'vehicles')} ÷ {formatDisplayValue(row.population, 'population')}) × 1,000</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </>
        ) : (
          <NoDataMessage>
            <p><strong>No ownership rates calculated</strong></p>
            <p>This could be due to:</p>
            <ul style={{textAlign: 'left', display: 'inline-block'}}>
              <li>No overlapping years between population and vehicle data</li>
              <li>Data format issues in the database tables</li>
              <li>Missing or invalid data values</li>
            </ul>
          </NoDataMessage>
        )}
      </DataTableContainer>

      {/* Historical Trends Analysis */}
      <InsightsContainer>
        <InsightsTitle>Understanding Historical Trends</InsightsTitle>
        <InsightsList>
          <li>
            <strong>Historical Car Ownership Rate:</strong> This standardized metric (vehicles per 1,000 residents) allows for 
            meaningful year-over-year comparisons, accounting for population changes over the 2009-2021 period.
          </li>
          <li>
            <strong>Trend Analysis:</strong> By examining the historical progression, you can identify:
            <ul style={{marginTop: '0.5rem'}}>
              <li>Whether car ownership is increasing, decreasing, or stable over time</li>
              <li>Years with significant changes in ownership patterns</li>
              <li>Correlation with economic conditions, policy changes, or urban development</li>
              <li>Patterns that may predict future transportation needs</li>
            </ul>
          </li>
          <li>
            <strong>Growth Indicators:</strong> An increasing trend suggests car ownership is growing faster than population growth, 
            indicating potential increased pressure on parking and road infrastructure. A decreasing trend may suggest improved 
            public transport adoption or urban density policies are working.
          </li>
          <li>
            <strong>Planning Applications:</strong> Historical trends inform long-term urban planning decisions, including 
            infrastructure investment priorities, public transport expansion, and sustainable transportation policies.
          </li>
        </InsightsList>
      </InsightsContainer>
    </PageContainer>
  );
};

export default HistoricalTrends;
