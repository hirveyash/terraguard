import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgIam001: Rule = {
  id: 'TG-IAM-001',
  severity: 'CRITICAL',
  title: 'Wildcard IAM permissions',
  description: 'An IAM policy grants Action: "*" on Resource: "*". This violates the principle of least privilege.',
  risk: 'Attackers who compromise this policy gain full administrative access to all AWS resources.',
  remediation: 'Restrict the Action to only the specific API calls required, and limit the Resource to specific ARNs.',
  references: ['https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html'],
  frameworks: { 'CIS AWS Foundations Benchmark': '1.16', 'NIST 800-53': 'AC-6' },
  resourceType: 'aws_iam_policy',
  check: (resource: ParsedResource) => {
    if (!['aws_iam_policy', 'aws_iam_role_policy', 'aws_iam_user_policy'].includes(resource.type)) return false;
    const policy = String(resource.attributes.policy || '').toLowerCase();
    return policy.includes('effect') && policy.includes('allow') && 
           policy.includes('action') && policy.includes('"*"') && 
           policy.includes('resource');
  }
};