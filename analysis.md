# PulseWork (GridCRM) — Technical & Business Deep Dive Analysis

An exhaustive architectural and functional review of **PulseWork (GridCRM)** was conducted to evaluate its readiness as an enterprise all-in-one work management CRM platform and its capability to completely replace **Teamleader Focus** across multiple devices.

---

## 1. Executive Summary

PulseWork is an ambitious, visually polished React 19 single-page application (SPA) styled with the **SandBox design system**. It combines Customer Relationship Management (CRM), Sales Pipeline (Kanban), Commercial Quotation Builder, Project & Gantt Planning, Live Stopwatch & Timesheets, Invoicing, European Peppol BIS Billing 3.0 e-invoicing, SEPA Direct Debit, Expenses, HR, Support Helpdesk, and Multi-location Inventory.

**Verdict:**
While PulseWork features impressive front-end functionality, local database persistence (MySQL/SQLite/JSON via a PHP bridge), and standard SMB workflows, **it cannot yet fully replace Teamleader Focus in a multi-device enterprise production environment.**

The application currently operates primarily as a **client-heavy single-page application (SPA) with optimistic local state management**, lacking critical backend server infrastructure required for enterprise multi-device sync, real-time collaboration, role-based security enforcement, true PWA mobile offline sync, and automated background tasks.

---

## 2. Key Findings & Strengths

1. **Rich Feature Footprint**:
   - Covers almost all modules found in Teamleader Focus (CRM, Deals Kanban, Quotations, Projects, Gantt charts, Time Tracking, Invoicing, Subscriptions, Work Orders).
   - Includes Belgian/European localization out-of-the-box (Belgian Modulo-97 structured references `+++xxx/xxxx/xxxxx+++`, KBO corporate registry lookup via `kbo.php`, and Peppol BIS Billing 3.0 UBL XML generation & validation).

2. **Hybrid Multi-Tier Storage Bridge (`public/api/db.php`)**:
   - Graceful tier-fallback architecture: MySQL PDO → SQLite WAL database → JSON store file fallback.

3. **Polished SandBox UX & Responsive Layout**:
   - High visual fidelity using Google Fonts (Urbanist & Manrope), customizable brand color themes, dark/light modes, spotlight quick-search (⌘K), and responsive CSS drawers.

---

## 3. Major Flaws & Structural Limitations

### A. Architectural & Data Synchronization Flaws (Multi-Device Reality Check)
- **Monolithic Bulk State Payload ("State Dumping")**:
  - The synchronization engine in `src/context/AppContext.tsx` sends the **entire application database state** in a single JSON payload (`saveDataToDatabase(payload)` sending `POST /api/db.php?action=sync_all`) via a 600ms debounced `useEffect`.
  - **Risk:** In multi-device setups (e.g., user A on desktop and user B on iPad/mobile), any edit made by user B will overwrite user A's concurrent changes ("last write wins"). There is no delta-based updates, atomic field locking, or conflict resolution (CRDT / Operational Transformation).
  - **Scalability Limit:** As invoices, deals, and audit logs grow into tens of thousands of records, payload sizes will reach 10MB–50MB+, causing severe latency, memory leaks, and browser freezes.

- **Missing WebSocket / Push Real-time Updates**:
  - Devices do not receive live updates when another team member changes a deal stage, logs hours, or pays an invoice. A hard page refresh or manual re-bootstrap is required.

- **No Native Offline PWA Sync Engine**:
  - Although the UI is responsive, there is no Service Worker or IndexedDB offline caching queue. If a mobile user loses internet connection while on-site filling out a Work Order (Werkbon), network requests fail, and data risk being lost upon tab refresh.

---

### B. Security & Authorization Flaws
- **Client-Side Authorization Enforcer**:
  - User authentication, 2FA TOTP verification, PIN checking, and RBAC permissions are processed **entirely inside the browser JavaScript context** (`src/context/AppContext.tsx` and `src/services/securityService.ts`).
  - **Vulnerability:** Anyone with basic browser DevTools can manipulate `localStorage.setItem('pulsework_authenticated', 'true')` or modify `currentUser.role = 'admin'` in React state to bypass security policy, role restrictions, and 2FA challenges.

- **Unauthenticated Backend API Bridge**:
  - `public/api/db.php` does not inspect HTTP `Authorization: Bearer <JWT>` tokens or session cookies.
  - **Vulnerability:** Any client/attacker who knows the endpoint URL `https://your-domain.com/api/db.php?action=load_state` can dump the entire database (including password hashes, client lists, and financial figures) or wipe data via `action=save_all`.

- **Client-Side Secret Storage**:
  - Webhook secrets, integration API credentials (Stripe, Yuki, Mollie), and SMTP parameters are saved in state and sent to the client browser in plain text.

---

### C. Gaps in Business Logic & Backend Services
- **Client-Side Email "Sending"**:
  - The email dispatch modal (`SendEmailModal.tsx`) updates internal React state (`emailMessages`), but does not connect to an actual SMTP server, SendGrid, or Postmark API. Emails are simulated locally.

- **Simulated Integrations**:
  - Connector integrations (Google Calendar, Yuki, Octopus, Mollie, Stripe) execute client-side simulation mocks (`executeIntegrationSync`) without performing real OAuth2 handshakes or webhooks.

- **Lack of Background Job Worker / Cron Scheduler**:
  - Recurring subscription invoicing, statutory interest escalation on overdue invoices, and scheduled email digests rely on an active browser tab being open. If no user logs in on the due date, recurring invoices are not generated automatically on the server.

---

## 4. Comparison Table: PulseWork vs. Teamleader Focus

| Feature / Domain | Teamleader Focus | PulseWork (Current State) | Status / Gap |
| :--- | :--- | :--- | :--- |
| **Multi-Device Support** | Real-time multi-device cloud sync (Web, iOS, Android native apps) | Browser-based responsive SPA (Mobile Web). Lacks PWA offline sync and real-time delta synchronization | ⚠️ Partial / Web-only |
| **Multi-User Real-time Sync** | Automatic live multi-user updates & field locking | Bulk state dump (`sync_all`). High risk of data overwrites when used on multi-devices | ❌ Critical Flaw |
| **Peppol e-Invoicing** | Third-party integrations / Add-ons | Full native EN 16931 & UBL 2.1 generator + Schematron validator + SMP directory lookup | ✅ Superior |
| **Structured Communication** | Belgian Modulo-97 (`+++xxx/xxxx/xxxxx+++`) | Native Modulo-97 structured reference auto-generator | ✅ Native |
| **Backend & API Security** | Strict OAuth2 / Bearer JWT / Server-side RBAC | Client-side RBAC & unauthenticated backend PHP bridge | ❌ Critical Security Gap |
| **Email & Communication** | Native IMAP/SMTP sync + tracking | Front-end simulation (No active SMTP backend dispatch) | ⚠️ Partial / Simulated |
| **Quotations & E-Signing** | Digital proposal sign-off link | Interactive Proposal Web Portal with digital signature capture | ✅ Functional |
| **Work Orders (Werkbonnen)** | Native mobile app digital signatures | Web-based digital signature modal on work orders | ✅ Functional |
| **Automated Background Tasks** | Server-side Cron (recurring invoices, payment reminders) | Triggered via active browser state / tab session | ⚠️ Partial |

---

## 5. Summary of What Is Not Fully Implemented

1. **Server-Side Authentication & Session Management**:
   - OAuth2 / JWT token generation and validation in `db.php`.
2. **Delta API Endpoint Architecture**:
   - RESTful entity endpoints (`GET /api/v1/invoices`, `POST /api/v1/deals`) replacing bulk state payload dumping.
3. **Backend Email Dispatcher (SMTP / Transports)**:
   - Server-side email delivery engine for sending proposals, invoices, and payment reminders.
4. **Service Worker & PWA Manifest for Mobile/Offline**:
   - Offline PWA support with IndexedDB storage queue for on-site multi-device usage without active connection.
5. **Real-time WebSockets / Server-Sent Events (SSE)**:
   - Multi-user notifications when deals move or time entries are added on other devices.
6. **Live Integration Webhook Receivers**:
   - Inbound webhook listeners for Stripe payment success notifications, Mollie webhooks, or bank feed sync (PSD2 / Plaid / Tink).

---

## 6. Recommendations for Production Readiness

To transform PulseWork into a true enterprise replacement for Teamleader Focus, the following backend enhancements should be implemented:

1. **Refactor `public/api/db.php` into a REST/GraphQL API**:
   - Implement entity-level CRUD routes with Bearer token authentication middleware.
2. **Implement Delta Sync & Conflict Resolution**:
   - Track `updated_at` timestamps per record and send patch payloads rather than replacing all database tables.
3. **Add PWA Support**:
   - Add a Web App Manifest (`manifest.json`) and a Service Worker with background sync capabilities for mobile devices.
4. **Implement Server-Side Background Jobs**:
   - Deploy a CLI script (e.g., `cron.php`) to run daily recurring invoices and payment reminders independently of user browser sessions.
