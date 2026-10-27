# MediBridge AI — Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Proposed product baseline  
**Date:** 27 October 2026  
**Audience:** Product, design, engineering, QA, security, clinical and integration stakeholders

> **Important:** This is a product specification, not evidence that any external integration is already live. ABHA/ABDM, hospital data, government scheme eligibility, claim status, medicine availability, pricing and electronic-signature workflows must be connected to authorized sources and verified before being presented as live.

## 1. Product Summary

MediBridge AI is a healthcare coordination platform that helps patients organize medical records, understand reports in plain language, discover hospitals and clinicians, compare transparent treatment costs, explore potentially applicable financial assistance, share selected records with consent, coordinate consultations and treatment, receive authenticated prescriptions, compare potential lower-cost medicine options, and manage follow-up care.

The primary focus is Indian patients seeking care in India. International patients can use supported discovery, consultation, treatment-cost and travel-coordination features. Emergency entry must remain available without requiring ordinary onboarding.

### 1.1 Problem statement

Patients often have fragmented medical documents, difficulty understanding medical terminology, limited visibility into treatment costs, and uncertainty about which public schemes or other assistance may apply. Doctors may receive incomplete or poorly organized histories. Patients also struggle to distinguish a doctor's recommendation from a confirmed booking, an AI scheme suggestion from official approval, and an estimated cost from a confirmed payable amount.

MediBridge AI should reduce this coordination burden while preserving clinical authority, consent, privacy, transparent uncertainty and accurate financial status.

### 1.2 Product vision

A trusted, patient-centered care journey where medical information, provider discovery, cost transparency, financial-assistance guidance, clinician review, treatment coordination, prescriptions and follow-up are connected in one secure platform.

### 1.3 Product principles

1. **Patient control:** Patients control their profile and choose what records to share, subject to applicable law and care requirements.
2. **Clinical authority:** AI explains and organizes information; qualified clinicians make diagnoses and treatment decisions.
3. **Source traceability:** AI-generated medical summaries cite source documents/pages/dates where available.
4. **No fabricated certainty:** Unknown, estimated, pending, unverified and confirmed states are distinct.
5. **No hidden costs:** Fees, inclusions, exclusions, assumptions and verification dates are visible.
6. **Scheme guidance is not approval:** Official eligibility, hospital/procedure coverage, preauthorization and claims are separate states.
7. **Emergency first:** Emergency access is not blocked by registration, records, AI, insurance or payment.
8. **Secure by default:** A patient ID is not an access credential; every sensitive request is authorized server-side.
9. **Accessible language:** Use clear, multilingual, plain-language copy and accessible interaction patterns.
10. **Integration honesty:** Never claim an integration, live inventory, provider verification or approval exists unless it is actually connected and verified.

## 2. Goals and Success Measures

### 2.1 Goals
- Give every registered patient a stable internal MediBridge Patient ID.
- Enable secure manual upload and organization of medical documents.
- Generate source-grounded, plain-language AI summaries with uncertainty and missing-data flags.
- Let patients search and compare hospitals/doctors using backend-backed data.
- Show transparent consultation fees and treatment estimates.
- Guide eligible Indian patients through scheme discovery and the correct verification process.
- Enable explicit, auditable sharing of selected records with clinicians.
- Support online and in-person consultation workflows.
- Allow doctors to create authenticated treatment plans and prescriptions.
- Support follow-up recommendations and reminders.
- Offer evidence-based medicine comparison without automatic prescription substitution.
- Keep emergency guidance readily available.

### 2.2 Proposed success metrics
Metrics are targets to validate after baseline measurement, not claims about current performance.

| Metric | Definition | Initial target |
|---|---|---:|
| Registration completion | Registered users completing required profile fields / registration starts | ≥ 70% |
| Upload success | Valid document uploads completing successfully / valid upload attempts | ≥ 98% |
| Summary traceability | Summary claims with a usable source reference / claims sampled | ≥ 95% |
| Search usefulness | Users opening a provider profile after search | Establish baseline, then improve |
| Cost transparency | Provider/package listings showing source and estimate status | 100% of listings displayed |
| Consent enforcement | Unauthorized record access tests blocked | 100% |
| Scheme-state clarity | Scheme cases displaying a clear non-final/final status | 100% |
| Prescription safety | Final prescriptions requiring authenticated clinician approval | 100% |
| Hardcoded business data | Production pages using embedded business records instead of APIs | 0 |
| Emergency availability | Emergency entry reachable without login | 100% |

## 3. Personas and Roles

### 3.1 Patient
Needs to understand records, find appropriate care, compare costs, share records selectively, explore assistance, book appointments and manage follow-up.

### 3.2 Doctor
Needs an authorized view of the relevant patient history, original source files, consultation context, treatment-plan workflow, prescription drafting and follow-up tasks.

### 3.3 Care coordinator
Helps with scheduling, document completeness and administrative coordination. Access is restricted to assigned tasks and minimum necessary data.

### 3.4 Hospital/scheme desk (future/optional)
May update operational statuses only where the organization is authorized and a verified workflow exists.

### 3.5 Platform administrator
Manages platform configuration, provider verification workflows, support and audit review. Admin status does not automatically grant unrestricted clinical-record access.

## 4. Scope

### 4.1 MVP scope
- Registration/sign-in and internal patient ID.
- Patient profile with state/district and language preferences.
- Manual medical document upload, listing, metadata and private storage.
- AI summary workflow with source references, uncertainty and failure states.
- Hospital and doctor discovery backed by API/database.
- Provider detail and transparent fee/package comparison.
- Patient-selected record sharing and consent/access audit.
- Consultation request/booking for online or in-person modes.
- Doctor dashboard for authorized records and consultation review.
- Doctor-authenticated treatment-plan status.
- Scheme discovery with configurable rules, checklist and clearly non-final status.
- Follow-up recommendation and appointment state.
- Mockup/prototype states clearly separated from production data.
- Role-based authorization, tests, accessibility baseline and audit events.

### 4.2 Later phases
- Authorized ABHA/ABDM integrations.
- Hospital scheduling/EMR integrations.
- Formal scheme eligibility, preauthorization and claim-status integrations.
- Video consultation provider integration.
- Payment processing and refunds.
- Prescription signing workflow approved for the relevant jurisdiction.
- Reliable medicine catalogue and Jan Aushadhi product/price integration.
- International medical travel coordination.
- Multilingual AI and expanded accessibility validation.

### 4.3 Out of scope for MVP
- Autonomous diagnosis or treatment recommendation.
- AI deciding surgery is required.
- Guaranteed government scheme eligibility or benefit.
- Automatic medication substitution.
- Universal access to every hospital's medical records.
- Claim submission/payment status without authorized integration.
- Emergency triage that replaces emergency services or a clinician.
- Using a typed doctor name as proof of a legally valid electronic signature.

## 5. Core User Journeys

### 5.1 Indian patient journey
1. Patient lands on the public site and chooses the appropriate entry path.
2. Patient registers/signs in.
3. System creates a unique internal MediBridge Patient ID.
4. Patient adds essential profile details, including state/district when relevant.
5. Patient uploads records manually or links an external source only through an implemented, authorized integration.
6. The system validates files, stores them privately and creates document metadata.
7. AI extraction/summarization runs asynchronously; the patient sees processing, success, partial extraction or failure states.
8. Patient reviews summary, source references and uncertainty.
9. Patient searches and compares hospitals/doctors, fees and estimates.
10. Patient selects a clinician and chooses which records to share.
11. Backend validates consent, recipient identity, access scope and expiry.
12. Patient books online or in-person consultation.
13. Doctor reviews authorized records and original documents.
14. Doctor records assessment and a doctor-authenticated plan.
15. If a procedure is recommended, the plan is shown as **recommended**, not automatically booked.
16. Patient may explore government scheme assistance.
17. System assesses only against versioned, sourced rules and asks for scheme-specific documents, including an income certificate only if the relevant scheme requires it.
18. Official eligibility, hospital empanelment, procedure coverage and preauthorization are tracked as separate statuses.
19. Patient reviews confirmed/estimated/excluded/unknown costs and confirms booking/payment terms.
20. Treatment occurs outside or through a connected hospital workflow.
21. Doctor creates and authenticates final prescription/discharge instructions.
22. Medicine comparison may show potential alternatives for clinician/pharmacist review.
23. Doctor recommends follow-up; the patient books it separately.
24. New records and follow-up notes are linked to the timeline.

### 5.2 International patient journey
- Collect country/language and relevant travel preferences.
- Allow manual medical-record upload and source-grounded summary.
- Show provider profiles and treatment estimates from verified sources.
- Support consultation and travel coordination where implemented.
- Do not show Indian government benefits as available unless eligibility rules permit them.
- Show visa, travel and package information only from reliable, current sources and with clear responsibility disclaimers.

### 5.3 Emergency journey
- Provide emergency-call action and nearby emergency facilities when location/data are available.
- Never require login, ABHA linking, document upload, scheme assessment, AI processing or payment before showing emergency guidance.
- Optional medical-information sharing must use an authorized, carefully designed emergency-access workflow.
- Missing data must be labelled missing, not inferred.

## 6. Functional Requirements

Priority labels: **P0** = required for MVP safety/core path; **P1** = important; **P2** = later enhancement.

### FR-01 — Authentication and patient identity (P0)
- Support secure registration, sign-in, sign-out and account recovery.
- Create a unique stable internal patient ID after successful registration.
- Patient ID must not be an authorization secret.
- Store password hashes using a vetted password-hashing library; never store plaintext passwords.
- Rate-limit authentication and sensitive endpoints.
- Acceptance: two users cannot receive the same internal ID; knowing another patient's ID cannot access their data.

### FR-02 — Patient profile (P0)
- Store only necessary profile fields and preferences.
- Collect state/district for scheme assessment only when relevant.
- Make optional fields explicitly optional.
- Acceptance: profile changes persist and are reflected after reload; server validates all inputs.

### FR-03 — Medical document upload (P0)
- Accept only configured file types and size limits.
- Validate MIME/type and extension; do not trust client metadata alone.
- Store medical files in private object storage or a controlled private filesystem for local development.
- Persist metadata: owner, category, original filename (sanitized), upload date, source, processing state, storage key.
- Support processing states: uploaded, queued, processing, completed, partial, failed, review-required.
- Acceptance: unauthorized users cannot fetch files; failed processing preserves the original file and shows an actionable error.

### FR-04 — AI health summary (P0)
- Summarize extracted, source-supported content in plain language.
- Link claims to source document/page/date when available.
- Separate extracted facts, potential interpretations and general educational information.
- Flag contradictory dates/values, unreadable text, missing context and stale information.
- Show a clear disclaimer that it is not a diagnosis.
- Do not independently diagnose, prescribe, or recommend surgery.
- Acceptance: tests verify source references, uncertainty handling and refusal to invent missing facts.

### FR-05 — Provider search and comparison (P0)
- Search/filter by location, specialty, treatment, hospital type and verified availability where supported.
- Provider profiles include verification state and source/last-updated date.
- Consultation fee distinguishes online, in-person and follow-up where applicable.
- Treatment estimates separate included, excluded, estimated and unknown items.
- Acceptance: displayed business data comes from API/database; no silent fallback to fake data.

### FR-06 — Consent and record sharing (P0)
- Patient selects recipient, records, purpose and duration.
- Show what will be shared and how access can end.
- Backend validates patient ownership, recipient, role, purpose, scope and expiry.
- Record grant, access and revocation events in audit log.
- Acceptance: access outside scope, after expiry or after revocation is denied according to policy.

### FR-07 — Consultation workflow (P0)
- Display type, fee, time, location/mode, cancellation policy and status.
- Statuses include requested, awaiting confirmation, confirmed, cancelled, completed and no-show where appropriate.
- Do not claim a booking is confirmed until the booking system confirms it.
- Acceptance: patient and doctor views agree on the persisted booking status.

### FR-08 — Doctor dashboard and treatment plan (P0)
- Display only authorized patients and shared records.
- Allow opening original documents and source-referenced summaries.
- Doctor records assessment and treatment plan.
- Procedure recommendation is a distinct state from patient acceptance, coverage approval and booking.
- Finalization requires authenticated clinician action.
- Acceptance: non-doctor users cannot finalize a treatment plan as a doctor.

### FR-09 — Scheme discovery and assistance (P0/P1)
- Maintain scheme rules with jurisdiction, source URL, effective date/version, beneficiary criteria, document checklist, treatment coverage references, exclusions and verification pathway.
- Evaluate only the inputs needed by a scheme; do not assume eligibility from state or income alone.
- Explain why a scheme is potentially relevant and which criteria are missing.
- Ask for income certificate only where the specific scheme requires it.
- Track potential match, more information needed, official verification pending, eligibility verified, coverage pending, preauthorization pending, coverage confirmed, not eligible and claim status where verifiable.
- Clearly state that AI assessment is not official approval.
- Acceptance: every scheme result includes source/version and a non-final status unless backed by an authorized verification result.

### FR-10 — Treatment pricing and financial status (P0)
- Show consultation, procedure, room/stay, diagnostics, medicines/consumables and other relevant costs separately.
- Identify source, last verification and whether amount is confirmed or estimated.
- Do not deduct pending scheme/insurance support from patient payable amount.
- Acceptance: pending assistance is never represented as confirmed savings.

### FR-11 — Prescription and speech-to-text (P1)
- Speech-to-text creates a draft only.
- Parse medicine, strength, dosage, route, frequency, duration and instructions.
- Require doctor review and authentication before finalization.
- Preserve author, timestamp and version history.
- Acceptance: patient cannot see a draft as a final prescription; only authorized clinician can finalize.

### FR-12 — Medicine comparison (P1)
- Match active ingredient, strength, dosage form, route and release formulation using reliable catalogue data.
- Show source, price and last-checked date.
- Show availability only when verified by a connected source.
- Never automatically replace medicine or change dosage.
- Acceptance: uncertain matches are marked uncertain or omitted.

### FR-13 — Follow-up (P1)
- Doctor can recommend a follow-up date/time window.
- Recommendation is not an appointment booking.
- Patient can request/book a slot where scheduling integration exists.
- Reminders show queued/sent/failed only when the system can support that status.
- Acceptance: follow-up states remain distinct and auditable.

### FR-14 — Emergency access (P0)
- Emergency entry visible without authentication.
- Call and facility actions use reliable, configured regional data.
- Optional record retrieval must not delay emergency care.
- Acceptance: emergency entry works with API failures and without a logged-in session.

### FR-15 — Admin data governance (P1)
- Admin can manage provider verification workflows and scheme reference data according to assigned permissions.
- Track who changed prices, source URLs, scheme rules and verification states.
- Acceptance: sensitive changes create audit events and cannot be made by unauthorized roles.

### FR-16 — Accessibility and language (P0)
- Keyboard access, visible focus, semantic labels, adequate contrast, error messages and reduced-motion support.
- Use plain-language content and a localization-ready structure.
- Avoid using color alone to convey status.
- Acceptance: core flows pass keyboard and automated accessibility checks, followed by manual review.

## 7. Data and Content Governance

Every important external fact should have:
- source/provider;
- last-verified timestamp;
- effective date/version where applicable;
- verification state;
- owner responsible for updates;
- fallback behavior when stale or unavailable.

Provider fees, treatment packages, scheme criteria, medicine prices, empanelment and availability are time-sensitive. Stale data should be labelled or suppressed according to a defined freshness policy.

## 8. UX and Information Architecture

### Public navigation
- Home
- Find a Hospital
- Compare Costs
- How It Works
- Get Help
- Sign In / Create Account

### Patient navigation
- Overview
- My Health Records
- AI Health Summary
- Find Hospitals & Doctors
- Compare Treatment Costs
- Government Schemes
- Consultations
- Prescriptions
- Follow-up Care
- Consent & Sharing
- Help & Support

### Doctor navigation
- Overview
- Assigned Patients
- Shared Records
- Consultations
- Treatment Plans
- Prescriptions
- Follow-up Tasks

### Core UI states
Every data-backed view needs loading, empty, error, partial-data, stale-data and success states. Mock/demo data must carry a visible demo label and must not appear as production data.

## 9. Non-Functional Requirements

- Security: server-side authorization, secure sessions/tokens, rate limits, audit logs, secret management.
- Privacy: data minimization, consent lifecycle, retention/deletion policy and restricted access to financial documents.
- Reliability: graceful handling of external-service outages; do not silently show fabricated values.
- Performance: paginate lists; use async processing for large files and AI jobs.
- Accessibility: target WCAG 2.2 AA for core flows.
- Maintainability: modular monolith with clear domain boundaries.
- Observability: structured logs, metrics and correlation IDs without sensitive payloads.
- Portability: environment-based configuration and reproducible local setup.
- Testing: unit, integration, authorization, accessibility and end-to-end tests.

## 10. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| AI hallucination or missed medical context | Source-grounded extraction, explicit uncertainty, clinician review, evaluation suite |
| Unauthorized medical-data access | Server-side authorization, consent scopes, private storage, security tests and audit |
| Scheme eligibility incorrectly promised | Versioned official rules, non-final labels, authorized verification |
| Outdated prices or stock | Source/date/freshness labels; hide or mark stale data |
| Fake frontend data leaks into production | Central API layer, fixture isolation, integration tests, no silent fallback |
| User treats AI summary as diagnosis | Plain-language boundaries, source links and clinician escalation |
| Prescription transcription error | Draft-only state, structured review and authenticated finalization |
| External integration unavailable | Explicit unavailable state; manual upload or contact instructions where appropriate |
| Emergency flow delayed | Separate public emergency entry and no onboarding gate |

## 11. Release Plan

### Release 0 — Foundation
Repository audit, design system, auth, roles, API conventions, environment configuration, audit events.

### Release 1 — Patient records
Patient ID, profile, private upload, document metadata, AI summary and source references.

### Release 2 — Discovery and clinician workflow
Hospital/doctor data, cost comparison, consent sharing, consultation booking and doctor review.

### Release 3 — Scheme assistance
Scheme catalogue, document checklist, rule-based preliminary assessment and official-verification statuses.

### Release 4 — Prescription and follow-up
Doctor-reviewed voice transcription, final prescription workflow, follow-up reminders and appointment states.

### Release 5 — Verified integrations
Only integrations for which authorization, technical access, operational ownership and legal/privacy review are complete.

## 12. Open Decisions
- Which authentication provider and session strategy will be used?
- Which object-storage provider is available for deployment?
- Which AI model/provider and data-retention terms are acceptable?
- Which official scheme datasets and update owners are available?
- Which hospital/provider data sources are verified?
- Which video, notification, payment and e-signature providers will be used?
- What retention/deletion rules apply to medical and financial documents?
- Which languages are required for the first release?
- What is the jurisdiction-specific legal review plan?

## 13. Definition of Done
A feature is done only when UI, API, database, authorization, error/loading/empty states, audit requirements, tests, accessibility, documentation and configuration are complete. A demo integration must be labelled as simulated. No acceptance criterion is met solely because a screen looks correct.
