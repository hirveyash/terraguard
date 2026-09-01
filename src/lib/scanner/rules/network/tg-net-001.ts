import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { generateCidrReplacementFix } from '../../remediation/generator';

export const tgNet001: Rule = {
  id: 'TG-NET-001',
  severity: 'HIGH',
  title: 'Unrestricted SSH access (Port 22 open to the world)',
  description: 'A Security Group allows inbound SSH traffic (port 22) from any IP address (0.0.0.0/0).',
  risk: 'Exposes servers to brute-force attacks from the public internet.',
  remediation: {
    explanation: 'The security group ingress rule allows SSH (port 22) traffic from any IP address on the internet (0.0.0.0/0). This means anyone, anywhere can attempt to connect to your servers via SSH.',
    impact: 'Attackers can perform brute-force password attacks, exploit SSH vulnerabilities, or attempt to gain unauthorized access to your servers. This is one of the most common attack vectors in cloud environments.',
    remediation: 'Restrict the cidr_blocks for port 22 to your specific corporate IP address, VPN CIDR range, or a trusted bastion host IP. Never use 0.0.0.0/0 for administrative ports.',
    secureExample: `resource "aws_security_group" "ssh_access" {
  name        = "allow_ssh"
  description = "Allow SSH inbound from corporate network only"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.0/24"]  # Replace with your corporate CIDR
  }
}`,
    autoFix: generateCidrReplacementFix('0.0.0.0/0', 'SSH access (port 22)')
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-NET-001'] || [],
  resourceType: 'aws_security_group',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_security_group') return false;
    const ingressBlocks = resource.blocks['ingress'] || [];
    return ingressBlocks.some((ingress: any) => {
      const fromPort = parseInt(ingress.from_port, 10);
      const toPort = parseInt(ingress.to_port, 10);
      const cidrs = ingress.cidr_blocks || [];
      return (fromPort <= 22 && toPort >= 22) && cidrs.includes('0.0.0.0/0');
    });
  }
};