// src/tests/rules/iam.test.ts
import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';

describe('IAM Security Rules', () => {
  describe('TG-IAM-001: Wildcard Permissions', () => {
    it('POSITIVE: should detect wildcard action and resource', () => {
      const code = `resource "aws_iam_policy" "bad" { policy = jsonencode({ Statement = [{ Effect = "Allow", Action = "*", Resource = "*" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-001')).toBe(true);
    });
    it('NEGATIVE: should not flag restrictive policy', () => {
      const code = `resource "aws_iam_policy" "good" { policy = jsonencode({ Statement = [{ Effect = "Allow", Action = "s3:GetObject", Resource = "arn:aws:s3:::my-bucket/*" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-001')).toBe(false);
    });
    it('EDGE CASE: should handle variable references without crashing', () => {
      const code = `resource "aws_iam_policy" "edge" { policy = var.my_policy_json }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-001')).toBe(false);
    });
  });

  describe('TG-IAM-002: Overly Permissive Trust Policy', () => {
    it('POSITIVE: should detect Principal AWS star', () => {
      const code = `resource "aws_iam_role" "bad" { assume_role_policy = jsonencode({ Statement = [{ Effect = "Allow", Principal = { AWS = "*" }, Action = "sts:AssumeRole" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-002')).toBe(true);
    });
    it('NEGATIVE: should not flag service principal', () => {
      const code = `resource "aws_iam_role" "good" { assume_role_policy = jsonencode({ Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-002')).toBe(false);
    });
    it('EDGE CASE: should handle data source references', () => {
      const code = `resource "aws_iam_role" "edge" { assume_role_policy = data.aws_iam_policy_document.assume_role.json }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-002')).toBe(false);
    });
  });

  describe('TG-IAM-003: Unrestricted iam:PassRole', () => {
    it('POSITIVE: should detect unrestricted PassRole', () => {
      const code = `resource "aws_iam_policy" "bad" { policy = jsonencode({ Statement = [{ Effect = "Allow", Action = "iam:PassRole", Resource = "*" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-003')).toBe(true);
    });
    it('NEGATIVE: should not flag restricted PassRole', () => {
      const code = `resource "aws_iam_policy" "good" { policy = jsonencode({ Statement = [{ Effect = "Allow", Action = "iam:PassRole", Resource = "arn:aws:iam::123456789012:role/SpecificRole" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-003')).toBe(false);
    });
    it('EDGE CASE: should handle array of actions', () => {
      const code = `resource "aws_iam_policy" "edge" { policy = jsonencode({ Statement = [{ Effect = "Allow", Action = ["s3:GetObject", "iam:PassRole"], Resource = "*" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-003')).toBe(true);
    });
  });

  describe('TG-IAM-004: Unauthenticated Cognito Principal', () => {
    it('POSITIVE: should detect unauthenticated Cognito access', () => {
      const code = `resource "aws_iam_role" "bad" { assume_role_policy = jsonencode({ Statement = [{ Effect = "Allow", Principal = { Federated = "cognito-identity.amazonaws.com" }, Action = "sts:AssumeRoleWithWebIdentity", Condition = { StringEquals = { "cognito-identity.amazonaws.com:amr" = "unauthenticated" } } }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-004')).toBe(true);
    });
    it('NEGATIVE: should not flag authenticated Cognito access', () => {
      const code = `resource "aws_iam_role" "good" { assume_role_policy = jsonencode({ Statement = [{ Effect = "Allow", Principal = { Federated = "cognito-identity.amazonaws.com" }, Action = "sts:AssumeRoleWithWebIdentity", Condition = { StringEquals = { "cognito-identity.amazonaws.com:amr" = "authenticated" } } }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-004')).toBe(false);
    });
    it('EDGE CASE: should not flag if condition is missing', () => {
      const code = `resource "aws_iam_role" "edge" { assume_role_policy = jsonencode({ Statement = [{ Effect = "Allow", Principal = { Federated = "cognito-identity.amazonaws.com" }, Action = "sts:AssumeRoleWithWebIdentity" }] }) }`;
      const result = scanTerraformCode(code);
      expect('error' in result).toBe(false);
      if (!('error' in result)) expect(result.findings.some(f => f.ruleId === 'TG-IAM-004')).toBe(false);
    });
  });
});