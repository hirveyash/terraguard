# test_compute_cache.tf

resource "aws_instance" "web_server" {
  ami           = "ami-12345678"
  instance_type = "t3.micro"
  # Missing metadata_options block defaults to IMDSv1, triggers TG-EC2-001 (HIGH)
}

resource "aws_lambda_function_url" "public_api" {
  function_name      = "my_lambda_function"
  authorization_type = "NONE" # Triggers TG-LAM-001 (HIGH)
}

resource "aws_elasticache_replication_group" "redis_cluster" {
  replication_group_id = "my-redis"
  engine               = "redis"
  transit_encryption_enabled = false # Triggers TG-ELC-001 (HIGH)
  at_rest_encryption_enabled = true
}

resource "aws_secretsmanager_secret_version" "db_creds" {
  secret_id = "arn:aws:secretsmanager:us-east-1:123456789012:secret:db-creds"
  # Hardcoded JSON with sensitive keys triggers TG-SEC-002 (HIGH)
  secret_string = jsonencode({
    username = "admin"
    password = "SuperSecret123!"
  })
}