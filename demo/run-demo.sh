#!/bin/bash
# demo/run-demo.sh
# Reproducible demo scenario showing TerraGuard workflow

set -e

echo "=========================================="
echo " TerraGuard Demo: Security Scan Workflow"
echo "=========================================="
echo ""

# Step 1: Scan insecure configuration
echo "STEP 1: Scanning INSECURE Terraform configuration..."
echo "File: demo/insecure.tf"
echo ""
npm run cli -- scan demo/insecure.tf --format json > demo/insecure-report.json 2>/dev/null
INSECURE_SCORE=$(jq '.summary.riskScore' demo/insecure-report.json)
INSECURE_COUNT=$(jq '.summary.findingsCount' demo/insecure-report.json)
echo "Risk Score: $INSECURE_SCORE/100"
echo "Findings: $INSECURE_COUNT"
echo ""

# Step 2: Show top findings
echo "Top Findings:"
jq -r '.findings[:3][] | "  [\(.severity)] \(.ruleId): \(.title)"' demo/insecure-report.json
echo ""

# Step 3: Scan secure configuration
echo "=========================================="
echo "STEP 2: Scanning SECURE Terraform configuration..."
echo "File: demo/secure.tf"
echo ""
npm run cli -- scan demo/secure.tf --format json > demo/secure-report.json 2>/dev/null
SECURE_SCORE=$(jq '.summary.riskScore' demo/secure-report.json)
SECURE_COUNT=$(jq '.summary.findingsCount' demo/secure-report.json)
echo "Risk Score: $SECURE_SCORE/100"
echo "Findings: $SECURE_COUNT"
echo ""

# Step 4: Summary
echo "=========================================="
echo " DEMO SUMMARY"
echo "=========================================="
echo ""
echo "Before (insecure.tf):"
echo "  Risk Score: $INSECURE_SCORE/100"
echo "  Findings: $INSECURE_COUNT"
echo ""
echo "After (secure.tf):"
echo "  Risk Score: $SECURE_SCORE/100"
echo "  Findings: $SECURE_COUNT"
echo ""
echo "Improvement:"
echo "  Score: +$((SECURE_SCORE - INSECURE_SCORE)) points"
echo "  Findings: -$((INSECURE_COUNT - SECURE_COUNT)) resolved"
echo ""
echo "=========================================="
echo " Demo Complete!"
echo "=========================================="