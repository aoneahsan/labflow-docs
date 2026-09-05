---
sidebar_position: 22
slug: /user-guide/home-collection
title: Home visits, routes and the phone
description: LabFlow's home collection — why an unsuccessful visit is not a cancelled one, why the address is on one device and nowhere else, why the routes page draws a schematic rather than a map, and why the phlebotomist's screen works with no signal.
keywords:
  - home phlebotomy
  - mobile collection
  - route optimisation
  - offline data capture
  - patient address privacy
image: /img/labflow-social-card.png
---

# Home visits, routes and the phone

## Unsuccessful is not cancelled

**`/home-collection`** — every visit and the stage it has reached.

A **cancelled** visit was called off before anybody travelled. An **unsuccessful** one means a
phlebotomist attended and came back without a specimen: nobody home, a refusal, or a draw that
failed. The remedy is a re-visit, and somebody has to arrange it. Collapsing the two into "not done"
loses the only fact that generates work.

There are nine states in one vocabulary, and the patient-facing portal renders friendlier words over
the same values rather than keeping a second model that drifts out of step.

## The address is on one device, and nowhere else

This is the only piece of directly identifying data LabFlow holds about where somebody lives, and it
is treated accordingly.

It is stored on the **visit**, never on the patient record. It never appears in a list, never in a
web address, and not on the visit's own page — a manager reviewing a worklist has no need of it, and
every surface that shows it is another place it can leak.

The one way to read it is from the phone of the phlebotomist **assigned to that visit**, and only
while the visit is actually under way. Not their colleague on the other shift. Not the manager who
can see everything else about the booking. **Every successful read is recorded**, so a manager sees
*that* the address was read, and how often, without ever seeing the line itself.

## The routes page shows how far, never where

**`/home-collection/routes`** — the day's rounds as an ordered stop list, with a schematic beside it.

The list is the specification; the diagram is the illustration. It shows the shape of a round — how
many stops, which are done, in what order — and if the two ever disagree, the list is right.

**It is deliberately not a map of where people live.** A pin on a street is an address in another
form, and this is a manager's page. The distances and travel times you see are measured by the
phlebotomist's own device, which already holds the addresses legitimately; the manager gets the
numbers without the locations.

## The optimiser proposes; a person accepts

It cannot see that the 10:00 patient is dialysing at 11. So a reordering that saves nine minutes is
a suggestion with its reasoning shown — never a change that happens to somebody's morning while they
are driving.

When there is nothing worth proposing, the buttons are **gone** rather than greyed out. A disabled
"Accept the new order" implies a proposal exists. Refusing a suggestion is recorded too: the
suggestion stays visible, because the reason to refuse it may not hold tomorrow.

## The phone works with no signal

**`/home-collection/mobile-capture`** — one stop at a time, one-handed, designed for 320–390 pixels
rather than a desktop. It is the only screen in LabFlow built that way, and it is why the actions are
full-width buttons at the bottom of the thumb's reach.

**Offline is the normal state, not the error state.** A phlebotomist in a stairwell has no signal and
is still working. Every press is written to the device first and synced later, so the banner reports
a *queue* rather than a failure, and nothing on the screen is disabled because the network is gone.

Each queued event carries **the time it actually happened**, not the time it uploads — so a stop
recorded at 08:41 and synced at 09:20 is on the record as 08:41. Pressing the same button twice
records one event, and a sync that is interrupted and retried writes nothing extra.

The queue is visible, deliberately. That is the difference between trusting the device and re-doing
work at the end of a shift because nobody could tell whether the last three stops saved.
