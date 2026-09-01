---
sidebar_position: 1
slug: /user-guide/overview
title: User guide overview
description: Every shipped LabFlow screen, by area — patients, the test catalogue, panels and reference ranges, orders, specimens, accessioning, labels, result entry, review and release, the dashboard, users, settings and forms.
keywords:
  - LabFlow user guide
  - LIMS workflow
  - LabFlow screens
  - laboratory workflow software
image: /img/labflow-social-card.png
---

# User guide overview

One page per shipped area of LabFlow. Each names the addresses it covers, so nothing here describes a screen that does not exist. Areas that are planned but unbuilt are on the [roadmap](../roadmap).

## The clinical spine

A specimen can be ordered, collected, accessioned, labelled, benched, entered, reviewed, released and amended. These pages follow that path.

| Page | Covers |
|---|---|
| [Patients](./patients) | `/patients`, the record, editing, MRN issuance, merging duplicates |
| [Test catalogue](./test-catalogue) | `/tests` and adding, viewing and editing a test |
| [Panels and reference ranges](./panels-and-reference-ranges) | `/tests/panels`, `/reference-ranges`, `/results/personalized-ranges` |
| [Orders](./orders) | `/orders` and `/tests/orders`, priority, order status |
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
| [Forms](./forms) | `/forms/builder` |
| [Utility tools](./tools) | `/tools/calculators`, `/tools/document-scanner` |

## Two rules that apply everywhere

**One writer per value.** Anything cached in this system is written by exactly one path, and no client role can write it directly. A specimen's status is a fold of its custody trail; a result's status changes only through one transition function. Two paths writing one field is how a laboratory system starts disagreeing with itself.

**Nothing is deleted.** A withdrawn membership, a rejected specimen, a retired test, a superseded result and a merged patient record all still exist. A record that vanishes is a laboratory that cannot explain what happened.
