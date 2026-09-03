// src/components/FindingList.tsx
"use client";

import { Finding } from "@/lib/scanner";
import { AlertTriangle, AlertCircle, Info, ChevronRight } from "lucide-react";

interface FindingListProps {
  findings: Finding[];
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export default function FindingList({ findings, selectedIndex, onSelect }: FindingListProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return { color: "bg-red-950/30 border-red-800/50 text-red-400", icon: AlertTriangle };
      case "HIGH":
        return { color: "bg-orange-950/30 border-orange-800/50 text-orange-400", icon: AlertTriangle };
      case "MEDIUM":
        return { color: "bg-yellow-950/30 border-yellow-800/50 text-yellow-400", icon: AlertCircle };
      case "LOW":
        return { color: "bg-blue-950/30 border-blue-800/50 text-blue-400", icon: Info };
      default:
        return { color: "bg-gray-800/30 border-gray-700 text-gray-400", icon: Info };
    }
  };

  return (
    <div className="space-y-3">
      {findings.map((finding, index) => {
        const config = getSeverityConfig(finding.severity);
        const Icon = config.icon;
        const isSelected = selectedIndex === index;

        return (
          <button
            key={`${finding.ruleId}-${index}`}
            onClick={() => onSelect(index)}
            className={`w-full text-left border rounded-lg p-4 transition-all hover:shadow-md ${
              isSelected ? `${config.color} ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-600` : `${config.color} hover:bg-opacity-50`
            }`}
            aria-expanded={isSelected}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs font-mono font-medium">{finding.ruleId}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 font-medium">
                    {finding.severity}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-gray-100 mb-1">
                  {finding.title}
                </h4>
                <p className="text-xs text-gray-400 mb-2">
                  Resource: <span className="font-mono text-gray-300">{finding.resource}</span>
                </p>
                {finding.file && (
                  <p className="text-xs text-gray-500">
                    {finding.file}{finding.line ? `:${finding.line}` : ""}
                  </p>
                )}
              </div>
              <ChevronRight className={`h-5 w-5 flex-shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`} />
            </div>
          </button>
        );
      })}
    </div>
  );
}