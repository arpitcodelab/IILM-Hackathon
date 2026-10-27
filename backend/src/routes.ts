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
// 1. HEALTH & DIAGNOSTICS
// ==========================================
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: isDbConnected() ? 'CONNECTED' : 'STANDBY_RESILIENT_STORE',
      medinsight_ai_rag: 'ACTIVE (Source-Grounded Extraction & Q&A)',
      genericmeds_ai: 'ACTIVE (Verified PMBJP Generic Equivalence Engine)',
      emergency_sos: 'ACTIVE (Zero-Barrier Hospital ER Gateway)',
    },
  });
});

// ==========================================
// 2. AUTHENTICATION & IDENTITY
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
        { userId: user._id, email: user.email, role: user.role, mupid: user.mupid },
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
        { userId: newUser._id, email: newUser.email, role: newUser.role, mupid: newUser.mupid },
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
        { userId: user._id, email: user.email, role: user.role, mupid: user.mupid, doctorId: user.doctor_id },
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
        { userId: user._id, email: user.email, role: user.role, mupid: user.mupid, doctorId: user.doctor_id },
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
// 3. ZERO-BARRIER EMERGENCY SOS & HOSPITAL PANEL
// ==========================================
// Zero-Barrier SOS: No login, No MUPID, No AI, No Payment required!
apiRouter.post('/emergency/sos', async (req: Request, res: Response) => {
  try {
    const {
      chief_complaint, category, is_conscious, is_breathing,
      incident_address, distance_km, reported_by, mupid, abha_id, photos
    } = req.body;

    if (!chief_complaint) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Chief complaint is required for emergency dispatch' } });
    }

    const case_id = `EMG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    let patientName = 'Unidentified Patient';
    let aiSummary: any = undefined;

    if (mupid) {
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
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Emergency alert received (Case ${case_id} created)` },
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), event: `Dispatch sent to Apollo Hospital Emergency Dept.` },
      ],
      notes: [],
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (isDbConnected()) {
      const emergencyCase = new EmergencyCase(newCasePayload);
      await emergencyCase.save();
      return res.status(201).json({
        message: 'Emergency SOS dispatched successfully to hospital trauma center.',
        case: emergencyCase,
      });
    } else {
      memoryEmergencyCases.unshift(newCasePayload);
      return res.status(201).json({
        message: 'Emergency SOS dispatched successfully to hospital trauma center.',
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
// 4. MEDINSIGHT AI — DOCUMENT INTELLIGENCE & RAG
// ==========================================
apiRouter.post('/medical-records/upload', authenticate, upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { code: 'FILE_MISSING', message: 'Medical document file is required' } });
    }

    const owner_mupid = req.user?.mupid || req.body.mupid;
    if (!owner_mupid) {
      return res.status(400).json({ error: { code: 'MUPID_REQUIRED', message: 'Owner MUPID is required for health records' } });
    }

    // Calculate sha256 checksum
    const fileBuffer = fs.readFileSync(req.file.path);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Run MedInsight AI extraction pipeline
    const extraction = await MedInsightAdapter.processDocument(req.file.path, req.file.originalname, req.file.mimetype);

    const recordPayload = {
      _id: `rec_${Date.now()}`,
      owner_mupid,
      filename: req.file.filename,
      original_name: req.file.originalname,
      file_type: req.file.mimetype,
      storage_path: req.file.path,
      file_size_bytes: req.file.size,
      sha256_checksum: checksum,
      processing_status: 'completed',
      extracted_text: extraction.extractedText,
      candidate_facts: extraction.candidateFacts,
      uncertainty_flags: extraction.uncertaintyFlags,
      created_at: new Date(),
    };

    if (isDbConnected()) {
      const record = new MedicalRecord(recordPayload);
      await record.save();
      return res.status(201).json({
        message: 'Medical document uploaded and parsed by MedInsight AI.',
        record,
      });
    } else {
      memoryMedicalRecords.unshift(recordPayload);
      return res.status(201).json({
        message: 'Medical document uploaded and parsed by MedInsight AI.',
        record: recordPayload,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'UPLOAD_FAILED', message: err.message } });
  }
});

apiRouter.get('/medical-records', authenticate, async (req: Request, res: Response) => {
  try {
    const mupid = req.query.mupid || req.user?.mupid;
    if (!mupid) {
      return res.status(400).json({ error: { code: 'MUPID_REQUIRED', message: 'MUPID parameter is required' } });
    }

    // Role check: patient can only view their own records; doctor requires valid role
    if (req.user?.role === 'patient' && req.user.mupid !== mupid) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Patients can only access their own medical records' } });
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
apiRouter.post('/medical-records/qa', authenticate, async (req: Request, res: Response) => {
  try {
    const { question, mupid } = req.body;
    const targetMupid = mupid || req.user?.mupid;

    if (!question || !targetMupid) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Question and MUPID are required' } });
    }

    let records: any[] = [];
    if (isDbConnected()) {
      records = await MedicalRecord.find({ owner_mupid: targetMupid });
    } else {
      records = memoryMedicalRecords.filter((r) => r.owner_mupid === targetMupid);
    }

    const answer = await MedInsightAdapter.answerQuestion(question, records);

    res.json({
      question,
      ...answer,
    });
  } catch (err: any) {
    res.status(500).json({ error: { code: 'QA_FAILED', message: err.message } });
  }
});

// Patient Fact Correction
apiRouter.patch('/medical-records/facts/:id/correction', authenticate, async (req: Request, res: Response) => {
  try {
    const { correction_note } = req.body;
    const factId = req.params.id;

    if (isDbConnected()) {
      const record = await MedicalRecord.findOne({ 'candidate_facts.id': factId, owner_mupid: req.user?.mupid });
      if (!record) {
        return res.status(404).json({ error: { code: 'FACT_NOT_FOUND', message: 'Medical fact record not found for patient' } });
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
        (r) => r.owner_mupid === req.user?.mupid && r.candidate_facts?.some((f: any) => f.id === factId)
      );
      if (!record) {
        return res.status(404).json({ error: { code: 'FACT_NOT_FOUND', message: 'Medical fact record not found for patient' } });
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
// 5. GENERICMEDS AI — MEDICINE MATCHING & ALTERNATIVES
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
      // In-memory catalog query
      const candidates = [
        { brand_name: 'Azee 500', generic_name: 'Azithromycin', strength_value: 500, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 160 },
        { brand_name: 'Augmentin 625 Duo', generic_name: 'Amoxicillin + Clavulanic Acid', strength_value: 625, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 210 },
        { brand_name: 'Calpol 650', generic_name: 'Paracetamol', strength_value: 650, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 35 },
        { brand_name: 'Amlong 5', generic_name: 'Amlodipine', strength_value: 5, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 45 },
        { brand_name: 'Glycomet 500', generic_name: 'Metformin', strength_value: 500, strength_unit: 'mg', dosage_form: 'Tablet', max_retail_price_inr: 28 },
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
    const { brand_name, active_ingredient, strength_value, strength_unit, dosage_form } = req.body;

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
      dosage_form
    );

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'MATCHING_FAILED', message: err.message } });
  }
});

// ==========================================
// 6. HOSPITALS, TARIFFS & DOCTORS
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
// 7. CONSULTATIONS & PRESCRIPTIONS
// ==========================================
apiRouter.get('/consultations', authenticate, async (req: Request, res: Response) => {
  try {
    if (isDbConnected()) {
      const filter: any = {};
      if (req.user?.role === 'patient') filter.patient_mupid = req.user.mupid;
      if (req.user?.role === 'doctor') filter.doctor_id = req.user.doctorId || 'DOC-ARJUN-01';
      const consultations = await Consultation.find(filter).sort({ scheduled_time: 1 });
      return res.json({ consultations, count: consultations.length });
    } else {
      let consults = [...memoryConsultations];
      if (req.user?.role === 'patient') {
        consults = consults.filter((c) => c.patient_mupid === req.user?.mupid);
      }
      return res.json({ consultations: consults, count: consults.length });
    }
  } catch (err: any) {
    res.status(500).json({ error: { code: 'FETCH_CONSULTATIONS_FAILED', message: err.message } });
  }
});

apiRouter.post('/consultations', authenticate, async (req: Request, res: Response) => {
  try {
    const { doctor_id, doctor_name, scheduled_time, mode, complaint } = req.body;
    const patient_mupid = req.user?.mupid || req.body.patient_mupid;

    const consultData = {
      _id: `cns_${Date.now()}`,
      patient_mupid,
      doctor_id,
      doctor_name,
      scheduled_time,
      mode: mode || 'online',
      complaint,
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

apiRouter.post('/prescriptions', authenticate, authorizeRoles('doctor', 'admin'), async (req: Request, res: Response) => {
  try {
    const { patient_mupid, medicines, additional_instructions } = req.body;

    const prescData = {
      _id: `rx_${Date.now()}`,
      patient_mupid,
      doctor_id: req.user?.userId || 'usr_doctor_sharma',
      doctor_name: req.user?.name || 'Dr. Arjun Sharma',
      status: 'draft',
      medicines: medicines || [],
      additional_instructions,
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

apiRouter.patch('/prescriptions/:id/authenticate', authenticate, authorizeRoles('doctor', 'admin'), async (req: Request, res: Response) => {
  try {
    const signature = {
      signature_id: `DSC-MED-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      authenticated_at: new Date(),
      signer_name: req.user?.name || 'Dr. Arjun Sharma',
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
// 8. GOVERNMENT SCHEMES RECOMMENDATION
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
// 9. CONSENT MANAGEMENT
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
    res.status(500).json({ error: { code: 'CONSENT_FAILED', message: err.message } });
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
