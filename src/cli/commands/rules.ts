// src/cli/commands/rules.ts
import { allRules } from '@/lib/scanner/rules';
import { OutputFormat, EXIT_CODES } from '../types';

export interface RulesCommandArgs {
  format: OutputFormat;
}

export function runRules(args: RulesCommandArgs): { exitCode: number; output: string } {
  if (args.format === 'json') {
    const serializable = allRules.map(r => ({
      id: r.id,
      severity: r.severity,
      title: r.title,
      description: r.description,
      resourceType: r.resourceType,
      frameworks: r.frameworks,
    }));
    return { exitCode: EXIT_CODES.SUCCESS, output: JSON.stringify(serializable, null, 2) };
  }

  // Text format — table
  const lines: string[] = [];
  lines.push('');
  lines.push(`TerraGuard Rules (${allRules.length} total)`);
  lines.push('═'.repeat(80));
  lines.push('');

  const idPad = 14;
  const sevPad = 10;

  lines.push(`${'ID'.padEnd(idPad)} ${'SEVERITY'.padEnd(sevPad)} RESOURCE TYPE              TITLE`);
  lines.push('─'.repeat(80));

  for (const rule of allRules) {
    const id = rule.id.padEnd(idPad);
    const sev = rule.severity.padEnd(sevPad);
    const res = rule.resourceType.padEnd(26);
    lines.push(`${id} ${sev} ${res} ${rule.title}`);
  }

  lines.push('');
  return { exitCode: EXIT_CODES.SUCCESS, output: lines.join('\n') };
}