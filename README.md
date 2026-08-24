# PulseWork — All-in-One Work Management, CRM & Peppol Invoicing

An all-in-one work management platform designed for small and medium-sized businesses (SMBs, digital agencies, consultancies, and IT service providers) to handle Customer Relationship Management (CRM), Project Planning, Quotation Creation, Timesheets, and Invoicing with full European **Peppol BIS Billing 3.0** e-invoicing integration in a single platform.

Built with the **SandBox** design system (Elemis typography, soft-pastel accents, rounded-card glassmorphism, micro-animations, and light/dark modes).

---

## 🚀 Key Features

- **📊 Executive Dashboard**: Real-time revenue metrics, cashflow forecasting, active pipeline value, billable developer utilization, and Peppol transmission success rates.
- **🏢 CRM & Companies**: Complete account directory with lifecycle tracking, linked contacts, and **Live OpenPeppol SMP Participant Lookup**.
- **📈 Sales Pipeline (Kanban)**: Drag-and-drop opportunity board (`Lead In` ➔ `Qualified` ➔ `Meeting` ➔ `Proposal` ➔ `Negotiation` ➔ `Closed Won 🎉`), probability-weighted revenue forecasting, and 1-click quotation generation.
- **📝 Commercial Quotation Builder**: Itemized proposal builder with automated tax/discount calculations and an interactive **Client Digital Sign-off Portal**.
- **🔄 1-Click Conversions**: Convert accepted quotes directly into **Projects** (with deliverables as tasks) or **Invoices** (with structured payment references).
- **🚀 Project Planning & Gantt Timeline**: Project health overview, **Tasks Kanban Board**, **Interactive Gantt Milestone Chart**, and developer timesheets.
- **⏱️ Live Stopwatch & Timesheets**: Global persistent live timer widget and 1-click **"Invoice Unbilled Time"**.
- **💳 Invoicing & Billing**: Belgian modulo-97 structured communication generator (`+++xxx/xxxx/xxxxx+++`), VAT breakdowns, payment recording, and printable PDF preview.
- **🌐 Peppol BIS Billing 3.0 Hub (EN 16931 Compliant)**:
  - 100% compliant UBL 2.1 XML generator
  - Syntax-highlighted live XML inspector & `.xml` downloader
  - Real-time **EN 16931 Schematron Rules Validator**
  - Simulated **AS4 Access Point Gateway Dispatcher** with signed MDN receipts
  - OpenPeppol SMP/SML Participant Directory Search

---

## ⚡ Quick Start (Native Installation)

### Linux / macOS:
```bash
chmod +x install.sh
./install.sh
```

To launch:
```bash
# Development Mode (http://localhost:5173):
./start.sh

# Production Mode (http://localhost:3000):
./start.sh --prod
```

### Windows:
```cmd
install.bat
npm run dev
```

---

## 📖 Comprehensive Installation Manual

For complete step-by-step native installation, systemd background service setup, PM2 process management, and Nginx reverse proxy with SSL, see:
👉 **[INSTALL.md](INSTALL.md)**

---

## 🎨 SandBox Design System

- **Headings**: Google Fonts [Urbanist](https://fonts.google.com/specimen/Urbanist)
- **Body & Controls**: Google Fonts [Manrope](https://fonts.google.com/specimen/Manrope)
- **Palette**: Indigo `#3f78e0`, Emerald `#38b995`, Amber `#fab758`, Coral `#e2626b`, Purple `#605dba`, Slate `#1e2229`
- **Badges**: `.badge-soft-primary`, `.badge-soft-success`, `.badge-soft-warning`, `.badge-soft-danger`, `.badge-soft-purple`
- **Themes**: Automatic Dark / Light mode toggle

---

## 📄 License & Attribution

Built for SMBs and digital service providers. Complies with the **European Standard EN 16931** and **OpenPeppol BIS Billing 3.0** specifications.
