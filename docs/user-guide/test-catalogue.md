---
sidebar_position: 3
slug: /user-guide/test-catalogue
title: Test catalogue
description: The LabFlow test catalogue — LOINC codes, specimen and container requirements, units and reported precision, department and instrument, critical values, and why a retired test is never deleted.
keywords:
  - test catalogue
  - LOINC code
  - laboratory test directory
  - specimen requirements
  - critical value
image: /img/labflow-social-card.png
---

# Test catalogue

**`/tests`** is the catalogue — *what this laboratory offers, and what each test costs in time*. **`/tests/new`** adds one, **`/tests/:testId`** shows it and **`/tests/:testId/edit`** changes it.

Orders reference the catalogue rather than free text. That is what lets a haemoglobin ordered here be recognised elsewhere, and it is what makes a panel more than a list of words.

:::info The catalogue is yours
LabFlow ships **no pre-loaded national test menu**. Shipping one would mean shipping somebody else's clinical decisions as your default.
:::

## What a catalogue entry carries

| Field | Notes |
|---|---|
| **Name** | What appears on a worklist and a report |
| **Code** | Short, upper case, unique in this catalogue |
| **LOINC code** | Format `NNNNN-N`. The check digit is part of it |
| **Department** | Which bench owns it |
| **Instrument** | Where it physically runs. Two analysers may run one method — the range follows the method, the quality control follows the instrument |
| **Method** | Recorded on every result, because a range belongs to a method as much as to a patient |
| **Container** | Tube type and cap colour, as the phlebotomist sees it |
| **Storage** | How the specimen must be held |
| **Unit** | See the warning below |
| **Reported precision** | Reported precision, not analyser precision. Reporting more digits than the method supports invents confidence |
| **Critical value** | A value where delay causes harm. It escalates to a named clinician and **holds release until the escalation is acknowledged** |
| **Turnaround** | Derived from the median transport time measured on this site |
| **Notes** | Rich text, shown on the catalogue row and on the ordering screen |

:::danger Changing a unit is not a conversion
**Changing a unit later does not convert released results — it changes what the next one means.** A unit change is normally a new test definition, not an edit.
:::

## Leaving the critical value blank

Blank means **this test never escalates**. That is a decision, not a default, and it is worth making on purpose.

## Three states, and why nothing is deleted

| State | Orderable | Notes |
|---|---|---|
| **Planned** | No | Defined and not yet offered |
| **Active** | Yes | In use |
| **Retired** | No | **Not deleted** — historical results reference it |

A retired test is not editable. Its definition has to keep meaning what it meant when a result was produced against it.
