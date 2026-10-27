# MediBridge AI — Comprehensive Healthcare & Emergency Platform (MERN Stack)

MediBridge AI is an AI-powered healthcare coordination, medical tourism, and emergency medical platform tailored for Indian and international patients, hospitals, clinicians, and emergency response teams.

Migrated from Python to a scalable **MERN + Vite + SCSS** architecture with verified integrations with **MedInsight AI** (Medical Document RAG) and **GenericMeds AI** (PMBJP Generic Equivalence Engine).

---

## 🏗️ Architecture & Tech Stack

### Frontend (`/frontend`)
- **Framework**: React 18 with TypeScript and Vite 6.
- **Styling**: Modular SCSS with design system tokens (`styles/abstracts/`, `styles/base/`, `styles/components/`, `styles/pages/`, `styles/layout/`).
- **Icons**: Lucide React.
- **Mapping & GIS**: Leaflet with OpenStreetMap tiles for real-time ambulance tracking and trauma center routing.
- **Data Fetching**: Centralized `apiClient` with Bearer auth injection, custom `ApiError` class, and Vite `/api` proxy.

### Backend (`/backend`)
- **Runtime**: Node.js 20+ with TypeScript.
- **Framework**: Express.js with modular routing, centralized error handlers, and JWT security middleware.
- **Database**: MongoDB with Mongoose ODM + Resilient fallback in-memory store for offline/isolated zero-downtime execution.
- **Testing**: Vitest with Supertest.
- **Medical File Processing**: Multer disk storage + SHA-256 checksum integrity verification + PDF text parsing.

---

## 🤖 External AI Subsystem Integrations

### 1. MedInsight AI (`medinsight-ai`)
- **Purpose**: Medical document intelligence, clinical fact extraction, and source-grounded RAG Q&A.
- **Implementation**: `backend/src/modules/medicalRecords/medinsightAdapter.ts`
- **Features**:
  - Automatically identifies allergies, vitals, chronic conditions, and abnormal lab thresholds (e.g. Blood Glucose > 140 mg/dL, LDL > 100 mg/dL).
  - Generates verifiable candidate facts with line and page citations (`source_citation`).
  - Strict medical safety guardrails: highlights uncertainty flags and allows patient correction without altering legal source documents.
  - Interactive Q&A endpoint (`POST /api/v1/medical-records/qa`) answering patient queries with document citations.

### 2. GenericMeds AI (`genericmeds-ai`)
- **Purpose**: Generic medicine recommendation and PMBJP verified alternative matching.
- **Implementation**: `backend/src/modules/medicines/genericMedsAdapter.ts`
- **Features**:
  - Matches active ingredients, strengths, and dosage forms against official Pradhan Mantri Bharatiya Janaushadhi Pariyojana (PMBJP) catalogues.
  - Calculates real patient savings (up to 70–85% cost reduction).
  - Mandatory clinical safety disclaimers appended to every response: *Never automatically substitute prescriptions without qualified doctor supervision.*

---

## 🚨 Zero-Barrier Emergency SOS Protocol

- **Route**: `POST /api/v1/emergency/sos`
- **Zero-Barrier Guarantee**: Operates strictly **without** login, MUPID, AI latency, or payment barriers.
- **Triage Dispatch**: Automatically prioritizes unconscious trauma patients as `critical` and alerts hospital trauma units within seconds.
- **Hospital Command Panel**: Provides a live 3-column triage queue, ambulance GPS tracking, hospital bed/OT capacity counters, pre-hospital AI summary, and doctor handover notes.

---

## 🏛️ Government Healthcare Schemes Engine

- **Route**: `POST /api/v1/gov-schemes/evaluate`
- **Features**:
  - Evaluates citizen eligibility for **Ayushman Bharat PM-JAY** (₹5,00,000 annual family cover) and state schemes (e.g. UP Mukhyamantri Jan Arogya Yojana).
  - **Strict Financial Integrity**: Unverified or pending government assistance is never subtracted from patient liability before official authorization.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or pnpm

### 1. Backend Setup
```bash
cd backend
npm install
npm run build
npm start
```
*Backend runs on `http://127.0.0.1:5000`.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://127.0.0.1:5173` with proxying to backend.*

---

## 🧪 Testing

Execute the backend automated test suite:
```bash
cd backend
npm test
```

### Verified Test Suite Summary (10/10 Passing):
1. ✅ Health & Diagnostics endpoint reporting active status for all subsystem integrations.
2. ✅ Deterministic MUPID generator producing cryptographically safe `MB-XXXXXX` format.
3. ✅ Zero-barrier Emergency SOS dispatching without login or credentials.
4. ✅ Hospital emergency triage queue retrieval and status filtering.
5. ✅ Live hospital resource capacity tracking (ER beds, ICU, OT, ambulances).
6. ✅ GenericMeds AI verified alternative matching with mandatory clinical disclaimers.
7. ✅ Government healthcare scheme eligibility evaluation with liability non-deduction.
8. ✅ Patient user registration with automatic MUPID assignment.
9. ✅ Protected medical record access rejection without authentication token.
10. ✅ Accredited hospital directory search with itemized procedure tariffs.

---

## 🔒 Security & Privacy Commitments
- Knowing a MUPID alone never grants access to protected medical records.
- Role-based access controls protect doctor and hospital portals.
- Private medical files are verified with SHA-256 checksums and isolated from public access.

