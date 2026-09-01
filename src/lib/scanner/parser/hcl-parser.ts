// src/lib/scanner/parser/hcl-parser.ts
export interface ParsedResource {
  type: string;
  name: string;
  attributes: Record<string, any>;
  blocks: Record<string, any[]>;
}

export interface ParseResult {
  success: boolean;
  resources: ParsedResource[];
  error?: string;
}

export function parseHCL(code: string): ParseResult {
  const resources: ParsedResource[] = [];
  
  try {
    const resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;
    let match;
    
    while ((match = resourceRegex.exec(code)) !== null) {
      const type = match[1];
      const name = match[2];
      const startIndex = match.index + match[0].length;
      
      let depth = 1;
      let endIndex = startIndex;
      while (endIndex < code.length && depth > 0) {
        if (code[endIndex] === '{') depth++;
        else if (code[endIndex] === '}') depth--;
        if (depth > 0) endIndex++;
      }
      
      const blockContent = code.substring(startIndex, endIndex);
      const { attributes, blocks } = parseBlockContent(blockContent);
      
      resources.push({ type, name, attributes, blocks });
    }
    
    return { success: true, resources };
  } catch (error) {
    return { success: false, resources, error: 'HCL syntax error. Please check your configuration.' };
  }
}

function parseBlockContent(content: string): { attributes: Record<string, any>; blocks: Record<string, any[]> } {
  const attributes: Record<string, any> = {};
  const blocks: Record<string, any[]> = {};
  
  const cleanContent = content
    .replace(/#.*$/gm, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  
  const lines = cleanContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Match attribute: key = value
    const attrMatch = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*(.+)$/);
    if (attrMatch) {
      const key = attrMatch[1];
      let value = attrMatch[2].trim();
      
      if (value.startsWith('"') && value.endsWith('"')) {
        attributes[key] = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          const listContent = value.slice(1, -1);
          attributes[key] = listContent.split(',').map(v => {
            const trimmed = v.trim();
            if (trimmed.startsWith('"') && trimmed.endsWith('"')) return trimmed.slice(1, -1);
            if (trimmed === 'true') return true;
            if (trimmed === 'false') return false;
            if (!isNaN(Number(trimmed))) return Number(trimmed);
            return trimmed;
          }).filter(v => v !== '');
        } catch {
          attributes[key] = value;
        }
      } else if (value === 'true') {
        attributes[key] = true;
      } else if (value === 'false') {
        attributes[key] = false;
      } else if (!isNaN(Number(value))) {
        attributes[key] = Number(value);
      } else {
        attributes[key] = value;
      }
      continue;
    }
    
    // Match block: key { or key "label" {
    // FIXED: Removed \s*$ to allow trailing spaces after {
    const blockMatch = line.match(/^([a-zA-Z0-9_-]+)(?:\s+"[^"]*")?\s*\{/);
    if (blockMatch) {
      const blockKey = blockMatch[1];
      
      let depth = 1;
      let blockContent = '';
      let j = i + 1;
      while (j < lines.length && depth > 0) {
        const bLine = lines[j];
        for (const char of bLine) {
          if (char === '{') depth++;
          else if (char === '}') depth--;
          if (depth === 0) break;
        }
        if (depth > 0) {
          blockContent += bLine + '\n';
          j++;
        }
      }
      
      const { attributes: nestedAttrs, blocks: nestedBlocks } = parseBlockContent(blockContent);
      const blockData = { ...nestedAttrs, ...nestedBlocks };
      
      if (!blocks[blockKey]) blocks[blockKey] = [];
      blocks[blockKey].push(blockData);
      
      i = j;
      continue;
    }
  }
  
  return { attributes, blocks };
}