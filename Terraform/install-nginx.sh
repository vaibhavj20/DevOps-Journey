#!/bin/bash

# Enable Nginx via amazon-linux-extras
amazon-linux-extras enable nginx1 -y

# Install Nginx
yum install nginx -y

# Start and enable Nginx service
systemctl start nginx
systemctl enable nginx

# Deploy your HTML page
echo "<h1>Deployed via Terraform</h1>" > /usr/share/nginx/html/index.html
