---
sidebar_position: 1
slug: /architecture/overview
title: Architecture overview
description: How LabFlow is built — a React single-page application over one hosted Supabase Postgres project with row-level security, Edge Functions for server-side work, private object storage for uploads, and Firebase Hosting serving the static files.
keywords:
  - LabFlow architecture
  - Supabase Postgres
  - row-level security
  - Edge Functions
  - PHI logging
  - React TypeScript LIMS
image: /img/labflow-social-card.png
---

# Architecture overview

LabFlow is a single-page web application over a hosted Postgres database. That is the whole shape.

## The pieces

| Layer | What |
|---|---|
| **Application** | React 19 + TypeScript, built with Vite. Routing by TanStack Router, server state by TanStack Query, forms by `react-hook-form` + Zod, primitives from React Aria Components, styling in Tailwind CSS v4, charts in D3 |
| **Database** | **Supabase — one hosted Postgres project**, serving development and production both |
| **Authorisation** | **Row-level security, deny-by-default on every table** |
| **Server-side work** | Supabase Edge Functions, and SQL functions where the work is a query |
| **File uploads** | FilesHub, always as **private** objects. Files never go into the database |
| **Static hosting** | **Firebase Hosting serves the built files. That is all Firebase does** — there is no Firebase data tier, no Firestore, no Firebase Authentication and no Cloud Functions |
| **Errors** | Sentry |
| **Analytics** | Google Analytics 4, Amplitude and Microsoft Clarity |
| **Local storage** | `strata-storage`, the single wrapper over browser storage |
| **Text** | Every user-visible string goes through i18next |

## One database, and dev is prod

There is **one Supabase project**. It serves development and production, which is a deliberate constraint rather than an oversight: nothing here can be tested against a copy that behaves differently from the real thing, and no destructive database command is available to anyone.

### The schema is TypeScript

Tables, columns, indexes, enums and row-level-security policies are **declared in TypeScript**, and migrations are generated from those declarations and applied by the Supabase CLI. One source of truth, one applier, one history.

Migrations are forward-only, additive and idempotent. Anything destructive is a separate, explicit decision.

## Where server-side work happens

Two places, and the split is deliberate:

- **SQL functions** where the work *is* a query — the dashboard's figures, the members list, the derived order status. Every one runs as the caller, filtered by tenant and bounded.
- **Edge Functions** where the work is a sequence that must not half-happen: creating a laboratory, inviting or withdrawing a member, uploading an identity document or an accreditation certificate, attaching a scanned document, recording a security alert.

Server functions never hand the browser a privilege it does not otherwise have. Where one runs with elevated rights, the actor is pinned from the verified session rather than taken from the request.

## Patient data does not leave the boundary

**Not into a URL, an analytics property, a log line or an error payload.**

| Channel | What stops it |
|---|---|
| **Logs** | One logger, and direct `console` use is a build error everywhere else. It **strips values that look like identifiers regardless of the key name** — matching on key names alone misses `notes`, `comment`, `details`, `raw` — and in production it refuses objects it cannot vouch for |
| **Sentry** | The query string is stripped from both the event and the breadcrumbs. Stripping it from the event alone is not enough: breadcrumbs are recorded for every navigation and every fetch |
| **Google Analytics** | Automatic page views are off. The event that replaces them carries **the route pattern**, never the address that was visited |
| **URLs** | No name, email or employee number ever appears in one. A person is addressed by a printable reference; a specimen by its accession |

The one deliberate exception is patient search, which writes the typed query into `?q=` so a search can be shared and reopened. Browser history and the referrer header are not scrubbed, and that is the accepted residual cost of that decision, stated rather than hidden.

## Every provider is optional

Sentry, Amplitude, Clarity, Google Analytics and push are each **gated on their own key**. An absent key skips that provider entirely — the application runs without any of them, and no build ever requires a secret to succeed.

## Read next

- [Tenancy and row-level security](./tenancy-and-rls) — how two laboratories share one database.
- [Records and trails](./records-and-trails) — one writer per value, append-only history, and versioned results.
