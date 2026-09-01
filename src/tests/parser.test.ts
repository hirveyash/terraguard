// src/tests/parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseHCL } from '@/lib/scanner/parser/hcl-parser';

describe('HCL Parser', () => {
  it('should parse a basic resource block', () => {
    const code = `
      resource "aws_s3_bucket" "test" {
        bucket = "my-bucket"
        acl    = "private"
      }
    `;
    const result = parseHCL(code);
    expect(result.success).toBe(true);
    expect(result.resources.length).toBe(1);
    expect(result.resources[0].type).toBe('aws_s3_bucket');
    expect(result.resources[0].attributes.bucket).toBe('my-bucket');
  });

  it('should parse nested blocks', () => {
    const code = `
      resource "aws_security_group" "test" {
        ingress {
          from_port = 22
          cidr_blocks = ["0.0.0.0/0"]
        }
      }
    `;
    const result = parseHCL(code);
    expect(result.success).toBe(true);
    expect(result.resources[0].blocks.ingress.length).toBe(1);
    expect(result.resources[0].blocks.ingress[0].from_port).toBe(22);
  });

  it('should handle comments gracefully', () => {
    const code = `
      # This is a comment
      resource "aws_instance" "test" {
        ami = "ami-123" // inline comment
        /* block comment */
      }
    `;
    const result = parseHCL(code);
    expect(result.success).toBe(true);
    expect(result.resources.length).toBe(1);
  });

  it('should handle interpolations without crashing', () => {
    const code = `
      resource "aws_instance" "test" {
        ami = var.ami_id
        tags = {
          Name = "\${var.project_name}-instance"
        }
      }
    `;
    const result = parseHCL(code);
    expect(result.success).toBe(true);
  });
});