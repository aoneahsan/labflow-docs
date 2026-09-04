---
sidebar_position: 17
slug: /user-guide/inventory-and-equipment
title: Stock and equipment
description: LabFlow's inventory and analyser registers — why there is no expired column and no stored on-hand quantity, why an analyser's status is a fold over its service trail rather than a field somebody sets, and what an expired lot or an out-of-service instrument means for releasing results.
keywords:
  - laboratory inventory
  - reagent lot
  - stock on hand
  - analyser status
  - calibration
  - preventive maintenance
image: /img/labflow-social-card.png
---

# Stock and equipment

## There is no `expired` column

**`/inventory`** — reagent and control lots, with what is left of each.

Expiry is **a comparison between a date and today**, so it is asked rather than stored. A column
would be a second answer to a question the date already settles, and it would be wrong every day
nobody ran the job that updates it.

**On hand is the same shape**: a `SUM` over an append-only movement trail, computed and stored
nowhere. Receipts, issues and adjustments are appended; the quantity is what they add up to.

> A stored quantity plus a movement trail is two writers on one number, and they disagree the first
> time one of them fails halfway.

## An expired lot cannot establish control

This is a patient-safety statement, not a housekeeping one. QC run against an expired lot does not
establish that an analyser is in control — so **results produced against that lot are not
releasable**, and the release gate enforces it rather than trusting the page to say it.

## An analyser's status is a fold, not a field

**`/equipment`** — the instrument register.

Status is **derived from the service trail** and written by one function through a trigger. Nobody
sets it directly, and no client role can:

- `calibration_verified` returns an analyser to service;
- `taken_out_of_service` removes it;
- `preventive_service` moves nothing — a serviced instrument is not thereby a verified one.

That last one is the interesting case, and it is why this value is a **cache with rules** rather than
a plain derivation: the answer depends on the *order* of what happened, and it is filtered on, so it
is stored — but only ever by the fold, never by a caller.

> A cache earns its place when the value has rules, not merely when it is derived.

## An out-of-service analyser cannot establish control either

The same rule as the expired lot, for the same reason, and it is enforced in the same place: results
produced on an instrument that is out of service are not releasable.
