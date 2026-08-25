# PulseWork — Combell Web Hosting Deployment Guide

A step-by-step installation manual tailored specifically for deploying the **PulseWork Work Management, CRM & Peppol E-Invoicing Suite** on **Combell Web Hosting** (or similar Apache/LiteSpeed web hosting providers like one.com, Hostinger, SiteGround, cPanel, Plesk).

---

## 📑 Table of Contents

1. [Why Combell Hosting?](#1-why-combell-hosting)
2. [Quick Summary (3-Minute Setup)](#2-quick-summary-3-minute-setup)
3. [Method 1: Deploy via Combell Control Panel & Web File Manager (Recommended)](#3-method-1-deploy-via-combell-control-panel--web-file-manager-recommended)
4. [Method 2: Deploy via FTPS / FileZilla](#4-method-2-deploy-via-ftps--filezilla)
5. [Method 3: Deploy via Combell SSH](#5-method-3-deploy-via-combell-ssh)
6. [Setting up a Subdomain (e.g. `crm.yourdomain.be`) on Combell](#6-setting-up-a-subdomain-eg-crmyourdomainbe-on-combell)
7. [Activating Free SSL / HTTPS on Combell](#7-activating-free-ssl--https-on-combell)
8. [Peppol & Security Configuration on Combell](#8-peppol--security-configuration-on-combell)
9. [Combell Troubleshooting & FAQ](#9-combell-troubleshooting--faq)

---

## 1. Why Combell Hosting?

PulseWork is built as a state-of-the-art Single Page Application (SPA) with embedded UBL 2.1 XML generation and EN 16931 Schematron validation.

When deployed to Combell:
- **No Node.js background process required on the server**: Runs as an ultra-fast static web application on Combell's enterprise Apache/LiteSpeed web cluster.
- **Includes Pre-Configured `.htaccess`**: Automatically forces HTTPS, handles clean URL routing (no 404 on page refresh), enables Gzip compression, and applies security headers.
- **Full Peppol E-Invoicing & Belgian Reference Support**: Runs directly in the browser with zero server overhead.

---

## 2. Quick Summary (3-Minute Setup)

```mermaid
flowchart LR
    A["💻 1. Run 'npm run package:combell'"] --> B["📦 2. Generates 'combell_upload.zip'"]
    B --> C["🌐 3. Log in to Combell Control Panel"]
    C --> D["📁 4. Upload & Extract in /www/ or /www/subsites/"]
    D --> E["🚀 5. Live at https://crm.yourdomain.be"]
```

---

## 3. Method 1: Deploy via Combell Control Panel & Web File Manager (Recommended)

This is the easiest method and requires no command-line work on the server.

### Step 1: Package the Application Locally
In your project folder on your computer, run:
```bash
npm run package:combell
```
*(Or run `npm run build` and copy `public/.htaccess` into `./dist/`)*.

This will generate a ready-to-upload archive: **`combell_upload.zip`**.

---

### Step 2: Log in to Combell Control Panel
1. Open your browser and navigate to: **[https://controlpanel.combell.com](https://controlpanel.combell.com)**
2. Log in with your Combell customer credentials.

---

### Step 3: Open Web File Manager
1. Click **My Products** in the top navigation bar.
2. Under **Web Hosting**, click your domain name (e.g., `yourcompany.be`).
3. In the left menu, select **Files** ➔ **Web File Manager**.

---

### Step 4: Upload and Extract
1. In the Web File Manager, navigate to your website document root:
   - For your main website: **`/www/`**
   - For a subdomain (e.g. `crm.yourcompany.be`): **`/www/subsites/crm.yourcompany.be/`**
2. Click the **Upload** button in the toolbar.
3. Select **`combell_upload.zip`** from your computer.
4. Once uploaded, right-click `combell_upload.zip` and select **Extract** / **Unzip**.
5. Ensure the extracted files (including `index.html`, `assets/`, and `.htaccess`) are placed directly in the website folder.
6. Delete `combell_upload.zip` to clean up.

---

### Step 5: Test Your Application
Open your browser and navigate to:
```
https://yourcompany.be/   (or https://crm.yourcompany.be/)
```
Your PulseWork platform is now live on Combell!

---

## 4. Method 2: Deploy via FTPS / FileZilla

If you prefer uploading via FTP:

### Step 1: Find your Combell FTP Credentials
In the Combell Control Panel:
- Go to **Web Hosting** ➔ Select your domain ➔ **FTP** ➔ **FTP Users**.
- Note your **FTP Hostname** (e.g., `ftp.yourdomain.be`), **Username**, and **Password**.

### Step 2: Connect via FileZilla (Secure FTPS)
1. Open FileZilla.
2. Configure connection:
   - **Host**: `ftp.yourdomain.be` (or your Combell server IP)
   - **Protocol**: `FTP - File Transfer Protocol`
   - **Encryption**: `Require explicit FTP over TLS`
   - **User**: Your Combell FTP username
   - **Port**: `21`
3. Click **Quickconnect**.

### Step 3: Upload `./dist` Directory
1. On your computer (left panel in FileZilla), open your project's `./dist/` folder.
2. On Combell (right panel in FileZilla), navigate to `/www/` (or `/www/subsites/crm.yourdomain.be/`).
3. Upload all files from `./dist/` (make sure `.htaccess` is uploaded!).

---

## 5. Method 3: Deploy via Combell SSH

If your Combell hosting package includes SSH access:

### Step 1: Connect to Combell via SSH
```bash
ssh your_username@ssh.yourdomain.be
```

### Step 2: Navigate to Web Root & Pull Repository
```bash
cd /data/sites/web/yourdomainbe/subsites/crm.yourdomain.be
git clone https://github.com/webdotpulse/crm.git temp_crm
cd temp_crm
npm install
npm run build
cp -r dist/* ../
cp public/.htaccess ../
cd ..
rm -rf temp_crm
```

---

## 6. Setting up a Subdomain (e.g. `crm.yourdomain.be`) on Combell

To host PulseWork on a dedicated subdomain such as `crm.yourcompany.be`:

1. In Combell Control Panel, go to **Web Hosting** ➔ Select domain.
2. In the left menu, select **Domain Names** / **Subdomains**.
3. Click **+ Add Subdomain**.
4. Enter `crm` as the subdomain name.
5. Set the document root folder to:
   ```
   /www/subsites/crm.yourdomain.be
   ```
6. Click **Save**. Combell will create the folder automatically.

---

## 7. Activating Free SSL / HTTPS on Combell

Combell provides free Let's Encrypt SSL certificates for all domains and subdomains:

1. In Combell Control Panel, go to **Web Hosting** ➔ Select domain.
2. In the left menu, select **Security & SSL** ➔ **SSL Certificates**.
3. Click **Add Free Let's Encrypt Certificate**.
4. Select your domain or subdomain (e.g., `crm.yourdomain.be`).
5. Click **Activate**.
6. The included `.htaccess` file will automatically redirect all HTTP traffic to HTTPS!

---

## 8. Combell MySQL Database Setup & First-Run Installer

PulseWork supports full persistence on your **Combell MySQL Database Cluster** via a high-performance PHP PDO backend bridge (`/api/db.php`).

### Step 1: Create a MySQL Database in Combell Control Panel
1. Log in to **[https://controlpanel.combell.com](https://controlpanel.combell.com)**.
2. Go to **My Products** ➔ **Web Hosting** ➔ Select your domain.
3. In the left menu, select **Databases** ➔ **MySQL**.
4. Click **+ Add Database**.
5. Enter a database suffix (e.g. `pulsework` which becomes `ID123456_pulsework`).
6. Create a database user and generate a strong password.
7. Note your connection details:
   - **MySQL Hostname**: e.g., `mysql123.combell-hosting.com` (or `localhost`)
   - **Port**: `3306`
   - **Database Name**: e.g., `ID123456_pulsework`
   - **Username**: e.g., `ID123456_usr`
   - **Password**: `YourChosenPassword`

---

### Step 2: Configure Database in First-Run Wizard
1. Open your browser and navigate to your website (e.g. `https://crm.yourdomain.be/`).
2. The **First-Run Installation Wizard** will automatically launch.
3. In **Step 2 (Database Configuration)**:
   - Select **Combell MySQL Database (Recommended for Hosting)**.
   - Enter your MySQL Host, Port, Database Name, Username, and Password.
   - Click **Test MySQL Connection**. PulseWork will ping the Combell MySQL server, display latency, and verify database access.
4. Continue through the wizard to configure your Organization and create your **Primary Super Administrator** account.
5. Click **Initialize & Launch PulseWork** — the installer will automatically generate all relational tables and securely provision your administrator credentials into MySQL!

---

## 9. Combell Troubleshooting & FAQ

### Q1: `When I refresh a page (e.g. /quotes or /projects), I get a 404 error on Combell.`
**Solution**: Make sure the `.htaccess` file is uploaded into your website root folder. The `.htaccess` tells Combell's Apache server to route all subpages to `index.html`.
*(In FileZilla, press `Ctrl + R` or enable "Force showing hidden files" to verify `.htaccess` is present)*.

### Q2: `How do I update PulseWork to a new version on Combell?`
**Solution**:
1. Run `npm run package:combell` on your computer.
2. In Combell Web File Manager or FTP, upload and replace the contents of `/www/` with the new files.

### Q3: `Is my client and financial data secure on Combell?`
**Solution**: Yes. PulseWork stores data securely in the client local database and provides 1-click **Export Full Backup (JSON)** in **Settings**. All traffic is encrypted over Combell's HTTPS SSL certificate.

---

**Need Assistance?**
Refer to [Combell Knowledge Base](https://help.combell.com) or submit questions on the [PulseWork Repository](https://github.com/webdotpulse/crm).
