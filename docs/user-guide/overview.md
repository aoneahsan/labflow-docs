---
sidebar_position: 1
slug: /user-guide/overview
title: User Guide Overview
description: Recipe-style how-to guides for the most common LabFlow tasks — registering patients, validating results, running QC, processing claims. Indexed by role.
keywords:
  - LabFlow user guide
  - LIMS how-to
  - lab technician guide
  - lab admin guide
---

# User Guide Overview

This guide is organised as a set of **how-to recipes** — each page solves one problem end-to-end. If you want a conceptual understanding of how LabFlow is structured, read [Architecture](../architecture/overview) first; if you want a complete catalogue of features, see [Modules](../modules).

---

## How to use this guide

Pick the role you fill at your laboratory and start with the recipes flagged for that role. Every recipe lists the required permission(s) — if a button is missing in your account, you don't have the permission, not the feature.

LabFlow ships with **11 built-in roles** and **177 fine-grained permissions** across 16 categories. Roles are starting points, not straitjackets — admins can clone any role and edit its permissions to fit local practice.

---

## Roles at a glance

| Role | Typical user | Headline capabilities |
|---|---|---|
| **Super Admin** | Platform owner | All permissions; tenant management; cross-tenant visibility |
| **Admin** | Laboratory administrator | Full tenant access; user management; settings |
| **Lab Manager** | Lab director / operations head | Staff scheduling, QC oversight, report templates, inventory |
| **Pathologist** | Senior reviewer / signatory | Final result approval, addendum, critical-value sign-off |
| **Senior Technologist** | Reviewer | Technical validation (Reviewed state) |
| **Lab Technician** | Bench staff | Sample processing, result entry, QC runs |
| **Phlebotomist** | Sample-collection staff | Sample collection workflow, mobile / home collection |
| **Front Desk** | Reception | Patient registration, order entry, appointment booking |
| **Billing** | Finance staff | Invoicing, payments, claim processing |
| **Inventory** | Stores staff | Stock management, vendors, purchase orders |
| **Patient** | Patient self-service | Read own results, book appointments |

A user can hold multiple roles. The effective permission set is the **union** of all assigned roles' permissions.

---

## Recipe index by role

Each role below links to its step-by-step recipes. Where a standalone recipe page isn't written yet, the link points to the **module reference**, which documents the same workflow in full (every screen, field, and option). The module pages are the authoritative source; recipes are the quick how-to on top of them.

### Front Desk recipes

- [Register a new patient](./patients/registration)
- Search, insurance, and requisitions — see the [Patient Management](../modules/patient-management) and [Test Orders](../modules/test-orders) modules
- Book an appointment — see the [Appointments](../modules/appointments) module

### Lab Technician recipes

- [Accession a received sample](./samples/accession) (includes rejection and recollection)
- [Run a quality-control check](./quality-control/run-qc)
- Enter manual results and print labels — see the [Results Management](../modules/results-management) and [Settings → label templates](../modules/settings) modules

### Senior Technologist / Reviewer recipes

- [Validate and release a result](./results/validate-and-release) (covers review, flagged values, and Westgard violations)
- Westgard rule detail — see the [Quality Control](../modules/quality-control) module

### Pathologist / Approver recipes

- [Validate and release a result](./results/validate-and-release) (covers approval, critical-value acknowledgement, and addenda)

### Phlebotomist recipes

- Collect a sample with the mobile app, run a home-collection route, and sync offline collections — see the [Home Collection](../modules/home-collection) and [Mobile App](../modules/mobile-app) modules

### Billing recipes

- [Generate an invoice](./billing/create-invoice)
- Submit a claim, record a payment, and run financial reports — see the [Billing & Insurance](../modules/billing-insurance) module

### Inventory recipes

- Stock items, purchase orders, reagent lots, and low-stock thresholds — see the [Inventory](../modules/inventory) module

### Admin recipes

- Invite users and clone roles — see the [User Management](../modules/user-management) module
- Branding, templates, and HL7 / FHIR endpoints — see the [Settings](../modules/settings) and [EMR Integration](../modules/emr-integration) modules

---

## Conventions used in recipes

- **Bold UI labels** match the on-screen text. If the screen says "Add Patient", the recipe also says "Add Patient" — never paraphrased.
- **Code blocks** carry exact strings (URLs, environment variables, IDs). Copy them verbatim.
- **Callouts** (`> **Note:** …`) flag things that are easy to miss but matter.
- **Required permissions** are listed at the top of every recipe. If you can't see the button, you probably don't have the permission.
- **Last updated** stamps appear at the bottom of every page so you can tell whether a recipe is current.

---

## When a standalone recipe isn't written yet

Some role tasks link to a module reference rather than a dedicated recipe. The module pages document the same workflow exhaustively — every screen, field, option, and permission — so nothing is missing; the recipe is simply the shorter how-to view. If you'd like a specific recipe written, ask [the author](../author) directly.

---

**Next:** [Modules catalogue →](../modules)
