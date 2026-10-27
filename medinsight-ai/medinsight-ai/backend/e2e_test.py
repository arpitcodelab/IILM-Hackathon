"""
End-to-end test: submit 2 synthetic medical records and poll until report is generated.
"""
import requests
import time
import json
import sys

BASE = "http://127.0.0.1:8000/api"

# 1. Health check
print("=== Health Check ===")
r = requests.get(f"{BASE}/health")
print(json.dumps(r.json(), indent=2))

# 2. Submit the two sample files
print("\n=== Submitting 2 files for analysis ===")
files = [
    ("files", ("sample_lab_report.txt", open(r"C:\Users\prakh\.gemini\antigravity\scratch\medinsight-ai\backend\tests\test_data\sample_lab_report.txt", "rb"), "text/plain")),
    ("files", ("sample_followup.txt", open(r"C:\Users\prakh\.gemini\antigravity\scratch\medinsight-ai\backend\tests\test_data\sample_followup.txt", "rb"), "text/plain")),
]

r = requests.post(f"{BASE}/analysis", files=files)
if r.status_code not in (200, 202):
    print(f"ERROR: Submit failed with status {r.status_code}: {r.text}")
    sys.exit(1)

data = r.json()
analysis_id = data["analysis_id"]
print(f"Analysis ID: {analysis_id}")

# 3. Poll for status
print("\n=== Polling for status ===")
max_wait = 300  # 5 minutes max
start = time.time()
while time.time() - start < max_wait:
    r = requests.get(f"{BASE}/analysis/{analysis_id}")
    status = r.json()
    state = status["status"]
    detail = status.get("stage_detail", "")
    pct = status.get("progress_pct", 0)
    print(f"  [{pct:3d}%] {state}: {detail}")

    if state == "completed":
        print("\n=== Analysis COMPLETED! ===")
        break
    elif state == "failed":
        print(f"\n=== Analysis FAILED: {status.get('error', 'unknown')} ===")
        sys.exit(1)

    time.sleep(3)
else:
    print("TIMEOUT: Analysis did not complete in 5 minutes")
    sys.exit(1)

# 4. Fetch report
print("\n=== Fetching Report ===")
r = requests.get(f"{BASE}/analysis/{analysis_id}/report")
if r.status_code != 200:
    print(f"ERROR: Report fetch failed: {r.status_code} {r.text}")
    sys.exit(1)

report = r.json()
print(f"Report ID: {report['report_id']}")
print(f"Generated at: {report['generated_at']}")

# Print section summaries
sections = [
    ("executive_summary", "1. Executive Summary"),
    ("patient_overview", "2. Patient Overview"),
    ("document_processing", "3. Document Processing"),
    ("timeline", "4. Timeline Events"),
    ("existing_conditions", "5. Existing Conditions"),
    ("lab_results", "6. Lab Results"),
    ("patterns_and_trends", "7. Patterns & Trends"),
    ("risks", "8. Risks"),
    ("treatment_options", "9. Treatment Options"),
    ("medication_review", "10. Medication Review"),
    ("preventive_care", "11. Preventive Care"),
    ("missing_information", "12. Missing Info"),
    ("doctor_questions", "13. Doctor Questions"),
    ("urgent_findings", "14. Urgent Findings"),
    ("citations", "15. Citations"),
    ("limitations", "16. Limitations"),
]

for key, label in sections:
    val = report.get(key)
    if isinstance(val, str):
        content = val[:200] + "..." if len(val) > 200 else val
        print(f"\n--- {label} ---")
        print(content)
    elif isinstance(val, list):
        print(f"\n--- {label} ({len(val)} items) ---")
        if val and len(val) > 0:
            if isinstance(val[0], dict):
                for item in val[:2]:
                    print(f"  • {json.dumps(item, default=str)[:150]}")
            else:
                for item in val[:3]:
                    print(f"  • {str(item)[:150]}")
    elif isinstance(val, dict):
        print(f"\n--- {label} ---")
        print(json.dumps(val, default=str, indent=2)[:300])

# 5. Test PDF download
print("\n\n=== Testing PDF Download ===")
r = requests.get(f"{BASE}/analysis/{analysis_id}/report.pdf")
if r.status_code == 200:
    pdf_size = len(r.content)
    print(f"PDF downloaded successfully: {pdf_size} bytes")
    # Save it for inspection
    with open(r"C:\Users\prakh\.gemini\antigravity\scratch\medinsight-ai\test_report.pdf", "wb") as f:
        f.write(r.content)
    print("Saved to test_report.pdf")
else:
    print(f"PDF download failed: {r.status_code}")

print("\n=== Disclaimer ===")
print(report.get("disclaimer", "N/A")[:300])

print("\n\n[SUCCESS] END-TO-END TEST COMPLETE")
