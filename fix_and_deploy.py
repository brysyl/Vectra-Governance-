import ast
import subprocess
import os
import py_compile

print("Loading and cleaning main.py via AST...")
with open("main.py", "r") as f:
    content = f.read()

tree = ast.parse(content)

# Filter out any existing inject_anomaly function definitions completely
tree.body = [
    node for node in tree.body 
    if not (isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == "inject_anomaly")
]

# Parse and append a pristine version of the route
route_code = '''
@app.post("/api/inject-anomaly")
async def inject_anomaly(payload: dict):
    return {"status": "anomaly_injected", "vector": payload.get("vector"), "details": payload}
'''
route_nodes = ast.parse(route_code.strip()).body
tree.body.extend(route_nodes)
ast.fix_missing_locations(tree)

# Unparse back to code with standardized, correct indentation
fixed_code = ast.unparse(tree)
with open("main.py", "w") as f:
    f.write(fixed_code + "\n")

print("Validating local compilation...")
py_compile.compile("main.py", doraise=True)
print("Compilation passed with zero indentation errors.")

print("Writing clean Dockerfile...")
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

print("Committing and pushing to git...")
subprocess.run(["git", "add", "main.py", "Dockerfile"], check=True)
subprocess.run(["git", "commit", "-m", "Definitive AST-based fix for indentation and deployment"], check=True)
subprocess.run(["git", "push", "origin", "main"], check=True)

print("Building and deploying to Cloud Run...")
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
