---
slug: /getting-started/android-app
title: The Android app
description: LabFlow's Android app — the same application as the website in a native shell, with Google sign-in through the system browser, signed over-the-air updates, Play in-app updates and a review prompt. Built, not yet released on Google Play or verified on a device.
keywords:
  - LabFlow Android
  - LIMS Android app
  - Capacitor Android
  - over-the-air updates
image: /img/labflow-social-card.png
---

# The Android app

:::warning Not released yet
The Android app is **built but not published**. It is not on Google Play, and it has **not yet been verified on a physical device**. Until both happen, use LabFlow in a browser at [labflow.aoneahsan.com](https://labflow.aoneahsan.com). This page describes what the app does once it is released.
:::

The Android app is **the same application as the website**, packaged in a native shell (Capacitor). The screens, roles and data are identical; there is no reduced mobile edition. The package name is `com.aoneahsan.labflow`.

There is **no iOS app**, in any form.

## What the native shell adds

| Capability | What it does |
|---|---|
| **Google sign-in through the system browser** | Google refuses sign-in inside an embedded web view, so the app opens the phone's browser and returns to the app on `labflow://auth/callback` |
| **Over-the-air updates** | A new web build reaches the app without a store release. Every update is signed and its signature checked before it is installed. The app asks before installing; it never updates silently |
| **Play in-app updates** | When a newer store version exists, the app offers it. This works only on a build installed from Google Play |
| **In-app review prompt** | Asked at most rarely: after at least five launches, at least three days after the first, and never twice within 120 days |

None of these load on the website.

## Permissions

The app asks for network access and nothing sensitive: no camera, location, contacts or storage permission. It declares the Advertising ID for analytics only and **contains no ads**.

## Links

Links to `labflow.aoneahsan.com` open in the app on a build from Google Play once the Play signing fingerprint is published; until then they open in the browser. The `labflow://` scheme works either way.

**Related:** [Quick start](./quick-start) · [Finding your way around](./finding-your-way-around)
