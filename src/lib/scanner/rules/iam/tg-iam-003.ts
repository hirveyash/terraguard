import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgIam003: Rule = {
  id: 'TG-IAM-003',
  severity: 'HIGH',
  title: 'Unrestricted iam:PassRole',
  description: 'An IAM policy allows iam:PassRole on all resources ("*").',
  risk: 'Enables privilege escalation. An attacker can pass a highly privileged role to an EC2 instance or Lambda function they control.',
  remediation: 'Restrict the Resource attribute to specific role ARNs that are required for the task.',
  references: ['https://bishopfox.com/blog/privilege-escalation-in-aws'],
  frameworks: { 'CIS AWS Foundations Benchmark': '1.16', 'NIST 800-53': 'AC-6' },
  resourceType: 'aws_iam_policy',
  check: (resource: ParsedResource) => {
    if (!['aws_iam_policy', 'aws_iam_role_policy', 'aws_iam_user_policy'].includes(resource.type)) return false;
    const policy = String(resource.attributes.policy || '').toLowerCase();
    return policy.includes('effect') && policy.includes('allow') && 
           policy.includes('iam:passrole') && policy.includes('resource') && policy.includes('"*"');
  }
};