import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgEc2001: Rule = {
  id: 'TG-EC2-001',
  severity: 'HIGH',
  title: 'EC2 Instance Metadata Service (IMDS) v1 Allowed',
  description: 'An EC2 instance or launch template allows IMDSv1 (http_tokens is not set to "required").',
  risk: 'IMDSv1 is vulnerable to SSRF attacks, allowing attackers to steal IAM credentials.',
  remediation: 'Set http_tokens = "required" in the metadata_options block.',
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: { 'CIS AWS Foundations Benchmark': '4.1' },
  resourceType: 'aws_instance',
  check: (resource: ParsedResource) => {
    if (!['aws_instance', 'aws_launch_template', 'aws_launch_configuration'].includes(resource.type)) return false;
    const metadataBlocks = resource.blocks['metadata_options'] || [];
    if (metadataBlocks.length === 0) return true; // Missing block defaults to optional (vulnerable)
    const httpTokens = String(metadataBlocks[0].http_tokens || '').toLowerCase().trim();
    return httpTokens !== 'required';
  }
};