# TerraGuard Demo

This directory contains a reproducible demonstration of TerraGuard's security scanning workflow.

## Demo Scenario

### 1. Insecure Configuration (`insecure.tf`)
Contains 4 critical/high-severity misconfigurations:
- Public S3 bucket (CRITICAL)
- Open SSH to internet (HIGH)
- Unencrypted EBS volume (HIGH)
- Hardcoded database password (CRITICAL)
- Publicly accessible RDS (HIGH)

### 2. Secure Configuration (`secure.tf`)
Remediated version with all issues fixed:
- Private S3 bucket with encryption
- SSH restricted to corporate network
- Encrypted EBS volume
- Database password from variable
- Private RDS with encryption

## Running the Demo

```bash
cd demo
./run-demo.sh