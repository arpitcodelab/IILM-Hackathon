import google.generativeai as genai
import os
genai.configure(api_key=os.getenv("GOOGLE_API_KEY", ""))
for m in genai.list_models():
    if "generateContent" in [mt.name if hasattr(mt, 'name') else str(mt) for mt in m.supported_generation_methods]:
        print(f"{m.name}")
