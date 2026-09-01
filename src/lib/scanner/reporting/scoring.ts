// src/lib/scanner/reporting/scoring.ts
import { Severity } from '../severity/types';
import { Finding } from './types';

/**
 * TerraGuard Risk Scoring Methodology
 * 
 * The risk score is a deterministic, reproducible calculation based on the
 * severity of findings detected in the Terraform configuration.
 * 
 * Severity Penalty Weights:
 * - CRITICAL: 25 points
 * - HIGH: 15 points
 * - MEDIUM: 5 points
 * - LOW: 2 points
 * - INFO: 0 points
 * 
 * Calculation:
 * Base Score = 100
 * Final Score = max(0, Base Score - sum(penalties for each finding))
 * 
 * This is NOT a CVSS score. It is a custom TerraGuard posture score designed
 * to provide a quick, deterministic assessment of infrastructure security.
 */

export const SEVERITY_PENALTIES: Record<Severity, number> = {
  CRITICAL: 25,
  HIGH: 15,
  MEDIUM: 5,
  LOW: 2,
  INFO: 0,
};

export const SEVERITY_ORDER: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

export function calculateRiskScore(findings: Finding[]): number {
  let totalPenalty = 0;
  for (const finding of findings) {
    totalPenalty += SEVERITY_PENALTIES[finding.severity] || 0;
  }
  return Math.max(0, 100 - totalPenalty);
}

export function sortFindingsBySeverity(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
  });
}