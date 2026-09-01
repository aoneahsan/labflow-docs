---
sidebar_position: 90
slug: /roadmap
title: Roadmap — what is not built
description: LabFlow ships in twelve waves and four are complete. This page lists every area that is planned and not built — billing, inventory, quality control, compliance, scheduling, portals, analytics, interoperability and platform administration.
keywords:
  - LabFlow roadmap
  - LIMS roadmap
  - not built
  - planned features
  - LabFlow release plan
image: /img/labflow-social-card.png
---

# Roadmap — what is not built

:::warning Everything on this page is unbuilt
Nothing below exists in the product today. It is planned work, listed here so that discovering it during an evaluation takes one page instead of one implementation. What **is** built is in the [user guide](./user-guide/overview).
:::

LabFlow is being built in twelve waves, ordered by data dependency rather than importance — a module sits in the earliest wave where everything it reads already exists. **Waves 0, 1, 2 and 3 are complete.** The rest are below.

## Waves still to come

| Wave | Area | Planned contents |
|---|---|---|
| **4** | Revenue and stock | Billing with a transactional balance · inventory and vendors · an equipment register |
| **5** | Quality, compliance and tools | Quality-control runs and materials · the compliance suite · the audit-trail interface · e-signatures · a file manager · form list and submissions · an SOP library · workflow automation |
| **6** | Scheduling and field ops | Appointments and calendar · home collection with routes and an optimiser · staff availability · field capture and the offline outbox |
| **7** | Portals and personas | The patient portal · the lab-owner persona and lab application · service requests · the clinician sub-app. The largest wave, and the marketplace half of the product |
| **8** | Analytics and domain extras | Reports and PDF output · KPIs, forecasting and peer benchmarking · rule-based analytics · research and biobanking · telemedicine · population health |
| **9** | Interoperability | EMR connections · HL7 and ASTM instrument links · an equipment hub · a pathology viewer |
| **10** | Platform administration | Tenants, revenue, performance, modules, permissions, identity-verification review, lab-application review |
| **11** | Hardening and release | Android packaging · deep links · store submission · cutover |

## Things frequently assumed to exist

Some of these are named because an earlier version of this site claimed them. None is true today.

| Claim | Status |
|---|---|
| Quality control — Westgard rules, Levey-Jennings charts | **Not built.** Planned for wave 5 |
| Billing, insurance claims, patient statements | **Not built.** Planned for wave 4 |
| HL7 v2 and FHIR R4 integration | **Not built.** Planned for wave 9 |
| Validated EMR vendor mappings (Epic, Cerner, and others) | **Not built, and never validated.** No validation has been performed against any EMR vendor |
| A public or REST API, webhooks, an OpenAPI document | **Not built.** LabFlow exposes no third-party API |
| A native mobile application | **Not built.** LabFlow is a responsive web application |
| An iOS application | **Not built, and not planned.** There is no iOS build of LabFlow in any form |
| A browser extension or an EMR Chrome add-on | **Not built** |
| A patient portal | **Not built.** Planned for wave 7 |
| Platform administration, including editing plan limits | **Not built.** Planned for wave 10 |
| Part 11 validation documentation | **Not built.** The audit trails and versioning exist; the documentation package does not |
| On-premise deployment, a dedicated VPC, a BAA, 24/7 phone support | **Not offered** |
| Machine learning or predictive analytics | **Not built, and not intended.** Where LabFlow evaluates rules, they are arithmetic, and the product says so |

## Two result statuses that exist but are never written

The `result_status` vocabulary carries eight values. Six are reachable today. **`preliminary` and `validated` are deliberately present and deliberately unwritten** — they are in the enum and in the filter because the workflow they belong to is real, and the wave that writes them has not shipped. A status that no code path can produce is documented here rather than quietly removed.

See [result review and release](./user-guide/result-review-and-release) for the statuses that are in use.
