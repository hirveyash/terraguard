import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { generateCidrReplacementFix } from '../../remediation/generator';

export const tgNet004: Rule = {
  id: 'TG-NET-004',
  severity: 'CRITICAL',
  title: 'Unrestricted All Ports',
  description: 'A Security Group allows inbound traffic on all ports (0-65535) from 0.0.0.0/0.',
  risk: 'Complete network exposure of the instance to the public internet.',
  remediation: {
    explanation: 'The security group allows inbound traffic on ALL ports (0-65535) from any IP address. This effectively disables network-level access controls.',
    impact: 'Every service running on the instance is exposed to the internet. Attackers can scan, probe, and exploit any listening service. This is equivalent to having no firewall.',
    remediation: 'Restrict the port range and cidr_blocks to only what is strictly necessary. Apply the principle of least privilege at the network layer.',
    secureExample: `resource "aws_security_group" "web_server" {
  name        = "web_server"
  description = "Allow HTTP/HTTPS from internet, SSH from corporate"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # HTTP is acceptable for web servers
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # HTTPS is acceptable for web servers
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.0/24"]  # SSH restricted to corporate
  }
}`,
    autoFix: generateCidrReplacementFix('0.0.0.0/0', 'all ports access')
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-NET-004'] || [],
  resourceType: 'aws_security_group',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_security_group') return false;
    const ingressBlocks = resource.blocks['ingress'] || [];
    return ingressBlocks.some((ingress: any) => {
      const fromPort = parseInt(ingress.from_port, 10);
      const toPort = parseInt(ingress.to_port, 10);
      const cidrs = ingress.cidr_blocks || [];
      const isOpenToWorld = cidrs.includes('0.0.0.0/0') || cidrs.includes('::/0');
      const isAllPorts = (fromPort === 0 && (toPort === 0 || toPort === 65535));
      return isOpenToWorld && isAllPorts;
    });
  }
};