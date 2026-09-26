---
sidebar_position: 90
slug: /roadmap
sidebar_label: Status and limits
title: Status and limits — what is not built
description: Where LabFlow stands — every planned product area is built and the web application is live; the Android release and email delivery are being finished. This page lists what is not built, and the claims LabFlow does not make.
keywords:
  - LabFlow status
  - LabFlow roadmap
  - LIMS limitations
  - not built
image: /img/labflow-social-card.png
---

# Status and limits — what is not built

**Every product area planned for LabFlow is built, and the web application is live at [labflow.aoneahsan.com](https://labflow.aoneahsan.com).** The [user guide](./user-guide/overview) documents each one. This page lists what is still being finished, what is not built, and the claims LabFlow does not make.

## Built, not yet finished

| Area | Where it stands |
|---|---|
| **The Android app** | Built, not on Google Play, and not yet verified on a device. See [The Android app](./getting-started/android-app) |
| **Email delivery** | The emails and their wording are approved; moving every email onto one branded layout is in progress. See [Email notifications](./user-guide/email-notifications) |

## Things frequently assumed to exist

Some of these are named because an earlier version of this site claimed them. None is true today.

| Claim | Status |
|---|---|
| A live HL7, ASTM or FHIR interface to analysers, an EMR or a hospital system | **Not built.** HL7 v2 and FHIR R4 are [exported and imported as files](./user-guide/interoperability); nothing is sent or received automatically |
| Validated EMR vendor mappings (Epic, Cerner, and others) | **Not built, and never validated** against any EMR vendor |
| A public or REST API, webhooks, an OpenAPI document | **Not built.** LabFlow exposes no third-party API |
| An iOS application | **Not built, and not planned** |
| A browser extension or an EMR add-on | **Not built** |
| Paying an invoice or buying a plan inside the application | **Not offered.** A patient can tell the laboratory they intend to pay; payment is arranged outside the application. Plans are arranged with the LabFlow team and applied by an administrator |
| Notifiable-disease reporting to a public-health authority | **Not built.** Population pages count; they submit nothing |
| A symptom checker or any diagnostic advice | **Refused by design.** See [telemedicine](./user-guide/research-population-telemedicine#telemedicine) |
| Whole-slide imaging | **Not built.** The slide viewer holds one uploaded image per specimen |
| Machine learning or predictive analytics | **Not built, and not intended.** Where LabFlow evaluates rules, they are arithmetic on recorded data, and the product says so |
| Patient statements | **Not claimed here** |
| Part 11 validation documentation | **Not built.** The audit trails and versioning exist; the documentation package does not |
| HIPAA compliance, FDA clearance, CAP or CLIA accreditation, SOC 2 | **Not claimed.** LabFlow is HIPAA-conscious — see [On compliance](./intro#on-compliance-said-honestly) |
| On-premise deployment, a dedicated VPC, a BAA, 24/7 phone support | **Not offered** |

## Two result statuses that exist but are never written

The `result_status` vocabulary carries eight values. Six are reachable from the application. **`preliminary` and `validated` are present and not written by any screen** — they are in the vocabulary and in the filter because the workflow they belong to is real. A status no screen can produce is documented here rather than quietly removed.

See [result review and release](./user-guide/result-review-and-release) for the statuses that are in use.
