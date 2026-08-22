import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Map, Globe, Ticket, Plus, User, LogOut } from 'lucide-react';
import Button from './Button';
import { authService } from '../services/api';

export default function Navbar({ user: propUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(propUser || null);

  useEffect(() => {
    if (propUser) {
      setCurrentUser(propUser);
    } else {
      authService.getCurrentUser().then((u) => {
        if (u) setCurrentUser(u);
      }).catch(() => {});
    }
  }, [propUser]);

  const handleLogout = async () => {
    await authService.logout();
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const displayUser = currentUser || propUser || {
    name: 'Explorer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  };

  return (
    <header className="navbar" style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border, #e2e8f0)',
      padding: '0.75rem 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
    }}>
      <div className="container navbar-inner" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/dashboard" className="navbar-brand" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          textDecoration: 'none',
          color: 'var(--text-main, #0f172a)'
        }}>
          <div className="navbar-brand-icon" style={{
            backgroundColor: 'var(--primary, #0f4c81)',
            color: '#ffffff',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={22} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>GlobeTrotter</span>
        </Link>

        {/* Central Navigation Links */}
        <nav>
          <ul className="navbar-links" style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: '1.25rem',
            alignItems: 'center'
          }}>
            <li>
              <Link
                to="/dashboard"
                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  color: isActive('/dashboard') ? 'var(--primary, #0f4c81)' : 'var(--text-muted, #64748b)',
                  fontWeight: isActive('/dashboard') ? 700 : 500,
                  fontSize: '0.9rem'
                }}
              >
                <Map size={18} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/trips"
                className={`navbar-link ${isActive('/trips') ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  color: isActive('/trips') ? 'var(--primary, #0f4c81)' : 'var(--text-muted, #64748b)',
                  fontWeight: isActive('/trips') ? 700 : 500,
                  fontSize: '0.9rem'
                }}
              >
                <Compass size={18} />
                <span>My Trips</span>
              </Link>
            </li>
            <li>
              <Link
                to="/cities"
                className={`navbar-link ${isActive('/cities') ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  color: isActive('/cities') ? 'var(--primary, #0f4c81)' : 'var(--text-muted, #64748b)',
                  fontWeight: isActive('/cities') ? 700 : 500,
                  fontSize: '0.9rem'
                }}
              >
                <Globe size={18} />
                <span>Cities</span>
              </Link>
            </li>
            <li>
              <Link
                to="/activities"
                className={`navbar-link ${isActive('/activities') ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textDecoration: 'none',
                  color: isActive('/activities') ? 'var(--primary, #0f4c81)' : 'var(--text-muted, #64748b)',
                  fontWeight: isActive('/activities') ? 700 : 500,
                  fontSize: '0.9rem'
                }}
              >
                <Ticket size={18} />
                <span>Activities</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Right User Profile & Logout Button */}
        <div className="navbar-user" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Link to="/profile" className="navbar-profile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            color: 'var(--text-main, #0f172a)'
          }}>
            <img
              src={displayUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={displayUser.name || 'User Avatar'}
              className="navbar-avatar"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid var(--primary, #0f4c81)'
              }}
            />
            <span className="navbar-username" style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {displayUser.name || 'Traveler'}
            </span>
          </Link>

          {/* Prominent Red/Outline Logout Button */}
          <Button
            variant="outline"
            size="sm"
            icon={<LogOut size={16} />}
            onClick={handleLogout}
            style={{
              borderColor: '#ef4444',
              color: '#ef4444',
              fontWeight: 700,
              padding: '0.4rem 0.85rem'
            }}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
