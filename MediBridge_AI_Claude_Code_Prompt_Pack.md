# MediBridge AI — Claude Code Prompt Pack
Version 1.0 | Full-scope product | Phased implementation

## How to use
Open the repository in Claude Code. Paste Prompt 0 first, review the result, then run each phase prompt separately and in order. Do not advance until the current phase passes its tests. Keep real patient data out of development. Never replace an existing working application before auditing it.

## Approved product decisions
- Full scope, delivered in phases.
- Identity verification before protected medical-record access.
- Emergency guidance without login, identity verification, AI, scheme approval, or payment.
- India and international identity paths. ABHA is optional and only works through authorized integration; entering an ABHA number alone does not retrieve records.
- AI scheme matching is preliminary; official/manual verification determines actual status.
- Online and in-person consultations.
- Manual payment confirmation by authorized staff, with evidence metadata and audit history.
- Hinglish-friendly interface, structured for future localization.
- React + TypeScript + Vite + SCSS; Node.js + TypeScript + Express; MongoDB; REST API under `/api/v1`; OpenAPI; private object storage; asynchronous OCR/AI jobs; modular monolith initially.
- No fake production hospitals, doctors, fees, slots, scheme approvals, payments, medicine stock, or analytics.
- AI does not autonomously diagnose, prescribe, approve procedures, determine official scheme eligibility, or authorize payments.
- Prescription draft, clinician review, and final authentication are separate states.

## Prompt 0 — Audit repository and create the plan
```text
Act as lead engineer for MediBridge AI. Inspect the complete repository before editing. Do not overwrite existing code or generate a replacement app before understanding what exists.

Inspect folders, frameworks, routes, models, authentication, background jobs, tests, environment variables, UI, and deployment. Map any existing Python or other backend routes/business logic to the target architecture. Identify functionality to preserve, risks, missing tests, and a rollback/migration path. If the repository is empty, propose a clean structure.

Create/update:
- docs/PRODUCT_REQUIREMENTS.md
- docs/TECHNICAL_ARCHITECTURE.md
- docs/THREAT_MODEL.md
- docs/DATA_MODEL.md
- docs/STATE_MACHINES.md
- docs/INTEGRATION_REGISTER.md
- docs/IMPLEMENTATION_PLAN.md
- docs/DECISIONS.md

Use a modular monolith with modules for identity, users, records, AI processing, providers, consent, consultations, treatment plans, schemes, payments, prescriptions, medicines, follow-ups, notifications, audit, and admin. Frontend: React/TypeScript/Vite/SCSS. Backend: Node/TypeScript/Express. Database: MongoDB. API: /api/v1 with OpenAPI. Medical files: private object storage. OCR/AI/reminders: asynchronous jobs.

Do not invent repository facts. Mark unknowns explicitly. Identify integrations needing credentials, contracts, official access, legal review, or configuration. Define acceptance criteria per role and module, a test strategy, and release gates. Do not build the entire product in this phase.

Report findings, preserved functionality, proposed structure, unresolved decisions, setup/test commands, and the next phase.
```

## Prompt 1 — Foundation and design system
```text
Implement only the project foundation. Use TypeScript on frontend/backend, React + Vite + React Router + SCSS, Express + MongoDB, runtime environment validation, .env.example placeholders, lint/format/type-check/test tooling, API health/readiness endpoints, structured request-ID logging with sensitive-field redaction, OpenAPI, and a clear README.

Build accessible reusable UI components: navigation, form controls, buttons, cards, tables, dialogs, tabs, alerts, badges, loading skeletons, empty/error states, confirmation dialogs. Target WCAG 2.2 AA; support keyboard, visible focus, screen readers, reduced motion, mobile/tablet/desktop. Use calm warm neutral surfaces with restrained green/olive and muted terracotta; avoid gradient-heavy generic AI visuals. Use a translation dictionary structure and Hinglish-friendly copy instead of scattering hard-coded text.

No real secrets. No fake fallback data when APIs fail. Demo fixtures must be isolated and visibly labelled. Add frontend error boundary, structured API errors, baseline tests, and documented run commands. Run lint, type checks and tests, fix failures, report exact results and changed files. Stop after this phase.
```

## Prompt 2 — Authentication, roles, identity and emergency
```text
Implement secure registration/login/logout, password reset, session/token expiry and renewal strategy, account lifecycle, modern password hashing, rate limits, brute-force protections, safe error responses, secure cookie/session settings, CSRF protection where applicable, security headers and CORS policy.

Roles: Patient, Doctor, Care Coordinator/Scheme Operations, optional Hospital/Scheme Desk if justified, Admin. Enforce every permission server-side; hiding UI controls is not security. Generate a unique internal MediBridge Patient ID that is not a credential and grants no access.

Onboarding: India path with optional ABHA path only if authorized integration exists; international path with country and supported identity-document type. Never imply a selected document type means verification is integrated. Collect only necessary identity data, store securely, and implement statuses: not_started, submitted, under_review, verified, rejected, needs_more_information, expired where applicable. Add audited manual review; users cannot approve their own verification. Require verification before protected medical-record access. Emergency guidance remains available without login or verification, does not wait for AI, and uses reliable region-configured information or a safe fallback.

Audit security events, role changes, identity decisions and protected-data access. Test IDOR, privilege escalation, unverified access, patient-ID-only access, manual review and emergency bypass. Do not mark identity verified without real provider confirmation or authorized human review.
```

## Prompt 3 — Medical records and secure uploads
```text
Implement medical-record upload/management for prescriptions, labs, imaging, discharge summaries, allergy records, referrals and other clinical documents.

Use private object storage and MongoDB metadata. No public file URLs. Validate size, extension, MIME type and actual file signature where feasible; reject dangerous formats; add malware-scanning adapter hook. Use opaque object keys, safe filenames, short-lived authorized downloads or secure streaming. Store owner, category, timestamp, checksum, processing state, source, extracted document date, access classification and retention state.

Implement upload progress/retry, recoverable processing states, checksum-based duplicate warnings (never silently delete), and an asynchronous OCR/parsing job abstraction with retries, idempotency, visible failure states and dead-letter/error tracking. If OCR is unconfigured, show unavailable/configuration-required, not fake extraction. Enforce owner/role authorization on every read/update/download/delete. Audit uploads, views/downloads, sharing, processing and denied access. Do not log file contents or sensitive extracted text.

Test corrupt/large/unsupported files, unauthorized access, storage failure, retries and processing failure. Document storage/OCR configuration. Stop after this phase.
```

## Prompt 4 — AI extraction and health summary
```text
Implement a source-grounded AI pipeline: document -> OCR/extraction -> normalized candidate facts -> provenance -> conflict/uncertainty review -> patient-readable summary.

Possible facts: allergy mention, medication mention, history/diagnosis mentioned in a source, procedure/history, lab result with value/unit/reference range/date, follow-up instruction, missing/conflicting information. Every fact must link to source document and page/section/coordinates when available, extraction timestamp and quality/confidence metadata.

Distinguish `mentioned_in_document`, `patient_confirmed`, and `clinician_confirmed`. AI confidence never means clinician confirmation. Show original source and let patient flag/correct extracted facts without modifying the source document. Treat contradictions, unit/strength/date ambiguity and OCR errors conservatively. Do not silently pick a conflicting value.

AI must not diagnose, prescribe, decide surgery or replace clinician assessment. Use “the report mentions” / “possible finding; verify with a clinician.” Treat uploaded text as untrusted input; defend against prompt injection. Validate structured model output; add timeouts, retries, provider abstraction, redacted logs and data-processing documentation. Do not send health data to a provider unless configured and permitted. If AI is unconfigured, show unavailable, not fake summaries. Emergency guidance never waits for summary.

Add version history and synthetic test fixtures. Test unsupported claims, source mismatch, contradictions, allergy ambiguity, prompt injection and malformed output. No unsupported statement should appear as a fact.
```

## Prompt 5 — Provider discovery, fees, consent and consultations
```text
Build provider directory models for hospitals, doctors, specialties, qualifications, registration-verification status, locations, services, consultation modes, fees/effective dates, cancellation/refund terms and availability. Distinguish verified facts from unverified claims, with source/verifier/date. Do not seed fake production providers, reviews, prices or slots. Search/filter and side-by-side compare providers. Separate doctor fee, hospital fee and procedure estimate; show inclusions, exclusions, source, effective date and non-guarantee disclaimer. Availability must come from configured scheduling or provider-managed data, never invented slots.

Consent: patient selects exact records, recipient, purpose and duration. Store actor, recipient, scope, purpose, timestamp, expiry, status, revocation and version. Enforce consent on every protected record access. Revocation blocks future access as applicable while retaining required audit records. Use plain Hinglish explanations.

Consultation: patient requests online/in-person; doctor accepts/rejects with reason/requests information. Show fee, mode, duration, cancellation/refund rules and time before confirmation. Keep payment and appointment statuses separate. Manual payment statuses include pending, evidence_submitted, under_review, confirmed, rejected, refund_pending, refunded. Only authorized staff can confirm; capture evidence metadata and audit actor/time/reason. Never trust client-only confirmation. Prevent double-booking with concurrency control. Meeting links require a configured integration or authorized staff; never invent a working link. In-person visits use verified location details.

Test consent scope/expiry/revocation, unauthorized doctors, payment privilege escalation, double-booking and API failures. Stop after this phase.
```

## Prompt 6 — Doctor workspace and treatment plans
```text
Build a doctor workspace listing only authorized/assigned consultations. Show authorized AI findings with source links, uncertainty and patient corrections; doctors must open original documents and record independent clinical assessment.

Doctor-authored treatment plan may include rationale, next steps, investigations, treatment/procedure recommendation, alternatives where appropriate, urgency, timeframe, estimated cost/inclusions/exclusions, authenticated author, timestamp and version. AI must never approve/sign a procedure.

Keep separate states: recommended; patient reviewing; accepted/declined/clarification requested; pre-operative evaluation pending/complete; scheme/funding verification pending/complete; preauthorization pending/approved/rejected/not_required; booking pending/confirmed; cancelled/completed. Enforce valid state transitions server-side. Recommendation must not create a booking. Require patient acceptance before routine scheduling and hospital confirmation after required checks. Preserve version history and audit all edits, authentication, patient decisions and transitions.

Test roles, versioning, invalid transitions, decline, missing authorization and booking blockers. Stop after this phase.
```

## Prompt 7 — Government schemes and financial transparency
```text
Build hybrid preliminary scheme matching plus official/manual verification. AI match is never official eligibility; scheme selection is not approval; approval is not claim settlement.

Create versioned scheme records with official source/reference, authority, region, effective/review/expiry dates, criteria, exclusions, benefits, required documents, empanelment requirements, covered procedure/package rules, preauthorization rules and claim steps. Do not treat guessed rules as official. Production rules must have reviewed sources; test fixtures must be labelled.

Collect income certificate only when the scheme requires it. Minimize financial data and restrict access. AI may explain possible matches/missing documents using configured criteria and must cite rule version, reasons and limitations. Missing/conflicting facts -> needs_information. Selecting a scheme does not submit or approve it.

Track distinct states: preliminary_match, patient_selected, documents_incomplete, ready_for_verification, verification_in_progress, eligible/ineligible/more_information_required/unable_to_verify, hospital_empanelment_pending/confirmed/not_confirmed, package_coverage_pending/confirmed/not_confirmed, preauthorization_not_required/pending/approved/rejected, booking_ready/blocked, claim_not_applicable/not_submitted/submitted/queried/approved/rejected/settled.

If official integration is unavailable, create a manual task for authorized staff with reviewer, evidence/source reference, reason, timestamp and scheme version. Never fabricate a government response. Explain the scheme-specific payment route; do not assume all schemes pay the same party. Show separately: estimated total, confirmed covered amount, pending/unconfirmed assistance, exclusions, estimated patient liability. Never subtract pending assistance from patient liability. Block routine booking when required authorization/readiness is missing; emergency care must not be delayed. Test partial coverage, expired rules, uncovered procedure, missing certificate, pending authorization, rejection and claim settlement.
```

## Prompt 8 — Prescription, voice-to-text and medicine comparison
```text
Build structured prescriptions with patient, clinician, encounter, medicine entries, dose, route, frequency, duration, instructions, timestamp, status, authentication metadata and version history.

Voice-to-text creates a draft only. Doctor reviews every medicine and critical field. Ambiguous drug name, strength, units, decimals or transcription must require confirmation. States should distinguish draft, awaiting_review, reviewed, authenticated, superseded and cancelled. A typed doctor name is not a valid digital signature. Use an authentication/signature adapter; only mark authenticated when the configured method succeeds. If unavailable, label appropriately and do not claim digital signing. AI cannot prescribe or alter a clinician order.

Medicine comparison must compare active ingredients, strength/concentration, dosage form, route, release formulation and combination ingredients. Use a trusted catalogue adapter with source and update date. If Jan Aushadhi data is not configured/reliable, show unavailable, not fake matches. Label exact/possible/partial/no reliable match. Never automatically substitute or instruct a patient to change medication; advise confirmation with prescriber/pharmacist. Show price/stock only from a current reliable source. Audit edits/review/authentication/access. Test ambiguity, strength/form mismatch, typed-name-only, unavailable catalogue and draft/final separation.
```

## Prompt 9 — Follow-up and notifications
```text
Doctor can recommend follow-up date/interval, reason, urgency and required tests/documents. Recommendation is not appointment. Model recommended, reminder_scheduled, appointment_requested, appointment_confirmed, rescheduled, completed, missed and cancelled.

Implement timezone-aware scheduling, deduplication, retries, provider adapters for email/SMS/WhatsApp/push only when configured, opt-out where applicable and delivery statuses based on actual provider responses. Do not claim delivery if unknown. Notifications must not expose clinical details on lock screens or SMS. Build patient dashboard for records, appointments, treatment plan, scheme tasks, prescriptions and follow-up; doctor queue for reviews/follow-ups. Hinglish copy must be clear and respectful; maintain terminology glossary and translation structure. Test timezones, duplicate reminders, rescheduling, provider failure, opt-out, sensitive-data leakage and accessibility. Stop after this phase.
```

## Prompt 10 — Admin, integrations and operations
```text
Build tightly permissioned admin tools for roles, doctor/hospital verification, scheme rule versions, integration health, audit search, failed jobs and privacy-safe operational metrics. Admin does not get unrestricted medical-record access by default; break-glass access, if implemented, must be explicitly authorized and audited.

Each integration (identity/ABHA, OCR, AI, storage, teleconsultation, speech-to-text, e-signature, scheme verification, medicine catalogue, notifications, payment evidence) must have an adapter, documented environment variables, timeout/retry/idempotency, error mapping, health/config status, sandbox flag, tests and setup instructions. Unconfigured providers show not_configured/unavailable; never fabricate success.

Add data retention/deletion request workflows consistent with approved policy, backup/restore docs, recovery objectives, deployment runbook, failed-job monitoring, incident response checklist and data-processing map. Logs/analytics must not contain health facts, names, identity numbers, income data, tokens or credentials. Validate production config at startup. Create docs for operational readiness and release gates.
```

## Prompt 11 — End-to-end quality and release gate
```text
Run format, lint, type-check, unit, integration, API contract and end-to-end tests. Fix regressions; do not weaken assertions merely to pass.

End-to-end scenarios:
1. Emergency entry without account.
2. Registration and identity verification.
3. Protected records blocked before verification.
4. Upload and processing status.
5. AI summary with evidence and uncertainty.
6. Patient corrects extracted fact.
7. Provider comparison from configured data.
8. Consent sharing and revocation.
9. Doctor reviews original records.
10. Manual payment evidence and staff confirmation.
11. Treatment plan, patient acceptance/decline.
12. Preliminary scheme match then manual verification.
13. Pending scheme benefit not deducted from liability.
14. Booking blocked when required approval missing.
15. Voice draft -> doctor review -> configured authentication.
16. Exact/partial/no-match medicine comparison.
17. Follow-up recommendation vs separately confirmed appointment.

Security checks: IDOR/BOLA, horizontal/vertical privilege escalation, consent bypass, unauthorized file downloads, rate limiting, unsafe uploads, injection, CSRF/CORS/headers, sensitive logs/errors, secrets in frontend bundles. Inspect loading/error/empty/unauthorized states on every route. Check accessibility, mobile layouts, concurrency, indexes, migrations, backups and dependency vulnerabilities.

Create docs/TEST_REPORT.md, SECURITY_REVIEW.md, CLINICAL_SAFETY_REVIEW.md, DEPLOYMENT_RUNBOOK.md, KNOWN_LIMITATIONS.md and GO_LIVE_CHECKLIST.md. Never claim legal compliance, clinical validation or production readiness solely because tests pass. Identify required external clinical, legal, security, provider and operational reviews.

Report what works end-to-end, exact commands/results, known limitations, unconfigured integrations, blockers, local run/deploy instructions and human approvals needed. Stop after this phase.
```

## Prompt 12 — Use after every phase
```text
Before finishing: inspect diff and remove unrelated changes; run formatting, lint, type-check and relevant tests; fix regressions; verify API-level authorization; check logs/frontend bundles for sensitive data; ensure production has no fake fallback data or fabricated success; update OpenAPI, data models, state machines, environment examples, README and integration register; document migration/rollback; report exact changed files, tests actually run and results, unresolved issues and next phase. Do not claim tests or integrations succeeded unless actually exercised. Stop after this phase; do not silently implement future phases.
```

## Global acceptance checklist
- Emergency is available without login, identity, AI, scheme approval or payment.
- Protected records require verification and server-side authorization.
- Patient ID alone grants no access.
- Consent is scoped, revocable for future access and audited.
- AI facts have provenance and uncertainty; AI cannot diagnose/prescribe/approve surgery/official eligibility.
- No fake production providers, prices, slots, scheme outcomes, payment confirmations, signatures or medicine availability.
- Consultation, treatment recommendation, patient acceptance, scheme approval, booking, treatment, claim settlement, prescription authentication and follow-up booking are distinct states.
- Manual payments are evidence-linked, permissioned and audited.
- Pending scheme benefit is not deducted from estimated patient liability.
- Voice transcription alone cannot finalize prescription.
- Medicine comparison never triggers automatic substitution.
- Sensitive health/identity/income/payment data is not logged.
- Tests cover permissions, failures, concurrency, privacy and patient journey.
- Deployment, integration and operations documentation exists.
