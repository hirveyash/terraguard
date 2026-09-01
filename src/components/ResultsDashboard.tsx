"use client";

import { ScanResult } from "@/lib/scanner";
import { AlertTriangle, ShieldCheck, Info, Lightbulb, Code, Wrench } from "lucide-react";

interface ResultsDashboardProps {
  result: ScanResult | null;
}

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "CRITICAL": return "bg-red-900/50 text-red-400 border-red-700";
    case "HIGH": return "bg-orange-900/50 text-orange-400 border-orange-700";
    case "MEDIUM": return "bg-yellow-900/50 text-yellow-400 border-yellow-700";
    case "LOW": return "bg-blue-900/50 text-blue-400 border-blue-700";
    case "INFO": return "bg-gray-900/50 text-gray-400 border-gray-700";
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
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  {finding.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded border ${getSeverityBadge(finding.severity)}`}>
                  {finding.severity}
                </span>
              </div>

              {/* Location Info */}
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <Info size={12} />
                <span>{finding.file}:{finding.line} • {finding.resource}</span>
              </div>

              {/* 1. What is wrong? */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-1">
                  <Info size={14} className="text-blue-400" />
                  What is wrong?
                </div>
                <p className="text-sm text-gray-400 pl-5">{finding.remediation.explanation}</p>
              </div>

              {/* 2. Why it matters / What could happen? */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-1">
                  <AlertTriangle size={14} className="text-orange-400" />
                  Impact
                </div>
                <p className="text-sm text-gray-400 pl-5">{finding.remediation.impact}</p>
              </div>

              {/* 3. How to remediate */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-1">
                  <Wrench size={14} className="text-green-400" />
                  How to fix it
                </div>
                <p className="text-sm text-gray-400 pl-5">{finding.remediation.remediation}</p>
              </div>

              {/* 4. Secure Example */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-1">
                  <Code size={14} className="text-purple-400" />
                  Secure Terraform Example
                </div>
                <pre className="text-xs bg-gray-900 p-3 rounded border border-gray-700 text-green-400 font-mono overflow-x-auto pl-5">
                  <code>{finding.remediation.secureExample}</code>
                </pre>
              </div>

              {/* 5. Auto-Fix (if available) */}
              {finding.remediation.autoFix && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-1">
                    <Lightbulb size={14} className="text-yellow-400" />
                    Suggested Auto-Fix (Requires Confirmation)
                  </div>
                  <div className="pl-5">
                    <p className="text-xs text-gray-400 mb-2">{finding.remediation.autoFix.description}</p>
                    <pre className="text-xs bg-gray-900 p-3 rounded border border-yellow-700/50 text-yellow-300 font-mono overflow-x-auto">
                      <code>{finding.remediation.autoFix.diff}</code>
                    </pre>
                    <div className="mt-2 text-xs text-gray-500">
                      <p className="font-semibold mb-1">Assumptions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {finding.remediation.autoFix.assumptions.map((assumption, i) => (
                          <li key={i}>{assumption}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Framework Mappings */}
              {finding.frameworks && finding.frameworks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold">Compliance: </span>
                    {finding.frameworks.map((fw, i) => (
                      <span key={i} className="inline-block bg-gray-700 px-2 py-1 rounded mr-2 mb-1">
                        {fw.framework} {fw.control}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}