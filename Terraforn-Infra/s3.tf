resource "aws_s3_bucket" "infra-bucket" {
     bucket = "my-infra-bucket-v062001"
      tags = { 
        Name = "my-infra-bucket-v062001"
         } 
        }