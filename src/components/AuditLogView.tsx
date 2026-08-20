import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Copy, 
  Check
} from 'lucide-react';
import { AuditLogEntry } from '../types';

interface AuditLogViewProps {
  auditLogs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter(log => 
    log.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.targetService.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.signatureHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copySignature = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="audit-log-view" className="space-y-6">
      {/* Header */}
      <div className="p-5 border border-[#27272A] bg-[#121215] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase font-mono tracking-wider text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero-Trust Tool Execution & OpenTelemetry Audit Trail</span>
          </h2>
          <p className="text-[11px] font-mono text-[#888] mt-0.5">
            Every autonomous remediation action is cryptographically signed, verified via Secret Manager, and recorded for compliance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative font-mono">
            <Search className="w-3.5 h-3.5 text-[#888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter audit ledger..."
              className="bg-black border border-[#27272A] pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#00F0FF]"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#121215] border border-[#27272A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#CCC]">
            <thead className="bg-[#0A0A0C] text-[#888] uppercase tracking-wider font-mono border-b border-[#27272A] text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp // ID</th>
                <th className="p-3.5">Tool Invocation</th>
                <th className="p-3.5">Target Node</th>
                <th className="p-3.5">Caller Identity</th>
                <th className="p-3.5">HMAC Signature</th>
                <th className="p-3.5">Model Armor</th>
                <th className="p-3.5">Latency & Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#18181D] transition-colors">
                  <td className="p-3.5 whitespace-nowrap">
                    <div className="font-bold text-white">{log.timestamp}</div>
                    <div className="text-[9px] text-[#666]">{log.id}</div>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-black text-[#00F0FF] font-bold border border-[#27272A]">
                      {log.toolName}()
                    </span>
                  </td>

                  <td className="p-3.5 whitespace-nowrap text-white">
                    {log.targetService}
                  </td>

                  <td className="p-3.5 whitespace-nowrap text-[#888]">
                    {log.caller}
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <button
                      onClick={() => copySignature(log.signatureHash, log.id)}
                      className="flex items-center gap-1 text-[10px] text-[#888] hover:text-[#00F0FF] bg-black px-2 py-0.5 border border-[#27272A] transition-colors cursor-pointer"
                      title="Copy HMAC Signature"
                    >
                      <span>{log.signatureHash.slice(0, 10)}...</span>
                      {copiedId === log.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </td>

                  <td className="p-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                      <ShieldCheck className="w-3 h-3" />
                      {log.modelArmorStatus}
                    </span>
                  </td>

                  <td className="p-3.5 whitespace-nowrap text-[#AAA]">
                    <div>{log.executionTimeMs} ms</div>
                    <div className="text-[10px] text-emerald-400">
                      {log.costImpactUSD === 0 ? 'Cost Neutral' : `$${log.costImpactUSD.toFixed(2)}`}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
