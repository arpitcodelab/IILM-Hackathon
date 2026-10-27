import google.generativeai as genai
import os
import warnings
warnings.filterwarnings("ignore")

API_KEY = os.getenv("GOOGLE_API_KEY", "")
genai.configure(api_key=API_KEY)

# Test gemini-3.8-flash chat
print("Testing gemini-3.8-flash...")
try:
    model = genai.GenerativeModel("gemini-3.8-flash")
    r = model.generate_content("Say hello in one word.")
    print(f"  OK: {r.text.strip()}")
except Exception as e:
    print(f"  FAIL: {e}")

# Test embedding model
print("\nTesting gemini-embedding-001...")
try:
    r = genai.embed_content(model="models/gemini-embedding-001", content="diabetes hypertension", task_type="retrieval_query")
    emb = r.get("embedding", [])
    print(f"  OK: embedding dim={len(emb)}, first3={emb[:3]}")
except Exception as e:
    print(f"  FAIL: {e}")
