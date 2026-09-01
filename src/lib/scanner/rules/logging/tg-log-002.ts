import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgLog002: Rule = {
  id: 'TG-LOG-002',
  severity: 'HIGH',
  title: 'CloudTrail logs not encrypted with KMS',
  description: 'An AWS CloudTrail trail does not specify a KMS key for log file encryption.',
  risk: 'Log files are stored with default S3 encryption, which may not meet strict compliance requirements for log integrity.',
  remediation: 'Set kms_key_id to a valid AWS KMS key ARN.',
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: { 'CIS AWS Foundations Benchmark': '3.7' },
  resourceType: 'aws_cloudtrail',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_cloudtrail') return false;
    const kmsKeyId = String(resource.attributes.kms_key_id || '').trim();
    return kmsKeyId === '' || kmsKeyId.toLowerCase() === 'null';
  }
};