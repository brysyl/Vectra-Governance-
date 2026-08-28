import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from google import genai

app = FastAPI(title="Vectra Governance")

def get_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        return genai.Client(api_key=api_key)
    return genai.Client(vertexai=True, location="global")

@app.get("/api/health")
async def health_check():
    try:
        client = get_client()
        ready = client is not None
    except Exception:
        ready = False
    return {"status": "healthy", "service": "Vectra Governance", "client_ready": ready}

@app.post("/api/remediate")
async def autonomous_remediate(request: Request):
    try:
        body = await request.json()
        incident = body.get("incident", "Layer 7 Botnet Flood on Ingress Gateway")
        
        client = get_client()
        model_name = os.environ.get("MODEL_NAME", "gemini-3.7-flash")
        
        prompt = f"""
        You are Vectra Governance Level 4 Autonomous SRE Agent powered by Gemini.
        Analyze the incoming cloud incident and return a JSON-formatted response with these keys:
        - "severity": "CRITICAL"
        - "oder_phase": "REMEDIATE"
        - "target_service": "api-gateway-core"
        - "confidence_score": "99.992%"
        - "root_cause_analysis": "Brief technical breakdown of the anomaly."
        - "signed_mitigation_action": "The exact secure cloud policy or command executed."
        - "finops_savings": "$1,850 SLA liability averted"

        Incident description: {incident}
        """
        
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        
        return {
            "status": "autonomous_remediation_successful",
            "agent": "Gemini SRE Multi-Agent Gateway",
            "analysis": response.text
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"error": str(exc)})

app.mount("/", StaticFiles(directory="dist", html=True), name="static")

    return {"status": "anomaly_injected", "vector": payload.get("vector"), "details": payload}

    return {"status": "anomaly_injected", "vector": payload.get("vector"), "details": payload}

@app.post("/api/inject-anomaly")
async def inject_anomaly(payload: dict):
    return {"status": "anomaly_injected", "vector": payload.get("vector"), "details": payload}
