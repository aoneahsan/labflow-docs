---
sidebar_position: 2
slug: /api/authentication
title: API Authentication
description: How callers authenticate to LabFlow — Firebase ID tokens for SDK callers, tenant-scoped API keys for server-to-server, mTLS / shared-secret signatures for EMR integrations, and the chrome.identity flow for browser extensions.
keywords:
  - LabFlow API authentication
  - Firebase ID token
  - LIMS API key
  - mTLS lab API
  - HMAC webhook signature
  - chrome.identity OAuth
---

# API Authentication

:::info Current vs. roadmap
LabFlow is **100% client + Firestore — there is no server tier and no REST API today.** The only live authentication path is the **Firebase ID token** carried automatically by the Firestore client SDK after **Google sign-in**. The tenant-scoped API keys, mTLS / HMAC signatures, and HL7 / FHIR surfaces below are documented as the **planned** model for the roadmap server surface — they are *not deployed today*.
:::

**LabFlow's live authentication is a Firebase ID token used by the Firestore client SDK.** A user signs in with Google through Firebase Auth; every subsequent Firestore read and write carries that user's short-lived ID token automatically. There is no LabFlow-operated server to send the token to — access control is enforced by the [Firestore security rules](/docs/architecture/security-rules), which read the caller's `users` / `tenant_users` documents. The browser extensions authenticate through Chrome's **`chrome.identity`** API (the only acceptable extension auth path under Chrome Web Store policy) and then talk to Firestore directly.

This page is the reference for the live path plus the roadmap credential model (API keys, mTLS / HMAC) that a future server-to-server / HL7 / FHIR surface would use.

---

## At-a-glance

| Surface | Status | Credential | Where issued |
|---|---|---|---|
| Web / Mobile (user-context) | **Live** | Firebase ID token, attached automatically by the Firestore SDK (1 hour, auto-refreshed) | Firebase Auth at Google sign-in |
| EMR Chrome extension + WXT extension | **Live** | Google token via `chrome.identity`, exchanged **client-side** for a Firebase credential | `chrome.identity.getAuthToken` |
| Server-to-server callers | *Roadmap* | Tenant-scoped API key (`X-API-Key`) | *(future server surface)* |
| HL7 / FHIR partner | *Roadmap* | mTLS client cert OR HMAC SHA-256 signature | *(future EMR-integration surface)* |

---

## Firebase ID token

The default path for any caller that represents a logged-in user. The token is short-lived (1 hour) and refreshed automatically by the Firebase Auth SDK on every Firestore read or HTTPS callable.

### What the token carries

The ID token is a signed JWT. Its claims include:

| Claim | Type | Source | Used for |
|---|---|---|---|
| `sub` | string | Firebase user UID | Identifies the user across surfaces |
| `email` | string | Verified email on the user | Audit logs, notifications, and matched against the caller's `users` document |
| `email_verified` | boolean | Firebase Auth | Gates flows that require verified email |
| `iat` / `exp` | number | Firebase Auth | Expiry — token rejected after `exp` |

**LabFlow does not use custom claims for `tenantId` / `role` / `mfa_passed`.** Setting custom claims requires the Admin SDK (a server), and there is no server tier. Instead, the caller's tenant membership and role live in Firestore — the `users` document and the per-tenant `tenant_users/{uid}_{tenantId}` documents — and the [security rules](/docs/architecture/security-rules) read those documents (via `get()`) on every request to make the access decision. Fine-grained permissions come from the same registry that backs [User Management](/docs/modules/user-management).

### There is no server-side token verification

Because the app talks to Firestore directly, there is no LabFlow HTTPS endpoint or Cloud Function that receives and verifies the ID token. The Firestore backend verifies the token, and the **security rules** make the authorisation decision. A "release result" action, for example, is a client write that the result-state-machine rule accepts only when the caller holds the required permission and passes the tenant check — there is no `onCall` function in between.

### When the token is rejected

| Cause | HTTP status | `error.code` |
|---|---|---|
| Missing `Authorization` header | 401 | `unauthenticated` |
| Token signature mismatch (forged / tampered) | 401 | `invalid-token` |
| Token expired (> 1h since `iat`) | 401 | `expired-token` |
| User revoked (Admin force-signed-out the user) | 401 | `revoked-token` |
| User disabled in Firebase Auth | 403 | `user-disabled` |
| Tenant context missing or stale | 403 | `no-tenant-context` |
| MFA-sensitive route reached without `mfa_passed: true` | 403 | `mfa-required` |

The SDK clients handle 401 with `expired-token` by silently refreshing and replaying. Other errors surface to the caller.

---

## Tenant-scoped API key *(roadmap)*

:::note
API keys describe the **planned** server-to-server credential model for a future server / HL7 / FHIR surface. LabFlow ships no server today, so there is no live API-key issuance or verification — the section below is the target design.
:::

API keys are the canonical server-to-server credential. Each key is bound to one tenant and one named integration (e.g. "Mercy Hospital reconciliation job"), carries an explicit permission set, and is revocable from the issuing screen at `/settings/integrations`.

### Issuance

A user with `settings.integrations.write` creates a key by:

1. Naming the integration.
2. Picking the permissions the key needs from the standard permission registry (the same 177-entry registry that backs [User Management](/docs/modules/user-management)). Every key must declare its scope explicitly; there is no "full access" shortcut.
3. Optionally setting an IP allow-list (CIDR ranges).
4. Optionally setting an expiry date.

Saving generates the key once. The plaintext is shown exactly once on the success screen — the system stores only an Argon2id hash of the key, so a forgotten key cannot be recovered, only rotated.

### Wire format

| Header | Value | Notes |
|---|---|---|
| `X-API-Key` | The key string | Format `lf_<env>_<32-byte-base62>` — for example `lf_prod_8nWk1...` |
| `X-Tenant` | Tenant ID | Optional but recommended; the server verifies the key's tenant matches |
| `X-Request-ID` | UUID v4 from the caller | Optional; surfaces in audit logs for correlation |

### Server-side verification

The HTTPS handler reads the header, looks the key up in `api_keys` (where it is stored as a hash), checks expiry / revocation / IP allow-list, then attaches the resolved permission set and tenant ID to the request context. Permission gates run against this set the same way they run against a user's role permission set.

### Rotation

A key can be rotated from the UI. Rotation creates a new key and marks the old key as `expiringAt: now + overlapWindow`. During the overlap (default 24 hours, configurable per tenant) both keys are accepted. After the overlap, the old key is `revoked` and any incoming request with it is rejected with `revoked-key`. The rotation event is audit-logged.

---

## mTLS and HMAC signatures (HL7 / FHIR partners) *(roadmap)*

:::note
HL7 v2 / FHIR R4 partner connectivity is on the roadmap, not deployed today. This section documents the planned signing model.
:::

Partner-facing HL7 v2 and FHIR R4 connections use either **mTLS** (TLS with mutual certificate authentication) or **HMAC SHA-256 signatures**, depending on the partner's preference declared on the [EMR Integration](/docs/modules/emr-integration#connection-form--every-field) connection record.

### mTLS

The partner presents a client certificate at the TLS handshake. The LabFlow ingester validates the certificate against the connection's stored client CA. No application-level secret is required after the handshake — the TLS layer is the authentication.

### HMAC SHA-256 signatures

For partners that cannot present a client cert (most webhooks from clearing-houses and patient portals), each request carries an HMAC signature computed over the request body using a connection-specific shared secret.

```http
POST /integrations/hl7/inbound HTTP/1.1
Host: ingest.labflow.aoneahsan.com
Content-Type: application/edi-hl7
X-LabFlow-Timestamp: 1714680000
X-LabFlow-Signature: sha256=4f1c2d...
X-LabFlow-Signing-Key-Version: 2

MSH|^~\&|MERCY|...
```

Server-side verification:

1. Read `X-LabFlow-Timestamp`; reject with `400 stale-timestamp` if it differs from server time by > 5 minutes.
2. Read `X-LabFlow-Signing-Key-Version`; load the matching secret (current or, during an overlap window, previous).
3. Compute `HMAC_SHA256(secret, timestamp + "." + raw-body)`; compare in constant time against the value in `X-LabFlow-Signature`. Reject with `401 signature-mismatch` on inequality.
4. Process the request.

The constant-time compare is required — a naive `===` leaks timing information about prefix matches and is the canonical defect a signature scheme must avoid.

### Key rotation

Same overlap-window pattern as API keys: the new secret is set, both secrets are accepted for the overlap window (default 24 hours), then the old one is revoked. The connection's signing-key version increments on each rotation so the partner can carry both versions during the window.

---

## chrome.identity for browser extensions

Both LabFlow browser extensions (the [WXT extension](/docs/modules/wxt-extension) and the [EMR Chrome extension](/docs/modules/emr-chrome-extension)) authenticate exclusively through Chrome's `chrome.identity` API. They never load the Firebase Auth web SDK; both `signInWithPopup` and `signInWithRedirect` fetch remotely-hosted scripts that violate Chrome Web Store MV3 policy.

### Google sign-in (the only path)

The extension obtains a Google token via `chrome.identity`, then exchanges it **client-side** for a Firebase credential — there is no LabFlow server or exchange endpoint. Because the app is 100% client + Firestore, the extension talks to Firestore directly with the resulting Firebase user, gated by the same [security rules](/docs/architecture/security-rules) as the web app.

```ts
// In the extension (Chrome Identity → Firebase credential → direct Firestore).
const token = await chrome.identity.getAuthToken({interactive: true});
if (!token) throw new Error('User declined sign-in');
// Exchange the Google token for a Firebase credential CLIENT-SIDE — no server.
const cred = GoogleAuthProvider.credential(null, token);
await signInWithCredential(getAuth(), cred);
// The extension now reads/writes Firestore directly; security rules enforce access.
```

Sign-in is **Google-only** — LabFlow has no email/password UI and no server-hosted sign-in page. The Firebase Auth web SDK is kept out of the extension bundle (it would load remotely-hosted code that violates Chrome Web Store MV3 policy); the extension uses `chrome.identity` plus the minimal credential exchange above.

### Storage of the session token

The session token sits in `chrome.storage.session` — a session-scoped store that clears on browser restart. This is deliberate: a user closing the browser logs out of the extension, which matches the security posture of a typical labs-IT environment more closely than a long-lived persistent token would.

For surfaces that want longer persistence (e.g. a phlebotomist's mobile app that runs all day), the LabFlow native apps use Firebase Auth's normal IndexedDB persistence — not the extension model.

---

## Cross-cutting rules

### Every request is tenant-scoped

A request without a resolvable tenant context is rejected with `403 no-tenant-context`. The tenant is resolved from the credential — the Firebase ID token's `tenantId` claim, the API key's binding, or the connection record's tenant — and is never trusted from a body field or query parameter. A client that sends `?tenantId=other-tenant` and a credential for tenant A receives the data for tenant A; the parameter is ignored.

### MFA-sensitive routes re-prompt

Routes that touch `results.approve`, `qc.override`, `billing.refunds.approve`, `inventory.expired-lot-override`, `home-collection.accession.override`, and similar sensitive actions check the `mfa_passed` claim on every call (not just at sign-in) and return `403 mfa-required` if it is missing or stale. The web app handles this with a re-prompt modal; server-to-server callers using API keys are exempt because the API key itself is the explicit, audit-logged credential.

### Audit on every authentication event

Every credential creation, rotation, revocation, and rejected-authentication writes a row to `auth_audit_logs`. The row carries the actor, the credential identifier (hashed for keys, UID for tokens), the source IP, the user-agent, and the result. The audit is read at `/admin/audit/users` and exported as part of the accreditation-pack PDF.

---

## Frequently asked questions

### Why no plaintext-password endpoint?

Two reasons: every password we accept is one we have to protect, and password-based callers are the single most common source of credential compromise in B2B SaaS. Firebase Auth handles password storage with Argon2id under the hood; LabFlow's HTTPS layer never sees the plaintext. API keys serve every non-user-context path without that risk.

### How do I rotate an API key without breaking the integration?

Press "Rotate" on the key in `/settings/integrations`. The system generates a new key, shows it once, and marks the old key with `expiresAt = now + overlapWindow` (24 hours by default). Update the integration to use the new key during the overlap. After the window, the old key is rejected. The same pattern applies to HMAC signing secrets.

### Can a single API key span multiple tenants?

No. Every API key is bound to exactly one tenant. An integration that needs cross-tenant access (a billing reconciler that runs against three sister tenants) issues three keys, one per tenant, and the integration code switches the active key per request. This matches the no-cross-tenant-query rule documented in the [Architecture Overview](/docs/architecture/overview#multi-tenancy).

### What happens when a user's role changes during an active session?

Firebase Auth refreshes the ID token automatically when custom claims change. The next call after the refresh carries the new `role` claim. The application's permission gates re-evaluate against the new claims and the user may receive `403 forbidden` if they no longer hold the permission for the operation. The web app responds to such a 403 by reloading the affected screen, which surfaces the new permission state in the UI.

### Does LabFlow support SAML / OIDC SSO?

Enterprise SSO (SAML 2.0 / OIDC via providers like Okta, Azure AD, JumpCloud) is a deployment-level extension. Tenants on those plans wire their IdP to Firebase Auth's identity-platform layer; the wire format on the LabFlow side stays the same — a Firebase ID token in `Authorization: Bearer …`. The IdP handshake happens before the token is issued.

### Can I issue a token that expires in 5 minutes for a one-off automation?

API keys do not currently support short-TTL issuance — the minimum lifetime is "until revoked", and rotation is the supported short-cycle path. If you need a true one-time token, the recommended pattern is to sign a Firebase ID token with a 5-minute expiry from a back-channel service using Admin SDK's `createCustomToken(uid, {ttlMinutes: 5})`; the receiving service verifies it with `verifyIdToken(token)`.

### How are credentials revoked when a tenant is suspended?

Tenant suspension (via [Admin Panel](/docs/modules/admin-panel#platform-scope-tenants)) revokes every active credential bound to the tenant: API keys are marked `revoked` immediately, HMAC signing secrets are rotated out, and active Firebase Auth sessions for the tenant are revoked so the next token refresh fails. Restoration of the tenant re-issues fresh credentials; the prior credentials are not re-activated.

---

**Next:** [API Errors](/docs/api/errors).
