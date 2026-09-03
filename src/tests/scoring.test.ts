import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';
import { calculateRiskScore, sortFindingsBySeverity } from '@/lib/scanner/reporting/scoring';
import { Finding } from '@/lib/scanner/reporting/types';

describe('Severity & Risk Scoring', () => {
  it('should produce deterministic scores for the same input', () => {
    const code = `resource "aws_s3_bucket" "test" { acl = "public-read" }`;
    const result1 = scanTerraformCode(code);
    const result2 = scanTerraformCode(code);
    expect('error' in result1).toBe(false);
    expect('error' in result2).toBe(false);
    if (!('error' in result1) && !('error' in result2)) {
      expect(result1.riskScore).toBe(result2.riskScore);
      expect(result1.findings.length).toBe(result2.findings.length);
    }
  });

  it('should order findings by severity (CRITICAL first)', () => {
    const code = `
      resource "aws_ebs_volume" "test" { size = 10 }
      resource "aws_s3_bucket" "test" { acl = "public-read" }
    `;
    const result = scanTerraformCode(code);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.findings[0].severity).toBe('CRITICAL');
      expect(result.findings[1].severity).toBe('HIGH');
    }
  });

  it('should calculate risk score correctly based on documented penalties', () => {
    const mockFindings: Finding[] = [
      { ruleId: 'TEST-1', severity: 'CRITICAL', title: '', resource: '', file: '', line: 1, description: '', risk: '', remediation: { explanation: '', impact: '', remediation: '', secureExample: '' }, frameworks: [], references: [] },
      { ruleId: 'TEST-2', severity: 'HIGH', title: '', resource: '', file: '', line: 1, description: '', risk: '', remediation: { explanation: '', impact: '', remediation: '', secureExample: '' }, frameworks: [], references: [] },
    ];
    const score = calculateRiskScore(mockFindings);
    expect(score).toBe(60);
  });

  it('should not produce negative scores', () => {
    const mockFindings: Finding[] = Array(10).fill({
      ruleId: 'TEST', severity: 'CRITICAL', title: '', resource: '', file: '', line: 1, description: '', risk: '', remediation: { explanation: '', impact: '', remediation: '', secureExample: '' }, frameworks: [], references: []
    });
    const score = calculateRiskScore(mockFindings);
    expect(score).toBe(0);
  });

  it('should produce stable output with no fake findings', () => {
    const code = `
      resource "aws_security_group" "test" {
        ingress { from_port = 22; to_port = 22; cidr_blocks = ["10.0.0.0/16"] }
      }
    `;
    const result = scanTerraformCode(code);
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.findings.length).toBe(0);
      expect(result.riskScore).toBe(100);
    }
  });

  it('should include file and line information in findings', () => {
    const code = `resource "aws_s3_bucket" "test" { acl = "public-read" }`;
    const result = scanTerraformCode(code, 'my_infra.tf');
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.findings[0].file).toBe('my_infra.tf');
      expect(result.findings[0].line).toBe(1);
    }
  });
});