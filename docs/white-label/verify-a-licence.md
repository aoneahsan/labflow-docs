---
title: Verifying a licence
description: How to check a LabFlow white-label licence by its key or by the domain a deployment answers on, what each answer means, and what an answer never shows.
keywords:
  - verify LabFlow licence
  - white-label licence check
  - licence key verification
image: /img/labflow-social-card.png
last_update:
  date: 2026-11-13
---

# Verifying a licence

The [verify page](https://labflow.aoneahsan.com/verify-license/) checks a licence two ways. The answer comes from our licensing service.

**By key.** Enter the licence key from the licence email. Keys start with `LABFLOW-WL-`.

**By domain.** Enter the address a deployment answers on, such as `app.yourlab.com`. The service reads the licence file at `https://<domain>/.well-known/labflow-white-label-license.json` and checks the key it names.

## The answers

| Answer | Meaning |
|---|---|
| Valid | The licence is active. |
| Issued and being set up | Paid, and the deployment is not live yet. |
| Revoked | The licence is no longer active. |
| Domain not covered | The domain serves a licence file, but that licence does not cover it. |
| No licence file | The domain serves no LabFlow licence file. |
| Unreachable | The domain did not answer over HTTPS within five seconds. |

## What an answer shows, and never shows

It shows who the licence is for, its domains, its platforms and its dates. It never shows an email address, a phone number or the price paid, and the check never reads anything inside a deployment.

## A deployment whose licence is not active

A licensed deployment checks its own licence once when it starts and again when it is reopened. If the licence is revoked, or the domain is not covered, it shows that the licence is not active and links here. Nothing in it is deleted. If our licensing service cannot be reached, the deployment keeps working and checks again on its next start.
