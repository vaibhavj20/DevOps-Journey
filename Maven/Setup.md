# Calculator Web Application with Maven & Tomcat

A simple calculator web application built using Java Servlets, JSP, Maven, and deployed on Apache Tomcat server on AWS EC2.

## 🚀 Features

- Addition, Subtraction, Multiplication, and Division operations
- Beautiful gradient UI design
- Error handling for division by zero
- Responsive design
- Deployed on AWS EC2 with Amazon Linux

## 📋 Prerequisites

- AWS Account
- SSH Key Pair (`.pem` file)
- Basic knowledge of terminal commands

## 🛠️ Technology Stack

- **Java**: JDK 21 (Amazon Corretto)
- **Build Tool**: Apache Maven
- **Server**: Apache Tomcat 10.1.47
- **Frontend**: JSP, HTML, CSS
- **Backend**: Java Servlets (Jakarta EE)

## 📦 Project Structure

```
calculator-app/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── CalculatorServlet.java
│   │   └── webapp/
│   │       ├── WEB-INF/
│   │       └── index.jsp
├── pom.xml
└── target/
    └── calculator-app-1.0.war
```

## 🔧 Installation & Deployment Guide

### Step 1: Create EC2 Instance

1. Login to **AWS Console** → Go to **EC2 Dashboard**
2. Click **Launch Instance**
3. Configure:
   - **Name**: mvn-machine
   - **AMI**: Amazon Linux 2023 AMI
   - **Instance Type**: t2.small
   - **Key Pair**: Select your `.pem` key
   - **Security Group**:
     - Allow SSH (port 22)
     - Allow Custom TCP (port 8080)
4. Launch the instance and copy the **Public IP**

### Step 2: Configure Security Group

1. Go to **EC2** → **Security Groups**
2. Select your instance's security group
3. Click **Edit inbound rules** → **Add rule**
   - **Type**: Custom TCP
   - **Port**: 8080
   - **Source**: 0.0.0.0/0
4. Save rules

### Step 3: Connect to EC2

```bash
ssh -i .\OneDrive\My-AWS-Keys\AWSOPEN.pem ec2-user@YOUR_PUBLIC_IP
```

Type `yes` when prompted.

### Step 4: Change Hostname

```bash
sudo hostnamectl set-hostname mvn-machine
exit
```

### Step 5: Reconnect to EC2

```bash
ssh -i .\OneDrive\My-AWS-Keys\AWSOPEN.pem ec2-user@YOUR_PUBLIC_IP
```

### Step 6: Install Required Software

```bash
# Update system
sudo dnf update -y

# Install Java JDK 21
sudo dnf install java-21-amazon-corretto -y
java -version

# Install Maven
sudo dnf install maven -y
mvn -version
```

### Step 7: Install Apache Tomcat

```bash
# Download Tomcat 10.1.47
wget https://dlcdn.apache.org/tomcat/tomcat-10/v10.1.47/bin/apache-tomcat-10.1.47.tar.gz

# Extract
tar -xvf apache-tomcat-10.1.47.tar.gz

# Move to /opt directory
sudo mv apache-tomcat-10.1.47 /opt/tomcat

# Start Tomcat
/opt/tomcat/bin/startup.sh
```

**Verify**: Open browser → `http://YOUR_PUBLIC_IP:8080`

### Step 8: Create Maven Project

```bash
mvn archetype:generate \
  -DgroupId=com.example \
  -DartifactId=calculator-app \
  -DarchetypeArtifactId=maven-archetype-webapp \
  -DinteractiveMode=false

cd calculator-app
```

### Step 9: Configure pom.xml

```bash
nano pom.xml
```

**Replace with:**

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>calculator-app</artifactId>
    <version>1.0</version>
    <packaging>war</packaging>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.0.0</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.3.2</version>
                <configuration>
                    <failOnMissingWebXml>false</failOnMissingWebXml>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

Save: `Ctrl+X` → `Y` → `Enter`

### Step 10: Create Servlet

```bash
mkdir -p src/main/java/com/example
nano src/main/java/com/example/CalculatorServlet.java
```

**Add:**

```java
package com.example;

import java.io.IOException;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/calculate")
public class CalculatorServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String num1Str = req.getParameter("num1");
        String num2Str = req.getParameter("num2");
        String operation = req.getParameter("operation");

        double result = 0;
        String error = null;

        try {
            double num1 = Double.parseDouble(num1Str);
            double num2 = Double.parseDouble(num2Str);

            switch(operation) {
                case "add":
                    result = num1 + num2;
                    break;
                case "subtract":
                    result = num1 - num2;
                    break;
                case "multiply":
                    result = num1 * num2;
                    break;
                case "divide":
                    if(num2 == 0) {
                        error = "Cannot divide by zero!";
                    } else {
                        result = num1 / num2;
                    }
                    break;
            }
        } catch(NumberFormatException e) {
            error = "Please enter valid numbers!";
        }

        resp.setContentType("text/html");
        resp.getWriter().write("<!DOCTYPE html><html><head><title>Result</title>");
        resp.getWriter().write("<style>body{font-family:Arial;text-align:center;padding:50px;background:#f0f0f0;}");
        resp.getWriter().write(".result{background:white;padding:30px;border-radius:10px;display:inline-block;box-shadow:0 2px 10px rgba(0,0,0,0.1);}");
        resp.getWriter().write("h2{color:#333;}a{color:#007bff;text-decoration:none;}</style></head><body>");
        resp.getWriter().write("<div class='result'>");

        if(error != null) {
            resp.getWriter().write("<h2 style='color:red;'>" + error + "</h2>");
        } else {
            resp.getWriter().write("<h2>Result: " + result + "</h2>");
        }

        resp.getWriter().write("<br><a href='index.jsp'>Calculate Again</a></div></body></html>");
    }
}
```

Save: `Ctrl+X` → `Y` → `Enter`

### Step 11: Create JSP Frontend

```bash
nano src/main/webapp/index.jsp
```

**Replace with:**

```jsp
<!DOCTYPE html>
<html>
<head>
    <title>Simple Calculator</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .calculator {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            width: 350px;
        }
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        input[type="number"] {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
        }
        select {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            background: white;
        }
        button {
            width: 100%;
            padding: 15px;
            margin-top: 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.3s;
        }
        button:hover {
            background: #5568d3;
        }
        label {
            color: #555;
            font-weight: bold;
            display: block;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="calculator">
        <h1>Calculator</h1>
        <form action="calculate" method="post">
            <label>First Number:</label>
            <input type="number" name="num1" step="any" required>

            <label>Second Number:</label>
            <input type="number" name="num2" step="any" required>

            <label>Operation:</label>
            <select name="operation" required>
                <option value="add">Addition (+)</option>
                <option value="subtract">Subtraction (-)</option>
                <option value="multiply">Multiplication (×)</option>
                <option value="divide">Division (÷)</option>
            </select>

            <button type="submit">Calculate</button>
        </form>
    </div>
</body>
</html>
```

Save: `Ctrl+X` → `Y` → `Enter`

### Step 12: Build the Application

```bash
mvn clean
mvn package
```

Verify: `ls target/` should show `calculator-app-1.0.war`

### Step 13: Deploy to Tomcat

```bash
sudo cp target/calculator-app-1.0.war /opt/tomcat/webapps/
sudo /opt/tomcat/bin/shutdown.sh
sudo /opt/tomcat/bin/startup.sh
```

## 🌐 Access the Application

Open your browser and navigate to:

```
http://YOUR_PUBLIC_IP:8080/calculator-app-1.0/
```

---

**Made with ❤️ using Java, Maven & Tomcat**
