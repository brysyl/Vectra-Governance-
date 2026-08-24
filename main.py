import os
import sys
from google import genai

# Read key and strip accidental whitespace/quotes
api_key = os.getenv("GEMINI_API_KEY", "").strip()

print(f"--> [INIT] GEMINI_API_KEY detected: {bool(api_key)}", flush=True)

if api_key:
    # Explicitly instantiate API key client (bypasses Google ADC/Vertex)
    client = genai.Client(api_key=api_key)
    print("--> [INIT] Initialized google-genai via API Key.", flush=True)
else:
    print("--> [INIT] GEMINI_API_KEY missing. Falling back to Vertex AI ADC...", flush=True)
    client = genai.Client(
        vertexai=True,
        project=os.getenv("GCP_PROJECT_ID"),
        location=os.getenv("GCP_REGION", "us-central1"),
    )
