import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgKms001: Rule = {
  id: 'TG-KMS-001',
  severity: 'CRITICAL',
  title: 'Overly broad KMS key policy',
  description: 'A KMS key policy grants permissions to Principal = "*" or Principal = { AWS = "*" }.',
  risk: 'Any AWS account can use or manage the KMS key, potentially leading to data decryption or key deletion.',
  remediation: 'Restrict the Principal to specific AWS account IDs or IAM roles.',
  references: ['https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html'],
  frameworks: { 'CIS AWS Foundations Benchmark': '2.1.6' },
  resourceType: 'aws_kms_key',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_kms_key') return false;
    const policy = String(resource.attributes.policy || '').toLowerCase();
    return policy.includes('principal') && (policy.includes('"*"') || policy.includes('{ "aws" : "*" }') || policy.includes('{ "aws": "*" }'));
  }
};