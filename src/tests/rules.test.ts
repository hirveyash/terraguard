// src/tests/rules.test.ts
import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';

describe('AST Rule Engine', () => {
  it('should detect unrestricted SSH access (TG-NET-001)', () => {
    const code = `
      resource "aws_security_group" "test" {
        ingress {
          from_port = 22
          to_port = 22
          cidr_blocks = ["0.0.0.0/0"]
        }
      }
    `;
    const result = scanTerraformCode(code);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.findings.some(f => f.ruleId === 'TG-NET-001')).toBe(true);
    }
  });

  it('should detect public S3 bucket (TG-S3-001)', () => {
    const code = `
      resource "aws_s3_bucket" "test" {
        acl = "public-read"
      }
    `;
    const result = scanTerraformCode(code);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.findings.some(f => f.ruleId === 'TG-S3-001')).toBe(true);
    }
  });

  it('should not flag truly secure configurations', () => {
    const code = `
      resource "aws_security_group" "test" {
        ingress {
          from_port = 22
          to_port = 22
          cidr_blocks = ["10.0.0.0/16"]
        }
      }
      resource "aws_s3_bucket" "test" {
        acl = "private"
        server_side_encryption_configuration {
          rule {
            apply_server_side_encryption_by_default {
              sse_algorithm = "AES256"
            }
          }
        }
        versioning {
          enabled = true
        }
      }
      resource "aws_db_instance" "test" {
        publicly_accessible = false
        storage_encrypted = true
        deletion_protection = true
      }
      resource "aws_ebs_volume" "test" {
        encrypted = true
      }
    `;
    const result = scanTerraformCode(code);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.findings.length).toBe(0);
      expect(result.riskScore).toBe(100);
    }
  });
});