import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  Terminal, 
  Activity, 
  DollarSign, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  RotateCw,
  Cpu,
  Zap
} from 'lucide-react';
import { Incident } from '../types';

interface HeaderProps {
  activeIncident: Incident | null;
  autonomousMode: boolean;
  setAutonomousMode: (val: boolean) => void;
  activeTab: 'oder' | 'topology' | 'telemetry' | 'guardrails' | 'audit' | 'terminal';
  setActiveTab: (tab: 'oder' | 'topology' | 'telemetry' | 'guardrails' | 'audit' | 'terminal') => void;
  onOpenChaosModal: () => void;
  onOpenPostMortem: () => void;
  totalBurnRate: number;
  totalCostSaved: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeIncident,
  autonomousMode,
  setAutonomousMode,
  activeTab,
  setActiveTab,
  onOpenChaosModal,
  onOpenPostMortem,
  totalBurnRate,
  totalCostSaved,
}) => {
  return (
    <header id="vectra-header" className="bg-[#0A0A0B] border-b border-[#27272A] text-[#E0E0E0] sticky top-0 z-40">
      {/* Top Editorial Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#27272A] pb-5">
          {/* Brand Logo & Subtitle */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
                VECTRA<span className="text-[#00F0FF]">.</span>GOV
              </h1>
              {activeIncident && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase font-mono tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  Incident Active
                </span>
              )}
            </div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#888888] mt-2 font-mono flex items-center gap-2">
              <span>Level 4 Site Reliability Agent</span>
              <span className="text-[#444]">//</span>
              <span className="text-[#00F0FF]">Gemini 3.7 Flash</span>
              <span className="text-[#444]">//</span>
              <span>GCP & Vultr Mesh</span>
            </p>
          </div>

          {/* Editorial Key Stats & Status Indicators */}
          <div className="flex items-center gap-6 sm:gap-8 flex-wrap">
            {/* Uptime */}
            <div className="text-left md:text-right">
              <p className="text-[9px] uppercase tracking-widest text-[#888888] font-mono">Mesh Uptime</p>
              <p className="font-mono text-base sm:text-xl font-bold text-[#00F0FF]">99.9992%</p>
            </div>

            <div className="h-9 w-[1px] bg-[#27272A] hidden sm:block"></div>

            {/* Operating Mode Status */}
            <div className="text-left md:text-right">
              <p className="text-[9px] uppercase tracking-widest text-[#888888] font-mono">Remediation State</p>
              <p className={`font-mono text-base sm:text-xl font-bold ${autonomousMode ? 'text-emerald-400' : 'text-amber-400'}`}>
                {autonomousMode ? 'AUTONOMOUS' : 'SUPERVISED'}
              </p>
            </div>

            <div className="h-9 w-[1px] bg-[#27272A] hidden sm:block"></div>

            {/* FinOps Ticker */}
            <div className="text-left md:text-right">
              <p className="text-[9px] uppercase tracking-widest text-[#888888] font-mono">Live Burn / Saved</p>
              <p className="font-mono text-sm sm:text-base font-bold text-white">
                <span className="text-amber-300">${totalBurnRate.toFixed(1)}/h</span>
                <span className="text-[#555] mx-1">|</span>
                <span className="text-emerald-400">+${totalCostSaved.toLocaleString()}</span>
              </p>
            </div>

            <div className="h-9 w-[1px] bg-[#27272A] hidden lg:block"></div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-trigger-chaos"
                onClick={onOpenChaosModal}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#1A1A1E] hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 text-xs font-mono font-bold tracking-wider uppercase border border-rose-500/40 hover:border-rose-400 transition-all cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Inject Anomaly</span>
              </button>

              <button
                id="btn-post-mortem"
                onClick={onOpenPostMortem}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#121215] hover:bg-[#1A1A1E] text-slate-300 hover:text-white text-xs font-mono font-medium tracking-wider uppercase border border-[#333338] transition-all cursor-pointer"
              >
                <span>Briefing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Bar: Mode Switch & Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3">
          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar py-1">
            <button
              id="tab-oder-loop"
              onClick={() => setActiveTab('oder')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === 'oder'
                  ? 'bg-[#18181D] text-[#00F0FF] border-b-2 border-[#00F0FF] font-bold'
                  : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#121215]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'oder' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#555]'}`}></span>
              <span>O.D.E.R. Loop</span>
              {activeIncident && (
                <span className="px-1.5 py-0.2 text-[9px] bg-rose-500 text-white font-bold animate-pulse">
                  ACT
                </span>
              )}
            </button>

            <button
              id="tab-topology"
              onClick={() => setActiveTab('topology')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === 'topology'
                  ? 'bg-[#18181D] text-[#00F0FF] border-b-2 border-[#00F0FF] font-bold'
                  : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#121215]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'topology' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#555]'}`}></span>
              <span>Topology</span>
            </button>

            <button
              id="tab-telemetry"
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === 'telemetry'
                  ? 'bg-[#18181D] text-[#00F0FF] border-b-2 border-[#00F0FF] font-bold'
                  : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#121215]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'telemetry' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#555]'}`}></span>
              <span>Telemetry</span>
            </button>

            <button
              id="tab-guardrails"
              onClick={() => setActiveTab('guardrails')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === 'guardrails'
                  ? 'bg-[#18181D] text-[#00F0FF] border-b-2 border-[#00F0FF] font-bold'
                  : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#121215]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'guardrails' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#555]'}`}></span>
              <span>Guardrails</span>
            </button>

            <button
              id="tab-audit"
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#18181D] text-[#00F0FF] border-b-2 border-[#00F0FF] font-bold'
                  : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#121215]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'audit' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#555]'}`}></span>
              <span>Audit Trail</span>
            </button>

            <button
              id="tab-terminal"
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
                activeTab === 'terminal'
                  ? 'bg-[#18181D] text-[#00F0FF] border-b-2 border-[#00F0FF] font-bold'
                  : 'text-[#888888] hover:text-[#E0E0E0] hover:bg-[#121215]'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'terminal' ? 'bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]' : 'bg-[#555]'}`}></span>
              <span>SRE Copilot</span>
            </button>
          </nav>

          {/* Mode Switcher */}
          <div className="flex items-center border border-[#27272A] p-0.5 bg-[#0F0F12] text-xs font-mono self-start md:self-auto">
            <button
              id="btn-mode-auto"
              onClick={() => setAutonomousMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                autonomousMode 
                  ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]' 
                  : 'text-[#888] hover:text-[#ccc]'
              }`}
            >
              <RotateCw className={`w-3 h-3 ${autonomousMode ? 'animate-spin-slow' : ''}`} />
              <span>L4 Autonomous</span>
            </button>
            <button
              id="btn-mode-supervised"
              onClick={() => setAutonomousMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase transition-all cursor-pointer ${
                !autonomousMode 
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                  : 'text-[#888] hover:text-[#ccc]'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>Supervised</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
