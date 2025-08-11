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