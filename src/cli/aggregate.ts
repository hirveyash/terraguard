// src/cli/aggregate.ts
import { ScanResult, Finding } from '@/lib/scanner';
import { calculateRiskScore } from '@/lib/scanner/reporting/scoring';
import { allRules } from '@/lib/scanner/rules';
import { FindingsBySeverity, Severity } from './types';

export interface AggregatedResult {
  findings: Finding[];
  riskScore: number;
  totalRulesChecked: number;
  resourcesScanned: number;
  filesScanned: number;
  findingsBySeverity: FindingsBySeverity;
}

/**
 * Sort findings deterministically: file → line → ruleId.
 * This ensures identical input always produces identical output,
 * which is critical for diff stability in CI and caching.
 */
function sortFindingsDeterministic(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    if (a.line !== b.line) return a.line - b.line;
    return a.ruleId.localeCompare(b.ruleId);
  });
}

function countBySeverity(findings: Finding[]): FindingsBySeverity {
  const counts: FindingsBySeverity = {
    CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0,
  };
  for (const f of findings) {
    counts[f.severity as Severity]++;
  }
  return counts;
}

export function aggregateResults(results: ScanResult[], filesScanned: number): AggregatedResult {
  const allFindings: Finding[] = [];
  let totalResources = 0;

  for (const result of results) {
    allFindings.push(...result.findings);
    totalResources += result.resourcesScanned;
  }

  const sortedFindings = sortFindingsDeterministic(allFindings);
  const riskScore = calculateRiskScore(sortedFindings);

  return {
    findings: sortedFindings,
    riskScore,
    totalRulesChecked: allRules.length,
    resourcesScanned: totalResources,
    filesScanned,
    findingsBySeverity: countBySeverity(sortedFindings),
  };
}