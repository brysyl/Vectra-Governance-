with open("main.py", "r", encoding="utf-8") as f:
    content = f.read()

# Strip out old malformed blocks and mounts
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

base_code = "\n".join(clean_lines).strip()

# Ensure standard imports and clean app instance exist
if "from google import genai" not in base_code:
    base_code = "from google import genai\n" + base_code
if "import os" not in base_code:
    base_code = "import os\n" + base_code
if "app = FastAPI()" not in base_code and "app = FastAPI" not in base_code:
    base_code = base_code + "\n\napp = FastAPI()\n"

# Perfectly indented client initialization block (strictly 4-space indentation for inner blocks)
client_init_code = '''
api_key = os.environ.get("GEMINI_API_KEY")
print(f"--> [INIT] GEMINI_API_KEY detected: {bool(api_key)}", flush=True)

if api_key:
    client = genai.Client(api_key=api_key)
    print("--> [INIT] Initialized google-genai via API Key.", flush=True)
else:
    print("--> [INIT] GEMINI_API_KEY missing. Falling back to Vertex AI ADC...", flush=True)
    client = genai.Client(vertexai=True, location="global")
'''.strip()

# Safe static mount at absolute EOF
static_mount_code = '''
# SAFE STATIC MOUNT AT EOF
app.mount("/", StaticFiles(directory=".", html=True), name="static")
'''.strip()

# Combine into a pristine, syntax-valid file structure
final_code = f"{base_code}\n\n{client_init_code}\n\n{static_mount_code}\n"

with open("main.py", "w", encoding="utf-8") as f:
    f.write(final_code)

print("✅ main.py indentation fully resolved and normalized!")
