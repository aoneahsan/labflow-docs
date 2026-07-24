---
sidebar_position: 22
slug: /modules/emr-chrome-extension
title: EMR Chrome Extension
description: The LabFlow Chrome extension that injects LabFlow result panels into existing EMR pages — Epic, Cerner, Meditech, Allscripts, athenahealth, eClinicalWorks — without modifying the EMR.
keywords:
  - LabFlow EMR Chrome extension
  - lab Chrome extension EMR
  - Epic Cerner lab integration
  - in-EMR lab results
  - content script EMR
  - clinical workflow extension
---

# EMR Chrome Extension

**The EMR Chrome Extension is one of LabFlow's five product surfaces — a Chrome / Edge extension that injects a small LabFlow result panel into the EMR pages a clinician already uses, without modifying the EMR.** When a clinician opens a patient's chart in Epic, Cerner, Meditech, Allscripts, athenahealth, or eClinicalWorks (the supported list at launch), the extension recognises the patient context, fetches the matching LabFlow records the clinician is permissioned to see, and renders a non-intrusive panel showing recent results, pending orders, critical-result acknowledgement state, and one-click deep-links into the LabFlow web app.

This extension is separate from the [WXT browser extension](./wxt-extension). The WXT extension is a staff convenience layer that runs on every browser; the EMR extension specifically injects into recognised EMR domains and is the only LabFlow surface with active third-party-page presence.

Distribution to the Chrome Web Store and Microsoft Edge Add-ons is pending the launch noted on the [LabFlow homepage](https://labflow.aoneahsan.com).

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Surface (consumes [Results Management](./results-management), [Test Orders](./test-orders), [Patient Management](./patient-management)) |
| Browsers | Chrome / Chromium-based (Edge, Brave) via MV3; Firefox compatibility planned post-launch |
| Framework | TypeScript content scripts + React popup, bundled with Vite |
| Auth | `chrome.identity` API (Chrome OAuth) — **never** Firebase Auth's web SDK |
| Permissions | `activeTab`, `storage`, `identity`, `scripting`, plus narrow `host_permissions` matching the supported EMR domains — **no** `<all_urls>` |
| Distribution status | Pending — Chrome Web Store / Edge Add-ons submissions in flight |

---

## How it works

The flow at runtime, on a recognised EMR page:

1. The user opens a patient chart in their EMR. The URL or DOM matches one of the per-EMR adapter patterns.
2. The content script runs on the matched page. It reads the patient identifier from the DOM using the per-EMR adapter (a curated CSS-selector-and-regex map per EMR + version).
3. The content script asks the service worker for that patient's LabFlow records via `chrome.runtime.sendMessage`. The service worker handles auth, applies the user's permission scope, fetches from the LabFlow API, and returns the records.
4. The content script renders a floating panel pinned to the page (default: bottom-right, draggable, dismissible). The panel is a Shadow-DOM-isolated React tree so the EMR's CSS cannot affect it and vice versa.
5. Clicking a record opens a deep-link to the corresponding LabFlow web-app page in a new tab.

Crucially, the extension is **read-only against the EMR**. It does not modify EMR data, does not click EMR buttons, does not auto-fill EMR forms. The injection is a non-destructive overlay.

---

## Per-EMR adapters

The supported EMRs at launch:

| EMR | URL pattern (illustrative; the actual regex is per-deployment) | Patient-ID source |
|---|---|---|
| Epic Hyperspace web | `https://*.epic.com/*` or per-tenant subdomain | Read MRN from chart header `[data-testid="patient-mrn"]` |
| Cerner PowerChart web | `https://*.cerner.com/*` | Read MRN from URL query `patient` parameter |
| Meditech Expanse | `https://*.meditech.com/*` | Read MRN from page DOM via per-version selector |
| Allscripts Professional EHR | `https://*.allscripts.com/*` | Read MRN from chart panel data attribute |
| athenahealth | `https://*.athenahealth.com/*` | Read patient ID from URL hash |
| eClinicalWorks (V11/V12 web) | `https://*.eclinicalworks.com/*` | Read MRN from chart frame |

Adding a new EMR is an adapter-only change — a new entry in the per-EMR adapter map that declares the URL pattern, the patient-ID selector / regex, and any per-version DOM fingerprints needed to disambiguate UI variants. The adapter map is shipped as a static file in the extension build; updating it ships through the regular Chrome Web Store update cadence.

Patient-identifier matching to the LabFlow side uses the connection's identifier-system mapping from [EMR Integration](./emr-integration). If the EMR's MRN matches a registered identifier on a LabFlow patient, the panel populates. If not, the panel shows a "No matching LabFlow patient" state with an action to launch the LabFlow patient search.

---

## The injected panel

The panel is a 320 × 480 px (default) floating card pinned to the bottom-right of the EMR page. Sections:

| Section | Shows |
|---|---|
| Header | Patient name (matched from LabFlow side), MRN (LabFlow side), tenant chip |
| Tabs | Recent results / Pending orders / Critical alerts / Quick actions |
| Recent results tab | Last 10 released results with date, analyte, value, abnormal-flag chip, click-to-open |
| Pending orders tab | Open orders with status (collected / received / processing / draft / reviewed / approved) |
| Critical alerts tab | Released critical-flagged results awaiting clinician acknowledgement; acknowledge button |
| Quick actions tab | "Open in LabFlow", "Download all recent PDFs", "Place a new order" — each opens a deep-link |

The panel is draggable, resizable (within bounds), and dismissable per-session. A "Pin / unpin" control lets the user keep it docked across page navigations within the EMR domain.

---

## Authentication — Chrome Identity API

The auth mechanics mirror the [WXT extension](./wxt-extension#authentication--chrome-identity-api): `chrome.identity.getAuthToken({ interactive: true })` for Google OAuth, `chrome.identity.launchWebAuthFlow` for email-password flows. The Firebase Auth SDK is **never** loaded — per the same Chrome Web Store rejection-prevention rule.

The extension reads data **directly from Firestore** — there is no LabFlow REST API. After the `chrome.identity` → Firebase-credential exchange, it queries Firestore with the signed-in user's credentials, and the [Firestore security rules](/docs/architecture/security-rules) enforce every permission and row-level scope, so the extension cannot read anything the user isn't entitled to. (LabFlow is 100% client + Firestore, so the same rules that protect the web app protect the extension.)

If the [WXT extension](./wxt-extension) is also installed on the browser profile, the EMR extension can ask WXT for the existing session token via `chrome.runtime.sendMessage` to a known message endpoint, avoiding a redundant OAuth flow. This cross-extension hand-off is opt-in and bidirectional.

---

## Permission rationale

The Chrome Web Store reviewer reads these justifications:

| Permission | Why |
|---|---|
| `activeTab` | Read the patient identifier from the active EMR tab |
| `storage` | Cache the session token and per-EMR DOM-selector preferences |
| `identity` | Chrome OAuth handshake |
| `scripting` | Programmatically inject the content script when the URL pattern matches (required for MV3 content-script injection on dynamically-discovered tabs) |
| `host_permissions` (per-EMR domains only) | Read the patient identifier and render the panel on the matched EMR pages |

The host permissions are narrow and explicit — six EMR domains at launch. There is no `<all_urls>` and no broad pattern. This is the difference between an extension that gets approved in days and one that gets stuck in extended review.

---

## Content script isolation

Two interconnected practices keep the EMR's DOM and the panel's DOM from interfering with each other:

| Practice | What it does |
|---|---|
| **Shadow DOM** | The panel mounts inside a `ShadowRoot` attached to a top-level `<div>` the content script appends. The EMR's stylesheet cannot reach the panel; the panel's stylesheet cannot reach the EMR. |
| **CSS containment** | The host `<div>` declares `contain: layout style paint` so the EMR's layout calculations are not affected by the panel's resize / drag. |

Content-script messages between layers use a structured-clone-safe envelope so an EMR that posts conflicting `window.postMessage` payloads to its own iframes cannot mistakenly trigger the extension's message handlers. The extension only listens on its own `chrome.runtime` channel.

---

## Critical-result push integration

A critical result released for a patient currently viewed by a clinician fires three things in parallel:

1. A push via [Communication Hub](./communication-hub) (mobile / SMS / email / browser notification depending on the recipient's channels).
2. A browser notification from the EMR extension's service worker (when the user's browser is open and the extension is installed).
3. A panel-highlight if the affected patient is the one whose chart is currently open — the panel's "Critical alerts" tab flashes and the dock badge increments.

Clicking the panel's acknowledge button (or the browser notification) calls the LabFlow API to record the acknowledgement against the result; the patient's chart in the EMR side is **not** modified, because the extension is read-only against the EMR. The acknowledgement audit row carries: clinician user ID, result ID, acknowledgement timestamp, source ("emr-chrome-extension"), and the EMR domain at the time of click.

---

## Privacy + HIPAA-conscious defaults

| Default | Behaviour | Why |
|---|---|---|
| No EMR-page DOM exfiltration | The content script reads only the patient identifier; it never copies the EMR's chart contents | LabFlow does not store EMR chart data; the extension is read-only |
| Shadow-DOM-isolated panel | Patient PII rendered in the panel cannot be read by EMR's tracking pixels or third-party scripts | Defence in depth |
| No screenshot or recording of EMR | The extension does not request `desktopCapture`, `tabCapture`, or any media-capture permission | Match the data-minimisation expectation |
| Audit on every load | A panel-render is an audit event (`emr_extension.panel_rendered`) recording user, patient, EMR domain | Make extension use visible to compliance |
| Browser notification redacted | Critical-result notification body shows analyte name only; the value is revealed inside the panel after the user is identified | Minimises shoulder-surfing risk in shared workspaces |

---

## Required permissions on the LabFlow side

The extension's API calls happen as the logged-in user — every API call respects the user's role permissions per [User Management](./user-management). The extension itself does not have additional LabFlow permissions; if the user cannot read results, the panel shows an empty "Recent results" tab with a "You don't have permission to view results" hint.

The auditable event types the extension produces (alongside the LabFlow-side audit log):

| Event | When | Recorded fields |
|---|---|---|
| `emr_extension.panel_rendered` | Panel injected on a matched EMR page | User, EMR domain, EMR-side MRN, LabFlow patient ID (if matched), timestamp |
| `emr_extension.result_viewed` | A result row clicked | User, result ID, timestamp |
| `emr_extension.critical_acknowledged` | Acknowledge button clicked | User, result ID, EMR domain, timestamp |
| `emr_extension.deeplink_followed` | A quick-action link clicked | User, action type, timestamp |

---

## Frequently asked questions

### Is the EMR Chrome Extension available on the Chrome Web Store?

Not yet. The current installable surface is a development build distributed via a per-tenant signed package for pilot deployments. Public submissions to the Chrome Web Store and Microsoft Edge Add-ons are in flight; the [LabFlow homepage](https://labflow.aoneahsan.com) carries the live status.

### Why a Chrome extension instead of an HL7 / FHIR direct integration?

[EMR Integration](./emr-integration) (HL7 v2 + FHIR R4) is the canonical inbound / outbound channel between LabFlow and the EMR for orders and results — that runs whether or not the extension is installed. The extension is a presentation-layer overlay that gives the clinician faster visual access to LabFlow records inside the page they already work in. The two are complementary: the integration moves the data, the extension renders a fast-path view of that data.

### Does the extension modify the EMR's chart?

No. The extension is read-only against the EMR. It reads the patient identifier from the DOM and renders an overlay panel. It does not click buttons, fill forms, or modify chart content. The acknowledgement of a critical result is recorded **on the LabFlow side**, not in the EMR.

### What happens when the EMR's DOM changes (the lab user updates the EMR version)?

The per-EMR adapter map carries per-version DOM fingerprints. When an EMR ships a new version, the adapter may break — typically as the patient-identifier selector resolves to `null`. The panel detects the unmatched state and shows a "Could not detect patient on this page" hint with an action to launch the LabFlow patient search. An adapter fix ships through the extension's regular update cadence; until the fix lands, the clinician falls back to the LabFlow web app directly.

### Why isn't Epic's MyChart or Cerner's web portal listed?

The current adapter map covers the clinician-facing EMR surfaces, not the patient-facing portals. Patient-facing extensions raise a different set of HIPAA-consent considerations (the patient signs a different agreement for the extension's access to their data) and are out of scope for the staff extension. A separate patient-facing surface is the [LabFlow mobile app](./mobile-app)'s result-viewer screen.

### Can the same extension run on a Citrix-published EMR?

Citrix-published apps run inside a Chrome window only when the EMR is published as a Citrix HTML5 desktop with a browser; in that case the extension's content script runs against the Citrix-window's DOM and works as expected. EMRs published as native Citrix XenApps (where the EMR is not in a browser at all) are out of reach — the extension is a browser tool. The fall-back for those users is the LabFlow web app in a separate browser tab.

### How are EMR version upgrades coordinated?

The extension's adapter map ships as a static file in the build, and the build version is tied to the [LabFlow version-update checklist](https://labflow.aoneahsan.com). When a customer's EMR is upgraded and the adapter breaks, support flags the affected version, the adapter is updated, and a new extension build ships to the store. The fall-back behaviour (panel hidden, web app deep-link surfaced) keeps the workflow uninterrupted while the fix is in review.

### Can third-party plugins / extensions in the EMR (e.g. a Chrome-bundled chart-print add-on) conflict with this extension?

Possibly — two extensions injecting into the same page can produce z-index races, DOM-mutation race conditions, or stylesheet conflicts. The defences described in the content-script-isolation section (Shadow DOM, CSS containment, scoped message channels) cover the common conflicts. If a specific third-party extension produces a known conflict, the per-EMR adapter map can declare a conflict-mode that delays the LabFlow panel's mount until the other extension's mutation observer is idle. Adding a conflict-mode is an adapter-only update.

### Does the extension support multi-tenant LabFlow accounts?

Yes — the panel header carries a tenant chip and a switcher. A clinician working across two tenants (e.g. a reference lab that serves the hospital plus a satellite clinic that has its own LabFlow tenant) sees the chip, picks the right one, and the panel re-fetches against that tenant. Cross-tenant data is never mixed; switching tenants is a discrete action.

---

**Next:** Batch 10 covers the API Reference, architecture deep-dive, and the Firestore schema reference — see the [public build plan](https://github.com/aoneahsan/labflow-docs/blob/main/docs/audit/2026-05-10-docs-site-build-plan.md).
