import os
from google import genai

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    # Render / Local testing via Google AI Studio Key
    client = genai.Client(api_key=api_key)
else:
    # Production Vertex AI on GCP Cloud Run
    client = genai.Client(
        vertexai=True,
        project=os.getenv("GCP_PROJECT_ID"),
        location=os.getenv("GCP_REGION", "us-central1"),
    )

response = client.models.generate_content(
    model=os.getenv("GEMINI_MODEL", "gemini-1.5-pro-002"),
    contents="Analyze system telemetry logs...",
)
