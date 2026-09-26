---
slug: /user-guide/listing-and-my-lab
title: Listing a laboratory and My lab
description: How a laboratory applies to be listed in LabFlow's directory, how the application is reviewed, and the laboratory owner's My lab area — the public listing, people, collection points, catalogue, requests and performance.
keywords:
  - list a laboratory
  - laboratory directory
  - laboratory owner
  - lab application review
  - laboratory public listing
  - clinician requests
image: /img/labflow-social-card.png
---

# Listing a laboratory and My lab

A laboratory appears in the public directory at `/laboratories` only after a person on the LabFlow team has reviewed its application. **Listing a laboratory is not self-service**, because a listing is a claim a clinician relies on.

This page is for laboratory owners. Creating a laboratory workspace itself is covered in [Create or join a laboratory](../getting-started/create-or-join-a-laboratory).

## Applying

**`/apply-lab-owner`** — four steps: *"Four things, and a person reads the fourth."*

| Step | What you give |
|---|---|
| **01 The organisation** | Registered (legal) name, registration number, principal town |
| **02 What you do** | The departments you run in house. Work you refer out is declared per test on your catalogue later |
| **03 Evidence** | The accreditation certificate — PDF, JPG or PNG, up to 8 MB |
| **04 Our review** | A person on the LabFlow team reviews the application |

An application can be left half-finished; the draft is kept until you send it. **Nothing is published until the review passes, and a rejected application publishes nothing at all.**

## Following the application

**`/lab-application/status`** shows where it has reached. The outcomes are:

- **Approved** — *"Your laboratory is listed."* The listing starts as a draft; nothing is public until you publish it.
- **Not approved** — the reviewer's reason is shown, and **Answer and resend** reopens the same application with your answers in it, so a refusal is answered rather than restarted.
- **Withdrawn** — you closed it, and can send a new one when ready.

The reviewer's side is described in [Platform administration](./platform-administration#the-review-queue).

## My lab

The owner's area, on the owner's navigation under **My laboratory** and **Requests**.

| Address | What it is |
|---|---|
| `/my-lab` | Requests waiting longer than a working day, tests this month, who may release, listing views |
| `/my-lab/profile` | The public listing — *"Everything on this page is a promise to a stranger."* It includes a preview built from the same fields as the real directory card |
| `/my-lab/staff` | People, their roles, identity status and site |
| `/my-lab/locations` | Collection points |
| `/my-lab/tests` | The catalogue as the directory reads it, including an optional published price |
| `/my-lab/analytics` | Receipt-to-result turnaround and volume, and a comparison against comparable laboratories |
| `/my-lab/requests` · `/my-lab/requests/:requestId` | Requests sent to your laboratory |

The three lists are read by the public directory, so an entry left wrong in them is wrong where a clinician sees it.

`/my-lab/analytics` shows nothing until there is enough work to measure: *"Fewer than 30 results is noise."* The peer comparison shows no heading when there are fewer than five comparable laboratories.

## Requests

A request asks a laboratory *"whether it can take this work"* — it is not a booking and not a quote. It goes to one laboratory; sending the same work to three is three requests.

- **Inbound** (`/my-lab/requests`) — clinicians waiting to hear from you. Accepting a clinician's request is what lets that clinician [order from you](./clinician-portal#getting-a-laboratory-to-accept-your-orders).
- **Sent** (`/requests/new`, then `/my-requests`) — requests you have sent to other laboratories. There is nothing to accept on your side; the page shows whether they have answered and how long you have waited.

**Related:** [Users and access](./users-and-access) · [Referral programme](./referral-programme)
