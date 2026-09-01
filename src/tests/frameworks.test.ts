// src/tests/frameworks.test.ts
import { describe, it, expect } from 'vitest';
import { RULE_MAPPINGS } from '@/lib/scanner/frameworks/mappings';
import { FRAMEWORKS } from '@/lib/scanner/frameworks/types';
import { allRules } from '@/lib/scanner/rules';

describe('Framework Mapping Quality', () => {
  it('should have mappings for all rules (even if empty)', () => {
    allRules.forEach(rule => {
      expect(RULE_MAPPINGS).toHaveProperty(rule.id);
    });
  });

  it('should have valid framework names in all mappings', () => {
    Object.values(RULE_MAPPINGS).forEach(mappings => {
      mappings.forEach(mapping => {
        expect(FRAMEWORKS).toHaveProperty(mapping.framework);
      });
    });
  });

  it('should have non-empty reasons for all mappings', () => {
    Object.values(RULE_MAPPINGS).forEach(mappings => {
      mappings.forEach(mapping => {
        expect(mapping.reason.length).toBeGreaterThan(10);
        expect(mapping.reason).not.toContain('TODO');
      });
    });
  });

  it('should have valid control ID formats', () => {
    Object.values(RULE_MAPPINGS).forEach(mappings => {
      mappings.forEach(mapping => {
        // CIS: numeric like "2.1.1"
        // NIST: alphanumeric like "AC-6" or "SC-13"
        // MITRE: alphanumeric like "T1078.004"
        expect(mapping.control.length).toBeGreaterThan(0);
        expect(mapping.control).toMatch(/^[A-Z0-9.\-]+$/);
      });
    });
  });

  it('should have documented framework versions', () => {
    Object.values(FRAMEWORKS).forEach(framework => {
      expect(framework.version.length).toBeGreaterThan(0);
      expect(framework.url).toMatch(/^https?:\/\//);
    });
  });

  it('should not force mappings onto rules without defensible mappings', () => {
    // TG-RDS-003 (deletion protection) intentionally has no CIS/NIST mapping
    expect(RULE_MAPPINGS['TG-RDS-003']).toEqual([]);
  });

  it('should have at least one mapping for critical security rules', () => {
    const criticalRules = allRules.filter(r => r.severity === 'CRITICAL');
    criticalRules.forEach(rule => {
      const mappings = RULE_MAPPINGS[rule.id] || [];
      expect(mappings.length).toBeGreaterThan(0);
    });
  });
});