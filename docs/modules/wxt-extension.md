---
sidebar_position: 21
slug: /modules/wxt-extension
title: WXT Browser Extension
description: The cross-browser LabFlow extension (Chrome, Edge, Firefox) built with WXT — quick-access to LabFlow from any tab, popup result lookup, omnibox commands, and shared session with the web app.
keywords:
  - LabFlow browser extension
  - WXT extension lab
  - Chrome extension LIMS
  - cross-browser lab extension
  - lab result quick lookup
  - omnibox extension
---

# WXT Browser Extension

**The WXT browser extension is one of LabFlow's five product surfaces — a cross-browser extension (Chrome, Edge, Firefox) that puts a LabFlow toolbar button on every browser window for fast-path actions that would otherwise require switching tabs to the web app.** The audience is the lab user who lives in a browser all day and wants the lookups they do most often — "what's the latest result for MRN X", "is sample Y received yet", "open today's QC dashboard" — one keystroke away. It is a small surface by design, not a replacement for the web app.

The extension is built with **WXT** (Web Extension Toolkit), which produces a single codebase compiled into Manifest V3 builds for Chromium-based browsers and Manifest V2 / V3-hybrid builds for Firefox. Distribution to the Chrome Web Store, Microsoft Edge Add-ons, and Firefox Add-ons is pending the launch noted on the [LabFlow homepage](https://labflow.aoneahsan.com).

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Surface (consumes a curated read subset of every module) |
| Browsers | Chrome / Chromium-based (Edge, Brave, Opera) via MV3; Firefox via MV3 with WXT's compatibility shim |
| Framework | WXT (TypeScript + React for the popup; vanilla TypeScript for the service worker and content scripts) |
| Build tool | WXT-managed Vite |
| Auth | Chrome `chrome.identity` API for OAuth handshake against LabFlow's identity service — **never** Firebase Auth's SDK with `signInWithPopup` or `signInWithRedirect`, per Chrome Web Store rejection-rule prevention |
| Permissions | `activeTab`, `storage`, `identity`, `alarms`, `notifications`; **no** `<all_urls>` host permission — the extension never injects into arbitrary pages |
| Distribution status | Pending — Chrome Web Store / Edge Add-ons / Firefox Add-ons submissions in flight |

---

## What the extension does

| Capability | How the user invokes it |
|---|---|
| Quick patient lookup | Click toolbar button → type MRN / patient name → see the latest order + status |
| Quick result lookup | Same popup, switch tab → "Recent results" with permission scoping |
| Sample status check | Type a barcode in the popup → state + chain-of-custody summary |
| Open today's QC dashboard | Toolbar button → "Open dashboard" → opens the LabFlow web app in a new tab |
| Critical-result push acknowledgement | When the user is logged in and a critical result is released, a browser notification fires; clicking opens the acknowledgement screen in the web app |
| Omnibox commands | Type `lf` in the browser address bar followed by a query (`lf MRN12345`, `lf barcode LF12345678`, `lf order 67890`) for direct navigation |
| Shared session | The popup reads the same Firebase Auth session the web app uses (when the user is logged into the web app in a tab on the same browser) |
| Tenant switcher | Popup carries the active tenant chip + a switcher when the user has > 1 tenant membership |

The extension does **not** inject UI into third-party EMR pages — that is the role of the separate [EMR Chrome Extension](./emr-chrome-extension). The WXT extension is a LabFlow-side convenience layer with no third-party-page presence.

---

## UI surfaces

| Surface | Trigger | Purpose |
|---|---|---|
| Toolbar popup | Click toolbar button | Search, quick-lookups, recent results, dashboard launcher |
| Omnibox | Type `lf ` in the address bar | Direct query commands |
| Browser notification | Push delivery for critical results | Click → web app acknowledgement screen |
| Options page | Right-click toolbar button → Options | Per-user preferences (default tenant, notification sounds, omnibox behaviour) |
| Onboarding tab | First-run after install | Sign-in flow and brief feature tour |

There is no content script that runs on every page — the extension's host permissions are tab-scoped to the actively-engaged surfaces only.

---

## Architecture

The codebase splits into three runtime layers (the standard WXT structure):

| Layer | Role |
|---|---|
| **Service worker** (background) | Handles auth state, push subscriptions, omnibox commands, scheduled alarms, message-passing to popup |
| **Popup** | The React UI for search and result-lookup; ephemeral (mounted on open, unmounted on close) |
| **Options page** | A separate persistent page for per-user settings |
| **Content scripts** | None by default — the extension does not run inside third-party pages |

Communication between layers uses `chrome.runtime.sendMessage` / `chrome.runtime.onMessage` for popup → service worker requests and `chrome.runtime.onMessageExternal` for the optional cross-extension hand-off with the EMR Chrome extension when both are installed.

---

## Authentication — Chrome Identity API

Per LabFlow's browser-extension-compliance rule (and the Chrome Web Store rejection-prevention rules), the extension **never** loads the Firebase Auth SDK with `signInWithPopup` or `signInWithRedirect`. Both load remote scripts (Google's auth domain) which violates Chrome's remotely-hosted-code policy in MV3 extensions.

Instead the extension uses `chrome.identity.getAuthToken({ interactive: true })` to obtain a Google access token, then validates that token against LabFlow's identity-service endpoint, which returns the LabFlow session token. The session token is stored in `chrome.storage.session` (cleared on browser restart) and attached to API calls via an `Authorization: Bearer …` header.

For users who sign in to LabFlow with email + password (no Google OAuth), the extension uses `chrome.identity.launchWebAuthFlow` to open the LabFlow login page in a popup; the popup completes the flow with a one-time `redirect_uri` that the extension reads to obtain the session token. The full round-trip never reaches Firebase Auth's web SDK.

The extension's manifest declares `"oauth2": { "client_id": "...", "scopes": ["openid", "email", "profile"] }` — the client ID is project-specific and rotated through the platform-integration overlap window described in [Admin Panel](./admin-panel#platform-scope-integrations).

---

## Permission rationale

Every permission must be justified in the Chrome Web Store listing. The justifications:

| Permission | Why |
|---|---|
| `activeTab` | When the popup opens, the extension reads the active tab's URL to offer a "Open this MRN in LabFlow" deep-link if the URL contains a recognisable MRN pattern |
| `storage` | Caches the user's session token, last tenant, popup preferences |
| `identity` | The Chrome OAuth handshake described above |
| `alarms` | Schedules periodic background re-validation of the session token |
| `notifications` | Browser notification on critical-result push |
| (No host permissions) | Deliberate — the extension makes outbound API calls only to LabFlow's known origin |

The extension does **not** request `tabs`, `webRequest`, `webNavigation`, `cookies`, `<all_urls>`, or `bookmarks`. The permission surface is intentionally small both for security and to avoid the Chrome Web Store review delays that broad permissions trigger.

---

## Omnibox commands

Typing `lf` in the address bar activates the LabFlow omnibox. The supported commands:

| Input | Behaviour |
|---|---|
| `lf MRN12345` | Open the LabFlow patient page for MRN `MRN12345` |
| `lf barcode LF12345678` | Open the sample with that barcode |
| `lf order 67890` | Open order `67890` |
| `lf qc` | Open the QC dashboard |
| `lf today` | Open the dashboard scoped to today |
| `lf inv low` | Open the inventory low-stock list |

The omnibox handler is implemented in the service worker via `chrome.omnibox.onInputChanged` and `chrome.omnibox.onInputEntered`. Search suggestions are typed-ahead from a small local cache; the cache is refreshed every 10 minutes against a permission-scoped `popular-queries` endpoint so a user sees the entities they recently visited.

---

## Update + version policy

Versions follow the global LabFlow version-update checklist — bump `wxt.config.ts` and `src/utils/constants.ts` together, document the change in the changelog page on the [LabFlow homepage](https://labflow.aoneahsan.com), and ship a new build to each store. Versions are kept in lock-step across stores within 48 hours of submission; minor copy-only changes can ship to one store first.

The extension never carries development server URLs to production builds — the `wxt.config.ts` reads the API base URL from an environment variable at build time, with separate `.env.production` and `.env.development` files.

---

## Performance + bundle budget

| Budget | Limit |
|---|---|
| Popup JS bundle (gzipped) | ≤ 80 KB |
| Service worker JS bundle (gzipped) | ≤ 40 KB |
| Cold open of popup (P95) | ≤ 250 ms |
| Memory at idle (service worker, after 5 min) | ≤ 25 MB |

Cold-open latency is dominated by the service worker's session check; the popup itself renders an optimistic shell while the session probe completes in parallel.

---

## Compliance + Chrome Web Store readiness

The pre-submission checklist enforced by the project's browser-extension rules:

| Check | Status |
|---|---|
| No remotely-hosted JavaScript (`grep -rE "googletagmanager\.com\|apis\.google\.com/js\|recaptcha\|firebase/analytics\|signInWithPopup\|signInWithRedirect\|eval\(\|new Function\("` returns zero) | required ✓ |
| Firebase Auth SDK not bundled (Chrome `chrome.identity` only) | required ✓ |
| No `<all_urls>` host permission | required ✓ |
| Privacy policy URL publicly reachable from incognito | required (LabFlow's privacy policy page) |
| Description contains no keyword stuffing, ranking claims, or testimonials | required ✓ |
| `_locales/en/messages.json` carries every user-facing string | required ✓ |
| MV3 service worker (no persistent background page) | required ✓ |
| Code in the published zip matches the GitHub source (a Chrome Web Store reviewer can verify) | required ✓ |

The full set lives in the global Chrome Web Store rejection-rules document at `~/.claude/chrome-web-store-rejection-rules.json` (32 rules as of 2026-01-23) — every submission scans against it before upload.

---

## Frequently asked questions

### Is the WXT extension available on the Chrome Web Store?

Not yet. The current installable surface is a development build for internal testing. Submissions to the Chrome Web Store, Microsoft Edge Add-ons, and Firefox Add-ons are in flight; the [LabFlow homepage](https://labflow.aoneahsan.com) carries the live status. Until the listings go live, this page documents implemented capability rather than a publicly downloadable product.

### Why WXT and not native MV3 + Webpack?

WXT manages three frequently-painful parts of browser-extension dev: the cross-browser manifest delta (Chromium MV3 vs Firefox MV3-with-shims vs the long-tail of legacy MV2 behaviours), the file-conventions-driven structure (entrypoints declared by directory rather than by manifest plumbing), and the HMR-aware dev server. The alternative — hand-rolled Webpack with two manifests and a hand-written cross-browser shim — was tried in an earlier project and produced steady-state maintenance overhead WXT removes.

### Why no Firebase Auth in the extension?

Two reasons. First, the Chrome Web Store explicitly rejects extensions that load remotely-hosted JavaScript, which `signInWithPopup` / `signInWithRedirect` and the Firebase Auth web SDK both do (they fetch from `apis.google.com/js` and the auth-domain origin). Second, even if the SDK could be statically bundled, the OAuth popup window the SDK opens runs into MV3's service-worker lifecycle quirks that produce silent auth failures roughly 5% of the time in our pre-launch testing. `chrome.identity` is the canonical Chrome-recommended path and avoids both issues.

### Can the extension act on behalf of a patient (patient surface)?

No. The extension is a staff convenience layer — it surfaces information the signed-in user has permission to read. The "patient surface" is the web and mobile apps; the extension does not have a patient login mode. A patient who happens to install the extension and signs in with a patient account will see a "This surface is for staff use" screen and a deep-link to the web patient portal.

### How does it interact with the EMR Chrome Extension?

The two extensions are separately installable. When both are installed on the same browser profile, the EMR Chrome Extension can ask the WXT extension for the active LabFlow session via `chrome.runtime.sendMessage` to a known message endpoint — this avoids the EMR extension needing its own OAuth flow when the user is already authenticated via WXT. If WXT is not installed, the EMR extension runs its own `chrome.identity.getAuthToken` flow. Both are first-class paths; neither extension requires the other.

### What happens when the user signs out of the web app?

The web app's sign-out broadcasts a `BroadcastChannel` message that the WXT service worker listens for. On receipt, the service worker clears the session token from `chrome.storage.session` and the popup re-renders to the sign-in state. The reverse is also true — signing in via the extension popup broadcasts to the web app so the open LabFlow tab refreshes its session.

### Is there a Safari extension?

Not yet. Safari Web Extensions follow a different distribution path (App Store + Xcode-built shell), and the lab user base on Safari is small enough that prioritising the Safari build behind the Chrome / Edge / Firefox launches makes sense. If demand emerges after launch, the WXT codebase compiles to a Safari Web Extension manifest with the same source — the additional cost is the Xcode-shell wrapping and a separate App Store submission, not a code rewrite.

### How is patient data protected inside the popup?

The popup's HTML never includes patient names, MRNs, or result values until the popup successfully reads a session token from `chrome.storage.session`. A popup opened in an unauthenticated state shows only the sign-in shell. The popup window itself is closed automatically when the user clicks elsewhere (standard browser-popup behaviour), so a patient name visible in the popup is not visible in the browser chrome after the popup closes.

### Does the extension support keyboard shortcuts?

Yes. The default keyboard shortcuts (configurable in the extension's options page and at `chrome://extensions/shortcuts`):

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + Shift + L` | Open popup |
| `Ctrl/Cmd + Shift + Y` | Focus the popup's search input directly |
| `Ctrl/Cmd + Shift + D` | Open the LabFlow dashboard in a new tab |

Shortcuts are part of the manifest's `commands` array and are subject to Chrome's global keyboard-shortcut conflict resolution; users who already have an overlapping shortcut can rebind through the standard browser settings.

---

**Next:** [EMR Chrome Extension](/docs/modules/emr-chrome-extension).
