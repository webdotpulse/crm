# PulseWork (GridCRM) — Production Remediation Engineering Prompts

This document contains a structured set of copy-pasteable, actionable development prompts to guide AI agents or software engineers through transforming **PulseWork (GridCRM)** into a secure, multi-device, enterprise-grade replacement for **Teamleader Focus**.

---

## 📋 Executive Implementation Roadmap

```
1. Security & JWT Server Auth ➔ 2. Delta REST API & DB Persistence ➔ 3. PWA Offline & Mobile Sync ➔ 4. WebSockets Real-time Sync ➔ 5. Backend SMTP Dispatch ➔ 6. Server Cron & Background Jobs
```

---

## Prompt 1: Server-Side JWT Authentication & Authorization Middleware

```markdown
### Task: Implement Server-Side JWT Authentication & RBAC in PHP API Bridge

#### Objective:
Secure `public/api/db.php` by removing client-side-only authorization and introducing JSON Web Token (JWT) verification, password hashing validation, and endpoint-level Role-Based Access Control (RBAC).

#### Requirements:
1. **Authentication Endpoint (`POST /api/auth.php?action=login`)**:
   - Accept `email` and `password`.
   - Query `${tablePrefix}users` table in MySQL/SQLite.
   - Verify password hash using `password_verify($password, $user['password_hash'])`.
   - Support 2FA TOTP server-side verification using standard RFC 6238 implementation before issuing token.
   - Generate a signed JWT token containing `sub` (userId), `email`, `role`, `exp` (8-hour expiration), and `iss` ("PulseWork").
   - Return `{ "success": true, "token": "...", "user": { ... } }`.

2. **Bearer Token Middleware (`validateJwtToken()`)**:
   - Parse `Authorization: Bearer <TOKEN>` header on all database requests in `public/api/db.php`.
   - Reject unauthenticated requests with HTTP 401 Unauthorized (`{ "success": false, "message": "Missing or invalid access token" }`).

3. **Server-Side RBAC Enforcement**:
   - Create permission matrix checking user role (`admin`, `manager`, `user`, `accountant`) against requested endpoints (e.g. restrict `DELETE /api/v1/invoices` or security policy changes to `admin`).

4. **Frontend Integration**:
   - Update `src/services/securityService.ts` and `src/context/AppContext.tsx` to store the JWT token in `sessionStorage` / encrypted HTTP-only cookie.
   - Pass `Authorization: Bearer <token>` in all `fetch()` calls inside `mysqlService.ts`.
```

---

## Prompt 2: Refactoring Monolithic State Dumping to RESTful Delta API

```markdown
### Task: Replace `sync_all` Monolithic State Dump with Granular Delta REST Endpoints & Optimistic Locking

#### Objective:
Eliminate the bulk payload state dump (`POST /api/db.php?action=sync_all`) in `AppContext.tsx` that causes "last write wins" data loss in multi-device setups. Replace it with granular RESTful resource endpoints and optimistic concurrency locking.

#### Requirements:
1. **PHP API Granular Endpoints**:
   - Implement REST endpoints in PHP for core entities:
     - `/api/v1/companies` (GET, POST, PUT, DELETE)
     - `/api/v1/deals` (GET, POST, PUT, DELETE)
     - `/api/v1/invoices` (GET, POST, PUT, DELETE)
     - `/api/v1/projects` & `/api/v1/tasks` (GET, POST, PUT, DELETE)
     - `/api/v1/time_entries` (GET, POST, PUT, DELETE)
   - Support pagination (`?page=1&limit=50`) and filtering (`?updated_since=ISO_TIMESTAMP`).

2. **Optimistic Concurrency & Versioning Control**:
   - Add `version` INT and `updated_at` TIMESTAMP columns to all database tables.
   - On `PUT /api/v1/{entity}/{id}`, check if incoming `version` matches database `version`.
   - If DB version is newer, return HTTP 409 Conflict (`{ "error": "Conflict", "serverRecord": { ... } }`).

3. **Frontend React Context Refactoring (`AppContext.tsx`)**:
   - Replace bulk state saver `saveDataToDatabase` with per-action API service calls (e.g., `updateInvoiceApi(invoice)`, `addDealApi(deal)`).
   - In case of HTTP 409 Conflict, prompt user with visual conflict resolution drawer (Keep Server Version vs Overwrite).
```

---

## Prompt 3: PWA Offline-First Engine & Mobile Sync Queue

```markdown
### Task: Turn PulseWork into a Progressive Web App (PWA) with Offline Background Sync

#### Objective:
Enable multi-device field workers (e.g., technicians completing digital Work Orders / Werkbonnen on tablets or phones) to operate seamlessly offline and sync changes upon reconnecting.

#### Requirements:
1. **Web App Manifest (`public/manifest.json`)**:
   - Define app identity: `name: "PulseWork CRM"`, `short_name: "PulseWork"`, `display: "standalone"`, `theme_color: "#3f78e0"`, icons (192x192, 512x512).
   - Register manifest in `index.html`.

2. **Service Worker Implementation (`public/sw.js`)**:
   - Implement Cache-First strategy for static assets (JS, CSS, fonts, icons).
   - Implement Stale-While-Revalidate for application shell and GET API calls.

3. **IndexedDB Local Mutation Queue (`src/services/offlineSyncService.ts`)**:
   - Set up `idb` or native IndexedDB store for queued mutations (`POST`, `PUT`, `DELETE` requests performed while offline).
   - Listen to `window.addEventListener('online')` to automatically replay queued requests to the server in chronological order.
   - Show a visual "Offline Mode — Changes will sync when online" badge in `Navbar.tsx`.
```

---

## Prompt 4: Real-time Multi-User WebSocket Synchronization (Server-Sent Events / WebSockets)

```markdown
### Task: Implement Real-time Multi-Device Event Broadcasting via WebSockets / Server-Sent Events (SSE)

#### Objective:
Ensure changes made by one team member (e.g., updating a deal stage or marking an invoice paid) appear instantly across all connected mobile and desktop devices without requiring tab refreshes.

#### Requirements:
1. **Server Event Publisher (`public/api/events.php`)**:
   - Implement a Server-Sent Events (SSE) stream or Node.js/PHP WebSocket server (`Ratchet` or `Swoole` / `Pusher` compatible).
   - When an entity is mutated via REST API (`POST`, `PUT`, `DELETE`), publish an event:
     `{ "event": "deal.updated", "entityId": "deal-123", "data": { ... }, "actorId": "user-456" }`.

2. **Frontend Event Listener Hook (`src/hooks/useRealtimeSync.ts`)**:
   - Create a React hook subscribing to SSE / WebSocket channel upon user authentication.
   - Upon receiving an incoming event from another user:
     - Update React Context state in real-time (e.g. update single deal in `deals` array).
     - Display subtle toast notification (e.g. *"Sven updated Deal #1042 to Proposal"*).
```

---

## Prompt 5: Production Backend SMTP Email Engine & Transport Service

```markdown
### Task: Implement Server-Side SMTP Email Delivery with Template Engine

#### Objective:
Replace front-end client simulation of emails (`SendEmailModal.tsx`) with real background email dispatch via PHPMailer or Symfony Mailer over SMTP, SendGrid, or Postmark.

#### Requirements:
1. **Backend Email Dispatch Endpoint (`public/api/email.php`)**:
   - Accept payload: `{ "to": "client@company.com", "templateId": "quote_send", "variables": { ... }, "attachments": [...] }`.
   - Integrate `PHPMailer` or native SMTP socket library.
   - Support HTML layout branding, custom company logos, and PDF attachment generation (e.g. attaching generated UBL XML or PDF invoice).

2. **Email Status Tracking**:
   - Save dispatch history to `${tablePrefix}email_messages` table with status (`sent`, `failed`, `delivered`).
   - Log errors and display real toast feedback on the frontend (`"Invoice successfully emailed to client@acme.be"`).
```

---

## Prompt 6: Server-Side Cron Job Worker for Recurring Invoicing & Dunning

```markdown
### Task: Create CLI Cron Script for Automated Subscriptions, Statutory Interest & Payment Reminders

#### Objective:
Decouple recurring subscription invoicing and payment reminder escalation from browser tab sessions by implementing an automated server-side background worker.

#### Requirements:
1. **CLI Worker Script (`public/api/cron.php`)**:
   - Script executable via Linux crontab: `0 2 * * * php /var/www/pulsework/public/api/cron.php`.
   - Task 1: **Subscription Billing**:
     - Query `${tablePrefix}subscriptions` where `status = 'active'` AND `next_billing_date <= TODAY`.
     - Generate new structured invoice record in `${tablePrefix}invoices`.
     - Automatically dispatch Peppol XML invoice if `auto_send_peppol` is enabled.
   - Task 2: **Dunning Escalation**:
     - Query overdue invoices past payment terms.
     - Calculate Belgian statutory recovery fee (€40.00) and late interest (10.5% p.a.).
     - Auto-generate Dunning Notice records and queue notification emails.

2. **Audit Logging**:
   - Record execution logs to `${tablePrefix}audit_logs` with actor `"System Worker (Cron)"`.
```
