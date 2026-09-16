// src/lib/scanner/rules/encryption/tg-elc-001.ts
import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';
import { RULE_MAPPINGS } from '../../frameworks/mappings';

export const tgElc001: Rule = {
  id: 'TG-ELC-001',
  severity: 'HIGH',
  title: 'ElastiCache Redis Encryption Disabled',
  description: 'The ElastiCache replication group does not have transit encryption or at-rest encryption enabled.',
  risk: 'Data transmitted to/from the cache or stored at rest may be intercepted or accessed by unauthorized parties.',
  remediation: {
    explanation: 'ElastiCache clusters should enforce encryption in transit (TLS) and at rest (KMS) to protect sensitive data.',
    impact: 'Unencrypted caches can lead to data leakage if the network is compromised or if storage media is accessed directly.',
    remediation: 'Set transit_encryption_enabled = true and at_rest_encryption_enabled = true.',
    secureExample: `resource "aws_elasticache_replication_group" "secure_redis" {
  replication_group_id = "secure-redis"
  engine               = "redis"
  
  transit_encryption_enabled = true
  at_rest_encryption_enabled = true
}`
  },
  references: ['https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/in-transit-encryption.html'],
  frameworks: RULE_MAPPINGS['TG-ELC-001'] || [],
  resourceType: 'aws_elasticache_replication_group',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_elasticache_replication_group') return false;

    const transit = String(resource.attributes.transit_encryption_enabled || '').toLowerCase();
    const atRest = String(resource.attributes.at_rest_encryption_enabled || '').toLowerCase();

    const isTransitSecure = transit === 'true';
    const isAtRestSecure = atRest === 'true';

    return !isTransitSecure || !isAtRestSecure;
  }
};