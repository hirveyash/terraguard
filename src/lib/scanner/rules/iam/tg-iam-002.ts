import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgIam002: Rule = {
  id: 'TG-IAM-002',
  severity: 'CRITICAL',
  title: 'Overly permissive role trust policy',
  description: 'An IAM role trust policy allows assumption by any AWS account or principal ("*").',
  risk: 'Any AWS account or user can assume this role, leading to complete account compromise.',
  remediation: 'Restrict the Principal to specific AWS account IDs, ARNs, or AWS services.',
  references: ['https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_principal.html'],
  frameworks: { 'CIS AWS Foundations Benchmark': '1.16' },
  resourceType: 'aws_iam_role',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_iam_role') return false;
    const policy = String(resource.attributes.assume_role_policy || '').toLowerCase();
    return policy.includes('effect') && policy.includes('allow') && 
           policy.includes('principal') && policy.includes('"*"');
  }
};