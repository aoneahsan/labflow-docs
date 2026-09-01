---
sidebar_position: 12
slug: /user-guide/users-and-access
title: Users and access
description: Managing a laboratory's people in LabFlow — the ten roles, release scope per discipline, who may grant what, withdrawing and restoring access without deleting a membership, and the append-only membership trail.
keywords:
  - user management
  - laboratory roles
  - release scope
  - withdraw access
  - membership audit trail
  - invite user
image: /img/labflow-social-card.png
---

# Users and access

**`/users`** lists the laboratory's people. **`/users/new`** invites one, **`/users/:userId`** shows a membership and **`/users/:userId/edit`** changes it.

The page is available to a **laboratory owner or laboratory manager**. It is not on the navigation for anyone else, because offering a door that answers "forbidden" is worse than not offering it.

## The membership is the record

A person's access to a laboratory **is** their membership row, and it carries the role, the release scope, who granted it, and when they were last active.

**It is never deleted.** Access is *withdrawn* — the row stays, so every result that person entered still names a record that exists. Restoring returns both the role and the release scope.

The address uses a printable reference (`u-1001`). **No name, email or employee number ever travels in a LabFlow URL.**

## The ten roles

| Role | |
|---|---|
| **Technician** | At the bench. Enters and checks results all shift |
| **Senior technician** | Checks other people's work and owns the rule set |
| **Pathologist** | Signs out cases. Reads the patient, not the worklist |
| **Phlebotomist** | Away from the bench most of the day. Collection and custody only |
| **Receptionist** | The front desk. Registers people and takes payment |
| **Laboratory manager** | The only persona whose home really is a dashboard |
| **Quality officer** | Audits the laboratory. Reads everything, enters nothing |
| **Billing clerk** | Never touches a specimen. Money and stock only |
| **Laboratory owner** | Owns the tenant and the public listing. A marketplace persona |
| **Platform admin** | Across every tenant. The only persona that is not laboratory staff |

**Four of them may release a result**: senior technician, pathologist, laboratory manager and quality officer.

## Release scope

Beside the role sits the **release scope** — which of the laboratory's departments this person may release within. It uses the same nine-department vocabulary as the setup wizard and the public listing.

An empty scope means **enters only**.

## Who may grant what

Bounded, and enforced on the server rather than only offered by the screen:

- **`platform_admin` is never granted here.**
- **`lab_owner` only by a laboratory owner.**
- Under the "any verified user" invitation policy, a person who is neither owner nor manager may grant only the laboratory's **default invitation role**.

The same rules run in the browser (to offer) and in the server function (to refuse).

## Invitations

An invitation resolves or creates the account and sends the email. **An invitation whose email fails to send is removed**, so no partial invitation is left behind.

It is accepted by signing in with that address and choosing the laboratory. There is no second confirmation screen — signing in proved the address.

## The membership trail

Every change is appended to a trail nothing can edit: `invited` · `accepted` · `signed_in` · `role_changed` · `scope_changed` · `scope_cleared` · `access_withdrawn` · `access_restored`.

It is written by a database trigger, so **every** writer is recorded — not only the ones that went through this page. No client role can insert, update or delete a row in it.

Identity events are not copied here; they are read from the [identity verification](./profile-and-identity) record, which owns that fact.
