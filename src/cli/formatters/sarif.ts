// src/cli/formatters/sarif.ts
// SARIF 2.1.0 — Static Analysis Results Interchange Format
// Spec: https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html

import { AggregatedResult } from '../aggregate';
import { ScanMetadata, Severity } from '../types';
import { Finding } from '@/lib/scanner';

function severityToSarifLevel(severity: Severity): 'error' | 'warning' | 'note' | 'none' {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
    case 'INFO':
      return 'note';
    default:
      return 'none';
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

function getVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../../../package.json');
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function findingToSarifResult(finding: Finding) {
  const frameworks = normalizeFrameworks(finding.frameworks);
  
  // Bulletproof: handle both legacy string remediation and new object remediation
  const rem = finding.remediation as any;
  const remediationText = typeof rem === 'string' 
    ? rem 
    : (rem?.remediation || 'No remediation provided.');

  return {
    ruleId: finding.ruleId,
    ruleIndex: 0, // Will be updated below
    level: severityToSarifLevel(finding.severity),
    message: {
      text: `${finding.title}: ${finding.description}`,
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: {
            uri: finding.file.replace(/\\/g, '/'), // SARIF requires forward slashes
            uriBaseId: '%SRCROOT%',
          },
          region: {
            startLine: finding.line,
          },
        },
      },
    ],
    properties: {
      severity: finding.severity,
      resource: finding.resource,
      risk: finding.risk,
      remediation: remediationText,
      frameworks,
    },
  };
}

export function formatSarif(result: AggregatedResult, metadata: ScanMetadata): string {
  // Build unique rules list (preserving order of first occurrence)
  const rulesMap = new Map<string, Finding>();
  for (const f of result.findings) {
    if (!rulesMap.has(f.ruleId)) rulesMap.set(f.ruleId, f);
  }
  const uniqueRules = Array.from(rulesMap.values());
  const ruleIndexMap = new Map(uniqueRules.map((r, i) => [r.ruleId, i]));

  // Build SARIF rules with full metadata
  const sarifRules = uniqueRules.map(f => {
    const frameworks = normalizeFrameworks(f.frameworks);
    return {
      id: f.ruleId,
      name: f.ruleId,
      shortDescription: { text: f.title },
      fullDescription: { text: f.description },
      helpUri: 'https://github.com/hirveyash/terraguard/blob/main/docs/rules.md',
      properties: {
        severity: f.severity,
        tags: frameworks.map((fw: any) => `${fw.framework}:${fw.control}`),
      },
    };
  });

  // Build artifacts list (unique scanned files)
  const uniqueFiles = Array.from(new Set(result.findings.map(f => f.file))).sort();
  const artifacts = uniqueFiles.map(file => ({
    location: {
      uri: file.replace(/\\/g, '/'),
      uriBaseId: '%SRCROOT%',
    },
  }));

  // Build taxonomies for frameworks (for compliance tooling)
  const taxonomyMap = new Map<string, Set<string>>();
  for (const f of result.findings) {
    const frameworks = normalizeFrameworks(f.frameworks);
    for (const fw of frameworks) {
      const key = `${fw.framework}|${fw.version || 'unknown'}`;
      if (!taxonomyMap.has(key)) taxonomyMap.set(key, new Set());
      taxonomyMap.get(key)!.add(fw.control);
    }
  }
  const taxonomies = Array.from(taxonomyMap.entries()).map(([key, controls]) => {
    const [name, version] = key.split('|');
    return {
      name,
      version,
      organization: name.includes('CIS') ? 'Center for Internet Security' : 
                    name.includes('NIST') ? 'NIST' : 
                    name.includes('MITRE') ? 'MITRE' : 'Unknown',
      taxa: Array.from(controls).map(control => ({ id: control })),
    };
  });

  // Compute start/end times from metadata
  const startTimeUtc = metadata.scannedAt;
  const endTimeUtc = new Date(new Date(metadata.scannedAt).getTime() + metadata.durationMs).toISOString();

  // Map results with correct ruleIndex
  const sarifResults = result.findings.map(f => {
    const resultObj = findingToSarifResult(f);
    resultObj.ruleIndex = ruleIndexMap.get(f.ruleId) ?? 0;
    return resultObj;
  });

  const sarif = {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'TerraGuard',
            version: getVersion(),
            semanticVersion: getVersion(),
            informationUri: 'https://github.com/hirveyash/terraguard',
            organization: 'TerraGuard Project',
            rules: sarifRules,
          },
        },
        artifacts,
        results: sarifResults,
        taxonomies: taxonomies.length > 0 ? taxonomies : undefined,
        invocations: [
          {
            executionSuccessful: true,
            startTimeUtc,
            endTimeUtc,
            workingDirectory: {
              uri: metadata.workingDirectory.replace(/\\/g, '/') + '/',
              uriBaseId: '%SRCROOT%',
            },
            commandLine: `terraguard ${metadata.arguments.join(' ')}`,
            properties: {
              filesScanned: result.filesScanned,
              resourcesScanned: result.resourcesScanned,
              riskScore: result.riskScore,
              findingsBySeverity: result.findingsBySeverity,
              ...(metadata.failOn ? { failOn: metadata.failOn } : {}),
            },
          },
        ],
        columnKind: 'utf16CodeUnits',
        originalUriBaseIds: {
          '%SRCROOT%': {
            uri: metadata.workingDirectory.replace(/\\/g, '/') + '/',
          },
        },
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}