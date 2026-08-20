export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'DETECTED' | 'OBSERVING' | 'DIAGNOSING' | 'EVALUATING' | 'REMEDIATING' | 'RESOLVED' | 'SUPERVISED_WAITING';

export type HypothesisType = 
  | 'DDOS_ATTACK'
  | 'MEMORY_LEAK'
  | 'DB_POOL_EXHAUSTION'
  | 'ZOMBIE_COMPUTE'
  | 'DEFECTIVE_CANARY'
  | 'CASCADING_TIMEOUT'
  | 'SECURITY_BREACH_ATTEMPT';

export interface TelemetrySnapshot {
  cpuPercent: number;
  memoryPercent: number;
  latencyMs: number;
  rps: number;
  errorRatePercent: number;
  burnRatePerHour: number;
  activeConnections?: number;
  wafBlockedReqs?: number;
  activePods?: number;
}

export interface ObservePhase {
  telemetrySummary: string;
  anomalousMetrics: string[];
  severity: IncidentSeverity;
  estimatedBurnRatePerHour: number;
}

export interface DiagnosePhase {
  rootCause: string;
  hypothesisType: HypothesisType | string;
  confidenceScore: number;
  blastRadiusServices: string[];
  diagnosticReasoning: string;
}

export interface MitigationOption {
  strategy: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedRecoveryTimeSec: number;
  projectedCostDeltaPerHour: number;
  guardrailCompliant: boolean;
}

export interface ModelArmorVerification {
  passed: boolean;
  ruleMatched: string;
  securityNote: string;
}

export interface EvaluatePhase {
  mitigationOptions: MitigationOption[];
  recommendedStrategy: string;
  modelArmorVerification: ModelArmorVerification;
  financialImpactSummary: string;
}

export interface RemediatePhase {
  executionPlanTitle: string;
  targetTool: string;
  toolParameters: Record<string, any>;
  expectedOutcome: string;
  rollbackPlan: string;
  simulatedExecutionLog: string[];
}

export interface ODERExecution {
  observe: ObservePhase;
  diagnose: DiagnosePhase;
  evaluate: EvaluatePhase;
  remediate: RemediatePhase;
}

export interface Incident {
  id: string;
  title: string;
  type: HypothesisType | string;
  serviceName: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  timestamp: string;
  metricsSnapshot: TelemetrySnapshot;
  oderExecution?: ODERExecution;
  resolvedAt?: string;
  downtimeSavedMin?: number;
  costSavedUSD?: number;
}

export type ServiceType = 'CLOUD_RUN' | 'GKE_DEPLOYMENT' | 'CLOUD_SQL' | 'SPANNER' | 'REDIS_CACHE' | 'CLOUD_ARMOR' | 'VERTEX_GPU' | 'CLOUD_CDN';
export type ServiceStatus = 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'HEALING';

export interface Microservice {
  id: string;
  name: string;
  type: ServiceType;
  region: string;
  status: ServiceStatus;
  cpuPercent: number;
  memoryPercent: number;
  latencyMs: number;
  rps: number;
  errorRatePercent: number;
  instances: number;
  costPerHour: number;
  tags: string[];
}

export interface TelemetryPoint {
  time: string;
  cpu: number;
  memory: number;
  latency: number;
  errorRate: number;
  rps: number;
  costPerHour: number;
}

export interface GuardrailPolicy {
  id: string;
  name: string;
  category: 'AUTONOMY' | 'FINOPS' | 'SECURITY' | 'SLA';
  description: string;
  value: number | string;
  unit?: string;
  enabled: boolean;
  lockedByModelArmor: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  toolName: string;
  targetService: string;
  caller: string;
  signatureHash: string;
  parameters: Record<string, any>;
  modelArmorStatus: 'VERIFIED' | 'BLOCKED' | 'OVERRIDDEN';
  executionTimeMs: number;
  status: 'SUCCESS' | 'FAILED' | 'REVERTED';
  costImpactUSD: number;
}

export interface PostMortemReport {
  title: string;
  executiveSummary: string;
  rootCauseAnalysis: string;
  financialImpact: {
    downtimeAvoidedMinutes: number;
    estimatedCostSavedUSD: number;
    remediationToolCostUSD: number;
  };
  actionItems: string[];
  modelArmorAudit: string;
}
