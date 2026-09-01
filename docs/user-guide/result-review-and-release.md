---
sidebar_position: 10
slug: /user-guide/result-review-and-release
title: Result review and release
description: The LabFlow release gate — the review queue, who may release and within which disciplines, critical-value escalation and acknowledgement, validation rules that advise but never release, and amendment as a new version.
keywords:
  - result release
  - result validation
  - critical value escalation
  - delta check
  - amended result
  - release gate
image: /img/labflow-social-card.png
---

# Result review and release

**`/results/review`** — *nothing reaches a clinician until a person here says so*.

This is the only screen in LabFlow that releases a result.

## The queue

Entered results arrive here **the moment a value is entered at the bench**. There is no batch job and nothing waits for a schedule.

The delta check — this result against this patient's previous one — **lives here, not on a report**. A haemoglobin that moved several units since yesterday is either a real emergency or a mislabelled tube, and both need a person now, before release rather than after.

## Who may release

Releasing is a property of the role. Four roles carry it: **senior technician, pathologist, laboratory manager and quality officer.**

On top of the role sits the **release scope** — the disciplines a particular membership may release, granted at [`/users`](./users-and-access) beside the role. An empty scope means *enters only*.

Both are enforced **in the database**, not only in the screen. A person without the role, or releasing outside their disciplines, is refused by the database even if the request never went through the page.

## Critical results and escalation

A critical value is a communication obligation, not a flag colour.

1. **The escalation is recorded** — who was told, when, by which channel. Recording it **does not release the result**.
2. **The result stays blocked** until the clinician acknowledges. An escalation that was fired and forgotten is an open item, and the queue shows it as one.
3. **Acknowledgement closes the escalation and unblocks release.** Record it only when the clinician has actually confirmed — this is the fact the release gate is standing on.

The channels are telephone, in person, secure message, or other.

:::note LabFlow records the call; it does not place it
There is no automated outbound telephony and no auto-fax.
:::

## Validation rules

**`/results/validation-rules`** — *rules that read every result and are not allowed to release one*.

A rule can **hold** a result or **escalate** it. No rule can release one. They do not change who may release; they change how much a reviewer has to work out for themselves.

With no rules defined, every result reaches review with no suggestion attached — safe but slow, because a reviewer reads each one from scratch.

**A rule change is not applied backwards.** It governs results produced after it, exactly as a reference-range change does.

## Amendment: a new version, never an edit

There is deliberately no status called `amended`, and it is not in the filter.

A released result that is later corrected becomes a **new version** carrying a reference to the row it supersedes, and **the superseded row stays released and stays true as of when it was released**. That is the value a clinician actually acted on, and it is precisely the value an investigation asks for. Overwriting it would destroy the record of what was known at the time.

Every version above the first **requires a reason**, enforced by the database rather than by a convention.

## The statuses in use

`pending` · `in_progress` · `entered` · `released` · `rejected` · `cancelled`

Two further values, `preliminary` and `validated`, exist in the vocabulary and are **never written today** — see the [roadmap](../roadmap).
