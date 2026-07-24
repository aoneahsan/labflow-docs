---
sidebar_position: 9
slug: /modules/billing-insurance
title: Billing & Insurance Module
description: Invoicing, payments, insurance claims, price lists, write-offs, and financial analytics in LabFlow. Every screen, every field, every status transition documented.
keywords:
  - LabFlow billing
  - LIMS invoicing
  - laboratory insurance claims
  - lab payments
  - lab price list
  - claim status tracking
  - laboratory financial analytics
---

# Billing & Insurance Module

**Billing & Insurance is how a laboratory gets paid.** Every released test order generates a draftable invoice; every invoice can be paid in part or in full by the patient, an insurer, a corporate account, or a mixture of all three; every insurer claim moves through a state machine that mirrors the real-world payer cycle. LabFlow's billing module ships per-tenant price lists, multi-currency support, partial payment handling, write-offs with mandatory reasons, configurable claim formats (CMS-1500 fields and EDI 837P export), insurer-specific reference-data dictionaries, and a full audit trail so refunds, voids, and adjustments are reconcilable from any future date.

Pricing is multi-tenant — each laboratory keeps its own price list independent of any other tenant on the platform.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Post-analytical / Operations |
| Required permission to view invoices | `billing.invoices.read` |
| Required permission to issue invoices | `billing.invoices.issue` |
| Required permission to accept payments | `billing.payments.write` |
| Firestore collections | `invoices`, `invoice_items`, `payments`, `claims`, `claim_events`, `price_lists`, `price_list_versions`, `payers`, `payer_contracts`, `corporate_accounts`, `tax_rates`, `billing_audit_logs` |
| Routes | `/billing`, `/billing/invoices`, `/billing/invoices/new`, `/billing/invoices/:id`, `/billing/payments`, `/billing/claims`, `/billing/claims/:id`, `/billing/price-lists`, `/billing/payers`, `/billing/corporate-accounts`, `/billing/refunds`, `/billing/exports`, `/billing/reports` |
| Linked modules | [Test Orders](./test-orders), [Patient Management](./patient-management), [Test Catalog](./test-catalog), [Results Management](./results-management) |

---

## Core concepts

| Term | Meaning |
|---|---|
| **Invoice** | A bill for one or more order items, addressed to a payer (patient, insurer, corporate account, or split). |
| **Invoice item** | A single billable line — usually one test or one panel — with its catalog price, applied discount, and any tax. |
| **Payment** | Money applied against one or more invoices. May be cash, card, bank transfer, insurer remittance, or a journal adjustment. |
| **Claim** | The submission to an insurance company for reimbursement. Moves through `draft → submitted → in-review → adjudicated → paid` (or `denied → appealed`). |
| **Price list** | A versioned catalog mapping each test / panel to a price in a specific currency, optionally per payer contract. |
| **Write-off** | A documented reduction of the outstanding balance with a mandatory reason code (bad debt, courtesy, contractual adjustment, error correction). |
| **Refund** | Money returned to a payer after a payment has been recorded. Always linked to the original payment and the invoice it offset. |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/billing` | Billing dashboard — outstanding receivables, today's collections, claim status counters, denied-claim alerts | `billing.read` |
| 2 | `/billing/invoices` | Filterable invoice list (status, payer, date range, amount) | `billing.invoices.read` |
| 3 | `/billing/invoices/new` | New invoice from one or more open orders | `billing.invoices.issue` |
| 4 | `/billing/invoices/:id` | Invoice detail — line items, payments applied, claim status, audit | `billing.invoices.read` |
| 5 | `/billing/payments` | Payment ledger across all invoices | `billing.payments.read` |
| 6 | `/billing/payments/new` | Record a payment against one or more invoices | `billing.payments.write` |
| 7 | `/billing/claims` | Claim list with adjudication state | `billing.claims.read` |
| 8 | `/billing/claims/:id` | Claim detail — items, payer responses, attachments, EDI history | `billing.claims.read` |
| 9 | `/billing/price-lists` | Manage active and historical price lists | `billing.pricelists.write` |
| 10 | `/billing/payers` | Manage insurers / payers and their contract terms | `billing.payers.write` |
| 11 | `/billing/corporate-accounts` | Manage corporate billing accounts (employers, hospitals, clinics) | `billing.corporate.write` |
| 12 | `/billing/refunds` | Process and track refunds | `billing.refunds.write` |
| 13 | `/billing/exports` | Export invoices, payments, claims, ageing reports | `billing.exports.read` |
| 14 | `/billing/reports` | Revenue, collection rate, denial rate, mean days-to-pay, payer-mix analytics | `billing.reports.read` |

---

## Invoice form — every field

The `/billing/invoices/new` form lets a billing clerk produce an invoice from one or more completed (or in-progress) orders.

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Patient | search-select | required | active patient | Pulled from [Patient Management](./patient-management) |
| Orders | multi-select | required-min-1 | orders owned by the patient | Picks one or more order items; the form expands a line per item |
| Bill-to type | enum | required | `patient` / `insurer` / `corporate` / `split` | Drives the rest of the form |
| Primary insurer | search-select | required-if-insurer | active payer + active patient policy | Pulls policy number, plan, group from patient record |
| Secondary insurer | search-select | optional | active payer | For coordination-of-benefits flows |
| Corporate account | search-select | required-if-corporate | active corporate account | E.g. employer wellness plan |
| Patient responsibility % | decimal | conditional | 0–100 | For split billing |
| Currency | enum | required | ISO 4217 code in tenant's enabled list | Defaults to tenant's primary currency |
| Discount type | enum | optional | `none` / `percentage` / `flat` | |
| Discount value | decimal | required-if-discount | ≥ 0; ≤ subtotal for flat; 0–100 for percentage | |
| Discount reason | text | required-if-discount | 1–120 chars | E.g. "Senior citizen 10%" |
| Tax rate | search-select | required | active tax rate or `exempt` | E.g. VAT 5% |
| Notes / internal | textarea | optional | 0–500 chars | Internal billing notes (not printed) |
| Invoice memo | textarea | optional | 0–500 chars | Printed on PDF |
| Due date | date | required | ≥ issue date; default = issue + tenant's invoice-terms days | |

Each picked order item auto-populates: test code, test name, applied price-list price, the patient's panel discount (if any from the catalog), and the line subtotal. The billing clerk may edit each line price (requires `billing.invoices.lineprice-edit` permission and a captured reason).

---

## Payment form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Invoice(s) | multi-select | required-min-1 | open or partially-paid invoices for the same payer | Single payment can offset multiple invoices |
| Payer | derived | — | — | Pulled from the picked invoices |
| Amount | decimal | required | > 0; ≤ sum of selected invoice balances | |
| Currency | derived | — | matches invoice currency | |
| Method | enum | required | `cash` / `card` / `bank-transfer` / `cheque` / `mobile-wallet` / `journal` / `insurer-remittance` | |
| Reference number | text | conditional | required for `card` / `bank-transfer` / `cheque` / `mobile-wallet` / `insurer-remittance` | E.g. card-terminal txn ID or cheque number |
| Received date | datetime | required | not in the future | Defaults to now |
| Allocation strategy | enum | required-if-multi | `oldest-first` / `proportional` / `manual` | Manual exposes a per-invoice allocation field |
| Receipt notes | textarea | optional | 0–500 chars | Printed on the receipt |

On submit, the system writes a `payments` doc, updates the related `invoices.balance` and `invoices.status`, fires an analytics `payment_recorded` event, and renders a printable receipt as a PDF stored in FilesHub.

---

## Claim form — every field

Claims for insurer billing follow the CMS-1500 reference shape; LabFlow stores all fields whether or not your jurisdiction uses CMS-1500, so the same record can be exported to alternative formats.

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Invoice | search-select | required | invoice with `bill-to: insurer` and unsubmitted | |
| Diagnosis codes | multi-text | required-min-1 | ICD-10 codes pulled from the order | |
| Place of service | enum | required | CMS POS code (e.g. `81` = lab) | |
| Rendering provider | search-select | required | active provider with NPI on file | |
| Billing provider | search-select | required | active provider with NPI / tax-ID | |
| Referring provider | search-select | optional | active provider | |
| Procedure codes | derived | — | CPT codes from each invoice item | One claim line per invoice item |
| Modifiers | multi-text | optional | one per line | E.g. `90` for reference (outside) laboratory |
| Prior authorisation | text | optional | 1–40 chars | Captured if payer required pre-auth |
| Accident-related | boolean | required | default `false` | Drives `Auto/Other Accident` flag |
| Attachments | file-upload | optional | PDF up to 10 MB each via FilesHub | Lab order, referral letters, prior-auth confirmations |
| Memo to payer | textarea | optional | 0–500 chars | |

Export formats: **CMS-1500 PDF**, **EDI 837P** (5010A1), **JSON** for API-based payer integrations. Each submission is logged in `claim_events`.

---

## Claim status machine

A claim moves through this state machine:

```text
draft
  └── submitted ──── in-review ──── adjudicated ──── paid
                          │
                          ├──── partial-pay ──── balance-billed-to-patient
                          ├──── denied ──── appealed ──── adjudicated (back to review)
                          └──── retracted (clinic withdrew) ──── draft
```

| Status | Meaning | Next actions |
|---|---|---|
| `draft` | Created, not yet sent to payer | Submit, edit, or void |
| `submitted` | Sent to payer (via EDI or fax / portal upload) | Wait for adjudication; record receipt date |
| `in-review` | Payer acknowledged; under review | Wait; clerk can attach extra documentation |
| `adjudicated` | Payer issued a remittance advice (RA) | Apply payments; flag patient-responsibility balance |
| `paid` | Full claim amount received | Reconcile and close |
| `partial-pay` | Partial payment received | Bill remainder to patient or appeal |
| `denied` | Payer rejected the claim | Read denial code; appeal or write off |
| `appealed` | Appeal submitted | Wait for adjudication |
| `retracted` | Clinic pulled the claim (e.g. found an error) | Back to draft, fix, resubmit |
| `voided` | Cancelled — no further movement allowed | Hard-stop state |

Every transition is timestamped in `claim_events` with the user who moved it (or `system` for EDI-triggered transitions) and the reason code where applicable.

---

## Price list mechanics

Price lists are versioned. Every change creates a new immutable `price_list_versions` entry — the old version remains queryable for historical invoices. The active version is the one with the latest `effectiveFrom` date that is ≤ today.

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text | required | E.g. "Cash-paying patients 2026" |
| Currency | enum | required | ISO 4217 |
| Effective from | date | required | Future-dated lists become active automatically |
| Effective to | date | optional | If set, the list expires automatically |
| Default behaviour | enum | required | `apply-to-all` / `restrict-to-payers` / `restrict-to-corporate` |
| Test prices | sub-collection | required-min-1 | One row per test / panel: catalog ID, price, optional override discount |

Payer-specific price lists overlay the default list per payer contract. When an invoice is issued for a patient billed to an insurer, the system resolves the price for each line in this priority order:

1. The payer contract's negotiated rate (if the test code is on the contract).
2. The payer-specific price list (if one exists and is active).
3. The default price list for the tenant.

The resolved price, the chosen source, and the resolution timestamp are persisted on the invoice line so a future audit can reproduce the exact pricing decision.

---

## Refunds

A refund is the inverse of a payment. The form requires a positive amount ≤ the original payment, a refund method (which need not match the original), a refund reason from the controlled list (`patient-request`, `duplicate-payment`, `service-not-rendered`, `service-cancelled`, `clinical-disqualification`, `payer-overpayment-recovery`), and an approver if the amount exceeds the tenant's auto-approval threshold. Refunds reopen the related invoice and reverse the affected line balances; the original payment record is preserved unchanged and a linked `payments.refundOf` field is set on the refund doc.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read invoices | `billing.invoices.read` |
| Issue invoices | `billing.invoices.issue` |
| Edit a line-item price | `billing.invoices.lineprice-edit` |
| Void an invoice | `billing.invoices.void` |
| Read payments | `billing.payments.read` |
| Record a payment | `billing.payments.write` |
| Read claims | `billing.claims.read` |
| Submit a claim | `billing.claims.submit` |
| Manage price lists | `billing.pricelists.write` |
| Manage payers / contracts | `billing.payers.write` |
| Manage corporate accounts | `billing.corporate.write` |
| Process a refund | `billing.refunds.write` |
| Approve a high-value refund | `billing.refunds.approve` |
| Apply a write-off | `billing.writeoffs.write` |
| Export financial data | `billing.exports.read` |
| Read financial reports | `billing.reports.read` |
| Read billing audit log | `billing.audit.read` |

The matrix is per-tenant — a user can be Billing Clerk in tenant A and Lab Manager in tenant B without one role bleeding into the other.

---

## Reports & analytics

`/billing/reports` ships these out-of-the-box dashboards (all rendered with D3.js, the project's only chart library):

| Report | What it shows | Filters |
|---|---|---|
| Revenue trend | Daily / weekly / monthly invoiced and collected amounts | Date range, payer, corporate account |
| Collection rate | % of issued invoices fully paid within N days | N = 30 / 60 / 90 |
| Ageing | Open invoices bucketed at 0-30 / 31-60 / 61-90 / 90+ days | Payer, corporate account |
| Payer mix | Revenue breakdown by payer type (patient / insurer / corporate) | Date range |
| Denial rate | % of claims denied; top denial reasons | Date range, payer |
| Mean days-to-pay | Average days from invoice issue to full payment | Payer, payment method |
| Top tests by revenue | Catalog rank by revenue contribution | Date range, category |
| Write-off summary | Total write-offs by reason code | Date range |

Each report supports CSV / PDF export — every export goes to FilesHub and an audit row records the requesting user.

---

## Frequently asked questions

### Does LabFlow process card payments directly?

No. LabFlow records payments — including card payments — against invoices, but it does **not** integrate a payment processor. Tenants run cards on their own terminals (Stripe / Square / their bank's POS / a local processor) and enter the resulting transaction reference in the payment form. We avoid card processing deliberately so the system is **not** in PCI-DSS scope; only payment metadata is stored, never card numbers, CVVs, or full PANs.

### How does LabFlow handle multi-currency labs?

A tenant declares one primary currency plus any number of additional enabled currencies. Each invoice locks in its currency at issue time. Reports default to the primary currency with cross-currency totals converted at a configurable daily rate; the historical exchange rate is persisted per payment so reconciliation is exact.

### Can I bill an order to multiple insurers (primary + secondary)?

Yes — a split-bill invoice can route the same items through coordination of benefits. The patient policy record holds primary / secondary / tertiary; the invoice form picks any combination. When the primary insurer adjudicates and a balance remains, a "balance-bill secondary" action automatically creates a follow-up claim against the secondary policy with the primary's RA attached.

### How are claims actually submitted to payers?

The system writes the canonical claim record and can emit it in three shapes: a CMS-1500 PDF (suitable for fax or portal upload), an EDI 837P 5010A1 file (the U.S. electronic-claim standard, accepted by most clearing-houses), or JSON for direct API integrations. Out-of-the-box LabFlow doesn't ship a clearing-house connector — your billing operator uploads the EDI / PDF to your clearing-house portal (Change Healthcare, Availity, Office Ally, etc.). Tenant-specific clearing-house integrations are a deployment-level extension.

### What happens to invoices for cancelled orders?

If the order is cancelled **before** an invoice is issued, the invoice action is not available for those items. If the order is cancelled **after** an invoice is issued, the billing clerk can void the invoice (state moves to `voided` and the invoice no longer counts toward receivables) or apply a write-off with the `service-cancelled` reason code — both leave a permanent audit trail. Payments already collected can be refunded through the standard refund flow.

### How are corporate accounts billed?

Corporate accounts are billed in arrears on a configurable cycle (weekly, fortnightly, monthly). Each cycle the system rolls all unpaid corporate-bill invoices into a single consolidated invoice (with line-level detail attached as a PDF) and emails it to the corporate-account billing contact. The contact pays the consolidated invoice; payments are auto-allocated back to the underlying invoices using the `oldest-first` or `proportional` strategy chosen on the corporate-account record.

### Are write-offs reversible?

A write-off can be reversed within 90 days by a user with `billing.writeoffs.reverse`. After 90 days the write-off is sealed and reversal requires a new credit-memo entry referencing the original write-off — both events remain in the audit log.

### Where do invoice and receipt PDFs live?

Every invoice and receipt PDF is generated in-app (client-side) and stored in **FilesHub** as a `visibility: 'public'` object — there is no server-side render path, because LabFlow ships no Cloud Functions. The FilesHub object URL is what's shared with the patient (by email via FilesHub); internal staff fetch it through the in-app viewer. Firebase Storage is explicitly not used for any file storage in LabFlow.

---

**Next:** Inventory — see [Inventory module](/docs/modules/inventory).
