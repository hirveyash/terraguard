import { Rule } from '../types';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgS3004: Rule = {
  id: 'TG-S3-004',
  severity: 'CRITICAL',
  title: 'Insecure S3 bucket policy',
  description: 'An S3 bucket policy grants access to Principal = "*" or Principal = { AWS = "*" }.',
  risk: 'Allows any AWS account or anonymous user to perform actions on the bucket.',
  remediation: {
    explanation: 'Restrict the Principal to specific AWS account IDs or IAM roles.',
    impact: 'This misconfiguration poses a security risk.',
    remediation: 'Restrict the Principal to specific AWS account IDs or IAM roles.',
    secureExample: '# Add secure configuration here'
  },
  references: ['https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html'],
  frameworks: RULE_MAPPINGS['TG-S3-004'] || [],
  resourceType: 'aws_s3_bucket_policy',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_s3_bucket_policy') return false;
    const policy = String(resource.attributes.policy || '').toLowerCase();
    return policy.includes('principal') && (policy.includes('"*"') || policy.includes('{ "aws" : "*" }') || policy.includes('{ "aws": "*" }'));
  }
};