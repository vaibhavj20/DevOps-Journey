# Jenkins Agent Setup with SSH Connection

A comprehensive guide to set up Jenkins Agent (Slave) node and connect it to Jenkins Master using SSH key-based authentication.

## What is a Jenkins Agent?

Jenkins Agent (also called Slave or Node) is a separate machine that executes build jobs. The Jenkins Master delegates work to agents, enabling:

- **Distributed Builds**: Run multiple builds simultaneously
- **Resource Isolation**: Keep builds separate from master
- **Platform Diversity**: Build on different OS (Linux, Windows, Mac)
- **Scalability**: Add more agents as workload increases

**Architecture**: Jenkins Master (orchestrates) → Jenkins Agent (executes builds)

## Prerequisites

- Jenkins Master server already running on Ubuntu
- AWS Account to create agent instance
- SSH key pair available

---

# Part 1: Launch Jenkins Agent EC2 Instance

1. Go to AWS Console → EC2 → Launch Instances
2. Configure:
   - **Name**: `jenkins-agent1`
   - **AMI**: Ubuntu Server 24.04 LTS or 22.04 LTS
   - **Instance Type**: t2.micro
   - **Storage**: 8 GB (default)
   - **Key Pair**: Select your existing key pair
   - **Security Group**: Allow HTTP (80), HTTPS (443), SSH (22)
3. Click **Launch Instance**

---

# Part 2: Install Java on Agent

Jenkins Agent needs Java to execute builds, but **does NOT need Jenkins installed**.

## Connect to Agent

```bash
ssh -i path/to/AWSOPEN.pem ubuntu@<agent-public-ip>
```

## Install Java

```bash
# Update system
sudo apt update

# Install Java 21
sudo apt install fontconfig openjdk-21-jre -y

# Verify Java installation
java -version
```

**Important**: Agent only needs Java, NOT Jenkins!

---

# Part 3: Setup SSH Key Authentication

Jenkins Master connects to Agent using SSH with public/private key pairs:

- **Public Key** → Goes on Agent (in `authorized_keys`)
- **Private Key** → Stays on Master (used by Jenkins to connect)

## Generate SSH Keys on Jenkins Master

SSH into Jenkins Master:

```bash
ssh -i path/to/AWSOPEN.pem ubuntu@<jenkins-master-public-ip>
```

Generate SSH key pair:

```bash
# Navigate to SSH directory
cd ~/.ssh

# Generate SSH key pair
ssh-keygen
```

Press **Enter** three times:

- Default file name: `id_rsa`
- No passphrase needed
- Confirm no passphrase

Verify keys created:

```bash
ls -la
```

You'll see:

- `id_rsa` - Private key
- `id_rsa.pub` - Public key

## Copy Public Key

```bash
cat id_rsa.pub
```

Copy the entire output (starts with `ssh-rsa` and ends with `ubuntu@jenkins-master`).

---

# Part 4: Add Public Key to Agent

Switch to Agent terminal:

```bash
ssh -i path/to/AWSOPEN.pem ubuntu@<agent-public-ip>
```

Navigate to SSH directory:

```bash
cd ~/.ssh
ls -la
```

You'll see `authorized_keys` file.

## Add Public Key to Authorized Keys

```bash
vim authorized_keys
```

Or use nano:

```bash
nano authorized_keys
```

**Go to the last line** and paste the public key you copied from Jenkins Master.

Save and exit:

- **Vim**: Press `Esc`, type `:wq`, press Enter
- **Nano**: Press `Ctrl+X`, then `Y`, then Enter

**Why?** This allows Jenkins Master to SSH into Agent without password.

---

# Part 5: Add Agent Node in Jenkins

## Step 1: Create New Node

1. Go to Jenkins Dashboard
2. Click **Manage Jenkins** → **Nodes**
3. Click **New Node**
4. Configure:
   - **Node name**: `jenkins-agent1`
   - Select: **Permanent Agent**
5. Click **Create**

## Step 2: Configure Node Settings

### Description

```
This is Jenkins Agent 1 for distributed builds
```

### Number of Executors

- **Value**: `1`
- **What it means**: How many parallel builds this agent can run simultaneously

### Remote Root Directory

- **Value**: `/home/ubuntu`
- **What it means**: Working directory on agent where Jenkins creates workspaces for builds

### Labels

- **Value**: `agent1`
- **What it means**: Tag to identify this agent. Use this label in pipelines to run jobs on this specific agent

### Usage

- Select: **Use this node as much as possible**
- **What it means**: Jenkins will prefer to use this agent for builds

### Launch Method

- Select: **Launch agents via SSH**
- **What it means**: Jenkins Master will SSH into agent to start it

### Host

- **Value**: `<agent-public-ip>` or `<agent-private-ip>` (private IP recommended for production)
- **What it means**: IP address of the agent server

---

# Part 6: Add SSH Credentials

## Get Private Key from Jenkins Master

Switch back to Jenkins Master terminal:

```bash
cd ~/.ssh
cat id_rsa
```

Copy the **entire private key** including:

```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

## Add Credentials in Jenkins

In the Node configuration page:

1. Under **Credentials**, click **Add** → **Jenkins**
2. Configure:
   - **Kind**: SSH Username with private key
   - **ID**: `jenkins-agent1-key` (any meaningful name)
   - **Description**: `SSH key for jenkins-agent1`
   - **Username**: `ubuntu`
   - **Private Key**: Select **Enter directly**
   - Click **Add** button
   - Paste the entire private key you copied
   - **Passphrase**: Leave empty (we didn't set one)
3. Click **Add**

## Select Credentials

- **Credentials**: Select `jenkins-agent1-key` from dropdown

## Host Key Verification Strategy

- Select: **Non verifying Verification Strategy**
- **What it means**: Skip SSH host key verification (OK for testing; for production, use "Known hosts file Verification Strategy")

---

# Part 7: Save and Launch Agent

1. Click **Save**
2. You'll be redirected to the agent status page
3. Click **Launch agent** (or it may launch automatically)
4. Wait a few seconds
5. Status should show: **Agent successfully connected and online** ✅

---

# Part 8: Test Agent with Pipeline

Now let's run our existing pipeline on the agent!

## Modify Existing Pipeline

1. Go to Dashboard → Click on your pipeline (`My-First-CICD-Pipeline`)
2. Click **Configure**
3. Scroll to **Pipeline Script**
4. Change `agent any` to `agent { label "agent1" }`

**Updated Script**:

```groovy
pipeline {
    agent { label "agent1" }

    stages {
        stage("Hello") {
            steps {
                echo "Hello Friends!!"
                echo "Running on Jenkins Agent!"
            }
        }

        stage("Create Folder") {
            steps {
                sh "mkdir -p pipefolder"
                sh "pwd"
                sh "hostname"
            }
        }

        stage("Bye") {
            steps {
                echo "Goodbye Friends!!"
            }
        }
    }
}
```

4. Click **Save**
5. Click **Build Now**

## Verify Execution

1. Check the **Console Output**
2. You'll see: `Running on jenkins-agent1 in /home/ubuntu/workspace/My-First-CICD-Pipeline`
3. This confirms the job ran on the agent, not the master!

## Verify on Agent Server

SSH into agent:

```bash
ssh -i path/to/AWSOPEN.pem ubuntu@<agent-public-ip>
cd /home/ubuntu/workspace/My-First-CICD-Pipeline
ls -la
```

You'll see the `pipefolder` created by the pipeline on the agent!

---

# Understanding Agent Labels

Labels help you control where jobs run:

```groovy
// Run on any agent with label "agent1"
agent { label "agent1" }

// Run on any available agent
agent any

// Run on multiple labeled agents
agent { label "linux && docker" }

// Run on master
agent { label "master" }
```

---

# Agent Status and Management

## View All Nodes

Dashboard → **Manage Jenkins** → **Nodes**

You'll see:

- **Built-In Node** (Jenkins Master)
- **jenkins-agent1** (Your agent)

## Agent Status Indicators

- ✅ **Online**: Agent is connected and ready
- ❌ **Offline**: Agent is disconnected
- ⚠️ **Temporarily Offline**: Agent is marked offline by user

## Disconnect Agent

Click on agent → Click **Mark this node temporarily offline**

## Reconnect Agent

Click on agent → Click **Bring this node back online**

## Delete Agent

Click on agent → Click **Delete Agent** (permanent)

---

# Multiple Agents Setup

You can add multiple agents for more capacity:

1. Create `jenkins-agent2` instance
2. Install Java on agent2
3. Generate new SSH keys or reuse existing
4. Add agent2 in Jenkins with label `agent2`
5. Use different labels in pipelines:

```groovy
pipeline {
    agent none

    stages {
        stage("Build on Agent 1") {
            agent { label "agent1" }
            steps {
                echo "Building on Agent 1"
            }
        }

        stage("Test on Agent 2") {
            agent { label "agent2" }
            steps {
                echo "Testing on Agent 2"
            }
        }
    }
}
```

---

# Troubleshooting

**Agent shows offline**

- Check agent EC2 instance is running
- Verify security groups allow SSH (port 22)
- Test SSH manually: `ssh -i ~/.ssh/id_rsa ubuntu@<agent-ip>`
- Check Jenkins logs: Dashboard → Manage Jenkins → System Log

**"Permission denied" error**

- Verify public key is in agent's `~/.ssh/authorized_keys`
- Check file permissions: `chmod 600 ~/.ssh/authorized_keys`
- Ensure private key is correct in Jenkins credentials

**Agent connects but builds fail**

- Verify Java is installed on agent: `java -version`
- Check workspace permissions: `ls -la /home/ubuntu`
- Review console output for specific errors

**"Host key verification failed"**

- Change Host Key Verification Strategy to "Non verifying"
- Or add agent to known_hosts: `ssh-keyscan <agent-ip> >> ~/.ssh/known_hosts`

---

# Key Differences: Master vs Agent

| Aspect              | Jenkins Master               | Jenkins Agent            |
| ------------------- | ---------------------------- | ------------------------ |
| **Role**            | Orchestrates builds          | Executes builds          |
| **Jenkins Install** | ✅ Required                  | ❌ Not needed            |
| **Java**            | ✅ Required                  | ✅ Required              |
| **Web UI**          | ✅ Yes (port 8080)           | ❌ No                    |
| **Workspace**       | `/var/lib/jenkins/workspace` | `/home/ubuntu/workspace` |
| **SSH Keys**        | Private key stored           | Public key stored        |

---

# Best Practices

1. **Use Private IPs**: For agent connection in production (no data transfer cost)
2. **Label Strategy**: Use meaningful labels like `linux`, `docker`, `production`
3. **Resource Allocation**: Don't run builds on master in production
4. **Security**: Use "Known hosts file" verification in production
5. **Monitoring**: Regularly check agent health and disk space
6. **Multiple Agents**: Add agents for redundancy and load distribution

---

# Summary

You've successfully:

✅ Created Jenkins Agent EC2 instance
✅ Installed Java on agent (no Jenkins needed)
✅ Generated SSH key pair on Jenkins Master
✅ Configured public key on Agent
✅ Added Agent node in Jenkins with SSH credentials
✅ Connected Agent to Master successfully
✅ Modified pipeline to run on specific agent using labels
✅ Verified distributed build execution

Your Jenkins setup now has:

- **Jenkins Master**: Manages and schedules jobs
- **Jenkins Agent**: Executes the actual build work

This is the foundation of scalable CI/CD infrastructure! 🚀

---

**Author**: Vaibhav Jamdhade  
**Date**: October 2025
