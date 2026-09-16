// src/cli/commands/scan.ts
import * as fs from 'fs';
import * as path from 'path';
import { scanTerraformCode } from '@/lib/scanner';
import { formatAsSarif } from '../formatters/sarif';

// Robust import for text formatter with fallback
let formatAsText: any;
try {
  const textModule = require('../formatters/text');
  formatAsText = textModule.formatAsText || textModule.default || textModule;
} catch (e) {
  formatAsText = (report: any) => {
    let text = `TerraGuard Security Scan Report\n`;
    text += `===============================\n`;
    text += `Files Scanned: ${report.summary.filesScanned}\n`;
    text += `Resources Scanned: ${report.summary.resourcesScanned}\n`;
    text += `Rules Checked: ${report.summary.totalRulesChecked}\n`;
    text += `Risk Score: ${report.summary.riskScore}/100\n\n`;
    text += `Findings (${report.summary.findingsCount}):\n`;
    for (const f of report.findings) {
      text += `[${f.severity}] ${f.ruleId}: ${f.title} in ${f.file || 'unknown'}:${f.line || '?'}\n`;
    }
    return text;
  };
}

export interface ScanOptions {
  targetPath: string;
  format: 'text' | 'json' | 'sarif';
  failOn?: string | string[];
}

export function runScan(options: ScanOptions): { exitCode: number; output: string } {
  const validFormats = ['text', 'json', 'sarif'];
  if (!validFormats.includes(options.format)) {
    return {
      exitCode: 2,
      output: `Error: Invalid format "${options.format}". Must be text, json, or sarif.\n`
    };
  }

  if (!options.targetPath || options.targetPath.trim() === '') {
    return {
      exitCode: 2,
      output: 'Error: scan requires a path argument.\nUsage: terraguard scan <path>\n'
    };
  }

  const resolvedPath = path.resolve(options.targetPath);

  if (!fs.existsSync(resolvedPath)) {
    return {
      exitCode: 2,
      output: `Error: Path does not exist: ${resolvedPath}\n`
    };
  }

  const filesToScan: string[] = [];
  const stat = fs.statSync(resolvedPath);

  if (stat.isFile()) {
    if (resolvedPath.endsWith('.tf')) {
      filesToScan.push(resolvedPath);
    } else {
      return {
        exitCode: 2,
        output: `Error: File must have a .tf extension: ${resolvedPath}\n`
      };
    }
  } else if (stat.isDirectory()) {
    const walk = (dir: string) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const itemStat = fs.statSync(fullPath);
        if (itemStat.isDirectory()) {
          if (!item.startsWith('.')) {
            walk(fullPath);
          }
        } else if (item.endsWith('.tf')) {
          filesToScan.push(fullPath);
        }
      }
    };
    walk(resolvedPath);
  }

  if (filesToScan.length === 0) {
    return {
      exitCode: 2,
      output: `Error: No .tf files found in ${resolvedPath}\n`
    };
  }

  let totalFindings: any[] = [];
  let totalResources = 0;
  let totalRules = 0;
  const startTime = Date.now();

  for (const file of filesToScan) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const relativeFile = path.relative(process.cwd(), file).replace(/\\/g, '/');
      const result = scanTerraformCode(content, relativeFile);

      if ('error' in result) {
        continue;
      }

      totalResources += result.resourcesScanned || 0;
      totalRules = Math.max(totalRules, result.totalRulesChecked || 0);
      
      const findings = result.findings.map((f: any) => ({
        ...f,
        file: relativeFile,
        line: typeof f.line === 'number' ? f.line : 1, // GUARANTEE line is a number
        resourceType: f.resourceType || (f.resource ? f.resource.split('.')[0] : 'unknown'),
        references: f.references || []
      }));
      totalFindings.push(...findings);
    } catch (err) {
      continue;
    }
  }

  const durationMs = Date.now() - startTime;
  const failOnArray = options.failOn 
    ? (Array.isArray(options.failOn) ? options.failOn : options.failOn.split(',').map((s: string) => s.trim().toUpperCase()))
    : undefined;

  // Strictly deterministic sorting: file -> line -> ruleId -> severity
  totalFindings.sort((a, b) => {
    const fileA = a.file || '';
    const fileB = b.file || '';
    if (fileA !== fileB) {
      return fileA.localeCompare(fileB);
    }
    
    const lineA = a.line || 0;
    const lineB = b.line || 0;
    if (lineA !== lineB) {
      return lineA - lineB;
    }
    
    const ruleA = a.ruleId || '';
    const ruleB = b.ruleId || '';
    if (ruleA !== ruleB) {
      return ruleA.localeCompare(ruleB);
    }
    
    const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, INFO: 4 };
    const sevA = severityOrder[a.severity] ?? 5;
    const sevB = severityOrder[b.severity] ?? 5;
    return sevA - sevB;
  });

  const report = {
    $schema: 'https://raw.githubusercontent.com/hirveyash/terraguard/main/schemas/terraguard-report.schema.json',
    version: '1.0.0',
    scanner: { name: 'TerraGuard', version: '0.1.0' },
    scan: {
      scannedAt: new Date().toISOString(),
      durationMs,
      targetPath: options.targetPath,
      arguments: process.argv.slice(2),
      failOn: failOnArray
    },
    summary: {
      riskScore: calculateRiskScore(totalFindings),
      findingsCount: totalFindings.length,
      filesScanned: filesToScan.length,
      resourcesScanned: totalResources,
      totalRulesChecked: totalRules,
      findingsBySeverity: {
        CRITICAL: totalFindings.filter((f: any) => f.severity === 'CRITICAL').length,
        HIGH: totalFindings.filter((f: any) => f.severity === 'HIGH').length,
        MEDIUM: totalFindings.filter((f: any) => f.severity === 'MEDIUM').length,
        LOW: totalFindings.filter((f: any) => f.severity === 'LOW').length,
        INFO: totalFindings.filter((f: any) => f.severity === 'INFO').length,
      }
    },
    findings: totalFindings
  };

  let output = '';
  if (options.format === 'json') {
    output = JSON.stringify(report, null, 2);
  } else if (options.format === 'sarif') {
    output = JSON.stringify(formatAsSarif(report), null, 2);
  } else {
    output = formatAsText(report);
  }

  let exitCode = 0;
  if (failOnArray) {
    const hasFailLevel = totalFindings.some((f: any) => failOnArray.includes(f.severity));
    if (hasFailLevel) {
      exitCode = 1;
    }
  } else if (totalFindings.length > 0) {
    exitCode = 1;
  }

  return { exitCode, output };
}

function calculateRiskScore(findings: any[]): number {
  let score = 100;
  for (const f of findings) {
    if (f.severity === 'CRITICAL') score -= 25;
    else if (f.severity === 'HIGH') score -= 15;
    else if (f.severity === 'MEDIUM') score -= 5;
    else if (f.severity === 'LOW') score -= 2;
  }
  return Math.max(0, score);
}