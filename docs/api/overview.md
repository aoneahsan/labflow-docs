---
sidebar_position: 1
slug: /api/overview
title: API Reference Overview
description: LabFlow's live programmatic surface is the Firebase SDK (Firestore). There is no public HTTPS / Cloud Functions REST API today; HL7 v2 / FHIR R4 endpoints are on the roadmap. This page summarises auth, transport, and scoping.
keywords:
  - LabFlow API
  - LIMS API
  - HL7 v2 LabFlow
  - FHIR R4 LabFlow
  - Firestore client SDK
---

# API Reference Overview

Today LabFlow's only **live** programmatic surface is the **Firestore client SDK**. There is **no public HTTPS / Cloud Functions REST API** (LabFlow ships no Cloud Functions — the product is 100% client + Firestore). HL7 v2 / FHIR R4 endpoints are on the roadmap, not yet available.

| Surface | Status | Transport | Auth | Best for |
|---|---|---|---|---|
| **Firestore client SDK** | Available | WebSocket via Firebase | User-scoped Firebase ID token | Real-time UI integrations, mobile apps |
| **HTTPS / Cloud Functions REST** | Not available | — | — | (No public REST API exists today) |
| **HL7 v2 / FHIR R4** | Roadmap | TCP (MLLP) for HL7, REST for FHIR | mTLS or API key | Legacy laboratory analyzers, hospital EMR connectors |

This page covers the cross-cutting concerns for the available surface: authentication, multi-tenant scoping, and error semantics.

---

## Authentication

### Firestore client SDK

The web app, mobile app, and browser extensions all authenticate via the Firebase JS SDK (Google sign-in). After sign-in, every Firestore read and write carries the user's ID token automatically. Security rules enforce tenant scoping by reading the caller's `users` / `tenant_users` documents — LabFlow does **not** use custom claims for `tenantId` / `role`.

```ts
import {getFirestore, collection, query, where, getDocs} from 'firebase/firestore';

const db = getFirestore();
// The ID token is attached automatically by the SDK. The active tenant comes
// from app state (the user's selected tenant); security rules re-check the
// caller's tenant_users membership on every read.
const activeTenantId = /* from the app's tenant store */ '';
const q = query(
  collection(db, 'patients'),
  where('tenantId', '==', activeTenantId),
);
const snap = await getDocs(q);
```

### HTTPS / Cloud Functions REST

**Not available.** LabFlow ships no Cloud Functions and exposes no public HTTPS/REST API. Server-to-server integrations should use the Firestore SDK with a service account, or wait for the roadmap HL7 v2 / FHIR R4 surface. (An earlier draft of this page documented a Cloud Functions HTTPS REST API that was never deployed.)

### HL7 / FHIR (roadmap)

HL7 v2 ingestion runs over MLLP (TCP). FHIR R4 endpoints accept HTTPS with either Firebase ID token or API key. Both surfaces require the tenant to have HL7/FHIR enabled in **Settings → Integrations**.

---

## Multi-tenant scoping

**Every API call is tenant-scoped.** The tenant is derived from one of:

1. The authenticated user's active tenant, resolved from their `tenant_users` membership documents (Firebase Auth path — the live surface today).
2. *(Roadmap)* an API key's bound tenant (server-to-server path).
3. *(Roadmap)* the HL7 sending facility's mapped tenant (HL7 path).
4. *(Roadmap)* the FHIR `Organization` reference (FHIR path).

There is no "cross-tenant" mode. If you need to operate across tenants, you make N requests, one per tenant. This is intentional — a single API call cannot accidentally leak data across tenants.

---

## Rate limits

| Surface | Default limit |
|---|---|
| Firestore client SDK | Firebase quota (1 MiB/s/node, 10K writes/s) |
| HL7 v2 ingestion *(roadmap)* | 10 messages/sec per sending facility |
| FHIR R4 *(roadmap)* | 100 req/min per API key |

Bulk imports should use the Firestore admin SDK directly with a service account.

---

## Error envelope

The roadmap FHIR endpoints will return a uniform error envelope:

```json
{
  "error": {
    "code": "permission-denied",
    "message": "User does not have permission to release results in this tenant.",
    "details": {
      "permission": "results.release",
      "tenantId": "tenant_abc"
    }
  }
}
```

Common codes: `unauthenticated`, `permission-denied`, `not-found`, `failed-precondition`, `resource-exhausted`, `internal`.

---

## Webhooks *(roadmap)*

Outbound webhooks require a server to sign and deliver them; because LabFlow has no server tier today, this is a roadmap capability. When it ships it will fire webhooks on these events:

- `order.created`, `order.cancelled`
- `sample.received`, `sample.rejected`
- `result.draft`, `result.reviewed`, `result.approved`, `result.released`, `result.addendum`
- `qc.runFailed`
- `payment.received`, `claim.submitted`, `claim.paid`, `claim.denied`

Configure webhook URLs in **Settings → Integrations → Webhooks**. Each webhook carries an HMAC signature in `X-LabFlow-Signature` so receivers can verify authenticity.

---

## OpenAPI / FHIR CapabilityStatement

An OpenAPI 3.1 spec and a FHIR R4 `CapabilityStatement` are planned alongside the roadmap HL7 v2 / FHIR R4 surface. No HTTPS/REST endpoints exist today.

---

## Versioning

When the roadmap HTTPS surface ships it will use URL-prefix versioning (`/v1/...`), with breaking changes going to `/v2/...` after a deprecation window of at least six months.

The roadmap HL7 v2 surface targets HL7 v2.5.1 message structures; the FHIR surface targets FHIR R4 resources.

---

**Next:** [API Authentication](/docs/api/authentication).
