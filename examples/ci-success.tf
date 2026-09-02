# examples/ci-success.tf
# Secure configuration that passes all TerraGuard rules
# Uses inline encryption block (detectable by static analysis)

resource "aws_s3_bucket" "secure_data" {
  bucket = "my-secure-company-data"

  # Inline encryption - detectable by TG-S3-003
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }

  # Inline versioning - good practice
  versioning {
    enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "secure_data" {
  bucket = aws_s3_bucket.secure_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_security_group" "web" {
  name        = "allow_https_only"
  description = "Allow HTTPS from internet"

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}