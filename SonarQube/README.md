# Complete SonarQube Setup Guide for Ubuntu EC2

## 🔍 What is SonarQube?

SonarQube is a code quality and security analysis tool that helps developers identify bugs, vulnerabilities, and code smells in their projects.

## 📋 Prerequisites

- AWS Account
- SSH Key Pair (`.pem` file)
- Basic knowledge of terminal commands

## 🛠️ EC2 Instance Requirements

- **Instance Type**: t2.medium
- **AMI**: Ubuntu 24.04 LTS
- **Storage**: 20 GB EBS Volume
- **Security Group**:
  - SSH (port 22)
  - Custom TCP (port 9000) - for SonarQube

---

## 🚀 Step-by-Step Installation Guide

### Step 1: Create EC2 Instance on AWS Console

1. Login to **AWS Console** → Go to **EC2 Dashboard**
2. Click **Launch Instance**
3. Configure:
   - **Name**: sonarqube-server
   - **AMI**: Ubuntu 24.04 LTS
   - **Instance Type**: t2.medium
   - **Key Pair**: Select your `.pem` key
   - **Storage**: 20 GB
   - **Security Group**:
     - Allow SSH (port 22)
     - Allow Custom TCP (port 9000)
4. Launch the instance and copy the **Public IP**

### Step 2: Configure Security Group (Port 9000)

1. Go to **EC2** → **Security Groups**
2. Select your instance's security group
3. Click **Edit inbound rules** → **Add rule**
   - **Type**: Custom TCP
   - **Port**: 9000
   - **Source**: 0.0.0.0/0
4. Save rules

### Step 3: Connect to EC2

```bash
ssh -i .\OneDrive\My-AWS-Keys\AWSOPEN.pem ubuntu@YOUR_PUBLIC_IP
```

Type `yes` when prompted.

### Step 4: Change Hostname (Optional)

```bash
sudo hostnamectl set-hostname sonarqube-server
exit
```

### Step 5: Reconnect to EC2

```bash
ssh -i .\OneDrive\My-AWS-Keys\AWSOPEN.pem ubuntu@YOUR_PUBLIC_IP
```

Now you'll see `ubuntu@sonarqube-server:~$`

---

## 📦 Install Required Software

### Step 6: Update System and Install Java

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Java 17 and required tools
sudo apt install -y openjdk-17-jdk wget unzip

# Verify Java installation
java -version
```

---

## 🔧 Install SonarQube Community Edition

### Step 7: Download and Install SonarQube

```bash
# Download SonarQube Community Edition
wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-25.10.0.114319.zip

# Check the downloaded filename (it will be very long with parameters)
ls

# Rename to a clean filename
mv sonarqube-25.10.0.114319.zip?_gl=1*1u2xbhy*_ga*NjQ0NTc0NjY0LjE3NTk5NzkyODI.*_ga_9JZ0GZ5TC6*czE3NTk5NzkyODEkbzEkZzEkdDE3NTk5Nzk1NjYkajYwJGwwJGgw*_gcl_au*NDYwOTc5NTEzLjE3NTk5NzkyODY. sonarqube-25.10.0.114319.zip

# Verify the renamed file
ls

# Unzip
unzip sonarqube-25.10.0.114319.zip

# Move to /opt directory
sudo mv sonarqube-25.10.0.114319 /opt/sonarqube
```

### Step 8: Create SonarQube User

```bash
# Create dedicated user for SonarQube
sudo useradd -r -d /opt/sonarqube -s /bin/false sonarqube

# Change ownership
sudo chown -R sonarqube:sonarqube /opt/sonarqube
```

### Step 9: Configure System Limits

```bash
# Edit sysctl.conf
sudo nano /etc/sysctl.conf
```

**Add these lines at the end:**

```
vm.max_map_count=262144
fs.file-max=65536
```

**Save:** `Ctrl+X` → `Y` → `Enter`

```bash
# Apply changes
sudo sysctl -p
```

### Step 10: Configure User Limits

```bash
# Edit limits.conf
sudo nano /etc/security/limits.conf
```

**Add these lines at the end:**

```
sonarqube   -   nofile   65536
sonarqube   -   nproc    4096
```

**Save:** `Ctrl+X` → `Y` → `Enter`

---

## 🔄 Create SonarQube Service

### Step 11: Create Systemd Service File

```bash
sudo nano /etc/systemd/system/sonarqube.service
```

**Add this content:**

```ini
[Unit]
Description=SonarQube service
After=network.target

[Service]
Type=forking

ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop

User=sonarqube
Group=sonarqube
Restart=always
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

**Save:** `Ctrl+X` → `Y` → `Enter`

### Step 12: Start SonarQube Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Start SonarQube
sudo systemctl start sonarqube

# Enable SonarQube to start on boot
sudo systemctl enable sonarqube

# Check status
sudo systemctl status sonarqube
```

**Wait 2-3 minutes for SonarQube to start completely**

---

## 🌐 Access SonarQube Web Interface

### Step 13: Login to SonarQube

Open your browser:

```
http://YOUR_PUBLIC_IP:9000
```

**Default Credentials:**

- **Username**: `admin`
- **Password**: `admin`

**Important:** Change the password after first login!

---

## 📝 Create and Analyze a Sample Project

### Step 14: Create Project Folder

```bash
# Create project folder
mkdir ~/my-sonarqube-project
cd ~/my-sonarqube-project
```

### Step 15: Create Sample Python File

```bash
nano sample_code.py
```

**Paste this code (contains intentional issues):**

```python
def compute(x, y):
    result = 0
    for i in range(0, x):  # Loop could be inefficient
        for j in range(0, y):
            if i % 2 == 0:  # Poorly explained condition
                result += i * j
            else:
                result += i + j
    return result


def handledata(data):
    res = []
    for d in data:  # Potential redundancy
        if d not in res:  # Inefficient check for duplicates
            res.append(d)
    return res


def div(a, b):
    try:
        return a / b
    except:
        print("An error occurred")  # Generic exception handling
        return None


# Unused function
def unused_function():
    print("This function is never used!")


values = [1, 2, 3, 4, 5, 2, 3]
handledata(values)  # Calling the function but ignoring the result
print(compute(10, 5))
print(div(5, 0))  # Division by zero, caught in the try-except
```

**Save:** `Ctrl+X` → `Y` → `Enter`

---

## 🔎 Install SonarQube Scanner

### Step 16: Download and Install Scanner

```bash
# Go to home directory
cd ~

# Download Scanner
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-6.2.1.4610-linux-x64.zip

# Unzip
unzip sonar-scanner-cli-6.2.1.4610-linux-x64.zip

# Move to /opt
sudo mv sonar-scanner-6.2.1.4610-linux-x64 /opt/sonar-scanner
```

### Step 17: Add Scanner to PATH

```bash
# Add to PATH (temporary - for current session)
export PATH=$PATH:/opt/sonar-scanner/bin

# Verify scanner installation
sonar-scanner --version
```

**To make PATH permanent (optional):**

```bash
echo 'export PATH=$PATH:/opt/sonar-scanner/bin' >> ~/.bashrc
source ~/.bashrc
```

---

## 🔐 Generate SonarQube Authentication Token

### Step 18: Create Token in SonarQube UI

1. Open SonarQube: `http://YOUR_PUBLIC_IP:9000`
2. Login with `admin` credentials
3. Click on **profile icon** (top-right corner)
4. Select **My Account**
5. Go to **Security** tab
6. In **Generate Tokens** section:
   - **Name**: `my-sonarqube-project`
   - **Type**: User Token
   - Click **Generate**
7. **Copy the token** (you won't see it again!)

Example token: `squ_3dce8fa87ab827712ac7391d40f2c4c3df0a8b49`

---

## ⚙️ Configure SonarQube Project

### Step 19: Create Configuration File

```bash
# Go to project folder
cd ~/my-sonarqube-project

# Create config file
nano sonar-project.properties
```

**Add this content (replace with your details):**

```properties
# SonarQube project settings
sonar.projectKey=my-sonarqube-project
sonar.projectName=My SonarQube Project
sonar.projectVersion=1.0
sonar.sources=.

# SonarQube server details
sonar.host.url=http://YOUR_PUBLIC_IP:9000
sonar.login=YOUR_SONARQUBE_TOKEN
```

**Replace:**

- `YOUR_PUBLIC_IP` with your EC2 public IP
- `YOUR_SONARQUBE_TOKEN` with the token you generated

**Save:** `Ctrl+X` → `Y` → `Enter`

---

## 🚀 Run Code Analysis

### Step 20: Execute Scanner

```bash
# Make sure you're in the project folder
cd ~/my-sonarqube-project

# Run analysis
sonar-scanner
```

Wait for the analysis to complete (takes 30-60 seconds).

### Step 21: View Results

1. Open browser: `http://YOUR_PUBLIC_IP:9000`
2. Go to **Projects**
3. Click on **My SonarQube Project**
4. Review all issues, bugs, and code smells

---

## ✅ Fix the Code (Optional)

### Step 22: Create Fixed Version

```bash
nano fixed_code.py
```

**Paste this improved code:**

```python
def calculate_sum(max_x, max_y):
    """Calculates total based on even/odd logic."""
    return sum(i * j if i % 2 == 0 else i + j for i in range(max_x) for j in range(max_y))


def divide_numbers(a, b):
    """Performs division with error handling."""
    try:
        return a / b
    except ZeroDivisionError:
        print("Error: Division by zero.")
        return None
    except TypeError:
        print("Error: Invalid input.")
        return None


if __name__ == "__main__":
    print("Sum:", calculate_sum(10, 5))  # Example nested loop calculation
    print("Valid division:", divide_numbers(10, 2))  # Valid case
    print("Division by zero:", divide_numbers(5, 0))  # Division by zero
    print("Invalid input:", divide_numbers(5, "a"))  # Invalid input
```

**Save:** `Ctrl+X` → `Y` → `Enter`

### Step 23: Replace Old Code and Re-scan

```bash
# Replace old code with fixed code
mv fixed_code.py sample_code.py

# Run analysis again
sonar-scanner
```

Refresh SonarQube dashboard to see improved results!

---

## 🔧 Useful Commands

### Check SonarQube Status

```bash
sudo systemctl status sonarqube
```

### Restart SonarQube

```bash
sudo systemctl restart sonarqube
```

### Stop SonarQube

```bash
sudo systemctl stop sonarqube
```

### View Logs

```bash
sudo tail -f /opt/sonarqube/logs/sonar.log
```

---

## 📂 Project Structure

```
~/my-sonarqube-project/
├── sample_code.py
├── sonar-project.properties
└── .scannerwork/ (created after scan)
```

---

**Made with ❤️ using SonarQube Community Edition & Ubuntu**
