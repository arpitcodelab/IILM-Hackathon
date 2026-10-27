import bcrypt from 'bcryptjs';

export interface MemoryEmergencyCase {
  _id: string;
  case_id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'acknowledged' | 'in_prep' | 'active' | 'arrived' | 'resolved';
  patient_mupid?: string;
  patient_name: string;
  patient_abha_id?: string;
  age?: number;
  gender?: string;
  chief_complaint: string;
  category: string;
  is_conscious: boolean;
  is_breathing: boolean;
  incident_location: {
    address: string;
    lat?: number;
    lng?: number;
    distance_km: number;
    eta_minutes: number;
  };
  reported_by: string;
  photos: string[];
  ai_summary?: {
    known_conditions: string[];
    allergies: string[];
    current_medications: string[];
    recent_history: string[];
  };
  timeline: Array<{ time: string; event: string }>;
  notes: Array<{ author: string; note: string; timestamp: string }>;
  assigned_doctor?: string;
  created_at: Date;
  updated_at: Date;
}

export const memoryEmergencyCases: MemoryEmergencyCase[] = [
  {
    _id: 'emg_001',
    case_id: 'EMG-2024-001',
    priority: 'critical',
    status: 'new',
    patient_mupid: 'MB-7X4Q2K',
    patient_name: 'Rohan Mehta',
    patient_abha_id: '91-XXXX-4521',
    age: 34,
    gender: 'Male',
    chief_complaint: 'Road Accident - Head Injury',
    category: 'Accident / Trauma',
    is_conscious: false,
    is_breathing: true,
    incident_location: {
      address: 'Sector 62, Noida, Uttar Pradesh',
      lat: 28.628,
      lng: 77.3649,
      distance_km: 2.3,
      eta_minutes: 7,
    },
    reported_by: 'Bystander (+91 98765 11111)',
    photos: ['/uploads/accident-1.jpg'],
    ai_summary: {
      known_conditions: ['Hypertension (Since 2020)', 'Type 2 Diabetes (Since 2019)'],
      allergies: ['Penicillin (Severe)'],
      current_medications: ['Amlodipine 5 mg', 'Metformin 500 mg', 'Atorvastatin 10 mg'],
      recent_history: ['Last Checkup: 12 Mar 2024', 'No major complications', 'Regular follow-ups'],
    },
    timeline: [
      { time: '10:23 AM', event: 'Emergency alert received (Case EMG-2024-001 created)' },
      { time: '10:24 AM', event: 'Location identified: Sector 62, Noida (2.3 km)' },
      { time: '10:25 AM', event: 'Patient details matched: MUPID MB-7X4Q2K (Rohan Mehta)' },
      { time: '10:25 AM', event: 'Alert sent to Emergency Team: ER Team, Neurosurgery, Radiology notified' },
    ],
    notes: [],
    created_at: new Date(Date.now() - 2 * 60 * 1000),
    updated_at: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    _id: 'emg_002',
    case_id: 'EMG-2024-002',
    priority: 'high',
    status: 'new',
    patient_name: 'Not Provided',
    age: 28,
    gender: 'Female',
    chief_complaint: 'Breathing Difficulty',
    category: 'Respiratory',
    is_conscious: true,
    is_breathing: true,
    incident_location: {
      address: 'Rohini, Delhi',
      lat: 28.7041,
      lng: 77.1025,
      distance_km: 5.1,
      eta_minutes: 15,
    },
    reported_by: 'Family (+91 98111 22222)',
    photos: [],
    timeline: [{ time: '10:15 AM', event: 'Emergency alert received via Hotline' }],
    notes: [],
    created_at: new Date(Date.now() - 5 * 60 * 1000),
    updated_at: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    _id: 'emg_003',
    case_id: 'EMG-2024-003',
    priority: 'high',
    status: 'new',
    patient_mupid: 'MB-9H6J3L',
    patient_name: 'Amit Verma',
    age: 52,
    gender: 'Male',
    chief_complaint: 'Chest Pain',
    category: 'Cardiac',
    is_conscious: true,
    is_breathing: true,
    incident_location: {
      address: 'Connaught Place, Delhi',
      lat: 28.6315,
      lng: 77.2167,
      distance_km: 3.7,
      eta_minutes: 12,
    },
    reported_by: 'Self (+91 98222 33333)',
    photos: [],
    timeline: [{ time: '10:10 AM', event: 'SOS triggered from Patient Portal' }],
    notes: [],
    created_at: new Date(Date.now() - 8 * 60 * 1000),
    updated_at: new Date(Date.now() - 8 * 60 * 1000),
  },
  {
    _id: 'emg_004',
    case_id: 'EMG-2024-004',
    priority: 'high',
    status: 'in_prep',
    patient_mupid: 'MB-4P80XY',
    patient_name: 'Meena Iyer',
    age: 60,
    gender: 'Female',
    chief_complaint: 'Stroke Symptoms',
    category: 'Neurology',
    is_conscious: true,
    is_breathing: true,
    incident_location: {
      address: 'Dwarka, Delhi',
      distance_km: 8.4,
      eta_minutes: 22,
    },
    reported_by: 'Caregiver (+91 98333 44444)',
    photos: [],
    timeline: [{ time: '09:58 AM', event: 'Alert received - CT scan & OT on standby' }],
    notes: [{ author: 'Dr. Arjun Sharma', note: 'Neuro team alerted, prepare clot busting protocol', timestamp: '10:02 AM' }],
    created_at: new Date(Date.now() - 22 * 60 * 1000),
    updated_at: new Date(Date.now() - 20 * 60 * 1000),
  },
  {
    _id: 'emg_005',
    case_id: 'EMG-2024-005',
    priority: 'medium',
    status: 'active',
    patient_mupid: 'MB-2K9LQ1',
    patient_name: 'Rajesh Kumar',
    age: 45,
    gender: 'Male',
    chief_complaint: 'Severe Abdominal Pain',
    category: 'General Surgery',
    is_conscious: true,
    is_breathing: true,
    incident_location: {
      address: 'Lajpat Nagar, Delhi',
      distance_km: 4.1,
      eta_minutes: 14,
    },
    reported_by: 'Bystander',
    photos: [],
    timeline: [{ time: '09:45 AM', event: 'Ambulance dispatched' }],
    notes: [],
    created_at: new Date(Date.now() - 35 * 60 * 1000),
    updated_at: new Date(Date.now() - 35 * 60 * 1000),
  },
  {
    _id: 'emg_006',
    case_id: 'EMG-2024-006',
    priority: 'medium',
    status: 'arrived',
    patient_name: 'Unidentified Male',
    age: 30,
    gender: 'Male',
    chief_complaint: 'Burn Injury',
    category: 'Burn Trauma',
    is_conscious: true,
    is_breathing: true,
    incident_location: {
      address: 'Okhla Industrial Area',
      distance_km: 1.8,
      eta_minutes: 5,
    },
    reported_by: 'Factory Safety Officer',
    photos: [],
    timeline: [{ time: '09:15 AM', event: 'Patient admitted to Trauma Burn Unit' }],
    notes: [],
    created_at: new Date(Date.now() - 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 40 * 60 * 1000),
  },
];

export interface MemoryUser {
  _id: string;
  email: string;
  password_hash: string;
  role: 'patient' | 'doctor' | 'hospital_staff' | 'admin';
  mupid?: string;
  name: string;
  phone: string;
  doctor_id?: string;
}

export const memoryUsers: MemoryUser[] = [
  {
    _id: 'usr_rohan',
    email: 'rohan.mehta@gmail.com',
    password_hash: bcrypt.hashSync('Password123!', 8),
    role: 'patient',
    mupid: 'MB-7X4Q2K',
    name: 'Rohan Mehta',
    phone: '+91 98765 43210',
  },
  {
    _id: 'usr_doctor_sharma',
    email: 'dr.sharma@apollo.com',
    password_hash: bcrypt.hashSync('DoctorPass123!', 8),
    role: 'doctor',
    name: 'Dr. Arjun Sharma',
    phone: '+91 98111 00001',
    doctor_id: 'DOC-ARJUN-01',
  },
  {
    _id: 'usr_er_apollo',
    email: 'emergency@apollo.com',
    password_hash: bcrypt.hashSync('HospitalER123!', 8),
    role: 'hospital_staff',
    name: 'Apollo Hospital Delhi Emergency Staff',
    phone: '+91 11 4067 0000',
  },
];

export const memoryMedicalRecords: any[] = [
  {
    _id: 'rec_001',
    owner_mupid: 'MB-7X4Q2K',
    filename: 'ecg_report_12may.pdf',
    original_name: 'ECG Report - 12 May 2025.pdf',
    file_type: 'application/pdf',
    storage_path: 'storage/uploads/ecg_report_12may.pdf',
    file_size_bytes: 420100,
    sha256_checksum: 'a8f59d1134a6bc72e81190bc1f3014a42b26b4d32098d5c4b8b6e21c32f89012',
    processing_status: 'completed',
    extracted_text: 'Electrocardiogram Report. Heart rate: 88 bpm. Mild sinus arrhythmia with ST-T changes. Suggestive of early ischemia.',
    candidate_facts: [
      {
        id: 'fact-1',
        category: 'vitals',
        label: 'Heart Rate',
        extracted_value: '88 bpm',
        confidence: 0.96,
        status: 'provisional',
        source_citation: { page: 1, line_start: 3, line_end: 4, excerpt: 'Heart rate: 88 bpm' },
      },
      {
        id: 'fact-2',
        category: 'conditions',
        label: 'Mild Sinus Arrhythmia',
        extracted_value: 'ST-T wave changes noted',
        confidence: 0.89,
        status: 'provisional',
        source_citation: { page: 1, line_start: 5, line_end: 6, excerpt: 'Mild sinus arrhythmia with ST-T changes' },
      },
    ],
    uncertainty_flags: ['Borderline ST segment requires clinical doctor confirmation'],
    created_at: new Date('2025-05-12T10:00:00Z'),
  },
  {
    _id: 'rec_002',
    owner_mupid: 'MB-7X4Q2K',
    filename: 'lipid_profile_10may.pdf',
    original_name: 'Blood Lipid Panel - 10 May 2025.pdf',
    file_type: 'application/pdf',
    storage_path: 'storage/uploads/lipid_profile_10may.pdf',
    file_size_bytes: 312000,
    sha256_checksum: 'bc8849921134a6bc72e81190bc1f3014a42b26b4d32098d5c4b8b6e21c32f778',
    processing_status: 'completed',
    extracted_text: 'Comprehensive Metabolic & Lipid Panel. Fasting Blood Glucose: 142 mg/dL. HbA1c: 7.2%. Total Cholesterol: 238 mg/dL. LDL: 162 mg/dL. HDL: 41 mg/dL. Triglycerides: 175 mg/dL. Blood Pressure at draw: 150/95 mmHg.',
    candidate_facts: [
      {
        id: 'fact-3',
        category: 'labs',
        label: 'Blood Glucose (Fasting)',
        extracted_value: '142 mg/dL (High)',
        confidence: 0.98,
        status: 'provisional',
        source_citation: { page: 1, line_start: 2, line_end: 3, excerpt: 'Fasting Blood Glucose: 142 mg/dL' },
      },
      {
        id: 'fact-4',
        category: 'labs',
        label: 'LDL Cholesterol',
        extracted_value: '162 mg/dL (High)',
        confidence: 0.97,
        status: 'provisional',
        source_citation: { page: 1, line_start: 4, line_end: 5, excerpt: 'LDL: 162 mg/dL' },
      },
      {
        id: 'fact-5',
        category: 'allergies',
        label: 'Penicillin Allergy',
        extracted_value: 'Severe anaphylactoid reaction noted in prior records',
        confidence: 0.99,
        status: 'provisional',
        source_citation: { page: 1, line_start: 8, line_end: 9, excerpt: 'Known Drug Allergies: Penicillin' },
      },
    ],
    uncertainty_flags: [],
    created_at: new Date('2025-05-10T09:30:00Z'),
  },
];

export const memoryConsultations: any[] = [
  {
    _id: 'cns_001',
    patient_mupid: 'MB-7X4Q2K',
    patient_name: 'Rohan Mehta',
    doctor_id: 'DOC-ARJUN-01',
    doctor_name: 'Dr. Arjun Sharma',
    scheduled_time: '10:30 AM',
    mode: 'online',
    complaint: 'Chest pain, breathlessness',
    status: 'scheduled',
    created_at: new Date(),
  },
  {
    _id: 'cns_002',
    patient_mupid: 'MB-9L2P8F',
    patient_name: 'Neha Gupta',
    doctor_id: 'DOC-ARJUN-01',
    doctor_name: 'Dr. Arjun Sharma',
    scheduled_time: '11:00 AM',
    mode: 'in_person',
    complaint: 'Follow-up - BP review',
    status: 'scheduled',
    created_at: new Date(),
  },
  {
    _id: 'cns_003',
    patient_mupid: 'MB-1K8D9M',
    patient_name: 'Amit Verma',
    doctor_id: 'DOC-ARJUN-01',
    doctor_name: 'Dr. Arjun Sharma',
    scheduled_time: '11:30 AM',
    mode: 'online',
    complaint: 'ECG review',
    status: 'scheduled',
    created_at: new Date(),
  },
  {
    _id: 'cns_004',
    patient_mupid: 'MB-326N1P',
    patient_name: 'Priya Singh',
    doctor_id: 'DOC-ARJUN-01',
    doctor_name: 'Dr. Arjun Sharma',
    scheduled_time: '12:00 PM',
    mode: 'in_person',
    complaint: 'Diabetes consultation',
    status: 'scheduled',
    created_at: new Date(),
  },
];

export const memoryPrescriptions: any[] = [];
export const memoryConsents: any[] = [];

