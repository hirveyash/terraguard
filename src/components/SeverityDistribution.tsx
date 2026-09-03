// src/components/SeverityDistribution.tsx
"use client";

import { Finding } from "@/lib/scanner";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface SeverityDistributionProps {
  findings: Finding[];
}

export default function SeverityDistribution({ findings }: SeverityDistributionProps) {
  const severityCounts = {
    critical: findings.filter(f => f.severity === "CRITICAL").length,
    high: findings.filter(f => f.severity === "HIGH").length,
    medium: findings.filter(f => f.severity === "MEDIUM").length,
    low: findings.filter(f => f.severity === "LOW").length,
    info: findings.filter(f => f.severity === "INFO").length,
  };

  const severityConfig = {
    critical: { color: "bg-red-950/50 border-red-800 text-red-400", icon: AlertTriangle, label: "Critical" },
    high: { color: "bg-orange-950/50 border-orange-800 text-orange-400", icon: AlertTriangle, label: "High" },
    medium: { color: "bg-yellow-950/50 border-yellow-800 text-yellow-400", icon: AlertCircle, label: "Medium" },
    low: { color: "bg-blue-950/50 border-blue-800 text-blue-400", icon: Info, label: "Low" },
    info: { color: "bg-gray-800/50 border-gray-700 text-gray-400", icon: Info, label: "Info" },
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-3">Findings by Severity</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(severityConfig).map(([severity, config]) => {
          const Icon = config.icon;
          const count = severityCounts[severity as keyof typeof severityCounts];
          
          return (
            <div
              key={severity}
              className={`border rounded-lg p-3 ${config.color}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{config.label}</span>
              </div>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}