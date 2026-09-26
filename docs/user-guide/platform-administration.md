---
slug: /user-guide/platform-administration
title: Platform administration
description: LabFlow's platform administrator area — laboratories and suspension, people and platform roles, read-only view-as, plans and limits with enforcement off by default, platform settings and maintenance mode, the review queue and platform analytics.
keywords:
  - LIMS administration
  - multi-tenant admin
  - plan limits
  - maintenance mode
  - identity verification review
  - laboratory application review
image: /img/labflow-social-card.png
---

# Platform administration

The **`/admin`** area is for platform administrators — the LabFlow team — not for laboratory staff. A laboratory owner or manager is refused on every admin route. Platform administration is a role on the **account**, separate from any laboratory role.

Every change made here is written with a reason and recorded in the audit trail, with the value before and after where a value changed.

## The pages

| Address | What it is |
|---|---|
| `/admin` | *"Every laboratory, and what is waiting on you."* Counts, and the oldest waiting items |
| `/admin/tenants` | Laboratories — suspend and reinstate |
| `/admin/users` | People, platform roles, capabilities and view-as. Accounts appear as `a-NNNN`, never by name |
| `/admin/plans` | Plans, limits, grants and overrides |
| `/admin/advanced` · `/admin/modules` | Platform settings, maintenance mode, plan enforcement, modules and the referral programme |
| `/admin/id-verifications` · `/admin/lab-applications` | The review queue, and one case at `/:id` |
| `/admin/reports` · `/admin/revenue` · `/admin/performance` | Platform analytics, as three tabs |

`/admin/panel` redirects to `/admin`, and `/admin/permissions` to `/admin/users`.

## Laboratories and suspension

**Suspending** a laboratory stops new work and keeps everything: nobody can sign in to it, no order is accepted and no result is released. Every specimen, result, report and audit row stays as it was, and **Reinstate** undoes it. *"This is not deletion."* The server enforces it: a suspended laboratory drops out of every membership check. At sign-in, a member sees the laboratory listed but cannot enter it.

## People, roles and view-as

`/admin/users` keeps two kinds of role apart: a laboratory role belongs to a membership; the platform administrator role belongs to an account. An administrator can grant or remove the platform role with a reason, but **not on their own account**.

**View as** opens a **read-only** view of an account's laboratories, role and state in each. A banner names the account, says the view is read-only and when it ends, and the session ends by itself after **30 minutes**. You stay signed in as yourself, and nothing can be changed from the view.

## Plans and limits

`/admin/plans` is *"where the plans are actually administered"* — five capabilities, each audited:

1. **Create a plan.** Its limits start empty, which means unlimited.
2. **Edit a plan's limits.**
3. **Put a laboratory on a plan** — a grant needs an end date.
4. **Override one laboratory's limits.**
5. **Deactivate a plan** — never delete it.

The history table shows where every grant came from. The screen never takes a payment and publishes no price: paid tiers are quoted, not listed. Payment is arranged with the LabFlow team outside the application and recorded here.

**Plan enforcement has its own switch, and it is off by default.** Going over a limit never deletes anything; the laboratory's own Plan & billing settings page says which records would become read-only.

## Platform settings and maintenance

- **Modules** — Interoperability, Research and biobanking, Telemedicine, Population health. A module switched off is unavailable to everybody, including laboratories whose plan includes it, and its navigation entries disappear. This is for a broken or withdrawn module, not for commercial gating.
- **Maintenance mode** — saved with a reason and an optional *expected back* time. Everybody who is not a platform administrator sees the **`/maintenance`** screen, and the server refuses their requests until it is turned off. Administrators keep working.
- **Referral programme** — see [Referral programme](./referral-programme#what-an-administrator-controls).

## The review queue

Identity checks, laboratory applications, deletion requests and contact messages are one queue, because they are one interaction: somebody is waiting, you read what they sent, and you decide with a reason. A case with no evidence can only be answered by asking for what is missing.

Opening a submitted document (an identity document or an application's accreditation certificate) is done server-side and recorded. A decided case names its decider as `a-NNNN`.

## Platform analytics

Three tabs — Activity, Laboratory billing and Telemetry — filtered by a period of at most a year and by laboratory. **Laboratory billing** is what laboratories invoiced their own patients and insurers; it is labelled as not LabFlow's revenue. **Platform revenue is "not computed"**, because no plan carries a published price.

**Related:** [Listing a laboratory](./listing-and-my-lab) · [Compliance and audit](./compliance-and-audit)
