// src/components/Dashboard.tsx
"use client";

import { ScanResult } from "@/lib/scanner";
import { countBySeverity } from "@/lib/ui/helpers";
import { Shield, AlertTriangle, AlertCircle, Info as InfoIcon, CheckCircle2, FileCode, ListChecks } from "lucide-react";

interface DashboardProps {
  result: ScanResult;
}

const severityConfig = {
  CRITICAL: { color: "text-red-400", bg: "bg-red-900/30", border: "border-red-700", icon: AlertTriangle, label: "Critical" },
  HIGH:     { color: "text-orange-400", bg: "bg-orange-900/30", border: "border-orange-700", icon: AlertCircle, label: "High" },
  MEDIUM:   { color: "text-yellow-400", bg: "bg-yellow-900/30", border: "border-yellow-700", icon: InfoIcon, label: "Medium" },
  LOW:      { color: "text-blue-400", bg: "bg-blue-900/30", border: "border-blue-700", icon: InfoIcon, label: "Low" },
  INFO:     { color: "text-gray-400", bg: "bg-gray-900/30", border: "border-gray-700", icon: InfoIcon, label: "Info" },
};

export default function Dashboard({ result }: DashboardProps) {
  const counts = countBySeverity(result.findings);
  
  const scoreColor = 
    result.riskScore >= 80 ? "text-green-400" :
    result.riskScore >= 50 ? "text-yellow-400" : "text-red-400";
  
  const scoreLabel =
    result.riskScore >= 80 ? "Strong" :
    result.riskScore >= 50 ? "Needs Attention" : "Critical";

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Risk Score Card */}
      <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Security Posture Score</p>
            <div className={`text-5xl font-bold ${scoreColor}`}>
              {result.riskScore}<span className="text-2xl text-gray-500">/100</span>
            </div>
            <p className={`text-sm mt-2 ${scoreColor}`}>{scoreLabel}</p>
          </div>
          <Shield size={64} className={`${scoreColor} opacity-30`} />
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Deterministic score based on severity-weighted penalties. Not a CVSS score.
        </p>
      </div>

      {/* Findings by Severity */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Findings by Severity</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'] as const).map(sev => {
            const cfg = severityConfig[sev];
            const Icon = cfg.icon;
            return (
              <div key={sev} className={`p-3 ${cfg.bg} border ${cfg.border} rounded-lg`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className={cfg.color} />
                  <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className={`text-2xl font-bold ${cfg.color}`}>{counts[sev]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scan Stats */}
      <div>
        <h3 className="text-sm font-semibold text-gray-300 mb-2">Scan Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-center gap-3">
            <FileCode size={24} className="text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Resources Scanned</p>
              <p className="text-xl font-bold text-white">{result.resourcesScanned}</p>
            </div>
          </div>
          <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-center gap-3">
            <ListChecks size={24} className="text-purple-400" />
            <div>
              <p className="text-xs text-gray-400">Rules Executed</p>
              <p className="text-xl font-bold text-white">{result.totalRulesChecked}</p>
            </div>
          </div>
          <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-400" />
            <div>
              <p className="text-xs text-gray-400">Total Findings</p>
              <p className="text-xl font-bold text-white">{result.findings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {result.findings.length === 0 && (
        <div className="p-6 bg-green-900/20 border border-green-700 rounded-lg text-center">
          <CheckCircle2 size={48} className="text-green-400 mx-auto mb-2" />
          <p className="text-lg font-semibold text-green-400">No Vulnerabilities Found</p>
          <p className="text-sm text-gray-400 mt-1">All {result.totalRulesChecked} rules passed against {result.resourcesScanned} resources.</p>
        </div>
      )}
    </div>
  );
}