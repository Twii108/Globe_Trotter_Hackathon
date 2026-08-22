import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import BudgetScreen from './pages/BudgetScreen';
import TimelineScreen from './pages/TimelineScreen';
import PublicShareScreen from './pages/PublicShareScreen';
import ProfileSettings from './pages/ProfileSettings';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    return {
      id: 'usr_101',
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      preferredCurrency: 'USD',
      travelStyle: 'Balanced Explorer'
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

      {/* Auth Routes */}
      <Route
        path="/login"
        element={<Login onLoginSuccess={handleLoginSuccess} />}
      />
      <Route
        path="/signup"
        element={<Signup onSignupSuccess={handleSignupSuccess} />}
      />

      {/* Main Pages */}
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
      <Route
        path="/cities"
        element={
          currentUser ? (
            <CitySearch user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/activities"
        element={
          currentUser ? (
            <ActivitySearch user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/profile"
        element={
          currentUser ? (
            <ProfileSettings user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Trip Specific Sub-Screens */}
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
      <Route
        path="/trips/:id/budget"
        element={
          currentUser ? (
            <BudgetScreen user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/trips/:id/timeline"
        element={
          currentUser ? (
            <TimelineScreen user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/trips/:id/share"
        element={
          currentUser ? (
            <PublicShareScreen user={currentUser} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback Catch-all */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
