# Jenkins Declarative Pipeline - First CI/CD Job

A concise guide to create your first Jenkins Declarative Pipeline job.

## What is a Declarative Pipeline?

Jenkins Declarative Pipeline allows you to define your CI/CD workflow as code using a simple, structured syntax. Benefits include version control, reusability, and easy maintenance.

## Prerequisites

- Jenkins Master server running on Ubuntu (refer to previous setup guide)
- Admin access to Jenkins dashboard

---

# Step 1: Create New Pipeline Job

1. On Jenkins Dashboard, click **New Item**
2. Enter item name: `My-First-CICD-Pipeline`
3. Select: **Pipeline**
4. Click **OK**

---

# Step 2: Add Description (Optional)

In the Description field:

```
This is my first declarative pipeline that demonstrates multi-stage pipeline execution and directory creation.
```

---

# Step 3: Write Pipeline Script

Scroll down to the **Pipeline** section and paste this script:

```groovy
pipeline {
    agent any

    stages {
        stage("Hello") {
            steps {
                echo "Hello Friends!!"
            }
        }

        stage("Create Folder") {
            steps {
                sh "mkdir -p pipefolder"
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

## Understanding the Script

- **`pipeline`**: Root element that defines the pipeline
- **`agent any`**: Run on any available Jenkins agent/node
- **`stages`**: Container for all pipeline stages
- **`stage`**: Defines a distinct phase in the pipeline
- **`steps`**: Contains the actual commands to execute
- **`echo`**: Prints message to console
- **`sh`**: Executes shell commands on Linux

---

# Step 4: Save and Build

1. Click **Save**
2. Click **Build Now** on the left sidebar
3. Watch the build progress in the **Stage View**

---

# Step 5: View Console Output

1. Click on the build number (e.g., `#1`)
2. Click **Console Output**
3. You'll see the execution logs showing all stages completing successfully

**Expected Output**:

```
[Pipeline] echo
Hello Friends!!
[Pipeline] sh
+ mkdir -p pipefolder
[Pipeline] echo
Goodbye Friends!!
Finished: SUCCESS
```

---

# Step 6: Verify Folder Creation

SSH into your Jenkins server:

```bash
ssh -i path/to/AWSOPEN.pem ubuntu@<jenkins-master-public-ip>
```

Navigate to workspace:

```bash
cd /var/lib/jenkins/workspace/My-First-CICD-Pipeline
ls -la
```

You'll see the `pipefolder` directory created by the pipeline! 🎉

---

# Pipeline Execution Flow

1. Jenkins allocates an agent
2. Creates workspace at `/var/lib/jenkins/workspace/My-First-CICD-Pipeline/`
3. Executes each stage sequentially
4. Creates the folder using shell command
5. Marks build as SUCCESS

---

# Common Pipeline Commands

```groovy
// Print messages
echo "This is a message"

// Execute shell commands
sh "ls -la"
sh "pwd"

// Create files
sh "touch myfile.txt"

// Multiple commands
sh """
    mkdir -p myfolder
    cd myfolder
    touch file.txt
"""
```

---

# Jenkins Built-in Variables

Use these in your pipeline:

```groovy
echo "Build Number: ${BUILD_NUMBER}"
echo "Job Name: ${JOB_NAME}"
echo "Workspace: ${WORKSPACE}"
```

---

# Troubleshooting

**Build fails at "Create Folder" stage**

- Check console output for errors
- Verify Jenkins has write permissions in workspace

**Syntax errors**

- Use Jenkins **Pipeline Syntax** link for help
- Click "Pipeline Syntax" → "Snippet Generator"

**Build stuck**

- Click red ❌ icon to abort
- Restart Jenkins: `sudo systemctl restart jenkins`

---

# What You've Learned

✅ Created a Jenkins Declarative Pipeline
✅ Understood pipeline structure (agent, stages, steps)
✅ Executed shell commands with `sh`
✅ Created directories on Jenkins server
✅ Viewed build results and console output

---

**Author**: Vaibhav Jamdhade  
**Date**: October 2025
