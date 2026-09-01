// scanner.ts

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  remediation: string;
  lineNumber: number;
  resourceType: string;
}

export interface ScanResult {
  findings: Finding[];
  riskScore: number; // 0 to 100
  totalRulesChecked: number;
}

// Helper function to get the line number of a regex match
const getLineNumber = (code: string, index: number): number => {
  return code.substring(0, index).split('\n').length;
};

// The Security Rules Engine
const rules = [
  {
    id: 'CLOUD-SEC-001',
    severity: 'HIGH' as Severity,
    title: 'Unrestricted SSH Access (Port 22 Open to the World)',
    description: 'A Security Group allows inbound SSH traffic (port 22) from any IP address (0.0.0.0/0). This exposes your servers to brute-force attacks from the public internet.',
    remediation: 'Restrict the `cidr_blocks` for port 22 to your specific corporate IP address or a trusted bastion host IP.',
    resourceType: 'aws_security_group',
    // Regex looks for port 22 and 0.0.0.0/0 in the same block
    pattern: /from_port\s*=\s*22[\s\S]{0,300}?cidr_blocks\s*=\s*\[\s*"0\.0\.0\.0\/0"/g 
  },
  {
    id: 'CLOUD-SEC-002',
    severity: 'CRITICAL' as Severity,
    title: 'S3 Bucket Configured for Public Read Access',
    description: 'An S3 bucket is configured with `acl = "public-read"`. This allows anyone on the internet to read the contents of the bucket, potentially leading to data leaks.',
    remediation: 'Remove the `acl = "public-read"` attribute. Use `aws_s3_bucket_public_access_block` to explicitly block public access.',
    resourceType: 'aws_s3_bucket',
    pattern: /resource\s+"aws_s3_bucket"[\s\S]{0,500}?acl\s*=\s*"public-read"/g
  },
  {
    id: 'CLOUD-SEC-003',
    severity: 'CRITICAL' as Severity,
    title: 'Overly Permissive IAM Policy (Admin Access)',
    description: 'An IAM policy grants `Action: "*"` on `Resource: "*"`. This violates the principle of least privilege and acts as a master key for attackers.',
    remediation: 'Restrict the `Action` to only the specific API calls required, and limit the `Resource` to specific ARNs.',
    resourceType: 'aws_iam_policy',
    pattern: /"Action"\s*:\s*"\*"[\s\S]{0,100}?"Resource"\s*:\s*"\*"/g
  }
];

/**
 * The Main Scanning Engine
 * Takes raw Terraform code and returns security findings.
 */
export function scanTerraformCode(code: string): ScanResult {
  const findings: Finding[] = [];

  // Run every rule against the provided code
  rules.forEach((rule) => {
    // Reset regex index just in case
    rule.pattern.lastIndex = 0; 
    
    let match;
    // Execute regex and find all occurrences
    while ((match = rule.pattern.exec(code)) !== null) {
      findings.push({
        id: rule.id,
        severity: rule.severity,
        title: rule.title,
        description: rule.description,
        remediation: rule.remediation,
        lineNumber: getLineNumber(code, match.index),
        resourceType: rule.resourceType,
      });
    }
  });

  // Calculate Risk Score (100 is perfect, 0 is terrible)
  let deductions = 0;
  findings.forEach(f => {
    if (f.severity === 'CRITICAL') deductions += 25;
    if (f.severity === 'HIGH') deductions += 15;
    if (f.severity === 'MEDIUM') deductions += 5;
    if (f.severity === 'LOW') deductions += 1;
  });

  const riskScore = Math.max(0, 100 - deductions);

  return {
    findings,
    riskScore,
    totalRulesChecked: rules.length,
  };
}