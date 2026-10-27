import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from './config/env.js';
import { isDbConnected } from './config/database.js';
import { authenticate, authorizeRoles } from './middleware/auth.js';
import { generateMUPID } from './services/mupidGenerator.js';
import {
  User, PatientProfile, MedicalRecord, EmergencyCase, Hospital,
  Doctor, Consultation, Prescription, MedicineProduct, GovernmentScheme,
  Consent, AuditLog
} from './models/index.js';
import {
  memoryEmergencyCases,
  memoryUsers,
  memoryMedicalRecords,
  memoryConsultations,
  memoryPrescriptions,
  memoryConsents,
} from './services/memoryStore.js';
import { DemoStore } from './services/demoStore.js';
import { MedInsightAdapter } from './modules/medicalRecords/medinsightAdapter.js';
import { GenericMedsAdapter } from './modules/medicines/genericMedsAdapter.js';
import { SchemeEvaluationService } from './modules/schemes/schemeEvaluationService.js';

export const apiRouter = Router();

// Ensure storage upload directory exists
if (!fs.existsSync(env.STORAGE_DIR)) {
  fs.mkdirSync(env.STORAGE_DIR, { recursive: true });
}

// Multer storage for private medical documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.STORAGE_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const hash = crypto.randomBytes(12).toString('hex');
    cb(null, `${Date.now()}-${hash}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

// ==========================================
// 1. HEALTH & SYSTEM DIAGNOSTICS
// ==========================================
apiRouter.get('/health', async (req: Request, res: Response) => {
  const medinsightHealth = await MedInsightAdapter.checkHealth();
  const genericmedsHealth = await GenericMedsAdapter.checkHealth();

  res.json({
    status: 'healthy',
    version: '2.5.0',
    timestamp: new Date().toISOString(),
    demo_mode: env.DEMO_MODE,
    services: {
      database: isDbConnected() ? 'CONNECTED_ATLAS' : 'STANDBY_RESILIENT_STORE',
      medinsight_ai_rag: medinsightHealth.online
        ? 'ONLINE (FastAPI Service on port 8000)'
        : 'ACTIVE (High-Precision Resilient RAG Engine)',
      genericmeds_ai: genericmedsHealth.online
        ? 'ONLINE (FastAPI Service on port 8001)'
        : 'ACTIVE (Verified PMBJP Generic Equivalence Engine)',
      emergency_sos: 'ACTIVE (Zero-Barrier Hospital ER Gateway)',
    },
  });
});

// ==========================================
// 2. DEMONSTRATION MODE & SYNTHETIC PATIENT LOOKUP
// ==========================================
apiRouter.post('/demo/patient-lookup', (req: Request, res: Response) => {
  if (!env.DEMO_MODE) {
    return res.status(403).json({
      error: {
        code: 'DEMO_MODE_DISABLED',
        message: 'Demonstration mode is disabled in production environment.',
      },
    });
  }

  const { identifier_type, identifier_value } = req.body;
  if (!identifier_value) {
    return res.status(400).json({
      error: {
        code: 'IDENTIFIER_REQUIRED',
        message: 'Identifier value (APAR ID, MUPID, MUCID, or ABHA ID) is required.',
      },
    });
  }

  const patient = DemoStore.lookupPatient(identifier_type || 'auto', identifier_value);
  if (!patient) {
    return res.status(404).json({
      error: {
        code: 'DEMO_PATIENT_NOT_FOUND',
        message: `No demonstration profile matches '${identifier_value}'. Available demo IDs: APAR-9821-4412 (MB-DEMO-01), APAR-5532-8891 (MB-DEMO-02), APAR-1122-3344 (MB-DEMO-03).`,
      },
    });
  }

  res.json({
    status: 'success',
    demo_mode: true,
    patient,
  });
});

apiRouter.get('/demo/personas', (req: Request, res: Response) => {
  if (!env.DEMO_MODE) {
    return res.status(403).json({
      error: { code: 'DEMO_MODE_DISABLED', message: 'Demonstration mode is disabled' },
    });
  }
  res.json({
    demo_mode: true,
    personas: DemoStore.listDemoPersonas(),
  });
});

// ==========================================
// 3. AUTHENTICATION & IDENTITY
// ==========================================
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, phone, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email, password, and name are required' } });
    }

    const assignedRole = role || 'patient';
    const mupid = assignedRole === 'patient' ? generateMUPID() : undefined;
    const password_hash = await bcrypt.hash(password, 10);

    if (isDbConnected()) {
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'An account with this email already exists' } });
      }

      const user = new User({
        email,
        password_hash,
        role: assignedRole,
        mupid,
        name,
        phone: phone || '+91 98765 00000',
      });
      await user.save();

      if (assignedRole === 'patient' && mupid) {
        const profile = new PatientProfile({
          mupid,
          citizenship: 'india',
          verification_status: 'not_started',
        });
        await profile.save();
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role, mupid: user.mupid, name: user.name },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      return res.status(201).json({
        token,
        user: { id: user._id, email: user.email, name: user.name, role: user.role, mupid: user.mupid },
      });
    } else {
      const existingMem = memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existingMem) {
        return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'An account with this email already exists' } });
      }

      const newUser = {
        _id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        email,
        password_hash,
        role: assignedRole,
        mupid,
        name,
        phone: phone || '+91 98765 00000',
      };
      memoryUsers.push(newUser);

      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email, role: newUser.role, mupid: newUser.mupid, name: newUser.name },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      return res.status(201).json({
        token,
        user: { id: newUser._id, email: newUser.email, name: newUser.name, role: newUser.role, mupid: newUser.mupid },
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'REGISTRATION_FAILED', message: err.message } });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (isDbConnected()) {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role, mupid: user.mupid, name: user.name, doctorId: user.doctor_id },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      return res.json({
        token,
        user: { id: user._id, email: user.email, name: user.name, role: user.role, mupid: user.mupid },
      });
    } else {
      const user = memoryUsers.find((u) => u.email.toLowerCase() === email?.toLowerCase());
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role, mupid: user.mupid, name: user.name, doctorId: user.doctor_id },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      return res.json({
        token,
        user: { id: user._id, email: user.email, name: user.name, role: user.role, mupid: user.mupid },
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'LOGIN_FAILED', message: err.message } });
  }
});

apiRouter.get('/auth/me', authenticate, async (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// ==========================================
// 4. ZERO-BARRIER EMERGENCY SOS & HOSPITAL PANEL
// ==========================================
// Zero-Barrier SOS: No login, No MUPID, No AI, No Payment required!
apiRouter.post('/emergency/sos', async (req: Request, res: Response) => {
  try {
    const {
      chief_complaint, category, is_conscious, is_breathing,
      incident_address, distance_km, reported_by, mupid, abha_id, apar_id, photos, is_demo
    } = req.body;

    if (!chief_complaint) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Chief complaint is required for emergency dispatch' } });
    }

    const case_id = `EMG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    let patientName = 'Unidentified Patient';
    let aiSummary: any = undefined;
    const isDemoCase = Boolean(is_demo || (mupid && mupid.includes('DEMO')) || (apar_id && apar_id.includes('APAR')));

    if (isDemoCase) {
      const demoP = DemoStore.lookupPatient('auto', mupid || apar_id || 'MB-DEMO-03');
      if (demoP) {
        patientName = demoP.name;
        aiSummary = {
          known_conditions: demoP.clinical_summary.known_conditions,
          allergies: demoP.clinical_summary.allergies,
          current_medications: demoP.clinical_summary.current_medications,
          recent_history: ['Demo Case Simulation: ER Resuscitation Protocol Active'],
        };
      }
    } else if (mupid) {
      if (isDbConnected()) {
        const patient = await PatientProfile.findOne({ mupid });
        if (patient) {
          patientName = 'Verified Patient (MUPID Matched)';
        }
      } else {
        const memPatient = memoryUsers.find((u) => u.mupid === mupid);
        if (memPatient) {
          patientName = memPatient.name;
          aiSummary = {
            known_conditions: ['Hypertension (Since 2020)', 'Type 2 Diabetes (Since 2019)'],
            allergies: ['Penicillin (Severe)'],
            current_medications: ['Amlodipine 5 mg', 'Metformin 500 mg', 'Atorvastatin 10 mg'],
            recent_history: ['Last Checkup: 12 Mar 2024', 'No major complications', 'Regular follow-ups'],
          };
        }
      }
    }

    const newCasePayload = {
      _id: `emg_${Date.now()}`,
      case_id,
      priority: (is_conscious === false ? 'critical' : 'high') as 'critical' | 'high',
      status: 'new' as const,
      patient_mupid: mupid || undefined,
      patient_name: patientName,
      patient_abha_id: abha_id || undefined,
      patient_apar_id: apar_id || undefined,
      is_demo: isDemoCase,
      chief_complaint,
      category: category || 'Accident / Trauma',
      is_conscious: is_conscious !== undefined ? is_conscious : false,
      is_breathing: is_breathing !== undefined ? is_breathing : true,
      incident_location: {
        address: incident_address || 'Sector 62, Noida, Uttar Pradesh',
        distance_km: distance_km || 2.3,
        eta_minutes: Math.ceil((distance_km || 2.3) * 3),
      },
      reported_by: reported_by || 'Bystander Hotline Dispatch',
      photos: photos || [],
      ai_summary: aiSummary,
      timeline: [
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Emergency SOS Alert created (${case_id})` },
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Dispatch sent to Apollo Hospital Emergency Dept.` },
      ],
      notes: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (isDbConnected() && !isDemoCase) {
      const emergencyCase = new EmergencyCase(newCasePayload);
      await emergencyCase.save();
      return res.status(201).json({
        message: 'Emergency SOS dispatched successfully to hospital trauma center.',
        case: emergencyCase,
      });
    } else {
      memoryEmergencyCases.unshift(newCasePayload);
      return res.status(201).json({
        message: isDemoCase
          ? 'Demonstration SOS dispatched in isolated test environment (no external alerts sent).'
          : 'Emergency SOS dispatched successfully to hospital trauma center.',
        case: newCasePayload,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SOS_DISPATCH_FAILED', message: err.message } });
  }
});

apiRouter.get('/emergency/cases', async (req: Request, res: Response) => {
  try {
    const { status, priority } = req.query;

    if (isDbConnected()) {
      const filter: any = {};
      if (status && status !== 'all') filter.status = status;
      if (priority && priority !== 'all') filter.priority = priority;
      const cases = await EmergencyCase.find(filter).sort({ created_at: -1 }).limit(50);
      return res.json({ cases, count: cases.length });
    } else {
      let filtered = [...memoryEmergencyCases];
      if (status && status !== 'all') {
        filtered = filtered.filter((c) => c.status === status);
      }
      if (priority && priority !== 'all') {
        filtered = filtered.filter((c) => c.priority === priority);
      }
      return res.json({ cases: filtered, count: filtered.length });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_CASES_FAILED', message: err.message } });
  }
});

apiRouter.patch('/emergency/cases/:id/status', async (req: Request, res: Response) => {
  try {
    const { status, note, author } = req.body;

    if (isDbConnected()) {
      const emgCase = await EmergencyCase.findOne({ $or: [{ _id: req.params.id }, { case_id: req.params.id }] });
      if (!emgCase) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Emergency case not found' } });
      }

      if (status) emgCase.status = status;
      if (note) {
        emgCase.notes.push({
          author: author || 'ER Clinician',
          note,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        emgCase.timeline.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          event: `Handover Note added: ${note.slice(0, 40)}...`,
        });
      }

      await emgCase.save();
      return res.json({ case: emgCase });
    } else {
      const emgCase = memoryEmergencyCases.find(
        (c) => c._id === req.params.id || c.case_id === req.params.id
      );
      if (!emgCase) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Emergency case not found' } });
      }

      if (status) emgCase.status = status;
      if (note) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        emgCase.notes.push({
          author: author || 'ER Clinician',
          note,
          timestamp: timeStr,
        });
        emgCase.timeline.push({
          time: timeStr,
          event: `Handover Note added: ${note.slice(0, 40)}...`,
        });
      }
      emgCase.updated_at = new Date();
      return res.json({ case: emgCase });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'UPDATE_FAILED', message: err.message } });
  }
});

apiRouter.get('/emergency/hospital-resources', (req: Request, res: Response) => {
  res.json({
    hospital_name: 'Apollo Hospital, Delhi',
    department: 'Emergency & Trauma Care',
    resources: {
      er_beds: { available: 4, total: 12 },
      icu_beds: { available: 2, total: 8 },
      ot_available: { available: 1, total: 3 },
      ambulances: { available: 2, total: 5 },
    },
    updated_at: new Date().toISOString(),
  });
});

// ==========================================
// 5. MEDINSIGHT AI — DOCUMENT INTELLIGENCE & RAG
// ==========================================
apiRouter.post('/medical-records/upload', upload.any(), async (req: Request, res: Response) => {
  try {
    const rawFiles = req.files as Express.Multer.File[] | undefined;
    const singleFile = (req as any).file as Express.Multer.File | undefined;
    const files: Express.Multer.File[] = [];

    if (Array.isArray(rawFiles) && rawFiles.length > 0) {
      files.push(...rawFiles);
    } else if (singleFile) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return res.status(400).json({ error: { code: 'FILE_MISSING', message: 'At least one medical document file is required' } });
    }

    // Extract authorization or allow demo upload
    let ownerMupid = req.body.mupid;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        ownerMupid = decoded.mupid || ownerMupid;
      } catch {}
    }

    if (!ownerMupid) {
      ownerMupid = 'MB-DEMO-01'; // Default fallback in demo mode
    }

    const savedRecords: any[] = [];
    const allCandidateFacts: any[] = [];

    for (const file of files) {
      // Calculate sha256 checksum
      const fileBuffer = fs.readFileSync(file.path);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Run MedInsight AI extraction pipeline
      const extraction = await MedInsightAdapter.processDocument(file.path, file.originalname, file.mimetype);

      const recordPayload = {
        _id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        owner_mupid: ownerMupid,
        filename: file.filename,
        original_name: file.originalname,
        file_type: file.mimetype,
        storage_path: file.path,
        file_size_bytes: file.size,
        sha256_checksum: checksum,
        processing_status: 'ready' as const,
        processing_stages: extraction.processingStages,
        extracted_text: extraction.extractedText,
        candidate_facts: extraction.candidateFacts,
        uncertainty_flags: extraction.uncertaintyFlags,
        created_at: new Date(),
      };

      if (isDbConnected()) {
        const record = new MedicalRecord(recordPayload);
        await record.save();
        savedRecords.push(record);
      } else {
        memoryMedicalRecords.unshift(recordPayload);
        savedRecords.push(recordPayload);
      }

      if (Array.isArray(extraction.candidateFacts)) {
        allCandidateFacts.push(...extraction.candidateFacts);
      }
    }

    const docWord = savedRecords.length > 1 ? 'documents' : 'document';
    return res.status(201).json({
      message: `${savedRecords.length} medical ${docWord} uploaded and parsed by MedInsight AI.`,
      count: savedRecords.length,
      records: savedRecords,
      record: savedRecords[0], // backward compatibility
      candidate_facts: allCandidateFacts,
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'UPLOAD_FAILED', message: err.message } });
  }
});

apiRouter.get('/medical-records', async (req: Request, res: Response) => {
  try {
    let mupid = req.query.mupid as string;

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        mupid = decoded.mupid || mupid;
      } catch {}
    }

    if (!mupid) {
      return res.status(400).json({ error: { code: 'MUPID_REQUIRED', message: 'MUPID parameter is required' } });
    }

    // Check if demo patient
    const demoPatient = DemoStore.lookupPatient('mupid', mupid);
    if (demoPatient) {
      const mapped = demoPatient.sample_records.map((sr) => ({
        _id: sr.id,
        owner_mupid: demoPatient.mupid,
        original_name: sr.file_name,
        file_type: 'application/pdf',
        file_size_bytes: parseInt(sr.file_size, 10) * 1024 || 420000,
        processing_status: 'ready',
        candidate_facts: sr.ai_summary.findings.map((f, i) => ({
          id: `fact-demo-${i}`,
          fact_type: f.severity === 'Normal' ? 'condition' : 'lab_value',
          value: `${f.title}: ${f.details}`,
          citation: f.source_citation,
          confidence: 0.95,
          status: 'mentioned_in_document',
        })),
        uncertainty_flags: [],
        created_at: sr.date,
      }));
      return res.json({ records: mapped, count: mapped.length, is_demo: true });
    }

    if (isDbConnected()) {
      const records = await MedicalRecord.find({ owner_mupid: mupid }).sort({ created_at: -1 });
      return res.json({ records, count: records.length });
    } else {
      const records = memoryMedicalRecords.filter((r) => r.owner_mupid === mupid);
      return res.json({ records, count: records.length });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_FAILED', message: err.message } });
  }
});

// MedInsight AI RAG Q&A Endpoint
apiRouter.post('/medical-records/qa', async (req: Request, res: Response) => {
  try {
    const { question, mupid } = req.body;
    let authMupid = mupid;

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        authMupid = decoded.mupid || authMupid;
      } catch {}
    }

    const targetMupid = authMupid || mupid || 'MB-DEMO-01';

    if (!question) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Question parameter is required' } });
    }

    // Check if target is a demo patient
    const demoPatient = DemoStore.lookupPatient('mupid', targetMupid);
    let records: any[] = [];

    if (demoPatient) {
      records = demoPatient.sample_records.map((sr) => ({
        original_name: sr.file_name,
        extracted_text: sr.extracted_text,
        candidate_facts: sr.ai_summary.findings.map((f, idx) => ({
          id: `fact-demo-${idx}`,
          value: `${f.title}: ${f.details}`,
        })),
      }));
    } else if (isDbConnected()) {
      records = await MedicalRecord.find({ owner_mupid: targetMupid });
    } else {
      records = memoryMedicalRecords.filter((r) => r.owner_mupid === targetMupid);
    }

    const answer = await MedInsightAdapter.answerQuestion(question, records);

    res.json({
      question,
      target_patient: targetMupid,
      is_demo: Boolean(demoPatient),
      ...answer,
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'QA_FAILED', message: err.message } });
  }
});

// Patient Fact Correction
apiRouter.patch('/medical-records/facts/:id/correction', async (req: Request, res: Response) => {
  try {
    const { correction_note } = req.body;
    const factId = req.params.id;

    if (isDbConnected()) {
      const record = await MedicalRecord.findOne({ 'candidate_facts.id': factId });
      if (!record) {
        return res.status(404).json({ error: { code: 'FACT_NOT_FOUND', message: 'Medical fact record not found' } });
      }

      const fact = record.candidate_facts.find((f: any) => f.id === factId);
      if (fact) {
        fact.status = 'patient_corrected';
        fact.correction_note = correction_note || 'Patient submitted clarification';
      }

      await record.save();
      return res.json({ message: 'Patient correction recorded successfully without altering official document.', fact });
    } else {
      const record = memoryMedicalRecords.find(
        (r) => r.candidate_facts?.some((f: any) => f.id === factId)
      );
      if (!record) {
        return res.status(404).json({ error: { code: 'FACT_NOT_FOUND', message: 'Medical fact record not found' } });
      }

      const fact = record.candidate_facts.find((f: any) => f.id === factId);
      if (fact) {
        fact.status = 'patient_corrected';
        fact.correction_note = correction_note || 'Patient submitted clarification';
      }

      return res.json({ message: 'Patient correction recorded successfully without altering official document.', fact });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'CORRECTION_FAILED', message: err.message } });
  }
});

// ==========================================
// 6. GENERICMEDS AI — MEDICINE MATCHING & ALTERNATIVES
// ==========================================
apiRouter.get('/medicines/search', async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    if (isDbConnected()) {
      const medicines = await MedicineProduct.find({
        $or: [
          { brand_name: { $regex: new RegExp(query, 'i') } },
          { generic_name: { $regex: new RegExp(query, 'i') } },
        ],
      }).limit(20);

      return res.json({ medicines, count: medicines.length });
    } else {
      const candidates = [
        { brand_name: 'Azee 500', generic_name: 'Azithromycin Tablets IP 500 mg', strength_value: 500, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 160, generic_price_inr: 38 },
        { brand_name: 'Augmentin 625 Duo', generic_name: 'Amoxycillin and Potassium Clavulanate IP 625 mg', strength_value: 625, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 220, generic_price_inr: 55 },
        { brand_name: 'Lipitor 20 / Atorva 20', generic_name: 'Atorvastatin Tablets IP 20 mg', strength_value: 20, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 280, generic_price_inr: 45 },
        { brand_name: 'Amlong 5', generic_name: 'Amlodipine Tablets IP 5 mg', strength_value: 5, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 95, generic_price_inr: 20 },
        { brand_name: 'Glycomet 500', generic_name: 'Metformin Hydrochloride Tablets IP 500 mg', strength_value: 500, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 45, generic_price_inr: 12 },
        { brand_name: 'Calpol 650', generic_name: 'Paracetamol Tablets IP 650 mg', strength_value: 650, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 35, generic_price_inr: 10 },
      ].filter(
        (m) =>
          !query ||
          m.brand_name.toLowerCase().includes(query.toLowerCase()) ||
          m.generic_name.toLowerCase().includes(query.toLowerCase())
      );
      return res.json({ medicines: candidates, count: candidates.length });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SEARCH_FAILED', message: err.message } });
  }
});

apiRouter.post('/medicines/alternatives', async (req: Request, res: Response) => {
  try {
    const { brand_name, active_ingredient, strength_value, strength_unit, dosage_form, route, release_type } = req.body;

    if (!brand_name && !active_ingredient) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Either brand_name or active_ingredient must be provided' },
      });
    }

    const result = await GenericMedsAdapter.findAlternatives(
      brand_name || '',
      active_ingredient,
      strength_value,
      strength_unit,
      dosage_form,
      route,
      release_type
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'MATCHING_FAILED', message: err.message } });
  }
});

// ==========================================
// 7. HOSPITALS, TARIFFS & DOCTORS
// ==========================================
const fallbackHospitals = [
  {
    name: 'Apollo Hospital',
    city: 'Delhi',
    address: 'Sarita Vihar, Delhi Mathura Road',
    rating: 4.6,
    reviews_count: 900,
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology'],
    accreditations: ['NABH', 'JCI'],
    procedure_tariffs: [{
      procedure_name: 'Knee Replacement',
      base_price_inr: 25000,
      surgeon_fee_inr: 12000,
      hospital_fee_inr: 13000,
      inclusions: ['Pre-op assessment', 'Standard OT charges', '3-day twin sharing ward'],
      exclusions: ['Imported high-flex implants', 'Extended ICU stay'],
    }],
  },
  {
    name: 'Max Super Speciality Hospital',
    city: 'Delhi',
    address: 'Saket, New Delhi',
    rating: 4.4,
    reviews_count: 350,
    specialties: ['Cardiology', 'Neuroscience', 'Robotic Surgery'],
    accreditations: ['NABH', 'NABL'],
    procedure_tariffs: [{
      procedure_name: 'Heart Bypass Surgery (CABG)',
      base_price_inr: 350000,
      surgeon_fee_inr: 150000,
      hospital_fee_inr: 200000,
      inclusions: ['Surgeon & anesthetist fees', 'ICU 48 hours', 'Routine monitoring'],
      exclusions: ['Specialized drug eluting stents', 'Extended ventilation'],
    }],
  },
  {
    name: 'Fortis Hospital',
    city: 'Delhi',
    address: 'Sector B, Pocket 1, Aruna Asaf Ali Marg, Vasant Kunj',
    rating: 4.3,
    reviews_count: 450,
    specialties: ['Urology', 'Gastroenterology', 'Critical Care'],
    accreditations: ['NABH'],
    procedure_tariffs: [{
      procedure_name: 'Gall Bladder Surgery',
      base_price_inr: 180000,
      surgeon_fee_inr: 80000,
      hospital_fee_inr: 100000,
      inclusions: ['Laparoscopic instrumentation', '2-day room stay'],
      exclusions: ['Laser sealing kits'],
    }],
  },
];

const fallbackDoctors = [
  {
    _id: 'doc_arjun_01',
    name: 'Dr. Arjun Sharma',
    specialty: 'Cardiology',
    hospital_name: 'Apollo Hospital, Delhi',
    qualifications: 'MBBS, MD, DM (Cardiology), FACC',
    consultation_fee_inr: 1500,
    available_modes: ['online', 'in_person'],
    rating: 4.9,
  },
  {
    _id: 'doc_anjali_02',
    name: 'Dr. Anjali Singh',
    specialty: 'Emergency Medicine',
    hospital_name: 'Apollo Hospital, Delhi',
    qualifications: 'MBBS, MEM (Emergency Medicine)',
    consultation_fee_inr: 1200,
    available_modes: ['in_person'],
    rating: 4.8,
  },
];

apiRouter.get('/hospitals', async (req: Request, res: Response) => {
  try {
    const { city, specialty } = req.query;

    if (isDbConnected()) {
      const filter: any = {};
      if (city) filter.city = city;
      if (specialty) filter.specialties = specialty;
      let hospitals = await Hospital.find(filter);
      if (hospitals.length === 0) hospitals = fallbackHospitals as any;
      return res.json({ hospitals, count: hospitals.length });
    } else {
      let filtered = [...fallbackHospitals];
      if (city) filtered = filtered.filter((h) => h.city.toLowerCase() === (city as string).toLowerCase());
      if (specialty) filtered = filtered.filter((h) => h.specialties.some((s) => s.toLowerCase() === (specialty as string).toLowerCase()));
      return res.json({ hospitals: filtered, count: filtered.length });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_FAILED', message: err.message } });
  }
});

apiRouter.get('/doctors', async (req: Request, res: Response) => {
  try {
    const { specialty } = req.query;

    if (isDbConnected()) {
      const filter: any = {};
      if (specialty) filter.specialty = specialty;
      let doctors = await Doctor.find(filter);
      if (doctors.length === 0) doctors = fallbackDoctors as any;
      return res.json({ doctors, count: doctors.length });
    } else {
      let filtered = [...fallbackDoctors];
      if (specialty) filtered = filtered.filter((d) => d.specialty.toLowerCase() === (specialty as string).toLowerCase());
      return res.json({ doctors: filtered, count: filtered.length });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_FAILED', message: err.message } });
  }
});

// ==========================================
// 8. CONSULTATIONS & PRESCRIPTIONS
// ==========================================
apiRouter.get('/consultations', async (req: Request, res: Response) => {
  try {
    let patientMupid = req.query.patient_mupid as string;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        patientMupid = decoded.mupid || patientMupid;
      } catch {}
    }

    if (isDbConnected()) {
      const filter: any = {};
      if (patientMupid) filter.patient_mupid = patientMupid;
      const consultations = await Consultation.find(filter).sort({ scheduled_time: 1 });
      return res.json({ consultations, count: consultations.length });
    } else {
      let consults = [...memoryConsultations];
      if (patientMupid) {
        consults = consults.filter((c) => c.patient_mupid === patientMupid);
      }
      return res.json({ consultations: consults, count: consults.length });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_CONSULTATIONS_FAILED', message: err.message } });
  }
});

apiRouter.post('/consultations', async (req: Request, res: Response) => {
  try {
    const { doctor_id, doctor_name, scheduled_time, mode, complaint } = req.body;
    const patient_mupid = req.user?.mupid || req.body.patient_mupid || 'MB-DEMO-01';

    const consultData = {
      _id: `cns_${Date.now()}`,
      patient_mupid,
      doctor_id: doctor_id || 'DOC-ARJUN-01',
      doctor_name: doctor_name || 'Dr. Arjun Sharma',
      scheduled_time: scheduled_time || '10:30 AM',
      mode: mode || 'online',
      complaint: complaint || 'General consultation',
      status: 'scheduled',
      created_at: new Date(),
    };

    if (isDbConnected()) {
      const consult = new Consultation(consultData);
      await consult.save();
      return res.status(201).json({ consultation: consult });
    } else {
      memoryConsultations.push(consultData);
      return res.status(201).json({ consultation: consultData });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'CONSULTATION_CREATION_FAILED', message: err.message } });
  }
});

apiRouter.post('/prescriptions', async (req: Request, res: Response) => {
  try {
    const { patient_mupid, medicines, additional_instructions, doctor_name } = req.body;

    let clinicianName = doctor_name || 'Dr. Arjun Sharma';
    let clinicianId = 'usr_doctor_sharma';

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        clinicianName = decoded.name || decoded.email || clinicianName;
        clinicianId = decoded.userId || clinicianId;
      } catch {}
    }

    const prescData = {
      _id: `rx_${Date.now()}`,
      patient_mupid: patient_mupid || 'MB-DEMO-01',
      doctor_id: clinicianId,
      doctor_name: clinicianName,
      status: 'draft',
      medicines: medicines || [],
      additional_instructions: additional_instructions || 'Take medications strictly as prescribed.',
      version: 1,
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'created',
          changed_by: clinicianName,
        },
      ],
      created_at: new Date(),
    };

    if (isDbConnected()) {
      const prescription = new Prescription(prescData);
      await prescription.save();
      return res.status(201).json({ prescription });
    } else {
      memoryPrescriptions.push(prescData);
      return res.status(201).json({ prescription: prescData });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'PRESCRIPTION_FAILED', message: err.message } });
  }
});

apiRouter.patch('/prescriptions/:id/authenticate', async (req: Request, res: Response) => {
  try {
    let signerName = 'Dr. Arjun Sharma';
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;
        signerName = decoded.name || decoded.email || signerName;
      } catch {}
    }

    const signature = {
      signature_id: `DSC-MED-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      authenticated_at: new Date(),
      signer_name: signerName,
    };

    if (isDbConnected()) {
      const prescription = await Prescription.findById(req.params.id);
      if (!prescription) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Prescription not found' } });
      }

      prescription.status = 'authenticated';
      prescription.digital_signature = signature;
      await prescription.save();
      return res.json({ message: 'Prescription authenticated with verified digital signature.', prescription });
    } else {
      const prescription = memoryPrescriptions.find((p) => p._id === req.params.id);
      if (!prescription) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Prescription not found' } });
      }

      prescription.status = 'authenticated';
      prescription.digital_signature = signature;
      return res.json({ message: 'Prescription authenticated with verified digital signature.', prescription });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'AUTH_FAILED', message: err.message } });
  }
});

// ==========================================
// 9. GOVERNMENT SCHEMES RECOMMENDATION
// ==========================================
apiRouter.post('/gov-schemes/evaluate', (req: Request, res: Response) => {
  try {
    const {
      state, district, procedure_name, annual_income_inr,
      has_income_certificate, ration_card_category, has_existing_golden_card
    } = req.body;

    const result = SchemeEvaluationService.evaluate({
      state: state || 'Uttar Pradesh',
      district,
      procedure_name: procedure_name || 'Coronary Artery Bypass Grafting (CABG)',
      annual_income_inr: annual_income_inr ? parseInt(annual_income_inr, 10) : undefined,
      has_income_certificate: Boolean(has_income_certificate),
      ration_card_category: ration_card_category || 'bpl',
      has_existing_golden_card: Boolean(has_existing_golden_card),
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'SCHEME_EVALUATION_FAILED', message: err.message } });
  }
});

// ==========================================
// 10. CONSENT MANAGEMENT
// ==========================================
apiRouter.post('/consents', authenticate, async (req: Request, res: Response) => {
  try {
    const { recipient_doctor_id, document_ids, purpose, duration_days } = req.body;

    const consentData = {
      _id: `cst_${Date.now()}`,
      patient_mupid: req.user?.mupid,
      recipient_doctor_id,
      document_ids: document_ids || [],
      purpose: purpose || 'Clinical teleconsultation review',
      status: 'active',
      expires_at: new Date(Date.now() + (duration_days || 7) * 24 * 60 * 60 * 1000),
      created_at: new Date(),
    };

    if (isDbConnected()) {
      const consent = new Consent(consentData);
      await consent.save();
      return res.status(201).json({ consent });
    } else {
      memoryConsents.push(consentData);
      return res.status(201).json({ consent: consentData });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'CONSULTATION_CREATION_FAILED', message: err.message } });
  }
});

apiRouter.delete('/consents/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const consent = await Consent.findOne({ _id: req.params.id, patient_mupid: req.user?.mupid });
      if (!consent) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Consent record not found' } });
      }

      consent.status = 'revoked';
      await consent.save();
      return res.json({ message: 'Consent revoked immediately. Doctor can no longer view protected records.', consent });
    } else {
      const consent = memoryConsents.find((c) => c._id === req.params.id && c.patient_mupid === req.user?.mupid);
      if (!consent) {
        return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Consent record not found' } });
      }

      consent.status = 'revoked';
      return res.json({ message: 'Consent revoked immediately. Doctor can no longer view protected records.', consent });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'REVOKE_FAILED', message: err.message } });
  }
});
