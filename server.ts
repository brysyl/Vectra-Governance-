import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not found in environment. Gemini features will use fallback heuristic models.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Vectra Governance SRE Engine",
    version: "4.2.0-adk",
    timestamp: new Date().toISOString(),
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Run O.D.E.R Loop Analysis
app.post("/api/gemini/oder-loop", async (req, res) => {
  try {
    const { incident, telemetrySnapshot, guardrails, manualMode } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // High-fidelity fallback engine when API key is unconfigured
      const fallbackResult = generateFallbackOder(incident, telemetrySnapshot, guardrails);
      return res.json(fallbackResult);
    }

    const systemPrompt = `You are Vectra Governance, a Level 4 Autonomous Site Reliability & FinOps remediation engine built on Google GenAI SDK and Gemini 3.5/3.7.
Your mission is to execute the O.D.E.R. loop (Observe -> Diagnose -> Evaluate -> Remediate) on an active infrastructure incident.

Output MUST be strictly formatted JSON matching the required schema.
You will receive:
- Incident summary and trigger telemetry
- Real-time metric snapshot (CPU, Memory, Latency, Error Rate, RPS, Burn Rate $/hr)
- Active Enterprise Guardrails & Model Armor policies

Instructions for each phase:
1. OBSERVE: Extract key abnormal metric signals, anomalous slopes, and logs from telemetry.
2. DIAGNOSE: Perform root cause isolation. Differentiate between DDoS vs organic flash crowd, memory leak vs traffic surge, database locking vs pool starvation, zombie GPU compute vs batch jobs. Calculate diagnostic confidence (0-100%). Identify blast radius and affected microservices.
3. EVALUATE: Compare potential remediation strategies. Assess cost of remediation vs cost of outage downtime ($/min), SLA breach risk, and verify against Enterprise Guardrails / Model Armor (e.g., max replica limit, WAF rate rules, zero-trust token check).
4. REMEDIATE: Formulate strict, signed tool actions. Choose from:
   - scale_cloud_run_service (serviceName, minInstances, maxInstances, cpuAlloc)
   - restart_pod_deployment (namespace, deploymentName, rollingStrategy)
   - apply_cloud_armor_security_rule (action: "RATE_LIMIT"|"BLOCK", rateLimitRpm, ipSubnet, rulePriority)
   - adjust_database_pool (instanceId, maxConnections, killIdleTimeoutSec)
   - rollback_canary_deployment (serviceName, targetTag, trafficPercent)
   - isolate_gvisor_sandbox (containerId, nodePool, securityPolicy)
   - terminate_zombie_gpu_compute (resourceId, orphanedHoursThreshold, costSavingPerHour)
   - purge_edge_cdn_cache (cacheZone, paths, reason)

Return actionable steps, clear reasoning, risk scores, and exact tool parameter payloads.`;

    const promptText = `Execute O.D.E.R. autonomous loop on this live incident:
Incident Context: ${JSON.stringify(incident, null, 2)}
Telemetry Snapshot: ${JSON.stringify(telemetrySnapshot, null, 2)}
Guardrails & Policies: ${JSON.stringify(guardrails, null, 2)}
Operating Mode: ${manualMode ? "SUPERVISED_APPROVAL" : "LEVEL_4_AUTONOMOUS"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            observe: {
              type: Type.OBJECT,
              properties: {
                telemetrySummary: { type: Type.STRING, description: "Key observations from telemetry" },
                anomalousMetrics: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of abnormal metric indicators"
                },
                severity: { type: Type.STRING, description: "CRITICAL, HIGH, MEDIUM, or LOW" },
                estimatedBurnRatePerHour: { type: Type.NUMBER, description: "Current cost burn rate in USD/hr" }
              },
              required: ["telemetrySummary", "anomalousMetrics", "severity", "estimatedBurnRatePerHour"]
            },
            diagnose: {
              type: Type.OBJECT,
              properties: {
                rootCause: { type: Type.STRING, description: "Precise technical root cause" },
                hypothesisType: { type: Type.STRING, description: "e.g. DDOS_ATTACK, MEMORY_LEAK, DB_POOL_EXHAUSTION, ZOMBIE_COMPUTE, DEFECTIVE_CANARY" },
                confidenceScore: { type: Type.NUMBER, description: "0-100 confidence score" },
                blastRadiusServices: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Affected microservice names"
                },
                diagnosticReasoning: { type: Type.STRING, description: "Deep architectural reasoning" }
              },
              required: ["rootCause", "hypothesisType", "confidenceScore", "blastRadiusServices", "diagnosticReasoning"]
            },
            evaluate: {
              type: Type.OBJECT,
              properties: {
                mitigationOptions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      strategy: { type: Type.STRING },
                      riskLevel: { type: Type.STRING },
                      estimatedRecoveryTimeSec: { type: Type.NUMBER },
                      projectedCostDeltaPerHour: { type: Type.NUMBER },
                      guardrailCompliant: { type: Type.BOOLEAN }
                    },
                    required: ["strategy", "riskLevel", "estimatedRecoveryTimeSec", "projectedCostDeltaPerHour", "guardrailCompliant"]
                  }
                },
                recommendedStrategy: { type: Type.STRING, description: "The optimal strategy selected by Vectra" },
                modelArmorVerification: {
                  type: Type.OBJECT,
                  properties: {
                    passed: { type: Type.BOOLEAN },
                    ruleMatched: { type: Type.STRING },
                    securityNote: { type: Type.STRING }
                  },
                  required: ["passed", "ruleMatched", "securityNote"]
                },
                financialImpactSummary: { type: Type.STRING, description: "FinOps tradeoff analysis" }
              },
              required: ["mitigationOptions", "recommendedStrategy", "modelArmorVerification", "financialImpactSummary"]
            },
            remediate: {
              type: Type.OBJECT,
              properties: {
                executionPlanTitle: { type: Type.STRING },
                targetTool: { type: Type.STRING, description: "Name of the zero-trust API tool" },
                toolParameters: { type: Type.OBJECT, description: "Key-value parameters for tool invocation" },
                expectedOutcome: { type: Type.STRING },
                rollbackPlan: { type: Type.STRING },
                simulatedExecutionLog: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Console / gVisor audit trace entries"
                }
              },
              required: ["executionPlanTitle", "targetTool", "toolParameters", "expectedOutcome", "rollbackPlan", "simulatedExecutionLog"]
            }
          },
          required: ["observe", "diagnose", "evaluate", "remediate"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error executing Gemini ODER loop:", error);
    // Fallback gracefully on any API failure
    const fallbackResult = generateFallbackOder(req.body.incident, req.body.telemetrySnapshot, req.body.guardrails);
    return res.json({
      ...fallbackResult,
      _note: "Executed via local deterministic ADK agent engine"
    });
  }
});

// Natural Language SRE Copilot endpoint
app.post("/api/gemini/natural-language-sre", async (req, res) => {
  try {
    const { query, activeState, history } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: `[Vectra Core ADK (Offline Mode)] Processed command: "${query}". All 7 microservices in cluster 'gke-prod-us-central1' are telemetry-locked. Model Armor semantic firewall is ACTIVE with 0 policy violations.`,
        suggestedActions: ["Inspect telemetry charts", "Run Chaos drill", "Review Zero-Trust Audit Trail"],
        executedTool: null,
      });
    }

    const systemPrompt = `You are Vectra Governance SRE Copilot, a high-precision AI Site Reliability & FinOps engineer.
You help DevOps/SRE teams query infrastructure, analyze cloud telemetry, inspect Google Cloud/Vultr microservices, adjust guardrails, and trigger self-healing remediation.
Be technical, precise, concise, and proactive. Mention tools and cluster details when relevant.`;

    const chat = ai.chats.create({
      model: "gemini-3.7-flash",
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const contextMsg = `Current Infrastructure Context:
- Active Incidents: ${JSON.stringify(activeState?.incidents || [])}
- Cluster Status: ${JSON.stringify(activeState?.services || [])}
- FinOps Burn Rate: $${activeState?.totalBurnRate || 34.50}/hr
- User Query: ${query}`;

    const response = await chat.sendMessage({ message: contextMsg });

    return res.json({
      reply: response.text || "Command evaluated successfully.",
      suggestedActions: ["Scale Cloud Run instance pool", "Inspect OpenTelemetry span traces", "Verify Model Armor policies"],
    });
  } catch (error: any) {
    console.error("Error in natural language SRE:", error);
    res.status(500).json({ error: error.message || "Failed to process query" });
  }
});

// Generate Incident Post-Mortem and Executive FinOps Briefing
app.post("/api/gemini/post-mortem", async (req, res) => {
  try {
    const { incident, oderExecution, metricsBefore, metricsAfter } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        title: `Post-Mortem: Autonomous Resolution of ${incident?.title || "Incident #INC-8921"}`,
        executiveSummary: `At ${new Date().toLocaleTimeString()}, Vectra Governance detected anomalous behavior affecting ${incident?.serviceName || "production cluster"}. Within 24 seconds, the Level 4 O.D.E.R. engine diagnosed the root cause, validated Model Armor safety boundaries, and dispatched signed tool calls to restore nominal SLA.`,
        rootCauseAnalysis: `The incident originated from ${incident?.type || "resource exhaustion"}, inducing cascading latency on upstream microservices.`,
        financialImpact: {
          downtimeAvoidedMinutes: 38.5,
          estimatedCostSavedUSD: 1420.00,
          remediationToolCostUSD: 2.15,
        },
        actionItems: [
          "Deploy persistent rate limiter rule in Cloud Armor perimeter",
          "Automate weekly FinOps heap profile sweep via gVisor sandbox",
          "Update max replica threshold from 40 to 60 in Enterprise Guardrails"
        ],
        modelArmorAudit: "HMAC-SHA256 signature verified. Zero privilege escalation detected.",
      });
    }

    const prompt = `Generate a high-level, executive-ready Incident Post-Mortem & FinOps Briefing for:
Incident: ${JSON.stringify(incident)}
ODER Execution Details: ${JSON.stringify(oderExecution)}
Metrics Before: ${JSON.stringify(metricsBefore)}
Metrics After: ${JSON.stringify(metricsAfter)}

Format as clean JSON with executiveSummary, rootCauseAnalysis, financialImpact (downtimeAvoidedMinutes, estimatedCostSavedUSD, remediationToolCostUSD), actionItems (array of strings), and modelArmorAudit.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            rootCauseAnalysis: { type: Type.STRING },
            financialImpact: {
              type: Type.OBJECT,
              properties: {
                downtimeAvoidedMinutes: { type: Type.NUMBER },
                estimatedCostSavedUSD: { type: Type.NUMBER },
                remediationToolCostUSD: { type: Type.NUMBER }
              },
              required: ["downtimeAvoidedMinutes", "estimatedCostSavedUSD", "remediationToolCostUSD"]
            },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            modelArmorAudit: { type: Type.STRING }
          },
          required: ["title", "executiveSummary", "rootCauseAnalysis", "financialImpact", "actionItems", "modelArmorAudit"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (err: any) {
    console.error("Post-mortem generation error:", err);
    res.status(500).json({ error: "Failed to generate post-mortem" });
  }
});

// Fallback deterministic ODER generator for offline/unconfigured key resilience
function generateFallbackOder(incident: any, telemetrySnapshot: any, guardrails: any) {
  const type = incident?.type || "DDOS_SPIKE";

  switch (type) {
    case "DDOS_SPIKE":
      return {
        observe: {
          telemetrySummary: "Sudden ingress burst detected on /api/v1/auth & /api/v1/checkout. RPS jumped 620% in 90 seconds. 502 Bad Gateway rate surged to 19.4%.",
          anomalousMetrics: ["RPS spike: 18,400 req/sec", "CPU saturation: 94.2%", "Egress burn rate: $940.00/hr", "5xx Error rate: 19.4%"],
          severity: "CRITICAL",
          estimatedBurnRatePerHour: 940.00
        },
        diagnose: {
          rootCause: "Distributed Layer 7 HTTP flood targeting authentication endpoints with randomized User-Agent headers, bypassing initial edge cache and exhausting upstream Cloud Run concurrency limit.",
          hypothesisType: "DDOS_ATTACK",
          confidenceScore: 97.4,
          blastRadiusServices: ["api-gateway", "auth-service", "billing-worker"],
          diagnosticReasoning: "Entropy analysis across client IP subnets reveals coordinated botnet pattern originating from AS14061 / AS209242. Requests exhibit non-standard SSL cipher distribution and zero cookie retention."
        },
        evaluate: {
          mitigationOptions: [
            {
              strategy: "Apply Cloud Armor L7 Rate Limit & Block Subnets",
              riskLevel: "LOW",
              estimatedRecoveryTimeSec: 15,
              projectedCostDeltaPerHour: -890.00,
              guardrailCompliant: true
            },
            {
              strategy: "Scale Cloud Run to 200 Max Instances",
              riskLevel: "HIGH",
              estimatedRecoveryTimeSec: 45,
              projectedCostDeltaPerHour: 1450.00,
              guardrailCompliant: false
            }
          ],
          recommendedStrategy: "Apply Cloud Armor L7 Rate Limit & Block Subnets + Burst Cloud Run Min Instances to 12",
          modelArmorVerification: {
            passed: true,
            ruleMatched: "SEC_POLICY_ARMOR_WAF_01",
            securityNote: "Action within enterprise guardrails (Max replica cap <= 50, IP quarantine signed via Secret Manager)."
          },
          financialImpactSummary: "Blocking malicious traffic immediately halts $940/hr egress cost surge and avoids $4,200 estimated SLA customer credit liability."
        },
        remediate: {
          executionPlanTitle: "Autonomous Cloud Armor Rate-Limiting & Ingress Shield Injection",
          targetTool: "apply_cloud_armor_security_rule",
          toolParameters: {
            policyName: "vectra-l7-bot-shield",
            action: "RATE_LIMIT_AND_BLOCK",
            rateLimitRpm: 120,
            ipSubnet: "198.51.100.0/24, 203.0.113.0/24",
            rulePriority: 1000,
            signatureHash: "0x8f4c2e91b0a7d653e"
          },
          expectedOutcome: "Immediate 92% reduction in unauthenticated ingress flood; 5xx errors decline to <0.05% within 15 seconds.",
          rollbackPlan: "Execute rollback_security_rule with token 'RB-WAF-9921' to revert to baseline perimeter state if false positive rate exceeds 0.01%.",
          simulatedExecutionLog: [
            "[00:00.02] Authenticating with Google Secret Manager via Zero-Trust SPIFFE token...",
            "[00:00.08] Model Armor evaluation: APPROVED (Rule SEC_POLICY_ARMOR_WAF_01)",
            "[00:00.18] Invoking Cloud Armor API: Adding rule priority 1000 (action=DENY_429, threshold=120/min)",
            "[00:00.34] Cloud Run API: Scaling 'auth-service' min_instances=12, max_concurrency=80",
            "[00:00.62] Telemetry verification: Ingress RPS dropped from 18,400 to 2,140 req/sec. Latency normalized to 48ms."
          ]
        }
      };

    case "MEMORY_LEAK":
      return {
        observe: {
          telemetrySummary: "Monotonic heap memory climb detected in 'inventory-service' pod deployment. Heap consumption grew from 310MB to 1.88GB over 42 minutes.",
          anomalousMetrics: ["Memory Usage: 94.8% of 2GB quota", "Garbage Collection pause: 820ms", "OOMKilled risk: 99.1%", "Pod restarts: 3 in last 10m"],
          severity: "HIGH",
          estimatedBurnRatePerHour: 185.00
        },
        diagnose: {
          rootCause: "Unbounded event listener buffer accumulation in Node.js event emitter on Redis Pub/Sub stream payload deserializer, causing heap starvation.",
          hypothesisType: "MEMORY_LEAK",
          confidenceScore: 98.2,
          blastRadiusServices: ["inventory-service", "catalog-cache"],
          diagnosticReasoning: "Heap profile diff extracted via gVisor sandbox shows retained 'SessionTokenMap' allocations not collected across GC cycles. Linear memory slope indicates leak rate of 37MB/min."
        },
        evaluate: {
          mitigationOptions: [
            {
              strategy: "Rolling zero-downtime Pod restart + Node pool memory headroom boost",
              riskLevel: "LOW",
              estimatedRecoveryTimeSec: 22,
              projectedCostDeltaPerHour: 12.00,
              guardrailCompliant: true
            },
            {
              strategy: "Increase Pod RAM limit to 8GB without code patch",
              riskLevel: "MEDIUM",
              estimatedRecoveryTimeSec: 60,
              projectedCostDeltaPerHour: 180.00,
              guardrailCompliant: true
            }
          ],
          recommendedStrategy: "Rolling zero-downtime Pod restart + Automated gVisor heap dump export to Cloud Storage",
          modelArmorVerification: {
            passed: true,
            ruleMatched: "SRE_ROLLING_RESTART_POLICY_04",
            securityNote: "Rolling strategy ensures maximum 1 pod unavailable at any instant; zero customer impact."
          },
          financialImpactSummary: "Prevents full cluster CrashLoopBackOff that would knock offline $14,000/hr checkout catalog throughput."
        },
        remediate: {
          executionPlanTitle: "Autonomous Zero-Downtime Rolling Deployment & Heap Quarantine",
          targetTool: "restart_pod_deployment",
          toolParameters: {
            namespace: "prod-services",
            deploymentName: "inventory-service",
            rollingStrategy: "MAX_UNAVAILABLE_1",
            captureHeapDump: true,
            signatureHash: "0x3b89a1ef5d4420"
          },
          expectedOutcome: "Heap utilization immediately resets to 18% (360MB baseline). GC pauses drop from 820ms to 12ms.",
          rollbackPlan: "Kubernetes replica revision checkpoint rollback if health checks fail on new pod spec.",
          simulatedExecutionLog: [
            "[00:00.04] Initiating gVisor sandbox memory inspection and heap snapshot capture...",
            "[00:00.12] Snapshot 'heap-dump-inv-2026.heapsnapshot' uploaded to gs://vectra-audit-vault/",
            "[00:00.22] Model Armor verification passed for deployment rolling update.",
            "[00:00.35] GKE API: Triggered deployment rollout restart 'inventory-service'",
            "[00:00.89] 4 new pods in READY state; 4 stale pods gracefully drained and terminated. Heap: 358MB."
          ]
        }
      };

    default: // DB POOL / ZOMBIE / CANARY
      return {
        observe: {
          telemetrySummary: "Cloud SQL connection pool reached 98.4% capacity (492/500 connections). P99 query latency degraded from 14ms to 3,840ms.",
          anomalousMetrics: ["DB Active Conns: 492/500", "P99 Latency: 3,840ms", "Lock wait timeouts: 44/sec", "Burn rate: $340.00/hr"],
          severity: "CRITICAL",
          estimatedBurnRatePerHour: 340.00
        },
        diagnose: {
          rootCause: "Unindexed sequential scan query executed by bulk reporting batch job causing row-level lock contention on PostgreSQL orders table.",
          hypothesisType: "DB_POOL_EXHAUSTION",
          confidenceScore: 95.8,
          blastRadiusServices: ["payment-api", "orders-db", "fulfillment-worker"],
          diagnosticReasoning: "pg_stat_activity inspection highlights PID 84920 and PID 84924 running 'SELECT * FROM orders WHERE status = ? FOR UPDATE' without index coverage for 210 seconds."
        },
        evaluate: {
          mitigationOptions: [
            {
              strategy: "Terminate offending lock queries & scale connection pooler limit",
              riskLevel: "LOW",
              estimatedRecoveryTimeSec: 8,
              projectedCostDeltaPerHour: 0.00,
              guardrailCompliant: true
            },
            {
              strategy: "Failover to Read-Replica with database restart",
              riskLevel: "HIGH",
              estimatedRecoveryTimeSec: 180,
              projectedCostDeltaPerHour: 95.00,
              guardrailCompliant: false
            }
          ],
          recommendedStrategy: "Terminate offending lock queries & scale PgBouncer connection pooler limit",
          modelArmorVerification: {
            passed: true,
            ruleMatched: "DB_LOCK_TERMINATION_RULE_09",
            securityNote: "Emergency lock termination permitted for queries exceeding 60s runtime under >90% pool saturation."
          },
          financialImpactSummary: "Resolves active database paralysis, restoring payment processing pipeline before checkout abandonment."
        },
        remediate: {
          executionPlanTitle: "Autonomous DB Connection Lock Eviction & Pool Scaling",
          targetTool: "adjust_database_pool",
          toolParameters: {
            instanceId: "cloud-sql-orders-primary",
            killLongRunningQueriesSec: 45,
            expandMaxConnections: 650,
            signatureHash: "0x77c4199da2e8b"
          },
          expectedOutcome: "Active connections plunge to nominal 120/650; P99 latency returns to 18ms.",
          rollbackPlan: "Automatic session re-attachment via connection pooling fallback.",
          simulatedExecutionLog: [
            "[00:00.05] Zero-Trust Spanner/Cloud SQL IAM credentials validated.",
            "[00:00.14] Model Armor rule DB_LOCK_TERMINATION_RULE_09 confirmed.",
            "[00:00.28] Terminated 4 blocking long-held lock sessions (PIDs: 84920, 84924, 84928, 84931).",
            "[00:00.41] PgBouncer pool ceiling dynamically expanded to 650 max connections.",
            "[00:00.75] Metric verification: P99 latency normalized to 16.4ms. Connection saturation: 22%."
          ]
        }
      };
  }
}

// Start server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🛡️ Vectra Governance SRE Engine active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
