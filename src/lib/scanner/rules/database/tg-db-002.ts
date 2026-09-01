import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgDb002: Rule = {
  id: 'TG-DB-002',
  severity: 'HIGH',
  title: 'RDS instance storage not encrypted',
  description: 'An RDS database instance does not have storage encryption enabled.',
  risk: 'Data at rest in the database is not encrypted.',
  remediation: 'Set storage_encrypted = true to encrypt data at rest.',
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: { 'CIS AWS Foundations Benchmark': '2.3.2' },
  resourceType: 'aws_db_instance',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_db_instance') return false;
    return resource.attributes.storage_encrypted !== true && resource.attributes.storage_encrypted !== 'true';
  }
};