# PulseWork — All-in-One Work Management, CRM & Peppol E-Invoicing Suite

<p align="center">
  <img src="public/icon-512.svg" width="96" height="96" alt="PulseWork Logo" />
</p>

<p align="center">
  <strong>The open, modular work management platform engineered for SMBs, digital agencies, field services, and European B2B enterprises.</strong><br>
  CRM • Sales Pipeline • Dynamic Proposals • Contracts • Field Work Orders • Projects & Gantt • Timesheets • Invoicing • Peppol BIS Billing 3.0 • Belgian & EU Tax Engine
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Peppol-BIS_Billing_3.0_Compliant-0052cc.svg" alt="Peppol BIS 3.0" />
  <img src="https://img.shields.io/badge/EU_Standard-EN_16931_Compliant-blue.svg" alt="EN 16931" />
  <img src="https://img.shields.io/badge/Belgian_Tax-Intervat_&_KBO_Integrated-38b995.svg" alt="Belgian Intervat & KBO" />
  <img src="https://img.shields.io/badge/Security-2FA_TOTP_%2B_SHA--256_Audit-605dba.svg" alt="2FA TOTP" />
  <img src="https://img.shields.io/badge/Architecture-PWA_Offline_Ready-fab758.svg" alt="PWA Offline Ready" />
  <img src="https://img.shields.io/badge/License-Proprietary-slate.svg" alt="License" />
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Industry Presets](#-industry-presets)
- [Core Feature Modules](#-core-feature-modules)
  - [1. European E-Invoicing & Peppol Hub](#1-european-e-invoicing--peppol-hub-en-16931)
  - [2. Belgian & European Tax Engine](#2-belgian--european-tax-engine)
  - [3. CRM & Client Intelligence](#3-crm--client-intelligence)
  - [4. Sales Pipeline, Interactive Quotes & Contracts](#4-sales-pipeline-interactive-quotes--contracts)
  - [5. Field Service & Work Orders ("Werkbonnen")](#5-field-service--work-orders-werkbonnen)
  - [6. Project Delivery, Gantt & Timesheets](#6-project-delivery-gantt--timesheets)
  - [7. Logistics, Multi-Location Inventory & Procurement](#7-logistics-multi-location-inventory--procurement)
  - [8. Banking, SEPA Direct Debit & CODA / CAMT.053](#8-banking-sepa-direct-debit--coda--camt053)
  - [9. Helpdesk & HR Capacity Planning](#9-helpdesk--hr-capacity-planning)
  - [10. PulseAI & OCR Studio](#10-pulseai--ocr-studio)
  - [11. Enterprise Security, 2FA & Audit Logs](#11-enterprise-security-2fa--audit-logs)
  - [12. Integrations & Developer REST API](#12-integrations--developer-rest-api)
- [Technology Stack & Design System](#-technology-stack--design-system)
- [Quick Start Guide](#-quick-start-guide)
- [Deployment Options](#-deployment-options)
  - [Combell & cPanel Shared Hosting](#-combell--cpanel-shared-hosting-recommended-for-smbs)
  - [Native Linux VPS / Bare Metal (systemd & PM2)](#-native-linux-vps--bare-metal-systemd--pm2)
- [Documentation Links](#-documentation-links)

---

## 🌟 Overview

**PulseWork** is a unified business operating system and work management platform designed to replace fragmented SaaS toolchains. By bringing together CRM, sales pipelines, itemized proposals, contracts, project planning, timesheets, field work orders, expenses, and automated billing, PulseWork streamlines every stage of client engagement.

PulseWork includes native compliance with European e-invoicing mandates, featuring real-time **Peppol BIS Billing 3.0 UBL 2.1** generation, **EN 16931 Schematron validation**, Belgian **KBO** enterprise directory lookups, structured modulo-97 payments (`+++xxx/xxxx/xxxxx+++`), and **CODA / CAMT.053** bank reconciliation.

---

## 🎯 Industry Presets

PulseWork features a modular architecture with **28 configurable modules** that can be activated on demand or applied via 1-click industry profiles:

| Preset | Target Audience | Highlighted Modules |
|---|---|---|
| **All-in-One ERP** | Growing SMBs & Mid-Market Enterprises | Full suite of all 28 modules enabled |
| **Digital Agency** | Consultancies, Marketing Agencies, Dev Studios | CRM, Deals, Interactive Quotes, Retainers, Gantt Projects, Timesheet Invoicing, Helpdesk, HR Capacity |
| **Field Service & Trades** | Electricians, HVAC, Plumbers, Contractors, Installers | Mobile Work Orders ("Werkbonnen"), Van Stock, Serial Tracking, Mileage Reimbursement, Digital Sign-on-Glass |
| **Freelancer / Solo Pro** | Freelance Developers, Designers, Advisors | CRM, Invoicing, Peppol BIS 3.0, Expense OCR, 30-60-90 Day Cash Flow Forecasting, Mileage |
| **Wholesale & Logistics** | Distributors, Import/Export, B2B Supplies | Multi-Location Warehouses, QR Barcodes, Purchase Orders (3-Way Match), Dunning Engine, SEPA B2B Mandates |

---

## 🚀 Core Feature Modules

### 1. European E-Invoicing & Peppol Hub (EN 16931)
- **Peppol BIS Billing 3.0 UBL 2.1 Generator**: 100% compliant XML generation covering standard B2B/B2G invoices, credit notes, and corrective billing.
- **Syntax-Highlighted Live XML Inspector**: Real-time UBL inspector with validation tree and 1-click `.xml` download.
- **EN 16931 Schematron Rules Validator**: Live validation engine reporting rule compliance before transmission.
- **AS4 Gateway Dispatcher**: Simulated transmission gateway with signed Message Disposition Notification (MDN) receipts and audit trails.
- **OpenPeppol SMP / SML Lookup**: Live participant directory query by Country + VAT number (e.g., `0208:0849294901`).

### 2. Belgian & European Tax Engine
- **Belgian Intervat XML Generator**: Auto-calculates quarterly and monthly VAT declarations across **Grids 00 to 83** with downloadable Intervat-compliant XML.
- **Annual VAT Client Listing (Klantenlisting)**: Automated generation of the annual Belgian B2B client listing with turnover and VAT thresholds.
- **EU OSS (One-Stop-Shop) Engine**: Country-by-country VAT breakdown for cross-border B2C digital and physical sales within the European Union.
- **Belgian Statutory Mileage Reimbursement**: Automatic calculation based on official indexation rates (€0.4415/km) with SEPA payout export.
- **Book XIX CEL Legal Dunning**: Automated 3-stage debt recovery pipeline applying statutory late interest, €40 recovery fees, and certified bailiff dossier exports.

### 3. CRM & Client Intelligence
- **Enterprise Account Directory**: Track B2B corporate entities, B2C individuals, linked contacts, account managers, payment terms, and credit limits.
- **Live KBO & KvK Directory Lookup**: Instant company profile auto-fill from the official Belgian Crossroads Bank for Enterprises (KBO/BCE) and Dutch Chamber of Commerce (KvK).
- **Client Extranet Portal**: Secure, branded self-service client portal for digital quotation sign-off, invoice downloads, EPC QR payments, and support ticket tracking.

### 4. Sales Pipeline, Interactive Quotes & Contracts
- **Visual Drag-and-Drop Kanban**: Stage tracking (`Lead In` ➔ `Qualified` ➔ `Meeting` ➔ `Proposal` ➔ `Negotiation` ➔ `Closed Won 🎉`) with probability-weighted revenue forecasts.
- **Interactive Web Proposals**: Dynamic quotes with selectable optional add-ons, live quantity adjustments, and biometric Sign-on-Screen client acceptance.
- **1-Click Conversions**: Convert accepted quotes directly into active projects (with line items mapped to tasks) or draft invoices with structured payment references.
- **Digital Contracts & SLAs**: NDA and service contract generator with SHA-256 tamper-evident digital signature audit trails.
- **Recurring Subscriptions & Retainers (MRR)**: Automated recurring billing engine with Peppol transmission triggers and churn analytics.

### 5. Field Service & Work Orders ("Werkbonnen")
- **Mobile Digital Work Orders**: Field technician interface with labor logs, traveling time, and photo evidence attachments.
- **Van Stock Consumption**: Deduct parts and materials directly from assigned mobile service vans in real time.
- **Sign-on-Glass**: Capture client approval on mobile or tablet on-site and convert directly to a final invoice.

### 6. Project Delivery, Gantt & Timesheets
- **Interactive Gantt Timeline**: Project milestone scheduling, dependency visualization, and progress tracking.
- **Sprint & Task Kanban**: Customizable board with task assignments, priority tags, and file attachments.
- **Global Persistent Stopwatch Widget**: Floating time tracker across all views with one-click billable hour logging.
- **1-Click Unbilled Time Invoicing**: Query all unbilled developer/consultant hours and generate structured invoices instantly.

### 7. Logistics, Multi-Location Inventory & Procurement
- **Multi-Location Inventory**: Manage stock across central warehouses and mobile technician vans with transfer orders.
- **Live QR & Barcode Scanner**: Scan parts on mobile devices for fast stock lookups and inventory counts.
- **Purchase Orders (Bestelbonnen)**: Issue supplier POs, record partial deliveries, and execute automated 3-way matching against incoming supplier bills.

### 8. Banking, SEPA Direct Debit & CODA / CAMT.053
- **CODA & CAMT.053 Statement Reconciliation**: Automated Belgian CODA and ISO 20022 CAMT.053 parser with auto-matching against open invoices using Belgian Modulo-97 references (`+++xxx/xxxx/xxxxx+++`).
- **SEPA Direct Debit (pain.008)**: Batch collection XML file generator for recurring B2B / CORE mandates.
- **EPC QR Code Generator**: Dynamic European Payments Council QR codes on PDF and web invoices for instant mobile banking app scan-to-pay.

### 9. Helpdesk & HR Capacity Planning
- **PulseDesk Helpdesk**: Omnichannel customer support ticketing with live SLA countdown timers, canned responses, and 1-click ticket-to-task or ticket-to-invoice conversion.
- **PulseHR Capacity Heatmap**: Team availability planner with European public holiday calendars, leave request approval workflows, and SEPA expense reimbursements.

### 10. PulseAI & OCR Studio
- **Receipt & Supplier Bill OCR**: Automated optical character recognition extracting supplier name, VAT number, line items, and invoice totals into expense records.
- **Deal Health Intelligence**: Predictive pipeline analytics gauging deal velocity and closing probabilities.
- **Natural Language Assistant**: Query CRM records, financials, and project statuses using conversational prompts.

### 11. Enterprise Security, 2FA & Audit Logs
- **Two-Factor Authentication (TOTP 2FA)**: RFC 6238-compliant authenticator app pairing with QR codes and emergency recovery keys.
- **Lockscreen Quick PIN Unlock**: Rapid 4–6 digit unlock protection for shared workstation environments.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Administrators, Project Managers, Accountants, Field Technicians, and Clients.
- **Tamper-Evident SHA-256 Audit Trail**: Immutable logging of all sensitive data modifications, logins, and status transitions.

### 12. Integrations & Developer REST API
- **8 Pre-Built Enterprise Connectors**: Exact Online, Yuki, Octopus, Ponto (PSD2 Open Banking), Solvari, Mollie, Stripe, and Google Calendar.
- **Developer REST API & Webhooks**: Scoped API bearer tokens, real-time webhook subscriptions, and JSON payloads for external ERP integration.

---

## 🎨 Technology Stack & Design System

- **Frontend Core**: React 19, TypeScript, Vite
- **UI Architecture**: SandBox Design System (Glassmorphic cards, soft-pastel accents, micro-animations, full Dark & Light mode support)
- **Typography**: Google Fonts [Urbanist](https://fonts.google.com/specimen/Urbanist) (Headings) & [Manrope](https://fonts.google.com/specimen/Manrope) (Body & Controls)
- **Icons**: Lucide React
- **PWA & Offline Engine**: Service Worker caching with offline queue sync
- **Storage & Database Flexibility**:
  - Zero-config Browser Storage (LocalStorage / IndexedDB)
  - Zero-config PHP + SQLite bridge API (`/public/api/`)
  - Relational MySQL / MariaDB backend with structured schema

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js `v18.0.0` or higher (`v20 LTS` recommended)
- npm `v9.0+`

### 1. Installation

**Linux / macOS:**
```bash
# Clone the repository
git clone https://github.com/webdotpulse/crm.git
cd crm

# Run automated installer
chmod +x install.sh
./install.sh
```

**Windows:**
```cmd
install.bat
npm run dev
```

### 2. Running Locally

```bash
# Development server (http://localhost:5173 with HMR):
npm run dev
# or
./start.sh

# Production preview (http://localhost:3000):
./start.sh --prod
```

---

## 🌐 Deployment Options

### 📦 Combell & cPanel Shared Hosting (Recommended for SMBs)

PulseWork can be deployed to **Combell**, **one.com**, **SiteGround**, or any Apache/LiteSpeed web host in under 3 minutes:

```bash
# 1. Build and package the Combell deployment archive
npm run package:combell
```

This creates `combell_upload.zip` including the pre-configured `.htaccess` with HTTPS enforcement, SPA rewrite rules, and Gzip compression.

Upload and extract the archive into your web root (`/www/` or `/www/subsites/crm.yourdomain.be/`).

👉 **Detailed Guide**: See **[INSTALL_COMBELL.md](INSTALL_COMBELL.md)**

---

### 🖥️ Native Linux VPS / Bare Metal (systemd & PM2)

For dedicated VPS installations (Ubuntu 22.04 / Debian 12) with systemd services, PM2 process supervision, and Nginx reverse proxy with Let's Encrypt SSL:

```bash
# Install and build
./install.sh

# Start with PM2
pm2 start ecosystem.config.cjs
pm2 save
```

👉 **Comprehensive Setup Guide**: See **[INSTALL.md](INSTALL.md)**

---

## 📚 Documentation Links

- **[Installation Manual (VPS / systemd / PM2 / Nginx)](INSTALL.md)**: Full production deployment instructions.
- **[Combell Web Hosting Deployment Guide](INSTALL_COMBELL.md)**: 3-minute shared hosting setup with `.htaccess` details.
- **[Competitive Deep-Dive Analysis (PulseWork vs Teamleader Focus)](analysis.md)**: Architectural, functional, and economic comparison.

---

## 📄 Compliance & Standards

- **OpenPeppol BIS Billing 3.0** & **UBL 2.1**
- **European Standard EN 16931-1:2017**
- **Belgian KBO / BCE & Intervat** VAT Return Grids
- **ISO 20022 SEPA Credit Transfer (pain.001), Direct Debit (pain.008) & CAMT.053**
- **Belgian Code of Economic Law (Book XIX CEL)** Late Payment Framework

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/webdotpulse">Webdotpulse</a>. Designed for modern European enterprises.</sub>
</p>
