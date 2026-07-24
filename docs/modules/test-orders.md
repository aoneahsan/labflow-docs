---
sidebar_position: 5
slug: /modules/test-orders
title: Test Orders Module
description: Single and batch order entry, quick orders, STAT flagging, order templates, doctor and clinic association, cancellation flow, and requisition printing in LabFlow.
keywords:
  - LabFlow test orders
  - LIMS order entry
  - STAT order laboratory
  - order templates
  - requisition print
  - batch test ordering
---

# Test Orders Module

**A test order is the document that authorises a laboratory to perform one or more tests on a patient.** It links a patient to a list of tests and panels, captures the ordering clinician and clinic, sets priority and clinical context, and triggers downstream sample-creation, requisition-printing, billing, and (optionally) HL7/FHIR outbound messages. Every order is auditable, every cancellation needs a reason, and every state change writes to the patient's audit log.

This page documents every option exposed in the order-entry flow. If you want the high-level workflow narrative, see the [Quick Start](/docs/getting-started/quick-start#step-4--place-a-test-order). For how samples flow after an order is placed, see [Sample Tracking](./sample-tracking).

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Pre-analytical |
| Required permission to view | `orders.read` |
| Required permission to create | `orders.create` |
| Firestore collections | `orders`, `order_items`, `order_requisitions`, `orders_audit_logs` |
| Routes | `/orders`, `/orders/new`, `/orders/:id`, `/orders/:id/edit`, `/orders/:id/requisition`, `/orders/:id/cancel`, `/orders/templates`, `/orders/quick` |
| Linked modules | [Patient Management](./patient-management), [Test Catalog](./test-catalog), [Sample Tracking](./sample-tracking) |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/orders` | Filterable list of orders for the tenant; tabs for Pending / In Progress / Reported / Cancelled | `orders.read` |
| 2 | `/orders/new` | New-order multi-step form (patient selection → tests → clinical context → review) | `orders.create` |
| 3 | `/orders/:id` | Order detail with tabs for Tests, Samples, Results, Audit | `orders.read` |
| 4 | `/orders/:id/edit` | Edit a Pending order (add/remove items, change priority) | `orders.update` |
| 5 | `/orders/:id/requisition` | Render and print the requisition PDF | `orders.requisition.print` |
| 6 | `/orders/:id/cancel` | Cancellation modal — captures reason | `orders.cancel` |
| 7 | `/orders/templates` | Reusable order bundles for common visit types | `orders.templates.write` |
| 8 | `/orders/quick` | One-click order entry for the tenant's top-N most-ordered tests | `orders.create` |

---

## Order entry form — every step

The new-order form (`/orders/new`) is a four-step `react-hook-form` + `zod` wizard. Each step validates before the next opens; you can navigate backwards without losing data.

### Step 1 — Patient

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Patient | search-select | required | must resolve to an active patient in the tenant | Search by name / MRN / phone / national-ID; same widget as Patient Management |
| Pre-fill from previous order | checkbox | optional | — | When ticked, the next steps default to the patient's last order |

### Step 2 — Tests

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Tests | multi-select | required-min-1 | each must be active in the catalog | Searchable by local code / LOINC / name / category |
| Panels | multi-select | optional | each must be active | Adds all member tests; price honours panel-level pricing where defined |
| Apply a template | search-select | optional | — | Loads a saved order template (Step 4 below) |
| Remove individual test from panel | per-row toggle | optional | at least one test must remain | E.g. patient already had ALT yesterday — uncheck it from a Liver Function Panel |

The table at the bottom of Step 2 shows the resolved test list with per-row columns: code, name, specimen type, container, fasting required (from catalog), price (from active price list), reflex-rules-attached (icon).

### Step 3 — Clinical context

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Ordering clinician | search-select | required | must be in the tenant's `clinicians` collection | If absent, "Add new clinician" inline action available with `clinicians.create` |
| Ordering clinic | search-select | conditional | required when the clinician has > 1 clinic | Drives sample-routing rules |
| Priority | enum | required | `routine` / `urgent` / `stat` | STAT triggers immediate notification |
| Clinical indication | textarea | recommended | 0–500 chars | Free text; flows to the requisition and the final report |
| ICD-10-CM diagnosis codes | tag-list | optional | each tag a valid ICD-10 code | Used for insurance claim mapping |
| Fasting confirmed | boolean | conditional | required-if-any-test-needs-fasting | Each fasting-required test inherits this |
| Specimen collected externally | boolean | optional | — | If checked, the sample is created in "Received" state, skipping "Collected" |
| External barcode | text | conditional | required-if-specimen-collected-externally | The barcode the collecting site used |
| Date/time of collection | datetime | conditional | required-if-specimen-collected-externally; not in the future | Used to enforce stability window |
| Notes (lab) | textarea | optional | 0–500 chars | Internal lab notes; not printed on the requisition |

### Step 4 — Review and submit

Final review shows everything from Steps 1–3 plus:

- **Total price** (sum of resolved test prices from the active price list).
- **Estimated turnaround time** (max TAT across all selected tests).
- **Container labels needed** (deduped list of containers across tests).
- **Sample count** (deduped specimen-type count — orders with multiple tests on the same specimen produce a single sample).
- **Save as template** checkbox — captures the selected tests/panels as a reusable order template (Step 4 below).

Clicking **Submit** writes the `orders` doc, the `order_items` sub-docs, the corresponding `samples` docs (one per specimen type), the audit log, and (if `priority='stat'`) an immediate notification to the lab.

---

## Order priority

| Priority | Visual | Lifecycle impact |
|---|---|---|
| `routine` | grey | Default queue; ordinary TAT |
| `urgent` | amber | Surfaces above routine in the lab queue |
| `stat` | red | Immediate notification fires to on-call lab phone + dashboard banner; SLA tightened (configurable; default 1h) |

STAT orders write a `notification` event to the Communication Hub (Batch 08), which fans out to SMS, in-app, and push channels based on tenant config.

---

## Order templates

Templates are reusable order bundles. Common examples:

| Template name | Tests / panels included | Typical user |
|---|---|---|
| "Annual physical" | CBC, lipid panel, fasting glucose, HbA1c, TSH, urinalysis | Front desk / family practice |
| "Pre-employment medical" | CBC, urinalysis, HIV, HBsAg, chest X-ray | Corporate health |
| "Diabetes follow-up" | Fasting glucose, HbA1c, lipid panel, microalbuminuria | Endocrinology |
| "Pregnancy panel" | CBC, blood group, Rh, glucose, rubella IgG, HBsAg, syphilis, HIV | Obstetrics |

Templates carry `name`, `description`, `testIds[]`, `panelIds[]`, `createdBy`, `tenantId`, `tags[]`. Permissions: `orders.templates.write` to create / edit, `orders.templates.read` to use at order entry.

A template applied at order entry is a snapshot — editing the template later does not retroactively change orders placed against an older version.

---

## Quick orders

The `/orders/quick` route shows the tenant's top-N most-ordered tests (default N=12) as a tile grid. Clicking a tile starts the order wizard at Step 2 with that test pre-selected. Useful for high-volume front-desk workflows.

The top-N list is recomputed client-side (periodically, from ordering activity) and cached in `tenant_settings.quick_orders`.

---

## Requisition printing

A requisition is the PDF accompanying the patient and/or samples. Routes:

- `/orders/:id/requisition` renders the PDF inline in the browser with a print button.
- Auto-print on submit can be enabled in **Settings → Order Entry → Auto-print Requisition** — useful when a label printer sits next to the order-entry station.

The requisition includes:

- Tenant logo + name + address
- Order ID + barcode
- Patient demographics + MRN
- Ordering clinician + clinic
- Tests requested (with LOINC where available)
- Specimen-handling instructions per test (from catalog `specimen_rules`)
- Clinical indication and ICD-10 codes
- Date/time of order

Requisition templates are tenant-configurable via **Settings → Print Templates**.

---

## Cancellation

Cancelling an order is a soft action — it transitions the order to `cancelled` state, marks all linked samples as `cancelled` (only if they're still in `Collected` or earlier states; samples already in `Processing` complete normally), and writes an audit log entry. Cancellation captures a mandatory reason:

| Reason | Notes |
|---|---|
| `patient-request` | Patient asked to cancel; refund handling per tenant billing rules |
| `clinician-request` | Ordering clinician retracted |
| `wrong-patient` | Order placed on wrong patient — triggers a "wrong patient" entry on the affected patient's audit log too |
| `duplicate-order` | Same tests already ordered recently |
| `unable-to-collect` | Phlebotomy failed; no sample obtained |
| `other` | Free-text required |

Cancelled orders remain visible in the patient's history and audit log indefinitely. Hard-deletion is reserved for legal-erasure cases (permission `orders.delete`) and is itself audit-logged.

---

## Order document shape

```jsonc
{
  "id": "order_...",
  "tenantId": "...",
  "patientId": "...",
  "orderingClinicianId": "...",
  "orderingClinicId": "...",
  "priority": "routine|urgent|stat",
  "status": "pending|in-progress|reported|partially-reported|cancelled",
  "clinicalIndication": "...",
  "icd10Codes": ["E11.9"],
  "fastingConfirmed": true,
  "externalCollection": false,
  "createdAt": "...",
  "createdBy": "userId",
  "totalPriceCents": 12300,
  "currency": "PKR",
  "priceListId": "..."
}
```

Each `order_items` doc carries `orderId`, `testId` (or `panelId` + `testId` for panel members), `unitPriceCents`, `currency`, `reflexParentItemId` (if reflex-generated), `status`. The audit-log doc captures every state transition with `before` / `after` snapshots.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read orders in your tenant | `orders.read` |
| Create new orders | `orders.create` |
| Edit a Pending order | `orders.update` |
| Cancel an order | `orders.cancel` |
| Restore a cancelled order (within 24h) | `orders.restore` |
| Hard-delete an order | `orders.delete` (Super Admin / legal-erasure only) |
| Print requisition | `orders.requisition.print` |
| Create / edit order templates | `orders.templates.write` |
| Use order templates | `orders.templates.read` |
| Trigger reflex test addition manually | `orders.reflex.trigger` |

---

## Frequently asked questions

### Can I edit an order after samples are received?

You can add tests to an order while at least one sample is still in `Collected` or `In Transit` state, provided the new tests don't require a different specimen type. After all samples reach `Received`, the order locks for editing — you must cancel and re-order if you need a substantive change. This is a deliberate safety boundary.

### What happens when reflex rules fire?

When an upstream result is moved to `Reviewed` (or `Approved`, depending on the tenant's reflex-trigger setting), any matching reflex rule creates new `order_items` under the same order with `reflexParentItemId` pointing to the source. The same samples are reused where possible; new samples are created only when the reflex tests need a different specimen type.

### Can the patient be billed if an order is cancelled before any test ran?

Tenant-configurable. Most tenants don't bill for orders cancelled before any sample reaches `Processing`; tenants that do charge for STAT requests even on cancellation use **Settings → Billing → Cancellation Fees**.

### How do STAT alerts reach the lab?

When a STAT order is placed, the app writes a `notifications` doc client-side, which the Communication Hub fans out to an in-app banner (visible to anyone in roles `Lab Manager` / `Lab Technician`), OneSignal push to the lab-tablet PWA, and email (via FilesHub) to the on-call address per **Settings → On-call Roster**.

### Can an order span multiple tenants?

No. Every order is scoped to exactly one tenant. If a reference-laboratory needs a peripheral clinic to submit orders into it, the clinic users are invited to the laboratory's tenant and place orders directly there.

### How do reflex orders affect TAT reporting?

TAT is measured from the original `orders.createdAt` to the latest released result on the order — so a reflex test added later extends the effective TAT. The TAT-analytics dashboard (Batch 06) lets you slice by "with-reflex" vs "without-reflex" to keep the comparisons fair.

---

**Next:** [Sample Tracking →](./sample-tracking)
