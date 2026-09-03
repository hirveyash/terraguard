// src/components/FindingDetail.tsx
"use client";

import { Finding } from "@/lib/scanner";
import CodeViewer from "@/components/CodeViewer";
import { X, Shield, AlertTriangle, BookOpen, Link as LinkIcon } from "lucide-react";

interface FindingDetailProps {
  finding: Finding;
  sourceCode: string;
  onClose: () => void;
}

export default function FindingDetail({ finding, sourceCode, onClose }: FindingDetailProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "text-red-400 bg-red-950/30 border-red-800";
      case "HIGH": return "text-orange-400 bg-orange-950/30 border-orange-800";
      case "MEDIUM": return "text-yellow-400 bg-yellow-950/30 border-yellow-800";
      case "LOW": return "text-blue-400 bg-blue-950/30 border-blue-800";
      default: return "text-gray-400 bg-gray-800/30 border-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={`border-b p-6 ${getSeverityColor(finding.severity)}`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-xs font-mono font-bold">{finding.ruleId}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 font-bold">
                  {finding.severity}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{finding.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/20 rounded-lg transition-colors"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Details */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                  Description
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{finding.description}</p>
              </div>

              {/* Risk */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Risk
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{finding.risk}</p>
              </div>

              {/* Resource Info */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Affected Resource</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Resource:</span>
                    <span className="ml-2 font-mono text-gray-200">{finding.resource}</span>
                  </div>
                  {finding.file && (
                    <div>
                      <span className="text-gray-500">File:</span>
                      <span className="ml-2 font-mono text-gray-200">{finding.file}</span>
                    </div>
                  )}
                  {finding.line && (
                    <div>
                      <span className="text-gray-500">Line:</span>
                      <span className="ml-2 font-mono text-gray-200">{finding.line}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Framework Mappings */}
              {finding.frameworks && finding.frameworks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-400" />
                    Framework Mappings
                  </h3>
                  <div className="space-y-2">
                    {finding.frameworks.map((fw, idx) => (
                      <div key={idx} className="text-sm bg-gray-800/30 border border-gray-700 rounded-lg p-3">
                        <p className="font-medium text-gray-200">{fw.framework}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Control: <span className="font-mono text-gray-300">{fw.control}</span>
                        </p>
                        {fw.reason && (
                          <p className="text-xs text-gray-500 mt-2">{fw.reason}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {finding.references && finding.references.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-green-400" />
                    References
                  </h3>
                  <ul className="space-y-1">
                    {finding.references.map((ref, idx) => (
                      <li key={idx}>
                        <a
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 underline break-all"
                        >
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column - Remediation & Code */}
            <div className="space-y-6">
              {/* Remediation */}
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Remediation</h3>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  {typeof finding.remediation === "string" ? (
                    <p className="text-sm text-gray-300 leading-relaxed">{finding.remediation}</p>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Explanation</p>
                        <p className="text-sm text-gray-300">{finding.remediation.explanation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Impact</p>
                        <p className="text-sm text-gray-300">{finding.remediation.impact}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">How to Fix</p>
                        <p className="text-sm text-gray-300">{finding.remediation.remediation}</p>
                      </div>
                      {finding.remediation.secureExample && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Secure Example</p>
                          <pre className="text-xs bg-gray-900 border border-gray-700 rounded p-3 overflow-x-auto text-gray-300">
                            {finding.remediation.secureExample}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Code Viewer */}
              {finding.line && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Source Code</h3>
                  <CodeViewer
                    code={sourceCode}
                    highlightLine={finding.line}
                    fileName={finding.file || "main.tf"}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}