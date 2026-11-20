---
sidebar_position: 5
slug: /developers/webhooks/
title: "Webhooks"
description: "LabFlow webhooks: report releases, order and invoice changes for patients; QC, equipment and stock alerts for staff; signed with Standard Webhooks, retried, never carrying a result value."
keywords:
  - labflow api
  - laboratory api
image: /img/labflow-social-card.png
---

# Webhooks

**LabFlow tells your server when something happens, signed so you can check it came from us.** A webhook carries ids,
states and times only, never a result value or anything that identifies a patient; read the record through the
[API](./api.md) with your own key when you need more.

## Events

| Event | Who receives it | Sent when |
|---|---|---|
| `report.released` | The patient | A laboratory releases a report to you (id and release time) |
| `order.status_changed` | The patient | One of your orders moves on |
| `invoice.issued` | The patient | An invoice is addressed to you (id, issue and due dates) |
| `qc.out_of_control` | Staff whose role opens QC | A control run goes out of control |
| `equipment.status_changed` | Staff whose role opens equipment | An instrument goes in or out of service |
| `inventory.low_stock` | Staff whose role opens stock | On-hand stock reaches the reorder point |
| `webhook.test` | You | You press **Send a test event** |

## Addresses

`https://` only, on 443 or 8443. Private, local, link-local and cloud metadata addresses are refused, also when a host
name resolves to one.

## Checking a request

LabFlow follows [Standard Webhooks](https://www.standardwebhooks.com/): `webhook-id` (the same on every retry),
`webhook-timestamp` and `webhook-signature` (`v1,` and a base64 HMAC-SHA256). The secret starts `whsec_`.

```js
import { Webhook } from 'standardwebhooks';
const wh = new Webhook(process.env.LABFLOW_WEBHOOK_SECRET);
const event = wh.verify(rawBody, headers); // throws on a bad signature or an old timestamp
```

Verify the exact bytes you received, before parsing. Refuse a timestamp more than 300 seconds from now.

## Retries

Any `2xx` is delivered. Otherwise LabFlow retries at once, then after 5 seconds, 5 minutes, 30 minutes, 2 hours, 5
hours, 10 hours and 10 hours. An address is turned off only by `410 Gone` or after 5 days of failing, and you get an
email when that happens. **Send again**, the delivery log and **Pause** are on the address's row.
