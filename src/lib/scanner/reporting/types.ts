// src/lib/scanner/reporting/types.ts
import { Severity } from '../severity/types';
import { FrameworkMappings } from '../frameworks/types';
import { RuleRemediation } from '../remediation/types';

export interface Finding {
  ruleId: string;
  severity: Severity;
  title: string;
  resource: string;
  file: string;
  line: number;
  description: string;
  risk: string;
  remediation: RuleRemediation;
  frameworks: FrameworkMappings;
  references?: string[];
}

export interface ScanResult {
  findings: Finding[];
  riskScore: number;
  totalRulesChecked: number;
  resourcesScanned: number; // NEW
}

export type ScanOutput = ScanResult | { error: string };