---
sidebar_position: 1
slug: /developers/
title: "LabFlow for developers"
description: "Read your LabFlow data from a script, an AI assistant, another system or your calendar: patients read their own reports, staff read non-identifying lab data, everything read only."
keywords:
  - labflow api
  - laboratory api
image: /img/labflow-social-card.png
---

# LabFlow for developers

**LabFlow can be read from outside, and only read.** A patient can let an assistant summarise their reports; a lab
manager can pull turnaround and QC into a spreadsheet or hear the moment an analyser goes out of service. Nothing
outside LabFlow ever writes, and no staff connection ever sees who a patient is.

## Who reaches what?

| You are | Outside apps may read | Never |
|---|---|---|
| A **patient** (portal account) | Your released reports and their results, your orders and visits, your invoices | Anyone else's records |
| **Staff** (a laboratory member) | Workload and turnaround counts, QC materials and runs, equipment and its due dates, stock and lots, the test catalogue, each only if your role opens that area in LabFlow | Any patient's name, date of birth, contact details, MRN, specimen-to-patient link or result |

Patients connect from **Sign-in and apps** in the portal; staff from **Settings → Apps and assistants**.

## Which door do you need?

| You want | Use |
|---|---|
| A script or another system to read | An [access key](./authentication.md) and the [API](./api.md) |
| Claude, ChatGPT, Claude Code or Cursor to read | The [MCP connection](./mcp.md) |
| Your server told when something happens | [Webhooks](./webhooks.md) |
| Visits or equipment due dates in your calendar | A [calendar feed](./calendar-feed.md) |
| Your account protected while any of this is on | [Two-factor](./two-factor.md) |

## Limits

| Limit | Free | Single laboratory | Multi-site | Platform |
|---|---|---|---|---|
| Access keys | 5 | 25 | 50 | 50 |
| API requests a day | 5,000 | 50,000 | 100,000 | 100,000 |
| Webhook addresses | 3 | 20 | 40 | 40 |
| Connected apps | 3 | 10 | 25 | 25 |
| Calendar feeds | 2 | 10 | 20 | 20 |

A patient account always uses the Free row. A member of staff uses the highest plan among their laboratories.
