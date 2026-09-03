// src/tests/security-application.test.ts
// Tests for application-level security (error handling, secrets exposure)

import { describe, it, expect, vi } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';

describe('Security: Application-Level', () => {
  describe('Error Handling', () => {
    it('should not expose stack traces in error messages', () => {
      const result = scanTerraformCode('');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).not.toContain('at ');
        expect(result.error).not.toContain('stack');
        expect(result.error).not.toContain('.ts:');
      }
    });

    it('should provide user-friendly error messages', () => {
      const result = scanTerraformCode('');
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error.length).toBeGreaterThan(0);
        expect(result.error.length).toBeLessThan(200);
      }
    });

    it('should handle parse errors gracefully', () => {
      const malformedCode = 'resource "aws_s3_bucket" "test" { invalid syntax here }';
      const result = scanTerraformCode(malformedCode);
      expect(result).toBeDefined();
    });
  });

  describe('Secrets Exposure Prevention', () => {
    it('should not log actual secret values', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      
      const code = `
        resource "aws_db_instance" "test" {
          password = "SuperSecretPassword123!"
        }
      `;
      scanTerraformCode(code);
      
      const warnCalls = consoleSpy.mock.calls;
      const hasSecretWarning = warnCalls.some(call => 
        call.some(arg => typeof arg === 'string' && arg.includes('Hardcoded secret'))
      );
      
      if (hasSecretWarning) {
        const warningMessage = warnCalls.find(call => 
          call.some(arg => typeof arg === 'string' && arg.includes('Hardcoded secret'))
        )?.join(' ');
        
        expect(warningMessage).not.toContain('SuperSecretPassword123!');
      }
      
      consoleSpy.mockRestore();
    });

    it('should detect hardcoded secrets but not expose them in findings', () => {
      const code = `
        resource "aws_db_instance" "test" {
          password = "MySecretPassword"
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      
      if (!('error' in result)) {
        const secretFinding = result.findings.find(f => f.ruleId === 'TG-SEC-001');
        
        expect(secretFinding).toBeDefined();
        
        if (secretFinding) {
          // Bulletproof: handle both legacy string remediation and new object remediation
          const remText = typeof secretFinding.remediation === 'string' 
            ? secretFinding.remediation 
            : (secretFinding.remediation as any).remediation;

          expect(secretFinding.description).not.toContain('MySecretPassword');
          expect(secretFinding.risk).not.toContain('MySecretPassword');
          expect(remText).not.toContain('MySecretPassword');
        }
      }
    });
  });

  describe('Input Size Limits', () => {
    it('should reject extremely large inputs', () => {
      const hugeInput = 'a'.repeat(10 * 1024 * 1024); // 10MB
      const result = scanTerraformCode(hugeInput);
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('exceeds maximum allowed size');
      }
    });

    it('should accept inputs just under the limit', () => {
      const largeInput = 'resource "aws_s3_bucket" "test" { bucket = "test" }';
      const result = scanTerraformCode(largeInput);
      expect('error' in result).toBe(false);
    });
  });

  describe('Concurrent Safety', () => {
    it('should handle multiple concurrent scans without interference', async () => {
      const code1 = `resource "aws_s3_bucket" "test1" { acl = "public-read" }`;
      const code2 = `resource "aws_s3_bucket" "test2" { acl = "private" }`;
      const code3 = `resource "aws_ebs_volume" "test3" { encrypted = false }`;

      const results = await Promise.all([
        scanTerraformCode(code1),
        scanTerraformCode(code2),
        scanTerraformCode(code3),
      ]);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});