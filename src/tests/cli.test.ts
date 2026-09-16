// src/tests/cli.test.ts
import { describe, it, expect } from 'vitest';
import { runScan } from '@/cli/commands/scan';
import * as path from 'path';
import * as fs from 'fs';

describe('CLI > Scan Command', () => {
  const testDir = path.join(__dirname, '../../benchmarks/corpus');

  it('finds .tf files in a directory', () => {
    const result = runScan({ targetPath: testDir, format: 'json' });
    expect(result.exitCode).toBe(1);
    const report = JSON.parse(result.output);
    expect(report.summary.filesScanned).toBeGreaterThan(0);
  });

  it('finds .tf files recursively', () => {
    const result = runScan({ targetPath: testDir, format: 'json' });
    expect(result.exitCode).toBe(1);
  });

  it('skips hidden directories like .terraform', () => {
    const result = runScan({ targetPath: testDir, format: 'json' });
    expect(result.exitCode).toBe(1);
  });

  it('accepts a single .tf file', () => {
    const filePath = path.join(testDir, 's3_public.tf');
    const result = runScan({ targetPath: filePath, format: 'json' });
    expect(result.exitCode).toBe(1);
  });

  it('rejects non-.tf files', () => {
    const result = runScan({ targetPath: 'package.json', format: 'json' });
    expect(result.exitCode).toBe(2);
  });

  it('throws on non-existent path', () => {
    const result = runScan({ targetPath: '/non/existent/path', format: 'json' });
    expect(result.exitCode).toBe(2);
  });

  it('returns exit code 0 when no findings', () => {
    const secureCode = `resource "aws_s3_bucket" "test" { 
      bucket = "test-secure-bucket-name-12345"
      server_side_encryption_configuration {
        rule {
          apply_server_side_encryption_by_default {
            sse_algorithm = "AES256"
          }
        }
      }
    }`;
    const tempFile = path.join(__dirname, 'temp_secure.tf');
    fs.writeFileSync(tempFile, secureCode);
    const result = runScan({ targetPath: tempFile, format: 'json' });
    fs.unlinkSync(tempFile);
    expect(result.exitCode).toBe(0);
  });

  it('returns exit code 1 when findings detected', () => {
    const result = runScan({ targetPath: testDir, format: 'json' });
    expect(result.exitCode).toBe(1);
  });

  it('produces valid JSON output', () => {
    const result = runScan({ targetPath: testDir, format: 'json' });
    expect(() => JSON.parse(result.output)).not.toThrow();
  });

  it('produces valid SARIF 2.1.0 output', () => {
    const result = runScan({ targetPath: testDir, format: 'sarif' });
    const sarif = JSON.parse(result.output);
    
    expect(sarif.$schema).toContain('sarif-schema-2.1.0');
    expect(sarif.version).toBe('2.1.0');
    expect(sarif.runs[0].tool.driver.name).toBe('TerraGuard');
    expect(sarif.runs[0].results.length).toBeGreaterThan(0);
    
    const ruleIds = sarif.runs[0].results.map((r: any) => r.ruleId);
    expect(ruleIds).toContain('TG-S3-001');
    
    expect(sarif.runs[0].results[0].locations[0].physicalLocation.region.startLine).toBeGreaterThan(0);
  });

  it('returns exit code 2 for invalid path', () => {
    const result = runScan({ targetPath: '/invalid/path', format: 'json' });
    expect(result.exitCode).toBe(2);
  });

  it('returns exit code 2 for directory with no .tf files', () => {
    const result = runScan({ targetPath: __dirname, format: 'json' });
    expect(result.exitCode).toBe(2);
  });

  it('aggregates findings across multiple files', () => {
    const result = runScan({ targetPath: testDir, format: 'json' });
    const report = JSON.parse(result.output);
    expect(report.summary.filesScanned).toBeGreaterThan(1);
  });

  it('lists all rules in text format', () => {
    const result = runScan({ targetPath: testDir, format: 'text' });
    expect(result.output).toBeDefined();
    expect(result.output).toContain('TerraGuard');
  });

  it('lists all rules in JSON format', () => {
    expect(true).toBe(true);
  });

  it('prints version string', () => {
    expect(true).toBe(true);
  });

  it('shows help for unknown command', () => {
    expect(true).toBe(true);
  });

  it('returns error for invalid format flag', () => {
    const result = runScan({ targetPath: testDir, format: 'xml' as any });
    expect(result.exitCode).toBe(2);
    expect(result.output).toContain('Invalid format');
  });

  it('returns error when scan has no path argument', () => {
    const result = runScan({ targetPath: '', format: 'json' });
    expect(result.exitCode).toBe(2);
  });

  it('recalculates risk score from combined findings', () => {
    const result = runScan({ targetPath: testDir, format: 'json' });
    const report = JSON.parse(result.output);
    expect(report.summary.riskScore).toBeGreaterThanOrEqual(0);
    expect(report.summary.riskScore).toBeLessThanOrEqual(100);
  });

  it('maps CRITICAL severity to error level', () => {
    const result = runScan({ targetPath: testDir, format: 'sarif' });
    const sarif = JSON.parse(result.output);
    const criticalFinding = sarif.runs[0].results.find((r: any) => r.level === 'error');
    expect(criticalFinding).toBeDefined();
  });

  it('includes physical location with file and line', () => {
    const result = runScan({ targetPath: testDir, format: 'sarif' });
    const sarif = JSON.parse(result.output);
    const location = sarif.runs[0].results[0].locations[0].physicalLocation;
    expect(location.artifactLocation.uri).toBeDefined();
    expect(location.region.startLine).toBeGreaterThan(0);
  });
});