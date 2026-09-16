# test_s3_iam.tf

resource "aws_s3_bucket" "public_data" {
  bucket = "my-company-public-data"
  acl    = "public-read" # Triggers TG-S3-001 (CRITICAL)
  # Missing server_side_encryption_configuration triggers TG-S3-003 (HIGH)
}

resource "aws_iam_policy" "admin_access" {
  name = "full_admin_access"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = "*"       # Triggers TG-IAM-001 (CRITICAL)
        Resource = "*"     # Triggers TG-IAM-001 (CRITICAL)
      }
    ]
  })
}