#dev infrastructure

module "dev-infra-app" {
    source = "./Infra-app"
    env = "dev"
    bucket_name = "infra-bucket-v062001"
    instance_count = 1
    instance_type = "t2.micro"
    ec2_ami_id = "ami-052064a798f08f0d3"
    hash_key = "StudentID"
}
#prod infrastructure

module "prod-infra-app" {
    source = "./Infra-app"
    env = "prod"
    bucket_name = "infra-bucket-v062001"
    instance_count = 2
    instance_type = "t2.nano"
    ec2_ami_id = "ami-052064a798f08f0d3"
    hash_key = "StudentID"
}