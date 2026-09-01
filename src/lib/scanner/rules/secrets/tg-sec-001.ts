import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgSec001: Rule = {
  id: 'TG-SEC-001',
  severity: 'CRITICAL',
  title: 'Hardcoded secret detected in configuration',
  description: 'A sensitive attribute (e.g., password, secret_key, api_key, token) is assigned a literal string value instead of a variable reference.',
  risk: 'Hardcoded secrets can be exposed in version control, leading to credential compromise.',
  remediation: 'Use Terraform variables (var.name), data sources, or a secrets manager (e.g., AWS Secrets Manager) to inject sensitive values.',
  references: ['https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html'],
  frameworks: { 'NIST 800-53': 'IA-5', 'CIS Controls': '3.1' },
  resourceType: 'any',
  check: (resource: ParsedResource) => {
    const sensitiveKeys = ['password', 'secret_key', 'api_key', 'token', 'credentials', 'secret'];
    for (const [key, value] of Object.entries(resource.attributes)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
        const strValue = String(value);
        // Flag if it's a literal string that does NOT look like a variable/data reference
        if (typeof value === 'string' && !strValue.startsWith('var.') && !strValue.startsWith('local.') && !strValue.startsWith('data.') && !strValue.startsWith('${')) {
          // Do NOT log the actual secret value to prevent leakage
          console.warn(`[TerraGuard] Hardcoded secret detected in resource ${resource.type}.${resource.name} at attribute '${key}'`);
          return true;
        }
      }
    }
    return false;
  }
};