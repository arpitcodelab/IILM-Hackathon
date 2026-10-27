import mongoose, { Schema, Document } from 'mongoose';

// 1. User Model
export interface IUser extends Document {
  email: string;
  password_hash: string;
  role: 'patient' | 'doctor' | 'coordinator' | 'hospital' | 'admin';
  mupid?: string;
  doctor_id?: string;
  name: string;
  phone: string;
  created_at: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  password_hash: { type: String, required: true },
  role: { type: String, required: true, enum: ['patient', 'doctor', 'coordinator', 'hospital', 'admin'], default: 'patient', index: true },
  mupid: { type: String, index: true },
  doctor_id: { type: String },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
}, { collection: 'users' });

export const User = mongoose.model<IUser>('User', UserSchema);

// 2. Patient Profile
export interface IPatientProfile extends Document {
  mupid: string;
  abha_id?: string;
  verification_status: 'not_started' | 'submitted' | 'under_review' | 'verified' | 'rejected';
  dob?: Date;
  age?: number;
  gender: string;
  blood_group?: string;
  allergies: string[];
  chronic_conditions: string[];
  emergency_contacts: Array<{ name: string; relationship: string; phone: string }>;
  citizenship: string;
  state?: string;
  district?: string;
  ration_card_type?: string;
  annual_income_inr?: number;
  created_at: Date;
}

const PatientProfileSchema = new Schema<IPatientProfile>({
  mupid: { type: String, required: true, unique: true, index: true },
  abha_id: { type: String, index: true },
  verification_status: { type: String, required: true, default: 'not_started', enum: ['not_started', 'submitted', 'under_review', 'verified', 'rejected'] },
  dob: { type: Date },
  age: { type: Number },
  gender: { type: String, default: 'Not Specified' },
  blood_group: { type: String },
  allergies: { type: [String], default: [] },
  chronic_conditions: { type: [String], default: [] },
  emergency_contacts: { type: [{ name: String, relationship: String, phone: String }], default: [] },
  citizenship: { type: String, default: 'india' },
  state: { type: String },
  district: { type: String },
  ration_card_type: { type: String },
  annual_income_inr: { type: Number },
  created_at: { type: Date, default: Date.now },
}, { collection: 'patient_profiles' });

export const PatientProfile = mongoose.model<IPatientProfile>('PatientProfile', PatientProfileSchema);

// 3. Medical Record
export interface IMedicalRecord extends Document {
  owner_mupid: string;
  filename: string;
  original_name: string;
  file_type: string;
  storage_path: string;
  file_size_bytes: number;
  sha256_checksum: string;
  processing_status: 'uploaded' | 'parsing' | 'completed' | 'failed';
  extracted_text?: string;
  candidate_facts: Array<{
    id: string;
    fact_type: 'condition' | 'allergy' | 'medication' | 'lab_value' | 'recommendation';
    value: string;
    citation: string;
    page_number?: number;
    confidence: number;
    status: 'mentioned_in_document' | 'patient_corrected' | 'clinician_confirmed';
    correction_note?: string;
  }>;
  uncertainty_flags: string[];
  created_at: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>({
  owner_mupid: { type: String, required: true, index: true },
  filename: { type: String, required: true },
  original_name: { type: String, required: true },
  file_type: { type: String, required: true },
  storage_path: { type: String, required: true },
  file_size_bytes: { type: Number, required: true },
  sha256_checksum: { type: String, required: true, index: true },
  processing_status: { type: String, default: 'uploaded', enum: ['uploaded', 'parsing', 'completed', 'failed'], index: true },
  extracted_text: { type: String },
  candidate_facts: {
    type: [{
      id: String,
      fact_type: { type: String, enum: ['condition', 'allergy', 'medication', 'lab_value', 'recommendation'] },
      value: String,
      citation: String,
      page_number: Number,
      confidence: Number,
      status: { type: String, enum: ['mentioned_in_document', 'patient_corrected', 'clinician_confirmed'], default: 'mentioned_in_document' },
      correction_note: String,
    }],
    default: [],
  },
  uncertainty_flags: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
}, { collection: 'medical_documents' });

export const MedicalRecord = mongoose.model<IMedicalRecord>('MedicalRecord', MedicalRecordSchema);

// 4. Emergency Case
export interface IEmergencyCase extends Document {
  case_id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'active' | 'in_preparation' | 'arrived' | 'resolved';
  patient_mupid?: string;
  patient_name: string;
  patient_abha_id?: string;
  chief_complaint: string;
  category: string;
  is_conscious: boolean;
  is_breathing: boolean;
  incident_location: {
    address: string;
    distance_km: number;
    eta_minutes: number;
    lat?: number;
    lng?: number;
  };
  reported_by: string;
  photos: string[];
  timeline: Array<{ time: string; event: string }>;
  notes: Array<{ author: string; note: string; timestamp: string }>;
  created_at: Date;
}

const EmergencyCaseSchema = new Schema<IEmergencyCase>({
  case_id: { type: String, required: true, unique: true, index: true },
  priority: { type: String, required: true, enum: ['critical', 'high', 'medium', 'low'], default: 'critical', index: true },
  status: { type: String, required: true, enum: ['new', 'active', 'in_preparation', 'arrived', 'resolved'], default: 'new', index: true },
  patient_mupid: { type: String, index: true },
  patient_name: { type: String, default: 'Unidentified Patient' },
  patient_abha_id: { type: String },
  chief_complaint: { type: String, required: true },
  category: { type: String, default: 'Trauma / Accident' },
  is_conscious: { type: Boolean, default: false },
  is_breathing: { type: Boolean, default: true },
  incident_location: {
    address: { type: String, required: true },
    distance_km: { type: Number, default: 0 },
    eta_minutes: { type: Number, default: 0 },
    lat: { type: Number },
    lng: { type: Number },
  },
  reported_by: { type: String, required: true },
  photos: { type: [String], default: [] },
  timeline: {
    type: [{ time: String, event: String }],
    default: [],
  },
  notes: {
    type: [{ author: String, note: String, timestamp: String }],
    default: [],
  },
  created_at: { type: Date, default: Date.now, index: true },
}, { collection: 'emergency_encounters' });

export const EmergencyCase = mongoose.model<IEmergencyCase>('EmergencyCase', EmergencyCaseSchema);

// 5. Hospital & Doctor
export interface IHospital extends Document {
  name: string;
  city: string;
  address: string;
  rating: number;
  reviews_count: number;
  specialties: string[];
  accreditations: string[];
  procedure_tariffs: Array<{
    procedure_name: string;
    base_price_inr: number;
    surgeon_fee_inr: number;
    hospital_fee_inr: number;
    inclusions: string[];
    exclusions: string[];
  }>;
}

const HospitalSchema = new Schema<IHospital>({
  name: { type: String, required: true, index: true },
  city: { type: String, required: true, index: true },
  address: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  reviews_count: { type: Number, default: 100 },
  specialties: { type: [String], default: [] },
  accreditations: { type: [String], default: ['NABH'] },
  procedure_tariffs: {
    type: [{
      procedure_name: String,
      base_price_inr: Number,
      surgeon_fee_inr: Number,
      hospital_fee_inr: Number,
      inclusions: [String],
      exclusions: [String],
    }],
    default: [],
  },
}, { collection: 'hospitals' });

export const Hospital = mongoose.model<IHospital>('Hospital', HospitalSchema);

// Doctor Model
export interface IDoctor extends Document {
  name: string;
  specialty: string;
  hospital_id?: string;
  hospital_name: string;
  qualifications: string;
  consultation_fee_inr: number;
  available_modes: Array<'online' | 'in_person'>;
  rating: number;
}

const DoctorSchema = new Schema<IDoctor>({
  name: { type: String, required: true, index: true },
  specialty: { type: String, required: true, index: true },
  hospital_id: { type: String },
  hospital_name: { type: String, required: true },
  qualifications: { type: String, required: true },
  consultation_fee_inr: { type: Number, required: true },
  available_modes: { type: [String], default: ['online', 'in_person'] },
  rating: { type: Number, default: 4.8 },
}, { collection: 'doctors' });

export const Doctor = mongoose.model<IDoctor>('Doctor', DoctorSchema);

// 6. Consultation
export interface IConsultation extends Document {
  patient_mupid: string;
  doctor_id: string;
  doctor_name: string;
  scheduled_time: string;
  mode: 'online' | 'in_person';
  complaint: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: Date;
}

const ConsultationSchema = new Schema<IConsultation>({
  patient_mupid: { type: String, required: true, index: true },
  doctor_id: { type: String, required: true, index: true },
  doctor_name: { type: String, required: true },
  scheduled_time: { type: String, required: true },
  mode: { type: String, enum: ['online', 'in_person'], default: 'online' },
  complaint: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled', index: true },
  notes: { type: String },
  created_at: { type: Date, default: Date.now },
}, { collection: 'consultations' });

export const Consultation = mongoose.model<IConsultation>('Consultation', ConsultationSchema);

// 7. Prescription
export interface IPrescription extends Document {
  patient_mupid: string;
  doctor_id: string;
  doctor_name: string;
  status: 'draft' | 'awaiting_review' | 'authenticated' | 'cancelled';
  medicines: Array<{
    name: string;
    dose: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  additional_instructions?: string;
  digital_signature?: {
    signature_id: string;
    authenticated_at: Date;
    signer_name: string;
  };
  created_at: Date;
}

const PrescriptionSchema = new Schema<IPrescription>({
  patient_mupid: { type: String, required: true, index: true },
  doctor_id: { type: String, required: true, index: true },
  doctor_name: { type: String, required: true },
  status: { type: String, enum: ['draft', 'awaiting_review', 'authenticated', 'cancelled'], default: 'draft', index: true },
  medicines: {
    type: [{
      name: String,
      dose: String,
      frequency: String,
      duration: String,
      instructions: String,
    }],
    default: [],
  },
  additional_instructions: { type: String },
  digital_signature: {
    signature_id: String,
    authenticated_at: Date,
    signer_name: String,
  },
  created_at: { type: Date, default: Date.now },
}, { collection: 'prescriptions' });

export const Prescription = mongoose.model<IPrescription>('Prescription', PrescriptionSchema);

// 8. Medicine Product (GenericMeds AI catalog)
export interface IMedicineProduct extends Document {
  brand_name: string;
  brand_price_inr: number;
  generic_name: string;
  generic_price_inr: number;
  savings_percentage: number;
  active_ingredients: Array<{
    name: string;
    normalized_name: string;
    strength_value: number;
    strength_unit: string;
  }>;
  dosage_form: string;
  route: string;
  release_type: string;
  pack_size: string;
  manufacturer_brand: string;
  manufacturer_generic: string;
  verified_source: string;
}

const MedicineProductSchema = new Schema<IMedicineProduct>({
  brand_name: { type: String, required: true, index: true },
  brand_price_inr: { type: Number, required: true },
  generic_name: { type: String, required: true, index: true },
  generic_price_inr: { type: Number, required: true },
  savings_percentage: { type: Number, required: true },
  active_ingredients: [{
    name: String,
    normalized_name: { type: String, index: true },
    strength_value: Number,
    strength_unit: String,
  }],
  dosage_form: { type: String, required: true },
  route: { type: String, default: 'Oral' },
  release_type: { type: String, default: 'Immediate Release' },
  pack_size: { type: String, required: true },
  manufacturer_brand: { type: String, required: true },
  manufacturer_generic: { type: String, default: 'Pradhan Mantri Bharatiya Janaushadhi Pariyojana' },
  verified_source: { type: String, default: 'PMBJP Official Catalogue' },
}, { collection: 'medicine_products' });

export const MedicineProduct = mongoose.model<IMedicineProduct>('MedicineProduct', MedicineProductSchema);

// 9. Government Scheme
export interface IGovernmentScheme extends Document {
  scheme_code: string;
  name: string;
  authority: string;
  coverage_amount_inr: number;
  target_states: string[];
  eligible_ration_categories: string[];
  max_annual_income_inr?: number;
  covered_procedures: string[];
  required_documents: string[];
  official_portal_url: string;
}

const GovernmentSchemeSchema = new Schema<IGovernmentScheme>({
  scheme_code: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  authority: { type: String, required: true },
  coverage_amount_inr: { type: Number, required: true },
  target_states: { type: [String], default: ['All India'] },
  eligible_ration_categories: { type: [String], default: [] },
  max_annual_income_inr: { type: Number },
  covered_procedures: { type: [String], default: [] },
  required_documents: { type: [String], default: [] },
  official_portal_url: { type: String, required: true },
}, { collection: 'government_schemes' });

export const GovernmentScheme = mongoose.model<IGovernmentScheme>('GovernmentScheme', GovernmentSchemeSchema);

// 10. Consent
export interface IConsent extends Document {
  patient_mupid: string;
  recipient_doctor_id: string;
  document_ids: string[];
  purpose: string;
  status: 'active' | 'revoked' | 'expired';
  expires_at: Date;
  created_at: Date;
}

const ConsentSchema = new Schema<IConsent>({
  patient_mupid: { type: String, required: true, index: true },
  recipient_doctor_id: { type: String, required: true, index: true },
  document_ids: { type: [String], default: [] },
  purpose: { type: String, required: true },
  status: { type: String, enum: ['active', 'revoked', 'expired'], default: 'active', index: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
}, { collection: 'consents' });

export const Consent = mongoose.model<IConsent>('Consent', ConsentSchema);

// 11. Audit Log
export interface IAuditLog extends Document {
  action: string;
  actor_id?: string;
  actor_role?: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  status: 'success' | 'denied' | 'failed';
  details?: Record<string, any>;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true, index: true },
  actor_id: { type: String, index: true },
  actor_role: { type: String },
  resource_type: { type: String, required: true },
  resource_id: { type: String },
  ip_address: { type: String },
  status: { type: String, enum: ['success', 'denied', 'failed'], default: 'success' },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true },
}, { collection: 'audit_logs' });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

