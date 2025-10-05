terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.14.1"
    }
  }

#   backend "s3" {
#     bucket        = "my-infra-bucket-v062001"
#     key            = "terraform.tfstate"
#     region         = "us-east-1"
#     dynamodb_table = "my-infra-table-v062001"
# }
}