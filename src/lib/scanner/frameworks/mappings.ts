// src/lib/scanner/frameworks/mappings.ts

export interface FrameworkMapping {
  framework: string;
  version: string;
  control: string;
  reason: string;
}

export const RULE_MAPPINGS: Record<string, FrameworkMapping[]> = {
  'TG-S3-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.1.1', reason: 'Ensure all S3 buckets employ encryption-at-rest and block public access.' }],
  'TG-S3-002': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.1.2', reason: 'Ensure S3 Bucket Policy is set to deny HTTP requests.' }],
  'TG-S3-003': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.1.1', reason: 'Ensure S3 buckets have server-side encryption enabled.' }],
  'TG-S3-004': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.1.3', reason: 'Ensure S3 bucket policies do not allow public access.' }],
  
  'TG-IAM-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '1.16', reason: 'Ensure IAM policies that allow full "*:*" administrative privileges are not created.' }],
  'TG-IAM-002': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '1.16', reason: 'Ensure IAM trust policies do not allow overly permissive access.' }],
  'TG-IAM-003': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '1.16', reason: 'Ensure IAM policies do not allow unrestricted iam:PassRole.' }],
  'TG-IAM-004': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '1.16', reason: 'Ensure Cognito identity pools do not allow unauthenticated access.' }],

  'TG-EBS-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.2.1', reason: 'Ensure EBS volume encryption is enabled.' }],

  'TG-RDS-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.3.1', reason: 'Ensure RDS instances are not publicly accessible.' }],
  'TG-RDS-002': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.3.2', reason: 'Ensure RDS instances have encryption at rest enabled.' }],
  'TG-RDS-003': [], // Intentionally empty: no defensible CIS/NIST mapping for deletion protection

  'TG-KMS-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.6.1', reason: 'Ensure KMS key rotation is enabled.' }],

  'TG-NET-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '5.2', reason: 'Ensure no security groups allow ingress from 0.0.0.0/0 to remote server administration ports.' }],
  'TG-NET-002': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '5.2', reason: 'Ensure no security groups allow ingress from 0.0.0.0/0 to RDP port 3389.' }],
  'TG-NET-003': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '5.3', reason: 'Ensure no security groups allow ingress from 0.0.0.0/0 to database ports.' }],
  'TG-NET-004': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '5.4', reason: 'Ensure no security groups allow ingress from 0.0.0.0/0 to all ports.' }],
  'TG-NACL-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '5.5', reason: 'Ensure Network ACLs do not allow overly permissive inbound traffic.' }],

  'TG-LOG-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '3.1', reason: 'Ensure CloudTrail is enabled in all regions.' }],
  'TG-LOG-002': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '3.2', reason: 'Ensure CloudTrail log file validation is enabled.' }],

  'TG-SEC-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '1.4', reason: 'Ensure no root account access key exists and secrets are not hardcoded.' }],
  'TG-SEC-002': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '1.4', reason: 'Ensure secrets are not hardcoded in Terraform state or configuration.' }],
  
  'TG-EC2-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '5.5', reason: 'Ensure IMDSv2 is required for EC2 instances.' }],
  'TG-LAM-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '5.6', reason: 'Ensure Lambda function URLs require authentication.' }],
  'TG-ELC-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.4.1', reason: 'Ensure ElastiCache clusters have encryption at rest and in transit enabled.' }],

  'TG-ENC-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.1.1', reason: 'Ensure encryption is enabled for data at rest.' }],
  'TG-ENC-002': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.1.1', reason: 'Ensure encryption in transit is enabled.' }],

  'TG-DB-001': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.3.1', reason: 'Ensure database instances are securely configured.' }],
  'TG-DB-002': [{ framework: 'CIS AWS Foundations Benchmark', version: '1.5.0', control: '2.3.2', reason: 'Ensure database instances have automated backups enabled.' }]
};