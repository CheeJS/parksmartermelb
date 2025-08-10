/**
 * Carbon Emission Calculator
 * Based on fuel consumption and emission factors
 */

// Emission factors (kg CO2 per liter of fuel)
const EMISSION_FACTORS = {
  PETROL: 2.17,      // kg CO2 per liter of petrol
  DIESEL: 2.68,      // kg CO2 per liter of diesel
  ELECTRICITY: 0.85  // kg CO2 per kWh (Australian grid average)
};

// Fuel efficiency for supported travel modes (L/100km)
const FUEL_EFFICIENCY = {
  CAR: 8.5,           // Average petrol car
  MOTORCYCLE: 3.5,    // Average motorcycle/scooter
  TRANSIT: 20         // Mixed public transport (equivalent)
};

// Average occupancy for public transport
const TRANSIT_OCCUPANCY = 35; // Average passengers (mix of bus/train/tram)

export interface EmissionCalculationResult {
  totalEmissions: number;  // kg CO2
  emissionsPerKm: number;  // kg CO2 per km
  fuelConsumed: number;    // liters or kWh
  vehicleType: string;
  methodology: string;
  comparison: {
    vsAverage: number;      // percentage vs average car
    vsBest: number;         // percentage vs best option (walking/cycling)
  };
}

/**
 * Calculate CO2 emissions based on distance and transport mode
 * @param distanceKm - Distance in kilometers
 * @param mode - Transport mode (DRIVE, BICYCLE, WALK, TWO_WHEELER, TRANSIT)
 * @returns Emission calculation result
 */
export function calculateCO2Emissions(
  distanceKm: number,
  mode: 'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER' | 'TRANSIT'
): EmissionCalculationResult {
  
  let fuelEfficiency: number;
  let emissionFactor: number;
  let fuelConsumed: number;
  let totalEmissions: number;
  let vehicleDescription: string;
  let occupancyDivider = 1;

  switch (mode) {
    case 'DRIVE':
      // Average petrol car
      fuelEfficiency = FUEL_EFFICIENCY.CAR;
      emissionFactor = EMISSION_FACTORS.PETROL;
      vehicleDescription = 'Car (Petrol)';
      break;

    case 'TWO_WHEELER':
      // Average motorcycle
      fuelEfficiency = FUEL_EFFICIENCY.MOTORCYCLE;
      emissionFactor = EMISSION_FACTORS.PETROL;
      vehicleDescription = 'Motorcycle/Scooter';
      break;

    case 'TRANSIT':
      // Mixed public transport (weighted average of bus and train)
      // Melbourne has a mix of buses, trains, and trams
      fuelEfficiency = FUEL_EFFICIENCY.TRANSIT;
      emissionFactor = (EMISSION_FACTORS.DIESEL * 0.4 + EMISSION_FACTORS.ELECTRICITY * 0.6); // 40% diesel buses, 60% electric trains/trams
      vehicleDescription = 'Public Transport';
      occupancyDivider = TRANSIT_OCCUPANCY;
      break;

    case 'BICYCLE':
    case 'WALK':
      // Zero emissions for active transport
      return {
        totalEmissions: 0,
        emissionsPerKm: 0,
        fuelConsumed: 0,
        vehicleType: mode === 'BICYCLE' ? 'Bicycle' : 'Walking',
        methodology: 'Zero emission - human powered transport',
        comparison: {
          vsAverage: -100,  // 100% better than average
          vsBest: 0         // Same as best option
        }
      };

    default:
      // Default to average car
      fuelEfficiency = FUEL_EFFICIENCY.CAR;
      emissionFactor = EMISSION_FACTORS.PETROL;
      vehicleDescription = 'Vehicle';
  }

  // Calculate fuel consumption
  // Formula: Fuel Consumed (L) = Distance (km) / 100 × Fuel Efficiency (L/100km)
  fuelConsumed = (distanceKm / 100) * fuelEfficiency;
  
  // Calculate CO2 emissions
  // Formula: CO2 (kg) = Fuel Consumed (L) × Emission Factor (kg CO2/L)
  totalEmissions = fuelConsumed * emissionFactor;
  
  // Apply occupancy divider for public transport (emissions per passenger)
  if (occupancyDivider > 1) {
    totalEmissions = totalEmissions / occupancyDivider;
    fuelConsumed = fuelConsumed / occupancyDivider;
  }

  // Calculate emissions per km
  const emissionsPerKm = totalEmissions / distanceKm;

  // Calculate comparison percentages
  const averageCarEmissions = (distanceKm / 100) * FUEL_EFFICIENCY.CAR * EMISSION_FACTORS.PETROL;
  const vsAverage = ((totalEmissions - averageCarEmissions) / averageCarEmissions) * 100;
  const vsBest = totalEmissions > 0 ? 100 : 0;  // If not zero emission, it's 100% worse than best

  return {
    totalEmissions: parseFloat(totalEmissions.toFixed(2)),
    emissionsPerKm: parseFloat(emissionsPerKm.toFixed(3)),
    fuelConsumed: parseFloat(fuelConsumed.toFixed(2)),
    vehicleType: vehicleDescription,
    methodology: `${fuelEfficiency} L/100km × ${emissionFactor.toFixed(2)} kg CO₂/L`,
    comparison: {
      vsAverage: parseFloat(vsAverage.toFixed(1)),
      vsBest: parseFloat(vsBest.toFixed(1))
    }
  };
}

/**
 * Get emission color based on amount
 * @param emissions - CO2 emissions in kg
 * @returns Color code for UI display
 */
export function getEmissionColor(emissions: number): string {
  if (emissions === 0) return '#48BB78';      // Green for zero
  if (emissions < 1) return '#68D391';        // Light green for very low
  if (emissions < 3) return '#F6E05E';        // Yellow for low
  if (emissions < 5) return '#ED8936';        // Orange for medium
  return '#E53E3E';                           // Red for high
}

/**
 * Get emission rating based on amount
 * @param emissions - CO2 emissions in kg
 * @returns Rating text
 */
export function getEmissionRating(emissions: number): string {
  if (emissions === 0) return 'Zero Emission! 🌟';
  if (emissions < 1) return 'Excellent 🟢';
  if (emissions < 3) return 'Good 🟡';
  if (emissions < 5) return 'Moderate 🟠';
  return 'High 🔴';
}

/**
 * Format emission value for display
 * @param emissions - CO2 emissions in kg
 * @returns Formatted string
 */
export function formatEmissions(emissions: number): string {
  if (emissions === 0) return '0';
  if (emissions < 0.1) return `${(emissions * 1000).toFixed(0)}g`;
  return `${emissions.toFixed(2)}kg`;
}
