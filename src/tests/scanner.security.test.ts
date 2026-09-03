// src/tests/scanner.security.test.ts
import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';
import { MAX_INPUT_SIZE_BYTES } from '@/lib/security';

describe('Phase 1 Security Controls', () => {
  it('should reject oversized input to prevent memory exhaustion', () => {
    const oversizedCode = 'resource "aws_instance" "test" {} '.repeat(MAX_INPUT_SIZE_BYTES);
    const result = scanTerraformCode(oversizedCode);
    
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('exceeds maximum allowed size');
    }
  });

  it('should reject non-string input types safely', () => {
    //  Testing runtime type safety
    const result = scanTerraformCode(null);
    
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toBe('Invalid input type. Expected a string.');
    }
  });

  it('should handle malformed HCL without crashing (Safe Error Handling)', () => {
    const malformedCode = 'resource "aws_instance" { unclosed_brace';
    const result = scanTerraformCode(malformedCode);
    
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.findings).toEqual([]);
    }
  });

  it('should not leak internal error details to the user', () => {
    const result = scanTerraformCode('');
    
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).not.toContain('stack');
      expect(result.error).not.toContain('at ');
      expect(result.error).toBe('Input cannot be empty.');
    }
  });

  it('should successfully scan valid vulnerable Terraform code', () => {
    const validCode = `
resource "aws_security_group" "test" {
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}`;
    const result = scanTerraformCode(validCode);
    
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.findings.length).toBeGreaterThan(0);
      // Updated to use the new Phase 3/4 rule ID and property name
      expect(result.findings[0].ruleId).toBe('TG-NET-001');
      expect(result.riskScore).toBeLessThan(100);
    }
  });
});