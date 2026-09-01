---
sidebar_position: 99
slug: /author
title: About the author — Ahsan Mahmood
description: LabFlow is built and maintained by Ahsan Mahmood — full-stack engineer working in React, TypeScript and Postgres, with a focus on multi-tenant healthcare software. Contact, portfolio, GitHub and LinkedIn.
keywords:
  - Ahsan Mahmood
  - LabFlow developer
  - aoneahsan
  - Zaions
  - React TypeScript Postgres developer
  - LIMS developer
image: /img/labflow-social-card.png
---

# About the author — Ahsan Mahmood

LabFlow is designed, built and maintained by **Ahsan Mahmood**, a full-stack engineer working in React, TypeScript and Postgres, with a focus on multi-tenant healthcare software.

## Contact

| Channel | |
|---|---|
| **Email** | [aoneahsan@gmail.com](mailto:aoneahsan@gmail.com) |
| **Portfolio** | [aoneahsan.com](https://aoneahsan.com) |
| **LinkedIn** | [linkedin.com/in/aoneahsan](https://linkedin.com/in/aoneahsan) |
| **GitHub** | [github.com/aoneahsan](https://github.com/aoneahsan) |
| **npm** | [npmjs.com/~aoneahsan](https://npmjs.com/~aoneahsan) |
| **Phone / WhatsApp** | [+92 304 6619706](tel:+923046619706) — also on [WhatsApp](https://wa.me/923046619706) |
| **Brand** | [Zaions](https://zaions.com) |
| **Support development** | [aoneahsan.com/payment?project-id=labflow](https://aoneahsan.com/payment?project-id=labflow&project-identifier=com.aoneahsan.labflow) |

## What LabFlow is built with

React 19 and TypeScript on the front, one hosted Supabase Postgres project behind it, and row-level security as the actual access boundary rather than a layer of application checks over an open database. The schema is declared in TypeScript and the migrations are generated from it.

The design principles that shape it are on the [architecture pages](./architecture/overview): one writer per value, append-only trails, versioned results, and no number on a screen that the database did not compute.

## Licensing

The **LabFlow application repository is private**. This **documentation repository is public**, so the docs can be indexed, read and corrected without exposing the application's source.

If you want LabFlow at your laboratory, or want to commission work on it, email is the fastest channel.

## Supporting the project

1. **Contribute financially** — [aoneahsan.com/payment?project-id=labflow](https://aoneahsan.com/payment?project-id=labflow&project-identifier=com.aoneahsan.labflow).
2. **Send corrections.** If a page here describes something that does not match the product, that is a defect in the documentation and it is worth an email. Accuracy is the point of this site.
3. **Hire the author.** See [aoneahsan.com](https://aoneahsan.com).

## Citing LabFlow

```text
Mahmood, Ahsan. LabFlow — Multi-tenant Laboratory Information Management System.
Documentation: https://labflow-docs.aoneahsan.com
Author: https://aoneahsan.com
```

## Acknowledgements

- **React**, **TanStack** (Query, Router) and **React Aria Components** — the runtime, the routing and data layer, and the accessibility primitives.
- **Supabase** and **PostgreSQL** — the database, and the row-level security that makes multi-tenancy provable rather than promised.
- **D3** — every chart in the product.
- **LOINC** — without a coded catalogue, a test name is just a word.
- **Docusaurus** — what you are reading.
