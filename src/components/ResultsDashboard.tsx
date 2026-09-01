"use client";

import { ScanResult } from "@/lib/scanner";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";

interface ResultsDashboardProps {
  result: ScanResult | null;
}

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "CRITICAL": return "bg-red-900/50 text-red-400 border-red-700";
    case "HIGH": return "bg-orange-900/50 text-orange-400 border-orange-700";
    case "MEDIUM": return "bg-yellow-900/50 text-yellow-400 border-yellow-700";
    default: return "bg-blue-900/50 text-blue-400 border-blue-700";
  }
};

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        <ShieldCheck size={48} className="mb-4 opacity-30" />
        <p className="text-lg">Run a scan to see security findings...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col border border-gray-700 rounded-lg bg-gray-900/50 overflow-hidden">
      {/* Summary Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold">Scan Summary</h3>
            <p className="text-sm text-gray-400">
              {result.findings.length} {result.findings.length === 1 ? 'finding' : 'findings'} • {result.totalRulesChecked} rules checked
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              result.riskScore >= 80 ? 'text-green-400' :
              result.riskScore >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {result.riskScore}/100
            </div>
            <p className="text-xs text-gray-400">Risk Score</p>
          </div>
        </div>
      </div>

      {/* Findings List */}
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
                <span>Line {finding.lineNumber} • {finding.resourceType} • {finding.framework}</span>
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