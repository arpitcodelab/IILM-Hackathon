import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';
import { generateMUPID } from '../src/services/mupidGenerator.js';
import { SchemeEvaluationService } from '../src/modules/schemes/schemeEvaluationService.js';
import { GenericMedsAdapter } from '../src/modules/medicines/genericMedsAdapter.js';

describe('MediBridge AI Backend Test Suite', () => {
  beforeAll(async () => {
    await connectDatabase();
  }, 10000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
  it('1. should return UP status for health endpoint', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.services.medinsight_ai_rag).toContain('ACTIVE');
    expect(res.body.services.genericmeds_ai).toContain('ACTIVE');
  });

  it('2. should generate valid unique MUPID format (MB-XXXXXX)', () => {
    const id = generateMUPID();
    expect(id).toMatch(/^MB-[2-9A-HJ-NP-Z]{6}$/);
  });

  it('3. should dispatch zero-barrier Emergency SOS without login or MUPID', async () => {
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

  it('4. should fetch hospital emergency triage queue', async () => {
    const res = await request(app).get('/api/v1/emergency/cases');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.cases)).toBe(true);
  });

  it('5. should fetch live hospital resources availability', async () => {
    const res = await request(app).get('/api/v1/emergency/hospital-resources');
    expect(res.status).toBe(200);
    expect(res.body.resources.er_beds.available).toBeGreaterThan(0);
    expect(res.body.resources.ambulances.available).toBeGreaterThan(0);
  });

  it('6. should run GenericMeds AI alternative matching with mandatory safety disclaimer', async () => {
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

  it('7. should evaluate Government Healthcare Schemes with strict liability non-deduction', async () => {
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
    // Verify pending assistance is NOT subtracted from patient liability
    expect(res.body.financial_ledger.confirmed_covered_amount_inr).toBe(0);
    expect(res.body.financial_ledger.estimated_patient_liability_inr).toBeGreaterThanOrEqual(350000);
  });

  it('8. should register a new patient user and return MUPID', async () => {
    const testEmail = `patient_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        name: 'Rohan Mehta',
        phone: '+91 98765 43210',
        role: 'patient',
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.mupid).toMatch(/^MB-/);
  });

  it('9. should reject protected record access without authentication token', async () => {
    const res = await request(app).get('/api/v1/medical-records?mupid=MB-7X4Q2K');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('10. should fetch verified hospital directory with procedure tariffs', async () => {
    const res = await request(app).get('/api/v1/hospitals');
    expect(res.status).toBe(200);
    expect(res.body.hospitals.length).toBeGreaterThan(0);
    expect(res.body.hospitals[0].procedure_tariffs.length).toBeGreaterThan(0);
  });
});
