import os
from google import genai

# Vertex AI mode initializes using ambient Cloud Run credentials
client = genai.Client(
    vertexai=True,
    project=os.getenv("GCP_PROJECT_ID"),
    location=os.getenv("GCP_REGION", "us-central1"),
)

response = client.models.generate_content(
    model=os.getenv("GEMINI_MODEL", "gemini-3.7-pro"),
    contents="Analyze system telemetry logs...",
)
