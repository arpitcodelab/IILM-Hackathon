/**
 * MedInsight AI - TypeScript Type Definitions
 * Directly matching backend/api/models.py Pydantic schemas.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum AnalysisStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  EXTRACTING_TEXT = 'extracting_text',
  RUNNING_OCR = 'running_ocr',
  STRUCTURING_DATA = 'structuring_data',
  RETRIEVING_EVIDENCE = 'retrieving_evidence',
  ANALYZING = 'analyzing',
  GENERATING_REPORT = 'generating_report',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum FileType {
  PDF = 'pdf',
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  TXT = 'txt',
}

export enum ConfidenceLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  UNKNOWN = 'unknown',
}

export enum InformationSource {
  DOCUMENTED = 'documented',
  PATIENT_REPORTED = 'patient_reported',
  CLINICIAN_INTERPRETATION = 'clinician_interpretation',
  AI_INFERRED = 'ai_inferred',
  UNCERTAIN = 'uncertain',
  MISSING = 'missing',
}

export enum RiskCategory {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  UNCERTAIN = 'uncertain',
}

// ─── File & Upload Models ────────────────────────────────────────────────────

export interface FileValidationResult {
  filename: string;
  file_type?: FileType | null;
  size_bytes: number;
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface UploadedFile {
  file_id: string;
  filename: string;
  file_type: FileType;
  size_bytes: number;
  file_path?: string;
}

// ─── OCR & Extraction Models ─────────────────────────────────────────────────

export interface OcrWord {
  text: string;
  confidence: number; // -1 means unknown, 0.0 - 1.0
  is_uncertain: boolean;
  page: number;
}

export interface ExtractedPage {
  page_number: number;
  text: string;
  extraction_method: 'digital' | 'ocr_printed' | 'ocr_handwritten' | string;
  ocr_confidence: ConfidenceLevel;
  uncertain_words: OcrWord[];
  has_images: boolean;
  has_handwriting: boolean;
}

export interface ExtractedDocument {
  file_id: string;
  filename: string;
  file_type: FileType;
  total_pages: number;
  pages: ExtractedPage[];
  metadata: Record<string, unknown>;
  extraction_warnings: string[];
  full_text: string;
}

// ─── Medical Data Models ─────────────────────────────────────────────────────

export interface SourceReference {
  document_name: string;
  page_number: number;
  source_type: InformationSource;
  ocr_confidence: ConfidenceLevel;
  original_text: string;
}

export interface MedicalDate {
  original: string;
  normalized?: string | null; // ISO YYYY-MM-DD
  is_approximate: boolean;
}

export interface Diagnosis {
  condition: string;
  icd_code?: string | null;
  date?: MedicalDate | null;
  status: 'active' | 'resolved' | 'chronic' | 'suspected' | string;
  source: SourceReference;
  notes: string;
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  route: string;
  duration: string;
  start_date?: MedicalDate | null;
  end_date?: MedicalDate | null;
  prescriber: string;
  status: string;
  source: SourceReference;
  notes: string;
}

export interface LabResult {
  test_name: string;
  value: string;
  unit: string;
  reference_range: string;
  is_abnormal?: boolean | null;
  date?: MedicalDate | null;
  normalized_value?: number | null;
  normalized_unit: string;
  source: SourceReference;
  notes: string;
}

export interface VitalSign {
  name: string;
  value: string;
  unit: string;
  date?: MedicalDate | null;
  is_abnormal?: boolean | null;
  source: SourceReference;
}

export interface Allergy {
  allergen: string;
  reaction: string;
  severity: string;
  source: SourceReference;
}

export interface Symptom {
  description: string;
  onset: string;
  duration: string;
  severity: string;
  date?: MedicalDate | null;
  source: SourceReference;
}

export interface Procedure {
  name: string;
  date?: MedicalDate | null;
  findings: string;
  source: SourceReference;
}

export interface PatientRecord {
  patient_id: string;
  name: string;
  age: string;
  sex: string;
  blood_group: string;
  diagnoses: Diagnosis[];
  symptoms: Symptom[];
  medications: Medication[];
  lab_results: LabResult[];
  vital_signs: VitalSign[];
  allergies: Allergy[];
  procedures: Procedure[];
  medical_history: string[];
  surgical_history: string[];
  family_history: string[];
  social_history: string[];
  follow_up_recommendations: string[];
  document_sources: string[];
  date_range: string;
  conflicts: string[];
  missing_information: string[];
}

// ─── RAG / Evidence Models ───────────────────────────────────────────────────

export interface RetrievedEvidence {
  content: string;
  source_title: string;
  source_publisher: string;
  source_url: string;
  source_date: string;
  relevance_score: number;
  chunk_id: string;
  section: string;
}

// ─── Report Sub-Models ───────────────────────────────────────────────────────

export interface Citation {
  id: number;
  source_title: string;
  source_publisher: string;
  source_url: string;
  source_date: string;
  relevant_passage: string;
  page_or_section: string;
}

export interface TimelineEvent {
  date: string;
  event: string;
  category: 'diagnosis' | 'lab' | 'medication' | 'procedure' | 'symptom' | string;
  details: string;
  source_document: string;
}

export interface TrendObservation {
  parameter: string;
  direction: 'increasing' | 'decreasing' | 'stable' | 'fluctuating' | string;
  values: Array<Record<string, string>>;
  clinical_significance: string;
  evidence_strength: string;
  source: SourceReference;
}

export interface RiskItem {
  risk: string;
  patient_evidence: string;
  medical_evidence: string;
  risk_category: RiskCategory;
  uncertainty: string;
  follow_up: string;
  citations: number[];
}

export interface TreatmentOption {
  treatment: string;
  purpose: string;
  when_considered: string;
  contraindications: string;
  monitoring: string;
  evidence_source: string;
  citations: number[];
}

export interface MedicationReviewItem {
  medication: string;
  concern: string;
  interaction_with: string;
  severity: string;
  evidence_source: string;
  recommendation: string;
}

export interface DocumentProcessingSummary {
  filename: string;
  file_type: string;
  pages_processed: number;
  extraction_method: string;
  ocr_confidence: string;
  warnings: string[];
}

// ─── Complete Medical Report (16 Sections) ──────────────────────────────────

export interface MedicalReport {
  report_id: string;
  generated_at: string;
  analysis_id: string;

  // Section 1: Executive Summary
  executive_summary: string;

  // Section 2: Patient Record Overview
  patient_overview: Record<string, unknown>;

  // Section 3: Document Processing Summary
  document_processing: DocumentProcessingSummary[];

  // Section 4: Medical History Timeline
  timeline: TimelineEvent[];

  // Section 5: Existing Conditions and Findings
  existing_conditions: Array<Record<string, unknown>>;

  // Section 6: Laboratory and Diagnostic Results
  lab_results: Array<Record<string, unknown>>;

  // Section 7: Patterns and Trends
  patterns_and_trends: TrendObservation[];

  // Section 8: Potential Risks and Complications
  risks: RiskItem[];

  // Section 9: Treatment and Management Options
  treatment_options: TreatmentOption[];

  // Section 10: Medication and Allergy Review
  medication_review: MedicationReviewItem[];
  allergy_flags: Array<Record<string, string>>;

  // Section 11: Preventive Care and Monitoring
  preventive_care: Array<Record<string, string>>;

  // Section 12: Missing Information and Contradictions
  missing_information: string[];
  contradictions: string[];

  // Section 13: Questions for the Treating Doctor
  doctor_questions: string[];

  // Section 14: Urgent Findings and Safety Flags
  urgent_findings: Array<Record<string, string>>;

  // Section 15: References and Evidence
  citations: Citation[];

  // Section 16: Limitations and Disclaimer
  limitations: string[];
  disclaimer: string;
}

// ─── API Request / Response Types ───────────────────────────────────────────

export interface AnalysisStatusResponse {
  analysis_id: string;
  status: AnalysisStatus;
  stage: string;
  stage_detail: string;
  progress_pct: number;
  files_processed: number;
  total_files: number;
  error?: string | null;
  created_at: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  status: AnalysisStatus;
  message: string;
}

export interface ExtractionPreview {
  analysis_id: string;
  documents: ExtractedDocument[];
  total_pages: number;
  has_uncertainties: boolean;
  uncertain_items: Array<Record<string, unknown>>;
}

export interface HealthResponse {
  status: string;
  version: string;
  services: Record<string, string>;
}

export interface ErrorResponse {
  error: string;
  detail: string;
  status_code: number;
}
