---
sidebar_position: 4
slug: /user-guide/panels-and-reference-ranges
title: Panels and reference ranges
description: LabFlow panels and reference ranges — ordering a group of tests together, why a reference range is a function rather than a column, per-patient personalised ranges, and why a released result keeps the range it was read against.
keywords:
  - test panel
  - reference range
  - reference interval
  - personalised range
  - critical value threshold
image: /img/labflow-social-card.png
---

# Panels and reference ranges

## Panels

**`/tests/panels`** — *what gets ordered together, and in what order it reports*.

A panel is a named group of catalogue tests with a **declared reporting order**, plus one sentence saying why the panel exists, written for whoever reviews the panel list in three years.

Reordering is **two buttons, deliberately** — there is no drag handle, and there will not be one. A reporting order that changes because a finger slipped on a touchscreen is a report that reads differently for no recorded reason.

## Reference ranges

**`/reference-ranges`** — *a reference range is a function, not a column*.

This is the difference between a system that prints an interval beside a number and one that has already resolved it:

| | |
|---|---|
| **Printed** | `Haemoglobin 9.1 g/dL` · `Normal: 12.0–15.5`. The reader does the arithmetic. Nothing states which population that interval belongs to, whether it matches this patient, or which method produced it |
| **Resolved** | `Haemoglobin 9.1 g/dL Low` · `ref 12.0 to 15.5 · adult female · this method`. The interval was selected by age, sex and method, and the flag is part of the result rather than a rendering of it |

Ranges are held as **bands**. A band carries its own low and high, and optionally its own critical low and high — **leave both critical fields empty and that band can never raise a critical flag.**

:::info The intervals are yours
LabFlow resolves against the ranges your laboratory has verified for its own methods and population. **It does not supply clinical reference intervals.**
:::

### A released result keeps the range it was read against

Ranges change. Editing a band changes what the **next** result means; it does not reach back. A released result stores the interval that applied when it was produced, exactly as an audit row stores the role that applied when it was written.

## Personalised ranges

**`/results/personalized-ranges`** — *the patients for whom the population range is the wrong answer*.

Some patients need their own interval: the population band would flag every result they ever produce, or flag none of the ones that matter. A personalised range overrides the band for that patient and that test.

**Changing an override never rewrites a result that already exists.** The then-and-now comparison arrives with released results, so a reader can see both what was used and what would be used now.
