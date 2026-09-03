resource "aws_db_instance" "main" {
  identifier           = "prod-db"
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  username             = "admin"
  password             = "SuperSecretPassword123!"
  publicly_accessible  = true
}