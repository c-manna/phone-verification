variable "name_prefix" {
  description = "Prefix for Lambda and API Gateway resources."
  type        = string
}

variable "aws_region" {
  description = "AWS region."
  type        = string
}

variable "lambda_zip_path" {
  description = "Path to the packaged Lambda zip file."
  type        = string
}

variable "lambda_memory_size" {
  type = number
}

variable "lambda_timeout" {
  type = number
}

variable "mongodb_uri" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "jwt_expires_in" {
  type = string
}

variable "twilio_account_sid" {
  type      = string
  sensitive = true
}

variable "twilio_auth_token" {
  type      = string
  sensitive = true
}

variable "twilio_phone_number" {
  type      = string
  sensitive = true
}

variable "frontend_origin" {
  type = string
}
