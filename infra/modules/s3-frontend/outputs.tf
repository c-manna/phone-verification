output "frontend_bucket_name" {
  value = aws_s3_bucket.this.bucket
}

output "frontend_website_url" {
  value = "http://${aws_s3_bucket.this.bucket}.s3-website-${data.aws_region.current.name}.amazonaws.com"
}
