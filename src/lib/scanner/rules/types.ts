// src/lib/scanner/rules/types.ts
import { ParsedResource } from '../parser/hcl-parser';
import { FrameworkMapping } from '../frameworks/mappings';

export interface RuleRemediation {
  explanation: string;
  impact: string;
  remediation: string;
  secureExample: string;
  autoFix?: string;
}

export interface Rule {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  risk: string;
  remediation: RuleRemediation | string;
  references?: string[];
  frameworks: FrameworkMapping[];
  resourceType: string;
  check: (resource: ParsedResource) => boolean;
}