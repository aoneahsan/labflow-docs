---
sidebar_position: 7
slug: /developers/two-factor/
title: "Two-factor"
description: "Two-factor in LabFlow: an authenticator code after sign-in, ten recovery codes, remembering a browser for seven days, and who must always enter a code."
keywords:
  - labflow api
  - laboratory api
image: /img/labflow-social-card.png
---

# Two-factor

**A six-digit code from an authenticator app after you sign in.** Staff turn it on under **Settings → Security**;
patients under **Sign-in and apps**.

## Recovery codes

After a fresh code LabFlow makes ten recovery codes and shows them once. Each signs you in once without your phone.
Using one sends you an email.

## Remember this browser

On the code screen you can tick **Remember this browser for 7 days**; it is off unless you tick it. A remembered
browser never counts for signing a report, for showing a key again, or for admin pages.

## Who must enter a code

- **Platform admins:** in every session, before any admin page.
- **Laboratory owners and managers:** again on the laboratory's admin pages.
- **Anyone signing a report:** a fresh code for every signature (21 CFR Part 11).

## Lost your phone and your codes?

Contact your laboratory's support or LabFlow support. After two independent checks, support turns two-factor off,
quotes a support reference, and LabFlow emails you.
