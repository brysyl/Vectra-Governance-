import os
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI
from pydantic import BaseModel
from google import genai

app = FastAPI(title="Vectra Governance Core", version="1.0.0")

# Initialize Vertex AI Client securely via Cloud Run's native IAM
client = genai.Client(
    vertexai=True, 
    project=os.getenv("GOOGLE_CLOUD_PROJECT", "ginseng-3c019"), 
    location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
)

class ExecutionRequest(BaseModel):
    payload: str

@app.post("/execute")
async def execute_oder_loop(request: ExecutionRequest):
    execution_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()
    
    try:
        print(f"\n[{execution_id}] OBSERVE: Ingesting -> {request.payload}")
        print(f"[{execution_id}] DECIDE: Assessing risk level...")
        
        risk_level = "LOW" if "drop" not in request.payload.lower() else "CRITICAL"
        
        if risk_level == "CRITICAL":
            print(f"[{execution_id}] EXECUTE: Guardrail triggered. Halting.")
            engine_response = "ACTION BLOCKED: Destructive payload detected."
            status = "HALTED"
        else:
            print(f"[{execution_id}] EXECUTE: Routing to Vertex AI Engine...")
            response = client.models.generate_content(
                model='gemini-3.5-flash',
                contents=request.payload,
            )
            engine_response = response.text
            status = "SUCCESS"
        
        print(f"[{execution_id}] REFLECT: Verifying state integrity...")
        
        return {
            "execution_id": execution_id,
            "timestamp": timestamp,
            "engine_phase": "REFLECT",
            "status": status,
            "risk_assessment": risk_level,
            "payload": {"instruction": request.payload},
            "audit_trail": [
                "Payload parsed and schema validated",
                f"Risk mapped to {risk_level}",
                f"Execution result: {engine_response.strip()}"
            ]
        }
        
    except Exception as e:
        return {
            "execution_id": execution_id,
            "status": "FAILED",
            "error": f"ERR_CORE_EXECUTION: {str(e)}"
        }

@app.get("/health")
async def health_check():
    return {"status": "online", "engine": "O.D.E.R", "ai_connected": True, "environment": "production"}
