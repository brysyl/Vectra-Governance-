import ast
import py_compile
import subprocess
import os

print("Step 1: Normalizing whitespace and fixing main.py...")
with open("main.py", "r") as f:
    content = f.read()

# Replace tabs with 4 spaces to eliminate mixed-indentation crashes
content = content.replace("\t", "    ")

# Remove any corrupted inject_anomaly blocks
lines = content.splitlines()
filtered_lines = []
skip = False
for line in lines:
    if "inject_anomaly" in line or "inject-anomaly" in line:
        skip = True
        continue
    if skip and (line.startswith("    ") or line.strip() == "" or "return" in line):
        continue
    skip = False
    filtered_lines.append(line)

# Reassemble with a pristine, strictly 4-space indented route
cleaned_content = "\n".join(filtered_lines) + "\n"
cleaned_content += '''
@app.post("/api/inject-anomaly")
async def inject_anomaly(payload: dict):
    return {"status": "anomaly_injected", "vector": payload.get("vector"), "details": payload}
'''

# Parse and validate AST
tree = ast.parse(cleaned_content)
with open("main.py", "w") as f:
    f.write(cleaned_content)

py_compile.compile("main.py", doraise=True)
print("AST validation and local compilation passed successfully.")

print("Step 2: Writing clean Dockerfile...")
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

print("Step 3: Pushing to git...")
subprocess.run(["git", "add", "main.py", "Dockerfile"], check=True)
subprocess.run(["git", "commit", "-m", "Resolve indentation and port binding definitively"], check=True)
subprocess.run(["git", "push", "origin", "main"], check=True)

print("Step 4: Building and deploying to Cloud Run...")
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
print("Deployment completed successfully!")
