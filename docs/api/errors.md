---
sidebar_position: 3
slug: /api/errors
title: API Errors
description: LabFlow's error model — error envelope shape, status code mapping, the full catalogue of error codes, retry semantics, and how to surface partner-facing errors via FHIR OperationOutcome and HL7 NACK.
keywords:
  - LabFlow API errors
  - LIMS error codes
  - FHIR OperationOutcome
  - HL7 NACK error
  - retry-after lab API
  - API error envelope
---

# API Errors

:::info Current vs. roadmap
Today the only live programmatic surface is the **Firestore client SDK**, which surfaces standard `FirebaseError` codes (`permission-denied`, `not-found`, `failed-precondition`, `resource-exhausted`, `unavailable`, `unauthenticated`). LabFlow ships **no REST API and no Cloud Functions**. The HTTP / FHIR / HL7 error model catalogued below is the **planned** shape for the roadmap server + HL7 v2 / FHIR R4 surfaces — it is not deployed today.
:::

**When the roadmap surfaces ship, every error will follow a single canonical shape regardless of which surface emitted it.** A caller that handles the envelope correctly would handle errors from the Firebase SDK, the roadmap REST endpoints, the FHIR R4 ingester, and the HL7 v2 MLLP listener uniformly — only the transport wrapping differs. This page is the catalogue: the envelope shape, the HTTP / FHIR / HL7 mapping per surface, the retry-after semantics, and the master list of error codes the system emits.

The envelope is intentionally narrow: a string `code`, a human-readable `message`, an optional `details` object for structured field-level errors, and an optional `requestId` for log correlation. There is no `data` or `payload` field — successful responses carry their data directly, error responses carry only the envelope.

---

## The error envelope

```json
{
  "error": {
    "code": "result.not-found",
    "message": "Result ID 'res_abc123' was not found in tenant 'mercy-main'.",
    "details": {
      "resultId": "res_abc123",
      "tenantId": "mercy-main"
    },
    "requestId": "01HW8YJ4F9R3T5K2H6N7M1XK3D"
  }
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `error.code` | string | yes | Stable, machine-parseable identifier — `module.condition` form |
| `error.message` | string | yes | Human-readable; localised to the user's preferred language when a user-context request, English on server-to-server |
| `error.details` | object | no | Structured context for the error — never includes patient PII |
| `error.requestId` | string | no | ULID, present when the caller sent `X-Request-ID` or when the server allocated one |

Error codes are versioned with the same contract as permission IDs from [User Management](/docs/modules/user-management): once shipped, never renamed. A code that needs replacement is deprecated with a 90-day banner and a new code; the old code keeps emitting until the deprecation window closes.

---

## HTTP status mapping

| HTTP status | Meaning | Typical codes |
|---|---|---|
| `400 Bad Request` | Caller's request was malformed | `validation.failed`, `body.invalid-json`, `header.missing` |
| `401 Unauthorized` | Authentication failed or missing | `unauthenticated`, `invalid-token`, `expired-token`, `signature-mismatch` |
| `403 Forbidden` | Authentication succeeded; authorisation denied | `permission.denied`, `mfa-required`, `tenant-mismatch`, `user-disabled` |
| `404 Not Found` | Resource doesn't exist (or caller cannot see it) | `*.not-found` |
| `409 Conflict` | Operation conflicts with current state | `result.already-released`, `slot.just-filled`, `lot.expired-blocked` |
| `412 Precondition Failed` | Conditional precondition unsatisfied | `version.stale`, `state-machine.invalid-transition` |
| `422 Unprocessable Entity` | Body was valid JSON but failed semantic validation | `validation.failed` |
| `429 Too Many Requests` | Caller exceeded the rate limit | `rate-limit.exceeded` with `Retry-After` header |
| `500 Internal Server Error` | Unexpected server-side failure | `internal.unexpected` |
| `502 Bad Gateway` | Upstream dependency failed | `upstream.fileshub-down`, `upstream.fhir-partner-down` |
| `503 Service Unavailable` | Service intentionally paused | `tenant.suspended`, `system.maintenance` |
| `504 Gateway Timeout` | Upstream dependency timed out | `upstream.timeout` |

The HTTP status is the coarse signal; the `error.code` carries the precise reason. A caller that wants to drive UI changes (e.g. show a "session expired" toast) keys off `error.code`, not the status.

---

## Code catalogue (by category)

The catalogue is exhaustive at the time of writing; codes are added per release with a changelog entry, and deprecations follow the 90-day banner rule.

### Authentication + authorisation

| Code | HTTP | Meaning |
|---|---|---|
| `unauthenticated` | 401 | No credential presented |
| `invalid-token` | 401 | Token signature mismatch — forged or tampered |
| `expired-token` | 401 | Token expired (`exp` claim past) |
| `revoked-token` | 401 | Token belongs to a user whose sessions were revoked |
| `revoked-key` | 401 | API key is in the `revoked` state |
| `signature-mismatch` | 401 | HMAC signature did not match the computed value |
| `stale-timestamp` | 400 | HMAC request timestamp outside the 5-minute window |
| `user-disabled` | 403 | The user's Firebase Auth account is disabled |
| `mfa-required` | 403 | MFA-sensitive route reached without a fresh MFA pass |
| `tenant-mismatch` | 403 | Credential's tenant does not match the resource's tenant |
| `no-tenant-context` | 403 | No active tenant on the credential or session |
| `permission.denied` | 403 | The caller lacks the permission required for the operation |
| `ip.not-allowed` | 403 | Source IP outside the API key's allow-list |

### Validation

| Code | HTTP | Meaning |
|---|---|---|
| `validation.failed` | 422 | One or more fields failed schema or business validation |
| `body.invalid-json` | 400 | Body could not be parsed |
| `header.missing` | 400 | A required header was missing |
| `field.required` | 422 | A specific required field was absent |
| `field.out-of-range` | 422 | A numeric or date field violated its allowed range |
| `field.regex-mismatch` | 422 | A text field failed its regex constraint |

When `validation.failed` is the code, `error.details` carries a `fieldErrors` array:

```json
{
  "error": {
    "code": "validation.failed",
    "message": "Validation failed on 2 fields.",
    "details": {
      "fieldErrors": [
        {"field": "dateOfBirth", "code": "field.out-of-range", "message": "DOB must not be in the future."},
        {"field": "phone", "code": "field.regex-mismatch", "message": "Phone must be E.164 (e.g. +15551234567)."}
      ]
    }
  }
}
```

### State-machine

| Code | HTTP | Meaning |
|---|---|---|
| `state-machine.invalid-transition` | 412 | Transition not allowed from the current state |
| `result.already-released` | 409 | Cannot edit a released result — use an addendum instead |
| `sample.already-rejected` | 409 | Cannot un-reject a sample; use a re-collection workflow |
| `appointment.slot-just-filled` | 409 | The slot was held by another concurrent booking |
| `claim.already-submitted` | 409 | The claim is past the editable state |
| `qc.lock-active` | 409 | Reporting is locked for this analyte + analyzer pending QC corrective action |
| `lot.expired-blocked` | 409 | Consumption blocked because the picked lot is past expiry |

### Resource-not-found

The `*.not-found` codes follow `<module>.not-found`. The HTTP status is `404`. The `details.{module}Id` field carries the requested ID. A `not-found` error is returned identically when a resource exists but the caller cannot see it (per permission scope) — this is deliberate, to avoid leaking existence to under-permissioned callers.

| Code | Module |
|---|---|
| `patient.not-found` | Patient Management |
| `order.not-found` | Test Orders |
| `sample.not-found` | Sample Tracking |
| `result.not-found` | Results Management |
| `qc-run.not-found` | Quality Control |
| `invoice.not-found` | Billing & Insurance |
| `claim.not-found` | Billing & Insurance |
| `stock-item.not-found` / `stock-lot.not-found` | Inventory |
| `appointment.not-found` | Appointments |
| `home-visit.not-found` | Home Collection |
| `connection.not-found` | EMR Integration |
| `template.not-found` | Communication Hub |
| `workflow-rule.not-found` | Workflow Automation |

### Rate-limit

| Code | HTTP | Meaning |
|---|---|---|
| `rate-limit.exceeded` | 429 | The caller hit a documented rate limit |

Every 429 response carries:

| Header | Meaning |
|---|---|
| `Retry-After` | Integer seconds to wait before retrying |
| `X-RateLimit-Limit` | The applicable limit |
| `X-RateLimit-Remaining` | Requests left in the current window |
| `X-RateLimit-Reset` | Unix timestamp at which the window resets |

The default limits per credential type:

| Credential | Window | Limit |
|---|---|---|
| Firebase ID token (per user) | 60 s | 120 requests |
| API key (default) | 60 s | 600 requests |
| API key (configured high-throughput) | 60 s | 6 000 requests |
| HL7 MLLP per partner | 1 s | 30 messages |
| FHIR ingest per partner | 1 s | 30 resources |

Higher limits can be requested for an API key from the issuing screen, audit-logged with a reason.

### Upstream + system

| Code | HTTP | Meaning |
|---|---|---|
| `upstream.fileshub-down` | 502 | FilesHub object store is unreachable |
| `upstream.fhir-partner-down` | 502 | FHIR partner endpoint returned a non-2xx |
| `upstream.hl7-partner-down` | 502 | HL7 partner ingester did not ACK in time |
| `upstream.notification-provider-down` | 502 | The tenant's SMS / email provider is failing |
| `upstream.timeout` | 504 | Generic upstream timeout |
| `tenant.suspended` | 503 | The tenant is in `suspended` lifecycle state |
| `system.maintenance` | 503 | Scheduled maintenance window — see `Retry-After` |
| `internal.unexpected` | 500 | Unhandled server error — every occurrence is logged |

---

## Retry semantics

Retries are caller-driven. The system does not auto-retry on the caller's behalf except for the documented webhook-delivery and notification-delivery retry policies (see [EMR Integration](/docs/modules/emr-integration#webhook-delivery--signing) and [Communication Hub](/docs/modules/communication-hub#deliverability--provider-health)).

| Error code | Retry-safe? | Recommended pattern |
|---|---|---|
| `unauthenticated`, `invalid-token`, `expired-token` | yes (after refresh) | Refresh the credential, then retry once |
| `revoked-token`, `revoked-key`, `user-disabled` | no | Surface to the user — they need to re-auth or reissue the key |
| `permission.denied`, `tenant-mismatch`, `mfa-required` | no | Surface to the user |
| `validation.failed`, `*.invalid-json`, `field.*` | no | Fix the request body and retry |
| `*.not-found` | no | The resource genuinely doesn't exist (or is unreadable to the caller) |
| `state-machine.invalid-transition` | no | The state moved; read the fresh state and decide |
| `rate-limit.exceeded` | yes (after `Retry-After`) | Sleep then retry; use exponential back-off on repeated 429s |
| `upstream.*-down`, `upstream.timeout` | yes (exponential back-off) | 1m / 5m / 15m / 1h / 6h is the standard back-off |
| `tenant.suspended`, `system.maintenance` | yes (after `Retry-After`) | Honour the header |
| `internal.unexpected` | yes once (then alert) | Retry once; on repeat, escalate — every `internal.unexpected` is also logged server-side |

---

## Partner-format error wrappers

The same `error.code` shape surfaces inside the protocol-specific wrappers when the caller uses HL7 v2 or FHIR R4 transport.

### FHIR `OperationOutcome`

Every error from the FHIR ingester is returned as an `OperationOutcome` resource. The `OperationOutcome.issue.diagnostics` field carries the LabFlow `error.code`; the `issue.details.coding` array carries the same code as a `Coding` with `system = "https://labflow.aoneahsan.com/codes/error"`. This lets a FHIR-native partner read the canonical code without parsing the human-readable message.

```json
{
  "resourceType": "OperationOutcome",
  "issue": [{
    "severity": "error",
    "code": "not-found",
    "diagnostics": "patient.not-found",
    "details": {
      "coding": [{
        "system": "https://labflow.aoneahsan.com/codes/error",
        "code": "patient.not-found",
        "display": "Patient was not found in tenant 'mercy-main'."
      }]
    }
  }]
}
```

### HL7 v2 `MSA` (ACK / NACK)

For HL7 v2 inbound, the system returns an `ACK` message with one of three `MSA-1` values:

| `MSA-1` | Meaning |
|---|---|
| `AA` | Application accept — success |
| `AE` | Application error — caller-side defect (validation, parse failure); `MSA-3` carries the LabFlow `error.code` |
| `AR` | Application reject — refusal (unsupported message type, tenant suspended); `MSA-3` carries the LabFlow `error.code` |

The `MSA-3` field is the canonical place to look for the machine-parseable code on the HL7 side.

---

## Frequently asked questions

### How do I know if an error is retry-safe?

Read the table in the retry-semantics section above. The shortest summary: 401 (after a refresh), 429 (after `Retry-After`), 502 / 503 / 504 (with back-off). Every 4xx other than 401 and 429 is not retry-safe — the request itself is wrong and re-sending it without changes will fail again.

### Why do permission failures return 403 with `*.not-found`-shaped errors in some cases?

A naive permission check returns `403 permission.denied` for "you can't see this resource", but that leaks the resource's existence. For row-level-scoped collections (patient records, results visible only to assigned clinicians), the system returns `404 *.not-found` so an under-permissioned caller cannot probe for IDs. The audit log captures the true reason (`permission-denied-disguised-as-not-found`) so an admin reviewing the log sees what actually happened.

### Are error messages translated?

For user-context requests, yes — the `error.message` is rendered in the user's preferred language (per [Settings → Locale](/docs/modules/settings#locale-form--every-field)). For server-to-server requests, the message is English. The `error.code` is always English-stable, so callers that read the code never have to deal with translation.

### How do I correlate an error to a server-side log entry?

Set the `X-Request-ID` header on every outgoing call. The server includes it in `error.requestId` on any error and also threads it through the server log so a support engineer can find your exact request in the audit and observability tools. Use ULIDs (sortable) rather than UUIDs (random) for easier log-sorting.

### What's the difference between `409 result.already-released` and `412 state-machine.invalid-transition`?

The 409 codes are emitted when the caller's intent collides with the current state and the right fix is a *different operation* (use an addendum instead of an edit). The 412 codes are emitted when the caller's intent is correct for *some* state but not the current one — the right fix is a *retry after reading the fresh state*. The distinction is subtle but lets clients drive different UI: 409 surfaces "this is the wrong tool for the job"; 412 surfaces "the state moved underneath you".

### Are validation field paths JSONPath?

They are dot-paths into the request body. For nested objects: `address.city`. For arrays: `addresses.0.city`. The system avoids full JSONPath syntax to keep the contract small and unambiguous; a client that needs to highlight the failing field in a form parses the dot-path against its known schema.

### What is the canonical place to look up an error code's behaviour?

This page. Every `error.code` in the catalogue here is stable and contract-frozen. New codes ship through release notes (linked from each module's detail page); deprecated codes carry a banner in the registry for 90 days before retirement.

---

**Next:** [API Conventions](/docs/api/conventions).
