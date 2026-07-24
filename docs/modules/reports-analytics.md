---
sidebar_position: 13
slug: /modules/reports-analytics
title: Reports & Analytics Module
description: Operational KPI dashboards, custom reports, turnaround time, productivity, exception analytics, and CSV/PDF exports built on D3.js in LabFlow.
keywords:
  - LabFlow analytics
  - LIMS dashboards
  - laboratory KPI
  - turnaround time TAT
  - lab productivity
  - lab exception analytics
  - D3 lab charts
---

# Reports & Analytics Module

**Reports & Analytics is LabFlow's read-only window into every other module.** It does not produce new operational data; it aggregates the data the operational modules already wrote and renders it as dashboards, reports, and exports. The module ships a fixed library of laboratory-relevant dashboards (turnaround time, productivity, sample-rejection rate, critical-result rate, no-show rate, revenue mix, ageing receivables, QC out-of-control rate, inventory consumption) plus a custom-report builder for tenants who need to slice the data differently. All charts are rendered with D3.js — the only chart library used in the project — so visualisations are pixel-controllable and exportable as SVG, PNG, or vector PDF.

Reports respect every tenant boundary and every role permission from the source modules: a Lab Manager sees the full TAT distribution, a Phlebotomist sees only their own visit and collection counts.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Cross-cutting (read-only) |
| Required permission to read base reports | `reports.read` |
| Required permission to build custom reports | `reports.custom.write` |
| Firestore collections | (read-only across modules); `saved_reports`, `report_runs`, `report_subscriptions`, `dashboard_widgets`, `reports_audit_logs` |
| Routes | `/reports`, `/reports/dashboards`, `/reports/dashboards/:id`, `/reports/tat`, `/reports/productivity`, `/reports/rejections`, `/reports/critical-results`, `/reports/no-show`, `/reports/revenue`, `/reports/qc`, `/reports/inventory`, `/reports/custom`, `/reports/custom/:id`, `/reports/subscriptions`, `/reports/exports` |
| Linked modules | Every operational module is a data source |

---

## Core concepts

| Term | Meaning |
|---|---|
| **Dashboard** | A composable layout of widgets — KPI tiles, charts, tables — pinned to one workflow theme (e.g. "Operations today"). |
| **Widget** | One visualisation unit. Each widget has a data source, a filter, a chart type, and a refresh cadence. |
| **Saved report** | A custom query produced by the report builder, stored as a Firestore document and rerunnable on demand or on schedule. |
| **Subscription** | A schedule (daily / weekly / monthly) that runs a saved report and emails / in-app delivers the result as CSV or PDF. |
| **Drill-through** | A click-through from a chart point to the underlying records (e.g. clicking the TAT bar at p95 navigates to the list of orders that exceeded that band). |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/reports` | Overview — pinned dashboards, recent reports, alerts | `reports.read` |
| 2 | `/reports/dashboards` | List of all dashboards (system + custom) | `reports.read` |
| 3 | `/reports/dashboards/:id` | One dashboard at full screen | `reports.read` |
| 4 | `/reports/tat` | Turnaround time dashboard | `reports.read` |
| 5 | `/reports/productivity` | Per-user / per-team productivity dashboard | `reports.read` + role-scoped |
| 6 | `/reports/rejections` | Sample-rejection analytics | `reports.read` |
| 7 | `/reports/critical-results` | Critical-result volumes, acknowledgement latency | `reports.read` |
| 8 | `/reports/no-show` | Appointment no-show analytics | `reports.read` |
| 9 | `/reports/revenue` | Revenue, collection rate, payer mix (mirrors [Billing reports](./billing-insurance#reports--analytics)) | `billing.reports.read` |
| 10 | `/reports/qc` | QC out-of-control rate, lot-drift trends | `qc.read` |
| 11 | `/reports/inventory` | Consumption, low-stock incidence, write-off rate | `inventory.read` |
| 12 | `/reports/custom` | Custom report list + builder launcher | `reports.custom.write` |
| 13 | `/reports/custom/:id` | Custom report definition + last run | `reports.custom.write` |
| 14 | `/reports/subscriptions` | Manage scheduled report deliveries | `reports.subscriptions.write` |
| 15 | `/reports/exports` | Recent export history with re-download | `reports.exports.read` |

---

## The system dashboards

The dashboards below ship out-of-the-box. Each is built from widgets that read Firestore aggregations computed **client-side** — Firestore aggregation queries (`getCountFromServer`) for exact counts, cached snapshot documents for heavier rollups, and on-read computation for fast slices. The analytics math is transparent, rule-based statistics that run in the browser (`local-analytics-engine`); there is no cloud AI/ML model.

### Turnaround Time (TAT)

The lab industry's most-watched KPI: time from one milestone to another. LabFlow tracks four TAT segments:

| Segment | Start event | End event |
|---|---|---|
| **Collection-to-receipt** | Sample `collected` | Sample `received` at the lab |
| **Receipt-to-analytical-complete** | Sample `received` | Result `draft` written |
| **Analytical-to-released** | Result `draft` | Result `released` |
| **Order-to-released (end-to-end)** | Order `submitted` | Result `released` |

Each segment is plotted as a distribution (p50, p75, p90, p95, p99) and a trend line over the selected date range. Filters: site, test category, priority, payer type. Drill-through opens the order list filtered to the selected band.

### Productivity

Per-user (and per-team) volume metrics. Each role's productivity tile is role-aware: a phlebotomist sees draws / hour and on-time-arrival rate; a technologist sees results-entered / hour and amendment rate; a billing clerk sees invoices-issued / day and collections-processed / day. The dashboard scopes by default to the user's own row; staff with `reports.read.all` see the full team.

### Sample-rejection analytics

Rejection-rate dashboard tied to [Sample Tracking](./sample-tracking). Charts: rejection rate over time, top rejection reasons, rejection rate by collection site, rejection rate by phlebotomist (only visible to staff with `reports.read.all`). Drill-through opens the rejected-sample list filtered to the clicked dimension.

### Critical-result analytics

Volumes and latency for critical-flagged results: count by analyte, acknowledgement latency distribution (time from `released` to clinician acknowledgement), and a "unacknowledged > N hours" alert list. The acknowledgement latency is a regulatory-relevant signal; CAP / CLIA accreditation visits ask for it.

### No-show analytics

Mirrors the rule logic in [Appointments](./appointments#no-show-tracking): no-show rate over time, no-show rate by site / phlebotomist / time-of-day, repeat-no-show patient list, deposit-collection effectiveness (no-show rate before vs after deposit requirement kicks in for repeat offenders).

### Revenue

Mirrors the billing reports — see [Billing & Insurance reports](./billing-insurance#reports--analytics). Visible here for staff with the `billing.reports.read` permission as a convenience surface.

### QC out-of-control

QC rejection rate over time per analyte. Drill-through to the affected QC runs. Lot-drift trend: charts in-house mean / SD evolution per lot, flagging lots whose drift exceeds the tenant's threshold.

### Inventory analytics

Consumption per item over time, low-stock-alert frequency, write-off rate, vendor on-time-delivery rate. The vendor delivery dashboard surfaces underperforming suppliers and drives procurement renegotiation conversations.

---

## Custom report builder — every option

The custom builder at `/reports/custom` produces saved reports without code. Each report is built from these sections:

### 1. Data source

| Field | Type | Required | Notes |
|---|---|---|---|
| Primary collection | enum | required | `orders` / `samples` / `results` / `invoices` / `payments` / `appointments` / `home_visits` / `qc_runs` / `stock_lots` / `consumption_events` |
| Date dimension | enum | required | The timestamp field used to filter by date — e.g. `orders.submittedAt`, `results.releasedAt`. Each primary collection exposes its allowed date dimensions. |
| Date range | enum + custom | required | `today` / `yesterday` / `last-7-days` / `last-30-days` / `this-month` / `last-month` / `this-quarter` / `this-year` / `custom` |
| Custom from / to | date | conditional | Used when range = `custom` |

### 2. Filters

Filters are AND-combined. Each filter row picks one of the primary collection's filterable fields (declared in the system's report schema), an operator (`=`, `!=`, `in`, `not in`, `>`, `<`, `>=`, `<=`, `contains`, `is set`, `is not set`), and a value or value list. The set of filterable fields per collection is fixed at the schema level so that every filter can be backed by a Firestore composite index.

### 3. Group by

| Field | Type | Required | Notes |
|---|---|---|---|
| Grouping field(s) | multi-select | optional | Up to 2 dimensions for chart grouping; up to 4 for a table breakdown |
| Time bucket | enum | optional | If a date field is in `group by`, pick `day` / `week` / `month` / `quarter` |

### 4. Measure

| Field | Type | Required | Notes |
|---|---|---|---|
| Metric | enum | required | `count`, `sum`, `avg`, `min`, `max`, `median`, `p75`, `p90`, `p95`, `p99`, `distinct count` |
| Metric field | enum | required-for-non-count | Field on the primary collection; numeric for sum/avg/min/max/percentiles |
| Secondary metric | enum | optional | Up to 2 metrics on the same report (e.g. count + avg) |

### 5. Visualisation

| Field | Type | Required | Notes |
|---|---|---|---|
| Chart type | enum | required | `kpi-tile` / `line` / `bar` / `stacked-bar` / `column` / `area` / `pie` / `donut` / `histogram` / `box-plot` / `scatter` / `heatmap` / `table` |
| Sort | enum | required | `metric-desc` / `metric-asc` / `dimension-asc` / `dimension-desc` |
| Top N | integer | optional | Limit rows shown; the rest aggregate into "Other" if `groupOther: true` |
| Show empty buckets | boolean | required | default `false`; relevant for time-bucket charts |

### 6. Output

| Field | Type | Required | Notes |
|---|---|---|---|
| Save as | text | required | 1–80 chars |
| Description | textarea | optional | 0–500 chars |
| Share scope | enum | required | `private` / `team` / `tenant-wide` |
| Allowed roles to view | multi-select | required-if-scope-not-private | Picked from the tenant's role registry |

A saved report can be re-run from `/reports/custom/:id` or embedded as a widget in a dashboard. Each run writes a `report_runs` doc with the executing user, the resolved date range, the row count, the execution time, and a FilesHub link to the cached PDF / CSV (cached for 7 days; older runs re-run on demand).

---

## Subscriptions (scheduled delivery)

A subscription wraps a saved report with a cadence and recipients.

| Field | Type | Required | Notes |
|---|---|---|---|
| Saved report | search-select | required | Any report the user has view access to |
| Cadence | enum | required | `daily` / `weekly` / `monthly` |
| Day / time | time + day-of-week / day-of-month | required-by-cadence | E.g. weekly Mon 07:00, monthly 1st 06:00 |
| Time zone | enum | required | Defaults to tenant timezone |
| Format | enum | required | `pdf` / `csv` / `xlsx` |
| Channels | multi-select | required-min-1 | `email` / `in-app` / `webhook` (webhook is a tenant-configured URL for ERP / BI integration) |
| Recipients | multi-select | required-min-1 | Users or roles in the tenant |
| Active | boolean | required | default `true` |

Scheduled, unattended report subscriptions need a server to run on a cron, so **fully-automated scheduled delivery is a roadmap capability** (LabFlow is 100% client + Firestore, with no server cron). Today a report is generated and delivered on demand, or when a scheduled subscription's due row is picked up while the app is active; a failed run logs an incident on `report_runs` with the failure reason and is retried on the next pass.

---

## Drill-through

Every chart supports drill-through: clicking a bar, line point, or pie wedge navigates to the underlying record list filtered to that dimension. Examples:

| Click | Lands on |
|---|---|
| TAT p95 bar for `Chemistry` | Order list filtered to `category=chemistry, tat ≥ p95-band` |
| Rejection-reason wedge for `haemolysis` | Sample list filtered to `rejectionReason=haemolysis` in the date range |
| Productivity bar for `Phlebotomist A` | Phlebotomist's collection list in the date range |
| QC out-of-control bar for `TSH` | QC runs filtered to `analyte=TSH, inControl=false` |

The destination list respects the user's row-level permissions — a drill-through from an aggregate the user can see may land on a list with fewer rows than the aggregate count, because the user can see the metric but not every contributing record. The list view surfaces "N records filtered by your permissions" to avoid confusion.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read system dashboards | `reports.read` |
| Read all rows in shared dashboards (not just own) | `reports.read.all` |
| Build / save custom reports | `reports.custom.write` |
| Edit team-shared custom reports | `reports.custom.share-team` |
| Edit tenant-wide custom reports | `reports.custom.share-tenant` |
| Manage subscriptions | `reports.subscriptions.write` |
| Export reports | `reports.exports.read` |
| Read the reports audit log | `reports.audit.read` |

Domain-specific dashboards inherit their source-module permission — e.g. the revenue dashboard at `/reports/revenue` requires `billing.reports.read`, the QC dashboard requires `qc.read`.

---

## Frequently asked questions

### Are reports real-time or batched?

Both. Operational dashboards (today's queue, the live map) refresh from Firestore snapshots in real time. Historical aggregates (TAT distributions, rejection-rate trends, lot-drift charts) are computed client-side and cached in snapshot documents for performance, then re-computed in-app when the source collection changes. The custom report builder runs on read against those materialised aggregation snapshots so 30-day reports return quickly at typical tenant scale (~500k orders / year).

### Why D3.js for every chart?

The lab industry has chart conventions that aren't standard in general-purpose chart libraries: ±SD bands on Levey-Jennings, percentile tick marks on TAT distributions, custom symbols for Westgard-rule violations on QC charts. D3 gives full control to render those without library-specific workarounds, and it produces clean SVG that exports identically to PNG and vector PDF. The project's chart policy is captured in [Build, Test & Code Quality standards](https://github.com/aoneahsan/labflow-docs/blob/main/docs/architecture/overview.md) (private LabFlow main repo) — Recharts, Chart.js, ApexCharts, Highcharts, Victory, and Nivo are explicitly not used.

### Can I export to Power BI / Tableau / Looker?

Yes through CSV / Excel export, or through the subscription webhook channel — a saved report can deliver its JSON payload to a tenant-configured URL on each scheduled run, which is a common pattern for piping into a BI warehouse. LabFlow does not ship a direct connector to any BI tool because the connector lifecycle (auth refresh, schema migrations) belongs in the BI tool's vendor surface, not LabFlow's.

### How do permissions affect what I see in a dashboard?

Every report read query is rewritten on the server to respect the user's role scope: a phlebotomist's productivity dashboard auto-filters to `phlebotomistId == self.uid` regardless of the requested filter; a billing clerk querying the revenue dashboard auto-scopes to their tenant. Permission rewriting happens in Firestore security rules and in the report builder's resolved query, so a determined user cannot bypass it from the client.

### What's the difference between a dashboard and a custom report?

A **dashboard** is a composition of widgets that loads as one screen. A **custom report** is one query that may also be embedded as a widget on a dashboard. The relationship is many-to-many — one custom report can appear on multiple dashboards. Custom reports own their query definition; dashboards own the layout and which queries appear where.

### Are there pre-built CAP / CLIA / NABL / ISO 15189 accreditation packs?

Yes — `/reports/exports` includes one-click "accreditation pack" exports that bundle the documents an accreditation visit asks for (per-test TAT, per-analyte QC summary, sample-rejection trend, critical-result acknowledgement log, audit-log excerpts for the period). The pack is generated as a single zipped PDF with cover sheet + indexed sections. The pack is not a substitute for your own SOP and training documentation, which the visit will also request.

### Can two tenants share a custom report definition?

No. A report definition is tenant-scoped and references collections within that tenant. Cross-tenant aggregation is intentionally not supported — even a Super Admin sees per-tenant slices side-by-side rather than a merged view, because patient-level data must not cross tenant boundaries.

### Why is there no SQL window into the Firestore data?

LabFlow's data store is Firestore, not a relational database. Reports run on Firestore queries plus pre-computed aggregates. A SQL surface would require a continuous export to BigQuery or similar — that is a deployment-level extension a tenant can wire up via Firestore's `BigQuery Export` connector if they need raw SQL access, but it is not part of the LabFlow product surface.

---

**Next:** Batch 07 covers User Management, Settings, and Admin Panel — see the [public build plan](https://github.com/aoneahsan/labflow-docs/blob/main/docs/audit/2026-05-10-docs-site-build-plan.md).
