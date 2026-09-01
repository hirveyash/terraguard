// src/tests/rules/storage.test.ts
import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';

describe('Storage & Encryption Security Rules', () => {
  describe('S3 Rules', () => {
    it('TG-S3-001: should detect public-read ACL', () => {
      const code = `
        resource "aws_s3_bucket" "test" { 
          acl = "public-read" 
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-S3-001')).toBe(true);
    });

    it('TG-S3-003: should detect missing encryption', () => {
      const code = `
        resource "aws_s3_bucket" "test" { 
          bucket = "my-bucket" 
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-S3-003')).toBe(true);
    });

    it('TG-S3-004: should detect insecure bucket policy', () => {
      // Single-line jsonencode ensures the parser captures the entire policy string
      const code = `resource "aws_s3_bucket_policy" "test" { policy = jsonencode({ Statement = [{ Effect = "Allow", Principal = "*", Action = "s3:GetObject", Resource = "*" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-S3-004')).toBe(true);
    });
  });

  describe('EBS Rules', () => {
    it('TG-EBS-001: should detect unencrypted EBS volume', () => {
      const code = `
        resource "aws_ebs_volume" "test" { 
          size = 10
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-EBS-001')).toBe(true);
    });

    it('TG-EBS-001: should not flag encrypted EBS volume', () => {
      const code = `
        resource "aws_ebs_volume" "test" { 
          size = 10
          encrypted = true
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-EBS-001')).toBe(false);
    });
  });

  describe('RDS Rules', () => {
    it('TG-RDS-001: should detect publicly accessible RDS', () => {
      const code = `
        resource "aws_db_instance" "test" { 
          publicly_accessible = true 
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-RDS-001')).toBe(true);
    });

    it('TG-RDS-002: should detect unencrypted RDS', () => {
      const code = `
        resource "aws_db_instance" "test" { 
          storage_encrypted = false 
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-RDS-002')).toBe(true);
    });
  });

  describe('KMS Rules', () => {
    it('TG-KMS-001: should detect overly broad KMS policy', () => {
      // Single-line jsonencode ensures the parser captures the entire policy string
      const code = `resource "aws_kms_key" "test" { policy = jsonencode({ Statement = [{ Effect = "Allow", Principal = { AWS = "*" }, Action = "kms:*" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-KMS-001')).toBe(true);
    });
  });

  describe('Secrets Rules', () => {
    it('TG-SEC-001: should detect hardcoded password', () => {
      const code = `
        resource "aws_db_instance" "test" { 
          password = "SuperSecretPassword123!" 
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-SEC-001')).toBe(true);
    });

    it('TG-SEC-001: should NOT flag variable reference for password', () => {
      const code = `
        resource "aws_db_instance" "test" { 
          password = var.db_password 
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-SEC-001')).toBe(false);
    });
  });
});