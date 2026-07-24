---
sidebar_position: 16
slug: /modules/admin-panel
title: Admin Panel Module
description: System health, tenant lifecycle, cross-tenant operations, integration toggles, audit access, and emergency controls reserved for LabFlow Super Admins and Lab Directors.
keywords:
  - LabFlow admin panel
  - LIMS system health
  - multi-tenant management
  - tenant lifecycle
  - lab emergency controls
  - audit log access
  - super admin
---

# Admin Panel Module

**The Admin Panel is the smallest module in LabFlow on purpose.** It surfaces operations that should be rare, sensitive, or cross-tenant: system-health and uptime dashboards, tenant lifecycle (create, suspend, archive, restore), cross-tenant search for the platform operator, integration-key rotation, emergency feature kill-switches, the full audit-log read surface, and the platform-level read of [Quality Control](./quality-control) override events across every tenant. Every action here writes to an immutable `admin_audit_logs` row, with the actor's user ID, tenant context, action type, before / after values, IP, session ID, and a free-text reason that is **required** on every state-changing action.

The panel splits cleanly into two scopes: **tenant-scoped** (visible to a tenant's Lab Director and Super Admin) and **platform-scoped** (visible only to LabFlow operators with the Super Admin role at the platform level). The split is enforced at the route level — a Lab Director navigating to a platform-scoped URL receives a 403 without leaking which route exists.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Operations / Cross-cutting |
| Tenant-scoped permission to view | `admin.tenant.read` |
| Platform-scoped permission to view | `admin.platform.read` |
| Firestore collections | `admin_audit_logs`, `tenant_lifecycle`, `platform_feature_flags`, `system_health_snapshots`, `emergency_overrides` |
| Routes | `/admin`, `/admin/health`, `/admin/audit`, `/admin/emergency`, `/admin/tenants` (platform), `/admin/tenants/:id` (platform), `/admin/platform/feature-flags` (platform), `/admin/platform/integrations` (platform), `/admin/platform/audit` (platform) |
| Linked modules | [User Management](./user-management), [Settings](./settings), every operational module via the audit read surface |

---

## Core concepts

| Term | Meaning |
|---|---|
| **Tenant scope** | The set of admin actions visible to a tenant's Lab Director — read tenant health, read tenant audit, view (not edit) tenant integrations, view feature-flag state. |
| **Platform scope** | The set of admin actions visible only to LabFlow operators — create / suspend / archive tenants, rotate platform-shared keys, toggle platform feature flags, read cross-tenant audit. |
| **Emergency override** | A time-bound flag (default expiry: 1 hour, max 24 hours) that bypasses a specific business rule. Every override is logged with a reason and surfaces as a banner across the affected tenants. |
| **System-health snapshot** | A periodic recording (every 5 minutes) of service-level signals: Firestore read / write counts, client error rate (from Sentry), FilesHub upload error rate, notification queue depths, sign-in failure rate. |
| **Tenant lifecycle event** | A row in `tenant_lifecycle` recording state changes: created, configured, active, suspended, archived, restored. |

---

## Screens

| # | Route | Scope | Purpose | Permission |
|---|---|---|---|---|
| 1 | `/admin` | both | Landing — recent admin events, current emergency overrides, your scope summary | `admin.tenant.read` or `admin.platform.read` |
| 2 | `/admin/health` | tenant | Tenant-level health — recent error rate, MFA failures, integration failures, queue depths | `admin.tenant.read` |
| 3 | `/admin/audit` | tenant | Tenant-wide audit aggregator across [User Management](./user-management), [Settings](./settings), [Results](./results-management), [QC](./quality-control), [Billing](./billing-insurance), [Inventory](./inventory) | `admin.tenant.audit.read` |
| 4 | `/admin/emergency` | tenant | Emergency overrides for the tenant — list, create, expire | `admin.emergency` |
| 5 | `/admin/tenants` | platform | All tenants — search, status, sign-in-as | `admin.platform.read` |
| 6 | `/admin/tenants/:id` | platform | One tenant detail — health, members, lifecycle history, suspend / archive controls | `admin.platform.read` |
| 7 | `/admin/platform/feature-flags` | platform | Toggle platform feature flags per tenant or globally | `admin.platform.feature-flags` |
| 8 | `/admin/platform/integrations` | platform | Rotate platform-shared keys (e.g. the Cloudflare Worker secret prefix) | `admin.platform.integrations` |
| 9 | `/admin/platform/audit` | platform | Cross-tenant audit feed | `admin.platform.audit.read` |

---

## Tenant-health dashboard

The tenant-scoped `/admin/health` shows live operational signals derived from `system_health_snapshots` plus real-time Firestore aggregations. The default view covers the last 24 hours; the time range is configurable.

| Signal | What it means | Threshold |
|---|---|---|
| Firestore read rate | Reads per minute across all collections in the tenant | Soft alert at > 2× rolling 7-day median |
| Firestore write rate | Writes per minute | Same threshold pattern |
| Client error rate | % of sessions reporting an error to Sentry | Alert > 1% over a 15-minute window |
| FilesHub upload error rate | % of uploads failing | Alert > 2% over a 15-minute window |
| MFA failure rate | Failed MFA challenges over total | Alert > 5% over a 15-minute window — often signals a misconfigured TOTP after a clock-drift event |
| Notification delivery rate | % of `sent` events that produced provider success | Alert < 95% |
| Queue depth — HL7 ingestion | Unprocessed HL7 messages | Alert if > 100 |
| Queue depth — claim submission | Pending EDI claims | Alert if > 50 |
| Active sessions | Open sessions in the tenant | Informational, no threshold |
| Storage usage (FilesHub) | Total tenant storage | Informational |

Each tile drill-throughs to the underlying log or audit table. The dashboard is read-only from the Admin Panel; alert configuration lives in [Settings](./settings).

---

## Tenant audit aggregator

The `/admin/audit` screen is a tenant-scoped, cross-module view onto every audit log: user changes, settings changes, result approvals + addenda, QC overrides, billing write-offs and refunds, inventory write-offs and overrides, appointment no-show appeals, home-collection accession overrides. Each row carries: timestamp, actor, action type, target (with a deep link to the underlying record), before / after summary, source IP, session ID, and the optional reason.

Filters: date range, actor, action type, target collection, target ID. Free-text search runs against the reason field.

Exports: CSV, PDF (accreditation-formatted). PDF exports include a cover page with tenant name, date range, total row count, exporter, and a signature block.

---

## Emergency overrides

An emergency override is a tenant-scoped, time-bound, audit-logged escape hatch from a business rule that would otherwise block work. The supported overrides:

| Override | Effect | Default expiry | Max expiry |
|---|---|---|---|
| `qc.unlock-reporting` | Releases the QC reporting lock for one analyte × analyzer pair | 1 hour | 6 hours |
| `expired-lot-allow` | Permits consumption of an expired reagent / control lot until expiry | 1 hour | 24 hours |
| `mfa-bypass` | Disables MFA for one named user for one named device | 30 minutes | 4 hours |
| `notification-pause` | Pauses all outbound notifications (used during planned downtime) | 30 minutes | 8 hours |
| `claim-submission-pause` | Pauses EDI submissions to a payer (used when the clearing-house is down) | 1 hour | 24 hours |
| `feature-flag-emergency-off` | Force-disables a feature flag tenant-wide | 1 hour | 24 hours |
| `home-collection-accession-bypass` | Permits accession past stability budget for one named cool-box | 30 minutes | 2 hours |

Every override requires a reason ≥ 20 characters at creation. The override is shown as a banner at the top of every page across the tenant for the duration ("Emergency override active: QC reporting unlock for TSH on Cobas-A. Set by Lab Director X. Expires at HH:mm UTC."). Expiry is enforced at read time — the app treats an override whose `expiresAt` has passed as inactive, so it stops applying the moment it lapses; manual expiry is one click.

The full timeline of overrides is permanently kept and surfaces in the accreditation-pack PDF — auditors actively look for the override pattern as a leading indicator of process drift.

---

## Platform-scope: tenants

`/admin/tenants` is the platform operator's surface. The list shows every tenant with: name, short name, lifecycle state, plan tier, primary contact, last-active timestamp, member count, monthly Firestore read / write volumes. Filters: state, plan, member-count band, region. Search hits name and short name.

### Tenant lifecycle states

| State | Meaning | Transitions out |
|---|---|---|
| `created` | Provisioned but not configured | → `configured` (when the tenant completes onboarding) |
| `configured` | Settings entered; first admin user accepted invite | → `active` (on first paying order) |
| `active` | In use | → `suspended` / `archived` |
| `suspended` | Read-only for tenant users; no new writes accepted | → `active` / `archived` |
| `archived` | Closed; data retained for the legal retention period | → `restored` (admin reactivation within retention window) / `deleted` (after retention window) |
| `deleted` | Hard-removed; data unrecoverable | (terminal) |

Each transition writes a row to `tenant_lifecycle` with reason, actor, timestamp, and any side effects (e.g. "suspended-billing-noncompliance — 3 invoices > 90 days outstanding").

### Sign-in-as

The platform Super Admin can "sign in as" a tenant member for support. The signed-in session is clearly badged in the navbar ("You are signed in as USER X in tenant Y on behalf of LabFlow Support"), is read-only by default unless the support agent has `admin.platform.sign-in-as.write`, has a hard expiry of 4 hours, and writes every action to `admin_audit_logs` with both the support agent's identity and the target user's identity captured. This pattern is the only authorised way for a LabFlow operator to act inside a tenant.

---

## Platform-scope: feature flags

`/admin/platform/feature-flags` is the platform's flag console. Two tiers:

| Tier | Granularity | Surface |
|---|---|---|
| **Platform flag** | All tenants | `home_collection_route_optimiser_v2`, `hl7_v3_ingest`, `fhir_subscription_engine`, `result_addendum_v2`, `revenue_dashboard_v3` |
| **Tenant flag** | One named tenant | The same flags above, scoped to one tenant — used for staged rollouts |

Flags can be `enabled`, `disabled`, or `experiment` (a percentage of the tenant's users). Each toggle writes an `admin_audit_logs` row. The tenant-scope flag panel at `/settings/feature-flags` shows the resolved state from this surface (read-only for tenants).

---

## Platform-scope: integrations

`/admin/platform/integrations` rotates platform-shared secrets that span tenants. These include the Cloudflare Workers secret prefix (every project shares one CF account; each project gets a `{PROJECT_PREFIX}_` namespace per LabFlow's services-integrations standard), the shared HL7 ingester gateway URL, and the FilesHub master API key fallback (each tenant has its own; the platform key is a break-glass fallback). Rotation produces a versioned `admin_audit_logs` row and triggers a re-issue of any dependent tenant-scoped credential where applicable.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read tenant health + audit (Lab Director) | `admin.tenant.read`, `admin.tenant.audit.read` |
| Create / expire emergency overrides | `admin.emergency` |
| Read platform list of tenants | `admin.platform.read` |
| Suspend a tenant | `admin.platform.suspend` |
| Archive a tenant | `admin.platform.archive` |
| Restore an archived tenant within retention | `admin.platform.restore` |
| Sign-in-as a tenant user (read-only) | `admin.platform.sign-in-as` |
| Sign-in-as with write | `admin.platform.sign-in-as.write` |
| Toggle platform / tenant feature flags | `admin.platform.feature-flags` |
| Rotate platform integration secrets | `admin.platform.integrations` |
| Read cross-tenant audit | `admin.platform.audit.read` |

---

## Frequently asked questions

### What's the difference between Lab Director's view of `/admin` and the platform Super Admin's view?

A Lab Director sees only their tenant. They can read tenant health, read the tenant audit, view (not edit) tenant integrations, view the tenant's feature-flag state, and create emergency overrides scoped to the tenant. They cannot see other tenants, cannot rotate platform-shared keys, and cannot sign in as a user. A platform Super Admin sees all of that plus the platform-scoped routes — tenant lifecycle, cross-tenant audit, sign-in-as, platform feature-flag console, platform integration rotation. The split is enforced at the route guard so a Lab Director navigating to a platform-scoped URL gets a 403.

### Does the Admin Panel let me edit data directly?

Almost never. The Admin Panel is operational — it reads the state every other module wrote, and it controls process-level switches (tenant lifecycle, feature flags, emergency overrides). Editing a result, a sample, a patient, or a billing record is always done in the owning module so the module's audit log captures the change correctly. The one exception is the emergency-override surface, which is itself the edit — a deliberate, time-bound, banner-broadcasted, audit-required edit.

### Why is every action behind a reason field?

Because every action here is sensitive. The pattern is: the system asks "why?", the actor types ≥ 20 characters, the system applies the change and writes both the action and the reason to the audit log. The reason field is what makes the audit log useful during an accreditation review or an incident post-mortem — without it, the log answers "what happened?" but not "why it was authorised". Forcing the field at the point of action is the only reliable way to capture intent.

### What happens to an emergency override at expiry?

Expiry is enforced client-side at read time: any surface that reads an override treats it as `expired` once `now >= expiresAt`, so the banner disappears across the tenant and the underlying business rule re-engages without a server job. (The next admin action on the override also stamps it `expired` in Firestore for a clean audit trail.) If the override was a QC reporting unlock and a new in-control QC run hasn't been entered yet, reporting locks back on — the override is not a permanent fix and the audit row makes that explicit.

### How long is audit data kept?

Audit log retention defaults to **7 years** to match the most common laboratory-accreditation and HIPAA expectation. The retention period is a tenant-configurable setting (minimum 2 years, maximum 25 years) — shorter retention saves Firestore storage but is non-compliant in many jurisdictions, so the system warns when retention is set below 7 years. Archived tenants keep their audit log for the retention window before hard delete.

### Can the platform Super Admin read patient data inside a tenant?

No. The platform-scoped admin permissions explicitly do not include patient-data read. Even `sign-in-as` is read-only by default; the writeable variant exists only for support cases authorised by the tenant in writing, every action is logged with both identities, and the session has a hard 4-hour expiry. Patient data lives behind the tenant's role permissions and is not viewable through cross-tenant tooling.

### How are platform-shared keys (Cloudflare Workers, FilesHub master) rotated without downtime?

Every platform-shared key uses an overlap window: the new key is set, the system runs against both keys for a tenant-configurable overlap (default 24 hours), then the old key is revoked. During the overlap, dependent services accept either key. The overlap window is logged as an `admin_audit_logs` row at start and end. Real-world rotations have not produced downtime in production deployments using this pattern.

### Is there a way to dry-run a tenant suspension before committing?

Yes — `/admin/tenants/:id` shows a "Simulate suspension" panel that lists every operation that would be blocked under suspension (no new orders, no result releases, no billing actions) and the count of in-flight operations that would be cancelled (open EDI claims, pending notifications). The simulation does not write any data. Suspending the tenant for real requires a confirmation modal with the same data plus a typed-confirmation of the tenant name and a reason ≥ 40 characters.

---

**Next:** Batch 08 fills in EMR Integration (HL7 / FHIR) + Workflow Automation + Communication Hub detail pages — see the [public build plan](https://github.com/aoneahsan/labflow-docs/blob/main/docs/audit/2026-05-10-docs-site-build-plan.md).
