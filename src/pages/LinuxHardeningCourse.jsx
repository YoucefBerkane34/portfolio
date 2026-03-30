import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── COURSE DATA ────────────────────────────────────────────────────────────

const COURSE = [
  {
    id: "ssh",
    icon: "🔐",
    title: "SSH Security Essentials",
    color: "#38bdf8",
    tagline: "Secure the front door of your server",
    difficulty: "Beginner",
    duration: "25 min",
    lessons: [
      {
        id: "ssh-intro",
        title: "What is SSH & Why Secure It?",
        content: [
          { type: "text", body: "SSH (Secure Shell) is the primary protocol administrators use to access Linux servers remotely. It creates an encrypted tunnel between your computer and the server — think of it as a secure phone call only you and the server can hear." },
          { type: "callout", variant: "info", title: "How SSH Works", body: "When you connect, SSH performs a handshake: the server presents its identity (host key), you verify it's really your server, and then a fully encrypted session begins. All commands you type travel through this encrypted channel." },
          { type: "text", body: "Here's the problem: SSH port 22 is publicly known. Every internet-facing server gets thousands of automated attacks per day — bots that try common usernames and passwords 24/7. Securing SSH is your first and most critical hardening task." },
          { type: "callout", variant: "danger", title: "Real Threat Example", body: "An unprotected server with default SSH settings can see 10,000+ failed login attempts per day. These are automated scripts scanning the entire internet. Without hardening, it's only a matter of time before they guess a weak password." },
          { type: "diagram", label: "Typical Bot Attack Flow", items: [{ icon: "🤖", text: "Bot scans\nport 22" }, { icon: "→", text: "" }, { icon: "🎯", text: "Tries root,\nadmin, ubuntu" }, { icon: "→", text: "" }, { icon: "🔑", text: "Guesses\n'admin123'" }, { icon: "→", text: "" }, { icon: "💀", text: "Server\ncompromised" }] },
        ],
      },
      {
        id: "ssh-disable-root",
        title: "Disable Root SSH Login",
        content: [
          { type: "text", body: "The root account is the superuser with unlimited power. Every Linux system has it. Allowing root to log in via SSH gives attackers only ONE thing to guess: the password. By disabling root SSH login, you force attackers to also know a valid username." },
          { type: "callout", variant: "warning", title: "Before You Do This", body: "Make sure you have a regular user account with sudo access BEFORE disabling root login. Otherwise you could lock yourself out. Create one with: sudo adduser myuser && sudo usermod -aG sudo myuser" },
          { type: "code", label: "Step 1 — Open the SSH config file", code: "sudo nano /etc/ssh/sshd_config", explanation: "This opens the main SSH daemon configuration file. Any changes here affect how SSH behaves on your server." },
          { type: "code", label: "Step 2 — Find and change this line", code: "PermitRootLogin no", explanation: "Find the line that says 'PermitRootLogin yes' and change it to 'no'. This prevents root from authenticating over SSH entirely." },
          { type: "code", label: "Step 3 — Apply the changes", code: "sudo systemctl restart sshd", explanation: "The SSH daemon must be restarted to read the new configuration. Your current session won't be dropped — only new connections are affected." },
          { type: "callout", variant: "success", title: "Verify It Worked", body: "Try to SSH as root from another terminal: ssh root@your-server-ip — it should say 'Permission denied'. That's exactly what you want." },
        ],
      },
      {
        id: "ssh-keys",
        title: "SSH Key Authentication",
        content: [
          { type: "text", body: "Passwords can be guessed, cracked, or leaked. SSH keys use cryptography — a mathematically linked pair: a private key (your secret, stays on your machine) and a public key (goes on the server). Even if someone gets the public key, they can't log in without the private key." },
          { type: "diagram", label: "How SSH Key Auth Works", items: [{ icon: "💻", text: "Your Machine\n(private key)" }, { icon: "→", text: "I have this key" }, { icon: "🖥️", text: "Server\n(public key)" }, { icon: "→", text: "Prove it" }, { icon: "🔓", text: "Math challenge\nsolved" }, { icon: "→", text: "" }, { icon: "✅", text: "Access\ngranted" }] },
          { type: "code", label: "Step 1 — Generate a key pair on your LOCAL machine", code: `ssh-keygen -t ed25519 -C "admin@myserver"\n# -t ed25519 = modern algorithm (faster & more secure than RSA)\n# -C = a comment to identify the key\n# You'll be prompted to set a passphrase — DO set one!`, explanation: "This creates two files: ~/.ssh/id_ed25519 (private — NEVER share this) and ~/.ssh/id_ed25519.pub (public — this goes to the server)." },
          { type: "code", label: "Step 2 — Copy your public key to the server", code: `ssh-copy-id -i ~/.ssh/id_ed25519.pub username@your_server_ip\n# OR manually:\ncat ~/.ssh/id_ed25519.pub | ssh username@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"`, explanation: "This appends your public key to ~/.ssh/authorized_keys on the server. SSH checks this file every time someone tries to connect with a key." },
          { type: "code", label: "Step 3 — Disable password login (AFTER confirming keys work!)", code: `# In /etc/ssh/sshd_config:\nPasswordAuthentication no\nPubkeyAuthentication yes\nAuthorizedKeysFile .ssh/authorized_keys\n\nsudo systemctl restart sshd`, explanation: "Only do this AFTER you've verified you can log in with your key. If you do it before, you'll lock yourself out." },
        ],
      },
      {
        id: "ssh-harden",
        title: "Full SSH Hardening Config",
        content: [
          { type: "text", body: "Changing the SSH port from 22 to something non-standard dramatically reduces noise from automated scanners. Combined with the full hardened config below, SSH becomes a very serious barrier." },
          { type: "code", label: "Complete hardened /etc/ssh/sshd_config", code: `Port 2222                        # Non-standard port\nProtocol 2                       # Only SSH version 2\nPermitRootLogin no               # No root login\nPasswordAuthentication no        # Keys only\nPubkeyAuthentication yes         # Enable key auth\nAuthorizedKeysFile .ssh/authorized_keys\nPermitEmptyPasswords no          # Disallow blank passwords\nMaxAuthTries 3                   # Disconnect after 3 failures\nMaxSessions 2                    # Limit concurrent sessions\nClientAliveInterval 300          # Disconnect idle after 5 min\nClientAliveCountMax 2\nLoginGraceTime 30                # 30 seconds to authenticate\nAllowUsers yourusername          # Whitelist specific users\nX11Forwarding no                 # Disable X11 (unless needed)\nAllowTcpForwarding no            # Disable port forwarding`, explanation: "Every line has a purpose. Together they make brute-force attacks nearly impossible." },
          { type: "code", label: "Apply changes safely", code: `# Test the config BEFORE restarting (catches syntax errors):\nsudo sshd -t\n\n# If no errors, restart:\nsudo systemctl restart sshd\n\n# Open firewall for new port:\nsudo ufw allow 2222/tcp\nsudo ufw deny 22/tcp`, explanation: "Always run 'sshd -t' before restarting. A syntax error with no test could lock you out of your server permanently." },
        ],
      },
      {
        id: "ssh-fail2ban",
        title: "Fail2Ban — Automated Attack Blocking",
        content: [
          { type: "text", body: "Fail2Ban is a daemon that watches your log files and automatically bans IP addresses that show signs of malicious activity. For SSH, it bans any IP that fails authentication too many times." },
          { type: "code", label: "Install Fail2Ban", code: `sudo apt update\nsudo apt install fail2ban -y\nsudo systemctl enable fail2ban\nsudo systemctl start fail2ban`, explanation: "Install and enable Fail2Ban. It starts monitoring immediately, but we'll configure the SSH jail next." },
          { type: "code", label: "Configure the SSH jail", code: `# IMPORTANT: Don't edit jail.conf — create a local override:\nsudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local\nsudo nano /etc/fail2ban/jail.local\n\n# Find [sshd] section and configure:\n[sshd]\nenabled   = true\nport      = 2222          # match your SSH port\nfilter    = sshd\nlogpath   = /var/log/auth.log\nmaxretry  = 3             # ban after 3 failures\nfindtime  = 600           # within 10 minutes\nbantime   = 3600          # ban for 1 hour\n\nsudo systemctl restart fail2ban`, explanation: "jail.local overrides jail.conf without risk of being overwritten on updates. maxretry=3 means 3 failed attempts within 10 minutes triggers a 1-hour ban." },
          { type: "code", label: "Monitor Fail2Ban", code: `# Check overall status:\nsudo fail2ban-client status\n\n# Check SSH jail specifically:\nsudo fail2ban-client status sshd\n\n# Unban an IP (e.g., if you locked yourself out):\nsudo fail2ban-client set sshd unbanip 192.168.1.100`, explanation: "These commands let you monitor what Fail2Ban is doing in real-time. Very useful when actively defending a server." },
        ],
      },
    ],
    exercises: [
      {
        id: "ex-ssh-1",
        title: "Exercise: Harden the SSH Configuration",
        description: "A fresh Ubuntu server has SSH running with defaults. Work through the hardening steps one command at a time.",
        scenario: "You have just provisioned a new Ubuntu 22.04 server. Root login is enabled, password auth is on, and SSH is on port 22. Harden it step by step.",
        steps: [
          { instruction: "Check what is currently listening on port 22:", expected: "ss -tlnp | grep :22", hint: "Use the 'ss' command with flags -tlnp and pipe to grep for :22", solution: "ss -tlnp | grep :22", explanation: "ss -tlnp shows all listening TCP ports with process info. This confirms SSH is running and on which port." },
          { instruction: "Open the SSH daemon config file with nano:", expected: "sudo nano /etc/ssh/sshd_config", hint: "The SSH config is at /etc/ssh/sshd_config — use sudo since it's owned by root.", solution: "sudo nano /etc/ssh/sshd_config", explanation: "sshd_config controls all SSH daemon behavior. Use sudo because it's a system file." },
          { instruction: "Test the SSH config for syntax errors before applying:", expected: "sudo sshd -t", hint: "The sshd binary has a -t flag that tests the config without restarting.", solution: "sudo sshd -t", explanation: "sshd -t validates config file syntax. No output means no errors — safe to restart." },
          { instruction: "Restart the SSH service to apply changes:", expected: "sudo systemctl restart sshd", hint: "Use systemctl to restart the sshd service.", solution: "sudo systemctl restart sshd", explanation: "systemctl restart sshd reloads the config. Your current session is preserved." },
          { instruction: "Verify SSH is still running after the restart:", expected: "sudo systemctl status sshd", hint: "Use systemctl status to check if the service is running.", solution: "sudo systemctl status sshd", explanation: "Always verify the service is active (running) after a restart. Look for 'active (running)' in the output." },
        ],
      },
      {
        id: "ex-ssh-2",
        title: "Exercise: Generate & Deploy SSH Keys",
        description: "Practice the full key generation and deployment workflow.",
        scenario: "Set up key-based authentication for an admin user connecting to server 192.168.1.50.",
        steps: [
          { instruction: "Generate an ed25519 SSH key pair with comment 'homelab-admin':", expected: "ssh-keygen -t ed25519 -C \"homelab-admin\"", hint: "Use ssh-keygen with -t for algorithm type and -C for the comment label.", solution: "ssh-keygen -t ed25519 -C \"homelab-admin\"", explanation: "ed25519 is the modern recommended algorithm. The -C comment helps you identify which key is which." },
          { instruction: "Copy your public key to the server (user: admin, server: 192.168.1.50):", expected: "ssh-copy-id -i ~/.ssh/id_ed25519.pub admin@192.168.1.50", hint: "Use ssh-copy-id with the -i flag pointing to the .pub file.", solution: "ssh-copy-id -i ~/.ssh/id_ed25519.pub admin@192.168.1.50", explanation: "ssh-copy-id securely copies your public key and sets correct file permissions on the server automatically." },
          { instruction: "Verify the key was added to authorized_keys on the server:", expected: "cat ~/.ssh/authorized_keys", hint: "Keys are stored in ~/.ssh/authorized_keys — use cat to display the file.", solution: "cat ~/.ssh/authorized_keys", explanation: "You should see your public key listed here. SSH checks this file for every key-based authentication attempt." },
        ],
      },
    ],
    quiz: [
      { question: "Why should you disable PasswordAuthentication in SSH?", options: ["To speed up the SSH connection", "Passwords can be brute-forced; keys require mathematical proof of identity", "SSH keys are easier to remember than passwords", "To enable X11 forwarding"], correct: 1, explanation: "SSH keys use asymmetric cryptography. A properly generated key would take billions of years to brute-force. Passwords can often be guessed in seconds with automated tools." },
      { question: "What command safely tests your sshd_config for syntax errors before restarting?", options: ["sudo sshd --check", "sudo sshd -t", "sudo ssh-test config", "sudo systemctl test sshd"], correct: 1, explanation: "'sudo sshd -t' tests the SSH daemon configuration without actually restarting the service. No output = no syntax errors = safe to restart." },
      { question: "You ran 'sudo fail2ban-client status sshd' and see your own IP banned. What command unbans it?", options: ["sudo fail2ban-client unban 192.168.1.1", "sudo fail2ban-client set sshd unbanip 192.168.1.1", "sudo fail2ban --unban 192.168.1.1", "sudo iptables -D FAIL2BAN 192.168.1.1"], correct: 1, explanation: "The correct syntax is: sudo fail2ban-client set <jailname> unbanip <ip>. In this case the jail is called 'sshd'." },
      { question: "What is the correct file for Fail2Ban local overrides?", options: ["/etc/fail2ban/jail.conf", "/etc/fail2ban/sshd.conf", "/etc/fail2ban/jail.local", "/etc/fail2ban/config.local"], correct: 2, explanation: "jail.local is the correct override file. jail.conf gets overwritten on package updates. Always use jail.local for customizations." },
    ],
  },

  {
    id: "sudo",
    icon: "👤",
    title: "Configuring Sudo Access",
    color: "#818cf8",
    tagline: "Principle of least privilege in practice",
    difficulty: "Beginner",
    duration: "20 min",
    lessons: [
      {
        id: "sudo-intro",
        title: "What is Sudo & Why It Matters",
        content: [
          { type: "text", body: "sudo (superuser do) allows a regular user to run specific commands with elevated privileges. Instead of logging in as root — where every command has unlimited power — you use sudo only when necessary." },
          { type: "callout", variant: "info", title: "The Principle of Least Privilege", body: "Every user and process should have only the minimum permissions needed to do their job. A web server doesn't need to read /etc/shadow. A deploy script doesn't need to install packages. Sudo lets you enforce these limits precisely." },
          { type: "diagram", label: "Root vs Sudo", items: [{ icon: "😱", text: "Logged in as root\nEvery command = full power\nOne mistake = disaster" }, { icon: "VS", text: "" }, { icon: "✅", text: "Logged in as user\nsudo = targeted power\nAudit trail + control" }] },
          { type: "callout", variant: "success", title: "Sudo Keeps a Full Audit Log", body: "Every sudo command is logged in /var/log/auth.log with: who ran it, when, from where, and what command. This audit trail is invaluable for incident response and compliance." },
        ],
      },
      {
        id: "sudo-users",
        title: "Creating and Managing Sudo Users",
        content: [
          { type: "code", label: "Create a new admin user and grant sudo", code: `# Create a new user:\nsudo adduser adminuser\n\n# Add to the 'sudo' group:\nsudo usermod -aG sudo adminuser\n\n# Verify:\ngroups adminuser\n# Output: adminuser : adminuser sudo`, explanation: "On Ubuntu/Debian, members of the 'sudo' group get full sudo access. On RHEL/CentOS, the group is called 'wheel'." },
          { type: "code", label: "Test and inspect sudo access", code: `# Switch to the new user:\nsu - adminuser\n\n# Test sudo:\nsudo whoami\n# Should output: root\n\n# See what sudo can do:\nsudo -l\n# Lists all commands this user can run with sudo`, explanation: "'sudo -l' is one of the most useful commands — it shows exactly what sudo permissions the current user has." },
          { type: "code", label: "Remove sudo from a user", code: `sudo deluser username sudo\n\n# Verify removal:\ngroups username\n# 'sudo' should no longer appear`, explanation: "When someone no longer needs admin access, immediately remove their sudo privileges. Applies to ex-employees too." },
        ],
      },
      {
        id: "sudo-visudo",
        title: "Fine-Grained Control with visudo",
        content: [
          { type: "callout", variant: "warning", title: "Always Use visudo — Never Edit sudoers Directly", body: "visudo locks the sudoers file while editing and validates syntax before saving. A typo in sudoers can prevent ALL sudo access, locking you out. visudo saves you from this." },
          { type: "code", label: "Open sudoers safely", code: "sudo visudo", explanation: "visudo uses your default editor (nano or vi). It's the ONLY safe way to edit the sudoers file." },
          { type: "code", label: "Sudoers syntax examples", code: `# Format: WHO WHERE=(AS_WHO) WHAT\n\n# Full sudo for a user:\nadminuser ALL=(ALL:ALL) ALL\n\n# Full sudo for a group (note the %):\n%developers ALL=(ALL:ALL) ALL\n\n# Specific command without password:\ndeploy ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx\n\n# Multiple specific commands:\nbackup ALL=(ALL) NOPASSWD: /usr/bin/rsync, /bin/tar`, explanation: "Read it as: 'WHO can run WHAT as WHOM, from WHERE'. NOPASSWD skips the password prompt — useful for scripts but use carefully." },
          { type: "code", label: "Drop-in files (best practice)", code: `# Create per-role files in /etc/sudoers.d/:\nsudo visudo -f /etc/sudoers.d/developers\n\n# Example content:\n%developers ALL=(ALL) NOPASSWD: /bin/systemctl restart apache2\n%developers ALL=(ALL) NOPASSWD: /usr/bin/tail -f /var/log/apache2/*.log`, explanation: "Files in /etc/sudoers.d/ are automatically included. Each team/role gets its own file — much easier to manage and audit." },
          { type: "code", label: "Security defaults for sudo", code: `# In visudo:\nDefaults    passwd_tries=3\nDefaults    badpass_message="Invalid password. Access logged."\nDefaults    logfile="/var/log/sudo.log"\nDefaults    log_input, log_output\nDefaults    timestamp_timeout=5\nDefaults    requiretty`, explanation: "log_input and log_output record everything the user typed and saw — very useful for auditing suspicious activity." },
        ],
      },
    ],
    exercises: [
      {
        id: "ex-sudo-1",
        title: "Exercise: Set Up a Deployment User",
        description: "A developer needs limited sudo access — only to restart nginx and read logs. Nothing else.",
        scenario: "User 'deploy' exists on the server. Give them ONLY: restart nginx, and read the nginx error log. No password required for these commands.",
        steps: [
          { instruction: "Open visudo to safely edit the sudoers file:", expected: "sudo visudo", hint: "Always use visudo — never edit sudoers directly with nano or vim.", solution: "sudo visudo", explanation: "visudo validates syntax before saving, preventing accidental lockouts from typos." },
          { instruction: "Create a dedicated sudoers drop-in file for the deploy user:", expected: "sudo visudo -f /etc/sudoers.d/deploy", hint: "Use visudo with the -f flag to specify a drop-in file path.", solution: "sudo visudo -f /etc/sudoers.d/deploy", explanation: "Drop-in files in /etc/sudoers.d/ are cleaner than editing sudoers directly. Each role gets its own file." },
          { instruction: "Check sudo permissions for the 'deploy' user:", expected: "sudo -l -U deploy", hint: "sudo -l lists permissions. Use -U to specify another user.", solution: "sudo -l -U deploy", explanation: "sudo -l -U username shows exactly what commands a specific user can run with sudo. Always verify after making changes." },
          { instruction: "View recent sudo activity in the auth log:", expected: "sudo grep sudo /var/log/auth.log | tail -20", hint: "grep for 'sudo' in /var/log/auth.log, then pipe to tail -20.", solution: "sudo grep sudo /var/log/auth.log | tail -20", explanation: "Shows the last 20 sudo commands run on the system — who ran them, when, and what command was executed." },
        ],
      },
    ],
    quiz: [
      { question: "Why use 'sudo visudo' instead of 'sudo nano /etc/sudoers'?", options: ["visudo is faster than nano", "visudo validates syntax before saving, preventing lockouts from typos", "nano cannot edit sudoers due to permissions", "visudo auto-backs up the file"], correct: 1, explanation: "visudo validates sudoers syntax before saving. A syntax error in sudoers can make ALL sudo access fail, locking you out permanently." },
      { question: "What does NOPASSWD in sudoers do?", options: ["Removes the user's login password", "Allows specific commands to run via sudo without entering a password", "Disables password auth for SSH", "Sets an empty password"], correct: 1, explanation: "NOPASSWD allows specific commands to run via sudo without requiring the user's password. Useful for automated scripts but must be used carefully." },
      { question: "What command shows all sudo privileges for a user named 'bob'?", options: ["sudo -l bob", "sudo -l -U bob", "sudo --list bob", "cat /etc/sudoers | grep bob"], correct: 1, explanation: "'sudo -l -U username' lists all sudo permissions for that user. Always verify permissions after configuring them." },
      { question: "Best place to add custom sudo rules?", options: ["Directly in /etc/sudoers", "In /etc/sudo.conf", "In a new file inside /etc/sudoers.d/", "In /home/user/.sudo"], correct: 2, explanation: "Files in /etc/sudoers.d/ are automatically included. This modular approach makes permissions easier to manage, audit, and remove." },
    ],
  },

  {
    id: "apache",
    icon: "🌐",
    title: "Securing Apache2",
    color: "#34d399",
    tagline: "Harden the world's most popular web server",
    difficulty: "Intermediate",
    duration: "30 min",
    lessons: [
      {
        id: "apache-intro",
        title: "Apache2 Default Attack Surface",
        content: [
          { type: "text", body: "Apache HTTP Server powers roughly 30% of all websites. Its default installation is functional but not secure — it leaks server information, exposes directory structures, and runs unnecessary modules. Each of these is an attack surface." },
          { type: "callout", variant: "danger", title: "Default Apache Reveals Too Much", body: "By default, Apache tells every visitor its exact version number, the OS it runs on, and installed modules. An attacker who knows you're running Apache 2.4.41 on Ubuntu 20.04 immediately knows which CVEs to try." },
          { type: "diagram", label: "Apache Default Security Gaps", items: [{ icon: "❌", text: "Version\nexposed" }, { icon: "❌", text: "Directory\nlisting on" }, { icon: "❌", text: "Unused\nmodules" }, { icon: "❌", text: "No\nHTTPS" }, { icon: "❌", text: "No security\nheaders" }] },
        ],
      },
      {
        id: "apache-info",
        title: "Hide Version & Server Info",
        content: [
          { type: "code", label: "Edit the Apache security config", code: `sudo nano /etc/apache2/conf-available/security.conf\n\n# Change these two lines:\nServerTokens Prod\nServerSignature Off\n\n# ServerTokens Prod = only shows "Apache" (no version)\n# ServerSignature Off = removes the footer from error pages`, explanation: "ServerTokens Prod makes Apache only identify itself as 'Apache' without version details. ServerSignature Off removes server info from error pages." },
          { type: "code", label: "Enable the config and verify", code: `sudo a2enconf security\nsudo systemctl reload apache2\n\n# Test with curl:\ncurl -I http://localhost\n# Before: Server: Apache/2.4.41 (Ubuntu)\n# After:  Server: Apache`, explanation: "curl -I fetches only HTTP headers. The Server header should now say just 'Apache' with no version." },
        ],
      },
      {
        id: "apache-directory",
        title: "Disable Directory Listing & Restrict Access",
        content: [
          { type: "callout", variant: "danger", title: "Directory Listing = Free Recon for Attackers", body: "If Apache can't find an index.html, it lists all files by default. This exposes your entire file structure, including config files, backups, and anything else in that directory." },
          { type: "code", label: "Disable directory listing globally", code: `# In /etc/apache2/apache2.conf:\n<Directory /var/www/>\n    Options -Indexes -FollowSymLinks\n    AllowOverride None\n    Require all granted\n</Directory>\n\n# The - prefix DISABLES the option.\nsudo systemctl reload apache2`, explanation: "Options -Indexes returns 403 Forbidden instead of showing a file list. -FollowSymLinks prevents directory traversal via symlinks." },
          { type: "code", label: "Block access to sensitive files", code: `# Block hidden files (.htpasswd, .git, .env):\n<DirectoryMatch "^/.*/\\\\.">\\n    Require all denied\n</DirectoryMatch>\n\n# Block sensitive file extensions:\n<FilesMatch "\\.(bak|config|sql|log|env)$">\n    Require all denied\n</FilesMatch>`, explanation: "These rules prevent access to hidden files and sensitive extensions — stopping accidental exposure of .env files, SQL dumps, or log files." },
        ],
      },
      {
        id: "apache-modules",
        title: "Disable Unnecessary Modules",
        content: [
          { type: "text", body: "Every enabled Apache module adds functionality — and attack surface. Modules you don't use are just extra code that could have vulnerabilities. Disable everything you don't need." },
          { type: "code", label: "Audit and disable modules", code: `# List ALL enabled modules:\napache2ctl -M\n\n# Disable modules you don't need:\nsudo a2dismod autoindex    # Directory listing\nsudo a2dismod status       # /server-status page\nsudo a2dismod info         # /server-info page\nsudo a2dismod userdir      # ~/public_html for users\nsudo a2dismod cgi          # CGI script execution\n\nsudo systemctl restart apache2`, explanation: "a2dismod removes symlinks in /etc/apache2/mods-enabled/. The status and info modules especially should be disabled — they expose internal server information." },
        ],
      },
      {
        id: "apache-https",
        title: "HTTPS & Security Headers",
        content: [
          { type: "callout", variant: "warning", title: "Never Serve Sensitive Data Over HTTP", body: "HTTP is unencrypted. Login credentials, session cookies, form data — all can be intercepted. HTTPS encrypts all traffic. Let's Encrypt gives you free, auto-renewing certificates." },
          { type: "code", label: "Install Certbot and get a certificate", code: `sudo apt install certbot python3-certbot-apache -y\n\n# Get and automatically configure HTTPS:\nsudo certbot --apache -d yourdomain.com -d www.yourdomain.com\n\n# Test auto-renewal:\nsudo certbot renew --dry-run`, explanation: "Certbot handles everything: verifies domain ownership, downloads the certificate, configures Apache, and sets up automatic renewal via a systemd timer." },
          { type: "code", label: "Add HTTP Security Headers", code: `sudo a2enmod headers\n\n# Inside your HTTPS VirtualHost:\n<VirtualHost *:443>\n    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"\n    Header always set X-Frame-Options "SAMEORIGIN"\n    Header always set X-Content-Type-Options "nosniff"\n    Header always set X-XSS-Protection "1; mode=block"\n    Header always set Referrer-Policy "strict-origin-when-cross-origin"\n    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"\n</VirtualHost>\n\nsudo systemctl reload apache2`, explanation: "Security headers instruct browsers how to behave. HSTS forces HTTPS. X-Frame-Options prevents clickjacking. Together they block entire categories of browser-based attacks." },
        ],
      },
    ],
    exercises: [
      {
        id: "ex-apache-1",
        title: "Exercise: Audit and Harden Apache",
        description: "You inherit a running Apache server. Systematically find and fix its security issues.",
        scenario: "Production Apache 2.4 server. No HTTPS, version info exposed, directory listing on, status module enabled. Fix it all.",
        steps: [
          { instruction: "Check what Apache modules are currently enabled:", expected: "apache2ctl -M", hint: "apache2ctl with the -M flag lists all loaded modules.", solution: "apache2ctl -M", explanation: "This lists every module Apache has loaded. Look for autoindex, status, info, and userdir — all should probably be disabled." },
          { instruction: "Disable the autoindex module (causes directory listing):", expected: "sudo a2dismod autoindex", hint: "Use a2dismod to disable a module. The module is called 'autoindex'.", solution: "sudo a2dismod autoindex", explanation: "autoindex generates directory listings when no index file exists. Disabling it returns 403 Forbidden instead." },
          { instruction: "Check what the Server header currently reveals:", expected: "curl -I http://localhost", hint: "Use curl with -I flag to get only HTTP response headers.", solution: "curl -I http://localhost", explanation: "The -I flag makes a HEAD request returning only headers. Check the 'Server:' header to see what version Apache is disclosing." },
          { instruction: "Test your Apache config for syntax errors:", expected: "sudo apache2ctl configtest", hint: "apache2ctl has a 'configtest' subcommand that validates syntax.", solution: "sudo apache2ctl configtest", explanation: "Always run configtest before restarting Apache. Syntax errors would cause Apache to fail to start, taking your site down." },
          { instruction: "Reload Apache to apply all changes:", expected: "sudo systemctl reload apache2", hint: "Use systemctl reload (not restart) to apply config changes without dropping connections.", solution: "sudo systemctl reload apache2", explanation: "reload sends SIGHUP to Apache, which re-reads config without dropping active connections. Always prefer reload over restart for live servers." },
        ],
      },
    ],
    quiz: [
      { question: "What do 'ServerTokens Prod' and 'ServerSignature Off' do?", options: ["They improve Apache performance in production", "They hide Apache's version number and remove server info from error pages", "They enable production SSL certificates", "They disable server signature authentication"], correct: 1, explanation: "ServerTokens Prod makes the Server header say just 'Apache' without version. ServerSignature Off removes version from error pages. Together they prevent information disclosure." },
      { question: "Why is directory listing dangerous on a web server?", options: ["It slows down the server significantly", "It exposes your file structure, config files, and backups to anyone visiting", "It uses too much memory", "It conflicts with HTTPS"], correct: 1, explanation: "Directory listing shows all files when no index page exists. An attacker can see your entire file structure, find backup files, config files, and sensitive data." },
      { question: "What does HSTS (Strict-Transport-Security) do?", options: ["It encrypts HTTP headers", "It tells browsers to ONLY connect to your site over HTTPS for a set time period", "It restricts access to localhost", "It enables HTTP/2"], correct: 1, explanation: "HSTS tells browsers: for the next X seconds (max-age), only ever connect over HTTPS, even if someone types http://. This prevents downgrade attacks." },
      { question: "What command tests Apache configuration syntax without restarting?", options: ["sudo apache2 --test", "sudo apache2ctl configtest", "sudo systemctl test apache2", "sudo apache2 -syntax"], correct: 1, explanation: "'sudo apache2ctl configtest' validates all Apache config files and reports syntax errors without affecting the running server." },
    ],
  },

  {
    id: "nginx",
    icon: "⚡",
    title: "Securing Nginx",
    color: "#f472b6",
    tagline: "Harden the high-performance reverse proxy",
    difficulty: "Intermediate",
    duration: "30 min",
    lessons: [
      {
        id: "nginx-intro",
        title: "Nginx Attack Surface Overview",
        content: [
          { type: "text", body: "Nginx (pronounced 'engine-x') handles massive concurrent connections with an event-driven model. It's used as a web server, reverse proxy, and load balancer. Like Apache, its defaults are functional but not hardened." },
          { type: "callout", variant: "info", title: "Nginx as a Reverse Proxy", body: "A very common setup: Nginx sits in front of an application server (Node.js, Django, etc.) and handles SSL termination, rate limiting, and caching. This means Nginx is your first line of defense — it must be hardened." },
          { type: "diagram", label: "Nginx Reverse Proxy Architecture", items: [{ icon: "🌍", text: "Internet\nTraffic" }, { icon: "→", text: "" }, { icon: "⚡", text: "Nginx\n(Hardened)" }, { icon: "→", text: "" }, { icon: "🖥️", text: "App Server\n(Protected)" }] },
        ],
      },
      {
        id: "nginx-info",
        title: "Hide Version & Harden Basic Settings",
        content: [
          { type: "code", label: "Hide Nginx version", code: `sudo nano /etc/nginx/nginx.conf\n\n# Inside the http {} block:\nhttp {\n    server_tokens off;    # Hides version number\n}\n\n# Test and apply:\nsudo nginx -t && sudo systemctl reload nginx\n\n# Verify:\ncurl -I http://localhost\n# Before: Server: nginx/1.18.0\n# After:  Server: nginx`, explanation: "server_tokens off makes Nginx only show 'nginx' without version. Combined with removing the Server header entirely (via nginx-extras), you can hide Nginx's presence completely." },
          { type: "code", label: "Request timeouts and size limits", code: `# In nginx.conf, inside http {}:\nhttp {\n    client_body_timeout 12s;\n    client_header_timeout 12s;\n    keepalive_timeout 15s;\n    send_timeout 10s;\n    client_max_body_size 10M;\n    client_body_buffer_size 128k;\n    large_client_header_buffers 2 1k;\n}`, explanation: "These prevent Slowloris attacks (slow read), oversized upload attacks, and header injection attacks. They also improve overall server performance." },
          { type: "code", label: "Disable unused HTTP methods", code: `# In your server {} block:\nserver {\n    if ($request_method !~ ^(GET|POST|HEAD)$) {\n        return 405;\n    }\n    # For REST APIs that need PUT/DELETE:\n    # if ($request_method !~ ^(GET|POST|PUT|DELETE|HEAD)$) {\n    #     return 405;\n    # }\n}`, explanation: "Blocking unused HTTP methods reduces attack surface. TRACE especially should always be disabled — it enables XST (Cross-Site Tracing) attacks." },
        ],
      },
      {
        id: "nginx-ratelimit",
        title: "Rate Limiting & DDoS Protection",
        content: [
          { type: "text", body: "Rate limiting controls how many requests a single IP can make per time period. This is your primary defense against brute-force attacks on login pages, API abuse, and basic DDoS mitigation." },
          { type: "code", label: "Define rate limit zones", code: `# In nginx.conf, inside http {}:\nhttp {\n    # Zone: login | Storage: 10MB | Rate: 5 req/min\n    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;\n    \n    # For general API:\n    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;\n    \n    limit_req_status 429;  # Return 429 Too Many Requests\n}`, explanation: "$binary_remote_addr uses the client IP as the zone key. 10m = 10MB of storage (handles ~1.6 million unique IPs)." },
          { type: "code", label: "Apply rate limits to locations", code: `server {\n    location /login {\n        limit_req zone=login burst=5 nodelay;\n        proxy_pass http://backend;\n    }\n    \n    location /api/ {\n        limit_req zone=api burst=10 nodelay;\n        proxy_pass http://backend;\n    }\n}`, explanation: "burst allows brief traffic spikes above the rate limit. nodelay processes burst requests immediately rather than queuing — better UX for legitimate users." },
          { type: "code", label: "Block bad bots and scanners", code: `map $http_user_agent $bad_bot {\n    default 0;\n    ~*nikto    1;\n    ~*sqlmap   1;\n    ~*masscan  1;\n    ""         1;  # Block empty user agents\n}\n\nserver {\n    if ($bad_bot = 1) {\n        return 444;  # Close connection, no response\n    }\n}`, explanation: "444 (Nginx-specific) closes the TCP connection without sending any HTTP response, wasting minimal server resources on scanners." },
        ],
      },
      {
        id: "nginx-https",
        title: "HTTPS, SSL Hardening & Security Headers",
        content: [
          { type: "code", label: "Install Certbot for Nginx", code: `sudo apt install certbot python3-certbot-nginx -y\n\n# Get certificate and auto-configure Nginx:\nsudo certbot --nginx -d yourdomain.com -d www.yourdomain.com\n\n# Test renewal:\nsudo certbot renew --dry-run`, explanation: "Certbot for Nginx automatically modifies your server blocks to add SSL config and creates a systemd timer for automatic renewal." },
          { type: "code", label: "Hardened SSL/TLS settings", code: `server {\n    listen 443 ssl http2;\n    \n    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;\n    \n    ssl_protocols TLSv1.2 TLSv1.3;   # Disable old protocols\n    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;\n    ssl_prefer_server_ciphers off;\n    ssl_session_timeout 1d;\n    ssl_session_cache shared:SSL:10m;\n    ssl_session_tickets off;          # For forward secrecy\n    \n    ssl_stapling on;\n    ssl_stapling_verify on;\n    resolver 8.8.8.8 8.8.4.4 valid=300s;\n}`, explanation: "This disables TLS 1.0 and 1.1 (known vulnerabilities: POODLE, BEAST). ECDHE ciphers provide forward secrecy — past sessions can't be decrypted even if the private key is later stolen." },
          { type: "code", label: "Full security headers configuration", code: `server {\n    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\n    add_header X-Frame-Options "SAMEORIGIN" always;\n    add_header X-Content-Type-Options "nosniff" always;\n    add_header X-XSS-Protection "1; mode=block" always;\n    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n    add_header Content-Security-Policy "default-src 'self'" always;\n    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;\n}`, explanation: "The 'always' parameter sends these headers even for error responses. Content-Security-Policy is the most powerful — it defines which sources of content browsers will load." },
        ],
      },
    ],
    exercises: [
      {
        id: "ex-nginx-1",
        title: "Exercise: Harden an Nginx Installation",
        description: "Work through hardening a fresh Nginx server step by step.",
        scenario: "New Nginx server, default config. Version info exposed, no rate limiting, no HTTPS. Fix it all.",
        steps: [
          { instruction: "Check the Nginx version currently installed:", expected: "nginx -v", hint: "The nginx binary has a -v flag for version info.", solution: "nginx -v", explanation: "Shows the exact Nginx version. Attackers use this to find known CVEs. We'll hide this from HTTP headers with server_tokens off." },
          { instruction: "Test the current Nginx configuration for syntax errors:", expected: "sudo nginx -t", hint: "nginx -t tests the config files. Always run before reloading.", solution: "sudo nginx -t", explanation: "'nginx -t' tests config files and reports errors. Should say 'syntax is ok' and 'test is successful'." },
          { instruction: "View the main Nginx configuration file:", expected: "sudo cat /etc/nginx/nginx.conf", hint: "The main config is at /etc/nginx/nginx.conf", solution: "sudo cat /etc/nginx/nginx.conf", explanation: "nginx.conf contains the http{} block where global settings like server_tokens, rate limit zones, and timeouts go." },
          { instruction: "Check what ports Nginx is currently listening on:", expected: "ss -tlnp | grep nginx", hint: "Use ss (socket statistics) with -tlnp flags and grep for nginx.", solution: "ss -tlnp | grep nginx", explanation: "Shows which ports Nginx is listening on. You should see port 80. After adding HTTPS, you'll also see 443." },
          { instruction: "Reload Nginx to apply configuration changes:", expected: "sudo systemctl reload nginx", hint: "Use systemctl reload — not restart — to apply changes gracefully.", solution: "sudo systemctl reload nginx", explanation: "reload sends SIGHUP to Nginx, gracefully applying new config to new connections while letting existing ones finish." },
          { instruction: "Check the Nginx error log for any issues:", expected: "sudo tail -f /var/log/nginx/error.log", hint: "Nginx logs to /var/log/nginx/. Use tail -f to follow in real time.", solution: "sudo tail -f /var/log/nginx/error.log", explanation: "The error log is your first stop when something isn't working. tail -f shows new entries in real time. Press Ctrl+C to stop." },
        ],
      },
    ],
    quiz: [
      { question: "What does 'server_tokens off' do in Nginx?", options: ["Disables server-to-server communication", "Hides the Nginx version number from HTTP response headers", "Disables the authentication token system", "Turns off SSL token verification"], correct: 1, explanation: "server_tokens off prevents Nginx from including its version in the Server header and error pages. Instead of 'nginx/1.18.0' it shows just 'nginx'." },
      { question: "In 'limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m' — what does '5r/m' mean?", options: ["5 requests per millisecond", "5 retries per minute", "5 requests per minute from each IP", "5MB of requests per minute"], correct: 2, explanation: "5r/m means 5 requests per minute. Each IP address is limited to 5 requests per minute to locations using this zone." },
      { question: "Why disable TLS 1.0 and TLS 1.1 on Nginx?", options: ["They use more CPU than TLS 1.2/1.3", "They have known vulnerabilities (POODLE, BEAST) and are considered insecure", "They are not supported by modern browsers", "They conflict with HTTP/2"], correct: 1, explanation: "TLS 1.0 and 1.1 have known vulnerabilities including POODLE and BEAST attacks. TLS 1.2 and 1.3 are the current secure standards." },
      { question: "What HTTP status does Nginx return when rate limited (with limit_req_status 429)?", options: ["403 Forbidden", "500 Internal Server Error", "429 Too Many Requests", "503 Service Unavailable"], correct: 2, explanation: "429 Too Many Requests is the correct response for rate limiting. It tells clients they've sent too many requests and should slow down." },
    ],
  },
];

// ─── SMALL COMPONENTS ───────────────────────────────────────────────────────

function CalloutBox({ variant, title, body }) {
  const s = {
    info:    { bg: "rgba(56,189,248,0.07)",   border: "#38bdf835", icon: "💡", c: "#38bdf8" },
    warning: { bg: "rgba(251,191,36,0.07)",   border: "#fbbf2435", icon: "⚠️", c: "#fbbf24" },
    danger:  { bg: "rgba(248,113,113,0.07)",  border: "#f8717135", icon: "🚨", c: "#f87171" },
    success: { bg: "rgba(52,211,153,0.07)",   border: "#34d39935", icon: "✅", c: "#34d399" },
  }[variant] || {};
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "14px 18px", margin: "14px 0" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
        <span>{s.icon}</span>
        <strong style={{ fontSize: 12.5, color: s.c }}>{title}</strong>
      </div>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "var(--text-muted)" }}>{body}</p>
    </div>
  );
}

function DiagramFlow({ label, items }) {
  return (
    <div style={{ margin: "14px 0" }}>
      {label && <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, background: "rgba(0,0,0,0.15)", borderRadius: 12, padding: "16px 18px" }}>
        {items.map((item, i) => (
          item.icon === "→" ? (
            <span key={i} style={{ color: "var(--text-muted)", fontSize: 16 }}>→</span>
          ) : item.icon === "VS" ? (
            <span key={i} style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 800, padding: "0 6px" }}>VS</span>
          ) : (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 78 }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{item.icon}</div>
              <div style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4, whiteSpace: "pre-line" }}>{item.text}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

function CodeBlock({ label, code, explanation }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ margin: "14px 0" }}>
      {label && <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 6 }}>{label}</div>}
      <div style={{ position: "relative" }}>
        <pre style={{ background: "#0d1117", border: "1px solid #30363d", borderRadius: 10, padding: "15px 48px 15px 18px", fontSize: 12.5, lineHeight: 1.8, overflowX: "auto", color: "#c9d1d9", margin: 0, fontFamily: "'JetBrains Mono','Fira Code','Courier New',monospace" }}>
          <code>{code}</code>
        </pre>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ position: "absolute", top: 10, right: 10, background: copied ? "#238636" : "#21262d", border: "1px solid #30363d", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#c9d1d9", cursor: "pointer", transition: "all 0.2s" }}>
          {copied ? "✓" : "Copy"}
        </button>
      </div>
      {explanation && <p style={{ margin: "8px 0 0 2px", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.65 }}>💬 {explanation}</p>}
    </div>
  );
}

// ─── TERMINAL EXERCISE ──────────────────────────────────────────────────────

function Terminal({ steps, color }) {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [showSol, setShowSol] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const cur = steps[step];

  useEffect(() => { inputRef.current?.focus(); }, [step]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  const norm = s => s.trim().replace(/\s+/g, " ").replace(/[""]/g, '"').replace(/['']/g, "'");

  const run = () => {
    if (!input.trim()) return;
    const ok = norm(input) === norm(cur.expected);
    setHistory(h => [...h,
      { type: "cmd", text: input, ok },
      { type: "out", text: ok ? `✓ ${cur.explanation}` : "Command not recognized — check syntax and try again.", ok },
    ]);
    setInput("");
    setShowHint(false);
    setShowSol(false);
    if (ok) {
      setTimeout(() => {
        if (step < steps.length - 1) setStep(s => s + 1);
        else setDone(true);
      }, 900);
    }
  };

  if (done) return (
    <div style={{ background: "rgba(35,134,54,0.1)", border: "1px solid #238636", borderRadius: 12, padding: 26, textAlign: "center" }}>
      <div style={{ fontSize: 38, marginBottom: 10 }}>🏆</div>
      <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 800 }}>Exercise Complete!</h3>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>All {steps.length} steps completed correctly.</p>
    </div>
  );

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #30363d" }}>
      {/* Title bar */}
      <div style={{ background: "#161b22", padding: "9px 16px", display: "flex", alignItems: "center", gap: 7, borderBottom: "1px solid #30363d" }}>
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
        <span style={{ marginLeft: 8, fontSize: 11.5, color: "#8b949e", fontFamily: "monospace" }}>bash — user@server</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#8b949e", background: "#21262d", padding: "2px 8px", borderRadius: 4 }}>Step {step + 1}/{steps.length}</span>
      </div>

      {/* Instruction */}
      <div style={{ background: `${color}0d`, borderBottom: `1px solid ${color}25`, padding: "13px 18px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color, marginBottom: 5 }}>Task {step + 1}</div>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, lineHeight: 1.55 }}>{cur.instruction}</p>
      </div>

      {/* History */}
      <div style={{ background: "#0d1117", minHeight: 100, maxHeight: 200, overflowY: "auto", padding: "12px 16px", fontFamily: "monospace", fontSize: 12.5 }}>
        {history.map((h, i) => (
          <div key={i} style={{ marginBottom: 5 }}>
            {h.type === "cmd" && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "#28c840", flexShrink: 0 }}>$</span>
                <span style={{ color: h.ok ? "#c9d1d9" : "#f87171" }}>{h.text}</span>
                <span>{h.ok ? "✓" : "✗"}</span>
              </div>
            )}
            {h.type === "out" && (
              <p style={{ margin: "2px 0 4px 18px", fontSize: 12, color: h.ok ? "#34d399" : "#f87171", lineHeight: 1.6 }}>{h.text}</p>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: "#0d1117", padding: "9px 16px", display: "flex", gap: 8, alignItems: "center", borderTop: "1px solid #21262d" }}>
        <span style={{ color: "#28c840", fontFamily: "monospace", fontSize: 14, flexShrink: 0 }}>$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && run()}
          placeholder="Type your command here and press Enter..."
          autoComplete="off" autoCorrect="off" spellCheck={false}
          style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#c9d1d9", fontFamily: "monospace", fontSize: 13, caretColor: "#c9d1d9" }}
        />
        <button onClick={run} style={{ background: color, border: "none", borderRadius: 6, padding: "6px 14px", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
          Run ↵
        </button>
      </div>

      {/* Controls */}
      <div style={{ background: "#0d1117", borderTop: "1px solid #21262d", padding: "9px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => { setShowHint(h => !h); setShowSol(false); }} style={{ background: "none", border: "1px solid #fbbf24", borderRadius: 6, padding: "4px 12px", color: "#fbbf24", fontSize: 11.5, cursor: "pointer" }}>
          💡 {showHint ? "Hide" : "Hint"}
        </button>
        <button onClick={() => { setShowSol(s => !s); setShowHint(false); }} style={{ background: "none", border: "1px solid #f87171", borderRadius: 6, padding: "4px 12px", color: "#f87171", fontSize: 11.5, cursor: "pointer" }}>
          🔓 {showSol ? "Hide" : "Show Solution"}
        </button>
        {step > 0 && (
          <button onClick={() => { setStep(s => s - 1); setInput(""); setShowHint(false); setShowSol(false); }} style={{ marginLeft: "auto", background: "none", border: "1px solid #30363d", borderRadius: 6, padding: "4px 12px", color: "#8b949e", fontSize: 11.5, cursor: "pointer" }}>
            ← Back
          </button>
        )}
      </div>

      {showHint && (
        <div style={{ background: "rgba(251,191,36,0.07)", padding: "10px 18px", borderTop: "1px solid #fbbf2425" }}>
          <p style={{ margin: 0, fontSize: 12.5, color: "#fbbf24" }}>💡 <strong>Hint:</strong> {cur.hint}</p>
        </div>
      )}
      {showSol && (
        <div style={{ background: "rgba(248,113,113,0.07)", padding: "12px 18px", borderTop: "1px solid #f8717125" }}>
          <div style={{ fontSize: 10.5, color: "#f87171", fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>SOLUTION</div>
          <code style={{ fontFamily: "monospace", fontSize: 13, color: "#f87171", display: "block", marginBottom: 8 }}>{cur.solution}</code>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "#8b949e", lineHeight: 1.6 }}>{cur.explanation}</p>
          <button onClick={() => { setInput(cur.solution); setShowSol(false); inputRef.current?.focus(); }} style={{ background: "#f87171", border: "none", borderRadius: 6, padding: "5px 14px", color: "#fff", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
            Use This Answer →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── QUIZ ────────────────────────────────────────────────────────────────────

function Quiz({ questions, color }) {
  const [cur, setCur] = useState(0);
  const [sel, setSel] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[cur];

  const pick = (i) => {
    if (answered) return;
    setSel(i);
    setAnswered(true);
    if (i === q.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (cur < questions.length - 1) { setCur(c => c + 1); setSel(null); setAnswered(false); }
    else setDone(true);
  };

  const restart = () => { setCur(0); setSel(null); setAnswered(false); setScore(0); setDone(false); };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 28, textAlign: "center" }}>
        <div style={{ fontSize: 46, marginBottom: 10 }}>{pct === 100 ? "🏆" : pct >= 75 ? "🎯" : "📚"}</div>
        <h3 style={{ margin: "0 0 6px", fontSize: 21, fontWeight: 800 }}>{score}/{questions.length} Correct</h3>
        <p style={{ margin: "0 0 18px", color: "var(--text-muted)", fontSize: 14 }}>
          {pct === 100 ? "Perfect! You've mastered this module." : pct >= 75 ? "Great job! Review the explanations on missed questions." : "Keep studying — re-read the lessons and try again."}
        </p>
        <div style={{ height: 7, background: "var(--border)", borderRadius: 999, maxWidth: 300, margin: "0 auto 20px" }}>
          <div style={{ height: "100%", borderRadius: 999, width: `${pct}%`, background: pct >= 75 ? "#34d399" : pct >= 50 ? "#fbbf24" : "#f87171", transition: "width 0.8s" }} />
        </div>
        <button onClick={restart} style={{ background: color, border: "none", borderRadius: 10, padding: "10px 26px", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color }}>Q{cur + 1} of {questions.length}</span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Score: {score}/{cur}</span>
      </div>
      <div style={{ height: 4, background: "var(--border)", borderRadius: 999, marginBottom: 18 }}>
        <div style={{ height: "100%", borderRadius: 999, width: `${(cur / questions.length) * 100}%`, background: color, transition: "width 0.4s" }} />
      </div>
      <h3 style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 700, lineHeight: 1.55 }}>{q.question}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
        {q.options.map((opt, i) => {
          let bg = "rgba(0,0,0,0.1)", border = "var(--border)", col = "var(--text)";
          if (answered) {
            if (i === q.correct) { bg = "rgba(52,211,153,0.1)"; border = "#34d399"; col = "#34d399"; }
            else if (i === sel) { bg = "rgba(248,113,113,0.1)"; border = "#f87171"; col = "#f87171"; }
          }
          return (
            <button key={i} onClick={() => pick(i)} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "11px 16px", textAlign: "left", cursor: answered ? "default" : "pointer", color: col, fontSize: 13, lineHeight: 1.5, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, background: answered && (i === q.correct || i === sel) ? (i === q.correct ? "#34d399" : "#f87171") : "transparent", border: `1px solid ${answered ? (i === q.correct ? "#34d399" : i === sel ? "#f87171" : "var(--border)") : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: answered && (i === q.correct || i === sel) ? "#fff" : "var(--text-muted)" }}>
                {answered ? (i === q.correct ? "✓" : i === sel ? "✗" : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <div style={{ background: sel === q.correct ? "rgba(52,211,153,0.07)" : "rgba(248,113,113,0.07)", border: `1px solid ${sel === q.correct ? "#34d39930" : "#f8717130"}`, borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: sel === q.correct ? "#34d399" : "#f87171", marginBottom: 5 }}>
            {sel === q.correct ? "✅ Correct!" : "❌ Not quite"}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>{q.explanation}</p>
        </div>
      )}
      {answered && (
        <button onClick={next} style={{ background: color, border: "none", borderRadius: 10, padding: "10px 0", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", width: "100%" }}>
          {cur < questions.length - 1 ? "Next Question →" : "See Results →"}
        </button>
      )}
    </div>
  );
}

// ─── LESSON RENDERER ────────────────────────────────────────────────────────

function Lesson({ lesson }) {
  return (
    <div>
      {lesson.content.map((b, i) => {
        if (b.type === "text") return <p key={i} style={{ fontSize: 14.5, lineHeight: 1.82, color: "var(--text-muted)", margin: "0 0 14px" }}>{b.body}</p>;
        if (b.type === "callout") return <CalloutBox key={i} variant={b.variant} title={b.title} body={b.body} />;
        if (b.type === "code") return <CodeBlock key={i} label={b.label} code={b.code} explanation={b.explanation} />;
        if (b.type === "diagram") return <DiagramFlow key={i} label={b.label} items={b.items} />;
        return null;
      })}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function LinuxHardeningCourse({ t }) {
  const navigate = useNavigate();
  const [activeMod, setActiveMod] = useState(0);
  const [tab, setTab] = useState(0); // 0=lessons 1=exercises 2=quiz
  const [lessonIdx, setLessonIdx] = useState(0);
  const [done, setDone] = useState({}); // { "modIdx-lessonIdx": true }
  const [modsDone, setModsDone] = useState(new Set());

  const mod = COURSE[activeMod];
  const lesson = mod.lessons[lessonIdx];
  const totalLessons = COURSE.reduce((s, m) => s + m.lessons.length, 0);
  const doneCount = Object.keys(done).length;
  const progress = Math.round((doneCount / totalLessons) * 100);

  const switchMod = (i) => { setActiveMod(i); setLessonIdx(0); setTab(0); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const completLesson = () => {
    const key = `${activeMod}-${lessonIdx}`;
    setDone(d => ({ ...d, [key]: true }));
    if (lessonIdx < mod.lessons.length - 1) { setLessonIdx(l => l + 1); }
    else { setModsDone(s => new Set([...s, activeMod])); setTab(1); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const TABS = [
    { label: "📖 Lessons", sub: `${mod.lessons.length} lessons` },
    { label: "🛠️ Exercises", sub: `${mod.exercises.length} exercise${mod.exercises.length > 1 ? "s" : ""}` },
    { label: "🧠 Quiz", sub: `${mod.quiz.length} questions` },
  ];

  return (
    <div style={{ paddingTop: 88, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px" }}>

        {/* Back */}
        <button onClick={() => navigate("/projects")} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "var(--text-muted)", fontSize: 12.5, marginBottom: 26, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.color = t.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}>
          ← Back to Projects
        </button>

        {/* Hero */}
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, padding: "30px 34px", marginBottom: 26, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -10, top: -10, fontSize: 130, opacity: 0.03, userSelect: "none", pointerEvents: "none" }}>🛡️</div>
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: t.accent, display: "block", marginBottom: 8 }}>Interactive Learning Path</span>
          <h1 style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 900, letterSpacing: -1.5, margin: "0 0 10px" }}>Linux Server Hardening</h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 560, margin: "0 0 22px", lineHeight: 1.75 }}>
            Hands-on course covering SSH security, sudo configuration, Apache2 and Nginx hardening. Read the concepts, practice in the simulated terminal, and test yourself with quizzes.
          </p>
          {/* Stats */}
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginBottom: 20 }}>
            {[["📚", COURSE.length, "Modules"], ["📖", totalLessons, "Lessons"], ["🛠️", COURSE.reduce((s, m) => s + m.exercises.length, 0), "Exercises"], ["🧠", COURSE.reduce((s, m) => s + m.quiz.length, 0), "Quiz Qs"], ["⏱️", "~1h 45m", "Duration"]].map(([icon, val, lbl]) => (
              <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{lbl}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ maxWidth: 460 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-muted)", marginBottom: 5 }}>
              <span>{doneCount} / {totalLessons} lessons completed</span>
              <span style={{ color: t.accent, fontWeight: 700 }}>{progress}%</span>
            </div>
            <div style={{ height: 7, background: "var(--border)", borderRadius: 999 }}>
              <div style={{ height: "100%", borderRadius: 999, width: `${progress}%`, background: `linear-gradient(90deg, ${t.accent}, ${t.accentSecondary})`, transition: "width 0.6s" }} />
            </div>
          </div>
        </div>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 22, alignItems: "start" }}>

          {/* Sidebar */}
          <div style={{ position: "sticky", top: 96 }}>
            {/* Modules */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 13, marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 10px 3px" }}>Course Modules</p>
              {COURSE.map((m, i) => {
                const isActive = i === activeMod;
                const modDone = modsDone.has(i);
                const lessonsCompleted = m.lessons.filter((_, li) => done[`${i}-${li}`]).length;
                return (
                  <button key={m.id} onClick={() => switchMod(i)} style={{ width: "100%", textAlign: "left", background: isActive ? `${m.color}10` : "none", border: isActive ? `1px solid ${m.color}30` : "1px solid transparent", borderRadius: 10, padding: "9px 11px", cursor: "pointer", marginBottom: 4, transition: "all 0.18s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ width: 28, height: 28, borderRadius: 8, fontSize: 14, background: modDone ? "rgba(35,134,54,0.2)" : `${m.color}15`, border: `1px solid ${modDone ? "#238636" : m.color + "25"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {modDone ? "✓" : m.icon}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Module {i + 1}</div>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: isActive ? m.color : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.title}</div>
                      </div>
                    </div>
                    <div style={{ height: 3, background: "var(--border)", borderRadius: 999 }}>
                      <div style={{ height: "100%", borderRadius: 999, width: `${(lessonsCompleted / m.lessons.length) * 100}%`, background: modDone ? "#238636" : m.color, transition: "width 0.4s" }} />
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 3 }}>{lessonsCompleted}/{m.lessons.length} · {m.difficulty} · {m.duration}</div>
                  </button>
                );
              })}
            </div>

            {/* Lesson list for active module */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 13 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 8px 3px" }}>Lessons</p>
              {mod.lessons.map((l, li) => {
                const isActive = li === lessonIdx && tab === 0;
                const isDone = done[`${activeMod}-${li}`];
                return (
                  <button key={l.id} onClick={() => { setLessonIdx(li); setTab(0); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ width: "100%", textAlign: "left", background: isActive ? `${mod.color}08` : "none", border: isActive ? `1px solid ${mod.color}25` : "1px solid transparent", borderRadius: 8, padding: "7px 9px", cursor: "pointer", marginBottom: 2, display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s" }}>
                    <span style={{ width: 19, height: 19, borderRadius: "50%", flexShrink: 0, background: isDone ? "#238636" : isActive ? mod.color : "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: isDone || isActive ? "#fff" : "var(--text-muted)" }}>
                      {isDone ? "✓" : li + 1}
                    </span>
                    <span style={{ fontSize: 11.5, color: isActive ? mod.color : "var(--text)", lineHeight: 1.4 }}>{l.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div>
            {/* Module header */}
            <div style={{ background: "var(--bg-card)", border: `1px solid ${mod.color}25`, borderRadius: 16, padding: "20px 24px", marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, fontSize: 24, background: `${mod.color}15`, border: `1px solid ${mod.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{mod.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: mod.color }}>Module {activeMod + 1}</span>
                  <span style={{ fontSize: 10, background: `${mod.color}12`, color: mod.color, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{mod.difficulty}</span>
                  <span style={{ fontSize: 10, color: "var(--text-muted)" }}>⏱ {mod.duration}</span>
                </div>
                <h2 style={{ margin: 0, fontSize: "clamp(16px, 2.5vw, 22px)", fontWeight: 800 }}>{mod.title}</h2>
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--text-muted)" }}>{mod.tagline}</p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
              {TABS.map((tb, i) => (
                <button key={i} onClick={() => setTab(i)} style={{ background: tab === i ? mod.color : "var(--bg-card)", border: `1px solid ${tab === i ? mod.color : "var(--border)"}`, borderRadius: 10, padding: "8px 18px", cursor: "pointer", color: tab === i ? "#000" : "var(--text-muted)", fontSize: 13, fontWeight: tab === i ? 700 : 400, transition: "all 0.18s" }}>
                  {tb.label}
                  <span style={{ fontSize: 10.5, display: "block", opacity: 0.65, fontWeight: 400 }}>{tb.sub}</span>
                </button>
              ))}
            </div>

            {/* LESSONS */}
            {tab === 0 && (
              <div>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "22px 26px", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: mod.color }}>Lesson {lessonIdx + 1} of {mod.lessons.length}</span>
                    {done[`${activeMod}-${lessonIdx}`] && <span style={{ fontSize: 10, background: "rgba(35,134,54,0.15)", color: "#34d399", padding: "2px 9px", borderRadius: 20, fontWeight: 700 }}>✓ Completed</span>}
                  </div>
                  <h3 style={{ margin: "0 0 16px", fontSize: 19, fontWeight: 800 }}>{lesson.title}</h3>
                  <Lesson lesson={lesson} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <button disabled={lessonIdx === 0} onClick={() => { setLessonIdx(l => l - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 20px", cursor: lessonIdx === 0 ? "not-allowed" : "pointer", color: "var(--text-muted)", fontSize: 13, opacity: lessonIdx === 0 ? 0.4 : 1 }}>
                    ← Previous
                  </button>
                  <button onClick={completLesson} style={{ background: `linear-gradient(135deg, ${mod.color}, ${t.accentSecondary})`, border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: `0 4px 16px ${mod.color}30`, transition: "all 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                    {lessonIdx < mod.lessons.length - 1 ? "✓ Mark Complete & Next →" : "✓ Finish Lessons → Exercises"}
                  </button>
                </div>
              </div>
            )}

            {/* EXERCISES */}
            {tab === 1 && (
              <div>
                {mod.exercises.map(ex => (
                  <div key={ex.id} style={{ marginBottom: 22 }}>
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", marginBottom: 14 }}>
                      <h3 style={{ margin: "0 0 7px", fontSize: 16, fontWeight: 800 }}>{ex.title}</h3>
                      <p style={{ margin: "0 0 12px", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.65 }}>{ex.description}</p>
                      <div style={{ background: `${mod.color}08`, border: `1px solid ${mod.color}22`, borderRadius: 10, padding: "11px 15px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: mod.color, marginBottom: 4 }}>Scenario</div>
                        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65 }}>{ex.scenario}</p>
                      </div>
                    </div>
                    <Terminal key={ex.id} steps={ex.steps} color={mod.color} />
                  </div>
                ))}
                <div style={{ textAlign: "center", paddingTop: 8 }}>
                  <button onClick={() => setTab(2)} style={{ background: `linear-gradient(135deg, ${mod.color}, ${t.accentSecondary})`, border: "none", borderRadius: 10, padding: "11px 28px", cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700 }}>
                    Ready for the Quiz? →
                  </button>
                </div>
              </div>
            )}

            {/* QUIZ */}
            {tab === 2 && (
              <div>
                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "16px 22px", marginBottom: 16 }}>
                  <h3 style={{ margin: "0 0 5px", fontSize: 16, fontWeight: 800 }}>🧠 Module Quiz — {mod.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>{mod.quiz.length} questions to test your understanding. Explanations shown after each answer.</p>
                </div>
                <Quiz key={`${activeMod}-quiz`} questions={mod.quiz} color={mod.color} />
                {activeMod < COURSE.length - 1 && (
                  <div style={{ textAlign: "center", marginTop: 18 }}>
                    <button onClick={() => switchMod(activeMod + 1)} style={{ background: "none", border: `1px solid ${mod.color}`, borderRadius: 10, padding: "10px 24px", cursor: "pointer", color: mod.color, fontSize: 13, fontWeight: 700 }}>
                      Next Module: {COURSE[activeMod + 1].title} →
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
