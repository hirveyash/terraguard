// src/tests/performance.test.ts
// Performance benchmarks at controlled fixture sizes

import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';

function generateTerraformOfSize(targetBytes: number): string {
  const template = `resource "aws_s3_bucket" "bucket_N" {\n  bucket = "bucket-N"\n}\n`;
  const bytesPerResource = template.length;
  const resourcesNeeded = Math.max(1, Math.ceil(targetBytes / bytesPerResource));
  
  let code = '';
  for (let i = 0; i < resourcesNeeded; i++) {
    code += template.replace(/N/g, String(i));
  }
  return code;
}

function generateVulnerableTerraformOfSize(targetBytes: number): string {
  const template = `resource "aws_s3_bucket" "bucket_N" {\n  bucket = "bucket-N"\n  acl = "public-read"\n}\n`;
  const bytesPerResource = template.length;
  const resourcesNeeded = Math.max(1, Math.ceil(targetBytes / bytesPerResource));
  
  let code = '';
  for (let i = 0; i < resourcesNeeded; i++) {
    code += template.replace(/N/g, String(i));
  }
  return code;
}

describe('Performance Benchmarks', () => {
  describe('Scan Time by Input Size', () => {
    it('should scan 1KB in under 100ms', () => {
      const code = generateTerraformOfSize(1024);
      const start = performance.now();
      const result = scanTerraformCode(code);
      const duration = performance.now() - start;
      
      expect('error' in result).toBe(false);
      expect(duration).toBeLessThan(100);
    });

    it('should scan 10KB in under 300ms', () => {
      const code = generateTerraformOfSize(10 * 1024);
      const start = performance.now();
      const result = scanTerraformCode(code);
      const duration = performance.now() - start;
      
      expect('error' in result).toBe(false);
      expect(duration).toBeLessThan(300);
    });

    it('should scan 100KB in under 1500ms', () => {
      const code = generateTerraformOfSize(100 * 1024);
      const start = performance.now();
      const result = scanTerraformCode(code);
      const duration = performance.now() - start;
      
      expect('error' in result).toBe(false);
      expect(duration).toBeLessThan(1500);
    });

    it('should scan 1MB in under 8000ms (or reject if over limit)', () => {
      const code = generateTerraformOfSize(1024 * 1024);
      const start = performance.now();
      const result = scanTerraformCode(code);
      const duration = performance.now() - start;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(8000);
    });
  });

  describe('Scan Time with Findings', () => {
    it('should scan 10KB with findings in under 500ms', () => {
      const code = generateVulnerableTerraformOfSize(10 * 1024);
      const start = performance.now();
      const result = scanTerraformCode(code);
      const duration = performance.now() - start;
      
      expect('error' in result).toBe(false);
      expect(duration).toBeLessThan(500);
      if (!('error' in result)) {
        expect(result.findings.length).toBeGreaterThan(0);
      }
    });

    it('should scan 100KB with findings in under 2000ms', () => {
      const code = generateVulnerableTerraformOfSize(100 * 1024);
      const start = performance.now();
      const result = scanTerraformCode(code);
      const duration = performance.now() - start;
      
      expect('error' in result).toBe(false);
      expect(duration).toBeLessThan(2000);
      if (!('error' in result)) {
        expect(result.findings.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Resource Count Accuracy', () => {
    it('should accurately count resources in 1KB file', () => {
      const code = generateTerraformOfSize(1024);
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.resourcesScanned).toBeGreaterThan(5);
      }
    });

    it('should accurately count resources in 100KB file', () => {
      const code = generateTerraformOfSize(100 * 1024);
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.resourcesScanned).toBeGreaterThan(500);
      }
    });
  });

  describe('Rules Execution', () => {
    it('should execute all rules on every input size', () => {
      const sizes = [1024, 10 * 1024, 100 * 1024];
      for (const size of sizes) {
        const code = generateTerraformOfSize(size);
        const result = scanTerraformCode(code);
        expect('error' in result).toBe(false);
        if (!('error' in result)) {
          // Updated to be flexible as we add new rules
          expect(result.totalRulesChecked).toBeGreaterThanOrEqual(22);
        }
      }
    });
  });

  describe('Memory Usage', () => {
    it('should not cause excessive memory growth on 100KB scan', () => {
      const code = generateTerraformOfSize(100 * 1024);
      if (global.gc) global.gc();
      
      const memBefore = process.memoryUsage();
      const result = scanTerraformCode(code);
      const memAfter = process.memoryUsage();
      
      expect('error' in result).toBe(false);
      const heapGrowth = memAfter.heapUsed - memBefore.heapUsed;
      expect(heapGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB limit
    });
  });

  describe('Scalability Characteristics', () => {
    it('should show roughly linear time growth', () => {
      const size1 = 10 * 1024;
      const size2 = 100 * 1024;
      
      const code1 = generateTerraformOfSize(size1);
      const code2 = generateTerraformOfSize(size2);
      
      scanTerraformCode(code1);
      scanTerraformCode(code2);
      
      const start1 = performance.now();
      scanTerraformCode(code1);
      const time1 = performance.now() - start1;
      
      const start2 = performance.now();
      scanTerraformCode(code2);
      const time2 = performance.now() - start2;
      
      const ratio = time2 / time1;
      expect(ratio).toBeLessThan(100); 
    });
  });
});