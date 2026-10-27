# MediBridge AI — Technical Requirements Document (TRD)

**Version:** 1.0  
**Status:** Proposed technical baseline  
**Date:** 27 October 2026

## 1. Purpose

Define implementation-level requirements for a MERN application with React + Vite + SCSS, Node.js + Express, MongoDB, private file storage, and modular AI/integration services. This document is a target design; first audit the existing repository before migration or refactoring.

## 2. Target Stack

### Frontend
- React with TypeScript preferred.
- Vite for development/build.
- SCSS modules or a documented SCSS architecture.
- React Router for route-level navigation.
- TanStack Query or equivalent for server-state fetching, caching and invalidation.
- React Hook Form + Zod or equivalent for validated forms.
- Accessible component primitives; Lucide React or React Icons.
- Vitest + React Testing Library; Playwright for end-to-end tests.

### Backend
- Supported Node.js LTS release.
- Express with TypeScript preferred.
- Zod/Joi or equivalent request validation.
- Mongoose or official MongoDB driver; choose one consistently.
- OpenAPI specification for REST API contracts.
- Pino or equivalent structured logging.
- Pino redaction/allowlist; never log sensitive payloads.
- Jest or Vitest for unit/integration tests; Supertest for HTTP tests.

### Data and infrastructure
- MongoDB for application metadata and domain entities.
- Private object storage for medical documents; local-only private storage may be used for development.
- Redis/managed queue only if async jobs need it; otherwise begin with a persistent job model and worker process.
- Environment configuration validated at startup.
- Docker Compose for local development where useful.
- CI pipeline for lint, typecheck, tests and build.

## 3. Architectural Style

Start as a **modular monolith** with domain modules and a single versioned API. Avoid microservices until scaling or ownership requires them. Separate domain logic from Express route handlers and external provider adapters.

Recommended backend layout:

```text
server/
  src/
    app.ts
    server.ts
    config/
    middleware/
      authenticate.ts
      authorize.ts
      validate.ts
      errorHandler.ts
      rateLimit.ts
    modules/
      auth/
      users/
      patients/
      medical-records/
      ai-summaries/
      providers/
      hospitals/
      pricing/
      consent/
      consultations/
      treatment-plans/
      schemes/
      prescriptions/
      medicines/
      follow-ups/
      notifications/
      audit/
    integrations/
      ai/
      abdm/
      hospitals/
      schemes/
      medicine-catalogue/
      video/
      payments/
      notifications/
    jobs/
    shared/
      errors/
      ids/
      pagination/
      security/
      types/
    tests/
  openapi/
```

Recommended frontend layout:

```text
client/
  src/
    app/
      router/
      providers/
    api/
      client.ts
      contracts/
      queryKeys.ts
    components/
      ui/
      layout/
      feedback/
    features/
      auth/
      patient-dashboard/
      medical-records/
      ai-summary/
      provider-search/
      cost-comparison/
      consent/
      consultations/
      doctor-workspace/
      treatment-plans/
      schemes/
      prescriptions/
      medicines/
      follow-ups/
      emergency/
    hooks/
    styles/
      _tokens.scss
      _mixins.scss
      _utilities.scss
      global.scss
    types/
    test/
```

## 4. Environments and Configuration

Use `.env.example` with placeholder values only. Never commit secrets.

Suggested variables:
- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `SESSION_SECRET` or identity-provider configuration
- `APP_ORIGIN`
- `API_BASE_URL`
- `PRIVATE_STORAGE_PROVIDER`
- `PRIVATE_STORAGE_BUCKET`
- `PRIVATE_STORAGE_ACCESS_KEY`
- `PRIVATE_STORAGE_SECRET_KEY`
- `AI_PROVIDER`
- `AI_API_KEY`
- `AI_MODEL`
- `LOG_LEVEL`
- `RATE_LIMIT_*`
- provider-specific integration credentials

Frontend variables prefixed with `VITE_` are public and must never contain secrets. Validate required environment variables at server startup. Separate development, test, staging and production credentials.

## 5. API Conventions

- Prefix endpoints with `/api/v1`.
- Use JSON for ordinary API payloads; use multipart upload endpoints for files.
- Use consistent error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please review the highlighted fields.",
    "requestId": "req_example",
    "details": []
  }
}
```

- Never return stack traces or internal secrets to clients.
- Use pagination (`limit`, cursor/page token) for large lists.
- Use ISO 8601 UTC timestamps and explicit timezone handling for appointments.
- Validate every request body, query parameter and route parameter.
- Define idempotency behavior for booking/payment operations.
- Add correlation/request IDs.
- Use optimistic concurrency/version fields for records where conflicting edits matter.
- Return `202 Accepted` for long-running AI/document jobs and expose job status.

## 6. Proposed API Surface

The exact contract must be published in OpenAPI and versioned. This is a proposed baseline, not a claim that these routes currently exist.

### Authentication and profile
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `GET /api/v1/patients/me`
- `PATCH /api/v1/patients/me`

### Medical records and summaries
- `POST /api/v1/patients/me/documents`
- `GET /api/v1/patients/me/documents`
- `GET /api/v1/patients/me/documents/:documentId`
- `DELETE /api/v1/patients/me/documents/:documentId` (subject to retention/legal policy)
- `POST /api/v1/patients/me/documents/:documentId/summary-jobs`
- `GET /api/v1/patients/me/summary-jobs/:jobId`
- `GET /api/v1/patients/me/summaries`
- `GET /api/v1/patients/me/summaries/:summaryId`

### Providers and costs
- `GET /api/v1/hospitals`
- `GET /api/v1/hospitals/:hospitalId`
- `GET /api/v1/doctors`
- `GET /api/v1/doctors/:doctorId`
- `GET /api/v1/treatment-packages`
- `GET /api/v1/treatment-packages/:packageId`
- `POST /api/v1/cost-comparisons`

### Consent and clinician sharing
- `POST /api/v1/consents`
- `GET /api/v1/consents`
- `POST /api/v1/consents/:consentId/revoke`
- `GET /api/v1/doctor/assigned-patients`
- `GET /api/v1/doctor/patients/:patientId/shared-records`

### Consultations and plans
- `POST /api/v1/consultations`
- `GET /api/v1/consultations`
- `PATCH /api/v1/consultations/:consultationId`
- `POST /api/v1/treatment-plans`
- `GET /api/v1/treatment-plans/:planId`
- `POST /api/v1/treatment-plans/:planId/approve`
- `POST /api/v1/treatment-plans/:planId/accept`

### Schemes
- `GET /api/v1/schemes`
- `GET /api/v1/schemes/:schemeId`
- `POST /api/v1/scheme-assessments`
- `GET /api/v1/scheme-assessments/:assessmentId`
- `POST /api/v1/scheme-assessments/:assessmentId/documents`
- `POST /api/v1/scheme-assessments/:assessmentId/verification-requests` (only if a real workflow exists)
- `PATCH /api/v1/scheme-assessments/:assessmentId/status` (restricted to authorized workflow actors)

### Prescriptions and follow-up
- `POST /api/v1/prescriptions/drafts`
- `PATCH /api/v1/prescriptions/:prescriptionId`
- `POST /api/v1/prescriptions/:prescriptionId/finalize`
- `GET /api/v1/prescriptions`
- `GET /api/v1/medicine-matches`
- `POST /api/v1/follow-ups`
- `GET /api/v1/follow-ups`
- `PATCH /api/v1/follow-ups/:followUpId`

### Emergency
- `GET /api/v1/emergency/facilities?lat=...&lng=...` (location optional; validate and minimize)
- Emergency public landing content should remain available even if this endpoint fails.

### Operations
- `GET /health/live`
- `GET /health/ready`
- `GET /api/v1/admin/audit-events` (strictly permissioned)

## 7. Data Model Requirements

Use schema validation, indexes and explicit ownership relationships. Store medical files outside MongoDB where feasible; MongoDB holds metadata and a private storage key.

### User
- `_id`
- `email` and/or verified phone
- `passwordHash` only if local auth is used
- `roles[]`
- `status`
- `createdAt`, `updatedAt`
- `authProvider` / external subject if applicable

### PatientProfile
- `_id`
- `userId`
- `patientId` (unique, non-sequential or otherwise resistant to enumeration)
- `displayName`
- `dateOfBirth` only if necessary
- `state`, `district`, `preferredLanguage`
- `abhaLinkStatus` and external references only when integration exists; avoid storing unnecessary sensitive identifiers
- `createdAt`, `updatedAt`

### MedicalDocument
- `_id`, `patientId`, `uploadedBy`
- `category`, `displayName`, `originalFilenameSanitized`
- `storageKey`, `mimeType`, `sizeBytes`, `checksum`
- `documentDate` (nullable), `uploadedAt`
- `sourceType`, `processingStatus`, `extractionStatus`
- `retentionState`, `createdAt`, `updatedAt`

### AISummary
- `_id`, `patientId`, `documentIds[]`
- `summaryText`, `structuredFindings[]`
- each finding includes `text`, `sourceDocumentId`, `page`, `sourceExcerpt` where safe, `kind`, `confidence/uncertainty`
- `limitations[]`, `conflicts[]`, `missingContext[]`
- `modelProvider`, `modelVersion`, `promptVersion`, `createdAt`
- Do not use a confidence score as proof of clinical correctness.

### ConsentGrant
- `_id`, `patientId`, `recipientUserId`
- `recordIds[]` or explicit scope selector
- `purpose`, `grantedAt`, `expiresAt`, `revokedAt`
- `status`, `createdBy`, `policyVersion`
- access events stored separately in audit records

### DoctorProfile / Hospital / TreatmentPackage
- verification state, source, verifiedAt, updatedAt
- fees and currency where relevant
- package inclusions/exclusions, assumptions and estimate/confirmed status
- never store an unqualified “verified” flag without provenance

### Consultation
- `_id`, `patientId`, `doctorId`, `hospitalId` optional
- `mode`, `requestedSlot`, `confirmedSlot`, `feeSnapshot`
- `status`, `cancellationPolicySnapshot`, `createdAt`, `updatedAt`

### TreatmentPlan
- `_id`, `patientId`, `doctorId`, `consultationId`
- `recommendations[]`, `procedure`, `rationale`, `status`
- `authoredAt`, `approvedAt`, `authenticationReference`
- versioning and audit metadata

### Scheme and SchemeAssessment
Scheme:
- jurisdiction, name, official source, effective date, version, beneficiary rules, document checklist, treatment/package coverage references, exclusions, verification steps, lastReviewedAt, owner.

Assessment:
- patient reference, scheme version, relevant inputs, rule evaluation output, missing information, result state, official verification evidence, status history.
- Keep income documents private and separate from routine clinical record access.

### Prescription
- patient, doctor, treatment plan
- structured medication fields
- `status: draft | pending_review | finalized | cancelled`
- authored/updated/finalized timestamps
- authentication/signature reference
- version history
- no finalization by an unauthenticated or unauthorized actor

### AuditEvent
- actor, action, resource type/id, patient reference where appropriate, timestamp, purpose, request ID, result
- do not log report text, income certificate content, passwords, tokens or unnecessary PII

## 8. Authorization Model

Use deny-by-default authorization. Example high-level policy:

| Resource | Patient | Treating doctor | Coordinator | Admin |
|---|---|---|---|---|
| Own profile | Read/write permitted fields | No | Assigned fields only | Support fields only |
| Medical document | Own records | Only authorized shared scope | Only explicitly assigned minimum scope | No default clinical access |
| Income certificate | Own | No default access | Only if task requires and explicitly authorized | No default access |
| Treatment plan | Read own | Create/update own authored plans | Status visibility if assigned | Audit/config only |
| Prescription | Read own finalized | Draft/finalize within authority | No clinical editing | No default access |
| Scheme assessment | Own | Only necessary information if authorized | Assigned assistance workflow | Config/audit by permission |
| Audit events | Own consent/share history where exposed | Own relevant access history if permitted | Task-related events only | Strictly permissioned audit role |

Every route must verify actor identity, role, patient relationship, consent scope, expiry/revocation and resource ownership as applicable. Never trust `patientId`, `role`, `doctorId` or ownership fields sent by the client without server verification.

## 9. AI and Document Processing Pipeline

1. Upload request validates type/size and stores file privately.
2. Create `MedicalDocument` metadata and asynchronous processing job.
3. Virus/content scanning where infrastructure supports it.
4. Extract text using PDF parser/OCR adapter.
5. Store extraction status and safe metadata.
6. Normalize into source-linked chunks; preserve page numbers where available.
7. Call configured AI provider with minimum necessary data and approved retention settings.
8. Require structured output conforming to schema.
9. Validate that cited document IDs/pages exist.
10. Store summary version and model/prompt metadata.
11. Return source-linked output with uncertainty and limitations.
12. On failure, preserve original upload and expose retry/review state.

AI safety constraints:
- No autonomous diagnosis, prescription or surgery decision.
- No claim that unavailable data was retrieved.
- No inference of allergies from silence; show “not documented” if absent.
- Do not make emergency care conditional on AI output.
- Medical content should be handled under approved privacy/data-processing terms.

## 10. Scheme Rules Engine

Do not use a general-purpose LLM as the sole eligibility decision-maker. Use deterministic rule evaluation for known, structured criteria, with AI limited to explanation, document classification and navigation assistance.

Each rule should have:
- scheme ID and version;
- jurisdiction and effective dates;
- input schema;
- rule logic and exclusions;
- required documents;
- official source;
- expected verification process;
- update owner and last-reviewed timestamp.

Output:
- possible match / no match / insufficient information;
- criteria met/not met/unknown;
- missing documents;
- source and version;
- explicit disclaimer that preliminary assessment is not official approval.

Eligibility, hospital empanelment, treatment/package coverage, preauthorization and claim settlement are separate states.

## 11. File Storage and Upload Security

- Private bucket; no public read ACL.
- Short-lived signed URLs or authenticated download proxy after server authorization.
- Generate storage keys; do not use user-supplied filenames as storage paths.
- Validate actual file type and limit size/page count.
- Sanitize filenames for display.
- Consider malware scanning and decompression-bomb protection.
- Do not embed document contents in logs.
- Define retention, deletion, backup and legal-hold behavior before production.
- Encrypt in transit and at rest using deployment-supported controls.

## 12. Security Requirements

- HTTPS in deployed environments.
- Secure, HTTP-only, SameSite cookies if cookie sessions are selected; CSRF protections as appropriate.
- If bearer tokens are used, document rotation, revocation and browser storage strategy; avoid long-lived tokens in localStorage when possible.
- Strong password hashing if local passwords are supported.
- Rate-limit login, upload, AI and sensitive endpoints.
- Validate all inputs and encode outputs.
- Use parameterized database operations and avoid unsafe dynamic query construction.
- CORS allowlist, security headers and request-size limits.
- Secrets managed outside source control.
- Audit access to sensitive resources.
- Restrict admin permissions and require stronger authentication where feasible.
- Dependency scanning and patch process.
- Threat model for cross-patient access, malicious uploads, prompt injection inside medical files, data leakage to AI providers and account takeover.

## 13. Frontend Data Requirements

- One centralized API client; no direct fetch logic scattered through components.
- Server state via query/cache layer with explicit invalidation.
- No hardcoded hospitals, doctors, patient records, scheme results, prices, appointments or dashboard statistics in production UI.
- Static UI labels, design tokens and safe feature configuration may be in frontend code.
- Test fixtures live in test-only directories and are never imported by production components.
- API failure displays error/empty state; it must not silently fall back to demo data.
- Clearly label seeded demo content when the application is in demo mode.

## 14. Testing Strategy

### Unit
- Validation schemas, rules engine, pricing calculations, status transitions, access policy.

### Integration
- API + MongoDB repositories, document metadata, consent grants, scheme assessments and booking state.

### Security/authorization
- Cross-patient access denied.
- Doctor without consent cannot read document.
- Expired/revoked consent denied.
- Coordinator cannot finalize prescription.
- Patient cannot finalize doctor's plan.
- Patient ID enumeration does not reveal records.
- Upload rejects unsupported/oversized content.

### AI evaluation
- Source references valid.
- No unsupported medical claims in curated test cases.
- Missing allergy information is not interpreted as no allergies.
- Conflicting data is surfaced.
- OCR errors are flagged.
- Prompt injection in uploaded documents is treated as untrusted document content.

### Frontend/E2E
- Registration, upload, summary, provider search, consent, booking, doctor review, scheme checklist, prescription and follow-up.
- Loading, empty, stale, error and partial-data states.
- Keyboard-only navigation and responsive viewport tests.

## 15. Observability and Operations

- Structured logs with request IDs.
- Metrics for request latency, error rate, upload failures, processing queue depth and integration health.
- Redact sensitive values.
- Readiness and liveness endpoints.
- Alerts for repeated authorization failures, failed background jobs and integration outages.
- Backup and restore testing for database and document storage.
- Document operational runbooks and incident response.

## 16. Migration from Python Backend

Do not replace the Python backend in one untested cutover.

1. Inventory existing routes, schemas, authentication, business logic, AI processing, jobs and tests.
2. Create a route/data mapping between current backend and target Express API.
3. Decide which Python functionality is being ported and which external AI/OCR tools remain provider adapters.
4. Create MongoDB schema/index plan and data migration/backup strategy.
5. Implement Node routes behind a feature flag or separate environment.
6. Port behavior with contract tests, preserving business rules.
7. Run parallel comparison on synthetic data where appropriate.
8. Migrate data with validation and reconciliation reports.
9. Switch traffic gradually and maintain rollback plan.
10. Remove old services only after parity, backups, monitoring and stakeholder sign-off.

Do not assume Python-specific dependencies have direct Node equivalents. Keep AI/OCR integration boundaries explicit.

## 17. Definition of Technical Done

- Typecheck/lint/build pass.
- API contract updated.
- Unit/integration/authorization tests pass.
- No secrets in repository.
- No production hardcoded business data.
- Loading/error/empty states implemented.
- Audit and consent rules enforced.
- Source/freshness metadata shown for external facts.
- Accessibility checks run.
- Logs contain no sensitive payloads.
- Deployment and rollback instructions updated.
