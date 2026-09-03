import { Rule } from '../types';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgEnc001: Rule = {
  id: 'TG-ENC-001',
  severity: 'MEDIUM',
  title: 'EBS volume not encrypted',
  description: 'An EBS volume is not encrypted at rest.',
  risk: 'Data at rest is not protected. Physical access to storage media could lead to data exposure.',
  remediation: {
    explanation: 'Set encrypted = true to protect data at rest.',
    impact: 'This misconfiguration poses a security risk.',
    remediation: 'Set encrypted = true to protect data at rest.',
    secureExample: '# Add secure configuration here'
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-ENC-001'] || [],
  resourceType: 'aws_ebs_volume',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_ebs_volume') return false;
    return resource.attributes.encrypted !== true && resource.attributes.encrypted !== 'true';
  }
};