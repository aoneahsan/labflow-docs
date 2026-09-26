---
slug: /user-guide/patient-portal
title: The patient portal
description: What a patient sees in LabFlow's portal — results in plain words, the history, reports and their versions, invoices without a checkout, sharing and stopping access, and the one-result link.
keywords:
  - patient portal
  - lab results portal
  - share lab results
  - patient invoice
  - HL7 v2 download
  - FHIR R4 download
image: /img/labflow-social-card.png
---

# The patient portal

The portal is a separate shell for patients, under **`/portal`**. It shows the results a laboratory has released to you, from every laboratory you have used, and nothing a laboratory has not released. It is not a laboratory membership: a patient account cannot see a worklist, a specimen or anybody else's record.

Your account is linked to your patient record by the laboratory. Until a laboratory releases something, the portal says so plainly: *"No laboratory has shared a result with you."*

## The pages

| Address | What it shows |
|---|---|
| `/portal` | Results that came back recently, each with a one-line reading and what happens next |
| `/portal/history` | *"Everything, oldest at the bottom."* Every result and every message, from every laboratory, in one list that nothing is removed from. Filters: Everything, Results, Messages |
| `/portal/notifications` | Messages about your results and visits |
| `/portal/reports/:reportId` | One report, with its versions and notes |
| `/portal/invoices/:invoiceId` | One invoice and how it is settled |
| `/portal/orders/:orderId` · `/portal/home-collections/:collectionId` | An order, or a booked home visit |
| `/portal/shares` | Who can read your results, and the one-result link |
| `/portal/profile` | *"What we hold about you, and who put it there."* |

## Results in plain words

A result card says whether each number is inside or outside the usual range and nothing more. **It is not a diagnosis.** The portal states that *"a result outside the usual range is not automatically a problem"*, and it deliberately does not tell you what a number means for you — the doctor who asked for the test has your history and can.

"What happens next" is built from what the record actually holds. When the order names a clinician with an accepted link to the laboratory, the page says your doctor has the result. When it does not, it says who ordered the test and that *"the laboratory does not send results to anyone else on your behalf."*

## Reports and their versions

A report is a fixed snapshot of released results that the laboratory puts together. It is never edited:

- A corrected report is a **new version**. The earlier one is kept exactly as it was, and the page tells you which version you are reading and whether a newer one exists.
- **Questions and notes** under a report are append-only. Nothing written there is edited or deleted.
- **Download** gives the report as an **HL7 v2 message** or a **FHIR R4 bundle** — *"files for another system to read. There is no live feed, so nothing is sent anywhere unless you send the file yourself."* See [HL7 v2 and FHIR as files](./interoperability#hl7-v2-and-fhir-r4-as-files).

## Invoices, without a checkout

An invoice page shows what it covers and who it is from. **Nothing is purchasable in the portal.** The pay page (`/portal/invoices/:invoiceId/pay`) lets you tell the laboratory you intend to pay; in the product's own words, *"it does not take a card, it is not a checkout, and pressing the button does not move any money."* The invoice stays unpaid until the laboratory records the payment.

## Sharing, and stopping it

**`/portal/shares`** lists everyone who can read your results. Stopping somebody's access is immediate, needs no reason, and they are not told. The page is honest about the limit: stopping access *"cannot un-see anything they have already read."*

**A laboratory can never see this list**, so a laboratory cannot tell that you also use another laboratory.

**One-result link.** To show a single result to somebody who is not on the list, create a link for that one result. It opens at `/portal/shared/:token`, needs no sign-in, shows that result and nothing else, and **stops working on its own after seven days**. You can stop it sooner. A link is not a login: anybody holding it can open that one result, so send it the way you would send anything private.

## Your details

`/portal/profile` separates what you can change yourself (the name used when contacting you, a phone number, the language for messages, whether you are told when a result is ready) from what only a laboratory can correct, because it is part of a clinical record. Offers from laboratories near you are **off unless you turn them on**.

## Feedback after a visit

A laboratory may ask for feedback through a link to `/feedback/:token`. That page signs nobody in and shows no result. Comments are read by the laboratory's quality team and are not scored by software. *"Nobody replies to this box, and nothing here reaches a clinician."*

**Related:** [Email notifications](./email-notifications) · [Clinician portal](./clinician-portal)
