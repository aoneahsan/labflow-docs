---
sidebar_position: 1
slug: /intro
title: Introduction to LabFlow
description: LabFlow is a multi-tenant Laboratory Information Management System for clinical laboratories, fronted by a public marketplace. It runs on Supabase Postgres with row-level security, and this page states exactly which parts are built today.
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

It is live at **[labflow.aoneahsan.com](https://labflow.aoneahsan.com)**.

:::info This documentation describes what is built, not what is planned
LabFlow is being built in twelve waves. **Four are complete.** This site documents only those. Everything else is listed, unbuilt, on the [roadmap](./roadmap).
:::

## The two halves

**The public marketplace** is open to anyone: the marketing and legal pages, a blog, comparison pages, a `/sitemap` and `/feed` derived from the route registry, and a laboratory directory where each listing shows what that laboratory declared about itself.

**The laboratory system** is what a signed-in laboratory works in: patients, a coded test catalogue, panels and reference ranges, orders, specimens and their chain of custody, accessioning, labels, result entry, result review and release, and an operational dashboard. Around that sit identity, settings, user management and a form builder.

## What is built today

Waves 0 to 3, in order:

| Wave | What it delivered |
|---|---|
| **0 — Foundation** | The design system, React Aria primitives, routing and the app shell, the tenancy and role substrate, the PHI-scrubbing logger, the branded error routes |
| **1 — Public surface** | Marketing pages, the full legal set, blog and comparison pages, `/sitemap` and `/feed`, the public laboratory directory |
| **2 — Identity** | Register and sign in, onboarding, the laboratory setup wizard, one parameterised settings model, profile and identity verification, user management, the form builder |
| **3 — LIMS spine** | Patients · test catalogue · panels and reference ranges · orders · specimens and chain of custody · accessioning · labels and barcodes · result entry · result review and release · the dashboard |

The [user guide](./user-guide/overview) has one page per shipped area.

## What is not built

Billing and invoicing, inventory, equipment, quality control, the compliance suite, the audit-trail interface, e-signatures, an SOP library, workflow automation, appointments, home collection, field capture, the patient portal, the clinician sub-app, reports and analytics, research, telemedicine, population health, EMR/HL7/FHIR integration, and platform administration are **all unbuilt**. They are sequenced on the [roadmap](./roadmap).

Four more things are worth naming plainly, because a laboratory system is usually assumed to have them:

- **There is no public or REST API.** LabFlow has no keyed API, no OpenAPI document and no webhook surface. The application talks to its own database and to a small set of server functions; nothing third-party-facing is exposed.
- **There is no mobile application.** LabFlow is a responsive web application. The rebuilt product carries no native shell.
- **There is no iOS application**, in any form.
- **There is no browser extension and no EMR add-on.**

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

Independent clinical laboratories and reference laboratories that want patients, orders, specimens and results in one system with a real chain of custody and a real release gate. If you need revenue cycle, quality-control runs or EMR interfacing **today**, read the [roadmap](./roadmap) before going further — none of them is built.

## How this documentation is organised

- **[Getting started](./getting-started/quick-start)** — create an account, create or join a laboratory, find your way around.
- **[User guide](./user-guide/overview)** — one page per shipped area of the product.
- **[Architecture](./architecture/overview)** — the database, tenancy and row-level security, and the record-integrity rules.
- **[Roadmap](./roadmap)** — what is not built, and the order it is planned in.
- **[Author](./author)** — who builds LabFlow, and how to reach him.

**Next:** [Quick start →](./getting-started/quick-start)
