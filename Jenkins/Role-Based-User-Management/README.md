# Jenkins Role-Based User Management Guide

A complete guide to implement role-based access control in Jenkins, allowing you to manage user permissions and restrict access to specific features.

> **Prerequisites**: This guide assumes you already have Jenkins Master installed and running. If not, complete the [Jenkins Master Setup](.././Setup.md) first.

## What is Role-Based Access Control?

Role-Based Access Control (RBAC) allows you to:

- ✅ Create users with different permission levels
- ✅ Control who can build, configure, or view pipelines
- ✅ Separate responsibilities (Developers, Viewers, Admins)
- ✅ Enhance security by limiting access

**Example Roles**:

- **Admin**: Full access (create, delete, configure)
- **Developer**: Build and configure jobs
- **Viewer**: Read-only access (view jobs, builds)

---

## Step 1: Install Role-Based Authorization Strategy Plugin

### Check if Plugin is Installed

1. Go to Jenkins: `http://<jenkins-master-ip>:8080`
2. Navigate: **Dashboard** → **Manage Jenkins** → **Plugins**
3. Click: **Installed plugins**
4. Search for: `Role-based Authorization Strategy`

### Install Plugin (if not installed)

1. Go to: **Dashboard** → **Manage Jenkins** → **Plugins**
2. Click: **Available plugins**
3. Search for: `Role-based Authorization Strategy`
4. Check the checkbox
5. Click: **Install** (at the top)
6. Wait for installation to complete
7. ✅ Check: **Restart Jenkins when installation is complete**

---

## Step 2: Create New User

### Add New User in Jenkins

1. Go to: **Dashboard** → **Manage Jenkins** → **Users**
2. Click: **Create User** (on the left sidebar)

3. Fill in the user details:

   - **Username**: `developer1` (or any username you want)
   - **Password**: Enter a secure password
   - **Confirm password**: Re-enter the same password
   - **Full name**: `Developer User` (or user's full name)
   - **Email address**: `developer1@example.com`

4. Click: **Create User**

You should see the new user in the user list!

### Test New User Login

1. Open a **new incognito/private browser window**
2. Navigate to: `http://<jenkins-master-ip>:8080`
3. Login with the newly created user:
   - **Username**: `developer1`
   - **Password**: (the password you set)

**⚠️ Important Observation**:
Right now, the new user has **FULL ACCESS** to everything! They can create jobs, delete jobs, configure Jenkins - everything an admin can do. This is because we haven't set up role-based permissions yet.

Keep this window open - we'll test restricted access later.

---

## Step 3: Enable Role-Based Authorization Strategy

### Configure Authorization Strategy

1. Go back to the **admin browser window**
2. Navigate: **Dashboard** → **Manage Jenkins** → **Security**
3. Scroll down to **Authorization** section
4. You'll see a dropdown (currently might be "Logged-in users can do anything")
5. Select: **Role-Based Strategy** from the dropdown
6. Click: **Save** at the bottom

**What just happened?**

- Jenkins now uses role-based authorization
- A new option will appear in Jenkins settings

---

## Step 4: Access Manage and Assign Roles

After saving, you'll see a new menu option:

1. Go to: **Dashboard** → **Manage Jenkins**
2. Look for: **Manage and Assign Roles** (new option!)
3. Click on it

You'll see two options:

- **Manage Roles**: Define what roles exist and their permissions
- **Assign Roles**: Assign users to specific roles

---

## Step 5: Create Roles and Define Permissions

### Access Manage Roles

1. Click: **Manage Roles**

You'll see three sections:

- **Global roles**: Apply across entire Jenkins
- **Item roles**: Apply to specific jobs/projects
- **Agent roles**: Apply to specific agents

We'll focus on **Global roles** for now.

### Add a New Role

In the **Global roles** section:

1. Look for the **Role to add** text field
2. Enter role name: `viewer` (or any name like: developer, tester, etc.)
3. Click: **Add** button

The new role `viewer` will appear in the roles list!

### Configure Role Permissions

Now you'll see a table with checkboxes for different permissions. For the `viewer` role, tick these checkboxes:

**Overall**:

- Tick: **Read**

**Job**:

- Tick: **Read**

**View**:

- Tick: **Read**

**Metrics**:

- Tick: **View**

After ticking these checkboxes, click: **Save**

---

## Step 6: Assign Roles to Users

### Access Assign Roles

1. Go back to: **Manage and Assign Roles**
2. Click: **Assign Roles**

You'll see:

- **Global roles**: User to role assignments
- **Item roles**: Job-specific role assignments

### Assign User to Viewer Role

In the **Global roles** section:

1. Look for **User/group to add** field
2. Enter: `developer1` (the username you created)
3. Click: **Add**

Now you'll see a table with users and roles. Tick the checkbox under the `viewer` column for `developer1`.

Also find `authenticated` in the user list and tick the checkbox under `viewer` column (this applies viewer role to all logged-in users).

Click: **Save**

---

## Step 7: Test Role-Based Access

### Test with Developer1 User

1. Go back to the **incognito window** where `developer1` is logged in
2. **Refresh the page** (Ctrl+F5 or Cmd+Shift+R)

**What you should see now**:

**Can Do**:

- View Jenkins dashboard
- See list of jobs/pipelines
- View job configurations (read-only)
- View build history
- View console output of builds
- Access metrics and statistics

**Cannot Do**:

- No "New Item" option in sidebar
- No "Build Now" button on jobs
- No "Configure" option on jobs
- No "Delete" option
- Cannot create, modify, or delete anything

The user now has read-only access!

---

## Common Role Examples

### 1. Developer Role (Build + Read)

**Permissions**:

- Overall: Read
- Job: Read, Build, Cancel
- View: Read
- Metrics: View

**What developers can do**: View jobs, trigger builds, cancel builds, view build logs. Cannot create, configure, or delete jobs.

### 2. Manager Role (Create + Configure)

**Permissions**:

- Overall: Read
- Job: Create, Read, Configure, Build, Cancel
- View: Create, Read, Configure
- Metrics: View

**What managers can do**: Everything developers can do, plus create and configure jobs and views. Cannot delete jobs or administer Jenkins.

---

## Step-by-Step: Creating Multiple Roles

### Example: Create Developer Role

1. Go to: **Manage and Assign Roles** → **Manage Roles**
2. In **Role to add** field, type: `developer`
3. Click: **Add**
4. Tick these permissions:
   - Overall: Read
   - Job: Read, Build, Cancel
   - View: Read
   - Metrics: View
5. Click: **Save**

### Assign Developer Role to Users

1. Go to: **Manage and Assign Roles** → **Assign Roles**
2. In **User/group to add**, type: `developer1`
3. Click: **Add**
4. Tick the checkbox under `developer` column for `developer1`
5. Click: **Save**

---

## Managing Multiple Users

You can create multiple users and assign different roles:

- **Admin Team**: admin, jenkins-admin (full access)
- **Developer Team**: dev1, dev2, dev3 (developer role)
- **QA Team**: tester1, tester2 (viewer role)

Use the `authenticated` group to apply roles to all logged-in users. Add `authenticated` in Assign Roles and tick the `viewer` role - this gives all authenticated users basic read access.

---

## Item-Level Permissions (Advanced)

Item roles allow you to give users access to specific jobs only.

### Create Item Role

1. Go to: **Manage Roles**
2. Scroll to **Item roles** section
3. In **Role to add** field, type: `frontend-dev`
4. In **Pattern** field, type: `frontend-.*` (regex pattern)
5. Click: **Add**
6. Tick permissions for this role
7. Click: **Save**

### Assign Item Role

1. Go to: **Assign Roles**
2. Scroll to **Item roles** section
3. Add user: `dev1`
4. Tick: `frontend-dev` role
5. Click: **Save**

Now `dev1` can only access jobs matching `frontend-*` pattern!

---

## Troubleshooting

### ❌ User has no access after role assignment

**Solution**:

1. Ensure role has at least `Overall → Read` permission
2. Verify user is assigned to the role in **Assign Roles**
3. User must logout and login again to see changes

### ❌ "Access Denied" message for new user

**Solution**:

- Add `authenticated` group in **Assign Roles**
- Tick `viewer` role for `authenticated`
- This gives all logged-in users basic read access

### ❌ Cannot see "Manage and Assign Roles" option

**Solution**:

- Verify **Role-Based Strategy** plugin is installed
- Check authorization is set to "Role-Based Strategy" in Security settings
- Restart Jenkins: `sudo systemctl restart jenkins`

### ❌ Admin lost access after changing authorization

**Solution**:
If you accidentally locked yourself out:

```bash
# SSH to Jenkins master
ssh -i key.pem ec2-user@<jenkins-ip>

# Edit config.xml
sudo nano /var/lib/jenkins/config.xml

# Find this line:
# <authorizationStrategy class="...RoleBasedAuthorizationStrategy"/>

# Change it to:
# <authorizationStrategy class="hudson.security.AuthorizationStrategy$Unsecured"/>

# Save and restart Jenkins
sudo systemctl restart jenkins

# Login as admin, reconfigure authorization properly
```

---

## Best Practices

- Give users only permissions they need
- Assign roles to `authenticated` group rather than individual users
- Create test users to verify role permissions work as expected
- Keep a list of what each role can do
- Review user access periodically
- Backup `/var/lib/jenkins/config.xml` before changes
- For large teams, use pattern-based item roles

---

## Security Recommendations

For Production:

- Enable HTTPS/SSL for Jenkins
- Use strong passwords or integrate with LDAP/Active Directory
- Enable two-factor authentication (2FA)
- Regularly update Jenkins and plugins
- Monitor user access logs
- Set session timeout
- Restrict Jenkins access to internal network only

---

## Role Permission Matrix

Quick reference for common scenarios:

| Action         | Viewer | Developer | Manager | Admin |
| -------------- | ------ | --------- | ------- | ----- |
| View jobs      | ✅     | ✅        | ✅      | ✅    |
| View builds    | ✅     | ✅        | ✅      | ✅    |
| Trigger builds | ❌     | ✅        | ✅      | ✅    |
| Cancel builds  | ❌     | ✅        | ✅      | ✅    |
| Create jobs    | ❌     | ❌        | ✅      | ✅    |
| Configure jobs | ❌     | ❌        | ✅      | ✅    |
| Delete jobs    | ❌     | ❌        | ❌      | ✅    |
| Manage Jenkins | ❌     | ❌        | ❌      | ✅    |
| Manage plugins | ❌     | ❌        | ❌      | ✅    |
| Manage users   | ❌     | ❌        | ❌      | ✅    |

---

## What You've Accomplished

- Installed Role-Based Authorization Strategy plugin
- Created new users in Jenkins
- Enabled role-based authorization
- Created custom roles with specific permissions
- Assigned users to roles
- Tested access control
- Understood security best practices

Your Jenkins is now secure with proper access control!

---

**Author**: Vaibhav Jamdhade  
**Date**: October 2025  
**Project**: Jenkins Role-Based Access Control Guide
