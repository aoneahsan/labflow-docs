---
sidebar_position: 6
slug: /user-guide/specimens
title: Specimens and chain of custody
description: How LabFlow tracks a physical tube — the six specimen statuses, the seven custody event kinds, why the status is a fold of the custody trail rather than an editable field, registering a collection, and collection runs.
keywords:
  - chain of custody
  - specimen tracking
  - specimen status
  - custody trail
  - specimen rejection
  - collection run
image: /img/labflow-social-card.png
---

# Specimens and chain of custody

**`/samples`** — *every tube the laboratory holds, and where each one is now*. **`/samples/:accession`** is one specimen.

The address carries the **accession**, not an internal id. That is deliberate: an accession is not a name and not a date of birth, and it is the one identifier a person holding a tube can actually type.

## One order, more than one tube

Tubes drawn for one order are **separate specimens with separate accessions, separate custody and separate outcomes.** One can be rejected while the other is worked. Collapsing them into one record is what makes a laboratory system unable to express half of a real day.

## The custody trail

Every hand a specimen passes through is a row: who, when, where, and what condition it was in. That record is what an investigation reads six months later when a result is questioned, and it is why **a rejected specimen carries a reason rather than only a status**.

The trail is **append-only**. Nothing in it is edited, and nothing is removed.

### Seven event kinds

| Kind | Moves the status? |
|---|---|
| `collected` | Yes |
| `received` | Yes |
| `stored` | Yes |
| `rejected` | Yes |
| `discarded` | Yes |
| `in_transit` | **No** — an observation about where it is |
| `temperature_excursion` | **No** — an observation about its condition |

An excursion recorded late is recorded, **not overwritten**. LabFlow records that an excursion happened and who or what reported it; it does not read your refrigerator.

### Six statuses

`expected` · `collected` · `received` · `stored` · `rejected` · `discarded`

`expected` is the state of a specimen with no events yet. The other five each arrive from the event of the same name.

:::info The status is not a field you can edit
**A specimen's status is a cache of the last custody row, and no role holds permission to write it directly.** It is recomputed from the whole trail whenever an event is appended. That is what makes the status and the trail unable to disagree — including for a refused specimen, which cannot be quietly un-rejected by scanning it onto a bench.
:::

## Collection runs

**`/samples/collections`** — *the circuits that bring specimens in*. A run is `scheduled`, `running` or `complete`; each stop is `pending`, `en route` or `done`.

This is the collection **board** as the approved design draws it. Route planning, an optimiser and offline field capture are wave 6 and are [not built](../roadmap).

**Next:** [Accessioning and the bench →](./accessioning)
