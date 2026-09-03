# Known Limitations

Transparency is a core security principle. TerraGuard is a **static** analysis tool and has inherent limitations compared to dynamic or stateful analysis.

## 1. No Cross-Resource Analysis
TerraGuard evaluates each resource block in isolation. It cannot detect issues that require understanding relationships between resources.  
*Example*: It will flag an S3 bucket with `acl = "public-read"`, but it cannot detect if a separate `aws_iam_policy` resource grants access to that specific bucket.

## 2. No Variable or Data Source Resolution
TerraGuard treats `var.password` or `data.aws_kms_key.current.arn` as opaque strings.  
*Impact*: It will not flag a vulnerability hidden behind a variable, nor will it falsely flag a secure variable reference as a hardcoded secret. This is a deliberate design choice to minimize false positives.

## 3. Limited Dynamic Block Support
Complex, dynamically generated HCL (e.g., heavy use of `for_each`, `dynamic` blocks, or `jsonencode` with complex Terraform functions) may not be fully parsed by the regex-based AST. The scanner gracefully degrades and skips unparseable blocks rather than crashing.

## 4. No Runtime or Cloud API Context
TerraGuard only analyzes code at rest. It cannot verify if an AWS account actually has an SCP (Service Control Policy) that overrides a misconfiguration, nor can it check the live state of the cloud environment.

## 5. Parser Edge Cases
While highly resilient, the custom regex parser may miss highly obfuscated or non-standard HCL formatting. It is optimized for standard, `terraform fmt`-compliant code.