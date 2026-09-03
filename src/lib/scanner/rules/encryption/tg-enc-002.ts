import { Rule } from '../types';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgEnc002: Rule = {
  id: 'TG-ENC-002',
  severity: 'HIGH',
  title: 'S3 bucket server-side encryption not enabled',
  description: 'An S3 bucket does not have server-side encryption enabled.',
  risk: 'Data stored in the bucket is not encrypted at rest.',
  remediation: {
    explanation: 'Add a server_side_encryption_configuration block with AES256 or aws:kms.',
    impact: 'This misconfiguration poses a security risk.',
    remediation: 'Add a server_side_encryption_configuration block with AES256 or aws:kms.',
    secureExample: '# Add secure configuration here'
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-ENC-002'] || [],
  resourceType: 'aws_s3_bucket',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_s3_bucket') return false;
    const encryptionBlocks = resource.blocks['server_side_encryption_configuration'] || [];
    return encryptionBlocks.length === 0;
  }
};