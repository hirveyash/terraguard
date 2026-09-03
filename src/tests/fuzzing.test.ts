// src/tests/fuzzing.test.ts
// Advanced fuzzing tests targeting parser edge cases and encoding attacks

import { describe, it, expect } from 'vitest';
import { scanTerraformCode } from '@/lib/scanner';
import { parseHCL } from '@/lib/scanner/parser/hcl-parser';

describe('Fuzzing: Hostile & Unusual Input', () => {
  describe('Binary & Random Data', () => {
    it('should handle random bytes without crashing', () => {
      const randomBytes = Array.from({ length: 1000 }, () => 
        String.fromCharCode(Math.floor(Math.random() * 256))
      ).join('');
      const result = scanTerraformCode(randomBytes);
      expect(result).toBeDefined();
    });

    it('should handle binary-looking data', () => {
      const binaryData = '\x00\x01\x02\xFF\xFE\xFD'.repeat(100);
      const result = scanTerraformCode(binaryData);
      expect(result).toBeDefined();
    });

    it('should handle mixed ASCII and high-byte characters', () => {
      const mixed = 'resource "aws_s3_bucket" "test" {\n' +
        '  bucket = "' + Array.from({ length: 50 }, (_, i) => String.fromCharCode(128 + i)).join('') + '"\n' +
        '}';
      const result = scanTerraformCode(mixed);
      expect(result).toBeDefined();
    });
  });

  describe('Encoding Attacks', () => {
    it('should handle UTF-16 BOM prefix', () => {
      const code = '\uFEFF' + 'resource "aws_s3_bucket" "test" { bucket = "x" }';
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle zero-width characters in identifiers', () => {
      const code = `
        resource "aws_s3_bucket" "test\u200B\u200C\u200D" {
          bucket = "test"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle homoglyph attacks (Cyrillic vs Latin)', () => {
      // Cyrillic 'а' looks like Latin 'a' but is different
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "test-ааа-bucket"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle full-width characters', () => {
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "ｔｅｓｔ-ｂｕｃｋｅｔ"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });
  });

  describe('ReDoS Prevention', () => {
    it('should handle pathological regex patterns in strings', () => {
      // Classic ReDoS pattern
      const pathological = '(a+)+'.repeat(100);
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "${pathological}"
        }
      `;
      const start = Date.now();
      const result = scanTerraformCode(code);
      const duration = Date.now() - start;
      expect(result).toBeDefined();
      // Should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle nested quantifiers in strings', () => {
      const nested = '(.*)*'.repeat(50);
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "${nested}"
        }
      `;
      const start = Date.now();
      const result = scanTerraformCode(code);
      const duration = Date.now() - start;
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Parser Abuse Cases', () => {
    it('should handle extremely long resource names', () => {
      const longName = 'a'.repeat(10000);
      const code = `
        resource "aws_s3_bucket" "${longName}" {
          bucket = "test"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle extremely long attribute keys', () => {
      const longKey = 'x'.repeat(10000);
      const code = `
        resource "aws_s3_bucket" "test" {
          ${longKey} = "value"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle thousands of attributes in one resource', () => {
      let code = 'resource "aws_s3_bucket" "test" {\n';
      for (let i = 0; i < 5000; i++) {
        code += `  attr_${i} = "value_${i}"\n`;
      }
      code += '}\n';
      
      const start = Date.now();
      const result = scanTerraformCode(code);
      const duration = Date.now() - start;
      
      expect(result).toBeDefined();
      // Should complete in reasonable time
      expect(duration).toBeLessThan(2000);
    });

    it('should handle thousands of repeated blocks', () => {
      let code = 'resource "aws_security_group" "test" {\n';
      for (let i = 0; i < 1000; i++) {
        code += `  ingress { from_port = ${i}; to_port = ${i}; cidr_blocks = ["10.0.0.0/8"] }\n`;
      }
      code += '}\n';
      
      const start = Date.now();
      const result = scanTerraformCode(code);
      const duration = Date.now() - start;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(2000);
    });

    it('should handle mixed valid and invalid syntax', () => {
      const code = `
        resource "aws_s3_bucket" "valid" {
          bucket = "test"
        }
        
        this is not valid HCL at all
        
        resource "aws_ebs_volume" "also_valid" {
          size = 10
        }
        
        more garbage here {{{
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle comments everywhere', () => {
      const code = `
        # Top comment
        resource "aws_s3_bucket" "test" { # Inline comment
          /* Block comment */
          bucket = "test" // Another inline
          # More comments
          tags = {
            # Inside block
            Name = "test"
          }
        }
        # Bottom comment
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });
  });

  describe('Pathological Structures', () => {
    it('should handle 100 levels of nesting', () => {
      let code = 'resource "aws_s3_bucket" "test" {\n';
      for (let i = 0; i < 100; i++) {
        code += '  nested {\n';
      }
      code += '    attr = "value"\n';
      for (let i = 0; i < 100; i++) {
        code += '  }\n';
      }
      code += '}\n';
      
      const start = Date.now();
      const result = scanTerraformCode(code);
      const duration = Date.now() - start;
      
      expect(result).toBeDefined();
      expect(duration).toBeLessThan(2000);
    });

    it('should handle unbalanced braces (more opening)', () => {
      const code = 'resource "aws_s3_bucket" "test" {{{{ bucket = "test" }';
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle unbalanced braces (more closing)', () => {
      const code = 'resource "aws_s3_bucket" "test" { bucket = "test" }}}}';
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle completely empty blocks', () => {
      const code = `
        resource "aws_s3_bucket" "test" {
        }
        resource "aws_ebs_volume" "test2" {
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });
  });

  describe('Edge Case Strings', () => {
    it('should handle strings with every ASCII character', () => {
      const allAscii = Array.from({ length: 128 }, (_, i) => String.fromCharCode(i))
        .join('')
        .replace(/"/g, '\\"') // Escape quotes
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "${allAscii}"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle strings with surrogate pairs', () => {
      const surrogate = '\uD83D\uDE00'; // Emoji
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "test-${surrogate}-bucket"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });

    it('should handle strings with combining characters', () => {
      const combining = 'e\u0301'; // é as e + combining accent
      const code = `
        resource "aws_s3_bucket" "test" {
          bucket = "test-${combining}-bucket"
        }
      `;
      const result = scanTerraformCode(code);
      expect(result).toBeDefined();
    });
  });

  describe('Graceful Failure', () => {
    it('should never throw uncaught exceptions', () => {
      const maliciousInputs = [
        null,
        undefined,
        123,
        {},
        [],
        '',
        '   ',
        '\x00\x01\x02',
        'a'.repeat(100000),
        '{'.repeat(1000),
        '}'.repeat(1000),
      ];

      for (const input of maliciousInputs) {
        expect(() => {
          //  Testing runtime safety
          scanTerraformCode(input);
        }).not.toThrow();
      }
    });

    it('should always return a defined result', () => {
      const result = scanTerraformCode('garbage input that is not HCL');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });
});