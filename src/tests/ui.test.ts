// src/tests/ui.test.ts
import { describe, it, expect } from 'vitest';
import {
  getCategoryFromRuleId,
  getUniqueResourceTypes,
  getUniqueCategories,
  getUniqueRuleIds,
  countBySeverity,
  filterFindings,
  getCodeContext,
} from '@/lib/ui/helpers';
import { Finding } from '@/lib/scanner';

const makeFinding = (overrides: Partial<Finding>): Finding => ({
  ruleId: 'TG-IAM-001',
  severity: 'HIGH',
  title: 'Test',
  resource: 'aws_iam_policy.test',
  file: 'main.tf',
  line: 1,
  description: 'Test',
  risk: 'Test',
  remediation: {
    explanation: 'Test',
    impact: 'Test',
    remediation: 'Test',
    secureExample: 'resource "aws_iam_policy" "test" {}',
  },
  frameworks: [],
  ...overrides,
});

describe('UI Helpers', () => {
  describe('getCategoryFromRuleId', () => {
    it('maps IAM rules to IAM', () => expect(getCategoryFromRuleId('TG-IAM-001')).toBe('IAM'));
    it('maps S3 rules to Storage', () => expect(getCategoryFromRuleId('TG-S3-001')).toBe('Storage'));
    it('maps EBS rules to Storage', () => expect(getCategoryFromRuleId('TG-EBS-001')).toBe('Storage'));
    it('maps RDS rules to Database', () => expect(getCategoryFromRuleId('TG-RDS-001')).toBe('Database'));
    it('maps KMS rules to Encryption', () => expect(getCategoryFromRuleId('TG-KMS-001')).toBe('Encryption'));
    it('maps SEC rules to Secrets', () => expect(getCategoryFromRuleId('TG-SEC-001')).toBe('Secrets'));
    it('maps NET rules to Network', () => expect(getCategoryFromRuleId('TG-NET-001')).toBe('Network'));
    it('maps NACL rules to Network', () => expect(getCategoryFromRuleId('TG-NACL-001')).toBe('Network'));
    it('maps EC2 rules to Compute', () => expect(getCategoryFromRuleId('TG-EC2-001')).toBe('Compute'));
    it('maps LOG rules to Logging', () => expect(getCategoryFromRuleId('TG-LOG-001')).toBe('Logging'));
    it('returns Other for unknown prefixes', () => expect(getCategoryFromRuleId('TG-XYZ-001')).toBe('Other'));
  });

  describe('countBySeverity', () => {
    it('counts findings by severity correctly', () => {
      const findings = [
        makeFinding({ severity: 'CRITICAL' }),
        makeFinding({ severity: 'CRITICAL' }),
        makeFinding({ severity: 'HIGH' }),
        makeFinding({ severity: 'MEDIUM' }),
      ];
      const counts = countBySeverity(findings);
      expect(counts.CRITICAL).toBe(2);
      expect(counts.HIGH).toBe(1);
      expect(counts.MEDIUM).toBe(1);
      expect(counts.LOW).toBe(0);
      expect(counts.INFO).toBe(0);
    });

    it('returns all zeros for empty findings', () => {
      const counts = countBySeverity([]);
      expect(counts.CRITICAL).toBe(0);
      expect(counts.HIGH).toBe(0);
    });
  });

  describe('getUniqueResourceTypes', () => {
    it('extracts unique resource types', () => {
      const findings = [
        makeFinding({ resource: 'aws_s3_bucket.a' }),
        makeFinding({ resource: 'aws_s3_bucket.b' }),
        makeFinding({ resource: 'aws_ebs_volume.x' }),
      ];
      const types = getUniqueResourceTypes(findings);
      expect(types).toEqual(['aws_ebs_volume', 'aws_s3_bucket']);
    });
  });

  describe('getUniqueCategories', () => {
    it('extracts unique categories', () => {
      const findings = [
        makeFinding({ ruleId: 'TG-IAM-001' }),
        makeFinding({ ruleId: 'TG-IAM-002' }),
        makeFinding({ ruleId: 'TG-S3-001' }),
      ];
      const cats = getUniqueCategories(findings);
      expect(cats).toEqual(['IAM', 'Storage']);
    });
  });

  describe('getUniqueRuleIds', () => {
    it('extracts unique rule IDs', () => {
      const findings = [
        makeFinding({ ruleId: 'TG-IAM-001' }),
        makeFinding({ ruleId: 'TG-IAM-001' }),
        makeFinding({ ruleId: 'TG-S3-001' }),
      ];
      const ids = getUniqueRuleIds(findings);
      expect(ids).toEqual(['TG-IAM-001', 'TG-S3-001']);
    });
  });

  describe('filterFindings', () => {
    const findings = [
      makeFinding({ ruleId: 'TG-IAM-001', severity: 'CRITICAL', resource: 'aws_iam_policy.a', title: 'Wildcard IAM' }),
      makeFinding({ ruleId: 'TG-S3-001', severity: 'HIGH', resource: 'aws_s3_bucket.b', title: 'Public S3' }),
      makeFinding({ ruleId: 'TG-NET-001', severity: 'HIGH', resource: 'aws_security_group.c', title: 'Open SSH' }),
    ];

    it('returns all findings when no filters', () => {
      expect(filterFindings(findings, {}).length).toBe(3);
    });

    it('filters by severity', () => {
      const filtered = filterFindings(findings, { severities: ['CRITICAL'] });
      expect(filtered.length).toBe(1);
      expect(filtered[0].ruleId).toBe('TG-IAM-001');
    });

    it('filters by multiple severities', () => {
      const filtered = filterFindings(findings, { severities: ['CRITICAL', 'HIGH'] });
      expect(filtered.length).toBe(3);
    });

    it('filters by resource type', () => {
      const filtered = filterFindings(findings, { resourceTypes: ['aws_s3_bucket'] });
      expect(filtered.length).toBe(1);
      expect(filtered[0].ruleId).toBe('TG-S3-001');
    });

    it('filters by category', () => {
      const filtered = filterFindings(findings, { categories: ['Network'] });
      expect(filtered.length).toBe(1);
      expect(filtered[0].ruleId).toBe('TG-NET-001');
    });

    it('filters by rule ID', () => {
      const filtered = filterFindings(findings, { ruleIds: ['TG-S3-001'] });
      expect(filtered.length).toBe(1);
    });

    it('searches across title, description, resource, ruleId', () => {
      expect(filterFindings(findings, { search: 'Wildcard' }).length).toBe(1);
      expect(filterFindings(findings, { search: 'aws_s3_bucket' }).length).toBe(1);
      expect(filterFindings(findings, { search: 'TG-NET' }).length).toBe(1);
      expect(filterFindings(findings, { search: 'nonexistent' }).length).toBe(0);
    });

    it('combines multiple filters', () => {
      const filtered = filterFindings(findings, {
        severities: ['HIGH'],
        categories: ['Network'],
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].ruleId).toBe('TG-NET-001');
    });

    it('returns empty when filters conflict', () => {
      const filtered = filterFindings(findings, {
        severities: ['CRITICAL'],
        categories: ['Network'],
      });
      expect(filtered.length).toBe(0);
    });
  });

  describe('getCodeContext', () => {
    const source = `line1
line2
line3
line4
line5
line6
line7
line8
line9
line10`;

    it('returns context around target line', () => {
      const { lines } = getCodeContext(source, 5, 2);
      expect(lines.length).toBe(5);
      expect(lines[0].number).toBe(3);
      expect(lines[4].number).toBe(7);
    });

    it('clamps to start of file', () => {
      const { lines } = getCodeContext(source, 1, 5);
      expect(lines[0].number).toBe(1);
    });

    it('clamps to end of file', () => {
      const { lines } = getCodeContext(source, 10, 5);
      expect(lines[lines.length - 1].number).toBe(10);
    });

    it('handles single-line source', () => {
      const { lines } = getCodeContext('only-line', 1, 5);
      expect(lines.length).toBe(1);
      expect(lines[0].content).toBe('only-line');
    });
  });
});