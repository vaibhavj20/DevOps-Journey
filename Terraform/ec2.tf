# key pair
resource "aws_key_pair" "my_key" {
  key_name   = "terraform-key-${var.env}"
  public_key = file("terraform-key.pub") # you can directly paste the public key here
  tags = {
  Environment = var.env
  }
}


#vpc and security group

resource "aws_default_vpc" "default" {

}


resource "aws_security_group" "my_security_group" {
  name        = "my-sg-${var.env}"
  description = "Allow SSH and HTTP"
  vpc_id      = aws_default_vpc.default.id # interpolation syntax 

  tags = {
    Name = "my-security-group"
    Environment = var.env
  }


  #inbound rules 

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow SSH from anywhere"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP from anywhere"

  }

  #outbound rules

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }


}

# ec2-instance

resource "aws_instance" "my_ec2" {
  for_each  = tomap ({
    
    my_ec2_instance_small = "t2.small",
    
  })  
  depends_on = [ aws_security_group.my_security_group , aws_key_pair.my_key ]

  key_name        = aws_key_pair.my_key.key_name
  security_groups = [aws_security_group.my_security_group.name]
  instance_type   = each.value
  ami             = var.ec2_ami_id # amazon linux
  user_data       = file("install-nginx.sh")


  root_block_device {
    volume_size = var.env == "prod" ? 20 : var.ec2_default_root_storage_size
    volume_type = "gp2"

  }

  tags = {
    Name = each.key
    Environment = var.env
  }
}



# resource "aws_instance" "my_new_instance" {
#      ami = "unknown"
#      instance_type = "unknown"
# }

