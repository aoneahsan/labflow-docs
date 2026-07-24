---
sidebar_position: 2
slug: /getting-started/installation
title: Self-Hosted Installation
description: Install LabFlow locally for development, on Firebase Hosting for production. Node.js, Yarn, Firebase CLI, env wiring, build and deploy steps.
keywords:
  - LabFlow installation
  - LIMS self-hosting
  - Firebase Hosting LIMS
  - Capacitor mobile build
---

# Self-Hosted Installation

This guide installs LabFlow for self-hosted use — local development first, then a production deploy on Firebase Hosting.

> **Source access required.** The main LabFlow application repository is private. To follow this guide you need access to the source — contact [the author](../author) to request access. The documentation site you're reading is public and lives in a separate repository.

---

## Requirements

| Tool | Version | Why |
|---|---|---|
| Node.js | `>=24.13.0` | Vite 8 + Capacitor 8 toolchain |
| Yarn | `1.22.22` | The project's only supported package manager (no `npm`, no `pnpm`) |
| Git | any recent version | clone + commit |
| Firebase CLI | latest | `firebase deploy` for hosting + functions + Firestore |
| Java JDK | 17 (for Android builds) | Capacitor Android shell |
| Android Studio | latest stable | Android emulator + AAB signing |
| Xcode | 15+ (macOS only, optional) | iOS builds |

We use **Yarn** for everything inside the project. Do not run `npm install` — it will create a `package-lock.json` that conflicts with the project's lockfile policy.

---

## 1. Clone

```bash
git clone <private-repo-url> labflow
cd labflow
yarn install
```

This installs the root web app dependencies. The other surfaces (`extension/`, `chrome-extension/`, `docs-site/`) carry their own `package.json` files and are installed lazily as you work in them. LabFlow is 100% client + Firestore — there is no `functions/` / server package to install.

---

## 2. Environment

Copy `.env.example` to `.env.local` and fill in the `[REQUIRED]` keys:

```bash
cp .env.example .env.local
```

The four Firebase Web config keys are required for boot:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Optional keys (Sentry DSN, Amplitude key, Microsoft Clarity ID, FilesHub base URL) degrade gracefully when omitted — the app boots, those integrations just stay dormant.

If a required key is missing, the app does not silently render a broken UI; it shows a `<EnvMissingScreen />` listing the missing keys (key *names* only — never values), and the same key names are echoed to the console and to Sentry.

---

## 3. Firebase project

Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com) and enable:

- **Authentication** — Google sign-in (the product's only sign-in method)
- **Firestore Database** — start in production mode; rules ship in this repo
- **Hosting** — single-site or multi-site as your domain plan dictates

There are **no Cloud Functions** to enable — LabFlow is 100% client + Firestore.

Initialize Firebase locally (you only need this once per environment):

```bash
firebase login
firebase use --add  # pick the project you created
```

Deploy Firestore rules and indexes from the repo:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

> **Never run `firebase deploy --only firestore`** — that variant can delete indexes. Always specify `firestore:rules,firestore:indexes` explicitly.

---

## 4. Local development

```bash
yarn dev
```

The dev server binds to **`http://localhost:6293`** (the project's registered port). Hot-reload is on, source maps are emitted, and the app reads `.env.local` at boot.

In a second terminal you can optionally run the Firestore emulator:

```bash
firebase emulators:start --only firestore,auth,functions
```

Set `VITE_USE_FIREBASE_EMULATOR=true` in `.env.local` to point the app at the emulator instead of the live project.

---

## 5. Build for production

```bash
yarn typecheck       # must pass with 0 errors
yarn lint            # must pass with 0 warnings
yarn build           # must pass with 0 warnings
```

The build emits to `dist/`. Inspect bundle sizes in `dist/stats.html` if generated.

---

## 6. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
firebase deploy --only firestore:rules,firestore:indexes
```

The first command publishes the `dist/` contents to the configured hosting site. The second deploys the Firestore security rules and indexes. There are no Cloud Functions to deploy. (Never run `firebase deploy --only firestore` — the bare form can delete indexes.)

If you maintain multiple environments (staging, production), use Firebase **Hosting targets** in `firebase.json` and pass `--only hosting:staging` / `--only hosting:production`.

---

## 7. Mobile (Capacitor) builds

Once the web app is built, sync into the native shells:

```bash
yarn cap:sync
```

For Android:

```bash
yarn cap:open:android      # opens Android Studio
yarn cap:build:android     # builds an AAB
```

For iOS (macOS only):

```bash
yarn cap:open:ios          # opens Xcode
```

> **Distribution status:** Native Android (AAB) and iOS builds are produced and ready, but Play Store and App Store distribution are **pending** as of this writing. Side-load builds work fine for internal evaluation; public-store distribution requires the developer to submit and the stores to approve.

---

## 8. Browser extension

The WXT-based browser extension lives in `extension/`:

```bash
cd extension
yarn install
yarn build
```

Load `extension/.output/chrome-mv3/` (or `firefox-mv2/`) as an unpacked extension in your browser to test. **Chrome Web Store distribution is pending.**

The EMR Chrome add-on lives in `chrome-extension/` and follows the same pattern.

---

## Troubleshooting

### Port 6293 already in use

```bash
lsof -ti:6293 | xargs kill -9
```

The port is registered in [`~/.dev-ports.json`](https://github.com/aoneahsan) and chosen so it doesn't collide with common defaults (3000 / 5173 / 8080).

### `EnvMissingScreen` on boot

A required `VITE_*` key is missing. Check `.env.local` against `.env.example` — every key tagged `[REQUIRED]` must be set.

### Firebase deploy says "deleting indexes"

You ran `firebase deploy --only firestore` instead of `firebase deploy --only firestore:rules,firestore:indexes`. Cancel and re-run with the correct flags.

### Yarn says "Couldn't find package.json"

You're outside the project root. `cd` to wherever you cloned the repo.

---

**Next:** [Architecture overview →](../architecture/overview)
