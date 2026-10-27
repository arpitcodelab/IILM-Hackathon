import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from llm_client import generate_text, generate_json, embed_text

print("=== Testing LLM (generate_text) ===")
try:
    r = generate_text("Say: 'MedInsight AI is working.' exactly.")
    print(f"  OK: {r.strip()}")
except Exception as e:
    print(f"  FAIL: {e}")

print("\n=== Testing JSON generation ===")
try:
    r = generate_json(
        'Extract: {"name":"John Doe","age":"45","condition":"Diabetes"}',
        system_instruction="Return valid JSON only."
    )
    print(f"  OK: {r}")
except Exception as e:
    print(f"  FAIL: {e}")

print("\n=== Testing Embedding ===")
try:
    v = embed_text("diabetes hypertension treatment")
    print(f"  OK: dim={len(v)}, first3={[round(x,4) for x in v[:3]]}")
except Exception as e:
    print(f"  FAIL: {e}")
