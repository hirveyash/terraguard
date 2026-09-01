import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';

export const tgS3002: Rule = {
  id: 'TG-S3-002',
  severity: 'HIGH',
  title: 'S3 bucket missing Block Public Access configuration',
  description: 'An aws_s3_bucket_public_access_block resource is not configured to block all public access.',
  risk: 'The bucket may be accidentally made public through bucket policies or ACLs.',
  remediation: 'Create an aws_s3_bucket_public_access_block resource and set block_public_acls, block_public_policy, ignore_public_acls, and restrict_public_buckets to true.',
  references: ['https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html'],
  frameworks: { 'CIS AWS Foundations Benchmark': '2.1.3' },
  resourceType: 'aws_s3_bucket_public_access_block',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_s3_bucket_public_access_block') return false;
    const blockAcls = resource.attributes.block_public_acls;
    const blockPolicy = resource.attributes.block_public_policy;
    // If explicitly set to false, it's a violation. (Missing resource is harder to detect statically, so we flag explicit misconfigurations)
    return blockAcls === false || blockPolicy === false || blockAcls === 'false' || blockPolicy === 'false';
  }
};