---
sidebar_position: 1
slug: /architecture/overview
title: Architecture Overview
description: LabFlow ships four client surfaces (web, mobile, browser extension, EMR add-on) over one Firestore-backed multi-tenant model — 100% client + Firestore, no server backend — with four-state result validation and audit-logged mutations.
keywords:
  - LabFlow architecture
  - multi-tenant LIMS architecture
  - Firestore tenant isolation
  - Capacitor architecture
  - HL7 FHIR architecture
---

# Architecture Overview

**LabFlow is one codebase that ships four client surfaces over one multi-tenant Firestore data model.** The architecture is intentionally narrow — there is **no server tier**. The product is 100% client + Firestore: every surface talks to Firestore directly, access control lives in the security rules, and the logic that a backend would traditionally run (critical-result alerts, analytics, aggregation) runs client-side. Fewer moving parts means faster onboarding, less drift, and a smaller attack surface. This page explains the tenancy model, the surfaces, the data flow, and the key invariants that hold across all of them.

If you'd rather see the catalogue of features, jump to [Modules](../modules). For an integration-first view, see the [API Reference](../api/overview).

---

## The four surfaces

| Surface | Path in repo | Build target | Distribution |
|---|---|---|---|
| **Web app (primary)** | `src/` | Vite SPA → Firebase Hosting | Live at `https://labflow.aoneahsan.com` |
| **Mobile (Android + iOS)** | `src/` shared + `android/`, `ios/` shells | Capacitor 8 → AAB / IPA | **Pending** Play / App Store distribution |
| **WXT browser extension** | `extension/` | Manifest V3 (Chrome / Firefox) | **Pending** Chrome Web Store distribution |
| **EMR Chrome extension** | `chrome-extension/` | Manifest V3 (Chrome) | **Pending** Chrome Web Store distribution |

All surfaces share the same Firestore database, the same security rules, and the same FilesHub object store for files. The web and mobile surfaces share the React + TypeScript codebase verbatim. There is **no Cloud Functions / server tier** — LabFlow removed Firebase Cloud Functions entirely and moved to a fully client-side model.

---

## Multi-tenancy

The single most important invariant in LabFlow is **tenant isolation**.

- Every collection root in Firestore (e.g. `patients`, `orders`, `samples`, `results`, `invoices`) carries a mandatory `tenantId` field on every document.
- Every Firestore security rule includes `request.auth.token.tenantId == resource.data.tenantId` as a precondition for read and write.
- Because there is no server tier, the security rules are the enforcement point: every rule verifies tenant context (from the caller's `users` / `tenant_users` document) **before** allowing any read or write, and never trusts a client-provided tenant ID.
- Every API key is bound to exactly one tenant; the same is true for HL7 sending facility mappings and FHIR `Organization` references.
- A user can belong to multiple tenants (the same human can work for multiple labs); each session targets exactly one tenant at a time.

There is no "cross-tenant query" surface anywhere. If you need data across tenants (Super Admin reporting), the application makes N parallel queries, one per tenant — never a single query that joins tenants.

> **Why so strict?** Patient PHI must never leak across organisations. Multi-tenancy is enforced at the deepest possible layer (the security rules, not the application code) so that even a bug in the application code cannot leak data across tenants.

---

## Tech stack (the narrow choice)

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | React 19 + TypeScript | Largest hiring pool, mature ecosystem |
| Build tool | Vite 8 | Fast dev server, native ESM, smaller config than Webpack |
| Styling | Tailwind CSS 4 + Headless UI + Heroicons | Utility-first; no global CSS-in-JS runtime overhead |
| Forms | `react-hook-form` + `zod` | Mandatory in this project — no manual `useState` forms |
| Server state | TanStack Query | Stale-while-revalidate, mutation queues, retries |
| Client state | Zustand | Minimal API; no provider hell; persisted via Capacitor Preferences |
| Routing | React Router | URL-state preservation for modals / tabs / filters |
| Auth + database | Firebase Auth (Google sign-in) + Firestore (asia-south1) | Free tier covers most workloads; security rules are first-class |
| Server logic | None — 100% client + Firestore | No server tier; access control in security rules; critical alerts + analytics computed client-side |
| File storage + email | FilesHub API | Cheaper + portable; not Firebase Storage; also the outbound-email provider |
| Native shell | Capacitor 8 + 30 plugins | Same codebase as web; native APIs through plugins |
| Browser extension | WXT (MV3) | First-class TypeScript; cross-browser builds |
| Charts | D3.js | Full control; no Recharts / Chart.js / ApexCharts |
| Errors | Sentry | Sanitised PHI before send |
| Analytics | Amplitude + Microsoft Clarity + Firebase Analytics | Three platforms; same event names across all |
| Offline | Dexie + IndexedDB | Mutation queue; replay on reconnect with conflict resolution |

Notably **absent**: Firebase Crashlytics, Firebase Performance Monitoring, Firebase Storage, Recharts, Chart.js, ApexCharts, ag-grid, Material UI, styled-components. These are not omissions — they're decisions.

---

## Data flow: from order to released result

This is the canonical path that exercises most of the data model.

1. **Order created** (`orders` collection) — a clinician or front-desk user submits a test order. The system writes the order doc, creates one or more `samples` docs (one per specimen type), and emits an `order.created` event to webhooks and the audit log.
2. **Sample collected** (`samples` collection updates) — a phlebotomist scans the barcode at collection. The chain-of-custody log appends "Collected".
3. **Sample received** at the lab. Status becomes "Received". `sample.received` event fires.
4. **Sample processed** by an analyzer. The analyzer either pushes an HL7 ORU message into LabFlow's HL7 ingester, or the technician enters values manually.
5. **Result enters Draft** (`results` collection). The technician can edit until they hand off.
6. **Result moves to Reviewed** by a senior technologist who validates technical correctness.
7. **Result moves to Approved** by a pathologist who validates clinical correctness.
8. **Critical-value alert** fires (if applicable) — the app writes an in-app notification for the relevant staff and an immutable audit-log entry, client-side, *before* release (`src/services/critical-alerts.service.ts`). The lab cannot release until the alert is acknowledged.
9. **Result Released**. The report PDF is generated in-app (client-side), uploaded to FilesHub, and a link is queued for delivery to the patient and the ordering clinician. Delivery "senders" (SMS / email) queue in Firestore + go out through FilesHub email / OneSignal push where configured.
10. **Audit log entry** records every state transition with old value, new value, who, when, and from what device.

The four-state result lifecycle (Draft → Reviewed → Approved → Released) is enforced in Firestore security rules. A user with only "Technician" role cannot move a result to Approved no matter what client they use.

---

## Audit log invariant

Every mutation to a patient record, an order, a sample, or a result writes a corresponding `audit_logs` doc with:

- `actorId` (Firebase UID), `actorRoles`, `tenantId`
- `targetCollection`, `targetId`
- `action` (create / update / delete / state-transition)
- `before` (old value snapshot, redacted of PHI fields the actor doesn't have permission to read)
- `after` (new value snapshot)
- `timestamp`, `clientType` (web / mobile / extension), `clientVersion`

Audit logs are **append-only** in security rules — even Super Admin cannot edit or delete an audit log entry. The data is retained per the tenant's retention policy (default: forever).

---

## Offline-first on mobile

The Capacitor mobile builds run a local Dexie / IndexedDB cache and a mutation queue. A phlebotomist can collect ten samples on a route with no signal, and the app:

1. Queues each "Collected" mutation locally.
2. Surfaces a clear "Offline — N pending sync" banner.
3. Replays mutations when the network returns, oldest-first, with conflict resolution that prefers server values for non-collection fields and client values for chain-of-custody appends.

Web and desktop builds opt into the same offline behaviour for forms that the user explicitly marks "save for later".

---

## What changes per surface

The five surfaces share most of their code. The differences:

| Concern | Web | Mobile | WXT extension | EMR extension |
|---|---|---|---|---|
| Storage | `localStorage` is forbidden; uses Capacitor Preferences (web fallback to in-memory) | Capacitor Preferences | `chrome.storage` | `chrome.storage` |
| Auth | Firebase popup / redirect | Firebase native (Capacitor plugin) | `chrome.identity.getAuthToken()` | `chrome.identity.getAuthToken()` |
| File upload | `<input type=file>` → FilesHub | Camera / picker → FilesHub | n/a | n/a |
| Background work | Service worker (PWA) | Capacitor background plugin | MV3 service worker | MV3 service worker |

The browser extensions intentionally avoid Firebase Auth SDK (`signInWithPopup`, `signInWithRedirect`) because the Chrome Web Store rejects extensions that load remote code. Auth in extensions goes through `chrome.identity` and document-level ownership checks.

---

## What this architecture does *not* solve

- **Whole-slide pathology imaging** is not a first-class feature; LabFlow stores the image as a FilesHub blob with metadata, but there is no zoom-and-pan viewer or AI-assisted annotation.
- **Real-time analyzer integration over RS-232 / serial** is out of scope; the HL7 v2 ingester assumes a network-capable analyzer or a middleware bridge.
- **Country-specific regulatory reporting** (notifiable diseases, public-health surveillance) is not built in; you can compose it from the audit log + custom reports.
- **Voice-controlled result entry** is not built in.

---

**Next:** [Modules catalogue →](../modules)
