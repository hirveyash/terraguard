# test_secure.tf

resource "aws_s3_bucket" "secure_data" {
  bucket = "my-company-secure-data"
  # No ACL defaults to private. No TG-S3-001.
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256" # No TG-S3-003.
      }
    }
  }
}

resource "aws_security_group" "secure_sg" {
  name        = "allow_ssh_corporate"
  description = "Allow SSH from corporate network only"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"] # Restricted IP. No TG-NET-001.
  }
}

resource "aws_db_instance" "secure_db" {
  identifier           = "secure-database"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  username             = "admin"
  password             = var.db_password # Uses variable. No TG-SEC-001.
  publicly_accessible  = false           # No TG-RDS-001.
  storage_encrypted    = true            # No TG-RDS-002.
}