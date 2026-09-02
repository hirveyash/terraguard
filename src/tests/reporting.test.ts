// src/tests/reporting.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { runScan } from '@/cli/commands/scan';
import { REPORT_SCHEMA_VERSION } from '@/cli/types';

function validateJsonReport(report: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (report.version !== REPORT_SCHEMA_VERSION) {
    errors.push(`version must be "${REPORT_SCHEMA_VERSION}", got "${report.version}"`);
  }
  if (!report.scanner || report.scanner.name !== 'TerraGuard') {
    errors.push('scanner.name must be "TerraGuard"');
  }
  if (!report.scanner?.version) {
    errors.push('scanner.version is required');
  }
  if (!report.scan?.scannedAt || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(report.scan.scannedAt)) {
    errors.push('scan.scannedAt must be ISO 8601');
  }
  if (typeof report.scan?.durationMs !== 'number' || report.scan.durationMs < 0) {
    errors.push('scan.durationMs must be a non-negative integer');
  }
  if (!report.scan?.targetPath) errors.push('scan.targetPath is required');
  if (!Array.isArray(report.scan?.arguments)) errors.push('scan.arguments must be an array');

  const summary = report.summary;
  if (!summary) {
    errors.push('summary is required');
  } else {
    for (const field of ['filesScanned', 'resourcesScanned', 'totalRulesChecked', 'findingsCount']) {
      if (typeof summary[field] !== 'number' || summary[field] < 0) {
        errors.push(`summary.${field} must be a non-negative integer`);
      }
    }
    if (typeof summary.riskScore !== 'number' || summary.riskScore < 0 || summary.riskScore > 100) {
      errors.push('summary.riskScore must be 0-100');
    }
    const fbs = summary.findingsBySeverity;
    if (!fbs) {
      errors.push('summary.findingsBySeverity is required');
    } else {
      for (const sev of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']) {
        if (typeof fbs[sev] !== 'number') errors.push(`findingsBySeverity.${sev} must be a number`);
      }
    }
  }

  if (!Array.isArray(report.findings)) {
    errors.push('findings must be an array');
  } else {
    report.findings.forEach((f: any, i: number) => {
      const prefix = `findings[${i}]`;
      // FIXED: Added 0-9 to allow rule IDs like TG-S3-001 or TG-EC2-001
      if (!/^TG-[A-Z0-9]+-\d{3}$/.test(f.ruleId)) {
        errors.push(`${prefix}.ruleId must match TG-XXX-NNN`);
      }
      if (!['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].includes(f.severity)) {
        errors.push(`${prefix}.severity must be a valid severity`);
      }
      for (const field of ['title', 'resource', 'resourceType', 'file', 'description', 'risk']) {
        if (typeof f[field] !== 'string') errors.push(`${prefix}.${field} must be a string`);
      }
      if (typeof f.line !== 'number' || f.line < 1) errors.push(`${prefix}.line must be >= 1`);
      if (!f.remediation) {
        errors.push(`${prefix}.remediation is required`);
      } else {
        for (const field of ['explanation', 'impact', 'remediation', 'secureExample']) {
          if (typeof f.remediation[field] !== 'string') {
            errors.push(`${prefix}.remediation.${field} must be a string`);
          }
        }
      }
      if (!Array.isArray(f.frameworks)) errors.push(`${prefix}.frameworks must be an array`);
      if (!Array.isArray(f.references)) errors.push(`${prefix}.references must be an array`);
    });
  }

  return { valid: errors.length === 0, errors };
}

function validateSarifReport(sarif: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (sarif.version !== '2.1.0') errors.push('SARIF version must be 2.1.0');
  if (!sarif.$schema?.includes('sarif-schema-2.1.0')) {
    errors.push('SARIF $schema must reference sarif-schema-2.1.0');
  }
  if (!Array.isArray(sarif.runs) || sarif.runs.length !== 1) {
    errors.push('SARIF must have exactly one run');
    return { valid: false, errors };
  }

  const run = sarif.runs[0];
  if (!run.tool?.driver?.name) errors.push('tool.driver.name is required');
  if (!run.tool?.driver?.version) errors.push('tool.driver.version is required');
  if (!Array.isArray(run.tool?.driver?.rules)) errors.push('tool.driver.rules must be an array');

  if (!Array.isArray(run.results)) {
    errors.push('results must be an array');
  } else {
    run.results.forEach((r: any, i: number) => {
      const prefix = `results[${i}]`;
      if (!r.ruleId) errors.push(`${prefix}.ruleId is required`);
      if (!['error', 'warning', 'note', 'none'].includes(r.level)) {
        errors.push(`${prefix}.level must be error/warning/note/none`);
      }
      if (!r.message?.text) errors.push(`${prefix}.message.text is required`);
      if (!Array.isArray(r.locations) || r.locations.length === 0) {
        errors.push(`${prefix}.locations must have at least one entry`);
      } else {
        const loc = r.locations[0].physicalLocation;
        if (!loc?.artifactLocation?.uri) errors.push(`${prefix}.location.uri is required`);
        if (typeof loc?.region?.startLine !== 'number') {
          errors.push(`${prefix}.location.startLine must be a number`);
        }
      }
    });
  }

  if (!Array.isArray(run.invocations) || run.invocations.length === 0) {
    errors.push('invocations must have at least one entry');
  } else {
    const inv = run.invocations[0];
    if (inv.executionSuccessful !== true) errors.push('invocation.executionSuccessful must be true');
    if (!inv.startTimeUtc) errors.push('invocation.startTimeUtc is required');
    if (!inv.endTimeUtc) errors.push('invocation.endTimeUtc is required');
  }

  return { valid: errors.length === 0, errors };
}

describe('Reporting Formats', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'terraguard-report-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('JSON Report Schema Validation', () => {
    it('produces a valid JSON report for a scan with findings', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'vuln.tf'),
        `resource "aws_s3_bucket" "a" { acl = "public-read" }`
      );
      const result = runScan({ targetPath: tmpDir, format: 'json' });
      expect(result.exitCode).toBe(1);

      const report = JSON.parse(result.output);
      const validation = validateJsonReport(report);
      
      if (!validation.valid) {
        throw new Error('JSON validation failed:\n' + validation.errors.join('\n'));
      }
      expect(validation.valid).toBe(true);
    });

    it('produces a valid JSON report for a clean scan', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'secure.tf'),
        `resource "aws_s3_bucket" "a" {
  bucket = "private"
  server_side_encryption_configuration {
    rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } }
  }
}`
      );
      const result = runScan({ targetPath: tmpDir, format: 'json' });
      expect(result.exitCode).toBe(0);

      const report = JSON.parse(result.output);
      const validation = validateJsonReport(report);
      if (!validation.valid) throw new Error('JSON validation failed:\n' + validation.errors.join('\n'));
      
      expect(validation.valid).toBe(true);
      expect(report.findings).toHaveLength(0);
      expect(report.summary.riskScore).toBe(100);
    });

    it('includes all required metadata fields', () => {
      fs.writeFileSync(path.join(tmpDir, 'a.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      const result = runScan({ targetPath: tmpDir, format: 'json' });
      const report = JSON.parse(result.output);

      expect(report.$schema).toContain('terraguard-report.schema.json');
      expect(report.version).toBe(REPORT_SCHEMA_VERSION);
      expect(report.scanner.name).toBe('TerraGuard');
      expect(report.scanner.version).toMatch(/^\d+\.\d+\.\d+/);
      expect(report.scan.scannedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(typeof report.scan.durationMs).toBe('number');
      expect(report.scan.targetPath).toBe(tmpDir);
      expect(Array.isArray(report.scan.arguments)).toBe(true);
    });

    it('includes findingsBySeverity breakdown', () => {
      fs.writeFileSync(path.join(tmpDir, 'a.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      const result = runScan({ targetPath: tmpDir, format: 'json' });
      const report = JSON.parse(result.output);

      const fbs = report.summary.findingsBySeverity;
      expect(fbs.CRITICAL + fbs.HIGH + fbs.MEDIUM + fbs.LOW + fbs.INFO).toBe(report.summary.findingsCount);
    });

    it('includes complete remediation structure for each finding', () => {
      fs.writeFileSync(path.join(tmpDir, 'a.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      const result = runScan({ targetPath: tmpDir, format: 'json' });
      const report = JSON.parse(result.output);

      expect(report.findings.length).toBeGreaterThan(0);
      for (const finding of report.findings) {
        expect(finding.remediation.explanation.length).toBeGreaterThan(0);
        expect(finding.remediation.impact.length).toBeGreaterThan(0);
        expect(finding.remediation.remediation.length).toBeGreaterThan(0);
        expect(finding.remediation.secureExample.length).toBeGreaterThan(0);
        expect(finding.resourceType).toBeTruthy();
        expect(finding.resource).toContain(finding.resourceType);
      }
    });

    it('produces deterministic output across multiple runs', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'multi.tf'),
        `
resource "aws_s3_bucket" "a" { acl = "public-read" }
resource "aws_ebs_volume" "b" { size = 10 }
resource "aws_security_group" "c" {
  ingress { from_port = 22; to_port = 22; cidr_blocks = ["0.0.0.0/0"] }
}
`
      );
      const result1 = runScan({ targetPath: tmpDir, format: 'json' });
      const result2 = runScan({ targetPath: tmpDir, format: 'json' });

      const report1 = JSON.parse(result1.output);
      const report2 = JSON.parse(result2.output);

      expect(report1.findings).toEqual(report2.findings);
      expect(report1.summary).toEqual(report2.summary);

      for (let i = 1; i < report1.findings.length; i++) {
        const prev = report1.findings[i - 1];
        const curr = report1.findings[i];
        const prevKey = `${prev.file}|${prev.line}|${prev.ruleId}`;
        const currKey = `${curr.file}|${curr.line}|${curr.ruleId}`;
        expect(prevKey <= currKey).toBe(true);
      }
    });

    it('includes failOn in scan metadata when provided', () => {
      fs.writeFileSync(path.join(tmpDir, 'a.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      const result = runScan({ targetPath: tmpDir, format: 'json', failOn: ['CRITICAL', 'HIGH'] });
      const report = JSON.parse(result.output);

      expect(report.scan.failOn).toEqual(['CRITICAL', 'HIGH']);
    });
  });

  describe('SARIF Report Schema Validation', () => {
    it('produces valid SARIF 2.1.0 output', () => {
      fs.writeFileSync(path.join(tmpDir, 'vuln.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      const result = runScan({ targetPath: tmpDir, format: 'sarif' });
      expect(result.exitCode).toBe(1);

      const sarif = JSON.parse(result.output);
      const validation = validateSarifReport(sarif);
      if (!validation.valid) throw new Error('SARIF validation failed:\n' + validation.errors.join('\n'));
      expect(validation.valid).toBe(true);
    });

    it('includes all required SARIF fields', () => {
      fs.writeFileSync(path.join(tmpDir, 'vuln.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      const result = runScan({ targetPath: tmpDir, format: 'sarif' });
      const sarif = JSON.parse(result.output);

      expect(sarif.$schema).toContain('sarif-schema-2.1.0');
      expect(sarif.version).toBe('2.1.0');
      expect(sarif.runs).toHaveLength(1);

      const run = sarif.runs[0];
      expect(run.tool.driver.name).toBe('TerraGuard');
      expect(run.tool.driver.version).toMatch(/^\d+\.\d+\.\d+/);
      expect(run.tool.driver.informationUri).toContain('github.com');
      expect(Array.isArray(run.tool.driver.rules)).toBe(true);
    });

    it('maps severities to correct SARIF levels', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'multi.tf'),
        `
resource "aws_s3_bucket" "a" { acl = "public-read" }
resource "aws_ebs_volume" "b" { size = 10 }
`
      );
      const result = runScan({ targetPath: tmpDir, format: 'sarif' });
      const sarif = JSON.parse(result.output);

      for (const r of sarif.runs[0].results) {
        if (['TG-S3-001'].includes(r.ruleId)) {
          expect(r.level).toBe('error');
        }
        if (['TG-EBS-001'].includes(r.ruleId)) {
          expect(r.level).toBe('error');
        }
      }
    });

    it('includes physical locations with file and line', () => {
      fs.writeFileSync(path.join(tmpDir, 'vuln.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      const result = runScan({ targetPath: tmpDir, format: 'sarif' });
      const sarif = JSON.parse(result.output);

      for (const r of sarif.runs[0].results) {
        expect(r.locations).toHaveLength(1);
        const loc = r.locations[0].physicalLocation;
        expect(loc.artifactLocation.uri).toMatch(/vuln\.tf$/);
        expect(loc.artifactLocation.uri).not.toContain('\\');
        expect(typeof loc.region.startLine).toBe('number');
        expect(loc.region.startLine).toBeGreaterThan(0);
      }
    });

    it('includes timing metadata in invocations', () => {
      fs.writeFileSync(path.join(tmpDir, 'a.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      const result = runScan({ targetPath: tmpDir, format: 'sarif' });
      const sarif = JSON.parse(result.output);

      const inv = sarif.runs[0].invocations[0];
      expect(inv.executionSuccessful).toBe(true);
      expect(inv.startTimeUtc).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(inv.endTimeUtc).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(new Date(inv.endTimeUtc).getTime()).toBeGreaterThanOrEqual(new Date(inv.startTimeUtc).getTime());
    });

    it('includes artifacts list of scanned files', () => {
      fs.writeFileSync(path.join(tmpDir, 'a.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      fs.writeFileSync(path.join(tmpDir, 'b.tf'), `resource "aws_ebs_volume" "b" { size = 10 }`);
      const result = runScan({ targetPath: tmpDir, format: 'sarif' });
      const sarif = JSON.parse(result.output);

      expect(Array.isArray(sarif.runs[0].artifacts)).toBe(true);
      expect(sarif.runs[0].artifacts.length).toBeGreaterThanOrEqual(1);
    });

    it('includes taxonomies for framework mappings', () => {
      fs.writeFileSync(path.join(tmpDir, 'a.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      const result = runScan({ targetPath: tmpDir, format: 'sarif' });
      const sarif = JSON.parse(result.output);

      const taxonomies = sarif.runs[0].taxonomies;
      expect(Array.isArray(taxonomies)).toBe(true);
      expect(taxonomies.length).toBeGreaterThan(0);

      const cisTaxonomy = taxonomies.find((t: any) => t.name.includes('CIS'));
      expect(cisTaxonomy).toBeDefined();
      expect(cisTaxonomy.version).toBe('1.5.0');
      expect(Array.isArray(cisTaxonomy.taxa)).toBe(true);
    });

    it('produces deterministic output across multiple runs', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'multi.tf'),
        `
resource "aws_s3_bucket" "a" { acl = "public-read" }
resource "aws_ebs_volume" "b" { size = 10 }
`
      );
      const result1 = runScan({ targetPath: tmpDir, format: 'sarif' });
      const result2 = runScan({ targetPath: tmpDir, format: 'sarif' });

      const sarif1 = JSON.parse(result1.output);
      const sarif2 = JSON.parse(result2.output);

      expect(sarif1.runs[0].results).toEqual(sarif2.runs[0].results);
      expect(sarif1.runs[0].tool).toEqual(sarif2.runs[0].tool);
    });
  });

  describe('Cross-Format Consistency', () => {
    it('JSON and SARIF report the same findings', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'multi.tf'),
        `
resource "aws_s3_bucket" "a" { acl = "public-read" }
resource "aws_ebs_volume" "b" { size = 10 }
`
      );
      const jsonResult = runScan({ targetPath: tmpDir, format: 'json' });
      const sarifResult = runScan({ targetPath: tmpDir, format: 'sarif' });

      const jsonReport = JSON.parse(jsonResult.output);
      const sarifReport = JSON.parse(sarifResult.output);

      expect(jsonReport.findings.length).toBe(sarifReport.runs[0].results.length);

      const jsonRuleIds = jsonReport.findings.map((f: any) => f.ruleId).sort();
      const sarifRuleIds = sarifReport.runs[0].results.map((r: any) => r.ruleId).sort();
      expect(jsonRuleIds).toEqual(sarifRuleIds);
    });

    it('risk score is consistent across formats', () => {
      fs.writeFileSync(path.join(tmpDir, 'a.tf'), `resource "aws_s3_bucket" "a" { acl = "public-read" }`);
      const jsonResult = runScan({ targetPath: tmpDir, format: 'json' });
      const sarifResult = runScan({ targetPath: tmpDir, format: 'sarif' });

      const jsonReport = JSON.parse(jsonResult.output);
      const sarifReport = JSON.parse(sarifResult.output);

      const sarifScore = sarifReport.runs[0].invocations[0].properties.riskScore;
      expect(jsonReport.summary.riskScore).toBe(sarifScore);
    });
  });
});