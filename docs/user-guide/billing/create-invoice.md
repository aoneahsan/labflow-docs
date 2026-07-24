---
sidebar_position: 1
slug: /user-guide/billing/create-invoice
title: Generate an Invoice
description: How a billing user creates an invoice in LabFlow — choose the bill-to party, add ordered tests priced from the active price list, apply discounts, and issue the invoice ready for payment or insurance claim submission.
keywords:
  - generate invoice LabFlow
  - LIMS billing
  - lab invoice insurance claim
  - price list billing
  - bill-to patient insurer
---

# Generate an Invoice

**An invoice turns ordered tests into a priced, payable document with a clear bill-to party.** LabFlow prices each line from the active price list, supports split billing across patient, insurer, and corporate accounts, and feeds the claim workflow when an insurer is responsible. Required permission: `billing.invoice.create`. Claims, payments, refunds, and the eight financial reports are documented in the [Billing & Insurance module](/docs/modules/billing-insurance).

## Before you start

- The patient has at least one completed or in-progress order.
- A price list is active for the tenant (and the payer contract, if billing an insurer).
- You hold `billing.invoice.create` (Billing role by default).

## Steps

1. Open **Billing** and choose **New Invoice**, or open the order and choose **Create Invoice**.
2. **Select the patient and order(s)** to bill. LabFlow pulls the ordered tests in as line items.
3. **Choose the bill-to party** — patient, insurer, corporate account, or a split across them. The choice drives which price list and contract apply.
4. **Confirm line pricing.** Each test is priced from the active price list; payer-contract overrides take priority for insurer billing. Edit quantities only where your role allows.
5. **Apply any discount or write-off** with a reason code, if permitted. The reason is recorded for audit.
6. **Review totals** — subtotal, tax, discounts, and the amount due per party — then **Issue** the invoice.

## Result

The invoice is issued with a unique number and an `outstanding` balance. If an insurer is the bill-to party, the invoice can flow into the claim state machine (`draft → submitted → in-review → adjudicated → paid / denied → appealed`). Record payments against it from **Billing → Payments**, where one payment can be allocated across several invoices.

## Related recipes and references

- [Validate and release a result](../results/validate-and-release) — billing typically follows result release.
- [Billing & Insurance module](/docs/modules/billing-insurance) — claims, payments, refunds, multi-currency, and revenue reports.
- [User Guide overview](../overview) — recipe index by role.
