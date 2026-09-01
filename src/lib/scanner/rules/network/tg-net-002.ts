import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { generateCidrReplacementFix } from '../../remediation/generator';

export const tgNet002: Rule = {
  id: 'TG-NET-002',
  severity: 'HIGH',
  title: 'Unrestricted RDP access (Port 3389 open to the world)',
  description: 'A Security Group allows inbound RDP traffic (port 3389) from any IP address.',
  risk: 'Exposes Windows servers to brute-force attacks from the public internet.',
  remediation: {
    explanation: 'The security group ingress rule allows RDP (port 3389) traffic from any IP address on the internet (0.0.0.0/0).',
    impact: 'Windows servers are exposed to brute-force attacks, BlueKeep-style exploits, and ransomware campaigns. RDP is a high-value target for attackers.',
    remediation: 'Restrict the cidr_blocks for port 3389 to trusted IPs only. Consider using AWS Systems Manager Session Manager as a more secure alternative to RDP.',
    secureExample: `resource "aws_security_group" "rdp_access" {
  name        = "allow_rdp"
  description = "Allow RDP from corporate network only"

  ingress {
    from_port   = 3389
    to_port     = 3389
    protocol    = "tcp"
    cidr_blocks = ["203.0.113.0/24"]  # Replace with your corporate CIDR
  }
}`,
    autoFix: generateCidrReplacementFix('0.0.0.0/0', 'RDP access (port 3389)')
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-NET-002'] || [],
  resourceType: 'aws_security_group',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_security_group') return false;
    const ingressBlocks = resource.blocks['ingress'] || [];
    return ingressBlocks.some((ingress: any) => {
      const fromPort = parseInt(ingress.from_port, 10);
      const toPort = parseInt(ingress.to_port, 10);
      const cidrs = ingress.cidr_blocks || [];
      return (fromPort <= 3389 && toPort >= 3389) && cidrs.includes('0.0.0.0/0');
    });
  }
};