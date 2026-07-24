---
sidebar_position: 14
slug: /modules/user-management
title: User & Role Management Module
description: Roles, permissions, invitations, multi-tenant memberships, MFA enforcement, session management, and the full LabFlow permission matrix (177 permissions across 16 categories).
keywords:
  - LabFlow user management
  - LIMS roles permissions
  - laboratory RBAC
  - multi-tenant user invitations
  - MFA enforcement
  - permission matrix
---

# User & Role Management Module

**User & Role Management is how LabFlow decides who can do what, in which tenant, and under what authentication conditions.** It governs the whole permission surface — 177 permissions across 16 categories, 11 default roles, custom-role authoring, per-user role assignment scoped to a single tenant, invitation flows that survive across pre-existing platform accounts, MFA enforcement policies, session lifetime rules, and the audit trail every regulator asks for. The model is membership-based: a user is a global entity (one account, one identity) and has one or more **tenant memberships** that each carry an independent role assignment. A user can be a Lab Manager in Tenant A and an external Billing Clerk in Tenant B without one role leaking into the other.

Every change to a user, a role, a permission, or a membership produces a `user_audit_logs` row — including failed attempts, revocations, and self-service profile edits.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Operations / Cross-cutting |
| Required permission to view users | `users.read` |
| Required permission to invite | `users.invite` |
| Required permission to manage roles | `roles.write` |
| Firestore collections | `users`, `user_tenants`, `roles`, `role_permissions`, `permissions`, `invitations`, `auth_sessions`, `mfa_factors`, `user_audit_logs` |
| Routes | `/admin/users`, `/admin/users/:id`, `/admin/users/invite`, `/admin/roles`, `/admin/roles/:id`, `/admin/roles/new`, `/admin/permissions`, `/admin/sessions`, `/admin/audit/users` |
| Linked modules | [Authentication](./authentication), [Settings](./settings), [Admin Panel](./admin-panel) |

---

## Core concepts

| Term | Meaning |
|---|---|
| **User** | A platform-wide identity tied to one set of authentication factors (email, optional Google account, optional phone, optional MFA). |
| **Tenant membership** | A row in `user_tenants` linking a user to a tenant with an assigned role and an `active` flag. |
| **Role** | A named bundle of permissions. Default roles are tenant-cloned at provisioning; custom roles are tenant-owned. |
| **Permission** | An atomic capability (e.g. `results.approve`, `inventory.po.write`). Permissions live in a global registry; roles reference them. |
| **Invitation** | A short-lived email token that creates a user (if new) or attaches a tenant membership (if existing). |
| **Session** | One authenticated browser / device. Sessions carry their own MFA-passed state. |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/admin/users` | Filterable user list (status, role, last-seen, MFA enrolment) | `users.read` |
| 2 | `/admin/users/:id` | User detail — profile, memberships, MFA factors, active sessions, recent audit | `users.read` |
| 3 | `/admin/users/invite` | Send a new invitation | `users.invite` |
| 4 | `/admin/roles` | All roles (default + custom) | `roles.read` |
| 5 | `/admin/roles/:id` | Role detail — assigned permissions, members, history | `roles.read` |
| 6 | `/admin/roles/new` | Author a custom role from the permission registry | `roles.write` |
| 7 | `/admin/permissions` | Read-only permission catalogue with descriptions | `roles.read` |
| 8 | `/admin/sessions` | Active sessions across the tenant — revoke individually | `users.sessions.revoke` |
| 9 | `/admin/audit/users` | Filterable user-management audit log | `users.audit.read` |

---

## The 11 default roles

Every tenant is provisioned with these roles. They cover the conventional laboratory hierarchy. Tenants may rename, edit, or delete them — but deleting a role that is currently assigned to members requires a reassignment step first.

| # | Role | Typical responsibilities | Notable default permissions |
|---|---|---|---|
| 1 | **Super Admin** | Cross-tenant administrator (LabFlow operator) | All permissions across all tenants; only granted at the platform level |
| 2 | **Lab Director** | Tenant-wide ownership; signs off on accreditation | `*` within the tenant |
| 3 | **Lab Manager** | Day-to-day operations, QC sign-off, billing oversight | `qc.override`, `results.approve`, `billing.reports.read`, `users.invite`, `inventory.read` |
| 4 | **Senior Pathologist** | Result review and approval; clinical sign-off | `results.review`, `results.approve`, `results.addendum`, `results.read` |
| 5 | **Pathologist** | Result entry and review | `results.write.draft`, `results.review`, `results.read` |
| 6 | **Senior Technologist** | Sample processing, instrument operation, QC entry | `samples.write`, `qc.enter`, `qc.run.edit`, `results.write.draft` |
| 7 | **Technologist** | Sample processing, instrument operation | `samples.write`, `qc.enter`, `results.write.draft` |
| 8 | **Phlebotomist** | Sample collection (in-lab and home) | `samples.collect`, `home-collection.collect`, `appointments.walk-in` |
| 9 | **Receptionist** | Patient registration, appointments, billing intake | `patients.write`, `appointments.write`, `orders.write`, `billing.payments.write` |
| 10 | **Billing Clerk** | Invoicing, claims, payments | `billing.invoices.issue`, `billing.payments.write`, `billing.claims.submit`, `billing.refunds.write` |
| 11 | **External Clinician** | Read-only access to their own referrals | `orders.read.own`, `results.read.own`, `patients.read.own` |

Each default role ships with a tested permission set. The default sets are versioned — if LabFlow ships a new permission as part of a release, default roles in existing tenants are *not* auto-updated; the tenant's Admin Panel surfaces a "role update available" banner with a diff so the change is explicit.

---

## The 16 permission categories (177 permissions)

Permissions are namespaced by module so a custom-role editor can scope a search. The full catalogue lives at `/admin/permissions` and ships with a one-line description per permission. The category counts:

| # | Category | Approx. permissions | Source module |
|---|---|---:|---|
| 1 | `users.*` | 12 | This module |
| 2 | `roles.*` | 6 | This module |
| 3 | `patients.*` | 14 | [Patient Management](./patient-management) |
| 4 | `tests.*` | 10 | [Test Catalog](./test-catalog) |
| 5 | `orders.*` | 12 | [Test Orders](./test-orders) |
| 6 | `samples.*` | 11 | [Sample Tracking](./sample-tracking) |
| 7 | `results.*` | 14 | [Results Management](./results-management) |
| 8 | `qc.*` | 11 | [Quality Control](./quality-control) |
| 9 | `billing.*` | 17 | [Billing & Insurance](./billing-insurance) |
| 10 | `inventory.*` | 18 | [Inventory](./inventory) |
| 11 | `appointments.*` | 11 | [Appointments](./appointments) |
| 12 | `home-collection.*` | 11 | [Home Collection](./home-collection) |
| 13 | `reports.*` | 8 | [Reports & Analytics](./reports-analytics) |
| 14 | `settings.*` | 9 | [Settings](./settings) |
| 15 | `admin.*` | 8 | [Admin Panel](./admin-panel) |
| 16 | `integrations.*` | 5 | EMR Integration (Batch 08) |

Every permission has a stable string ID (e.g. `qc.override`) that never changes once shipped. Renames are forbidden — deprecation is the only path forward, with a deprecation banner in the registry for 90 days before retirement.

---

## Invitation form — every field

The `/admin/users/invite` form sends an email-bound invitation link. The link is single-use and expires after the tenant's configured TTL (default 7 days).

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Email | text | required | RFC 5322 | If a platform-wide user with this email already exists, the invitation attaches a new membership instead of creating a fresh account |
| Display name | text | required-if-new | 2–80 chars | Pre-filled when the platform already has the user |
| Role | search-select | required | tenant role | The invitee receives this role for the tenant |
| Sites (optional scoping) | multi-select | optional | active sites for the tenant | Restricts the membership to specific sites |
| Welcome message | textarea | optional | 0–500 chars | Prepended to the invitation email |
| MFA required on first login | boolean | required | default `true` for clinical roles, `false` otherwise | Enforced before the user can access any non-auth screen |
| Expires in (days) | integer | required | 1 ≤ d ≤ 30 | Defaults to tenant TTL |

On submit, the system writes an `invitations` row, fires the email through [Communication Hub](/docs/modules#communication-hub) (template `invitation_email`), and surfaces the invitation in a "Pending invitations" panel where the inviter can resend, copy a fresh link, or revoke. Resend issues a brand-new token; the previous one is invalidated immediately.

---

## Role editor — every option

The `/admin/roles/new` and `/admin/roles/:id/edit` screens share one editor. Each pane:

### Identity

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Name | text | required | 2–60 chars | Unique within the tenant |
| Description | textarea | required | 5–500 chars | Surfaced in the user-detail page next to the role badge |
| Inherits from | search-select | optional | another role in the tenant | Hierarchical inheritance is a single-step "start from this role's permissions" — there is no live override chain |
| Active | boolean | required | default `true` | Inactive roles cannot be assigned to new memberships; existing members keep the role until reassigned |

### Permissions

The permission picker is a virtualised tree (per-category sections, search + filter, batch enable / disable). Picking a category checkbox enables every permission in that category; unchecking takes them all back. Each permission has a one-line description and a "used by N default roles" hint.

| Sub-control | Purpose |
|---|---|
| Search box | Substring match against permission ID + description |
| Category accordion | Expand / collapse a category |
| "Sensitive" filter | Filters to permissions marked `sensitive: true` (e.g. `qc.override`, `results.approve`, `inventory.expired-lot-override`, `home-collection.accession.override`, `billing.refunds.approve`) |
| Diff with default | Shows which permissions deviate from the role's seeded default set |
| Bulk toggle by category | One-click enable / disable for every permission in a category |

### Scope

| Field | Type | Required | Notes |
|---|---|---|---|
| Site scope | enum | required | `all-sites` / `specific-sites` |
| Selected sites | multi-select | required-if-specific | Active sites for the tenant |
| Row-level scope on patients | enum | required | `all-patients` / `assigned-patients-only` |
| Row-level scope on orders | enum | required | `all-orders` / `own-orders` / `same-site-orders` |

Scope rules are enforced in Firestore security rules and in the front-end query layer. The "Permissions" tab inside the user detail page surfaces the effective scope per user so an admin can see why a given user does not see all rows.

---

## MFA policy

MFA is opt-in by default, role-required by configuration, and platform-required for sensitive permissions regardless of the role's policy.

| Layer | Behaviour |
|---|---|
| Per-role | Role's `mfaRequired: true` means every member must complete MFA enrolment before first access |
| Per-permission | Any permission marked `mfaSensitive: true` (e.g. `results.approve`, `qc.override`, `billing.refunds.approve`) triggers a re-prompt at use time, regardless of session MFA state |
| Tenant policy | Tenant-wide "Require MFA for all users" overrides per-role; defaults to `true` for tenants in HIPAA-regulated jurisdictions |
| Available factors | TOTP (authenticator app), SMS OTP (with rate-limit), platform biometric (Capacitor mobile only), recovery codes |
| Reset flow | Admin with `users.mfa.reset` can revoke a user's enrolment; the user must re-enrol on next login, captured in the audit log |

The MFA cadence within a session is configurable: `every-action` for fully-locked-down tenants, `once-per-session` (default), or `once-per-day-per-device`. The cadence governs how often the MFA re-prompt fires for `mfaSensitive` actions inside an authenticated session.

---

## Session management

The `/admin/sessions` screen surfaces every active session in the tenant with: user, device (parsed from the user-agent), IP (last seen), location-on-first-login, MFA-passed flag, last-seen timestamp, and a "Revoke" action. Revoking flips the session's `revokedAt` timestamp; the front-end token middleware rejects the next request and the user is logged out.

Tenant policies govern session lifetime:

| Policy | Default | Range |
|---|---|---|
| Absolute lifetime | 12 hours | 1 h – 30 d |
| Inactivity timeout | 30 minutes | 5 m – 24 h |
| Force re-auth on permission change | `true` | toggle |
| Force re-auth on role change | `true` | toggle |
| Concurrent session limit per user | unlimited | unlimited / N |

A user logging in from a brand-new device receives an email notification ("New device on your LabFlow account") — the email template is owned by [Communication Hub](/docs/modules#communication-hub) and is not user-configurable beyond brand colours.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read users | `users.read` |
| Read user details (PII) | `users.read.pii` |
| Invite a user | `users.invite` |
| Edit a user's display name / phone | `users.write` |
| Deactivate a user | `users.deactivate` |
| Reactivate a deactivated user | `users.reactivate` |
| Reset a user's MFA enrolment | `users.mfa.reset` |
| Revoke a session | `users.sessions.revoke` |
| Read roles | `roles.read` |
| Author / edit / delete a custom role | `roles.write` |
| Assign a role at invitation | `roles.assign` |
| Reassign a user's role on an existing membership | `roles.reassign` |
| Read users audit log | `users.audit.read` |

---

## Frequently asked questions

### Can a user belong to more than one tenant?

Yes. A user's identity is platform-wide (one account, one email, one MFA enrolment); their **memberships** are per-tenant. Each membership has its own role, scope, and active flag. Switching between tenants is a one-click action in the navbar tenant switcher. There is no shared inbox or data view across tenants — each membership is fully isolated.

### How are LabFlow's defaults different from a "build your own roles" RBAC?

LabFlow ships 11 default roles seeded with tested permission sets so tenants can run on day one without designing an access model. Custom roles are first-class — every default role can be cloned, every permission is in a published registry, and every change is audit-logged. The default seed is a starting point, not a constraint.

### Why are renames forbidden on permission IDs?

Once a permission has been shipped, customers' custom roles reference it by ID. Renaming would silently break those references on upgrade. The contract is: introduce a new ID, deprecate the old one with a 90-day banner on the role editor, and remove only after deprecation. The same rule applies to role IDs — renaming the user-facing label is allowed, the underlying ID is not.

### What happens when an admin removes a permission a user currently relies on?

If `Force re-auth on permission change` is on (default), the affected user's sessions are flagged stale; the next request triggers a forced re-auth and the user lands back at the screen with the now-applicable permissions. If the user is mid-action when the change happens, the in-progress request completes (it had the old permission at issue time) but the next API call evaluates against the new set. The audit log captures the change.

### Are role and permission changes auditable?

Every change writes to `user_audit_logs` with: the user who made the change, the user / role / permission affected, the before-value, the after-value, the timestamp, the source IP, and the originating session ID. The audit log is read at `/admin/audit/users` (filterable by actor, target, action type, date range) and is included in the [Reports & Analytics](./reports-analytics) accreditation-pack export.

### Does LabFlow integrate with SSO / SAML / SCIM?

The current default authentication surface is Firebase Authentication (email, Google OAuth, phone OTP, biometric). Enterprise SSO (SAML 2.0 / OIDC via providers like Okta, Azure AD, JumpCloud) and SCIM provisioning are deployment-level extensions, not part of the bundled product. Tenants on those plans wire their IdP to Firebase Auth's identity-platform layer; the membership and role model on the LabFlow side is unchanged.

### How does row-level scope ("assigned patients only") actually work?

`patients` collection queries include an implicit filter at the security-rules layer: when the requesting user's effective role has `patientScope: assigned-patients-only`, the query is rewritten to `patients.assignedTo array-contains <userId>`. Front-end pages also pre-apply this filter so the user never sees a "permission denied" toast for results they shouldn't have queried. Assignment is updated by users with `patients.assign` — typically Lab Manager or Receptionist roles.

### Can I temporarily elevate a user's permissions ("just-in-time access")?

Not as a built-in concept. The right approach is to add a permission to the user's existing role for the duration needed, or to assign a higher-privilege role and reassign back. Both changes are audit-logged. A future release may add a TTL-bound permission grant; until then, the explicit reassignment pattern is the recommended path because it leaves a precise audit trail of who held what when.

---

**Next:** [Settings module](/docs/modules/settings).
