# Prometheus & Grafana Monitoring Setup on AWS

A complete guide to set up a monitoring stack using Prometheus and Grafana on AWS EC2 instances with Node Exporter for application metrics.

## Architecture Overview

This setup consists of three EC2 instances:

- **Prometheus Server**: Collects and stores metrics
- **Grafana Server**: Visualization and dashboarding
- **Application Server**: Runs Node Exporter agent to expose system metrics

## Prerequisites

- AWS Account
- SSH key pair (e.g., `AWSOPEN.pem`)
- Basic understanding of Linux commands

## Step 1: Launch EC2 Instances

1. Go to AWS Console → EC2 → Launch Instances
2. Configure the following:
   - **Number of instances**: 3
   - **AMI**: Ubuntu
   - **Instance Type**: t2.micro
   - **Key Pair**: Select your existing key pair
3. Click **Launch Instances**
4. Once running, rename the instances:
   - Instance 1: `prometheus`
   - Instance 2: `grafana`
   - Instance 3: `application`

## Step 2: Setup Prometheus Server

### Connect to Prometheus Instance

```bash
ssh -i path/to/AWSOPEN.pem ubuntu@<prometheus-public-ip>
```

### Set Hostname

```bash
sudo hostnamectl set-hostname prometheus
exit
```

Reconnect via SSH.

### Install Prometheus

```bash
# Update system
sudo apt update

# Download Prometheus (visit prometheus.io/download for latest version)
wget https://github.com/prometheus/prometheus/releases/download/v*/prometheus-*-linux-amd64.tar.gz

# Extract the archive
tar -xzvf prometheus-*-linux-amd64.tar.gz

# Move to /opt directory
sudo mv prometheus-*-linux-amd64 /opt/prometheus

# Remove the tar file
rm prometheus-*-linux-amd64.tar.gz
```

### Configure Security Group

Add inbound rule for Prometheus:

- **Port**: 9090
- **Source**: 0.0.0.0/0 (or restrict as needed)

## Step 3: Setup Grafana Server

### Connect to Grafana Instance

```bash
ssh -i path/to/AWSOPEN.pem ubuntu@<grafana-public-ip>
```

### Set Hostname

```bash
sudo hostnamectl set-hostname grafana
exit
```

Reconnect via SSH.

### Install Grafana

```bash
# Update system
sudo apt-get update

# Install dependencies
sudo apt-get install -y adduser libfontconfig1 musl

# Download Grafana (visit grafana.com/grafana/download for latest version)
wget https://dl.grafana.com/enterprise/release/grafana-enterprise_*_amd64.deb

# Install Grafana
sudo dpkg -i grafana-enterprise_*_amd64.deb
```

### Start Grafana Service

```bash
# Enable Grafana to start on boot
sudo systemctl enable grafana-server.service

# Start Grafana service
sudo systemctl start grafana-server.service

# Check status
sudo systemctl status grafana-server.service
```

### Configure Security Group

Add inbound rule for Grafana:

- **Port**: 3000
- **Source**: 0.0.0.0/0 (or restrict as needed)

## Step 4: Setup Application Server with Node Exporter

### Connect to Application Instance

```bash
ssh -i path/to/AWSOPEN.pem ubuntu@<application-public-ip>
```

### Set Hostname

```bash
sudo hostnamectl set-hostname application
exit
```

Reconnect via SSH.

### Install Node Exporter

```bash
# Update system
sudo apt update

# Download Node Exporter (visit prometheus.io/download for latest version)
wget https://github.com/prometheus/node_exporter/releases/download/v*/node_exporter-*-linux-amd64.tar.gz

# Extract the archive
tar -xzvf node_exporter-*-linux-amd64.tar.gz

# Move to /opt directory
sudo mv node_exporter-*-linux-amd64 /opt/node_exporter

# Remove tar file
rm node_exporter-*-linux-amd64.tar.gz
```

### Start Node Exporter

```bash
cd /opt/node_exporter
sudo ./node_exporter
```

Node Exporter will run on port **9100**.

### Configure Security Group

Add inbound rule for Node Exporter on Application Server:

- **Port**: 9100
- **Source**: Security Group of Prometheus Server (recommended) or 0.0.0.0/0

## Step 5: Configure Prometheus to Scrape Metrics

### Edit Prometheus Configuration

On the Prometheus server:

```bash
cd /opt/prometheus
sudo nano prometheus.yml
```

### Add Application Server Target

Find the `scrape_configs` section and modify the targets:

```yaml
scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090", "<application-private-ip>:9100"]
```

**Note**: Use private IP for production setups for better security and no data transfer costs.

Save and exit (Ctrl+X, Y, Enter).

### Start Prometheus

```bash
cd /opt/prometheus
sudo ./prometheus
```

Prometheus will run on port **9090**.

### Access Prometheus UI

Open browser and navigate to:

```
http://<prometheus-public-ip>:9090
```

## Step 6: Configure Grafana

### Access Grafana UI

Open browser and navigate to:

```
http://<grafana-public-ip>:3000
```

### Initial Login

- **Username**: admin
- **Password**: admin
- Set a new password when prompted

### Add Prometheus Data Source

1. Click on **Configuration** (gear icon) → **Data Sources**
2. Click **Add data source**
3. Select **Prometheus**
4. Configure connection:
   - **URL**: `http://<prometheus-private-ip>:9090` (use private IP for production)
5. Click **Save & Test**

### Import Node Exporter Dashboard

1. Click on **+** → **Import**
2. Visit [grafana.com/dashboards](https://grafana.com/grafana/dashboards/)
3. Search for "Node Exporter" dashboard
4. Use Dashboard ID: **1860**
5. Enter **1860** in the import field
6. Click **Load**
7. Select **Prometheus** as the data source
8. Click **Import**

## Verification

You should now see:

- Prometheus UI showing targets at `http://<prometheus-public-ip>:9090/targets`
- Grafana dashboard displaying system metrics from the application server

## Important Notes

- **Production Setup**:
  - Use private IPs for internal communication
  - Restrict security group rules to specific IPs
  - Set up Prometheus and Node Exporter as systemd services for auto-restart
  - Use AWS IAM roles and security best practices
- **Data Persistence**: Configure proper storage for Prometheus data

- **Service Management**: Consider creating systemd service files for Prometheus and Node Exporter to run as background services

## Troubleshooting

- Ensure all security groups have correct inbound rules
- Verify Node Exporter is running: `curl http://localhost:9100/metrics`
- Check Prometheus targets status in UI
- Review service logs for any errors

## Next Steps

- Add more application servers with Node Exporter
- Create custom Grafana dashboards
- Set up alerting rules in Prometheus
- Configure alert notifications in Grafana

## License

This setup guide is provided as-is for educational purposes.

---

**Author**: Vaibhav Jamdhade  
**Date**: October 2025
