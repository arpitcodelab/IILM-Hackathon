# MedInsight AI — Quick Start Guide

## 1. API Key Location
Your Gemini API key is stored in this file:
```
C:\Users\prakh\.gemini\antigravity\scratch\medinsight-ai\.env
```
Line 3:
```ini
GOOGLE_API_KEY=your_gemini_api_key_here
```
*(To change it, open `.env` and replace this value).*

---

## 2. Commands to Run

### Command 1 (Terminal 1 — Backend):
```cmd
cd C:\Users\prakh\.gemini\antigravity\scratch\medinsight-ai\backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Command 2 (Terminal 2 — Frontend):
```cmd
cd C:\Users\prakh\.gemini\antigravity\scratch\medinsight-ai\frontend && npx vite --host 127.0.0.1 --port 5173
```

### Command 3 (Open in Browser):
Go to: **http://127.0.0.1:5173/**
