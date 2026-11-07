---
slug: /compare/openelis-global
title: Moving from OpenELIS Global to LabFlow
description: "How to move from OpenELIS Global to LabFlow, what comes across and what does not, with OpenELIS Global's prices and features as its own pages stated them on 7 November 2026."
keywords:
  - OpenELIS Global alternative
  - moving from OpenELIS Global
  - LabFlow compared with OpenELIS Global
image: /img/labflow-social-card.png
last_update:
  date: 2026-11-07
---

# Moving from OpenELIS Global to LabFlow

An open-source, FHIR-native laboratory information system under the Mozilla Public License, deployed by ministries and implementers from single facilities to national networks. **Last checked 7 November 2026.** <a href="https://openelis-global.org" target="_blank" rel="noopener noreferrer nofollow">Check OpenELIS Global yourself</a>, because a page that says something newer than this one is right.

The side-by-side comparison, with LabFlow's own limits, is [on the LabFlow site](https://labflow.aoneahsan.com/compare/openelis-global/). This page is about making the move.

## Before you move

- Choose OpenELIS Global if you are a ministry, a public-health network or an implementer with technical staff, and a FHIR-native system with no licence cost across many facilities is the goal.
- Choose LabFlow if you are one laboratory without an implementation team, want hosting, a patient portal and a marketplace listing included, and can accept HL7 and FHIR as files rather than a live feed.

What you would give up, going by OpenELIS Global's own pages:

- Open source. 

## The move, step by step

1. **Get your data out of OpenELIS Global first.** OpenELIS Global is open source and you run it, so a copy of your database is already yours to take. Keep it: LabFlow reads none of it directly.
2. **[Create an account](../getting-started/quick-start.md).** Sign-in is with Google, and there is no password to set.
3. **[Set up the laboratory](../getting-started/create-or-join-a-laboratory.md).** Five steps, including its name, departments and time zone.
4. **[Build the test catalogue](../user-guide/test-catalogue.md)**, then [panels and reference ranges](../user-guide/panels-and-reference-ranges.md). These are typed in. There is no bulk import.
5. **[Invite your staff](../user-guide/users-and-access.md)** and give each person a role.
6. **[Add patients](../user-guide/patients.md)** as they arrive. There is no bulk import of patients or of past results, so your old system stays your archive for what came before.
7. **[Take orders](../user-guide/orders.md).** A system that sends HL7 v2 order messages can hand them over one at a time as files, each becoming a draft order, as [interoperability](../user-guide/interoperability.md) explains. There is no live feed.
8. **[Enter](../user-guide/result-entry.md) and [release](../user-guide/result-review-and-release.md) a result** on a real sample before you switch the bench over, and run both systems side by side until you trust it.

## OpenELIS Global's prices

As its own pages stated them on 7 November 2026, not converted between currencies. LabFlow's are on the [pricing page](https://labflow.aoneahsan.com/pricing/).

| Plan | Price | What the page says | Source |
|---|---|---|---|
| OpenELIS Global | Free | Zero licensing cost; open source (MPL); hosting and implementation are your own cost | <a href="https://openelis-global.org/" target="_blank" rel="noopener noreferrer nofollow">Source</a> |


## What each one says it does

"Not stated on the pages we checked" is not a no. Ask OpenELIS Global. LabFlow's column lists only what has shipped.

| What we looked for | OpenELIS Global | LabFlow |
|---|---|---|
| A price on the public page | Yes (<a href="https://openelis-global.org/" target="_blank" rel="noopener noreferrer nofollow">source</a>) | Yes |
| A free plan, or free for the person | Yes (<a href="https://openelis-global.org/" target="_blank" rel="noopener noreferrer nofollow">source</a>) | Yes |
| Patients read their own results online | Not stated on the pages we checked | Yes. For results from laboratories that run LabFlow. |
| The person decides who sees a record | Not stated on the pages we checked | Yes. One frozen report at a time, by a link the person can withdraw. |
| Share one section only (one test, one report) | Not stated on the pages we checked | No. A share opens one whole report. There is no grant for the ECG only or the X-ray only. |
| A laboratory asks for access by the person's ID and the person accepts | Not stated on the pages we checked | No. Not in the product today. There is no ID to give and no request to accept. |
| Access can be withdrawn later | Not stated on the pages we checked | Yes |
| Records kept for years, stated on the page | Not stated on the pages we checked | In part. Free keeps 12 months, then read-only. The paid plans set no cap. No number of years is promised. |
| Quality control (QC) built in | Not stated on the pages we checked | Yes |
| HL7 or FHIR interfaces | Yes (<a href="https://openelis-global.org/" target="_blank" rel="noopener noreferrer nofollow">source</a>) | In part. As files, in and out. No live feed. |
| Several sites or branches under one account | Yes (<a href="https://openelis-global.org/" target="_blank" rel="noopener noreferrer nofollow">source</a>) | Yes |
| An Android app | Not stated on the pages we checked | Yes |
| Works in a browser | Not stated on the pages we checked | Yes |
| A desktop application | Not stated on the pages we checked | No. Not in the product today. Browser and Android only. |
| A backup commitment stated on the page | Not stated on the pages we checked | No. No backup or recovery commitment is made today. |
| Analytics for the laboratory | Not stated on the pages we checked | Yes |
| Collection work continues offline | Not stated on the pages we checked | Yes |
| Reports sent by SMS or WhatsApp from the system | Not stated on the pages we checked | No. An SMS link opens on the handset. Nothing is sent from the system. |
| Hosted by the vendor (cloud) | Not stated on the pages we checked | Yes. Hosted only. On-premise is not offered. |
| Open source | Yes (<a href="https://openelis-global.org/" target="_blank" rel="noopener noreferrer nofollow">source</a>) | No |


## What LabFlow does not have

LabFlow has no ID a person can give a laboratory, no laboratory access requests and no sharing section by section. It has no desktop app, promises no retention period and makes no backup commitment. No laboratories run it in production. [Status and limits](../roadmap.md) has the full list.
