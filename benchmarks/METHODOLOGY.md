# TerraGuard Benchmark Methodology

This document outlines the methodology for comparing TerraGuard against established IaC security tools.

## 1. Tool Versions
Record the exact versions used during the benchmark to ensure reproducibility:
- **TerraGuard**: `0.1.0` (Local build)
- **Checkov**: `x.x.x` (Run `checkov --version`)
- **Trivy**: `x.x.x` (Run `trivy --version`)
- **KICS**: `x.x.x` (Run `kics version`)

## 2. Terraform Corpus
The benchmark uses a controlled corpus of 4 files located in `benchmarks/corpus/`:
1. `s3_public.tf`: Public S3 bucket (ACL = public-read)
2. `ec2_ssh_open.tf`: Security group allowing SSH from 0.0.0.0/0
3. `ebs_unencrypted.tf`: EBS volume without encryption enabled
4. `secrets.tf`: RDS instance with hardcoded password and public accessibility

**Total Expected Vulnerabilities**: 4 distinct misconfigurations.

## 3. Metrics Compared
- **Scan Time**: Wall-clock time in milliseconds/seconds.
- **Detection Count**: Total number of findings reported.
- **Rule Coverage**: Number of distinct rules triggered out of the 4 possible issues.
- **False Positives**: Findings that flag secure code as vulnerable (0 expected in this corpus).
- **Output Quality**: Structure, readability, and actionability of the report (JSON/CLI).
- **Remediation Quality**: Presence of clear, copy-pasteable secure examples and impact explanations.

## 4. Limitations
- **Scope**: This benchmark tests *static* detection of 4 specific, common misconfigurations. It does not measure cloud API integration, custom policy support, or performance on 100,000+ line codebases.
- **Tool Defaults**: Tools are run with default rule sets. Custom configurations or suppressed rules may alter results.
- **Environment**: Scan times are subject to local machine CPU load, disk I/O, and runtime environment (Node.js vs Python vs Go).

## 5. How to Run
1. Ensure `checkov`, `trivy`, and `kics` are installed on your system.
2. Navigate to the `benchmarks/` directory.
3. Run `./run.sh`.
4. Review the generated `results-summary.md` and populate the version numbers.