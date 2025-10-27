# Jenkins Docker CI/CD Pipeline with DockerHub

A guide to create a Jenkins pipeline that builds a Docker image from GitHub, pushes it to DockerHub, and deploys the application automatically.

> **Prerequisites**: This guide assumes you already have Jenkins Master and Agent configured. If not, complete the [Jenkins Master Setup](../../Setup.md) and [Jenkins Agent Setup](../../Freestyle-project/Setup.md) first.

## What This Pipeline Does

1. **Clone** code from GitHub repository
2. **Build** Docker image from the application
3. **Push** Docker image to DockerHub
4. **Deploy** container on the Jenkins agent

**Tech Stack**: Jenkins, Docker, DockerHub, GitHub, Django

---

## Pipeline Architecture

```
GitHub Repository (django-notes-app)
      ↓
Jenkins Master (triggers pipeline)
      ↓
Jenkins Agent (executes tasks)
      ↓
Docker Build → Docker Image (notes-app:latest)
      ↓
Push to DockerHub (vaibhavj206/notes-app:latest)
      ↓
Deploy Container on Port 8000
```

---

## Step 1: Install Docker on Jenkins Agent

Connect to your Jenkins Agent server and install Docker.

### For Amazon Linux Agent

```bash
# Connect to agent
ssh -i path/to/AWSOPEN.pem ec2-user@<agent-public-ip>

# Install Docker
sudo yum install docker -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ec2-user to docker group (important!)
sudo usermod -aG docker ec2-user

# Verify installation
docker --version

# Logout and login again for group changes to take effect
exit
```

Then reconnect to your agent.

### For Ubuntu Agent

```bash
# Connect to agent
ssh -i path/to/AWSOPEN.pem ubuntu@<agent-public-ip>

# Install Docker
sudo apt update
sudo apt install docker.io -y

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group (important!)
sudo usermod -aG docker ubuntu

# Verify installation
docker --version

# Logout and login again for group changes to take effect
exit
```

Then reconnect to your agent.

**⚠️ Important**: You must logout and login again after adding user to docker group!

---

## Step 2: Generate DockerHub Access Token

Instead of using your DockerHub password, create a secure access token.

### Create Token on DockerHub

1. Go to [DockerHub](https://hub.docker.com) and login
2. Click on your **profile icon** (top-right) → **Account Settings**
3. Navigate to **Security** tab
4. Scroll to **Personal Access Tokens** section
5. Click **Generate New Token** button

6. Configure token:

   - **Token Description**: `Jenkins Pipeline Token`
   - **Access Permissions**: Select **Read & Write** (or Read, Write, Delete)

7. Click **Generate**

8. **Copy the token immediately!**
   - Format looks like: `dckr_pat_abc123xyz456...`
   - Save it somewhere safe - you won't see it again!

---

## Step 3: Add DockerHub Credentials to Jenkins

### Store Credentials in Jenkins

1. Go to Jenkins: `http://<jenkins-master-ip>:8080`

2. Navigate: **Dashboard** → **Manage Jenkins** → **Credentials**

3. Click: **System** → **Global credentials (unrestricted)**

4. Click: **Add Credentials** (+ button on the right)

5. Fill in the form:

   - **Kind**: `Username with password`
   - **Scope**: `Global (Jenkins, nodes, items, all child items, etc)`
   - **Username**: Your DockerHub username (e.g., `vaibhavj206`)
   - **Password**: Paste the DockerHub access token you generated
   - **ID**: `dockerHubCreds` ⚠️ **Must be exactly this!**
   - **Description**: `DockerHub Credentials for Pipeline`

6. Click **Create**

**Why this ID matters**: The pipeline code uses `credentialsId: "dockerHubCreds"` to reference these credentials. The ID must match exactly!

---

## Step 4: Create Jenkins Pipeline

### Create New Pipeline Project

1. Go to **Dashboard** → **New Item**

2. Configure:

   - **Enter an item name**: `django-notes-app-pipeline`
   - **Select**: **Pipeline**
   - Click **OK**

3. In the configuration page:

   - **Description**: `CI/CD pipeline for Django Notes App with Docker`

4. Scroll to **Pipeline** section:
   - **Definition**: `Pipeline script`
   - **Script**: Paste the complete pipeline code below

---

## Complete Pipeline Code

```groovy
pipeline {
    agent { label "agent1" }

    stages {
        stage("Code") {
            steps {
                echo "Cloning the repository..."
                git url: "https://github.com/vaibhavj20/django-notes-app-jenkins", branch: "main"
                echo "Repository cloned successfully."
            }
        }

        stage("Build") {
            steps {
                echo "Building the Docker image..."
                sh "docker build -t notes-app:latest ."
                echo "Docker image built successfully."
            }
        }

        stage("Push to DockerHub") {
            steps {
                echo "Pushing image to DockerHub..."
                withCredentials([usernamePassword(
                    credentialsId: "dockerHubCreds",
                    usernameVariable: "dockerHubUser",
                    passwordVariable: "dockerHubPass"
                )]) {
                    sh '''
                        echo "$dockerHubPass" | docker login -u "$dockerHubUser" --password-stdin
                        docker tag notes-app:latest ${dockerHubUser}/notes-app:latest
                        docker push ${dockerHubUser}/notes-app:latest
                        docker logout
                    '''
                }
                echo "Image pushed to DockerHub successfully."
            }
        }

        stage("Deploy") {
            steps {
                echo "Deploying the application..."
                sh "docker run -d -p 8000:8000 notes-app:latest"
            }
        }
    }
}
```

5. Click **Save**

---

## Pipeline Stages Explained

### Stage 1: Code (Clone from GitHub)

```groovy
git url: "https://github.com/vaibhavj20/django-notes-app-jenkins", branch: "main"
```

**What happens**: Clones your GitHub repository to Jenkins agent workspace

### Stage 2: Build (Create Docker Image)

```groovy
sh "docker build -t notes-app:latest ."
```

**What happens**:

- Reads `Dockerfile` from repository
- Builds Docker image named `notes-app:latest`
- Packages the Django application with all dependencies

### Stage 3: Push to DockerHub (Upload Image)

```groovy
withCredentials([usernamePassword(...)]) {
    sh '''
        echo "$dockerHubPass" | docker login -u "$dockerHubUser" --password-stdin
        docker tag notes-app:latest ${dockerHubUser}/notes-app:latest
        docker push ${dockerHubUser}/notes-app:latest
        docker logout
    '''
}
```

**What happens**:

1. Securely retrieves DockerHub credentials from Jenkins
2. Logs into DockerHub using access token
3. Tags image: `vaibhavj206/notes-app:latest`
4. Pushes image to your DockerHub repository
5. Logs out for security

**Why `withCredentials`?**

- Credentials are never visible in console logs
- Variables are masked: `****` instead of actual values
- Automatic cleanup after stage completes

### Stage 4: Deploy (Run Container)

```groovy
docker stop notes-app-container 2>/dev/null || true
docker rm notes-app-container 2>/dev/null || true
docker run -d -p 8000:8000 --name notes-app-container notes-app:latest
```

**What happens**:

1. Stops old container (if exists)
2. Removes old container
3. Runs new container on port 8000
4. Runs in background (`-d` flag)

**Why `|| true`?**

- Prevents pipeline failure if container doesn't exist
- `2>/dev/null` hides error messages

---

## Step 5: Configure Security Group

Add inbound rule to **Jenkins Agent** security group:

| Type       | Port | Source    | Description               |
| ---------- | ---- | --------- | ------------------------- |
| Custom TCP | 8000 | 0.0.0.0/0 | Django Application Access |

---

## Step 6: Run the Pipeline

### Execute Pipeline

1. Go to your pipeline: `django-notes-app-pipeline`
2. Click **Build Now** (on the left sidebar)
3. Watch the progress in **Build History** section
4. Click on build number (e.g., `#1`)
5. Click **Console Output** to see live logs

### Expected Console Output

```
Started by user admin
Running on agent1

[Pipeline] stage (Code)
[Code] Cloning the repository...
Cloning into '/home/ec2-user/jenkins-workspace/django-notes-app-pipeline'...
[Code] Repository cloned successfully.

[Pipeline] stage (Build)
[Build] Building the Docker image...
Step 1/8 : FROM python:3.9
Step 2/8 : WORKDIR /app
...
Successfully built abc123def456
Successfully tagged notes-app:latest
[Build] Docker image built successfully.

[Pipeline] stage (Push to DockerHub)
[Push to DockerHub] Pushing image to DockerHub...
Login Succeeded
The push refers to repository [docker.io/vaibhavj206/notes-app]
latest: digest: sha256:abc123... size: 2418
[Push to DockerHub] Image pushed to DockerHub successfully.

[Pipeline] stage (Deploy)
[Deploy] Deploying the application...
notes-app-container
abc123def456789
[Deploy] Application deployed successfully on port 8000.

✅ Pipeline executed successfully!
🌐 Application is running at: http://<agent-ip>:8000

Finished: SUCCESS
```

---

## Step 7: Verify Deployment

### Access Your Application

Open browser and navigate to:

```
http://<jenkins-agent-public-ip>:8000
```

You should see your Django Notes App running! 🎉

### Verify on DockerHub

1. Go to [DockerHub](https://hub.docker.com)
2. Login and go to **Repositories**
3. You should see: `vaibhavj206/notes-app`
4. Click on it to view image details and tags

### Check Container Status (on Agent)

```bash
# SSH to agent
ssh -i key.pem ec2-user@<agent-ip>

# List running containers
docker ps

# You should see:
# CONTAINER ID   IMAGE                  STATUS    PORTS                    NAMES
# abc123def456   notes-app:latest       Up        0.0.0.0:8000->8000/tcp   notes-app-container

# View container logs
docker logs notes-app-container
```

---

## Troubleshooting

### ❌ Error: "Permission denied" connecting to Docker daemon

**Cause**: Jenkins user not in docker group

**Solution**:

```bash
# On Jenkins Agent
sudo usermod -aG docker ec2-user  # Amazon Linux
sudo usermod -aG docker ubuntu     # Ubuntu

# MUST logout and login again!
exit
ssh -i key.pem user@agent-ip
```

### ❌ Error: "Cannot connect to Docker daemon"

**Cause**: Docker service not running

**Solution**:

```bash
sudo systemctl start docker
sudo systemctl status docker
```

### ❌ Error: "Invalid credentials" pushing to DockerHub

**Solutions**:

1. Verify DockerHub username (case-sensitive!)
2. Regenerate access token on DockerHub
3. Update Jenkins credentials with new token
4. Ensure credential ID is exactly: `dockerHubCreds`

### ❌ Error: "Couldn't find any revision to build"

**Cause**: Incorrect GitHub URL or branch name

**Solution**:

- Verify repository URL is correct
- Check branch name: `main` or `master`
- Ensure repository is public or add GitHub credentials

### ❌ Error: Port 8000 already in use

**Solution**:

```bash
# On Jenkins Agent
docker stop notes-app-container
docker rm notes-app-container

# Run pipeline again
```

### ❌ Error: "Agent is offline"

**Solution**:

1. Go to **Manage Jenkins** → **Nodes**
2. Click on your agent (`agent1`)
3. Click **Launch agent** or check connection logs
4. Verify agent security group allows port 50000

---

## Testing the Complete Workflow

### Make a Code Change

1. Clone repository locally:

```bash
git clone https://github.com/vaibhavj20/django-notes-app-jenkins.git
cd django-notes-app-jenkins
```

2. Make a change (e.g., edit `README.md` or any file)

3. Commit and push:

```bash
git add .
git commit -m "Test pipeline trigger"
git push origin main
```

4. Go to Jenkins and click **Build Now**

   - Or set up GitHub webhook for automatic triggers

5. Watch the pipeline execute all stages

6. Refresh browser at `http://<agent-ip>:8000` to see changes!

---

## Useful Commands

### Docker Commands (on Agent)

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container logs
docker logs notes-app-container

# Follow logs in real-time
docker logs -f notes-app-container

# Stop container
docker stop notes-app-container

# Remove container
docker rm notes-app-container

# List images
docker images

# Remove image
docker rmi notes-app:latest

# Access container shell
docker exec -it notes-app-container bash

# Clean up unused resources
docker system prune -f
```

### Jenkins Agent Commands

```bash
# Check if port 8000 is in use
sudo netstat -tulpn | grep 8000

# Check Docker status
sudo systemctl status docker

# View workspace
cd /home/ec2-user/jenkins-workspace/django-notes-app-pipeline
ls -la

# Check disk space
df -h
```

---

## Pipeline Customization

### Change Port Number

To deploy on a different port (e.g., 8080):

```groovy
stage("Deploy") {
    steps {
        sh '''
            docker stop notes-app-container 2>/dev/null || true
            docker rm notes-app-container 2>/dev/null || true
            docker run -d -p 8080:8000 --name notes-app-container notes-app:latest
        '''
    }
}
```

Don't forget to update security group for port 8080!

### Use Different Agent

Change the agent label:

```groovy
pipeline {
    agent { label "agent2" }  // or "docker-agent", etc.
    ...
}
```

### Add Version Tagging

Instead of just `latest`, use version tags:

```groovy
environment {
    VERSION = "v1.0.${BUILD_NUMBER}"
}

stage("Push to DockerHub") {
    steps {
        sh '''
            docker tag notes-app:latest ${dockerHubUser}/notes-app:${VERSION}
            docker tag notes-app:latest ${dockerHubUser}/notes-app:latest
            docker push ${dockerHubUser}/notes-app:${VERSION}
            docker push ${dockerHubUser}/notes-app:latest
        '''
    }
}
```

---

## Best Practices

✅ **Use Access Tokens**: Never use DockerHub password in Jenkins
✅ **Version Tagging**: Use semantic versioning (v1.0.0) for production
✅ **Clean Credentials**: Always logout after docker push
✅ **Error Handling**: Use `|| true` for non-critical commands
✅ **Security Groups**: Restrict access to necessary IPs in production
✅ **Resource Cleanup**: Regularly prune unused Docker images
✅ **Monitoring**: Check container logs regularly
✅ **Backups**: Keep DockerHub images as backups

---

## What You've Accomplished

✅ Automated Docker image building from GitHub
✅ Secure DockerHub integration with access tokens
✅ Automated deployment to Jenkins agent
✅ Complete CI/CD pipeline for containerized applications
✅ Production-ready pipeline architecture

**This is the same workflow used by companies like Netflix, Uber, and Airbnb!** 🚀

---

## Related Documentation

- [Jenkins Master Setup](../Setup.md)
- [Jenkins Agent Configuration](../Labs/Jenkins-Agent/)
- [GitHub Webhook Integration](../Freestyle-project/Setup.md)

---

**Author**: Vaibhav Jamdhade  
**Date**: October 2025  
**Project**: Django Notes App CI/CD Pipeline with Docker
