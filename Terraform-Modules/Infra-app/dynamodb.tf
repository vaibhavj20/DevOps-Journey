
resource "aws_dynamodb_table" "infra-table" {
  name           = "${var.env}-my-infra-table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = var.hash_key

  attribute {
    name = var.hash_key
    type = "S"
  }


  tags = {
    Name        =  "${var.env}-my-infra-table"
    Environment = var.env


  }
}