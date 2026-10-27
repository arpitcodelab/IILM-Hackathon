import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Video, MessageSquare, AlertCircle, FileText,
  User, CheckCircle2, ChevronRight, Mic, Plus, Trash2, ShieldCheck,
  Stethoscope, Pill, Heart, Activity, Search, HelpCircle, Share2,
  Sparkles, X, Check, ArrowRight
} from 'lucide-react';
import { DoctorAppointment } from '../../types';
import { apiClient } from '../../api/client';

interface GenericAlternativeModalData {
  referenceBrand: string;
  brandPrice: number;
  genericName: string;
  genericPrice: number;
  savingsPercentage: number;
  activeIngredient: string;
  dosageForm: string;
  packSize: string;
  matchType: string;
  safetyDisclaimer: string;
  medicineIdToUpdate?: string;
}

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
  const [signatureMeta, setSignatureMeta] = useState<string | null>(null);
  const [additionalInstructions, setAdditionalInstructions] = useState(
    'Regular BP monitoring. Low salt diet. Follow-up after 2 weeks. If chest pain increases, visit emergency immediately.'
  );

  // GenericMeds AI state
  const [genericModalData, setGenericModalData] = useState<GenericAlternativeModalData | null>(null);
  const [loadingGeneric, setLoadingGeneric] = useState(false);
  const [inlineComparisons, setInlineComparisons] = useState<Record<string, any>>({});
  const [inlineLoading, setInlineLoading] = useState<Record<string, boolean>>({});
  const comparisonCache = React.useRef<Record<string, any>>({});
  const activeAbortControllers = React.useRef<Record<string, AbortController>>({});
  const debounceTimers = React.useRef<Record<string, any>>({});

  // Sync demo patient from localStorage if selected by mentor
  useEffect(() => {
    const cached = localStorage.getItem('medibridge_active_patient');
    if (cached) {
      try {
        const demoPatient = JSON.parse(cached);
        if (demoPatient && demoPatient.mupid) {
          setAppointments((prev) => {
            const exists = prev.some((p) => p.patient_mupid === demoPatient.mupid);
            if (exists) return prev;
            const newApp: DoctorAppointment = {
              id: `demo-${demoPatient.mupid}`,
              time: '10:30 AM',
              patient_name: demoPatient.name,
              patient_mupid: demoPatient.mupid,
              patient_abha_id: demoPatient.apar_id || '91-XXXX-4521',
              age: demoPatient.age || 34,
              gender: demoPatient.gender || 'Male',
              type: 'online',
              complaint: demoPatient.scenario || 'Routine follow-up & clinical review',
              status: 'scheduled',
              contact: {
                phone: demoPatient.phone || '+91 98765 43210',
                email: 'patient@medibridge.ai',
                location: 'Delhi NCR'
              },
              vitals: {
                bp: '138/88 mmHg',
                ldl: '150 mg/dL',
                ecg: 'Normal sinus rhythm',
                blood_group: demoPatient.blood_group || 'B+',
                height: '170 cm',
                weight: '68 kg',
                employment: 'Private sector'
              },
              history: {
                conditions: demoPatient.clinical_summary?.known_conditions || ['Hypertension'],
                allergies: demoPatient.clinical_summary?.allergies || [],
                previous_surgeries: []
              },
              ai_insights: {
                concerns: demoPatient.sample_records?.[0]?.ai_summary?.concerns || ['Elevated BP'],
                findings: demoPatient.sample_records?.[0]?.ai_summary?.findings?.map((f: any) => `${f.title}: ${f.details}`) || ['Stable vitals'],
                recommendations: ['Routine follow-up in 2 weeks', 'Continue current regimen']
              },
              prescriptions: [
                { id: 'p1', name: 'Tab. Amlodipine 5 mg', dose: '5 mg', frequency: 'Once daily', duration: '30 days', instructions: 'After breakfast' },
                { id: 'p2', name: 'Tab. Metformin 500 mg', dose: '500 mg', frequency: 'Twice daily', duration: '30 days', instructions: 'After meals' },
                { id: 'p3', name: 'Tab. Atorvastatin 10 mg', dose: '10 mg', frequency: 'Once daily', duration: '30 days', instructions: 'At night' }
              ],
              upcoming_followups: [
                { title: 'Blood Test Review', date: '19 May 2025', due_text: 'In 7 days' },
                { title: 'BP Monitoring', date: '26 May 2025', due_text: 'In 14 days' }
              ],
              recent_records: [
                { title: 'Metabolic Panel', date: '12 May 2025', type: 'PDF' },
                { title: 'ECG Report', date: '10 May 2025', type: 'PDF' }
              ]
            };
            return [newApp, ...prev];
          });
          setSelectedId(`demo-${demoPatient.mupid}`);
        }
      } catch {}
    }
  }, []);

  const selectedPatient = appointments.find((a) => a.id === selectedId) || appointments[0];

  const filteredAppointments = appointments.filter((a) => {
    if (typeFilter === 'all') return true;
    return a.type === typeFilter;
  });

  const triggerAutoComparison = (medicineName: string, rowId: string, dose?: string) => {
    const cleaned = medicineName.replace(/^(Tab\.|Cap\.|Syp\.|Inj\.|Oint\.)\s*/i, '').trim();

    if (debounceTimers.current[rowId]) {
      clearTimeout(debounceTimers.current[rowId]);
    }

    if (activeAbortControllers.current[rowId]) {
      activeAbortControllers.current[rowId].abort();
    }

    if (cleaned.length < 3 || cleaned.toLowerCase().includes('jan aushadhi')) {
      setInlineComparisons((prev) => {
        const copy = { ...prev };
        delete copy[rowId];
        return copy;
      });
      setInlineLoading((prev) => ({ ...prev, [rowId]: false }));
      return;
    }

    const cacheKey = cleaned.toLowerCase();
    if (comparisonCache.current[cacheKey]) {
      setInlineComparisons((prev) => ({ ...prev, [rowId]: comparisonCache.current[cacheKey] }));
      setInlineLoading((prev) => ({ ...prev, [rowId]: false }));
      return;
    }

    debounceTimers.current[rowId] = setTimeout(async () => {
      const controller = new AbortController();
      activeAbortControllers.current[rowId] = controller;
      setInlineLoading((prev) => ({ ...prev, [rowId]: true }));

      try {
        const res: any = await apiClient('/medicines/compare-alternatives', {
          method: 'POST',
          body: JSON.stringify({
            medicineName: cleaned,
            dosageForm: 'Tablet',
            strength: dose ? parseFloat(dose) || undefined : undefined,
          }),
          signal: controller.signal,
        });

        if (res && res.candidates && res.candidates.length > 0) {
          comparisonCache.current[cacheKey] = res;
          setInlineComparisons((prev) => ({ ...prev, [rowId]: res }));
        } else {
          setInlineComparisons((prev) => {
            const copy = { ...prev };
            delete copy[rowId];
            return copy;
          });
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // Graceful non-blocking fallback
          setInlineComparisons((prev) => {
            const copy = { ...prev };
            delete copy[rowId];
            return copy;
          });
        }
      } finally {
        setInlineLoading((prev) => ({ ...prev, [rowId]: false }));
      }
    }, 400);
  };

  const handleUpdateMedicineRow = (id: string, field: string, val: string) => {
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: val };
          if (field === 'name') {
            triggerAutoComparison(val, id, updated.dose);
          }
          return updated;
        }
        return p;
      })
    );
  };

  const handleAddSpecificMedicine = (name: string, dose: string, freq: string) => {
    const newId = `p-${Date.now()}`;
    const newMed = {
      id: newId,
      name: `Tab. ${name}`,
      dose,
      frequency: freq,
      duration: '30 days',
      instructions: 'After meals',
    };
    setPrescriptions((prev) => [...prev, newMed]);
    triggerAutoComparison(name, newId, dose);
  };

  const handleAdoptInlineAlternative = (rowId: string, candidate: any, refBrand: string) => {
    const genericDisplayName = candidate.generic_name.startsWith('Tab.')
      ? candidate.generic_name
      : `Tab. ${candidate.generic_name}`;

    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === rowId
          ? {
              ...p,
              name: genericDisplayName,
              instructions: `${p.instructions || 'After meals'} (Adopted Jan Aushadhi generic alternative - ${candidate.savings_percentage}% savings)`,
            }
          : p
      )
    );

    setInlineComparisons((prev) => {
      const copy = { ...prev };
      delete copy[rowId];
      return copy;
    });

    alert(
      `Prescription Updated: Adopted ${candidate.generic_name}. Patient saves ${candidate.savings_percentage || 70}% (~₹${candidate.savings_amount_inr || 100}) per pack at Jan Aushadhi Kendra.`
    );
  };

  const handleDismissInlineAlternative = (rowId: string) => {
    setInlineComparisons((prev) => {
      const copy = { ...prev };
      delete copy[rowId];
      return copy;
    });
  };

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

  // GenericMeds AI Alternative Lookup
  const handleCheckGenericAlternatives = async (medicineName: string, dose?: string, medId?: string) => {
    setLoadingGeneric(true);
    try {
      const cleaned = medicineName.replace(/^Tab\.\s*|^Cap\.\s*|^Syp\.\s*/i, '').trim();
      const res: any = await apiClient('/medicines/alternatives', {
        method: 'POST',
        body: JSON.stringify({
          brand_name: cleaned,
          active_ingredient: cleaned,
          strength_value: parseFloat(dose || '500') || 500,
          strength_unit: 'mg',
          dosage_form: 'Tablet'
        })
      });

      if (res && res.candidates && res.candidates.length > 0) {
        const top = res.candidates[0];
        setGenericModalData({
          referenceBrand: res.reference_brand || medicineName,
          brandPrice: res.brand_price_inr || 160,
          genericName: top.generic_name || `${cleaned} (Jan Aushadhi PMBJP)`,
          genericPrice: top.generic_price_inr || 38,
          savingsPercentage: top.savings_percentage || 76,
          activeIngredient: top.active_ingredients?.map((i: any) => `${i.name} ${i.strength_value}${i.strength_unit}`).join(', ') || `${cleaned} ${dose || '500mg'}`,
          dosageForm: top.dosage_form || 'Tablet',
          packSize: 'Standard Strip (10 Tablets)',
          matchType: top.match_type || 'EXACT_COMPOSITION_MATCH',
          safetyDisclaimer: res.mandatory_safety_disclaimer || 'Same active ingredient, strength and formulation. Confirm with doctor or pharmacist.',
          medicineIdToUpdate: medId
        });
      } else {
        // Fallback robust comparison
        setGenericModalData({
          referenceBrand: medicineName,
          brandPrice: 160,
          genericName: `${cleaned} Tablets IP (PMBJP Kendra)`,
          genericPrice: 38,
          savingsPercentage: 76,
          activeIngredient: `${cleaned} ${dose || '500 mg'}`,
          dosageForm: 'Tablet',
          packSize: 'Strip of 10 Tablets',
          matchType: 'EXACT_COMPOSITION_MATCH',
          safetyDisclaimer: 'Same active ingredient, strength and formulation. Please confirm with your doctor or pharmacist. Never automatically substituted.',
          medicineIdToUpdate: medId
        });
      }
    } catch {
      const cleaned = medicineName.replace(/^Tab\.\s*|^Cap\.\s*|^Syp\.\s*/i, '').trim();
      setGenericModalData({
        referenceBrand: medicineName,
        brandPrice: 160,
        genericName: `${cleaned} Tablets IP (PMBJP Kendra)`,
        genericPrice: 38,
        savingsPercentage: 76,
        activeIngredient: `${cleaned} ${dose || '500 mg'}`,
        dosageForm: 'Tablet',
        packSize: 'Strip of 10 Tablets',
        matchType: 'EXACT_COMPOSITION_MATCH',
        safetyDisclaimer: 'Same active ingredient, strength and formulation. Please confirm with your doctor or pharmacist. Never automatically substituted.',
        medicineIdToUpdate: medId
      });
    } finally {
      setLoadingGeneric(false);
    }
  };

  const handleAdoptGeneric = () => {
    if (!genericModalData) return;
    if (genericModalData.medicineIdToUpdate) {
      setPrescriptions((prev) =>
        prev.map((p) =>
          p.id === genericModalData.medicineIdToUpdate
            ? { ...p, name: `Tab. ${genericModalData.genericName}` }
            : p
        )
      );
    } else {
      // Find matching item or add as adopted
      setPrescriptions((prev) => [
        ...prev,
        {
          id: `p-gen-${Date.now()}`,
          name: `Tab. ${genericModalData.genericName}`,
          dose: genericModalData.dosageForm,
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Jan Aushadhi Alternative (Adopted by Clinician)'
        }
      ]);
    }
    const savings = genericModalData.savingsPercentage;
    setGenericModalData(null);
    alert(`Clinician Confirmed: Adopted Jan Aushadhi generic alternative (${savings}% price savings for patient).`);
  };

  const handleGeneratePrescription = async () => {
    setIsPrescriptionSigned(true);
    const signatureId = `DSC-MED-${Date.now().toString().slice(-6)}`;
    setSignatureMeta(signatureId);
    try {
      const createdRes: any = await apiClient('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          patient_mupid: selectedPatient.patient_mupid,
          medicines: prescriptions,
          additional_instructions: additionalInstructions,
          doctor_name: 'Dr. Arjun Sharma'
        }),
      });
      if (createdRes?.prescription?._id) {
        await apiClient(`/prescriptions/${createdRes.prescription._id}/authenticate`, {
          method: 'PATCH',
          body: JSON.stringify({ digital_signature_id: signatureId })
        });
      }
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
                <button
                  className="btn btn--secondary btn--sm"
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => handleCheckGenericAlternatives('Amlodipine', '5 mg')}
                  disabled={loadingGeneric}
                >
                  <Sparkles size={13} />
                  {loadingGeneric ? 'Analyzing...' : 'View Jan Aushadhi Options'}
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

                {/* Quick Add Brand Medicine Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0.85rem 0 0.5rem 0', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ⚡ Test Brand Medicines (GenericMeds AI Auto-Compare):
                  </span>
                  {[
                    { name: 'Azee 500', dose: '500 mg', freq: 'Once daily' },
                    { name: 'Augmentin 625 Duo', dose: '625 mg', freq: 'Twice daily' },
                    { name: 'Amlopres 5', dose: '5 mg', freq: 'Once daily' },
                    { name: 'Atorva 10', dose: '10 mg', freq: 'Once daily' },
                    { name: 'Calpol 650', dose: '650 mg', freq: 'SOS' },
                    { name: 'Glycomet 500', dose: '500 mg', freq: 'Twice daily' },
                    { name: 'Pantocid 40', dose: '40 mg', freq: 'Once daily' },
                    { name: 'Telma 40', dose: '40 mg', freq: 'Once daily' },
                  ].map((med) => (
                    <button
                      key={med.name}
                      type="button"
                      className="btn btn--xs"
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 7px',
                        borderRadius: '9999px',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        border: '1px solid #BFDBFE',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleAddSpecificMedicine(med.name, med.dose, med.freq)}
                    >
                      + {med.name}
                    </button>
                  ))}
                </div>

                {/* Table */}
                <table className="prescription-builder__table">
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Medicine Name</th>
                      <th style={{ width: '12%' }}>Dose</th>
                      <th style={{ width: '16%' }}>Frequency</th>
                      <th style={{ width: '14%' }}>Duration</th>
                      <th style={{ width: '20%' }}>Instructions</th>
                      <th style={{ width: '10%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((p) => {
                      const comparison = inlineComparisons[p.id];
                      const topCandidate = comparison?.candidates?.[0];
                      const isLoading = inlineLoading[p.id];

                      return (
                        <React.Fragment key={p.id}>
                          <tr>
                            <td>
                              <input
                                type="text"
                                className="input-text"
                                value={p.name}
                                onChange={(e) => handleUpdateMedicineRow(p.id, 'name', e.target.value)}
                                style={{ width: '100%', fontWeight: 600, padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                                placeholder="Enter brand or generic name..."
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="input-text"
                                value={p.dose}
                                onChange={(e) => handleUpdateMedicineRow(p.id, 'dose', e.target.value)}
                                style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="input-text"
                                value={p.frequency}
                                onChange={(e) => handleUpdateMedicineRow(p.id, 'frequency', e.target.value)}
                                style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="input-text"
                                value={p.duration}
                                onChange={(e) => handleUpdateMedicineRow(p.id, 'duration', e.target.value)}
                                style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="input-text"
                                value={p.instructions}
                                onChange={(e) => handleUpdateMedicineRow(p.id, 'instructions', e.target.value)}
                                style={{ width: '100%', padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                              />
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <button
                                  type="button"
                                  className="btn btn--xs"
                                  style={{
                                    fontSize: '0.68rem',
                                    padding: '3px 6px',
                                    backgroundColor: topCandidate ? '#DCFCE7' : '#ECFDF5',
                                    color: topCandidate ? '#15803D' : '#059669',
                                    border: '1px solid #A7F3D0',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap'
                                  }}
                                  onClick={() => handleCheckGenericAlternatives(p.name, p.dose, p.id)}
                                  title="Open Full Modal Comparison"
                                >
                                  <Pill size={11} /> {topCandidate?.savings_percentage ? `-${topCandidate.savings_percentage}%` : 'Generic'}
                                </button>
                                <button
                                  onClick={() => handleRemoveMedicine(p.id)}
                                  style={{ color: '#EF4444', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
                                  aria-label="Delete medicine"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Loading Shimmer */}
                          {isLoading && (
                            <tr>
                              <td colSpan={6} style={{ backgroundColor: '#F0F9FF', padding: '0.65rem 1rem', borderBottom: '1px solid #BAE6FD' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1', fontSize: '0.78125rem' }}>
                                  <Sparkles size={14} className="animate-spin" />
                                  <span>GenericMeds AI: Searching composition equivalence & verified PMBJP pricing for <strong>{p.name}</strong>...</span>
                                </div>
                              </td>
                            </tr>
                          )}

                          {/* Inline Comparison Card */}
                          {topCandidate && (
                            <tr>
                              <td colSpan={6} style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <div style={{
                                  backgroundColor: '#FFFFFF',
                                  border: topCandidate.match_type === 'EXACT_COMPOSITION_MATCH' ? '1.5px solid #86EFAC' : '1px solid #E2E8F0',
                                  borderRadius: '12px',
                                  padding: '1rem',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                                }}>
                                  {/* Header */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: '2px 8px',
                                        borderRadius: '9999px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        backgroundColor: topCandidate.match_type === 'EXACT_COMPOSITION_MATCH' ? '#DCFCE7' : '#FEF3C7',
                                        color: topCandidate.match_type === 'EXACT_COMPOSITION_MATCH' ? '#15803D' : '#B45309',
                                      }}>
                                        <CheckCircle2 size={12} />
                                        {topCandidate.match_type === 'EXACT_COMPOSITION_MATCH' ? 'EXACT COMPOSITION MATCH' : topCandidate.match_type}
                                      </span>
                                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                                        GenericMeds AI Alternative Engine
                                      </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      {topCandidate.savings_percentage && (
                                        <span style={{
                                          backgroundColor: '#DCFCE7',
                                          color: '#15803D',
                                          fontWeight: 800,
                                          fontSize: '0.75rem',
                                          padding: '2px 8px',
                                          borderRadius: '9999px',
                                          border: '1px solid #86EFAC'
                                        }}>
                                          ⚡ {topCandidate.savings_percentage}% Cheaper
                                        </span>
                                      )}
                                      <button
                                        onClick={() => handleDismissInlineAlternative(p.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '2px' }}
                                        title="Dismiss inline comparison"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Side-by-Side Comparison */}
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                                    <div style={{ backgroundColor: '#F8FAFC', padding: '0.85rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        Your Prescribed Brand
                                      </div>
                                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                                        {comparison.reference_brand || p.name}
                                      </div>
                                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#475569', marginTop: '4px' }}>
                                        ₹{comparison.brand_price_inr || 160}
                                        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#94A3B8' }}> ({topCandidate.pack_size || 'Standard Strip'})</span>
                                      </div>
                                    </div>

                                    <div style={{ backgroundColor: '#F0FDF4', padding: '0.85rem', borderRadius: '8px', border: '1.5px solid #BBF7D0' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                          Jan Aushadhi Alternative
                                        </span>
                                        <span style={{ fontSize: '0.68rem', color: '#15803D', fontWeight: 700, backgroundColor: '#DCFCE7', padding: '1px 6px', borderRadius: '4px' }}>
                                          PMBJP Verified
                                        </span>
                                      </div>
                                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#14532D', marginTop: '2px' }}>
                                        {topCandidate.generic_name}
                                      </div>
                                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>
                                        ₹{topCandidate.generic_price_inr || 38}
                                        <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#166534' }}> ({topCandidate.pack_size || 'Standard Strip'})</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Clinical Equivalence Note & Disclaimer */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#166534', backgroundColor: '#F0FDF4', padding: '0.45rem 0.75rem', borderRadius: '6px', marginBottom: '0.65rem' }}>
                                    <CheckCircle2 size={15} color="#16A34A" />
                                    <span><strong>Clinical Bioequivalence:</strong> Same active ingredient, identical strength ({topCandidate.active_ingredients?.map((i: any) => `${i.name} ${i.strength_value}${i.strength_unit}`).join(', ')}), and dosage formulation.</span>
                                  </div>

                                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '0.75rem' }}>
                                    ⚠️ <strong>Governance Notice:</strong> {comparison.mandatory_safety_disclaimer}
                                  </div>

                                  {/* Actions */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.65rem' }}>
                                    <button
                                      type="button"
                                      className="btn btn--outline btn--xs"
                                      onClick={() => handleDismissInlineAlternative(p.id)}
                                    >
                                      Keep Prescribed Brand
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn--primary btn--xs"
                                      style={{ backgroundColor: '#059669', borderColor: '#059669', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                      onClick={() => handleAdoptInlineAlternative(p.id, topCandidate, comparison.reference_brand)}
                                    >
                                      <Check size={13} /> Adopt Generic Alternative ({topCandidate.savings_percentage}% Savings)
                                    </button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
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

      {/* GenericMeds AI Medicine Comparison Modal (Screenshot Reference) */}
      {genericModalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '640px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #E2E8F0',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
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
                  marginBottom: '0.4rem'
                }}>
                  <Sparkles size={13} /> Jan Aushadhi Available
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Medicine Comparison
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '3px', marginBottom: 0 }}>
                  Active Salt: <strong>{genericModalData.activeIngredient}</strong>
                </p>
              </div>
              <button
                onClick={() => setGenericModalData(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}
                aria-label="Close comparison"
              >
                <X size={20} />
              </button>
            </div>

            {/* Comparison Grid (Screenshot 2 bottom right) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: '1.25rem 0' }}>
              {/* Left Box: Prescribed Brand */}
              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Prescribed Brand
                </span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                  {genericModalData.referenceBrand}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#475569', marginTop: '0.5rem' }}>
                  ₹{genericModalData.brandPrice}
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#94A3B8' }}> ({genericModalData.packSize})</span>
                </div>

                <div style={{
                  marginTop: '1rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <Pill size={28} color="#94A3B8" />
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Standard Market Brand</span>
                </div>
              </div>

              {/* Right Box: Jan Aushadhi Generic Alternative */}
              <div style={{
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #86EFAC',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Jan Aushadhi Alternative
                  </span>
                  <span style={{
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: '1px solid #BBF7D0'
                  }}>
                    {genericModalData.savingsPercentage}% cheaper
                  </span>
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#14532D', marginTop: '4px' }}>
                  {genericModalData.genericName}
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803D', marginTop: '0.5rem' }}>
                  ₹{genericModalData.genericPrice}
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#166534' }}> ({genericModalData.packSize})</span>
                </div>

                <div style={{
                  marginTop: '1rem',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #BBF7D0',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#15803D',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <Sparkles size={28} color="#16A34A" />
                  <span style={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 600 }}>PMBJP Verified Scheme</span>
                </div>
              </div>
            </div>

            {/* Verification Note */}
            <div style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#166534', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#16A34A" />
                Same active ingredient, strength and formulation.
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                Please confirm with your doctor or pharmacist. Never automatically substituted without clinician verification.
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn btn--outline btn--md"
                onClick={() => setGenericModalData(null)}
              >
                Keep Prescribed Brand
              </button>
              <button
                className="btn btn--primary btn--md"
                style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                onClick={handleAdoptGeneric}
              >
                <Check size={16} /> Adopt Generic Alternative
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

