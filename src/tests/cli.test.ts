// src/tests/cli.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { main } from '@/cli/index';
import { runScan } from '@/cli/commands/scan';
import { runRules } from '@/cli/commands/rules';
import { runVersion } from '@/cli/commands/version';
import { discoverTerraformFiles } from '@/cli/fs';
import { aggregateResults } from '@/cli/aggregate';
import { formatSarif } from '@/cli/formatters/sarif';
import { EXIT_CODES } from '@/cli/types';

describe('CLI', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'terraguard-cli-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('File Discovery', () => {
    it('finds .tf files in a directory', () => {
      fs.writeFileSync(path.join(tmpDir, 'main.tf'), 'resource "aws_s3_bucket" "a" {}');
      fs.writeFileSync(path.join(tmpDir, 'other.txt'), 'not terraform');
      const files = discoverTerraformFiles(tmpDir);
      expect(files.length).toBe(1);
      expect(files[0].endsWith('main.tf')).toBe(true);
    });

    it('finds .tf files recursively', () => {
      const sub = path.join(tmpDir, 'modules', 'vpc');
      fs.mkdirSync(sub, { recursive: true });
      fs.writeFileSync(path.join(tmpDir, 'main.tf'), '');
      fs.writeFileSync(path.join(sub, 'vpc.tf'), '');
      const files = discoverTerraformFiles(tmpDir);
      expect(files.length).toBe(2);
    });

    it('skips hidden directories like .terraform', () => {
      const hidden = path.join(tmpDir, '.terraform');
      fs.mkdirSync(hidden);
      fs.writeFileSync(path.join(hidden, 'cache.tf'), '');
      fs.writeFileSync(path.join(tmpDir, 'main.tf'), '');
      const files = discoverTerraformFiles(tmpDir);
      expect(files.length).toBe(1);
      expect(files[0]).not.toContain('.terraform');
    });

    it('accepts a single .tf file', () => {
      const file = path.join(tmpDir, 'single.tf');
      fs.writeFileSync(file, '');
      const files = discoverTerraformFiles(file);
      expect(files).toEqual([file]);
    });

    it('rejects non-.tf files', () => {
      const file = path.join(tmpDir, 'readme.md');
      fs.writeFileSync(file, '');
      expect(() => discoverTerraformFiles(file)).toThrow(/not a \.tf file/);
    });

    it('throws on non-existent path', () => {
      expect(() => discoverTerraformFiles('/nonexistent/path/xyz')).toThrow();
    });
  });

  describe('Scan Command', () => {
    it('returns exit code 0 when no findings', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'secure.tf'),
        `resource "aws_s3_bucket" "a" {
  bucket = "private-bucket"
  server_side_encryption_configuration {
    rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } }
  }
}`
      );
      const result = runScan({ targetPath: tmpDir, format: 'text' });
      expect(result.exitCode).toBe(EXIT_CODES.SUCCESS);
      expect(result.output).toContain('No security findings');
    });

    it('returns exit code 1 when findings detected', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'vuln.tf'),
        `resource "aws_s3_bucket" "a" { acl = "public-read" }`
      );
      const result = runScan({ targetPath: tmpDir, format: 'text' });
      expect(result.exitCode).toBe(EXIT_CODES.FINDINGS);
      expect(result.output).toContain('TG-S3-001');
    });

    it('produces valid JSON output', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'vuln.tf'),
        `resource "aws_s3_bucket" "a" { acl = "public-read" }`
      );
      const result = runScan({ targetPath: tmpDir, format: 'json' });
      expect(result.exitCode).toBe(EXIT_CODES.FINDINGS);
      const parsed = JSON.parse(result.output);
      expect(parsed.scanner.name).toBe('TerraGuard');
      expect(parsed.summary.findingsCount).toBeGreaterThan(0);
      expect(Array.isArray(parsed.findings)).toBe(true);
    });

    it('produces valid SARIF 2.1.0 output', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'vuln.tf'),
        `resource "aws_s3_bucket" "a" { acl = "public-read" }`
      );
      const result = runScan({ targetPath: tmpDir, format: 'sarif' });
      expect(result.exitCode).toBe(EXIT_CODES.FINDINGS);
      const sarif = JSON.parse(result.output);
      expect(sarif.version).toBe('2.1.0');
      expect(sarif.$schema).toContain('sarif-schema-2.1.0');
      expect(sarif.runs).toHaveLength(1);
      expect(sarif.runs[0].tool.driver.name).toBe('TerraGuard');
      expect(sarif.runs[0].results.length).toBeGreaterThan(0);
      expect(sarif.runs[0].results[0].ruleId).toBe('TG-S3-001');
      expect(sarif.runs[0].results[0].locations[0].physicalLocation.region.startLine).toBeGreaterThan(0);
    });

    it('returns exit code 2 for invalid path', () => {
      const result = runScan({ targetPath: '/nonexistent/xyz/abc', format: 'text' });
      expect(result.exitCode).toBe(EXIT_CODES.ERROR);
      expect(result.output).toMatch(/error/i);
    });

    it('returns exit code 2 for directory with no .tf files', () => {
      fs.writeFileSync(path.join(tmpDir, 'readme.md'), '# nothing');
      const result = runScan({ targetPath: tmpDir, format: 'text' });
      expect(result.exitCode).toBe(EXIT_CODES.ERROR);
      expect(result.output).toContain('No .tf files found');
    });

    it('aggregates findings across multiple files', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'a.tf'),
        `resource "aws_s3_bucket" "a" { acl = "public-read" }`
      );
      fs.writeFileSync(
        path.join(tmpDir, 'b.tf'),
        `resource "aws_ebs_volume" "b" { size = 10 }`
      );
      const result = runScan({ targetPath: tmpDir, format: 'json' });
      const parsed = JSON.parse(result.output);
      expect(parsed.summary.filesScanned).toBe(2);
      expect(parsed.summary.findingsCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Rules Command', () => {
    it('lists all rules in text format', () => {
      const result = runRules({ format: 'text' });
      expect(result.exitCode).toBe(EXIT_CODES.SUCCESS);
      expect(result.output).toContain('TG-IAM-001');
      expect(result.output).toContain('TG-S3-001');
      expect(result.output).toContain('TG-NET-001');
    });

    it('lists all rules in JSON format', () => {
      const result = runRules({ format: 'json' });
      expect(result.exitCode).toBe(EXIT_CODES.SUCCESS);
      const parsed = JSON.parse(result.output);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
      expect(parsed[0]).toHaveProperty('id');
      expect(parsed[0]).toHaveProperty('severity');
      expect(parsed[0]).toHaveProperty('title');
      // Should NOT include the check function
      expect(parsed[0]).not.toHaveProperty('check');
    });
  });

  describe('Version Command', () => {
    it('prints version string', () => {
      const result = runVersion();
      expect(result.exitCode).toBe(EXIT_CODES.SUCCESS);
      expect(result.output).toMatch(/TerraGuard v\d+\.\d+\.\d+/);
    });
  });

  describe('Main Entry Point', () => {
    it('shows help for unknown command', () => {
      const exitCode = main(['node', 'terraguard', 'unknown-cmd']);
      expect(exitCode).toBe(EXIT_CODES.SUCCESS);
    });

    it('returns error for invalid format flag', () => {
      const exitCode = main(['node', 'terraguard', 'scan', tmpDir, '--format', 'xml']);
      expect(exitCode).toBe(EXIT_CODES.ERROR);
    });

    it('returns error when scan has no path argument', () => {
      const exitCode = main(['node', 'terraguard', 'scan']);
      expect(exitCode).toBe(EXIT_CODES.ERROR);
    });
  });

  describe('Aggregation', () => {
    it('recalculates risk score from combined findings', () => {
      const r1 = {
        findings: [{ ruleId: 'TG-IAM-001', severity: 'CRITICAL' as const, title: '', resource: '', file: 'a.tf', line: 1, description: '', risk: '', remediation: { explanation: '', impact: '', remediation: '', secureExample: '' }, frameworks: [] }],
        riskScore: 75,
        totalRulesChecked: 22,
        resourcesScanned: 1,
      };
      const r2 = {
        findings: [{ ruleId: 'TG-NET-001', severity: 'HIGH' as const, title: '', resource: '', file: 'b.tf', line: 1, description: '', risk: '', remediation: { explanation: '', impact: '', remediation: '', secureExample: '' }, frameworks: [] }],
        riskScore: 85,
        totalRulesChecked: 22,
        resourcesScanned: 1,
      };
      const agg = aggregateResults([r1, r2], 2);
      expect(agg.filesScanned).toBe(2);
      expect(agg.resourcesScanned).toBe(2);
      expect(agg.findings.length).toBe(2);
      // CRITICAL (25) + HIGH (15) = 40 penalty -> 60 score
      expect(agg.riskScore).toBe(60);
      // Findings should be sorted by severity
      expect(agg.findings[0].severity).toBe('CRITICAL');
      expect(agg.findings[1].severity).toBe('HIGH');
    });
  });

  describe('SARIF Schema Compliance', () => {
    it('maps CRITICAL severity to error level', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'vuln.tf'),
        `resource "aws_s3_bucket" "a" { acl = "public-read" }`
      );
      const result = runScan({ targetPath: tmpDir, format: 'sarif' });
      const sarif = JSON.parse(result.output);
      const criticalResult = sarif.runs[0].results.find((r: any) => r.ruleId === 'TG-S3-001');
      expect(criticalResult.level).toBe('error');
    });

    it('includes physical location with file and line', () => {
      fs.writeFileSync(
        path.join(tmpDir, 'vuln.tf'),
        `resource "aws_s3_bucket" "a" { acl = "public-read" }`
      );
      const result = runScan({ targetPath: tmpDir, format: 'sarif' });
      const sarif = JSON.parse(result.output);
      const loc = sarif.runs[0].results[0].locations[0].physicalLocation;
      expect(loc.artifactLocation.uri).toMatch(/vuln\.tf$/);
      expect(typeof loc.region.startLine).toBe('number');
    });
  });
});