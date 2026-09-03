# demo/secure.tf
# Secure Terraform configuration (remediated version)

resource "aws_s3_bucket" "data" {
  bucket = "company-sensitive-data"
  # FIXED: Removed public ACL
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_s3_bucket_public_access_block" "data" {
  bucket = aws_s3_bucket.data.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_security_group" "web" {
  name        = "allow_ssh"
  description = "Allow SSH from corporate network only"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"] # FIXED: Restricted to corporate network
  }
}

resource "aws_ebs_volume" "storage" {
  availability_zone = "us-east-1a"
  size              = 100
  encrypted         = true # FIXED: Encryption enabled
}

resource "aws_db_instance" "prod" {
  identifier           = "prod-database"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  username             = "admin"
  password             = var.db_password # FIXED: Use variable instead of hardcoded
  publicly_accessible  = false # FIXED: Not publicly accessible
  storage_encrypted    = true # FIXED: Storage encryption enabled
}