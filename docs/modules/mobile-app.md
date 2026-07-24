---
sidebar_position: 20
slug: /modules/mobile-app
title: LabFlow Mobile App (Capacitor)
description: The Capacitor-based LabFlow mobile app for Android and iOS — phlebotomist home-collection workflow, sample tracking, push notifications, biometric unlock, offline-first design.
keywords:
  - LabFlow mobile app
  - LIMS Android iOS
  - Capacitor lab app
  - phlebotomist mobile
  - mobile sample collection
  - biometric login lab
  - offline lab app
---

# LabFlow Mobile App (Capacitor)

**The LabFlow mobile app is one of LabFlow's five product surfaces — a Capacitor-built Android and iOS application that brings the lab workflow to the people who don't sit at desks: phlebotomists doing home visits, technologists walking between benches, dispatchers checking routes between calls, and patients viewing their own results.** It is not a re-skinned web view of the desktop; it is a feature-curated surface optimised for the things that have to work on a phone — barcode-scanning, GPS-aware home-collection events, push-notified critical-result acknowledgement, biometric-unlocked authentication, and an offline-first IndexedDB outbox that lets a phlebotomist clear a full shift in a 4G dead zone.

Distribution to the Apple App Store and Google Play Store is pending. The current installable surface is a development build for internal testing; the public store listings are noted on the [LabFlow homepage](https://labflow.aoneahsan.com) and will replace this page's status banner once they go live.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Surface (consumes every module) |
| App ID | `com.aoneahsan.labflow` |
| Platforms | Android (min SDK 22), iOS (min iOS 14) |
| Framework | Capacitor (React + TypeScript shared with the web app) |
| Local storage | `@capacitor/preferences` for small KV; IndexedDB (Dexie) for outbox + cached records |
| Auth | Firebase Auth (email + Google + phone OTP) + biometric unlock via Capacitor biometric plugin |
| Push | Firebase Cloud Messaging (Android), APNs (iOS) — bridged by OneSignal in the integrations layer |
| Map / routing | Mapbox SDK for native maps + the same Mapbox routing service used in [Home Collection](./home-collection) |
| Distribution status | Pending — Play Store + App Store submissions in flight |

---

## Audiences and what each one uses

The app is multi-persona — the screens a user sees depend on their role.

| Persona | Primary use | Screens visible |
|---|---|---|
| **Phlebotomist** | Run the day's home-collection route end-to-end | Today's route, visit detail, chain-of-custody actions, barcode scan, cool-box probe pair, signature capture |
| **Technologist** | Quick sample lookup and status push | Sample search, sample detail, result-ready push notifications, quick-comment |
| **Lab Manager** | On-the-go status checks | Dashboard tiles, alert acknowledgement, QC override action (with `qc.override`), live tracking map |
| **Receptionist** | Light-touch front-desk on a tablet at a satellite site | Patient check-in, walk-in queue, instant-slot assignment |
| **Patient** | Self-service results, appointments, payments | Result viewer, appointment booking + reschedule, invoice payment portal hand-off |
| **Clinician (external)** | Read-only own-referrals + critical-result acknowledgement | Referred-patient list, result view, critical-result acknowledge |

A user with multiple roles sees the screens for each role, gated by the permission checks in [User Management](./user-management).

---

## Screens

### Phlebotomist surface (read this if you're configuring a phlebotomist user)

| # | Screen | Purpose |
|---|---|---|
| 1 | Today's route | The ordered list of the day's visits with statuses |
| 2 | Visit detail | Patient summary, tests to draw, special instructions, chain-of-custody actions |
| 3 | Identity check | Read-back patient name + DOB; optional ID-photo capture |
| 4 | Tube draw | Per-tube barcode scan or print-from-Bluetooth, draw notes, haemolysis flag |
| 5 | Cool-box pair | Bluetooth probe pair with cool-box ID + reading |
| 6 | Departure / return | Geofence-driven plus manual confirmations |
| 7 | Incident log | Free-text + reason-enum entry for off-script events |
| 8 | Settings | Per-user preferences and the offline sync banner |

### Cross-role surface

| # | Screen | Purpose |
|---|---|---|
| 9 | Login | Email + password, Google OAuth, phone OTP, biometric unlock |
| 10 | Tenant switcher | If the user belongs to >1 tenant |
| 11 | Notifications | In-app inbox mirroring [Communication Hub](./communication-hub) sends |
| 12 | Search | Cross-module quick search (patients, orders, samples, results — permission-scoped) |
| 13 | Profile | Display name, photo, channel preferences, MFA factors |
| 14 | Result viewer (patient) | Patient-facing result list and PDF download |
| 15 | Appointment booking (patient) | The same booking wizard as the web app, mobile-laid-out |
| 16 | Critical-result acknowledgement (clinician) | Push-deep-link landing page with single-tap acknowledge |

---

## Native capabilities used (Capacitor plugins)

The app uses the deliberately narrow set of plugins the workflow actually needs. Every plugin choice was made against LabFlow's banned-plugins list (Crashlytics and Performance are explicitly **not** used per the global rules — see [project standards](https://labflow.aoneahsan.com)).

| Plugin | Use |
|---|---|
| `@capacitor/preferences` | Small-KV storage (auth state, user prefs). The single allowed local-storage path — `localStorage` and `sessionStorage` are forbidden in this codebase. |
| `@capacitor/geolocation` | GPS for home-collection geofence enter / exit |
| `@capacitor/camera` | Patient-ID photo, tube photo on rejection, signature stage |
| `@capacitor/barcode-scanner` | Tube and cool-box barcode reading |
| `@capacitor/push-notifications` | FCM (Android) and APNs (iOS) — surface critical-result and route-assigned notifications |
| `@capacitor/local-notifications` | Reminder notifications scheduled locally (e.g. T-30m visit reminder for the phlebotomist) |
| `@capacitor/network` | Online / offline state — drives the sync banner and the outbox replay trigger |
| `@capacitor/filesystem` | Cache patient-report PDFs after first download for quick re-open |
| `@capacitor/share` | Share a result PDF with another app (patient surface) |
| `@capacitor/app` | Background / foreground state for the sync scheduler |
| Capacitor biometric plugin | Face ID / Touch ID / Android biometric unlock on top of an active Firebase Auth session |
| `@capacitor/clipboard` | Copy-to-clipboard for one-tap MRN / barcode share |
| Privacy-screen plugin | Blanks the screen in the iOS app switcher and the Android recents — a HIPAA-friendly default that ships **enabled** |

Plugins are lazy-loaded where their cost is non-trivial (the barcode scanner imports its native UI on first use, not on app boot) to keep cold-start under target.

---

## Offline-first design

The mobile app's offline model is purposefully narrow: chain-of-custody events for home-collection visits, small media attached to those events, and the day's pre-fetched route data. Catalog reads, patient searches, and route adjustments all require connectivity. This trade-off keeps the offline state machine small enough to reason about while covering the failure modes that actually happen in the field — a 5-minute dead zone in a basement, not a 24-hour offline day.

### What is cached offline

| Data | Cached when | Lifetime |
|---|---|---|
| Today's route + per-visit metadata | On dispatch confirmation | Until end-of-shift |
| Patient summary (name, DOB, MRN) for each visit | With the route | Same |
| Test list + special instructions per visit | With the route | Same |
| Catalog test definitions referenced by the route | With the route | Same |
| Active outbox of unsynced events | Continuously | Until sync succeeds |
| Patient-report PDFs (patient surface) | After first download | 7 days; LRU eviction at 50 MB |

### Outbox sync model

Every event the phlebotomist logs writes through a local outbox keyed on a client UUID:

1. The UI optimistically updates from the local doc.
2. If online, the canonical write to Firestore is attempted in the same tick. Success → mark the outbox row `synced`.
3. If offline, the outbox row sits with `synced = false` and a queued-write timestamp.
4. On reconnect (Capacitor Network plugin `connectionChange` event), the sync service runs through pending outbox rows in chronological order; each row's canonical write is idempotent because the client UUID is the deduplication key, so replaying twice never produces two `arrived` events.
5. Photos and signatures captured offline are stored as IndexedDB Blobs; the sync service uploads them to FilesHub on reconnect and patches the event row with the resulting object ID.

A "Sync in progress (N pending)" banner shows during replay; a "Last synced HH:mm ago" banner shows on the dashboard at all times to make the sync state visible without the user having to dig for it.

---

## Authentication and biometric unlock

The auth model is Firebase Auth (per LabFlow's auth standard) plus a Capacitor biometric layer on top.

Flow on app launch with an existing user:

1. Firebase Auth's persisted session is read. If present, the user is "authenticated" at the token level.
2. The app checks the tenant's session policy from [User Management](./user-management#session-management) — absolute lifetime, inactivity timeout.
3. If the policy says the token is valid AND the user has biometric unlock enabled, the app prompts for biometric. A pass continues; a fail (or two refusals) falls back to password.
4. MFA-sensitive permission usage prompts at use time per the [User Management](./user-management#mfa-policy) cadence — the biometric prompt is the second factor on subsequent re-prompts within a session.

Biometric setup is opt-in. The biometric handshake stores a randomly generated unlock secret in the OS keychain (iOS Keychain Services, Android Keystore); the secret is consumed by the auth layer to release the Firebase Auth token. The user's email and password are never written to disk. A user who replaces their device begins a fresh biometric enrolment.

---

## Push notifications

Push delivery follows the [Communication Hub](./communication-hub) channel selection — when the hub picks `push` for an event, it emits to OneSignal which then fans out to FCM (Android) / APNs (iOS). The mobile app subscribes its OneSignal player ID against the user's account at first launch and on every login.

The supported push types:

| Push | Payload includes | Tap action |
|---|---|---|
| Route assigned | Route ID, visit count | Open today's route |
| Visit reminder (T-30m) | Visit ID | Open visit detail |
| Result critical released | Result ID, analyte, value | Open critical-acknowledge screen |
| Sample rejected (own collection) | Sample ID, reason | Open sample detail |
| Appointment confirmation reply (staff side) | Appointment ID | Open appointment detail |
| QC out-of-control (Lab Manager) | Run ID, analyte, analyzer | Open QC run detail |

Tapping a push deep-links into the relevant screen via Capacitor's `App` plugin; if the user is not logged in, the deep link is queued until login completes.

---

## Privacy + HIPAA-conscious defaults

| Default | Behaviour | Why |
|---|---|---|
| Privacy screen | App content is masked in the iOS app switcher and Android recents | Prevents shoulder-surfing of patient data in a shared workspace |
| No clipboard auto-copy of MRN / barcode | The user must explicitly tap "Copy" | Avoids accidental clipboard leakage |
| No barcode mirroring across users | The scan target is the actively-open visit only | Prevents picking up another visit's tube |
| Background fetch disabled by default | The app does not refresh in the background | Matches HIPAA's data-minimisation expectation; results are pulled on foreground |
| Crash reports redacted | Errors go to Sentry (Crashlytics is banned); patient names, DOBs, results, and SSNs are scrubbed before send | Per LabFlow's HIPAA-conscious-error rule |

---

## Performance targets

| Metric | Target |
|---|---|
| Cold start to interactive (Android, mid-tier device, release build) | < 2.5 s |
| Cold start to interactive (iOS, current-gen device, release build) | < 1.5 s |
| Barcode scan → recognised | < 600 ms |
| Geofence-enter detection → "arrived" event written | < 5 s after physical entry |
| Outbox replay throughput | 50 events / s once online |
| Memory at idle | < 120 MB |

Performance is measured against the release build, never the dev build. Profiling notes live in the project's internal [`docs/work-history`](https://github.com/aoneahsan/labflow-docs).

---

## Frequently asked questions

### Is the mobile app available on the App Store and Play Store?

Not yet. The current installable surface is a development build for internal testing. Submissions to the Apple App Store and the Google Play Store are in flight; the [LabFlow homepage](https://labflow.aoneahsan.com) carries the live status. Until the store listings go live, the page describes the implemented capability rather than a downloadable product.

### Why Capacitor instead of React Native or pure native?

Capacitor lets the mobile app share the entire React + TypeScript codebase with the LabFlow web app — every Firestore query, every Zustand store, every form schema is one source of truth. The native bridge is opened only for capabilities a webview cannot reach (camera, geolocation, barcode, biometric, push). The maintenance cost of one codebase across three platforms (web + Android + iOS) is materially lower than maintaining three codebases, and the lab workflow does not need the additional native rendering performance pure-native or React-Native would buy.

### What about Crashlytics for crash reports?

Crashlytics is **banned** in this project per the global standards. The reason: the Capacitor Crashlytics plugin requires Gradle wiring and Firebase Console manual configuration, and historically produced noisy false errors and APK-size cost in our deployments. LabFlow uses Sentry for error tracking instead. Performance monitoring uses native OS profilers and Amplitude for user-flow timing, not Firebase Performance.

### How does the app handle a phlebotomist on a 24-hour offline day?

Honestly: not gracefully, and that's intentional. The offline budget is bounded — the day's route, the pre-fetched patient and catalog data, and outbox capacity for a few hundred chain-of-custody events. A full 24-hour offline scenario would exhaust the outbox and prevent fresh route lookups. The mitigation is dispatcher-side — if a connectivity outage is known in advance, the dispatch flow can pre-emit the full route to all phlebotomists' devices. Day-of catastrophes (a cell tower down) are out of scope; the route shifts to manual paper records that are back-entered when connectivity returns.

### Does the app support tablets?

Yes. The patient-check-in and walk-in-queue screens are designed for tablet form factors (10-inch landscape primary). Other screens scale to tablet but are not redesigned — a Lab Manager using a tablet sees the phone layout enlarged. Tablet-specific redesigns are scheduled for after the Play Store / App Store launches stabilise.

### How is the patient surface separated from the staff surface?

Authentication-time role check. A user signing in with a "patient" role lands on the patient surface (results, appointments, payments) and cannot access staff screens. A staff user signing in lands on the staff surface for their role. The same app binary contains both surfaces — feature gates and permission checks drive what the user sees. Two store listings (a "LabFlow for Labs" listing and a "LabFlow Patient" listing) may eventually point at separately-bundled binaries; that is a deployment decision and not yet committed.

### Can the app use third-party Bluetooth devices (cool-box probes, label printers)?

The cool-box probe pairing uses Capacitor's BLE plugin against a defined GATT service. Label printers are paired through the OS-level Bluetooth settings and a curated set of supported models (Zebra, Brother QL, Dymo); printer drivers are bundled in the app and the print dialog picks one of the active paired printers. Adding a new printer model is a deployment-level extension that adds the model's command set to the bundled drivers.

### What's the upgrade story?

For now: the regular App Store and Play Store upgrade channels. A future release plans to add an OTA update mechanism — a Capacitor live-update layer (the `@capgo/capacitor-updater` model) that ships JS-bundle changes outside the store cadence for non-native updates. OTA is gated on the launches; until both stores are live, every upgrade is a fresh binary submission.

---

**Next:** [WXT Browser Extension](/docs/modules/wxt-extension).
