---
sidebar_position: 18
slug: /user-guide/quality-control
title: Quality control
description: LabFlow's QC surfaces — Levey-Jennings charts drawn against the material's own established mean and SD, Westgard rules that block a release rather than notifying about it, and the four local quality tools that compute in SQL with no AI branding.
keywords:
  - quality control
  - Levey-Jennings
  - Westgard rules
  - control material
  - turnaround time
  - six sigma
image: /img/labflow-social-card.png
---

# Quality control

## The chart is drawn against the material's own statistics

**`/quality-control`** — control runs, plotted.

A QC material carries a **stored mean and standard deviation**, established over at least twenty
runs, together with the count they were established from. The chart is drawn against **those**, never
against the statistics of the points currently on screen.

> A chart fitted to its own data cannot detect a shift.

**`/quality-control/materials`** is where those figures live, with each lot's expiry — and a lot
within ninety days of expiring can be filtered for, which is the control the page's own empty state
had always described.

## A Westgard violation blocks; it does not notify

When a run breaches a rule, the run's QC state becomes `out_of_control`, and **the release gate
refuses**. It is not a message somebody might read.

> A notification can be missed and a gate cannot.

A run that has not been evaluated is `not_run`, which does **not** block — the absence of a check is
not the same fact as a failed one, and treating them alike would stop a laboratory that has simply
not got to its controls yet.

## The four quality tools

**`/quality/tat-optimizer`**, **`/quality/six-sigma`**, **`/quality/inventory-forecast`** and
**`/quality/csat`** are one screen with four fills, reached from a tab strip.

Every figure on them is **arithmetic over real records, computed in SQL**. There is no model, and
nothing here is described as AI — a claim of that kind would be untrue and would fail a store review
besides.

Satisfaction is the one that needed a source built for it: a laboratory sends a link, the recipient
answers on a page that signs nobody in and reveals nothing about any episode, and the tool publishes
counts and a mean. **Comments are read, never scored.**
