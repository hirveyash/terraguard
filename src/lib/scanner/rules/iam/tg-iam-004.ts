import { Rule } from '../types';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgIam004: Rule = {
  id: 'TG-IAM-004',
  severity: 'HIGH',
  title: 'Unauthenticated Cognito principal allowed',
  description: 'An IAM role trust policy explicitly allows unauthenticated Cognito identities.',
  risk: 'Allows anonymous, unauthenticated users to assume the role and access associated AWS resources.',
  remediation: {
    explanation: 'Remove the unauthenticated condition. Require authenticated Cognito identities or other secure federation methods.',
    impact: 'This misconfiguration poses a security risk.',
    remediation: 'Remove the unauthenticated condition. Require authenticated Cognito identities or other secure federation methods.',
    secureExample: '# Add secure configuration here'
  },
  references: ['https://docs.aws.amazon.com/cognito/latest/developerguide/iam-roles.html'],
  frameworks: RULE_MAPPINGS['TG-IAM-004'] || [],
  resourceType: 'aws_iam_role',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_iam_role') return false;
    const policy = String(resource.attributes.assume_role_policy || '').toLowerCase();
    return policy.includes('federated') && policy.includes('cognito-identity.amazonaws.com') && 
           policy.includes('unauthenticated');
  }
};