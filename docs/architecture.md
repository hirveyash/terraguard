# TerraGuard Architecture

TerraGuard is a static application security testing (SAST) tool designed specifically for HashiCorp Configuration Language (HCL) used in Terraform. It is built with a modular, defense-in-depth architecture.

## Core Components

1. **CLI / Entry Point (`src/cli/`)**  
   Handles argument parsing, file discovery, and orchestrates the scanning pipeline. It enforces input size limits and manages exit codes for CI/CD integration.

2. **HCL Parser (`src/lib/scanner/parser/`)**  
   A custom, regex-based parser that transforms raw Terraform strings into an Abstract Syntax Tree (AST)-like object model. It is designed to be resilient against malformed input and does not execute or evaluate Terraform variables.

3. **Rule Engine (`src/lib/scanner/rules/`)**  
   A deterministic, modular engine containing 22+ security rules. Each rule is an isolated function that evaluates specific resource types and attributes without side effects.

4. **Reporting & Formatting (`src/lib/scanner/reporting/`, `src/cli/formatters/`)**  
   Aggregates findings, calculates a deterministic risk score, and formats output into human-readable text, machine-readable JSON (with JSON Schema validation), or SARIF 2.1.0 for CI/CD integration.

5. **Web Dashboard (`src/app/`, `src/components/`)**  
   A Next.js-based UI that consumes the scanner library directly. It provides interactive filtering, code highlighting, and detailed remediation guidance. It operates entirely client-side or via local API routes, with no external data exfiltration.

## Data Flow
`Input (.tf)` → `Size/Type Validation` → `HCL Parser` → `Rule Engine (Parallel Evaluation)` → `Aggregation & Scoring` → `Formatter (JSON/SARIF/Text)` → `Output`