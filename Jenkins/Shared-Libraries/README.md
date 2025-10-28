# Jenkins Shared Libraries - Complete Setup Guide

A comprehensive guide to create and use Jenkins Shared Libraries for reusable pipeline code across multiple projects.

> **Prerequisites**: This guide assumes you already have Jenkins Master and Agent configured. If not, complete the [Jenkins Master Setup](../Setup.md) first.

## What are Jenkins Shared Libraries?

Jenkins Shared Libraries allow you to write reusable Groovy code that can be shared across multiple pipelines. Instead of copying the same code in every pipeline, you write it once and call it from any pipeline!

**Benefits**:

- ✅ **Reusability**: Write once, use everywhere
- ✅ **Maintainability**: Update code in one place
- ✅ **Consistency**: Standardize pipeline behavior across teams
- ✅ **Clean Pipelines**: Keep pipeline code simple and readable

---

## How Shared Libraries Work

```
GitHub Repository (Shared Library)
    ├── vars/
    │   ├── hello.groovy
    │   └── printmsg.groovy
    │
    ↓ (Configured in Jenkins)

Jenkins Master (loads library)
    ↓
Pipeline uses library functions
    ↓
Functions execute on Jenkins Agent
```

---

## Step 1: Create GitHub Repository for Shared Library

### Create New Repository

1. Go to [GitHub](https://github.com) and login
2. Click **New Repository** (green button)
3. Configure:
   - **Repository name**: `jenkins-shared-library` (or any name)
   - **Description**: `Jenkins Shared Library for reusable pipeline code`
   - **Visibility**: Public (or Private if you have credentials)
4. ✅ Check **Add a README file**
5. Click **Create repository**

---

## Step 2: Create Shared Library Structure

### Clone Repository Locally

```bash
# Clone your repository
git clone https://github.com/your-username/jenkins-shared-library.git
cd jenkins-shared-library
```

### Create Required Folder Structure

```bash
# Create vars directory (required name!)
mkdir vars

# Create Groovy files
touch vars/hello.groovy
touch vars/printmsg.groovy
```

**Important**: The folder MUST be named `vars` - Jenkins looks for this specific folder name!

### Final Structure

```
jenkins-shared-library/
├── README.md
└── vars/
    ├── hello.groovy
    └── printmsg.groovy
```

---

## Step 3: Write Shared Library Functions

### Create hello.groovy

Open `vars/hello.groovy` and add:

```groovy
// vars/hello.groovy

def call() {
    echo "Hello friends! Welcome from GitHub 🎉"
}
```

**What it does**: A simple function that prints a welcome message

### Create printmsg.groovy

Open `vars/printmsg.groovy` and add:

```groovy
// vars/printmsg.groovy

def call(String name = "Vaibhav", int times = 1) {
    for (int i = 0; i < times; i++) {
        echo "👋 Hello, ${name}! This is message #${i + 1}"
    }
}
```

**What it does**: Prints a personalized greeting message multiple times

- **Parameters**:
  - `name`: The person's name (default: "Vaibhav")
  - `times`: How many times to print (default: 1)

---

## Step 4: Push Code to GitHub

```bash
# Add files
git add .

# Commit
git commit -m "Add hello and printmsg shared library functions"

# Push to GitHub
git push origin main
```

Verify on GitHub that you see:

- `vars/hello.groovy`
- `vars/printmsg.groovy`

---

## Step 5: Configure Shared Library in Jenkins

### Access Jenkins Configuration

1. Go to Jenkins: `http://<jenkins-master-ip>:8080`
2. Navigate: **Dashboard** → **Manage Jenkins** → **System**
3. Scroll down to **Global Trusted Pipeline Libraries** section

### Add New Library

1. Click **Add** button (under Global Pipeline Libraries)

2. Fill in the configuration:

   **Library Configuration**:

   - **Name**: `Shared` ⚠️ **Must be exactly this!** (used in pipeline code)
   - **Default version**: `main` (or `master` if your default branch is master)
   - **Load implicitly**: ❌ Leave unchecked
   - **Allow default version to be overridden**: ✅ Check this
   - **Include @Library changes in job recent changes**: ✅ Check this

   **Retrieval Method**:

   - Select: **Modern SCM**
   - **Source Code Management**: Select **Git**

   **Git Configuration**:

   - **Project Repository**: `https://github.com/your-username/jenkins-shared-library.git`
     - Replace `your-username` with your actual GitHub username
     - Example: `https://github.com/vaibhavj20/jenkins-shared-library.git`

   **Credentials**:

   - **For Public Repository**: Select **- none -** (no credentials needed)
   - **For Private Repository**: Click **Add** and create GitHub credentials (see below)

3. Click **Save** at the bottom

### If Using Private Repository (Optional)

If your repository is private, you need to add GitHub credentials:

1. In the **Credentials** dropdown, click **Add** → **Jenkins**
2. Configure:
   - **Kind**: `Username with password`
   - **Scope**: `Global`
   - **Username**: Your GitHub username
   - **Password**: Your GitHub Personal Access Token (not your GitHub password!)
   - **ID**: `github-credentials`
   - **Description**: `GitHub Credentials for Shared Library`
3. Click **Add**
4. Select the newly created credential from dropdown

**How to generate GitHub Personal Access Token**:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token immediately!

---

## Step 6: Create Pipeline Using Shared Library

### Create New Pipeline

1. Go to **Dashboard** → **New Item**
2. Configure:
   - **Enter an item name**: `shared-library-demo`
   - **Select**: **Pipeline**
   - Click **OK**

### Add Pipeline Script

In the **Pipeline** section, paste this code:

```groovy
@Library("Shared") _

pipeline {
    agent { label "agent1" }

    stages {
        stage("Hello") {
            steps {
                script {
                    hello()
                }
            }
        }

        stage("Printing greet messages") {
            steps {
                script {
                    printmsg("Vaibhav", 5)
                }
            }
        }
    }
}
```

Click **Save**

---

## Pipeline Code Explanation

### Import Library

```groovy
@Library("Shared") _
```

**What it does**:

- `@Library("Shared")`: Loads the library named "Shared" from Jenkins configuration
- `_`: Underscore is required - it's a Groovy convention for library imports
- Must be at the very top of the pipeline, before `pipeline` block

### Stage 1: Hello

```groovy
stage("Hello") {
    steps {
        script {
            hello()
        }
    }
}
```

**What it does**:

- Calls the `hello()` function from `vars/hello.groovy`
- Prints: "Hello friends! Welcome from GitHub 🎉"

### Stage 2: Printing greet messages

```groovy
stage("Printing greet messages") {
    steps {
        script {
            printmsg("Vaibhav", 5)
        }
    }
}
```

**What it does**:

- Calls `printmsg()` function from `vars/printmsg.groovy`
- Passes parameters: name="Vaibhav", times=5
- Prints greeting message 5 times

---

## Step 7: Run the Pipeline

### Execute Pipeline

1. Go to your pipeline: `shared-library-demo`
2. Click **Build Now**
3. Watch the build progress
4. Click on build number (e.g., `#1`)
5. Click **Console Output**

### Expected Output

```
Started by user admin
Running on agent1

[Pipeline] stage (Hello)
[Pipeline] { (Hello)
[Pipeline] script
[Pipeline] {
Hello friends! Welcome from GitHub 🎉
[Pipeline] }
[Pipeline] }

[Pipeline] stage (Printing greet messages)
[Pipeline] { (Printing greet messages)
[Pipeline] script
[Pipeline] {
👋 Hello, Vaibhav! This is message #1
👋 Hello, Vaibhav! This is message #2
👋 Hello, Vaibhav! This is message #3
👋 Hello, Vaibhav! This is message #4
👋 Hello, Vaibhav! This is message #5
[Pipeline] }
[Pipeline] }

Finished: SUCCESS
```

🎉 **Success!** Your shared library is working!

---

## Testing Different Parameters

### Test with Different Name

```groovy
stage("Custom Greeting") {
    steps {
        script {
            printmsg("Alice", 3)
        }
    }
}
```

**Output**:

```
👋 Hello, Alice! This is message #1
👋 Hello, Alice! This is message #2
👋 Hello, Alice! This is message #3
```

### Test with Default Values

```groovy
stage("Default Greeting") {
    steps {
        script {
            printmsg()  // Uses defaults: name="Vaibhav", times=1
        }
    }
}
```

**Output**:

```
👋 Hello, Vaibhav! This is message #1
```

---

## Advanced Shared Library Functions

### Example 1: Docker Build Function

Create `vars/dockerBuild.groovy`:

```groovy
// vars/dockerBuild.groovy

def call(String imageName, String tag = "latest") {
    echo "Building Docker image: ${imageName}:${tag}"
    sh "docker build -t ${imageName}:${tag} ."
    echo "Docker image built successfully!"
}
```

**Usage in Pipeline**:

```groovy
stage("Build") {
    steps {
        script {
            dockerBuild("my-app", "v1.0")
        }
    }
}
```

### Example 2: Git Clone Function

Create `vars/gitClone.groovy`:

```groovy
// vars/gitClone.groovy

def call(String repoUrl, String branch = "main") {
    echo "Cloning repository: ${repoUrl}"
    echo "Branch: ${branch}"
    git url: repoUrl, branch: branch
    echo "Repository cloned successfully!"
}
```

**Usage in Pipeline**:

```groovy
stage("Code") {
    steps {
        script {
            gitClone("https://github.com/user/repo.git", "develop")
        }
    }
}
```

### Example 3: Send Notification Function

Create `vars/sendNotification.groovy`:

```groovy
// vars/sendNotification.groovy

def call(String status, String message) {
    def emoji = status == "SUCCESS" ? "✅" : "❌"
    echo "${emoji} ${status}: ${message}"
    // Add email, Slack, or other notification logic here
}
```

**Usage in Pipeline**:

```groovy
post {
    success {
        script {
            sendNotification("SUCCESS", "Pipeline completed successfully!")
        }
    }
    failure {
        script {
            sendNotification("FAILURE", "Pipeline failed! Check logs.")
        }
    }
}
```

---

## Update Shared Library

When you add new functions or update existing ones:

### Update Code on GitHub

```bash
# Make changes to vars/*.groovy files

# Commit and push
git add .
git commit -m "Add new function: dockerBuild"
git push origin main
```

### Jenkins Will Automatically Use Latest Code

- Jenkins fetches the library from GitHub on each pipeline run
- No need to reconfigure Jenkins
- New functions are immediately available

### Force Specific Version (Optional)

```groovy
@Library("Shared@v1.0.0") _  // Uses specific tag/branch
```

---

## Troubleshooting

### ❌ Error: "Unable to find library Shared"

**Cause**: Library name mismatch

**Solution**:

- Check Jenkins configuration: **Manage Jenkins** → **System** → **Global Trusted Pipeline Libraries**
- Ensure library name is exactly: `Shared` (case-sensitive!)
- Pipeline code must use: `@Library("Shared") _`

### ❌ Error: "No such property: hello"

**Cause**: Function file not found or wrong folder structure

**Solution**:

- Verify folder is named `vars` (not `var` or anything else)
- Check file exists: `vars/hello.groovy`
- Ensure file is pushed to GitHub: Check repository online

### ❌ Error: "Credentials not found"

**Cause**: Missing GitHub credentials for private repository

**Solution**:

- Add credentials in Jenkins: **Manage Jenkins** → **Credentials**
- Use GitHub Personal Access Token (not password)
- Select credentials in library configuration

### ❌ Error: "Permission denied" when fetching library

**Cause**: Wrong GitHub URL or private repository without credentials

**Solution**:

- Verify repository URL is correct
- For private repos, add GitHub credentials
- For public repos, select "- none -" in credentials

### ❌ Library not updating with new changes

**Cause**: Jenkins might be caching old version

**Solution**:

```groovy
// Specify branch explicitly to force refresh
@Library("Shared@main") _
```

Or restart Jenkins:

```bash
# On Jenkins master
sudo systemctl restart jenkins
```

---

## Best Practices

✅ **Naming Convention**: Use descriptive function names (`dockerBuild`, `sendEmail`, etc.)
✅ **Documentation**: Add comments in `.groovy` files explaining parameters
✅ **Default Values**: Provide sensible defaults for parameters
✅ **Error Handling**: Add try-catch blocks for robust functions
✅ **Versioning**: Use Git tags for stable library versions
✅ **Testing**: Test new functions in a separate pipeline first
✅ **Organization**: Group related functions (Docker functions, Git functions, etc.)

---

## Real-World Use Cases

### Use Case 1: Standardize Docker Workflows

```groovy
// All teams use the same Docker build/push functions
dockerBuild("app-name")
dockerPush("registry.company.com", "app-name")
```

### Use Case 2: Unified Deployment Process

```groovy
// Consistent deployment across projects
deployToKubernetes("app-name", "production")
deployToEC2("app-name", "staging")
```

### Use Case 3: Common Notification System

```groovy
// Send notifications to Slack, Email, etc.
notify("Build completed", "SUCCESS")
notify("Tests passed", "INFO")
```

---

## Folder Structure Explained

```
jenkins-shared-library/          ← GitHub repository
│
├── vars/                         ← Required folder name
│   ├── hello.groovy             ← Function name = file name
│   ├── printmsg.groovy          ← Each file = one function
│   ├── dockerBuild.groovy       ← Add more functions here
│   └── gitClone.groovy
│
├── src/                          ← Optional: for complex classes
│   └── com/
│       └── company/
│           └── Helper.groovy
│
└── resources/                    ← Optional: config files, templates
    └── config.json
```

**Key Points**:

- `vars/` is required - Jenkins looks for this folder
- Each `.groovy` file in `vars/` becomes a callable function
- File name = function name (e.g., `hello.groovy` → `hello()`)
- `src/` and `resources/` are optional for advanced use cases

---

## Quick Reference

### Library Configuration in Jenkins

| Setting             | Value                                                    |
| ------------------- | -------------------------------------------------------- |
| **Name**            | `Shared` (must match `@Library("Shared")`)               |
| **Default version** | `main` or `master`                                       |
| **Repository URL**  | `https://github.com/username/jenkins-shared-library.git` |
| **Credentials**     | `- none -` (public) or GitHub token (private)            |

### Pipeline Import Syntax

```groovy
@Library("Shared") _              // Load library
@Library("Shared@main") _         // Load specific branch
@Library("Shared@v1.0.0") _       // Load specific tag
```

### Function Definition Syntax

```groovy
// vars/functionName.groovy

def call() {
    // Code here
}

def call(String param1, int param2 = 10) {
    // Code with parameters
}
```

---

## What You've Accomplished

✅ Created a GitHub repository for shared library
✅ Defined reusable Groovy functions
✅ Configured global library in Jenkins
✅ Used library functions in pipeline
✅ Learned to pass parameters to functions
✅ Understood shared library structure and best practices

**You can now write code once and use it across all your Jenkins pipelines!** 🚀

---

**Author**: Vaibhav Jamdhade  
**Date**: October 2025  
**Project**: Jenkins Shared Libraries Guide
