# Rule Development Guidelines

Adding a new security rule to TerraGuard requires adherence to strict quality and safety standards to prevent false positives and ensure actionable remediation.

## 1. Rule Structure
Every rule must implement the `Rule` interface, including:
- `id`: Unique identifier (e.g., `TG-S3-001`).
- `severity`: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, or `INFO`.
- `title`, `description`, `risk`, `remediation`: Clear, human-readable text.
- `frameworks`: Defensible mappings to CIS, NIST, or MITRE (optional but encouraged).
- `check`: A pure, synchronous function returning `boolean`.

## 2. Development Rules
- **No Side Effects**: The `check` function must not modify state, make network requests, or write to the console (except for the specific, sanitized `TG-SEC-001` warning).
- **Defensive Programming**: Always check `resource.type` before accessing `resource.attributes` or `resource.blocks`.
- **Handle Missing Data**: If an attribute is optional in Terraform, its absence might be a finding. Handle `undefined` gracefully using `String(value || '').toLowerCase()`.
- **Avoid Complex Regex**: Do not use regex with nested quantifiers (e.g., `(a+)+`) to prevent ReDoS. Prefer simple string inclusion checks (`includes()`) where possible.

## 3. Testing Requirements
Every new rule must include:
- A **positive test** (detects the vulnerability).
- A **negative test** (ignores a securely configured resource).
- An **edge-case test** (e.g., variables, dynamic blocks, or alternative valid syntax).

## 4. Auto-Fix Policy
Auto-fixes (`autoFix` in the remediation object) are **only** permitted for unambiguous, safe changes (e.g., changing `0.0.0.0/0` to `<YOUR_CORPORATE_CIDR>`). Never auto-generate IAM policies, KMS keys, or business-logic-dependent values.