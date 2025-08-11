export interface PopulationData {
  year: number;
  population: number;
}

export interface VehicleData {
  year: number;
  registrations: number;
}

export interface OwnershipRate {
  year: number;
  rate: number;
  population: number;
  vehicles: number;
}

export interface CarOwnershipMetrics {
  currentRate: number;
  growthRate: number;
  totalVehicles: number;
  projectedImpact: number;
}

export interface CarOwnershipAnalysisData {
  populationData: PopulationData[];
  vehicleData: VehicleData[];
  ownershipRates: OwnershipRate[];
  metrics: CarOwnershipMetrics;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}

/**
 * Fetch population data from Azure database
 * @returns Promise of population data array
 */
export async function fetchPopulationData(): Promise<PopulationData[]> {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'https://api.parksmartermelb.me';
    const response = await fetch(`${apiUrl}/api/population`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result: ApiResponse<PopulationData[]> = await response.json();
    
    console.log(`📊 Received ${result.data.length} population records from database`);
    
    return result.data;

  } catch (error) {
    console.error('❌ Error fetching population data:', error);
    throw error;
  }
}

/**
 * Fetch vehicle census data from Azure database
 * @returns Promise of vehicle census data array
 */
export async function fetchVehicleData(): Promise<VehicleData[]> {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://api.parksmartermelb.me';
    const response = await fetch(`${apiUrl}/api/vehicle-census`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result: ApiResponse<VehicleData[]> = await response.json();
    
    console.log(`🚗 Received ${result.data.length} vehicle census records from database`);
    
    return result.data;

  } catch (error) {
    console.error('❌ Error fetching vehicle census data:', error);
    throw error;
  }
}

/**
 * Fetch complete car ownership analysis (population + vehicle data + calculated metrics)
 * @returns Promise of complete analysis data
 */
export async function fetchCarOwnershipAnalysis(): Promise<CarOwnershipAnalysisData> {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://api.parksmartermelb.me';
    
    // Try the simple test endpoint first to verify connectivity
    console.log('🔄 Attempting to fetch car ownership analysis...');
    
    let response = await fetch(`${apiUrl}/api/car-ownership-analysis`);
    
    // If the main endpoint fails, try the simple test endpoint
    if (!response.ok) {
      console.warn('⚠️ Main endpoint failed, trying simple test endpoint...');
      response = await fetch(`${apiUrl}/api/simple-test`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result: ApiResponse<CarOwnershipAnalysisData> = await response.json();
    
    console.log(`📈 Received car ownership analysis:`, {
      populationRecords: result.data.populationData?.length || 0,
      vehicleRecords: result.data.vehicleData?.length || 0,
      ownershipRates: result.data.ownershipRates?.length || 0,
      currentRate: result.data.metrics?.currentRate || 0,
      hasRawData: !!(result.data as any).rawData
    });
    
    return result.data;

  } catch (error) {
    console.error('❌ Error fetching car ownership analysis:', error);
    throw error;
  }
}

/**
 * Calculate projected infrastructure needs based on ownership trends
 * @param ownershipRates - Historical ownership rate data
 * @param projectionYears - Number of years to project forward
 * @returns Projected infrastructure data
 */
export function calculateInfrastructureProjections(
  ownershipRates: OwnershipRate[], 
  projectionYears: number = 4
): { year: number; requiredParkingSpaces: number; currentCapacity: number }[] {
  if (ownershipRates.length < 2) {
    return [];
  }

  const latestData = ownershipRates[ownershipRates.length - 1];
  const secondLatest = ownershipRates[ownershipRates.length - 2];
  
  // Calculate annual growth rate
  const annualGrowthRate = (latestData.vehicles - secondLatest.vehicles) / secondLatest.vehicles;
  
  // Current infrastructure capacity (estimate)
  const currentCapacity = 3500000; // 3.5 million parking spaces
  
  const projections = [];
  
  // Add historical data points
  ownershipRates.slice(-3).forEach(rate => {
    projections.push({
      year: rate.year,
      requiredParkingSpaces: Math.round(rate.vehicles / 1000), // Convert to thousands
      currentCapacity: Math.round(currentCapacity / 1000)
    });
  });
  
  // Add future projections
  for (let i = 1; i <= projectionYears; i++) {
    const projectedYear = latestData.year + i;
    const projectedVehicles = latestData.vehicles * Math.pow(1 + annualGrowthRate, i);
    const requiredSpaces = projectedVehicles * 1.1; // 10% buffer for parking needs
    
    projections.push({
      year: projectedYear,
      requiredParkingSpaces: Math.round(requiredSpaces / 1000), // Convert to thousands
      currentCapacity: Math.round(currentCapacity / 1000)
    });
  }
  
  return projections;
}

/**
 * Format numbers for display in charts and metrics
 * @param value - Number to format (can be null/undefined)
 * @param type - Type of formatting needed
 * @returns Formatted string
 */
export function formatDisplayValue(value: number | null | undefined, type: 'population' | 'vehicles' | 'rate' | 'percentage'): string {
  // Handle null, undefined, or non-numeric values
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '--';
  }
  
  const numValue = Number(value);
  
  switch (type) {
    case 'population':
    case 'vehicles':
      return numValue >= 1000000 
        ? `${(numValue / 1000000).toFixed(1)}M`
        : numValue >= 1000 
        ? `${(numValue / 1000).toFixed(0)}K`
        : numValue.toString();
    
    case 'rate':
      return numValue.toFixed(1);
    
    case 'percentage':
      return `${numValue >= 0 ? '+' : ''}${numValue.toFixed(1)}%`;
    
    default:
      return numValue.toString();
  }
}

/**
 * Validate data quality and completeness
 * @param analysisData - Complete analysis data to validate
 * @returns Validation result with any issues found
 */
export function validateAnalysisData(analysisData: CarOwnershipAnalysisData): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check for minimum data requirements
  if (analysisData.populationData.length === 0) {
    issues.push('No population data available');
  }
  
  if (analysisData.vehicleData.length === 0) {
    issues.push('No vehicle census data available');
  }
  
  if (analysisData.ownershipRates.length === 0) {
    issues.push('No overlapping years between population and vehicle data');
  }
  
  // Check for data consistency
  if (analysisData.ownershipRates.length < 2) {
    issues.push('Insufficient data points for trend analysis (minimum 2 years required)');
  }
  
  // Check for reasonable values
  const unreasonableRates = analysisData.ownershipRates.filter(rate => 
    rate.rate < 0 || rate.rate > 2000 // More than 2 cars per person seems unreasonable
  );
  
  if (unreasonableRates.length > 0) {
    issues.push(`Unreasonable ownership rates detected for years: ${unreasonableRates.map(r => r.year).join(', ')}`);
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}
