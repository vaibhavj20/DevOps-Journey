# key pair
resource "aws_key_pair"  "my_key" {
    key_name  = "terraform-key"
    public_key = file("terraform-key.pub") # you can directly paste the public key here
}


#vpc and security group

resource "aws_default_vpc" "default" {

}


resource "aws_security_group" "my_security_group" {
     name = "my-sg"
     description = "Allow SSH and HTTP"
     vpc_id = aws_default_vpc.default.id # interpolation syntax 

     tags = {
        Name = "my-security-group"
     }


#inbound rules 
 
 ingress {
      from_port = 22
      to_port = 22 
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "Allow SSH from anywhere"
 }

 ingress {
    from_port = 80 
    to_port = 80
    protocol = "tcp" 
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP from anywhere"

 }

#outbound rules
 
 egress{
    from_port = 0 
    to_port =  0
    protocol = "-1" 
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
 }


}

# ec2-instance

resource aws_instance "my_ec2" {
    key_name = aws_key_pair.my_key.key_name
    security_groups = [aws_security_group.my_security_group.name]
    instance_type = "t2.micro"
    ami = "ami-08982f1c5bf93d976" # amazon linux


    root_block_device {
        volume_size = 8
        volume_type = "gp2"

    }

    tags = {
        Name = "my_ec2_instance"
    }
}

