---
sidebar_position: 5
sidebar_label: Local Search (Pagefind)
slug: /deployment/algolia-docsearch
title: Local Search (Pagefind)
description: In-site search for the LabFlow docs is powered by Pagefind — a build-time, fully-local full-text index generated from the emitted static HTML, with a Cmd/Ctrl+K search box, no third-party service, no crawler, and no account.
keywords:
  - Pagefind
  - Docusaurus local search
  - offline docs search
  - static site search
  - in-site documentation search
---

# Local Search (Pagefind)

**In-site search is powered by [Pagefind](https://pagefind.app) — a build-time, fully-local full-text search.** Pagefind indexes the static HTML that Docusaurus emits, so the index reflects exactly what ships, and search runs entirely in the visitor's browser against that index. There is **no third-party search service, no crawler, and no account** — nothing leaves the site, which suits a healthcare-adjacent docs surface where third-party telemetry is unwelcome.

> **History:** an earlier draft of this page documented Algolia DocSearch. The docs site now ships Pagefind instead — a local index avoids the crawler, the account, the "Search by Algolia" attribution, and any third-party data flow.

---

## How it is wired

The integration is the [`docusaurus-plugin-pagefind`](https://www.npmjs.com/package/docusaurus-plugin-pagefind) plugin plus the `pagefind` indexer:

```ts
// docusaurus.config.ts
plugins: [
  ['docusaurus-plugin-pagefind', {}],
],
```

The plugin does two things:

1. **Indexes on build.** In a Docusaurus `postBuild` hook it runs Pagefind over `build/`, writing the index to `build/pagefind/`. So **`yarn build` alone produces a working search** — no extra step, no `npx pagefind`.
2. **Ships the search UI.** It swizzles the theme `SearchBar`, giving a DocSearch-style modal opened by the search box or `Ctrl/Cmd+K`, with keyboard navigation, hit highlighting, and light/dark support.

`pagefind` is a `devDependency`; its per-platform binaries (`@pagefind/linux-x64`, `@pagefind/darwin-arm64`, …) are resolved automatically so the index builds identically in CI and locally.

---

## Verifying search locally

Pagefind's index only exists **after a build**, so search is intentionally absent under `yarn start` (dev). Verify it on a real build:

```bash
yarn build      # generates build/ + build/pagefind/
yarn serve      # open the served build and try Cmd/Ctrl+K
```

If the search box returns nothing, confirm `build/pagefind/pagefind.js` exists — its absence means the `postBuild` index step did not run.

---

## What drives result quality

Result quality comes from the same per-page discipline every docs page already follows: a distinct `title` and `description`, clear H2/H3 headings, and front-matter `keywords`. Pagefind extracts the page body under each heading, so a query for a body term deep-links to the right section. Non-content chrome (navbar, footer, table of contents) is excluded from the index by the plugin's default selectors.

---

## Frequently asked questions

### Does search work offline?

Yes — the index is static files served from the same host, so once a page and the `/pagefind/` assets are cached the search works without a network round-trip. This is a Pagefind advantage over a hosted search service.

### Is there any third-party data flow?

No. There is no search SaaS, no API key, and no analytics call. Queries are resolved locally in the browser against the static index.

### How large is the index?

Pagefind shards its index and loads only the shards a query needs, so the client downloads a small fraction of the total on each search rather than the whole index up front. For a docs site this size the footprint is modest.

### How do I exclude a page or a region from the index?

Pass `excludeGlobs` (page globs) or `excludeSelectors` (CSS selectors) to the plugin options in `docusaurus.config.ts`. The defaults already exclude the navbar, footer, and table of contents.
