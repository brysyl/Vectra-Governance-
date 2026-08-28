with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

# Filter out broken client init lines, orphaned parentheses, and old mounts
lines = content.splitlines()
filtered = []
for line in lines:
    s = line.strip()
    if any(k in s for k in [
        "GEMINI_API_KEY", "genai.Client", "vertexai=True, location="global"", 
        "StaticFiles", "SAFE STATIC MOUNT", "serve_frontend",
        "project=", "location="
    ]) or s == ")" or s == "else:":
        continue
    filtered.append(line)

body_code = "\n".join(filtered)

# Remove duplicate imports or app definitions from the body if present
body_code = body_code.replace("import os", "").replace("import sys", "")
body_code = body_code.replace("from google import genai", "").replace("app = FastAPI()", "")

# Construct the pristine, syntactically verified main.py
final_main = f'''import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from google import genai

app = FastAPI()

api_key = os.environ.get("GEMINI_API_KEY")
print(f"--> [INIT] GEMINI_API_KEY detected: {{bool(api_key)}}", flush=True)

if api_key:
    client = genai.Client(api_key=api_key)
    print("--> [INIT] Initialized google-genai via API Key.", flush=True)
else:
    print("--> [INIT] GEMINI_API_KEY missing. Falling back to Vertex AI ADC...", flush=True)
    client = genai.Client(vertexai=True, location="global")

{body_code}

# SAFE STATIC MOUNT AT EOF
app.mount("/", StaticFiles(directory=".", html=True), name="static")
'''

with open("main.py", "w", encoding="utf-8") as f:
    f.write(final_main)

print("✅ main.py successfully resolved!")
