// scripts/fix-rules.ts
import * as fs from 'fs';
import * as path from 'path';

const rootDir = path.join(__dirname, '..');

function fixRuleFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Add RULE_MAPPINGS import if missing
  if (!content.includes("import { RULE_MAPPINGS }")) {
    content = content.replace(
      "import { Rule } from '../types';",
      "import { Rule } from '../types';\nimport { RULE_MAPPINGS } from '../../frameworks/mappings';"
    );
    changed = true;
  }

  // 2. Extract rule ID dynamically from the file content
  const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
  const ruleId = idMatch ? idMatch[1] : 'UNKNOWN';

  // 3. Fix frameworks object to array lookup
  // Matches: frameworks: { 'CIS ...': '...' },
  if (content.includes("frameworks: {")) {
    content = content.replace(
      /frameworks:\s*\{[^}]+\},/,
      `frameworks: RULE_MAPPINGS['${ruleId}'] || [],`
    );
    changed = true;
  }

  // 4. Fix string remediation to object
  // Matches: remediation: 'some text', or remediation: "some text",
  if (content.match(/remediation:\s*['"][^'"]+['"],/) && !content.includes('remediation: {')) {
    content = content.replace(
      /remediation:\s*(['"])([\s\S]*?)\1,/,
      (match, quote, text) => {
        // Escape single quotes in the text to prevent breaking the template literal
        const escapedText = text.replace(/'/g, "\\'");
        return `remediation: {
    explanation: '${escapedText}',
    impact: 'This misconfiguration poses a security risk.',
    remediation: '${escapedText}',
    secureExample: '# Add secure configuration here'
  },`;
      }
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(rootDir, filePath)}`);
  } else {
    console.log(`⏭️  Skipped (already fixed or no match): ${path.relative(rootDir, filePath)}`);
  }
}

console.log('🔧 Running precise rule fix script...\n');

const rulesDir = path.join(rootDir, 'src/lib/scanner/rules');
if (fs.existsSync(rulesDir)) {
  const walk = (dir: string) => {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (item.endsWith('.ts') && !item.includes('types.ts')) {
        fixRuleFile(fullPath);
      }
    }
  };
  walk(rulesDir);
}

console.log('\n🎉 Rule fix script completed!');
console.log('Please run `npm run build` again.');