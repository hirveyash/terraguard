import { Rule } from '../types';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgDb002: Rule = {
  id: 'TG-DB-002',
  severity: 'HIGH',
  title: 'RDS instance storage not encrypted',
  description: 'An RDS database instance does not have storage encryption enabled.',
  risk: 'Data at rest in the database is not encrypted.',
  remediation: {
    explanation: 'Set storage_encrypted = true to encrypt data at rest.',
    impact: 'This misconfiguration poses a security risk.',
    remediation: 'Set storage_encrypted = true to encrypt data at rest.',
    secureExample: '# Add secure configuration here'
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-DB-002'] || [],
  resourceType: 'aws_db_instance',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_db_instance') return false;
    return resource.attributes.storage_encrypted !== true && resource.attributes.storage_encrypted !== 'true';
  }
};