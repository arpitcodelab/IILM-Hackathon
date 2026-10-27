import React, { useState, useEffect } from 'react';
import {
  Activity, FileText, Download, CheckCircle2, AlertTriangle,
  HelpCircle, ChevronRight, Share2, ArrowRight, ShieldCheck,
  FileCheck, ExternalLink, Calendar, Stethoscope, Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AIReportAnalysisPage: React.FC = () => {
  const [tab, setTab] = useState<'overview' | 'findings' | 'sources' | 'recommendations'>('overview');
  const [patient, setPatient] = useState<any>(null);

  useEffect(() => {
    const cached = localStorage.getItem('medibridge_active_patient');
    if (cached) {
      try {
        setPatient(JSON.parse(cached));
      } catch {}
    }
  }, []);

  const patientName = patient?.name || 'Rohan Mehta';
  const patientMupid = patient?.mupid || 'MB-7X4Q2K';

  // Deterministic Findings depending on persona
  const findings = patient?.mupid === 'MB-DEMO-02' ? [
    {
      id: 'f1',
      title: 'Longitudinal HbA1c Improvement',
      severity: 'Normal / Favorable',
      badgeClass: 'badge--success',
      description: 'Glycated hemoglobin (HbA1c) dropped from 8.4% to 7.2% over 6 months with consistent Metformin therapy.',
      document: 'HbA1c_Longitudinal_Series_2025.pdf',
      page: 1,
      date: '10 Feb 2025',
      confidence: 0.98
    },
    {
      id: 'f2',
      title: 'Renal Function Preserved',
      severity: 'Normal',
      badgeClass: 'badge--success',
      description: 'Serum creatinine 0.85 mg/dL and eGFR > 85 mL/min/1.73m2 indicate stable microvascular kidney function.',
      document: 'Renal_Profile_Jan2025.pdf',
      page: 2,
      date: '15 Jan 2025',
      confidence: 0.95
    },
    {
      id: 'f3',
      title: 'Microalbuminuria Screening Due',
      severity: 'Needs Follow-up',
      badgeClass: 'badge--medium',
      description: 'Annual urine albumin-to-creatinine ratio (uACR) screening due next month as part of diabetes care guidelines.',
      document: 'Annual_Care_Plan_2025.pdf',
      page: 1,
      date: '15 Jan 2025',
      confidence: 0.92
    }
  ] : patient?.mupid === 'MB-DEMO-03' ? [
    {
      id: 'f1',
      title: 'Critical Penicillin Contraindication',
      severity: 'Critical Alert',
      badgeClass: 'badge--critical',
      description: 'Patient experiences severe acute anaphylactoid reaction to penicillin and related beta-lactam antibiotics.',
      document: 'Hospital_Discharge_Summary_2023.pdf',
      page: 3,
      date: '04 Nov 2023',
      confidence: 0.99
    },
    {
      id: 'f2',
      title: 'Post-PTCA Cardiac Stent In-Situ',
      severity: 'Moderate',
      badgeClass: 'badge--high',
      description: 'Drug-eluting stent deployed in LAD. Patient maintained on dual antiplatelet therapy (DAPT).',
      document: 'Angiography_Intervention_Report.pdf',
      page: 2,
      date: '12 Nov 2023',
      confidence: 0.96
    },
    {
      id: 'f3',
      title: 'Blood Pressure Control Optimized',
      severity: 'Normal',
      badgeClass: 'badge--success',
      description: 'Mean arterial pressure maintained in target clinical range under Telmisartan 40mg regimen.',
      document: 'Cardiology_OPD_Followup.pdf',
      page: 1,
      date: '15 Mar 2024',
      confidence: 0.94
    }
  ] : [
    {
      id: 'f1',
      title: 'Elevated Blood Sugar',
      severity: 'Moderate',
      badgeClass: 'badge--high',
      description: 'Fasting glucose level is higher than normal clinical range (128 mg/dL vs normal 70-100 mg/dL).',
      document: 'Comprehensive Metabolic Panel',
      page: 2,
      date: '12 May 2024',
      confidence: 0.96
    },
    {
      id: 'f2',
      title: 'Vitamin D Deficiency',
      severity: 'Mild',
      badgeClass: 'badge--medium',
      description: 'Vitamin D level is below recommended clinical threshold (18 ng/mL vs normal > 30 ng/mL).',
      document: 'Vitamin Profile Report',
      page: 1,
      date: '12 May 2024',
      confidence: 0.94
    },
    {
      id: 'f3',
      title: 'Possible Dust Allergy',
      severity: 'Low',
      badgeClass: 'badge--neutral',
      description: 'Prescription notes mention mild allergic rhinitis triggered by dust exposure. Advised antihistamines as needed.',
      document: 'Outpatient Prescription',
      page: 1,
      date: '03 Apr 2024',
      confidence: 0.91
    }
  ];

  const sourceDocuments = [
    { title: 'Comprehensive Metabolic Panel (CMP)', date: '12 May 2024', pages: 3, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Thyrocare Labs' },
    { title: 'Vitamin Profile (25-OH Vitamin D)', date: '12 May 2024', pages: 1, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Dr. Lal PathLabs' },
    { title: 'Outpatient Prescription - ENT & Allergy', date: '03 Apr 2024', pages: 1, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Apollo Hospital' },
    { title: '12-Lead Electrocardiogram (ECG)', date: '15 Mar 2024', pages: 2, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Max Healthcare' },
    { title: 'Lipid Profile & Cardiac Risk Panel', date: '10 Feb 2024', pages: 2, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Apollo Hospital' },
    { title: 'Complete Blood Count (CBC) with Differential', date: '10 Feb 2024', pages: 2, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Dr. Lal PathLabs' },
    { title: 'Thyroid Function Test (TSH, T3, T4)', date: '18 Nov 2023', pages: 1, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Thyrocare Labs' },
    { title: 'Discharge Summary - Routine Care', date: '04 Nov 2023', pages: 4, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Fortis Hospital' },
    { title: 'Kidney Function Test (KFT / RFT)', date: '12 Sep 2023', pages: 2, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Dr. Lal PathLabs' },
    { title: 'Liver Function Test (LFT Panel)', date: '12 Sep 2023', pages: 2, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Dr. Lal PathLabs' },
    { title: 'Chest Radiograph (PA View)', date: '14 May 2023', pages: 1, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'Apollo Hospital' },
    { title: 'Prior Consultation & Immunization Record', date: '20 Jan 2023', pages: 2, type: 'PDF', status: 'Indexed & Grounded', verifiedBy: 'CityCare Clinic' }
  ];

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 68px)', padding: '2.5rem 0' }}>
      <div className="container-custom" style={{ maxWidth: '1050px' }}>
        {/* Header Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#FAF5FF',
                color: '#7C3AED',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: '0.5rem'
              }}>
                <Sparkles size={14} /> AI Generated • For Information Only
              </div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                AI Medical Analysis Report
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '4px' }}>
                Patient: <strong>{patientName} ({patientMupid})</strong> • Grounded in 12 uploaded medical records
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={() => alert('Downloading structured clinical report summary with cryptographic provenance hashes...')}>
              <Download size={15} /> Download Report
            </Button>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Based on your uploaded medical records, here is a structured summary of key findings. Every extraction is cross-referenced with your original document page numbers. Please consult a qualified doctor for clinical assessment and proper diagnosis.
          </p>

          {/* Metric Counter Badges (Screenshot 2 bottom left) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '10px', padding: '0.85rem 1.5rem', textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#EA580C' }}>3</div>
              <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 600 }}>Possible Concerns</div>
            </div>

            <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: '10px', padding: '0.85rem 1.5rem', textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669' }}>2</div>
              <div style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 600 }}>Normal Findings</div>
            </div>

            <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '10px', padding: '0.85rem 1.5rem', textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#2563EB' }}>1</div>
              <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 600 }}>Needs Follow-up</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Screenshot 2 bottom left) */}
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

        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
            {/* Left Column: Key Findings */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#2563EB" /> Key Findings & Provenance
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {findings.map((f, idx) => (
                  <div key={f.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                        {idx + 1}. {f.title}
                      </div>
                      <span className={`badge ${f.badgeClass}`}>{f.severity}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5, margin: '0 0 0.5rem 0' }}>
                      {f.description}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', backgroundColor: '#F8FAFC', padding: '0.4rem 0.65rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>📄 <strong>Source Document:</strong> {f.document} (Page {f.page})</span>
                      <span style={{ color: '#059669', fontWeight: 600 }}>{Math.round(f.confidence * 100)}% Match</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Recommendations */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#059669" /> Clinical Recommendations
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ border: '1px solid #CCFBF1', backgroundColor: '#F0FDFA', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F766E' }}>
                    Consult an Endocrinologist
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#334155', margin: '4px 0 0.75rem' }}>
                    For blood sugar management and personalized dietary guidance.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => alert('Opening verified hospital directory filtered for Endocrinologists...')}>
                    Book Consultation
                  </Button>
                </div>

                <div style={{ border: '1px solid #DBEAFE', backgroundColor: '#EFF6FF', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1D4ED8' }}>
                    Consider Vitamin D Supplements
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#334155', margin: '4px 0 0.75rem' }}>
                    Discuss appropriate weekly cholecalciferol dosage (60,000 IU) with your doctor.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => alert('Viewing clinical guidelines for Vitamin D repletion...')}>
                    Learn More
                  </Button>
                </div>

                <div style={{ border: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                    Allergy Precautions
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#334155', margin: '4px 0 0.75rem' }}>
                    Avoid dust exposure, keep air purifier active, and carry emergency antihistamines.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => alert('Viewing allergen mitigation protocol...')}>
                    View Prevention Tips
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED FINDINGS */}
        {tab === 'findings' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.25rem' }}>
              Detailed Laboratory Findings & Quantitative Analytics
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {findings.map((f, i) => (
                <div key={f.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#FFFFFF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A' }}>{f.title}</span>
                    </div>
                    <span className={`badge ${f.badgeClass}`}>{f.severity}</span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                    {f.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', backgroundColor: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <div><strong>Grounded Document:</strong> {f.document}</div>
                    <div><strong>Page Index:</strong> Page {f.page}</div>
                    <div><strong>Report Date:</strong> {f.date}</div>
                    <div><strong>RAG Citation Confidence:</strong> {(f.confidence * 100).toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SOURCE DOCUMENTS */}
        {tab === 'sources' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Indexed Source Documents ({sourceDocuments.length})
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
                  All records encrypted at rest, verified against MedInsight AI retrieval vector store.
                </p>
              </div>
              <span className="badge badge--success">
                <ShieldCheck size={13} /> 100% Vector Indexed
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1rem' }}>
              {sourceDocuments.map((doc, idx) => (
                <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                      <FileText size={18} color="#2563EB" />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>{doc.title}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', lineHeight: 1.5 }}>
                      <div>Provider: <strong>{doc.verifiedBy}</strong></div>
                      <div>Uploaded: {doc.date} • {doc.pages} Page{doc.pages > 1 ? 's' : ''}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #E2E8F0', fontSize: '0.7rem' }}>
                    <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FileCheck size={13} /> {doc.status}
                    </span>
                    <button
                      onClick={() => alert(`Opening secure preview for: ${doc.title}`)}
                      style={{ color: '#2563EB', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      View <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RECOMMENDATIONS */}
        {tab === 'recommendations' && (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '1.25rem' }}>
              Actionable Health Recommendations
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              <div style={{ border: '1px solid #CCFBF1', backgroundColor: '#F0FDFA', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F766E', marginBottom: '0.5rem' }}>
                  1. Clinical Consultation
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Schedule an endocrinology or general medicine consultation to review fasting blood sugar (128 mg/dL) and receive tailored dietary intervention.
                </p>
                <Button variant="secondary" size="sm" onClick={() => alert('Searching top Endocrinologists in your area...')}>
                  Book Consultation <ArrowRight size={13} />
                </Button>
              </div>

              <div style={{ border: '1px solid #DBEAFE', backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1D4ED8', marginBottom: '0.5rem' }}>
                  2. Nutritional Supplementation
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Vitamin D level is 18 ng/mL. Clinical guidelines typically advise weekly Cholecalciferol (60,000 IU) for 8 weeks under medical supervision.
                </p>
                <Button variant="outline" size="sm" onClick={() => alert('Opening Vitamin D nutrition recommendations...')}>
                  Read Guidelines <ArrowRight size={13} />
                </Button>
              </div>

              <div style={{ border: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                  3. Allergen Awareness
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#334155', lineHeight: 1.6, marginBottom: '1rem' }}>
                  Documented sensitivity to dust triggers allergic rhinitis symptoms. Ensure HEPA filter ventilation and avoid unmasked exposure during high AQI periods.
                </p>
                <Button variant="outline" size="sm" onClick={() => alert('Viewing allergen mitigation tips...')}>
                  Allergy Protocol <ArrowRight size={13} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
