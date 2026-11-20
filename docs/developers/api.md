---
sidebar_position: 3
slug: /developers/api/
title: "The LabFlow API"
description: "LabFlow's read-only REST API: base address, the OpenAPI 3.1 file, the resources patients and staff can read, and cursor pagination."
keywords:
  - labflow api
  - laboratory api
image: /img/labflow-social-card.png
---

# The LabFlow API

**A read-only REST API, described in full by an OpenAPI file built from the code it runs.**

```text
https://yqsjetrfhjjollsyjyie.supabase.co/functions/v1/api/v1
```

```bash
curl -H "Authorization: Bearer $LABFLOW_KEY" "https://yqsjetrfhjjollsyjyie.supabase.co/functions/v1/api/v1/equipment?limit=5"
```

## Reference

| File | Address |
|---|---|
| OpenAPI 3.1, JSON | [`/v1/openapi.json`](https://yqsjetrfhjjollsyjyie.supabase.co/functions/v1/api/v1/openapi.json) |
| The same, as Markdown | [`/v1/openapi.md`](https://yqsjetrfhjjollsyjyie.supabase.co/functions/v1/api/v1/openapi.md) |

## Resources

Every resource answers `GET` only: a list and one record by id.

| For | Resources |
|---|---|
| Patients | `reports`, `report_results`, `orders`, `my_visits`, `invoices`, `invoice_lines` |
| Staff | `workload`, `qc_materials`, `qc_runs`, `equipment`, `equipment_due`, `stock_items`, `stock_lots`, `tests`, `reference_ranges`, `panels` |

Staff resources are built from columns that cannot identify a patient: workload comes out as counts and median
minutes per laboratory, day and department, never as rows about a specimen.

## Pagination

Lists return **20 rows a page**, **50 at most**. When more follow, `meta.next_cursor` is set; send it back as
`cursor`. Limits and errors are on [Access keys](./authentication.md#rate-limits-and-errors).
