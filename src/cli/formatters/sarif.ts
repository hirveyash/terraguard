// src/cli/formatters/sarif.ts
import { RULE_MAPPINGS } from '@/lib/scanner/frameworks/mappings';

export function formatAsSarif(report: any): any {
  const findingRules = new Map();
  for (const finding of report.findings) {
    if (!findingRules.has(finding.ruleId)) {
      findingRules.set(finding.ruleId, {
        id: finding.ruleId,
        name: finding.title || finding.ruleId,
        shortDescription: { text: finding.title || finding.ruleId },
        fullDescription: { text: finding.description || '' },
        helpUri: (finding.references && finding.references.length > 0) ? finding.references[0] : 'https://github.com/hirveyash/terraguard',
        properties: {
          severity: finding.severity,
          resourceType: finding.resourceType
        }
      });
    }
  }

  const artifacts = Array.from(new Set(report.findings.map((f: any) => f.file))).map((file: string) => ({
    location: { uri: file }
  }));

  const taxonomies = Object.keys(RULE_MAPPINGS)
    .filter(k => RULE_MAPPINGS[k].length > 0)
    .map(frameworkKey => {
      const mappings = RULE_MAPPINGS[frameworkKey];
      return {
        name: mappings[0].framework,
        version: mappings[0].version,
        informationUri: 'https://github.com/hirveyash/terraguard',
        taxa: mappings.map(m => ({
          id: m.control,
          shortDescription: { text: m.reason },
          properties: {
            ruleId: frameworkKey
          }
        }))
      };
    });

  const startTime = new Date(report.scan.scannedAt);
  const endTime = new Date(startTime.getTime() + report.scan.durationMs);

  return {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'TerraGuard',
            version: report.scanner.version,
            informationUri: 'https://github.com/hirveyash/terraguard',
            rules: Array.from(findingRules.values())
          }
        },
        invocations: [
          {
            executionSuccessful: true,
            startTimeUtc: startTime.toISOString(),
            endTimeUtc: endTime.toISOString(),
            properties: {
              riskScore: report.summary.riskScore
            }
          }
        ],
        artifacts: artifacts.length > 0 ? artifacts : [{ location: { uri: report.scan.targetPath } }],
        taxonomies: taxonomies.length > 0 ? taxonomies : [],
        results: report.findings.map((f: any) => {
          const remText = typeof f.remediation === 'string' ? f.remediation : (f.remediation?.remediation || 'Review and fix this configuration.');
          return {
            ruleId: f.ruleId,
            level: f.severity === 'CRITICAL' || f.severity === 'HIGH' ? 'error' : 'warning',
            message: {
              text: `${f.title}\n\nResource: ${f.resource}\nRisk: ${f.risk}\n\nRemediation: ${remText}`
            },
            locations: [
              {
                physicalLocation: {
                  artifactLocation: {
                    uri: f.file
                  },
                  region: {
                    startLine: f.line || 1
                  }
                }
              }
            ],
            properties: {
              severity: f.severity,
              resourceType: f.resourceType
            }
          };
        })
      }
    ]
  };
}