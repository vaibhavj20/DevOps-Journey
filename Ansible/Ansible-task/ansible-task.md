# Ansible Realtime Project - Complete Guide

## Project Overview

This project demonstrates:

- Creating multiple EC2 instances with different OS distributions using Ansible loops
- Setting up passwordless authentication between Ansible control node and EC2 instances
- Automating shutdown of specific instances using Ansible conditionals

**Instances Created:**

- 2 Ubuntu instances
- 1 Amazon Linux instance

## Prerequisites Setup

### Step 1: Create Project Structure

```bash
# Create project folder
mkdir Ansible-task
cd Ansible-task
```

### Step 2: Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

### Step 3: Install Required Python Packages

```bash
# Install Ansible, boto3, and botocore
pip install ansible-core boto3 botocore
```

### Step 4: Install AWS Collection

```bash
# Install Amazon AWS collection
ansible-galaxy collection install amazon.aws --force
```

## Task 1: Create IAM User and EC2 Instances

### Step 1: Create IAM User on AWS

1. Go to AWS Console
2. Go to IAM Service
3. Create new user named `ansible-user`
4. Choose "Attach policies directly"
5. Search for EC2 and select `AmazonEC2FullAccess`
6. Create user
7. Create Access Key and Secret Key for this user
8. Copy and save both keys

### Step 2: Create Group Variables Directory

```bash
mkdir -p group_vars/all
```

### Step 3: Create Vault File with IAM User Credentials

```bash
# Create encrypted vault file
ansible-vault create group_vars/all/pass.yml

# Add your IAM user credentials in the editor:
```

**In the vault editor, add:**

```yaml
ec2_access_key: "YOUR_IAM_USER_ACCESS_KEY"
ec2_secret_key: "YOUR_IAM_USER_SECRET_KEY"
```

### Step 4: Create EC2 Creation Playbook

Create `ec2-create.yaml` file:

```yaml
---
- hosts: localhost
  connection: local
  tasks:
    - name: Create EC2 instances
      amazon.aws.ec2_instance:
        name: "{{ item.name }}"
        key_name: "aws-key"
        instance_type: t2.micro
        security_group: default
        region: us-east-1
        aws_access_key: "{{ec2_access_key}}" # From vault as defined
        aws_secret_key: "{{ec2_secret_key}}" # From vault as defined
        network:
          assign_public_ip: true
        image_id: "{{ item.image }}"
        tags:
          environment: "{{ item.name }}"
      loop:
        - { image: "ami-08982f1c5bf93d976", name: "managed-node-1" }
        - { image: "ami-0360c520857e3138f", name: "managed-node-2" }
        - { image: "ami-0360c520857e3138f", name: "managed-node-3" }
```

### Step 5: Run EC2 Creation Playbook

```bash
ansible-playbook ec2-create.yaml --ask-vault-pass
```

## Task 2: Setup Passwordless Authentication

### Step 1: Copy SSH Keys to EC2 Instances

**For Ubuntu instances:**

```bash
ssh-copy-id -f "-o IdentityFile /path/to/your/aws-key.pem" ubuntu@<UBUNTU-INSTANCE-PUBLIC-IP-1>
ssh-copy-id -f "-o IdentityFile /path/to/your/aws-key.pem" ubuntu@<UBUNTU-INSTANCE-PUBLIC-IP-2>
```

**For Amazon Linux instance:**

```bash
ssh-copy-id -f "-o IdentityFile /path/to/your/aws-key.pem" ec2-user@<AMAZON-LINUX-INSTANCE-PUBLIC-IP>
```

### Step 2: Test SSH Connection

```bash
# Test Ubuntu instances
ssh ubuntu@<UBUNTU-INSTANCE-PUBLIC-IP-1>
ssh ubuntu@<UBUNTU-INSTANCE-PUBLIC-IP-2>

# Test Amazon Linux instance
ssh ec2-user@<AMAZON-LINUX-INSTANCE-PUBLIC-IP>
```

## Task 3: Automate Ubuntu Instance Shutdown

### Step 1: Create Inventory File

Create `inventory.ini` file:

```ini
[all]

ec2-user@54.221.145.23
ubuntu@18.232.112.43
ubuntu@54.165.19.157
```

### Step 2: Create Shutdown Playbook

Create `ec2-stop.yaml` file:

```yaml
---
- hosts: all
  become: true
  tasks:
    - name: Shutdown ubuntu instances only
      ansible.builtin.command: /sbin/shutdown -t now
      when: ansible_facts['os_family'] == "Debian"
```

### Step 3: Run Shutdown Playbook

```bash
ansible-playbook -i inventory.ini ec2-stop.yaml --ask-vault-pass
```

## Project Structure

```
Ansible-task/
├── venv/
├── group_vars/
│   └── all/
│       └── pass.yml
├── ec2-create.yaml
├── ec2-stop.yaml
└── inventory.ini
```

## Key Learning Points

### Ansible Loops

- Used `loop` to create multiple EC2 instances with different configurations
- Each loop item contains `image` (AMI ID) and `name` parameters
- AMI IDs: Ubuntu (`ami-0360c520857e3138f`), Amazon Linux (`ami-08982f1c5bf93d976`)

### Passwordless Authentication

- `ssh-copy-id` command copies public key to remote instances
- `-f` flag forces key copying (overwrites existing keys)
- Different usernames: `ubuntu` for Ubuntu, `ec2-user` for Amazon Linux

### Ansible Conditionals

- `when` condition executes tasks only when criteria is met
- `ansible_facts['os_family'] == "Debian"` targets only Ubuntu instances
- Debian family includes Ubuntu distribution

## Troubleshooting

### If SSH connection fails:

```bash
# Check if your PEM file has correct permissions
chmod 400 /path/to/your/aws-key.pem

# Test direct SSH connection
ssh -i /path/to/your/aws-key.pem ubuntu@<PUBLIC-IP>
```

### If playbook fails:

```bash
# Verify vault credentials
ansible-vault view group_vars/all/pass.yml

# Check if instances are running
aws ec2 describe-instances --region us-east-1
```

### If shutdown doesn't work:

```bash
# Test inventory connectivity
ansible -i inventory.ini all -m ping

# Check gathered facts
ansible -i inventory.ini all -m setup
```

## Commands Summary

```bash
# Create and run EC2 instances
ansible-playbook ec2-create.yaml --ask-vault-pass

# Setup passwordless auth (repeat for each instance)
ssh-copy-id -f "-o IdentityFile /path/to/pem" user@public-ip

# Shutdown Ubuntu instances only
ansible-playbook -i inventory.ini ec2-stop.yaml --ask-vault-pass
```

## Security Notes

- IAM user has only EC2 permissions (principle of least privilege)
- Vault file encrypts sensitive AWS credentials
- SSH keys provide secure passwordless authentication
- Always use specific AMI IDs for your region
