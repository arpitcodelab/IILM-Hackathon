import google.generativeai as genai
import os
genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))
print("=== Embed models ===")
for m in genai.list_models():
    methods = [str(mt) for mt in m.supported_generation_methods]
    if any("embed" in mt.lower() for mt in methods):
        print(f"  {m.name}")
print("\n=== All generateContent models (first 10) ===")
count = 0
for m in genai.list_models():
    methods = [str(mt) for mt in m.supported_generation_methods]
    if "generateContent" in methods and count < 10:
        print(f"  {m.name}")
        count += 1
