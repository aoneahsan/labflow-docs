---
slug: /user-guide/referral-programme
title: Referral programme
description: How LabFlow referrals work — your referral link, when a referral counts as confirmed, points and badges, plan months banked on your account and applied to one laboratory you own, and the numbers an administrator controls.
keywords:
  - referral programme
  - referral link
  - referral rewards
  - LabFlow plan months
image: /img/labflow-social-card.png
---

# Referral programme

**`/profile/referrals`**, reached from the **Referrals** button on your profile. *"Share your link. When somebody creates a LabFlow account from it, the referral is counted here. You see how many people joined, never who they are."*

LabFlow sends nothing on your behalf. The link is the only thing the page makes.

## Your link

The link has the form `/register?ref=CODE`. It counts only for a **new** account, attached when that account is created and never more than an hour after. An account that already existed cannot be referred.

A referral is **confirmed when the account is created**: sign-in is through Google, so the address is already verified. A referral later found to be from a removed or abusive account is marked **void**; it stays counted rather than disappearing, and a correction row removes what it added.

## What a confirmed referral adds

The page states the current rule in one sentence, built from the administrator's numbers. The pieces are:

- **Points** on your account, whether or not you own a laboratory.
- **A referral badge**, dated. Badges stack: one per confirmed referral.
- **Plan months**, after a set number of confirmed referrals. They are **banked on your account**, not applied automatically.

**Applying a plan month** is an explicit step: choose **one laboratory you own**. It applies to that laboratory alone, never to every laboratory you belong to. If you own none, the month stays banked until you do. A granted month extends a paid plan you already have rather than replacing it — it applies when your current plan ends.

Everything earned is listed in an **append-only** table. Nothing is edited after it is written; a correction is its own row.

## When the programme is paused

Your link still works and a new account is still attached to it, but **nothing is awarded**. The page says so in one sentence.

## What an administrator controls

Under **Referral programme** in the platform settings (see [Platform administration](./platform-administration#platform-settings-and-maintenance)), every number is an administrator field, read by the server when a referral is confirmed:

| Field | Notes |
|---|---|
| On / off | Off stops every award |
| Points per confirmed referral | |
| Badge | *Referral (dated, stacks)* |
| Confirmed referrals per plan grant | At least 1 |
| Months granted · Plan granted | Active paid plans only |
| Cap on plan months per rolling year | Blank means no cap, the default. Over the cap, points and the badge still land; only the plan month stops |

A change applies to the next confirmed referral. **Nothing already awarded is rewritten.**
