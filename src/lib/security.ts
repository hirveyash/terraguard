// src/lib/security.ts
// Phase 1: Security Hardening - Input validation and safe error handling

export const MAX_INPUT_SIZE_BYTES = 500 * 1024; // 500 KB hard limit

/**
 * Validates Terraform input for type, size, and emptiness.
 * Prevents client-side memory exhaustion and DoS attacks.
 */
export function validateInput(code: unknown): { valid: boolean; error?: string } {
  if (typeof code !== 'string') {
    return { valid: false, error: 'Invalid input type. Expected a string.' };
  }
  if (code.length > MAX_INPUT_SIZE_BYTES) {
    return { valid: false, error: `Input exceeds maximum allowed size of ${MAX_INPUT_SIZE_BYTES / 1024}KB.` };
  }
  if (code.trim().length === 0) {
    return { valid: false, error: 'Input cannot be empty.' };
  }
  return { valid: true };
}

/**
 * Sanitizes error messages to prevent leaking stack traces,
 * environment variables, or internal paths to the UI.
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    console.error('[TerraGuard] Internal scan error:', error.message);
    return 'An internal error occurred during scanning. Please try again.';
  }
  return 'An unexpected error occurred.';
}