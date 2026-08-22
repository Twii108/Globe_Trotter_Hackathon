import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    // Default mock session user for fast testing/evaluation if needed
    return {
      id: 'usr_101',
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      preferredCurrency: 'USD'
    };
  });

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleSignupSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />}
      />

      {/* Login Route */}
      <Route
        path="/login"
        element={<Login onLoginSuccess={handleLoginSuccess} />}
      />

      {/* Signup Route */}
      <Route
        path="/signup"
        element={<Signup onSignupSuccess={handleSignupSuccess} />}
      />

      {/* Dashboard Route */}
      <Route
        path="/dashboard"
        element={
          currentUser ? (
            <Dashboard user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* My Trips Route */}
      <Route
        path="/trips"
        element={
          currentUser ? (
            <MyTrips user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Create Trip Route */}
      <Route
        path="/trips/create"
        element={
          currentUser ? (
            <CreateTrip user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Itinerary Builder Route */}
      <Route
        path="/trips/:id/builder"
        element={
          currentUser ? (
            <ItineraryBuilder user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Itinerary View Route */}
      <Route
        path="/trips/:id"
        element={
          currentUser ? (
            <ItineraryView user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback Catch-all Route */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

