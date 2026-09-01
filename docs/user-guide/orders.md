---
sidebar_position: 5
slug: /user-guide/orders
title: Orders
description: Placing and tracking test orders in LabFlow — the four order statuses, priority as part of the order, why "needs attention" is a question rather than a status, and the ordered test as a first-class record.
keywords:
  - test order
  - order status
  - stat order
  - laboratory requisition
  - ordered test
image: /img/labflow-social-card.png
---

# Orders

**`/orders`** — *what has been asked of this laboratory, and how far each request has got*. Selecting an order opens it in a drawer, and the drawer's identity is in the address (`?order=`), so an order can be linked to directly.

`/tests/orders` and `/tests/orders/:orderId` are older addresses for the same thing. They still work: both redirect here, and the second one **carries the order with it** rather than dropping you on the bare list.

## The shape of an order

**One order can need three tubes, and one tube can serve six tests.** That many-to-many relationship is the domain, not an inconvenience, so LabFlow keeps three separate records: the order, the specimen, and the **ordered test**.

The ordered test matters more than it looks. *A test with no result yet is a real state* — it is queryable, it ages, and it is what a worklist lists. Fold it into the result and there is nothing to list until the work is already done.

## Four statuses

| Status | Means |
|---|---|
| `awaiting` | Placed, nothing worked yet |
| `working` | In progress |
| `complete` | Everything asked for has been produced |
| `cancelled` | Withdrawn, with the record of the attempt intact |

**"Needs attention" is not a fifth status — it is a question**, and it is derived rather than stored. An order whose specimen was rejected needs attention until a recollection arrives; storing that as a status would strand the order there for ever, because nothing would move it back.

## Priority

`stat` · `urgent` · `routine`. Priority is **part of the order, not a note on it**, so a routine draw and a stat draw are different objects to a worklist rather than different phrasing to a human.

Priority records **what the clinician asked for, never what the laboratory achieved.** How long it actually took is a separate question, answered on the [dashboard](./dashboard).

## Filters

The order list filters by status, priority and free text, and every filter is held in the address — so a filtered view is shareable and survives a refresh.
