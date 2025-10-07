# Terraform Custom Modules

A reusable Terraform module setup for creating infrastructure across multiple environments (dev, prod) using custom modules.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Module Features](#module-features)
- [Setup Instructions](#setup-instructions)
- [Module Configuration](#module-configuration)

## 🎯 Overview

This project demonstrates how to:

- Create reusable Terraform modules
- Deploy infrastructure for multiple environments using the same module
- Manage environment-specific configurations
- Use module parameters for flexibility

## ✅ Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- Terraform installed (v1.0+)
- SSH key pair generated (`terraform-key.pub`)

## 📁 Project Structure

```
Terraform-Modules/
├── terraform.tf              # Terraform configuration
├── main.tf                   # Module declarations for dev and prod
│
└── Infra-app/                # Reusable module
    ├── provider.tf           # AWS provider configuration
    ├── variables.tf          # Module input variables
    ├── s3.tf                 # S3 bucket resource
    ├── dynamodb.tf           # DynamoDB table resource
    └── ec2.tf                # EC2 instances and networking
```

## 🔧 Module Features

The `Infra-app` module creates the following resources:

- **S3 Bucket**: Environment-specific storage bucket
- **DynamoDB Table**: NoSQL database with custom hash key
- **EC2 Instances**: Configurable number and type of instances
- **Security Group**: SSH (port 22) and HTTP (port 80) access
- **SSH Key Pair**: For EC2 instance access
- **VPC**: Uses default VPC for networking

## 🚀 Setup Instructions

### Step 1: Navigate to Project Directory

```bash
cd Terraform-Modules
```

### Step 2: Initialize Terraform

This downloads the required providers and initializes the modules.

```bash
terraform init
```

### Step 3: Review the Plan

Check what resources will be created for both dev and prod environments.

```bash
terraform plan
```

### Step 4: Apply the Configuration

Create all resources in AWS.

```bash
terraform apply
# Type: yes when prompted
```

### Step 5: Verify Resources

Check the AWS Console to verify:

- **Dev Environment**: 1 t2.micro instance, dev S3 bucket, dev DynamoDB table
- **Prod Environment**: 2 t2.nano instances, prod S3 bucket, prod DynamoDB table

### Step 6: Destroy Resources (When Done)

Clean up all created resources.

```bash
terraform destroy
# Type: yes when prompted
```

## ⚙️ Module Configuration

### Dev Environment

```hcl
module "dev-infra-app" {
  source         = "./Infra-app"
  env            = "dev"
  bucket_name    = "infra-bucket-v062001"
  instance_count = 1
  instance_type  = "t2.micro"
  ec2_ami_id     = "ami-052064a798f08f0d3"
  hash_key       = "StudentID"
}
```

**Resources Created:**

- S3 Bucket: `dev-infra-bucket-v062001`
- DynamoDB: `dev-my-infra-table`
- EC2: 1 instance (t2.micro) with 10GB storage
- Security Group: `my-infra-app-sg-dev`
- Key Pair: `terraform-key-dev`

### Prod Environment

```hcl
module "prod-infra-app" {
  source         = "./Infra-app"
  env            = "prod"
  bucket_name    = "infra-bucket-v062001"
  instance_count = 2
  instance_type  = "t2.nano"
  ec2_ami_id     = "ami-052064a798f08f0d3"
  hash_key       = "StudentID"
}
```

**Resources Created:**

- S3 Bucket: `prod-infra-bucket-v062001`
- DynamoDB: `prod-my-infra-table`
- EC2: 2 instances (t2.nano) with 15GB storage each
- Security Group: `my-infra-app-sg-prod`
- Key Pair: `terraform-key-prod`

### Module Variables

| Variable         | Description             | Type   | Example                 |
| ---------------- | ----------------------- | ------ | ----------------------- |
| `env`            | Environment name        | string | "dev", "prod"           |
| `bucket_name`    | Base name for S3 bucket | string | "infra-bucket-v062001"  |
| `instance_count` | Number of EC2 instances | number | 1, 2                    |
| `instance_type`  | EC2 instance type       | string | "t2.micro", "t2.nano"   |
| `ec2_ami_id`     | AMI ID for EC2          | string | "ami-052064a798f08f0d3" |
| `hash_key`       | DynamoDB hash key name  | string | "StudentID"             |

## 🎨 Key Concepts

### Module Benefits

- **Reusability**: Write once, use multiple times with different configurations
- **Consistency**: Same infrastructure pattern across all environments
- **Maintainability**: Update module once, affects all environments
- **Scalability**: Easy to add new environments (staging, QA, etc.)

### Environment-Specific Configuration

The module automatically adjusts resources based on the `env` variable:

- **Storage Size**: Dev gets 10GB, Prod gets 15GB
- **Resource Naming**: All resources prefixed with environment name
- **Tagging**: Environment tag added to all resources

### Infrastructure Differences

| Feature       | Dev      | Prod    |
| ------------- | -------- | ------- |
| EC2 Count     | 1        | 2       |
| Instance Type | t2.micro | t2.nano |
| Root Volume   | 10GB     | 15GB    |

## 📝 Important Notes

- The S3 bucket name must be globally unique. Update `bucket_name` if needed.
- Ensure your SSH public key file (`terraform-key.pub`) exists in the root directory.
- All resources are tagged with their environment for easy identification.
- Security groups allow SSH and HTTP from anywhere (0.0.0.0/0) - restrict in production.

---

**🎉 You now have a reusable Terraform module that can deploy infrastructure across multiple environments!**

This modular approach makes your infrastructure code DRY (Don't Repeat Yourself) and easier to manage.
