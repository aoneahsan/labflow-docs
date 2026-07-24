---
sidebar_position: 11
slug: /modules/appointments
title: Appointments Module
description: Slot-based appointment scheduling, calendar views, reminders, no-show tracking, walk-in queue, and rescheduling rules in LabFlow.
keywords:
  - LabFlow appointments
  - LIMS scheduling
  - laboratory appointment slots
  - lab no-show tracking
  - appointment reminders SMS email
  - phlebotomy scheduling
---

# Appointments Module

**An appointment in LabFlow is a reserved time slot for a patient to give a sample at a specific collection site, with one or more orders attached.** The module's job is to keep the lab's collection capacity transparent — staff and patients see the same slot grid, double-bookings are prevented by Firestore transaction, reminders fire by SMS and email at configurable lead times, and no-shows are tracked so the lab can build behavioural rules (deposits, blacklists, re-booking windows) on top. The module is workflow-aware: a confirmed appointment auto-creates a draft Sample on arrival, so the phlebotomist's accession step is one tap rather than a fresh form.

LabFlow's scheduler is built for the laboratory shape (short, high-throughput slots — typically 5 to 15 minutes — and per-room / per-phlebotomist capacity) rather than the clinic shape (long, single-resource slots), and the data model reflects that.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Pre-analytical |
| Required permission to view | `appointments.read` |
| Required permission to book | `appointments.write` |
| Required permission to cancel for another patient | `appointments.cancel.other` |
| Firestore collections | `appointments`, `appointment_slots`, `slot_templates`, `holidays`, `phlebotomists`, `collection_rooms`, `appointment_audit_logs` |
| Routes | `/appointments`, `/appointments/calendar`, `/appointments/new`, `/appointments/:id`, `/appointments/walk-in`, `/appointments/templates`, `/appointments/holidays`, `/appointments/exports` |
| Linked modules | [Patient Management](./patient-management), [Test Orders](./test-orders), [Sample Tracking](./sample-tracking), [Communication Hub (Batch 08)](/docs/modules#communication-hub) |

---

## Core concepts

| Term | Meaning |
|---|---|
| **Slot** | A unit of capacity: one room (or phlebotomist) × one start-time × duration. Default slot is 10 minutes; tenants override per site. |
| **Slot template** | A weekly recurring pattern (e.g. "Mon–Fri 07:00–19:00, 10-min slots, 2 rooms in parallel") used to generate the slot grid up to 90 days forward. |
| **Capacity** | Number of patients that can be served simultaneously at the same start time. A site with 2 rooms and 1 phlebotomist per room has capacity 2. |
| **Holiday** | A calendar day where the site is closed; slots are not generated. |
| **Walk-in** | A patient who arrives without a booking. The module either fits them into the next free slot or queues them. |
| **No-show** | A booked appointment whose patient does not arrive within the no-show grace window after the slot start. |
| **Reminder cadence** | The schedule of reminder notifications (e.g. T-24h, T-2h, T-30min). |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/appointments` | Today's list — booked / arrived / completed / no-show, per site | `appointments.read` |
| 2 | `/appointments/calendar` | Calendar grid (day / week views) with slot capacity bands | `appointments.read` |
| 3 | `/appointments/new` | Booking wizard — patient → site → date+slot → tests → confirm | `appointments.write` |
| 4 | `/appointments/:id` | Appointment detail — patient, orders, reminders sent, audit | `appointments.read` |
| 5 | `/appointments/walk-in` | Walk-in queue and instant-slot assignment | `appointments.write` |
| 6 | `/appointments/templates` | Manage slot templates per site | `appointments.templates.write` |
| 7 | `/appointments/holidays` | Manage closed days per site | `appointments.holidays.write` |
| 8 | `/appointments/exports` | CSV / PDF exports for capacity utilisation reports | `appointments.exports.read` |

---

## Booking form — every field

The `/appointments/new` wizard splits across four steps; each step is validated before the next is unlocked.

### Step 1 — Patient

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Patient | search-select | required | active patient or new-patient quick-form | Quick-form launches the [Patient Management](./patient-management) registration in a modal |
| Booking on behalf of | enum | required | `self` / `guardian` / `agent` | Audit captures the booker's user ID |
| Contact phone | derived | — | E.164 | Pulled from patient record; editable per booking |
| Contact email | derived | — | RFC 5322 | Pulled from patient record; editable per booking |
| Preferred reminder channel | multi-select | required-min-1 | `sms` / `email` / `whatsapp` / `in-app` | Defaults to patient's profile preference |

### Step 2 — Site & slot

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Site | enum | required | active collection site for the tenant | |
| Phlebotomist preference | enum | optional | `any` / specific phlebotomist | Specific selection further filters the slot grid |
| Date | date | required | today ≤ date ≤ tenant's forward-booking horizon (default 90 days) | |
| Slot | radio-grid | required | active, available slot for site + date | Booked slots are dimmed; the grid refreshes in real time via a Firestore snapshot listener |
| Reason if outside hours | textarea | required-if-after-hours | 1–200 chars | Captured when bypassing template with `appointments.book-after-hours` permission |

### Step 3 — Tests

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Link to existing order | search-select | optional | open order owned by the patient | If selected, tests are pulled from the order |
| Add new tests inline | multi-select | conditional | active catalog tests | If no order is linked, the user picks the tests directly |
| Fasting confirmed by patient | boolean | required-if-fasting-test-picked | — | Surfaced when a picked test has `requiresFasting: true` in the catalog |
| Special instructions | textarea | optional | 0–500 chars | Surfaces on the phlebotomist's task list |

### Step 4 — Confirm

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Reminder cadence | enum | required | `default` / `aggressive` / `minimal` / `none` | Default = T-24h + T-2h; aggressive adds T-30min; minimal = T-2h only |
| Notes for the patient | textarea | optional | 0–500 chars | Included in confirmation message |
| Deposit captured | boolean | required-if-tenant-requires-deposit | — | Tied to the [Billing](./billing-insurance) flow if the tenant has deposit-on-booking enabled |

On submit, a Firestore transaction reads the slot, checks capacity, writes the appointment, decrements the slot's available count, and writes the audit row — all atomically — so two concurrent booking attempts on the last seat fail predictably with a "slot just filled" error rather than producing a double-booking.

---

## Slot template form — every field

Templates are the rule generators. A site has zero or more active templates; the system runs them nightly to produce the next 90 days of `appointment_slots`.

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Name | text | required | 1–60 chars | E.g. "Main lab — weekday phlebotomy" |
| Site | enum | required | active site | |
| Days of week | multi-checkbox | required-min-1 | Mon–Sun | |
| Start time | time | required | HH:mm in tenant timezone | |
| End time | time | required | > start time | |
| Slot duration (minutes) | integer | required | 5 ≤ duration ≤ 60 | |
| Capacity per slot | integer | required | ≥ 1 | Number of parallel patients (rooms or phlebotomists) |
| Lunch break | time-range | optional | inside start–end | No slots generated in the break window |
| Effective from | date | required | ≥ today | |
| Effective to | date | optional | ≥ effective from | Template stops generating after this date |
| Priority | integer | required | 1 (highest) – 10 | Higher-priority template wins on overlap |
| Active | boolean | required | default `true` | Inactive templates remain in history but stop generating |

Two templates with overlapping windows on the same site collapse to one effective grid: the higher-priority template's slots are emitted; the lower-priority template's slots are skipped where they collide. The resolution is materialised into `appointment_slots` at generation time, so the booking screen reads a flat grid — no run-time priority math.

---

## Appointment status machine

```text
booked
  ├── confirmed (patient confirmed via reminder reply)
  ├── arrived (front-desk check-in)
  │     └── in-progress (phlebotomist started) ──── completed
  ├── no-show (patient did not arrive within grace window)
  ├── cancelled-by-patient
  └── cancelled-by-staff
```

| Status | Trigger | Side effect |
|---|---|---|
| `booked` | Wizard submit | Slot decremented; reminder schedule armed |
| `confirmed` | Patient replies to reminder with `YES` (SMS) or clicks confirm-link (email) | Confirmation flag set; no slot change |
| `arrived` | Front-desk taps "Check in" | Wait-time clock starts; phlebotomist task created |
| `in-progress` | Phlebotomist taps "Begin collection" | Linked to the open Sample(s) |
| `completed` | Phlebotomist taps "Finish" | Sample moves to `collected`; appointment closes |
| `no-show` | Auto, when slot start + grace window passes without check-in | Slot remains decremented (cannot re-book the empty seat); no-show counter increments on the patient |
| `cancelled-by-patient` | Patient cancel link / call | Slot returned to availability (if cancellation is ≥ tenant's cancellation lead time) |
| `cancelled-by-staff` | Staff cancel with reason | Slot returned to availability regardless of lead time |

Late cancellations (within the cancellation lead time) keep the slot decremented; they show as `cancelled-by-patient` in the audit but do not free the seat for re-booking. This protects against last-minute drops being treated as availability.

---

## Reminder mechanics

Reminders are queued as `notification_deliveries` rows with a `sendAt` timestamp and delivered through OneSignal push and FilesHub email (there is no server cron — LabFlow is 100% client + Firestore). Each appointment carries the cadence chosen at booking. The supported cadences:

| Cadence | T-24h | T-2h | T-30min |
|---|:---:|:---:|:---:|
| `default` | ✓ | ✓ | |
| `aggressive` | ✓ | ✓ | ✓ |
| `minimal` | | ✓ | |
| `none` | | | |

Each reminder respects the patient's channel preference (multi-channel sends fan out and dedupe — a confirmation on any channel suppresses the rest at the same lead time). Templates live in the Communication Hub module (detail page lands in Batch 08) and accept the variables `{{patientFirstName}}`, `{{slotLocalTime}}`, `{{siteName}}`, `{{siteAddress}}`, `{{testsList}}`, `{{fastingNote}}`, `{{confirmLink}}`, `{{cancelLink}}`, `{{rescheduleLink}}`.

A patient can confirm by replying `YES` to an SMS (the reply matcher is locale-aware — accepts `YES / OK / SI / OUI` and a configurable list per tenant). Inbound SMS routes through the tenant's SMS provider webhook.

---

## Walk-in handling

The `/appointments/walk-in` screen is built for sites that take unbooked patients. A walk-in attempt does two things in order:

1. Looks for the next free slot at the same site within the configurable walk-in window (default 15 minutes from now). If one exists, the walk-in occupies it and is treated as a same-day booking with the `walk-in` flag set.
2. If no free slot is available inside the window, the walk-in is queued. The queue is a FIFO by arrival time with per-phlebotomist priority. Booked patients always outrank walk-ins for slots they own; walk-ins only consume slack capacity.

The screen shows the live queue, the estimated wait per walk-in (median of the last 20 collections at the site), and a "promote to slot" action for staff.

---

## No-show tracking

Every patient carries a rolling no-show counter and last-no-show date in `patients.appointmentStats`. The counter is incremented automatically when an appointment moves to `no-show`. Two configurable tenant rules govern downstream behaviour:

| Rule | Default | Effect |
|---|---|---|
| `requireDepositAfterNNoShows` | 2 within 90 days | Booking screen requires a deposit (links to [Billing](./billing-insurance)) before confirming the slot |
| `blockBookingAfterNNoShows` | 4 within 180 days | Booking screen blocks self-service booking; staff override with `appointments.book-blocked` |

Both rules can be disabled per tenant. Patients can appeal a no-show flag via the in-app channel; an appeal moves to a Lab Manager task with `appointments.no-show.review`.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read appointments | `appointments.read` |
| Book / reschedule | `appointments.write` |
| Cancel one's own appointment | `appointments.cancel.self` |
| Cancel for another patient | `appointments.cancel.other` |
| Walk-in management | `appointments.walk-in` |
| Manage slot templates | `appointments.templates.write` |
| Manage holidays | `appointments.holidays.write` |
| Book after hours (bypass template) | `appointments.book-after-hours` |
| Book for a blocked patient (override) | `appointments.book-blocked` |
| Review a no-show appeal | `appointments.no-show.review` |
| Export capacity reports | `appointments.exports.read` |

---

## Frequently asked questions

### How are slots actually generated?

Slot generation runs client-side: when a scheduler view is opened (or a manager runs the "regenerate slots" action), the app writes the next 90 days of `appointment_slots` rows that don't already exist for that template × site × date × start-time, in batched writes. Existing rows are not overwritten — so manual edits (e.g. closing one slot for cleaning) survive regeneration. Holidays are honoured at generation time, so a slot on a holiday simply never appears in the grid.

### Can the same patient hold multiple future appointments?

Yes, subject to the tenant rule `maxFutureAppointmentsPerPatient` (default 5). The rule exists to prevent abuse — bot bookings have historically been an issue on labs running open self-service. The patient portal surfaces the count.

### How does rescheduling work?

Rescheduling is a transactional move: the system books the new slot first (consuming capacity) and only releases the old slot if the new one is successfully held. If the new slot is full or otherwise invalid, the old slot remains booked and the user sees the error. This avoids the "lost both seats" failure mode that naive cancel-then-rebook produces.

### What happens to the linked order if the appointment is cancelled?

Nothing — the order remains open. The appointment is a scheduling layer over the order, not the order itself. A cancelled appointment with a linked order shows a "rebook" action that re-opens the booking wizard pre-filled with the same tests.

### Does the module support multi-day appointments (e.g. a 24-hour urine collection that starts on day 1 and finishes on day 2)?

A multi-day collection is modelled as two appointments — one for the collection-start (provision the container, instructions) and one for the collection-end (receive the container, accession). Both link to the same order; the order shows both appointments side-by-side. The system does not collapse the two into a single 24-hour slot because the lab's capacity at the start and end of the window is a separate consideration.

### How are SMS-reply confirmations matched back to the appointment?

Each outbound reminder includes a short, single-use confirmation code (e.g. `LF-7H4K`). The inbound SMS webhook looks for an active code in the body and matches it to the appointment. Codes expire 6 hours after the appointment slot start. A reply without a recognised code is routed to the staff inbox for manual handling rather than silently dropped.

### Can phlebotomists block out time for breaks or training?

Yes — `/appointments/calendar` exposes a "Block time" action available to staff with `appointments.templates.write`. The block creates an "unavailable" overlay on the calendar without modifying the slot template, and prevents new bookings during the window. Existing bookings inside the window are not auto-cancelled (the staff member reviews and reschedules them manually) because silent auto-cancel of patient bookings is a documented anti-pattern.

### Does the system support online self-service booking from the patient portal?

Yes — the same booking wizard renders on the patient-portal route with restricted permissions (the patient can only book for themselves, cannot bypass capacity, and cannot edit slot templates). The portal honours the no-show and deposit rules above. Distribution to native mobile patient apps is pending the Play Store / App Store releases noted on the [LabFlow homepage](https://labflow.aoneahsan.com).

---

**Next:** [Home Collection module](/docs/modules/home-collection).
