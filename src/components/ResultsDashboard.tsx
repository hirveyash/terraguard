// src/components/ResultsDashboard.tsx
"use client";

import { useState } from "react";
import { ScanOutput } from "@/lib/scanner";
import SecurityScore from "@/components/SecurityScore";
import ScanMetrics from "@/components/ScanMetrics";
import SeverityDistribution from "@/components/SeverityDistribution";
import FindingList from "@/components/FindingList";
import FindingDetail from "@/components/FindingDetail";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface ResultsDashboardProps {
  result: ScanOutput;
  sourceCode: string;
}

export default function ResultsDashboard({ result, sourceCode }: ResultsDashboardProps) {
  const [selectedFinding, setSelectedFinding] = useState<number | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  if ("error" in result) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        <div className="text-center p-8">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium text-red-300 mb-2">Scan Error</p>
          <p className="text-sm text-red-400">{result.error}</p>
        </div>
      </div>
    );
  }

  const findings = result.findings;
  const hasFindings = findings.length > 0;

  // Filter findings
  const filteredFindings = findings.filter((finding) => {
    const matchesSeverity = filterSeverity === "all" || finding.severity.toLowerCase() === filterSeverity;
    const matchesSearch = searchQuery === "" || 
      finding.ruleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finding.resource.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Security Score */}
        <SecurityScore score={result.riskScore} />

        {/* Metrics */}
        <ScanMetrics
          resources={result.resourcesScanned}
          rules={result.totalRulesChecked}
          findings={findings.length}
        />

        {/* Severity Distribution */}
        <SeverityDistribution findings={findings} />

        {/* Findings Section */}
        <div id="findings">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Security Findings
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({filteredFindings.length} of {findings.length})
              </span>
            </h3>
            
            {/* Search and Filter */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                aria-label="Search findings"
              />
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                aria-label="Filter by severity"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          {!hasFindings ? (
            <div className="p-8 bg-green-950/30 border border-green-800/50 rounded-lg text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-medium text-green-200 mb-1">
                No Security Findings
              </p>
              <p className="text-sm text-green-300/80">
                No security issues detected in this configuration.
              </p>
            </div>
          ) : filteredFindings.length === 0 ? (
            <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-lg text-center">
              <p className="text-sm text-gray-400">
                No findings match your current filters.
              </p>
            </div>
          ) : (
            <FindingList
              findings={filteredFindings}
              selectedIndex={selectedFinding}
              onSelect={(index) => setSelectedFinding(index)}
            />
          )}
        </div>

        {/* Finding Detail Panel */}
        {selectedFinding !== null && filteredFindings[selectedFinding] && (
          <FindingDetail
            finding={filteredFindings[selectedFinding]}
            sourceCode={sourceCode}
            onClose={() => setSelectedFinding(null)}
          />
        )}
      </div>
    </div>
  );
}