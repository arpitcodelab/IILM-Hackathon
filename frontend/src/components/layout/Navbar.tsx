import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, ShieldAlert, Stethoscope, Building2, UserCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Don't render top navbar in full-screen Emergency Command Panel
  if (location.pathname === '/hospital/emergency-panel') {
    return null;
  }

  return (
    <header className="main-navbar">
      <div className="container-custom main-navbar__inner">
        <Link to="/" className="main-navbar__brand">
          <div className="brand-icon">
            <Activity size={20} />
          </div>
          <span>MediBridge AI</span>
        </Link>

        <nav className="main-navbar__nav" aria-label="Main Navigation">
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/patient/dashboard" className={isActive('/patient/dashboard') ? 'active' : ''}>Patient Portal</Link>
          <Link to="/doctor/workspace" className={isActive('/doctor/workspace') ? 'active' : ''}>Doctor Workspace</Link>
          <Link to="/hospital/emergency-panel" className={isActive('/hospital/emergency-panel') ? 'active' : ''}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontWeight: 600 }}>
              <span className="badge-pulse" /> ER Command Panel
            </span>
          </Link>
          <Link to="/schemes" className={isActive('/schemes') ? 'active' : ''}>Govt. Schemes</Link>
          <Link to="/hospitals" className={isActive('/hospitals') ? 'active' : ''}>Hospitals</Link>
          <Link to="/medicine-compare" className={isActive('/medicine-compare') ? 'active' : ''}>Medicine Compare</Link>
        </nav>

        <div className="main-navbar__actions">
          <Link to="/emergency">
            <Button variant="emergency-pill" size="sm">
              <ShieldAlert size={16} />
              <span>Emergency SOS</span>
            </Button>
          </Link>
          <Link to="/patient/onboarding">
            <Button variant="outline" size="sm">
              <UserCircle2 size={16} />
              <span>Verify ABHA/ID</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

