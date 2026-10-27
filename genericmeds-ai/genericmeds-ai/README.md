# GenericMeds AI (India)

**AI-Powered Generic Medicine Discovery, Active Ingredient Equivalence, and Price Comparison Platform**

---

## 1. Project Purpose & Mission

**GenericMeds AI** is designed to help middle-class and low-income Indian families discover affordable generic medicines, understand their active ingredients, compare verified medicine prices, and locate generic alternatives listed under the **Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)** and **National Pharmaceutical Pricing Authority (NPPA)** ceiling price orders.

### What GenericMeds AI Does:
- **Exact Composition Equivalence Matching**: Matches medicines only when active ingredients, strengths, dosage forms, routes of administration, and release profiles (e.g., immediate-release vs. sustained-release) match identically.
- **Price Comparison & Savings Calculator**: Automatically normalizes pack sizes (e.g., 10 tablets vs. 15 tablets) and computes exact unit savings and percentage savings against Maximum Retail Prices (MRP) and government-listed prices.
- **Jan Aushadhi Discovery**: Directly indexes formulations supplied through PMBI Jan Aushadhi Kendras.
- **Bilingual Grounded Medical Explanations**: Explains medical terms in simple English and Hindi (हिंदी).
- **Clinical Safety Guardrails**: Strictly flags high-risk drugs (insulin, warfarin, carbamazepine, injectables), prevents unsafe prescription changes, halts on emergency symptoms, and provides mandatory disclaimers.

> [!IMPORTANT]
> **Medical Disclaimer:** This tool is an informational and affordability discovery platform, **NOT** a doctor, diagnostic system, or prescription generator. Never start, stop, or substitute a prescribed medicine without consulting a qualified physician or licensed pharmacist.

---

## 2. System Architecture

The platform follows a modular, decoupled architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  Interactive UI (Tailwind/HTML5) & REST API Clients / Mobile│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                  FastAPI Application (app/main.py)          │
│  Routes: /health, /medicines, /alternatives, /prices, /chat │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
┌──────▼─────────────┐ ┌───────▼─────────────┐ ┌───────▼─────────────┐
│  Search & Equiv.   │ │   Price Comparator  │ │  Safety & Triage    │
│  Service           │ │   Service           │ │  Service            │
│  (MedicineSearch & │ │  (Unit normalization│ │  (Emergency triage,│
│   Alternatives)    │ │   & Stale tracking) │ │   High-risk flags)  │
└──────┬─────────────┘ └───────┬─────────────┘ └───────┬─────────────┘
       │                       │                       │
┌──────▼───────────────────────▼───────────────────────▼──────┐
│                    Data & Persistence Layer                 │
│   SQLAlchemy ORM (SQLite for Dev, PostgreSQL for Prod)      │
│   Entities: MedicineProduct, ActiveIngredient, Price, Source│
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│               Configurable AI / LLM Provider                │
│    Google Gemini API (httpx REST client) / Fallback Engine   │
│             System Prompt & Medical Grounding               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Project Structure

```
genericmeds-ai/
├── app/
│   ├── main.py                     # FastAPI application setup, middleware, static mount
│   ├── core/
│   │   ├── config.py               # Pydantic BaseSettings & environment loader
│   │   ├── database.py             # SQLAlchemy engine & session dependency
│   │   └── security.py             # Administrative API key authentication
│   ├── models/
│   │   ├── ingredient.py           # ActiveIngredient & ProductIngredient models
│   │   ├── medicine.py             # MedicineProduct model
│   │   ├── pricing.py              # MedicinePrice model
│   │   └── source.py               # DataSource registry model
│   ├── schemas/
│   │   ├── chat.py                 # Chat request & grounded response schemas
│   │   ├── medicine.py             # Medicine product & alternative schemas
│   │   ├── pricing.py              # Price comparison request & item schemas
│   │   └── source.py               # Data source & admin import schemas
│   ├── api/
│   │   └── routes/
│   │       ├── admin.py            # Admin catalog import endpoints
│   │       ├── alternatives.py     # Generic alternative search endpoints
│   │       ├── chat.py             # AI conversational assistant endpoints
│   │       ├── health.py           # Health & readiness check endpoints
│   │       ├── medicines.py        # Medicine search & detail endpoints
│   │       ├── pricing.py          # Price comparison endpoints
│   │       └── sources.py          # Statutory data sources list
│   ├── services/
│   │   ├── alternatives.py         # Multi-attribute clinical equivalence engine
│   │   ├── data_ingestion.py       # Catalog validation & normalization engine
│   │   ├── medicine_search.py      # Exact & partial search service
│   │   ├── price_comparison.py     # Unit price normalizer & savings calculator
│   │   ├── safety_validation.py    # Emergency detection & high-risk flagger
│   │   └── source_verification.py  # Source synchronization tracking
│   ├── ai/
│   │   ├── llm_service.py          # Configurable LLM provider (Gemini + Offline fallback)
│   │   └── system_prompt.py        # Strict medical safety prompt & disclaimer
│   ├── static/
│   │   └── index.html              # Modern, responsive single-page web UI
│   └── tests/
│       ├── conftest.py             # In-memory test fixtures & database seeding
│       ├── test_alternatives.py    # Equivalence & combination matching tests
│       ├── test_chat.py            # Chat & language localization tests
│       ├── test_data_ingestion.py  # Malformed CSV & admin auth tests
│       ├── test_health.py          # Health status tests
│       ├── test_medicine_search.py # Brand, generic & ingredient search tests
│       ├── test_price_comparison.py# Savings calculation & stale price tests
│       └── test_safety.py          # Emergency triage & high-risk tests
├── data/
│   └── imports/
│       ├── branded_medicines_sample.csv   # Verified branded MRP catalogue
│       └── pmbi_jan_aushadhi_sample.csv   # Verified PMBI Jan Aushadhi catalogue
├── scripts/
│   ├── import_medicines.py         # CLI tool for custom CSV/Excel imports
│   └── seed_db.py                  # Initial database seeding script
├── .env.example                    # Environment variable template
├── .gitignore                      # Git exclusion rules
├── pytest.ini                      # Pytest runner configuration
├── requirements.txt                # Production dependencies
└── README.md                       # Comprehensive guide
```

---

## 4. Prerequisites

- **Python 3.11+** installed (check using `python3 --version` or `/opt/homebrew/bin/python3.11 --version` on macOS)
- **Git**
- Optional: PostgreSQL 14+ for production deployments

---

## 5. Installation & Setup Instructions

### Step 1: Clone or Navigate to the Workspace Directory
```bash
cd /Users/rohitverma/.gemini/antigravity/scratch/genericmeds-ai
```

### Step 2: Create a Python 3.11 Virtual Environment
```bash
python3.11 -m venv .venv
source .venv/bin/activate
```

### Step 3: Install Required Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables
Copy the `.env.example` template:
```bash
cp .env.example .env
```

Review or modify `.env`:
```ini
DATABASE_URL=sqlite:///./genericmeds.db
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
LLM_MODEL=gemini-1.5-flash
ADMIN_API_KEY=genericmeds-admin-key-supersecret-change-in-production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000
ENVIRONMENT=development
LOG_LEVEL=INFO
PRICE_STALE_DAYS=90
```
> *Note: If `GEMINI_API_KEY` is not provided or set to `mock`, GenericMeds AI automatically activates its deterministic fallback engine, maintaining 100% of search, equivalence, and price comparison features without crashing.*

### Step 5: Seed the Database with Verified Formulations
Run the database seeder to initialize tables and import the official PMBI Jan Aushadhi and branded market catalogues:
```bash
python scripts/seed_db.py
```

### Step 6: Start the FastAPI Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 6. Accessing the Application

- **Web User Interface**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Technical Specification**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check Endpoint**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 7. Example `curl` API Requests

### 1. Health Status
```bash
curl -s http://127.0.0.1:8000/health
```

### 2. Search Medicines by Name, Ingredient, or Brand
```bash
# Search for Dolo 650
curl -s "http://127.0.0.1:8000/api/v1/medicines/search?q=Dolo%20650"

# Search for Amoxicillin products in Jan Aushadhi only
curl -s "http://127.0.0.1:8000/api/v1/medicines/search?q=Amoxicillin&jan_aushadhi_only=true"
```

### 3. Discover Verified Generic Alternatives
```bash
# Find exact active ingredient alternatives for Augmentin 625 Duo (medicine ID: 18)
curl -s -X POST "http://127.0.0.1:8000/api/v1/alternatives/search" \
  -H "Content-Type: application/json" \
  -d '{"name": "Augmentin 625 Duo"}'
```

### 4. Compare Verified Prices & Calculate Savings
```bash
# Compare branded Augmentin 625 Duo with Jan Aushadhi Amoxyclav 625
curl -s -X POST "http://127.0.0.1:8000/api/v1/prices/compare" \
  -H "Content-Type: application/json" \
  -d '{
    "product_ids": [18, 3],
    "reference_product_id": 18
  }'
```

### 5. Chat with GenericMeds AI (English & Hindi)
```bash
# English Query
curl -s -X POST "http://127.0.0.1:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the generic alternative to Augmentin 625 Duo?",
    "language": "en"
  }'

# Hindi Query
curl -s -X POST "http://127.0.0.1:8000/api/v1/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Dolo 650 का जेनेरिक विकल्प और मूल्य बताएं",
    "language": "hi"
  }'
```

### 6. Admin Catalog Import
```bash
curl -s -X POST "http://127.0.0.1:8000/api/v1/admin/import-medicines" \
  -H "X-Admin-Key: genericmeds-admin-key-supersecret-change-in-production" \
  -F "file=@data/imports/pmbi_jan_aushadhi_sample.csv" \
  -F "source_name=PMBI Jan Aushadhi (PMBJP)"
```

---

## 8. Running the Automated Test Suite

The test suite covers 29 comprehensive test cases verifying exact ingredient matching, combination formulation validation, release type checks, savings mathematics, emergency triage, and security authentication.

Run pytest:
```bash
PYTHONPATH=. pytest -v
```

---

## 9. Official Data Sources & Verification Workflow

GenericMeds AI integrates official Indian medicine data:

1. **PMBI Jan Aushadhi (PMBJP)**:
   - Official product portal: [https://www.pmbi.co.in/ProductList.aspx](https://www.pmbi.co.in/ProductList.aspx)
   - Store Locator: [https://janaushadhi.gov.in/](https://janaushadhi.gov.in/)
2. **NPPA Pharma Sahi Daam**:
   - Ceiling Price Search: [https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine](https://nppaipdms.gov.in/NPPA/PharmaSahiDaam/searchMedicine)
3. **CDSCO Drug Approvals**:
   - Central Drug Standard Control Organisation: [https://www.cdscoonline.gov.in/CDSCO/cdscoDrugs](https://www.cdscoonline.gov.in/CDSCO/cdscoDrugs)

### Real-World Data Note:
Official Indian government medicine portals employ anti-scraping CAPTCHAs and do not expose unauthenticated public REST endpoints for high-throughput transactional queries. As mandated by healthcare data architecture best practices, GenericMeds AI uses an **administrator-controlled CSV/Excel ingestion pipeline** with cryptographic validation, deduplication, and timestamps, preventing corrupted or fabricated prices from entering the system.

---

## 10. Production Deployment Guide

1. **Database Migration to PostgreSQL**:
   Update `.env`:
   ```ini
   DATABASE_URL=postgresql://genericmeds_user:strong_password@db-host:5432/genericmeds_db
   ```
2. **Production ASGI Server**:
   Run with Gunicorn + Uvicorn workers:
   ```bash
   gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
   ```
3. **Reverse Proxy (Nginx)**:
   Place Nginx in front of Gunicorn with SSL/TLS termination, HTTP/2, and rate-limiting on `/api/v1/chat` and `/api/v1/admin/import-medicines`.
4. **Environment Isolation**:
   Change `ADMIN_API_KEY` to a 64-character random token and restrict CORS origins to authorized frontend domains.
