import React, { useState } from 'react';
import {
  Calendar, Clock, Video, MessageSquare, AlertCircle, FileText,
  User, CheckCircle2, ChevronRight, Mic, Plus, Trash2, ShieldCheck,
  Stethoscope, Pill, Heart, Activity, Search, HelpCircle, Share2
} from 'lucide-react';
import { DoctorAppointment } from '../../types';
import { apiClient } from '../../api/client';

const INITIAL_APPOINTMENTS: DoctorAppointment[] = [
  {
    id: '1',
    time: '10:30 AM',
    patient_name: 'Rohan Mehta',
    patient_mupid: 'MB-7X4Q2K',
    patient_abha_id: '91-XXXX-4521',
    age: 34,
    gender: 'Male',
    type: 'online',
    complaint: 'Chest pain, breathlessness',
    status: 'scheduled',
    contact: {
      phone: '+91 98765 43210',
      email: 'rohan.mehta@gmail.com',
      location: 'Noida, Uttar Pradesh'
    },
    vitals: {
      bp: '150/95 mmHg (High)',
      ldl: '162 mg/dL (High)',
      ecg: 'Mild ST-T abnormality',
      blood_group: 'B+',
      height: '172 cm',
      weight: '68 kg',
      employment: 'IT Professional'
    },
    history: {
      conditions: ['Hypertension (Since 2022)', 'Type 2 Diabetes (Since 2021)'],
      allergies: ['Penicillin (Severe rash)'],
      previous_surgeries: ['Appendectomy (2018)']
    },
    ai_insights: {
      concerns: ['Elevated blood pressure', 'Irregular heart rhythm (possible)', 'High LDL cholesterol'],
      findings: ['BP: 150/95 mmHg (High)', 'LDL: 162 mg/dL (High)', 'Mild ECG abnormality'],
      recommendations: ['Cardiology consultation', 'Lifestyle modification', 'Further cardiac evaluation (ECHO)']
    },
    prescriptions: [
      { id: 'p1', name: 'Tab. Amlodipine 5 mg', dose: '5 mg', frequency: 'Once daily', duration: '30 days', instructions: 'After breakfast' },
      { id: 'p2', name: 'Tab. Metformin 500 mg', dose: '500 mg', frequency: 'Twice daily', duration: '30 days', instructions: 'After meals' },
      { id: 'p3', name: 'Tab. Atorvastatin 10 mg', dose: '10 mg', frequency: 'Once daily', duration: '30 days', instructions: 'At night' }
    ],
    upcoming_followups: [
      { title: 'Blood Test Review', date: '19 May 2025', due_text: 'In 7 days' },
      { title: 'BP Monitoring', date: '26 May 2025', due_text: 'In 14 days' },
      { title: 'Cardiac Evaluation (ECHO)', date: '12 Jun 2025', due_text: 'In 1 month' }
    ],
    recent_records: [
      { title: 'ECG Report', date: '12 May 2025', type: 'PDF' },
      { title: 'Blood Test', date: '10 May 2025', type: 'PDF' },
      { title: 'Chest X-Ray', date: '05 May 2025', type: 'PDF' },
      { title: 'Prescription', date: '03 May 2025', type: 'PDF' },
      { title: 'Previous Summary', date: '20 Apr 2025', type: 'PDF' }
    ]
  },
  {
    id: '2',
    time: '11:00 AM',
    patient_name: 'Neha Gupta',
    patient_mupid: 'MB-9L2P8F',
    age: 42,
    gender: 'Female',
    type: 'in_person',
    complaint: 'Follow-up - BP review',
    status: 'scheduled',
    contact: { phone: '+91 98111 55667', email: 'neha.g@gmail.com', location: 'Delhi' },
    vitals: { bp: '130/85 mmHg', ldl: '120 mg/dL', ecg: 'Normal', blood_group: 'A+', height: '160 cm', weight: '58 kg' },
    history: { conditions: ['Hypertension'], allergies: [], previous_surgeries: [] },
    ai_insights: { concerns: ['Mild hypertension'], findings: ['BP stable'], recommendations: ['Continue medication'] },
    prescriptions: [],
    upcoming_followups: [],
    recent_records: []
  },
  {
    id: '3',
    time: '11:30 AM',
    patient_name: 'Amit Verma',
    patient_mupid: 'MB-1K8D9M',
    age: 52,
    gender: 'Male',
    type: 'online',
    complaint: 'ECG review',
    status: 'scheduled',
    contact: { phone: '+91 98222 77889', email: 'amit.v@gmail.com', location: 'Noida' },
    vitals: { bp: '140/90 mmHg', ldl: '145 mg/dL', ecg: 'Inverted T-wave', blood_group: 'O+', height: '175 cm', weight: '76 kg' },
    history: { conditions: ['CAD'], allergies: [], previous_surgeries: [] },
    ai_insights: { concerns: ['Ischemic changes'], findings: ['ECG abnormal'], recommendations: ['Angiography review'] },
    prescriptions: [],
    upcoming_followups: [],
    recent_records: []
  },
  {
    id: '4',
    time: '12:00 PM',
    patient_name: 'Priya Singh',
    patient_mupid: 'MB-326N1P',
    age: 38,
    gender: 'Female',
    type: 'in_person',
    complaint: 'Diabetes consultation',
    status: 'scheduled',
    contact: { phone: '+91 98333 88990', email: 'priya.s@gmail.com', location: 'Gurgaon' },
    vitals: { bp: '120/80 mmHg', ldl: '110 mg/dL', ecg: 'Normal', blood_group: 'B+', height: '165 cm', weight: '62 kg' },
    history: { conditions: ['Type 2 Diabetes'], allergies: [], previous_surgeries: [] },
    ai_insights: { concerns: ['HbA1c 7.4%'], findings: ['Elevated fasting glucose'], recommendations: ['Diet plan'] },
    prescriptions: [],
    upcoming_followups: [],
    recent_records: []
  }
];

export const DoctorWorkspacePage: React.FC = () => {
  const [appointments, setAppointments] = useState<DoctorAppointment[]>(INITIAL_APPOINTMENTS);
  const [selectedId, setSelectedId] = useState<string>('1');
  const [typeFilter, setTypeFilter] = useState<'all' | 'online' | 'in_person'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'records' | 'ai' | 'prescriptions' | 'notes'>('overview');
  const [prescriptions, setPrescriptions] = useState(INITIAL_APPOINTMENTS[0].prescriptions);
  const [isRecording, setIsRecording] = useState(false);
  const [isPrescriptionSigned, setIsPrescriptionSigned] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState(
    'Regular BP monitoring. Low salt diet. Follow-up after 2 weeks. If chest pain increases, visit emergency immediately.'
  );

  const selectedPatient = appointments.find((a) => a.id === selectedId) || appointments[0];

  const filteredAppointments = appointments.filter((a) => {
    if (typeFilter === 'all') return true;
    return a.type === typeFilter;
  });

  const handleAddMedicine = () => {
    const newMed = {
      id: `p-${Date.now()}`,
      name: 'Tab. Telmisartan 40 mg',
      dose: '40 mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Morning'
    };
    setPrescriptions([...prescriptions, newMed]);
  };

  const handleRemoveMedicine = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  const handleVoiceToText = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        alert('Voice transcription draft generated: Added Tab. Pantoprazole 40mg before breakfast.');
        setPrescriptions((prev) => [
          ...prev,
          {
            id: `p-${Date.now()}`,
            name: 'Tab. Pantoprazole 40 mg',
            dose: '40 mg',
            frequency: 'Once daily',
            duration: '15 days',
            instructions: 'Before breakfast'
          }
        ]);
      }, 2500);
    }
  };

  const handleGeneratePrescription = async () => {
    setIsPrescriptionSigned(true);
    const signatureId = `DSC-MED-${Date.now().toString().slice(-6)}`;
    try {
      await apiClient('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          patient_mupid: selectedPatient.patient_mupid,
          medicines: prescriptions,
          additional_instructions: 'Take after meals. Regular BP monitoring.',
        }),
      });
    } catch {}
    alert(`Prescription authenticated with Digital Clinician Signature ID: ${signatureId}. Synced with Patient Health Locker.`);
  };

  return (
    <div className="doctor-workspace-page">
      {/* Header */}
      <header className="doctor-workspace-page__header">
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Good Morning, Dr. Sharma ☀️
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
            You have 12 appointments today • Next consultation in 10 mins
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#F1F5F9',
            padding: '0.4rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: '#475569'
          }}>
            <Calendar size={16} />
            Mon, 12 May 2025 • 10:30 AM
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #2563EB'
            }}>
              AS
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                Dr. Arjun Sharma
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Cardiologist | Apollo Hospital, Delhi
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="doctor-workspace-page__layout">
        {/* Left Sidebar */}
        <aside className="doctor-workspace-page__sidebar">
          <div>
            <div className="sidebar-link sidebar-link--active">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} /> Dashboard
              </span>
            </div>
            <div className="sidebar-link">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} /> Today's Appointments
              </span>
              <span className="badge-counter">5</span>
            </div>
            <div className="sidebar-link">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} /> Patient Requests
              </span>
              <span className="badge-counter" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>3</span>
            </div>
            <div className="sidebar-link">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={18} /> Emergency Cases
              </span>
              <span className="badge-counter">2</span>
            </div>
            <div className="sidebar-link">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Pill size={18} /> Prescriptions
              </span>
            </div>
            <div className="sidebar-link">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} /> Treatment Plans
              </span>
            </div>
            <div className="sidebar-link">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={18} /> Medical Records
              </span>
            </div>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#0F172A' }}>
              <HelpCircle size={14} color="#2563EB" /> Need Clinical Help?
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>
              Hospital IT & EMR Hotline: Ext. 404
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="doctor-workspace-page__content">
          {/* Top KPI Row (5 Cards) */}
          <div className="doctor-workspace-page__kpi-row">
            <div className="doc-kpi-card">
              <div className="doc-kpi-card__icon doc-kpi-card__icon--blue">
                <Calendar size={20} />
              </div>
              <div>
                <div className="doc-kpi-card__value">12</div>
                <div className="doc-kpi-card__label">Today's Appointments</div>
              </div>
            </div>

            <div className="doc-kpi-card">
              <div className="doc-kpi-card__icon doc-kpi-card__icon--green">
                <User size={20} />
              </div>
              <div>
                <div className="doc-kpi-card__value">5</div>
                <div className="doc-kpi-card__label">New Patient Requests</div>
              </div>
            </div>

            <div className="doc-kpi-card">
              <div className="doc-kpi-card__icon doc-kpi-card__icon--red">
                <Heart size={20} />
              </div>
              <div>
                <div className="doc-kpi-card__value" style={{ color: '#DC2626' }}>2</div>
                <div className="doc-kpi-card__label">Emergency Cases</div>
              </div>
            </div>

            <div className="doc-kpi-card">
              <div className="doc-kpi-card__icon doc-kpi-card__icon--purple">
                <Clock size={20} />
              </div>
              <div>
                <div className="doc-kpi-card__value">8</div>
                <div className="doc-kpi-card__label">Follow-ups Due</div>
              </div>
            </div>

            <div className="doc-kpi-card">
              <div className="doc-kpi-card__icon doc-kpi-card__icon--orange">
                <FileText size={20} />
              </div>
              <div>
                <div className="doc-kpi-card__value">24</div>
                <div className="doc-kpi-card__label">Pending Reports</div>
              </div>
            </div>
          </div>

          {/* Split Workspace */}
          <div className="doctor-workspace-page__workspace-grid">
            {/* Left Column: Appointments List */}
            <div className="appointments-card">
              <div className="appointments-card__header">
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>Appointments</span>
                <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>View All</span>
              </div>

              <div className="appointments-card__tabs">
                <button
                  className={`btn btn--sm ${typeFilter === 'all' ? 'btn--primary' : 'btn--outline'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                  onClick={() => setTypeFilter('all')}
                >
                  All (12)
                </button>
                <button
                  className={`btn btn--sm ${typeFilter === 'online' ? 'btn--primary' : 'btn--outline'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                  onClick={() => setTypeFilter('online')}
                >
                  Online (6)
                </button>
                <button
                  className={`btn btn--sm ${typeFilter === 'in_person' ? 'btn--primary' : 'btn--outline'}`}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
                  onClick={() => setTypeFilter('in_person')}
                >
                  In-Person (6)
                </button>
              </div>

              <div className="appointments-card__list">
                {filteredAppointments.map((app) => (
                  <div
                    key={app.id}
                    className={`patient-appointment-item ${selectedId === app.id ? 'patient-appointment-item--selected' : ''}`}
                    onClick={() => {
                      setSelectedId(app.id);
                      if (app.prescriptions.length > 0) setPrescriptions(app.prescriptions);
                    }}
                  >
                    <div className="patient-appointment-item__top">
                      <span className="patient-appointment-item__time">{app.time}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: app.type === 'online' ? '#EFF6FF' : '#ECFDF5',
                        color: app.type === 'online' ? '#2563EB' : '#059669',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {app.type === 'online' ? <Video size={11} /> : <User size={11} />}
                        {app.type === 'online' ? 'Online' : 'In-Person'}
                      </span>
                    </div>

                    <div className="patient-appointment-item__name">{app.patient_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0' }}>
                      MUPID: {app.patient_mupid}
                    </div>
                    <div className="patient-appointment-item__complaint">{app.complaint}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Active Consultation Details */}
            <div className="consultation-main">
              {/* Patient Header */}
              <div className="consultation-main__header">
                <div className="consultation-main__patient-info">
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #93C5FD'
                  }}>
                    {selectedPatient.patient_name[0]}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A' }}>
                        {selectedPatient.patient_name}
                      </h2>
                      <span style={{ fontSize: '0.75rem', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                        {selectedPatient.type === 'online' ? 'Online Consultation' : 'In-Person Visit'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '2px' }}>
                      MUPID: <strong>{selectedPatient.patient_mupid}</strong> • ABHA ID: {selectedPatient.patient_abha_id || '91-XXXX-4521'} • Age: {selectedPatient.age} | {selectedPatient.gender}
                    </div>

                    <div className="consultation-main__badges-row">
                      <span className="badge badge--success">Known Patient</span>
                      {selectedPatient.history.allergies.length > 0 && (
                        <span className="badge badge--critical">
                          ⚠️ Allergy: {selectedPatient.history.allergies[0]}
                        </span>
                      )}
                      <span className="badge badge--neutral">Diabetic</span>
                      <span className="badge badge--neutral">Hypertension</span>
                    </div>
                  </div>
                </div>

                {/* Consultation CTAs */}
                <div className="consultation-main__cta-row">
                  <button className="btn btn--primary btn--md" onClick={() => alert('Launching WebRTC encrypted teleconsultation room...')}>
                    <Video size={16} /> Start Consultation
                  </button>
                  <button className="btn btn--outline btn--md">
                    <MessageSquare size={16} /> Chat
                  </button>
                  <button className="btn btn--outline btn--md">
                    <Clock size={16} /> Reschedule
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="tabs-nav">
                <button className={`tabs-nav__item ${activeTab === 'overview' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveTab('overview')}>
                  Overview
                </button>
                <button className={`tabs-nav__item ${activeTab === 'records' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveTab('records')}>
                  Medical Records ({selectedPatient.recent_records.length || 12})
                </button>
                <button className={`tabs-nav__item ${activeTab === 'ai' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveTab('ai')}>
                  AI Analysis
                </button>
                <button className={`tabs-nav__item ${activeTab === 'prescriptions' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
                  Prescriptions
                </button>
                <button className={`tabs-nav__item ${activeTab === 'notes' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveTab('notes')}>
                  Clinical Notes
                </button>
              </div>

              {/* AI Health Summary Card */}
              <div style={{ backgroundColor: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '8px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F766E', fontWeight: 700, fontSize: '0.875rem' }}>
                    <Activity size={18} /> AI Health Summary (Generated from verified documents)
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#0F766E', textDecoration: 'underline', cursor: 'pointer' }}>
                    View Full Report
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.8125rem' }}>
                  <div>
                    <strong style={{ color: '#DC2626' }}>Possible Concerns:</strong>
                    <ul style={{ marginTop: '4px', paddingLeft: '1rem', listStyle: 'disc', color: '#334155' }}>
                      {selectedPatient.ai_insights.concerns.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>

                  <div>
                    <strong style={{ color: '#2563EB' }}>Key Findings:</strong>
                    <ul style={{ marginTop: '4px', paddingLeft: '1rem', listStyle: 'disc', color: '#334155' }}>
                      {selectedPatient.ai_insights.findings.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>

                  <div>
                    <strong style={{ color: '#059669' }}>Recommendations:</strong>
                    <ul style={{ marginTop: '4px', paddingLeft: '1rem', listStyle: 'disc', color: '#334155' }}>
                      {selectedPatient.ai_insights.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Patient Vitals & Demographics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Vitals */}
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                    Patient Vitals & Information
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', fontSize: '0.8125rem' }}>
                    <div><strong>BP:</strong> {selectedPatient.vitals.bp}</div>
                    <div><strong>LDL:</strong> {selectedPatient.vitals.ldl}</div>
                    <div><strong>ECG:</strong> {selectedPatient.vitals.ecg}</div>
                    <div><strong>Blood Group:</strong> {selectedPatient.vitals.blood_group}</div>
                    <div><strong>Height:</strong> {selectedPatient.vitals.height}</div>
                    <div><strong>Weight:</strong> {selectedPatient.vitals.weight}</div>
                    <div><strong>Contact:</strong> {selectedPatient.contact.phone}</div>
                    <div><strong>City:</strong> {selectedPatient.contact.location}</div>
                  </div>
                </div>

                {/* Medical History */}
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                    Clinical Medical History
                  </div>
                  <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#334155' }}>
                    <div><strong>Conditions:</strong> {selectedPatient.history.conditions.join(', ') || 'None'}</div>
                    <div style={{ color: '#DC2626' }}><strong>Allergies:</strong> {selectedPatient.history.allergies.join(', ') || 'No known drug allergies'}</div>
                    <div><strong>Surgeries:</strong> {selectedPatient.history.previous_surgeries.join(', ') || 'None recorded'}</div>
                  </div>
                </div>
              </div>

              {/* Jan Aushadhi AI Drug Suggestion Alert */}
              <div style={{
                backgroundColor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '8px',
                padding: '0.85rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Pill size={20} color="#059669" />
                  <div style={{ fontSize: '0.8125rem', color: '#065F46' }}>
                    <strong>Generic Alternative Available:</strong> Amlodipine 5 mg is available at Pradhan Mantri Jan Aushadhi Kendra at <strong>~70% lower price</strong>.
                  </div>
                </div>
                <button className="btn btn--secondary btn--sm" style={{ fontSize: '0.75rem' }}>
                  View Jan Aushadhi Options
                </button>
              </div>

              {/* Interactive Prescription Authoring Builder */}
              <div className="prescription-builder">
                <div className="prescription-builder__toolbar">
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
                    Create Digital Prescription
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className={`btn btn--sm ${isRecording ? 'btn--danger' : 'btn--outline'}`}
                      onClick={handleVoiceToText}
                    >
                      <Mic size={14} /> {isRecording ? 'Listening...' : 'Voice to Text'}
                    </button>
                    <button className="btn btn--outline btn--sm">
                      <FileText size={14} /> Templates
                    </button>
                    <button className="btn btn--outline btn--sm">
                      <ShieldCheck size={14} /> Drug Checker
                    </button>
                  </div>
                </div>

                {/* Table */}
                <table className="prescription-builder__table">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Dose</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Instructions</th>
                      <th style={{ width: '40px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.dose}</td>
                        <td>{p.frequency}</td>
                        <td>{p.duration}</td>
                        <td>{p.instructions}</td>
                        <td>
                          <button
                            onClick={() => handleRemoveMedicine(p.id)}
                            style={{ color: '#EF4444', padding: '4px' }}
                            aria-label="Delete medicine"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  className="btn btn--outline btn--sm"
                  onClick={handleAddMedicine}
                  style={{ marginBottom: '1rem', color: '#2563EB', borderColor: '#BFDBFE' }}
                >
                  <Plus size={14} /> Add Medicine
                </button>

                {/* Additional Instructions */}
                <div className="form-group">
                  <label className="form-group__label">Additional Clinical Instructions</label>
                  <textarea
                    className="input-textarea"
                    rows={2}
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#64748B' }}>
                    <input type="checkbox" defaultChecked /> Save as clinical prescription template
                  </label>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn--outline btn--md">
                      Save Draft
                    </button>
                    <button
                      className="btn btn--primary btn--md"
                      onClick={handleGeneratePrescription}
                      disabled={isPrescriptionSigned}
                    >
                      <CheckCircle2 size={16} />
                      {isPrescriptionSigned ? 'Authenticated & Sent' : 'Generate Prescription'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Follow-ups & Notes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A' }}>Upcoming Follow-ups</span>
                    <button className="btn btn--outline btn--sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedPatient.upcoming_followups.map((f, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', padding: '0.4rem 0', borderBottom: '1px solid #E2E8F0' }}>
                        <div>
                          <strong>{f.title}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{f.date}</div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>{f.due_text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.75rem' }}>
                    Quick Clinical Notes
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '0.65rem', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      Patient has stress-related symptoms. Advised lifestyle changes and salt reduction.
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '4px' }}>12 May 2025, 10:30 AM</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

