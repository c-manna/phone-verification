terraform {
  backend "s3" {
    bucket         = "phone-verification-state-bucket"
    key            = "phone-verification/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
  }
}
