import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Activity, 
  Cpu, 
  Server, 
  DollarSign, 
  Flame, 
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { Microservice, TelemetryPoint, Incident } from '../types';

interface TelemetryDashboardProps {
  services: Microservice[];
  telemetryHistory: TelemetryPoint[];
  activeIncident: Incident | null;
  onSelectService: (service: Microservice) => void;
  onInjectForService: (serviceId: string) => void;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  services,
  telemetryHistory,
  activeIncident,
  onSelectService,
  onInjectForService,
}) => {
  const avgCpu = Math.round(services.reduce((acc, s) => acc + s.cpuPercent, 0) / services.length);
  const avgMemory = Math.round(services.reduce((acc, s) => acc + s.memoryPercent, 0) / services.length);
  const totalRps = services.reduce((acc, s) => acc + s.rps, 0);
  const totalCost = services.reduce((acc, s) => acc + s.costPerHour, 0);

  return (
    <div id="telemetry-dashboard" className="space-y-6">
      {/* Top Editorial Metric Quad */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cluster CPU */}
        <div className="p-5 border border-[#27272A] bg-[#121215] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-[#888]">
            <span>Cluster CPU Load</span>
            <Cpu className="w-3.7 h-3.7 text-[#00F0FF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">{avgCpu}%</span>
            <span className={`text-[10px] font-mono uppercase ${avgCpu > 70 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
              {avgCpu > 70 ? '+42% SURGE' : 'NOMINAL'}
            </span>
          </div>
          <div className="w-full bg-[#27272A] h-1">
            <div 
              className={`h-full ${avgCpu > 80 ? 'bg-rose-500' : avgCpu > 60 ? 'bg-amber-500' : 'bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]'}`} 
              style={{ width: `${avgCpu}%` }}
            />
          </div>
        </div>

        {/* Cluster Memory */}
        <div className="p-5 border border-[#27272A] bg-[#121215] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-[#888]">
            <span>Memory Allocation</span>
            <Server className="w-3.7 h-3.7 text-[#00F0FF]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">{avgMemory}%</span>
            <span className="text-[10px] font-mono text-[#666]">/ 64GB POOL</span>
          </div>
          <div className="w-full bg-[#27272A] h-1">
            <div 
              className="bg-[#00F0FF] h-full shadow-[0_0_6px_#00F0FF]" 
              style={{ width: `${avgMemory}%` }}
            />
          </div>
        </div>

        {/* Throughput */}
        <div className="p-5 border border-[#27272A] bg-[#121215] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-[#888]">
            <span>Aggregate Ingress</span>
            <Activity className="w-3.7 h-3.7 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white tracking-tight">{totalRps.toLocaleString()}</span>
            <span className="text-[10px] font-mono text-[#888]">RPS</span>
          </div>
          <div className="text-[9px] font-mono text-[#666] uppercase">Across 7 Regional Mesh Nodes</div>
        </div>

        {/* FinOps Hourly Burn */}
        <div className="p-5 border border-[#27272A] bg-[#121215] space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-widest text-[#888]">
            <span>Real-Time FinOps Burn</span>
            <DollarSign className="w-3.7 h-3.7 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-300 tracking-tight">${totalCost.toFixed(2)}</span>
            <span className="text-[10px] font-mono text-[#888]">/ HR</span>
          </div>
          <div className="text-[9px] font-mono text-[#666] uppercase">Model Armor Cap: $500/hr</div>
        </div>
      </div>

      {/* Active Incident Telemetry Warning Alert */}
      {activeIncident && (
        <div className="p-4 border border-rose-500/50 bg-rose-950/30 flex items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse shrink-0" />
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Anomaly Ingested: {activeIncident.title}</span>
                <span className="text-rose-400">[{activeIncident.serviceName}]</span>
              </div>
              <p className="text-[11px] text-rose-200/70 mt-0.5">
                Vectra telemetry sentinel triggered O.D.E.R. evaluation. Live charts reflect active degradation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Charts with Editorial Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Latency & Error Rate */}
        <div className="border border-[#27272A] bg-[#121215] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-white flex items-center gap-2">
                <span className="text-[#00F0FF]">///</span>
                P99 Latency vs 5xx Error Rate
              </h3>
              <p className="text-[10px] font-mono text-[#888]">Real-time edge degradation metrics</p>
            </div>
            <span className="text-[9px] font-mono text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 border border-[#00F0FF]/30">
              1-SEC STREAM
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43.7e" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#f43.7e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#27272A" />
                <XAxis dataKey="time" stroke="#555" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis yAxisId="left" stroke="#00F0FF" fontSize={10} fontFamily="JetBrains Mono" unit="ms" />
                <YAxis yAxisId="right" orientation="right" stroke="#f43.7e" fontSize={10} fontFamily="JetBrains Mono" unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0C', borderColor: '#27272A', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '8px' }} />
                <Area yAxisId="left" type="monotone" dataKey="latency" name="P99 Latency (ms)" stroke="#00F0FF" fillOpacity={1} fill="url(#latencyGradient)" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="errorRate" name="5xx Errors (%)" stroke="#f43.7e" fillOpacity={1} fill="url(#errorGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Real-time FinOps Burn Rate */}
        <div className="border border-[#27272A] bg-[#121215] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold text-white flex items-center gap-2">
                <span className="text-amber-400">///</span>
                FinOps Real-Time Hourly Burn Rate ($/hr)
              </h3>
              <p className="text-[10px] font-mono text-[#888]">Autonomous spend anomaly detection</p>
            </div>
            <span className="text-[9px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 border border-amber-500/30">
              BILLING API
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <defs>
                  <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#27272A" />
                <XAxis dataKey="time" stroke="#555" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#f59e0b" fontSize={10} fontFamily="JetBrains Mono" unit="$" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0A0C', borderColor: '#27272A', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="costPerHour" name="Hourly Burn ($/hr)" stroke="#f59e0b" fillOpacity={1} fill="url(#costGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monitored Microservices Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <h3 className="text-xs font-mono uppercase tracking-[0.25em] font-bold text-white flex items-center gap-2">
            <span className="text-[#00F0FF]">///</span>
            Monitored Microservices & Compute Units ({services.length})
          </h3>
          <span className="text-[10px] font-mono text-[#888]">
            US-CENTRAL1 // US-EAST4
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((service) => {
            const isCritical = service.status === 'CRITICAL';
            const isHealing = service.status === 'HEALING';

            return (
              <div 
                key={service.id}
                className={`p-4 border transition-all flex flex-col justify-between ${
                  isCritical 
                    ? 'bg-rose-950/30 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.2)]' 
                    : isHealing
                    ? 'bg-cyan-950/30 border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                    : 'bg-[#121215] border-[#27272A] hover:border-[#444]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border ${
                      isCritical ? 'bg-rose-950 text-rose-400 border-rose-500/50' :
                      isHealing ? 'bg-cyan-950 text-[#00F0FF] border-[#00F0FF]/50' :
                      'bg-emerald-950 text-emerald-400 border-emerald-500/50'
                    }`}>
                      {service.status}
                    </span>
                    <span className="text-[10px] font-mono text-[#888]">{service.region}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white truncate font-mono">{service.name}</h4>
                  <div className="text-[10px] font-mono text-[#888] mb-3">{service.type} // {service.instances} Pods</div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center text-[#AAA]">
                      <span>CPU:</span>
                      <span className={`font-bold ${service.cpuPercent > 80 ? 'text-rose-400' : 'text-white'}`}>
                        {service.cpuPercent}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#AAA]">
                      <span>RAM:</span>
                      <span className={`font-bold ${service.memoryPercent > 85 ? 'text-rose-400' : 'text-white'}`}>
                        {service.memoryPercent}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#AAA]">
                      <span>LATENCY:</span>
                      <span className={`font-bold ${service.latencyMs > 500 ? 'text-rose-400' : 'text-white'}`}>
                        {service.latencyMs}ms
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[#AAA]">
                      <span>BURN:</span>
                      <span className="font-bold text-amber-300">
                        ${service.costPerHour.toFixed(2)}/h
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between">
                  <button
                    onClick={() => onSelectService(service)}
                    className="text-[11px] font-mono text-[#00F0FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onInjectForService(service.id)}
                    className="text-[10px] font-mono uppercase text-[#888] hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Flame className="w-3 h-3 text-rose-500" />
                    <span>Chaos</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
