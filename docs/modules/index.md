---
sidebar_position: 1
slug: /modules
title: Modules Catalogue
description: LabFlow ships 20+ modules covering the end-to-end laboratory workflow. Each module page lists every screen, every form field, and every option.
keywords:
  - LabFlow modules
  - LIMS feature catalog
  - laboratory workflow modules
---

# Modules Catalogue

LabFlow ships **20+ modules** covering the end-to-end laboratory workflow. Each module documents:

- Every **screen** (route + purpose).
- Every **form field** (name, type, required-or-optional, validation rule).
- Every **option** in dropdowns, toggles, and tabs.
- The **permissions** required to see and use each feature.
- The **Firestore collections** the module reads and writes.

This index page is the catalogue. Every module below now has a full detail page — click any card to open it.

---

## How modules are organised

Modules are grouped by the workflow stage they belong to. The table below carries every module, its workflow stage, the build batch that documents it, and the Firestore collections it touches.

| # | Module | Stage | Detail batch | Firestore collections |
|---|---|---|---|---|
| 01 | **Authentication** | Cross-cutting | Batch 02 | `users`, `userTenants`, `auth_sessions` |
| 02 | **Dashboard** | Cross-cutting | Batch 02 | (read-only across modules) |
| 03 | **Patient Management** | Pre-analytical | Batch 02 | `patients`, `patient_documents`, `insurance` |
| 04 | **Test Catalog** | Pre-analytical | Batch 02 | `tests`, `panels`, `categories`, `reference_ranges` |
| 05 | **Test Orders** | Pre-analytical | Batch 03 | `orders`, `order_items` |
| 06 | **Sample Tracking** | Analytical | Batch 03 | `samples`, `sample_events` |
| 07 | **Results Management** | Analytical / Post-analytical | Batch 04 | `results`, `result_addenda`, `report_templates` |
| 08 | **Quality Control** | Analytical | Batch 04 | `qc_runs`, `qc_levels`, `qc_rules` |
| 09 | **Billing & Insurance** | Post-analytical | Batch 05 | `invoices`, `payments`, `claims`, `price_lists` |
| 10 | **Inventory** | Operations | Batch 05 | `stock_items`, `vendors`, `purchase_orders`, `reagent_lots` |
| 11 | **Appointments** | Pre-analytical | Batch 06 | `appointments`, `slots` |
| 12 | **Home Collection** | Pre-analytical | Batch 06 | `home_collection_routes`, `home_collection_visits` |
| 13 | **Reports & Analytics** | Cross-cutting | Batch 06 | (read-only across modules) |
| 14 | **User Management** | Operations | Batch 07 | `users`, `user_tenants`, `roles`, `permissions` |
| 15 | **Settings** | Operations | Batch 07 | `tenant_settings`, `branding`, `templates` |
| 16 | **Admin Panel** | Operations | Batch 07 | (read-only / cross-tenant for Super Admin) |
| 17 | **EMR Integration** | Integration | Batch 08 | `hl7_messages`, `fhir_subscriptions` |
| 18 | **Workflow Automation** | Cross-cutting | Batch 08 | `workflow_rules`, `workflow_runs` |
| 19 | **Communication Hub** | Cross-cutting | Batch 08 | `notifications`, `templates` |
| 20 | **[Mobile App (Capacitor)](/docs/modules/mobile-app)** | Surface | Batch 09 ✓ | (shared) |
| 21 | **[WXT Browser Extension](/docs/modules/wxt-extension)** | Surface | Batch 09 ✓ | (shared) |
| 22 | **[EMR Chrome Extension](/docs/modules/emr-chrome-extension)** | Surface | Batch 09 ✓ | (shared) |

---

## Detail pages

Every module has its own detail page. Click any card to open the full reference for that module.

<div className="labflow-module-grid">

<a className="labflow-module-card" href="/docs/modules/authentication">
  <h3>Authentication</h3>
  <p>Email + password, Google, phone OTP, MFA, magic-link, biometrics. 8 screens.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/dashboard">
  <h3>Dashboard</h3>
  <p>KPI cards, pending tests, critical-result alerts, revenue, TAT, sample status. Role-aware.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/patient-management">
  <h3>Patient Management</h3>
  <p>Registration, search, history, documents, insurance, portal access, deduplication.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/test-catalog">
  <h3>Test Catalog</h3>
  <p>LOINC-integrated catalog, panels, categories, reference ranges, specimen rules, pricing.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/test-orders">
  <h3>Test Orders</h3>
  <p>Single + batch ordering, STAT, templates, cancellation, requisition print.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/sample-tracking">
  <h3>Sample Tracking</h3>
  <p>Collection, accession, barcode / QR, chain of custody, processing, reject + recollect.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/results-management">
  <h3>Results Management</h3>
  <p>Draft → Reviewed → Approved → Released. Critical alerts. Templates. PDF distribution.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/quality-control">
  <h3>Quality Control</h3>
  <p>QC runs, Levey-Jennings charts, Westgard rules, automated rejection.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/billing-insurance">
  <h3>Billing & Insurance</h3>
  <p>Invoicing, claims, payments, financial analytics, configurable price lists.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/inventory">
  <h3>Inventory</h3>
  <p>Stock, reagent lots, vendors, purchase orders, low-stock alerts.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/appointments">
  <h3>Appointments</h3>
  <p>Scheduling, calendar, reminders, no-show tracking.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/home-collection">
  <h3>Home Collection</h3>
  <p>Phlebotomist scheduling, route planning, mobile collection workflow, offline.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/reports-analytics">
  <h3>Reports & Analytics</h3>
  <p>KPI dashboards, custom reports, TAT, productivity, exports.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/user-management">
  <h3>User & Role Management</h3>
  <p>11 roles, 177 permissions across 16 categories, audit-logged.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/settings">
  <h3>Settings</h3>
  <p>Branding, locale, timezone, working hours, label templates, report templates.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/admin-panel">
  <h3>Admin Panel</h3>
  <p>System health, tenant management, configuration, integration toggles.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/emr-integration">
  <h3>EMR Integration</h3>
  <p>HL7 v2 mapping, FHIR R4, webhooks, Chrome extension injection.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/workflow-automation">
  <h3>Workflow Automation</h3>
  <p>Rule engine, triggers, actions. No-code per-tenant.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/communication-hub">
  <h3>Communication Hub</h3>
  <p>SMS, email, in-app, push. Templated content per event.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/mobile-app">
  <h3>Mobile App (Capacitor)</h3>
  <p>Phlebotomist + technologist + patient surfaces; offline-first; biometric; FCM / APNs push.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/wxt-extension">
  <h3>WXT Browser Extension</h3>
  <p>Cross-browser quick lookups, omnibox commands, shared session with the web app.</p>
</a>

<a className="labflow-module-card" href="/docs/modules/emr-chrome-extension">
  <h3>EMR Chrome Extension</h3>
  <p>Injects LabFlow result panels into Epic, Cerner, Meditech, Allscripts, athenahealth, eClinicalWorks.</p>
</a>

</div>

## Reading the detail pages (when they land)

Every detail page follows the same shape so you can scan them quickly:

1. **Definition** — first sentence is a literal one-line definition.
2. **At-a-glance** — a 3-row table: workflow stage, required permissions, Firestore collections.
3. **Screens** — every route, with a screenshot (when available) and a description of what it does.
4. **Forms** — every form, with every field listed (name, type, required, validation, default).
5. **Options** — every dropdown, toggle, and tab option, exhaustively.
6. **Permissions** — each capability mapped to the permission(s) it requires.
7. **Workflows** — typical multi-screen flows depicted as numbered step lists.
8. **FAQ** — 5-8 natural-language questions and answers that AI engines extract directly.
9. **Author + Last updated** — who maintains it, when it was last touched.

---

## Module summaries

A one-paragraph summary of every module, each linking to its full detail page.

### Authentication
**Detail page:** [/docs/modules/authentication](/docs/modules/authentication). Email + password, Google OAuth, phone OTP, magic link, MFA (TOTP + SMS), biometric unlock, tenant chooser. Eight screens, full security-rule invariants, audit-log coverage.

### Dashboard
**Detail page:** [/docs/modules/dashboard](/docs/modules/dashboard). Role-aware landing screen composed of permission-gated widgets — KPI cards (mean TAT, results released, critical results flagged, sample rejection rate), pending-work queues, critical-result acknowledgement backlog, turnaround-time with p50/p75/p90, revenue, live sample-status distribution, inventory and QC alerts. Reads across every module; owns no data; tenant-scoped; drill-through into the owning module's filtered list.

### Patient Management
**Detail page:** [/docs/modules/patient-management](/docs/modules/patient-management). Every form field in the registration multi-step, fuzzy search across name / MRN / phone / email / national-ID, document upload via FilesHub, insurance capture, audit-logged merge with 24-hour reversal window.

### Test Catalog
**Detail page:** [/docs/modules/test-catalog](/docs/modules/test-catalog). LOINC 2.76 integration, panels, categories, age + sex reference ranges, specimen rules (fasting, time-of-day, contraindications), reflex testing, per-insurer price lists.

### Test Orders
**Detail page:** [/docs/modules/test-orders](/docs/modules/test-orders). Four-step order wizard (patient → tests → clinical context → review), order priorities (routine / urgent / STAT), templates, quick-orders, cancellation flow with mandatory reason, requisition printing, reflex-rule mechanics.

### Sample Tracking
**Detail page:** [/docs/modules/sample-tracking](/docs/modules/sample-tracking). Seven-state lifecycle (pending → collected → in-transit → received → processing → completed → reported) plus rejected / cancelled / lost branches, barcode format with Luhn check digit, chain-of-custody append-only log, stability enforcement, mobile offline-first collection workflow with conflict resolution.

### Results Management
**Detail page:** [/docs/modules/results-management](/docs/modules/results-management). Four-state lifecycle (Draft → Reviewed → Approved → Released) with security-rule enforcement, append-only versions and audit, critical-value acknowledgement before release, FilesHub-stored PDF reports, immutable post-release records, addenda mechanism with reason enum, HL7 ORU instrument ingestion, digital signature with HMAC at approval.

### Quality Control
**Detail page:** [/docs/modules/quality-control](/docs/modules/quality-control). QC levels and lots with assayed vs. in-house mean/SD, all six base Westgard rules (1-2s warning, 1-3s, 2-2s, R-4s, 4-1s, 10-x reject), Levey-Jennings chart in D3.js with ±1/±2/±3 SD bands, multi-instrument boundary respect, out-of-control corrective-action workflow, expiry alerts at 14/7/0 days.

### Billing & Insurance
**Detail page:** [/docs/modules/billing-insurance](/docs/modules/billing-insurance). Invoicing with split bill-to (patient / insurer / corporate / split), payment ledger with multi-invoice allocation, claim state machine (`draft → submitted → in-review → adjudicated → paid / denied → appealed`), CMS-1500 + EDI 837P + JSON export, versioned price lists with payer-contract override priority, multi-currency, refunds linked to original payments, write-offs with reason codes, eight out-of-the-box revenue / ageing / denial-rate / payer-mix / TAT reports.

### Inventory
**Detail page:** [/docs/modules/inventory](/docs/modules/inventory). Stock tracked per item × lot × location, FEFO / FIFO picking, full transaction ledger (receipt / issue / consumption / adjustment / transfer / write-off / return), purchase orders with partial-receipt support, vendor lead-time alerts, low-stock and 30/14/7/0-day expiry alerts, storage-temperature placement validation, consumption events linking reagent lots to specific results and QC runs for accreditation traceability, multi-site transfers with in-transit alerts.

### Appointments
**Detail page:** [/docs/modules/appointments](/docs/modules/appointments). Slot-based scheduler built for lab throughput (5–15 min slots, per-room/per-phlebotomist capacity), weekly templates with priority resolution, transactional booking that prevents double-booking, four-step booking wizard with every field, walk-in queue with slack-capacity assignment, no-show counters driving deposit + booking-block rules, SMS-reply confirmation with single-use codes, multi-channel reminders (T-24h / T-2h / T-30min cadences), and a transactional reschedule that never loses both seats. 11 permissions.

### Home Collection
**Detail page:** [/docs/modules/home-collection](/docs/modules/home-collection). Visit creation with structured address + geofence, manual + auto-dispatch route planning via Mapbox-pluggable routing service, offline-first Capacitor mobile workflow with IndexedDB outbox and client-UUID-keyed last-writer-wins replay, append-only chain-of-custody log (9 event types), Bluetooth cool-box probe integration, stability-budget enforcement at accession with override permission and audit footnote on affected reports, patient-facing live tracking with token-link expiry, kit drop-off and round-trip variants for self-collection workflows. 11 permissions.

### Reports & Analytics
**Detail page:** [/docs/modules/reports-analytics](/docs/modules/reports-analytics). Read-only window on every operational module. Eight system dashboards (TAT four-segment with p50/75/90/95/99, productivity role-aware, sample-rejection, critical-result acknowledgement latency, no-show, revenue, QC out-of-control, inventory), custom report builder with 6-section workflow (source / filters / group / measure / visualisation / output), 13 chart types all rendered with D3.js, scheduled subscription delivery via email / in-app / webhook, drill-through that respects row-level permissions, one-click accreditation pack export. 8 permissions plus source-module inheritance.

### User Management
**Detail page:** [/docs/modules/user-management](/docs/modules/user-management). Platform-wide identity with per-tenant memberships, 11 default roles, 177 permissions across 16 categories, custom-role authoring with permission-tree picker and "sensitive" filter, single-step inheritance, site + row-level scope enforcement in Firestore security rules, MFA policies (per-role, per-permission, tenant-wide) with TOTP / SMS / biometric / recovery codes and configurable session cadence, session management with absolute and inactivity timeouts and force-re-auth on permission change, invitation flow that survives existing platform accounts, banned-permission-rename contract. 13 permissions.

### Settings
**Detail page:** [/docs/modules/settings](/docs/modules/settings). One screen of tabs covering branding (logo / palette / report header-footer), locale (language / date-time / number / units / currency / IANA timezone), working hours with per-site overrides, label-template editor with block-model and Handlebars variables for printer-pixel-accurate layouts, report-template editor with branded PDF sections, notification preferences with quiet hours + urgent override + per-event template overrides, integration connectors (Twilio / MessageBird / SendGrid / Mailgun / WhatsApp Business / OneSignal / Sentry / Mapbox / HL7 ingester), versioned settings history with diff viewer and rollback, dual-light/dark/print logos, settings JSON export for sister-tenant bootstrap. 9 permissions.

### Admin Panel
**Detail page:** [/docs/modules/admin-panel](/docs/modules/admin-panel). Smallest module by design — tenant-scope (Lab Director) and platform-scope (LabFlow Super Admin) separated at the route guard. Tenant-scope: health dashboard with 10 operational signals + thresholds, cross-module audit aggregator, 7 emergency-override types with mandatory reason ≥ 20 chars and auto-expiry. Platform-scope: tenant lifecycle (created / configured / active / suspended / archived / restored / deleted) with simulate-before-commit, audit-bracketed sign-in-as with both-identities-logged and 4-hour hard expiry, platform feature-flag console with experiment % rollouts, platform integration key rotation with overlap-window pattern. 7-year audit retention default, configurable 2-25 years. 11 permissions.

### EMR Integration
**Detail page:** [/docs/modules/emr-integration](/docs/modules/emr-integration). HL7 v2 (ORM^O01, ORU^R01, ADT^A08, ACK) and FHIR R4 (ServiceRequest, Observation, DiagnosticReport, Patient, Specimen, Subscription, OperationOutcome) — narrow message-broker subset rather than a generic FHIR search surface; per-connection bi-directional field-mapping dictionary (LOINC ↔ partner test code, specimen / urgency / abnormal / payer / patient-class codes) with CSV import-export, diff-against-default, missing-mappings panel; protocols hl7-v2-mllp + hl7-v2-webhook + fhir-r4 + plain webhook; HMAC SHA-256 signed webhooks with timestamp replay-protection + signing-key overlap rotation + 5-step retry policy; EMR Chrome extension as one of LabFlow's five surfaces, authenticating via chrome.identity (NEVER Firebase Auth SDK per browser-extension rules); message-replay surface for repair workflows; honest framing — HL7 v3 / CDA not supported (Mirth Connect / Rhapsody bridges are deployment-level). 7 permissions.

### Workflow Automation
**Detail page:** [/docs/modules/workflow-automation](/docs/modules/workflow-automation). No-code rule engine — `trigger → conditions → actions` deliberately Turing-incomplete (no loops, no arbitrary HTTP); curated trigger catalogue across orders / samples / results / QC / inventory / billing / appointments / home-collection / users / time; AND-OR-NOT condition tree with 9 operators; allow-list action catalogue with per-action permission requirements that aggregate to the rule's effective permission profile (privilege-escalation guard at activation); reflex testing as canonical example; versioned rules with diff + forward-only restore; in-flight runs complete on deactivation; dry-run "Test against a sample event" before activation; bulk historical replay with separate `workflows.run-historical` permission; serialised actions per-record via advisory lock; permission re-check at run-time for cross-PHI webhooks. 5 permissions.

### Communication Hub
**Detail page:** [/docs/modules/communication-hub](/docs/modules/communication-hub). Single notification system every module sends through; 5 channels (SMS / email / WhatsApp / push / in-app); curated event catalogue with default channel + urgency mapping; per-event-channel-locale templates with curated Handlebars subset (no loops; variables validated at save); recipient resolution (explicit + role fan-out + subscription); first-channel-working with fall-forward fallback on hard-bounce; tenant + per-user quiet-hour stacking, urgent bypass; opt-out registry with channel + category scoping AND non-opt-outable critical / MFA / security events; inbound matcher for STOP/START/HELP locale variants + appointment confirm codes + critical-acknowledge codes + free-text manual routing; provider-health auto-pause with failover provider; partner subscribable webhooks for delivery state. Honest framing: HIPAA-conservative defaults (no test names / values in SMS); jurisdiction-aware regulatory compliance is deployment-level; tenants must use registered senders. 8 permissions.

### Mobile App (Capacitor)
**Detail page:** [/docs/modules/mobile-app](/docs/modules/mobile-app). Capacitor-built Android (min SDK 22) + iOS (min iOS 14) app sharing the React + TypeScript codebase with the web app; multi-persona surface for phlebotomists / technologists / Lab Managers / receptionists / patients / external clinicians; narrow plugin set (`@capacitor/preferences`, geolocation, camera, barcode-scanner, push-notifications, local-notifications, network, filesystem, share, app, biometric, clipboard, privacy-screen); biometric unlock layered on Firebase Auth via OS keychain; offline-first IndexedDB outbox for chain-of-custody events with client-UUID-keyed idempotent replay; FCM (Android) / APNs (iOS) push routed through OneSignal; HIPAA-conscious defaults (privacy screen, no clipboard auto-copy, no background fetch); banned Crashlytics + Performance (Sentry + Amplitude used instead). Distribution status: Play Store + App Store submissions pending.

### WXT Browser Extension
**Detail page:** [/docs/modules/wxt-extension](/docs/modules/wxt-extension). Cross-browser MV3 extension (Chrome / Edge / Brave / Firefox) built with WXT; staff-side convenience layer (quick patient + result + sample lookups, omnibox `lf ...` commands, browser-notification critical-result acknowledgement, dashboard launcher, tenant switcher); does NOT inject into third-party EMR pages (that's the separate EMR Chrome Extension); auth via `chrome.identity` (Firebase Auth SDK NEVER loaded per Chrome Web Store rejection-prevention); narrow permission set `activeTab` + `storage` + `identity` + `alarms` + `notifications` with NO `<all_urls>`; optional cross-extension hand-off with EMR Chrome extension when both installed; popup JS budget ≤80KB gzipped, cold-open ≤250ms P95. Distribution status: Chrome Web Store + Edge Add-ons + Firefox Add-ons submissions pending.

### EMR Chrome Extension
**Detail page:** [/docs/modules/emr-chrome-extension](/docs/modules/emr-chrome-extension). Chrome / Edge MV3 extension that injects a Shadow-DOM-isolated LabFlow result panel into recognised EMR pages — Epic, Cerner, Meditech, Allscripts, athenahealth, eClinicalWorks at launch; per-EMR adapter map declares URL pattern + patient-identifier selector + per-version DOM fingerprints; the only LabFlow surface with third-party-page presence; deliberately read-only against the EMR (no DOM modification, no auto-fill, no clicks); panel shows recent results + pending orders + critical alerts + quick actions with deep-links into the web app; auth via `chrome.identity` (Firebase Auth SDK NEVER loaded); narrow `host_permissions` matching only the 6 EMR domains with NO `<all_urls>`; audit events on panel render, result view, critical acknowledge, deep-link follow; cross-extension hand-off with WXT for shared session. Distribution status: Chrome Web Store + Edge Add-ons submissions pending.

---

**Next:** [User Guide overview →](/docs/user-guide/overview)
