// src/components/ResultsDashboard.tsx
"use client";

import { ScanResult } from "@/lib/scanner";
import { ShieldAlert, ShieldCheck, AlertTriangle, Info } from "lucide-react";

interface ResultsDashboardProps {
  result: ScanResult | null;
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 border border-gray-700 rounded-lg bg-gray-900/50">
        <p>Run a scan to see security findings...</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-500";
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-900/50 text-red-400 border-red-700";
      case "HIGH": return "bg-orange-900/50 text-orange-400 border-orange-700";
      case "MEDIUM": return "bg-yellow-900/50 text-yellow-400 border-yellow-700";
      default: return "bg-blue-900/50 text-blue-400 border-blue-700";
    }
  };

  return (
    <div className="h-full flex flex-col border border-gray-700 rounded-lg bg-gray-900/50 overflow-hidden">
      <div className="p-6 border-b border-gray-700 flex items-center justify-between bg-gray-800/50">
        <div className="flex items-center gap-3">
          {result.riskScore >= 80 ? <ShieldCheck className="text-green-400" size={32}/> : <ShieldAlert className="text-red-500" size={32}/>}
          <div>
            <h2 className="text-xl font-bold text-white">Security Posture</h2>
            <p className="text-sm text-gray-400">{result.totalRulesChecked} CIS Rules Checked</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Risk Score</p>
          <p className={`text-4xl font-bold ${getScoreColor(result.riskScore)}`}>{result.riskScore}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {result.findings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-green-400">
            <ShieldCheck size={48} />
            <p className="mt-2 text-lg font-semibold">No Vulnerabilities Found!</p>
            <p className="text-sm text-gray-400">Your infrastructure is secure.</p>
          </div>
        ) : (
          result.findings.map((finding, index) => (
            <div key={index} className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  {finding.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded border ${getSeverityBadge(finding.severity)}`}>
                  {finding.severity}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">{finding.description}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Info size={12} />
                <span>Line {finding.lineNumber} • {finding.resourceType}</span>
              </div>
              <div className="bg-gray-900 p-2 rounded text-xs text-green-400 font-mono border border-gray-700">
                <span className="text-gray-500">Fix: </span>{finding.remediation}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}