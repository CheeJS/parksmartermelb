const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
};

// Create database connection pool
const pool = mysql.createPool(dbConfig);

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'ParkSmarter Melbourne API is running!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();
    
    // Query the available_parking table
    const [rows] = await connection.query('SELECT * FROM available_parking LIMIT 5');
    // Print the data to the terminal
    console.log('\nParking Availability Data:');
    console.log('=========================');
    console.table(rows);
    
    // Release the connection back to the pool
    connection.release();
    
    res.json({
      status: 'success',
      message: 'Database query successful',
      data: rows
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Check database tables endpoint
app.get('/db-tables', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get all table names
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('\nDatabase Tables:');
    console.log('===============');
    console.table(tables);
    
    connection.release();
    
    res.json({
      status: 'success',
      message: 'Tables retrieved successfully',
      tables: tables
    });
  } catch (error) {
    console.error('Database tables error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve tables',
      error: error.message
    });
  }
});

// Check public transport data endpoint
app.get('/test-transport', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Query the public_transport_stops table
    const [transportData] = await connection.query('SELECT * FROM public_transport_stops LIMIT 5');
    const [columns] = await connection.query('DESCRIBE public_transport_stops');
    
    console.log('\nPublic Transport Data Sample:');
    console.log('============================');
    console.table(transportData);
    
    console.log('\nTable Structure for public_transport_stops:');
    console.log('==========================================');
    console.table(columns);
    
    connection.release();
    
    res.json({
      status: 'success',
      message: 'Transport data retrieved successfully',
      tableName: 'public_transport_stops',
      sampleData: transportData,
      tableStructure: columns
    });
  } catch (error) {
    console.error('Transport data error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve transport data',
      error: error.message
    });
  }
});

// Distance calculation function
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Public transport stops API endpoint
app.post('/api/transport-stops', async (req, res) => {
  try {
    const { latitude, longitude, radius = 2 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    console.log(`🔍 Searching for transport stops near ${latitude}, ${longitude} within ${radius}km`);

    const connection = await pool.getConnection();
    
    // Calculate approximate lat/lon delta for the radius
    const latDelta = radius / 111; // Rough conversion: 1 degree lat ≈ 111km
    const lonDelta = radius / (111 * Math.cos(latitude * Math.PI / 180));

    // Query the public_transport_stops table
    const query = `
      SELECT 
        id,
        stop_id,
        stop_name,
        transport_type,
        stop_lat,
        stop_lon
      FROM public_transport_stops
      WHERE 
        ABS(stop_lat - ?) <= ? 
        AND ABS(stop_lon - ?) <= ?
      ORDER BY 
        (stop_lat - ?) * (stop_lat - ?) + (stop_lon - ?) * (stop_lon - ?)
      LIMIT 50
    `;

    const [transportStops] = await connection.query(query, [
      latitude, latDelta, longitude, lonDelta,
      latitude, latitude, longitude, longitude
    ]);

    console.log(`✅ Found ${transportStops.length} stops from public_transport_stops table`);

    connection.release();

    // Calculate actual distances and filter/sort
    if (transportStops.length > 0) {
      const stopsWithDistance = transportStops
        .map(stop => ({
          ...stop,
          distanceMeters: calculateDistance(
            latitude, 
            longitude, 
            parseFloat(stop.stop_lat), 
            parseFloat(stop.stop_lon)
          )
        }))
        .filter(stop => stop.distanceMeters <= radius * 1000) // Convert km to meters
        .sort((a, b) => a.distanceMeters - b.distanceMeters);

      console.log(`🚌 Returning ${stopsWithDistance.length} transport stops within ${radius}km`);
      
      res.json(stopsWithDistance);
    } else {
      console.log('⚠️  No transport stops found, returning empty array');
      res.json([]);
    }

  } catch (error) {
    console.error('❌ Error fetching transport stops:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Parking recommendations API endpoint
app.post('/api/parking-recommendations', async (req, res) => {
  try {
    const { destinationLat, destinationLng, radius = 1 } = req.body;

    if (!destinationLat || !destinationLng) {
      return res.status(400).json({ 
        error: 'Destination latitude and longitude are required' 
      });
    }

    console.log(`🅿️ Finding parking near ${destinationLat}, ${destinationLng} within ${radius}km`);

    const connection = await pool.getConnection();
    
    // Calculate approximate lat/lon delta for the radius
    const latDelta = radius / 111; // Rough conversion: 1 degree lat ≈ 111km
    const lonDelta = radius / (111 * Math.cos(destinationLat * Math.PI / 180));

    // Query parking spots from available_parking_live table
    const parkingQuery = `
      SELECT 
        RoadSegmentDescription,
        available_parks,
        Latitude,
        Longitude,
        Restriction_Days,
        Restriction_Start,
        Restriction_End,
        Restriction_Display
      FROM available_parking_live
      WHERE 
        ABS(Latitude - ?) <= ? 
        AND ABS(Longitude - ?) <= ?
        AND available_parks > 0
      ORDER BY 
        (Latitude - ?) * (Latitude - ?) + (Longitude - ?) * (Longitude - ?)
      LIMIT 10
    `;

    const [parkingSpots] = await connection.query(parkingQuery, [
      destinationLat, latDelta, destinationLng, lonDelta,
      destinationLat, destinationLat, destinationLng, destinationLng
    ]);

    // Also get nearby transport stops
    const transportQuery = `
      SELECT 
        id,
        stop_id,
        stop_name,
        transport_type,
        stop_lat,
        stop_lon
      FROM public_transport_stops
      WHERE 
        ABS(stop_lat - ?) <= ? 
        AND ABS(stop_lon - ?) <= ?
      LIMIT 20
    `;

    const [transportStops] = await connection.query(transportQuery, [
      destinationLat, latDelta * 2, destinationLng, lonDelta * 2
    ]);

    connection.release();

    // Process parking spots and find nearby transport
    const parkingRecommendations = parkingSpots.map((spot, index) => {
      const spotLat = parseFloat(spot.Latitude);
      const spotLng = parseFloat(spot.Longitude);
      
      // Find transport stops within 250m of this parking spot
      const nearbyStops = transportStops.filter(stop => {
        const distance = calculateDistance(spotLat, spotLng, parseFloat(stop.stop_lat), parseFloat(stop.stop_lon));
        return distance <= 250;
      });
      
      // Find closest transport stop
      let walkToNearestTransit = Infinity;
      if (transportStops.length > 0) {
        walkToNearestTransit = Math.min(
          ...transportStops.map(stop => 
            calculateDistance(spotLat, spotLng, parseFloat(stop.stop_lat), parseFloat(stop.stop_lon))
          )
        );
      }
      
      // Distance from destination
      const distanceFromDestination = calculateDistance(
        spotLat, spotLng, destinationLat, destinationLng
      );
      
      console.log(`🅿️ Processing spot: ${spot.RoadSegmentDescription}`);
      console.log(`   Available parks: ${spot.available_parks}`);
      console.log(`   Nearby stops (${nearbyStops.length}):`, nearbyStops.map(s => `${s.stop_name} (${s.transport_type})`));
      console.log(`   Walk to nearest: ${Math.round(walkToNearestTransit)}m`);

      return {
        id: `parking_${index + 1}`,
        name: spot.RoadSegmentDescription,
        lat: spotLat,
        lng: spotLng,
        type: nearbyStops.length > 0 ? 'Transit Hub' : 'Street Parking',
        available: spot.available_parks > 0,
        availableSpots: spot.available_parks,
        totalSpots: spot.available_parks + 10, // Estimate total (can be updated if you have total spots in DB)
        price: spot.Restriction_Display,
        isEcoFriendly: walkToNearestTransit <= 250, // Eco-friendly if within 250m of transport
        nearbyStops,
        walkToNearestTransit: Math.round(walkToNearestTransit),
        distanceFromDestination: Math.round(distanceFromDestination),
        restrictionDays: spot.Restriction_Days,
        restrictionStart: spot.Restriction_Start,
        restrictionEnd: spot.Restriction_End
      };
    });

    // Sort by eco-friendliness first, then by distance from destination
    const sortedRecommendations = parkingRecommendations.sort((a, b) => {
      if (a.isEcoFriendly !== b.isEcoFriendly) {
        return b.isEcoFriendly ? 1 : -1; // Eco-friendly first
      }
      return a.distanceFromDestination - b.distanceFromDestination;
    });

    console.log(`🅿️ Returning ${sortedRecommendations.length} parking recommendations`);
    
    res.json(sortedRecommendations.slice(0, 3)); // Limit to 3 recommendations

  } catch (error) {
    console.error('❌ Error fetching parking recommendations:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Homepage statistics API endpoint
app.get('/api/home-stats', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get total available parking spots
    const [availableSpots] = await connection.query(
      'SELECT SUM(available_parks) as total_available FROM available_parking WHERE available_parks > 0'
    );
    
    // Get total parking locations
    const [totalLocations] = await connection.query(
      'SELECT COUNT(*) as total_locations FROM available_parking'
    );
    
    // Get locations with available spots
    const [locationsWithSpots] = await connection.query(
      'SELECT COUNT(*) as locations_with_spots FROM available_parking WHERE available_parks > 0'
    );
    
    // Get total transport stops
    const [transportStops] = await connection.query(
      'SELECT COUNT(*) as total_stops FROM public_transport_stops'
    );
    
    // Get transport types
    const [transportTypes] = await connection.query(
      'SELECT DISTINCT transport_type, COUNT(*) as count FROM public_transport_stops GROUP BY transport_type'
    );
    
    connection.release();
    
    const stats = {
      totalAvailableSpots: availableSpots[0].total_available || 0,
      totalLocations: totalLocations[0].total_locations || 0,
      locationsWithSpots: locationsWithSpots[0].locations_with_spots || 0,
      totalTransportStops: transportStops[0].total_stops || 0,
      transportTypes: transportTypes,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('📊 Homepage stats:', stats);
    
    res.json({
      status: 'success',
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching homepage stats:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Simple parking search API endpoint (without transit info)
app.post('/api/simple-parking-search', async (req, res) => {
  try {
    const { destinationLat, destinationLng, radius = 1 } = req.body;

    if (!destinationLat || !destinationLng) {
      return res.status(400).json({ 
        error: 'Destination latitude and longitude are required' 
      });
    }

    console.log(`🔍 Simple parking search near ${destinationLat}, ${destinationLng} within ${radius}km`);

    const connection = await pool.getConnection();
    
    // Calculate approximate lat/lon delta for the radius
    const latDelta = radius / 111; // Rough conversion: 1 degree lat ≈ 111km
    const lonDelta = radius / (111 * Math.cos(destinationLat * Math.PI / 180));

    // Query parking spots from available_parking_live table
    const parkingQuery = `
      SELECT 
        RoadSegmentDescription,
        available_parks,
        Latitude,
        Longitude,
        Restriction_Days,
        Restriction_Start,
        Restriction_End,
        Restriction_Display
      FROM available_parking_live
      WHERE 
        ABS(Latitude - ?) <= ? 
        AND ABS(Longitude - ?) <= ?
      ORDER BY 
        available_parks DESC,
        (Latitude - ?) * (Latitude - ?) + (Longitude - ?) * (Longitude - ?)
      LIMIT 15
    `;

    const [parkingSpots] = await connection.query(parkingQuery, [
      destinationLat, latDelta, destinationLng, lonDelta,
      destinationLat, destinationLat, destinationLng, destinationLng
    ]);

    connection.release();

    // Process parking spots with simplified data
    const simpleParkingResults = parkingSpots.map((spot, index) => {
      const spotLat = parseFloat(spot.Latitude);
      const spotLng = parseFloat(spot.Longitude);
      
      // Calculate distance from destination
      const distanceFromDestination = calculateDistance(
        spotLat, spotLng, destinationLat, destinationLng
      );
      
      return {
        id: `simple_parking_${index + 1}`,
        name: spot.RoadSegmentDescription,
        availableSpots: spot.available_parks,
        distanceFromDestination: Math.round(distanceFromDestination),
        restrictionDays: spot.Restriction_Days,
        restrictionStart: spot.Restriction_Start,
        restrictionEnd: spot.Restriction_End,
        price: spot.Restriction_Display,
        longitude: spot.Longitude,
        latitude: spot.Latitude
      };
    });

    console.log(`🅿️ Returning ${simpleParkingResults.length} simple parking results`);
    
    res.json({
      status: 'success',
      data: simpleParkingResults
    });

  } catch (error) {
    console.error('❌ Error in simple parking search:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Top parking spots API endpoint
app.get('/api/top-parking', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get parking spots with highest availability
    const query = `
      SELECT 
        RoadSegmentDescription,
        available_parks,
        Restriction_Display
      FROM available_parking_live
      WHERE available_parks > 0
      ORDER BY available_parks DESC
      LIMIT 5
    `;

    const [topSpots] = await connection.query(query);
    
    connection.release();

    const topParkingResults = topSpots.map((spot, index) => ({
      id: `top_parking_${index + 1}`,
      name: spot.RoadSegmentDescription,
      availableSpots: spot.available_parks,
      totalSpots: spot.available_parks + Math.floor(Math.random() * 5) + 5, // Estimate total
      price: spot.Restriction_Display
    }));

    console.log(`🏆 Returning ${topParkingResults.length} top parking spots`);
    
    res.json({
      status: 'success',
      data: topParkingResults
    });

  } catch (error) {
    console.error('❌ Error fetching top parking spots:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Car Ownership Analysis API endpoints
// Simple test endpoint to verify basic functionality
app.get('/api/simple-test', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get just a few rows from each table to see what we're working with
    const [popTest] = await connection.query('SELECT * FROM population LIMIT 3');
    const [vehicleTest] = await connection.query('SELECT * FROM vehicle_census LIMIT 3');
    
    connection.release();
    
    // Create simple mock calculation for testing
    const mockAnalysis = {
      populationData: [
        { year: 2019, population: 5000000 },
        { year: 2020, population: 5100000 },
        { year: 2021, population: 5200000 }
      ],
      vehicleData: [
        { year: 2019, registrations: 3800000 },
        { year: 2020, registrations: 3900000 },
        { year: 2021, registrations: 4000000 }
      ],
      ownershipRates: [
        { year: 2019, rate: 760.0, population: 5000000, vehicles: 3800000 },
        { year: 2020, rate: 764.7, population: 5100000, vehicles: 3900000 },
        { year: 2021, rate: 769.2, population: 5200000, vehicles: 4000000 }
      ],
      metrics: {
        currentRate: 769.2,
        growthRate: 1.2,
        totalVehicles: 4000000,
        projectedImpact: 884.6
      },
      rawData: {
        populationSample: popTest,
        vehicleSample: vehicleTest
      }
    };
    
    res.json({
      status: 'success',
      data: mockAnalysis
    });

  } catch (error) {
    console.error('❌ Error in simple test:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Test data retrieval with simplified queries
app.get('/api/test-data-retrieval', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🧪 Testing data retrieval with various approaches...');
    
    // Try different approaches for population data
    console.log('📊 Testing population data queries...');
    
    // Approach 1: Basic query
    const [pop1] = await connection.query('SELECT * FROM population LIMIT 5');
    console.log('Population approach 1 (basic):', pop1);
    
    // Approach 2: Try with backticks
    const [pop2] = await connection.query('SELECT `year`, `victoria` FROM population LIMIT 5');
    console.log('Population approach 2 (with backticks):', pop2);
    
    // Approach 3: Check for case sensitivity
    try {
      const [pop3] = await connection.query('SELECT year, Victoria FROM population LIMIT 5');
      console.log('Population approach 3 (Victoria case):', pop3);
    } catch (e) {
      console.log('Population approach 3 failed:', e.message);
    }
    
    // Try different approaches for vehicle data
    console.log('🚗 Testing vehicle data queries...');
    
    // Approach 1: Basic query
    const [veh1] = await connection.query('SELECT * FROM vehicle_census LIMIT 5');
    console.log('Vehicle approach 1 (basic):', veh1);
    
    // Approach 2: Try with backticks
    try {
      const [veh2] = await connection.query('SELECT `myunknowncolumn`, `1` FROM vehicle_census LIMIT 5');
      console.log('Vehicle approach 2 (with backticks):', veh2);
    } catch (e) {
      console.log('Vehicle approach 2 failed:', e.message);
    }
    
    connection.release();
    
    res.json({
      status: 'success',
      data: {
        populationTests: {
          basic: pop1,
          withBackticks: pop2
        },
        vehicleTests: {
          basic: veh1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error testing data retrieval:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Debug raw data endpoint
app.get('/api/debug-data', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Get raw population data
    const [rawPopulation] = await connection.query('SELECT * FROM population LIMIT 10');
    
    // Get raw vehicle data
    const [rawVehicle] = await connection.query('SELECT * FROM vehicle_census LIMIT 10');
    
    // Try different column names for population
    const [popColumns] = await connection.query('SHOW COLUMNS FROM population');
    const [vehicleColumns] = await connection.query('SHOW COLUMNS FROM vehicle_census');
    
    connection.release();
    
    console.log('🔍 Raw population data:', rawPopulation);
    console.log('🔍 Raw vehicle data:', rawVehicle);
    console.log('📊 Population columns:', popColumns);
    console.log('🚗 Vehicle columns:', vehicleColumns);
    
    res.json({
      status: 'success',
      data: {
        rawPopulation,
        rawVehicle,
        populationColumns: popColumns,
        vehicleColumns: vehicleColumns
      }
    });

  } catch (error) {
    console.error('❌ Error debugging data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Check table structures endpoint
app.get('/api/check-tables', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Check population table structure
    const [popColumns] = await connection.query('DESCRIBE population');
    
    // Check vehicle_census table structure  
    const [vehicleColumns] = await connection.query('DESCRIBE vehicle_census');
    
    // Get sample data from both tables
    const [popSample] = await connection.query('SELECT * FROM population ORDER BY year LIMIT 5');
    const [vehicleSample] = await connection.query('SELECT * FROM vehicle_census LIMIT 10');
    
    // Get all column names for population table
    const [popColumnNames] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'population' 
      ORDER BY ORDINAL_POSITION
    `);
    
    // Get all column names for vehicle_census table
    const [vehicleColumnNames] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'vehicle_census' 
      ORDER BY ORDINAL_POSITION
    `);
    
    connection.release();
    
    console.log('📊 Population table columns:', popColumnNames.map(c => c.COLUMN_NAME));
    console.log('🚗 Vehicle census table columns:', vehicleColumnNames.map(c => c.COLUMN_NAME));
    console.log('📊 Population sample data:', popSample);
    console.log('🚗 Vehicle sample data:', vehicleSample);
    
    res.json({
      status: 'success',
      data: {
        population: {
          columns: popColumns,
          columnNames: popColumnNames.map(c => c.COLUMN_NAME),
          sample: popSample,
          totalRows: popSample.length
        },
        vehicle_census: {
          columns: vehicleColumns,
          columnNames: vehicleColumnNames.map(c => c.COLUMN_NAME),
          sample: vehicleSample,
          totalRows: vehicleSample.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error checking tables:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Population data endpoint
app.get('/api/population', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Query the population table - use Victoria column for Melbourne data
    const [populationData] = await connection.query(`
      SELECT \`year\`, \`victoria\` as population 
      FROM population 
      WHERE \`year\` IS NOT NULL 
      AND \`victoria\` IS NOT NULL 
      AND \`year\` != 'year'
      AND \`victoria\` != 'victoria'
      AND \`year\` REGEXP '^[0-9]{4}$'
      ORDER BY CAST(\`year\` as UNSIGNED) ASC
    `);
    
    // Convert string values to numbers
    const processedData = populationData.map(row => ({
      year: parseInt(row.year),
      population: parseInt(row.population.toString().replace(/,/g, '')) // Remove commas if present
    })).filter(row => !isNaN(row.year) && !isNaN(row.population));
    
    connection.release();
    
    console.log(`📊 Retrieved ${processedData.length} Victoria population records`);
    console.log('📊 Sample data:', processedData.slice(0, 3));
    
    res.json({
      status: 'success',
      data: processedData
    });

  } catch (error) {
    console.error('❌ Error fetching population data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Vehicle census data endpoint
app.get('/api/vehicle-census', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Query the vehicle_census table - skip header row and use column "1" for registrations
    const [vehicleData] = await connection.query(`
      SELECT \`myunknowncolumn\` as year, \`1\` as registrations 
      FROM vehicle_census 
      WHERE \`myunknowncolumn\` != 'myunknowncolumn' 
      AND \`myunknowncolumn\` IS NOT NULL 
      AND \`1\` IS NOT NULL
      AND \`myunknowncolumn\` REGEXP '^[0-9]{4}$'
      AND \`1\` REGEXP '^[0-9]+$'
      ORDER BY CAST(\`myunknowncolumn\` as UNSIGNED) ASC
    `);
    
    // Convert string values to numbers
    const processedData = vehicleData.map(row => ({
      year: parseInt(row.year),
      registrations: parseInt(row.registrations.toString().replace(/,/g, '')) // Remove commas if present
    })).filter(row => !isNaN(row.year) && !isNaN(row.registrations));
    
    connection.release();
    
    console.log(`🚗 Retrieved ${processedData.length} vehicle census records`);
    console.log('🚗 Sample data:', processedData.slice(0, 3));
    
    res.json({
      status: 'success',
      data: processedData
    });

  } catch (error) {
    console.error('❌ Error fetching vehicle census data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Simplified car ownership rate calculation
app.get('/api/car-ownership-analysis', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔄 Calculating car ownership rates...');
    
    // Get population data - try Victoria column
    const [popData] = await connection.query(`
      SELECT \`year\`, \`victoria\` as population 
      FROM population 
      WHERE \`year\` IS NOT NULL AND \`victoria\` IS NOT NULL
      ORDER BY CAST(\`year\` as UNSIGNED) ASC
    `);
    
    // Get vehicle data - use the specified column names
    const [vehData] = await connection.query(`
      SELECT \`myunknowncolumn\` as year, \`1\` as registrations 
      FROM vehicle_census 
      WHERE \`myunknowncolumn\` IS NOT NULL AND \`1\` IS NOT NULL
      AND \`myunknowncolumn\` REGEXP '^[0-9]{4}$'
      ORDER BY CAST(\`myunknowncolumn\` as UNSIGNED) ASC
    `);
    
    connection.release();
    
    // Clean and process the data
    const populationData = popData.map(row => ({
      year: parseInt(row.year),
      population: parseInt(row.population?.toString().replace(/,/g, ''))
    })).filter(row => !isNaN(row.year) && !isNaN(row.population));
    
    const vehicleData = vehData.map(row => ({
      year: parseInt(row.year),
      registrations: parseInt(row.registrations?.toString().replace(/,/g, ''))
    })).filter(row => !isNaN(row.year) && !isNaN(row.registrations));
    
    console.log(`📊 Population data: ${populationData.length} records`);
    console.log(`🚗 Vehicle data: ${vehicleData.length} records`);
    
    // Calculate ownership rates for overlapping years
    const ownershipRates = [];
    
    // Calculate ownership rates: (vehicles / population) × 1000
    vehicleData.forEach(vehicleYear => {
      const populationYear = populationData.find(pop => pop.year === vehicleYear.year);
      
      if (populationYear) {
        const rate = (vehicleYear.registrations / populationYear.population) * 1000;
        
        console.log(`📈 ${vehicleYear.year}: ${vehicleYear.registrations.toLocaleString()} vehicles ÷ ${populationYear.population.toLocaleString()} population = ${rate.toFixed(1)} per 1,000`);
        
        ownershipRates.push({
          year: vehicleYear.year,
          rate: Math.round(rate * 10) / 10,
          population: populationYear.population,
          vehicles: vehicleYear.registrations
        });
      }
    });
    
    console.log(`📈 Calculated ${ownershipRates.length} ownership rates`);
    
    // Simple metrics
    const metrics = ownershipRates.length > 0 ? {
      currentRate: ownershipRates[ownershipRates.length - 1].rate,
      growthRate: 0,
      totalVehicles: ownershipRates[ownershipRates.length - 1].vehicles,
      projectedImpact: 0
    } : {
      currentRate: 0,
      growthRate: 0,
      totalVehicles: 0,
      projectedImpact: 0
    };
    
    res.json({
      status: 'success',
      data: {
        populationData,
        vehicleData,
        ownershipRates,
        metrics
      }
    });

  } catch (error) {
    console.error('❌ Error fetching car ownership analysis:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// API routes will be added here
// Test database connection endpoint
app.get('/api/parking', async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();
    
    // Query the available_parking table
    const [rows] = await connection.query('SELECT * FROM available_parking');
    
    // Release the connection back to the pool
    connection.release();
    
    res.json({
      status: 'success',
      message: 'Database query successful',
      data: rows
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.get('/api/live', async (req, res) => {
  try {
    // Get a connection from the pool
    const connection = await pool.getConnection();
    
    // Query the available_parking table
    const [rows] = await connection.query('SELECT * FROM bay_sensors_test');
    
    // Release the connection back to the pool
    connection.release();
    
    res.json({
      status: 'success',
      message: 'Database query successful',
      data: rows
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});