// src/components/FindingsList.tsx
"use client";

import { useState, useMemo } from "react";
import { Finding } from "@/lib/scanner";
import { Severity } from "@/lib/scanner/severity/types";
import {
  getCategoryFromRuleId,
  getUniqueResourceTypes,
  getUniqueCategories,
  getUniqueRuleIds,
  filterFindings,
} from "@/lib/ui/helpers";
import { AlertTriangle, Search, Filter, X } from "lucide-react";

interface FindingsListProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

const severityStyle: Record<string, string> = {
  CRITICAL: "bg-red-900/50 text-red-400 border-red-700",
  HIGH: "bg-orange-900/50 text-orange-400 border-orange-700",
  MEDIUM: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
  LOW: "bg-blue-900/50 text-blue-400 border-blue-700",
  INFO: "bg-gray-900/50 text-gray-400 border-gray-700",
};

const ALL_SEVERITIES: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

function FilterChip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-2 py-1 text-xs rounded border transition-colors ${
        active
          ? 'bg-blue-600 border-blue-500 text-white'
          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
      }`}
    >
      {label}
    </button>
  );
}

export default function FindingsList({ findings, onSelectFinding }: FindingsListProps) {
  const [search, setSearch] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<Severity[]>([]);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const resourceTypes = useMemo(() => getUniqueResourceTypes(findings), [findings]);
  const categories = useMemo(() => getUniqueCategories(findings), [findings]);
  const ruleIds = useMemo(() => getUniqueRuleIds(findings), [findings]);

  const filtered = useMemo(
    () => filterFindings(findings, {
      severities: selectedSeverities,
      resourceTypes: selectedResourceTypes,
      categories: selectedCategories,
      ruleIds: selectedRuleIds,
      search,
    }),
    [findings, selectedSeverities, selectedResourceTypes, selectedCategories, selectedRuleIds, search]
  );

  const toggleItem = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  const clearAllFilters = () => {
    setSearch('');
    setSelectedSeverities([]);
    setSelectedResourceTypes([]);
    setSelectedCategories([]);
    setSelectedRuleIds([]);
  };

  const hasActiveFilters =
    search !== '' ||
    selectedSeverities.length > 0 ||
    selectedResourceTypes.length > 0 ||
    selectedCategories.length > 0 ||
    selectedRuleIds.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Search + filter toggle */}
      <div className="p-3 border-b border-gray-700 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search findings..."
              aria-label="Search findings"
              className="w-full pl-7 pr-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(s => !s)}
            aria-expanded={showFilters}
            aria-label="Toggle filters"
            className={`px-3 py-1.5 text-sm rounded border flex items-center gap-1 ${
              showFilters || hasActiveFilters
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
            }`}
          >
            <Filter size={14} />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 bg-white text-blue-600 text-xs font-bold px-1.5 rounded-full">
                {selectedSeverities.length + selectedResourceTypes.length + selectedCategories.length + selectedRuleIds.length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="space-y-2 pt-2 border-t border-gray-700">
            <div>
              <p className="text-xs text-gray-500 mb-1">Severity</p>
              <div className="flex flex-wrap gap-1">
                {ALL_SEVERITIES.map(s => (
                  <FilterChip
                    key={s}
                    label={s}
                    active={selectedSeverities.includes(s)}
                    onClick={() => setSelectedSeverities(toggleItem(selectedSeverities, s))}
                  />
                ))}
              </div>
            </div>
            {categories.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Category</p>
                <div className="flex flex-wrap gap-1">
                  {categories.map(c => (
                    <FilterChip
                      key={c}
                      label={c}
                      active={selectedCategories.includes(c)}
                      onClick={() => setSelectedCategories(toggleItem(selectedCategories, c))}
                    />
                  ))}
                </div>
              </div>
            )}
            {resourceTypes.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Resource Type</p>
                <div className="flex flex-wrap gap-1">
                  {resourceTypes.map(r => (
                    <FilterChip
                      key={r}
                      label={r}
                      active={selectedResourceTypes.includes(r)}
                      onClick={() => setSelectedResourceTypes(toggleItem(selectedResourceTypes, r))}
                    />
                  ))}
                </div>
              </div>
            )}
            {ruleIds.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Rule ID</p>
                <div className="flex flex-wrap gap-1">
                  {ruleIds.map(r => (
                    <FilterChip
                      key={r}
                      label={r}
                      active={selectedRuleIds.includes(r)}
                      onClick={() => setSelectedRuleIds(toggleItem(selectedRuleIds, r))}
                    />
                  ))}
                </div>
              </div>
            )}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500">
          Showing {filtered.length} of {findings.length} findings
        </p>
      </div>

      {/* Findings list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No findings match your filters.</p>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className="text-xs text-blue-400 hover:underline mt-2">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          filtered.map((finding, idx) => (
            <button
              key={`${finding.ruleId}-${finding.resource}-${idx}`}
              onClick={() => onSelectFinding(finding)}
              className="w-full text-left p-3 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
              aria-label={`View details for ${finding.title}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />
                  {finding.title}
                </h4>
                <span className={`text-xs px-1.5 py-0.5 rounded border flex-shrink-0 ${severityStyle[finding.severity]}`}>
                  {finding.severity}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs text-gray-500">
                <span className="font-mono bg-gray-900 px-1.5 py-0.5 rounded">{finding.ruleId}</span>
                <span className="bg-gray-900 px-1.5 py-0.5 rounded">{getCategoryFromRuleId(finding.ruleId)}</span>
                <span className="font-mono bg-gray-900 px-1.5 py-0.5 rounded">{finding.file}:{finding.line}</span>
                <span className="font-mono bg-gray-900 px-1.5 py-0.5 rounded truncate max-w-[200px]">{finding.resource}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}