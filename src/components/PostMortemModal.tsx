import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Copy, 
  Check, 
  Cpu
} from 'lucide-react';
import { Incident, PostMortemReport } from '../types';

interface PostMortemModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
}

export const PostMortemModal: React.FC<PostMortemModalProps> = ({
  isOpen,
  onClose,
  incident,
}) => {
  const [report, setReport] = useState<PostMortemReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && incident) {
      fetchPostMortem();
    }
  }, [isOpen, incident]);

  const fetchPostMortem = async () => {
    if (!incident) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/post-mortem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident,
          oderExecution: incident.oderExecution,
          metricsBefore: incident.metricsSnapshot,
          metricsAfter: {
            cpuPercent: 28,
            memoryPercent: 34,
            latencyMs: 14,
            errorRatePercent: 0.02,
          }
        }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error("Failed to fetch post-mortem:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyMarkdown = () => {
    if (!report) return;
    const md = `# ${report.title}

## Executive Summary
${report.executiveSummary}

## Root Cause Analysis
${report.rootCauseAnalysis}

## Financial & SLA Impact
- **Downtime Avoided:** ${report.financialImpact.downtimeAvoidedMinutes} minutes
- **Estimated Cost Saved:** $${report.financialImpact.estimatedCostSavedUSD.toLocaleString()}
- **Remediation Execution Cost:** $${report.financialImpact.remediationToolCostUSD.toFixed(2)}

## Preventative Action Items
${report.actionItems.map(item => `- [ ] ${item}`).join('\n')}

## Model Armor & Security Audit
${report.modelArmorAudit}
`;
    navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#121215] border border-[#27272A] max-w-3xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Executive SRE Post-Mortem & Incident Briefing
              </h3>
              <p className="text-[11px] text-[#888]">
                Gemini 3.5 Flash synthesized root-cause, FinOps SLA savings, and zero-trust audit compliance
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

        {/* Content */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Cpu className="w-8 h-8 text-[#00F0FF] animate-spin mx-auto" />
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Synthesizing Executive Incident Briefing...
            </div>
            <p className="text-[11px] text-[#888] max-w-sm mx-auto">
              Analyzing telemetry diffs, O.D.E.R. reasoning traces, and FinOps metrics...
            </p>
          </div>
        ) : report ? (
          <div className="space-y-5 text-[#CCC]">
            {/* Title & Exec Summary */}
            <div className="p-4 bg-[#0A0A0C] border border-[#27272A]">
              <h4 className="text-xs font-bold text-white uppercase mb-1.5 text-[#00F0FF]">{report.title}</h4>
              <p className="leading-relaxed text-[#AAA]">{report.executiveSummary}</p>
            </div>

            {/* FinOps & SLA Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-[#0E0E10] border border-[#27272A] space-y-1">
                <span className="text-[#888] flex items-center gap-1 text-[10px] uppercase">
                  <Clock className="w-3 h-3 text-[#00F0FF]" />
                  Downtime Avoided
                </span>
                <div className="text-base font-bold text-white">
                  ~{report.financialImpact.downtimeAvoidedMinutes} min
                </div>
              </div>

              <div className="p-3.5 bg-[#0E0E10] border border-[#27272A] space-y-1">
                <span className="text-[#888] flex items-center gap-1 text-[10px] uppercase">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  Est. Outage Cost Saved
                </span>
                <div className="text-base font-bold text-emerald-400">
                  ${report.financialImpact.estimatedCostSavedUSD.toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 bg-[#0E0E10] border border-[#27272A] space-y-1">
                <span className="text-[#888] flex items-center gap-1 text-[10px] uppercase">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                  Tool Execution Cost
                </span>
                <div className="text-base font-bold text-white">
                  ${report.financialImpact.remediationToolCostUSD.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Root Cause Analysis */}
            <div className="space-y-1.5">
              <h5 className="font-bold text-white uppercase text-[10px] tracking-wider">Technical Root Cause Isolation</h5>
              <div className="p-3.5 bg-[#0E0E10] border border-[#27272A] leading-relaxed text-[#AAA]">
                {report.rootCauseAnalysis}
              </div>
            </div>

            {/* Action Items */}
            <div className="space-y-1.5">
              <h5 className="font-bold text-white uppercase text-[10px] tracking-wider">Preventative Action Items</h5>
              <div className="space-y-1.5">
                {report.actionItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 bg-[#0E0E10] border border-[#27272A]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Audit Stamp */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 flex items-center gap-2 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span><b>Model Armor Security Audit:</b> {report.modelArmorAudit}</span>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-[#27272A] flex items-center justify-between">
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#18181D] hover:bg-[#222228] text-white text-xs border border-[#27272A] transition-colors cursor-pointer"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Markdown Report'}</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#00F0FF] hover:bg-[#33F4FF] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_10px_#00F0FF] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
