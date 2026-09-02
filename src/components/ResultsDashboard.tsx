// src/components/ResultsDashboard.tsx
"use client";

import { useState } from "react";
import { ScanResult, Finding } from "@/lib/scanner";
import Dashboard from "./Dashboard";
import FindingsList from "./FindingsList";
import FindingDetail from "./FindingDetail";
import { LayoutDashboard, List, ShieldCheck } from "lucide-react";

interface ResultsDashboardProps {
  result: ScanResult | null;
  sourceCode: string;
}

type Tab = 'dashboard' | 'findings';

export default function ResultsDashboard({ result, sourceCode }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

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
      {/* Tabs */}
      <div className="flex border-b border-gray-700 bg-gray-900" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'dashboard'}
          onClick={() => { setActiveTab('dashboard'); setSelectedFinding(null); }}
          className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'dashboard'
              ? 'text-white border-b-2 border-blue-500 bg-gray-800/50'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutDashboard size={14} /> Dashboard
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'findings'}
          onClick={() => { setActiveTab('findings'); setSelectedFinding(null); }}
          className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'findings'
              ? 'text-white border-b-2 border-blue-500 bg-gray-800/50'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <List size={14} /> Findings
          <span className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded-full">
            {result.findings.length}
          </span>
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'dashboard' && <Dashboard result={result} />}
        {activeTab === 'findings' && !selectedFinding && (
          <FindingsList findings={result.findings} onSelectFinding={setSelectedFinding} />
        )}
        {activeTab === 'findings' && selectedFinding && (
          <FindingDetail
            finding={selectedFinding}
            sourceCode={sourceCode}
            onBack={() => setSelectedFinding(null)}
          />
        )}
      </div>
    </div>
  );
}