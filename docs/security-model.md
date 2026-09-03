# TerraGuard Security Model

TerraGuard operates on a **Zero-Trust, Defense-in-Depth** security model. It assumes that all input is hostile and that the execution environment may be constrained.

## Trust Boundaries
1. **Untrusted Input Boundary**: All `.tf` files are treated as untrusted. They are validated for size and type before any parsing occurs.
2. **Parser Boundary**: The parser isolates string manipulation from execution. It does not resolve variables (`var.x`), data sources (`data.x`), or remote modules.
3. **Output Boundary**: Scan results are sanitized. JSON/SARIF outputs are strictly schema-validated to prevent injection into downstream CI/CD tools.

## Security Guarantees
- **Determinism**: Identical input always produces identical output. This prevents cache poisoning and ensures reproducible CI/CD gates.
- **Statelessness**: The scanner holds no state between runs. It does not write to disk (except via explicit CLI redirection) and does not phone home.
- **Fail-Safe Defaults**: If the parser encounters unrecoverable syntax errors, it fails gracefully, returning a structured error object rather than crashing the Node.js process.

## CI/CD Security
- Scans are executed in ephemeral, isolated GitHub Actions runners.
- The `--fail-on` flag allows strict policy enforcement (e.g., failing the build on `CRITICAL` or `HIGH` findings).
- SARIF output is designed for secure upload to GitHub Code Scanning, keeping vulnerability data within the organization's security perimeter.