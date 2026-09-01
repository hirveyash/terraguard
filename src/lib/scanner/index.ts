// src/lib/scanner/index.ts
import { validateInput, sanitizeError } from '../security';
import { parseHCL, ParsedResource } from './parser/hcl-parser';
import { allRules } from './rules';
import { Finding, ScanResult, ScanOutput } from './reporting/types';
import { calculateRiskScore, sortFindingsBySeverity } from './reporting/scoring';

const findLineNumber = (code: string, resourceType: string, resourceName: string): number => {
  const regex = new RegExp(`resource\\s+"${resourceType}"\\s+"${resourceName}"`, 'i');
  const match = regex.exec(code);
  if (match) {
    return code.substring(0, match.index).split('\n').length;
  }
  return 1;
};

export function scanTerraformCode(code: unknown, fileName: string = 'main.tf'): ScanOutput {
  const validation = validateInput(code);
  if (!validation.valid) {
    return { error: validation.error || 'Invalid input' };
  }

  try {
    const safeCode = code as string;
    
    const parseResult = parseHCL(safeCode);
    if (!parseResult.success) {
      return { error: parseResult.error || 'Failed to parse Terraform code.' };
    }

    const findings: Finding[] = [];

    parseResult.resources.forEach((resource: ParsedResource) => {
      allRules.forEach((rule) => {
        if (rule.check(resource)) {
          findings.push({
            ruleId: rule.id,
            severity: rule.severity,
            title: rule.title,
            resource: `${resource.type}.${resource.name}`,
            file: fileName,
            line: findLineNumber(safeCode, resource.type, resource.name),
            description: rule.description,
            risk: rule.risk,
            remediation: rule.remediation,
            frameworks: rule.frameworks
          });
        }
      });
    });

    // Sort findings by severity (CRITICAL first)
    const sortedFindings = sortFindingsBySeverity(findings);

    // Calculate deterministic risk score
    const riskScore = calculateRiskScore(sortedFindings);

    return {
      findings: sortedFindings,
      riskScore,
      totalRulesChecked: allRules.length,
    };
  } catch (error) {
    return { error: sanitizeError(error) };
  }
}

export type { Finding, ScanResult, ScanOutput } from './reporting/types';