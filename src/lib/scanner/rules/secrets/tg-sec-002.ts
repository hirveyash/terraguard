// src/lib/scanner/rules/secrets/tg-sec-002.ts
import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgSec002: Rule = {
  id: 'TG-SEC-002',
  severity: 'HIGH',
  title: 'Hardcoded Secret in Secrets Manager Resource',
  description: 'A secret value is hardcoded directly into the aws_secretsmanager_secret_version resource.',
  risk: 'While Secrets Manager is the correct service, hardcoding the value in Terraform exposes it in state files, CI/CD logs, and version control history.',
  remediation: {
    explanation: 'Hardcoding secret_string in Terraform means the plaintext secret exists in your .tf files and .tfstate files.',
    impact: 'Anyone with read access to the Terraform state file or the source code repository can retrieve the plaintext secret.',
    remediation: 'Use a variable (var.secret_json) or a data source to inject the secret value at runtime. Do not commit the plaintext JSON to source control.',
    secureExample: `resource "aws_secretsmanager_secret_version" "secure_db" {
  secret_id = aws_secretsmanager_secret.database.id
  
  # Use a variable instead of hardcoding the JSON
  secret_string = var.database_secret_json 
}`
  },
  references: ['https://developer.hashicorp.com/terraform/language/state/sensitive-data'],
  frameworks: [],
  resourceType: 'aws_secretsmanager_secret_version',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_secretsmanager_secret_version') return false;

    const secretString = String(resource.attributes.secret_string || '');
    
    if (secretString && !secretString.startsWith('var.') && !secretString.startsWith('data.')) {
      const lowerStr = secretString.toLowerCase();
      if (lowerStr.includes('password') || lowerStr.includes('username') || lowerStr.includes('secret')) {
        return true;
      }
    }
    return false;
  }
};