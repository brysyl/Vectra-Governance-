import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Lock, 
  Flame 
} from 'lucide-react';
import { Microservice, Incident } from '../types';

interface TopologyMapProps {
  services: Microservice[];
  activeIncident: Incident | null;
  onInjectForService: (serviceId: string) => void;
  onSelectService: (service: Microservice) => void;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({
  services,
  activeIncident,
  onInjectForService,
  onSelectService,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('api-gateway');

  const selectedService = services.find(s => s.id === selectedNodeId) || services[0];

  return (
    <div id="topology-map-view" className="space-y-6">
      {/* Top Architecture Summary */}
      <div className="p-5 border border-[#27272A] bg-[#121215] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase font-mono tracking-wider text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00F0FF]" />
            <span>Infrastructure Topology & Zero-Trust Service Mesh</span>
          </h2>
          <p className="text-[11px] font-mono text-[#888] mt-0.5">
            Real-time interactive node graph with autonomous healing hooks, gVisor sandboxing, and Model Armor sentinels
          </p>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10B981]"></span>
            <span>NOMINAL</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>CRITICAL</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#00F0FF]">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]"></span>
            <span>HEALING</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Architecture Canvas (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0A0A0C] border border-[#27272A] p-6 relative overflow-hidden min-h-[520px] flex flex-col justify-between">
          {/* Subtle Grid Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272A15_1px,transparent_1px),linear-gradient(to_bottom,#27272A15_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* Vectra SRE Sentinel Overlay at the Top */}
          <div className="relative z-10 flex items-center justify-between bg-[#121215] border border-[#00F0FF]/40 p-3.5 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span>Vectra Autonomous Agent Sentinel</span>
                  <span className="px-1.5 py-0.2 text-[9px] bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40">
                    ADK CORE
                  </span>
                </div>
                <div className="text-[10px] font-mono text-[#888]">
                  Continuous telemetry polling • Model Armor active • 0 unverified tool calls
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <Lock className="w-3 h-3" />
              <span>SPIFFE mTLS 1.3</span>
            </div>
          </div>

          {/* Architecture Tier Nodes */}
          <div className="relative z-10 py-6 space-y-6">
            {/* TIER 1: Ingress Layer */}
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#666] mb-2">
                Tier 01: Edge & Ingress Perimeter
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.filter(s => s.id === 'api-gateway').map((s) => (
                  <NodeCard 
                    key={s.id} 
                    service={s} 
                    isSelected={selectedNodeId === s.id}
                    onSelect={() => setSelectedNodeId(s.id)}
                    activeIncident={activeIncident}
                  />
                ))}
                
                {/* Cloud Armor Virtual Node */}
                <div className="p-3 bg-[#121215] border border-[#27272A] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00F0FF]" />
                    <div>
                      <div className="font-bold text-white">Cloud Armor WAF</div>
                      <div className="text-[10px] text-[#888]">Rate Limit: 120 rpm/IP</div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold">
                    ARMED
                  </span>
                </div>
              </div>
            </div>

            {/* TIER 2: Microservices Layer */}
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#666] mb-2">
                Tier 02: Compute & Microservices Mesh
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {services.filter(s => ['auth-service', 'inventory-service', 'payment-api'].includes(s.id)).map((s) => (
                  <NodeCard 
                    key={s.id} 
                    service={s} 
                    isSelected={selectedNodeId === s.id}
                    onSelect={() => setSelectedNodeId(s.id)}
                    activeIncident={activeIncident}
                  />
                ))}
              </div>
            </div>

            {/* TIER 3: Data, Cache & GPU Layer */}
            <div>
              <div className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#666] mb-2">
                Tier 03: Persistence, Caching & AI Inference
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {services.filter(s => ['orders-db', 'catalog-cache', 'vertex-gpu-worker'].includes(s.id)).map((s) => (
                  <NodeCard 
                    key={s.id} 
                    service={s} 
                    isSelected={selectedNodeId === s.id}
                    onSelect={() => setSelectedNodeId(s.id)}
                    activeIncident={activeIncident}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Connectivity Bar */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-[#666] border-t border-[#27272A] pt-3">
            <span>Envoy mTLS 1.3</span>
            <span>OTLP/gRPC 4.8k msg/s</span>
            <span>gke-prod-us-central1</span>
          </div>
        </div>

        {/* Selected Node Inspector (1 Col) */}
        <div className="bg-[#121215] border border-[#27272A] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="border-b border-[#27272A] pb-4">
              <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border ${
                selectedService.status === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border-rose-500/50' :
                selectedService.status === 'HEALING' ? 'bg-cyan-950 text-[#00F0FF] border-[#00F0FF]/50' :
                'bg-emerald-950 text-emerald-400 border-emerald-500/50'
              }`}>
                {selectedService.status}
              </span>
              <h3 className="text-base font-bold text-white mt-2 font-mono">{selectedService.name}</h3>
              <span className="text-[11px] text-[#888] font-mono">{selectedService.type} // {selectedService.region}</span>
            </div>

            {/* Microservice Metrics List */}
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-[#0E0E11] border border-[#27272A] flex items-center justify-between">
                <span className="text-[#888]">CPU Load:</span>
                <span className={`font-bold ${selectedService.cpuPercent > 80 ? 'text-rose-400' : 'text-white'}`}>
                  {selectedService.cpuPercent}%
                </span>
              </div>

              <div className="p-2.5 bg-[#0E0E11] border border-[#27272A] flex items-center justify-between">
                <span className="text-[#888]">RAM Load:</span>
                <span className={`font-bold ${selectedService.memoryPercent > 85 ? 'text-rose-400' : 'text-white'}`}>
                  {selectedService.memoryPercent}%
                </span>
              </div>

              <div className="p-2.5 bg-[#0E0E11] border border-[#27272A] flex items-center justify-between">
                <span className="text-[#888]">P99 Latency:</span>
                <span className={`font-bold ${selectedService.latencyMs > 500 ? 'text-rose-400' : 'text-white'}`}>
                  {selectedService.latencyMs} ms
                </span>
              </div>

              <div className="p-2.5 bg-[#0E0E11] border border-[#27272A] flex items-center justify-between">
                <span className="text-[#888]">Replicas:</span>
                <span className="font-bold text-white">{selectedService.instances}</span>
              </div>

              <div className="p-2.5 bg-[#0E0E11] border border-[#27272A] flex items-center justify-between">
                <span className="text-[#888]">Hourly Burn:</span>
                <span className="font-bold text-amber-300">${selectedService.costPerHour.toFixed(2)}/h</span>
              </div>
            </div>

            {/* Service Tags */}
            <div className="space-y-1.5 font-mono">
              <span className="text-[10px] uppercase tracking-wider text-[#888]">Capabilities</span>
              <div className="flex flex-wrap gap-1">
                {selectedService.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#18181D] border border-[#27272A] text-[#CCC] text-[10px]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#27272A]">
            <button
              onClick={() => onInjectForService(selectedService.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1A1A1E] hover:bg-rose-950/40 text-rose-400 text-xs font-mono font-bold tracking-wider uppercase border border-rose-500/50 hover:border-rose-400 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              <span>Trigger Chaos on this Node</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NodeCardProps {
  service: Microservice;
  isSelected: boolean;
  onSelect: () => void;
  activeIncident: Incident | null;
}

const NodeCard: React.FC<NodeCardProps> = ({ service, isSelected, onSelect }) => {
  const isCritical = service.status === 'CRITICAL';
  const isHealing = service.status === 'HEALING';

  return (
    <button
      onClick={onSelect}
      className={`p-3 border text-left transition-all relative cursor-pointer font-mono ${
        isSelected
          ? 'bg-[#18181D] border-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.3)]'
          : isCritical
          ? 'bg-rose-950/40 border-rose-500 animate-pulse'
          : isHealing
          ? 'bg-cyan-950/40 border-[#00F0FF]'
          : 'bg-[#121215] border-[#27272A] hover:border-[#444]'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] text-[#888] uppercase">{service.type}</span>
        <span className={`w-1.5 h-1.5 rounded-full ${
          isCritical ? 'bg-rose-500 animate-ping' :
          isHealing ? 'bg-[#00F0FF]' :
          'bg-emerald-400'
        }`} />
      </div>

      <div className="text-xs font-bold text-white truncate">{service.name}</div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-[#888]">
        <span>CPU: <b className={service.cpuPercent > 80 ? 'text-rose-400' : 'text-white'}>{service.cpuPercent}%</b></span>
        <span>{service.latencyMs}ms</span>
      </div>
    </button>
  );
};
