---
sidebar_position: 8
slug: /modules/quality-control
title: Quality Control Module
description: QC run management, QC levels and lots, Levey-Jennings charts, and Westgard multi-rule sets (1-2s, 1-3s, 2-2s, R-4s, 4-1s, 10-x) in LabFlow.
keywords:
  - LabFlow quality control
  - LIMS QC
  - Levey-Jennings chart
  - Westgard rules 1-3s 2-2s R-4s
  - QC run laboratory
  - QC lot tracking
---

# Quality Control Module

**Quality Control (QC) is how a laboratory proves it can trust its own results.** Every analyte that matters is measured periodically against a known control material; the measured value is plotted on a Levey-Jennings chart; multi-rule sets (the Westgard rules) decide whether the current run is in-control or out-of-control. LabFlow's QC module ships with all six base Westgard rules out-of-the-box, supports custom rule combinations, tracks control lots with expiry, and links QC failures directly to the affected patient samples so the lab can scope a corrective action.

If you've heard "Westgard" but not internalised what each rule does, this page is also a working reference — the rule table below is intentionally exhaustive.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Analytical |
| Required permission to view | `qc.read` |
| Required permission to enter QC | `qc.enter` |
| Firestore collections | `qc_runs`, `qc_levels`, `qc_lots`, `qc_rules`, `qc_alerts`, `qc_audit_logs` |
| Routes | `/qc`, `/qc/runs`, `/qc/runs/new`, `/qc/runs/:id`, `/qc/levels`, `/qc/lots`, `/qc/rules`, `/qc/charts`, `/qc/exports` |
| Linked modules | [Test Catalog](./test-catalog), [Results Management](./results-management), [Inventory (Batch 05)](/docs/modules) |

---

## Core concepts

| Term | Meaning |
|---|---|
| **QC level** | A control material at a defined target concentration. E.g. "Low control glucose at 60 mg/dL". |
| **QC lot** | A specific manufacturer batch of a QC level, with expiry date and assayed mean / SD. |
| **QC run** | A single measurement of one or more QC levels — typically once or twice per shift. |
| **Levey-Jennings chart** | Time-series scatter of the QC measurements with horizontal bands at ±1 SD, ±2 SD, ±3 SD. |
| **Westgard rule** | A statistical pattern across one or more recent QC measurements that flags an out-of-control state. |
| **Multi-rule set** | An ordered combination of Westgard rules (e.g. `1-3s` → if pass, check `2-2s` → if pass, check `R-4s` → ...). |
| **In-control / out-of-control** | The verdict from applying the rule set to the latest QC measurement. Out-of-control blocks patient-sample reporting on the affected analyzer for the affected analyte. |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/qc` | QC overview dashboard — last run per analyte, current in-/out-of-control status, expiring lots | `qc.read` |
| 2 | `/qc/runs` | Filterable list of all QC runs across analyses and dates | `qc.read` |
| 3 | `/qc/runs/new` | New QC run entry — picks levels, captures measured values | `qc.enter` |
| 4 | `/qc/runs/:id` | Run detail with chart preview, rule-evaluation breakdown, audit | `qc.read` |
| 5 | `/qc/levels` | Manage QC levels per analyte | `qc.levels.write` |
| 6 | `/qc/lots` | Manage active and expiring QC lots | `qc.lots.write` |
| 7 | `/qc/rules` | Configure per-analyte multi-rule sets | `qc.rules.write` |
| 8 | `/qc/charts` | Levey-Jennings chart workspace — pick analyte + level + date range | `qc.read` |
| 9 | `/qc/exports` | Export QC data as CSV / PDF for accreditation evidence | `qc.export` |

---

## QC level form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Name | text | required | 1–60 chars | E.g. "Low glucose control" |
| Test (catalog) | search-select | required | active catalog entry | Each level binds to exactly one catalog test |
| Target value | decimal | required | matches catalog units | E.g. 60.0 (mg/dL) |
| Manufacturer | text | optional | 0–80 chars | E.g. Bio-Rad Liquichek |
| Material type | enum | required | `assayed` / `unassayed` / `external` | Drives which acceptable-range definitions are used |
| Storage temperature | enum | required | `room` / `refrigerated` / `frozen` | |
| Active | boolean | required | default `true` | |

---

## QC lot form — every field

A lot is one shipment of a level. Each level has multiple lots over time as you reorder.

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| QC level | search-select | required | must be active | |
| Lot number | text | required | 1–60 chars; manufacturer-unique recommended | |
| Mean (assayed) | decimal | required-for-assayed | matches catalog units | From manufacturer's assay sheet |
| SD (assayed) | decimal | required-for-assayed | > 0 | From manufacturer's assay sheet |
| Mean (in-house) | decimal | server-computed | — | Computed after 20 in-house measurements |
| SD (in-house) | decimal | server-computed | — | Computed after 20 in-house measurements |
| Expiry date | date | required | not in the past at save time | Drives expiry alerts |
| Received date | date | required | not in the future | |
| Container / vial size | text | optional | 0–40 chars | E.g. "10 × 5 mL" |
| Inventory link | search-select | optional | links to an Inventory stock item | Used to deduct stock automatically on QC run |
| Notes | textarea | optional | 0–500 chars | |

The system uses **in-house** mean / SD where computed (≥ 20 in-house measurements); otherwise the manufacturer's **assayed** mean / SD. In-house values typically tighten over time as your specific instrument calibrates better than the manufacturer's broad-population assay.

---

## QC run entry

The `/qc/runs/new` form is intentionally tight:

| Field | Type | Required | Notes |
|---|---|---|---|
| Analyzer / instrument | enum | required | From tenant's `instruments` collection |
| Shift | enum | required | `morning` / `evening` / `night` (configurable) |
| QC level(s) | multi-select | required-min-1 | The form expands rows for each picked level |
| Measured value (per level) | decimal | required-per-level | matches catalog units |
| Lot (per level) | search-select | required-per-level | active lot; system pre-fills with the most-recent active lot |
| Operator | userId | server-defaulted | Defaults to the entering user |
| Run date / time | datetime | server-defaulted | not in the future |
| Notes | textarea | optional | 0–500 chars |

On submit, for each level the system:

1. Computes the standardised deviation: `z = (measured − lotMean) / lotSD`.
2. Evaluates the configured multi-rule set in order, walking from the strictest rule outward.
3. Writes a `qc_runs` doc with `inControl: boolean`, `violations: ['1-3s', ...]`.
4. If out-of-control, fires `qc_alerts` and **locks reporting** for the analyte + analyzer until the run is reviewed and the lab confirms corrective action.
5. Updates the rolling in-house mean / SD calculations.

---

## The six base Westgard rules

LabFlow ships with the six base rules. Each rule's name encodes "trigger conditions: how many measurements, how many SDs".

| Rule | Trigger | Verdict | Interpretation |
|---|---|---|---|
| **1-2s** | 1 measurement > 2 SD from mean | Warning (not rejection) | Use only as a *warning* trigger that escalates evaluation of other rules. ~5% of in-control runs trip this by chance, so it's not a rejection rule in modern multi-rule sets. |
| **1-3s** | 1 measurement > 3 SD from mean | Reject | Random or systematic error on this run. |
| **2-2s** | 2 consecutive measurements > 2 SD on the *same side* of the mean | Reject | Systematic shift. Often a recalibration or new reagent lot is needed. |
| **R-4s** | 2 consecutive measurements differ by > 4 SD (one above, one below) | Reject | Increased imprecision (random error). |
| **4-1s** | 4 consecutive measurements > 1 SD on the *same side* of the mean | Reject | Systematic shift; smaller but more sustained than 2-2s. |
| **10-x** | 10 consecutive measurements on the *same side* of the mean | Reject | Long-running systematic drift. Often resolved by recalibration. |

A standard multi-rule set is "Westgard 1-3s / 2-2s / R-4s / 4-1s / 10-x with 1-2s as warning". LabFlow's default rule set per analyte is this combination; tenants override per analyte at `/qc/rules`.

---

## Rule evaluation order

The system evaluates the multi-rule set in this fixed sequence:

```text
1. Check 1-2s — if no trip, run is in-control (terminate).
2. Check 1-3s — if trip, REJECT.
3. Check 2-2s — if trip, REJECT.
4. Check R-4s — if trip, REJECT.
5. Check 4-1s — if trip, REJECT.
6. Check 10-x — if trip, REJECT.
7. Otherwise, in-control with a 1-2s warning logged.
```

Rules that need >1 measurement (`2-2s`, `R-4s`, `4-1s`, `10-x`) consider the current run plus the most recent N−1 in-control runs on the **same analyte + same analyzer + same level**.

---

## Levey-Jennings chart

The chart at `/qc/charts` is rendered with D3.js (the project's only chart library). Configurable per pick:

| Control | Effect |
|---|---|
| Analyte | One catalog test |
| Level | One QC level (the chart shows one level at a time; the level dropdown switches) |
| Date range | Default rolling 30 days; configurable 7 / 30 / 90 / 365 / custom |
| Bands | ±1 SD, ±2 SD, ±3 SD horizontal lines drawn from the lot's mean and SD |
| Lot boundaries | Vertical dashed lines mark lot transitions; in-house mean/SD restart from each transition |
| Westgard flags | Each violating point is annotated with the violated rule code (e.g. `2-2s`) |
| Export | PNG / PDF / SVG; CSV of the underlying values |

The chart is interactive: hovering a point shows the run ID, operator, measured value, computed z-score, and any violations.

---

## Out-of-control handling

When a run is out-of-control, LabFlow locks reporting for the (analyte + analyzer) pair until the lab acknowledges and acts. The action options:

| Action | Effect |
|---|---|
| **Recalibrate and re-QC** | Marks the run as `corrective-action: recalibration`; user is required to enter a new QC run; the new run's outcome unlocks reporting if in-control |
| **New reagent lot** | Marks `corrective-action: reagent-lot-change`; user creates / picks the new lot; system prompts to re-QC |
| **Operator error — re-run** | Marks `operator-error`; new QC run required |
| **Instrument fault — service call** | Marks `instrument-fault`; lock persists until manually overridden by Lab Manager + service-ticket reference captured |
| **Override (override-permission)** | Lab Manager with `qc.override` can override the lock for a documented clinical reason; the override is audit-logged and surfaces on the affected patient reports as a footnote |

The audit log captures every transition. The next QC pass must be in-control for the lock to clear automatically.

---

## QC lot expiry alerts

The system tracks QC lot expiry and fires alerts:

- **14 days before expiry** — in-app alert to Lab Manager
- **7 days before expiry** — SMS + in-app to Lab Manager
- **On expiry day** — high-severity alert; runs against an expired lot are auto-flagged and require a `qc.expired-lot-override` reason

---

## Required permissions

| Capability | Permission |
|---|---|
| Read QC data | `qc.read` |
| Enter QC runs | `qc.enter` |
| Edit a QC run (within 24h of entry) | `qc.run.edit` |
| Discard a QC run (within 24h of entry) | `qc.run.discard` |
| Manage QC levels | `qc.levels.write` |
| Manage QC lots | `qc.lots.write` |
| Configure multi-rule sets | `qc.rules.write` |
| Override reporting lock | `qc.override` |
| Override expired-lot use | `qc.expired-lot-override` |
| Export QC evidence packs | `qc.export` |
| View QC audit log | `qc.audit.read` |

---

## Frequently asked questions

### How many QC runs do I need before in-house mean / SD takes over from the manufacturer's assay values?

LabFlow uses the manufacturer's assayed values until **20 in-house measurements** have accumulated on the same (level + lot + analyzer). After 20, the in-house mean / SD is used for rule evaluation. Tenants can override the cutover threshold per analyte at `/qc/rules`.

### What's the difference between "warning" and "reject" verdicts?

A **warning** (1-2s by convention) doesn't lock reporting; it merely surfaces in the audit log and on the chart. A **reject** locks reporting on the affected analyte + analyzer until corrective action is taken. CLSI EP23 and CLSI EP18 recommend using 1-2s only as a warning that triggers evaluation of stricter rules, never as a standalone rejection rule.

### Can I use rules other than the six base Westgard rules?

Yes — `/qc/rules` lets you define custom rules with arbitrary "N measurements, N SDs, same / either side" parameters. Common extensions: `2-3s` (2 measurements > 3 SD same side), `3-1s` (3 measurements > 1 SD same side), `7-T` (7 consecutive trending in the same direction).

### Does LabFlow support Sigma metrics?

Yes — `/qc/exports` includes a per-analyte Sigma report computed from your TEa (total allowable error) configuration, the analyte's in-house bias, and the in-house CV. Sigma metrics aren't enforced in rule evaluation; they're an evidence artefact for performance reviews.

### How does QC handle multi-instrument labs?

QC is tracked per (analyte + analyzer + level + lot). A laboratory with two Cobas analyzers running the same test runs QC independently on each; LabFlow's rule evaluation respects the instrument boundary so a 10-x trend on Cobas-A doesn't lock reporting on Cobas-B.

### Can I import historical QC data from a previous LIMS?

Yes — `/qc/exports` includes an import wizard that accepts CSV with `analyte, analyzer, level, lotNumber, measured, datetime, operator`. The importer evaluates the rule set retroactively and computes the in-house mean / SD as if the runs had been entered live. Large imports are processed in-app in chunked batches (client-side — there is no background Cloud Function).

### What QC accrediting standard does LabFlow implement?

LabFlow implements the rule mechanics described in **CLSI C24** (statistical quality control for quantitative measurement procedures) and the original Westgard rules paper (Clinical Chemistry, 1981). Accreditation by CAP / CLIA / NABL / ISO 15189 is a deployment-level decision involving your own SOPs, training records, and external proficiency-testing data — LabFlow generates the QC evidence pack, you compile the rest.

---

**Next:** Batch 05 fills in Billing & Insurance + Inventory detail pages — see the [public build plan](https://github.com/aoneahsan/labflow-docs/blob/main/docs/audit/2026-05-10-docs-site-build-plan.md).
