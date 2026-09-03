resource "aws_ebs_volume" "data" {
  availability_zone = "us-east-1a"
  size              = 100
  # encrypted is omitted, defaulting to false in older providers or explicitly insecure
}