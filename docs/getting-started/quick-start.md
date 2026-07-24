---
sidebar_position: 1
slug: /getting-started/quick-start
title: Quick Start
description: Open LabFlow, sign in to a tenant, register a patient, place a test order, validate a result. End-to-end in under 10 minutes on the live web app.
keywords:
  - LabFlow quick start
  - LIMS getting started
  - laboratory information system tutorial
---

# Quick Start

This page gets you from "I've heard of LabFlow" to "I've placed an order, validated a result, and released a report" in about ten minutes — entirely against the **live web app**, no local setup required.

If you intend to self-host or extend LabFlow, jump to the [Installation guide](./installation) instead.

---

## Before you start

| You'll need | Why |
|---|---|
| A modern browser (Chrome, Edge, Firefox, Safari) | Web app + browser-based identity |
| A tenant invitation, or the public test account | The system is multi-tenant; you must be inside a tenant to do anything |
| ~10 minutes | End-to-end workflow walkthrough |

There is no software to install for this walkthrough.

---

## Step 1 — Open the app

Visit [`https://labflow.aoneahsan.com`](https://labflow.aoneahsan.com).

The first screen is a sign-in page. **LabFlow signs in with Google only** — "Continue with Google" (Firebase Authentication / Google OAuth 2.0). There is no email/password, phone, or magic-link sign-in; a single federated provider keeps credential handling out of the app entirely.

Your laboratory administrator grants your account access to a tenant; on first Google sign-in you're dropped into your tenant (or the tenant chooser if you belong to more than one).

If you're evaluating LabFlow without access, contact [the author](../author) — there is no public self-service signup yet.

---

## Step 2 — Choose a tenant

If your account belongs to a single laboratory, you skip this step and go straight to the dashboard.

If your account belongs to multiple laboratories (this is common for reference-laboratory networks and physicians who consult for several clinics), you'll see a tenant chooser. Pick the laboratory you want to work in. The choice is sticky for the session — switch back via the tenant indicator in the top bar.

> **Multi-tenant isolation is enforced server-side, not just client-side.** Every Firestore read and write includes a `tenantId` predicate that the security rules verify against your authenticated session. You cannot accidentally see another tenant's data.

---

## Step 3 — Register a patient

From the dashboard, open **Patients → Add Patient**. The form captures:

- **Demographics** — full name, date of birth, sex, photo (optional).
- **Contact** — phone, email, address, preferred language.
- **Identity** — MRN (auto-allocated if you leave it blank), national ID, SSN.
- **Insurance** — provider, policy number, group, validity dates.
- **Medical** — blood type, known allergies, current medications, chronic conditions.
- **Emergency contact** — name, phone, relationship.

Required fields are marked with an asterisk. The form uses [`react-hook-form`](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation, so errors surface inline as you type.

Click **Save**. You're now on the patient detail page, with tabs for Visits, Documents, Insurance, Orders, Results, and Audit Log.

---

## Step 4 — Place a test order

From the patient detail page, click **New Order**.

1. **Pick tests.** The catalog is searchable by name, LOINC code, or local test code. Each test shows specimen requirements, turnaround time, and price.
2. **Add a panel** if you'd rather order a pre-grouped set (CBC, lipid panel, liver function tests, etc.).
3. **Mark STAT** if the order is urgent — STAT orders skip the usual queue and trigger an immediate notification to the lab.
4. **Add clinical notes** — these flow through to the requisition and final report.
5. **Confirm.** The system allocates an order ID, creates one or more sample records (one per specimen type), prints labels (or generates PDFs you can print yourself), and updates the dashboard.

The order appears under **Orders → Pending** until samples arrive at the lab.

---

## Step 5 — Track samples

Open **Samples → All Samples**. Each sample carries:

- A unique accession number and barcode.
- The patient and order it belongs to.
- A status (Collected → In Transit → Received → Processing → Completed → Reported).
- A chain-of-custody log: who handled it, when, and what happened.

Scan the barcode with the mobile app or paste the code into the search box to update the status. The chain-of-custody log captures every change automatically — you don't write to it manually.

If a sample is rejected (haemolysed, insufficient volume, mislabelled), open it, click **Reject**, choose a reason, and the system creates a recollect order automatically.

---

## Step 6 — Enter and validate a result

When the analyzer finishes, results enter the system either:

- **Manually** — a technician opens the sample and types values into the result form. The form pulls reference ranges automatically by patient age and sex.
- **By instrument integration** — HL7 ORU messages from connected analyzers map directly to result records.

Every result follows the same four-state lifecycle:

1. **Draft** — entered, not yet validated. Editable by the technician who entered it.
2. **Reviewed** — a second-tier technologist has technically validated the value (correct units, no instrument flag, within plausible range).
3. **Approved** — a pathologist or senior reviewer has clinically validated the value (interpretation, comments, critical-value handling).
4. **Released** — the report is signed and made available to the ordering clinician and patient. Once released, the result is immutable; corrections produce an addendum.

**Critical values** trigger an alert *before* release: a banner appears on the dashboard, an SMS / push notification fires to the on-call clinician, and the lab cannot release the result until the alert is acknowledged.

---

## Step 7 — Release the report

After approval, open the result, pick a report template (default, panel-summary, full-clinical), and click **Generate Report**. The report PDF is generated in-app (client-side), watermarked with the tenant logo, and stored in [FilesHub](https://fileshub.zaions.com/ai-integration). A delivery link is queued for the patient (email via FilesHub) and the ordering clinician sees the report inline in their dashboard.

The release event writes to the audit log and updates the order status to "Reported". The sample chain-of-custody log gets a final "Reported" entry. You can revoke the release within a configurable window (default 30 minutes) if you spot an error post-release; after that window, you must issue an addendum.

---

## What's next

- **Set up your test catalog** — see [Modules → Test Catalog](../modules) for adding tests, panels, reference ranges, and pricing.
- **Configure roles and permissions** — 11 built-in roles, 177 fine-grained permissions. See [User Management](../modules).
- **Integrate with an EMR** — if you already run an EMR, install the [Chrome extension](../modules) to inject LabFlow ordering and result-view into your existing UI without server-side integration.
- **Self-host** — if you need a private deployment, follow the [Installation guide](./installation).

---

## FAQ

### Do I need to install anything for this walkthrough?

No. The walkthrough runs entirely against the hosted web app at `https://labflow.aoneahsan.com`.

### What if I don't have an invitation yet?

Contact [the author](../author). There is no public self-service signup at this time.

### Is my data safe in a multi-tenant deployment?

Multi-tenant isolation is enforced in the Firestore security rules — the single access boundary in LabFlow's serverless (100% client + Firestore) architecture. No client request can read or write across tenants. That said, deploying for a regulated environment (HIPAA, GDPR) is a deployment-level decision involving your own BAA, access logging, and risk assessment — see [the introduction's "What LabFlow is not" section](../intro#what-labflow-is-not-honest-framing).

### How do I report a bug?

Email [aoneahsan@gmail.com](mailto:aoneahsan@gmail.com) with steps to reproduce and any console / network errors. The main app repo is private, so public issue tracking lives in the [documentation repo](https://github.com/aoneahsan/labflow-docs/issues).

---

**Next:** [Installation →](./installation)
