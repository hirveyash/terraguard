// src/components/FindingDetail.tsx
"use client";

import { Finding } from "@/lib/scanner";
import { getCategoryFromRuleId } from "@/lib/ui/helpers";
import CodeViewer from "./CodeViewer";
import { ArrowLeft, AlertTriangle, Info, Wrench, Code, Lightbulb } from "lucide-react";

interface FindingDetailProps {
  finding: Finding;
  sourceCode: string;
  onBack: () => void;
}

const severityStyle: Record<string, string> = {
  CRITICAL: "bg-red-900/50 text-red-400 border-red-700",
  HIGH: "bg-orange-900/50 text-orange-400 border-orange-700",
  MEDIUM: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
  LOW: "bg-blue-900/50 text-blue-400 border-blue-700",
  INFO: "bg-gray-900/50 text-gray-400 border-gray-700",
};

export default function FindingDetail({ finding, sourceCode, onBack }: FindingDetailProps) {
  const category = getCategoryFromRuleId(finding.ruleId);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        aria-label="Back to findings list"
      >
        <ArrowLeft size={16} /> Back to findings
      </button>

      {/* Header */}
      <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            {finding.title}
          </h2>
          <span className={`text-xs px-2 py-1 rounded border flex-shrink-0 ${severityStyle[finding.severity]}`}>
            {finding.severity}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-400">
          <span className="bg-gray-700 px-2 py-1 rounded font-mono">{finding.ruleId}</span>
          <span className="bg-gray-700 px-2 py-1 rounded">{category}</span>
          <span className="bg-gray-700 px-2 py-1 rounded font-mono">{finding.file}:{finding.line}</span>
          <span className="bg-gray-700 px-2 py-1 rounded font-mono">{finding.resource}</span>
        </div>
      </div>

      {/* 5-part remediation */}
      <section aria-labelledby="explanation-heading">
        <h3 id="explanation-heading" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
          <Info size={14} className="text-blue-400" /> What is wrong?
        </h3>
        <p className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded border border-gray-700">
          {finding.remediation.explanation}
        </p>
      </section>

      <section aria-labelledby="impact-heading">
        <h3 id="impact-heading" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
          <AlertTriangle size={14} className="text-orange-400" /> Impact
        </h3>
        <p className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded border border-gray-700">
          {finding.remediation.impact}
        </p>
      </section>

      <section aria-labelledby="fix-heading">
        <h3 id="fix-heading" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
          <Wrench size={14} className="text-green-400" /> How to fix it
        </h3>
        <p className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded border border-gray-700">
          {finding.remediation.remediation}
        </p>
      </section>

      {/* Code viewer */}
      <section aria-labelledby="code-heading">
        <h3 id="code-heading" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
          <Code size={14} className="text-purple-400" /> Source Code (Line {finding.line})
        </h3>
        <CodeViewer source={sourceCode} targetLine={finding.line} fileName={finding.file} />
      </section>

      {/* Secure example */}
      <section aria-labelledby="example-heading">
        <h3 id="example-heading" className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-2">
          <Code size={14} className="text-green-400" /> Secure Terraform Example
        </h3>
        <pre className="text-xs bg-gray-950 p-3 rounded border border-gray-700 text-green-400 font-mono overflow-x-auto">
          <code>{finding.remediation.secureExample}</code>
        </pre>
      </section>

      {/* Auto-fix if available */}
      {finding.remediation.autoFix && (
        <section aria-labelledby="autofix-heading" className="p-3 bg-yellow-900/10 border border-yellow-700/50 rounded-lg">
          <h3 id="autofix-heading" className="flex items-center gap-2 text-sm font-semibold text-yellow-300 mb-2">
            <Lightbulb size={14} /> Suggested Auto-Fix (Requires Confirmation)
          </h3>
          <p className="text-xs text-gray-400 mb-2">{finding.remediation.autoFix.description}</p>
          <pre className="text-xs bg-gray-950 p-3 rounded border border-yellow-700/50 text-yellow-200 font-mono overflow-x-auto">
            <code>{finding.remediation.autoFix.diff}</code>
          </pre>
          <div className="mt-2 text-xs text-gray-500">
            <p className="font-semibold mb-1">Assumptions:</p>
            <ul className="list-disc list-inside space-y-1">
              {finding.remediation.autoFix.assumptions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        </section>
      )}

      {/* Framework mappings */}
      {finding.frameworks && finding.frameworks.length > 0 && (
        <section aria-labelledby="frameworks-heading">
          <h3 id="frameworks-heading" className="text-sm font-semibold text-gray-300 mb-2">
            Compliance Mappings
          </h3>
          <div className="space-y-2">
            {finding.frameworks.map((fw, i) => (
              <div key={i} className="p-2 bg-gray-800/50 border border-gray-700 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-200">{fw.framework}</span>
                  <span className="font-mono text-blue-400">v{fw.version} · {fw.control}</span>
                </div>
                <p className="text-gray-400">{fw.reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}