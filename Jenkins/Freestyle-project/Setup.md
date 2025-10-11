# Jenkins CI/CD Pipeline with GitHub Webhook

A complete guide to set up automated deployment pipeline where GitHub code automatically deploys to an Apache web server through Jenkins using webhooks.

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

- **Jenkins Server**: Automation server that handles CI/CD pipeline
- **Application Server**: Apache web server that hosts your website

## Prerequisites

- AWS Account
- GitHub Account
- SSH key pair (e.g., `AWSOPEN.pem`)
- Basic understanding of Linux commands

---

# Part 1: Setup GitHub Repository

1. Go to GitHub and create a new repository
2. Configure:
   - **Repository name**: `my-website` (or any name)
   - **Visibility**: Public
3. Click **Create repository**

Keep this repository open - we'll use it later!

---

# Part 2: Launch EC2 Instances

## Create Jenkins Server

1. Go to AWS Console → EC2 → Launch Instances
2. Configure:
   - **Name**: `jenkins`
   - **AMI**: Amazon Linux 2023
   - **Instance Type**: t2.micro
   - **Storage**: 10 GB
   - **Key Pair**: Select your existing key pair
3. Click **Launch Instance**

## Create Application Server

1. Launch another instance with:
   - **Name**: `application`
   - **AMI**: Amazon Linux 2023
   - **Instance Type**: t2.micro
   - **Storage**: 8 GB (default)
   - **Key Pair**: Same key pair as Jenkins
2. Click **Launch Instance**

---

# Part 3: Setup Jenkins Server

## Connect to Jenkins Instance

```bash
ssh -i path/to/AWSOPEN.pem ec2-user@<jenkins-public-ip>
```

### Set Hostname

```bash
sudo hostnamectl set-hostname jenkins
exit
```

Reconnect to see the updated hostname.

### Fix /tmp Space Issue (IMPORTANT!)

Before installing Jenkins, we must allocate more space to `/tmp`:

```bash
# Check current disk usage
df -h

# Temporary fix - allocate 2GB to /tmp
sudo mount -o remount,size=2G /tmp

# Permanent fix - edit fstab
sudo nano /etc/fstab
```

Add this line at the end of the file:

```
tmpfs /tmp tmpfs defaults,noatime,size=2G 0 0
```

Save and exit (Ctrl+X, Y, Enter).

```bash
# Apply changes
sudo mount -o remount /tmp

# Verify 2GB space
df -h
```

### Install Jenkins

```bash
# Update system
sudo yum update -y

# Install Java 21
sudo dnf install java-21-amazon-corretto -y

# Verify Java installation
java -version

# Install wget
sudo yum install wget -y

# Download Jenkins repository
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo

# Import Jenkins GPG key
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# Install Jenkins
sudo dnf install jenkins -y

# Start Jenkins service
sudo systemctl enable --now jenkins
```

### Install Git on Jenkins Server

Jenkins needs Git to clone repositories:

```bash
sudo yum install git -y

# Verify Git installation
git --version
```

### Configure Security Group for Jenkins

Add inbound rule:

- **Type**: Custom TCP
- **Port**: 8080
- **Source**: 0.0.0.0/0

---

# Part 4: Setup Application Server

Open a new terminal tab and connect to the application server.

## Connect to Application Instance

```bash
ssh -i path/to/AWSOPEN.pem ec2-user@<application-public-ip>
```

### Set Hostname

```bash
sudo hostnamectl set-hostname application
exit
```

Reconnect to continue.

### Install Apache Web Server

```bash
# Install Apache HTTP Server
sudo yum install httpd -y
```

### Configure Directory Permissions

By default, Apache's web directory `/var/www/html` is owned by `root`. We need to change ownership to `ec2-user` so Jenkins can transfer files via SSH without root privileges.

**Why change ownership to ec2-user?**

- Jenkins connects via SSH as `ec2-user` (not root)
- Root SSH access is disabled by default for security
- `ec2-user` is the default user on Amazon Linux
- Allows Jenkins to write files without sudo permissions
- Maintains security by not exposing root access

```bash
# Navigate to Apache directory
cd /var/www/

# Check current ownership (before)
ls -la
# You'll see: drwxr-xr-x root root html

# Change ownership to ec2-user
sudo chown -R ec2-user:ec2-user /var/www/html

# Verify ownership changed (after)
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

### Configure Security Group for Application Server

Add inbound rule:

- **Type**: HTTP
- **Port**: 80
- **Source**: 0.0.0.0/0

### Test Apache

Open browser and navigate to:

```
http://<application-public-ip>
```

You should see the default Apache page: **"It Works!"**

---

# Part 5: Configure Jenkins

## Access Jenkins Web Interface

Open browser:

```
http://<jenkins-public-ip>:8080
```

### Unlock Jenkins

1. Copy the red path shown on screen: `/var/lib/jenkins/secrets/initialAdminPassword`
2. In Jenkins terminal, run:

```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

3. Copy the password and paste into browser
4. Click **Continue**

### Install Suggested Plugins

Click **Install suggested plugins** and wait for installation to complete.

### Create Admin User

Set up your admin credentials:

- Username: (your choice)
- Password: (secure password)
- Confirm password
- Full name
- Email

Click **Save and Continue** → **Save and Finish** → **Start using Jenkins**

---

# Part 6: Install Required Jenkins Plugin

## Install "Publish Over SSH" Plugin

This plugin allows Jenkins to transfer files to the application server via SSH.

1. Go to **Dashboard** → **Manage Jenkins** → **Plugins**
2. Click **Available plugins**
3. Search for: `Publish Over SSH`
4. Select the checkbox
5. Click **Install** (at the top)
6. Wait for installation to complete

---

# Part 7: Configure SSH Connection to Application Server

## Add SSH Private Key to Jenkins

1. Go to **Dashboard** → **Manage Jenkins** → **System**
2. Scroll down to **Publish over SSH** section
3. In the **Key** textarea:
   - Open your `.pem` file (e.g., `AWSOPEN.pem`) in Notepad
   - Copy the entire content (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)
   - Paste into the **Key** field

## Add SSH Server Details

Click **Add** under SSH Servers and configure:

- **Name**: `application-server` (any meaningful name)
- **Hostname**: `<application-server-public-ip>`
- **Username**: `ec2-user`
- **Remote Directory**: `/var/www/html`

Click **Test Configuration** - you should see **Success**!

Click **Save**

---

# Part 8: Configure GitHub Webhook

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
   - **SSL verification**: Disable SSL verification (for testing)
   - **Which events**: Just the push event
4. Click **Add webhook**

You'll see: "This hook has not been triggered yet" (this is normal)

---

# Part 9: Create Jenkins Freestyle Project

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
- **Branch Specifier**: `*/main` (not `*/master`)

### Build Triggers

✅ Check: **GitHub hook trigger for GITScm polling**

This enables automatic builds when GitHub webhook triggers.

### Build Environment

✅ Check: **Send files or execute commands over SSH after the build runs**

### Post-build Actions

Click **Add post-build action** → **Send build artifacts over SSH**

Configure:

- **SSH Server**: Select `application-server` (the name you configured earlier)
- **Source files**: `**/*.*` (transfers all files)
- **Remove prefix**: (leave empty)
- **Remote directory**: `/` (uploads to `/var/www/html`)

Click **Save**

---

# Part 10: Add Website Code to GitHub

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
      <p>Built with ❤️ by Vaibhav Jamdhade</p>
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

```bash
# Initialize git repository
git init

# Add files
git add .

# Commit
git commit -m "Initial website deployment"

# Add remote repository
git remote add origin https://github.com/username/my-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

# Part 11: Test the CI/CD Pipeline

## Automatic Deployment

Once you push code to GitHub:

1. **GitHub webhook** triggers Jenkins automatically
2. Go to Jenkins Dashboard
3. You'll see your project building (blue progress bar)
4. Click on the build number (e.g., `#1`)
5. Click **Console Output** to see logs
6. Wait for "Finished: SUCCESS"

## View Your Website

Open browser:

```
http://<application-public-ip>
```

You should see your beautiful deployed website! 🎉

## Test Automatic Updates

Make a change to your code:

```bash
# Edit index.html - change the heading
nano index.html
# Change "Welcome to My Website" to "Welcome to My Updated Website"

# Commit and push
git add .
git commit -m "Update heading"
git push
```

Watch Jenkins automatically build and deploy! Refresh your browser to see the changes.

---

# How the Complete Pipeline Works

1. **Developer Workflow**:

   - You write code locally
   - Push to GitHub repository

2. **GitHub Webhook**:

   - Detects push event
   - Sends notification to Jenkins

3. **Jenkins Automation**:

   - Receives webhook trigger
   - Clones latest code from GitHub
   - Packages all files

4. **SSH Transfer**:

   - Jenkins connects to Application Server via SSH
   - Transfers files to `/var/www/html`

5. **Apache Server**:
   - Automatically serves updated files
   - Website updates instantly

**Result**: Every code push = Automatic deployment = Zero manual work!

---

# Troubleshooting

**Jenkins build fails with "Permission denied"**

- Check ownership of `/var/www/html` on application server
- Ensure `ec2-user` owns the directory

**Webhook not triggering Jenkins**

- Verify webhook URL ends with `/github-webhook/`
- Check Jenkins is accessible from internet
- Review GitHub webhook delivery logs

**Files not transferring to application server**

- Test SSH configuration in Jenkins
- Verify security groups allow SSH (port 22)
- Check application server SSH is running

**Website not updating**

- Clear browser cache (Ctrl+Shift+R)
- Check Apache is running: `sudo systemctl status httpd`
- Verify files are in `/var/www/html`

---

# Important Notes

- **Jenkins URL**: `http://<jenkins-public-ip>:8080`
- **Application URL**: `http://<application-public-ip>`
- **Apache Root Directory**: `/var/www/html`
- **Jenkins Home**: `/var/lib/jenkins/`

## Security Best Practices

- Use Elastic IP for Jenkins to avoid webhook URL changes
- Restrict security groups to specific IPs
- Use HTTPS for production deployments
- Store sensitive data in Jenkins credentials
- Regularly update Jenkins and plugins

---

# What You've Built

✅ Automated CI/CD pipeline with Jenkins
✅ GitHub webhook integration
✅ Automated deployment to Apache server
✅ Beautiful responsive website
✅ Complete DevOps workflow

Every time you push code to GitHub, your website updates automatically - just like real companies do it!

---

**Author**: Vaibhav Jamdhade  
**Date**: October 2025
