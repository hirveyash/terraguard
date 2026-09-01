// src/lib/scanner/rules/types.ts
import { Severity } from '../severity/types';
import { FrameworkMappings } from '../frameworks/types';
import { ParsedResource } from '../parser/hcl-parser';
import { RuleRemediation } from '../remediation/types';

export interface Rule {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  risk: string;
  remediation: RuleRemediation;  // Changed from string to RuleRemediation
  references: string[];
  frameworks: FrameworkMappings;
  resourceType: string;
  check: (resource: ParsedResource) => boolean;
}