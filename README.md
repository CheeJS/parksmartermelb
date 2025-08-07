# ParkSmarter Melbourne - Full Stack Application

A comprehensive parking management system for Melbourne with real-time parking availability, historical trends, and environmental impact tracking.

## Project Structure

```
Project/
├── backend/                 # Backend API (Express.js)
│   ├── src/
│   │   ├── index.js        # Main server file
│   │   └── routes/         # API routes
│   ├── config/             # Configuration files
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/               # Frontend React Application
│   ├── src/
│   │   ├── pages/          # React pages/components
│   │   │   ├── HomePage.tsx
│   │   │   ├── RealTimeParking.tsx
│   │   │   ├── HistoricalTrends.tsx
│   │   │   ├── EnvironmentalImpact.tsx
│   │   │   └── AboutUs.tsx
│   │   └── styles/         # Styled components
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
└── package.json            # Root package.json for workspace management
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MySQL database (for backend)

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

   Or install individually:
   ```bash
   npm run install:backend
   npm run install:frontend
   ```

2. **Setup Backend Environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

### Development

1. **Start Backend Server:**
   ```bash
   npm run start:backend
   ```
   Backend will run on http://localhost:5000

2. **Start Frontend Application:**
   ```bash
   npm run start:frontend
   ```
   Frontend will run on http://localhost:3000

### Production

1. **Build Frontend:**
   ```bash
   npm run build:frontend
   ```

2. **Start Production Server:**
   ```bash
   npm run start:prod
   ```

## Features

- **Real-time Parking Data**: Live parking availability across Melbourne
- **Historical Trends**: Analysis of parking patterns over time
- **Environmental Impact**: Carbon footprint tracking and optimization
- **Interactive Maps**: Visual representation of parking locations
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- Express.js
- MySQL
- CORS middleware
- dotenv for environment management

### Frontend
- React 18 with TypeScript
- Styled Components
- React Router
- Leaflet for maps
- Chart.js for data visualization

## API Endpoints

- `GET /` - API status
- `GET /health` - Health check
- More endpoints will be documented as they are implemented

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request