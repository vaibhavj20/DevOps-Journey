# Jenkins CI/CD Pipeline with GitHub Webhook

A complete guide to set up automated deployment pipeline where GitHub code automatically deploys to an Apache web server through Jenkins using webhooks.

> **Prerequisites**: This guide assumes you already have Jenkins installed and running. If not, follow the [Jenkins Installation Guide](link-to-master-guide) first.

## How This CI/CD Pipeline Works

This setup creates an automated deployment workflow:

1. **Developer pushes code** to GitHub repository
2. **GitHub webhook triggers** Jenkins automatically
3. **Jenkins clones** the repository from GitHub
4. **Jenkins packages** the code (HTML, CSS, JS files)
5. **Jenkins deploys** files to Apache web server via SSH
6. **Application server** serves the updated website instantly

**Flow**: GitHub → Webhook → Jenkins → SSH Transfer → Apache Server → Live Website

## Architecture Overview

We'll create two EC2 instances:

- **Jenkins Server**: Already installed and running (from master guide)
- **Application Server**: Apache web server that will host your website

## What You Need

- AWS Account with running Jenkins instance
- GitHub Account
- SSH key pair (same one used for Jenkins)
- Basic understanding of Linux commands

---

# Step 1: Setup GitHub Repository

1. Go to GitHub and create a new repository
2. Configure:
   - **Repository name**: `my-website` (or any name)
   - **Visibility**: Public
3. Click **Create repository**

Keep this repository open - we'll use it later!

---

# Step 2: Launch Application Server

1. Go to AWS Console → EC2 → Launch Instances
2. Configure:
   - **Name**: `application`
   - **AMI**: Amazon Linux 2023 OR Ubuntu 22.04/24.04 LTS
   - **Instance Type**: t2.micro
   - **Storage**: 8 GB (default)
   - **Key Pair**: Same key pair as Jenkins
3. Click **Launch Instance**

---

# Step 3: Install Git on Jenkins Server

Jenkins needs Git to clone repositories from GitHub.

## Connect to Jenkins Server

### For Amazon Linux

```bash
ssh -i path/to/AWSOPEN.pem ec2-user@<jenkins-public-ip>
```

### For Ubuntu

```bash
ssh -i path/to/AWSOPEN.pem ubuntu@<jenkins-public-ip>
```

## Install Git

### On Amazon Linux Jenkins

```bash
sudo yum install git -y
```

### On Ubuntu Jenkins

```bash
sudo apt update
sudo apt install git -y
```

### Verify Installation

```bash
git --version
```

---

# Step 4: Setup Application Server

Open a new terminal and connect to the application server.

Choose the appropriate section based on your Application Server OS:

---

## Option A: Amazon Linux Application Server

### Connect to Instance

```bash
ssh -i path/to/AWSOPEN.pem ec2-user@<application-public-ip>
```

### Set Hostname

```bash
sudo hostnamectl set-hostname application
exit
```

Reconnect to see the updated hostname.

### Install Apache Web Server

```bash
# Install Apache HTTP Server
sudo yum install httpd -y
```

### Configure Directory Permissions

By default, Apache's web directory `/var/www/html` is owned by `root`. We need to change ownership to `ec2-user` so Jenkins can transfer files via SSH.

**Why change ownership to ec2-user?**

- Jenkins connects via SSH as `ec2-user` (not root)
- Root SSH access is disabled by default for security
- Allows Jenkins to write files without sudo permissions

```bash
# Navigate to Apache directory
cd /var/www/

# Check current ownership
ls -la
# You'll see: drwxr-xr-x root root html

# Change ownership to ec2-user
sudo chown -R ec2-user:ec2-user /var/www/html

# Verify ownership changed
ls -la
# You'll now see: drwxr-xr-x ec2-user ec2-user html
```

### Start Apache Service

```bash
# Enable and start Apache
sudo systemctl enable --now httpd

# Verify Apache is running
sudo systemctl status httpd
```

### Configure Security Group

Add inbound rule to Application Server:

- **Type**: HTTP
- **Port**: 80
- **Source**: 0.0.0.0/0

### Test Apache

Open browser and navigate to:

```
http://<application-public-ip>
```

You should see the default Apache page: **"It Works!"** or **"Test Page"**

---

## Option B: Ubuntu Application Server

### Connect to Instance

```bash
ssh -i path/to/AWSOPEN.pem ubuntu@<application-public-ip>
```

### Set Hostname

```bash
sudo hostnamectl set-hostname application
exit
```

Reconnect to see the updated hostname.

### Install Apache Web Server

```bash
# Update packages
sudo apt update

# Install Apache HTTP Server
sudo apt install apache2 -y
```

### Configure Directory Permissions

By default, Apache's web directory `/var/www/html` is owned by `root`. We need to change ownership to `ubuntu` so Jenkins can transfer files via SSH.

**Why change ownership to ubuntu?**

- Jenkins connects via SSH as `ubuntu` (not root)
- Root SSH access is disabled by default for security
- Allows Jenkins to write files without sudo permissions

```bash
# Navigate to Apache directory
cd /var/www/

# Check current ownership
ls -la
# You'll see: drwxr-xr-x root root html

# Change ownership to ubuntu
sudo chown -R ubuntu:ubuntu /var/www/html

# Verify ownership changed
ls -la
# You'll now see: drwxr-xr-x ubuntu ubuntu html
```

### Start Apache Service

```bash
# Enable and start Apache
sudo systemctl enable --now apache2

# Verify Apache is running
sudo systemctl status apache2
```

### Configure Security Group

Add inbound rule to Application Server:

- **Type**: HTTP
- **Port**: 80
- **Source**: 0.0.0.0/0

### Test Apache

Open browser and navigate to:

```
http://<application-public-ip>
```

You should see the default Apache/Ubuntu page.

---

# Step 5: Install Jenkins Plugin

## Install "Publish Over SSH" Plugin

This plugin allows Jenkins to transfer files to the application server via SSH.

1. Go to Jenkins: `http://<jenkins-public-ip>:8080`
2. Navigate to **Dashboard** → **Manage Jenkins** → **Plugins**
3. Click **Available plugins**
4. Search for: `Publish Over SSH`
5. Select the checkbox
6. Click **Install** (at the top)
7. Wait for installation to complete

---

# Step 6: Configure SSH Connection to Application Server

## Add SSH Private Key to Jenkins

1. Go to **Dashboard** → **Manage Jenkins** → **System**
2. Scroll down to **Publish over SSH** section
3. In the **Key** textarea:
   - Open your `.pem` file (e.g., `AWSOPEN.pem`) in a text editor
   - Copy the entire content (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)
   - Paste into the **Key** field

## Add SSH Server Details

Click **Add** under SSH Servers and configure based on your Application Server OS:

### For Amazon Linux Application Server

- **Name**: `application-server` (any meaningful name)
- **Hostname**: `<application-server-public-ip>`
- **Username**: `ec2-user`
- **Remote Directory**: `/var/www/html`

### For Ubuntu Application Server

- **Name**: `application-server` (any meaningful name)
- **Hostname**: `<application-server-public-ip>`
- **Username**: `ubuntu`
- **Remote Directory**: `/var/www/html`

Click **Test Configuration** - you should see **Success**!

Click **Save**

---

# Step 7: Configure GitHub Webhook

Webhooks allow GitHub to automatically notify Jenkins when code is pushed.

## Get Jenkins Webhook URL

Copy your Jenkins URL:

```
http://<jenkins-public-ip>:8080/github-webhook/
```

**Important**: Don't forget the trailing `/` after `github-webhook/`

## Add Webhook to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: `http://<jenkins-public-ip>:8080/github-webhook/`
   - **Content type**: `application/json`
   - **SSL verification**: Disable SSL verification (for testing with HTTP)
   - **Which events**: Just the push event
   - **Active**: ✅ Checked
4. Click **Add webhook**

You'll see a message: "We'll send a ping to test it out" - this is normal. The webhook will show a green checkmark once it successfully connects to Jenkins.

---

# Step 8: Create Jenkins Freestyle Project

## Create New Project

1. Go to **Dashboard** → **New Item**
2. Enter name: `website-deployment` (or any name)
3. Select: **Freestyle project**
4. Click **OK**

## Configure Project

### General Section

✅ Check: **GitHub project**

- **Project url**: Paste your GitHub repository URL (e.g., `https://github.com/username/my-website`)

### Source Code Management

Select: **Git**

- **Repository URL**: Paste your GitHub repository URL with `.git` at the end
  - Example: `https://github.com/username/my-website.git`
- **Branch Specifier**: `*/main` (or `*/master` if your default branch is master)

### Build Triggers

✅ Check: **GitHub hook trigger for GITScm polling**

This enables automatic builds when GitHub webhook triggers.

### Post-build Actions

Click **Add post-build action** → **Send build artifacts over SSH**

Configure:

- **SSH Server**: Select `application-server` (the name you configured earlier)
- **Transfers**:
  - **Source files**: `**/*`
  - **Remove prefix**: (leave empty)
  - **Remote directory**: (leave empty - already set to `/var/www/html` in SSH config)

Click **Save**

---

# Step 9: Create and Push Website Code

Now let's create a simple website and push it to GitHub.

## Create Website Files Locally

Create a folder on your computer with these files:

### index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Awesome Website</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <header>
      <nav>
        <h1>🚀 My Portfolio</h1>
        <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>

    <section id="home" class="hero">
      <div class="hero-content">
        <h2>Welcome to My Website</h2>
        <p>Deployed automatically using Jenkins CI/CD Pipeline!</p>
        <button class="cta-button">Get Started</button>
      </div>
    </section>

    <section id="about" class="about">
      <h2>About This Project</h2>
      <p>
        This website is automatically deployed from GitHub to Apache server
        using Jenkins.
      </p>
      <div class="tech-stack">
        <div class="tech-card">
          <h3>GitHub</h3>
          <p>Version Control</p>
        </div>
        <div class="tech-card">
          <h3>Jenkins</h3>
          <p>CI/CD Automation</p>
        </div>
        <div class="tech-card">
          <h3>Apache</h3>
          <p>Web Server</p>
        </div>
      </div>
    </section>

    <section id="projects" class="projects">
      <h2>My Projects</h2>
      <div class="project-grid">
        <div class="project-card">
          <h3>Project 1</h3>
          <p>Automated CI/CD Pipeline with Jenkins</p>
        </div>
        <div class="project-card">
          <h3>Project 2</h3>
          <p>Cloud Infrastructure on AWS</p>
        </div>
        <div class="project-card">
          <h3>Project 3</h3>
          <p>Docker Containerization</p>
        </div>
      </div>
    </section>

    <footer id="contact">
      <p>Built with ❤️ using Jenkins CI/CD</p>
      <p>Automated Deployment Demo</p>
    </footer>
  </body>
</html>
```

### style.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

nav h1 {
  font-size: 1.8rem;
}

nav ul {
  display: flex;
  list-style: none;
  gap: 2rem;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

nav a:hover {
  opacity: 0.8;
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  margin-top: 60px;
}

.hero-content h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.3rem;
  margin-bottom: 2rem;
}

.cta-button {
  background: white;
  color: #667eea;
  padding: 1rem 2rem;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.about,
.projects {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.about h2,
.projects h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #667eea;
}

.tech-stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.tech-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  transition: transform 0.3s;
}

.tech-card:hover {
  transform: translateY(-10px);
}

.tech-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.project-card {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  transition: transform 0.3s, box-shadow 0.3s;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.project-card h3 {
  color: #667eea;
  margin-bottom: 0.5rem;
}

footer {
  background: #2d3748;
  color: white;
  text-align: center;
  padding: 2rem;
  margin-top: 4rem;
}

@media (max-width: 768px) {
  nav {
    flex-direction: column;
    gap: 1rem;
  }

  nav ul {
    flex-direction: column;
    gap: 0.5rem;
  }

  .hero-content h2 {
    font-size: 2rem;
  }

  .tech-stack,
  .project-grid {
    grid-template-columns: 1fr;
  }
}
```

## Push Code to GitHub

Open terminal in your project folder and run:

```bash
# Initialize git repository
git init

# Add files
git add .

# Commit
git commit -m "Initial website deployment"

# Add remote repository (replace with your GitHub URL)
git remote add origin https://github.com/username/my-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

# Step 10: Test the CI/CD Pipeline

## Automatic Deployment

Once you push code to GitHub:

1. **GitHub webhook** triggers Jenkins automatically
2. Go to Jenkins Dashboard: `http://<jenkins-public-ip>:8080`
3. You'll see your project building (blue progress bar or building icon)
4. Click on the build number (e.g., `#1`)
5. Click **Console Output** to see real-time logs
6. Wait for **"Finished: SUCCESS"** message

## View Your Website

Open browser:

```
http://<application-public-ip>
```

You should see your beautiful deployed website! 🎉

## Test Automatic Updates

Make a change to your code locally:

```bash
# Edit index.html - change the heading
nano index.html
# Change "Welcome to My Website" to "Welcome to My UPDATED Website"

# Commit and push
git add .
git commit -m "Update website heading"
git push
```

Watch Jenkins automatically build and deploy! Refresh your browser to see the changes within seconds.

---

# Quick Reference: OS-Specific Details

| Component                 | Amazon Linux                | Ubuntu                        |
| ------------------------- | --------------------------- | ----------------------------- |
| **Jenkins SSH User**      | `ec2-user`                  | `ubuntu`                      |
| **Application SSH User**  | `ec2-user`                  | `ubuntu`                      |
| **Install Git (Jenkins)** | `sudo yum install git -y`   | `sudo apt install git -y`     |
| **Install Apache**        | `sudo yum install httpd -y` | `sudo apt install apache2 -y` |
| **Apache Service Name**   | `httpd`                     | `apache2`                     |
| **Directory Owner**       | `ec2-user:ec2-user`         | `ubuntu:ubuntu`               |
| **Web Root**              | `/var/www/html`             | `/var/www/html`               |

---

# How the Complete Pipeline Works

1. **Developer Workflow**:

   - Write code locally
   - Push to GitHub repository (`git push`)

2. **GitHub Webhook**:

   - Detects push event immediately
   - Sends HTTP POST to Jenkins webhook URL

3. **Jenkins Automation**:

   - Receives webhook trigger
   - Clones latest code from GitHub
   - Packages all files (`**/*`)

4. **SSH Transfer** (via Publish Over SSH):

   - Jenkins connects to Application Server
   - Transfers files to `/var/www/html`
   - Uses private key authentication

5. **Apache Server**:
   - Automatically serves updated files
   - No restart needed
   - Website updates instantly

**Result**: Push code → Auto deploy → Live in seconds! 🚀

---

# Troubleshooting

### Jenkins build fails with "Permission denied"

**Solution for Amazon Linux**:

```bash
sudo chown -R ec2-user:ec2-user /var/www/html
```

**Solution for Ubuntu**:

```bash
sudo chown -R ubuntu:ubuntu /var/www/html
```

### Webhook not triggering Jenkins

- Verify webhook URL ends with `/github-webhook/`
- Check Jenkins security group allows port 8080
- Review GitHub webhook delivery logs (Settings → Webhooks → Recent Deliveries)
- Ensure webhook payload URL uses HTTP (not HTTPS) if you don't have SSL

### SSH Test Configuration fails

- Verify Application Server security group allows SSH (port 22) from Jenkins
- Check correct username (`ec2-user` for Amazon Linux, `ubuntu` for Ubuntu)
- Ensure private key is copied correctly (including BEGIN/END lines)
- Verify Application Server is running

### Files not transferring to application server

- Check SSH connection works: `ssh -i key.pem user@app-server-ip`
- Verify `/var/www/html` has correct ownership
- Check Jenkins Console Output for detailed error messages
- Test SSH configuration in Jenkins System settings

### Website shows 403 Forbidden (Ubuntu only)

Ubuntu's Apache has stricter default permissions:

```bash
sudo chmod -R 755 /var/www/html
```

### Website not updating after push

- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check Apache is running:
  - Amazon Linux: `sudo systemctl status httpd`
  - Ubuntu: `sudo systemctl status apache2`
- Verify files transferred: `ls -la /var/www/html`
- Check Jenkins build succeeded (green checkmark)

### Apache won't start

**Amazon Linux**:

```bash
sudo systemctl restart httpd
sudo journalctl -u httpd -n 50
```

**Ubuntu**:

```bash
sudo systemctl restart apache2
sudo journalctl -u apache2 -n 50
```

---

# Important Notes

## Jenkins Details

- **Jenkins URL**: `http://<jenkins-public-ip>:8080`
- **Webhook URL**: `http://<jenkins-public-ip>:8080/github-webhook/`
- **Jenkins Home**: `/var/lib/jenkins/`

## Application Server Details

- **Application URL**: `http://<application-public-ip>`
- **Web Root**: `/var/www/html`
- **Apache Service**: `httpd` (Amazon Linux) or `apache2` (Ubuntu)

## Security Group Requirements

- **Jenkins**: Port 8080 (HTTP), Port 22 (SSH)
- **Application**: Port 80 (HTTP), Port 22 (SSH from Jenkins)

---

# Production Best Practices

- ✅ **Use Elastic IP**: Attach Elastic IPs to avoid IP changes
- ✅ **HTTPS Setup**: Configure SSL/TLS with Let's Encrypt
- ✅ **Restrict Access**: Limit security groups to specific IPs
- ✅ **Backup Strategy**: Regularly backup `/var/lib/jenkins/`
- ✅ **Secret Management**: Use Jenkins credentials for sensitive data
- ✅ **Branch Protection**: Use separate branches for dev/staging/production
- ✅ **Testing**: Add automated tests before deployment
- ✅ **Monitoring**: Set up CloudWatch or logging for both servers
- ✅ **Updates**: Keep Jenkins, plugins, and OS packages updated

---

# What You've Built

✅ Complete automated CI/CD pipeline
✅ GitHub webhook integration
✅ Automated deployment to Apache web server
✅ Beautiful responsive website
✅ Zero-downtime deployment workflow
✅ Production-ready DevOps setup

Every time you push code to GitHub, your website updates automatically within seconds - just like Netflix, Amazon, and other tech companies! 🚀

---

**Author**: Vaibhav Jamdhade  
**Date**: October 2025
