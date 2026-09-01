// src/lib/scanner/remediation/types.ts

export interface RemediationGuidance {
  explanation: string;    // What is wrong?
  impact: string;         // Why it matters / What could happen?
  remediation: string;    // How to fix it (instructions)
  secureExample: string;  // Secure Terraform code snippet
}

export interface AutoFix {
  description: string;      // What the fix does
  diff: string;             // Unified diff format
  assumptions: string[];    // What the fix assumes
  requiresConfirmation: true; // Always true - never silent
}

export interface RuleRemediation extends RemediationGuidance {
  autoFix?: AutoFix;  // Optional - only for safe, unambiguous fixes
}