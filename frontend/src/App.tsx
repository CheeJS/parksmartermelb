import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import styled from 'styled-components';
import HomePage from './pages/HomePage';
import RealTimeParking from './pages/RealTimeParking';
import HistoricalTrends from './pages/HistoricalTrends';
import EnvironmentalImpact from './pages/EnvironmentalImpact';
import AboutUs from './pages/AboutUs';

const AppContainer = styled.div`
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const NavBar = styled.nav`
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  color: #2C5282;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: #2B6CB0;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
`;

const NavLink = styled(Link)`
  color: #4A5568;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #2C5282;
  }
`;

const MainContent = styled.main`
  padding-top: 4rem;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <NavBar>
          <NavContainer>
            <Logo to="/">
              <span role="img" aria-label="parking">🅿️</span>
              ParkSmart Melbourne
            </Logo>
            <NavLinks>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/parking">Parking Availability</NavLink>
              <NavLink to="/trends">Historical Trends</NavLink>
              <NavLink to="/impact">Environmental Impact</NavLink>
              <NavLink to="/about">About Us</NavLink>
            </NavLinks>
          </NavContainer>
        </NavBar>
        <MainContent>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/parking" element={<RealTimeParking />} />
            <Route path="/trends" element={<HistoricalTrends />} />
            <Route path="/impact" element={<EnvironmentalImpact />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;