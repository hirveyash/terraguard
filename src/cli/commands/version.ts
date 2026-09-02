// src/cli/commands/version.ts
import { EXIT_CODES } from '../types';

export function runVersion(): { exitCode: number; output: string } {
  let version = '0.0.0';
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../../../package.json');
    version = pkg.version || version;
  } catch {
    // ignore
  }
  return { exitCode: EXIT_CODES.SUCCESS, output: `TerraGuard v${version}` };
}