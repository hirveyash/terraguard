// src/cli/commands/scan.ts
import * as path from 'path';
import { scanTerraformCode } from '@/lib/scanner';
import { discoverTerraformFiles, readFileContents } from '../fs';
import { aggregateResults, AggregatedResult } from '../aggregate';
import { formatText } from '../formatters/text';
import { formatJson } from '../formatters/json';
import { formatSarif } from '../formatters/sarif';
import { OutputFormat, EXIT_CODES, Severity, ScanMetadata } from '../types';

export interface ScanCommandArgs {
  targetPath: string;
  format: OutputFormat;
  failOn?: Severity[];
}

export function runScan(args: ScanCommandArgs): { exitCode: number; output: string } {
  const startTime = Date.now();
  
  try {
    const absPath = path.resolve(args.targetPath);
    const files = discoverTerraformFiles(absPath);

    if (files.length === 0) {
      return {
        exitCode: EXIT_CODES.ERROR,
        output: `No .tf files found at: ${absPath}`,
      };
    }

    const results = files.map(file => {
      const contents = readFileContents(file);
      const relativePath = path.relative(process.cwd(), file);
      return scanTerraformCode(contents, relativePath);
    });

    const errors = results.filter(r => 'error' in r);
    if (errors.length > 0 && errors.length === results.length) {
      return {
        exitCode: EXIT_CODES.ERROR,
        output: `All files failed to parse:\n${errors.map(e => 'error' in e ? e.error : '').join('\n')}`,
      };
    }

    const validResults = results.filter((r): r is Exclude<typeof r, { error: string }> => !('error' in r));
    const aggregated: AggregatedResult = aggregateResults(validResults, files.length);
    const durationMs = Date.now() - startTime;

    const metadata: ScanMetadata = {
      scannedAt: new Date().toISOString(),
      durationMs,
      targetPath: args.targetPath,
      workingDirectory: process.cwd(),
      arguments: process.argv.slice(2),
      failOn: args.failOn,
    };

    let output: string;
    switch (args.format) {
      case 'json':
        output = formatJson(aggregated, metadata);
        break;
      case 'sarif':
        output = formatSarif(aggregated, metadata);
        break;
      case 'text':
      default:
        output = formatText(aggregated);
    }

    let exitCode: number = EXIT_CODES.SUCCESS;
    if (aggregated.findings.length > 0) {
      if (args.failOn && args.failOn.length > 0) {
        const hasBlockingFinding = aggregated.findings.some(f => args.failOn!.includes(f.severity as Severity));
        exitCode = hasBlockingFinding ? EXIT_CODES.FINDINGS : EXIT_CODES.SUCCESS;
      } else {
        exitCode = EXIT_CODES.FINDINGS;
      }
    }

    return { exitCode, output };
  } catch (err) {
    return {
      exitCode: EXIT_CODES.ERROR,
      output: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}