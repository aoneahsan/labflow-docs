---
sidebar_position: 12
slug: /modules/home-collection
title: Home Collection Module
description: Phlebotomist dispatch, route planning, offline-first mobile collection workflow, chain of custody, and live tracking for at-home sample collection in LabFlow.
keywords:
  - LabFlow home collection
  - phlebotomist routing
  - at-home blood test
  - mobile phlebotomy app
  - offline sample collection
  - lab route optimisation
  - chain of custody mobile
---

# Home Collection Module

**Home collection is the workflow for sending a phlebotomist to the patient's location instead of asking the patient to come to the lab.** LabFlow's module covers visit creation and dispatch, route planning across a day's visits, an offline-first mobile collection workflow that lets a phlebotomist work through a 4G dead zone and reconcile on reconnect, end-to-end chain of custody (who took the sample, when, at what GPS coordinates, in what condition, and who received it back at the lab), live tracking that the patient can opt into via SMS link, and stability checks that compare the sample's analyte requirements against the elapsed transit time before allowing accession.

The module is built around the assumption that the phlebotomist is the data-entry surface — the desktop is for dispatch and oversight, not data entry — so every field in the collection form was chosen to be operable one-handed on a 5-inch screen while wearing gloves.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Pre-analytical |
| Required permission to dispatch | `home-collection.dispatch` |
| Required permission to perform a visit | `home-collection.collect` |
| Firestore collections | `home_visits`, `home_visit_events`, `home_routes`, `phlebotomists`, `phlebotomist_shifts`, `home_collection_audit_logs` |
| Routes | `/home-collection`, `/home-collection/visits`, `/home-collection/visits/new`, `/home-collection/visits/:id`, `/home-collection/routes`, `/home-collection/routes/:id`, `/home-collection/phlebotomists`, `/home-collection/live-map`, `/home-collection/exports` |
| Linked modules | [Patient Management](./patient-management), [Test Orders](./test-orders), [Sample Tracking](./sample-tracking), [Appointments](./appointments) |

---

## Core concepts

| Term | Meaning |
|---|---|
| **Visit** | A scheduled at-home collection for one patient at one address with one or more orders attached. |
| **Route** | A sequence of visits assigned to one phlebotomist for one shift, ordered by drive-time optimisation. |
| **Window** | The time band the patient agreed to be home — e.g. `08:00–10:00`. Visit must start inside the window. |
| **Chain-of-custody event** | An append-only log entry: `assigned → en-route → arrived → identified → collected → packaged → returned → accessioned`. |
| **Stability budget** | The maximum elapsed time from collection to accession that each analyte tolerates before it must be rejected. |
| **Cold-chain marker** | A boolean per sample indicating whether the cool-box temperature was within range across the route. Captured from the cool-box's Bluetooth probe or, lacking that, a phlebotomist confirmation at handover. |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/home-collection` | Today's dashboard — visits per status, late-flag count, courier hand-off pending | `home-collection.read` |
| 2 | `/home-collection/visits` | Filterable visit list (status, phlebotomist, date, area) | `home-collection.read` |
| 3 | `/home-collection/visits/new` | New visit booking — patient, address, window, orders | `home-collection.dispatch` |
| 4 | `/home-collection/visits/:id` | Visit detail — chain-of-custody, phlebotomist, route slot, audit | `home-collection.read` |
| 5 | `/home-collection/routes` | Today's routes per phlebotomist | `home-collection.dispatch` |
| 6 | `/home-collection/routes/:id` | Route detail — ordered visits, drive-time estimate, manual reorder, dispatch | `home-collection.dispatch` |
| 7 | `/home-collection/phlebotomists` | Manage phlebotomists, shifts, capability tags | `home-collection.phlebotomists.write` |
| 8 | `/home-collection/live-map` | Live map of all in-progress visits (phlebotomist GPS, status, ETA) | `home-collection.live-map.read` |
| 9 | `/home-collection/exports` | CSV / PDF exports for visit volumes, on-time rate, chain-of-custody audits | `home-collection.exports.read` |

Phlebotomists use the **mobile app** (Capacitor build) rather than the desktop. The mobile screens mirror the visit detail with a one-tap action per chain-of-custody event.

---

## Visit creation form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Patient | search-select | required | active patient | Same picker as [Appointments](./appointments) |
| Address | structured-form | required | line 1, city, postal code, country | Defaults to patient's primary address; editable per visit |
| Geolocation | derived | server-computed | lat / lng | Reverse-geocoded from the address; manually overridable on the map |
| Visit window | time-range | required | start ≥ now + tenant's min-lead-time (default 2 h); end > start | |
| Estimated duration (min) | integer | required | 10 ≤ d ≤ 120 | Defaults to 20 minutes; lengthens for multi-tube draws |
| Tests | multi-select OR linked-order | required-min-1 | active catalog tests OR open order | If an order is linked, the tests come from the order |
| Special instructions | textarea | optional | 0–500 chars | Pet warning, building access code, etc. |
| Preferred phlebotomist | search-select | optional | active phlebotomist | Soft preference; route optimiser may override unless `pin: true` is set |
| Contact phone for the visit | text | required | E.164 | Phlebotomist's primary contact for the patient |
| Live tracking offered | boolean | required | default `true` | Drives whether the patient gets the live-tracking SMS link |
| Deposit captured | boolean | required-if-tenant-requires-deposit | — | Bridges to [Billing](./billing-insurance) |
| Special equipment | multi-checkbox | optional | `cool-box` / `centrifuge-on-truck` / `paediatric-needles` / `glucometer` | Phlebotomist with the matching capability tag is preferred by the route optimiser |

On submit, the visit moves to `pending` and waits for a route assignment.

---

## Route planning

Routes are the operational layer on top of visits. The `/home-collection/routes` screen lets a dispatcher assemble a route from pending visits per phlebotomist per shift.

### Manual route building

The dispatcher picks a phlebotomist + a date + visits → drags into the desired order → presses "Optimise" to re-order by minimum drive time, or leaves the manual order. Drive-time estimates are computed from a routing service (Mapbox by default; pluggable per tenant) using the visits' geocoded coordinates. The optimiser respects two pins: a `start` location (the lab or the phlebotomist's home — configurable) and an `end` location (return to lab to drop samples).

### Auto-dispatch

For higher volumes, "Auto-dispatch" assigns unrouted visits to phlebotomists by:

1. Filtering phlebotomists active on the date with matching capability tags.
2. Honouring `Preferred phlebotomist` and `pin: true` first.
3. Distributing remaining visits by minimum cumulative drive time across the candidate routes, capped at each phlebotomist's `maxVisitsPerShift`.

Auto-dispatch produces a draft assignment that the dispatcher reviews before pressing "Confirm and dispatch", which:

1. Locks the route (no further auto-assignments will touch it).
2. Pushes the route to the phlebotomist's mobile app over Firestore real-time sync.
3. Sends the patient the visit-confirmation SMS with the live-tracking link (if opted in).

---

## Chain-of-custody event log

Every visit has an append-only `home_visit_events` sub-collection. Each event carries the timestamp, the actor (phlebotomist user ID or `system`), and the trigger (manual tap, geofence enter / exit, server cron). The supported events:

| Event | Triggered by | Captures |
|---|---|---|
| `assigned` | Dispatch confirms route | Phlebotomist ID, route ID |
| `en-route` | Phlebotomist taps "Start visit" OR auto on geofence-exit of previous visit | Start GPS, timestamp |
| `arrived` | Geofence-enter on patient address OR manual tap | Arrival GPS, timestamp, distance-from-patient-coords |
| `identified` | Phlebotomist confirms patient identity (name + DOB read-back; optional photo of ID) | Identity-check method, optional photo FilesHub ID |
| `collected` | Phlebotomist scans / generates the barcode and records tubes drawn | Tube barcodes, drawn count, draw notes (haemolysis risk, difficult stick, etc.) |
| `packaged` | Phlebotomist confirms samples in cool-box | Cool-box ID, optional Bluetooth probe reading |
| `departed` | Phlebotomist taps "Leave" OR auto on geofence-exit | Departure GPS, timestamp |
| `returned` | Phlebotomist arrives back at the lab | Return GPS, timestamp |
| `accessioned` | Lab receiver scans the cool-box | Receiver user ID, cool-box ID, sample count match |
| `incident` | Phlebotomist or dispatcher logs an issue | Incident type enum, free-text |

The log is immutable — corrections are appended as a new `incident` event citing the prior event ID and the corrected value. This is the regulator-facing audit surface.

---

## Mobile collection workflow (offline-first)

The Capacitor mobile app holds the day's route in IndexedDB so the phlebotomist can complete a full visit with no network. The flow:

1. **Pull at dispatch.** On confirm-and-dispatch, Firestore real-time sync replicates the route doc and each visit doc to the phlebotomist's device. The mobile app stores them in IndexedDB via Dexie.
2. **Work offline.** Each chain-of-custody event the phlebotomist logs is written to a local outbox (`outbox_visit_events`) with a generated client UUID, alongside the canonical write attempt. If online, the write succeeds and the outbox row is marked synced. If offline, the local doc still updates the UI and the outbox row queues for replay.
3. **Replay on reconnect.** The sync service runs every 30 s while online (configurable) and on every reconnect. It replays outbox rows in order; conflicts are resolved with a last-writer-wins policy keyed on the client UUID, which guarantees idempotency — the same event replayed twice never produces two `arrived` rows.
4. **Photos and signatures.** Identity-card photos and patient signatures are stored in IndexedDB as Blob URLs first; the sync service uploads them to FilesHub on reconnect and patches the event row with the resulting object ID.
5. **Network-status banner.** The app's network detector (Capacitor Network plugin) shows a top banner when offline and a "Sync in progress (N pending)" banner during replay.

The offline pattern is intentionally narrow — only chain-of-custody events and small media are buffered. Catalog reads, patient searches, and route adjustments all require connectivity. This trade-off keeps the offline state machine small enough to reason about while covering the failure modes that actually happen in the field (a 5-minute dead zone in a basement, not a 24-hour offline day).

---

## Stability + cold-chain enforcement

Each test in the catalog carries stability requirements: a maximum elapsed time from collection to accession, optionally split by temperature band (`refrigerated`, `frozen`, `room`). On accession (`accessioned` event), the system computes:

1. **Elapsed time** = `accessioned.timestamp − collected.timestamp`.
2. **Per-analyte stability budget** = `min(stability.maxElapsedMinutes for each picked test)`.
3. **Cold-chain state** = from cool-box probe readings if available; otherwise from the phlebotomist's confirmation on `packaged`.

If elapsed > budget, or if the cold-chain readings exceeded the per-test temperature band at any point, the accession is **blocked** at the `home-collection.accession.write` permission's input layer. A Lab Manager with `home-collection.accession.override` can override with a captured reason; the override surfaces on the affected patient reports as a footnote and propagates to the [Results Management](./results-management) addendum mechanism.

---

## Live tracking (patient-side)

If the patient opted in at booking, they receive a one-line SMS at `en-route`: a tracking link that opens a public page (no login). The page shows:

| | Shown |
|---|---|
| Phlebotomist first name + photo (if uploaded by the lab) | ✓ |
| ETA (live, refreshed every 60 s) | ✓ |
| Phlebotomist GPS marker on a map (last-known location) | ✓ |
| Phone-call button | ✓ |
| Reschedule / cancel link | ✓ (if before grace window) |
| Patient PII | ✗ — only the patient's first name is shown |

The link expires at `departed` + 1 hour. The expiry exists so a tracking link found later on the patient's phone doesn't reveal anything stale.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read visits | `home-collection.read` |
| Dispatch / build routes | `home-collection.dispatch` |
| Collect samples (phlebotomist) | `home-collection.collect` |
| Override identity-check (only first-name read-back received) | `home-collection.identity.override` |
| Accept the route's cool-box at the lab (accession) | `home-collection.accession.write` |
| Override a stability / cold-chain block | `home-collection.accession.override` |
| Manage phlebotomists and shifts | `home-collection.phlebotomists.write` |
| Read the live map | `home-collection.live-map.read` |
| Read live GPS of any phlebotomist (not only their assigned) | `home-collection.live-map.all` |
| Export visit reports | `home-collection.exports.read` |
| Read the chain-of-custody audit | `home-collection.audit.read` |

---

## Frequently asked questions

### Why is the offline behaviour event-only and not catalog-wide?

Catalog reads (tests, patients) change rarely but globally; trying to keep a full local mirror produces stale-data risk that's hard to bound. Chain-of-custody events, by contrast, are append-only and idempotent — a perfect fit for an offline-first outbox. The mobile app pre-fetches the day's patient and test data on dispatch and treats the cache as authoritative for the shift. If a dispatcher adds a visit mid-day, the new visit syncs over the wire when the phlebotomist's device next reconnects.

### What happens if two phlebotomists log `arrived` for the same visit?

A visit is owned by exactly one route, and a route is owned by exactly one phlebotomist. The mobile app surfaces only the assigned phlebotomist's route. If a reassignment happens mid-shift (rare; dispatch action only), the previous phlebotomist's app removes the visit on next sync and the new phlebotomist's app picks it up. Two parallel `arrived` events are not possible without an explicit reassignment, which is itself a logged event.

### Can a phlebotomist collect at the wrong address by accident?

Geofence-enter on `arrived` fires when the phone enters a 50-metre radius of the patient's geocoded coordinates. If the phlebotomist taps "Arrived" outside that radius, the app prompts: "GPS shows you're 320 m from the patient's address. Continue anyway?" Continuing logs the distance-from-patient-coords in the event row so a future audit can spot the pattern. Dispatchers see a "distance flag" indicator on the live map for any in-progress visit with arrival drift > 100 m.

### How are barcodes generated for at-home draws?

Phlebotomists can either scan pre-printed barcoded tubes (the lab pre-loads them in the cool-box) or print a tube label from a Bluetooth thermal printer paired with the phone. The barcode format and check digit match the [Sample Tracking module](./sample-tracking) so the accession workflow is identical for home-collected and walk-in samples.

### Does the live-tracking link share the patient's home address publicly?

No. The link's URL contains a one-time random token (32 bytes), not an identifier. The page exposes only the phlebotomist's first name, photo, ETA, and live GPS marker; it does not reveal the patient's name, address, or any test details. The link expires shortly after the phlebotomist leaves.

### What if the phone runs out of battery mid-visit?

The phlebotomist completes the chain-of-custody on paper (the cool-box ships with a paper template) and back-enters the events on `/home-collection/visits/:id` from the desktop or a charged device when they return to the lab. Back-entered events are timestamped with the actual event time (per the paper record) but flagged `entryMethod: back-entered` for the audit. The accession step still validates stability against those timestamps.

### Can we use this for non-blood collections (urine, swabs, etc.)?

Yes — the catalog's specimen type drives the tube list shown to the phlebotomist, the stability budget, and the cold-chain band. The workflow itself is sample-type-agnostic. The visit form's "Special equipment" field lets the dispatcher route a phlebotomist who carries the right collection kit.

### Is courier-only delivery (no phlebotomist; patient self-collects) supported?

Partially — the module supports a "kit drop-off" visit type where the phlebotomist drops a self-collection kit and returns later for pickup, or a courier-only "round-trip" visit where the patient self-collects between drop and pickup. Stability budgets in both cases run from the patient-reported `selfCollected` event time, with the usual override permission applying when the budget is exceeded.

---

**Next:** [Reports & Analytics module](/docs/modules/reports-analytics).
