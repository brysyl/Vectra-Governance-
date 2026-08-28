with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

# Filter out messy remnants of old client initializations and static mounts
lines = content.splitlines()
clean_lines = []
for line in lines:
    stripped = line.strip()
    if any(k in stripped for k in [
        "GEMINI_API_KEY", "genai.Client", "vertexai=True, location="global"", 
        "StaticFiles", "SAFE STATIC MOUNT", "serve_frontend"
    ]):
        continue
    clean_lines.append(line)

base_code = "\n".join(clean_lines)

# Ensure essential imports exist at the top
top_imports = """import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from google import genai"""

for imp in top_imports.splitlines():
    if imp.split()[1] not in base_code and imp not in base_code:
        base_code = imp + "\n" + base_code

if "app = FastAPI()" not in base_code:
    base_code = base_code + "\n\napp = FastAPI()\n"

# Perfectly indented client initialization block
client_init_code = """
api_key = os.environ.get("GEMINI_API_KEY")
print(f"--> [INIT] GEMINI_API_KEY detected: {bool(api_key)}", flush=True)

if api_key:
    client = genai.Client(api_key=api_key)
    print("--> [INIT] Initialized google-genai via API Key.", flush=True)
else:
    print("--> [INIT] GEMINI_API_KEY missing. Falling back to Vertex AI ADC...", flush=True)
    client = genai.Client(vertexai=True, location="global")
"""

# Safe static mount at absolute EOF (so API routes take precedence)
static_mount_code = """
# SAFE STATIC MOUNT AT EOF
app.mount("/", StaticFiles(directory=".", html=True), name="static")
"""

final_code = base_code.strip() + "\n\n" + client_init_code.strip() + "\n\n" + static_mount_code.strip() + "\n"

with open("main.py", "w", encoding="utf-8") as f:
    f.write(final_code)

print("✅ Pristine main.py generated successfully!")
