---
sidebar_position: 2
slug: /modules/authentication
title: Authentication Module
description: LabFlow's authentication module covers email + password, Google OAuth, phone OTP, magic-link, MFA (TOTP + SMS), biometric unlock, and multi-tenant session binding. Eight screens, role-aware redirects, audit-logged sign-in.
keywords:
  - LabFlow authentication
  - LIMS auth
  - Firebase Auth multi-tenant
  - MFA TOTP SMS
  - laboratory user authentication
  - phone OTP medical software
---

# Authentication Module

:::info Shipped reality
The current LabFlow build signs in with **Google only** (Firebase Authentication / Google OAuth). There is no email/password, phone-OTP, magic-link, or MFA UI in the shipped product, and tenant/role are stored in Firestore documents rather than in custom claims. Additional providers described below are aspirational and are **not enabled today**.
:::

**Authentication is the gate that binds a user identity to one or more tenant contexts in LabFlow.** In the shipped product this is a single federated exchange — **"Continue with Google"** — followed by the tenant chooser that runs after a successful sign-in. The module is implemented on top of Firebase Authentication; a user's tenant memberships, roles, and permissions live in Firestore (`users` + `tenant_users` documents) and drive every downstream security-rule decision.

If you're a laboratory administrator setting up new staff, the [User Management module](/docs/modules#user-management) is where you invite people; this page describes what those invited users see when they sign in.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Cross-cutting (gates every other module) |
| Required permission to access | None (anonymous entry) — but `auth.signin.<provider>` permission can be revoked per role |
| Firestore collections | `users`, `userTenants`, `auth_sessions`, `mfa_factors`, `audit_logs` |
| Routes | `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/mfa-setup`, `/mfa-challenge`, `/phone-verify`, `/select-tenant` |
| Implementing surfaces | Web, mobile (Capacitor), browser extension (limited — Chrome Identity API only) |

---

## Screens

| # | Route | Purpose | Visible to |
|---|---|---|---|
| 1 | `/login` | Primary sign-in screen. Email + password by default; provider buttons (Google, Apple, Phone, Magic link) under a fold | Anyone not signed in |
| 2 | `/register` | New-account creation when self-service signup is enabled per tenant | Anyone (when invitations-only mode is off) |
| 3 | `/forgot-password` | Sends a password-reset email | Anyone not signed in |
| 4 | `/reset-password?token=…` | Sets a new password from a reset-link token | Anyone with a valid token |
| 5 | `/verify-email?token=…` | Confirms an email-verification token | Authenticated user with unverified email |
| 6 | `/mfa-setup` | Configures TOTP and/or SMS as second factors | Authenticated user with permission `auth.mfa.configure` |
| 7 | `/mfa-challenge` | Prompts for a TOTP code or SMS code during sign-in | Mid-sign-in user with MFA enabled |
| 8 | `/phone-verify` | Captures and verifies a phone number for SMS-based factor or OTP login | Authenticated user (factor enrol) or anonymous (OTP login) |
| 9 | `/select-tenant` | Chooses which tenant to operate in when the account belongs to more than one | Authenticated user with `userTenants.length > 1` |

---

## Identity providers

| Provider | How it works | Multi-tenant binding |
|---|---|---|
| **Email + password** | Standard Firebase Auth email/password sign-in. Password complexity is enforced server-side: 8+ chars, at least one uppercase, one digit, one special char | Tenant membership is fetched from `userTenants` after sign-in; if zero memberships, the user is shown a "no tenant" screen |
| **Google OAuth** | Firebase Auth Google provider. On the web, uses `signInWithPopup`; on mobile, uses the Capacitor Firebase Authentication plugin native sign-in | First-time Google sign-ins land on `/select-tenant` if invited, or a "no access" screen otherwise |
| **Apple Sign-In** | Apple OAuth via Firebase Auth. iOS uses the native Apple sign-in sheet; web uses redirect flow | Same as Google |
| **Phone (SMS OTP)** | Firebase Auth phone-number provider. SMS delivered via Firebase's underlying SMS provider; rate-limited to 5 OTPs / hour per number | Used both for sign-in and as an MFA second factor |
| **Magic link (email)** | Firebase Auth `sendSignInLinkToEmail`. Useful for users who don't want to remember a password | Same binding as email + password |
| **Biometric (mobile only)** | Capacitor `BiometricAuth` plugin gates a stored refresh token; backed by Firebase Auth's existing session | Doesn't change tenant binding; refreshes the existing session |
| **Browser extension** | Uses `chrome.identity.getAuthToken()` because the Chrome Web Store rejects extensions that load Firebase Auth popup / redirect SDK (those load remote code) | Tenant binding is derived from the user's `userTenants` after token exchange |

> **Why no Firebase Auth in the browser extension?** Chrome Web Store policy forbids extensions from loading remote JavaScript (rule "Blue Argon"). Firebase Auth's popup and redirect flows fetch scripts at runtime from `apis.google.com`, which trips that rule. We use `chrome.identity.getAuthToken()` for OAuth and verify ownership through Firestore document-level checks (`request.auth.token.tenantId` + `request.auth.uid == resource.data.ownerId`).

---

## Multi-factor authentication

Two factors are available out-of-the-box: **TOTP** (e.g. Google Authenticator, 1Password, Authy) and **SMS**. Admins can require MFA per role — e.g. all users with the `Pathologist` role must have MFA enrolled before they can approve results.

```text
User signs in (factor 1: password)
   → If role requires MFA AND user has no enrolled second factor:
        block at /mfa-setup until enrolled
   → If user has enrolled factors:
        prompt at /mfa-challenge before tenant chooser
```

Recovery codes are issued at TOTP enrolment (10 single-use codes, displayed once). They are stored salted + hashed in Firestore; the plaintext is never persisted.

---

## Session and token model

LabFlow uses Firebase Auth's standard token model. It does **not** use custom claims — there is no server to set them. A user's tenant memberships and roles live in Firestore (the `users` document and the per-tenant `tenant_users/{uid}_{tenantId}` documents); the [security rules](/docs/architecture/security-rules) read those documents on every request to make the access decision.

| Token | Lifetime | Storage |
|---|---|---|
| ID token | 60 minutes | Memory + automatic refresh via Firebase SDK |
| Refresh token | Until revoked | Capacitor Preferences on mobile; HttpOnly cookie via Firebase SDK on web; `chrome.storage.local` for extensions |
| Custom claims | Updated within 60 minutes of role/tenant change | Refreshed on every token refresh; force-refresh via `getIdToken(true)` after a permission change |

Sessions can be revoked from **Admin → Sessions** — clicking "Revoke" updates the user's `auth_sessions` doc and forces a token refresh on the next API call, after which Firestore security rules reject the previous token.

---

## Audit log invariants

Every authentication event writes an `audit_logs` document:

- `auth.signin.success` — provider, IP, user-agent, MFA used or not
- `auth.signin.failure` — provider, reason (bad password / unverified / blocked)
- `auth.mfa.enrolled` / `auth.mfa.revoked` — factor type
- `auth.password.changed` / `auth.password.reset`
- `auth.session.revoked` — initiated by user, admin, or system
- `auth.tenant.switched` — from / to tenant IDs

Audit log entries are **append-only** in security rules — even Super Admin cannot edit or delete them. They form the basis of any HIPAA or SOC 2 evidence pack you compile against a LabFlow deployment.

---

## Security-rule highlights

The Authentication module enforces these invariants in Firestore security rules:

1. A user document can only be read by the user themselves, by users with `users.read` permission *in the same tenant*, or by Super Admin.
2. A user can read their own `userTenants` collection; admins can read all `userTenants` for their tenant.
3. The `auth_sessions` collection is server-only — clients can read their own session doc but never write to it.
4. The `mfa_factors` collection stores hashed recovery codes; raw codes never round-trip through Firestore.
5. Email verification is enforced for any mutation that creates or releases a result.

---

## Required permissions

| Capability | Permission |
|---|---|
| Sign in via email + password | `auth.signin.password` |
| Sign in via Google | `auth.signin.google` |
| Sign in via Apple | `auth.signin.apple` |
| Sign in via phone OTP | `auth.signin.phone` |
| Sign in via magic link | `auth.signin.magic-link` |
| Enrol or remove MFA factor | `auth.mfa.configure` |
| View own audit log | `auth.audit.read.self` |
| View tenant audit log | `auth.audit.read.tenant` |
| Revoke another user's session | `auth.session.revoke` |
| Force password reset for another user | `auth.password.force-reset` |

---

## Common workflows

### A new staff member's first sign-in

1. Admin invites the user from **User Management → Invite User** (see Batch 07 page when it lands).
2. The user receives an email with a one-time setup link.
3. Clicking the link lands on `/register?token=…`. The user sets a password.
4. If their role requires MFA, they are redirected to `/mfa-setup`.
5. If their account belongs to multiple tenants, `/select-tenant` follows.
6. They land on the dashboard.

### An existing user adds a second tenant

1. Tenant B's admin invites them by email; the invitation links to `/accept-invite?token=…`.
2. The user (already signed in) clicks the link; the system adds a `userTenants` doc for tenant B and force-refreshes the ID token.
3. The tenant chooser becomes available in the top bar.

### A user loses their phone with TOTP

1. The user signs in with their password.
2. At `/mfa-challenge`, they click **"Use a recovery code"**.
3. They paste one of the ten one-time recovery codes issued at enrolment.
4. The system consumes that code, signs them in, and prompts them to re-enrol TOTP.
5. The previous TOTP factor is auto-revoked.

If all ten recovery codes are exhausted, the user must contact an admin who can clear the factor from **Admin → Users → MFA Reset** (permission `auth.mfa.admin-reset`).

---

## Frequently asked questions

### Does LabFlow support SSO (SAML / OIDC)?

Firebase Auth supports OIDC and SAML federation natively, and LabFlow exposes the underlying config via **Settings → Integrations → Identity Providers** (permission `tenant.identity-providers.configure`). Setting up an enterprise IdP requires both an admin in LabFlow and an admin on the IdP side; contact [the author](../author) for guided setup.

### Can I disable password sign-in for my tenant?

Yes — **Settings → Authentication → Allowed Providers** lets you enable / disable each provider per tenant. If you disable password, your users must use one of the federated providers or phone OTP.

### How does LabFlow handle account takeover?

Three layers: (1) password complexity + breach-list rejection (passwords from public breach lists are refused at sign-up and at change time), (2) MFA enforced per high-privilege role, (3) anomalous-sign-in detection that flags sign-ins from new countries / new device fingerprints and writes a high-severity entry to the audit log + sends an SMS / email to the user.

### What does sign-out actually do?

Sign-out revokes the local refresh token, clears Capacitor Preferences entries flagged "secure", and removes the in-memory ID token. The browser tab is left at `/login`. Server-side, the `auth_sessions` doc is marked closed; if you want to revoke *all* sessions everywhere, use **Admin → Sessions → Revoke all**.

### Does LabFlow support anonymous / guest access?

No. Anonymous Firebase Auth is intentionally disabled — every action in LabFlow needs a tenant-bound identity for audit log integrity.

---

**Next:** [Patient Management →](./patient-management)
