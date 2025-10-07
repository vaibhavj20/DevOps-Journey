# Terraform Remote Backend Setup

A complete guide to setting up Terraform with AWS S3 remote backend and DynamoDB state locking.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Key Concepts](#key-concepts)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This project demonstrates how to:

- Create S3 bucket and DynamoDB table for remote state management
- Deploy EC2 infrastructure with Terraform
- Migrate local state to remote backend
- Enable state locking for team collaboration

## ✅ Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- Terraform installed (v1.0+)
- SSH key pair generated (`terraform-key` and `terraform-key.pub`)

## 📁 Project Structure

```
.
├── terraform-infra/          # Backend infrastructure
│   ├── terraform.tf
│   ├── provider.tf
│   ├── s3.tf
│   └── dynamodb.tf
│
└── Terraform/                # Main infrastructure
    ├── terraform.tf
    ├── provider.tf
    ├── variables.tf
    ├── ec2.tf
    ├── install-nginx.sh
    └── terraform-key.pub
```

## 🚀 Setup Instructions

### Phase 1: Create Backend Infrastructure

Create the S3 bucket and DynamoDB table to store Terraform state remotely.

```bash
cd terraform-infra
terraform init
terraform plan
terraform apply
```

**What gets created:**

- S3 bucket: `my-infra-bucket`
- DynamoDB table: `my-infra-table`

### Phase 2: Create EC2 Infrastructure

Deploy EC2 instances and related resources (initially with local state).

```bash
cd ../Terraform
terraform init
terraform plan
terraform apply
```

**What gets created:**

- 2 EC2 instances (t2.micro and t2.small)
- Security group with SSH (port 22) and HTTP (port 80) access
- SSH key pair
- Nginx installed via user data script

### Phase 3: Migrate to Remote Backend

Move the local state file to the S3 backend.

1. Update `terraform.tf` in the `Terraform` folder to include the backend configuration:

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.14.1"
    }
  }

  backend "s3" {
    bucket         = "my-infra-bucket"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "my-infra-table"
  }
}
```

2. Reinitialize Terraform and migrate state:

```bash
terraform init
# When prompted "Do you want to copy existing state to the new backend?"
# Type: yes
```

## 🔑 Key Concepts

### S3 Backend Benefits

- **Team Collaboration**: Multiple team members can access the same state
- **State Versioning**: Automatic versioning of state files
- **Secure Storage**: Centralized and secure state management
- **No Local Dependencies**: State survives local machine failures

### DynamoDB State Locking

- **Prevents Conflicts**: Locks state during operations
- **Concurrent Protection**: Prevents multiple simultaneous applies
- **Required Attribute**: Hash key must be named `LockID`

### State Migration Summary

| Phase | Location          | What Gets Created    | State Storage |
| ----- | ----------------- | -------------------- | ------------- |
| 1     | `terraform-infra` | S3 + DynamoDB        | Local         |
| 2     | `Terraform`       | EC2 + Security Group | Local         |
| 3     | `Terraform`       | Nothing (migration)  | S3 Remote     |

## 📝 Important Notes

- The S3 bucket name must be globally unique. Update `my-infra-bucket` to your unique name.
- Ensure your SSH public key file (`terraform-key.pub`) exists before running Phase 2.
- The user data script installs and starts Nginx on the EC2 instances.

---

**🎉 You now have a fully configured Terraform remote backend with state locking enabled!**

This setup enables secure team collaboration and protects your infrastructure state from conflicts.
