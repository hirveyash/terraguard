// src/lib/scanner/rules/compute/tg-lam-001.ts
import { Rule } from '../types';
import { ParsedResource } from '../../parser/hcl-parser';
import { RULE_MAPPINGS } from '../../frameworks/mappings';

export const tgLam001: Rule = {
  id: 'TG-LAM-001',
  severity: 'HIGH',
  title: 'Lambda Function URL Missing Authentication',
  description: 'The Lambda function URL is configured with authorization_type = "NONE", making it publicly accessible without authentication.',
  risk: 'An unauthenticated public endpoint can be invoked by anyone on the internet, potentially leading to unauthorized data access, resource exhaustion (Denial of Service), or unexpected AWS billing charges.',
  remediation: {
    explanation: 'Lambda function URLs with authorization_type set to NONE do not require any credentials or tokens to invoke.',
    impact: 'Anyone with the URL can trigger the function. If the function accesses sensitive data or performs write operations, it creates a severe security vulnerability.',
    remediation: 'Set authorization_type to "AWS_IAM" to require IAM authentication, or place the function behind an API Gateway with a proper authorizer (Lambda, Cognito, or JWT).',
    secureExample: `resource "aws_lambda_function_url" "secure_url" {
  function_name      = aws_lambda_function.example.function_name
  authorization_type = "AWS_IAM" # Requires IAM credentials to invoke
}`
  },
  references: ['https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html'],
  frameworks: RULE_MAPPINGS['TG-LAM-001'] || [],
  resourceType: 'aws_lambda_function_url',
  check: (resource: ParsedResource) => {
    if (resource.type !== 'aws_lambda_function_url') return false;

    const authType = String(resource.attributes.authorization_type || '').toLowerCase().trim();
    
    // Flag if it is explicitly 'none' or if the attribute is missing/empty
    return authType === 'none' || authType === '';
  }
};