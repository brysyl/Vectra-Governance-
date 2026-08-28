import os

# 1. Ensure a valid index.html exists so static serving never returns a blank page
if not os.path.exists("index.html") or os.path.getsize("index.html") == 0:
    print("🛠️ Creating default index.html...")
    with open("index.html", "w", encoding="utf-8") as f:
        f.write("""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vectra Governance Dashboard</title>
    <style>
        body { font-family: ui-monospace, monospace; background: #090d16; color: #38bdf8; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: #111827; padding: 2.5rem; border-radius: 12px; border: 1px solid #1f2937; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); width: 400px; text-align: center; }
        h2 { margin-top: 0; color: #f3f4f6; }
        p { color: #9ca3af; font-size: 0.9rem; }
    </style>
</head>
<body>
    <div class="card">
        <h2>Vectra Governance</h2>
        <p>Autonomous Cloud Incident Remediation Gateway</p>
        <p style="color: #10b981; font-weight: bold;">● System Operational</p>
    </div>
</body>
</html>""")

# 2. Write a clean, syntactically verified main.py with correct route ordering
pristine_main = '''import os
import sys
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from google import genai

app = FastAPI()

api_key = os.environ.get("GEMINI_API_KEY")
print(f"--> [INIT] GEMINI_API_KEY detected: {bool(api_key)}", flush=True)

if api_key:
    client = genai.Client(api_key=api_key)
    print("--> [INIT] Initialized google-genai via API Key.", flush=True)
else:
    print("--> [INIT] GEMINI_API_KEY missing. Falling back to Vertex AI ADC...", flush=True)
    client = genai.Client(vertexai=True)

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Vectra Governance"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": str(exc)}
    )

# CRITICAL: Mount static files LAST so API routes take precedence
app.mount("/", StaticFiles(directory=".", html=True), name="static")
'''

with open("main.py", "w", encoding="utf-8") as f:
    f.write(pristine_main)

print("✅ main.py and index.html successfully reset and synchronized!")
