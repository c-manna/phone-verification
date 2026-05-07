output "api_gateway_url" {
  value = module.lambda_api.api_gateway_url
}

output "frontend_bucket_name" {
  value = module.s3_frontend.frontend_bucket_name
}

output "frontend_website_url" {
  value = module.s3_frontend.frontend_website_url
}
