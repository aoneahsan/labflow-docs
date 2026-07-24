---
sidebar_position: 1
slug: /user-guide/samples/accession
title: Accession a Received Sample
description: How a lab technician accessions a received specimen in LabFlow — scan the barcode, confirm patient and order, verify specimen suitability, and move the sample into the processing queue with a chain-of-custody entry.
keywords:
  - accession sample LabFlow
  - LIMS sample receiving
  - specimen accessioning
  - barcode sample tracking
  - chain of custody lab
---

# Accession a Received Sample

**Accessioning is the moment a physical specimen becomes a tracked, processable record in LabFlow.** It confirms the right tube belongs to the right order and advances the sample from `collected` / `in-transit` to `received`, writing a chain-of-custody entry as it goes. Required permission: `samples.accession`. The complete lifecycle and rejection branches are documented in the [Sample Tracking module](/docs/modules/sample-tracking).

## Before you start

- The order has been placed and at least one sample is expected (status `collected` or `in-transit`).
- You have the printed or on-screen barcode for the tube in hand.
- You hold the `samples.accession` permission (Lab Technician role by default).

## Steps

1. Open **Samples** from the main menu and choose **Accession** (or scan straight from the bench using the mobile app).
2. **Scan the barcode** on the tube. LabFlow resolves it to the sample and its parent order. If the code is unreadable, type the sample ID instead.
3. **Confirm the match.** The screen shows the patient, the ordered tests, and the required specimen type and container. Verify the tube in your hand matches.
4. **Check specimen suitability.** Confirm volume, container type, and that any stability window has not lapsed. If the specimen is unsuitable, use **Reject** instead and follow [reject and recollect](#if-the-sample-must-be-rejected).
5. **Accession.** Confirm to move the sample to `received`. LabFlow appends a chain-of-custody entry (who, when, where) and queues the sample for processing.
6. **Print a working label** if your workflow uses aliquot labels — the label designer carries the accession number and barcode.

## Result

The sample now reads `received` and appears in the processing queue. The order's dashboard count updates, and the chain-of-custody log shows your accession entry, which is append-only and audit-protected.

## If the sample must be rejected

Choose **Reject**, pick a reason from the enumerated list (e.g. insufficient volume, haemolysis, wrong container, lapsed stability), and confirm. The requesting location is notified and a recollection can be requested. Rejection is also a chain-of-custody event — nothing is deleted.

## Related recipes and references

- [Validate and release a result](../results/validate-and-release) — the next stage after processing.
- [Sample Tracking module](/docs/modules/sample-tracking) — the seven-state lifecycle, barcode format, and stability enforcement in full.
- [User Guide overview](../overview) — recipe index by role.
