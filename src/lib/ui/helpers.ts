// src/lib/ui/helpers.ts
import { Finding, ScanResult } from '@/lib/scanner';
import { Severity } from '@/lib/scanner/severity/types';

/**
 * Derive a human-readable category from a rule ID.
 * e.g., "TG-IAM-001" -> "IAM", "TG-NET-003" -> "Network"
 */
export function getCategoryFromRuleId(ruleId: string): string {
  const prefix = ruleId.split('-')[1];
  const mapping: Record<string, string> = {
    IAM: 'IAM',
    S3: 'Storage',
    EBS: 'Storage',
    RDS: 'Database',
    KMS: 'Encryption',
    SEC: 'Secrets',
    NET: 'Network',
    NACL: 'Network',
    EC2: 'Compute',
    LOG: 'Logging',
  };
  return mapping[prefix] || 'Other';
}

/**
 * Extract unique resource types from findings.
 * e.g., ["aws_s3_bucket.my-bucket", "aws_ebs_volume.data"] -> ["aws_s3_bucket", "aws_ebs_volume"]
 */
export function getUniqueResourceTypes(findings: Finding[]): string[] {
  const types = new Set<string>();
  findings.forEach(f => {
    const type = f.resource.split('.')[0];
    types.add(type);
  });
  return Array.from(types).sort();
}

/**
 * Extract unique categories from findings.
 */
export function getUniqueCategories(findings: Finding[]): string[] {
  const categories = new Set<string>();
  findings.forEach(f => categories.add(getCategoryFromRuleId(f.ruleId)));
  return Array.from(categories).sort();
}

/**
 * Extract unique rule IDs that actually triggered.
 */
export function getUniqueRuleIds(findings: Finding[]): string[] {
  const ids = new Set<string>();
  findings.forEach(f => ids.add(f.ruleId));
  return Array.from(ids).sort();
}

/**
 * Count findings by severity.
 */
export function countBySeverity(findings: Finding[]): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0,
  };
  findings.forEach(f => {
    counts[f.severity] = (counts[f.severity] || 0) + 1;
  });
  return counts;
}

/**
 * Apply filters and search to a list of findings.
 */
export function filterFindings(
  findings: Finding[],
  filters: {
    severities?: Severity[];
    resourceTypes?: string[];
    categories?: string[];
    ruleIds?: string[];
    search?: string;
  }
): Finding[] {
  return findings.filter(f => {
    if (filters.severities && filters.severities.length > 0) {
      if (!filters.severities.includes(f.severity)) return false;
    }
    if (filters.resourceTypes && filters.resourceTypes.length > 0) {
      const type = f.resource.split('.')[0];
      if (!filters.resourceTypes.includes(type)) return false;
    }
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(getCategoryFromRuleId(f.ruleId))) return false;
    }
    if (filters.ruleIds && filters.ruleIds.length > 0) {
      if (!filters.ruleIds.includes(f.ruleId)) return false;
    }
    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase();
      const haystack = [
        f.title,
        f.description,
        f.resource,
        f.ruleId,
        f.remediation.explanation,
        f.remediation.impact,
        f.remediation.remediation,
      ].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Get lines of context around a target line number.
 * Returns { lines, startLine } where lines is an array of { number, content }.
 */
export function getCodeContext(
  source: string,
  targetLine: number,
  contextRadius: number = 5
): { lines: { number: number; content: string }[]; startLine: number } {
  const allLines = source.split('\n');
  const totalLines = allLines.length;
  
  // Clamp target line to valid range
  const safeTarget = Math.max(1, Math.min(targetLine, totalLines));
  
  const startLine = Math.max(1, safeTarget - contextRadius);
  const endLine = Math.min(totalLines, safeTarget + contextRadius);
  
  const lines = [];
  for (let i = startLine; i <= endLine; i++) {
    lines.push({
      number: i,
      content: allLines[i - 1] || '',
    });
  }
  
  return { lines, startLine };
}