import os
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vectra-governance")

app = FastAPI(title="Vectra Governance", version="1.0.0")

class AnomalyPayload(BaseModel):
    vector: str = "default_vector"
    details: dict = {}

@app.get("/")
def read_root():
    return {"status": "active", "service": "vectra-governance"}

@app.post("/api/inject-anomaly")
async def inject_anomaly(payload: AnomalyPayload):
    logger.info(f"Received anomaly injection request: {payload.vector}")
    return {
        "status": "anomaly_injected",
        "vector": payload.vector,
        "details": payload.details
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
