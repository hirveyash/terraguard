#!/usr/bin/env node
// src/cli/index.ts
// TerraGuard CLI entry point

import { runScan } from './commands/scan';
import { runRules } from './commands/rules';
import { runVersion } from './commands/version';
import { OutputFormat, EXIT_CODES, Severity } from './types';

const HELP_TEXT = `
TerraGuard — IaC Security Scanner

USAGE:
  terraguard <command> [options]

COMMANDS:
  scan <path>          Scan a .tf file or directory
  rules                List all available security rules
  version              Print version
  help                 Show this help message

OPTIONS (scan):
  --format <fmt>       Output format: text (default), json, sarif
  --fail-on <list>     Comma-separated severity filter to fail CI (e.g., CRITICAL,HIGH)

EXAMPLES:
  terraguard scan ./terraform
  terraguard scan main.tf
  terraguard scan ./infra --format json
  terraguard scan ./infra --format sarif > results.sarif
  terraguard scan ./infra --fail-on CRITICAL,HIGH
  terraguard rules
  terraguard rules --format json
  terraguard version
`.trim();

function parseArgs(argv: string[]): { command: string; args: string[]; flags: Record<string, string> } {
  const [, , ...rest] = argv;
  const command = rest[0] || 'help';
  const args: string[] = [];
  const flags: Record<string, string> = {};

  for (let i = 1; i < rest.length; i++) {
    const token = rest[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const value = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : 'true';
      flags[key] = value;
    } else {
      args.push(token);
    }
  }

  return { command, args, flags };
}

function isValidFormat(fmt: string): fmt is OutputFormat {
  return ['text', 'json', 'sarif'].includes(fmt);
}

function parseSeverities(val: string): Severity[] {
  return val.split(',').map(s => s.trim().toUpperCase() as Severity);
}

export function main(argv: string[] = process.argv): number {
  const { command, args, flags } = parseArgs(argv);
  const format = (flags.format || 'text') as string;

  if (!isValidFormat(format)) {
    console.error(`Error: Invalid format "${format}". Must be text, json, or sarif.`);
    return EXIT_CODES.ERROR;
  }

  const failOn = flags['fail-on'] ? parseSeverities(flags['fail-on']) : undefined;

  switch (command) {
    case 'scan': {
      if (args.length === 0) {
        console.error('Error: scan requires a path argument.');
        console.error('Usage: terraguard scan <path>');
        return EXIT_CODES.ERROR;
      }
      const result = runScan({ targetPath: args[0], format, failOn });
      console.log(result.output);
      return result.exitCode;
    }

    case 'rules': {
      const result = runRules({ format });
      console.log(result.output);
      return result.exitCode;
    }

    case 'version': {
      const result = runVersion();
      console.log(result.output);
      return result.exitCode;
    }

    case 'help':
    default:
      console.log(HELP_TEXT);
      return EXIT_CODES.SUCCESS;
  }
}

// Run if invoked directly
if (require.main === module) {
  const exitCode = main();
  process.exit(exitCode);
}