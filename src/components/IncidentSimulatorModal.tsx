import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Sparkles, 
  Play
} from 'lucide-react';
import { CHAOS_SCENARIOS } from '../data/initialData';

interface IncidentSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerChaos: (scenario: any) => void;
  isExecuting: boolean;
}

export const IncidentSimulatorModal: React.FC<IncidentSimulatorModalProps> = ({
  isOpen,
  onClose,
  onTriggerChaos,
  isExecuting,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(CHAOS_SCENARIOS[0].id);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedScenario = CHAOS_SCENARIOS.find(s => s.id === selectedScenarioId) || CHAOS_SCENARIOS[0];

  const handleLaunchPreset = (scenario: any) => {
    onTriggerChaos(scenario);
    onClose();
  };

  const handleLaunchCustom = () => {
    if (!customPrompt.trim()) return;

    const customScenario = {
      id: `custom-chaos-${Date.now()}`,
      title: customPrompt.slice(0, 60),
      type: 'CUSTOM_ANOMALY',
      serviceId: 'api-gateway',
      serviceName: 'api-gateway-core',
      severity: 'HIGH' as const,
      description: customPrompt,
      anomalies: {
        rps: 12000,
        cpuPercent: 88,
        memoryPercent: 82,
        latencyMs: 720,
        errorRatePercent: 14.2,
        burnRatePerHour: 480.00,
      },
    };

    onTriggerChaos(customScenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121215] border border-[#27272A] max-w-2xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-950 text-rose-400 border border-rose-500/50">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Chaos Engineering & Telemetry Anomaly Lab
              </h3>
              <p className="text-[11px] text-[#888] font-mono">
                Inject realistic production failures to test Vectra's Level 4 O.D.E.R. remediation cycle
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-white hover:bg-[#1A1A1E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border border-[#27272A] bg-black p-0.5">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`flex-1 py-2 font-mono text-[11px] font-bold uppercase transition-all cursor-pointer ${
              !isCustomMode ? 'bg-[#00F0FF] text-black' : 'text-[#888] hover:text-white'
            }`}
          >
            Curated SRE Scenarios ({CHAOS_SCENARIOS.length})
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`flex-1 py-2 font-mono text-[11px] font-bold uppercase transition-all cursor-pointer ${
              isCustomMode ? 'bg-[#00F0FF] text-black' : 'text-[#888] hover:text-white'
            }`}
          >
            Natural Language Generator
          </button>
        </div>

        {/* Preset Scenarios List */}
        {!isCustomMode ? (
          <div className="space-y-3">
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {CHAOS_SCENARIOS.map((scenario) => {
                const isSelected = scenario.id === selectedScenarioId;
                return (
                  <div
                    key={scenario.id}
                    onClick={() => setSelectedScenarioId(scenario.id)}
                    className={`p-3.5 border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#18181D] border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                        : 'bg-[#0E0E10] border-[#27272A] hover:border-[#444]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white uppercase text-xs">
                        {scenario.title}
                      </span>
                      <span className={`px-2 py-0.2 text-[9px] font-bold uppercase ${
                        scenario.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-500/50' :
                        scenario.severity === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-500/50' :
                        'bg-cyan-950 text-[#00F0FF] border border-[#00F0FF]/50'
                      }`}>
                        {scenario.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#888] leading-relaxed font-mono">
                      {scenario.description}
                    </p>

                    <div className="mt-2.5 flex items-center gap-4 text-[10px] text-[#666]">
                      <span>Target: <b className="text-[#00F0FF]">{scenario.serviceName}</b></span>
                      <span>Surge: <b className="text-rose-400">${scenario.anomalies.burnRatePerHour}/hr</b></span>
                      <span>CPU: <b className="text-amber-400">{scenario.anomalies.cpuPercent}%</b></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trigger Button */}
            <div className="pt-4 border-t border-[#27272A] flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs text-[#888] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-launch-selected-chaos"
                onClick={() => handleLaunchPreset(selectedScenario)}
                disabled={isExecuting}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_rgba(244,63,94,0.4)] transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Inject Anomaly & Trigger O.D.E.R.</span>
              </button>
            </div>
          </div>
        ) : (
          /* Custom Natural Language Anomaly Generator */
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
                Describe Custom Chaos Scenario:
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Simulate an uncollected Redis subscription stream causing 98% memory heap leak on inventory worker, degrading P99 latency to 4.2 seconds..."
                rows={4}
                className="w-full bg-black border border-[#27272A] p-3 text-xs text-white placeholder-[#555] focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div className="p-3 bg-[#0E0E10] border border-[#27272A] text-[11px] text-[#888] space-y-1">
              <div className="font-bold text-white uppercase text-[10px]">Fast Prompt Presets:</div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => setCustomPrompt("Simulate a cascading connection pool lock on orders-cloudsql-pg16 with 490 active threads.")}
                  className="px-2 py-1 bg-[#18181D] hover:bg-[#222228] text-[#CCC] text-[10px] text-left border border-[#27272A] cursor-pointer"
                >
                  Postgres Connection Lock
                </button>
                <button
                  onClick={() => setCustomPrompt("Simulate an egress billing anomaly of $1,200/hr from unauthorized Cloud Run revisions in us-east4.")}
                  className="px-2 py-1 bg-[#18181D] hover:bg-[#222228] text-[#CCC] text-[10px] text-left border border-[#27272A] cursor-pointer"
                >
                  $1.2k/hr Egress Anomaly
                </button>
                <button
                  onClick={() => setCustomPrompt("Simulate a defective canary rollout v3.1 failing 25% of OAuth token refreshes.")}
                  className="px-2 py-1 bg-[#18181D] hover:bg-[#222228] text-[#CCC] text-[10px] text-left border border-[#27272A] cursor-pointer"
                >
                  Broken Canary Release
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#27272A] flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs text-[#888] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchCustom}
                disabled={!customPrompt.trim() || isExecuting}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#00F0FF] hover:bg-[#33F4FF] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_12px_#00F0FF] transition-all cursor-pointer disabled:opacity-40"
              >
                <span>Synthesize & Inject Chaos</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
