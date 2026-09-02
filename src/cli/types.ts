// src/cli/types.ts
export type OutputFormat = 'text' | 'json' | 'sarif';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ScanOptions {
  path: string;
  format: OutputFormat;
  failOn?: Severity[];
}

export interface ScanMetadata {
  scannedAt: string;        // ISO 8601
  durationMs: number;
  targetPath: string;
  workingDirectory: string;
  arguments: string[];
  failOn?: Severity[];
}

export interface FindingsBySeverity {
  CRITICAL: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
  INFO: number;
}

export interface CLIExitCode {
  SUCCESS: 0;
  FINDINGS: 1;
  ERROR: 2;
}

export const EXIT_CODES: CLIExitCode = {
  SUCCESS: 0,
  FINDINGS: 1,
  ERROR: 2,
};

export const REPORT_SCHEMA_VERSION = '1.0.0';