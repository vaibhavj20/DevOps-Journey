# Ansible Setup on AWS EC2

This guide explains how to set up Ansible on AWS EC2 instances, create users, enable passwordless SSH, and test connectivity.

## Table of Contents

1. [Launch EC2 Instances](#1-launch-ec2-instances)
2. [Connect to Instances and Rename Hostnames](#2-connect-to-instances-and-rename-hostnames)
3. [Create a New User on All Instances](#3-create-a-new-user-on-all-instances)
4. [Grant Sudo Privileges to the New User](#4-grant-sudo-privileges-to-the-new-user)
5. [Enable Password-Based SSH Login](#5-enable-password-based-ssh-login)
6. [Connect to Instances Using Password](#6-connect-to-instances-using-password)
7. [Configure /etc/hosts on Control Node](#7-configure-etchosts-on-control-node)
8. [Setup Passwordless SSH from Control Node to Managed Nodes](#8-setup-passwordless-ssh-from-control-node-to-managed-nodes)
9. [Install Ansible on Control Node](#9-install-ansible-on-control-node)
10. [Create Ansible Inventory and Test Connectivity](#10-create-ansible-inventory-and-test-connectivity)

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

## 3. Create a New User on All Instances

Add user `john` on each instance:

```bash
sudo useradd john
sudo passwd john
```

Verify the user:

```bash
id john
```

---

## 4. Grant Sudo Privileges to the New User

### 4.1 Edit Sudoers File

```bash
sudo visudo
```

### 4.2 Add User Privileges

Add the following below the root entry:

```text
## Allow root to run any commands anywhere
root    ALL=(ALL)       ALL
john    ALL=(ALL)       NOPASSWD:ALL
```

Save and exit (Ctrl + S, Ctrl + X)

### 4.3 Verify Sudo Access

```bash
su - john
sudo whoami
```

**Expected Output:** `root`

---

## 5. Enable Password-Based SSH Login

### 5.1 Edit SSH Configuration

```bash
sudo nano /etc/ssh/sshd_config
```

### 5.2 Enable Password Authentication

Set the following parameter:

```text
PasswordAuthentication yes
```

### 5.3 Restart SSH Service

```bash
sudo systemctl restart sshd
```

**Note:** Repeat on all instances.

---

## 6. Connect to Instances Using Password

### 6.1 Exit Current Session

```bash
exit
```

### 6.2 SSH Using the New User

```bash
ssh john@<Control-Node-Public-IP>
ssh john@<Managed-Node-1-Public-IP>
ssh john@<Managed-Node-2-Public-IP>
```

Enter the password set earlier for user `john`.

✅ **No .pem key required now.**

---

## 7. Configure /etc/hosts on Control Node

### 7.1 Edit Hosts File

```bash
sudo nano /etc/hosts
```

### 7.2 Add Entries for Private IPs and Hostnames

```text
172.31.17.157   Managed-Node-1
172.31.28.184   Managed-Node-2
```

Save and exit (Ctrl + S, Ctrl + X)

### 7.3 Test Connectivity

```bash
ping Managed-Node-1
ping Managed-Node-2
```

---

## 8. Setup Passwordless SSH from Control Node to Managed Nodes

### 8.1 Generate SSH Key on Control Node

```bash
ssh-keygen
```

Press Enter three times to accept defaults.

### 8.2 Copy Key to Managed Nodes

Copy key to Managed Node 1:

```bash
ssh-copy-id john@Managed-Node-1
```

Copy key to Managed Node 2:

```bash
ssh-copy-id john@Managed-Node-2
```

### 8.3 Test Passwordless SSH

```bash
ssh john@Managed-Node-1
ssh john@Managed-Node-2
```

---

## 9. Install Ansible on Control Node

### 9.1 Check Python 3

```bash
python3 --version
```

### 9.2 Install Ansible

```bash
sudo yum install ansible -y
```

### 9.3 Verify Installation

```bash
ansible --version
```

---

## 10. Create Ansible Inventory and Test Connectivity

### 10.1 Create Inventory File

```bash
nano inventory.ini
```

### 10.2 Add Host Details

```ini
[webServers]
web ansible_host=Managed-Node-1 ansible_user=john ansible_connection=ssh ansible_ssh_private_key=/home/john/.ssh/id_rsa ansible_python_interpreter=/usr/bin/python3

[dbServers]
db ansible_host=Managed-Node-2 ansible_user=john ansible_connection=ssh ansible_ssh_private_key=/home/john/.ssh/id_rsa ansible_python_interpreter=/usr/bin/python3
```

### 10.3 Test Connectivity

```bash
ansible all -m ping -i inventory.ini
```

### 10.4 Expected Successful Output

```json
web | SUCCESS => { "changed": false, "ping": "pong" }
db  | SUCCESS => { "changed": false, "ping": "pong" }
```

---

## 🎉 Setup Complete!

Your Ansible control node is now ready to manage the target nodes. You can proceed to create playbooks and automate tasks across your infrastructure.
