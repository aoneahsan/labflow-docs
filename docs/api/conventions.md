---
sidebar_position: 4
slug: /api/conventions
title: API Conventions
description: LabFlow's API conventions — pagination, filtering, sorting, partial updates, idempotency keys, dates and times, currency, versioning, and the shape rules every endpoint follows.
keywords:
  - LabFlow API conventions
  - LIMS API pagination
  - cursor pagination
  - idempotency key
  - API versioning
  - ISO 8601 dates
  - JSON merge patch
---

# API Conventions

**Every LabFlow endpoint follows the same conventions for pagination, filtering, sorting, partial updates, idempotency, date / currency formatting, and versioning.** A caller that learns these once handles every endpoint consistently — the only per-endpoint variation is the resource schema, not the protocol shape. This page is the rulebook: the URL shape for list endpoints, the request shape for partial updates, the response shape for paginated collections, the idempotency-key contract for retries, the date / time / currency wire formats, and the versioning policy that governs how the contract evolves.

The conventions are intentionally close to widely-used REST norms (the Stripe / GitHub style) so a caller who has integrated with similar APIs can read a LabFlow endpoint without translation. The deliberate divergences are documented inline.

---

## URL shape

| Pattern | Purpose |
|---|---|
| `GET /v1/{resource}` | List the resource — pagination + filtering applies |
| `GET /v1/{resource}/{id}` | Read one resource |
| `POST /v1/{resource}` | Create a resource |
| `PATCH /v1/{resource}/{id}` | Update fields on a resource (JSON merge patch) |
| `DELETE /v1/{resource}/{id}` | Delete a resource (soft delete where the model supports it) |
| `POST /v1/{resource}/{id}/{action}` | Trigger an action on a resource (state-transition or operation) |

The `/v1/` prefix carries the API major version. Sub-resources nest under their parent (`GET /v1/orders/{orderId}/samples`). Action endpoints (`POST /v1/results/{id}:release`) use a colon-separated action suffix when the action name would clash with a normal sub-resource — this matches Google's API design style.

---

## Pagination

Every list endpoint returns at most `limit` items per page (default `25`, max `100`) and a `nextPageToken` when more pages exist. There is no offset-based pagination; the system uses **opaque cursors** for stability under writes.

### Request

```
GET /v1/patients?limit=50&pageToken=eyJsYXN0SWQiOiJwYXRfYWJj...
```

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `limit` | integer | 25 | Max 100; exceeding returns `400 field.out-of-range` |
| `pageToken` | string | — | Opaque cursor from the previous page's `nextPageToken` |

### Response

```json
{
  "items": [{"id": "pat_001", "...": "..."}, {"id": "pat_002", "...": "..."}],
  "nextPageToken": "eyJsYXN0SWQiOiJwYXRfMDAyIiwic29ydCI6Im5hbWUifQ==",
  "totalCount": null
}
```

`totalCount` is `null` by default — counting all matching rows is expensive on a Firestore-backed model. A caller that needs the count opts in with `?includeCount=true`; the server computes it server-side and returns an integer (or `null` if the count would exceed the `maxCountThreshold` of 50 000 for performance reasons).

Cursors are tied to a specific filter + sort combination. Changing either invalidates the cursor — a re-paginate after a filter change starts from the first page.

---

## Filtering

List endpoints accept filter parameters that resolve to the same operators the [Workflow Automation](/docs/modules/workflow-automation#condition-language) condition tree supports.

| Form | Operator | Example |
|---|---|---|
| `?field=value` | `=` | `?status=released` |
| `?field=in:v1,v2,v3` | `in` | `?status=in:draft,reviewed,approved` |
| `?field=ne:value` | `!=` | `?status=ne:cancelled` |
| `?field=gt:value` | `>` | `?amountDue=gt:100` |
| `?field=gte:value` | `>=` | `?amountDue=gte:100` |
| `?field=lt:value` | `<` | `?createdAt=lt:2026-05-01T00:00:00Z` |
| `?field=lte:value` | `<=` | `?createdAt=lte:2026-05-31T23:59:59Z` |
| `?field=between:v1,v2` | `between` | `?age=between:0,17` |
| `?field=null` | `is not set` | `?cancelledAt=null` |
| `?field=notnull` | `is set` | `?cancelledAt=notnull` |
| `?q=text` | full-text search | `?q=Maria` |

Filters are AND-combined. OR-filtering is not supported at the URL level — a caller that needs OR makes parallel requests and merges client-side. This constraint exists because OR-filters against Firestore composite indexes scale poorly; the explicit refusal at the URL layer makes the trade-off visible.

Not every field on every resource is filterable. The filterable set per resource is declared in the resource schema (and surfaced on each module's detail page, e.g. [Test Orders](/docs/modules/test-orders)). Filtering on a non-filterable field returns `400 field.not-filterable`.

---

## Sorting

| Form | Example |
|---|---|
| `?sort=field` | `?sort=createdAt` (ascending) |
| `?sort=-field` | `?sort=-createdAt` (descending) |
| `?sort=field1,-field2` | `?sort=familyName,-createdAt` (multi-field) |

Sortable fields are declared per resource. Sorting on a non-sortable field returns `400 field.not-sortable`. The default sort per resource is documented in the resource page — typically `-createdAt` for transactional resources, `familyName,givenName` for patient-like resources.

---

## Partial updates (PATCH)

`PATCH` accepts a **JSON merge patch** (RFC 7396): the request body is a partial object; fields present in the body replace the existing values; fields absent are left unchanged; fields set to `null` are cleared.

```http
PATCH /v1/patients/pat_001 HTTP/1.1
Content-Type: application/merge-patch+json

{
  "phone": "+15551234567",
  "secondaryEmail": null
}
```

Arrays are replaced wholesale by a merge patch (not merged element-by-element). A caller that wants to append to an array uses the resource-specific action endpoint (e.g. `POST /v1/patients/{id}/tags:add`) — appending without overwriting the existing array is a per-resource concern, not a generic patch concern.

Nested-object merge patches **do** recurse: `PATCH {address: {city: "Boston"}}` updates only `address.city` and leaves `address.line1`, `address.line2`, `address.postalCode`, `address.country` untouched. This matches RFC 7396 semantics.

`PUT` is not exposed by LabFlow's HTTPS surface — every update is a merge patch. The reason: full-document replacement on a Firestore-backed model is a footgun (a missing field in the body clears the field server-side, which surprises callers used to the Firestore client SDK's `setDoc({merge: false})` behaviour vs `setDoc({merge: true})`).

---

## Idempotency keys

Mutating endpoints (`POST`, `PATCH`, `DELETE`, and action endpoints) accept an optional `Idempotency-Key` header containing a caller-supplied unique value (typically a UUID v4 or ULID). The server caches the response for any request with a given idempotency key for **24 hours**. A retry with the same key returns the cached response without re-executing the operation.

```http
POST /v1/orders HTTP/1.1
Idempotency-Key: 01HW8YJ4F9R3T5K2H6N7M1XK3D
Content-Type: application/json

{ "patientId": "pat_001", "tests": ["TSH", "FT4"] }
```

The cache key is `(tenantId, route, idempotencyKey)`. A retry to the same route with the same key — even if the body has changed — returns the original response and **does not** execute the operation; the body change is ignored. This is the canonical Stripe pattern.

Idempotency keys are recommended for every retryable mutation; webhook deliveries and partner-side replays use them by default. Read endpoints do not require them — repeat reads are safe by definition.

---

## Dates, times, and timezones

LabFlow stores every timestamp as UTC and emits every timestamp as **ISO 8601** in the form `YYYY-MM-DDTHH:mm:ss.sssZ` (the `Z` is mandatory — naked timestamps without a zone are rejected with `400 field.regex-mismatch`).

| Field type | Wire format | Example |
|---|---|---|
| Timestamp | `YYYY-MM-DDTHH:mm:ss.sssZ` | `2026-05-11T09:30:00.000Z` |
| Date (no time) | `YYYY-MM-DD` | `2026-05-11` |
| Time (no date) | `HH:mm:ss` | `09:30:00` |
| Duration | ISO 8601 duration | `PT5M` (5 minutes), `P1D` (1 day) |
| Time zone | IANA | `America/New_York` |

The tenant's display timezone (per [Settings → Locale](/docs/modules/settings#locale-form--every-field)) drives how timestamps render in the UI. A timestamp's wire format is always UTC; the tenant's timezone is applied only at display time. Storing in UTC is the only way to keep multi-region tenants consistent.

For events whose "when" is a wall-clock time anchored to a specific zone (e.g. "every Monday at 09:00 in the lab's local time"), the resource carries both the timestamp and the IANA timezone explicitly — never a naked local time.

---

## Currency and money

Money is represented as **minor units** (integer cents / paise / yen) plus a three-letter ISO 4217 currency code. Floating-point representations are not used — the wire shape avoids the well-documented IEEE-754 rounding errors that plague money math.

```json
{
  "amount": 12540,
  "currency": "USD"
}
```

For currencies with no minor unit (JPY, KRW), the integer is the whole-unit amount. The number of minor digits is implied by the currency code per ISO 4217.

A monetary field that needs an exchange rate (e.g. a payment in a non-primary currency converted to the primary for reporting) carries the rate at the time of the operation alongside the amount:

```json
{
  "amount": 12540,
  "currency": "EUR",
  "convertedAmount": 13830,
  "convertedCurrency": "USD",
  "exchangeRate": "1.1031",
  "exchangeRateAt": "2026-05-11T09:30:00.000Z"
}
```

The rate is the canonical record — historical reports recompute against the captured rate, not against a recomputed-now rate, so reconciliation is exact.

---

## Versioning

The major version is part of the URL (`/v1/`). Breaking changes ship as a new major version (`/v2/`) with an overlap window — both versions are accepted for **180 days**, then `/v1/` is retired with a 90-day deprecation banner before retirement. The deprecation header `Sunset: Wed, 11 Nov 2026 00:00:00 GMT` is set on every response from a deprecated version during its retirement window.

Minor changes (new optional fields, new endpoints) ship within the existing major version without notice; callers are expected to ignore unknown fields they don't consume. The contract is: existing fields don't change shape or meaning; new fields may appear.

Field renames are forbidden mid-version. A field that needs replacement ships with a new name and the old name is deprecated with a per-field banner in the resource page. Both names are emitted for the overlap window; the old field stops on retirement.

Header conventions:

| Header | Purpose |
|---|---|
| `LabFlow-Version` | Optional pin — set to `2026-05-01` to lock to that day's contract; rare to need |
| `Sunset` | Server-emitted on deprecated routes |
| `Deprecation` | Server-emitted with `true` on deprecated routes |
| `Warning` | Server-emitted with the deprecation message |

---

## Field naming

Every field is `camelCase`. Boolean fields take the form `isX` or `hasX` (e.g. `isActive`, `hasInsurance`); enum fields are kebab-cased lowercase strings (`stat`, `routine`, `in-control`). ID fields use the resource-prefix form `{prefix}_{base62}` — `pat_…` for patients, `ord_…` for orders, `res_…` for results, `inv_…` for invoices. The prefix is part of the ID and lets a caller route the ID without an extra lookup.

---

## Locale + Accept-Language

Endpoints that return human-readable content (error messages, notification preview text, report-template renders) honour the `Accept-Language` header for translation. The fallback chain is: requested language → tenant default language → English. A response carries the `Content-Language` header with the actually-resolved language.

The structured contract (codes, IDs, enums) is never translated. A caller that drives UI translates the codes client-side from a vocabulary the server publishes.

---

## Webhook signing

Outbound webhooks (from the EMR Integration and Communication Hub modules) carry the conventions documented per-module. The headers follow the same naming scheme:

| Header | Purpose |
|---|---|
| `X-LabFlow-Event` | Event name (e.g. `result.released`) |
| `X-LabFlow-Delivery-ID` | Unique delivery ID for de-duplication |
| `X-LabFlow-Timestamp` | Unix seconds; 5-minute drift tolerance |
| `X-LabFlow-Signature` | `sha256=<hex>` of HMAC-SHA-256 over `timestamp + "." + body` |
| `X-LabFlow-Signing-Key-Version` | Integer; supports overlap-window rotation |
| `X-LabFlow-Original-Delivery-ID` | Set on replays so the receiver can de-duplicate |

The signing-key version + overlap rotation rules are documented in [API Authentication](/docs/api/authentication#hmac-sha-256-signatures).

---

## Frequently asked questions

### Why opaque cursors instead of offset-based pagination?

Offset-based pagination is incorrect under concurrent writes — rows inserted before the current offset shift the meaning of subsequent pages, and rows deleted shift it the other way, producing missed and double-counted rows. Cursor-based pagination encodes a position in the sort that's invariant under inserts and deletes after that position. The trade-off is that arbitrary page-number jumps are not supported; the API surfaces "next page" and "first page", not "page 17".

### Why no `PUT`?

`PUT` is full-document replacement: a field missing from the body is cleared. Callers used to the Firestore SDK's `setDoc({merge: true})` semantics expect partial updates and would be surprised by `PUT` clearing unmentioned fields. The Stripe / GitHub style of using `PATCH` for partial updates and never exposing `PUT` is the more defensible default on a Firestore-backed model.

### Can I get filtered results without pagination (a single page with everything)?

Set `limit=100` (the max) and walk the cursor. The API does not offer a "no pagination" mode because some queries match millions of rows and a single response is not a sensible shape for those. Server-side, list endpoints are backed by Firestore queries with a hard cap that the cursor walks past.

### How long are idempotency-key responses cached?

24 hours from the original request. A retry with the same key after 24 hours executes the operation fresh — the cache window is bounded to keep the cache from growing unbounded. Most clients retry within seconds of failure, so 24 hours is generously above the practical retry horizon.

### What's the difference between `?q=` and a filter?

`?q=` is full-text search across an indexed subset of the resource's fields (typically `givenName`, `familyName`, `mrn`, `phone`, `email` on a patient; `barcode`, `accessionNumber` on a sample). A filter like `?familyName=Garcia` is an exact-equality match. The two combine — `?q=garcia&status=active` matches the union of indexed fields filtered to the active status.

### How are multi-tenant queries enforced?

The credential's resolved tenant is implicit in every query; there is no `?tenantId=` parameter accepted on the URL. A caller cannot probe other tenants by manipulating a query string. The server-side query injection adds the tenant filter before the query reaches Firestore, and the Firestore security rules independently enforce the same filter — defence in depth. See [Architecture → Multi-tenancy](/docs/architecture/overview#multi-tenancy).

### Are there SDKs in addition to the raw API?

The TypeScript / JavaScript SDK is the same one the web app uses (Firebase Auth + Firestore SDK + a thin wrapper for the HTTPS surfaces). It is published as `@labflow/sdk` (publication pending the web-app launch milestone on the [LabFlow homepage](https://labflow.aoneahsan.com)). Other languages can talk to the HTTPS surface directly with any HTTP client; the schema-per-resource documentation is canonical.

### How do I know if a field has been deprecated?

Two signals. The resource detail page (e.g. [Patient Management](/docs/modules/patient-management)) carries a per-field deprecation banner with the retirement date. The HTTP response carries a `Warning` header listing the deprecated fields present in the response. Most ORMs and HTTP clients can be configured to surface the `Warning` header to the developer.

---

**Next:** [Architecture deep-dive — Data Model](/docs/architecture/data-model).
