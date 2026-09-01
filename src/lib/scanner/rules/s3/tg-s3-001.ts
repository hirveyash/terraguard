import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';
import { RULE_MAPPINGS } from '../../frameworks/mappings';
import { generateRemoveAclFix } from '../../remediation/generator';

export const tgS3001: Rule = {
  id: 'TG-S3-001',
  severity: 'CRITICAL',
  title: 'S3 bucket configured for public read access',
  description: 'An S3 bucket is configured with acl = "public-read" or "public-read-write".',
  risk: 'Anyone on the internet can read the contents of the bucket, potentially leading to data leaks.',
  remediation: {
    explanation: 'The S3 bucket has an ACL set to "public-read" or "public-read-write", granting read (and possibly write) access to anyone on the internet.',
    impact: 'Data stored in the bucket is publicly accessible. This can lead to data breaches, regulatory fines (GDPR, HIPAA), reputational damage, and potential legal liability.',
    remediation: 'Remove the acl attribute entirely. Use aws_s3_bucket_public_access_block to explicitly block public access. If public access is required, use a bucket policy with strict conditions instead.',
    secureExample: `resource "aws_s3_bucket" "secure_bucket" {
  bucket = "my-secure-bucket"
  # No acl attribute - defaults to private
}

resource "aws_s3_bucket_public_access_block" "secure_bucket" {
  bucket = aws_s3_bucket.secure_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`,
    autoFix: generateRemoveAclFix('S3 bucket data protection')
  },
  references: ['https://cisecurity.org/benchmark/amazon_web_services'],
  frameworks: RULE_MAPPINGS['TG-S3-001'] || [],
  resourceType: 'aws_s3_bucket',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_s3_bucket') return false;
    const acl = String(resource.attributes.acl || '').toLowerCase();
    return acl === 'public-read' || acl === 'public-read-write';
  }
};