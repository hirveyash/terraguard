import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { generateAddAttributeFix } from '../../remediation/generator';

export const tgRds002: Rule = {
  id: 'TG-RDS-002',
  severity: 'HIGH',
  title: 'RDS instance storage not encrypted',
  description: 'An RDS database instance does not have storage encryption enabled.',
  risk: 'Data at rest in the database is not encrypted, violating compliance standards.',
  remediation: {
    explanation: 'The RDS instance does not have "storage_encrypted = true" set. Database data, backups, and logs are stored unencrypted.',
    impact: 'Database contents are vulnerable if storage media is compromised. This violates compliance requirements (PCI-DSS, HIPAA, SOC 2) and exposes sensitive data.',
    remediation: 'Add "storage_encrypted = true" to the RDS instance. Note: Encryption can only be enabled at creation time - existing instances must be migrated.',
    secureExample: `resource "aws_db_instance" "secure" {
  identifier           = "secure-db"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  storage_encrypted    = true
  # kms_key_id        = "arn:aws:kms:..."  # Optional: customer-managed key
}`,
    autoFix: generateAddAttributeFix('storage_encrypted', 'true', 'RDS storage encryption')
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-RDS-002'] || [],
  resourceType: 'aws_db_instance',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_db_instance') return false;
    const storageEncrypted = String(resource.attributes.storage_encrypted || '').toLowerCase().trim();
    return storageEncrypted !== 'true';
  }
};