# Complete Ansible EC2 Setup Guide - From Scratch

## Step 1: Create Project Structure

```bash
# Create Ansible-collection folder
mkdir Ansible-collection
cd Ansible-collection
```

## Step 2: Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# You should see (venv) in your prompt
```

## Step 3: Install Required Python Packages

```bash
# Install Ansible, boto3, and botocore
pip install ansible-core boto3 botocore

# Verify installations
pip list | grep -E "(ansible|boto)"
```

## Step 4: Install AWS Collection

```bash
# Install Amazon AWS collection
ansible-galaxy collection install amazon.aws --force

# Test if collection is installed
ansible-doc amazon.aws.ec2_instance
# Press 'q' to exit
```

## Step 5: Create Inventory File

Create `inventory.ini` file with this content:

```
[local]
localhost ansible_connection=local
```

## Step 6: Create EC2 Playbook File

Create `ec2-create.yaml` file with this content:

```yaml
---
- hosts: localhost
  connection: local
  roles:
    - ec2
```

## Step 7: Create EC2 Role

```bash
# Create ec2 role structure
ansible-galaxy role init ec2

# Verify role structure
ls -la roles/ec2/
```

## Step 8: Create EC2 Task File

In `roles/ec2/tasks/main.yml`, add this content:

```yaml
---
# tasks file for ec2
- name: start an instance with a public IP address
  amazon.aws.ec2_instance:
    name: "my-ansible-instance"
    instance_type: t2.micro
    security_group: default
    region: us-east-1
    aws_access_key: "{{ ec2_access_key }}"
    aws_secret_key: "{{ ec2_secret_key }}"
    network:
      assign_public_ip: true
    image_id: ami-04b70fa74e45c3917
    state: present
```

## Step 9: Create Group Variables Directory

```bash
# Create group_vars/all directory
mkdir -p group_vars/all

# Verify directory structure
tree . -I venv
```

## Step 10: Get AWS Access Keys and Create Vault File

### Get AWS Credentials:

1. Go to AWS Console
2. Go to your account (top right)
3. Go to Security Credentials option
4. Create Access Key
5. Copy the Access Key ID and Secret Access Key

### Create Vault File:

```bash
# Create encrypted vault file for AWS credentials
ansible-vault create group_vars/all/pass.yml

# When prompted:
# 1. Enter a vault password (remember this!)
# 2. Add your AWS credentials in the editor:
```

**In the vault editor, add:**

```yaml
ec2_access_key: "YOUR_ACTUAL_AWS_ACCESS_KEY"
ec2_secret_key: "YOUR_ACTUAL_AWS_SECRET_KEY"
```

**Editor Tips:**

- If in vi/vim: Press `i` to insert, type your content, press `Esc`, then `:wq` to save
- If in nano: Type your content, press `Ctrl+X`, then `Y`, then `Enter` to save

## Step 11: Run Your Playbook

```bash
# Run the playbook (it will ask for vault password)
ansible-playbook -i inventory.ini ec2-create.yaml --ask-vault-pass

# Enter the same vault password you used when creating the vault file
```

## Troubleshooting Common Issues

### If you get "boto3 not found" error:

```bash
# Make sure venv is activated
source venv/bin/activate
# Reinstall boto3
pip install boto3 botocore
```

### If you get "collection not found" error:

```bash
# Reinstall AWS collection
ansible-galaxy collection install amazon.aws --force
```

### If you get "invalid AMI ID" error:

- Make sure you're using the correct AMI ID for your region (us-east-1)
- Or change the region to match your AMI

### If you get authentication errors:

- Verify your AWS credentials are correct in the vault file
- Make sure your AWS user has EC2 permissions
