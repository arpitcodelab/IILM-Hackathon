"""
Test suite for FastAPI API routes in MedInsight AI.
"""

import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_api():
    print("--- 1. Testing GET /api/health ---")
    resp = client.get("/api/health")
    assert resp.status_code == 200, resp.text
    data = resp.json()
    print("Health response:", data)
    assert data["status"] == "healthy"
    assert "vector_store" in data["services"]

    print("\n--- 2. Testing POST /api/analysis with document upload ---")
    file_content = b"""PATIENT CLINICAL SUMMARY:
Patient: John Smith, Age 62, Male. Blood Group: O+
Diagnoses:
- Essential Hypertension, diagnosed 2021
- Type 2 Diabetes Mellitus, diagnosed 2020
Medications:
- Lisinopril 20mg once daily
- Metformin 500mg twice daily
Lab Results:
- HbA1c: 7.8 % (Ref: 4.0 - 5.6, High)
- Serum Creatinine: 1.2 mg/dL (Ref: 0.7 - 1.3, Normal)
- Blood Pressure: 142/88 mmHg
Allergies:
- Aspirin (causes severe facial swelling)
"""
    files = [
        ("files", ("patient_chart.txt", file_content, "text/plain"))
    ]
    resp = client.post("/api/analysis", files=files)
    assert resp.status_code == 202, resp.text
    submit_data = resp.json()
    print("Submit response:", submit_data)
    analysis_id = submit_data["analysis_id"]
    assert analysis_id.startswith("ANL-")

    print("\n--- 3. Polling GET /api/analysis/{id} ---")
    for _ in range(30):
        resp = client.get(f"/api/analysis/{analysis_id}")
        assert resp.status_code == 200, resp.text
        status_data = resp.json()
        print(f"Status: {status_data['status']} ({status_data['progress_pct']}%) - {status_data['stage_detail']}")
        if status_data["status"] in ("completed", "failed"):
            break
        time.sleep(0.5)

    assert status_data["status"] == "completed", f"Analysis ended with status: {status_data['status']}"

    print("\n--- 4. Testing GET /api/analysis/{id}/report ---")
    resp = client.get(f"/api/analysis/{analysis_id}/report")
    assert resp.status_code == 200, resp.text
    report = resp.json()
    print(f"Report ID: {report['report_id']}")
    print(f"Executive Summary preview: {report['executive_summary'][:80]}...")
    assert len(report["executive_summary"]) > 20
    assert len(report["doctor_questions"]) > 0
    assert len(report["disclaimer"]) > 50

    print("\n--- 5. Testing GET /api/analysis/{id}/report.pdf ---")
    resp = client.get(f"/api/analysis/{analysis_id}/report.pdf")
    assert resp.status_code == 200, resp.text
    assert resp.headers["content-type"] == "application/pdf"
    assert len(resp.content) > 1000
    print(f"PDF download successful: {len(resp.content)} bytes")

    print("\n--- 6. Testing GET /api/analysis/{id}/report.html ---")
    resp = client.get(f"/api/analysis/{analysis_id}/report.html")
    assert resp.status_code == 200, resp.text
    assert "text/html" in resp.headers["content-type"]
    assert "<!DOCTYPE html>" in resp.text
    print(f"HTML view successful: {len(resp.text)} chars")

    print("\n==========================================")
    print(">>> ALL API ROUTE TESTS PASSED! <<<")
    print("==========================================")


if __name__ == "__main__":
    test_api()
