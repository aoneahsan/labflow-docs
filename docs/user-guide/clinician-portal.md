---
slug: /user-guide/clinician-portal
title: The clinician portal
description: LabFlow's clinician sub-app — ordering from laboratories that accepted your practice, reading released results, acknowledging critical results, and the laboratories that take your orders.
keywords:
  - clinician portal
  - lab ordering
  - critical result acknowledgement
  - electronic lab order
  - referring physician portal
image: /img/labflow-social-card.png
---

# The clinician portal

The clinician portal lives under **`/clinician`**. *"This is a reading surface, not a smaller laboratory."* A clinician orders and reads; nothing here touches a specimen, a run or a release.

**A clinician account is not a laboratory membership.** One clinician can hold relationships with several laboratories, and each laboratory grants or withdraws its own.

## The pages

| Address | What it is for |
|---|---|
| `/clinician` | Critical results waiting for you, orders still out, and results released to you |
| `/clinician/orders/new` | Placing an order — *"this is where an order actually comes from"* |
| `/clinician/orders` · `/clinician/orders/:orderId` | Everything you have ordered, and where each order has got to |
| `/clinician/patients` · `/clinician/patients/:patientId` | The people you have ordered for — *"not a patient register"* |
| `/clinician/results` · `/clinician/results/:resultId` | Released results, with the reference range that applied when each was produced |
| `/clinician/critical-results` | Critical results waiting for you to acknowledge them |
| `/clinician/test-catalog` | A laboratory's catalogue, read-only, with turnaround and whether a test is referred out |
| `/clinician/profile` | Your details, and which laboratories accept your orders |

## Getting a laboratory to accept your orders

An order needs a laboratory that has accepted your practice. You ask with a request at **`/requests/new`** — one laboratory per request — and follow it at **`/my-requests`**. The laboratory answers from its side (see [Listing a laboratory and My lab](./listing-and-my-lab#requests)).

On `/clinician/profile`, *"not asked" is not "refused"*: a laboratory you never asked has made no decision about you. Your registration number is checked by a laboratory before your first order is accepted, and a callback telephone number is required, because it is the number a laboratory rings when a critical value comes back.

## Placing an order

The order form asks who the order is for, which laboratory, which tests, and why. The patient is identified by **an opaque identifier, never a name, date of birth or medical record number**, so no identifying detail reaches a URL or an analytics event. Only laboratories that accepted your practice appear. The clinical question is free text that reaches a person; it is not parsed or used to suggest tests.

## Critical results are acknowledged, not just shown

*"A critical result that has only been displayed has not been communicated."* Acknowledging on `/clinician/critical-results` records who saw it and when, and that record is what tells the laboratory the result reached a person. Reading a result is a different act from acknowledging it. Acknowledged results stay visible for seven days.

If the page fails to load, it says so and does not show an empty queue: the laboratory also escalates critical results by telephone.

## What a clinician can see

Only records they are clinically involved in: orders placed by them or their practice. Anything else answers *"This record is not yours to read."* Amended results show both values — the one you had and the one that replaced it.

**Related:** [Result review and release](./result-review-and-release) · [Patient portal](./patient-portal)
