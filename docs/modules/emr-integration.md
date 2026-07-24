---
sidebar_position: 17
slug: /modules/emr-integration
title: EMR Integration Module (HL7 v2 + FHIR R4)
description: HL7 v2 ORM/ORU mapping, FHIR R4 subscriptions, webhook delivery, EMR Chrome extension injection, message replay, and connection health for LabFlow.
keywords:
  - LabFlow EMR integration
  - HL7 v2 ORM ORU
  - FHIR R4 subscription
  - HL7 mapping LIMS
  - lab webhooks EMR
  - lab integration Chrome extension
  - HL7 message replay
---

# EMR Integration Module

**EMR Integration is the inbound and outbound bridge between LabFlow and the Electronic Medical Record systems hospitals and clinics already use.** The module accepts inbound orders (HL7 v2 `ORM^O01` or FHIR `ServiceRequest`), emits outbound results (HL7 v2 `ORU^R01` or FHIR `Observation` + `DiagnosticReport`), maintains a per-EMR field-mapping dictionary so a single LabFlow tenant can speak to many EMRs at once, delivers result-ready events via signed webhooks or FHIR R4 subscriptions, exposes a Chrome extension that injects LabFlow result snippets into the user's existing EMR pages (the EMR Chrome extension catalogued as one of LabFlow's five surfaces), provides a full message log with replay-from-any-point semantics, and surfaces a connection-health dashboard so a Lab Manager can spot a degrading partner connection before it produces silent data loss.

The module is operationally important but architecturally narrow: it does not store clinical data — it transforms LabFlow's canonical orders and results into the EMR's wire format and routes the message. Every transformation is reversible from the audit log.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Integration / Cross-cutting |
| Required permission to view messages | `integrations.read` |
| Required permission to manage mappings | `integrations.mappings.write` |
| Required permission to replay messages | `integrations.replay` |
| Firestore collections | `hl7_messages`, `hl7_mappings`, `fhir_subscriptions`, `webhook_endpoints`, `webhook_deliveries`, `integration_connections`, `integration_health_snapshots`, `integration_audit_logs` |
| Routes | `/integrations`, `/integrations/connections`, `/integrations/connections/:id`, `/integrations/hl7/messages`, `/integrations/hl7/messages/:id`, `/integrations/hl7/mappings`, `/integrations/fhir/subscriptions`, `/integrations/webhooks`, `/integrations/webhooks/:id`, `/integrations/health`, `/integrations/replay`, `/integrations/audit` |
| Linked modules | [Test Orders](./test-orders), [Sample Tracking](./sample-tracking), [Results Management](./results-management), [Settings](./settings) |

---

## Core concepts

| Term | Meaning |
|---|---|
| **Connection** | A named link to one EMR partner. Each connection has a protocol (`hl7-v2-mllp`, `hl7-v2-webhook`, `fhir-r4`, `webhook`), an auth profile, and a per-connection field mapping. |
| **Field mapping** | A bi-directional dictionary translating LabFlow's canonical fields to the partner's terminology — test codes (LOINC ↔ partner code), insurer codes, urgency codes, specimen-type codes, abnormal flags. |
| **Message** | One inbound or outbound HL7 segment-set or FHIR resource. Every message is persisted with its raw payload, its parsed canonical form, and its delivery state. |
| **Delivery** | One transmission attempt of an outbound message to a partner. A message can have many deliveries (initial + retries). |
| **Subscription (FHIR)** | A partner-registered interest in result-ready events. LabFlow pushes a `Bundle` or `Observation` resource when a result matching the subscription's criteria is released. |
| **Webhook endpoint** | A partner-registered URL that receives signed JSON callbacks for a curated list of LabFlow events. |
| **Replay** | The action of re-emitting a message that previously failed delivery, optionally with edited content if the underlying canonical record has changed. |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/integrations` | Overview — open partners, last-24h volume, error counters | `integrations.read` |
| 2 | `/integrations/connections` | Filterable connection list (partner, protocol, status) | `integrations.read` |
| 3 | `/integrations/connections/:id` | Connection detail — auth, mapping, health, message preview | `integrations.read` |
| 4 | `/integrations/hl7/messages` | Filterable HL7 message log (direction, type, status, partner) | `integrations.read` |
| 5 | `/integrations/hl7/messages/:id` | Message detail — raw payload, parsed canonical, delivery history | `integrations.read` |
| 6 | `/integrations/hl7/mappings` | Per-connection mapping editor | `integrations.mappings.write` |
| 7 | `/integrations/fhir/subscriptions` | FHIR subscription registrations | `integrations.fhir.write` |
| 8 | `/integrations/webhooks` | Webhook endpoint registrations | `integrations.webhooks.write` |
| 9 | `/integrations/webhooks/:id` | One endpoint — recent deliveries, signing-key rotation | `integrations.webhooks.write` |
| 10 | `/integrations/health` | Health dashboard — per-connection error rate, latency, queue depth | `integrations.read` |
| 11 | `/integrations/replay` | Bulk message replay with date / partner / message-type filters | `integrations.replay` |
| 12 | `/integrations/audit` | Filterable integration audit log | `integrations.audit.read` |

---

## HL7 v2 message types supported

LabFlow's HL7 v2 surface is intentionally narrow — only the message types a clinical lab needs day-to-day.

| Message | Direction | Purpose | Required segments |
|---|---|---|---|
| `ORM^O01` | inbound | New / changed lab order from the EMR | MSH, PID, PV1 (optional), ORC, OBR, NTE (optional) |
| `ORU^R01` | outbound | Result-ready notification + result content | MSH, PID, PV1 (optional), OBR, OBX (1..N), NTE (optional) |
| `ORU^R01` | inbound (from instrument) | Instrument-driven result ingestion (see [Results Management](./results-management#hl7-oru-instrument-integration)) | MSH, OBR, OBX (1..N) |
| `ADT^A08` | inbound | Patient demographic update | MSH, PID |
| `ACK` | both | Acknowledgement | MSH, MSA |

Unsupported message types are accepted at the wire-protocol layer but rejected at the parser with a structured `MSA-1: AR` (application reject) carrying the unsupported-type code in `MSA-3`. The rejection writes an `hl7_messages` row with status `unsupported-type` and an alert is fired against the connection.

---

## FHIR R4 resources supported

| Resource | Direction | Purpose | Notes |
|---|---|---|---|
| `ServiceRequest` | inbound | New lab order from an EMR | Maps to a LabFlow Order; `ServiceRequest.code` (CodeableConcept) is resolved via the connection's LOINC + local-code map |
| `Observation` | outbound | One result value | Generated per analyte from the result detail; carries reference range, abnormal flag, interpretation code |
| `DiagnosticReport` | outbound | Bundled report referencing many `Observation` resources | One per released order |
| `Patient` | inbound | Patient registration / demographic update | Mapped against an existing patient by `Patient.identifier` (typically MRN); creates a new patient if no match |
| `Specimen` | inbound | Specimen metadata from a partner pre-analytical system | Linked to an existing Order during accession |
| `Subscription` | inbound | A partner's interest in result-ready events | Persisted in `fhir_subscriptions`; LabFlow pushes when the subscription's criteria match a released result |
| `OperationOutcome` | outbound | Error responses to inbound resources | Always returned on a parse or mapping failure |

LabFlow does not implement the FHIR Search API as a generic data-access surface. Generic programmatic access today is the **Firestore client SDK** (there is no LabFlow REST API — see [API Reference](/docs/api/overview)); a partner-facing HL7 v2 / FHIR R4 surface is on the roadmap.

---

## Connection form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Name | text | required | 2–80 chars | Operator-visible name (e.g. "Mercy Hospital — South campus") |
| Partner organisation | text | required | 1–120 chars | Free text; surfaces in audit |
| Protocol | enum | required | `hl7-v2-mllp` / `hl7-v2-webhook` / `fhir-r4` / `webhook` | Drives the rest of the form |
| Inbound endpoint (LabFlow-provided URL) | derived | — | tenant-scoped URL with secret | Auto-generated; surfaces a "Copy & rotate" pair of actions |
| Outbound endpoint (partner URL) | url | required-for-outbound | https URL or `mllp://host:port` | The address LabFlow pushes to |
| Authentication mode | enum | required | `none` / `shared-secret` / `oauth-client-credentials` / `mTLS` | Drives the auth fields below |
| Shared secret | password | conditional | min 24 chars | HMAC SHA-256 signing key for webhooks |
| OAuth client ID + secret + token URL | text + password + url | conditional | issued by partner | LabFlow caches the token until `expires_in − 60s` |
| mTLS client cert / key | file-upload | conditional | PEM | Stored encrypted, never returned in the UI |
| Default mapping profile | search-select | required | one of the per-tenant mapping profiles | Editable in `/integrations/hl7/mappings` |
| Message types enabled — inbound | multi-checkbox | required-min-1-for-inbound | from the supported list | |
| Message types enabled — outbound | multi-checkbox | required-min-1-for-outbound | from the supported list | |
| Active | boolean | required | default `false` | New connections start inactive — flip to `true` only after the test-message round-trip passes |

A "Send test message" action on the connection screen runs a round-trip with a synthetic `ORM^O01` or a synthetic `ServiceRequest` (depending on protocol) and surfaces the round-trip diagnostic. Activation is gated on a clean test.

---

## Field-mapping editor — every option

Each connection has its own mapping. The editor at `/integrations/hl7/mappings` is a per-field dictionary. Categories:

| Category | LabFlow canonical | Partner field | Example |
|---|---|---|---|
| Test code | LOINC code | partner test code | `2345-7` (Glucose [Mass/Vol]) ↔ `GLU` |
| Test code reverse | partner code | LOINC | `GLU` → `2345-7` |
| Specimen type | LabFlow specimen ID | partner code | `serum` ↔ `SER` |
| Urgency | LabFlow priority enum | partner code | `stat` ↔ `S`, `routine` ↔ `R` |
| Abnormal flag | LabFlow `L/N/H/HH` | HL7 / partner code | `H` ↔ `H` |
| Insurer | LabFlow payer ID | partner payer code | `aetna-001` ↔ `AETNA` |
| Ordering provider | LabFlow provider ID | partner ID + qualifier | `prov-123` ↔ `1234567890^NPI` |
| Patient class | LabFlow class | HL7 PV1-2 code | `outpatient` ↔ `O`, `inpatient` ↔ `I` |

The editor supports CSV import / export for bulk mapping work, a "diff against default" view (LabFlow ships a sensible default LOINC ↔ HL7 table per region), and a "missing mappings" panel that lists every inbound code the partner has used in the last 30 days that didn't resolve — this is the operational signal that prompts a mapping update.

Unmapped inbound codes fail at the parse stage and produce an `OperationOutcome` (FHIR) or `MSA-1: AR` (HL7) response; the message lands in `hl7_messages` with `status: mapping-failed` and surfaces on the connection's health alert.

---

## Webhook delivery + signing

Webhook endpoints are partner-owned URLs LabFlow pushes to. The supported events:

| Event | Payload |
|---|---|
| `result.released` | The released-result canonical JSON, partner-mapped per the connection's mapping |
| `result.amended` | The new value, the prior value, the addendum reason |
| `order.cancelled` | The order ID, the cancellation reason |
| `appointment.confirmed` | The appointment summary for partners that mirror scheduling |
| `appointment.cancelled` | Same |
| `sample.rejected` | The sample ID, the rejection reason |
| `critical-value.released` | The critical-result canonical JSON with acknowledgement deep-link |

Every delivery is signed with HMAC SHA-256 over the body using the connection's shared secret; the signature is placed in the `X-LabFlow-Signature` header along with `X-LabFlow-Event`, `X-LabFlow-Delivery-ID`, `X-LabFlow-Timestamp`, and `X-LabFlow-Signing-Key-Version`. Partners verify by computing the same HMAC client-side. Replay protection is provided by the timestamp + a 5-minute clock-drift tolerance. Signing-key rotation uses an overlap window (default 24 hours) where both keys are accepted, mirroring the platform-wide rotation pattern.

Delivery retries on non-2xx responses: 1m / 5m / 15m / 1h / 6h (five attempts). After five failures the delivery is moved to `failed` and surfaces on `/integrations/health`. A manual replay is available at `/integrations/replay` — the operator may replay a single failed delivery or a date-range batch.

---

## EMR Chrome extension

The EMR Chrome extension is one of LabFlow's four client surfaces (web app, mobile app via Capacitor, WXT cross-browser extension, EMR Chrome extension). It injects a small LabFlow widget into the user's existing EMR pages — typically a "Recent LabFlow results" panel that surfaces when the EMR page contains a recognisable patient identifier. The extension authenticates against LabFlow via Chrome's `chrome.identity` API (never via Firebase Auth's SDK, per LabFlow's browser-extension compliance rules) and reads the result data **directly from Firestore** (there is no LabFlow REST API), gated by the same security rules as the web app. The extension is bundled separately and submitted to the Chrome Web Store; distribution is pending the launch noted on the [LabFlow homepage](https://labflow.aoneahsan.com).

---

## Health dashboard

`/integrations/health` shows per-connection:

| Signal | Meaning | Threshold |
|---|---|---|
| Last successful delivery | The last 2xx response from the partner | Alert if > 1 h for active connections |
| Error rate (24h) | Failed / total deliveries | Alert > 5% |
| Mean latency (24h) | Round-trip time | Alert > 5 s |
| Mapping-failure rate | % of inbound messages rejected at mapping | Alert > 1% |
| Queue depth | Pending outbound messages | Alert if > 100 |
| Authentication failures | OAuth refresh failures, signature-mismatch counts | Alert on any |

Each signal has a 7-day trend strip and an "Open recent failures" drill-through.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read connections, messages, deliveries | `integrations.read` |
| Create / edit connections | `integrations.connections.write` |
| Edit field mappings | `integrations.mappings.write` |
| Manage FHIR subscriptions | `integrations.fhir.write` |
| Manage webhook endpoints + rotate keys | `integrations.webhooks.write` |
| Replay failed messages | `integrations.replay` |
| Read integration audit log | `integrations.audit.read` |

---

## Frequently asked questions

### Why HL7 v2 *and* FHIR R4 — isn't FHIR the modern standard?

FHIR R4 is the direction the industry is headed, but as of 2026 most production EMRs still primarily speak HL7 v2 for orders and results. Cerner, Epic, Meditech, Allscripts all have FHIR endpoints — some are read-mostly, some are partial, some are gated behind partner-program contracts. A lab that wants to integrate with all of its hospital partners must speak both. LabFlow's HL7 v2 surface is what makes go-lives possible in week 1; the FHIR surface is what future-proofs the integration once the partner enables FHIR write.

### What does LabFlow do with an HL7 message it can't parse?

The message is persisted in `hl7_messages` with the raw payload, the parse error, the inferred message type if any, and `status: parse-failed`. An `MSA-1: AE` (application error) acknowledgement is returned to the sender. The connection's mapping-failure rate ticks up; if the rate crosses 1% over 15 minutes, an alert fires. A platform operator with `integrations.replay` can repair the message (edit the raw payload, re-emit) or escalate to the partner for resending.

### Do I have to write code to add a new EMR connection?

No. A new connection is set up entirely in `/integrations/connections/new` — protocol, endpoint, auth, mapping. The only code-level work is when a partner uses an HL7 segment or FHIR extension LabFlow doesn't yet parse, which is unusual. Custom Z-segments (HL7's vendor-specific extension) are configurable in the mapping editor as opaque pass-through key-value pairs that surface on the message detail.

### How are critical results delivered to EMRs?

A released result with `interpretationCode` in the critical band fires a `critical-value.released` webhook to every subscribed partner *and* generates a higher-priority HL7 `ORU^R01` with `OBX-8` carrying the critical flag, *and* writes a row to LabFlow's own [Communication Hub](/docs/modules#communication-hub) outbox for SMS / email to the named recipient list. The partner's acknowledgement of the webhook does not satisfy LabFlow's critical-result acknowledgement requirement — only an explicit "Acknowledge" action by a named clinician (recorded in `results.criticalAcknowledgements`) does.

### Can a partner trigger a result replay if they lost a message?

Yes. The partner emails (or, if integrated, calls the LabFlow API with a `replay-request` event) with the LabFlow delivery ID or the date range. A LabFlow operator with `integrations.replay` opens `/integrations/replay`, scopes the filter, and re-emits. Re-emitted messages carry a new delivery ID but the same canonical message ID, so a partner that de-duplicates on the canonical ID receives no duplicate; a partner that de-duplicates on the delivery ID needs to either ignore the duplicate or read the `X-LabFlow-Original-Delivery-ID` header in the re-emit.

### How is patient identity reconciled across LabFlow and a partner EMR?

The mapping editor's "Patient identifier" section lets each connection name the partner's identifier system (e.g. `urn:oid:1.2.840.114350.1.13.0.1.7.5.737384.1` for an Epic MRN). Inbound resources whose identifier matches an existing LabFlow patient by both system + value attach to that patient. Inbound resources whose identifier matches no patient create a new patient with the source-system identifier preserved. Manual reconciliation is a Lab Manager action at the Patient detail page in [Patient Management](./patient-management).

### Does LabFlow store inbound EMR data outside the message log?

Only the parts the canonical operational record needs — the Order, the Patient, the Specimen, the Encounter (referenced as `PV1` in HL7). The full raw payload sits in `hl7_messages` for 7 years (matching the audit retention default) and is read-restricted by `integrations.read`. Everything else — clinical notes, prior diagnoses, medication lists, allergies — is *not* stored; LabFlow only consumes what it needs to run lab orders correctly, by design.

### What about HL7 v3 / CDA documents?

Not supported in the current product. The cost-vs-value of v3 / CDA support is low — almost no new EMR integrations land on v3, and CDA documents are rarely exchanged in the order / result flow. If a partner only speaks v3 / CDA, a transformation layer (typically Mirth Connect or Rhapsody) sits between the partner and LabFlow's v2 endpoint; that integration pattern is a deployment-level extension, not a bundled feature.

---

**Next:** [Workflow Automation module](/docs/modules/workflow-automation).
