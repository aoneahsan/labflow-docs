---
sidebar_position: 4
slug: /architecture/security-rules
title: Firestore Security Rules
description: LabFlow's Firestore security-rules model — tenant scoping, permission gating, row-level scope enforcement, append-only invariants, immutable-field protection, and the patterns that hold the multi-tenant model under direct-Firestore access.
keywords:
  - LabFlow Firestore security rules
  - LIMS security rules
  - tenant isolation Firestore
  - row-level security Firestore
  - append-only Firestore
  - immutable field Firestore
---

# Firestore Security Rules

**LabFlow's security rules are the last line of defence between a credential and the database — and the only defence that the application code cannot accidentally bypass.** The rules enforce four classes of invariant: tenant scoping (the credential's tenant must match the document's tenant for every read and write), permission gating (the caller must hold the matching permission from the registry), row-level scope (a row-restricted role sees only the rows it was assigned), and append-only / immutable-field protection (result states, audit rows, and chain-of-custody events cannot be edited after write). This page explains the patterns the rules use, the helper functions that keep them readable, the per-collection structure, and the testing discipline that holds the rules in shape across releases.

The rules are not the application's only access-control layer — client-side query-builder wrappers and form validators run earlier and produce better error messages. But because LabFlow has **no server tier** (it is 100% client + Firestore), the rules are the **load-bearing** layer: the client talks to Firestore directly, so a defect in the application code that bypasses a wrapper still hits the rules, and the rules are the only thing between a credential and the data. They are the canonical reference for "what is and isn't allowed against the database".

---

## At-a-glance

| Property | Value |
|---|---|
| Rules language | Firestore Security Rules (v2) |
| File location in the repo | `firestore.rules` (private LabFlow repo; not redistributable) |
| Total rules (approx) | One per root collection + one per audit collection + helpers ≈ 90 named blocks |
| Helper functions | ~20 (declared at top of file; reused across collections) |
| Deploy command | `firebase deploy --only firestore:rules` (never the broader `--only firestore`) |
| Test framework | Firebase Rules Unit Testing (`@firebase/rules-unit-testing`) |
| Pre-merge gate | Rules unit tests + a custom precondition checker that fails the deploy if any rule omits the tenant clause |

---

## The five-pattern model

Almost every rule in the file is one of five patterns. Understanding the patterns is most of the value of reading the rules.

### Pattern 1 — Tenant scope (the universal precondition)

Every rule begins by asserting the caller's tenant matches the document's tenant. The helper `inTenant()` encapsulates this:

```js
function inTenant(resource) {
  return request.auth != null
      && request.auth.token.tenantId != null
      && resource.data.tenantId == request.auth.token.tenantId;
}

function willBeInTenant() {
  return request.auth != null
      && request.auth.token.tenantId != null
      && request.resource.data.tenantId == request.auth.token.tenantId;
}
```

A read rule uses `inTenant(resource)`; a write rule uses both `inTenant(resource)` (for the prior state on update / delete) and `willBeInTenant()` (for the new state on create / update). A caller cannot create a document under a different tenant and cannot update a document to move it to another tenant — both conditions are independently enforced.

### Pattern 2 — Permission gate

Every operation checks the caller's permission set carries the matching capability. The helper reads the user's role registry:

```js
function hasPermission(perm) {
  return request.auth != null
      && perm in request.auth.token.permissions;
}
```

The permissions claim on the token is a string array of permission IDs the user holds (resolved from their role at sign-in, refreshed when the role changes). The rule for a state transition or a write reads:

```js
match /results/{resultId} {
  allow read: if inTenant(resource) && hasPermission('results.read');
  allow create: if willBeInTenant() && hasPermission('results.write.draft');
  // ...
}
```

The permissions claim is bounded — Firebase Auth limits custom claims to 1 KB. A user with all 177 permissions does not fit. The token instead carries a `roles` claim (array of role IDs) and the application's query layer resolves the permissions per-request from `role_permissions`. The rule's `hasPermission` helper consults that resolution via a secondary read of the user's role document; the read is cached for the duration of the request.

In practice the resolution is:

```js
function hasPermission(perm) {
  return request.auth != null
      && perm in get(/databases/$(database)/documents/user_tenants/$(request.auth.uid + '_' + request.auth.token.tenantId)).data.resolvedPermissions;
}
```

The `get` call is one Firestore read per rule evaluation, and Firestore deduplicates the read across all rules in the same request. The resolved permissions are recomputed whenever the user's role changes.

### Pattern 3 — Row-level scope

A role with `patientScope: assigned-patients-only` cannot see patients it isn't assigned to. The rule reads the resolved scope:

```js
function canReadPatient(patient) {
  return inTenant(patient)
      && hasPermission('patients.read')
      && (
        getUserScope().patientScope == 'all-patients'
        || request.auth.uid in patient.data.assignedTo
      );
}

match /patients/{patientId} {
  allow read: if canReadPatient(resource);
  // ...
}
```

The same pattern applies to `orderScope` (`all-orders` / `own-orders` / `same-site-orders`) and to per-site scoping. A user with `orderScope: own-orders` sees only orders they created; a user with `same-site-orders` sees orders whose site matches the user's primary site.

### Pattern 4 — State transitions

A result moves through `draft → reviewed → approved → released`. Each transition requires a specific permission and a specific state on both sides:

```js
match /results/{resultId} {
  allow update: if inTenant(resource) && willBeInTenant()
              && (
                  // Draft → Reviewed
                  (resource.data.state == 'draft'
                   && request.resource.data.state == 'reviewed'
                   && hasPermission('results.review'))
                  // Reviewed → Approved
                  || (resource.data.state == 'reviewed'
                      && request.resource.data.state == 'approved'
                      && hasPermission('results.approve')
                      && request.auth.token.mfa_passed == true)
                  // Approved → Released
                  || (resource.data.state == 'approved'
                      && request.resource.data.state == 'released'
                      && hasPermission('results.release')
                      && criticalAcknowledgementsPresent(resultId))
                  // Allow drafting changes pre-release
                  || (resource.data.state == 'draft'
                      && request.resource.data.state == 'draft'
                      && hasPermission('results.write.draft')
                      && fieldsChangedExcept(['state', 'releasedAt', 'releasedBy']))
                  );
}
```

The state-machine rule is the largest single block in the file (the rule for results runs to about 80 lines). It is also the most-tested — every legal transition has a unit test, every illegal transition has a unit test asserting `permission-denied`.

### Pattern 5 — Append-only and immutable-field protection

Certain documents must never change after write. The rule denies update outright:

```js
match /result_versions/{versionId} {
  allow read: if inTenant(resource) && hasPermission('results.read');
  allow create: if willBeInTenant() && hasPermission('results.write.draft');
  allow update: if false;   // append-only — versions are immutable
  allow delete: if false;
}
```

The same denial applies to audit logs (`*_audit_logs`), claim events (`claim_events`), home-visit events (`home_visit_events`), QC corrective-action rows, and consumption events. A bug in application code that tried to amend a past audit row would hit `permission-denied`.

For collections whose documents are partly mutable but where some fields must not change after creation, the rule asserts the immutable field has the same value before and after:

```js
match /invoices/{invoiceId} {
  allow update: if inTenant(resource) && willBeInTenant()
              && hasPermission('billing.invoices.issue')
              && request.resource.data.tenantId == resource.data.tenantId
              && request.resource.data.id == resource.data.id
              && request.resource.data.createdAt == resource.data.createdAt
              && request.resource.data.createdBy == resource.data.createdBy
              // Once issued, currency cannot change
              && (resource.data.status == 'draft'
                  || request.resource.data.currency == resource.data.currency);
}
```

Immutability after a state transition (currency locked once issued, signature locked once approved, tube type locked once collected) is enforced via the `||` branch that lets the field change while the document is in the pre-locked state and rejects the change after.

---

## Helper inventory

The rules file declares about 20 helpers at the top. The named ones:

| Helper | Purpose |
|---|---|
| `inTenant(resource)` | Tenant clause on existing resource |
| `willBeInTenant()` | Tenant clause on incoming write |
| `hasPermission(perm)` | Caller holds the permission |
| `hasAnyPermission(perms)` | Caller holds at least one |
| `hasAllPermissions(perms)` | Caller holds all |
| `getUserScope()` | Loads the caller's row-level-scope config |
| `inSameSite(site)` | Caller's primary site matches |
| `isAssignedTo(record)` | Caller's UID is in `record.assignedTo` |
| `fieldsChangedExcept(allowed)` | Update touched only allowed fields |
| `fieldsRequired(required)` | Incoming write includes all required fields |
| `valueUnchanged(field)` | Field's value is the same before and after |
| `mfaPassed()` | The auth token's `mfa_passed` claim is `true` |
| `isPlatformAdmin()` | Caller has the platform-scope Super Admin role |
| `tenantIsActive()` | Caller's tenant is not suspended / archived |
| `idMatchesPath()` | The document's `id` field equals its document ID |
| `isCreateOnly()` | Operation is a create, not update |
| `isWithinRateLimit(scope)` | Caller is within the per-(uid, scope) rate window |
| `noPiiInComment()` | A free-text field doesn't include obvious PII markers (best-effort) |
| `signatureValid()` | The HMAC signature on an approved result verifies |
| `criticalAcknowledgementsPresent(resultId)` | Every critical-flagged value has an acknowledgement row |

The helpers compose. A typical create rule reads:

```js
allow create: if willBeInTenant()
            && hasPermission('appointments.write')
            && fieldsRequired(['patientId', 'siteId', 'slotId', 'startsAt'])
            && idMatchesPath()
            && tenantIsActive()
            && isCreateOnly();
```

---

## Platform-scope vs tenant-scope

A small number of collections are platform-scoped — readable / writable by the LabFlow Super Admin role across all tenants, never by a tenant-scoped role. The list:

| Collection | Reason |
|---|---|
| `tenant_lifecycle` | Tenant creation / suspension / archive is platform-level |
| `platform_feature_flags` | Cross-tenant feature toggles |
| `system_health_snapshots` | Aggregated across tenants |
| `admin_audit_logs` (cross-tenant view) | The cross-tenant audit feed; per-tenant audits live in module-specific collections |

The rules for these collections use `isPlatformAdmin()` in place of `inTenant()`:

```js
match /tenant_lifecycle/{lifecycleId} {
  allow read: if isPlatformAdmin();
  allow create: if isPlatformAdmin()
              && willBeInTenant()
              && hasPermission('admin.platform.suspend');
  allow update: if false;   // append-only lifecycle log
  allow delete: if false;
}
```

The `isPlatformAdmin()` helper checks the caller's role in their `users` document (a platform-level role such as `super_admin` that only LabFlow staff carry). That role is provisioned out-of-band by an operator through the Firebase Admin SDK, never through the application UI — a regular tenant user has no path to acquiring it.

---

## Sign-in-as audit

A LabFlow operator using the platform sign-in-as feature carries both their original identity and the target user's identity in the token. The rules consult the original identity for sign-in-as-eligibility and use the target identity for the actual access decision:

```js
function isImpersonating() {
  return request.auth.token.impersonator != null;
}

function impersonatorAllowed() {
  return isImpersonating()
      && request.auth.token.impersonator.platformRole == 'super-admin'
      && request.auth.token.impersonator.signInAsWrite == true;
}

match /results/{resultId} {
  // ... normal rules ...
  // Sign-in-as is read-only by default; only the writeable variant can mutate
  allow update: if (!isImpersonating() || impersonatorAllowed())
              && /* the rest of the result update rule */;
}
```

Both identities appear in any audit row the operation produces; the application's audit-writing helper detects the impersonation and writes both fields.

---

## Testing discipline

Every rule has at least three unit tests:

1. A positive test — a request with the right credentials succeeds.
2. A negative test — a request from a different tenant fails with `permission-denied`.
3. A permission-mismatch test — a request from the same tenant without the required permission fails with `permission-denied`.

State-machine rules add positive / negative tests per legal and illegal transition. Row-level-scope rules add positive / negative tests per scope value. The result-state-machine rule (the largest in the file) has about 40 tests; the simpler list-read rules have 3 to 5 tests each. The total test suite runs to several hundred tests against the Firestore emulator.

The pre-merge gate runs the tests on every pull request and refuses to land a rule change that fails any test. A second gate, a custom script (`scripts/check-rules.ts` — private repo), parses the rules file and asserts that every `allow read` or `allow write` clause references either `inTenant()` or `isPlatformAdmin()`. A missing tenant check fails the deploy. This script is the canonical defence against the most common security defect — a forgotten tenant clause on a new collection.

---

## Deploy + rollback

Rule changes deploy via `firebase deploy --only firestore:rules`. The deploy command intentionally is **not** `firebase deploy --only firestore` — the broader form also touches indexes and has been known in past Firebase versions to drop existing indexes that aren't declared in the local manifest. The narrow `:rules` form deploys only the rules file.

A rule deploy is reversible: the previous version is kept in Firebase's rules history (visible in the Firebase Console). A rollback is one click. The CI pipeline records the deployed rules version against the deployment manifest so a rollback can be paired with an application-code rollback.

---

## Frequently asked questions

### Why is access control in the rules and not a server?

LabFlow has **no server tier** — it is 100% client + Firestore, so there is no Cloud Function or backend to route reads and writes through. That makes the rules the natural and only place for the access boundary: the client reads a document in a single round-trip when the rules pass, with no server hop in between. Even if a backend were added later, the rules would stay non-negotiable — they run on every request against the database, so nothing can bypass them.

### Can a rule depend on data from another document?

Yes — via `get()` and `getAfter()`. The rules engine deduplicates the reads across rules in the same request, so a `get()` on the caller's `user_tenants/{uid_tid}` document costs one read regardless of how many rules invoke `hasPermission()`. The cost is bounded; a rule that issues many distinct `get()` calls eventually trips Firestore's per-request rule-evaluation-time budget and fails with `unavailable`. The pattern to avoid: a rule that loops over a list and `get()`s each item — that's a recipe for hitting the budget. The patterns that compose well: one `get()` per rule per request, ideally a `get()` that's shared across many rules.

### How are race conditions handled (two writers updating the same document)?

Firestore's update operation is optimistic: it reads the current document, applies the write, and writes back, failing if the document changed between read and write. The application uses transactions for any update that depends on the prior state, which retries automatically up to 5 times. The rules do not need to know about the optimism — they evaluate against the final intended write.

### What happens when a user's role changes during a long-running session?

Firebase Auth refreshes the user's ID token when the custom claims change, and the next request carries the new claims. A rule evaluating against the token reads the new role's permissions on the next call. In-flight requests at the moment of the change complete with the old claims (the request had the credentials it had when it started); subsequent requests evaluate against the new claims.

### Can rules introduce new permissions without an application-side change?

The rule references the permission ID by string — if the application's role-permission mapping doesn't know about the ID, the user simply never holds it and the rule denies access. A new permission can be added to the registry first (and ship with a default role mapping) before the rule starts referencing it; once the rule deploys, the permission is enforced. The contract on permission IDs (no renames, deprecations only) applies the same way as it does in the API surface — see [API Errors](/docs/api/errors).

### Why is the rules file private when the rest of the docs are public?

The rules file references internal collection paths and field names that are operational detail rather than public-API contract. The shape of the rules is documented here in the patterns section; the canonical file is in the private repository so that the live shape doesn't drift from the documentation. When the rules file evolves, the patterns documented here are kept in sync as part of the release.

### How do the rules interact with Firestore's offline persistence?

Offline reads consult the local cache regardless of the rules — the cache is a copy of data the client already read while online, so the rules' read decision was made at fetch time. Offline writes are queued locally and re-attempt when the device reconnects; the rules evaluate at re-attempt time, so a queued write that no longer satisfies the rules (the user's role changed while offline) is rejected on reconnect. The mobile app's outbox pattern handles this by carrying the credential at write time and re-checking permissions before queueing.

### Is there a way to test the rules against a real tenant's data?

The Firebase emulator supports a "seed" mode where a snapshot of production data (with PHI scrubbed) is loaded into the emulator and the rules are evaluated against it. The seed is generated by a script (private repo) that walks production documents, replaces sensitive fields with synthetic values, and writes the result to an emulator export. The pre-release smoke test runs the rules against the seed; a rule that allows access to a document it shouldn't is caught before the deploy. The seed is regenerated weekly to keep it close to production shape.

---

**Next:** Batch 11 covers Deployment, GitHub publishing, GSC + Bing Webmaster + IndexNow + Algolia DocSearch — see the [public build plan](https://github.com/aoneahsan/labflow-docs/blob/main/docs/audit/2026-05-10-docs-site-build-plan.md).
