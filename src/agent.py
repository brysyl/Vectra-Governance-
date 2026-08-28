import os
from google import genai

# Vectra Core: Production Environment Bootstrapping
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

# Initialize Vertex AI Enterprise Endpoint
client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)

def execute_vectra_governance(payload: str) -> str:
    """Core O.D.E.R execution loop invoking Vertex AI models."""
    response = client.models.generate_content(
        model="gemini-1.5-pro-002",
        contents=payload,
    )
    return response.text
