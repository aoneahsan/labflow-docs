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

One page per shipped area of LabFlow. Each names the addresses it covers, so nothing here describes a screen that does not exist. What is not built is on [Status and limits](../roadmap).

## The clinical spine

A specimen can be ordered, collected, accessioned, labelled, benched, entered, reviewed, released and amended. These pages follow that path.

| Page | Covers |
|---|---|
| [Patients](./patients) | `/patients`, the record, editing, MRN issuance, merging duplicates |
| [Test catalogue](./test-catalogue) | `/tests` and adding, viewing and editing a test |
| [Panels and reference ranges](./panels-and-reference-ranges) | `/tests/panels`, `/reference-ranges`, `/results/personalized-ranges` |
| [Orders](./orders) | `/orders` and `/tests/orders`, priority, order status, importing an HL7 order |
| [Specimens and chain of custody](./specimens) | `/samples`, the specimen record, `/samples/register`, `/samples/collections` |
| [Accessioning and the bench](./accessioning) | `/samples/scan` and receiving a delivery |
| [Labels and barcodes](./labels) | `/labels` and `/tools/barcode-generator` |
| [Result entry](./result-entry) | `/results/entry`, `/results`, the result record |
| [Result review and release](./result-review-and-release) | `/results/review`, `/results/validation-rules`, escalations, amendments |
| [Dashboard](./dashboard) | `/dashboard` |

## Running the laboratory

| Page | Covers |
|---|---|
| [Users and access](./users-and-access) | `/users`, roles, release scope, withdrawing and restoring access |
| [Your profile and identity verification](./profile-and-identity) | `/profile`, `/profile/verification` |
| [Settings](./settings) | `/settings` and its sections |
| [Forms](./forms) | `/forms`, `/forms/builder`, submissions |
| [Utility tools](./tools) | `/tools/calculators`, `/tools/document-scanner` |
| [Billing, payments and claims](./billing) | `/billing`, `/billing/payments`, `/billing/claims`, `/billing/reports` |
| [Stock and equipment](./inventory-and-equipment) | `/inventory`, `/equipment` |
| [Quality control](./quality-control) | `/quality-control`, `/quality-control/materials`, the four `/quality/*` tools |
| [Compliance, audit trail and signatures](./compliance-and-audit) | `/compliance/*`, `/audit-trail`, `/signatures` |
| [Documents, the SOP library and workflow](./documents-and-workflow) | `/files`, `/knowledgebase`, `/workflow` |
| [Appointments and the calendar](./appointments-and-calendar) | `/appointments`, `/calendar` |
| [Home collection](./home-collection) | `/home-collection` and its routes and mobile capture |
| [Field captures](./field-captures) | `/samples/field-captures` |
| [Listing a laboratory and My lab](./listing-and-my-lab) | `/apply-lab-owner`, `/my-lab/*`, requests between clinicians and laboratories |

## Analysis and exchange

| Page | Covers |
|---|---|
| [Reports and analytics](./analytics) | `/reports`, `/analytics/*` |
| [Research, population health and telemedicine](./research-population-telemedicine) | `/research/*`, `/population/*`, `/telemedicine/*` |
| [Interoperability](./interoperability) | HL7 v2 and FHIR R4 files, `/emr/connections`, `/integration/*` |
| [Email notifications](./email-notifications) | What is emailed, to whom, and what an email never contains |

## Portals and the platform

| Page | Covers |
|---|---|
| [Patient portal](./patient-portal) | `/portal/*`, the one-result link, feedback |
| [Clinician portal](./clinician-portal) | `/clinician/*` |
| [Referral programme](./referral-programme) | `/profile/referrals` |
| [Platform administration](./platform-administration) | `/admin/*`, `/maintenance` |

## Two rules that apply everywhere

**One writer per value.** Anything cached in this system is written by exactly one path, and no client role can write it directly. A specimen's status is a fold of its custody trail; a result's status changes only through one transition function. Two paths writing one field is how a laboratory system starts disagreeing with itself.

**Nothing is deleted.** A withdrawn membership, a rejected specimen, a retired test, a superseded result and a merged patient record all still exist. A record that vanishes is a laboratory that cannot explain what happened.
