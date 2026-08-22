import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import TripMapScreen from './pages/TripMapScreen';
import TripHealthScreen from './pages/TripHealthScreen';
import TransportScreen from './pages/TransportScreen';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import BudgetScreen from './pages/BudgetScreen';
import TimelineScreen from './pages/TimelineScreen';
import PublicShareScreen from './pages/PublicShareScreen';
import ProfileSettings from './pages/ProfileSettings';
import { authService, removeToken } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setCheckingAuth(true);
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (err) {
      console.error('Session validation failed:', err);
      removeToken();
      setCurrentUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleSignupSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  if (checkingAuth) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background, #f8fafc)',
        color: 'var(--text-main, #0f172a)',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(15, 76, 129, 0.2)',
          borderTopColor: 'var(--primary, #0f4c81)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#64748b' }}>
          Loading GlobeTrotter...
        </p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontSize: '0.9rem', borderRadius: '8px' } }} />
      <Routes>
        {/* Public Landing Page */}
        <Route
          path="/"
          element={<Home user={currentUser} onLogout={handleLogout} />}
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            currentUser ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          }
        />
        <Route
          path="/signup"
          element={
            currentUser ? <Navigate to="/dashboard" replace /> : <Signup onSignupSuccess={handleSignupSuccess} />
          }
        />

        {/* Main Application Pages */}
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
          path="/trips/:id/view"
          element={
            currentUser ? (
              <ItineraryView user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/trips/:id"
          element={
            currentUser ? (
              <ItineraryBuilder user={currentUser} onLogout={handleLogout} />
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
          path="/trips/:id/map"
          element={
            currentUser ? (
              <TripMapScreen user={currentUser} onLogout={handleLogout} />
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
          path="/trips/:id/transport"
          element={
            currentUser ? (
              <TransportScreen user={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/trips/:id/health"
          element={
            currentUser ? (
              <TripHealthScreen user={currentUser} onLogout={handleLogout} />
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

        {/* Public Unauthenticated Share Route */}
        <Route
          path="/shared/:shareId"
          element={<PublicShareScreen />}
        />

        {/* Fallback Catch-all Route */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
}
