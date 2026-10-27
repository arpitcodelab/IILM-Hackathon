import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Activity, Calendar, Award, Pill, ShieldAlert,
  Upload, Search, Building2, HeartHandshake, ChevronRight,
  AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PatientDashboardPage: React.FC = () => {
  return (
    <div className="patient-dashboard-page">
      <div className="container-custom">
        {/* Welcome Header */}
        <div className="patient-dashboard-page__welcome">
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Good Morning, Rohan 👋
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '4px' }}>
              Take charge of your health journey • MUPID: <strong>MB-7X4Q2K</strong>
            </p>
          </div>

          <Link to="/emergency" className="emergency-cta">
            <ShieldAlert size={18} />
            <span>Emergency SOS — Get urgent help now</span>
          </Link>
        </div>

        {/* Stats Grid (5 Cards) */}
        <div className="patient-dashboard-page__stats-grid">
          <div className="stat-card">
            <div className="stat-card__icon" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <FileText size={22} />
            </div>
            <div>
              <div className="stat-card__count">12</div>
              <div className="stat-card__label">My Records</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon" style={{ backgroundColor: '#FAF5FF', color: '#7C3AED' }}>
              <Activity size={22} />
            </div>
            <div>
              <div className="stat-card__count">3</div>
              <div className="stat-card__label">AI Insights</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon" style={{ backgroundColor: '#FFF7ED', color: '#EA580C' }}>
              <Calendar size={22} />
            </div>
            <div>
              <div className="stat-card__count">1</div>
              <div className="stat-card__label">Appointments</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
              <Award size={22} />
            </div>
            <div>
              <div className="stat-card__count">2</div>
              <div className="stat-card__label">Eligible Schemes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__icon" style={{ backgroundColor: '#F0FDFA', color: '#0F766E' }}>
              <Pill size={22} />
            </div>
            <div>
              <div className="stat-card__count">4</div>
              <div className="stat-card__label">Prescriptions</div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="patient-dashboard-page__content-grid">
          {/* Left Column: Health Summary (AI Generated) */}
          <div className="ai-summary-card">
            <div className="ai-summary-card__header">
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={20} color="#0F766E" /> Health Summary (AI Generated)
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                  Based on your uploaded medical records • Citing original lab & prescription dates
                </div>
              </div>

              <Link to="/patient/records/ai-analysis" style={{ fontSize: '0.8125rem', color: '#2563EB', fontWeight: 600 }}>
                View Full Report
              </Link>
            </div>

            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.75rem' }}>
              Possible Concerns:
            </div>

            {/* Finding 1 */}
            <div className="ai-summary-card__item">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>1</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                    Elevated blood sugar levels
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '28px', marginTop: '2px' }}>
                  Based on Lab Report (12 May 2024, Page 2)
                </div>
              </div>
              <span className="badge badge--high">Moderate</span>
            </div>

            {/* Finding 2 */}
            <div className="ai-summary-card__item">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>2</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                    Vitamin D deficiency
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '28px', marginTop: '2px' }}>
                  Based on Lab Report (12 May 2024, Page 1)
                </div>
              </div>
              <span className="badge badge--medium">Mild</span>
            </div>

            {/* Finding 3 */}
            <div className="ai-summary-card__item">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>3</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                    Possible dust allergy
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '28px', marginTop: '2px' }}>
                  Mentioned in Prescription (3 Apr 2024)
                </div>
              </div>
              <span className="badge badge--neutral">Low</span>
            </div>

            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Notice an inaccurate finding in your summary?
              </span>
              <button
                className="btn btn--outline btn--sm"
                style={{ fontSize: '0.75rem' }}
                onClick={() => alert('Flag/Correction Dialog: Patients can flag or annotate extracted facts without altering official source documents.')}
              >
                Flag or Correct
              </button>
            </div>
          </div>

          {/* Right Column: Quick Action Grid */}
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
              Quick Actions
            </h2>

            <div className="quick-action-grid">
              <Link to="/patient/records/ai-analysis" className="action-button">
                <div className="icon-box" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                  <Upload size={18} />
                </div>
                <span>Upload Medical Records</span>
              </Link>

              <Link to="/doctor/workspace" className="action-button">
                <div className="icon-box" style={{ backgroundColor: '#ECFDF5', color: '#059669' }}>
                  <Search size={18} />
                </div>
                <span>Find Doctors</span>
              </Link>

              <Link to="/hospitals" className="action-button">
                <div className="icon-box" style={{ backgroundColor: '#FFF7ED', color: '#EA580C' }}>
                  <Building2 size={18} />
                </div>
                <span>Compare Hospitals</span>
              </Link>

              <Link to="/schemes" className="action-button">
                <div className="icon-box" style={{ backgroundColor: '#F0FDFA', color: '#0F766E' }}>
                  <HeartHandshake size={18} />
                </div>
                <span>Check Govt Schemes</span>
              </Link>

              <Link to="/patient/dashboard" className="action-button">
                <div className="icon-box" style={{ backgroundColor: '#FAF5FF', color: '#7C3AED' }}>
                  <Pill size={18} />
                </div>
                <span>My Prescriptions</span>
              </Link>

              <Link to="/medicine-compare" className="action-button">
                <div className="icon-box" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                  <Activity size={18} />
                </div>
                <span>Medicine Comparison</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

