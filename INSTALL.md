# PulseWork — Native Installation & Deployment Manual

Welcome to the comprehensive installation and operations manual for the **PulseWork All-in-One Work Management, CRM & Peppol E-Invoicing Platform**.

This guide covers 100% native bare-metal / VPS installation using Node.js, systemd services, PM2 process manager, and native Nginx reverse proxy with SSL.

---

## 📑 Table of Contents

1. [System Prerequisites](#1-system-prerequisites)
2. [Quick Automated Native Installation](#2-quick-automated-native-installation)
3. [Step-by-Step Manual Installation](#3-step-by-step-manual-installation)
4. [Production Linux Service (systemd)](#4-production-linux-service-systemd)
5. [Production Process Management (PM2)](#5-production-process-management-pm2)
6. [Nginx Web Server & HTTPS SSL Setup](#6-nginx-web-server--https-ssl-setup)
7. [Peppol BIS 3.0 Network Setup](#7-peppol-bis-30-network-setup)
8. [Data Backup & Migration](#8-data-backup--migration)
9. [Troubleshooting FAQ](#9-troubleshooting-faq)

---

## 1. System Prerequisites

Ensure your Linux, macOS, or Windows system meets the following specifications:

| Requirement | Minimum | Recommended |
|---|---|---|
| **Operating System** | Linux (Ubuntu 20.04+, Debian 11+, RHEL/CentOS 8+, Arch), macOS 12+, Windows 10/11 | Ubuntu 22.04 LTS or Debian 12 |
| **Node.js** | `v18.0.0` or higher | `v20.x LTS` or `v22.x` |
| **Package Manager** | `npm v9.0+` or `pnpm v8.0+` | `npm` |
| **RAM** | 512 MB | 1 GB+ |
| **Disk Space** | 150 MB | 500 MB |
| **Ports** | `5173` (Dev) or `3000` / `80` (Prod) | Configurable |

### Checking Node.js & npm:
```bash
node -v   # e.g. v20.12.0 (Must be >= 18.0.0)
npm -v    # e.g. 10.5.0
```

If Node.js is not yet installed on your server:
```bash
# Ubuntu / Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

# CentOS / RHEL / Fedora
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs git
```

---

## 2. Quick Automated Native Installation

PulseWork includes automated installer scripts for Linux, macOS, and Windows.

### On Linux / macOS:

1. Clone or navigate to the repository directory:
   ```bash
   cd /path/to/crm
   ```

2. Run the automated installer:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

The script will automatically:
- Verify Node.js and npm versions.
- Install application dependencies (`npm install`).
- Build the optimized production bundle (`npm run build`).
- Generate native launch scripts (`start.sh`) and systemd service templates (`pulsework.service.example`).

3. Start the application:
   ```bash
   # Development Server with instant Hot-Reload:
   ./start.sh

   # Or Production Server on port 3000:
   ./start.sh --prod
   ```

---

### On Windows:

1. Open PowerShell or Command Prompt in the project folder.
2. Run:
   ```cmd
   install.bat
   ```
3. Start the application:
   ```cmd
   npm run dev
   ```

---

## 3. Step-by-Step Manual Installation

If you prefer installing step-by-step manually:

### Step 1: Clone Repository
```bash
git clone https://github.com/webdotpulse/crm.git
cd crm
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Compile Production Bundle
```bash
npm run build
```
This produces an optimized production bundle inside the `./dist` directory.

### Step 4: Run Application
```bash
# For Development:
npm run dev

# For Production Hosting (port 3000):
npm run preview -- --host 0.0.0.0 --port 3000
```

Access the platform at `http://localhost:5173` (dev) or `http://localhost:3000` (production).

---

## 4. Production Linux Service (systemd)

To run PulseWork natively as a background service that automatically boots on system restart:

1. Copy the generated service file to the system directory:
   ```bash
   sudo cp pulsework.service.example /etc/systemd/system/pulsework.service
   ```

2. Reload systemd, enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable pulsework
   sudo systemctl start pulsework
   ```

3. Check service status:
   ```bash
   sudo systemctl status pulsework
   ```

4. View live logs:
   ```bash
   sudo journalctl -u pulsework -f
   ```

To stop or restart:
```bash
sudo systemctl restart pulsework
sudo systemctl stop pulsework
```

---

## 5. Production Process Management (PM2)

If using PM2 for process monitoring, cluster mode, and auto-restarts:

1. Install PM2 globally:
   ```bash
   sudo npm install -g pm2
   ```

2. Start PulseWork using the included configuration:
   ```bash
   pm2 start ecosystem.config.cjs
   ```

3. Save the process list to start automatically on system reboot:
   ```bash
   pm2 save
   pm2 startup
   ```

4. Monitor application metrics:
   ```bash
   pm2 status
   pm2 logs pulsework-crm
   ```

---

## 6. Nginx Web Server & HTTPS SSL Setup

For production deployments on your custom domain (e.g. `crm.yourcompany.com`) with automated SSL certificates:

### Step 1: Install Nginx
```bash
sudo apt-get update
sudo apt-get install -y nginx
```

### Step 2: Create Site Configuration
Create `/etc/nginx/sites-available/pulsework`:
```nginx
server {
    listen 80;
    server_name crm.yourcompany.com;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 3: Enable Site and Obtain Free SSL Certificate
```bash
sudo ln -s /etc/nginx/sites-available/pulsework /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Issue Let's Encrypt SSL Certificate
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d crm.yourcompany.com
```

---

## 7. Peppol BIS 3.0 Network Setup

To configure electronic invoicing for legal compliance in Europe (Belgium, Netherlands, Germany, etc.):

1. Open PulseWork and navigate to **Settings & Profile** (`http://localhost:5173` or your production domain).
2. Configure your organization coordinates:
   - **Legal Name** and **VAT Identifier** (e.g. `BE0849294901`).
   - **Peppol Scheme (ISO 6523)**:
     - `0208`: Belgium Enterprise Number (KBO/BCE)
     - `0106`: Netherlands Chamber of Commerce (KvK)
     - `9930`: Germany VAT
     - `0088`: Global Location Number (GLN)
   - **Peppol Endpoint ID**: Your organization's electronic identifier.
   - **SEPA Bank IBAN & BIC/SWIFT**.
   - **Access Point Gateway Credentials**: Enter your certified Access Point provider API credentials (e.g. Billit, Storecove, Scrive, UnifiedPost, or custom AS4 endpoint).
3. Click **Save Settings**.
4. In the **Peppol BIS Hub**, test the **Schematron Rules Validator** on an invoice to verify 100% EN 16931 compliance before sending.

---

## 8. Data Backup & Migration

PulseWork supports full JSON snapshots of all customer data, deals, quotations, projects, timesheets, and invoices.

### Export Backup:
1. Navigate to **Settings** ➔ **Data Backup & Demo Reset**.
2. Click **Export Full Backup (JSON)**.
3. Save the downloaded `.json` timestamped file.

### Restore Backup:
1. Open the JSON backup file in a text editor and copy the text.
2. Paste the JSON text into the **Restore from JSON Backup** box in Settings.
3. Click **Import**.

---

## 9. Troubleshooting FAQ

### Q1: `Error: listen EADDRINUSE: address already in use :::5173`
**Solution**: Another process is using port 5173. Either terminate the existing process or specify an alternative port:
```bash
npm run dev -- --port 5174
```

### Q2: `npm install fails with node-gyp or python errors`
**Solution**: PulseWork uses pure modern TypeScript/JavaScript dependencies with zero native binary build dependencies. Ensure you are running Node.js `>= 18.0.0`.

### Q3: `How do I reset to clean demo data?`
**Solution**: Navigate to **Settings** ➔ Click **Reset to Demo Data**.

### Q4: `Can I change the currency from EUR to USD or GBP?`
**Solution**: Yes! Go to **Settings** and adjust the Default Currency and Tax Rates. Quotations and invoices will automatically calculate in your selected currency.

---

**Need Help?**
Submit issues or questions directly to the [PulseWork Repository](https://github.com/webdotpulse/crm).
