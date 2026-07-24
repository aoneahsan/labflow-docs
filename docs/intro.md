---
sidebar_position: 1
slug: /intro
title: Introduction to LabFlow
description: LabFlow is a multi-tenant Laboratory Information Management System (LIMS). Web app, mobile (Capacitor), browser extension, and EMR add-on share one Firestore-backed multi-tenant model.
keywords:
  - LabFlow
  - LIMS
  - laboratory information management system
  - multi-tenant LIMS
  - clinical laboratory software
  - HL7 FHIR
  - LOINC
  - sample tracking
  - quality control
image: /img/labflow-social-card.jpg
---

# Introduction to LabFlow

**LabFlow is a multi-tenant Laboratory Information Management System (LIMS).** It runs on the web, ships native mobile builds via Capacitor (Android / iOS), and extends into a browser extension and an EMR Chrome add-on. One codebase, one Firestore-backed data model, four client surfaces — all scoped per tenant so two laboratories share the same deployment without ever seeing each other's patients, orders, or results. There is no server tier: LabFlow is 100% client + Firestore.

This documentation covers every module, every workflow, and every option exposed in the product. It is written for laboratory administrators, clinicians, lab technicians, integrators (HL7 / FHIR / REST), and developers who plan to deploy or extend LabFlow.

> **Built and maintained by [Ahsan Mahmood](./author)** — full-stack engineer, Capacitor + Firebase specialist. The main app repository is private; this documentation site is the public surface.

---

## What LabFlow does

LabFlow covers the end-to-end laboratory workflow:

- **Patient management** — registration, demographics, insurance, medical history, document capture, MRN allocation, deduplication.
- **Test catalog** — LOINC-integrated test directory, panels, categories, age- and gender-specific reference ranges, specimen requirements, reflex testing, pricing.
- **Test orders** — single and batch ordering, STAT flagging, order templates, doctor and clinic association, cancellation flow.
- **Sample tracking** — collection, accessioning, barcode / QR labelling, chain of custody, processing status, reroute, reject + recollect.
- **Results management** — result entry, critical-value alerts, the four-state validation lifecycle (Draft → Reviewed → Approved → Released), report templates, PDF generation, distribution.
- **Quality control** — QC runs, Levey-Jennings charts, Westgard rules (1-2s, 1-3s, 2-2s, R-4s, 4-1s, 10-x), automated rejection and alerting.
- **Billing & insurance** — invoicing, claim processing, payment tracking, financial analytics, configurable price lists per insurer.
- **Inventory** — stock levels, reagent lot tracking, vendor + purchase order management, low-stock alerts.
- **Appointments** — scheduling, calendar view, reminder templates.
- **Home collection** — phlebotomist scheduling, route planning, mobile collection workflow.
- **Reports & analytics** — KPI dashboards, custom reports, TAT analytics, staff productivity, sample-status feeds, export.
- **User & role management** — 11 built-in roles, 177 fine-grained permissions across 16 categories, audit-logged role changes.
- **Settings** — per-tenant branding, locale, timezone, working hours, holiday calendar, label templates, report templates.
- **Admin panel** — system health, tenant management, configuration, integration toggles.
- **EMR integration** — HL7 v2 message mapping, FHIR R4 resources, webhooks, Chrome extension that injects order/result panels into existing EMR UIs.
- **Workflow automation** — rule engine for triggers (order created, sample received, result released) and actions (notify, escalate, reroute).
- **Communication hub** — SMS, email, in-app, and push notifications with templated content per event.

For the full feature catalog with subpages and screens, see [Modules](./modules).

---

## What LabFlow is *not* (honest framing)

This section exists because clarity beats marketing copy.

- **Not certified for any regulator yet.** LabFlow is HIPAA-*conscious* in design (multi-tenant scoping on every read, audit logs on every mutation, sanitised error reporting), but it carries no FDA 510(k) clearance, no CAP / CLIA accreditation, no HIPAA Business Associate Agreement template, and no SOC 2 attestation. Treat it as a strong starting point, not a turnkey regulated deployment.
- **Not currently distributed in app stores.** The web app is live at [`https://labflow.aoneahsan.com`](https://labflow.aoneahsan.com). Native Android (AAB) and iOS builds are produced and ready, but **Play Store and App Store distribution is pending** as of this writing. The browser extension and EMR Chrome extension are likewise not yet on the Chrome Web Store. The mobile and extension builds work — installation just isn't through the public stores yet.
- **No Firebase Storage.** All file uploads (patient documents, result PDFs, scanned consent forms, label artwork) flow through the [FilesHub API](https://fileshub.zaions.com/ai-integration), not Firebase Storage. This is a deliberate cost and portability decision.
- **No Firebase Crashlytics, no Firebase Performance Monitoring.** Sentry handles error reporting; native performance is observed through Amplitude and Microsoft Clarity timing. The two paid Firebase plugins are intentionally absent because they require Gradle plugins and Firebase Console wiring without giving us anything Sentry doesn't already cover.
- **Not open source.** The main LabFlow application repository is private. This documentation site, however, is published as a public GitHub repository (see the GitHub link in the navbar) so search engines and AI engines can index it.
- **Single-language for now.** The product UI and these docs ship in English only. Right-to-left support and additional locales are a future-roadmap item, not a shipped feature.

If a feature you need is on the "not yet" list, please reach out to [the author](./author) directly.

---

## Tech stack

The stack is intentionally narrow — fewer moving parts, faster onboarding, less drift.

| Layer | Choice |
|---|---|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 + Headless UI + Heroicons |
| Forms | `react-hook-form` + `zod` |
| Server state | TanStack Query |
| Client state | Zustand |
| Routing | React Router with URL-state preservation for modals, tabs, filters |
| Auth + database | Firebase Authentication (Google sign-in) + Firestore (asia-south1) |
| Server logic | None — 100% client + Firestore (no server tier; critical alerts + analytics run client-side) |
| File storage + email | FilesHub API (not Firebase Storage) |
| Native shell | Capacitor 8 with 30+ official + community plugins |
| Browser extension | WXT (Manifest V3) |
| EMR add-on | Chrome Manifest V3 extension |
| Charts | D3.js (no Recharts / Chart.js / ApexCharts) |
| Errors | Sentry |
| Analytics | Amplitude + Microsoft Clarity + Firebase Analytics |
| Offline | Dexie / IndexedDB with mutation queue + replay |

For the architectural rationale and module-level diagrams, see [Architecture](./architecture/overview).

---

## Who LabFlow is built for

- **Independent clinical laboratories** that want a single system covering patients, orders, samples, results, QC, billing, and inventory without stitching three vendors together.
- **Reference laboratories** that need a multi-tenant deployment so partner clinics can submit orders directly into a shared instance.
- **Hospital lab departments** that already run an EMR and want LabFlow's order entry and result release injected into their existing clinical workflow via the Chrome extension.
- **Home-collection services** that need a mobile-first phlebotomy workflow with route planning and offline support.

If your laboratory does pure research without billing, or pure pathology with whole-slide imaging as the primary deliverable, LabFlow will solve part of your problem but not all of it. Check the [module catalog](./modules) before committing.

---

## How this documentation is organised

The docs follow the [Diátaxis](https://diataxis.fr) split:

- **[Getting Started](./getting-started/quick-start)** — tutorial-style onboarding for evaluators and new admins.
- **[Architecture](./architecture/overview)** — explanation of multi-tenancy, the five surfaces, the Firestore data model, and the security model.
- **[Modules](./modules)** — reference pages, one per module, listing every screen, every form field, and every option.
- **[User Guide](./user-guide/overview)** — how-to recipes for the most common tasks (registering a patient, validating a result, processing a claim).
- **[API Reference](./api/overview)** — the live Firestore client-SDK contract (REST + HL7 / FHIR are roadmap).
- **[Author](./author)** — about the developer, contact, and how to support the project.

---

## Frequently asked questions

### Is LabFlow open source?

The main app repository is private. The documentation site you're reading is open source so AI search engines and Google can index it freely. If you need a self-host arrangement or a source license, contact [the author](./author) directly.

### Is LabFlow HIPAA-compliant?

LabFlow is HIPAA-*conscious*. Multi-tenant scoping is enforced on every Firestore read and write; audit logging covers every mutation to patient records, results, and orders; error payloads are sanitised before being sent to Sentry. Compliance is a deployment-level outcome, however — you, as the deploying entity, must sign your own BAA with Firebase, configure access logging, train your staff, and document your risk assessment. LabFlow gives you the technical foundation, not the regulatory paperwork.

### Can I integrate LabFlow with my existing EMR?

The live path today is the Chrome extension that injects order-entry and result-view panels into existing EMR UIs (reading Firestore directly — no server-side integration). HL7 v2 message mapping and FHIR R4 resources (`Patient`, `ServiceRequest`, `Observation`, `DiagnosticReport`) are on the roadmap. See [EMR Integration](./modules).

### What does it cost?

The main LabFlow service is hosted at `https://labflow.aoneahsan.com`. Pricing is handled directly with the developer — there is no public price card. To support the project independently of any commercial arrangement, you can contribute via the [author's payment link](https://aoneahsan.com/payment?project-id=labflow&project-identifier=com.aoneahsan.labflow).

### How fresh is this documentation?

The bottom of every page shows a "Last updated" timestamp. The site rebuilds on every doc commit, regenerates `sitemap.xml` with fresh `<lastmod>` values, and pings IndexNow for Bing / Yandex. Expect freshness within hours of any change.

---

**Next step:** [Quick Start →](./getting-started/quick-start)
