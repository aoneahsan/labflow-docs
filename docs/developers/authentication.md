---
sidebar_position: 2
slug: /developers/authentication/
title: "Access keys"
description: "Make a read-only LabFlow access key, see it again within ten minutes of signing in, and stay inside the rate limits; staff keys only reach the areas their role opens."
keywords:
  - labflow api
  - laboratory api
image: /img/labflow-social-card.png
---

# Access keys

**An access key lets your own script read LabFlow as you.** It starts `lf_pat_`, goes in the `Authorization` header,
and can only read.

## How do you make one?

1. Patients: **Sign-in and apps** in the portal. Staff: **Settings → Apps and assistants**.
2. Choose **Make a key** and name it after where it will live.
3. Tick what it may read. Staff only see the areas their role opens in LabFlow.
4. Choose 30, 90 or 365 days, or no expiry.
5. Copy it. LabFlow shows it in full this once.

## Can you see a key again?

Within **ten minutes of signing in**, yes. After that LabFlow asks you to sign in again, and with two-factor on, for
a code. A remembered browser never counts here.

## Scopes

| Scope | Who | Reads |
|---|---|---|
| `reports:read` | Patients | Your released reports and their results |
| `orders:read` | Patients | Your orders and your booked visits |
| `invoices:read` | Patients | Your invoices and their lines |
| `workload:read` | Staff | Specimens received, results released and median turnaround, as counts |
| `qc:read` | Staff | QC materials and runs, with the Westgard rules each fired |
| `equipment:read` | Staff | Equipment, its status and its calibration and service dates |
| `inventory:read` | Staff | Stock items, lots and reorder points |
| `catalogue:read` | Staff | Tests, reference ranges and panels |

## Replace and remove

**Replace** gives a new key and keeps the old one working for 24 hours. **Remove** stops a key at once.

## Rate limits and errors

Each key may send **120 requests a minute**, and your account has a daily total set by your plan. `RateLimit-*`
headers say where you stand; past a limit the API answers `429` with `Retry-After`. Every error has one shape:

```json
{ "error": { "code": "scope_required", "message": "This credential needs the qc:read permission.", "details": { "scope": "qc:read" }, "correlation_id": "req_…" } }
```

Program against `code`. Quote `correlation_id` if you write to us about a request.
