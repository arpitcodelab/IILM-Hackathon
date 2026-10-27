# MediBridge AI — Frontend Product Requirements Document (PRD)
**Version:** 2.0 (Full Scope & Production Wireframe Spec)  
**Author:** MediBridge AI Architecture & Frontend Engineering Team  
**Target Stack:** React 19, TypeScript, Vite 6, SCSS (Modular Partials), TanStack Query, React Router v6, Lucide React  
**Compliance Target:** WCAG 2.2 AA, ABHA/NDHM Architectural Guidelines, ISO 27001 / HIPAA Privacy-Safe Frontend Principles  

---

## 1. Executive Summary & Product Vision

MediBridge AI is an intelligent healthcare coordination, medical tourism, and emergency response platform built for Indian citizens and international medical travelers. The platform unifies zero-barrier emergency response, source-grounded clinical intelligence, provider discovery with transparent procedure pricing, preliminary government healthcare scheme recommendation (Ayushman Bharat PM-JAY and state schemes), doctor consultation authoring, and Jan Aushadhi generic medicine comparison.

This document defines the **exhaustive, wireframe-accurate frontend product requirements**, mapping directly to:
1. The approved architectural principles in `MediBridge_AI_Claude_Code_Prompt_Pack.md`.
2. The high-fidelity production mockups across the **Hospital Emergency Command Panel** (`media_1793087032255_571cace7.jpg`), the **Patient & Public Experience Suite** (`media_1793087032258_38603198.jpg`), and the **Doctor Consultation & Prescription Workspace** (`media_1793087032261_ab85d2d6.jpg`).

---

## 2. Core Product Principles & Frontend Guardrails

All frontend interfaces and user interactions must strictly obey the following rules:

1. **Zero-Barrier Emergency Access**:
   * Emergency SOS, dispatch, and triage guidance must be accessible **without requiring login, account creation, identity verification, AI summarization, scheme pre-approval, or upfront payment**.
   * Bystanders and patients can dispatch an alert anonymously or attach an optional MUPID/ABHA identifier.
2. **Identity Verification Before Protected Record Access**:
   * Viewing sensitive health records, prescriptions, and lab documents requires verified identity (`PatientProfile.verification_status === 'verified'`).
   * A unique **MediBridge Unique Patient ID (MUPID)** (e.g., `MB-7X4Q2K`) is displayed as a patient identifier, but **the ID alone never acts as an authentication credential**.
   * Both **India Path** (optional ABHA integration, Aadhaar, Ration Card) and **International Path** (Passport, National ID) are supported.
3. **Source Grounding, Uncertainty & Provenance in AI Outputs**:
   * AI never autonomously diagnoses, prescribes, approves procedures, determines official scheme eligibility, or authorizes payments.
   * Every AI-generated clinical finding must visually display its source document citation (document name, page number, date), clinical certainty level, and an explicit patient correction control.
   * Language must adhere to: *"The report mentions..."* / *"Possible finding; verify with a clinician."*
4. **Preliminary Scheme Matching vs. Official Verification**:
   * Government scheme matching is explicitly designated as **Preliminary Match**.
   * The UI strictly forbids deducting pending or unverified financial assistance from the estimated patient liability.
   * Scheme verification and hospital empanelment are tracked as discrete workflow states requiring authorized staff review.
5. **Prescription Integrity & Doctor Authentication**:
   * Voice-to-text input creates an editable **Draft** only.
   * Clinicians must explicitly review medications, dose, frequency, and instructions.
   * Prescriptions transition strictly through `draft` → `awaiting_review` → `authenticated`. A typed name is never presented as a cryptographic signature.
6. **Generic Medicine & Jan Aushadhi Transparency**:
   * Displays bioequivalent Jan Aushadhi salts and price comparisons (e.g., "76% cheaper").
   * Strictly avoids automatic substitution; always displays the banner: *"Same active ingredient, strength, and formulation. Please confirm with your doctor or pharmacist."*
7. **No Fake Fallback Data**:
   * No hardcoded hospital listings, invented doctor slots, fake scheme approvals, or simulated payment confirmations.
   * If a third-party service (e.g., ABHA gateway, OCR engine, or Jan Aushadhi catalog) is unconfigured or unreachable, the UI renders an honest `Service Unavailable / Configuration Required` state.

---

## 3. User Roles & Permission Boundaries

| Role | Key Capabilities & Accessible Route Groups | Guardrails & Restrictions |
| :--- | :--- | :--- |
| **Public / Anonymous** | Landing (`/`), About, Hospital Search (`/hospitals`), Treatment Costs (`/treatments`), Emergency SOS (`/emergency`), Scheme Eligibility Calculator (`/schemes`) | Cannot view any protected patient records or doctor schedules. |
| **Emergency Responder / Bystander** | Emergency SOS Wizard (`/emergency/new`), Live Dispatch Tracker (`/emergency/track/:id`) | Zero authentication barrier; can provide incident description and GPS coordinates. |
| **Patient** | Patient Dashboard (`/patient/dashboard`), Health Records (`/patient/records`), AI Summary Review (`/patient/records/ai-analysis`), Consultations (`/patient/consultations`), Prescriptions (`/patient/prescriptions`), Medicine Compare (`/patient/medicine-compare`), Journey Tracking (`/patient/journey`) | Protected records locked until identity verification is completed. Can revoke doctor consent at any time. |
| **Doctor** | Doctor Dashboard (`/doctor/workspace`), Daily Appointments Queue, Patient Medical Records Review, Teleconsultation Video Room, Prescription Authoring with Voice-to-Text, Treatment Plan Authorship | Restricted exclusively to patients with active consultations or granted consent. Cannot finalize routine surgical bookings without patient acceptance. |
| **Hospital ER Staff** | Hospital Emergency Command Panel (`/hospital/emergency-panel`), Live Incident Map, Bed/OT Resource Management, Case Handover Notes, Emergency Dispatch Queue | Direct real-time socket/polling access to inbound emergency alerts. |
| **Care Coordinator / Scheme Officer** | Scheme Verification Desk (`/coordinator/schemes`), Document Audit, Manual Payment Evidence Review (`/coordinator/payments`), Travel & Logistics Planner | Reviews uploaded income certificates and hospital empanelment documents. Cannot alter doctor prescriptions. |
| **Admin** | System Management (`/admin/users`), Hospital/Doctor Verification, Integration Health Monitor, Audit Log Search (`/admin/audit-logs`) | No unrestricted access to clinical records; all break-glass actions are audited. |

---

## 4. Design System & Visual Specification

### 4.1 Color Palette & Semantics
In compliance with `antislop-ui` and calm healthcare visual principles, the design eschews high-saturation neon gradients in favor of calm warm neutrals, medical slate, restrained sage/olive accents, and distinct triage alerts:

* **Backgrounds & Surfaces**:
  * Canvas Background: `#F8FAFC` (Slate-50)
  * Card / Panel Surface: `#FFFFFF` (Pure White)
  * Dark Emergency Command Surface: `#0F172A` (Slate-900) / `#1E293B` (Slate-800)
  * Subtle Surface Borders: `#E2E8F0` (Slate-200)
* **Brand & Primary**:
  * Medical Navy: `#0F766E` / `#0D9488` (Teal-700 / Teal-600)
  * Primary Accent: `#2563EB` (Blue-600)
  * Subtle Tint: `#EFF6FF` (Blue-50) / `#F0FDFA` (Teal-50)
* **Clinical Triage & Status Colors**:
  * **Critical / Emergency Alert**: `#EF4444` (Red-500) / Light Fill: `#FEF2F2` (Red-50)
  * **High Priority / Warning**: `#F97316` (Orange-500) / Light Fill: `#FFF7ED` (Orange-50)
  * **Medium Priority / In Preparation**: `#3B82F6` (Blue-500) / Light Fill: `#EFF6FF` (Blue-50)
  * **Normal / Verified / Jan Aushadhi Savings**: `#10B981` (Emerald-500) / Light Fill: `#ECFDF5` (Emerald-50)
  * **Neutral / Resolved**: `#64748B` (Slate-500) / Light Fill: `#F1F5F9` (Slate-100)

### 4.2 Typography & Sizing
* **Font Family**: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
* **Heading 1**: 28px–32px, Semi-bold (`font-semibold`), line-height 1.25.
* **Heading 2**: 20px–24px, Medium/Semi-bold, line-height 1.3.
* **Body Regular**: 14px–15px, Regular (`font-normal`), line-height 1.5.
* **Caption / Meta**: 12px–13px, Medium (`font-medium`), line-height 1.4.
* **Code / Medical Identifier (MUPID, ABHA)**: `font-mono`, 13px, letter-spacing +0.05em.

### 4.3 Component Library Architecture (`frontend/src/styles/` & `components/`)
* `styles/abstracts/`: `_variables.scss`, `_mixins.scss`, `_functions.scss` (Design tokens, Dart Sass math & color modules).
* `styles/base/`: `_reset.scss`, `_typography.scss`, `_globals.scss`.
* `styles/layout/`: `_grid.scss`, `_navbar.scss`, `_sidebar.scss`.
* `styles/components/`: `_cards.scss`, `_badges.scss`, `_buttons.scss`, `_forms.scss`, `_modals.scss`, `_tabs.scss`, `_tables.scss`.
* `styles/pages/`: `_emergency_panel.scss`, `_doctor_workspace.scss`, `_patient_dashboard.scss`, `_gov_schemes.scss`.

---

## 5. Detailed Screen & Workflow Requirements

### 5.1 Hospital Emergency Command Panel (`/hospital/emergency-panel`)
*(Reference: Wireframe Image `media_1793087032255_571cace7.jpg`)*

The Emergency Command Panel is a mission-critical, high-density dashboard used by hospital emergency triage heads, ER nursing officers, and ambulance coordinators.

#### Layout & Shell
* **Header Bar**:
  * Left: Brand logo "MediBridge AI — Hospital Emergency Panel".
  * Center: Global Emergency Search Bar (placeholder: *"Search by Case ID, MUPID, ABHA ID, name, or phone..."* with keyboard shortcut badge `Ctrl + K`).
  * Right: Notification Bell with unread counter (3), Hospital Badge (*"Apollo Hospital, Delhi — Emergency Department"*), Clinician Status Pill (*"Dr. Anjali Singh — Emergency Head"* with online indicator).
* **Sidebar Navigation (Dark Slate `#0B132B`)**:
  * Menu Items: Dashboard, **Emergency Cases** (badge: 3), Active Cases (badge: 8), In Preparation (badge: 5), Arrived at Hospital (badge: 2), Resolved Cases, Patient Search, Hospital Resources, Staff Management, Reports & Analytics, Messages, Settings.
  * Footer Utilities: 24/7 Emergency Control indicator (*"Always Active"* with pulsing green dot) and Helpdesk Contact (*"Need Support? Call Hospital Admin: +91 11 4067 0000"*).
* **Top Metric Cards (KPI Ribbon)**:
  1. **New Alerts**: Count `3` (Sub-text: *"Needs attention"*, Icon: Red alert bell).
  2. **Active Cases**: Count `8` (Sub-text: *"In progress"*, Icon: Amber shield).
  3. **In Preparation**: Count `5` (Sub-text: *"Bed / Team / OT"*, Icon: Blue stethoscope).
  4. **Arrived Today**: Count `4` (Sub-text: *"At Hospital"*, Icon: Green hospital bed).
  5. **Avg. Response Time**: Value `12 min` (Sub-text: *"-40% vs benchmark"*, Icon: Clock, Badge: `2 min ago`).

#### 3-Column Command Center Workspace
1. **Column 1 — Triage Cases Queue**:
   * Tab Navigation with counters: `All (16)` | `New (3)` | `Active (8)` | `In Prep (5)` | `Arrived (2)`.
   * Filter controls: Dropdowns for *All Priorities* (Critical, High, Medium, Low), *All Categories* (Accident/Trauma, Cardiac, Respiratory, Stroke, Burns, General), and *Sort Order* (Latest First).
   * Interactive Case Cards:
     * Card 1: `EMG-2024-001` | **CRITICAL** | "Road Accident - Head Injury" | Patient: `MB-7X4Q2K (Rohan Mehta, 34M)` | Location: `Sector 62, Noida (2.3 km)` | Timestamp: `2 min ago` | Image thumbnail preview.
     * Card 2: `EMG-2024-002` | **HIGH** | "Breathing Difficulty" | Patient: `Not Provided (Female, 28F)` | Location: `Rohini, Delhi (5.1 km)` | Timestamp: `5 min ago`.
     * Card 3: `EMG-2024-003` | **HIGH** | "Chest Pain" | Patient: `MB-9H3LT (Amit Verma, 52M)` | Location: `Connaught Place (3.7 km)` | Timestamp: `8 min ago`.
     * Card 4: `EMG-2024-004` | **HIGH** | "Stroke Symptoms" | Patient: `MB-4P08XY (Meena Iyer, 60F)` | Location: `Dwarka, Delhi (8.4 km)` | Status: `In Preparation`.
     * Card 5: `EMG-2024-005` | **MEDIUM** | "Severe Abdominal Pain" | Patient: `MB-2K9LQ1 (Rajesh Kumar, 45M)` | Location: `Lajpat Nagar (4.1 km)`.
     * Card 6: `EMG-2024-006` | **MEDIUM** | "Burn Injury" | Patient: `Not Provided (Male, 30M)` | Status: `Arrived`.
   * Selection State: Clicking a case card binds its details into Columns 2 and 3.

2. **Column 2 — Geospatial Tracking & Resource Readiness**:
   * **Live Incident Map**:
     * OpenStreetMap / Leaflet interactive tile map centered on Delhi NCR.
     * Ambulance real-time location marker (`Sector 62`), hospital destination marker (`Apollo Hospital Emergency Dept.`).
     * Floating ETA Overlay: *"Patient Location: 2.3 km • 7 mins"*.
   * **Live Incident Timeline**:
     * Header with "Auto Refresh" toggle.
     * Chronological feed:
       * `10:23 AM`: Emergency alert received (Case EMG-2024-001 created).
       * `10:24 AM`: Location identified (Sector 62, Noida, 2.3 km).
       * `10:25 AM`: Patient details matched (MUPID: MB-7X4Q2K - Rohan Mehta).
       * `10:25 AM`: Alert sent to Emergency Team (ER Team, Neurosurgery, Radiology notified).
   * **Live Hospital Capacity**:
     * 4 Resource Gauges:
       * ER Beds: `4 / 12` available.
       * ICU Beds: `2 / 8` available.
       * OT Available: `1 / 3` available.
       * Ambulances: `2 / 5` available.
   * **Quick Action Triggers**:
     * Buttons: `[🚨 Alert ER Team]`, `[🏥 Prepare OT]`, `[👨‍⚕️ Notify Specialist]`, `[🚑 Dispatch Ambulance]`.

3. **Column 3 — Clinical Intelligence & Action Panel**:
   * Case Header: `EMG-2024-001` [CRITICAL] "Road Accident - Head Injury".
   * Action buttons: `[✅ Acknowledge]` (Red fill), `[Assign]` (Outline).
   * Segmented Navigation Tabs: `Patient Info` | `Medical Records` | `AI Summary` | `Updates` | `Notes`.
   * **Patient Identity Card**:
     * Avatar, Name: Rohan Mehta, Badge: `Known Patient`, MUPID: `MB-7X4Q2K`, ABHA ID: `91-XXXX-4521`, Demographics: `Age 34 • Male • +91 98765 43210`.
     * Secondary CTAs: `[View Full Profile]`, `[📞 Contact Family]`.
   * **Dispatch & Incident Details**:
     * Incident Location: `Sector 62, Noida, Uttar Pradesh (2.3 km from hospital • ~7 mins)` with `[View on Map]`.
     * Reported By: Bystander (`+91 98765 11111`).
     * Narrative Description: *"Road traffic accident, head injury, unconscious. Bleeding from forehead."*
     * Scene Photos: Photo thumbnails with modal enlargement (2 photos attached).
   * **Critical AI Health Summary (Pre-Hospital Intelligence)**:
     * High-visibility alert box grounded in patient medical history:
       * **Known Conditions**: Hypertension (Since 2020), Type 2 Diabetes (Since 2019).
       * **Critical Allergy Warning**: ⚠️ **Penicillin (Severe)** (Bright red badge).
       * **Current Medications**: Amlodipine 5 mg, Metformin 500 mg, Atorvastatin 10 mg.
       * **Recent Clinical History**: Last Checkup 12 Mar 2024 (No major complications, regular follow-ups).
       * Link: `[View Full Analysis]`.
   * **Clinical Action Center**:
     * Quick Action Grid: `[Acknowledge Case]`, `[Prepare ER]`, `[Call Patient / Family]`, `[Assign to Doctor]`, `[Request Ambulance]`, `[Mark as In Preparation]`.
     * Triage Handover Notes: Text area input (*"Add a note..."*) with `[Update Status]` button.

---

### 5.2 Patient Experience Suite (`/patient/*`)
*(Reference: Wireframe Image `media_1793087032258_38603198.jpg`)*

#### A. Public Landing Page (`/`)
* **Hero Section**:
  * Title: *"Smarter Healthcare for a Brighter Tomorrow"*.
  * Description: *"Your health journey, simplified. Upload records, understand reports, find the right doctors, explore government schemes and get emergency support — all in one place."*
  * CTAs: `[Get Started]` (Blue primary), `[▶ Watch Video]` (Outline).
* **Social Proof Counter Banner**:
  * `10K+ Patients` | `500+ Doctor Partners` | `200+ Hospitals` | `15+ Government Schemes` | `98% Satisfaction Rate`.
* **Quick Feature Gateway Cards**:
  * `AI Report Analysis`: Upload medical reports to receive clear, structured summaries.
  * `Find Best Doctors`: Search top clinicians with transparent consultation fees.
  * `Compare Hospital Costs`: Discover NABH-accredited facilities and procedure tariffs.
  * `Government Schemes`: Explore PM-JAY and state health assistance.
  * `Emergency SOS`: Immediate access to emergency dispatch.

#### B. Patient Onboarding & Identity Verification (`/patient/onboarding`)
* **Progress Stepper**: `1. Country` → `2. Identity` → `3. Verification` → `4. Complete`.
* **Country Selection**:
  * Dropdown: "India" (default) or "International / Other Country".
* **Identity Option Selector**:
  1. *Option 1 (India)*: "Enter your ABHA ID" — 14-digit ABHA input with `[Verify]` button. (UI explicitly informs: *ABHA verification requires authorized OTP integration; entering an ABHA number alone does not fetch records*).
  2. *Option 2*: "Enter your MUPID" — Format `MB-XXXXXX` for existing registered patients.
  3. *Option 3*: "Use other ID / Manual Verification" — Supports Aadhaar, Passport, Voter ID, or Ration Card document upload.
* **Consent & Privacy Notice**:
  * Clear explanation of why identity verification is required before releasing medical documents.

#### C. Patient Dashboard (`/patient/dashboard`)
* **Welcome Banner**: *"Good Morning, Rohan 👋 Take charge of your health journey"*.
* **Emergency Header CTA**: Red pulsing button `[🚨 Emergency SOS — Get urgent help now]` leading directly to `/emergency`.
* **Metric Overview Cards**:
  * `My Records`: 12 Documents.
  * `AI Insights`: 3 New Findings.
  * `Appointments`: 1 Upcoming.
  * `Schemes`: 2 Eligible.
  * `Prescriptions`: 4 Active.
* **AI Health Summary Widget**:
  * Displays top extracted insights:
    * `Elevated blood sugar levels`: Moderate severity (Based on Lab Report, 12 May 2024).
    * `Vitamin D deficiency`: Mild severity (Based on Lab Report, 12 May 2024).
    * `Possible dust allergy`: Low severity (Prescription, 3 Apr 2024).
  * CTA: `[View Full Report]`.
* **Quick Action Grid**:
  * `Upload Medical Records`, `Find Doctors`, `Compare Hospitals`, `Check Schemes`, `My Prescriptions`, `Medicine Comparison`.

#### D. AI Medical Document Analysis & Fact Verification (`/patient/records/ai-analysis`)
* **Header & Export**: Report Title, Timestamp, AI Disclaimer (*"AI Generated • For Information Only • Consult a qualified doctor for proper diagnosis and treatment"*), and `[Download Report]` CTA.
* **Navigation Tabs**: `Overview` | `Detailed Findings` | `Source Documents` | `Recommendations`.
* **Findings Summary Grid**:
  * KPI counter badges: `3 Possible Concerns` (Amber), `2 Normal Findings` (Green), `1 Needs Follow-up` (Blue).
* **Source-Grounded Findings List**:
  * Finding item displays: Condition/Finding name, severity badge, extracted date, source document link (e.g. *Lab Report - 12 May 2024, Page 2*), and certainty score.
  * **Patient Correction Modal**: Button `[Flag or Correct Finding]` allowing the patient to indicate discrepancies without modifying original clinical documents.
* **Recommendations Panel**:
  * `Consult an Endocrinologist` (Button: `[Book Now]`).
  * `Consider Vitamin D Supplements` (Button: `[Learn More]`).
  * `Allergy Precautions` (Button: `[View Tips]`).

#### E. Hospital Discovery & Transparent Procedure Pricing (`/hospitals`, `/treatments`)
* **Search & Filters**:
  * Location selector (e.g. *Delhi, Noida, Gurgaon*), Specialty filter (*Cardiology, Oncology, Orthopedics*), Accreditation badge filter (*NABH, JCI*).
* **Hospital Listing Cards**:
  * **Apollo Hospital**: Rating 4.6 (900 reviews), Distance 3.5 km, Specialties badges, Procedure Tariff: *Starting From ₹25,000 (Knee Replacement)*. Buttons: `[View Details]`, `[Add to Compare]`.
  * **Max Super Speciality Hospital**: Rating 4.4 (350 reviews), Specialties badges, Procedure Tariff: *Starting From ₹3,50,000 (Heart Bypass Surgery)*.
  * **Fortis Hospital**: Rating 4.3 (450 reviews), Specialties badges, Procedure Tariff: *Starting From ₹1,80,000 (Gall Bladder Surgery)*.
* **Financial Transparency Modal**:
  * Distinct breakdown separating:
    1. Base Doctor Consultation & Surgeon Fee.
    2. Hospital Stay & Room Tariff.
    3. Procedure Inclusions (OT charges, standard consumables, anesthesia).
    4. Exclusions (Special implants, extended ICU stay beyond standard package).
    5. Non-guarantee disclaimer.

#### F. Emergency SOS Zero-Barrier Flow (`/emergency`, `/emergency/new`)
* **Entry Gate Modal**:
  * Urgent alert header: *"Emergency SOS — Get urgent medical assistance from nearby hospitals"*.
  * Hotline indicator: *"Need immediate help? Call 108 (India) / 102"*.
  * Two Distinct Access Pathways:
    * **Pathway A**: `[I have my ID]` — Input field for MUPID or ABHA ID to immediately pull allergy & emergency records.
    * **Pathway B**: `[Continue without ID]` — Instant bypass to dispatch form with **zero authentication requirement**.
* **4-Step Emergency Dispatch Wizard**:
  * `Step 1 — Identification`: Name/Caller details (optional).
  * `Step 2 — Incident Details`:
    * What happened? (e.g., Road accident - head injury).
    * Category: Radio selection (*Accident/Trauma, Cardiac, Respiratory, Stroke, Burns, Other*).
    * Patient Condition: Radios for *Conscious / Unconscious* and *Breathing / Not Breathing*.
  * `Step 3 — Location`:
    * Interactive map pin with GPS auto-detect button: `[📍 Use my current location]`.
    * Manual address input fallback.
  * `Step 4 — Media & Confirmation`:
    * Caller Contact Number (for ER triage coordination).
    * Upload Scene Photos (Optional).
    * Big Red CTA: `[🚨 Send Emergency Alert]`.

#### G. Medicine Comparison & Jan Aushadhi Generic Switcher (`/patient/medicine-compare`)
* **Header**: Search medication by brand name or upload active prescription.
* **Comparison Card**:
  * **Prescribed Brand**: `Azee 500` (Azithromycin 500 mg, Manufacturer: Cipla, Price: `₹160` for strip of 3).
  * **Jan Aushadhi Generic Alternative**: `Azithral 500` / PMBJP Generic Azithromycin 500 mg (Price: `₹38` for strip of 3).
  * **Savings Callout**: Highlight badge `76% cheaper` (Green).
* **Clinical Safety & Legal Disclaimer**:
  * Prominent banner: *"Same active ingredient, strength, and formulation. MediBridge AI does not substitute medications automatically. Please confirm with your treating doctor or pharmacist before making any changes."*

---

### 5.3 Doctor Workspace & Consultation Suite (`/doctor/workspace`)
*(Reference: Wireframe Image `media_1793087032261_ab85d2d6.jpg`)*

The Doctor Workspace is an integrated clinical environment designed for cardiologists, surgeons, and consulting physicians to review patient histories, conduct teleconsultations, author digital prescriptions, and formulate surgical treatment plans.

#### Layout & Shell
* **Header**:
  * Greeting: *"Good Morning, Dr. Sharma ☀️ You have 12 appointments today"*.
  * Date/Time Widget: `Mon, 12 May 2025 • 10:30 AM`.
  * Quick Actions Dropdown: Create Prescription, New Referral, Block Slot.
  * Doctor Profile: Dr. Arjun Sharma (Cardiologist | Apollo Hospital, Delhi).
* **Top Metric Ribbon (KPI Cards)**:
  1. `12 Today's Appointments`.
  2. `5 New Patient Requests`.
  3. `2 Emergency Cases`.
  4. `8 Follow-ups Due`.
  5. `24 Pending Reports`.
* **Sidebar**:
  * Dashboard, Today's Appointments (badge 5), Patient Requests (badge 3), My Patients, Emergency Cases (badge 2), Prescriptions, Treatment Plans, Medical Records, AI Insights, Follow-up & Reminders, Hospital Coordination, Reports & Analytics, Settings.

#### Appointments & Triage Column
* **Filter Tabs**: `All (12)` | `Online (6)` | `In-Person (6)`.
* **Appointment Cards**:
  * `10:30 AM`: **Rohan Mehta** (Online) — *Chest pain, breathlessness* (Selected).
  * `11:00 AM`: **Neha Gupta** (In-Person) — *Follow-up - BP review*.
  * `11:30 AM`: **Amit Verma** (Online) — *ECG review*.
  * `12:00 PM`: **Priya Singh** (In-Person) — *Diabetes consultation*.
  * `12:30 PM`: **Suresh Kumar** (Online) — *Report discussion*.
  * `02:00 PM`: **Aarti Patel** (In-Person) — *Heart checkup*.
  * `02:30 PM`: **Vikram Rao** (Online) — *Post-surgery follow-up*.
  * `03:00 PM`: **Meena Iyer** (In-Person) — *Medication review*.

#### Active Consultation Clinical Workspace
When a patient (e.g., Rohan Mehta) is selected:

1. **Patient Clinical Header**:
   * Patient: **Rohan Mehta** | Online Consultation | MUPID: `MB-7X4Q2K` | ABHA ID: `91-XXXX-4521` | Demographics: `Age 34 • Male`.
   * Safety Badges: `Known Patient`, ⚠️ `Allergy: Penicillin`, `Diabetic`, `Hypertension`.
   * Teleconsultation Action Bar:
     * `[📹 Start Consultation]` (Primary blue CTA launching WebRTC / verified video room).
     * `[💬 Chat]`, `[📅 Reschedule]`, `[••• More]`.

2. **Clinical Sub-Tabs**:
   * `Overview` | `Medical Records (12)` | `AI Analysis` | `Previous Consultations (5)` | `Prescriptions (8)` | `Lab Reports (6)` | `Treatment Plan` | `Notes`.

3. **AI Health Summary (Doctor Review View)**:
   * Header: *"AI Generated from 12 verified documents"*.
   * **Possible Concerns**: Elevated blood pressure, Irregular heart rhythm (possible), High LDL cholesterol.
   * **Key Findings**: BP: `150/95 mmHg` (High), LDL: `162 mg/dL` (High), Mild ECG abnormality.
   * **Recommendations**: Cardiology consultation, Lifestyle modification, Further cardiac evaluation (ECHO).

4. **Patient Vitals & Demographics Card**:
   * Contact: `+91 98765 43210` • `rohan.mehta@gmail.com` • Location: `Noida, Uttar Pradesh`.
   * Clinical Vitals: Blood Group `B+`, Height `172 cm`, Weight `68 kg`, Employment: `IT Professional`.

5. **Medical History & Document Gallery**:
   * History list: Hypertension (Since 2022), Type 2 Diabetes (Since 2021), Allergy (Penicillin - Severe rash), Previous Surgery (Appendectomy 2018).
   * Document Thumbnails: ECG Report (12 May 2025 PDF), Blood Test (10 May 2025 PDF), Chest X-Ray (05 May 2025 PDF), Prescription (03 May 2025 PDF), Previous Summary (20 Apr 2025 PDF). Clicking opens a secure document viewer with side-by-side annotation.

6. **Jan Aushadhi AI Drug Suggestions**:
   * Inline alert: *"Generic alternative available: Amlodipine 5 mg is available at Jan Aushadhi at ~70% lower price. [View Jan Aushadhi Options]"*.

7. **Interactive Prescription Authoring Builder**:
   * Tool Bar: `[🎙 Voice to Text]`, `[📋 Templates]`, `[🛡 Drug Checker]`.
   * **Prescription Grid**:
     | Medicine Name | Dose | Frequency | Duration | Instructions | Actions |
     | :--- | :--- | :--- | :--- | :--- | :---: |
     | Tab. Amlodipine 5 mg | 5 mg | Once daily | 30 days | After breakfast | 🗑 |
     | Tab. Metformin 500 mg | 500 mg | Twice daily | 30 days | After meals | 🗑 |
     | Tab. Atorvastatin 10 mg | 10 mg | Once daily | 30 days | At night | 🗑 |
   * Button: `[+ Add Medicine]`.
   * Text Area: **Additional Instructions** (*"Regular BP monitoring. Low salt diet. Follow-up after 2 weeks. If chest pain increases, visit emergency immediately."*).
   * Checkbox: `Save as template`.
   * Action Buttons: `[Save Draft]` (Secondary), `[Generate Prescription]` (Primary blue).
   * *Signature Workflow*: Transitions through `draft` → `awaiting_review` → `authenticated` using doctor cryptographic credentials or verified token.

8. **Upcoming Follow-ups & Clinical Notes**:
   * Follow-up list:
     * Blood Test Review (19 May 2025 • In 7 days).
     * BP Monitoring (26 May 2025 • In 14 days).
     * Cardiac Evaluation (12 Jun 2025 • In 1 month).
     * Button: `[+ Add Follow-up]`.
   * Quick Clinical Notes: Timestamped notes (*"Patient has stress-related symptoms. Advised lifestyle changes. 12 May 2025, 10:30 AM"*).

---

### 5.4 Government Healthcare Schemes Recommendation ("Find Government Health Schemes for Your Treatment")
*(Reference: Prompt 7 of Prompt Pack & Task Specification)*

Accessible at `/patient/schemes` and `/schemes`.

#### User Journey & Questionnaire
1. **Citizenship & Domicile**:
   * Indian citizenship confirmation.
   * State and District selection (e.g. *Uttar Pradesh - Gautam Buddha Nagar*).
2. **Clinical Need**:
   * Treatment or procedure required (e.g., *Coronary Artery Bypass Grafting (CABG), Knee Replacement, Dialysis*).
   * Has a doctor recommended this surgery? (Yes/No).
3. **Socio-Economic & Document Eligibility**:
   * Approximate Annual Household Income (< ₹1.5 Lakh, ₹1.5L–₹3L, ₹3L–₹5L, > ₹5L).
   * Do you hold a Ration Card? Category: *BPL, Antyodaya (AAY), Priority Household (PHH), None*.
   * Do you have an Income Certificate issued by a Tehsildar/Revenue Authority? (Yes/No).
   * Existing PM-JAY / State Scheme Golden Card enrollment status.
4. **Preliminary Scheme Evaluation Card**:
   * **Ayushman Bharat PM-JAY**:
     * Coverage: Up to ₹5,00,000 per family per year.
     * Match Status: `Preliminary Eligible` (Based on SECC / BPL ration criteria).
     * Covered Package Tariff: CABG is 100% cashless at empanelled hospitals.
     * Required Documents: Aadhaar, Ration Card / PM-JAY Family ID letter.
   * **State Specific Scheme** (e.g., UP Mukhyamantri Jan Arogya Yojana):
     * Complementary state coverage criteria.
5. **Financial Liability Transparency Breakdown**:
   * Displays distinct mathematical ledger:
     * Estimated Total Treatment Cost: `₹3,50,000`
     * Confirmed Scheme Coverage: `₹0` *(Remains 0 until official preauthorization is issued)*
     * Pending / Preliminary Assistance: `₹3,50,000` *(Visible, but strictly NOT deducted from current liability)*
     * Excluded Expenses (Personal toiletries, special companion room): `₹15,000`
     * **Estimated Patient Liability**: `₹3,65,000` *(Decreases only upon official preauthorization)*
6. **Action Guidance**:
   * Step-by-step guidance on visiting an **Ayushman Mitra kiosk** at the target hospital, presenting the pre-authorization form, and completing physical biometric authentication.

---

## 6. Frontend Technical Architecture & Directory Blueprint

### 6.1 Directory Structure
```text
frontend/src/
├── assets/                  # Brand logos, icons, placeholder illustrations
├── components/
│   ├── layout/              # AppLayout, Navbar, Sidebar, Footer, EmergencyHeader
│   ├── ui/                  # Accessible Design System: Button, Input, Card, Badge, Modal, Tabs, Table, Skeleton, Drawer, Alert
│   ├── emergency/           # EmergencyTriageQueue, LiveLocationMap, IncidentTimeline, ResourceGauges, EmergencyActions
│   ├── doctor/              # AppointmentsQueue, ConsultationRoom, PrescriptionBuilder, TreatmentPlanEditor, VitalsCard
│   ├── patient/             # PatientSummaryCard, VitalsBanner, RecordsUploader, QuickActionsGrid
│   ├── financial/           # GovernmentSchemesFinder, TariffBreakdownTable, JanAushadhiCompareCard
│   ├── medical/             # ClinicalDisclaimer, SourceProvenanceBadge, DocumentViewerModal, AllergyAlert
│   └── navigation/          # RoleSwitcher, LanguageCurrencySelector
├── hooks/                   # useAuth, useEmergencyWebSocket, useDebounce, useMediaQuery
├── lib/                     # api-client.ts (Centralized Axios/Fetch with auth tokens and error envelopes)
├── pages/
│   ├── public/              # HomePage, AboutPage, HospitalsPage, TreatmentsPage, FaqPage, ContactPage
│   ├── auth/                # LoginPage, RegisterPage, OnboardingPage, ForgotPasswordPage
│   ├── emergency/           # EmergencyPortalPage, EmergencyDispatchPage, LiveTrackingPage
│   ├── patient/             # PatientDashboardPage, PatientRecordsPage, PatientConsultationsPage, PatientSchemesPage, PatientJourneyPage
│   ├── doctor/              # DoctorWorkspacePage, DoctorAppointmentsPage, DoctorPrescriptionsPage
│   ├── hospital/            # HospitalEmergencyPanelPage, HospitalResourcesPage
│   ├── coordinator/         # CoordinatorDashboardPage, SchemeVerificationDeskPage, PaymentEvidencePage
│   └── admin/               # AdminDashboardPage, AdminUsersPage, AdminAuditLogsPage
├── services/                # TanStack Query API services (hospitals.service.ts, emergency.service.ts, schemes.service.ts)
├── styles/                  # Modular SCSS Architecture
│   ├── abstracts/           # _variables.scss, _mixins.scss, _functions.scss
│   ├── base/                # _reset.scss, _typography.scss, _globals.scss
│   ├── layout/              # _grid.scss, _navbar.scss, _sidebar.scss
│   ├── components/          # _buttons.scss, _cards.scss, _badges.scss, _forms.scss, _modals.scss, _tables.scss
│   ├── pages/               # _emergency_panel.scss, _doctor_workspace.scss, _patient_dashboard.scss
│   └── main.scss            # Master stylesheet
├── types/                   # Strict TypeScript definitions matching backend Mongoose schemas
├── App.tsx                  # React Router v6 setup with Role-Based Route Guards
└── main.tsx                 # Application entry point with QueryClientProvider
```

### 6.2 Data Fetching & Caching Strategy (TanStack Query)
* **Query Keys Convention**:
  * `['emergency', 'cases', { status, priority }]` (Polling interval: 5 seconds or WebSocket subscription).
  * `['hospitals', { city, specialty }]` (Stale time: 10 minutes).
  * `['patient', 'profile', mupid]` (Stale time: 5 minutes).
  * `['patient', 'records', mupid]` (Stale time: 2 minutes).
  * `['doctor', 'appointments', { date }]` (Polling interval: 30 seconds).
  * `['schemes', 'evaluate', payload]` (Cached per criteria input).
* **Mutation Handling**:
  * Optimistic updates for emergency triage acknowledgment and notes.
  * Explicit loading spinners and button disablement during document uploads and prescription signing.
  * Centralized error interceptor extracting backend `ApiErrorResponse` (`code`, `message`, `details`).

---

## 7. Accessibility (WCAG 2.2 AA) & Performance Commitments

1. **Accessibility**:
   * **Keyboard Navigability**: Full tab sequence, explicit focus rings (`outline: 2px solid #2563EB; outline-offset: 2px`).
   * **Screen Reader Support**: All icons rendered with `aria-hidden="true"` and paired with semantic text or `aria-label`.
   * **Triage Color Independence**: Every critical priority or status uses both a distinctive color fill and an explicit text label / icon (e.g., 🔴 Critical, 🟠 High, 🔵 In Prep, 🟢 Arrived).
   * **Reduced Motion**: Respects `prefers-reduced-motion: reduce` across animations and transitions.
2. **Performance Targets**:
   * **Largest Contentful Paint (LCP)**: < 2.0s on standard 4G networks.
   * **First Input Delay (FID)**: < 80ms.
   * **Cumulative Layout Shift (CLS)**: < 0.05 (prevented via explicit aspect ratio containers for maps and skeleton placeholders).
   * **Bundle Splitting**: Route-level code splitting via `React.lazy` and manual Vite chunking (`vendor-react`, `vendor-query`, `vendor-icons`).

---

## 8. Frontend Delivery Phases & Release Gates

| Phase | Scope | Acceptance Gate |
| :--- | :--- | :--- |
| **Phase 1: Shell & Design System** | SCSS design tokens, typography, accessible UI components (Button, Card, Badge, Modal, Table, Skeleton), Navbar & AppLayout. | Zero lint errors, 100% WCAG 2.2 AA color contrast compliance, responsive on mobile (375px), tablet (768px), and desktop (1440px). |
| **Phase 2: Emergency Response Suite** | Zero-barrier SOS modal, 4-step dispatch wizard, Hospital Emergency Command Panel (Image 1 wireframe), live map and triage queue. | Emergency alert dispatches without login; hospital queue updates in real-time; bystander can report without credentials. |
| **Phase 3: Patient Portal & Schemes Finder** | Onboarding stepper, ABHA/Passport identity verification, Patient Dashboard (Image 2), AI Health Summary review, and Government Schemes Finder. | Protected records blocked until identity verification; AI facts link to source citations; pending scheme benefits not subtracted from liability. |
| **Phase 4: Doctor Workspace & Prescriptions** | Doctor Dashboard (Image 3), appointments queue, teleconsultation room, Voice-to-Text prescription authoring, Jan Aushadhi generic comparison. | Prescription moves strictly through draft to authenticated states; Jan Aushadhi comparison warns against automatic substitution. |
| **Phase 5: Provider Discovery & Cost Engine** | Hospital directory, procedure starting prices, tariff breakdown modals, multi-hospital side-by-side comparison. | Disclaimers present on all procedure estimates; doctor, hospital, and consumable fees clearly separated. |
| **Phase 6: End-to-End Hardening & Quality Gate** | Comprehensive Vitest unit tests, Playwright browser flows, lighthouse audits, bundle size optimization. | 100% tests passing; zero TypeScript compilation warnings; LCP < 2.0s. |

---

## 9. Sign-off & Document Approval
* **Lead Architect**: MediBridge AI System Architecture  
* **Frontend Lead**: Senior React & SCSS Engineering Specialist  
* **Clinical Safety Officer**: Medical Product Quality Team  

