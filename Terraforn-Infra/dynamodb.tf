
resource "aws_dynamodb_table" "infra-table" {
  name           = "my-infra-table-v062001"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }


  tags = {
    Name        = "my-infra-table-v062001"

  }
}