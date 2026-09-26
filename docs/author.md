---
sidebar_position: 99
slug: /author
sidebar_label: About LabFlow
title: About LabFlow
description: Who makes LabFlow and how to reach the LabFlow team — contact, corrections to this documentation, supporting the project, how to cite LabFlow, and the open-source work it is built on.
keywords:
  - LabFlow
  - LabFlow team
  - contact LabFlow
  - cite LabFlow
  - LIMS
image: /img/labflow-social-card.png
---

# About LabFlow

LabFlow is a multi-tenant Laboratory Information Management System for clinical laboratories, designed, built and maintained by **the LabFlow team**.

## Contact the LabFlow team

| Channel | |
|---|---|
| **Email** | [aoneahsan@gmail.com](mailto:aoneahsan@gmail.com) |
| **Documentation corrections** | [github.com/aoneahsan/labflow-docs](https://github.com/aoneahsan/labflow-docs) — issues and suggested edits |
| **Support the project** | [Support LabFlow](https://aoneahsan.com/payment?project-id=labflow&project-identifier=com.aoneahsan.labflow) |

If you want LabFlow at your laboratory, email is the fastest channel.

## What LabFlow is built with

React 19 and TypeScript on the front, one hosted Supabase Postgres project behind it, and row-level security as the actual access boundary rather than a layer of application checks over an open database. The schema is declared in TypeScript and the migrations are generated from it.

The design principles that shape it are on the [architecture pages](./architecture/overview): one writer per value, append-only trails, versioned results, and no number on a screen that the database did not compute.

## Licensing

The **LabFlow application repository is private**. This **documentation repository is public**, so the docs can be indexed, read and corrected without exposing the application's source.

## Supporting the project

1. **Contribute financially** — [Support LabFlow](https://aoneahsan.com/payment?project-id=labflow&project-identifier=com.aoneahsan.labflow).
2. **Send corrections.** If a page here describes something that does not match the product, that is a defect in the documentation and worth an email or an issue. Accuracy is the point of this site.

## Citing LabFlow

```text
LabFlow team. LabFlow — Multi-tenant Laboratory Information Management System.
Documentation: https://labflow-docs.aoneahsan.com
Application: https://labflow.aoneahsan.com
```

## Acknowledgements

- **React**, **TanStack** (Query, Router) and **React Aria Components** — the runtime, the routing and data layer, and the accessibility primitives.
- **Supabase** and **PostgreSQL** — the database, and the row-level security that makes multi-tenancy provable rather than promised.
- **D3** — every chart in the product.
- **LOINC** — without a coded catalogue, a test name is just a word.
- **Docusaurus** — what you are reading.
