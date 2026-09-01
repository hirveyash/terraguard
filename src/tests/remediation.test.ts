// src/tests/remediation.test.ts
import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';
import { 
  generateCidrReplacementFix, 
  generateAddAttributeFix, 
  generateBooleanChangeFix,
  generateRemoveAclFix 
} from '@/lib/scanner/remediation/generator';

describe('Remediation Engine', () => {
  describe('Remediation Structure Quality', () => {
    it('every finding must have complete remediation guidance', () => {
      const code = `
        resource "aws_s3_bucket" "test" {
          acl = "public-read"
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        const finding = result.findings[0];
        expect(finding.remediation.explanation.length).toBeGreaterThan(10);
        expect(finding.remediation.impact.length).toBeGreaterThan(10);
        expect(finding.remediation.remediation.length).toBeGreaterThan(10);
        expect(finding.remediation.secureExample.length).toBeGreaterThan(10);
      }
    });

    it('secureExample must contain valid-looking Terraform code', () => {
      const code = `
        resource "aws_ebs_volume" "test" {
          size = 10
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        const finding = result.findings[0];
        expect(finding.remediation.secureExample).toContain('resource');
        expect(finding.remediation.secureExample).toContain('encrypted');
      }
    });
  });

  describe('Auto-Fix Safety', () => {
    it('auto-fixes must always require confirmation', () => {
      const fix = generateCidrReplacementFix('0.0.0.0/0', 'test');
      expect(fix.requiresConfirmation).toBe(true);
    });

    it('auto-fixes must use placeholders, not assumed private CIDRs', () => {
      const fix = generateCidrReplacementFix('0.0.0.0/0', 'test');
      expect(fix.diff).toContain('<YOUR_CORPORATE_CIDR>');
      expect(fix.diff).not.toContain('10.0.0.0');
      expect(fix.diff).not.toContain('192.168.');
      expect(fix.diff).not.toContain('172.16.');
    });

    it('auto-fixes must document their assumptions', () => {
      const fix = generateCidrReplacementFix('0.0.0.0/0', 'test');
      expect(fix.assumptions.length).toBeGreaterThan(0);
      fix.assumptions.forEach(assumption => {
        expect(assumption.length).toBeGreaterThan(5);
      });
    });

    it('auto-fix diff must be in unified diff format', () => {
      const fix = generateCidrReplacementFix('0.0.0.0/0', 'test');
      expect(fix.diff).toMatch(/^-.+\n\+.+$/m);
    });
  });

  describe('Auto-Fix Generator Functions', () => {
    it('generateCidrReplacementFix produces correct diff', () => {
      const fix = generateCidrReplacementFix('0.0.0.0/0', 'SSH');
      expect(fix.diff).toBe('- cidr_blocks = ["0.0.0.0/0"]\n+ cidr_blocks = ["<YOUR_CORPORATE_CIDR>"]');
    });

    it('generateAddAttributeFix produces correct diff', () => {
      const fix = generateAddAttributeFix('encrypted', 'true', 'EBS');
      expect(fix.diff).toContain('+ encrypted = true');
    });

    it('generateBooleanChangeFix produces correct diff', () => {
      const fix = generateBooleanChangeFix('enable_log_file_validation', 'false', 'true', 'CloudTrail');
      expect(fix.diff).toContain('- enable_log_file_validation = false');
      expect(fix.diff).toContain('+ enable_log_file_validation = true');
    });

    it('generateRemoveAclFix produces correct diff', () => {
      const fix = generateRemoveAclFix('S3');
      expect(fix.diff).toContain('- acl = "public-read"');
    });
  });

  describe('Rules Without Auto-Fix', () => {
    it('TG-IAM-001 should NOT have autoFix (requires business context)', () => {
      const code = `resource "aws_iam_policy" "test" { policy = jsonencode({ Statement = [{ Effect = "Allow", Action = "*", Resource = "*" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        const finding = result.findings.find(f => f.ruleId === 'TG-IAM-001');
        expect(finding).toBeDefined();
        expect(finding!.remediation.autoFix).toBeUndefined();
      }
    });

    it('TG-SEC-001 should NOT have autoFix (requires actual secret value)', () => {
      const code = `resource "aws_db_instance" "test" { password = "secret123" }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        const finding = result.findings.find(f => f.ruleId === 'TG-SEC-001');
        expect(finding).toBeDefined();
        expect(finding!.remediation.autoFix).toBeUndefined();
      }
    });
  });

  describe('Rules With Safe Auto-Fix', () => {
    it('TG-NET-001 should have autoFix for SSH 0.0.0.0/0', () => {
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
        const finding = result.findings.find(f => f.ruleId === 'TG-NET-001');
        expect(finding).toBeDefined();
        expect(finding!.remediation.autoFix).toBeDefined();
        expect(finding!.remediation.autoFix!.requiresConfirmation).toBe(true);
        expect(finding!.remediation.autoFix!.diff).toContain('<YOUR_CORPORATE_CIDR>');
      }
    });

    it('TG-EBS-001 should have autoFix for missing encryption', () => {
      const code = `
        resource "aws_ebs_volume" "test" {
          size = 10
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        const finding = result.findings.find(f => f.ruleId === 'TG-EBS-001');
        expect(finding).toBeDefined();
        expect(finding!.remediation.autoFix).toBeDefined();
        expect(finding!.remediation.autoFix!.diff).toContain('encrypted = true');
      }
    });

    it('TG-S3-001 should have autoFix for public ACL', () => {
      const code = `
        resource "aws_s3_bucket" "test" {
          acl = "public-read"
        }
      `;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        const finding = result.findings.find(f => f.ruleId === 'TG-S3-001');
        expect(finding).toBeDefined();
        expect(finding!.remediation.autoFix).toBeDefined();
        expect(finding!.remediation.autoFix!.diff).toContain('- acl = "public-read"');
      }
    });
  });
});