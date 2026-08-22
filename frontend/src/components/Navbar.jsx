import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Map, Globe, Ticket, Plus, User, LogOut } from 'lucide-react';
import Button from './Button';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <div className="navbar-brand-icon">
            <Compass size={20} />
          </div>
          <span>GlobeTrotter</span>
        </Link>

        {user && (
          <>
            <nav>
              <ul className="navbar-links">
                <li>
                  <Link
                    to="/dashboard"
                    className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                  >
                    <Map size={18} />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/trips"
                    className={`navbar-link ${isActive('/trips') ? 'active' : ''}`}
                  >
                    <Compass size={18} />
                    <span>My Trips</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cities"
                    className={`navbar-link ${isActive('/cities') ? 'active' : ''}`}
                  >
                    <Globe size={18} />
                    <span>Cities</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/activities"
                    className={`navbar-link ${isActive('/activities') ? 'active' : ''}`}
                  >
                    <Ticket size={18} />
                    <span>Activities</span>
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="navbar-user">
              <Link to="/profile" className="navbar-profile" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
                  alt={user.name || 'User Avatar'}
                  className="navbar-avatar"
                />
                <span className="navbar-username">{user.name || 'Traveler'}</span>
              </Link>
              <Button
                variant="outline"
                size="sm"
                icon={<LogOut size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

