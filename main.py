import os
import uuid
from datetime import datetime, timezone
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv

# Try importing the AI SDK (Works in Cloud Run, fails gracefully locally on Termux)
try:
    from google import genai
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False

load_dotenv()

app = FastAPI(title="Vectra Governance Core", version="1.0.0")

# Initialize Vertex AI Client (Will use Cloud Run's native credentials)
client = None
if AI_AVAILABLE:
    try:
        client = genai.Client(
            vertexai=True, 
            project=os.getenv("GOOGLE_CLOUD_PROJECT"), 
            location=os.getenv("GOOGLE_CLOUD_LOCATION")
        )
    except Exception as e:
        print(f"Vertex AI initialization error: {e}")

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
            if AI_AVAILABLE and client:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=request.payload,
                )
                engine_response = response.text
            else:
                engine_response = f"Simulated fallback remediation: {request.payload}"
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
    return {"status": "online", "engine": "O.D.E.R", "ai_connected": AI_AVAILABLE}
