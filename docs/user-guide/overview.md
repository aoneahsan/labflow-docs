---
sidebar_position: 1
slug: /user-guide/overview
title: User guide overview
description: Every shipped LabFlow area, by page — the clinical spine from patient to released result, running the laboratory, the patient and clinician portals, analytics, interoperability as files, and platform administration.
keywords:
  - LabFlow user guide
  - LIMS workflow
  - LabFlow screens
  - laboratory workflow software
image: /img/labflow-social-card.png
---

# User guide overview

One page per shipped area of LabFlow. Each names the addresses it covers, so nothing here describes a screen that does not exist. What is not built is on [Status and limits](../roadmap.md).

## The clinical spine

A specimen can be ordered, collected, accessioned, labelled, benched, entered, reviewed, released and amended. These pages follow that path.

| Page | Covers |
|---|---|
| [Patients](./patients.md) | `/patients`, the record, editing, MRN issuance, merging duplicates |
| [Test catalogue](./test-catalogue.md) | `/tests` and adding, viewing and editing a test |
| [Panels and reference ranges](./panels-and-reference-ranges.md) | `/tests/panels`, `/reference-ranges`, `/results/personalized-ranges` |
| [Orders](./orders.md) | `/orders` and `/tests/orders`, priority, order status, importing an HL7 order |
| [Specimens and chain of custody](./specimens.md) | `/samples`, the specimen record, `/samples/register`, `/samples/collections` |
| [Accessioning and the bench](./accessioning.md) | `/samples/scan` and receiving a delivery |
| [Labels and barcodes](./labels.md) | `/labels` and `/tools/barcode-generator` |
| [Result entry](./result-entry.md) | `/results/entry`, `/results`, the result record |
| [Result review and release](./result-review-and-release.md) | `/results/review`, `/results/validation-rules`, escalations, amendments |
| [Dashboard](./dashboard.md) | `/dashboard` |

## Running the laboratory

| Page | Covers |
|---|---|
| [Users and access](./users-and-access.md) | `/users`, roles, release scope, withdrawing and restoring access |
| [Your profile and identity verification](./profile-and-identity.md) | `/profile`, `/profile/verification` |
| [Settings](./settings.md) | `/settings` and its sections |
| [Forms](./forms.md) | `/forms`, `/forms/builder`, submissions |
| [Utility tools](./tools.md) | `/tools/calculators`, `/tools/document-scanner` |
| [Billing, payments and claims](./billing.md) | `/billing`, `/billing/payments`, `/billing/claims`, `/billing/reports` |
| [Stock and equipment](./inventory-and-equipment.md) | `/inventory`, `/equipment` |
| [Quality control](./quality-control.md) | `/quality-control`, `/quality-control/materials`, the four `/quality/*` tools |
| [Compliance, audit trail and signatures](./compliance-and-audit.md) | `/compliance/*`, `/audit-trail`, `/signatures` |
| [Documents, the SOP library and workflow](./documents-and-workflow.md) | `/files`, `/knowledgebase`, `/workflow` |
| [Appointments and the calendar](./appointments-and-calendar.md) | `/appointments`, `/calendar` |
| [Home collection](./home-collection.md) | `/home-collection` and its routes and mobile capture |
| [Field captures](./field-captures.md) | `/samples/field-captures` |
| [Listing a laboratory and My lab](./listing-and-my-lab.md) | `/apply-lab-owner`, `/my-lab/*`, requests between clinicians and laboratories |

## Analysis and exchange

| Page | Covers |
|---|---|
| [Reports and analytics](./analytics.md) | `/reports`, `/analytics/*` |
| [Research, population health and telemedicine](./research-population-telemedicine.md) | `/research/*`, `/population/*`, `/telemedicine/*` |
| [Interoperability](./interoperability.md) | HL7 v2 and FHIR R4 files, `/emr/connections`, `/integration/*` |
| [Email notifications](./email-notifications.md) | What is emailed, to whom, and what an email never contains |

## Portals and the platform

| Page | Covers |
|---|---|
| [Patient portal](./patient-portal.md) | `/portal/*`, the one-result link, feedback |
| [Clinician portal](./clinician-portal.md) | `/clinician/*` |
| [Referral programme](./referral-programme.md) | `/profile/referrals` |
| [Platform administration](./platform-administration.md) | `/admin/*`, `/maintenance` |

## Two rules that apply everywhere

**One writer per value.** Anything cached in this system is written by exactly one path, and no client role can write it directly. A specimen's status is a fold of its custody trail; a result's status changes only through one transition function. Two paths writing one field is how a laboratory system starts disagreeing with itself.

**Nothing is deleted.** A withdrawn membership, a rejected specimen, a retired test, a superseded result and a merged patient record all still exist. A record that vanishes is a laboratory that cannot explain what happened.
