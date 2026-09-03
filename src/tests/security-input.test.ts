// src/tests/security-input.test.ts
// Tests for input validation, injection attacks, and malformed input handling

import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';
import { parseHCL } from '@/lib/scanner/parser/hcl-parser';

describe('Security: Input Validation & Injection', () => {
  describe('XSS Prevention', () => {
    it('should safely handle XSS payloads in resource names', () => {
      const maliciousCode = `
        resource "aws_s3_bucket" "<script>alert('xss')</script>" {
          bucket = "test"
        }
      `;
      const result = scanTerraformCode(maliciousCode);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        // Should not crash, should handle gracefully
        expect(result.findings).toBeDefined();
      }
    });

    it('should safely handle XSS in attribute values', () => {
      const maliciousCode = `
        resource "aws_s3_bucket" "test" {
          bucket = "<img src=x onerror=alert(1)>"
          tags = {
            Name = "<svg onload=alert(1)>"
          }
        }
      `;
      const result = scanTerraformCode(maliciousCode);
      expect('error' in result).toBe(false);
    });

    it('should not execute or evaluate JavaScript in strings', () => {
      const maliciousCode = `
        resource "aws_s3_bucket" "test" {
          bucket = "\${alert('xss')}"
        }
      `;
      const result = scanTerraformCode(maliciousCode);
      expect('error' in result).toBe(false);
    });
  });

  describe('Injection Prevention', () => {
    it('should handle SQL injection attempts in strings', () => {
      const maliciousCode = `
        resource "aws_s3_bucket" "test" {
          bucket = "'; DROP TABLE users; --"
        }
      `;
      const result = scanTerraformCode(maliciousCode);
      expect('error' in result).toBe(false);
    });

    it('should handle command injection attempts', () => {
      const maliciousCode = `
        resource "aws_s3_bucket" "test" {
          bucket = "test; rm -rf /"
        }
      `;
      const result = scanTerraformCode(maliciousCode);
      expect('error' in result).toBe(false);
    });

    it('should handle path traversal attempts', () => {
      const maliciousCode = `
        resource "aws_s3_bucket" "test" {
          bucket = "../../../etc/passwd"
        }
      `;
      const result = scanTerraformCode(maliciousCode);
      expect('error' in result).toBe(false);
    });
  });

  describe('Malformed HCL Handling', () => {
    it('should handle unclosed braces gracefully', () => {
      const malformedCode = `
        resource "aws_s3_bucket" "test" {
          bucket = "test"
      `;
      const result = scanTerraformCode(malformedCode);
      // Should not crash, may return error or empty findings
      expect(result).toBeDefined();
    });

    it('should handle extra closing braces', () => {
      const malformedCode = `
        resource "aws_s3_bucket" "test" {
          bucket = "test"
        }
        }
      `;
      const result = scanTerraformCode(malformedCode);
      expect(result).toBeDefined();
    });

    it('should handle missing attribute values', () => {
      const malformedCode = `
        resource "aws_s3_bucket" "test" {
          bucket =
        }
      `;
      const result = scanTerraformCode(malformedCode);
      expect(result).toBeDefined();
    });

    it('should handle invalid syntax gracefully', () => {
      const malformedCode = `
        resource "aws_s3_bucket" "test" {
          this is not valid HCL at all
        }
      `;
      const result = scanTerraformCode(malformedCode);
      expect(result).toBeDefined();
    });

    it('should handle completely empty input', () => {
      const result = scanTerraformCode('');
      expect('error' in result).toBe(true);
    });

    it('should handle whitespace-only input', () => {
      const result = scanTerraformCode('   \n\t  \n  ');
      expect('error' in result).toBe(true);
    });
  });

  describe('Huge File Handling', () => {
    it('should handle large number of resources without crashing', () => {
      let hugeCode = '';
      for (let i = 0; i < 1000; i++) {
        hugeCode += `resource "aws_s3_bucket" "bucket_${i}" { bucket = "test-${i}" }\n`;
      }
      const result = scanTerraformCode(hugeCode);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.resourcesScanned).toBe(1000);
      }
    });

    it('should handle deeply nested blocks', () => {
      let nestedCode = 'resource "aws_s3_bucket" "test" {\n';
      for (let i = 0; i < 50; i++) {
        nestedCode += '  nested_block {\n';
      }
      nestedCode += '    attr = "value"\n';
      for (let i = 0; i < 50; i++) {
        nestedCode += '  }\n';
      }
      nestedCode += '}\n';
      
      const result = scanTerraformCode(nestedCode);
      expect(result).toBeDefined();
    });

    it('should handle very long attribute values', () => {
      const longValue = 'a'.repeat(100000);
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "${longValue}"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });
  });

  describe('Unexpected Data Types', () => {
    it('should handle null input', () => {
      // @ts-expect-error Testing runtime type safety
      const result = scanTerraformCode(null);
      expect('error' in result).toBe(true);
    });

    it('should handle undefined input', () => {
      // @ts-expect-error Testing runtime type safety
      const result = scanTerraformCode(undefined);
      expect('error' in result).toBe(true);
    });

    it('should handle number input', () => {
      // @ts-expect-error Testing runtime type safety
      const result = scanTerraformCode(12345);
      expect('error' in result).toBe(true);
    });

    it('should handle object input', () => {
      // @ts-expect-error Testing runtime type safety
      const result = scanTerraformCode({ bucket: 'test' });
      expect('error' in result).toBe(true);
    });

    it('should handle array input', () => {
      // @ts-expect-error Testing runtime type safety
      const result = scanTerraformCode(['resource', 'aws_s3_bucket']);
      expect('error' in result).toBe(true);
    });

    it('should handle boolean input', () => {
      // @ts-expect-error Testing runtime type safety
      const result = scanTerraformCode(true);
      expect('error' in result).toBe(true);
    });
  });

  describe('Malicious-Looking Strings', () => {
    it('should handle Unicode escape sequences', () => {
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "\\u003cscript\\u003e"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle null bytes', () => {
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "test\\0bucket"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle control characters', () => {
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "test\\n\\t\\rbucket"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle emoji and special characters', () => {
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "test-🔒-bucket-🚀"
          tags = {
            Name = "测试"
          }
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });
  });
});