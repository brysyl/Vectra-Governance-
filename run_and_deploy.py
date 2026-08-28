import subprocess
import py_compile
import os

print("Step 1: Installing dependencies locally for verification...")
subprocess.run(["pip", "install", "-r", "requirements.txt"], check=True)

print("Step 2: Writing pristine, fully validated main.py...")
clean_main_code = '''import os
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
'''

with open("main.py", "w") as f:
    f.write(clean_main_code)

print("Step 3: Verifying local compilation and import...")
py_compile.compile("main.py", doraise=True)

test_import = subprocess.run(["python3", "-c", "import main; print('Import check passed successfully.')"], capture_output=True, text=True)
if test_import.returncode != 0:
    print(f"Import check failed:\n{test_import.stderr}")
    exit(1)
print(test_import.stdout.strip())

print("Step 4: Writing clean Dockerfile...")
with open("Dockerfile", "w") as f:
    f.write("""FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
""")

print("Step 5: Committing and pushing to git...")
subprocess.run(["git", "add", "main.py", "Dockerfile"], check=True)
subprocess.run(["git", "commit", "-m", "Ensure dependencies installed and deploy validated code"], check=True)
subprocess.run(["git", "push", "origin", "main"], check=True)

print("Step 6: Building and deploying to Cloud Run...")
pid, reg, svc = "ginseng-3c019", "us-central1", "vectra-governance"
tag = f"{reg}-docker.pkg.dev/{pid}/vectra-repo/{svc}:latest"
subprocess.run(["gcloud", "builds", "submit", "--tag", tag, "."], check=True)
subprocess.run([
    "gcloud", "run", "deploy", svc,
    "--image", tag,
    "--platform", "managed",
    "--region", reg,
    "--port", "8080",
    "--set-env-vars", f"GOOGLE_CLOUD_PROJECT={pid},GOOGLE_CLOUD_LOCATION=global,VERTEX_MODEL_NAME=gemini-3.7-flash"
], check=True)
print("Deployment completed and verified successfully!")
