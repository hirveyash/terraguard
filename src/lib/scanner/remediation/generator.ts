// src/lib/scanner/remediation/generator.ts
// Generates safe, proposed diffs for unambiguous fixes only.

import { AutoFix } from './types';

/**
 * Generates a proposed diff for replacing a CIDR block.
 * NEVER assumes a specific private CIDR is correct.
 * Uses a placeholder that requires user input.
 */
export function generateCidrReplacementFix(
  oldCidr: string,
  context: string
): AutoFix {
  return {
    description: `Replace public CIDR "${oldCidr}" with a restricted range`,
    diff: `- cidr_blocks = ["${oldCidr}"]\n+ cidr_blocks = ["<YOUR_CORPORATE_CIDR>"]`,
    assumptions: [
      `The current CIDR "${oldCidr}" is overly permissive for ${context}`,
      `<YOUR_CORPORATE_CIDR> is a placeholder - you must replace it with your actual corporate IP or VPC CIDR`,
      `This fix assumes you have a known, trusted IP range to restrict access to`
    ],
    requiresConfirmation: true
  };
}

/**
 * Generates a proposed diff for adding a missing boolean attribute.
 */
export function generateAddAttributeFix(
  attribute: string,
  value: string,
  context: string
): AutoFix {
  return {
    description: `Add missing "${attribute} = ${value}" attribute`,
    diff: `  # Add the following line inside the resource block:\n+ ${attribute} = ${value}`,
    assumptions: [
      `The attribute "${attribute}" should be set to ${value} for ${context}`,
      `This fix does not modify any existing attributes`,
      `You should verify this value matches your organization's security policy`
    ],
    requiresConfirmation: true
  };
}

/**
 * Generates a proposed diff for changing a boolean attribute value.
 */
export function generateBooleanChangeFix(
  attribute: string,
  oldValue: string,
  newValue: string,
  context: string
): AutoFix {
  return {
    description: `Change "${attribute}" from ${oldValue} to ${newValue}`,
    diff: `- ${attribute} = ${oldValue}\n+ ${attribute} = ${newValue}`,
    assumptions: [
      `The current value "${oldValue}" is insecure for ${context}`,
      `The new value "${newValue}" aligns with security best practices`,
      `This change may affect operational behavior - verify before applying`
    ],
    requiresConfirmation: true
  };
}

/**
 * Generates a proposed diff for removing an insecure ACL.
 */
export function generateRemoveAclFix(
  context: string
): AutoFix {
  return {
    description: `Remove insecure ACL attribute`,
    diff: `- acl = "public-read"\n+ # acl attribute removed - use aws_s3_bucket_public_access_block instead`,
    assumptions: [
      `The current ACL grants public access which is insecure for ${context}`,
      `Public access should be controlled via aws_s3_bucket_public_access_block`,
      `You should verify your application does not require public read access before removing`
    ],
    requiresConfirmation: true
  };
}