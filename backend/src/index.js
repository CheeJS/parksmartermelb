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
    const [rows] = await connection.query('SELECT * FROM available_parking');
    
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

app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});