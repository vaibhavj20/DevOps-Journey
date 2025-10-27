# Jenkins CI/CD Server Setup on AWS

A complete guide to set up Jenkins automation server on AWS EC2 instance with support for both Amazon Linux and Ubuntu, including troubleshooting for common issues.

## What is Jenkins?

Jenkins is an open-source automation server that helps automate the software development process including building, testing, and deploying applications. It's the most popular CI/CD tool used by development teams worldwide.

## Prerequisites

- AWS Account
- SSH key pair (e.g., `AWSOPEN.pem`)
- Basic understanding of Linux commands

## Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instances
2. Configure the following:
   - **AMI**: Amazon Linux 2023 OR Ubuntu 22.04/24.04 LTS
   - **Instance Type**: t2.medium
   - **Storage**: 10 GB
   - **Key Pair**: Select your existing key pair
3. Click **Launch Instance**
4. Once running, rename the instance to `jenkins-master`

## Step 2: Connect to Jenkins Instance

### For Amazon Linux

```bash
ssh -i path\to\AWSOPEN.pem ec2-user@<jenkins-public-ip>
```

### For Ubuntu

```bash
ssh -i path\to\AWSOPEN.pem ubuntu@<jenkins-public-ip>
```

### Set Hostname

```bash
sudo hostnamectl set-hostname jenkins-master
exit
```

Reconnect via SSH to see the updated hostname.

## Step 3: Install Jenkins

Choose the installation method based on your EC2 instance's operating system.

---

### Option A: Amazon Linux 2023

#### Update System & Install Java

```bash
# Update system packages
sudo yum update -y

# Install Java 21 (Amazon Corretto - AWS optimized JDK)
sudo dnf install java-21-amazon-corretto -y

# Verify Java installation
java -version

# Install wget for downloading packages
sudo yum install wget -y
```

#### Add Jenkins Repository

```bash
# Download Jenkins repository configuration
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo

# Import Jenkins GPG key
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
```

#### Install Jenkins

```bash
# Install Jenkins
sudo dnf install jenkins -y

# Enable and start Jenkins service
sudo systemctl enable --now jenkins
```

---

### Option B: Ubuntu 22.04/24.04

#### Update System & Install Java

```bash
# Update system packages
sudo apt update

# Install Java 21 (OpenJDK)
sudo apt install openjdk-21-jdk -y

# Verify Java installation
java -version

# Install prerequisites
sudo apt install wget gnupg -y
```

#### Add Jenkins Repository

```bash
# Add Jenkins repository key
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

# Add Jenkins repository
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Update package list
sudo apt update
```

#### Install Jenkins

```bash
# Install Jenkins
sudo apt install jenkins -y

# Enable and start Jenkins service
sudo systemctl enable --now jenkins
```

---

Jenkins will now start automatically and run on port **8080**.

## Step 4: Configure Security Group

Add inbound rule for Jenkins:

- **Type**: Custom TCP
- **Port**: 8080
- **Source**: 0.0.0.0/0 (or restrict to your IP)

## Step 5: Access Jenkins Web Interface

Open your browser and navigate to:

```
http://<jenkins-public-ip>:8080
```

You'll see the Jenkins unlock screen asking for an initial administrator password.

### Retrieve Initial Admin Password

The unlock screen shows a red path like: `/var/lib/jenkins/secrets/initialAdminPassword`

Copy this path and run on your terminal:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

Copy the displayed password and paste it into the Jenkins unlock screen, then click **Continue**.

### Install Suggested Plugins

1. Click **Install suggested plugins**
2. Wait for all plugins to install (this takes a few minutes)

### Create Admin User

1. After plugin installation, create your admin account:
   - Username: (your choice)
   - Password: (secure password)
   - Confirm password
   - Full name
   - Email address
2. Click **Save and Continue**

### Configure Jenkins URL

Enter your Jenkins URL:

```
http://<jenkins-public-ip>:8080
```

Click **Save and Finish**, then **Start using Jenkins**.

## Step 6: Fix Disk Space Error

After setup, you might see a red error: **"Disk space is below threshold of 1.00GB"**

This happens because Jenkins requires adequate `/tmp` space. Here's how to fix it:

### Check Current Disk Usage

```bash
df -h
```

### Temporary Fix (Until Reboot)

```bash
# Remount /tmp with 2GB space
sudo mount -o remount,size=2G /tmp

# Verify the change
df -h
```

### Permanent Fix (Survives Reboot)

```bash
# Edit fstab file
sudo nano /etc/fstab
```

Add this line at the end of the file:

```
tmpfs /tmp tmpfs defaults,noatime,size=2G 0 0
```

Save and exit (Ctrl+X, Y, Enter).

Apply the changes:

```bash
# Remount /tmp
sudo mount -o remount /tmp

# Verify 2GB space
df -h

# Restart Jenkins
sudo systemctl restart jenkins
```

Wait a few moments, then **hard refresh** your browser (Ctrl+F5 or Cmd+Shift+R).

The disk space error should now be gone!

## Step 7: Handling Public IP Changes

**Important**: When you stop and start your EC2 instance, AWS assigns a new public IP address. This causes Jenkins to load slowly or become unresponsive because it's still configured with the old IP.

### Update Jenkins URL After IP Change

If you restart your instance and Jenkins becomes slow or unresponsive:

```bash
# Edit Jenkins configuration file
sudo nano /var/lib/jenkins/jenkins.model.JenkinsLocationConfiguration.xml
```

Find the `<jenkinsUrl>` tag and update it with your new public IP:

```xml
<jenkinsUrl>http://<new-public-ip>:8080/</jenkinsUrl>
```

Save and exit (Ctrl+X, Y, Enter).

```bash
# Restart Jenkins to apply changes
sudo systemctl restart jenkins
```

Now access Jenkins with the new IP:

```
http://<new-public-ip>:8080
```

Jenkins should load smoothly without any delays!

## How Jenkins Works

Jenkins operates as a continuous integration and continuous deployment (CI/CD) server:

1. **Job Execution**: Jenkins runs automated jobs/pipelines that build, test, and deploy your code
2. **Source Control Integration**: Connects to Git, GitHub, GitLab to fetch your code
3. **Build Automation**: Compiles code, runs tests, generates reports
4. **Plugin Ecosystem**: Extends functionality through 1800+ plugins
5. **Distributed Builds**: Can distribute work across multiple machines

**Typical Workflow**: Developer pushes code → Jenkins detects change → Builds project → Runs tests → Deploys if successful → Sends notifications

## Useful Jenkins Commands

```bash
# Check Jenkins status
sudo systemctl status jenkins

# Start Jenkins
sudo systemctl start jenkins

# Stop Jenkins
sudo systemctl stop jenkins

# Restart Jenkins
sudo systemctl restart jenkins

# View Jenkins logs
sudo journalctl -u jenkins -f

# Check Jenkins home directory
ls -la /var/lib/jenkins/
```

## Important Notes

- **Default Jenkins Port**: 8080
- **Jenkins Home Directory**: `/var/lib/jenkins/`
- **Configuration File**: `/var/lib/jenkins/jenkins.model.JenkinsLocationConfiguration.xml`
- **Initial Admin Password**: `/var/lib/jenkins/secrets/initialAdminPassword`

## Quick Reference: OS-Specific Commands

| Task            | Amazon Linux                 | Ubuntu                       |
| --------------- | ---------------------------- | ---------------------------- |
| Update packages | `sudo yum update -y`         | `sudo apt update`            |
| Install package | `sudo dnf install <package>` | `sudo apt install <package>` |
| Java package    | `java-21-amazon-corretto`    | `openjdk-21-jdk`             |
| SSH user        | `ec2-user`                   | `ubuntu`                     |

## Production Best Practices

- **Use Elastic IP**: Attach an Elastic IP to your instance to avoid IP changes
- **Regular Backups**: Backup `/var/lib/jenkins/` directory regularly
- **SSL Certificate**: Set up HTTPS using nginx/Apache as reverse proxy
- **Authentication**: Enable security realm and authorization strategy
- **Resource Monitoring**: Monitor CPU, memory, and disk usage
- **Update Regularly**: Keep Jenkins and plugins updated for security patches

## Troubleshooting

**Jenkins won't start**

- Check if Java is installed: `java -version`
- Check Jenkins logs: `sudo journalctl -u jenkins -f`
- Verify port 8080 is not in use: `sudo netstat -tulpn | grep 8080`

**Can't access Jenkins UI**

- Verify security group allows port 8080
- Check if Jenkins service is running: `sudo systemctl status jenkins`
- Try accessing with correct public IP

**Slow performance**

- Check disk space: `df -h`
- Monitor system resources: `top` or `htop`
- Consider upgrading to t2.large or larger instance

**Forgot admin password**

- Disable security temporarily to reset password
- Edit `/var/lib/jenkins/config.xml`
- Or reinstall Jenkins (backup data first!)

**Installation Issues on Ubuntu**

- If you get "package not found" errors, ensure you've run `sudo apt update` after adding the Jenkins repository
- For Java installation issues, try `sudo apt install default-jdk` as an alternative

## License

This setup guide is provided as-is for educational purposes.

---

**Author**: Vaibhav Jamdhade  
**Date**: October 2025
