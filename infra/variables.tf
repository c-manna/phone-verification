variable "project_name" {
  description = "Project name used for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment, such as dev, staging, or prod."
  type        = string
}

variable "aws_region" {
  description = "AWS region for deployment."
  type        = string
}

variable "lambda_zip_path" {
  description = "Path to the packaged Lambda zip file."
  type        = string
}

variable "lambda_memory_size" {
  description = "Lambda memory size in MB."
  type        = number
  default     = 512
}

variable "lambda_timeout" {
  description = "Lambda timeout in seconds."
  type        = number
  default     = 60
}

variable "mongodb_uri" {
  description = "MongoDB connection string."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret."
  type        = string
  sensitive   = true
}

variable "jwt_expires_in" {
  description = "JWT expiry string, such as 1d."
  type        = string
  default     = "1d"
}

variable "twilio_account_sid" {
  description = "Twilio Account SID."
  type        = string
  sensitive   = true
}

variable "twilio_auth_token" {
  description = "Twilio auth token."
  type        = string
  sensitive   = true
}

variable "twilio_phone_number" {
  description = "Twilio sending phone number."
  type        = string
  sensitive   = true
}

variable "frontend_origin" {
  description = "Allowed frontend origin for CORS."
  type        = string
  default     = "http://localhost:5173"
}
