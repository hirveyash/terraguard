import { Rule } from '../types';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgDb001: Rule = {
  id: 'TG-DB-001',
  severity: 'HIGH',
  title: 'RDS instance publicly accessible',
  description: 'An RDS database instance is configured with publicly_accessible = true.',
  risk: 'Database is accessible from the public internet, increasing attack surface.',
  remediation: {
    explanation: 'Set publicly_accessible = false to ensure the database is only accessible from within the VPC.',
    impact: 'This misconfiguration poses a security risk.',
    remediation: 'Set publicly_accessible = false to ensure the database is only accessible from within the VPC.',
    secureExample: '# Add secure configuration here'
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-DB-001'] || [],
  resourceType: 'aws_db_instance',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_db_instance') return false;
    return resource.attributes.publicly_accessible === true || resource.attributes.publicly_accessible === 'true';
  }
};