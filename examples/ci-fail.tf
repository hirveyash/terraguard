# examples/ci-fail.tf
# Insecure configuration that triggers CI failure

resource "aws_s3_bucket" "public_logs" {
  bucket = "my-public-logs"
  acl    = "public-read" # TRIGGERS: TG-S3-001 (CRITICAL)
}

resource "aws_security_group" "database" {
  name        = "allow_all_db"
  description = "Dangerous DB access"

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # TRIGGERS: TG-NET-003 (CRITICAL)
  }
}