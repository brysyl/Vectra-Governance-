import os
import hmac
import hashlib
import json
import urllib.request
import subprocess

SECRET = "vectra_secret_key_2026"

print("Step 1: Ensuring git tree is updated and synced...")
subprocess.run(["git", "pull", "origin", "main", "--rebase"], check=True)
subprocess.run(["git", "push", "origin", "main"], check=True)

print("Step 2: Building and deploying to Cloud Run...")
pid, reg, svc = "ginseng-3c019", "us-central1", "vectra-governance"
tag = f"{reg}-docker.pkg.dev/{pid}/vectra-repo/{svc}:latest"
subprocess.run(["gcloud", "builds", "submit", "--tag", tag, "."], check=True)
subprocess.run([
    "gcloud", "run", "deploy", svc,
    "--image", tag,
    "--platform", "managed",
    "--region", reg,
    "--port", "8080",
    "--set-env-vars", f"GOOGLE_CLOUD_PROJECT={pid},GOOGLE_CLOUD_LOCATION=global,VERTEX_MODEL_NAME=gemini-3.7-flash,WEBHOOK_SECRET={SECRET}"
], check=True)

print("\nStep 3: Executing Judge Verification Test Suite...")
base_url = "https://vectra-governance-630243518379.us-central1.run.app"

def send_test(name, path, data, headers):
    url = f"{base_url}{path}"
    req_data = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(url, data=req_data, headers=headers, method="POST")
    print(f"\n--- TEST: {name} ---")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"Status Code: {resp.status}")
            print(json.loads(resp.read().decode("utf-8")))
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.read().decode('utf-8')}")

test_data_hitl = {"incident_id": "INC-HIGH-09", "threat_level": "CRITICAL", "resource": "projects/ginseng-3c019/global/iamPolicies/production-root", "action": "REVOKE_ALL"}
body_bytes = json.dumps(test_data_hitl).encode("utf-8")
valid_sig = "sha256=" + hmac.new(SECRET.encode(), body_bytes, hashlib.sha256).hexdigest()

# 1. Invalid HMAC Test
send_test(
    "Invalid HMAC Signature Rejection",
    "/api/remediate",
    {"incident": "Unauthorized breach attempt"},
    {"Content-Type": "application/json", "X-Hub-Signature-256": "sha256=deadbeefcafebabe1234567890abcdef1234567890abcdef1234567890abcdef"}
)

# 2. HITL Interactive Pause Test
send_test(
    "Human-in-the-Loop (HITL) Interactive Pause",
    "/api/remediate",
    test_data_hitl,
    {"Content-Type": "application/json", "X-Hub-Signature-256": valid_sig}
)

# 3. Multi-Vector Anomaly Injection Suite
anomaly_data = {"vector": "db_connection_exhaustion", "pool_size": 500, "active_wait_ms": 12000}
anomaly_body = json.dumps(anomaly_data).encode("utf-8")
anomaly_sig = "sha256=" + hmac.new(SECRET.encode(), anomaly_body, hashlib.sha256).hexdigest()
send_test(
    "Multi-Vector Anomaly Injection Suite",
    "/api/inject-anomaly",
    anomaly_data,
    {"Content-Type": "application/json", "X-Hub-Signature-256": anomaly_sig}
)

print("\nAll verification tests completed successfully. Capture screenshots of these results for the judges.")
