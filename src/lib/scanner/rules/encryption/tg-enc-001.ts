import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgEnc001: Rule = {
  id: 'TG-ENC-001',
  severity: 'MEDIUM',
  title: 'EBS volume not encrypted',
  description: 'An EBS volume is not encrypted at rest.',
  risk: 'Data at rest is not protected. Physical access to storage media could lead to data exposure.',
  remediation: 'Set encrypted = true to protect data at rest.',
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: { 'CIS AWS Foundations Benchmark': '2.2.1' },
  resourceType: 'aws_ebs_volume',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_ebs_volume') return false;
    return resource.attributes.encrypted !== true && resource.attributes.encrypted !== 'true';
  }
};