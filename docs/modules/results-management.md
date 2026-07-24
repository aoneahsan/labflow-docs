---
sidebar_position: 7
slug: /modules/results-management
title: Results Management Module
description: LabFlow's four-state result lifecycle — Draft → Reviewed → Approved → Released — with critical-value alerting, addenda, report templates, FilesHub PDF distribution, and immutable post-release records.
keywords:
  - LabFlow results management
  - LIMS result validation
  - critical value alert laboratory
  - result lifecycle Draft Reviewed Approved Released
  - addendum laboratory report
  - HL7 ORU result integration
---

# Results Management Module

**Results Management is the most safety-critical module in LabFlow.** Every laboratory value passes through a four-state lifecycle — `Draft → Reviewed → Approved → Released` — with explicit, permission-gated transitions and an immutable audit trail at every step. Critical values cannot be released until a clinician acknowledges them. Once a result is released, it is immutable; corrections produce an addendum, not an edit. The module supports manual entry, HL7 ORU instrument integration, addenda, report templates, and FilesHub-stored PDF distribution.

If you want a one-screen mental model, this is it:

```text
                                            ┌──────────────────┐
Manual entry  ─┐                            │ Critical alert?   │
HL7 ORU      ─┼─► Draft ─► Reviewed ─► Approved ─►  must ack ─► Released
External API ─┘     │           │            │                     │
                    │           └─◄ Edit ────┘                     ▼
                    │                                          (Immutable)
                    └─►  Discard (audit-logged)                 Addenda only
```

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Analytical → Post-analytical |
| Required permission to view | `results.read` |
| Required permission to enter | `results.enter` |
| Firestore collections | `results`, `result_versions`, `result_addenda`, `report_templates`, `report_renders`, `results_audit_logs` |
| File storage | FilesHub for rendered PDF reports (`visibility: 'public'`) |
| Routes | `/results`, `/results/draft`, `/results/critical`, `/results/:id`, `/results/:id/entry`, `/results/:id/review`, `/results/:id/approve`, `/results/:id/release`, `/results/:id/addendum`, `/results/:id/report`, `/results/templates` |
| Linked modules | [Test Orders](./test-orders), [Sample Tracking](./sample-tracking), [Test Catalog](./test-catalog) |

---

## The four-state lifecycle

| State | What it means | Who can move *from* this state | Editable? |
|---|---|---|---|
| `Draft` | Value entered, not yet validated. Visible only to the lab team. | Technician who entered it (and Senior Tech / Pathologist / Admin) | Yes — by the entering user or anyone with `results.draft.update` |
| `Reviewed` | Technical validation complete (correct units, no instrument flag, plausible value). | Senior Technologist or higher | Yes — by Senior Tech / Pathologist (writes a `result_versions` snapshot before each edit) |
| `Approved` | Clinical validation complete (interpretation, comments, critical-value handling). | Pathologist / Approver only | Yes — by Pathologist (writes a `result_versions` snapshot) |
| `Released` | Report PDF rendered and made available to ordering clinician + patient. | No one — `Released` is terminal | **No.** Corrections go through addendum. |

State transitions are enforced **in Firestore security rules**, not just in application code. A Technician cannot move a result to `Approved` regardless of what client they use.

Each transition writes:

1. A new `result_versions` doc (full snapshot of all field values).
2. A `results_audit_logs` doc capturing `actorId`, `actorRoles`, `before` / `after`, `tenantId`, `clientType`, `clientVersion`.
3. A possible `notifications` doc when the transition has downstream consequences (e.g. Approval triggers a critical-value alert if applicable).

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/results` | All results in the tenant; filter chips for state, priority, critical-flag, date range | `results.read` |
| 2 | `/results/draft` | Just-entered values awaiting review | `results.draft.read` |
| 3 | `/results/critical` | Approved-but-not-yet-released criticals; cannot release until each is acknowledged | `results.critical.acknowledge` |
| 4 | `/results/:id` | Single result detail with tabs for Values, Audit, Versions, Addenda | `results.read` |
| 5 | `/results/:id/entry` | Manual entry form for a result still in `pending` (sample received but values not entered) or `Draft` | `results.enter` |
| 6 | `/results/:id/review` | Technical-review checklist; requires confirming units, range, instrument flags, plausibility | `results.review` |
| 7 | `/results/:id/approve` | Clinical-approval form; captures interpretive comment | `results.approve` |
| 8 | `/results/:id/release` | Release confirmation; renders report PDF; fires distribution | `results.release` |
| 9 | `/results/:id/addendum` | Add a post-release addendum (cannot edit released values, can only append) | `results.addendum.write` |
| 10 | `/results/:id/report` | View rendered PDF inline; reprint | `results.report.read` |
| 11 | `/results/templates` | Report template editor (per-template body, header / footer overrides, locale) | `results.templates.write` |

---

## Result entry form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Test | resolved-from-order | system | — | Read-only; bound at order time |
| Specimen | resolved-from-sample | system | — | Read-only |
| Result value (numeric) | decimal | required-for-numeric-tests | matches catalog `units`; within `min`–`max` if defined | Default range from `reference_ranges` for the patient's age + sex |
| Result value (text) | text | required-for-text-tests | 1–500 chars | E.g. "No growth detected" |
| Result value (coded) | enum | required-for-coded-tests | from catalog's expected-values list | E.g. `positive` / `negative` / `equivocal` |
| Result attachment | file (FilesHub) | optional | jpg / png / pdf / dicom | E.g. peripheral-smear photo, ECG strip |
| Unit | enum | server-defaulted | UCUM unit from catalog | Read-only unless catalog allows multiple units |
| Reference range (this patient) | text | server-resolved | — | Computed at entry: matches catalog range for patient age + sex |
| Interpretation flag | enum | server-resolved | `low` / `low-critical` / `normal` / `high` / `high-critical` / `abnormal` / `n/a` | Computed against the reference range |
| Instrument flag | enum | optional | per-instrument-mapped enum | E.g. `>` / `<` / `result-rerun` / `dilution-needed` |
| Method | text | optional | 0–80 chars | Defaults from catalog if defined |
| Comment | textarea | optional | 0–500 chars | Internal lab note; not on the final report |
| Interpretive comment | textarea | optional | 0–2000 chars | Appears on the report; recommended for abnormal results |
| Performed by | userId | server-defaulted | tenant member | Defaults to the entering user |
| Performed at | datetime | server-defaulted | not in the future | Defaults to entry time |

---

## Critical-value alerting

A result is flagged critical when the interpretation flag is `low-critical` or `high-critical`. Critical-value handling is a deliberate friction point:

1. On Approval, the system fires:
   - A red banner on the dashboard for anyone in the `Pathologist` / `Senior Technologist` / `Lab Manager` roles.
   - SMS / push notification to the ordering clinician via the Communication Hub.
   - In-app notification to the patient if patient-portal is enabled (with a "contact your clinician immediately" CTA).
2. The result **cannot** be released until a clinician acknowledges the alert. Acknowledgement requires:
   - The acknowledging user's identity.
   - A free-text reason (1–500 chars) describing the action taken (e.g. "called Dr. Khan at 14:35, advised STAT recollect").
   - A timestamp.
3. Acknowledgement is audit-logged. The acknowledgement document is **append-only** — once a critical is acknowledged, the record cannot be edited or removed.

Tenants can extend the critical-value workflow per-test via **Settings → Critical Values → Per-Test Rules** — e.g. require two-step acknowledgement (pathologist + ordering clinician) for cardiac troponin.

---

## Release and report rendering

The `/results/:id/release` action:

1. Validates that all critical alerts are acknowledged.
2. Picks the report template based on tenant default, order-level override, or per-test override.
3. Generates the report PDF in-app (client-side; template authored in HTML and rendered to PDF in the browser). There is no server-side render — LabFlow ships no Cloud Functions.
4. Uploads the PDF to FilesHub with `visibility: 'public'`. Stores the `fileshubObjectId` on a `report_renders` doc.
5. Fires distribution:
   - SMS / email link to the patient (per `preferredContactChannel`).
   - In-app notification to the ordering clinician.
   - HL7 ORU outbound (if the order originated from an HL7 inbound — Batch 08 details).
   - FHIR `DiagnosticReport` notification webhook (if configured).
6. Updates the order to `reported` or `partially-reported` depending on whether all order items are released.
7. Sample(s) transition to `reported`.

Report templates are tenant-configurable via `/results/templates`. The default template includes:

- Tenant header (logo, address, CLIA / accreditation IDs if configured)
- Patient block (name, DOB, sex, MRN)
- Order block (order ID, ordering clinician, ordering clinic, collection date, report date)
- Per-test result table (test name, LOINC, result, unit, reference range, flag)
- Interpretive comments (where present)
- Approver signature block (digital — captured at Approval)
- Footer with disclaimer and tenant contact

---

## Addenda (post-release corrections)

A released result is immutable. To correct an error after release, use **Add Addendum** (permission `results.addendum.write`). An addendum:

| Property | Behavior |
|---|---|
| Captures the corrected interpretation, comment, or value | as additional `result_addenda` doc |
| Does **not** overwrite the original released value | original remains visible on the report |
| Triggers a fresh report PDF render | new PDF marked "Addendum 1" / "Addendum 2" / etc. |
| Re-fires distribution | clinician + patient get the corrected report |
| Requires a reason | enum: `transcription-error` / `instrument-recalibration` / `late-finding` / `clinical-correction` / `other` |
| Requires approver re-signature | digital signature of the approver issuing the addendum |
| Is audit-logged | with `before` / `after` snapshots |

Tenants subject to CAP / CLIA / equivalent accreditations should treat addenda as the official correction mechanism — direct edit of released values is intentionally impossible.

---

## HL7 ORU instrument integration

When an analyzer pushes an HL7 ORU^R01 message into LabFlow's HL7 ingester:

1. The MSH segment is parsed; sending facility maps to a tenant.
2. The OBR segment maps to an existing `samples` doc via the universal-service identifier.
3. Each OBX segment maps to a result; the value populates a `Draft` `results` doc (or updates one if already present in `Draft`).
4. Instrument flags from OBX-8 are preserved on `instrumentFlag`.
5. Method-specific reference ranges in OBX-7 override the catalog default for that single result.
6. The system writes an `audit_logs` entry tagged `clientType: 'hl7-ingester'`.

ORU results enter `Draft` — the lab team still moves them through `Reviewed → Approved → Released`. No auto-release.

---

## Version history and audit

Every state transition AND every edit within a state writes a `result_versions` doc — a full snapshot of all fields at that moment. The result-detail "Versions" tab is a timeline; clicking a version shows the snapshot side-by-side with the next.

The "Audit" tab shows the human-readable `results_audit_logs` entries: who, what, when, from what device. Both timelines are **append-only** in security rules.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read results in your tenant | `results.read` |
| Enter / edit Draft values | `results.enter`, `results.draft.update` |
| Discard a Draft result | `results.draft.discard` |
| Transition Draft → Reviewed | `results.review` |
| Edit a Reviewed result | `results.reviewed.update` |
| Transition Reviewed → Approved | `results.approve` |
| Edit an Approved (pre-release) result | `results.approved.update` |
| Acknowledge a critical-value alert | `results.critical.acknowledge` |
| Release (Approved → Released) | `results.release` |
| Render / reprint a report PDF | `results.report.read`, `results.report.reprint` |
| Add an addendum | `results.addendum.write` |
| Create / edit report templates | `results.templates.write` |
| Read all audit + version history | `results.audit.read`, `results.versions.read` |

---

## Frequently asked questions

### Can I delete a Draft result?

Yes, with `results.draft.discard`. The deletion is a soft delete — the `results` doc is marked `discarded` and the version history is preserved. Restoring is possible within 24 hours via **Admin → Discarded Drafts**.

### What happens when an HL7 ORU pushes a value the catalog doesn't know about?

The ingester writes the OBX as a Draft result with `unknownTest: true` and flags it for manual mapping. A technician opens the result, picks the catalog test it should map to, and clicks **Map and Save** (permission `results.hl7.map`). The mapping is stored on the tenant's `hl7_test_mappings` collection so future messages from the same OBX-3 identifier resolve automatically.

### Can a patient see a Draft / Reviewed / Approved result before release?

No. The patient portal only surfaces `Released` results. The ordering clinician sees `Approved` results in their dashboard (without the PDF) as soon as the lab approves, but cannot reshare until release.

### How are reference ranges determined for paediatric patients?

The catalog stores `reference_ranges` keyed by `ageMin` / `ageMax` / `sex`. At result entry, the system picks the range whose `ageMin ≤ patient.age < ageMax` and `sex` matches (or `any` falls back). If no range matches, the catalog default applies and the result is flagged with `range-fallback: true` so the reviewer knows to confirm.

### Can two technicians enter results for the same sample concurrently?

The system allows it but applies a last-writer-wins strategy with a banner — the second user sees a real-time indicator that another user is editing the same result. The audit log captures both edits; the version timeline shows both writes.

### How is the digital signature implemented?

At Approval, the approver re-authenticates (password or biometric) to confirm identity. The signature is recorded as `signedByUserId`, `signedAt`, `signatureHash` (HMAC of the result snapshot + signer UID + timestamp using a tenant-specific server-side secret). The hash is verifiable; the signer cannot later repudiate the approval.

### What if the patient's email / phone changes mid-flow?

LabFlow distributes the report to whatever contact is on file at the moment of release. If the patient updates their contact afterwards, reprint distribution from `/results/:id/report → Resend`.

---

**Next:** [Quality Control →](./quality-control)
