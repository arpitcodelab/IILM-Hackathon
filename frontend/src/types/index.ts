// MediBridge AI Types

export type UserRole = 'patient' | 'doctor' | 'coordinator' | 'hospital' | 'admin';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';
export type EmergencyStatus = 'new' | 'active' | 'in_preparation' | 'arrived' | 'resolved';

export interface EmergencyCase {
  id: string;
  case_id: string;
  title: string;
  category: string;
  priority: PriorityLevel;
  status: EmergencyStatus;
  patient_mupid: string;
  patient_name: string;
  patient_abha_id?: string;
  patient_demographics: {
    age: number;
    gender: string;
    phone: string;
    blood_group?: string;
  };
  incident_location: {
    address: string;
    distance_km: number;
    eta_minutes: number;
    lat?: number;
    lng?: number;
  };
  reported_by: string;
  incident_details: string;
  incident_photos: string[];
  elapsed_time: string;
  created_at: string;
  ai_health_summary: {
    known_conditions: string[];
    allergies: string[];
    current_medications: string[];
    recent_history: string;
  };
  timeline: Array<{
    time: string;
    event: string;
  }>;
  notes: Array<{
    author: string;
    note: string;
    timestamp: string;
  }>;
}

export interface DoctorAppointment {
  id: string;
  time: string;
  patient_name: string;
  patient_mupid: string;
  patient_abha_id?: string;
  age: number;
  gender: string;
  type: 'online' | 'in_person';
  complaint: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  contact: {
    phone: string;
    email: string;
    location: string;
  };
  vitals: {
    bp: string;
    ldl: string;
    ecg: string;
    blood_group: string;
    height: string;
    weight: string;
    employment?: string;
  };
  history: {
    conditions: string[];
    allergies: string[];
    previous_surgeries: string[];
  };
  ai_insights: {
    concerns: string[];
    findings: string[];
    recommendations: string[];
  };
  prescriptions: Array<{
    id: string;
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  upcoming_followups: Array<{
    title: string;
    date: string;
    due_text: string;
  }>;
  recent_records: Array<{
    title: string;
    date: string;
    type: string;
  }>;
}

export interface HospitalRecord {
  id: string;
  name: string;
  location: string;
  distance_km: number;
  rating: number;
  reviews_count: number;
  specialties: string[];
  starting_price: number;
  procedure_name: string;
  accreditation: string[];
}

export interface MedicineComparisonItem {
  id: string;
  brand_name: string;
  brand_price: number;
  generic_name: string;
  generic_price: number;
  savings_percentage: number;
  active_ingredient: string;
  dosage: string;
  pack_size: string;
  manufacturer_brand: string;
  manufacturer_generic: string;
}

