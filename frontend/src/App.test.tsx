import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders ParkSmart Melbourne title', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const titleElement = screen.getByText(/ParkSmart Melbourne/i);
  expect(titleElement).toBeInTheDocument();
});