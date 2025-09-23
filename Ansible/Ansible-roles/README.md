# Ansible Roles - Apache Installation with Custom Web Page

This guide demonstrates how to create and use Ansible roles to install Apache web server and deploy a custom HTML page with animated bubbles.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Step-by-Step Process](#step-by-step-process)
3. [Project Structure](#project-structure)

---

## Project Overview

This project uses Ansible roles to:

- Install Apache2 web server on Ubuntu
- Deploy a custom animated HTML page
- Configure proper file ownership and permissions
- Start and enable Apache service

---

## Step-by-Step Process

### 1. Create Inventory File

Create `inventory.ini`:

```ini
[local]
localhost ansible_connection=local
```

### 2. Create Main Playbook

Create `install-apache.yaml`:

```yaml
---
- name: Install apache and copy file with owner and permissions
  hosts: localhost
  become: true
  roles:
    - httpd
```

### 3. Initialize Ansible Role

```bash
ansible-galaxy init httpd
```

This creates the complete role directory structure.

### 4. Configure Role Tasks

Edit `httpd/tasks/main.yml`:

```yaml
---
- name: Install Apache (Ubuntu)
  ansible.builtin.apt:
    name: apache2
    state: present
    update_cache: yes

- name: Ensure Apache service is started and enabled
  ansible.builtin.service:
    name: apache2
    state: started
    enabled: yes

- name: Copy index.html to web server with owner and permissions
  ansible.builtin.copy:
    src: index.html
    dest: /var/www/html/index.html
    owner: vaby20
    group: root
```

### 5. Add Custom HTML File

Create `httpd/files/index.html` with:

- Animated bubbles background
- "Say hello to Ansible 🌿" message
- Dark theme with colorful floating bubbles
- Responsive design
- JavaScript animation effects

### 6. Run the Playbook

```bash
ansible-playbook -i inventory.ini install-apache.yaml
```

### 7. Check Result

Visit `http://localhost` in your browser to see the custom HTML page with animated bubbles.

---

## Project Structure

```
Ansible-roles/
├── inventory.ini
├── install-apache.yaml
└── httpd/
    ├── tasks/
    │   └── main.yml
    ├── files/
    │   └── index.html
    └── [other role directories...]
```
