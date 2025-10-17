/**
 * Madza AI Healthcare Platform - Main Application
 * Copyright (c) 2025 Madza AI Healthcare Platform. All rights reserved.
 * 
 * PROPRIETARY SOFTWARE - UNAUTHORIZED USE PROHIBITED
 * This is the main React application component that provides routing
 * and theme configuration for the healthcare platform.
 * 
 * For licensing information, contact: licensing@madzahealthcare.com
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import LeftNavigation from './components/LeftNavigation';
import Dashboard from './components/Dashboard';
import PatientRegistration from './components/PatientRegistration';
import PatientManagement from './components/PatientManagement';
import ClaimProcessing from './components/ClaimProcessing';
import ClaimManagement from './components/ClaimManagement';
import EOBManagement from './components/EOBManagement';
import Observability from './components/Observability';
import AgentStatus from './components/AgentStatus';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#5ce1ff',
      dark: '#00a3cc',
    },
    secondary: {
      main: '#ff6b6b',
      light: '#ff8e8e',
      dark: '#e53e3e',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      background: 'linear-gradient(45deg, #00d4ff, #ff6b6b)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(0, 212, 255, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

function App() {
  const [selectedTab, setSelectedTab] = useState('dashboard');

  const renderContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'patient-registration':
        return <PatientRegistration />;
      case 'patient-management':
        return <PatientManagement />;
      case 'claim-processing':
        return <ClaimProcessing />;
      case 'claim-management':
        return <ClaimManagement />;
      case 'eob-management':
        return <EOBManagement />;
      case 'observability':
        return <Observability />;
      case 'agent-status':
        return <AgentStatus />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
          <LeftNavigation selectedTab={selectedTab} onTabChange={setSelectedTab} />
          <Box sx={{ flexGrow: 1, p: 3, ml: '280px', pb: 8 }}>
            {renderContent()}
          </Box>
          <Chatbot />
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
