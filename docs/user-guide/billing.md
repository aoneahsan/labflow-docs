---
sidebar_position: 16
slug: /user-guide/billing
title: Billing, payments and claims
description: LabFlow's revenue surfaces — why an invoice balance is never stored, why a part-paid late invoice shows as partial rather than overdue, why a rejected claim and a denied claim cannot be merged, and the two denial rates that use different denominators.
keywords:
  - laboratory billing
  - invoice balance
  - payment allocation
  - insurance claim
  - claim denial rate
  - rejection rate
image: /img/labflow-social-card.png
---

# Billing, payments and claims

## The balance is never stored

**`/billing`** — *what is owed, derived every time it is asked*.

An invoice's outstanding amount is a `SUM` over its payments. It is **computed in the database and
stored nowhere**, and that is a deliberate decision rather than an optimisation left undone.

> A stored balance has two writers the moment anything else can pay an invoice — and two writers on
> a money column is how a laboratory loses track of what it is owed.

The same reasoning governs stock on hand and, for the same reason, is stated on those pages too.

## Overdue is a question about a date, not a status

A **part-paid late invoice shows as `partial`**, not `overdue`. Both facts are true of it, and the
list has to choose one word; it chooses the one describing what the invoice *is* rather than what
the calendar says about it.

This matters when reading the summary above the table. The Overdue figure and the `overdue` rows in
the list beneath it answer slightly different questions, and a build that made them agree by summing
the same rows twice would be reporting one number as two.

## Payments are allocated, and an allocation is recorded against you

**`/billing/payments`** — a payment arrives, and somebody decides which invoice it settles.

Where a payment carries no invoice reference, it can be matched by hand. **Nothing in that dialog is
suggested, ranked or ordered by amount.**

> Round monthly bills collide constantly, so a total that matches to the penny is a coincidence about
> as often as it is a clue. Allocating on that alone creates two errors out of one unknown — an
> account credited that did not pay, and one still chased that did.

The open-invoice list is ordered **oldest-due-first**, which is the order a biller actually chases,
and the page says so — so that the most-overdue invoice appearing first is not read as a suggestion.
Searching by an amount returns nothing, deliberately. The allocation is recorded against the person
who made it, and reversing it later is a **new event** rather than an undo.

## A rejected claim and a denied claim are different things

**`/billing/claims`** — and the distinction is enforced by the database, not by a convention.

- **Rejected** — the claim did not reach adjudication. A field was wrong, a code was missing, the
  file would not parse. Nobody has decided anything about the treatment.
- **Denied** — it was adjudicated, and the answer was no. A denial carries a reason.

A denied claim records a denial reason; a rejected one cannot carry a denial reason, and a check
refuses the row that tries. The old system fused the two and under-reported denials as a result.

## Two rates, two denominators

**`/billing/reports`** publishes a **denial rate** over adjudicated claims and a **rejection rate**
over submitted ones. They are not interchangeable and they do not share a denominator.

Both report **nothing at all** when their denominator is zero — never `0%`, which a reader would
take for a perfect month rather than an empty one.
