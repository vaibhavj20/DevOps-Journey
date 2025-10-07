🚀 Terraform Multi-Environment Workflow
Managing Dev and Prod environments with Git branches and Terraform workspaces.

📄 ec2.tf
terraform# key pair
resource "aws_key_pair" "my_key" {
key_name = "terraform-key-${var.env}"
public_key = file("terraform-key.pub")
tags = {
Environment = var.env
}
}

# vpc and security group

resource "aws_default_vpc" "default" {
}

resource "aws_security_group" "my_security_group" {
name = "my-sg-${var.env}"
description = "Allow SSH and HTTP"
vpc_id = aws_default_vpc.default.id

tags = {
Name = "my-security-group"
Environment = var.env
}

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

egress {
from_port = 0
to_port = 0
protocol = "-1"
cidr_blocks = ["0.0.0.0/0"]
description = "Allow all outbound traffic"
}
}

# ec2-instance

resource "aws_instance" "my_ec2" {
for_each = tomap ({
my_ec2_instance_micro = "t2.micro",
my_ec2_instance_small = "t2.small",
})  
 depends_on = [ aws_security_group.my_security_group , aws_key_pair.my_key ]

key_name = aws_key_pair.my_key.key_name
security_groups = [aws_security_group.my_security_group.name]
instance_type = each.value
ami = var.ec2_ami_id
user_data = file("install-nginx.sh")

root_block_device {
volume_size = var.env == "prod" ? 20 : var.ec2_default_root_storage_size
volume_type = "gp2"
}

tags = {
Name = each.key
Environment = var.env
}
}

📝 variables.tf
In DEV branch: env = "dev"
In MAIN branch: env = "prod"
terraformvariable "env" {
default = "dev" # Change to "prod" in main branch
type = string
}

🌿 Branch & Workspace Structure
Git BranchTerraform WorkspaceEnvironment TagdevdevEnvironment=devmaindefaultEnvironment=prod

🔄 DEV Workflow
bash# 1. Switch to dev branch
git checkout dev

# 2. Switch to dev workspace

terraform workspace select dev

# 3. Make changes to ec2.tf

# 4. Apply changes

terraform apply

# 5. Push to Git

git add .
git commit -m "Your message"
git push origin dev

🔄 PROD Workflow
bash# 1. Switch to main branch
git checkout main

# 2. Switch to default workspace

terraform workspace select default

# 3. Make changes to ec2.tf

# 4. Apply changes

terraform apply

# 5. Push to Git

git add .
git commit -m "Your message"
git push origin main

📊 What Gets Created
EnvironmentInstancesStorageTagdev2 EC2 (micro + small)8GBEnvironment=devprod2 EC2 (micro + small)20GBEnvironment=prod

🔍 Filter in AWS Console
Search bar: tag:Environment=dev or tag:Environment=prod

⚡ Quick Commands
bash# Check workspace
terraform workspace show

# Check branch

git branch

# Switch workspace

terraform workspace select dev
terraform workspace select default

🎉 Done!
