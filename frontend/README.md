# ParkSmarter Melbourne

A modern web application by Krusty Peak team that helps Melbourne commuters find real-time parking, understand car ownership trends, and make eco-friendly travel decisions.

## 🌟 Features

- **Real-time Parking Availability**
  - Live sensor data integration
  - Interactive map of Melbourne CBD
  - Parking bay overlays with availability status

- **Historical Analysis**
  - Car ownership trends visualization
  - Population growth patterns
  - Historical parking occupancy data

- **Eco-friendly Features**
  - Carbon footprint comparison
  - Green parking area highlights
  - Sustainable transport recommendations

- **Smart Predictions**
  - Congestion forecasting
  - Peak time predictions
  - Optimal parking suggestions

## 🚀 Tech Stack

- React 18 with TypeScript
- React Router for navigation
- Styled Components for styling
- Chart.js for data visualization
- Leaflet for interactive maps

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/CheeJS/parksmarter-melb.git
   cd parksmarter-melb
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 📁 Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  │   ├── HomePage
  │   ├── RealTimeParking
  │   ├── HistoricalTrends
  │   ├── EnvironmentalImpact
  │   └── AboutUs
  ├── styles/        # Global styles and theme
  ├── utils/         # Helper functions
  ├── types/         # TypeScript definitions
  └── App.tsx        # Main application component
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_MAPBOX_TOKEN=your_mapbox_token
```

## 👥 Team

Built with 💚 by Crusty Peak team

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.