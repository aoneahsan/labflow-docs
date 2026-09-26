---
sidebar_position: 1
slug: /intro
title: Introduction to LabFlow
description: LabFlow is a multi-tenant Laboratory Information Management System for clinical laboratories, fronted by a public marketplace, with patient and clinician portals. It runs on Supabase Postgres with row-level security; this page states what it is and what it is not.
keywords:
  - LabFlow
  - LIMS
  - laboratory information management system
  - multi-tenant LIMS
  - clinical laboratory software
  - Supabase Postgres LIMS
  - row-level security
  - specimen chain of custody
image: /img/labflow-social-card.png
---

# Introduction to LabFlow

**LabFlow is a multi-tenant Laboratory Information Management System for clinical laboratories, fronted by a public marketplace where patients find labs and laboratories apply to join.** Both halves are the product. Where they meet, the lab-facing LIMS is the system of record and the marketplace reads from it.

It is live at **[labflow.aoneahsan.com](https://labflow.aoneahsan.com)**, and it is built by the LabFlow team.

:::info This documentation describes what is built
Every page here describes behaviour the application ships today. What is **not** built, and what is built but not yet released, is on [Status and limits](./roadmap).
:::

## The two halves

**The public marketplace** is open to anyone: the marketing and legal pages, a blog, comparison pages, a `/sitemap` and `/feed` derived from the route registry, and a laboratory directory where each listing shows what that laboratory declared about itself and a person on the LabFlow team reviewed.

**The laboratory system** is what a signed-in laboratory works in: patients, a coded test catalogue, panels and reference ranges, orders, specimens and their chain of custody, accessioning, labels, result entry, result review and release, and an operational dashboard. Around that spine sit billing, stock and equipment, quality control, compliance and audit, documents and workflow, appointments and home collection, reports and analytics, and the research, population and telemedicine registers.

## Who uses it

| Who | Where |
|---|---|
| **Laboratory staff** — owner, manager, pathologist, senior technician, technician, quality officer, phlebotomist, receptionist, billing clerk | The laboratory system, with a navigation rail built for each role |
| **Patients** | The [patient portal](./user-guide/patient-portal) |
| **Clinicians** | The [clinician portal](./user-guide/clinician-portal) |
| **The LabFlow team** | [Platform administration](./user-guide/platform-administration) |

## Where to use it

LabFlow is a web application at [labflow.aoneahsan.com](https://labflow.aoneahsan.com), responsive from phone to desktop. An [Android app](./getting-started/android-app) of the same application is built and not yet released. There is **no iOS app**, no browser extension and no EMR add-on.

**There is no public or REST API.** LabFlow has no keyed API, no OpenAPI document and no webhook surface. It talks to its own database and a small set of server functions.

**There is no live interface to an analyser, EMR or hospital system.** HL7 v2 and FHIR R4 are [exported and imported as files](./user-guide/interoperability).

## The stack, in one paragraph

LabFlow is a React 19 + TypeScript single-page application built with Vite, routed by TanStack Router, with server state in TanStack Query, forms in `react-hook-form` + Zod, accessible primitives from React Aria Components, styling in Tailwind CSS v4, charts in D3, and every user-visible string routed through i18next. Its backend is **Supabase — one hosted Postgres project, serving development and production both** — where security is **row-level security, deny-by-default on every table**. Server-side work that needs more than a query runs in Supabase Edge Functions. File uploads go to FilesHub as private objects, never to the database. Errors go to Sentry, with the query string stripped. **Firebase Hosting serves the built static files, and that is all Firebase does** — there is no Firebase data tier, no Firestore, and no Firebase Authentication.

See [Architecture](./architecture/overview) for how those pieces fit.

## Signing in

**Authentication is Google sign-in through Supabase, and LabFlow holds no password of its own.** Your laboratory lists a Google account against your user record, and that account is your key — which also means the laboratory can withdraw it without waiting for anybody here. Whatever two-step verification your organisation already requires of a Google account applies before LabFlow is reached.

After the account comes the laboratory: an account can hold memberships in several, and the one you pick decides your role and everything you can see. [Getting started](./getting-started/quick-start) walks through it.

## On compliance, said honestly

**LabFlow is HIPAA-conscious. It is not HIPAA-compliant, and no software can be** — compliance is a property of an organisation and its processes, not of a product. What LabFlow provides is the technical side: tenant isolation enforced in the database, least-privilege access, audit trails that are appended rather than edited, and error and analytics payloads that never carry patient data. The regulatory work — your risk assessment, your agreements, your staff training — remains yours.

LabFlow carries no FDA clearance, no CAP or CLIA accreditation and no SOC 2 attestation.

## Who it is for

Independent clinical laboratories and reference laboratories that want patients, orders, specimens and results in one system with a real chain of custody and a real release gate. If you need a live analyser or EMR interface, read [Status and limits](./roadmap) first — LabFlow does not have one.

## How this documentation is organised

- **[Getting started](./getting-started/quick-start)** — create an account, create or join a laboratory, find your way around.
- **[User guide](./user-guide/overview)** — one page per shipped area of the product, including the patient and clinician portals and platform administration.
- **[Architecture](./architecture/overview)** — the database, tenancy and row-level security, and the record-integrity rules.
- **[Status and limits](./roadmap)** — what is not built, and what is built but not yet released.
- **[Author](./author)** — contact details.

**Next:** [Quick start →](./getting-started/quick-start)
