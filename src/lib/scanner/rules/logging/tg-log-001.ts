import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { generateBooleanChangeFix } from '../../remediation/generator';

export const tgLog001: Rule = {
  id: 'TG-LOG-001',
  severity: 'HIGH',
  title: 'CloudTrail log file validation disabled',
  description: 'An AWS CloudTrail trail does not have log file validation enabled.',
  risk: 'Without validation, it is difficult to prove that log files have not been tampered with after creation.',
  remediation: {
    explanation: 'The CloudTrail trail has "enable_log_file_validation" set to false or omitted. Log file integrity cannot be cryptographically verified.',
    impact: 'If an attacker gains access to the S3 bucket storing CloudTrail logs, they can modify or delete log entries without detection. This undermines forensic investigations and compliance audits.',
    remediation: 'Set "enable_log_file_validation = true" to enable cryptographic validation of log file integrity using SHA-256 hashes and digests.',
    secureExample: `resource "aws_cloudtrail" "secure" {
  name                          = "secure-trail"
  s3_bucket_name                = aws_s3_bucket.trail_bucket.id
  enable_log_file_validation    = true
  is_multi_region_trail         = true
  include_global_service_events = true
}`,
    autoFix: generateBooleanChangeFix('enable_log_file_validation', 'false', 'true', 'CloudTrail log integrity')
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-LOG-001'] || [],
  resourceType: 'aws_cloudtrail',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_cloudtrail') return false;
    const validation = String(resource.attributes.enable_log_file_validation || '').toLowerCase().trim();
    return validation !== 'true';
  }
};