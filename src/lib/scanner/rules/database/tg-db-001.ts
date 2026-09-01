import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgDb001: Rule = {
  id: 'TG-DB-001',
  severity: 'HIGH',
  title: 'RDS instance publicly accessible',
  description: 'An RDS database instance is configured with publicly_accessible = true.',
  risk: 'Database is accessible from the public internet, increasing attack surface.',
  remediation: 'Set publicly_accessible = false to ensure the database is only accessible from within the VPC.',
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: { 'CIS AWS Foundations Benchmark': '2.3.1' },
  resourceType: 'aws_db_instance',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_db_instance') return false;
    return resource.attributes.publicly_accessible === true || resource.attributes.publicly_accessible === 'true';
  }
};