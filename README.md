# Vectra Governance 🛡️⚡

**Level-4 Autonomous SRE & Infrastructure Control Room**  
*Built for the Google Cloud & All Things Agentic Hackathon*

[![Google Cloud Run](https://img.shields.io/badge/Deployed_on-Google_Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud)](https://vectra-governance-630243518379.us-central1.run.app)
[![Gemini API](https://img.shields.io/badge/Powered_by-Gemini_3.5_Flash-FF6F00?style=for-the-badge&logo=google)](https://cloud.google.com/vertex-ai)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

🌐 **Live Control Room:** [Try it out here](https://vectra-governance-630243518379.us-central1.run.app)  

📹 **Video Demo:** https://youtu.be/Ne9cYmOqWNQ?si=2Odb-sdzVHB2i9fB


---

## 🚨 The Problem: Cloud Incident Burn
When a Layer 7 botnet flood or credential stuffing attack hits an ingress gateway, human Site Reliability Engineering (SRE) response times average **42 minutes**. Every minute spent manually analyzing logs, evaluating stack traces, and writing firewall rules burns thousands of dollars in SLA liabilities and cloud egress costs. Modern cloud-native infrastructure moves too fast for manual incident response.

## 💡 The Solution: Vectra Governance
Vectra Governance is an autonomous, Level-4 SRE reliability control room powered by **Gemini on Google Cloud Vertex AI**. It executes closed-loop incident remediation using the **O.D.E.R. Loop**—transforming raw telemetry spikes into cryptographically signed, zero-trust infrastructure patches in real-time, completely without human intervention.

### 🔄 The O.D.E.R. Loop
* **👁️ Observe:** Ingests live telemetry logs, high-density metrics, and alert webhooks.
* **🔍 Diagnose:** Runs multi-agent reasoning to identify anomaly root causes (e.g., origin ASNs bypassing cache).
* **🛡️ Evaluate:** Enforces zero-trust security policy boundaries before applying changes.
* **⚡ Remediate:** Deploys exact `gcloud compute security-policies` and infrastructure patches in seconds.

---

## 🛠️ Core Capabilities

* **Closed-Loop SRE Automation:** Moves seamlessly from log anomaly detection to live system execution.
* **FinOps & SLA Shielding:** Instantly calculates financial exposure, cutting excess API burn and averting severe SLA penalties.
* **Zero-Trust Enforcement:** Evaluates all proposed remediation steps against policy boundaries prior to live execution.
* **Multi-Agent Transparency:** Provides full visibility into step-by-step SRE reasoning traces.

---

## 🏗️ Tech Stack & Architecture

* **AI Engine:** Google GenAI SDK (`google-genai`), Gemini via Vertex AI
* **Backend:** Python, FastAPI, Pydantic, Uvicorn
* **Frontend:** React, Vite, Tailwind CSS (served statically via FastAPI)
* **Deployment:** Containerized via Docker, deployed natively on **Google Cloud Run** (`us-central1`)

---

## 🚀 Quickstart (Local Development)

### 1. Clone the Repository
```bash
git clone [https://github.com/brysyl/Vectra-Governance-.git](https://github.com/brysyl/Vectra-Governance-.git)
cd Vectra-Governance-

2. Set Up Virtual Environment & Dependencies
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

3. Configure Environment Variables
Create a .env file in the root directory and add your Google Gemini/Vertex API credentials:
GEMINI_API_KEY=your_api_key_here
PORT=8080

4. Run the Server
uvicorn main:app --host 0.0.0.0 --port 8080 --reload

The control room will be available at http://localhost:8080.

🧪 Testing the API
You can trigger the multi-agent remediation engine directly via terminal.
1. Health Check:
curl -X GET "[https://vectra-governance-630243518379.us-central1.run.app/api/health](https://vectra-governance-630243518379.us-central1.run.app/api/health)"

2. Inject Anomaly (Remediation Test):
curl -X POST "[https://vectra-governance-630243518379.us-central1.run.app/api/remediate](https://vectra-governance-630243518379.us-central1.run.app/api/remediate)" \
  -H "Content-Type: application/json" \
  -d '{"incident": "Unauthenticated credential stuffing spike saturating auth-service-v2 with 45k req/sec"}'

☁️ Cloud Run Deployment
Vectra Governance is fully dockerized and ready for Google Cloud Run deployment.
# 1. Build the Docker image
docker build -t gcr.io/your-project-id/vectra-governance .

# 2. Push to Google Container Registry
docker push gcr.io/your-project-id/vectra-governance

# 3. Deploy to Cloud Run
gcloud run deploy vectra-governance \
  --image gcr.io/your-project-id/vectra-governance \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

👨‍💻 Author
Bright Sylvester
Systems Architect | Automation Engineer

Built for the All Things Agentic Hackathon by Google Cloud.

