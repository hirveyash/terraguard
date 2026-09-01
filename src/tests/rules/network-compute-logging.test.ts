// src/tests/rules/network-compute-logging.test.ts
import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';

describe('Network, Compute & Logging Security Rules', () => {
  describe('Network Rules', () => {
    it('TG-NET-003: should detect unrestricted database ports', () => {
      const code = `
        resource "aws_security_group" "test" {
          ingress {
            from_port = 3306
            to_port = 3306
            cidr_blocks = ["0.0.0.0/0"]
          }
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-NET-003')).toBe(true);
    });

    it('TG-NET-004: should detect unrestricted all ports', () => {
      const code = `
        resource "aws_security_group" "test" {
          ingress {
            from_port = 0
            to_port = 0
            cidr_blocks = ["0.0.0.0/0"]
          }
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-NET-004')).toBe(true);
    });

    it('TG-NACL-001: should detect overly permissive NACL', () => {
      const code = `
        resource "aws_network_acl_rule" "test" {
          network_acl_id = "acl-123"
          rule_number = 100
          egress = false
          protocol = "-1"
          rule_action = "allow"
          cidr_block = "0.0.0.0/0"
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-NACL-001')).toBe(true);
    });
  });

  describe('Compute Rules', () => {
    it('TG-EC2-001: should detect IMDSv1 allowed (explicit)', () => {
      const code = `
        resource "aws_instance" "test" {
          ami = "ami-123"
          instance_type = "t2.micro"
          metadata_options {
            http_tokens = "optional"
          }
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-EC2-001')).toBe(true);
    });

    it('TG-EC2-001: should not flag IMDSv2 required', () => {
      const code = `
        resource "aws_instance" "test" {
          ami = "ami-123"
          instance_type = "t2.micro"
          metadata_options {
            http_tokens = "required"
          }
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-EC2-001')).toBe(false);
    });
  });

  describe('Logging Rules', () => {
    it('TG-LOG-001: should detect CloudTrail validation disabled', () => {
      const code = `
        resource "aws_cloudtrail" "test" {
          name = "my-trail"
          s3_bucket_name = "my-bucket"
          enable_log_file_validation = false
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-LOG-001')).toBe(true);
    });

    it('TG-LOG-002: should detect CloudTrail missing KMS encryption', () => {
      const code = `
        resource "aws_cloudtrail" "test" {
          name = "my-trail"
          s3_bucket_name = "my-bucket"
          enable_log_file_validation = true
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-LOG-002')).toBe(true);
    });

    it('TG-LOG-001 & TG-LOG-002: should not flag secure CloudTrail', () => {
      const code = `
        resource "aws_cloudtrail" "test" {
          name = "my-trail"
          s3_bucket_name = "my-bucket"
          enable_log_file_validation = true
          kms_key_id = "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012"
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.findings.some(f => f.ruleId === 'TG-LOG-001')).toBe(false);
        expect(result.findings.some(f => f.ruleId === 'TG-LOG-002')).toBe(false);
      }
    });
  });
});