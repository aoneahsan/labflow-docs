---
sidebar_position: 18
slug: /modules/workflow-automation
title: Workflow Automation Module
description: No-code rule engine for LabFlow — triggers, conditions, actions across orders, samples, results, QC, inventory, billing, and appointments.
keywords:
  - LabFlow workflow automation
  - LIMS rule engine
  - laboratory no-code automation
  - lab reflex rules
  - lab event triggers
  - lab notification automation
  - workflow conditions actions
---

# Workflow Automation Module

**Workflow Automation is LabFlow's no-code rule engine.** A rule is a `trigger → conditions → actions` statement that runs server-side whenever the trigger fires. Triggers are the discrete events the operational modules emit — an order is submitted, a sample is rejected, a result is released, a QC run goes out-of-control, a stock lot crosses 7 days from expiry, an invoice ages past 30 days. Conditions filter those events to the ones the rule cares about. Actions take effect on the operational modules — assign an order to a phlebotomist, post a Slack message, mark a sample for re-collection, email a clinician, charge a deposit, generate a Communication Hub send, fire a webhook, or wait N hours before re-evaluating.

The engine is intentionally narrow: no Turing-complete loops, no arbitrary code, no external HTTP calls except through approved Communication Hub or webhook actions. The narrow shape keeps the audit log readable, keeps tenants out of the "I broke production with a rule" failure mode, and makes the rule editor a real no-code surface a Lab Manager can use without an engineer.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Cross-cutting / Operations |
| Required permission to read rules | `workflows.read` |
| Required permission to author rules | `workflows.write` |
| Required permission to activate / deactivate a rule | `workflows.activate` |
| Firestore collections | `workflow_rules`, `workflow_versions`, `workflow_runs`, `workflow_run_steps`, `workflow_audit_logs` |
| Routes | `/workflows`, `/workflows/rules`, `/workflows/rules/new`, `/workflows/rules/:id`, `/workflows/rules/:id/history`, `/workflows/runs`, `/workflows/runs/:id`, `/workflows/triggers`, `/workflows/templates`, `/workflows/audit` |
| Linked modules | Every operational module is both a trigger source and an action target |

---

## Core concepts

| Term | Meaning |
|---|---|
| **Rule** | A named, versioned `trigger → conditions → actions` statement, owned by one tenant. |
| **Trigger** | A discrete event emitted by an operational module (e.g. `order.submitted`). |
| **Condition** | A boolean predicate evaluated against the trigger's event payload + supporting context. |
| **Action** | A side-effect — write to the same or another collection, fire a notification, call a webhook, schedule a future re-evaluation. |
| **Run** | One end-to-end evaluation of a rule against one event. Persisted in `workflow_runs` with step-by-step `workflow_run_steps`. |
| **Version** | A snapshot of the rule at save time. Past versions are addressable and the rule can be reverted to any prior version. |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/workflows` | Overview — active rules, last-24h run counts, failure counters | `workflows.read` |
| 2 | `/workflows/rules` | Filterable rule list | `workflows.read` |
| 3 | `/workflows/rules/new` | Author a new rule | `workflows.write` |
| 4 | `/workflows/rules/:id` | Rule detail — trigger, conditions, actions, recent runs | `workflows.read` |
| 5 | `/workflows/rules/:id/history` | Version history with diff + restore | `workflows.write` |
| 6 | `/workflows/runs` | Filterable run log (rule, status, date) | `workflows.read` |
| 7 | `/workflows/runs/:id` | Run detail — event payload, condition trace, action results | `workflows.read` |
| 8 | `/workflows/triggers` | Read-only catalogue of every trigger with its payload schema | `workflows.read` |
| 9 | `/workflows/templates` | Ready-to-clone rule templates (reflex rules, no-show deposit, etc.) | `workflows.read` |
| 10 | `/workflows/audit` | Full audit log of workflow authoring | `workflows.audit.read` |

---

## The trigger catalogue

The engine subscribes to a fixed list of operational events. Triggers grouped by source module:

| Source | Triggers |
|---|---|
| **Orders** | `order.created`, `order.submitted`, `order.amended`, `order.cancelled`, `order.completed` |
| **Samples** | `sample.collected`, `sample.received`, `sample.in-transit`, `sample.processing`, `sample.completed`, `sample.rejected`, `sample.lost`, `sample.recollected` |
| **Results** | `result.draft-created`, `result.reviewed`, `result.approved`, `result.released`, `result.amended`, `result.critical-flagged`, `result.critical-acknowledged` |
| **QC** | `qc.run-entered`, `qc.in-control`, `qc.out-of-control`, `qc.corrective-action`, `qc.lot-expiring`, `qc.lot-expired` |
| **Inventory** | `stock.received`, `stock.low-stock`, `stock.critical-low`, `stock.out-of-stock`, `stock.lot-expiring`, `stock.lot-expired`, `stock.write-off` |
| **Billing** | `invoice.issued`, `payment.received`, `claim.submitted`, `claim.adjudicated`, `claim.denied`, `invoice.aged-30`, `invoice.aged-60`, `invoice.aged-90`, `refund.issued`, `writeoff.applied` |
| **Appointments** | `appointment.booked`, `appointment.confirmed`, `appointment.checked-in`, `appointment.completed`, `appointment.no-show`, `appointment.cancelled` |
| **Home Collection** | `home-visit.assigned`, `home-visit.en-route`, `home-visit.arrived`, `home-visit.collected`, `home-visit.completed`, `home-visit.late` |
| **Users** | `user.invited`, `user.activated`, `user.deactivated`, `user.mfa-reset`, `user.role-changed` |
| **Time** | `time.daily` (configurable wall-clock), `time.hourly`, `time.weekly` |

Each trigger has a documented payload schema visible at `/workflows/triggers`. A rule subscribes to exactly one trigger; an effect that needs multiple triggers is modelled as multiple rules.

---

## Condition language

Conditions are an AND-OR-NOT tree of comparisons against the event payload + a small supporting context (the tenant's site list, the catalog, the role registry, the current wall-clock time). The supported operators:

| Operator | Applies to | Example |
|---|---|---|
| `=`, `!=` | scalar, enum | `payload.priority = 'stat'` |
| `>`, `>=`, `<`, `<=` | number, date | `payload.amount > 500` |
| `in`, `not in` | scalar against list | `payload.testCode in ['TSH', 'FT4', 'FT3']` |
| `contains`, `not contains` | text | `payload.specialInstructions contains 'fasting'` |
| `is set`, `is not set` | any | `payload.insurer is set` |
| `matches regex` | text | `payload.barcode matches '^LF[0-9]{8}$'` |
| `between` | number, date | `payload.age between 0 and 17` |
| `older than` | date | `payload.invoicedAt older than 30 days` |

Boolean composition uses `AND`, `OR`, `NOT` with explicit grouping. The visual editor renders the tree as nested groups; the JSON-mirror tab is the same expression rendered as JSON for advanced users.

A "Test conditions" action takes a sample event payload (either hand-typed or pulled from a recent live event) and shows the truth-table evaluation step-by-step. This is the regression-test surface a Lab Manager uses before activating a rule.

---

## Action catalogue

The supported actions are the explicit allow-list — no escape hatches. Actions grouped by side-effect target:

| Category | Actions |
|---|---|
| **Orders** | `orders.assign-to`, `orders.add-tag`, `orders.set-priority`, `orders.add-test-reflex` (the reflex-testing engine) |
| **Samples** | `samples.add-tag`, `samples.flag-for-review`, `samples.mark-for-recollection` |
| **Results** | `results.add-comment`, `results.add-tag`, `results.flag-for-review`, `results.notify-on-acknowledgement` |
| **QC** | `qc.notify-on-violation`, `qc.lock-reporting`, `qc.unlock-reporting` (requires `qc.override` permission embedded in the rule's auth profile) |
| **Inventory** | `inventory.create-po-draft` (for low-stock auto-replenishment), `inventory.notify-procurement` |
| **Billing** | `billing.apply-discount`, `billing.add-line-item`, `billing.create-claim-draft`, `billing.send-statement` |
| **Communication** | `comms.send` (to a person, role, or partner with one of the registered templates) |
| **Integrations** | `integrations.emit-webhook` (to a registered partner endpoint) |
| **Tasks** | `tasks.create` (for a named user or role; surfaces in `/tasks`) |
| **Time** | `time.delay` (wait N minutes / hours / days), `time.schedule-re-evaluation` (recheck conditions later) |
| **Audit** | `audit.write-note` (free-text note in the source record's audit log) |

Each action declares the permission it requires; the rule's effective permission profile is the union of all its actions' permissions, and a rule can only be authored / activated by a user who already holds those permissions. This is the failsafe that prevents a Receptionist from authoring a rule that approves results.

---

## Rule editor — every option

### Identity

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text | required | 2–80 chars, unique per tenant |
| Description | textarea | required | 5–500 chars; surfaces in the run log header |
| Tags | multi-text | optional | E.g. `reflex`, `billing`, `critical-results` |
| Owner | search-select | required | A user with `workflows.write`; receives failure notifications |
| Active | boolean | required | default `false`; activation requires `workflows.activate` |

### Trigger

| Field | Type | Required | Notes |
|---|---|---|---|
| Source | enum | required | `orders` / `samples` / `results` / `qc` / `inventory` / `billing` / `appointments` / `home-collection` / `users` / `time` |
| Trigger event | enum | required | One of the source's emitted events |
| Trigger filter (optional pre-condition) | structured | optional | A short condition that short-circuits before the main condition tree (used for performance: e.g. `payload.priority = 'stat'` to limit the rule to STAT orders only) |

### Conditions

The visual condition builder (described in the previous section). Editor surfaces a payload-preview from the most recent live event so the user can see which fields are available.

### Actions

A drag-and-drop list of action steps. Each step has the action type plus its parameters; the parameter surface is generated from the action's schema. Steps run in order; a step's failure halts the run unless the step is marked "continue on error".

### Error handling

| Field | Type | Required | Notes |
|---|---|---|---|
| On failure | enum | required | `notify-owner` / `notify-owner-and-pause-rule` / `silent` |
| Notification target | search-select | required-if-notify | User or role |
| Retry policy | enum | required | `none` / `1m-5m-15m-1h` / `1h-1d` |

A run that exhausts its retry policy is marked `failed` and surfaces on `/workflows/rules/:id` with the failure reason.

### Save / publish

Saving writes a new `workflow_versions` row but does not activate the rule. The author can run "Test against a sample event" first; once satisfied, an `workflows.activate`-holder flips the rule to `active`. Active rules begin processing events from the activation timestamp forward; historical events are not retroactively evaluated (a back-fill option is available as a "Run against history (last 30 days)" action with a separate `workflows.run-historical` permission).

---

## Reflex testing — the canonical example

Reflex testing is the most common workflow rule in a clinical lab: when test A produces a result outside a defined band, automatically order test B. LabFlow ships reflex testing as a first-class concept built on top of the rule engine.

A reflex rule looks like:

| Section | Value |
|---|---|
| Trigger | `result.released` |
| Conditions | `payload.testCode = 'TSH'` AND `payload.numericValue > 4.5` AND `payload.numericValue < 50` |
| Action 1 | `orders.add-test-reflex(testCode='FT4', sameSpecimen=true, billingPolicy='auto-add-to-original-invoice')` |
| Action 2 | `audit.write-note(text='FT4 reflex added per high TSH')` |

The reflex action checks whether the original sample's stability budget covers the new test before triggering a recollection; if not, an `appointments.recall-patient` action can be added as the fallback. Reflex rules are the canonical "see how the rule engine actually fits the lab workflow" example for new Lab Manager users.

---

## Run logs + replay

`/workflows/runs/:id` shows the full execution of one run: the originating event payload (linked to its source record), the condition-tree evaluation with each node's truth value, each action step with its input parameters, its result (success / fail / skipped), and its execution latency. The same screen exposes a "Replay this run" action that re-evaluates the rule against the same event payload — used after a rule edit to confirm the new behaviour matches the historical case.

Bulk replay is available with `workflows.run-historical`: pick a rule, a date range, optionally a condition-narrowing filter, and re-run every matching past event against the current rule version. Bulk replays are rate-limited (max 10k events per hour per tenant) and surface a progress bar with cancellation.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read rules and run logs | `workflows.read` |
| Author / edit a rule (no activation) | `workflows.write` |
| Activate / deactivate a rule | `workflows.activate` |
| Run a rule against historical events | `workflows.run-historical` |
| Read workflows audit log | `workflows.audit.read` |

A rule's actions inherit permissions from the action catalogue — authoring a rule with `qc.unlock-reporting` requires the author to hold `qc.override`. This is the practical guard that keeps the rule engine from being a privilege-escalation path.

---

## Frequently asked questions

### Why aren't loops supported?

Loops produce two problems the engine deliberately avoids: unbounded execution time (a rule that loops can monopolise the worker) and unbounded side-effects (a loop that writes to the source collection can re-trigger itself indefinitely). The supported approach is to model an iterating workflow as a sequence of rules each triggered by the previous one's output event — explicit, audit-readable, and naturally bounded by the events the engine emits. The "schedule re-evaluation" action covers the legitimate "wait and recheck" pattern without introducing a runtime loop.

### Can a rule call an arbitrary HTTP endpoint?

Only through the `integrations.emit-webhook` action, which targets a webhook endpoint registered in [EMR Integration](./emr-integration). Registration gives LabFlow control of the destination URL, the signing key, the retry policy, the rate limit, and the audit log. There is no `http.request` action — by design — because that would defeat the engine's narrowness and make the audit log noisy. Tenants who need bespoke HTTP integrations register a webhook endpoint that points to their own integration layer.

### How are race conditions handled (e.g. two rules trying to write the same field)?

Actions on the same record are serialised at the worker level via a per-record advisory lock. If rule A and rule B both want to write `samples.tags`, they run sequentially in the order their triggers arrived. Conflicting writes to scalar fields use last-writer-wins; conflicting writes to array fields are merged (union for adds, set-difference for removes). This is documented per-action in the action catalogue.

### What happens to in-flight runs when I deactivate a rule?

In-flight runs complete. Newly-arriving events stop triggering the rule from the deactivation timestamp forward. The audit log captures the deactivation with the actor + reason. Reactivation does not retroactively process the events that arrived during the inactive window — use the bulk-replay surface if you need to.

### Can a rule reference data from another module (e.g. read a patient's age before deciding)?

Yes, through the supporting context. Triggers from `orders`, `samples`, `results`, `appointments`, etc. include a denormalised `patient` block (age, sex, MRN) in the event payload so the rule doesn't have to do a separate read. The catalog (test code, category, priority enum) and the tenant's role registry are similarly included as context. Free-form joins against arbitrary collections are not supported — if a rule needs additional context, the operational module surfaces it as part of the event payload.

### How do I test a rule before activating it on real events?

`/workflows/rules/:id` exposes "Test against a sample event": paste an event payload (auto-loaded with the most recent live event of that trigger type), evaluate, and see the step-by-step trace without side-effects (every action runs in dry-run mode and reports what it *would* have done). Once the dry-run output matches the expectation, an activator flips the rule live.

### Are rules versioned?

Yes — every save writes a new `workflow_versions` row with the full rule body, the editor, the timestamp, and a 1–80-char change description (required at save). `/workflows/rules/:id/history` shows the version list with a diff viewer between any two versions and a "Restore this version" action. Restore is forward-only: it writes the historical version as the new active version, producing another row in the timeline.

### Can a rule send patient PHI to a partner webhook?

Only if the partner has registered an HMAC-signed webhook endpoint and the rule's author holds the permission required to read that PHI in the first place. The action engine performs a permission check at run time — a webhook action that would emit a field the rule's author cannot read is short-circuited and logged as a permission-denied step. This is the same guard that prevents privilege escalation through the rule engine.

---

**Next:** [Communication Hub module](/docs/modules/communication-hub).
