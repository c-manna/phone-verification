locals {
  function_name = "${var.name_prefix}-phone-verification-api"
  log_group_name = "/aws/lambda/${local.function_name}"
}

resource "aws_iam_role" "lambda" {
  name = "${var.name_prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect  = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "basic_execution" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = local.log_group_name
  retention_in_days = 14
}

resource "aws_lambda_function" "this" {
  function_name = local.function_name
  role          = aws_iam_role.lambda.arn
  handler       = "dist/lambda.handler"
  runtime       = "nodejs20.x"
  filename      = var.lambda_zip_path
  source_code_hash = filebase64sha256(var.lambda_zip_path)
  memory_size   = var.lambda_memory_size
  timeout       = var.lambda_timeout
  architectures = ["x86_64"]

  environment {
    variables = {
      NODE_ENV                   = "production"
      MONGODB_URI                = var.mongodb_uri
      JWT_SECRET                 = var.jwt_secret
      JWT_EXPIRES_IN             = var.jwt_expires_in
      TWILIO_ACCOUNT_SID         = var.twilio_account_sid
      TWILIO_AUTH_TOKEN          = var.twilio_auth_token
      TWILIO_PHONE_NUMBER        = var.twilio_phone_number
      OTP_EXPIRY_MINUTES         = "2"
      OTP_RESEND_COOLDOWN_SECONDS = "30"
      OTP_MAX_ATTEMPTS           = "5"
      FRONTEND_ORIGIN            = var.frontend_origin
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda, aws_iam_role_policy_attachment.basic_execution]
}

resource "aws_apigatewayv2_api" "this" {
  name          = "${var.name_prefix}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [var.frontend_origin]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
    expose_headers = []
    max_age       = 3600
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.this.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}
