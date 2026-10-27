import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const location = useLocation();

  if (location.pathname === '/hospital/emergency-panel') {
    return null;
  }

  return (
    <footer className="footer">
      <div className="container-custom">
        <div className="footer__grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', color: '#14B8A6', fontWeight: 700, fontSize: '1.15rem' }}>
              <Activity size={22} />
              <span style={{ color: '#FFFFFF' }}>MediBridge AI</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, maxWidth: '380px', marginBottom: '1.25rem' }}>
              Smarter healthcare for a brighter tomorrow. Connecting patients, verified clinicians, NABH-accredited hospitals, and public health schemes with zero-barrier emergency response.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444', fontWeight: 600, fontSize: '0.875rem' }}>
              <span>National Emergency Hotline:</span>
              <a href="tel:108" style={{ textDecoration: 'underline' }}>108 / 102 (India)</a>
            </div>
          </div>

          <div>
            <h4 className="footer__title">Patient Services</h4>
            <div className="footer__links">
              <Link to="/patient/dashboard">Patient Dashboard</Link>
              <Link to="/patient/records/ai-analysis">AI Report Analysis</Link>
              <Link to="/schemes">Government Schemes Finder</Link>
              <Link to="/medicine-compare">Jan Aushadhi Generic Compare</Link>
              <Link to="/emergency">Emergency SOS Dispatch</Link>
            </div>
          </div>

          <div>
            <h4 className="footer__title">Clinical & Operations</h4>
            <div className="footer__links">
              <Link to="/doctor/workspace">Doctor Consultation Workspace</Link>
              <Link to="/hospital/emergency-panel">Hospital Emergency Command</Link>
              <Link to="/hospitals">Hospital Discovery & Tariffs</Link>
              <Link to="/patient/onboarding">ABHA & ID Verification</Link>
            </div>
          </div>

          <div>
            <h4 className="footer__title">Trust & Safety</h4>
            <div className="footer__links">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                <ShieldCheck size={16} color="#10B981" /> No Fake Healthcare Data
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem' }}>
                <HeartHandshake size={16} color="#3B82F6" /> Verified Source Citations
              </span>
              <p style={{ fontSize: '0.75rem', marginTop: '0.75rem', color: '#64748B' }}>
                AI provides preliminary summaries and organization only; medical decisions must be confirmed with a licensed clinician.
              </p>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} MediBridge AI. All rights reserved.</p>
          <p>Built for IILM Hackathon • Production-Grade MERN Architecture</p>
        </div>
      </div>
    </footer>
  );
};

