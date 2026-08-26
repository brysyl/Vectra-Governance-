import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  OderLoopView 
} from './components/OderLoopView';
import { 
  TelemetryDashboard 
} from './components/TelemetryDashboard';
import { 
  TopologyMap 
} from './components/TopologyMap';
import { 
  GuardrailsPanel 
} from './components/GuardrailsPanel';
import { 
  AuditLogView 
} from './components/AuditLogView';
import { 
  SreTerminal 
} from './components/SreTerminal';
import { 
  IncidentSimulatorModal 
} from './components/IncidentSimulatorModal';
import { 
  PostMortemModal 
} from './components/PostMortemModal';
import { 
  INITIAL_SERVICES, 
  INITIAL_GUARDRAILS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_RESOLVED_INCIDENT,
  CHAOS_SCENARIOS
} from './data/initialData';
import { 
  Microservice, 
  Incident, 
  GuardrailPolicy, 
  AuditLogEntry, 
  TelemetryPoint 
} from './types';

export default function App() {
  const [autonomousMode, setAutonomousMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'oder' | 'topology' | 'telemetry' | 'guardrails' | 'audit' | 'terminal'>('oder');
  const [services, setServices] = useState<Microservice[]>(INITIAL_SERVICES);
  const [guardrails, setGuardrails] = useState<GuardrailPolicy[]>(INITIAL_GUARDRAILS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [historicalIncidents, setHistoricalIncidents] = useState<Incident[]>([INITIAL_RESOLVED_INCIDENT]);
  const [isChaosModalOpen, setIsChaosModalOpen] = useState<boolean>(false);
  const [isPostMortemOpen, setIsPostMortemOpen] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [totalCostSaved, setTotalCostSaved] = useState<number>(1850);

  // Generate initial rolling telemetry points
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const points: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 15; i >= 0; i--) {
      const timeStr = new Date(now - i * 3000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      points.push({
        time: timeStr,
        cpu: Math.floor(25 + Math.random() * 8),
        memory: Math.floor(35 + Math.random() * 5),
        latency: Math.floor(12 + Math.random() * 6),
        errorRate: 0.02,
        rps: Math.floor(4100 + Math.random() * 300),
        costPerHour: 43.50 + Math.random() * 1.5,
      });
    }
    return points;
  });

  // Calculate live aggregate burn rate
  const totalBurnRate = services.reduce((acc, s) => acc + s.costPerHour, 0);

  // Telemetry Heartbeat Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTelemetryHistory(prev => {
        const avgCpu = Math.round(services.reduce((acc, s) => acc + s.cpuPercent, 0) / services.length);
        const avgMem = Math.round(services.reduce((acc, s) => acc + s.memoryPercent, 0) / services.length);
        const maxLatency = Math.max(...services.map(s => s.latencyMs));
        const maxError = Math.max(...services.map(s => s.errorRatePercent));
        const totalRps = services.reduce((acc, s) => acc + s.rps, 0);
        const cost = services.reduce((acc, s) => acc + s.costPerHour, 0);

        const newPoint: TelemetryPoint = {
          time: timeStr,
          cpu: avgCpu,
          memory: avgMem,
          latency: maxLatency,
          errorRate: parseFloat(maxError.toFixed(2)),
          rps: totalRps,
          costPerHour: parseFloat(cost.toFixed(2)),
        };

        return [...prev.slice(1), newPoint];
      });

      // Natural metric jitter for healthy services
      if (!activeIncident) {
        setServices(prev => prev.map(s => {
          if (s.status === 'HEALTHY') {
            const cpuJitter = Math.max(10, Math.min(45, s.cpuPercent + (Math.random() * 4 - 2)));
            const memJitter = Math.max(20, Math.min(55, s.memoryPercent + (Math.random() * 2 - 1)));
            const latJitter = Math.max(5, Math.min(40, s.latencyMs + (Math.random() * 3 - 1.5)));
            return {
              ...s,
              cpuPercent: Math.round(cpuJitter),
              memoryPercent: Math.round(memJitter),
              latencyMs: Math.round(latJitter),
            };
          }
          return s;
        }));
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [services, activeIncident]);

  // Trigger Chaos Anomaly Drill
  const handleTriggerChaos = async (scenario: any) => {
    setIsExecuting(true);
    setActiveTab('oder');

    // 1. Mutate targeted service to CRITICAL
    setServices(prev => prev.map(s => {
      if (s.id === scenario.serviceId || s.name.includes(scenario.serviceName)) {
        return {
          ...s,
          status: 'CRITICAL',
          cpuPercent: scenario.anomalies.cpuPercent,
          memoryPercent: scenario.anomalies.memoryPercent,
          latencyMs: scenario.anomalies.latencyMs,
          errorRatePercent: scenario.anomalies.errorRatePercent,
          rps: scenario.anomalies.rps,
          costPerHour: scenario.anomalies.burnRatePerHour,
        };
      }
      return s;
    }));

    const newIncident: Incident = {
      id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: scenario.title,
      type: scenario.type,
      serviceName: scenario.serviceName,
      severity: scenario.severity,
      status: 'OBSERVING',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      metricsSnapshot: {
        cpuPercent: scenario.anomalies.cpuPercent,
        memoryPercent: scenario.anomalies.memoryPercent,
        latencyMs: scenario.anomalies.latencyMs,
        rps: scenario.anomalies.rps,
        errorRatePercent: scenario.anomalies.errorRatePercent,
        burnRatePerHour: scenario.anomalies.burnRatePerHour,
      },
    };

    setActiveIncident(newIncident);

    try {
      // 2. Call Gemini Autonomous O.D.E.R. Loop Engine
      const res = await fetch('/api/gemini/oder-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident: newIncident,
          telemetrySnapshot: newIncident.metricsSnapshot,
          guardrails,
          manualMode: !autonomousMode,
        }),
      });

      const oderResult = await res.json();

      const evaluatedIncident: Incident = {
        ...newIncident,
        status: autonomousMode ? 'REMEDIATING' : 'SUPERVISED_WAITING',
        oderExecution: oderResult,
      };

      setActiveIncident(evaluatedIncident);

      // If Level 4 Autonomous Mode is active, automatically execute signed remediation
      if (autonomousMode) {
        setTimeout(() => {
          executeRemediationAction(evaluatedIncident);
        }, 3200);
      } else {
        setIsExecuting(false);
      }
    } catch (err) {
      console.error("ODER execution failed:", err);
      setIsExecuting(false);
    }
  };

  // Execute Remediation Action (Autonomous or Supervised 1-Click)
  const executeRemediationAction = (incident: Incident) => {
    setIsExecuting(true);

    // Set targeted service to HEALING status
    setServices(prev => prev.map(s => {
      if (s.name === incident.serviceName || s.id.includes(incident.serviceName)) {
        return { ...s, status: 'HEALING' };
      }
      return s;
    }));

    setTimeout(() => {
      // 1. Restore service to HEALTHY nominal baseline
      setServices(prev => prev.map(s => {
        if (s.name === incident.serviceName || s.id.includes(incident.serviceName)) {
          return {
            ...s,
            status: 'HEALTHY',
            cpuPercent: 28,
            memoryPercent: 34,
            latencyMs: 14,
            errorRatePercent: 0.02,
            rps: 3800,
            costPerHour: 4.80,
          };
        }
        return s;
      }));

      // 2. Create Audit Log Entry
      const newAuditLog: AuditLogEntry = {
        id: `aud-${Date.now().toString().slice(-4)}`,
        timestamp: 'Just now',
        toolName: incident.oderExecution?.remediate.targetTool || 'scale_cloud_run_service',
        targetService: incident.serviceName,
        caller: autonomousMode ? 'Vectra ADK Root Agent (L4)' : 'DevOps Lead (Approved)',
        signatureHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
        parameters: incident.oderExecution?.remediate.toolParameters || {},
        modelArmorStatus: 'VERIFIED',
        executionTimeMs: Math.floor(95 + Math.random() * 150),
        status: 'SUCCESS',
        costImpactUSD: 2.10,
      };

      setAuditLogs(prev => [newAuditLog, ...prev]);

      // 3. Mark incident as RESOLVED
      const costSaved = Math.floor(850 + Math.random() * 1200);
      const downtimeMin = parseFloat((25 + Math.random() * 20).toFixed(1));

      const resolved: Incident = {
        ...incident,
        status: 'RESOLVED',
        resolvedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        costSavedUSD: costSaved,
        downtimeSavedMin: downtimeMin,
      };

      setTotalCostSaved(prev => prev + costSaved);
      setHistoricalIncidents(prev => [resolved, ...prev]);
      setActiveIncident(null);
      setIsExecuting(false);
    }, 2800);
  };

  const handleInjectForService = (serviceId: string) => {
    const matchingScenario = CHAOS_SCENARIOS.find(s => s.serviceId === serviceId) || CHAOS_SCENARIOS[0];
    handleTriggerChaos(matchingScenario);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E0E0E0] font-sans flex flex-col selection:bg-[#00F0FF] selection:text-black">
      {/* Header */}
      <Header
        activeIncident={activeIncident}
        autonomousMode={autonomousMode}
        setAutonomousMode={setAutonomousMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenChaosModal={() => setIsChaosModalOpen(true)}
        onOpenPostMortem={() => setIsPostMortemOpen(true)}
        totalBurnRate={totalBurnRate}
        totalCostSaved={totalCostSaved}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'oder' && (
          <OderLoopView
            activeIncident={activeIncident}
            historicalIncidents={historicalIncidents}
            isExecuting={isExecuting}
            onExecuteRemediation={executeRemediationAction}
            onSelectHistoricalIncident={(inc) => {}}
            autonomousMode={autonomousMode}
          />
        )}

        {activeTab === 'topology' && (
          <TopologyMap
            services={services}
            activeIncident={activeIncident}
            onInjectForService={handleInjectForService}
            onSelectService={(s) => {}}
          />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryDashboard
            services={services}
            telemetryHistory={telemetryHistory}
            activeIncident={activeIncident}
            onSelectService={(s) => {}}
            onInjectForService={handleInjectForService}
          />
        )}

        {activeTab === 'guardrails' && (
          <GuardrailsPanel
            guardrails={guardrails}
            onUpdateGuardrail={(updated) => setGuardrails(updated)}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogView
            auditLogs={auditLogs}
          />
        )}

        {activeTab === 'terminal' && (
          <SreTerminal
            services={services}
            activeIncident={activeIncident}
            totalBurnRate={totalBurnRate}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#27272A] bg-[#0A0A0B] py-5 px-4 sm:px-6 lg:px-8 text-center text-xs font-mono text-[#888] flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-bold">VECTRA.GOV v4.2</span>
          <span className="text-[#444]">//</span>
          <span>Google GenAI SDK & Gemini 3.5 Flash</span>
          <span className="text-[#444]">//</span>
          <span className="text-[#00F0FF]">All Things Agentic</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]"></span>
            ZERO-TRUST MESH ACTIVE
          </span>
          <span className="text-[#666]">//</span>
          <span className="text-[#888]">MODEL ARMOR VERIFIED</span>
        </div>
      </footer>

      {/* Chaos Simulator Modal */}
      <IncidentSimulatorModal
        isOpen={isChaosModalOpen}
        onClose={() => setIsChaosModalOpen(false)}
        onTriggerChaos={handleTriggerChaos}
        isExecuting={isExecuting}
      />

      {/* Post-Mortem Report Modal */}
      <PostMortemModal
        isOpen={isPostMortemOpen}
        onClose={() => setIsPostMortemOpen(false)}
        incident={activeIncident || historicalIncidents[0] || null}
      />
    </div>
  );
}
