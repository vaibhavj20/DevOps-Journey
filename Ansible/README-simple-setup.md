# Ansible Setup on AWS EC2

This guide explains how to set up Ansible on AWS EC2 instances, create users, enable passwordless SSH, and test connectivity.

## Table of Contents

1. [Launch EC2 Instances](#1-launch-ec2-instances)
2. [Connect to Instances and Rename Hostnames](#2-connect-to-instances-and-rename-hostnames)
3. [Configure /etc/hosts on Control Node](#3-configure-etchosts-on-control-node)
4. [Setup Passwordless SSH from Control Node to Managed Nodes](#4-setup-passwordless-ssh-from-control-node-to-managed-nodes)
5. [Install Ansible on Control Node](#5-install-ansible-on-control-node)
6. [Create Ansible Inventory and Test Connectivity](#6-create-ansible-inventory-and-test-connectivity)

---

## 1. Launch EC2 Instances

- Create **3 t2.micro** EC2 instances (Amazon Linux)
- Select a **Key Pair** for SSH access
- Name the instances:
  - `control-node` → Will run **Ansible** (main machine)
  - `managed-node-1` → Target node (controlled by control-node)
  - `managed-node-2` → Target node (controlled by control-node)

---

## 2. Connect to Instances and Rename Hostnames

### 2.1 Open Terminal Windows

1. **Open 3 separate terminal tabs/windows**
   - One for **Control Node**
   - One for **Managed Node 1**
   - One for **Managed Node 2**

### 2.2 Connect to Each Instance

Connect to each instance using SSH:

```bash
ssh -i .\OneDrive\My-AWS-Keys\AWSOPEN.pem ec2-user@<Public-IP>
```

### 2.3 Set Hostname for Clarity

**Control Node:**

```bash
sudo hostnamectl set-hostname Control-Node
```

**Managed Node 1:**

```bash
sudo hostnamectl set-hostname Managed-Node-1
```

**Managed Node 2:**

```bash
sudo hostnamectl set-hostname Managed-Node-2
```

### 2.4 Verify Hostname

```bash
hostname
```

---

## 3. Configure /etc/hosts on Control Node

### 3.1 Edit Hosts File

```bash
sudo nano /etc/hosts
```

### 3.2 Add Entries for Private IPs and Hostnames

```text
172.31.17.157   Managed-Node-1
172.31.28.184   Managed-Node-2
```

Save and exit (Ctrl + S, Ctrl + X)

### 3.3 Test Connectivity

```bash
ping Managed-Node-1
ping Managed-Node-2
```

---

## 4. Setup Passwordless SSH from Control Node to Managed Nodes

### 4.1 Generate SSH Key on Control Node

```bash
ssh-keygen
```

Press Enter three times to accept defaults.

### 4.2 Copy Key to Managed Nodes

Copy key to Managed Node 1:

```bash
ssh-copy-id ec2-user@Managed-Node-1
```

Copy key to Managed Node 2:

```bash
ssh-copy-id ec2-user@Managed-Node-2
```

### 4.3 Test Passwordless SSH

```bash
ssh ec2-user@Managed-Node-1
ssh ec2-user@Managed-Node-2
```

---

## 5. Install Ansible on Control Node

### 5.1 Check Python 3

```bash
python3 --version
```

### 5.2 Install Ansible

```bash
sudo yum install ansible -y
```

### 5.3 Verify Installation

```bash
ansible --version
```

---

## 6. Create Ansible Inventory and Test Connectivity

### 6.1 Create Inventory File

```bash
nano inventory.ini
```

### 6.2 Add Host Details

```ini
[webServers]
web ansible_host=Managed-Node-1 ansible_user=ec2-user ansible_connection=ssh ansible_ssh_private_key=/home/ec2-user/.ssh/id_rsa ansible_python_interpreter=/usr/bin/python3

[dbServers]
db ansible_host=Managed-Node-2 ansible_user=ec2-user ansible_connection=ssh ansible_ssh_private_key=/home/ec2-user/.ssh/id_rsa ansible_python_interpreter=/usr/bin/python3
```

### 6.3 Test Connectivity

```bash
ansible all -m ping -i inventory.ini
```

### 6.4 Expected Successful Output

```json
web | SUCCESS => { "changed": false, "ping": "pong" }
db  | SUCCESS => { "changed": false, "ping": "pong" }
```

---

## 🎉 Setup Complete!

Your Ansible control node is now ready to manage the target nodes. You can proceed to create playbooks and automate tasks across your infrastructure.
