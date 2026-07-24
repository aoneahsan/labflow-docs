---
sidebar_position: 6
slug: /modules/sample-tracking
title: Sample Tracking Module
description: Sample lifecycle from collection through reporting in LabFlow — accession, barcode/QR labels, chain of custody (append-only), reject and recollect, mobile collection workflow, offline support.
keywords:
  - LabFlow sample tracking
  - LIMS sample lifecycle
  - chain of custody laboratory
  - barcode sample labelling
  - sample reject recollect
  - phlebotomy mobile app
---

# Sample Tracking Module

**A sample is the physical specimen — a tube of blood, a urine cup, a swab — that flows through your laboratory.** Sample Tracking is the module that records every event in that physical journey, from the moment a phlebotomist collects it to the moment a result is released. Samples carry barcodes (or QR codes), they accumulate an immutable chain-of-custody log, and they enforce stability windows so a specimen drawn yesterday at noon cannot be re-tested today without a new collection.

If a sample is rejected, the module spawns a recollect order automatically; if a sample is lost, the audit log preserves enough information to reconstruct what happened.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Pre-analytical → Analytical |
| Required permission to view | `samples.read` |
| Required permission to update status | `samples.update` |
| Firestore collections | `samples`, `sample_events`, `sample_rejections`, `samples_audit_logs` |
| Routes | `/samples`, `/samples/scan`, `/samples/:id`, `/samples/:id/events`, `/samples/:id/reject`, `/samples/:id/recollect`, `/samples/batch-receive`, `/samples/labels` |
| Linked modules | [Test Orders](./test-orders), [Results Management (Batch 04)](/docs/modules), [Home Collection (Batch 06)](/docs/modules) |

---

## Sample lifecycle

A sample passes through up to seven states, each one captured as an immutable `sample_events` document with `previousStatus`, `newStatus`, `at`, `byUserId`, `byDevice`, `notes`.

| # | State | Trigger | Who can change |
|---|---|---|---|
| 1 | `pending` | Order placed — sample doc created but specimen not yet drawn | system |
| 2 | `collected` | Phlebotomist scans the barcode at collection | role: Phlebotomist + `samples.collect` |
| 3 | `in-transit` | Sample placed in a transport bag / pickup container | role: Phlebotomist / Courier + `samples.transit` |
| 4 | `received` | Sample scanned at the lab's receiving station | role: Lab Receiving + `samples.receive` |
| 5 | `processing` | Sample placed on (or sent to) an analyzer; or manual workup started | role: Lab Technician + `samples.process` |
| 6 | `completed` | Result entered, no longer needs the physical specimen | system (when last result moves to `Approved`) |
| 7 | `reported` | All result PDFs released; sample can be archived / discarded per retention policy | system (when last result `Released`) |

Branches off the main lifecycle:

| Branch | Trigger | Outcome |
|---|---|---|
| `rejected` | Lab finds the sample unusable (haemolysed, insufficient, unlabelled) | Sample frozen; recollect order auto-created |
| `cancelled` | The owning order is cancelled before sample reaches `Processing` | Sample frozen; no recollect |
| `lost` | Sample cannot be located | Sample flagged; audit log captures last known event; incident report generated |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/samples` | Filterable list across all sample states | `samples.read` |
| 2 | `/samples/scan` | Barcode-scanner-first view — type or scan a barcode to jump to the sample | `samples.read` |
| 3 | `/samples/:id` | Sample detail with tabs for Events, Tests, Reject, Recollect | `samples.read` |
| 4 | `/samples/:id/events` | Full chain-of-custody log | `samples.read` |
| 5 | `/samples/:id/reject` | Reject modal — captures reason + photo | `samples.reject` |
| 6 | `/samples/:id/recollect` | Recollect order creation | `samples.recollect` |
| 7 | `/samples/batch-receive` | Bulk receiving via repeated scans | `samples.receive` |
| 8 | `/samples/labels` | Label reprint workspace | `samples.labels.print` |

---

## Sample document shape

```jsonc
{
  "id": "sample_...",
  "tenantId": "...",
  "orderId": "order_...",
  "patientId": "patient_...",
  "accessionNumber": "ACC-2026-001234",
  "barcode": "L26-001234-7",
  "specimenType": "serum",
  "containerType": "SST-gold-top",
  "volumeMl": 5.0,
  "status": "received",
  "collectedAt": "...",
  "collectedByUserId": "...",
  "receivedAt": "...",
  "stabilityExpiresAt": "...",
  "externalSource": false,
  "fastingConfirmed": true,
  "currentLocationId": "loc_freezer_A2",
  "linkedTestIds": ["test_glucose", "test_lipid"]
}
```

Each `sample_events` doc captures `sampleId`, `tenantId`, `previousStatus`, `newStatus`, `at`, `byUserId`, `byDevice` (`web` / `mobile` / `extension`), `location` (when collected — GPS coords for home collection, room ID for in-clinic), `notes`, `signature` (when applicable).

The chain-of-custody collection is **append-only in security rules** — even Super Admin cannot delete an event. This is the foundation for any HIPAA / accreditation evidence pack.

---

## Barcodes and QR codes

Every sample is issued exactly one canonical barcode (1D Code 128 by default; QR is an option enabled per-tenant in **Settings → Sample Labelling**). The barcode format is `L<tenantPrefix>-<6-digit-counter>-<luhn-check-digit>` — example: `L26-001234-7`.

| Property | Value |
|---|---|
| Symbology | Code 128 (default) or QR Code |
| Label sizes | 30×15 mm, 38×20 mm, 50×25 mm, 76×50 mm (configurable per printer template) |
| Printer drivers | Zebra ZPL, Dymo, Brother QL, generic CUPS |
| Reprint allowed | Yes, with `samples.labels.print` permission and an audit-log entry |

Label content (configurable per template):

- Patient name + DOB + MRN
- Barcode / QR
- Accession number
- Tube / container type indicator
- Order ID
- "STAT" banner when the order is STAT
- Tenant logo / name (configurable on / off)

---

## Reject workflow

The `/samples/:id/reject` modal captures:

| Field | Type | Required | Notes |
|---|---|---|---|
| Rejection reason | enum | required | `haemolysed` / `clotted` / `insufficient-volume` / `mislabelled` / `unlabelled` / `contaminated` / `wrong-container` / `expired` / `damaged` / `other` |
| Other-reason text | textarea | required-if-other | 1–500 chars |
| Photo evidence | image (FilesHub) | optional | jpg / png; max 5 MB |
| Auto-create recollect order | checkbox | required | default checked |
| Notify ordering clinician | checkbox | required | default checked |
| Internal lab note | textarea | optional | 0–500 chars |

When submitted:

1. The sample status moves to `rejected` (or `cancelled` if the user clears "auto-create recollect").
2. An entry is appended to `sample_events`.
3. If auto-recollect is on, a new sample doc is created against the same order with the same test bindings and status `pending`. The new sample's `barcode` is freshly issued; the old barcode remains on file but no longer maps to an active sample.
4. If notify-clinician is on, a `notifications` doc fires to the ordering clinician's preferred channels.

---

## Stability enforcement

Each sample carries a `stabilityExpiresAt` computed at collection: `collectedAt + max(stabilityHours across all linked tests)`. The lab cannot move a sample to `Processing` after `stabilityExpiresAt`; the system blocks the transition and surfaces a clear inline error.

Override is available via **Sample Detail → Override Stability** (permission `samples.stability.override`) and is audit-logged with a mandatory reason.

---

## Mobile collection workflow

Phlebotomists using the LabFlow mobile app (or any Capacitor build) get an offline-aware collection workflow:

1. **Load route** — pulls today's scheduled collections from the server when online; cached in Dexie / IndexedDB for offline use.
2. **Patient confirmation** — scans the patient's wristband or matches by photo / name + DOB.
3. **Specimen collection** — for each scheduled sample, scan the printed barcode, confirm tube type, mark fasting status, attach optional collection notes.
4. **Sample event written** — locally first to Dexie; immediately to Firestore when online.
5. **Sync banner** — visible at all times when offline mutations are queued; tapping it shows the queue with retry / cancel options.
6. **Sign-off** — at end of route, the phlebotomist signs off; the system verifies all scheduled samples are accounted for (collected / no-show / unable-to-collect).

Mutation conflicts on reconnect: chain-of-custody events are **always appended** (never overwritten); other fields prefer server values for safety. See [Architecture → Offline-first on mobile](/docs/architecture/overview#offline-first-on-mobile).

---

## Location tracking

Optional per-tenant (**Settings → Sample Locations → Enabled**). When enabled, the system tracks the current physical location of each sample inside the laboratory — `Reception bin A`, `Centrifuge 2`, `Analyzer X1`, `Freezer A2 / shelf 3`. Location is updated by scanning the sample barcode at any tracked location's scanner.

Useful for high-volume labs that lose track of where samples are; not necessary for small labs. The audit log captures every location change.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read samples in your tenant | `samples.read` |
| Move sample to `collected` | `samples.collect` |
| Move sample to `in-transit` | `samples.transit` |
| Move sample to `received` | `samples.receive` |
| Move sample to `processing` | `samples.process` |
| Reject a sample | `samples.reject` |
| Recollect (create replacement sample) | `samples.recollect` |
| Override stability window | `samples.stability.override` |
| Mark sample as lost | `samples.mark-lost` |
| Print labels (initial) | `samples.labels.print` |
| Reprint labels | `samples.labels.reprint` |
| Update sample location | `samples.location.update` |
| Read per-sample audit log | `samples.audit.read` |

---

## Frequently asked questions

### How does LabFlow handle the same barcode being scanned twice?

If the second scan is the same status transition (e.g. two "Collected" scans for the same sample within the same minute), the system de-duplicates silently — no double event. If the second scan is a different transition (e.g. "Received" after "Collected"), it processes normally. If the second scan is out-of-order (e.g. "Collected" after "Received"), the system warns and blocks; the user can override with `samples.events.out-of-order` permission and a reason.

### What if a sample's barcode label peels off?

Open the sample by accession number or order ID, click **Reprint Label** (permission `samples.labels.reprint`). The reprint event is audit-logged with the user and timestamp so the chain of custody stays intact.

### Can two samples share a barcode?

No — barcodes are tenant-unique. The Luhn check digit at the end of the barcode catches most one-digit transcription errors before they reach the database.

### How does LabFlow handle aliquots?

An "aliquot" — a sub-sample drawn from the parent sample for parallel testing — is recorded as a child sample doc with `parentSampleId` pointing to the original. The child inherits the original's `collectedAt` and `stabilityExpiresAt` (you cannot extend stability by aliquoting). Child samples get their own barcode and their own chain of custody.

### What happens if a sample is "lost"?

The user marks it `lost` from `/samples/:id` (permission `samples.mark-lost`). The system writes the event, freezes the sample, generates an incident report (see [Workflow Automation](/docs/modules#workflow-automation) — Batch 08 for the rule-engine details), and offers to spawn a recollect order. The audit log retains every prior event for investigation.

### Can a sample be re-used for a new order?

Yes, when within the stability window and the physical specimen is still on hand. Open the sample, click **Attach to Order**, pick the new order. The system verifies the specimen type matches what the new order needs and writes an event.

### How does LabFlow handle accessioning at a reference lab that receives external samples?

External samples arrive with the source facility's barcode. At `/samples/batch-receive`, the lab scans the external barcode; the system finds the matching pending sample (via the order's `externalBarcode` field) and transitions it to `received`. If no matching order is found, the receiving station prompts to create one inline (permission `orders.create` required).

---

**Next:** Batch 04 fills in Results Management + Quality Control detail pages — see the [public build plan](https://github.com/aoneahsan/labflow-docs/blob/main/docs/audit/2026-05-10-docs-site-build-plan.md).
