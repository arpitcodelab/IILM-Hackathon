import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';
import { generateMUPID } from '../src/services/mupidGenerator.js';
import { SchemeEvaluationService } from '../src/modules/schemes/schemeEvaluationService.js';
import { GenericMedsAdapter } from '../src/modules/medicines/genericMedsAdapter.js';
import { DemoStore } from '../src/services/demoStore.js';
import { env } from '../src/config/env.js';

describe('MediBridge AI Backend & AI Subsystems Test Suite', () => {
  beforeAll(async () => {
    await connectDatabase();
  }, 10000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // 1. Health & Diagnostics
  it('1. should return UP status for health and active AI integrations', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.demo_mode).toBe(true);
    expect(res.body.services.medinsight_ai_rag).toBeDefined();
    expect(res.body.services.genericmeds_ai).toBeDefined();
  });

  // 2. MUPID Generator
  it('2. should generate valid unique MUPID format (MB-XXXXXX)', () => {
    const id = generateMUPID();
    expect(id).toMatch(/^MB-[2-9A-HJ-NP-Z]{6}$/);
  });

  // 3. Demo Patient Lookup (APAR ID & MUPID)
  it('3. should lookup synthetic demo patient using APAR ID deterministically', async () => {
    const res = await request(app)
      .post('/api/v1/demo/patient-lookup')
      .send({
        identifier_type: 'apar_id',
        identifier_value: 'APAR-9821-4412',
      });

    expect(res.status).toBe(200);
    expect(res.body.demo_mode).toBe(true);
    expect(res.body.patient.name).toBe('Rohan Mehta (Demo)');
    expect(res.body.patient.mupid).toBe('MB-DEMO-01');
    expect(res.body.patient.clinical_summary.allergies[0]).toContain('Penicillin');
    expect(res.body.patient.sample_records.length).toBeGreaterThan(0);
  });

  it('4. should lookup synthetic demo patient using MUPID/MUCID', async () => {
    const res = await request(app)
      .post('/api/v1/demo/patient-lookup')
      .send({
        identifier_type: 'mupid',
        identifier_value: 'MB-DEMO-02',
      });

    expect(res.status).toBe(200);
    expect(res.body.patient.name).toBe('Sunita Sharma (Demo)');
    expect(res.body.patient.scenario).toContain('Chronic-Care');
  });

  it('5. should return 404 for unknown demo identifiers with helpful suggestion', async () => {
    const res = await request(app)
      .post('/api/v1/demo/patient-lookup')
      .send({
        identifier_type: 'apar_id',
        identifier_value: 'APAR-0000-0000',
      });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('DEMO_PATIENT_NOT_FOUND');
    expect(res.body.error.message).toContain('APAR-9821-4412');
  });

  it('5b. should reject demo lookup with 403 when DEMO_MODE is disabled', async () => {
    const originalDemo = env.DEMO_MODE;
    (env as any).DEMO_MODE = false;
    const res = await request(app)
      .post('/api/v1/demo/patient-lookup')
      .send({
        identifier_type: 'apar_id',
        identifier_value: 'APAR-9821-4412',
      });
    (env as any).DEMO_MODE = originalDemo;

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('DEMO_MODE_DISABLED');
  });

  it('6. should list demo personas for presentation chips', async () => {
    const res = await request(app).get('/api/v1/demo/personas');
    expect(res.status).toBe(200);
    expect(res.body.personas.length).toBe(3);
    expect(res.body.personas[0].apar_id).toBe('APAR-9821-4412');
  });

  // 4. Zero-Barrier Emergency SOS
  it('7. should dispatch zero-barrier Emergency SOS without login or MUPID', async () => {
    const res = await request(app)
      .post('/api/v1/emergency/sos')
      .send({
        chief_complaint: 'Road accident - head trauma',
        category: 'Accident / Trauma',
        is_conscious: false,
        is_breathing: true,
        incident_address: 'Sector 62, Noida, Uttar Pradesh',
        distance_km: 2.3,
        reported_by: 'Bystander (+91 98765 11111)',
      });

    expect(res.status).toBe(201);
    expect(res.body.case.case_id).toMatch(/^EMG-\d{4}-\d{3}$/);
    expect(res.body.case.priority).toBe('critical');
    expect(res.body.case.patient_name).toBe('Unidentified Patient');
  });

  it('7b. should reject Emergency SOS when chief complaint is missing (validation)', async () => {
    const res = await request(app)
      .post('/api/v1/emergency/sos')
      .send({
        incident_address: 'Sector 62, Noida',
        reported_by: '+91 98765 11111',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('7c. should assign priority high when patient is conscious', async () => {
    const res = await request(app)
      .post('/api/v1/emergency/sos')
      .send({
        chief_complaint: 'Severe ankle sprain / fracture',
        category: 'Accident / Trauma',
        is_conscious: true,
        is_breathing: true,
        incident_address: 'Sector 62, Noida',
        reported_by: '+91 98765 11111',
      });

    expect(res.status).toBe(201);
    expect(res.body.case.priority).toBe('high');
  });

  it('8. should isolate demo SOS cases in test environment', async () => {
    const res = await request(app)
      .post('/api/v1/emergency/sos')
      .send({
        chief_complaint: 'Thoracic trauma simulation',
        category: 'Accident / Trauma',
        mupid: 'MB-DEMO-03',
        is_demo: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.case.is_demo).toBe(true);
    expect(res.body.case.ai_summary.allergies[0]).toContain('Penicillin');
    expect(res.body.message).toContain('isolated test environment');
  });

  // 4b. Multiple Medical Document Upload (MedInsight AI)
  it('8b. should upload and batch parse multiple medical documents simultaneously', async () => {
    const doc1 = Buffer.from('Patient: Rohan Mehta\nDiagnosis: Hypertension\nFasting Blood Glucose: 135 mg/dL\nAllergy: Penicillin');
    const doc2 = Buffer.from('Patient: Rohan Mehta\nLab Test: Complete Blood Count\nHb: 14.2 g/dL\nWBC: 6,800 /mcL\nNormal findings');

    const res = await request(app)
      .post('/api/v1/medical-records/upload')
      .field('mupid', 'MB-7X4Q2K')
      .attach('documents', doc1, 'Metabolic_Panel.txt')
      .attach('documents', doc2, 'CBC_Report.txt');

    expect(res.status).toBe(201);
    expect(res.body.count).toBe(2);
    expect(res.body.records.length).toBe(2);
    expect(res.body.records[0].original_name).toBe('Metabolic_Panel.txt');
    expect(res.body.records[1].original_name).toBe('CBC_Report.txt');
    expect(res.body.candidate_facts.length).toBeGreaterThan(0);
  });

  // 5. GenericMeds AI Equivalence Engine
  it('9. should run GenericMeds AI alternative matching with mandatory safety disclaimer', async () => {
    const res = await request(app)
      .post('/api/v1/medicines/alternatives')
      .send({
        brand_name: 'Azee 500',
        active_ingredient: 'Azithromycin',
        strength_value: 500,
        strength_unit: 'mg',
        dosage_form: 'Tablet',
      });

    expect(res.status).toBe(200);
    expect(res.body.total_candidates).toBeGreaterThan(0);
    expect(res.body.candidates[0].generic_price_inr).toBeLessThan(res.body.brand_price_inr);
    expect(res.body.mandatory_safety_disclaimer).toContain('This tool provides medicine information and price comparisons');
  });

  it('10. should flag different formulation when dosage form differs', async () => {
    const res = await request(app)
      .post('/api/v1/medicines/alternatives')
      .send({
        brand_name: 'Azee 500',
        active_ingredient: 'Azithromycin',
        dosage_form: 'Syrup', // Differs from Tablet
      });

    expect(res.status).toBe(200);
    expect(['DIFFERENT_FORMULATION', 'PARTIAL_MATCH']).toContain(res.body.candidates[0].match_type);
    expect(res.body.candidates[0].safety_note).toMatch(/differ|Partial match/i);
  });

  it('10b. should support compare-alternatives endpoint with composition matching and savings calculation', async () => {
    const res = await request(app)
      .post('/api/v1/medicines/compare-alternatives')
      .send({
        medicineName: 'Amlopres 5',
        dosageForm: 'Tablet',
      });

    expect(res.status).toBe(200);
    expect(res.body.total_candidates).toBeGreaterThan(0);
    const topMatch = res.body.candidates[0];
    expect(topMatch.match_type).toBe('EXACT_COMPOSITION_MATCH');
    expect(topMatch.is_jan_aushadhi).toBe(true);
    expect(topMatch.savings_percentage).toBeGreaterThan(50);
    expect(res.body.mandatory_safety_disclaimer).toBeDefined();
  });

  // 6. MedInsight AI RAG Q&A
  it('11. should answer patient questions grounded in medical documents with citations', async () => {
    const res = await request(app)
      .post('/api/v1/medical-records/qa')
      .send({
        question: 'What allergies do I have?',
        mupid: 'MB-DEMO-01',
      });

    expect(res.status).toBe(200);
    expect(res.body.answer).toContain('Penicillin');
    expect(res.body.citations.length).toBeGreaterThan(0);
    expect(res.body.citations[0].documentName).toBeDefined();
    expect(res.body.disclaimer).toContain('strictly source-grounded');
  });

  // 7. Doctor Prescriptions with Digital Signature
  it('12. should author prescription and authenticate with digital clinician signature', async () => {
    const createRes = await request(app)
      .post('/api/v1/prescriptions')
      .send({
        patient_mupid: 'MB-DEMO-01',
        doctor_name: 'Dr. Arjun Sharma',
        medicines: [
          { name: 'Tab. Amlodipine 5 mg', dose: '5 mg', frequency: 'Once daily' },
        ],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.prescription.status).toBe('draft');
    expect(createRes.body.prescription.version).toBe(1);

    const authRes = await request(app)
      .patch(`/api/v1/prescriptions/${createRes.body.prescription._id}/authenticate`)
      .send();

    expect(authRes.status).toBe(200);
    expect(authRes.body.prescription.status).toBe('authenticated');
    expect(authRes.body.prescription.digital_signature.signature_id).toMatch(/^DSC-MED-/);
  });

  // 8. Government Healthcare Schemes
  it('13. should evaluate Government Healthcare Schemes with strict liability non-deduction', async () => {
    const res = await request(app)
      .post('/api/v1/gov-schemes/evaluate')
      .send({
        state: 'Uttar Pradesh',
        procedure_name: 'Coronary Artery Bypass Grafting (CABG)',
        annual_income_inr: 120000,
        has_income_certificate: true,
        ration_card_category: 'bpl',
        has_existing_golden_card: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.matches.length).toBeGreaterThan(0);
    expect(res.body.matches[0].match_status).toBe('PRELIMINARY_ELIGIBLE');
    expect(res.body.financial_ledger.confirmed_covered_amount_inr).toBe(0);
    expect(res.body.financial_ledger.estimated_patient_liability_inr).toBeGreaterThanOrEqual(350000);
  });

  // 9. Hospital Directory
  it('14. should fetch verified hospital directory with procedure tariffs', async () => {
    const res = await request(app).get('/api/v1/hospitals');
    expect(res.status).toBe(200);
    expect(res.body.hospitals.length).toBeGreaterThan(0);
    expect(res.body.hospitals[0].procedure_tariffs.length).toBeGreaterThan(0);
  });
});
