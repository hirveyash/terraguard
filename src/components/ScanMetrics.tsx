// src/components/ScanMetrics.tsx
"use client";

import { FileCode, ShieldCheck, AlertTriangle } from "lucide-react";

interface ScanMetricsProps {
  resources: number;
  rules: number;
  findings: number;
}

export default function ScanMetrics({ resources, rules, findings }: ScanMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-950/50 rounded-lg">
            <FileCode className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Resources Scanned</p>
            <p className="text-2xl font-bold text-white">{resources}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-950/50 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Rules Executed</p>
            <p className="text-2xl font-bold text-white">{rules}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-950/50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Findings</p>
            <p className="text-2xl font-bold text-white">{findings}</p>
          </div>
        </div>
      </div>
    </div>
  );
}