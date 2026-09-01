---
sidebar_position: 14
slug: /user-guide/settings
title: Settings
description: LabFlow settings — one parameterised model covering workspace, personal, security and organisation sections, including MRN issuance, custom fields, validation rules and two-factor authentication.
keywords:
  - LabFlow settings
  - laboratory settings
  - two-factor authentication
  - MRN issuance
  - custom fields
image: /img/labflow-social-card.png
---

# Settings

**`/settings`** is the general section; every other section is `/settings/<section>`, and security has its own subsections at `/settings/security/<subsection>`.

Settings are **one model and one form**, parameterised per section, rather than a page hand-rolled per topic. The rail, the mobile menu and the route table are all generated from the same registry, so a link can never exist in one and not the others.

## The sections

| Group | Sections |
|---|---|
| **Workspace** | General · Laboratory · Custom fields · Validation rules |
| **You** | Notifications · Display · Keyboard · Biometric sign-in |
| **Security** | Security, with subsections: Two-factor · Password · Sessions · Security keys · Alerts |
| **Organisation** | Administration · Plan and billing · Integrations · Updates |

## Settings worth knowing about

**General** carries the workspace display name, the time zone, language and formatting, measurement units, the first day of the week, and where sign-in lands.

**Laboratory** carries the registered legal name, the licence number, the accession prefix and check-digit setting, and whether the laboratory accepts specimens from other sites.

**Administration** decides who may invite a colleague, the default role for an invited user, the inactivity sign-out, and whether bulk export of patient data is allowed.

**Two-factor authentication is real.** Enrolling an authenticator app produces a genuine TOTP factor on your account, verified before it is active, and it can be removed the same way.

**Forced password rotation is off, deliberately.** Rotation makes people pick a weaker password with a number on the end and write it down; length and a second factor do more than a calendar does.

:::note Where the security surface is honest about itself
LabFlow's own sign-in is Google only, so a mistyped password is refused by Google before this product sees anything — there is no failed sign-in here for it to report. Several controls in this area say plainly that they are not finished: **recovery codes are not issued yet**, **security keys are not registrable yet**, and a **per-device list is not available**. A session is not a device, and the page says so rather than implying otherwise.
:::

## Sections whose subject is not built

Some sections in the rail describe areas that later waves deliver — **Plan and billing**, **Integrations** and **Administration** among them. The settings surface is built; what those settings will govern is on the [roadmap](../roadmap).
