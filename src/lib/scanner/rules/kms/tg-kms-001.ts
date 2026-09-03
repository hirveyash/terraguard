import { Rule } from '../types';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgKms001: Rule = {
  id: 'TG-KMS-001',
  severity: 'CRITICAL',
  title: 'Overly broad KMS key policy',
  description: 'A KMS key policy grants permissions to Principal = "*" or Principal = { AWS = "*" }.',
  risk: 'Any AWS account can use or manage the KMS key, potentially leading to data decryption or key deletion.',
  remediation: {
    explanation: 'Restrict the Principal to specific AWS account IDs or IAM roles.',
    impact: 'This misconfiguration poses a security risk.',
    remediation: 'Restrict the Principal to specific AWS account IDs or IAM roles.',
    secureExample: '# Add secure configuration here'
  },
  references: ['https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html'],
  frameworks: RULE_MAPPINGS['TG-KMS-001'] || [],
  resourceType: 'aws_kms_key',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_kms_key') return false;
    const policy = String(resource.attributes.policy || '').toLowerCase();
    return policy.includes('principal') && (policy.includes('"*"') || policy.includes('{ "aws" : "*" }') || policy.includes('{ "aws": "*" }'));
  }
};