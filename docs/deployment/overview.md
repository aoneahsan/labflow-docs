---
sidebar_position: 1
slug: /deployment/overview
title: Hosting and publishing
description: Where LabFlow runs and how this documentation is published — Firebase Hosting for the application's static files, hosted Supabase for its data, and GitHub Pages for these docs with a local Pagefind search index.
keywords:
  - LabFlow hosting
  - Firebase Hosting
  - GitHub Pages docs
  - Pagefind search
  - documentation deployment
image: /img/labflow-social-card.png
---

# Hosting and publishing

## Where LabFlow runs

LabFlow is a **hosted product**. There is no self-hosted distribution, no installer and no on-premise option.

| | |
|---|---|
| **The application** | Built to static files and served by **Firebase Hosting** at [labflow.aoneahsan.com](https://labflow.aoneahsan.com) |
| **The data** | One hosted **Supabase Postgres** project |
| **Server-side work** | Supabase Edge Functions |

Firebase's role begins and ends at serving files. There is no Firebase data tier, no Firebase Authentication and no Cloud Functions — see [architecture](../architecture/overview).

## How this documentation is published

This site is a **separate, public repository**, built with Docusaurus and deployed to **GitHub Pages** by a workflow that runs on every push to the default branch. The application's own source is private; keeping the docs separate is what lets them be public, indexed and correctable.

Because the repository is public, **no credential of any kind belongs in it**. Every configuration value here is a placeholder, and the build never requires a secret to succeed.

### Search

Search is **Pagefind**, indexing the emitted static HTML in a post-build step. It runs entirely in the browser — no crawler, no third-party service, no account, and no request leaves the page when you search. `yarn build` alone produces a working index.

### The build is the link checker

The site is configured to **fail the build on a broken internal link**, which is why a link here either resolves or the site does not ship. A page whose target was deleted is a build error, not a 404 discovered by a reader.
