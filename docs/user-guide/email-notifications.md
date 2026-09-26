---
slug: /user-guide/email-notifications
title: Email notifications
description: Which events LabFlow emails about, who receives each one, and why no email carries a result, a test name or a patient's name — you sign in to read the detail.
keywords:
  - LIMS email notifications
  - lab result ready email
  - critical result notification
  - patient notification privacy
image: /img/labflow-social-card.png
---

# Email notifications

LabFlow sends **transactional email only** — a message because something happened that concerns you. There are no marketing sequences.

:::note Delivery is being finished
The set of emails and their wording are approved. Moving every email onto one branded layout, with a plain-text part, is in progress. Everything an email mentions is also in the application, so treat an email as a notice and the application as the record.
:::

## No clinical content in an email

**An email never carries a result, a value, a test name or a patient's name.** It says that something is waiting and asks you to sign in:

- A patient's *"A report is ready"* says to **sign in to read it**.
- A staff member's *"A critical result is verified"* follows the same rule: no patient, test or value.
- *"An order is placed for your patient"* does not name the patient.

Two emails an older version of the product sent are gone for the same reason: **no two-factor code is sent by email** (two-factor is an authenticator app), and **LabFlow never mails a report link** to an address somebody typed — a patient shares a result with the [one-result link](./patient-portal#sharing-and-stopping-it) instead.

## What is emailed

| Group | Emails |
|---|---|
| **Account and access** | Staff invitation · Patient portal invitation · Clinician invitation · Security alert for a new device · Security alert when two-factor changes |
| **Review decisions** | Identity check approved, more asked for, or rejected · Laboratory application approved or rejected |
| **Contact and data requests** | A contact message or data request reaching the LabFlow inbox · Confirmation to the person who made a data request · The answer: acknowledged, carried out or withdrawn |
| **Patients** | A report is ready · An invoice is waiting · A laboratory asks for feedback · A visit is confirmed, has a new time, or is cancelled |
| **Staff notices** | A critical result is verified · A control run is rejected · A specimen is rejected at receipt · An order is placed for your patient · An invoice passes 30 days · A report you signed is amended |
| **Platform notices** | The terms or the privacy policy change · Plan limits start being enforced |

There is **no welcome email**: every account begins with an invitation or an approved application, and both are already emailed.

## Feedback requests

A feedback email goes to the patient's portal account address. The link opens `/feedback/:token`, which signs nobody in and shows no result. See [Feedback after a visit](./patient-portal#feedback-after-a-visit).

**Related:** [Patient portal](./patient-portal) · [Settings](./settings)
