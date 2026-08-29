import React, { useState } from 'react';
import { 
  Eye, 
  Activity, 
  Search, 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Cpu, 
  DollarSign, 
  Sparkles, 
  Lock, 
  Terminal as TerminalIcon, 
  RotateCcw,
  Zap,
  Check
} from 'lucide-react';
import { Incident, ODERExecution } from '../types';

interface OderLoopViewProps {
  activeIncident: Incident | null;
  historicalIncidents: Incident[];
  isExecuting: boolean;
  onExecuteRemediation: (incident: Incident) => void;
  onSelectHistoricalIncident: (incident: Incident) => void;
  autonomousMode: boolean;
}

export const OderLoopView: React.FC<OderLoopViewProps> = ({
  activeIncident,
  historicalIncidents,
  isExecuting,
  onExecuteRemediation,
  onSelectHistoricalIncident,
  autonomousMode,
}) => {
  const [selectedPhaseTab, setSelectedPhaseTab] = useState<'observe' | 'diagnose' | 'evaluate' | 'remediate'>('diagnose');
  const [inspectedIncident, setInspectedIncident] = useState<Incident | null>(activeIncident || historicalIncidents[0] || null);

  const currentIncident = activeIncident || inspectedIncident || historicalIncidents[0];
  const oder = currentIncident?.oderExecution;

  if (!currentIncident || !oder) {
    return (
      <div className="border border-[#27272A] bg-[#121215] p-12 text-center text-[#888888] font-mono">
        <Activity className="w-12 h-12 text-[#00F0FF] mx-auto mb-4 animate-pulse" />
        <h3 className="text-base font-bold uppercase tracking-widest text-white mb-2">Sentinel Ingestion Active</h3>
        <p className="text-xs max-w-md mx-auto mb-6 text-[#888888] leading-relaxed">
          The Vectra Governance telemetry sentinel is continuously monitoring all GCP and Vultr nodes. Inject a chaos drill to trigger the autonomous O.D.E.R. remediation loop.
        </p>
      </div>
    );
  }

  const isCurrentActive = activeIncident && activeIncident.id === currentIncident.id;
  const isPendingApproval = isCurrentActive && currentIncident.status === 'SUPERVISED_WAITING';

  return (
    <div id="oder-loop-view" className="space-y-6">
      {/* Top Banner Alert / Incident Index */}
      <div className={`border p-6 relative overflow-hidden transition-all ${
        isCurrentActive
          ? 'bg-[#121215] border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
          : 'bg-[#121215] border-[#27272A]'
      }`}>
        <div className="absolute top-0 right-0 px-3 py-1 bg-[#1A1A1E] border-b border-l border-[#27272A] text-[9px] font-mono text-[#888] uppercase tracking-widest">
          INCIDENT_INDEX // {currentIncident.id}
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border ${
                currentIncident.severity === 'CRITICAL' ? 'bg-rose-950/60 text-rose-400 border-rose-500/60' :
                currentIncident.severity === 'HIGH' ? 'bg-amber-950/60 text-amber-400 border-amber-500/60' :
                'bg-cyan-950/60 text-cyan-400 border-cyan-500/60'
              }`}>
                {currentIncident.severity} SEVERITY
              </span>

              <span className="font-mono text-xs text-[#888]">TARGET: <b className="text-white">{currentIncident.serviceName}</b></span>
              <span className="text-xs text-[#555] font-mono">//</span>
              <span className="text-xs text-[#888] font-mono">{currentIncident.timestamp}</span>

              {currentIncident.status === 'RESOLVED' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3" />
                  AUTONOMOUSLY REMEDIATED
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">
              {currentIncident.title}
            </h2>

            <p className="text-xs text-[#AAA] font-mono leading-relaxed">
              {oder.observe.telemetrySummary}
            </p>
          </div>

          {/* Action Trigger for Pending Supervised Approval */}
          <div className="flex items-center gap-3 shrink-0">
            {isPendingApproval ? (
              <button
                id="btn-approve-remediation"
                onClick={() => onExecuteRemediation(currentIncident)}
                disabled={isExecuting}
                className="flex items-center gap-2 px-6 py-3 bg-[#00F0FF] hover:bg-[#33F4FF] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_#00F0FF] transition-all cursor-pointer"
              >
                {isExecuting ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Signing Tool Invocations...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Tool ({oder.remediate.targetTool})</span>
                  </>
                )}
              </button>
            ) : currentIncident.status === 'RESOLVED' ? (
              <div className="border border-emerald-500/30 bg-emerald-950/30 p-3 text-right">
                <div className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">Post-Remediation Yield</div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">
                  Saved ~{currentIncident.downtimeSavedMin || 38.5}m SLA • +${currentIncident.costSavedUSD?.toLocaleString() || '1,420'}
                </div>
              </div>
            ) : isExecuting ? (
              <div className="flex items-center gap-2 px-4 py-2 border border-[#00F0FF]/50 bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-mono font-bold">
                <Activity className="w-4 h-4 animate-spin text-[#00F0FF]" />
                <span>ODER Loop Active...</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Editorial Grid: Left State Index (4 Cols) + Right Live Diagnostic & Deep Dive (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 Cols): Phase Index & FinOps Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Phase Index Box */}
          <div className="border border-[#27272A] bg-[#121215] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-[8px] font-mono text-[#666] uppercase">
              Phase_Index
            </div>
            <h2 className="text-xs uppercase tracking-[0.3em] text-[#888] mb-6 italic font-mono">
              O.D.E.R Loop State
            </h2>

            <ul className="space-y-5">
              {/* 01. Observe */}
              <li 
                onClick={() => setSelectedPhaseTab('observe')}
                className={`flex items-start gap-4 p-2 transition-all cursor-pointer ${
                  selectedPhaseTab === 'observe' ? 'bg-[#18181D] border-l-2 border-[#00F0FF]' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 ${
                  selectedPhaseTab === 'observe' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#555]'
                }`}></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white font-mono">01. Observe</p>
                  <p className="text-[10px] text-[#888] font-mono mt-0.5">
                    {oder.observe.anomalousMetrics.length} Telemetry Signals Flagged
                  </p>
                </div>
              </li>

              {/* 02. Diagnose */}
              <li 
                onClick={() => setSelectedPhaseTab('diagnose')}
                className={`flex items-start gap-4 p-2 transition-all cursor-pointer ${
                  selectedPhaseTab === 'diagnose' ? 'bg-[#18181D] border-l-2 border-[#00F0FF]' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 ${
                  selectedPhaseTab === 'diagnose' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#555]'
                }`}></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white font-mono">02. Diagnose</p>
                  <p className="text-[10px] text-[#00F0FF] font-mono mt-0.5">
                    {oder.diagnose.hypothesisType} ({oder.diagnose.confidenceScore.toFixed(0)}%)
                  </p>
                </div>
              </li>

              {/* 03. Evaluate */}
              <li 
                onClick={() => setSelectedPhaseTab('evaluate')}
                className={`flex items-start gap-4 p-2 transition-all cursor-pointer ${
                  selectedPhaseTab === 'evaluate' ? 'bg-[#18181D] border-l-2 border-[#00F0FF]' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 ${
                  selectedPhaseTab === 'evaluate' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#555]'
                }`}></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white font-mono">03. Evaluate</p>
                  <p className="text-[10px] text-[#888] font-mono mt-0.5">
                    Model Armor Check: {oder.evaluate.modelArmorVerification.passed ? 'PASSED' : 'FLAGGED'}
                  </p>
                </div>
              </li>

              {/* 04. Remediate */}
              <li 
                onClick={() => setSelectedPhaseTab('remediate')}
                className={`flex items-start gap-4 p-2 transition-all cursor-pointer ${
                  selectedPhaseTab === 'remediate' ? 'bg-[#18181D] border-l-2 border-[#00F0FF]' : 'opacity-60 hover:opacity-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 ${
                  selectedPhaseTab === 'remediate' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#555]'
                }`}></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-white font-mono">04. Remediate</p>
                  <p className="text-[10px] text-[#888] font-mono mt-0.5">
                    Tool: {oder.remediate.targetTool}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Bold Editorial FinOps Block (matching Design HTML) */}
          <div className="bg-[#00F0FF] p-6 text-black flex flex-col justify-between">
            <div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none mb-2 font-mono">
                ${((currentIncident.costSavedUSD || 12400) / 1000).toFixed(1)}k
              </h2>
              <p className="text-[10px] uppercase font-bold tracking-widest font-mono">
                Est. FinOps & Downtime Yield
              </p>
              <p className="text-xs mt-3 opacity-90 leading-relaxed font-sans font-medium">
                {oder.evaluate.financialImpactSummary || 'Autonomous scaling and zero-trust routing optimized cluster workloads based on detected traffic anomalies.'}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/20 text-[9px] uppercase font-mono tracking-widest font-bold">
              Guarded by Model Armor v4.2
            </div>
          </div>

          {/* Historical Incidents Archive Selector */}
          <div className="border border-[#27272A] bg-[#121215] p-4 space-y-3">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#888] font-bold">
              Incident Ledger Archive ({historicalIncidents.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {historicalIncidents.map((hist) => (
                <div
                  key={hist.id}
                  onClick={() => setInspectedIncident(hist)}
                  className={`p-2.5 border text-left transition-all cursor-pointer ${
                    currentIncident.id === hist.id
                      ? 'border-[#00F0FF] bg-[#18181D]'
                      : 'border-[#27272A] bg-[#0E0E10] hover:border-[#444]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[9px] font-mono mb-1">
                    <span className="text-emerald-400 font-bold">RESOLVED</span>
                    <span className="text-[#666]">{hist.id}</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{hist.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (8 Cols): Diagnostic Engine Output & Deep Dive Inspector */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Live Diagnostic Engine Output Terminal (matching Design HTML) */}
          <div className="border border-[#27272A] bg-[#0E0E11] flex flex-col">
            <div className="flex justify-between items-center border-b border-[#27272A] p-3.5 bg-[#141418]">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-white">
                Live Diagnostic Engine Output // Gemini 3.7
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-mono text-[#888] uppercase">Terminal.active</span>
              </div>
            </div>

            <div className="p-5 font-mono text-[11px] leading-relaxed text-[#AAA] space-y-1.5 overflow-x-auto bg-[#0A0A0C]">
              <p><span className="text-[#555]">[08:44:12]</span> <span className="text-[#00F0FF]">INFO:</span> ADK Root Agent initialized. Telemetry sentinels ingesting OTLP stream...</p>
              <p><span className="text-[#555]">[08:44:15]</span> <span className="text-[#00F0FF]">INFO:</span> Ingested alert from Cloud Monitoring: <span className="text-amber-400 font-bold">{currentIncident.title}</span></p>
              <p><span className="text-[#555]">[08:44:16]</span> <span className="text-[#888]">PROMPT:</span> Evaluating stack traces & telemetry graphs via Gemini 3.7 Flash...</p>
              <p><span className="text-[#555]">[08:44:19]</span> <span className="text-emerald-400">REASON:</span> {oder.diagnose.rootCause}</p>
              <p><span className="text-[#555]">[08:44:20]</span> <span className="text-[#888]">GUARDRAIL:</span> Evaluating '{oder.remediate.targetTool}' against Zero-Trust Model Armor policy...</p>
              <p><span className="text-[#555]">[08:44:21]</span> <span className="text-emerald-400">POL_OK:</span> Mitigation verified within FinOps limit and blast radius.</p>
              <p><span className="text-[#555]">[08:44:22]</span> <span className="text-[#00F0FF]">ACTION:</span> Executing signed tool invocation: <span className="underline text-white font-bold">{oder.remediate.targetTool}</span></p>
              <p className="mt-2 text-[#00F0FF] animate-pulse">_</p>
            </div>

            {/* 3-Column Divide Metric Row */}
            <div className="border-t border-[#27272A] grid grid-cols-3 divide-x divide-[#27272A] bg-[#121215]">
              <div className="p-3.5">
                <p className="text-[9px] uppercase text-[#666] mb-1 font-mono tracking-widest">Model Armor</p>
                <p className="text-xs font-bold font-mono text-emerald-400">SHIELD ACTIVE</p>
              </div>
              <div className="p-3.5">
                <p className="text-[9px] uppercase text-[#666] mb-1 font-mono tracking-widest">API Tool Health</p>
                <p className="text-xs font-bold font-mono text-white">100% SIGNED</p>
              </div>
              <div className="p-3.5">
                <p className="text-[9px] uppercase text-[#666] mb-1 font-mono tracking-widest">OTLP Ingest</p>
                <p className="text-xs font-bold font-mono text-[#00F0FF]">4,820 MSG/SEC</p>
              </div>
            </div>
          </div>

          {/* Deep Phase Inspector Workspace */}
          <div className="border border-[#27272A] bg-[#121215] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.25em] font-bold text-white flex items-center gap-2">
                <span className="text-[#00F0FF]">///</span>
                Phase Inspector: {selectedPhaseTab.toUpperCase()}
              </h3>
              <div className="flex gap-2">
                {(['observe', 'diagnose', 'evaluate', 'remediate'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedPhaseTab(tab)}
                    className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      selectedPhaseTab === tab
                        ? 'bg-[#00F0FF] text-black font-bold'
                        : 'border border-[#27272A] text-[#888] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* OBSERVE PHASE TAB */}
            {selectedPhaseTab === 'observe' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-[#27272A] bg-[#0E0E11]">
                    <span className="text-[10px] text-[#888] uppercase tracking-widest">Incident Severity</span>
                    <div className="text-base font-bold text-rose-400 mt-1">{oder.observe.severity}</div>
                  </div>
                  <div className="p-4 border border-[#27272A] bg-[#0E0E11]">
                    <span className="text-[10px] text-[#888] uppercase tracking-widest">Telemetry Burn Rate</span>
                    <div className="text-base font-bold text-amber-400 mt-1">${oder.observe.estimatedBurnRatePerHour.toFixed(2)}/hr</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-[#888] tracking-widest">Flagged Telemetry Indicators:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {oder.observe.anomalousMetrics.map((m, idx) => (
                      <div key={idx} className="p-2.5 border border-[#27272A] bg-[#0E0E11] text-[#E0E0E0] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-rose-400"></span>
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DIAGNOSE PHASE TAB */}
            {selectedPhaseTab === 'diagnose' && (
              <div className="space-y-5 font-mono text-xs">
                <div className="p-4 border border-[#27272A] bg-[#0E0E11] space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-[#888] uppercase tracking-widest">
                    <span>Diagnostic Confidence</span>
                    <span className="text-[#00F0FF] font-bold">{oder.diagnose.confidenceScore.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#27272A] h-1.5">
                    <div className="bg-[#00F0FF] h-full transition-all duration-500 shadow-[0_0_8px_#00F0FF]" style={{ width: `${oder.diagnose.confidenceScore}%` }} />
                  </div>
                  <div className="pt-1 text-sm font-bold text-white font-sans">
                    {oder.diagnose.rootCause}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-[#888] tracking-widest">Blast Radius Nodes:</span>
                  <div className="flex flex-wrap gap-2">
                    {oder.diagnose.blastRadiusServices.map((svc, idx) => (
                      <span key={idx} className="px-2.5 py-1 border border-rose-500/40 bg-rose-950/30 text-rose-300 font-mono text-xs">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 border border-[#27272A] bg-[#0E0E11] text-[#CCC] leading-relaxed font-mono">
                  <div className="text-[10px] uppercase text-[#00F0FF] tracking-widest mb-1">Reasoning Trace:</div>
                  {oder.diagnose.diagnosticReasoning}
                </div>
              </div>
            )}

            {/* EVALUATE PHASE TAB */}
            {selectedPhaseTab === 'evaluate' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 border border-emerald-500/40 bg-emerald-950/20 text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold uppercase tracking-wider">Model Armor Policy: PASSED</span>
                  </div>
                  <span className="text-[10px] text-[#888]">{oder.evaluate.modelArmorVerification.ruleMatched}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase text-[#888] tracking-widest">Evaluated Strategies:</span>
                  <div className="space-y-2">
                    {oder.evaluate.mitigationOptions.map((opt, idx) => (
                      <div key={idx} className="p-3 border border-[#27272A] bg-[#0E0E11] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-white">{opt.strategy}</div>
                          <div className="text-[10px] text-[#888] mt-0.5">Recovery: {opt.estimatedRecoveryTimeSec}s | Guardrails: {opt.guardrailCompliant ? 'Compliant' : 'Non-compliant'}</div>
                        </div>
                        <span className="text-emerald-400 font-bold self-start sm:self-auto">
                          {opt.projectedCostDeltaPerHour <= 0 ? `-$${Math.abs(opt.projectedCostDeltaPerHour)}/hr` : `+$${opt.projectedCostDeltaPerHour}/hr`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* REMEDIATE PHASE TAB */}
            {selectedPhaseTab === 'remediate' && (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 border border-[#27272A] bg-[#0E0E11] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#00F0FF] font-bold uppercase tracking-wider">{oder.remediate.targetTool}()</span>
                    <span className="text-[10px] text-emerald-400">HMAC-SHA256 SIGNED</span>
                  </div>
                  <pre className="p-3 bg-black border border-[#27272A] text-emerald-400 text-[11px] overflow-x-auto">
                    {JSON.stringify(oder.remediate.toolParameters, null, 2)}
                  </pre>
                </div>

                <div className="p-4 border border-[#27272A] bg-[#0E0E11] space-y-1">
                  <div className="text-[10px] uppercase text-[#888] tracking-widest">Simulated Execution Trace:</div>
                  {oder.remediate.simulatedExecutionLog.map((log, idx) => (
                    <div key={idx} className="text-[#AAA] text-[11px]">
                      <span className="text-[#555]">&gt;</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
