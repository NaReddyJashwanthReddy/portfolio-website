import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import App from './App';
import MotionPortfolio from './MotionPortfolio';
import SkygardenPortfolio from './SkygardenPortfolio';
import './index.css';

function PortfolioEntry() {
  const { pathname } = useLocation();
  if (pathname === '/') return <SkygardenPortfolio />;
  if (pathname === '/motion') return <MotionPortfolio />;
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><PortfolioEntry /></BrowserRouter></React.StrictMode>,
);
