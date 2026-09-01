import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { generateCidrReplacementFix } from '../../remediation/generator';

export const tgNet003: Rule = {
  id: 'TG-NET-003',
  severity: 'CRITICAL',
  title: 'Unrestricted Database Ports',
  description: 'A Security Group allows inbound traffic on common database ports from 0.0.0.0/0.',
  risk: 'Exposes databases directly to the public internet, leading to data breaches or ransomware.',
  remediation: {
    explanation: 'The security group allows inbound traffic on database ports (3306, 5432, 1433, 1521, 27017, 6379) from any IP address on the internet.',
    impact: 'Databases are directly exposed to the internet, enabling attackers to perform credential stuffing, exploit database vulnerabilities, or exfiltrate data. This is a critical security risk.',
    remediation: 'Restrict the cidr_blocks to specific trusted IP ranges or internal VPC subnets. Database ports should never be exposed to 0.0.0.0/0.',
    secureExample: `resource "aws_security_group" "database" {
  name        = "database_access"
  description = "Allow database access from application tier only"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # VPC CIDR - replace with your VPC range
  }
}`,
    autoFix: generateCidrReplacementFix('0.0.0.0/0', 'database port access')
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-NET-003'] || [],
  resourceType: 'aws_security_group',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_security_group') return false;
    const dbPorts = [3306, 5432, 1433, 1521, 27017, 6379];
    const ingressBlocks = resource.blocks['ingress'] || [];
    return ingressBlocks.some((ingress: any) => {
      const fromPort = parseInt(ingress.from_port, 10);
      const toPort = parseInt(ingress.to_port, 10);
      const cidrs = ingress.cidr_blocks || [];
      const isOpenToWorld = cidrs.includes('0.0.0.0/0') || cidrs.includes('::/0');
      const hitsDbPort = dbPorts.some(port => fromPort <= port && toPort >= port);
      return isOpenToWorld && hitsDbPort;
    });
  }
};