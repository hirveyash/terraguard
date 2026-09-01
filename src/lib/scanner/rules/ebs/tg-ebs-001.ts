import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { generateAddAttributeFix } from '../../remediation/generator';

export const tgEbs001: Rule = {
  id: 'TG-EBS-001',
  severity: 'HIGH',
  title: 'EBS volume not encrypted at rest',
  description: 'An EBS volume is created without encryption enabled.',
  risk: 'Data at rest is not protected. Physical access to storage media could lead to data exposure.',
  remediation: {
    explanation: 'The EBS volume is created without the "encrypted = true" attribute. Data stored on this volume is not encrypted at rest.',
    impact: 'If the underlying storage media is compromised (e.g., through physical access, snapshot sharing, or AWS infrastructure incidents), data can be read without decryption keys.',
    remediation: 'Add "encrypted = true" to the EBS volume resource. Optionally specify a KMS key ID for customer-managed encryption.',
    secureExample: `resource "aws_ebs_volume" "secure" {
  availability_zone = "us-east-1a"
  size              = 100
  encrypted         = true
  # kms_key_id     = "arn:aws:kms:..."  # Optional: customer-managed key
}`,
    autoFix: generateAddAttributeFix('encrypted', 'true', 'EBS volume encryption at rest')
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-EBS-001'] || [],
  resourceType: 'aws_ebs_volume',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_ebs_volume') return false;
    const encrypted = String(resource.attributes.encrypted || '').toLowerCase().trim();
    return encrypted !== 'true';
  }
};