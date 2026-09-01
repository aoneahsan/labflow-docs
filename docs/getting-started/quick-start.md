---
sidebar_position: 1
slug: /getting-started/quick-start
title: Create an account
description: How to get into LabFlow — Google sign-in through Supabase with no password, choosing which laboratory you are working in, and what happens when an account has no membership yet.
keywords:
  - LabFlow sign in
  - LabFlow account
  - Google sign-in
  - laboratory membership
  - LabFlow getting started
image: /img/labflow-social-card.png
---

# Create an account

LabFlow is a hosted product. There is nothing to install and nothing to download — open **[labflow.aoneahsan.com](https://labflow.aoneahsan.com)** and sign in.

## There is no password

**LabFlow holds no password of its own.** Sign-in is a Google account, through Supabase, and nothing else. Your laboratory listed one specific Google address against your user record, and that address is your key.

Four consequences, all deliberate:

1. **A password LabFlow never receives is one it cannot leak.** There is no credential table, no reset token and no password-hash migration.
2. **Revoking access is one action in one place, and it is immediate.** A laboratory removes someone at `/users` and the door shuts — no rotation, no shared bench login, no account left alive because nobody remembered it.
3. **Two-step verification is Google's, and it already applies.** Whatever your organisation requires of the account — a security key, a prompt on a managed phone — is enforced before LabFlow is reached, without LabFlow implementing any of it.
4. **It is a single point of dependency, and that is a real cost.** A laboratory whose staff have no Google accounts cannot use LabFlow, and an outage at Google is an outage at the front door.

## Two steps: the account, then the laboratory

Signing in at `/login` has two steps.

**Step 1 — your account.** Continue with Google. LabFlow asks for your name, your email address and your profile picture. Nothing else.

**Step 2 — the laboratory.** One Google account can hold memberships in several laboratories, so you pick the one you are working in. **There is no default**, because guessing it wrong shows one laboratory's data to somebody working in another. Your role, and everything you can see, follows from the laboratory you pick.

That sign-in is recorded as an event, with your role **stamped on the row** rather than looked up later — a role read at query time answers "what can this person do now", which is the wrong question about something that happened in March.

## Registering

`/register` is the same Google step for somebody who has not used LabFlow before. It collects a little context first — your name, your town, your job title — and hands it forward, so the setup wizard arrives pre-filled rather than blank.

After registering you land on `/onboarding`. See [create or join a laboratory](./create-or-join-a-laboratory).

## When the account works but LabFlow says you have no access

This is not an authentication failure. It means the account you signed in with is not on any laboratory's user list — most often a personal address used instead of the work one, or a record that has not been created yet.

**Only the laboratory can fix it**, and only a `lab_manager` or `lab_owner` there. Nobody at LabFlow can grant access to a laboratory's data on its behalf; that is the boundary working, not a limitation of a support desk. The `/forgot-password` page covers the three shapes this takes: you cannot get into the Google account, you do not remember which account you used, or the account is fine and has no membership.

## Accepting an invitation

There is no second screen for it. An invitation is accepted by **signing in and choosing that laboratory** — you proved you hold the address by signing in, so there is nothing further to confirm.

## When a laboratory has withdrawn your access

Nothing is wrong with your account. It signed in correctly and your other memberships are unaffected; somebody at that laboratory removed you from its user list, which shuts that one door and touches nothing else. Only that laboratory can restore it.

Access is **withdrawn, never deleted** — every result you entered still names a record that exists. Restoring returns both your role and your release scope.

**Next:** [Create or join a laboratory →](./create-or-join-a-laboratory)
