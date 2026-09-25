---
sidebar_position: 90
slug: /roadmap
title: Roadmap — what is not built
description: LabFlow ships in twelve waves; waves 0–6 are complete and wave 7 is live except two patient pages. This page lists every area that is planned and not built — analytics, interoperability, platform administration and release hardening.
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

LabFlow is being built in twelve waves, ordered by data dependency rather than importance — a module sits in the earliest wave where everything it reads already exists. **Waves 0 to 6 are complete, and wave 7 is live** except the patient's report and invoice pages. The rest are below.

## Waves still to come

| Wave | Area | Planned contents |
|---|---|---|
| **7** (finishing) | Portals and personas | The patient's report and invoice pages — the rest of the wave (the patient portal, sharing, the lab-owner persona and application, service requests, the clinician sub-app) is live |
| **8** | Analytics and domain extras | Reports and PDF output · KPIs, forecasting and peer benchmarking · rule-based analytics · research and biobanking · telemedicine · population health |
| **9** | Interoperability | EMR connections · HL7 and ASTM instrument links · an equipment hub · a pathology viewer |
| **10** | Platform administration | Tenants, revenue, performance, modules, permissions, identity-verification review, lab-application review |
| **11** | Hardening and release | Android packaging · deep links · store submission · cutover |

## Things frequently assumed to exist

Some of these are named because an earlier version of this site claimed them. None is true today.

| Claim | Status |
|---|---|
| Quality control — Westgard rules, Levey-Jennings charts | **Quality-control runs and materials are built** (wave 5), with Westgard rules. Levey-Jennings charts are not claimed here |
| Billing, insurance claims, patient statements | **Invoices, payments and insurance claims are built** (wave 4). Patient statements are not claimed here |
| HL7 v2 and FHIR R4 integration | **Not built.** Planned for wave 9 |
| Validated EMR vendor mappings (Epic, Cerner, and others) | **Not built, and never validated.** No validation has been performed against any EMR vendor |
| A public or REST API, webhooks, an OpenAPI document | **Not built.** LabFlow exposes no third-party API |
| A native mobile application | **Not built.** LabFlow is a responsive web application |
| An iOS application | **Not built, and not planned.** There is no iOS build of LabFlow in any form |
| A browser extension or an EMR Chrome add-on | **Not built** |
| A patient portal | **Built** (wave 7) — except the report and invoice detail pages, which are still to come |
| Platform administration, including editing plan limits | **Not built.** Planned for wave 10 |
| Part 11 validation documentation | **Not built.** The audit trails and versioning exist; the documentation package does not |
| On-premise deployment, a dedicated VPC, a BAA, 24/7 phone support | **Not offered** |
| Machine learning or predictive analytics | **Not built, and not intended.** Where LabFlow evaluates rules, they are arithmetic, and the product says so |

## Two result statuses that exist but are never written

The `result_status` vocabulary carries eight values. Six are reachable today. **`preliminary` and `validated` are deliberately present and deliberately unwritten** — they are in the enum and in the filter because the workflow they belong to is real, and the wave that writes them has not shipped. A status that no code path can produce is documented here rather than quietly removed.

See [result review and release](./user-guide/result-review-and-release) for the statuses that are in use.
