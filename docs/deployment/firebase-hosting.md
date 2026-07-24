---
sidebar_position: 2
slug: /deployment/firebase-hosting
title: Firebase Hosting
description: Deploying the LabFlow docs site to Firebase Hosting — firebase.json config, hosting targets, custom domain, cache headers, preview channels, rollback, and the deploy command guardrails that prevent footgun outcomes.
keywords:
  - Firebase Hosting Docusaurus
  - LabFlow docs hosting
  - firebase.json hosting
  - Firebase preview channels
  - Firebase Hosting custom domain
  - Firebase Hosting rollback
---

# Firebase Hosting

**Firebase Hosting is the CDN host for the LabFlow documentation site — a static-file host with global edge distribution, zero-config TLS, atomic deploys, and a versioned release history that supports one-click rollback.** This page is the reference for the project's hosting configuration: the `firebase.json` shape, the multi-site hosting-target setup that keeps the docs and the main LabFlow app on separate CDNs without conflict, the custom-domain wiring, the cache-control headers, the preview-channel workflow, and the deploy commands the project actually runs. It assumes Firebase CLI is installed and authenticated (`firebase login`); for first-time setup see the global [Firebase Basics](https://labflow.aoneahsan.com) reference.

The configuration is intentionally narrow. There are no rewrites to Cloud Functions, no per-route headers beyond the cache directives, no SPA-fallback rules — the site is a pure static build that Docusaurus emits, and Firebase Hosting serves it without server-side execution.

---

## At-a-glance

| Property | Value |
|---|---|
| Firebase project | `labflow-prod` (shared with the main LabFlow app) |
| Hosting target | `docs` (named target — the main app uses target `app`) |
| Public directory | `docs-site/build` |
| Custom domain | `docs.labflow.aoneahsan.com` (planned; managed in Firebase Hosting → Custom domains) |
| TLS | Auto-provisioned by Firebase via Let's Encrypt |
| Cache headers | Aggressive for hashed assets, short for HTML |
| Preview channels | Auto on PR via GitHub Actions; 7-day TTL |
| Rollback | One-click in Firebase Console or `firebase hosting:clone` CLI |
| Deploy command | `firebase deploy --only hosting:docs` |

---

## `firebase.json` configuration

The docs-site lives in the same Firebase project as the main LabFlow app, so the `firebase.json` declares two hosting targets and configures each independently. The relevant section for docs:

```json
{
  "hosting": [
    {
      "target": "app",
      "public": "dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{"source": "**", "destination": "/index.html"}]
    },
    {
      "target": "docs",
      "public": "docs-site/build",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "cleanUrls": true,
      "trailingSlash": false,
      "headers": [
        {
          "source": "**/*.@(js|css|woff2|woff|png|svg|webp|jpg|jpeg|gif|ico)",
          "headers": [
            {"key": "Cache-Control", "value": "public, max-age=31536000, immutable"}
          ]
        },
        {
          "source": "**/*.html",
          "headers": [
            {"key": "Cache-Control", "value": "public, max-age=3600, must-revalidate"}
          ]
        },
        {
          "source": "/sitemap.xml",
          "headers": [
            {"key": "Cache-Control", "value": "public, max-age=86400"},
            {"key": "Content-Type", "value": "application/xml; charset=utf-8"}
          ]
        },
        {
          "source": "/robots.txt",
          "headers": [
            {"key": "Cache-Control", "value": "public, max-age=86400"}
          ]
        },
        {
          "source": "/llms.txt",
          "headers": [
            {"key": "Cache-Control", "value": "public, max-age=86400"},
            {"key": "Content-Type", "value": "text/plain; charset=utf-8"}
          ]
        }
      ]
    }
  ]
}
```

The `target` field binds each entry to a name; the actual mapping target-name → site-id lives in `.firebaserc`:

```json
{
  "projects": {"default": "labflow-prod"},
  "targets": {
    "labflow-prod": {
      "hosting": {
        "app": ["labflow-prod"],
        "docs": ["labflow-docs"]
      }
    }
  }
}
```

A naming note: the Firebase Hosting **site** for the docs is `labflow-docs` (the default URL is `https://labflow-docs.web.app`). The custom domain points at this site.

---

## Cache headers — why hashed assets are immutable and HTML is short

Docusaurus emits hashed file names for every JS, CSS, and image asset (`runtime~main.abc123.js`, `styles.def456.css`). When the content changes, the hash changes; the file name changes; the cache key changes. Setting `Cache-Control: public, max-age=31536000, immutable` on hashed assets is safe — the browser will reuse the cached file indefinitely, and any genuine change ships with a new file name.

HTML files do not carry hashes — `/docs/modules/results-management/index.html` is the same URL whether the body changed or not. The `must-revalidate, max-age=3600` directive lets browsers cache for an hour but forces a revalidation before reusing past that window. The trade-off is one extra conditional GET per hour per HTML page per user, which is negligible.

`sitemap.xml` and `robots.txt` cache for a day — short enough that a search engine pinged after a deploy sees fresh content, long enough to absorb the per-edge-location request volume.

---

## Custom domain setup

The custom domain `docs.labflow.aoneahsan.com` is wired through:

1. Firebase Console → Hosting → Add custom domain → enter `docs.labflow.aoneahsan.com`.
2. Firebase issues a TXT verification record. Add it to the parent DNS zone (`labflow.aoneahsan.com`) — the DNS is managed in Cloudflare; the TXT is added under the parent zone.
3. Wait for verification (typically minutes).
4. Firebase issues `A` records (multiple, for global load balancing). Add them at `docs` of the parent zone.
5. Firebase auto-provisions a Let's Encrypt certificate. The certificate appears in the Firebase Console within an hour.
6. Visit `https://docs.labflow.aoneahsan.com` and confirm the docs site loads.

The custom domain step is not yet complete at the time of writing — see the [Deployment Overview](/docs/deployment/overview#frequently-asked-questions) note about the cutover. Until DNS propagates, the fallback `https://labflow.aoneahsan.com/docs` is served by a rewrite on the main app's hosting target.

---

## Preview channels

A preview channel is a temporary, isolated deploy at a unique URL — typically tied to a PR. The GitHub Actions workflow creates a channel on every PR using:

```yaml
- uses: FirebaseExtended/action-hosting-deploy@v0
  with:
    repoToken: '${{ secrets.GITHUB_TOKEN }}'
    firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_LABFLOW_PROD }}'
    expires: 7d
    projectId: labflow-prod
    target: docs
    channelId: pr-${{ github.event.pull_request.number }}
```

The action posts the preview URL as a PR comment (`https://labflow-docs--pr-42-x1y2z3.web.app`). The channel expires after 7 days; PRs that need a longer review window can extend with `firebase hosting:channel:open <id>` to re-set the TTL. Merging the PR cleans the channel automatically.

Preview channels are the canonical way to review a docs change. The build-time link checker catches most defects, but a rendered preview catches MDX edge cases, custom-component regressions, and visual issues that don't show up in a CI log.

---

## Deploy commands

The production deploy:

```bash
cd docs-site
yarn build
cd ..
firebase deploy --only hosting:docs
```

Three guardrails in this command sequence:

The first is the explicit `--only hosting:docs` filter. Without it, `firebase deploy` would also deploy the main app's Firestore rules, indexes, and other artefacts — every Firebase resource the project knows about. A docs change should never affect rules or indexes, so the filter prevents an accidental cross-surface deploy. The same guardrail applies in reverse for the main app and in [Firestore Security Rules](/docs/architecture/security-rules#deploy--rollback).

The second is the build directory. `docs-site/build` is the Docusaurus output. The `firebase deploy` runs against the current directory's `firebase.json`, which points at `docs-site/build` — running the command from the project root (not from inside `docs-site`) is correct. If the directory is empty (forgot to run `yarn build`), Firebase Hosting deploys an empty site, which would 404 every URL until the next deploy. The CI workflow guards against this with a check that `docs-site/build/index.html` exists before invoking the deploy step.

The third is the absence of `--force`. The CLI prompts to confirm changes that would result in a destructive operation (e.g. removing the site's content); the prompt is the canonical chance to catch a mistake. `--force` skips the prompt and is intentionally not part of the project's deploy command.

---

## Rollback

Firebase Hosting keeps the last 10 releases per site (configurable up to 100). A rollback is one click:

1. Firebase Console → Hosting → Release history → pick a prior release → Rollback.
2. Confirm the rollback prompt.
3. The CDN edges update within ~30 seconds.

The CLI equivalent:

```bash
firebase hosting:clone labflow-prod:live labflow-prod:live --version-id <previous-version-id>
```

Past versions are also addressable via preview-channel-like URLs at `https://labflow-docs--v-<id>.web.app`. This is a handy way to compare the rolled-back state with the broken state before deciding on the rollback.

A rollback does not affect the source repo — the rolled-back code is still in `main`. The next deploy from `main` will re-deploy the broken state unless the source is fixed. The canonical post-rollback flow is: rollback, file an issue, fix on a branch, PR, re-deploy.

---

## CDN warm-up

Firebase Hosting's CDN warms automatically on the first request per edge location after a deploy. For steady-state docs traffic, the warm-up is invisible. For a release that's expected to draw an unusual spike (a Hacker News launch, a Product Hunt feature), a small pre-warm script reduces the cold-cache miss rate:

```bash
#!/usr/bin/env bash
# pre-warm.sh
TOP_URLS=(
  "/"
  "/docs/intro"
  "/docs/modules"
  "/docs/modules/authentication"
  "/docs/modules/results-management"
  "/docs/modules/quality-control"
  "/docs/modules/billing-insurance"
  "/docs/architecture/overview"
  "/docs/api/overview"
  "/docs/author"
)
LOCATIONS=("eu-west" "us-east" "ap-south" "ap-northeast")

for loc in "${LOCATIONS[@]}"; do
  for url in "${TOP_URLS[@]}"; do
    curl -sS -o /dev/null \
      -H "X-Loc: $loc" \
      "https://docs.labflow.aoneahsan.com$url" &
  done
done
wait
```

The script is run from a single host but parallelises across URLs. The `X-Loc` header is purely for telemetry; Firebase's CDN doesn't read it. Pre-warming a few minutes before an expected spike is enough — the cache is sticky once warm, and a single request from any user in a region warms the edge for the next user.

---

## Frequently asked questions

### Why a separate hosting target instead of a separate Firebase project?

Two reasons. A single Firebase project keeps the billing surface unified (one invoice, one set of cost alerts) and shares the same authentication-context for CI service accounts. Hosting targets are isolated enough to deploy independently — a `firebase deploy --only hosting:docs` never touches the main app's hosting target. The trade-off is that the `firebase.json` carries both targets; the canonical reference for that shape lives in this repo.

### Can the docs and the main app share the same domain (no separate subdomain)?

Yes — the main app's hosting target rewrites `/docs/*` to the docs build via a `rewrite` rule. This is the fallback while the `docs.labflow.aoneahsan.com` subdomain DNS is in flight. The rewrite has a small latency overhead vs. the direct subdomain serve (one extra hop through the main app's CDN edge) but is otherwise transparent. The Search Console verification matches the host, so submitting `https://labflow.aoneahsan.com/sitemap.xml` and `https://docs.labflow.aoneahsan.com/sitemap.xml` are different verification scopes — when the subdomain lands, both sitemaps coexist for the 90-day transition then the rewrite is removed.

### Are there per-region pricing differences?

Firebase Hosting bills on egress (data served from the CDN) and storage. The CDN's edge locations are global; egress prices vary by region but the difference is small for a docs site whose payload is dominated by once-cached hashed assets. The Spark (free) plan covers 10 GB of egress per month, which is well above the typical docs-site footprint; the Blaze (paid) plan is required only if traffic grows past the limit. (LabFlow ships no Cloud Functions, so nothing on this project requires Blaze on that account.)

### How do I test the production build locally before deploying?

```bash
cd docs-site
yarn build
yarn serve
```

The `yarn serve` step runs Docusaurus's local server against the `build/` directory. The URL is `http://localhost:3000`. This catches one class of post-build issue — broken anchor links inside the static HTML that the dev server's hot-reload masks. The CI's broken-link check catches the same class earlier in the pipeline.

### How is the deploy gated against deploying a build with broken-link warnings?

The Docusaurus config sets `onBrokenLinks: 'throw'` and `onBrokenAnchors: 'throw'` for production builds. A broken link or anchor fails the build with a non-zero exit code; the CI workflow's `yarn build` step exits with that code; the workflow fails; the deploy doesn't run. The same gate runs on every PR build, so broken links are caught before merge.

### Can preview-channel URLs be indexed by search engines?

By default, preview channels emit a `<meta name="robots" content="noindex">` tag (Docusaurus reads the `NODE_ENV` and `FIREBASE_HOSTING_CHANNEL_ID` env vars). The configuration is in `docusaurus.config.ts` — the `noIndex` flag is `true` for preview builds. Even if a search engine crawler stumbles on a preview URL, the noindex tag tells it not to index. The preview channel's URL also expires after 7 days, so any cached crawl reference is short-lived.

### How is the service account that deploys from CI created?

In the Google Cloud Console for the `labflow-prod` project: IAM & Admin → Service Accounts → Create. Roles needed: `Firebase Hosting Admin`. Download a JSON key. The key is added to GitHub Actions secrets as `FIREBASE_SERVICE_ACCOUNT_LABFLOW_PROD` and consumed by the `FirebaseExtended/action-hosting-deploy` action. The service account is dedicated to CI — never used interactively — and rotates on the same cadence as other platform-shared secrets (see [Admin Panel](/docs/modules/admin-panel#platform-scope-integrations)).

### What does `cleanUrls: true` do?

It tells Firebase Hosting to serve `/docs/modules/authentication` (no `.html` extension) by looking up `/docs/modules/authentication/index.html` or `/docs/modules/authentication.html`. The Docusaurus build emits the `/<slug>/index.html` shape; `cleanUrls` makes the URLs look natural without the suffix. `trailingSlash: false` enforces the no-trailing-slash convention, which matches the canonical URLs in the sitemap.

---

**Next:** [GitHub Publishing](/docs/deployment/github-publish).
