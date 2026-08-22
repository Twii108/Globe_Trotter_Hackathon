import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Navigation, 
  Activity, 
  Share2, 
  ShieldCheck, 
  ArrowRight, 
  Menu, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Globe, 
  Layout, 
  TrendingUp 
} from 'lucide-react';
import Button from '../components/Button';
import '../styles/home.css';

export default function Home({ user, onLogout }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      {/* Sticky Header Navbar */}
      <header className="home-navbar">
        <div className="home-nav-content">
          <div className="home-logo" onClick={() => navigate('/')}>
            <div className="home-logo-icon">
              <Compass size={24} color="#ffffff" />
            </div>
            <span className="home-logo-text">GlobeTrotter</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="home-nav-links">
            <button onClick={() => scrollToSection('hero')} className="nav-link">Home</button>
            <button onClick={() => scrollToSection('features')} className="nav-link">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="nav-link">How It Works</button>
            <button onClick={() => scrollToSection('health-demo')} className="nav-link">Trip Health</button>
          </nav>

          {/* Action CTAs */}
          <div className="home-nav-actions">
            {user ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </Button>
                <Button variant="primary" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/signup')}>
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Navigation Menu">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-nav-dropdown">
            <button onClick={() => scrollToSection('hero')}>Home</button>
            <button onClick={() => scrollToSection('features')}>Features</button>
            <button onClick={() => scrollToSection('how-it-works')}>How It Works</button>
            <button onClick={() => scrollToSection('health-demo')}>Trip Health</button>
            <div className="mobile-nav-buttons">
              {user ? (
                <Button variant="primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate('/login')}>Log In</Button>
                  <Button variant="primary" onClick={() => navigate('/signup')}>Get Started Free</Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="home-hero">
        <div className="hero-badge">
          <Sparkles size={14} /> Ultimate Hackathon Travel Planner
        </div>
        <h1 className="hero-title">
          Plan Smarter. <span className="highlight-text">Travel Better.</span>
        </h1>
        <p className="hero-subtitle">
          Organize multi-city itineraries, track budget breakdowns in real-time, optimize travel pacing with AI-driven Trip Health, and share beautiful interactive routes seamlessly.
        </p>

        <div className="hero-ctas">
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight size={18} />}
            onClick={() => navigate(user ? '/trips/create' : '/signup')}
          >
            Start Planning Now
          </Button>
          <Button
            variant="outline"
            size="lg"
            icon={<Globe size={18} />}
            onClick={() => navigate(user ? '/dashboard' : '/login')}
          >
            {user ? 'View My Dashboard' : 'Explore Demo'}
          </Button>
        </div>

        {/* Hero Visual Mockup Preview */}
        <div className="hero-preview-card">
          <div className="preview-header">
            <div className="preview-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <span className="preview-url">globetrotter.app/trips/japan-discovery</span>
          </div>
          <div className="preview-body">
            <div className="preview-stat">
              <span className="stat-label">Destinations</span>
              <span className="stat-value">Tokyo & Kyoto</span>
            </div>
            <div className="preview-stat">
              <span className="stat-label">Duration</span>
              <span className="stat-value">12 Days</span>
            </div>
            <div className="preview-stat">
              <span className="stat-label">Health Score</span>
              <span className="stat-badge">94/100 (Optimal)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="home-section">
        <div className="section-title-container">
          <span className="section-tag">Comprehensive Toolkit</span>
          <h2 className="section-heading">Everything You Need For Perfect Journeys</h2>
          <p className="section-subheading">From initial idea to departure gate, GlobeTrotter keeps every detail organized in one persistent platform.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card" onClick={() => navigate(user ? '/trips' : '/login')}>
            <div className="feature-icon"><Layout color="var(--primary)" size={24} /></div>
            <h3>Smart Itinerary Builder</h3>
            <p>Drag, drop, and reorder stop sequences with automatic date calculations and activity scheduling.</p>
          </div>

          <div className="feature-card" onClick={() => navigate(user ? '/trips' : '/login')}>
            <div className="feature-icon"><DollarSign color="#10B981" size={24} /></div>
            <h3>Budget & Expense Track</h3>
            <p>Monitor planned budget vs actual spending across transport, stay, activities, and daily meals.</p>
          </div>

          <div className="feature-card" onClick={() => navigate(user ? '/cities' : '/login')}>
            <div className="feature-icon"><Compass color="#8B5CF6" size={24} /></div>
            <h3>Destination Discovery</h3>
            <p>Search global cities, compare popularity, cost indexes, and curated sightseeing activities.</p>
          </div>

          <div className="feature-card" onClick={() => navigate(user ? '/trips' : '/login')}>
            <div className="feature-icon"><Navigation color="#F59E0B" size={24} /></div>
            <h3>Transport Logistics</h3>
            <p>Connect flights, bullet trains, and rental cars seamlessly between inter-city itinerary stops.</p>
          </div>

          <div className="feature-card" onClick={() => navigate(user ? '/trips' : '/login')}>
            <div className="feature-icon"><Calendar color="#EC4899" size={24} /></div>
            <h3>Day-Wise Timeline</h3>
            <p>Visualize chronological day-by-day itineraries with interactive schedule cards and cost totals.</p>
          </div>

          <div className="feature-card" onClick={() => navigate(user ? '/trips' : '/login')}>
            <div className="feature-icon"><Activity color="#EF4444" size={24} /></div>
            <h3>Trip Health Analytics</h3>
            <p>Identify scheduling conflicts, budget overruns, and pace burnout before you set foot on a plane.</p>
          </div>

          <div className="feature-card" onClick={() => navigate(user ? '/trips' : '/login')}>
            <div className="feature-icon"><Share2 color="#06B6D4" size={24} /></div>
            <h3>Public Trip Sharing</h3>
            <p>Generate clean read-only share links for friends & family or let fellow travelers duplicate your plans.</p>
          </div>

          <div className="feature-card" onClick={() => navigate(user ? '/trips' : '/login')}>
            <div className="feature-icon"><MapPin color="#3B82F6" size={24} /></div>
            <h3>Interactive Leaflet Maps</h3>
            <p>Explore your entire travel route visually with auto-zoom bounds and numbered city markers.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="home-section alt-bg">
        <div className="section-title-container">
          <span className="section-tag">Simple & Intuitive</span>
          <h2 className="section-heading">How GlobeTrotter Works in 4 Steps</h2>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Choose Destinations</h3>
            <p>Search world cities or pick recommended destinations from our global travel database.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Build Your Itinerary</h3>
            <p>Set trip dates, add city stops, reorder positions, and attach custom sightseeing activities.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Log Transport & Expenses</h3>
            <p>Add flight details and track daily spending against your target budget limits.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Travel & Share</h3>
            <p>Check your Trip Health score, export itineraries, and share public links with your travel group.</p>
          </div>
        </div>
      </section>

      {/* Static Demo Trip Health Showcase Section */}
      <section id="health-demo" className="home-section">
        <div className="section-title-container">
          <span className="section-tag">Feature Showcase (Static Demo)</span>
          <h2 className="section-heading">Smart Trip Health Diagnostics</h2>
          <p className="section-subheading">Our diagnostic engine analyzes your itinerary balance in real time.</p>
        </div>

        <div className="demo-health-card">
          <div className="demo-health-header">
            <div>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck color="#10B981" size={24} /> Trip Health Score
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Demo Evaluation: Japan Autumn Tour</span>
            </div>
            <div className="demo-score-circle">
              <span className="score-num">92</span>
              <span className="score-max">/100</span>
            </div>
          </div>

          <div className="demo-health-bars">
            <div className="demo-bar-item">
              <div className="bar-label"><span>Pacing & Duration</span><span>95%</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '95%', backgroundColor: '#10B981' }} /></div>
            </div>
            <div className="demo-bar-item">
              <div className="bar-label"><span>Budget Distribution</span><span>88%</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '88%', backgroundColor: '#3B82F6' }} /></div>
            </div>
            <div className="demo-bar-item">
              <div className="bar-label"><span>Activity Density</span><span>94%</span></div>
              <div className="bar-track"><div className="bar-fill" style={{ width: '94%', backgroundColor: '#10B981' }} /></div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="home-cta-section">
        <div className="cta-content">
          <h2>Your Next Adventure Starts Here</h2>
          <p>Join thousands of travelers who plan stress-free, beautiful itineraries with GlobeTrotter.</p>
          <Button
            variant="primary"
            size="lg"
            icon={<Sparkles size={18} />}
            onClick={() => navigate(user ? '/trips/create' : '/signup')}
          >
            Create My Free Trip
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="home-logo">
              <Compass size={20} color="var(--primary)" />
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>GlobeTrotter</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Personalized Travel Planning Platform. Hackathon Edition 2026.
            </p>
          </div>
          <div className="footer-copyright" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            &copy; 2026 GlobeTrotter. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
