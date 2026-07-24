---
sidebar_position: 4
slug: /modules/test-catalog
title: Test Catalog Module
description: LOINC-integrated test directory, panels, categories, reference ranges (age + sex), specimen rules, reflex testing, and per-insurer pricing in LabFlow.
keywords:
  - LabFlow test catalog
  - LIMS LOINC integration
  - laboratory reference ranges
  - reflex testing rules
  - test panel configuration
  - laboratory price list
---

# Test Catalog Module

**The Test Catalog is the registry of every laboratory test, panel, and category your tenant offers.** Each test entry binds a local name and code to a LOINC concept (where available), declares specimen requirements, defines reference ranges per age and sex, sets pricing per price-list, and optionally registers reflex rules (auto-add downstream tests when an upstream value crosses a threshold). The catalog is the upstream source for order entry, result interpretation, and billing — get the catalog right and the rest of LabFlow falls into place.

If you're looking for how to place an order against the catalog, see Batch 03's [Test Orders module](/docs/modules#test-orders) when it lands.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Pre-analytical (catalog admin) → Analytical (result interpretation) |
| Required permission to view | `tests.read` |
| Required permission to edit | `tests.write` |
| Firestore collections | `tests`, `panels`, `categories`, `reference_ranges`, `specimen_rules`, `reflex_rules`, `price_lists` |
| Routes | `/catalog`, `/catalog/tests`, `/catalog/tests/new`, `/catalog/tests/:id`, `/catalog/panels`, `/catalog/panels/:id`, `/catalog/categories`, `/catalog/reflex-rules`, `/catalog/price-lists`, `/catalog/import` |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/catalog` | Catalog overview — counts of tests, panels, categories, last-updated dates | `tests.read` |
| 2 | `/catalog/tests` | Searchable, filterable tabular list of tests (LOINC, code, name, specimen, price) | `tests.read` |
| 3 | `/catalog/tests/new` | New test form | `tests.write` |
| 4 | `/catalog/tests/:id` | Test detail with tabs for Reference Ranges, Specimen Rules, Pricing, Reflex Rules, History | `tests.read` |
| 5 | `/catalog/panels` | Searchable list of panels (grouped tests) | `tests.read` |
| 6 | `/catalog/panels/:id` | Panel detail — included tests, pricing, ordering rules | `tests.read` / `tests.write` |
| 7 | `/catalog/categories` | Manage categories (hematology, chemistry, microbiology, etc.) | `tests.categories.write` |
| 8 | `/catalog/reflex-rules` | Cross-test reflex rules (e.g. "if TSH < 0.1, add FT3 and FT4") | `tests.reflex.write` |
| 9 | `/catalog/price-lists` | Per-insurer / per-contract price lists | `billing.price-lists.write` |
| 10 | `/catalog/import` | LOINC bulk import wizard | `tests.bulk-import` |

---

## Test form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| **Name** | text | required | 1–120 chars | Display name shown to clinicians |
| **Code (local)** | text | required | tenant-unique; 2–24 chars; uppercase letters / digits / hyphen | Your laboratory's internal code |
| **LOINC code** | text | recommended | from the LOINC-import dropdown or manual; format `\d{1,5}-\d` | Drives FHIR `Observation.code` |
| **LOINC long name** | text | server-auto | pulled from LOINC bundle | Read-only after binding |
| **Category** | enum | required | one of the tenant's `categories` docs | Hematology / Chemistry / Microbiology / Molecular / Pathology / Radiology / Cardiology / Other |
| **Sub-category** | text | optional | 0–60 chars | Free-text refinement under category |
| **Specimen type** | enum | required | `whole-blood` / `serum` / `plasma` / `urine` / `stool` / `swab` / `csf` / `tissue` / `other` | Drives sample-creation downstream |
| **Specimen volume (mL)** | decimal | required | > 0; ≤ 1000 | |
| **Container type** | enum | required | from `specimen_rules` config | E.g. `EDTA-purple-top` / `SST-gold-top` / `sodium-citrate-blue-top` |
| **Storage temperature** | enum | required | `room` / `refrigerated` / `frozen` / `dry-ice` | |
| **Stability (hours)** | int | required | 1–8760 | How long the specimen is valid post-collection |
| **Turnaround time (hours)** | int | required | 1–8760 | SLA shown on the requisition |
| **Method** | text | optional | 0–80 chars | E.g. "Immunoturbidimetry" |
| **Instrument** | text | optional | 0–80 chars | Display only; integration mapping is separate |
| **Result type** | enum | required | `numeric` / `text` / `coded` / `range` / `attachment` | Drives result-entry UI |
| **Units** | text | required-if-numeric | 1–20 chars (UCUM preferred) | E.g. `mg/dL`, `mmol/L`, `g/L` |
| **Default reference range** | text | optional | 1–60 chars | Fallback when no age/sex-specific range matches |
| **Critical low** | decimal | optional | numeric tests only | Triggers critical-value alert |
| **Critical high** | decimal | optional | numeric tests only | Triggers critical-value alert |
| **Allowed in panels** | boolean | required | default `true` | Some tests are stand-alone-only |
| **Active** | boolean | required | default `true` | Inactive tests hidden from order entry |
| **Notes** | textarea | optional | 0–2000 chars | Internal notes for lab staff |

---

## Reference ranges

Each test can carry multiple `reference_ranges` documents — one per age + sex combination — so the result-interpretation engine picks the correct range for the patient at order time.

| Field | Type | Notes |
|---|---|---|
| `ageMin` (years) | decimal | inclusive; `0` for newborn |
| `ageMax` (years) | decimal | exclusive; `120` for "no upper bound" |
| `sex` | enum | `male` / `female` / `any` |
| `low` | decimal | inclusive lower bound |
| `high` | decimal | inclusive upper bound |
| `unit` | text | UCUM unit; must match the test's unit |
| `interpretation` | enum (optional) | `normal` / `borderline` / `abnormal` / `critical` |
| `notes` | text (optional) | Free-text comment shown on the report |

Ranges are non-overlapping by validation — if a new range overlaps an existing one for the same sex, the form refuses to save with a clear inline error.

For non-numeric tests (text / coded / range), the catalog instead stores a set of "expected values" with associated interpretations — for instance, blood-culture results map `no-growth` → normal, `mixed-flora` → borderline, `pathogen-isolated` → abnormal.

---

## Specimen rules

The `specimen_rules` collection lets you express constraints beyond what the test form captures directly:

- **Fasting required?** Yes / No / Configurable. If "yes", order entry shows a "Confirm fasting" checkbox; if unchecked at collection, the sample is auto-flagged "fasting-not-confirmed" on the result.
- **Time-of-day restriction.** E.g. cortisol must be collected between 06:00 and 10:00; outside that window, the order entry warns the clinician.
- **Pre-analytical handling.** E.g. "centrifuge within 30 minutes" / "protect from light" — surfaced on the requisition print.
- **Contraindications.** E.g. "do not collect during menstruation" — surfaced as a soft warning at order entry.

---

## Reflex rules

A reflex rule auto-adds one or more tests when an upstream test's result crosses a threshold. Common examples:

| Upstream | Condition | Reflex tests added |
|---|---|---|
| TSH | `< 0.1 µIU/mL` or `> 10 µIU/mL` | FT3, FT4 |
| Hemoglobin (male) | `< 13 g/dL` | Iron studies (ferritin, TIBC, transferrin saturation) |
| Glucose (fasting) | `> 126 mg/dL` | HbA1c |
| Total cholesterol | `> 240 mg/dL` | Lipid panel |
| Reticulocyte count | `> 2.5%` | Peripheral smear review |

Each rule defines `upstreamTestId`, `condition` (operator + threshold or a script for compound conditions), `reflexTestIds` (array), and `notifyOrderingPhysician` (boolean). Rules fire **after** the upstream result is approved (Reviewed state at the earliest, configurable); they never fire on Draft results so a typo doesn't trigger an unnecessary downstream test.

Reflex orders are charged according to the tenant's billing rules — most tenants either bill them as the original order's continuation (no extra charge) or charge them at the standard catalog price.

---

## Pricing

Each test carries a default `unitPrice` field. Tenants needing more granular pricing — different rates per insurer, per contract, per priority — use **Price Lists**.

A price list document binds a test ID to a price for a specific scope:

```jsonc
{
  "tenantId": "...",
  "name": "Insurer-XYZ-2026",
  "insurerId": "insurer_xyz",
  "validFrom": "2026-01-01",
  "validTo": "2026-12-31",
  "entries": [
    {"testId": "test_cbc", "price": 350, "currency": "PKR"},
    {"testId": "test_lipid_panel", "price": 800, "currency": "PKR"}
  ]
}
```

Order entry picks the right price list automatically based on the patient's insurance binding; if no price list matches, the test's default `unitPrice` is used.

---

## LOINC integration

LabFlow ships a built-in LOINC database (LOINC 2.76) loaded into the tenant on first sign-in. The catalog form's LOINC dropdown searches against `loinc.long_common_name`, `loinc.short_name`, and `loinc.loinc_num` — typing "haemoglobin" surfaces every matching LOINC concept with class, system (e.g. `Bld`), method, and time aspect.

Binding a test to a LOINC code unlocks:

- Correct FHIR `Observation.code` for outbound integrations.
- Cross-mapping to ICD-10-CM and SNOMED-CT (when the LOINC has equivalences).
- Standardised reporting for accrediting bodies that prefer LOINC over local codes.

LOINC bundles update twice a year (June and December); LabFlow refreshes the in-tenant copy on the next sign-in after release.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read tests / panels / categories | `tests.read` |
| Create / edit / archive a test | `tests.write` |
| Bulk-import tests from CSV / LOINC | `tests.bulk-import` |
| Create / edit panels | `tests.panels.write` |
| Create / edit categories | `tests.categories.write` |
| Create / edit reflex rules | `tests.reflex.write` |
| Create / edit price lists | `billing.price-lists.write` |
| Read price lists | `billing.price-lists.read` |
| View catalog audit log | `tests.audit.read` |

---

## Frequently asked questions

### Can I have two tests with the same LOINC code?

Yes. Two tests can bind the same LOINC concept (e.g. "Glucose [Mass/volume] in Blood" with a fasting variant and a random variant). The catalog enforces uniqueness on `(tenantId, localCode)` but not on `(tenantId, loincCode)`.

### How do panels get priced?

A panel's price is the sum of its constituent tests' prices unless you override at the panel level. If a tenant's price list defines a panel-level price, that wins; otherwise it's the sum.

### Can I add a custom test that doesn't have a LOINC code?

Yes. Leave LOINC blank; the test still works for internal ordering and result entry, but it won't appear correctly on FHIR `Observation` exports. The system warns you at save time so you're aware of the integration trade-off.

### What about anatomic-pathology (gross / microscopic descriptions, ICD-O-3)?

The catalog supports text-type results with a structured template — for instance, a "Skin biopsy" test with sub-fields for site, gross description, microscopic description, ICD-O-3 morphology code, and final diagnosis. The detail page for Pathology lands in Batch 04 alongside Results Management.

### How do I migrate from another LIMS?

The `/catalog/import` wizard accepts a CSV with the columns listed in the test form. The importer validates each row, surfaces inline errors, and dedupes against existing local codes. For LOINC-coded migrations, use the **LOINC bulk import** option — it accepts just LOINC codes and pulls the LOINC long name + units automatically.

### Can a test be inactive without losing its history?

Yes. Setting `active: false` hides the test from order entry but preserves every historical order, sample, and result. Reactivate at any time; the field is fully reversible.

---

**Next:** Batch 03 fills in Test Orders + Sample Tracking detail pages — see the [public build plan](https://github.com/aoneahsan/labflow-docs/blob/main/docs/audit/2026-05-10-docs-site-build-plan.md).
