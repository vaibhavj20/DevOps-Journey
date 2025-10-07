# 🚀 Terraform Multi-Environment Workflow

Managing Dev and Prod environments with Git branches and Terraform workspaces.

## 📋 Overview

This repository demonstrates a robust approach to managing multiple environments (Dev and Prod) using Terraform workspaces combined with Git branch strategy. Each environment is isolated with its own workspace and configuration.

## 🏗️ Infrastructure Components

### EC2 Instance Configuration (`ec2.tf`)

```hcl
# Key Pair
resource "aws_key_pair" "my_key" {
  key_name   = "terraform-key-${var.env}"
  public_key = file("terraform-key.pub")
  tags = {
    Environment = var.env
  }
}

# VPC and Security Group
resource "aws_default_vpc" "default" {}

resource "aws_security_group" "my_security_group" {
  name        = "my-sg-${var.env}"
  description = "Allow SSH and HTTP"
  vpc_id      = aws_default_vpc.default.id

  tags = {
    Name        = "my-security-group"
    Environment = var.env
  }

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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
}

# EC2 Instances
resource "aws_instance" "my_ec2" {
  for_each = tomap({
    my_ec2_instance_micro = "t2.micro",
    my_ec2_instance_small = "t2.small",
  })

  depends_on      = [aws_security_group.my_security_group, aws_key_pair.my_key]
  key_name        = aws_key_pair.my_key.key_name
  security_groups = [aws_security_group.my_security_group.name]
  instance_type   = each.value
  ami             = var.ec2_ami_id
  user_data       = file("install-nginx.sh")

  root_block_device {
    volume_size = var.env == "prod" ? 20 : var.ec2_default_root_storage_size
    volume_type = "gp2"
  }

  tags = {
    Name        = each.key
    Environment = var.env
  }
}
```

### Variables Configuration (`variables.tf`)

**In DEV branch:**

```hcl
variable "env" {
  default = "dev"
  type    = string
}
```

**In MAIN branch:**

```hcl
variable "env" {
  default = "prod"
  type    = string
}
```

## 🌿 Branch & Workspace Structure

| Git Branch | Terraform Workspace | Environment Tag    |
| ---------- | ------------------- | ------------------ |
| `dev`      | `dev`               | `Environment=dev`  |
| `main`     | `default`           | `Environment=prod` |

## 🔄 Development Workflow

### Working in DEV Environment

```bash
# 1. Switch to dev branch
git checkout dev

# 2. Switch to dev workspace
terraform workspace select dev

# 3. Make changes to your Terraform files (ec2.tf, etc.)

# 4. Plan and apply changes
terraform plan
terraform apply

# 5. Commit and push to Git
git add .
git commit -m "feat: your feature description"
git push origin dev
```

## 🚀 Production Workflow

### Working in PROD Environment

```bash
# 1. Switch to main branch
git checkout main

# 2. Switch to default workspace
terraform workspace select default

# 3. Make changes to your Terraform files (ec2.tf, etc.)

# 4. Plan and apply changes
terraform plan
terraform apply

# 5. Commit and push to Git
git add .
git commit -m "feat: your feature description"
git push origin main
```

## 📊 Infrastructure Created per Environment

| Environment | Instances             | Root Storage | Environment Tag    |
| ----------- | --------------------- | ------------ | ------------------ |
| **dev**     | 2 EC2 (micro + small) | 8GB          | `Environment=dev`  |
| **prod**    | 2 EC2 (micro + small) | 20GB         | `Environment=prod` |

### Instance Details

- **my_ec2_instance_micro**: t2.micro instance
- **my_ec2_instance_small**: t2.small instance

## 🔍 Filtering Resources in AWS Console

Use these tag filters in the AWS Console search bar:

```
tag:Environment=dev
```

or

```
tag:Environment=prod
```

## ⚡ Quick Reference Commands

### Check Current State

```bash
# Check current workspace
terraform workspace show

# Check current branch
git branch

# List all workspaces
terraform workspace list
```

### Switch Environments

```bash
# Switch to dev
terraform workspace select dev

# Switch to prod (default)
terraform workspace select default
```

### Terraform Operations

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy resources
terraform destroy
```

---

**Happy Terraforming! 🎉**
