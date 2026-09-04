---
sidebar_position: 19
slug: /user-guide/compliance-and-audit
title: Compliance, audit trail and signatures
description: LabFlow's compliance register and its append-only audit trail — why there is no edit and no delete on the trail, why reading a patient record is itself an event, what the coverage table admits it does not record, and why an electronic signature binds a document version rather than a document.
keywords:
  - audit trail
  - append-only
  - HIPAA
  - CAPA
  - electronic signature
  - 21 CFR Part 11
image: /img/labflow-social-card.png
---

# Compliance, audit trail and signatures

## The audit trail has no edit and no delete

**`/audit-trail`** — one read over every append-only trail the product keeps.

There is no edit control, no delete control and no row action. **Not a disabled one, not one behind a
permission — none.** The absence is the feature, and it is the first thing an assessor looks for.

It is not enforced by hiding buttons. **No client role holds INSERT, UPDATE or DELETE on any events
table**, which is asserted against the database's own privilege catalogues rather than assumed.

**Reading a patient record is an event.** Most rows in the trail are reads, because the question an
investigation asks is almost always who *looked*.

**An export is itself audited** — it appears in the trail with the filter that produced it, written
before the export is offered rather than after.

## The coverage table lists what is not covered

**`/compliance/hipaa`** publishes what the product actually records, counted, per tenant — and an
action with no source reports nothing rather than a zero.

> A coverage table that only lists what is covered describes a system nobody can find the holes in.

One row is an open admission: an empty search is not recorded, and the page says so.

## Incidents carry a CAPA state machine

**`/compliance/incidents`** — an incident moves through investigation to corrective and preventive
action, and each transition is an event rather than a field somebody overwrites.

**`/compliance/documents`**, **`/compliance/training`** and **`/compliance/reports`** share one shell,
reached from its tab strip.

## A signature binds a version, not a document

**`/signatures`** — 21 CFR Part 11 attestations.

An attestation **re-authenticates**, and it binds the exact **document version** that was signed. If
the document changes afterwards, the old signature does not carry forward: the superseded attestation
is struck through and kept, and the new version needs signing again.

> A green tick over content nobody approved is worse than no tick at all.
