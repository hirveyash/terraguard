// src/cli/formatters/text.ts
import { AggregatedResult } from '../aggregate';

const SEVERITY_PAD = 10;
const RULE_PAD = 14;

export function formatText(result: AggregatedResult): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('TerraGuard IaC Security Scanner');
  lines.push('═'.repeat(50));
  lines.push('');
  lines.push(`Files scanned:      ${result.filesScanned}`);
  lines.push(`Resources analyzed: ${result.resourcesScanned}`);
  lines.push(`Rules executed:     ${result.totalRulesChecked}`);
  lines.push('');

  if (result.findings.length === 0) {
    lines.push('✓ No security findings detected.');
    lines.push('');
    lines.push(`Security Score: ${result.riskScore}/100`);
    lines.push('');
    return lines.join('\n');
  }

  lines.push('Findings:');
  lines.push('─'.repeat(50));

  for (const finding of result.findings) {
    const severity = finding.severity.padEnd(SEVERITY_PAD);
    const ruleId = finding.ruleId.padEnd(RULE_PAD);
    const location = `${finding.file}:${finding.line}`;
    lines.push(`${severity} ${ruleId} ${finding.title}`);
    lines.push(`           → ${finding.resource} (${location})`);
  }

  lines.push('');
  lines.push('─'.repeat(50));
  lines.push(`Security Score: ${result.riskScore}/100`);
  lines.push(`${result.findings.length} finding${result.findings.length === 1 ? '' : 's'}`);
  lines.push('');

  return lines.join('\n');
}