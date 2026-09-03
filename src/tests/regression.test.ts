// src/tests/regression.test.ts
// Regression tests for previously fixed bugs

import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';

describe('Regression Tests', () => {
  it('should correctly parse EBS volumes with encrypted = true (Phase 5 fix)', () => {
    const code = `
      resource "aws_ebs_volume" "test" {
        size = 10
        encrypted = true
      }
    `;
    const result = scanTerraformCode(code);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      const ebsFinding = result.findings.find(f => f.ruleId === 'TG-EBS-001');
      expect(ebsFinding).toBeUndefined();
    }
  });

  it('should correctly parse RDS with deletion_protection = true (Phase 5 fix)', () => {
    const code = `
      resource "aws_db_instance" "test" {
        deletion_protection = true
      }
    `;
    const result = scanTerraformCode(code);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      const rdsFinding = result.findings.find(f => f.ruleId === 'TG-RDS-003');
      expect(rdsFinding).toBeUndefined();
    }
  });

  it('should handle single-line jsonencode blocks (Phase 5 fix)', () => {
    const code = `resource "aws_s3_bucket_policy" "test" { policy = jsonencode({ Statement = [{ Effect = "Allow", Principal = "*", Action = "s3:GetObject", Resource = "*" }] }) }`;
    const result = scanTerraformCode(code);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      const s3PolicyFinding = result.findings.find(f => f.ruleId === 'TG-S3-004');
      expect(s3PolicyFinding).toBeDefined();
    }
  });

  it('should handle legacy framework object format (Phase 11 fix)', () => {
    // This tests that the formatters can handle both array and object framework formats
    const code = `resource "aws_s3_bucket" "test" { acl = "public-read" }`;
    const result = scanTerraformCode(code, 'test.tf');
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.findings.length).toBeGreaterThan(0);
      // Verify frameworks are properly formatted
      const finding = result.findings[0];
      expect(Array.isArray(finding.frameworks)).toBe(true);
    }
  });

  it('should produce deterministic JSON output (Phase 13 fix)', () => {
    const code = `
      resource "aws_s3_bucket" "a" { acl = "public-read" }
      resource "aws_ebs_volume" "b" { size = 10 }
    `;
    
    const result1 = scanTerraformCode(code, 'test.tf');
    const result2 = scanTerraformCode(code, 'test.tf');
    
    expect('error' in result1).toBe(false);
    expect('error' in result2).toBe(false);
    
    if (!('error' in result1) && !('error' in result2)) {
      expect(result1.findings).toEqual(result2.findings);
    }
  });
});