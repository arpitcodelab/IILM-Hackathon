import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ShieldAlert, FileText, Stethoscope, Building2,
  HeartHandshake, ChevronRight, CheckCircle2, ArrowRight, ShieldCheck,
  Award, Clock, Phone
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section style={{
        padding: '4.5rem 0 3.5rem',
        background: 'linear-gradient(180deg, #F0FDFA 0%, #FFFFFF 100%)',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div className="container-custom" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1.25rem'
            }}>
              <Activity size={14} /> AI-Powered Healthcare Coordination
            </div>

            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              color: '#0F172A',
              lineHeight: 1.2,
              letterSpacing: '-0.03em',
              marginBottom: '1.25rem'
            }}>
              Smarter Healthcare for a Brighter Tomorrow
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '560px'
            }}>
              Your health journey, simplified. Upload records, understand reports in plain language, find the right doctors, explore government schemes and get zero-barrier emergency support — all in one place.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
              <Link to="/patient/dashboard">
                <Button variant="primary" size="lg">
                  <span>Get Started</span>
                  <ArrowRight size={18} />
                </Button>
              </Link>

              <Link to="/emergency">
                <Button variant="emergency-pill" size="lg">
                  <ShieldAlert size={18} />
                  <span>Emergency SOS</span>
                </Button>
              </Link>

              <Link to="/hospital/emergency-panel">
                <Button variant="outline" size="lg">
                  <span>Hospital ER Panel</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual Card Stack */}
          <div style={{ position: 'relative' }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
              padding: '1.75rem',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  backgroundColor: '#0F766E',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  <Activity size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>
                    Trusted by 10,000+ Patients
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                    NABH & JCI Accredited Hospital Partners
                  </div>
                </div>
              </div>

              {/* Quick Feature Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <Link to="/patient/records/ai-analysis" style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 200ms ease'
                }}>
                  <div style={{ color: '#2563EB' }}><FileText size={20} /></div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                    AI Report Analysis
                  </div>
                </Link>

                <Link to="/doctor/workspace" style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ color: '#0F766E' }}><Stethoscope size={20} /></div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                    Find Best Doctors
                  </div>
                </Link>

                <Link to="/hospitals" style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ color: '#EA580C' }}><Building2 size={20} /></div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                    Compare Hospital Costs
                  </div>
                </Link>

                <Link to="/schemes" style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <div style={{ color: '#10B981' }}><HeartHandshake size={20} /></div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0F172A' }}>
                    Government Schemes
                  </div>
                </Link>
              </div>

              {/* Emergency Banner Inside Card */}
              <div style={{
                marginTop: '1.25rem',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <ShieldAlert size={18} />
                  <span>Urgent medical assistance required?</span>
                </div>
                <Link to="/emergency" style={{ color: '#DC2626', fontWeight: 700, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Open SOS <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Counters Banner */}
      <section style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '2rem 0' }}>
        <div className="container-custom" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1.5rem',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0F766E' }}>10K+</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>Patients Assisted</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563EB' }}>500+</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>Doctor Partners</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#EA580C' }}>200+</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>Accredited Hospitals</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7C3AED' }}>15+</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>Government Schemes</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>98%</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748B', fontWeight: 500 }}>Satisfaction Rate</div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#F8FAFC' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
              Built for Safety, Transparency & Rapid Care
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748B' }}>
              Every feature is built adhering to clinical governance, data privacy, and zero-barrier emergency access.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {/* Card 1 */}
            <div className="card card--elevated">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <FileText size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                Source-Grounded AI Analysis
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6, marginBottom: '1rem' }}>
                Every AI insight links directly to original document pages and dates. AI explains medical reports in simple language while respecting doctor diagnosis.
              </p>
              <Link to="/patient/records/ai-analysis" style={{ color: '#2563EB', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Explore Report Analyzer <ChevronRight size={14} />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="card card--elevated">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <ShieldAlert size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                Zero-Barrier Emergency SOS
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6, marginBottom: '1rem' }}>
                Get urgent ambulance and hospital dispatch without requiring login, password, or verification. Bystanders can report critical incidents in seconds.
              </p>
              <Link to="/hospital/emergency-panel" style={{ color: '#DC2626', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View Hospital ER Panel <ChevronRight size={14} />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="card card--elevated">
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <HeartHandshake size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                Government Scheme Assistance
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6, marginBottom: '1rem' }}>
                Evaluate eligibility for Ayushman Bharat PM-JAY and state health schemes. Calculate out-of-pocket costs with 100% financial transparency.
              </p>
              <Link to="/schemes" style={{ color: '#059669', fontWeight: 600, fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Check Scheme Eligibility <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

