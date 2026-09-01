import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgRds003: Rule = {
  id: 'TG-RDS-003',
  severity: 'MEDIUM',
  title: 'RDS instance deletion protection disabled',
  description: 'An RDS database instance has deletion_protection set to false or omitted.',
  risk: 'The database can be accidentally or maliciously deleted, leading to data loss and downtime.',
  remediation: 'Set deletion_protection = true for production databases.',
  references: ['https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_DeleteInstance.html'],
  frameworks: { 'CIS AWS Foundations Benchmark': '2.3.4' },
  resourceType: 'aws_db_instance',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_db_instance') return false;
    const deletionProtection = String(resource.attributes.deletion_protection || '').toLowerCase().trim();
    return deletionProtection !== 'true';
  }
};