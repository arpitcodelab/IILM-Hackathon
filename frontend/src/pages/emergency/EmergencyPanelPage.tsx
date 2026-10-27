import React, { useState, useEffect } from 'react';
import {
  Activity, Search, Bell, AlertTriangle, Shield, Stethoscope,
  BedDouble, Clock, Phone, ChevronRight, MapPin, User, FileText,
  AlertCircle, Share2, CheckCircle2, UserCheck, HeartPulse, Send,
  Ambulance, Hospital, Flame, Wind
} from 'lucide-react';
import { EmergencyCase } from '../../types';
import { EmergencyMap } from '../../components/emergency/EmergencyMap';
import { apiClient } from '../../api/client';

const INITIAL_CASES: EmergencyCase[] = [
  {
    id: '1',
    case_id: 'EMG-2024-001',
    title: 'Road Accident - Head Injury',
    category: 'Accident / Trauma',
    priority: 'critical',
    status: 'new',
    patient_mupid: 'MB-7X4Q2K',
    patient_name: 'Rohan Mehta',
    patient_abha_id: '91-XXXX-4521',
    patient_demographics: { age: 34, gender: 'Male', phone: '+91 98765 43210', blood_group: 'B+' },
    incident_location: { address: 'Sector 62, Noida, Uttar Pradesh', distance_km: 2.3, eta_minutes: 7, lat: 28.628, lng: 77.365 },
    reported_by: 'Bystander (+91 98765 11111)',
    incident_details: 'Road traffic accident, head injury, unconscious. Bleeding from forehead.',
    incident_photos: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=400&auto=format&fit=crop&q=60'
    ],
    elapsed_time: '2 min ago',
    created_at: '2026-10-27T10:23:00Z',
    ai_health_summary: {
      known_conditions: ['Hypertension (Since 2020)', 'Type 2 Diabetes (Since 2019)'],
      allergies: ['Penicillin (Severe)'],
      current_medications: ['Amlodipine 5 mg', 'Metformin 500 mg', 'Atorvastatin 10 mg'],
      recent_history: 'Last Checkup 12 Mar 2024, No major complications, Regular follow-ups'
    },
    timeline: [
      { time: '10:23 AM', event: 'Emergency alert received (Case EMG-2024-001 created)' },
      { time: '10:24 AM', event: 'Location identified (Sector 62, Noida, 2.3 km)' },
      { time: '10:25 AM', event: 'Patient details matched (MUPID: MB-7X4Q2K - Rohan Mehta)' },
      { time: '10:25 AM', event: 'Alert sent to Emergency Team (ER Team, Neurosurgery notified)' }
    ],
    notes: [
      { author: 'Dr. Anjali Singh', note: 'Trauma team pre-alerted. Prepare CT brain on arrival.', timestamp: '10:26 AM' }
    ]
  },
  {
    id: '2',
    case_id: 'EMG-2024-002',
    title: 'Breathing Difficulty',
    category: 'Respiratory',
    priority: 'high',
    status: 'new',
    patient_mupid: 'UNREGISTERED',
    patient_name: 'Not Provided',
    patient_demographics: { age: 28, gender: 'Female', phone: '+91 98111 22334' },
    incident_location: { address: 'Rohini, Delhi', distance_km: 5.1, eta_minutes: 14, lat: 28.704, lng: 77.102 },
    reported_by: 'Family Member (+91 98111 22334)',
    incident_details: 'Severe asthma exacerbation, cyanosis around lips, unable to speak in full sentences.',
    incident_photos: [],
    elapsed_time: '5 min ago',
    created_at: '2026-10-27T10:20:00Z',
    ai_health_summary: {
      known_conditions: ['Asthma (Severe)'],
      allergies: ['Dust, Aspirin'],
      current_medications: ['Salbutamol Inhaler', 'Budesonide'],
      recent_history: 'Frequent emergency visits in winter months'
    },
    timeline: [
      { time: '10:20 AM', event: 'Emergency alert received' },
      { time: '10:22 AM', event: 'Nebulization bay assigned in ER' }
    ],
    notes: []
  },
  {
    id: '3',
    case_id: 'EMG-2024-003',
    title: 'Chest Pain',
    category: 'Cardiac',
    priority: 'high',
    status: 'new',
    patient_mupid: 'MB-9H3LT',
    patient_name: 'Amit Verma',
    patient_abha_id: '91-YYYY-1102',
    patient_demographics: { age: 52, gender: 'Male', phone: '+91 98222 33445', blood_group: 'O+' },
    incident_location: { address: 'Connaught Place, New Delhi', distance_km: 3.7, eta_minutes: 11, lat: 28.631, lng: 77.216 },
    reported_by: 'Self (+91 98222 33445)',
    incident_details: 'Crushing retrosternal chest pain radiating to left jaw, diaphoresis.',
    incident_photos: [],
    elapsed_time: '8 min ago',
    created_at: '2026-10-27T10:17:00Z',
    ai_health_summary: {
      known_conditions: ['Hyperlipidemia', 'Family history of CAD'],
      allergies: ['None known'],
      current_medications: ['Rosuvastatin 20 mg'],
      recent_history: 'ECG 3 months ago showed mild ST-T changes'
    },
    timeline: [
      { time: '10:17 AM', event: 'Alert received from CP' },
      { time: '10:18 AM', event: 'Cath lab notified for STEMI protocol' }
    ],
    notes: []
  },
  {
    id: '4',
    case_id: 'EMG-2024-004',
    title: 'Stroke Symptoms',
    category: 'Neurology',
    priority: 'high',
    status: 'in_preparation',
    patient_mupid: 'MB-4P08XY',
    patient_name: 'Meena Iyer',
    patient_demographics: { age: 60, gender: 'Female', phone: '+91 98333 44556' },
    incident_location: { address: 'Dwarka, Delhi', distance_km: 8.4, eta_minutes: 20 },
    reported_by: 'Spouse',
    incident_details: 'Sudden onset right-sided hemiparesis and expressive aphasia. Last known well 45 mins ago.',
    incident_photos: [],
    elapsed_time: '22 min ago',
    created_at: '2026-10-27T10:03:00Z',
    ai_health_summary: {
      known_conditions: ['Atrial Fibrillation', 'Hypertension'],
      allergies: ['Sulfa drugs'],
      current_medications: ['Apixaban 5 mg', 'Telmisartan 40 mg'],
      recent_history: 'On anticoagulants'
    },
    timeline: [],
    notes: []
  },
  {
    id: '5',
    case_id: 'EMG-2024-005',
    title: 'Severe Abdominal Pain',
    category: 'General Surgery',
    priority: 'medium',
    status: 'active',
    patient_mupid: 'MB-2K9LQ1',
    patient_name: 'Rajesh Kumar',
    patient_demographics: { age: 45, gender: 'Male', phone: '+91 98444 55667' },
    incident_location: { address: 'Lajpat Nagar, New Delhi', distance_km: 4.1, eta_minutes: 13 },
    reported_by: 'Self',
    incident_details: 'Severe acute right lower quadrant pain, vomiting, fever.',
    incident_photos: [],
    elapsed_time: '35 min ago',
    created_at: '2026-10-27T09:50:00Z',
    ai_health_summary: {
      known_conditions: ['Gastritis'],
      allergies: ['None'],
      current_medications: ['Pantoprazole 40 mg'],
      recent_history: 'Suspected acute appendicitis'
    },
    timeline: [],
    notes: []
  },
  {
    id: '6',
    case_id: 'EMG-2024-006',
    title: 'Burn Injury',
    category: 'Trauma',
    priority: 'medium',
    status: 'arrived',
    patient_mupid: 'MB-8N44KZ',
    patient_name: 'Sanjay Rawat',
    patient_demographics: { age: 30, gender: 'Male', phone: '+91 98555 66778' },
    incident_location: { address: 'Okhla Phase 3', distance_km: 3.2, eta_minutes: 0 },
    reported_by: 'Colleague',
    incident_details: 'Second-degree chemical burn on bilateral forearms.',
    incident_photos: [],
    elapsed_time: '1 hr ago',
    created_at: '2026-10-27T09:20:00Z',
    ai_health_summary: {
      known_conditions: ['None'],
      allergies: ['None'],
      current_medications: ['None'],
      recent_history: 'Occupational injury'
    },
    timeline: [],
    notes: []
  }
];

export const EmergencyPanelPage: React.FC = () => {
  const [cases, setCases] = useState<EmergencyCase[]>(INITIAL_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('1');
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'active' | 'in_prep' | 'arrived'>('all');
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'records' | 'ai' | 'updates' | 'notes'>('info');
  const [handoverNote, setHandoverNote] = useState<string>('');
  const [acknowledgedCases, setAcknowledgedCases] = useState<Record<string, boolean>>({});

  const selectedCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const filteredCases = cases.filter((c) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return c.status === 'new';
    if (activeTab === 'active') return c.status === 'active';
    if (activeTab === 'in_prep') return c.status === 'in_preparation';
    if (activeTab === 'arrived') return c.status === 'arrived';
    return true;
  });

  useEffect(() => {
    apiClient<{ cases: any[] }>('/emergency/cases')
      .then((data) => {
        if (data.cases && data.cases.length > 0) {
          const mapped = data.cases.map((c: any) => ({
            id: c._id || c.case_id,
            case_id: c.case_id,
            title: c.chief_complaint || 'Emergency Incident',
            category: c.category || 'Accident / Trauma',
            priority: c.priority || 'high',
            status: c.status === 'in_prep' ? 'in_preparation' : c.status || 'new',
            patient_mupid: c.patient_mupid || 'UNREGISTERED',
            patient_name: c.patient_name || 'Unidentified Patient',
            patient_abha_id: c.patient_abha_id,
            patient_demographics: {
              age: c.age || 34,
              gender: c.gender || 'Male',
              phone: c.reported_by || '+91 98765 00000',
              blood_group: 'B+',
            },
            incident_location: {
              address: c.incident_location?.address || 'Sector 62, Noida',
              distance_km: c.incident_location?.distance_km || 2.3,
              eta_minutes: c.incident_location?.eta_minutes || 7,
              lat: c.incident_location?.lat || 28.628,
              lng: c.incident_location?.lng || 77.365,
            },
            reported_by: c.reported_by || 'Bystander Hotline Dispatch',
            incident_details: c.chief_complaint,
            incident_photos: c.photos || [],
            elapsed_time: 'Live',
            created_at: c.created_at || new Date().toISOString(),
            ai_health_summary: c.ai_summary || {
              known_conditions: ['Hypertension (Since 2020)', 'Type 2 Diabetes (Since 2019)'],
              allergies: ['Penicillin (Severe)'],
              current_medications: ['Amlodipine 5 mg', 'Metformin 500 mg', 'Atorvastatin 10 mg'],
              recent_history: 'Regular checkups; no acute complications recorded',
            },
            timeline: c.timeline || [{ time: 'Just now', event: 'Alert received' }],
            notes: c.notes || [],
          }));
          setCases(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleAcknowledge = (caseId: string) => {
    setAcknowledgedCases((prev) => ({ ...prev, [caseId]: true }));
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: 'active' } : c))
    );
    apiClient(`/emergency/cases/${caseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    }).catch(() => {});
  };

  const handlePrepareER = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status: 'in_preparation' } : c))
    );
    apiClient(`/emergency/cases/${caseId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'in_prep' }),
    }).catch(() => {});
  };

  const handleAddNote = () => {
    if (!handoverNote.trim()) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newNote = {
      author: 'Dr. Anjali Singh',
      note: handoverNote.trim(),
      timestamp: timeStr,
    };
    setCases((prev) =>
      prev.map((c) =>
        c.id === selectedCase.id ? { ...c, notes: [...c.notes, newNote] } : c
      )
    );
    apiClient(`/emergency/cases/${selectedCase.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ note: handoverNote.trim(), author: 'Dr. Anjali Singh' }),
    }).catch(() => {});
    setHandoverNote('');
  };

  return (
    <div className="emergency-panel-page">
      {/* Top Header Bar */}
      <header className="emergency-panel-page__topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              MediBridge AI
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hospital Emergency Panel
            </div>
          </div>
        </div>

        {/* Global Search with Ctrl+K */}
        <div className="emergency-panel-page__search">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by Case ID, MUPID, ABHA ID, name or phone..."
          />
          <span className="search-shortcut">Ctrl + K</span>
        </div>

        {/* User Controls */}
        <div className="emergency-panel-page__user-controls">
          <button style={{ position: 'relative', color: '#94A3B8', padding: '6px' }} aria-label="Notifications">
            <Bell size={20} />
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
              color: '#FFFFFF',
              fontSize: '0.65rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              3
            </span>
          </button>

          {/* Hospital Context Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: '#070D1E',
            border: '1px solid #1E293B',
            padding: '0.4rem 0.85rem',
            borderRadius: '9999px'
          }}>
            <Hospital size={16} color="#3B82F6" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F8FAFC' }}>
                Apollo Hospital, Delhi
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                Emergency Department
              </div>
            </div>
          </div>

          {/* Clinician Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#1E293B',
              color: '#F8FAFC',
              fontWeight: 700,
              fontSize: '0.8125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #10B981'
            }}>
              AS
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F8FAFC' }}>
                Dr. Anjali Singh
              </div>
              <div style={{ fontSize: '0.7rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                Emergency Head
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="emergency-panel-page__layout">
        {/* Left Dark Sidebar */}
        <aside className="emergency-panel-page__sidebar">
          <div>
            <div className="nav-item">
              <div className="nav-left">
                <Activity size={18} />
                <span>Dashboard</span>
              </div>
            </div>

            <div className="nav-item nav-item--active">
              <div className="nav-left">
                <AlertTriangle size={18} />
                <span>Emergency Cases</span>
              </div>
              <span className="nav-badge" style={{ backgroundColor: '#EF4444' }}>3</span>
            </div>

            <div className="nav-item">
              <div className="nav-left">
                <Shield size={18} />
                <span>Active Cases</span>
              </div>
              <span className="nav-badge">8</span>
            </div>

            <div className="nav-item">
              <div className="nav-left">
                <Stethoscope size={18} />
                <span>In Preparation</span>
              </div>
              <span className="nav-badge">5</span>
            </div>

            <div className="nav-item">
              <div className="nav-left">
                <BedDouble size={18} />
                <span>Arrived at Hospital</span>
              </div>
              <span className="nav-badge">2</span>
            </div>

            <div className="nav-item">
              <div className="nav-left">
                <CheckCircle2 size={18} />
                <span>Resolved Cases</span>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#1E293B', margin: '0.85rem 0' }} />

            <div className="nav-item">
              <div className="nav-left">
                <Search size={18} />
                <span>Patient Search</span>
              </div>
            </div>

            <div className="nav-item">
              <div className="nav-left">
                <Hospital size={18} />
                <span>Hospital Resources</span>
              </div>
            </div>

            <div className="nav-item">
              <div className="nav-left">
                <UserCheck size={18} />
                <span>Staff Management</span>
              </div>
            </div>
          </div>

          {/* Sidebar Footer Support */}
          <div>
            <div style={{
              backgroundColor: '#111C38',
              border: '1px solid #1E293B',
              borderRadius: '8px',
              padding: '0.85rem',
              marginBottom: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', fontSize: '0.75rem', fontWeight: 700 }}>
                <span className="badge-pulse" /> 24/7 Emergency Control
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>
                Always Active & Connected
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#94A3B8', fontSize: '0.75rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Phone size={16} />
              </div>
              <div>
                <div style={{ color: '#F8FAFC', fontWeight: 600 }}>Need Support?</div>
                <div>+91 11 4067 0000</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Main Stage */}
        <main className="emergency-panel-page__main">
          {/* Top KPI Ribbon (5 Cards) */}
          <div className="emergency-panel-page__kpi-ribbon">
            <div className="kpi-card">
              <div className="kpi-card__icon kpi-card__icon--red">
                <Bell size={22} />
              </div>
              <div>
                <div className="kpi-card__value" style={{ color: '#EF4444' }}>3</div>
                <div className="kpi-card__label">New Alerts</div>
                <div className="kpi-card__subtext">Needs attention</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card__icon kpi-card__icon--orange">
                <Shield size={22} />
              </div>
              <div>
                <div className="kpi-card__value" style={{ color: '#F97316' }}>8</div>
                <div className="kpi-card__label">Active Cases</div>
                <div className="kpi-card__subtext">In progress</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card__icon kpi-card__icon--blue">
                <Stethoscope size={22} />
              </div>
              <div>
                <div className="kpi-card__value" style={{ color: '#3B82F6' }}>5</div>
                <div className="kpi-card__label">In Preparation</div>
                <div className="kpi-card__subtext">Bed / Team / OT</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card__icon kpi-card__icon--green">
                <BedDouble size={22} />
              </div>
              <div>
                <div className="kpi-card__value" style={{ color: '#10B981' }}>4</div>
                <div className="kpi-card__label">Arrived Today</div>
                <div className="kpi-card__subtext">At Hospital</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-card__icon kpi-card__icon--slate">
                <Clock size={22} />
              </div>
              <div>
                <div className="kpi-card__value" style={{ color: '#60A5FA' }}>12 min</div>
                <div className="kpi-card__label">Avg. Response Time</div>
                <div className="kpi-card__subtext" style={{ color: '#10B981' }}>↓ -40% vs benchmark</div>
              </div>
            </div>
          </div>

          {/* 3-Column Command Workspace */}
          <div className="emergency-panel-page__workspace">
            {/* Column 1: Triage Cases Queue */}
            <div className="cases-column">
              <div className="cases-column__header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>Inbound Queue</span>
                  <span style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} /> Live Feed
                  </span>
                </div>
                {/* Tabs */}
                <div className="tabs-nav tabs-nav--dark">
                  <button className={`tabs-nav__item ${activeTab === 'all' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveTab('all')}>
                    All (16)
                  </button>
                  <button className={`tabs-nav__item ${activeTab === 'new' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveTab('new')}>
                    New (3)
                  </button>
                  <button className={`tabs-nav__item ${activeTab === 'active' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveTab('active')}>
                    Active (8)
                  </button>
                  <button className={`tabs-nav__item ${activeTab === 'in_prep' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveTab('in_prep')}>
                    In Prep (5)
                  </button>
                  <button className={`tabs-nav__item ${activeTab === 'arrived' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveTab('arrived')}>
                    Arrived (2)
                  </button>
                </div>
              </div>

              {/* Case Filters */}
              <div className="cases-column__filters">
                <select className="input-select input-select--dark" style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}>
                  <option>All Priorities</option>
                  <option>Critical Only</option>
                  <option>High Priority</option>
                </select>
                <select className="input-select input-select--dark" style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}>
                  <option>All Categories</option>
                  <option>Accident / Trauma</option>
                  <option>Cardiac</option>
                  <option>Respiratory</option>
                </select>
              </div>

              {/* Case Cards List */}
              <div className="cases-column__list">
                {filteredCases.map((c) => (
                  <div
                    key={c.id}
                    className={`case-item ${selectedCaseId === c.id ? 'case-item--selected' : ''}`}
                    onClick={() => setSelectedCaseId(c.id)}
                  >
                    <div className="case-item__top">
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        backgroundColor: c.priority === 'critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(249, 115, 22, 0.2)',
                        color: c.priority === 'critical' ? '#EF4444' : '#F97316',
                        textTransform: 'uppercase'
                      }}>
                        {c.priority}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{c.elapsed_time}</span>
                    </div>

                    <div className="case-item__title">{c.title}</div>

                    <div className="case-item__meta">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1' }}>
                        <User size={13} color="#94A3B8" />
                        <span>{c.patient_name} • {c.patient_demographics.age}{c.patient_demographics.gender[0]}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}>
                        <MapPin size={13} color="#94A3B8" />
                        <span>{c.incident_location.address} ({c.incident_location.distance_km} km)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Geospatial & Resources */}
            <div className="geo-column">
              {/* Live Location Map */}
              <div className="geo-column__map-card">
                <EmergencyMap
                  origin={selectedCase.incident_location}
                  distanceKm={selectedCase.incident_location.distance_km}
                  etaMinutes={selectedCase.incident_location.eta_minutes}
                />
              </div>

              {/* Live Incident Updates Feed */}
              <div className="geo-column__timeline">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F8FAFC' }}>Live Updates</div>
                  <div style={{ fontSize: '0.7rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} /> Auto Refresh
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {selectedCase.timeline.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.75rem' }}>
                      <span style={{ color: '#EF4444', fontWeight: 600, minWidth: '60px' }}>{item.time}</span>
                      <span style={{ color: '#CBD5E1' }}>{item.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hospital Resources Availability */}
              <div className="geo-column__resources">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#F8FAFC' }}>Hospital Resources</div>
                  <a href="#resources" style={{ fontSize: '0.75rem', color: '#3B82F6' }}>View All</a>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: '#0B132B', padding: '0.65rem', borderRadius: '6px', textAlign: 'center', border: '1px solid #1E293B' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>ER Beds</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>4 / 12</div>
                  </div>
                  <div style={{ backgroundColor: '#0B132B', padding: '0.65rem', borderRadius: '6px', textAlign: 'center', border: '1px solid #1E293B' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>ICU Beds</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F97316', marginTop: '2px' }}>2 / 8</div>
                  </div>
                  <div style={{ backgroundColor: '#0B132B', padding: '0.65rem', borderRadius: '6px', textAlign: 'center', border: '1px solid #1E293B' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>OT Available</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#3B82F6', marginTop: '2px' }}>1 / 3</div>
                  </div>
                  <div style={{ backgroundColor: '#0B132B', padding: '0.65rem', borderRadius: '6px', textAlign: 'center', border: '1px solid #1E293B' }}>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Ambulances</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>2 / 5</div>
                  </div>
                </div>

                {/* Quick Actions Ribbon */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  <button className="btn btn--danger btn--sm" style={{ fontSize: '0.75rem', padding: '0.5rem 0.25rem' }}>
                    Alert ER Team
                  </button>
                  <button className="btn btn--outline btn--sm" style={{ borderColor: '#334155', color: '#F8FAFC', fontSize: '0.75rem', padding: '0.5rem 0.25rem' }}>
                    Prepare OT
                  </button>
                  <button className="btn btn--outline btn--sm" style={{ borderColor: '#334155', color: '#F8FAFC', fontSize: '0.75rem', padding: '0.5rem 0.25rem' }}>
                    Notify Specialist
                  </button>
                  <button className="btn btn--outline btn--sm" style={{ borderColor: '#334155', color: '#F8FAFC', fontSize: '0.75rem', padding: '0.5rem 0.25rem' }}>
                    Dispatch Amb.
                  </button>
                </div>
              </div>
            </div>

            {/* Column 3: Case Intelligence & Actions */}
            <div className="detail-column">
              <div className="detail-column__header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>{selectedCase.case_id}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#EF4444'
                    }}>
                      {selectedCase.priority.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#CBD5E1', marginTop: '4px' }}>
                    {selectedCase.title}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn--danger btn--sm"
                    onClick={() => handleAcknowledge(selectedCase.id)}
                    disabled={acknowledgedCases[selectedCase.id]}
                  >
                    {acknowledgedCases[selectedCase.id] ? 'Acknowledged' : 'Acknowledge'}
                  </button>
                  <button className="btn btn--outline btn--sm" style={{ borderColor: '#334155', color: '#F8FAFC' }}>
                    Assign
                  </button>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="tabs-nav tabs-nav--dark">
                <button className={`tabs-nav__item ${activeDetailTab === 'info' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveDetailTab('info')}>
                  Patient Info
                </button>
                <button className={`tabs-nav__item ${activeDetailTab === 'records' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveDetailTab('records')}>
                  Medical Records
                </button>
                <button className={`tabs-nav__item ${activeDetailTab === 'ai' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveDetailTab('ai')}>
                  AI Summary
                </button>
                <button className={`tabs-nav__item ${activeDetailTab === 'notes' ? 'tabs-nav__item--active' : ''}`} onClick={() => setActiveDetailTab('notes')}>
                  Notes ({selectedCase.notes.length})
                </button>
              </div>

              {/* Patient Identity Card */}
              <div className="detail-column__patient-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#1E293B',
                      color: '#60A5FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {selectedCase.patient_name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F8FAFC' }}>
                        {selectedCase.patient_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> Known Patient
                      </div>
                    </div>
                  </div>
                  <button className="btn btn--outline btn--sm" style={{ borderColor: '#334155', color: '#94A3B8', fontSize: '0.75rem' }}>
                    View Profile
                  </button>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div><strong>MUPID:</strong> {selectedCase.patient_mupid}</div>
                  <div><strong>ABHA:</strong> {selectedCase.patient_abha_id || 'Not linked'}</div>
                  <div><strong>Demographics:</strong> {selectedCase.patient_demographics.age}Y, {selectedCase.patient_demographics.gender}</div>
                  <div><strong>Phone:</strong> {selectedCase.patient_demographics.phone}</div>
                </div>

                <div style={{ borderTop: '1px solid #1E293B', paddingTop: '0.75rem', fontSize: '0.75rem', color: '#94A3B8' }}>
                  <div><strong>Location:</strong> {selectedCase.incident_location.address} ({selectedCase.incident_location.distance_km} km • ~{selectedCase.incident_location.eta_minutes} mins)</div>
                  <div style={{ marginTop: '4px' }}><strong>Reported By:</strong> {selectedCase.reported_by}</div>
                </div>
              </div>

              {/* Critical AI Health Summary & Allergies */}
              <div style={{ backgroundColor: '#0B132B', border: '1px solid #1E293B', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HeartPulse size={16} color="#EF4444" /> AI Health Summary (From Records)
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#3B82F6' }}>View Full Analysis</span>
                </div>

                {/* Critical Allergy Banner */}
                {selectedCase.ai_health_summary.allergies.length > 0 && (
                  <div className="detail-column__allergy-alert" style={{ marginBottom: '0.75rem' }}>
                    <strong>⚠️ CRITICAL ALLERGY:</strong> {selectedCase.ai_health_summary.allergies.join(', ')}
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div><strong>Known Conditions:</strong> {selectedCase.ai_health_summary.known_conditions.join(', ')}</div>
                  <div><strong>Current Medications:</strong> {selectedCase.ai_health_summary.current_medications.join(', ')}</div>
                  <div><strong>Recent Clinical History:</strong> {selectedCase.ai_health_summary.recent_history}</div>
                </div>
              </div>

              {/* Emergency Response Actions */}
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#F8FAFC', marginBottom: '0.65rem' }}>
                  Emergency Actions
                </div>
                <div className="detail-column__actions-grid">
                  <button className="btn btn--danger btn--sm" onClick={() => handleAcknowledge(selectedCase.id)}>
                    Acknowledge Case
                  </button>
                  <button className="btn btn--primary btn--sm" onClick={() => handlePrepareER(selectedCase.id)}>
                    Prepare ER
                  </button>
                  <button className="btn btn--outline btn--sm" style={{ borderColor: '#334155', color: '#F8FAFC' }}>
                    Call Family
                  </button>
                  <button className="btn btn--outline btn--sm" style={{ borderColor: '#334155', color: '#F8FAFC' }}>
                    Assign Doctor
                  </button>
                  <button className="btn btn--outline btn--sm" style={{ borderColor: '#334155', color: '#F8FAFC' }}>
                    Request Ambulance
                  </button>
                  <button className="btn btn--outline btn--sm" style={{ borderColor: '#334155', color: '#F8FAFC' }}>
                    Mark in Prep
                  </button>
                </div>
              </div>

              {/* Handover Notes Input */}
              <div style={{ borderTop: '1px solid #1E293B', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="input-text input-text--dark"
                    placeholder="Add a clinical handover note..."
                    value={handoverNote}
                    onChange={(e) => setHandoverNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <button className="btn btn--danger btn--sm" onClick={handleAddNote}>
                    <Send size={14} />
                  </button>
                </div>

                {selectedCase.notes.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedCase.notes.map((n, i) => (
                      <div key={i} style={{ backgroundColor: '#0B132B', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid #1E293B' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', marginBottom: '2px' }}>
                          <strong>{n.author}</strong>
                          <span>{n.timestamp}</span>
                        </div>
                        <div style={{ color: '#F8FAFC' }}>{n.note}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

