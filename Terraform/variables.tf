variable "ec2_instane_type" {
    default = "t2.micro"
    type = string 
}

variable "ec2_root_storage_size" {
  default = 8 
  type = number
}


variable  "ec2_ami_id"{
    default = "ami-08982f1c5bf93d976" # amazon linux
    type = string
}