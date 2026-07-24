---
sidebar_position: 3
slug: /architecture/firestore-schema
title: Firestore Schema
description: The canonical catalogue of LabFlow's Firestore collections, document shapes, subcollections, composite indexes, and the rationale behind each shape decision.
keywords:
  - LabFlow Firestore collections
  - LIMS schema
  - Firestore composite index
  - Firestore document shape
  - lab data model
---

# Firestore Schema

**This page is the concrete catalogue of LabFlow's Firestore collections — every root collection, its top-level fields, its subcollections, and the composite indexes that back its query patterns.** It is the reference companion to the [Data Model explanation](/docs/architecture/data-model) (the why) and the [Security Rules reference](/docs/architecture/security-rules) (the enforcement). Every collection listed here has a `tenantId` field on every document (the invariant explained in the data-model page); the schema below omits that field to keep the tables readable. Add `tenantId: string` to every shape mentally.

The catalogue is grouped by module. Field types use TypeScript notation. Subcollections are listed under each parent. Composite indexes are listed per collection — single-field indexes are auto-created by Firestore and not listed.

---

## Collection topology — at-a-glance

| Module | Root collections |
|---|---|
| Authentication / Users | `users`, `user_tenants`, `roles`, `role_permissions`, `invitations`, `auth_sessions`, `mfa_factors`, `auth_audit_logs`, `user_audit_logs` |
| Patient Management | `patients`, `patient_documents`, `patient_insurance`, `patient_audit_logs` |
| Test Catalog | `tests`, `panels`, `categories`, `reference_ranges`, `specimen_rules` |
| Test Orders | `orders`, `order_audit_logs` |
| Sample Tracking | `samples`, `sample_events`, `sample_audit_logs` |
| Results Management | `results`, `report_templates`, `results_audit_logs` |
| Quality Control | `qc_runs`, `qc_levels`, `qc_lots`, `qc_rules`, `qc_alerts`, `qc_audit_logs` |
| Billing & Insurance | `invoices`, `invoice_items`, `payments`, `claims`, `claim_events`, `price_lists`, `price_list_versions`, `payers`, `payer_contracts`, `corporate_accounts`, `tax_rates`, `billing_audit_logs` |
| Inventory | `stock_items`, `stock_lots`, `stock_transactions`, `vendors`, `purchase_orders`, `purchase_order_items`, `consumption_events`, `inventory_locations`, `low_stock_alerts`, `expiry_alerts`, `inventory_audit_logs` |
| Appointments | `appointments`, `appointment_slots`, `slot_templates`, `holidays`, `phlebotomists`, `collection_rooms`, `appointment_audit_logs` |
| Home Collection | `home_visits`, `home_visit_events`, `home_routes`, `phlebotomist_shifts`, `home_collection_audit_logs` |
| Reports & Analytics | `saved_reports`, `report_runs`, `report_subscriptions`, `dashboard_widgets`, `aggregation_snapshots`, `reports_audit_logs` |
| Settings | `tenant_settings`, `tenant_settings_history`, `label_templates`, `notification_templates`, `sites`, `tenant_feature_flags` |
| Admin Panel | `admin_audit_logs`, `tenant_lifecycle`, `platform_feature_flags`, `system_health_snapshots`, `emergency_overrides` |
| EMR Integration | `hl7_messages`, `hl7_mappings`, `fhir_subscriptions`, `webhook_endpoints`, `webhook_deliveries`, `integration_connections`, `integration_health_snapshots`, `integration_audit_logs` |
| Workflow Automation | `workflow_rules`, `workflow_versions`, `workflow_runs`, `workflow_run_steps`, `workflow_audit_logs` |
| Communication Hub | `notification_events`, `notification_deliveries`, `notification_opt_outs`, `notification_quiet_hours`, `inbound_messages`, `comms_audit_logs` |

Approximate total: 50 collections.

---

## Detailed shapes — clinical core

### `patients`

```ts
{
  id: string;                  // pat_<base62>
  mrn: string;                 // tenant-unique medical record number
  givenName: string;
  familyName: string;
  dateOfBirth: string;         // YYYY-MM-DD
  sex: 'male' | 'female' | 'other' | 'unknown';
  phone?: string;              // E.164
  email?: string;
  preferredLanguage?: string;  // BCP-47
  primaryAddress?: Address;
  primaryInsuranceId?: string;
  assignedTo?: string[];       // user UIDs — drives row-level scope
  isMerged: boolean;
  mergedIntoId?: string;       // when merged with a duplicate
  // PHI-strict sub-doc (separate security rule)
  strict?: {
    nationalId?: string;
    biometricRef?: string;
  };
  appointmentStats?: {
    noShowCount30d: number;
    noShowCount180d: number;
    lastNoShowAt?: string;
  };
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
```

**Subcollections**: none — `patient_documents` and `patient_insurance` are root collections joined by `patientId` because they grow large enough to merit independent pagination.

**Composite indexes**:

| Fields | Sort | Used for |
|---|---|---|
| `tenantId`, `familyName`, `givenName` | asc | Default patient list sort |
| `tenantId`, `mrn` | asc | MRN lookup |
| `tenantId`, `phone` | asc | Phone search |
| `tenantId`, `email` | asc | Email search |
| `tenantId`, `assignedTo`, `familyName` | asc | Row-level-scoped lists |
| `tenantId`, `isMerged`, `updatedAt` | desc | Hide merged duplicates by default |

### `orders`

```ts
{
  id: string;                  // ord_<base62>
  patientId: string;
  patient: {                   // denormalised snapshot
    givenName: string;
    familyName: string;
    dateOfBirth: string;
    mrn: string;
  };
  status: 'draft' | 'submitted' | 'in-progress' | 'completed' | 'cancelled' | 'amended';
  priority: 'routine' | 'urgent' | 'stat';
  orderingProviderId?: string;
  referringProviderId?: string;
  items: OrderItem[];          // embedded
  clinicalNotes?: string;
  diagnoses?: string[];        // ICD-10 codes
  insuranceId?: string;
  appointmentId?: string;
  cancelledReason?: string;
  submittedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

type OrderItem = {
  testCode: string;
  testName: string;            // snapshot
  priceAtOrder: number;        // minor units
  currencyAtOrder: string;     // ISO 4217
  referenceRangeAtOrder?: ReferenceRange;
  specimenTypeAtOrder: string;
  fastingRequired?: boolean;
  reflexRuleId?: string;       // present when this item was auto-added by a workflow
};
```

**Subcollections**: none (items embedded; audit lives in `order_audit_logs`).

**Composite indexes**:

| Fields | Sort | Used for |
|---|---|---|
| `tenantId`, `status`, `createdAt` | desc | Default order list |
| `tenantId`, `patientId`, `createdAt` | desc | Per-patient orders |
| `tenantId`, `priority`, `submittedAt` | asc | STAT order queue |
| `tenantId`, `orderingProviderId`, `createdAt` | desc | Per-provider orders |

### `samples`

```ts
{
  id: string;
  barcode: string;             // includes Luhn check digit
  orderId: string;
  patientId: string;
  patient: {givenName: string; familyName: string; mrn: string};
  status: 'pending' | 'collected' | 'in-transit' | 'received' | 'processing' | 'completed' | 'reported' | 'rejected' | 'cancelled' | 'lost';
  tubeType: string;            // serum / EDTA / heparin / urine / etc.
  collectedAt?: string;
  collectedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
  rejectedReason?: string;
  rejectedAt?: string;
  recollectionOfSampleId?: string;
  // Stability budget tracking
  stabilityBudgetMinutes: number;
  cumulativeStabilityElapsedMinutes: number;
}
```

**Subcollections**:

- `sample_events` — append-only chain of state transitions

**Composite indexes**:

| Fields | Sort | Used for |
|---|---|---|
| `tenantId`, `status`, `createdAt` | desc | Sample queue |
| `tenantId`, `barcode` | — | Scan lookup |
| `tenantId`, `orderId` | — | Per-order samples |
| `tenantId`, `patientId`, `collectedAt` | desc | Per-patient samples |

### `results`

```ts
{
  id: string;
  sampleId: string;
  orderId: string;
  patientId: string;
  testCode: string;
  state: 'draft' | 'reviewed' | 'approved' | 'released';
  value?: number | string;
  units?: string;
  interpretationCode?: 'L' | 'N' | 'H' | 'HH' | 'LL' | 'A';
  isCritical: boolean;
  comments?: string;
  draftBy?: string;
  reviewedBy?: string;
  approvedBy?: string;
  releasedBy?: string;
  draftAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
  releasedAt?: string;
  signatureHash?: string;      // HMAC at approval
  signatureKeyVersion?: number;
  pdfFilesHubId?: string;      // generated at release
  consumptionEventIds?: string[];  // reagent traceability
}
```

**Subcollections**:

- `result_versions` — full snapshot at every state transition (append-only)
- `addenda` — post-release corrections, each with a reason enum
- `criticalAcknowledgements` — clinician acks for critical-flagged results

**Composite indexes**:

| Fields | Sort | Used for |
|---|---|---|
| `tenantId`, `state`, `draftAt` | asc | Result queue by state |
| `tenantId`, `patientId`, `releasedAt` | desc | Per-patient released results |
| `tenantId`, `isCritical`, `releasedAt` | desc | Critical-result queue |
| `tenantId`, `testCode`, `releasedAt` | desc | TAT analytics per test |

---

## Detailed shapes — operations core

### `invoices`

```ts
{
  id: string;
  patientId: string;
  billToType: 'patient' | 'insurer' | 'corporate' | 'split';
  primaryInsurerId?: string;
  secondaryInsurerId?: string;
  corporateAccountId?: string;
  patientResponsibilityPct?: number;
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  balance: number;
  status: 'draft' | 'issued' | 'partially-paid' | 'paid' | 'overdue' | 'voided';
  issuedAt?: string;
  dueDate?: string;
  voidReason?: string;
  pdfFilesHubId?: string;
}
```

**Subcollections**: none (line items are in `invoice_items`).

**Composite indexes**:

| Fields | Sort | Used for |
|---|---|---|
| `tenantId`, `status`, `issuedAt` | desc | Invoice queue |
| `tenantId`, `patientId`, `issuedAt` | desc | Per-patient invoices |
| `tenantId`, `status`, `balance` | desc | Outstanding-balance reports |
| `tenantId`, `dueDate`, `status` | asc | Aged-receivables reports |

### `claims`

```ts
{
  id: string;
  invoiceId: string;
  payerId: string;
  state: 'draft' | 'submitted' | 'in-review' | 'adjudicated' | 'paid' | 'partial-pay' | 'denied' | 'appealed' | 'retracted' | 'voided';
  submittedAt?: string;
  adjudicatedAt?: string;
  paidAt?: string;
  totalAmount: number;
  paidAmount: number;
  deniedReason?: string;
  denialCode?: string;
}
```

**Subcollections**:

- `claim_events` — every state transition with reason and actor

### `stock_lots`

```ts
{
  id: string;
  stockItemId: string;
  lotNumber: string;
  manufacturerDate?: string;
  expiryDate: string;
  receivedQuantity: number;
  onHandQuantity: number;
  unitCost?: number;
  currency?: string;
  receivedFrom: 'purchase-order' | 'manual-receipt' | 'transfer-in' | 'correction';
  receivedViaPurchaseOrderId?: string;
  receivedAt: string;
  storageLocationId: string;
  // For control / calibrator items
  assayedMean?: number;
  assayedSd?: number;
  containerBarcode?: string;
  status: 'active' | 'depleted' | 'expired' | 'write-off' | 'returned';
}
```

**Composite indexes**:

| Fields | Sort | Used for |
|---|---|---|
| `tenantId`, `stockItemId`, `expiryDate` | asc | FEFO picking |
| `tenantId`, `stockItemId`, `receivedAt` | desc | FIFO picking |
| `tenantId`, `expiryDate`, `onHandQuantity` | asc | Expiring-lots alerts |
| `tenantId`, `storageLocationId`, `status` | — | Per-location stock view |

### `qc_runs`

```ts
{
  id: string;
  analyzerId: string;
  shift: 'morning' | 'evening' | 'night';
  levelId: string;
  lotId: string;
  measuredValue: number;
  zScore: number;
  inControl: boolean;
  violations: string[];        // ['1-3s', '2-2s', ...]
  ranAt: string;
  ranBy: string;
}
```

**Composite indexes**:

| Fields | Sort | Used for |
|---|---|---|
| `tenantId`, `analyzerId`, `levelId`, `ranAt` | desc | Levey-Jennings chart slice |
| `tenantId`, `inControl`, `ranAt` | desc | Out-of-control alerts |

---

## Detailed shapes — workflow + system

### `appointments`

```ts
{
  id: string;
  patientId: string;
  patient: {givenName: string; familyName: string; mrn: string};
  siteId: string;
  slotId: string;
  startsAt: string;
  durationMinutes: number;
  status: 'booked' | 'confirmed' | 'arrived' | 'in-progress' | 'completed' | 'no-show' | 'cancelled-by-patient' | 'cancelled-by-staff';
  reminderCadence: 'default' | 'aggressive' | 'minimal' | 'none';
  testCodes?: string[];
  linkedOrderId?: string;
  confirmCode?: string;        // single-use for SMS reply
  isWalkIn: boolean;
  noShowAt?: string;
  cancelReason?: string;
}
```

**Composite indexes**:

| Fields | Sort | Used for |
|---|---|---|
| `tenantId`, `startsAt`, `status` | — | Today's-appointments list |
| `tenantId`, `siteId`, `startsAt` | — | Per-site calendar |
| `tenantId`, `patientId`, `startsAt` | desc | Per-patient history |

### `home_visits`

```ts
{
  id: string;
  patientId: string;
  patient: {givenName: string; familyName: string; mrn: string};
  address: Address;
  geolocation: {lat: number; lng: number};
  windowStart: string;
  windowEnd: string;
  estimatedDurationMinutes: number;
  routeId?: string;
  phlebotomistId?: string;
  status: 'pending' | 'assigned' | 'en-route' | 'arrived' | 'identified' | 'collected' | 'packaged' | 'departed' | 'returned' | 'accessioned' | 'cancelled';
  liveTrackingOptedIn: boolean;
  liveTrackingToken?: string;
  liveTrackingExpiresAt?: string;
  testCodes: string[];
  linkedOrderId?: string;
}
```

**Subcollections**:

- `home_visit_events` — append-only chain of custody

### `workflow_rules`

```ts
{
  id: string;
  name: string;
  description: string;
  ownerUid: string;
  triggerSource: string;
  triggerEvent: string;
  triggerFilter?: ConditionTree;
  conditions: ConditionTree;
  actions: ActionStep[];
  errorHandling: {
    onFailure: 'notify-owner' | 'notify-owner-and-pause-rule' | 'silent';
    notificationTarget?: string;
    retryPolicy: 'none' | '1m-5m-15m-1h' | '1h-1d';
  };
  effectivePermissions: string[];  // union of action requirements
  active: boolean;
  activatedAt?: string;
  activatedBy?: string;
  currentVersion: number;
}
```

**Subcollections**:

- `versions` — every save, addressable by version number
- `runs` — every execution
- `run_steps` — per-step trace under each run

### `hl7_messages`

```ts
{
  id: string;
  connectionId: string;
  direction: 'inbound' | 'outbound';
  messageType: string;         // 'ORM^O01', 'ORU^R01', etc.
  rawPayload: string;          // the on-the-wire HL7 segments
  parsedCanonical?: object;    // application-layer JSON
  status: 'received' | 'parsed' | 'parse-failed' | 'mapping-failed' | 'processed' | 'unsupported-type' | 'awaiting-replay';
  errorCode?: string;
  receivedAt: string;
  processedAt?: string;
}
```

**Composite indexes**:

| Fields | Sort | Used for |
|---|---|---|
| `tenantId`, `connectionId`, `receivedAt` | desc | Per-connection message log |
| `tenantId`, `status`, `receivedAt` | desc | Error-state queues |
| `tenantId`, `direction`, `messageType`, `receivedAt` | desc | Volume reports |

---

## Composite index inventory

A change to a query that adds a new field combination requires a new composite index. The deployment manifest lists every index; the count today is approximately:

| Module | Index count |
|---|---:|
| Patient Management | 6 |
| Test Orders | 4 |
| Sample Tracking | 4 |
| Results Management | 4 |
| Quality Control | 3 |
| Billing & Insurance | 6 |
| Inventory | 4 |
| Appointments | 3 |
| Home Collection | 3 |
| Reports & Analytics | 2 |
| EMR Integration | 3 |
| Communication Hub | 4 |
| Other (Users, Settings, Admin) | 6 |
| **Total** | **~52** |

A new index ships through the project's regular Firestore deployment (`firebase deploy --only firestore:indexes` — never the broader `--only firestore` form, which can drop existing indexes; this is documented in the project's services-integrations standard). Index builds for large tenants take minutes to hours; the deploy is run during low-traffic windows and the new query path waits for the index status to flip to `READY` before being released.

---

## Frequently asked questions

### Why are some collections plural and some singular?

Plurals are the default — `patients`, `orders`, `samples` — because a collection holds many of a thing. The exceptions are `tenant_settings` (one document per tenant, the collection name is plural-ish-but-singular-in-cardinality) and per-tenant singletons like `tenant_feature_flags`. The few exceptions are intentional; renaming them to a consistent convention would break every deployed integration's query path, so they stay.

### Why are subcollections used so sparingly?

Two reasons. First, subcollections complicate cross-tenant aggregation (the platform Super Admin's audit feed). Second, the operational records of LabFlow rarely have a "container" they belong to that meaningfully scopes their queries — a patient does not own their orders the way a Firestore subcollection ownership implies. Root collections with relations expressed as ID fields are the more honest shape. Subcollections appear only for append-only history under one parent — `result_versions`, `claim_events`, `home_visit_events` — where the parent is the only relevant query scope.

### Are there time-series collections optimised for analytics?

No — the analytical aggregations live in `aggregation_snapshots`, which is a derived store updated nightly. The raw events are in the operational collections; an analytical query against raw events can hit a high read cost, which is why pre-computation is the default. For tenants that need true time-series analytics, the BigQuery export connector mirrors Firestore into a BigQuery dataset.

### How are large blob fields handled?

Large fields (rendered PDFs, raw HL7 payloads above ~100 KB, photos, signatures) live in FilesHub. The Firestore document stores only the FilesHub object ID, the file's MIME type, and a small set of metadata fields. The fetch goes to FilesHub at access time. The 1 MB Firestore document-size limit is plenty for the rest of the model — most documents are under 10 KB.

### What happens when a composite index is missing?

Firestore returns a structured error with a deep-link URL that, when followed, creates the missing index. In development this surfaces immediately; in staging the missing-index error is caught by the integration tests; in production the deploy gate refuses to land a code change that introduces a new query without an index in the manifest. The gate is part of the project's CI pipeline and is the canonical defence against index drift.

### How does the schema evolve safely under load?

Per the [Data Model → Schema evolution](/docs/architecture/data-model#schema-evolution) section: dual-write, back-fill, switchover, drop. Every step is reversible during its window. A change to a heavily-trafficked collection (orders, samples) can take days to back-fill at scale; the deploy budgets the back-fill into a multi-step plan with intermediate states explicitly named in the runbook.

---

**Next:** [Security Rules reference](/docs/architecture/security-rules).
