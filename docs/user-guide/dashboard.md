---
sidebar_position: 11
slug: /user-guide/dashboard
title: Dashboard
description: The LabFlow operational dashboard — what is waiting and what is late, every figure computed in the database, and a tile that refuses a number it cannot compute rather than inventing one.
keywords:
  - laboratory dashboard
  - turnaround time
  - median receipt to result
  - unacknowledged criticals
  - lab operations
image: /img/labflow-social-card.png
---

# Dashboard

**`/dashboard`** — *what is waiting, and what is late*.

Everything on the page is scoped to **one laboratory and one day**.

## What it shows

| Tile | Answers |
|---|---|
| **Specimens received today** | How much work arrived |
| **Unacknowledged criticals** | What is waiting on a person |
| **Median receipt-to-result** | How long the laboratory is actually taking |
| **Receipt-to-result, by day** | The same figure over time |
| **Department load** | Where the work is sitting |
| **Oldest unreleased results** | What has been waiting longest, linking straight to review |

## Every figure is computed in the database

Not one number on this page is calculated in the browser. Each is a bounded, tenant-filtered query, which is what makes the tiles, the department bars, the table and the chart unable to disagree with each other.

## A figure it cannot compute says so

**The median turnaround tile refuses a number it cannot produce**, and *"not measured"* is its own separate question — never inferred from an empty chart. *"No releases this week"* and *"not enough history for a median"* are different statements, and showing one when the other is true is how a dashboard misleads quietly.

This rule has a specific origin: the application LabFlow replaces produced that figure with a random function behind a swallowed permission error, and the result was indistinguishable from a real one.

For the same reason there is **no revenue tile** — there is no billing data behind this deployment, and a currency total is the number a dashboard is most often asked to invent — and **nothing here forecasts**. Where arithmetic is used it is described as arithmetic.

## Unacknowledged criticals

New ones appear the moment they are flagged, and **they escalate whether or not this page is open**. The dashboard reports the queue; it is not the mechanism.
