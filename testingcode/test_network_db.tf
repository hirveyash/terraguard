# test_network_db.tf

resource "aws_security_group" "web_sg" {
  name        = "allow_ssh"
  description = "Allow SSH inbound"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Triggers TG-NET-001 (HIGH)
  }
}

resource "aws_db_instance" "prod_db" {
  identifier           = "prod-database"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  username             = "admin"
  password             = "SuperSecretPassword123!" # Triggers TG-SEC-001 (CRITICAL)
  publicly_accessible  = true                      # Triggers TG-RDS-001 (HIGH)
  storage_encrypted    = false                     # Triggers TG-RDS-002 (HIGH)
}