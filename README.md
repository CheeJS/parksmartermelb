# ParkSmarter Melbourne - Full Stack Parking Solution

A comprehensive parking management system for Melbourne providing real-time parking availability, intelligent parking search, and environmental impact tracking.

## Project Overview

ParkSmarter Melbourne helps drivers find optimal parking spots while tracking environmental benefits of smarter transportation choices. The application integrates real-time parking data with Google Maps to provide an intuitive search experience.

## Project Structure

```
parksmartermelb/
├── backend/                    # Node.js/Express API Server
│   ├── src/
│   │   └── index.js           # Main server with parking data endpoints
│   ├── package.json           # Backend dependencies
│   └── .gitignore
├── frontend/                   # React/TypeScript Application
│   ├── src/
│   │   ├── pages/             # Main application pages
│   │   │   ├── HomePage.tsx   # Interactive parking search & map
│   │   │   ├── HistoricalTrends.tsx # Parking usage analytics
│   │   │   ├── EnvironmentalImpact.tsx # CO2 tracking & route optimization
│   │   │   └── AboutUs.tsx    # Company information & contact
│   │   ├── services/          # API communication & data processing
│   │   │   ├── historicalTrendsService.ts
│   │   │   ├── publicTransportService.ts
│   │   │   └── routesService.ts
│   │   ├── utils/
│   │   │   └── emissionCalculator.ts # CO2 calculations
│   │   ├── styles/
│   │   │   └── Map.css        # Leaflet map styling
│   │   ├── App.tsx            # Main app with routing
│   │   └── index.tsx          # React entry point
│   ├── public/                # Static assets
│   │   ├── index.html
│   │   ├── KrustyPeakLogo.png
│   │   └── manifest.json
│   ├── package.json           # Frontend dependencies
│   └── .env                   # Environment configuration
└── package.json               # Root workspace configuration
```

## Core Features

### 🚗 Intelligent Parking Search
- **Real-time Availability**: Live parking spot data across Melbourne
- **Interactive Map**: Leaflet-powered map with parking location markers  
- **Smart Search**: Google Places autocomplete for destination search
- **Parking Types**: On-street meters, off-street lots, and accessible spots
- **Distance & Pricing**: Walking distance and cost information

### 📊 Analytics & Insights
- **Historical Trends**: Parking usage patterns and car ownership analysis
- **Environmental Impact**: CO2 emissions tracking and route optimization
- **Data Visualization**: Chart.js powered charts and statistics

### 🗺️ Interactive Map Features
- **Multi-layer Display**: Toggle between overview and detailed parking views
- **Smart Markers**: Distinct icons for different parking types
- **Location Services**: Current location detection and destination marking
- **Legend System**: Dynamic legend showing available parking types

### 🌱 Environmental Focus
- **Carbon Tracking**: Calculate CO2 savings from optimal parking choices
- **Route Optimization**: Compare driving vs. public transport options
- **Impact Metrics**: Environmental benefits visualization

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Styled Components** for component-based styling
- **React Router** for navigation
- **Leaflet** for interactive maps
- **Chart.js** with react-chartjs-2 for data visualization
- **Google Maps API** for places autocomplete
- **Responsive Design** optimized for mobile and desktop

### Backend  
- **Node.js** with Express.js framework
- **MySQL** database for parking data storage
- **CORS** enabled for cross-origin requests
- **Azure** cloud database hosting

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Maps API key
- MySQL database access

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CheeJS/parksmartermelb.git
   cd parksmartermelb
   ```

2. **Install dependencies:**
   ```bash
   # Install all dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies  
   cd ../frontend && npm install
   ```

3. **Environment Configuration:**
   ```bash
   # Frontend .env file
   cd frontend
   echo "REACT_APP_API_URL=http://localhost:5000" > .env
   echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key" >> .env
   ```

### Development

1. **Start Backend Server:**
   ```bash
   cd backend
   node src/index.js
   ```
   Server runs on http://localhost:5000

2. **Start Frontend Application:**
   ```bash
   cd frontend  
   npm start
   ```
   Application runs on http://localhost:3000

### Production Build

```bash
cd frontend
npm run build
```

## API Endpoints

### Parking Data
- `GET /` - API status and welcome message
- `GET /health` - Health check endpoint
- `GET /api/on-street` - On-street parking meters data
- `GET /api/off-street` - Off-street parking lots data  
- `GET /api/accessible` - Accessible parking spots data

### Data Sources
- **City of Melbourne** parking datasets
- **Real-time sensors** for availability status
- **Google Maps** for location services

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Backend
Configure database connection and API keys as needed.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Notes

- **Local Development**: Ensure backend runs on port 5000 for frontend API calls
- **Map Integration**: Leaflet maps require proper CSS imports
- **Google Maps**: Valid API key required for autocomplete functionality
- **Responsive Design**: All components optimized for mobile-first approach

## License

This project is licensed under the MIT License.

## Contact

**KrustyPeak Development Team**
- Email: krustypeak@gmail.com
- Website: [ParkSmarter Melbourne](https://parksmartermelb.me)