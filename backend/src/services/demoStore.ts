// MediBridge AI — Seeded Deterministic Demonstration Store (Fictional Patient Personas)
// Used exclusively when DEMO_MODE=true for hackathon mentor demonstrations.

export interface SyntheticDemoPatient {
  is_demo: true;
  apar_id: string;
  mupid: string;
  mucid: string;
  abha_id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: string;
  phone: string;
  email: string;
  address: string;
  scenario: string;
  clinical_summary: {
    known_conditions: string[];
    allergies: string[];
    current_medications: string[];
    surgical_history: string[];
    emergency_contacts: Array<{ name: string; relation: string; phone: string }>;
  };
  metrics: {
    total_records: number;
    ai_insights: number;
    appointments: number;
    eligible_schemes: number;
    prescriptions: number;
  };
  sample_records: Array<{
    id: string;
    title: string;
    category: 'lab_report' | 'prescription' | 'imaging' | 'discharge_summary';
    date: string;
    file_name: string;
    file_size: string;
    extracted_text: string;
    ai_summary: {
      concerns_count: number;
      normal_count: number;
      followup_count: number;
      findings: Array<{
        title: string;
        severity: 'Critical' | 'High' | 'Moderate' | 'Mild' | 'Normal';
        details: string;
        source_citation: string;
      }>;
      recommendations: Array<{
        title: string;
        description: string;
        action_type: 'book_consultation' | 'view_tips' | 'learn_more';
      }>;
    };
  }>;
  sample_appointments: Array<{
    id: string;
    doctor_name: string;
    specialty: string;
    hospital_name: string;
    time: string;
    date: string;
    mode: 'online' | 'in_person';
    status: 'scheduled' | 'completed';
    complaint: string;
  }>;
  emergency_case?: {
    case_id: string;
    priority: 'critical' | 'high' | 'medium';
    status: 'new' | 'active' | 'in_preparation' | 'arrived';
    chief_complaint: string;
    incident_location: string;
    distance_km: number;
    eta_minutes: number;
    ai_er_notes: string[];
  };
}

export const SYNTHETIC_DEMO_PATIENTS: SyntheticDemoPatient[] = [
  // ==========================================
  // DEMO PATIENT A: Routine Follow-up
  // ==========================================
  {
    is_demo: true,
    apar_id: 'APAR-9821-4412',
    mupid: 'MB-DEMO-01',
    mucid: 'MUC-9821-01',
    abha_id: '91-8472-9102-4521',
    name: 'Rohan Mehta (Demo)',
    age: 34,
    gender: 'Male',
    blood_group: 'B+',
    phone: '+91 98765 43210',
    email: 'rohan.demo@medibridge.internal',
    address: 'Sector 62, Noida, Uttar Pradesh',
    scenario: 'Scenario A: Routine Follow-up & Lab Findings Verification',
    clinical_summary: {
      known_conditions: ['Hypertension (Since 2020)', 'Type 2 Diabetes (Since 2019)'],
      allergies: ['Penicillin (Severe skin rash & anaphylactoid reaction)'],
      current_medications: [
        'Tab. Amlodipine 5 mg (Once daily, Morning)',
        'Tab. Metformin 500 mg (Twice daily, After meals)',
        'Tab. Atorvastatin 10 mg (Once daily, Night)',
      ],
      surgical_history: ['Appendectomy (2018)'],
      emergency_contacts: [
        { name: 'Pooja Mehta', relation: 'Spouse', phone: '+91 98765 11111' },
      ],
    },
    metrics: {
      total_records: 12,
      ai_insights: 3,
      appointments: 1,
      eligible_schemes: 2,
      prescriptions: 4,
    },
    sample_records: [
      {
        id: 'rec_demo_a_01',
        title: 'Comprehensive Metabolic & Lipid Panel',
        category: 'lab_report',
        date: '12 May 2025',
        file_name: 'Metabolic_Panel_12May2025.pdf',
        file_size: '420 KB',
        extracted_text:
          'Comprehensive Blood Panel. Fasting Blood Glucose: 128 mg/dL (Ref: 70-100). Total Cholesterol: 215 mg/dL (Ref: <200). LDL: 142 mg/dL (Ref: <100). HDL: 44 mg/dL. Triglycerides: 165 mg/dL. Serum Creatinine: 0.9 mg/dL. Vitamin D (25-OH): 18 ng/mL (Ref: 30-100). Known allergies: Penicillin.',
        ai_summary: {
          concerns_count: 3,
          normal_count: 2,
          followup_count: 1,
          findings: [
            {
              title: 'Elevated Fasting Blood Sugar',
              severity: 'Moderate',
              details: 'Fasting glucose measured at 128 mg/dL (above optimal reference range 70-100 mg/dL). Consistent with managed Type 2 Diabetes.',
              source_citation: 'Metabolic_Panel_12May2025.pdf (Page 1, Line 4)',
            },
            {
              title: 'Elevated LDL Cholesterol',
              severity: 'Moderate',
              details: 'LDL cholesterol is 142 mg/dL (borderline high). Continued statin therapy and cardiovascular review indicated.',
              source_citation: 'Metabolic_Panel_12May2025.pdf (Page 1, Line 6)',
            },
            {
              title: 'Vitamin D Deficiency',
              severity: 'Mild',
              details: 'Vitamin D level is 18 ng/mL, indicating mild deficiency (standard threshold > 30 ng/mL).',
              source_citation: 'Metabolic_Panel_12May2025.pdf (Page 2, Line 12)',
            },
          ],
          recommendations: [
            {
              title: 'Consult an Endocrinologist',
              description: 'Review blood sugar management and adjust Metformin dosage if needed.',
              action_type: 'book_consultation',
            },
            {
              title: 'Consider Vitamin D3 Supplementation',
              description: 'Discuss weekly 60,000 IU cholecalciferol course with your doctor.',
              action_type: 'learn_more',
            },
            {
              title: 'Allergy Warning: Penicillin',
              description: 'Severe allergy noted. Ensure all care providers are informed before antibiotic prescription.',
              action_type: 'view_tips',
            },
          ],
        },
      },
    ],
    sample_appointments: [
      {
        id: 'apt_demo_a_01',
        doctor_name: 'Dr. Arjun Sharma',
        specialty: 'Cardiology',
        hospital_name: 'Apollo Hospital, Delhi',
        time: '10:30 AM',
        date: 'Today',
        mode: 'online',
        status: 'scheduled',
        complaint: 'Routine follow-up for blood pressure & lipid review',
      },
    ],
  },

  // ==========================================
  // DEMO PATIENT B: Chronic-Care Review
  // ==========================================
  {
    is_demo: true,
    apar_id: 'APAR-5532-8891',
    mupid: 'MB-DEMO-02',
    mucid: 'MUC-5532-02',
    abha_id: '91-5521-1190-3342',
    name: 'Sunita Sharma (Demo)',
    age: 58,
    gender: 'Female',
    blood_group: 'O+',
    phone: '+91 98111 88990',
    email: 'sunita.demo@medibridge.internal',
    address: 'Saket, New Delhi',
    scenario: 'Scenario B: Chronic-Care Longitudinal Review (HbA1c Reduction)',
    clinical_summary: {
      known_conditions: ['Type 2 Diabetes (Since 2014)', 'Bilateral Knee Osteoarthritis'],
      allergies: ['Sulfa drugs (Skin urticaria)'],
      current_medications: [
        'Tab. Metformin 1000 mg (Twice daily)',
        'Tab. Glimepiride 2 mg (Once daily, Morning)',
        'Tab. Calcium Carbonate + Vitamin D3 500mg/250IU (Once daily)',
      ],
      surgical_history: ['Cholecystectomy (2016)'],
      emergency_contacts: [
        { name: 'Amit Sharma', relation: 'Son', phone: '+91 98111 77665' },
      ],
    },
    metrics: {
      total_records: 18,
      ai_insights: 2,
      appointments: 2,
      eligible_schemes: 3,
      prescriptions: 6,
    },
    sample_records: [
      {
        id: 'rec_demo_b_01',
        title: 'Longitudinal HbA1c Comparative Progress Report',
        category: 'lab_report',
        date: '02 May 2025',
        file_name: 'HbA1c_Comparison_May2025.pdf',
        file_size: '380 KB',
        extracted_text:
          'Longitudinal Glycemic Review. Current HbA1c: 7.2% (May 2025). Prior HbA1c: 8.4% (Nov 2024). Net Change: -1.2% improvement. Fasting Plasma Glucose: 134 mg/dL. Post-Prandial Glucose: 168 mg/dL. Renal microalbumin: Negative.',
        ai_summary: {
          concerns_count: 1,
          normal_count: 4,
          followup_count: 1,
          findings: [
            {
              title: 'Clinically Significant Glycemic Improvement (-1.2% HbA1c)',
              severity: 'Normal',
              details: 'HbA1c dropped from 8.4% to 7.2% over a 6-month period, demonstrating effective medication adherence and dietary changes.',
              source_citation: 'HbA1c_Comparison_May2025.pdf (Page 1, Comparison Section)',
            },
            {
              title: 'Bilateral Joint Space Narrowing',
              severity: 'Mild',
              details: 'Mild osteoarthritic changes noted in bilateral knee radiography. Weight-bearing exercises and low-impact physiotherapy suggested.',
              source_citation: 'Knee_XRay_Report_Jan2025.pdf (Page 1)',
            },
          ],
          recommendations: [
            {
              title: 'Maintain Current Diabetic Regimen',
              description: 'Continue Metformin and Glimepiride without changes; schedule 3-month HbA1c reassessment.',
              action_type: 'view_tips',
            },
            {
              title: 'Low-Impact Knee Strengthening',
              description: 'Consult physical therapist for quadriceps isometric strengthening exercises.',
              action_type: 'learn_more',
            },
          ],
        },
      },
    ],
    sample_appointments: [
      {
        id: 'apt_demo_b_01',
        doctor_name: 'Dr. Priya Sharma',
        specialty: 'Internal Medicine & Diabetes',
        hospital_name: 'Max Super Speciality Hospital, Saket',
        time: '02:00 PM',
        date: 'Tomorrow',
        mode: 'in_person',
        status: 'scheduled',
        complaint: '6-month chronic diabetic review and knee stiffness assessment',
      },
    ],
  },

  // ==========================================
  // DEMO PATIENT C: Emergency Demonstration
  // ==========================================
  {
    is_demo: true,
    apar_id: 'APAR-1122-3344',
    mupid: 'MB-DEMO-03',
    mucid: 'MUC-1122-03',
    abha_id: '91-1100-2244-8899',
    name: 'Vikram Malhotra (Demo)',
    age: 45,
    gender: 'Male',
    blood_group: 'AB+',
    phone: '+91 98222 11002',
    email: 'vikram.demo@medibridge.internal',
    address: 'Sarita Vihar, Delhi',
    scenario: 'Scenario C: Emergency Trauma & Pre-Hospital Allergy Handover',
    clinical_summary: {
      known_conditions: ['Coronary Artery Disease (DES Stent placed 2021)'],
      allergies: ['Penicillin (Severe anaphylactic shock - CRITICAL ER ALERT)'],
      current_medications: [
        'Tab. Ecosprin 75 mg (Once daily)',
        'Tab. Clopidogrel 75 mg (Once daily)',
        'Tab. Atorvastatin 40 mg (Once daily, Night)',
      ],
      surgical_history: ['Percutaneous Coronary Intervention (PCI, 2021)'],
      emergency_contacts: [
        { name: 'Kavita Malhotra', relation: 'Spouse', phone: '+91 98222 55441' },
      ],
    },
    metrics: {
      total_records: 8,
      ai_insights: 4,
      appointments: 0,
      eligible_schemes: 1,
      prescriptions: 3,
    },
    sample_records: [
      {
        id: 'rec_demo_c_01',
        title: 'Cardiac Interventional Discharge & Allergy Summary',
        category: 'discharge_summary',
        date: '15 Nov 2021',
        file_name: 'PCI_Discharge_Summary_2021.pdf',
        file_size: '510 KB',
        extracted_text:
          'Hospital Discharge Summary. Patient admitted for NSTEMI. Successful drug-eluting stent (DES) placed in proximal LAD. DAPT therapy initiated. CRITICAL ALLERGY: Patient suffered severe anaphylaxis following Augmentin (Penicillin). STRICTLY CONTRAINDICATED: Penicillin and beta-lactam antibiotics.',
        ai_summary: {
          concerns_count: 2,
          normal_count: 3,
          followup_count: 2,
          findings: [
            {
              title: 'CRITICAL ALERT: Penicillin Anaphylaxis',
              severity: 'Critical',
              details: 'Prior documented anaphylactic collapse. All penicillin, amoxicillin, and cephalosporin antibiotics must be avoided in trauma resuscitation.',
              source_citation: 'PCI_Discharge_Summary_2021.pdf (Page 2, Boxed Warning)',
            },
            {
              title: 'Dual Antiplatelet Therapy (DAPT) History',
              severity: 'High',
              details: 'Active antiplatelet medications (Ecosprin + Clopidogrel) require special coagulation monitoring during trauma surgery.',
              source_citation: 'PCI_Discharge_Summary_2021.pdf (Page 1, Medications Section)',
            },
          ],
          recommendations: [
            {
              title: 'Alert Hospital Trauma Team',
              description: 'Flag Penicillin allergy immediately on ER triage admission.',
              action_type: 'view_tips',
            },
          ],
        },
      },
    ],
    sample_appointments: [],
    emergency_case: {
      case_id: 'EMG-DEMO-901',
      priority: 'critical',
      status: 'active',
      chief_complaint: 'Road Traffic Accident — Blunt Thoracic Trauma & Lacerations',
      incident_location: 'Delhi-Noida Direct Flyway (Near Toll Plaza)',
      distance_km: 3.1,
      eta_minutes: 8,
      ai_er_notes: [
        'CRITICAL: Penicillin anaphylaxis history. DO NOT administer beta-lactam antibiotics.',
        'Patient is on blood thinners (Ecosprin, Clopidogrel). Monitor for internal hemorrhage.',
        'Cardiac stent in LAD (2021). Continuous 12-lead ECG monitoring advised upon arrival.',
      ],
    },
  },
];

export class DemoStore {
  /**
   * Find synthetic demo patient by any supported identifier
   */
  static lookupPatient(identifierType: string, identifierValue: string): SyntheticDemoPatient | null {
    if (!identifierValue) return null;
    const cleanVal = identifierValue.trim().toLowerCase();

    return (
      SYNTHETIC_DEMO_PATIENTS.find((p) => {
        if (identifierType === 'apar_id') {
          return p.apar_id.toLowerCase() === cleanVal;
        }
        if (identifierType === 'mupid') {
          return p.mupid.toLowerCase() === cleanVal;
        }
        if (identifierType === 'mucid') {
          return p.mucid.toLowerCase() === cleanVal;
        }
        if (identifierType === 'abha_id') {
          return p.abha_id.replace(/-/g, '').toLowerCase() === cleanVal.replace(/-/g, '');
        }
        // Auto-match across any identifier
        return (
          p.apar_id.toLowerCase() === cleanVal ||
          p.mupid.toLowerCase() === cleanVal ||
          p.mucid.toLowerCase() === cleanVal ||
          p.abha_id.replace(/-/g, '').toLowerCase() === cleanVal.replace(/-/g, '')
        );
      }) || null
    );
  }

  /**
   * Return catalog of all demo personas for quick-selection in presentation mode
   */
  static listDemoPersonas() {
    return SYNTHETIC_DEMO_PATIENTS.map((p) => ({
      apar_id: p.apar_id,
      mupid: p.mupid,
      mucid: p.mucid,
      abha_id: p.abha_id,
      name: p.name,
      age: p.age,
      scenario: p.scenario,
      blood_group: p.blood_group,
    }));
  }
}
