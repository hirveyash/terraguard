resource "aws_s3_bucket" "public_data" {
  bucket = "company-public-data"
  acl    = "public-read"
}