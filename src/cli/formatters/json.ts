// src/cli/formatters/json.ts
import { AggregatedResult } from '../aggregate';
import { ScanMetadata, Severity, REPORT_SCHEMA_VERSION } from '../types';
import { Finding } from '@/lib/scanner';

function getVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../../../package.json');
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function normalizeFrameworks(frameworks: any): any[] {
  if (!frameworks) return [];
  if (Array.isArray(frameworks)) return frameworks;
  if (typeof frameworks === 'object') {
    return Object.entries(frameworks).map(([k, v]) => ({
      framework: k,
      control: String(v),
      version: 'unknown',
      reason: '',
    }));
  }
  return [];
}

function extractResourceType(resource: string): string {
  const dotIndex = resource.indexOf('.');
  return dotIndex > 0 ? resource.substring(0, dotIndex) : resource;
}

function formatFinding(f: Finding) {
  // Bulletproof: handle both legacy string remediation and new object remediation
  const rem = f.remediation as any;
  const remediationObj = typeof rem === 'string' 
    ? { 
        explanation: rem, 
        impact: rem, 
        remediation: rem, 
        secureExample: rem 
      }
    : {
        explanation: rem?.explanation || 'No explanation provided.',
        impact: rem?.impact || 'No impact provided.',
        remediation: rem?.remediation || 'No remediation provided.',
        secureExample: rem?.secureExample || 'No secure example provided.',
        ...(rem?.autoFix ? { autoFix: rem.autoFix } : {}),
      };

  return {
    ruleId: f.ruleId,
    severity: f.severity,
    title: f.title,
    resource: f.resource,
    resourceType: extractResourceType(f.resource),
    file: f.file,
    line: f.line,
    description: f.description,
    risk: f.risk,
    remediation: remediationObj,
    frameworks: normalizeFrameworks(f.frameworks),
    references: f.references || [],
  };
}

export function formatJson(result: AggregatedResult, metadata: ScanMetadata): string {
  const report = {
    $schema: 'https://raw.githubusercontent.com/hirveyash/terraguard/main/schemas/terraguard-report.schema.json',
    version: REPORT_SCHEMA_VERSION,
    scanner: {
      name: 'TerraGuard',
      version: getVersion(),
      homepage: 'https://github.com/hirveyash/terraguard',
    },
    scan: {
      scannedAt: metadata.scannedAt,
      durationMs: metadata.durationMs,
      targetPath: metadata.targetPath,
      workingDirectory: metadata.workingDirectory,
      arguments: metadata.arguments,
      ...(metadata.failOn ? { failOn: metadata.failOn } : {}),
    },
    summary: {
      filesScanned: result.filesScanned,
      resourcesScanned: result.resourcesScanned,
      totalRulesChecked: result.totalRulesChecked,
      riskScore: result.riskScore,
      findingsCount: result.findings.length,
      findingsBySeverity: result.findingsBySeverity,
    },
    findings: result.findings.map(formatFinding),
  };

  return JSON.stringify(report, null, 2);
}