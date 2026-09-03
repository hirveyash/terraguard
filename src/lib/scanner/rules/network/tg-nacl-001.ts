import { Rule } from '../types';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgNacl001: Rule = {
  id: 'TG-NACL-001',
  severity: 'CRITICAL',
  title: 'Network ACL allows all inbound traffic',
  description: 'A Network ACL rule allows all inbound traffic (protocol -1, cidr 0.0.0.0/0, action allow).',
  risk: 'Network ACLs are stateless. Allowing all inbound traffic exposes the subnet to unrestricted network access.',
  remediation: {
    explanation: 'Restrict the cidr_block, protocol, and port_range to only necessary traffic.',
    impact: 'This misconfiguration poses a security risk.',
    remediation: 'Restrict the cidr_block, protocol, and port_range to only necessary traffic.',
    secureExample: '# Add secure configuration here'
  },
  references: ['https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html'],
  frameworks: RULE_MAPPINGS['TG-NACL-001'] || [],
  resourceType: 'aws_network_acl_rule',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_network_acl_rule') return false;
    const egress = String(resource.attributes.egress || '').toLowerCase().trim();
    const protocol = String(resource.attributes.protocol || '').toLowerCase().trim();
    const cidrBlock = String(resource.attributes.cidr_block || '').toLowerCase().trim();
    const ruleAction = String(resource.attributes.rule_action || '').toLowerCase().trim();
    
    const isInbound = egress !== 'true';
    const isAllTraffic = protocol === '-1' || protocol === '108' || protocol === 'all';
    const isOpenToWorld = cidrBlock === '0.0.0.0/0';
    const isAllow = ruleAction === 'allow';
    
    return isInbound && isAllTraffic && isOpenToWorld && isAllow;
  }
};