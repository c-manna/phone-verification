locals {
  name_prefix = lower(replace("${var.project_name}-${var.environment}", "_", "-"))
  frontend_bucket_name = lower(replace("${var.project_name}-${var.environment}-${var.aws_region}-frontend", "_", "-"))
}

module "lambda_api" {
  source = "./modules/lambda-api"

  name_prefix          = local.name_prefix
  aws_region           = var.aws_region
  lambda_zip_path      = var.lambda_zip_path
  lambda_memory_size   = var.lambda_memory_size
  lambda_timeout       = var.lambda_timeout
  mongodb_uri          = var.mongodb_uri
  jwt_secret           = var.jwt_secret
  jwt_expires_in       = var.jwt_expires_in
  twilio_account_sid   = var.twilio_account_sid
  twilio_auth_token    = var.twilio_auth_token
  twilio_phone_number  = var.twilio_phone_number
  frontend_origin      = var.frontend_origin
}

module "s3_frontend" {
  source = "./modules/s3-frontend"

  bucket_name = local.frontend_bucket_name
}
