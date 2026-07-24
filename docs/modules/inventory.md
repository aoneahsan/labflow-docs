---
sidebar_position: 10
slug: /modules/inventory
title: Inventory Module
description: Stock items, reagent lots, vendors, purchase orders, consumption tracking, low-stock alerts, expiry alerts, and reagent-to-QC traceability in LabFlow.
keywords:
  - LabFlow inventory
  - LIMS reagent lot tracking
  - laboratory stock management
  - reagent expiry alerts
  - lab purchase orders
  - low-stock alerts
  - reagent traceability
---

# Inventory Module

**Inventory in a laboratory is not a generic warehouse problem — it's a regulated traceability problem.** Every reagent vial, every QC lot, every consumable used during sample processing must be linked back to the result it influenced, the analyst who used it, and the supplier it came from. LabFlow's Inventory module tracks stock at the **item × lot × location** granularity, enforces FIFO / FEFO picking, fires low-stock and expiry alerts at configurable thresholds, ties consumption events directly to test results for downstream traceability, and produces auditor-ready PDFs that show, for any given patient result, the exact reagent lot used to generate it.

The data model is deliberately tighter than a generic e-commerce inventory tool — quantities are tracked per lot, lots have expiry dates and assayed values, and the consumption record is the bridge that lets QA reconstruct the analytical chain for accreditation auditors.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Operations |
| Required permission to view stock | `inventory.read` |
| Required permission to adjust stock | `inventory.adjust` |
| Required permission to receive a PO | `inventory.po.receive` |
| Firestore collections | `stock_items`, `stock_lots`, `stock_transactions`, `vendors`, `purchase_orders`, `purchase_order_items`, `consumption_events`, `inventory_locations`, `low_stock_alerts`, `expiry_alerts`, `inventory_audit_logs` |
| Routes | `/inventory`, `/inventory/items`, `/inventory/items/:id`, `/inventory/lots`, `/inventory/lots/:id`, `/inventory/transactions`, `/inventory/locations`, `/inventory/vendors`, `/inventory/purchase-orders`, `/inventory/purchase-orders/new`, `/inventory/purchase-orders/:id`, `/inventory/alerts`, `/inventory/consumption`, `/inventory/exports` |
| Linked modules | [Quality Control](./quality-control), [Test Catalog](./test-catalog), [Sample Tracking](./sample-tracking), [Results Management](./results-management) |

---

## Core concepts

| Term | Meaning |
|---|---|
| **Stock item** | A SKU — a specific consumable or reagent the lab uses. E.g. "Roche Elecsys TSH reagent cassette". Identified by an internal item code and optionally a manufacturer catalogue number. |
| **Stock lot** | One delivered batch of a stock item with its own lot number, expiry, and received quantity. An item has many lots over time. |
| **Stock transaction** | An atomic change to stock — a receipt, an issue, an adjustment, a transfer, a return, or a write-off. Every transaction is immutable and audit-logged. |
| **Inventory location** | A physical place stock lives — a fridge, a freezer, a shelf, a satellite-site cupboard. Each lot may be split across locations. |
| **Vendor** | A supplier the lab buys from. Carries lead time, payment terms, and contact details. |
| **Purchase order** | A formal request to a vendor for stock items, with quantities, prices, and an expected delivery date. |
| **Consumption event** | A record that a specific lot was used during a sample / QC / instrument-calibration activity. Bridges Inventory to Results / QC. |
| **Reorder point** | The on-hand quantity at or below which the system fires a low-stock alert. Set per item, optionally per location. |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/inventory` | Dashboard — low-stock count, expiring-in-7-days count, expired-on-hand count, open PO count, last-receipt feed | `inventory.read` |
| 2 | `/inventory/items` | Filterable item catalog | `inventory.read` |
| 3 | `/inventory/items/new` | Add a new stock item | `inventory.items.write` |
| 4 | `/inventory/items/:id` | Item detail — on-hand by lot and location, consumption history, related QC lot if applicable | `inventory.read` |
| 5 | `/inventory/lots` | Filterable list of all lots (status, expiry, item, location) | `inventory.read` |
| 6 | `/inventory/lots/:id` | Lot detail — receipts, consumption events, transfers, residual quantity | `inventory.read` |
| 7 | `/inventory/transactions` | Searchable ledger of every stock transaction | `inventory.read` |
| 8 | `/inventory/locations` | Manage physical locations | `inventory.locations.write` |
| 9 | `/inventory/vendors` | Manage vendors and contact info | `inventory.vendors.write` |
| 10 | `/inventory/purchase-orders` | Filterable PO list (status, vendor, expected date) | `inventory.po.read` |
| 11 | `/inventory/purchase-orders/new` | Create a new PO | `inventory.po.write` |
| 12 | `/inventory/purchase-orders/:id` | PO detail — line items, receipts, partial fulfilment | `inventory.po.read` |
| 13 | `/inventory/alerts` | Active low-stock and expiry alerts | `inventory.read` |
| 14 | `/inventory/consumption` | Browse consumption events linked to results and QC runs | `inventory.read` |
| 15 | `/inventory/exports` | CSV / PDF exports for accreditation evidence | `inventory.exports.read` |

---

## Stock item form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Internal item code | text | required | 2–40 chars; unique per tenant | Auto-suggested from the item name; editable before first save |
| Name | text | required | 2–120 chars | E.g. "Elecsys TSH reagent cassette" |
| Manufacturer | search-select | optional | active vendor | E.g. Roche Diagnostics |
| Manufacturer catalogue # | text | optional | 1–60 chars | Catalogue / part number |
| Category | enum | required | `reagent` / `control` / `calibrator` / `consumable` / `kit` / `instrument-part` / `office` | Drives default workflows and which alerts apply |
| Subcategory | text | optional | 0–60 chars | Free text for fine-grained sorting |
| Unit of issue | enum | required | `vial` / `bottle` / `cassette` / `pack` / `box` / `kit` / `ml` / `unit` / `tube` / `tip-rack` / `each` | Drives PO ordering math |
| Pack size | integer | required-for-multi-unit | ≥ 1 | E.g. 100 tips per rack |
| Default location | search-select | required | active inventory location | New receipts default here |
| Reorder point | decimal | required | ≥ 0 | Triggers low-stock alert when on-hand ≤ this value |
| Reorder quantity | decimal | optional | > 0 | Suggested PO quantity when an alert fires |
| Storage temperature | enum | required | `room` / `refrigerated` / `frozen` / `dry-cool` | Drives placement validation against location temperature |
| Light sensitivity | boolean | required | default `false` | Surfaces in handling notes |
| Hazard class | enum | optional | `none` / `bio-hazard` / `corrosive` / `flammable` / `toxic` / `radioactive` / `multi` | |
| MSDS / SDS link | file-upload | optional | PDF via FilesHub | |
| Linked test(s) | multi-select | optional | catalog tests | Powers consumption auto-linking and reagent-to-test traceability |
| Linked QC level | search-select | conditional | required when `category = control` | Bridges to [Quality Control](./quality-control) |
| Active | boolean | required | default `true` | Inactive items hide from order pickers but remain visible for historical audit |
| Notes | textarea | optional | 0–500 chars | Internal handling notes |

---

## Stock lot form — every field

A lot is one received batch of an item. New lots are created either by receiving a PO or by recording a manual receipt.

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Stock item | search-select | required | active item | |
| Lot number | text | required | 1–60 chars | Manufacturer-printed lot number |
| Manufacturing date | date | optional | ≤ today | |
| Expiry date | date | required | > today at receipt time | Triggers 30 / 14 / 7 / 0 day alerts |
| Received quantity | decimal | required | > 0 | In the item's unit of issue |
| On-hand quantity | derived | — | — | Decremented as the lot is consumed |
| Unit cost | decimal | optional | ≥ 0 | For cost-of-goods reporting |
| Currency | enum | required-if-cost | ISO 4217 | Defaults to tenant primary |
| Received from | enum | required | `purchase-order` / `manual-receipt` / `transfer-in` / `correction` | |
| Received via PO | search-select | required-if-po | open PO with matching item | |
| Received date | datetime | required | not in the future | |
| Storage location | search-select | required | active location with compatible temperature | Validated against the item's storage temperature |
| Assayed mean (control / calibrator) | decimal | required-for-control-calibrator | matches catalog units | Pulled from the manufacturer's assay sheet for QC levels |
| Assayed SD (control / calibrator) | decimal | required-for-control-calibrator | > 0 | |
| Container barcode | text | optional | up to 80 chars | If scanned at receipt |
| Notes | textarea | optional | 0–500 chars | |

---

## Stock transactions — the ledger

Every change to stock is one of these transaction types. The ledger is append-only.

| Type | Direction | Notes |
|---|---|---|
| `receipt` | + | New lot created or existing lot quantity increased. |
| `issue` | − | Lot quantity decremented by an issue to a department / instrument / bench. |
| `consumption` | − | Quantity used for a specific sample / QC run / calibration. Linked to a result or QC run. |
| `adjustment-positive` | + | Stocktake correction; requires `inventory.adjust` + a reason. |
| `adjustment-negative` | − | Stocktake correction; requires `inventory.adjust` + a reason. |
| `transfer-out` | − | Quantity moved to another location (within the same tenant). |
| `transfer-in` | + | Paired entry at the destination location. |
| `write-off` | − | Damaged, contaminated, or expired stock removed. Requires `inventory.writeoff` + a reason code. |
| `return-to-vendor` | − | Defective stock returned. Generates a credit-note workflow on the vendor account. |

Each transaction stores: timestamp, user, source / destination location, quantity, lot reference, reason / linkage, and (optionally) the related result, QC run, or PO.

---

## Purchase order form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Vendor | search-select | required | active vendor | |
| Expected delivery date | date | required | ≥ today | Drives delivery-late alerts when overdue |
| Currency | enum | required | ISO 4217 in vendor's enabled list | |
| Reference / vendor PO # | text | optional | 0–60 chars | The vendor's order number when issued |
| Internal PO # | text | server-assigned | unique per tenant | Auto-numbered `PO-YYYYMM-####` |
| Ship to location | search-select | required | active location | Default = tenant's primary location |
| Bill to address | textarea | optional | tenant-level default | |
| Tax rate | search-select | required | active tax rate or `exempt` | |
| Discount type | enum | optional | `none` / `percentage` / `flat` | |
| Discount value | decimal | required-if-discount | ≥ 0 | |
| Memo to vendor | textarea | optional | 0–500 chars | Printed on the PO PDF |
| Items (sub-table) | sub-collection | required-min-1 | each line has item, lot prefs, quantity, unit price | |

Each line item exposes:

| Sub-field | Type | Required | Notes |
|---|---|---|---|
| Stock item | search-select | required | Active items only |
| Quantity | decimal | required | > 0 in the item's unit of issue |
| Unit price | decimal | required | ≥ 0 |
| Required-by date | date | optional | Overrides the PO header's expected date |
| Line notes | text | optional | 0–120 chars |

On submit the PO moves to `draft`. Submitting moves it to `sent`. Receiving lines (partial or full) moves it through `partially-received` → `received`. A PO that is never received within 90 days of `expected delivery` is flagged with a vendor-lead-time alert.

---

## Low-stock + expiry alerts

The alert engine runs nightly and on every stock transaction. Alert sources:

| Alert | Trigger | Severity | Notification |
|---|---|---|---|
| Low stock | on-hand ≤ reorder point | medium | In-app, email to Lab Manager |
| Critical low | on-hand ≤ 50% of reorder point | high | In-app, email + SMS to Lab Manager |
| Out of stock | on-hand = 0 | critical | In-app, email + SMS to Lab Manager + procurement |
| Expiry 30 days | any lot with expiry between 23 and 30 days away | low | In-app to Lab Manager |
| Expiry 14 days | any lot with expiry between 8 and 14 days away | medium | In-app + email to Lab Manager |
| Expiry 7 days | any lot with expiry between 1 and 7 days away | high | In-app + email to Lab Manager |
| Expired | expiry date ≤ today and on-hand > 0 | critical | In-app + email; consumption is blocked unless overridden |
| Storage-temp mismatch | a lot is moved to a location whose temperature doesn't match the item spec | high | In-app at move time |
| PO late | PO `expected delivery date` + tenant grace days < today | medium | In-app to procurement |

A lab manager can acknowledge an alert (clears it from the dashboard but keeps it in the audit log) or snooze it for a defined window (a snoozed expiry alert re-fires once it crosses the next severity threshold).

---

## Consumption tracking & reagent-to-result traceability

When a sample is run on an instrument or a QC run is entered, LabFlow records consumption events that link a specific reagent / control lot to the resulting record. This is the single most important regulatory feature of the module — it lets QA reconstruct, for any patient result, exactly which reagent lot was on the instrument at the time. Auto-linking sources:

| Source | Linkage |
|---|---|
| Instrument HL7 ingestion | If the instrument message includes a lot ID and the item is mapped, the consumption is auto-created against that lot. |
| QC run entry | The picked lot on the QC run form is auto-linked. |
| Manual result entry | A "reagent used" picker is shown to the technologist for lots whose `Linked test(s)` includes the test being entered; multi-select is supported. |
| Calibration record | The calibrator lot used is auto-linked. |

Every consumption event is a stock transaction (which decrements on-hand) **and** a row in `consumption_events` (which carries the linkage). The result detail page and the QC run detail page surface their consumption events directly. An accreditation export at `/inventory/exports` can produce a PDF for any result showing the analyte, the reagent lot, the calibration lot in force, the QC runs framing the result, and the operator — all on a single page.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read inventory | `inventory.read` |
| Manage stock items | `inventory.items.write` |
| Manage stock lots (manual receipt / edit) | `inventory.lots.write` |
| Adjust on-hand quantity (stocktake) | `inventory.adjust` |
| Issue stock to a department | `inventory.issue` |
| Transfer stock between locations | `inventory.transfer` |
| Write off stock | `inventory.writeoff` |
| Return stock to vendor | `inventory.return` |
| Manage inventory locations | `inventory.locations.write` |
| Manage vendors | `inventory.vendors.write` |
| Read purchase orders | `inventory.po.read` |
| Create / edit purchase orders | `inventory.po.write` |
| Receive a purchase order | `inventory.po.receive` |
| Override expired-lot consumption | `inventory.expired-lot-override` |
| Read consumption events | `inventory.consumption.read` |
| Export inventory data | `inventory.exports.read` |
| Read inventory audit log | `inventory.audit.read` |

---

## Frequently asked questions

### Does LabFlow integrate with an external ERP for inventory?

Not out of the box. The Inventory module is self-contained — it has its own ledger, its own PO numbering, its own vendor master. Tenants that already run an ERP (SAP, Oracle, Tally, Zoho Books) typically use LabFlow for **traceability and consumption** (the regulator-facing side) and continue to issue POs from their ERP. A CSV import on `/inventory/exports` lets you sync received quantities from an external system as `receipt` transactions if you want a single source of truth in your ERP.

### How does FIFO / FEFO picking work?

When a technologist records consumption for an item, the system suggests the lot to draw from using **First-Expiry-First-Out (FEFO)** by default — the lot with the soonest expiry that has on-hand > 0 wins. Tenants can switch the default to **First-In-First-Out (FIFO)** per item (`stock_items.pickStrategy`). The technologist can override and pick a different lot but the override is audit-logged.

### Can a lot live in multiple locations at once?

Yes. The on-hand quantity per lot is tracked per location. Receipts default to the item's `defaultLocation`; transfers move quantity between locations and produce paired `transfer-out` / `transfer-in` transactions. Reports roll up across locations by default; per-location views are one filter away.

### What happens when a reagent expires while it's actively on an instrument?

The lot's expiry alert fires at 7 / 14 / 30 days as scheduled. Once the lot is expired, consumption against it is blocked by default. A technologist with `inventory.expired-lot-override` can override for one specific consumption event with a captured reason; the override is logged and surfaces on the affected patient report as a footnote. Critical analyses (linked tests where the catalog `criticalThresholds` is non-empty) cannot be overridden — the instrument must be loaded with an unexpired lot before reporting.

### How is the assayed mean / SD on a control lot used elsewhere?

When a control lot is created, its assayed mean and SD are stored on the `stock_lots` doc and **also** propagated to the matching `qc_lots` doc (joined by `(controlLevelId, lotNumber)`). The QC module uses the assayed mean / SD for rule evaluation until 20 in-house measurements are accumulated, at which point in-house mean / SD takes over — see [Quality Control](./quality-control#qc-lot-form--every-field).

### How does the module handle multi-site labs?

A tenant can run multiple sites with their own locations. Stock is tracked per site / location; users with `inventory.transfer` move stock between sites and the system fires a transit alert if a transfer is still `in-transit` 7 days after origination. Reports default to the user's primary site but expose a site-scope filter.

### Can I attach photos / certificates of analysis to a lot?

Yes. Each `stock_lots` record exposes a `documents` array of FilesHub object IDs. Common attachments: manufacturer's Certificate of Analysis (CoA), Material Safety Data Sheet (MSDS / SDS), photograph of the unopened box on receipt, and the signed receipt note from goods-inwards. All documents are stored as `visibility: 'public'` in FilesHub and surfaced on the lot detail page.

### Is there a stocktake / cycle-count workflow?

A simple stocktake mode is built in: from `/inventory/items` or `/inventory/lots`, select rows and pick "Start stocktake". The system records the system on-hand at the moment, the user enters the counted quantity, and any difference auto-creates a paired `adjustment-positive` or `adjustment-negative` transaction (per lot) with the stocktake batch ID in the reason. A stocktake summary export is available at the end of the batch for sign-off.

---

**Next:** Batch 06 covers Appointments + Home Collection + Reports & Analytics — see the [public build plan](https://github.com/aoneahsan/labflow-docs/blob/main/docs/audit/2026-05-10-docs-site-build-plan.md).
