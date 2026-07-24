---
sidebar_position: 2
slug: /architecture/data-model
title: Data Model
description: How LabFlow's Firestore data is shaped — tenant scoping invariant, denormalisation rules, collection topology, document relations, audit-log discipline, and the patterns that keep multi-tenant data isolated under load.
keywords:
  - LabFlow data model
  - Firestore tenant isolation
  - LIMS schema design
  - multi-tenant Firestore
  - audit log Firestore
  - denormalisation pattern
---

# Data Model

**LabFlow's data lives in Firestore as a flat collection of root collections, each carrying a mandatory `tenantId` on every document and a small number of denormalised joins selected for query patterns.** This page explains why the model looks the way it does — why root collections instead of nested subcollections, why denormalisation appears on specific paths, how the audit log is structured, and the patterns that hold tenant isolation under concurrent writes. It is the explanation that complements the [Firestore Schema reference](/docs/architecture/firestore-schema) (the concrete catalogue) and the [Security Rules reference](/docs/architecture/security-rules) (the enforcement layer).

The model is intentionally narrow. There is no graph database, no relational join engine, no second data store for analytics, and **no server tier** — LabFlow is 100% client + Firestore. Reports compute against Firestore directly (bounded, paginated reads and Firestore aggregation queries, with heavier rollups computed in-app) and against a small set of materialised summary / counter documents maintained by the client. The simplicity is the feature — one place to look, one set of access rules, one audit log.

---

## At-a-glance

| Property | Value |
|---|---|
| Primary store | Firestore (Native mode) |
| Object store for files | FilesHub (not Firebase Storage) |
| Collection topology | Root collections; subcollections only for append-only history |
| Tenant scoping invariant | `tenantId` on every document; Firestore security rules enforce |
| Cross-tenant queries | Not supported by design |
| Cardinality of root collections | ~50 (counted across all modules) |
| Audit retention default | 7 years (configurable 2–25 years) |
| Aggregation strategy | Client-side — Firestore aggregation queries (`getCountFromServer`) + client-maintained counter docs; heavier rollups computed in-app from bounded reads |

---

## Tenant scoping — the one invariant that overrides every other rule

Every document in every root collection carries a mandatory `tenantId` field. Every read query must filter on it. Every Firestore security rule begins with `request.auth.token.tenantId == resource.data.tenantId`. The application layer's query builder injects the filter automatically; a developer who tries to omit it gets a type error from the project's query-wrapper TypeScript types before the code reaches Firestore. The security rule is the second line of defence — if the application code somehow bypasses the wrapper, the rule rejects the read.

There is no "global" collection. The closest the system gets to global data is the `permission_registry` document, which is read-only for every tenant and ships through code rather than as a writeable record. Even the catalog of standard tests, units, and reference ranges is a per-tenant `tests` collection — a tenant that wants a globally-recognised LOINC code references the global registry through the LOINC code field, not through a global document.

Cross-tenant queries do not exist as a primitive. A Super Admin's view at `/admin/tenants` is N parallel single-tenant queries, one per tenant, with the results merged in memory. The merge is page-bounded and cancellable. A naive "give me every patient across every tenant" query would not be expressible — there is no path from the caller through the security rules that lets such a query reach the database.

---

## Why root collections, not nested subcollections

A naive Firestore design might use subcollections — `tenants/{tenantId}/patients/{patientId}` — to express the tenancy. LabFlow uses root collections (`patients` with `tenantId` as a field) for three reasons.

The first is query composability. Firestore composite indexes are scoped per collection (root or subcollection). With root collections and the tenant filter as the first sort key on every composite index, the same indexes serve queries across all tenants and the query planner's choice is deterministic. With subcollections the indexes multiply — one per tenant path — and a tenant that pushes a hot composite index has to be migrated independently of the others.

The second is collection-group queries. Some queries genuinely span all tenants — the platform Super Admin's audit feed, the cross-tenant lifecycle dashboard. With root collections, those queries are normal Firestore queries with no tenant filter (and security rules that gate them to platform-admin callers only). With subcollections, the same queries require collection-group syntax with its different index-shape rules.

The third is cost — the per-document write cost is independent of collection depth, but the per-query cost is bounded by the number of indexes traversed, and root collections keep the index count small.

The trade-off is that the security rule's tenant clause is mandatory on every rule — a forgotten clause leaks data. LabFlow's security-rules file has a generator-checked precondition that fails the deploy if any rule's `allow read` or `allow write` clauses omit the tenant equality check. The check is the canonical guard against the most common cause of multi-tenant leaks.

---

## Denormalisation — only where the query pattern demands it

Firestore is not relational, and joins at query time are expensive (multiple reads per result). LabFlow denormalises in a few documented places where a query pattern would otherwise require a fan-out.

Patient summary on orders. An order's document carries `patient: {id, givenName, familyName, dateOfBirth, mrn}` rather than just `patientId`. The order list view renders the patient details inline; a single read serves the whole row. The denormalised fields are refreshed client-side when a patient is edited — the app fans out updates (in a batched write) to every order owned by the patient that is not yet released. This is the only refresh fan-out in the system, and it is bounded (patients rarely update; most edits land on new orders).

Test catalog snapshot on order items. Each order item carries the catalog test's `code`, `name`, `priceAtOrder`, `referenceRangeAtOrder`, `specimenTypeAtOrder` denormalised at order time. The catalog is mutable; the order's denormalised snapshot is not. This is the canonical pattern for capturing "what was true at the time of the action" — refunds, audits, and reports all consult the snapshot, not the live catalog.

Audit-log denormalisation. Audit rows carry the human-readable name of the actor (`actorDisplayName`), the resource ID, and a short summary of the change. The summary is computed at write time so the audit reader doesn't have to re-read every affected record to render the log.

Outside these documented spots, denormalisation is avoided. A document that needs the latest patient name does a fresh read against `patients/{id}` rather than caching the name. The trade-off is one extra read per render; the benefit is one source of truth for "this is who the patient is right now".

---

## Document relations

A relation in LabFlow is always a field carrying an ID — there is no foreign-key constraint, no cascade behaviour, no orphan check at the database layer. The application code is responsible for keeping the graph consistent.

The typical relation flow for a single test result:

```
patients/{patientId}
  ↓ (orders.patientId)
orders/{orderId}
  ↓ (orderItems is an embedded array on the order)
  → order.items[].testCode → tests/{testCode}  (snapshot at order time)
  ↓ (samples.orderId)
samples/{sampleId}
  ↓ (results.sampleId)
results/{resultId}
  ↓ (result_versions is a subcollection — append-only history)
  ↓ (criticalAcknowledgements is a subcollection)
  ↓ (addenda is a subcollection on the released result)
```

Subcollections are used **only** for append-only history — `result_versions`, `criticalAcknowledgements`, `addenda`, `claim_events`, `home_visit_events`, `qc_corrective_actions`. The parent document never reads from the subcollection except to render a count or the most-recent entry; the subcollection is the canonical source of "what happened to this resource over time".

A sample with three tube types stores them as an array on the sample document, not a subcollection — the cardinality is small (1-10 tubes typically) and they update together. A claim's events, in contrast, can grow to dozens over the lifetime of an appeal cycle, and most claim-detail reads don't need the full history — the subcollection is the right shape.

---

## Audit-log discipline

Every operational module writes its own audit log: `patient_audit_logs`, `order_audit_logs`, `result_audit_logs`, `qc_audit_logs`, `billing_audit_logs`, `inventory_audit_logs`, and so on. Each row is an append-only record with the same canonical shape:

| Field | Notes |
|---|---|
| `id` | Unique audit row ID |
| `tenantId` | Same tenant invariant |
| `actorUid` | Firebase UID of the user; or `api-key:{keyId}` for API-key-driven changes; or `system` for engine-driven changes |
| `actorDisplayName` | Denormalised name at write time |
| `actorRole` | Resolved role at write time |
| `action` | The action verb (`update`, `delete`, `release`, `approve`, etc.) |
| `targetCollection` | The collection the change touched |
| `targetId` | The document ID |
| `before` | Subset of the document before the change (large fields elided) |
| `after` | Subset of the document after the change |
| `reason` | Free-text reason, mandatory on sensitive actions |
| `at` | UTC timestamp |
| `sourceIp` | Caller's IP |
| `sessionId` | The credential's session ID for correlation |
| `mfaPassed` | Whether MFA was satisfied when the action was authorised |

Audit rows are immutable. A correction is a new row referencing the prior row's ID via a `correctsAuditId` field — never an edit. The retention rule is documented in [Admin Panel](/docs/modules/admin-panel#frequently-asked-questions) (default 7 years).

The aggregated cross-module view at `/admin/audit` is a single Firestore query against a denormalised `admin_audit_index` that mirrors a small projection of every module's audit rows. The index is written transactionally with the source row so a missing audit-index row is treated as a corruption signal (alerts fire).

---

## Aggregation strategy

Heavy aggregates (TAT distributions, claim-denial rates, lot-drift trends, no-show rates) are computed in-app from bounded, paginated reads and Firestore aggregation queries, and the results are cached in `aggregation_snapshots` documents per tenant so a repeat view reads the snapshot directly. A 30-day TAT distribution returns quickly because the snapshot is read directly rather than re-aggregated on every view. The analytics math itself is transparent, rule-based statistics that run entirely in the browser (`src/services/local-analytics-engine.ts`) — there is no cloud AI/ML model.

Light aggregates that change throughout the day (today's queue counts, the live KPI tiles on the dashboard) use two client-side techniques: Firestore aggregation queries (`getCountFromServer`) for exact counts without reading documents, and a counter pattern where a single document per (tenant, metric, hour) is incremented by the client in the same transaction as the source write. The counter document is the read target — never the aggregated source.

Where neither fits (custom report builder runs, ad-hoc audit slices), the query runs Firestore-native within the read budget. The rendered output (CSV / PDF) is cached in FilesHub so re-runs are cheap.

---

## Schema evolution

A schema change in LabFlow follows three explicit phases.

The first is the **dual-write phase**. The new field is added to the write path; reads continue to consult the old field. Existing documents do not yet have the new field. The application's read path falls back to the old field when the new one is absent.

The second is the **back-fill phase**. A one-off maintenance pass (run in-app by an admin, or via a local Admin-SDK script for large collections) iterates the affected collection and populates the new field on every document. The back-fill is idempotent — every record's new field is computed from the old field, and re-running the back-fill produces the same result.

The third is the **read-switchover phase**. The read path moves to the new field; the old field is kept as a fallback for the deprecation window. After the window (typically 90 days), the old field is dropped and a final back-fill removes it from every record.

The schema-evolution discipline mirrors the contract guarantees in [API Conventions](/docs/api/conventions#versioning): no field renames mid-version, deprecations are explicit, and every change is reversible during its overlap window. The audit log captures every back-fill (with `actor: system` and `action: backfill`) so the change is traceable.

---

## Frequently asked questions

### Why Firestore at all? Why not Postgres for a clinical system?

Firestore wins on three axes for LabFlow's workload. Real-time subscriptions are first-class: a result released by the pathologist appears on the patient portal in real time without a polling layer. Multi-region replication is built-in: a deployment that needs HIPAA-compliant geo-redundancy gets it without engineering effort. The pricing model scales smoothly from the smallest tenant to the largest. The trade-offs — no joins, no transactions across collections, no full-text search — are addressed with the denormalisation patterns and external services documented here. A Postgres-backed equivalent would be defensible; we chose the trade-offs that favoured operational simplicity at this scale.

### Don't transactions across multiple documents bite at some point?

Firestore transactions are scoped to documents within a single database instance and run as optimistic-concurrency-controlled reads-then-writes. The largest LabFlow transactions touch ~10 documents (a result release writes the result, an addendum if applicable, a critical-result acknowledgement row, an audit row, an aggregation counter, and a few notification queue rows). All within the same transaction. Larger consistent updates — say, a back-fill of every result for a patient on a name change — are handled client-side by fanning out per-document writes in batches rather than relying on a single transaction.

### How are aggregations kept in sync with the source data?

The client updates the relevant counter documents in the **same transaction / batched write** as the source-document change, so the counter can never drift from a committed source write. Counter increments are idempotent within the transaction. This replaces the trigger-based approach a Cloud Function would use; because there is no server tier, keeping the counter write in the same client transaction is what guarantees consistency.

### Why don't subcollections work for the main module records?

The main records (patients, orders, samples, results, invoices) need to be queried by users who don't carry the parent ID in their request. A receptionist searching for "Maria" needs to query patients by name; if patients live in `tenants/{tenantId}/patients`, the search has to be a collection-group query with a tenant filter. The receptionist's tenant is on the credential; the parent-path tenant is not directly readable from a query without a path-builder. Root collections + a `tenantId` filter is the more natural shape, even though the topology looks flatter.

### How are PHI-bearing collections separated from operational collections at rest?

Firestore's at-rest encryption is per-document and managed by Google. LabFlow does not run a separate "PHI vault" Firestore project; the tenant's data lives in one Firestore project with column-level (per-field) access controls implemented in the security rules. Sensitive fields on patient documents (national-ID number, biometric IDs) are stored in a sub-document path with a stricter security rule than the patient's basic demographics, so even a developer authorised to read patient summary data cannot read the strict fields without the elevated permission.

### What's the migration story to a different storage layer?

LabFlow's query layer is wrapped in a small Repository module per collection (e.g. `PatientRepository`, `OrderRepository`) that exposes the operational primitives without leaking Firestore-specific syntax outside the wrapper. A migration to another store (Postgres, DynamoDB) would re-implement the repositories without touching the application code — modulo the loss of real-time subscriptions, which would need a separate WebSocket layer. The migration is not on the roadmap; the wrapper exists as architectural discipline rather than as a planned future state.

### Where does FilesHub fit in?

FilesHub is the object store for files (PDF reports, FHIR / HL7 raw payloads, photos, signatures, attachments). LabFlow uses FilesHub instead of Firebase Storage because the global project rules disallow Firebase Storage in favour of FilesHub. Every file reference in the data model is a FilesHub object ID, not a path; the application asks FilesHub for a signed URL at access time. The `visibility: 'public'` default per the global rules applies — privacy enforcement is at the URL TTL layer, not at the storage ACL layer.

### Is there a read-replica for analytics?

Not in the bundled product. A tenant that wants analytical-grade query throughput (Tableau / Power BI / Looker) wires Firestore's BigQuery export connector to mirror the collections to a BigQuery dataset; the dataset is read-only and lags by minutes. This is a deployment-level extension noted in [Reports & Analytics](/docs/modules/reports-analytics#frequently-asked-questions).

---

**Next:** [Firestore Schema reference](/docs/architecture/firestore-schema).
