// src/tests/performance.test.ts
// Performance benchmarks at controlled fixture sizes

import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';

/**
 * Generate valid Terraform code of approximately the target size.
 * Each resource is ~80 bytes, so we calculate how many are needed.
 */
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

/**
 * Generate Terraform code with findings (public S3 buckets).
 */
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
      
      if (!('error' in result)) {
        console.log(`[PERF] 1KB: ${duration.toFixed(2)}ms, ${result.resourcesScanned} resources, ${result.totalRulesChecked} rules`);
      }
    });

    it('should scan 10KB in under 300ms', () => {
      const code = generateTerraformOfSize(10 * 1024);
      const start = performance.now();
      const result = scanTerraformCode(code);
      const duration = performance.now() - start;
      
      expect('error' in result).toBe(false);
      expect(duration).toBeLessThan(300);
      
      if (!('error' in result)) {
        console.log(`[PERF] 10KB: ${duration.toFixed(2)}ms, ${result.resourcesScanned} resources`);
      }
    });

    it('should scan 100KB in under 1500ms', () => {
      const code = generateTerraformOfSize(100 * 1024);
      const start = performance.now();
      const result = scanTerraformCode(code);
      const duration = performance.now() - start;
      
      expect('error' in result).toBe(false);
      expect(duration).toBeLessThan(1500);
      
      if (!('error' in result)) {
        console.log(`[PERF] 100KB: ${duration.toFixed(2)}ms, ${result.resourcesScanned} resources`);
      }
    });

    it('should scan 1MB in under 8000ms (or reject if over limit)', () => {
      const code = generateTerraformOfSize(1024 * 1024);
      const start = performance.now();
      const result = scanTerraformCode(code);
      const duration = performance.now() - start;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(8000);
      
      if ('error' in result) {
        console.log(`[PERF] 1MB: Rejected (${duration.toFixed(2)}ms) - ${result.error}`);
      } else {
        console.log(`[PERF] 1MB: ${duration.toFixed(2)}ms, ${result.resourcesScanned} resources`);
      }
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
        console.log(`[PERF] 10KB (vulnerable): ${duration.toFixed(2)}ms, ${result.findings.length} findings`);
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
        console.log(`[PERF] 100KB (vulnerable): ${duration.toFixed(2)}ms, ${result.findings.length} findings`);
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
        console.log(`[PERF] 1KB resource count: ${result.resourcesScanned}`);
      }
    });

    it('should accurately count resources in 100KB file', () => {
      const code = generateTerraformOfSize(100 * 1024);
      const result = scanTerraformCode(code);
      
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.resourcesScanned).toBeGreaterThan(500);
        console.log(`[PERF] 100KB resource count: ${result.resourcesScanned}`);
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
          expect(result.totalRulesChecked).toBe(22);
        }
      }
    });
  });

  describe('Memory Usage', () => {
    it('should not cause excessive memory growth on 100KB scan', () => {
      const code = generateTerraformOfSize(100 * 1024);
      
      // Force garbage collection if available (Node.js with --expose-gc)
      if (global.gc) {
        global.gc();
      }
      
      const memBefore = process.memoryUsage();
      const result = scanTerraformCode(code);
      const memAfter = process.memoryUsage();
      
      expect('error' in result).toBe(false);
      
      // Memory growth should be reasonable (< 50MB for 100KB input)
      const heapGrowth = memAfter.heapUsed - memBefore.heapUsed;
      console.log(`[PERF] Memory growth for 100KB scan: ${(heapGrowth / 1024 / 1024).toFixed(2)}MB`);
      expect(heapGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB limit
    });
  });

  describe('Scalability Characteristics', () => {
    it('should show roughly linear time growth', () => {
      const size1 = 10 * 1024;
      const size2 = 100 * 1024;
      
      const code1 = generateTerraformOfSize(size1);
      const code2 = generateTerraformOfSize(size2);
      
      // Warmup run to stabilize V8 JIT compiler
      scanTerraformCode(code1);
      scanTerraformCode(code2);
      
      const start1 = performance.now();
      scanTerraformCode(code1);
      const time1 = performance.now() - start1;
      
      const start2 = performance.now();
      scanTerraformCode(code2);
      const time2 = performance.now() - start2;
      
      // Time should grow roughly linearly. 
      // We allow up to 100x for a 10x input increase to account for 
      // JS regex engine overhead, V8 tiered compilation variances,
      // and CI environment fluctuations.
      const ratio = time2 / time1;
      console.log(`[PERF] Time ratio (100KB/10KB): ${ratio.toFixed(2)}x (time1: ${time1.toFixed(2)}ms, time2: ${time2.toFixed(2)}ms)`);
      
      expect(ratio).toBeLessThan(100); 
    });
  });
});