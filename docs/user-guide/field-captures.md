---
sidebar_position: 23
slug: /user-guide/field-captures
title: Field captures and reconciliation
description: LabFlow's reconciliation screen — why a missing field and a contradicting field are different findings, why nothing resolves itself, and why deciding which record is true never edits either record.
keywords:
  - specimen reconciliation
  - chain of custody
  - collection time
  - handheld capture
  - clinical data integrity
image: /img/labflow-social-card.png
---

# Field captures and reconciliation

## Where two records disagree

**`/samples/field-captures`** — what the collector's device recorded, against what the laboratory
holds, field by field.

Specimens collected away from the laboratory arrive with a record made on a handheld. Most of it
matches. This page is for the part that does not.

## Absent and different are not the same finding

A field the device never captured is a **gap** in the record. A field both sides recorded
differently is a **contradiction**, and only one of them can be true. Merging them into a single
"mismatch" count would hide which of the two you are looking at, and they take opposite actions.

So there are three verdicts and never two: agrees, differs, and only-on-one-side.

Fasting is the clearest case. The laboratory has no way to find out afterwards whether somebody had
eaten, so its side of that row is empty by nature — and the phone asks the question once, at the
doorstep, before the tube is filled. If nobody asked, the device says so: **"not asked" is not
"no"**, and recording a No that was never obtained would be putting a clinical fact into a record on
the strength of a default.

## Nothing resolves itself

There is no "accept all", no last-write-wins, and no automatic preference for the laboratory's copy.

Each difference is a person choosing which record is true and being recorded as having chosen —
because a collection time, a collector and a fasting state are all clinical inputs, and a merge
nobody signed is a clinical input nobody is answerable for.

## Why twenty-seven minutes matters

Collection time drives every stability window and every delta check. Twenty-seven minutes can be the
difference between a serum potassium inside its window and one outside it, and the delta check on the
next result compares against an interval computed from that field.

It is not a formatting problem, and it is never resolved by taking the later value automatically.

## Deciding changes nothing except the answer

Pressing a side records a **decision**. It does not edit either record.

The device's account stays exactly as the device wrote it. The laboratory's chain of custody stays
append-only, as it must — the question asked when a result is disputed is not "where is it" but
"where has it been, and who had it". What changes is that the effective value now has an answer, and
a name against it, which is what the laboratory's stability windows and delta checks read.

Changing your mind replaces the decision rather than adding a second one. Two contradictory rows
would leave nobody able to say what was decided.
