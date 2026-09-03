# Benchmark Methodology

TerraGuard's performance and detection capabilities are evaluated against a controlled, deterministic corpus to ensure fair, reproducible comparisons with industry-standard tools.

## Corpus
Located in `benchmarks/corpus/`, containing 4 files representing common, high-severity misconfigurations:
1. `s3_public.tf` (Public ACL)
2. `ec2_ssh_open.tf` (Open port 22)
3. `ebs_unencrypted.tf` (Missing encryption)
4. `secrets.tf` (Hardcoded password, public RDS)

## Metrics Tracked
- **Scan Time**: Wall-clock execution time in milliseconds.
- **Detection Count**: Number of distinct findings reported.
- **Remediation Quality**: Presence of inline secure examples and impact explanations.

## Running the Benchmark
1. Ensure `checkov`, `trivy`, and `kics` are installed (or use the provided Docker commands).
2. Execute `cd benchmarks && ./run.ps1` (Windows) or `./run.sh` (Linux/macOS).
3. Review `benchmarks/results/summary.md`.

*Note: TerraGuard is optimized for fast, local, high-signal scanning. Tools with larger default rule sets may report higher finding counts, but TerraGuard prioritizes actionable, critical vulnerabilities with minimal noise.*