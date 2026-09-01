---
sidebar_position: 9
slug: /user-guide/result-entry
title: Result entry
description: Entering results in LabFlow — the bench worklist, judging a value with its reference range already resolved on screen, the single idempotent write path that works online or offline, and finding a result by accession.
keywords:
  - result entry
  - laboratory worklist
  - bench
  - offline outbox
  - result flag
image: /img/labflow-social-card.png
---

# Result entry

**`/results/entry`** — *enter a value while everything needed to judge it is already on screen*.

**`/results`** lists results, and **`/results/:resultId`** is one of them.

## The bench worklist

The entry screen is scoped to a **bench**. Specimens appear the moment they are accessioned to it; scan one to add it, or change the bench.

An accession is assigned **at receipt and does not move** when a tube is aliquoted to a second bench, so a specimen missing from your list is usually on another bench rather than missing.

## Judging a value where it is entered

The point of the screen is that the context arrives with the field. The reference interval is **already resolved for this patient** — by age, sex and method — so the flag is part of the result rather than something the reader has to work out from a printed range.

See [panels and reference ranges](./panels-and-reference-ranges) for how the interval is chosen.

## One write path, online or offline

An entry is written by **one function**, and that function is **idempotent on an entry key** minted before the write.

That single fact is what makes an offline queue safe. When a write cannot be sent it stays in the outbox, the screen says how many entries it is holding, and draining it later cannot produce a duplicate result — replaying an entry that already landed is a no-op rather than a second value on the same test.

The online path and the offline path run **the same code**.

## Finding a result

Search by **accession** rather than by test name. One specimen carries several tests, so an accession finds the whole tube where a test name finds one analyte across many patients.

## "Amended" is not a status

You will not find it in the filter. An amendment is a **new version** of the result pointing at the one it supersedes — see [result review and release](./result-review-and-release).

**Next:** [Result review and release →](./result-review-and-release)
