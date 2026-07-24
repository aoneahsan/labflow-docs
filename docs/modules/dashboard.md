---
sidebar_position: 3
slug: /modules/dashboard
title: Dashboard Module
description: LabFlow's dashboard is the role-aware landing screen — KPI cards, pending-work queues, critical-result alerts, turnaround-time, revenue, and sample-status widgets, each gated by the signed-in user's permissions and scoped to the current tenant.
keywords:
  - LabFlow dashboard
  - LIMS dashboard
  - laboratory KPI dashboard
  - turnaround time TAT
  - critical result alerts
  - lab operations overview
---

# Dashboard Module

**The dashboard is the role-aware landing screen every LabFlow user sees after sign-in — a single view of the work that needs attention and the metrics that describe the laboratory's health.** It reads across the operational modules (orders, samples, results, billing, inventory, QC) and renders only the widgets the signed-in user has permission to see, scoped to the current tenant. It writes nothing of its own; every number is a live read from the modules that own the data.

If you want the catalogue of every module behind these widgets, start at the [Modules Catalogue](/docs/modules). If you want deeper, configurable reporting rather than the at-a-glance landing view, see [Reports & Analytics](/docs/modules/reports-analytics).

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Cross-cutting (read-only across every module) |
| Required permission to access | None beyond a signed-in, tenant-bound identity — but each widget honours the permission of the module it reads |
| Firestore collections | None owned — reads `orders`, `samples`, `results`, `invoices`, `qc_runs`, `stock_items`, `audit_logs` |
| Routes | `/` (when signed in), `/dashboard` |
| Implementing surfaces | Web, mobile (Capacitor) |

---

## Widgets

The dashboard composes its layout from a fixed set of widgets. A widget renders only when the user holds the permission for the module it summarises; otherwise it is omitted (not greyed out), so the layout reflows to the user's role.

| Widget | What it shows | Permission gate |
|---|---|---|
| **KPI cards** | Mean turnaround time, results released, critical results flagged, sample rejection rate over a rolling window | `reports.kpi.view` |
| **Pending work** | Counts of orders awaiting collection, samples awaiting accession, results awaiting review / approval / release | inherits from `orders`, `samples`, `results` view permissions |
| **Critical-result alerts** | Released or pending critical values that still need acknowledgement, newest first | `results.critical.view` |
| **Turnaround time (TAT)** | Order-to-report TAT segmented by stage, with p50 / p75 / p90 markers | `reports.tat.view` |
| **Revenue** | Billed, collected, and outstanding for the period | `billing.revenue.view` |
| **Sample status** | Live distribution across the sample lifecycle (collected → in-transit → received → processing → completed) | `samples.view` |
| **Inventory alerts** | Low-stock and near-expiry reagent lots | `inventory.alerts.view` |
| **QC at a glance** | Open out-of-control QC runs awaiting corrective action | `qc.view` |

The KPI cards read the same snapshot used elsewhere in the app (`useLabKpiSnapshot`): `meanTatHours`, `resultsReleased`, `criticalResultsFlagged`, and `resultsRejected` over the selected window. The [Peer Benchmarking](/docs/modules/reports-analytics) page compares those exact numbers against a peer cohort you supply.

---

## Options

| Option | Choices | Default |
|---|---|---|
| **Time window** | Today, 7 days, 30 days, 90 days, custom range | 30 days |
| **Persona view** | The dashboard auto-selects a widget set per role (e.g. a Phlebotomist sees pending collections and routes; a Billing user sees revenue and outstanding claims) | Derived from the user's roles |
| **Refresh** | Live (TanStack Query background refetch) or manual refresh | Live |
| **Drill-through** | Every card links into the owning module's filtered list (e.g. "12 awaiting review" → results list filtered to `status=reviewed`) | Enabled where the user has the destination permission |

---

## Permissions

The dashboard has no permissions of its own. A widget appears only when the user holds the read permission of the module it summarises, and a drill-through link is rendered only when the user also holds the permission for the destination screen. Numbers are always tenant-scoped: a user who belongs to two tenants sees the dashboard for the tenant currently selected in the [tenant chooser](/docs/modules/authentication), never an aggregate across tenants.

---

## FAQ

### Why is a widget missing from my dashboard?

Because you don't hold the permission for the module it reads. Widgets are omitted, not disabled — so a Front Desk user and a Lab Director see structurally different dashboards. Ask an administrator to adjust your role in [User Management](/docs/modules/user-management).

### Are the KPI numbers real-time?

They refresh in the background through TanStack Query while the dashboard is open, and on a manual refresh. They reflect committed Firestore data for the current tenant within the selected time window; they are not a streaming live feed.

### Can I customise which widgets appear?

The default layout is derived from your role so the landing view is immediately useful. For bespoke metrics, saved views, scheduled delivery, and 13 chart types, use [Reports & Analytics](/docs/modules/reports-analytics) — the dashboard is intentionally the fixed, fast overview.

### Does the dashboard expose patient identifiers?

No. Cards show counts and aggregate metrics. Drilling through opens the owning module's list, which applies that module's own row-level permissions and PHI handling — the dashboard never bypasses them.

### What does the critical-result alert count mean?

It is the number of critical values that still require acknowledgement. Acknowledgement happens in [Results Management](/docs/modules/results-management) before a critical result is released; the dashboard surfaces the backlog so nothing is missed.

---

**Next:** [Patient Management →](./patient-management)
