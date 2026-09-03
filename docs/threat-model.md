# TerraGuard Threat Model

This document outlines the identified assets, threat actors, potential threats, and implemented mitigations for the TerraGuard project, following a STRIDE-inspired methodology.

## 1. Assets
- **Terraform Source Code**: The input `.tf` files provided by the user.
- **Scan Results**: The generated JSON/SARIF reports containing identified vulnerabilities.
- **Application Infrastructure**: The servers, CI/CD runners, and hosting environments running TerraGuard.
- **CI/CD Pipeline**: The GitHub Actions or other automation workflows executing the scans.
- **Dependencies**: Third-party npm packages (e.g., `vitest`, `next`, `lucide-react`).

## 2. Threat Actors
- **Malicious User**: An internal or external user providing intentionally crafted, hostile input.
- **Attacker Submitting Malicious Terraform**: A developer or contributor injecting vulnerable or obfuscated code to bypass detection.
- **Compromised Dependency**: A malicious actor who has taken over an npm package TerraGuard relies on.
- **Malicious Contributor**: An insider or compromised account submitting backdoored code to the TerraGuard repository.
- **Compromised CI Pipeline**: An attacker who has gained access to the GitHub Actions environment.

## 3. Threats & Mitigations

| Threat Category | Specific Threat | Impact | Implemented Mitigations |
| :--- | :--- | :--- | :--- |
| **Code Injection** | Malicious payloads in `.tf` files attempting to execute commands on the scanner host. | Host compromise, data exfiltration. | TerraGuard treats all input as opaque strings. No `eval()`, `exec()`, or shell spawning is performed on input data. |
| **Parser Exploitation** | ReDoS (Regular Expression Denial of Service) or buffer overflow via pathological HCL structures. | Service denial, memory exhaustion, crashes. | Input size limits (`MAX_INPUT_SIZE_BYTES`). Regex patterns are linear-time. Graceful error handling catches malformed HCL without throwing unhandled exceptions. |
| **Denial of Service (DoS)** | Scanning massive files (e.g., 100MB+) to consume CPU/RAM. | Scanner timeout, CI/CD pipeline failure. | Hard limit of 500KB per input. Files exceeding this are rejected instantly with a safe error message. |
| **Cross-Site Scripting (XSS)** | Malicious strings in `.tf` files rendered in the Web Dashboard. | Session hijacking, UI defacement. | React inherently escapes output. No `dangerouslySetInnerHTML` is used. Findings are rendered as plain text or sanitized code blocks. |
| **Dependency Compromise** | Supply chain attack via a malicious npm package update. | Backdoor execution, data theft. | `package-lock.json` is committed and enforced via `npm ci` in CI. Dependabot is enabled for automated vulnerability patching. |
| **Secrets Exposure** | Scanner logs or reports echoing hardcoded passwords/keys back to the user or CI logs. | Credential leakage. | The `TG-SEC-001` rule detects secrets but explicitly masks the actual value in logs using `console.warn` with a generic message, never printing the secret itself. |
| **Unauthorized Access** | Unauthorized modification of TerraGuard source code or CI workflows. | Introduction of backdoors, disabled security checks. | Branch protection rules, required PR reviews, and signed commits. CI workflows run with minimal `GITHUB_TOKEN` permissions. |