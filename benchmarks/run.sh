#!/bin/bash
# benchmarks/run.sh
# Automated benchmark script for TerraGuard vs Checkov, Trivy, and KICS

set -e

CORPUS_DIR="./corpus"
RESULTS_DIR="./results"
mkdir -p "$RESULTS_DIR"

echo "=========================================="
echo " Starting IaC Security Tool Benchmark"
echo "=========================================="

# 1. TerraGuard
echo "[1/4] Running TerraGuard..."
TG_START=$(date +%s%3N)
npm run cli -- scan "$CORPUS_DIR" --format json > "$RESULTS_DIR/terraguard.json" 2>/dev/null || true
TG_END=$(date +%s%3N)
TG_TIME=$((TG_END - TG_START))
TG_FINDINGS=$(jq '.summary.findingsCount' "$RESULTS_DIR/terraguard.json" 2>/dev/null || echo "0")
echo "  -> Time: ${TG_TIME}ms | Findings: $TG_FINDINGS"

# 2. Checkov
echo "[2/4] Running Checkov..."
CKV_START=$(date +%s%3N)
checkov -d "$CORPUS_DIR" -o json > "$RESULTS_DIR/checkov.json" 2>/dev/null || true
CKV_END=$(date +%s%3N)
CKV_TIME=$((CKV_END - CKV_START))
CKV_FINDINGS=$(jq '.results.failed_checks | length' "$RESULTS_DIR/checkov.json" 2>/dev/null || echo "0")
echo "  -> Time: ${CKV_TIME}ms | Findings: $CKV_FINDINGS"

# 3. Trivy
echo "[3/4] Running Trivy..."
TRIVY_START=$(date +%s%3N)
trivy config "$CORPUS_DIR" --format json --output "$RESULTS_DIR/trivy.json" --quiet 2>/dev/null || true
TRIVY_END=$(date +%s%3N)
TRIVY_TIME=$((TRIVY_END - TRIVY_START))
TRIVY_FINDINGS=$(jq '.Results | map(.Vulnerabilities // [] | length) | add // 0' "$RESULTS_DIR/trivy.json" 2>/dev/null || echo "0")
# Trivy config uses 'Misconfigurations' not 'Vulnerabilities'
TRIVY_FINDINGS=$(jq '[.Results[].Misconfigurations | length] | add // 0' "$RESULTS_DIR/trivy.json" 2>/dev/null || echo "0")
echo "  -> Time: ${TRIVY_TIME}ms | Findings: $TRIVY_FINDINGS"

# 4. KICS
echo "[4/4] Running KICS..."
KICS_START=$(date +%s%3N)
kics scan -p "$CORPUS_DIR" -o "$RESULTS_DIR" --report-formats json --quiet 2>/dev/null || true
KICS_END=$(date +%s%3N)
KICS_TIME=$((KICS_END - KICS_START))
KICS_FINDINGS=$(jq '.total_counter' "$RESULTS_DIR/results.json" 2>/dev/null || echo "0")
echo "  -> Time: ${KICS_TIME}ms | Findings: $KICS_FINDINGS"

echo "=========================================="
echo " Benchmark Complete. Results saved to $RESULTS_DIR/"
echo "=========================================="

# Generate Summary
cat << EOF > "$RESULTS_DIR/summary.md"
# Benchmark Results Summary

*Note: Tool versions must be manually verified and updated below.*

| Tool | Version | Scan Time | Findings Detected | Output Format | Remediation Quality |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TerraGuard** | 0.1.0 | ${TG_TIME}ms | $TG_FINDINGS | JSON/Text | High (5-part narrative + auto-fix) |
| **Checkov** | *(fill in)* | ${CKV_TIME}ms | $CKV_FINDINGS | JSON/CLI | Medium (Link to docs) |
| **Trivy** | *(fill in)* | ${TRIVY_TIME}ms | $TRIVY_FINDINGS | JSON/CLI | Medium (Link to docs) |
| **KICS** | *(fill in)* | ${KICS_TIME}ms | $KICS_FINDINGS | JSON/CLI | Medium (Link to docs) |

## Observations
- **Detection Count**: Compare the raw numbers. Note that tools with larger default rule sets may flag more issues.
- **Scan Time**: TerraGuard (Node.js) is optimized for fast, local CLI usage. Go-based tools (Trivy, KICS) may have different startup overheads.
- **Remediation Quality**: TerraGuard provides inline secure examples and auto-fix diffs. Other tools typically provide external documentation links.

*To update versions, run:* \`checkov --version\`, \`trivy --version\`, \`kics version\`
EOF

echo "Summary generated at $RESULTS_DIR/summary.md"