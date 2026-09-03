// src/tests/benchmark-terraguard.test.ts
// Baseline test ensuring TerraGuard behaves predictably on the benchmark corpus

import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { runScan } from '@/cli/commands/scan';

const CORPUS_DIR = path.join(__dirname, '../../benchmarks/corpus');

describe('Benchmark Corpus: TerraGuard Baseline', () => {
  it('should detect all 4 expected issues in the benchmark corpus', () => {
    const result = runScan({ targetPath: CORPUS_DIR, format: 'json' });
    
    expect(result.exitCode).toBe(1); // Should fail due to findings
    
    const report = JSON.parse(result.output);
    expect(report.summary.filesScanned).toBe(4);
    expect(report.summary.findingsCount).toBeGreaterThanOrEqual(4);
    
    const ruleIds = report.findings.map((f: any) => f.ruleId);
    
    // Verify specific detections
    expect(ruleIds).toContain('TG-S3-001'); // Public S3
    expect(ruleIds).toContain('TG-NET-001'); // Open SSH
    expect(ruleIds).toContain('TG-EBS-001'); // Unencrypted EBS
    expect(ruleIds).toContain('TG-SEC-001'); // Hardcoded secret
    expect(ruleIds).toContain('TG-RDS-001'); // Publicly accessible RDS
  });

  it('should provide high-quality remediation for all findings', () => {
    const result = runScan({ targetPath: CORPUS_DIR, format: 'json' });
    const report = JSON.parse(result.output);
    
    for (const finding of report.findings) {
      expect(finding.remediation.explanation.length).toBeGreaterThan(10);
      expect(finding.remediation.impact.length).toBeGreaterThan(10);
      expect(finding.remediation.remediation.length).toBeGreaterThan(10);
      expect(finding.remediation.secureExample.length).toBeGreaterThan(10);
    }
  });

  it('should execute in under 100ms for the 4-file corpus', () => {
    const start = performance.now();
    runScan({ targetPath: CORPUS_DIR, format: 'json' });
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
});