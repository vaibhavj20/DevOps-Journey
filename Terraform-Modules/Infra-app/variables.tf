variable "env" {
    description = "The environment for the resources"
    type = string
}


variable "bucket_name"{
    description = "This is bucket name for my infra"
    type = string
}


variable "instance_count" {
    description = "Number of EC2 instances to create"
    type        = number
}


variable  "instance_type" {
    description = "Type of EC2 instance"
    type        = string
} 


variable "ec2_ami_id" {
    description = "AMI ID for the EC2 instance"
    type        = string
}

variable "hash_key" {
    description = "Hash key for DynamoDB table"
    type        = string
}