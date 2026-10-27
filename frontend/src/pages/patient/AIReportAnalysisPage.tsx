import React, { useState } from 'react';
import {
  Activity, FileText, Download, CheckCircle2, AlertTriangle,
  HelpCircle, ChevronRight, Share2, ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AIReportAnalysisPage: React.FC = () => {
  const [tab, setTab] = useState<'overview' | 'findings' | 'sources' | 'recommendations'>('overview');

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 68px)', padding: '2.5rem 0' }}>
      <div className="container-custom" style={{ maxWidth: '1000px' }}>
        {/* Header Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FAF5FF',
                color: '#7C3AED',
                padding: '0.2rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                <Activity size={14} /> AI Generated • For Information Only
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                AI Medical Analysis Report
              </h1>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '4px' }}>
                Patient: <strong>Rohan Mehta (MB-7X4Q2K)</strong> • Citing 12 uploaded records
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={() => alert('Downloading structured clinical report summary...')}>
              <Download size={15} /> Download Report
            </Button>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Based on your uploaded medical records, here is a structured summary of key findings. Please consult a qualified doctor for clinical assessment and proper diagnosis.
          </p>

          {/* Metric Counter Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '8px', padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EA580C' }}>3</div>
              <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 600 }}>Possible Concerns</div>
            </div>

            <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: '8px', padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>2</div>
              <div style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 600 }}>Normal Findings</div>
            </div>

            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '8px', padding: '0.75rem 1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563EB' }}>1</div>
              <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 600 }}>Needs Follow-up</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-nav" style={{ marginBottom: '1.5rem' }}>
          <button className={`tabs-nav__item ${tab === 'overview' ? 'tabs-nav__item--active' : ''}`} onClick={() => setTab('overview')}>
            Overview
          </button>
          <button className={`tabs-nav__item ${tab === 'findings' ? 'tabs-nav__item--active' : ''}`} onClick={() => setTab('findings')}>
            Detailed Findings (3)
          </button>
          <button className={`tabs-nav__item ${tab === 'sources' ? 'tabs-nav__item--active' : ''}`} onClick={() => setTab('sources')}>
            Source Documents (12)
          </button>
          <button className={`tabs-nav__item ${tab === 'recommendations' ? 'tabs-nav__item--active' : ''}`} onClick={() => setTab('recommendations')}>
            Recommendations (3)
          </button>
        </div>

        {/* Content Panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
          {/* Left Column: Key Findings */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
              Key Findings & Provenance
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Finding 1 */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    1. Elevated Blood Sugar
                  </div>
                  <span className="badge badge--high">Moderate</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                  Fasting glucose level is higher than normal clinical range (128 mg/dL vs normal 70-100 mg/dL).
                </p>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.4rem 0.65rem', borderRadius: '4px' }}>
                  📄 <strong>Source Document:</strong> Comprehensive Metabolic Panel (12 May 2024, Page 2)
                </div>
              </div>

              {/* Finding 2 */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    2. Vitamin D Deficiency
                  </div>
                  <span className="badge badge--medium">Mild</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                  Vitamin D level is below recommended clinical threshold (18 ng/mL vs normal &gt; 30 ng/mL).
                </p>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.4rem 0.65rem', borderRadius: '4px' }}>
                  📄 <strong>Source Document:</strong> Vitamin Profile (12 May 2024, Page 1)
                </div>
              </div>

              {/* Finding 3 */}
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    3. Possible Dust Allergy
                  </div>
                  <span className="badge badge--neutral">Low</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                  Prescription notes mention mild allergic rhinitis triggered by dust exposure.
                </p>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.4rem 0.65rem', borderRadius: '4px' }}>
                  📄 <strong>Source Document:</strong> Outpatient Prescription (3 Apr 2024)
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Recommendations */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
              Clinical Recommendations
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ border: '1px solid #EFF6FF', backgroundColor: '#F0FDFA', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F766E' }}>
                  Consult an Endocrinologist
                </div>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: '4px 0 0.75rem' }}>
                  For blood sugar management and personalized dietary guidance.
                </p>
                <Button variant="secondary" size="sm" onClick={() => alert('Routing to doctor search for Endocrinologists...')}>
                  Book Consultation
                </Button>
              </div>

              <div style={{ border: '1px solid #EFF6FF', backgroundColor: '#EFF6FF', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1D4ED8' }}>
                  Consider Vitamin D Supplements
                </div>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: '4px 0 0.75rem' }}>
                  Discuss appropriate weekly cholecalciferol dosage with your doctor.
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>

              <div style={{ border: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>
                  Allergy Precautions
                </div>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: '4px 0 0.75rem' }}>
                  Avoid dust exposure and follow prescribed preventive antihistamines.
                </p>
                <Button variant="outline" size="sm">
                  View Prevention Tips
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

