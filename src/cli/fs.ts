// src/cli/fs.ts
import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively discover all .tf files in a directory.
 * Returns absolute paths. Skips hidden directories (e.g., .terraform).
 */
export function discoverTerraformFiles(targetPath: string): string[] {
  const absPath = path.resolve(targetPath);
  const stat = fs.statSync(absPath);

  if (stat.isFile()) {
    if (!absPath.endsWith('.tf')) {
      throw new Error(`File is not a .tf file: ${absPath}`);
    }
    return [absPath];
  }

  if (stat.isDirectory()) {
    const files: string[] = [];
    const entries = fs.readdirSync(absPath, { withFileTypes: true });

    for (const entry of entries) {
      // Skip hidden directories (e.g., .terraform, .git)
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(absPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...discoverTerraformFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.tf')) {
        files.push(fullPath);
      }
    }

    return files.sort(); // deterministic ordering
  }

  throw new Error(`Path does not exist: ${absPath}`);
}

/**
 * Read file contents as UTF-8.
 */
export function readFileContents(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}