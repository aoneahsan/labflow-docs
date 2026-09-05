---
sidebar_position: 21
slug: /user-guide/appointments-and-calendar
title: Appointments and the calendar
description: LabFlow's diary and its calendar — why "overdue" is its own bucket rather than a sort order, why a slot is computed on demand instead of stored, and why arriving at a desk and being taken through are two separate facts.
keywords:
  - laboratory appointments
  - phlebotomy booking
  - appointment calendar
  - availability template
  - slot booking
image: /img/labflow-social-card.png
---

# Appointments and the calendar

## Overdue is its own bucket, not a sort order

**`/appointments`** — every booking, in four buckets: overdue, today, upcoming and past.

An appointment whose slot has passed with nobody marking it attended, cancelled or missed is not
"an older upcoming one". It is a decision somebody owes. Blended into a date-sorted list it scrolls
off the bottom, which is how a no-show becomes an unexplained gap in a patient record.

The bucket is computed in the database, in your laboratory's own time zone, against the database's
clock. A browser that worked it out for itself would hold a second definition of "today", and the
two disagree at midnight for anybody who is not sitting where the server is.

## Every transition is a row, and one of them moves nothing

A status is never overwritten in place. Confirming a booking, checking somebody in, starting,
completing, cancelling or marking a no-show each append a row — because *"when did this become a
no-show, and who decided"* is a question somebody eventually asks.

**Checking in and starting are two different facts.** Arriving at a desk and being taken through
happen minutes apart, usually by different people. So "checked in" is recorded and attributed, and
it moves nothing: the booking is still scheduled until somebody starts it. A vocabulary that fused
the two would lose the one a receptionist actually records.

Only the moves that make sense are offered. A completed appointment shows no controls at all, rather
than showing greyed-out ones — and the database refuses an impossible move regardless, because the
page being careful is a courtesy and not a boundary.

## A slot is computed, never stored

**`/calendar`** — the month as a grid, with a week and a day view beside it.

What LabFlow stores is a weekly opening template plus dated exceptions. The free slots are worked out
when you ask for them: expand the template, subtract the exceptions, subtract what is already booked,
drop anything that has already started.

A table of pre-made slots has to be generated forward forever, regenerated every time your hours
change, and reconciled with bookings that already point at the old rows. None of that is work anybody
should have to think about, so LabFlow does not create it.

## Seven columns at every width

Collapsing a month into one column produces a list, not a calendar. Where a narrow screen needs a
list, it gets the **day view** — which is a different view and says so. The month grid scrolls
sideways instead. A grid that silently becomes something else is what makes people stop trusting a
control.

## Two people, one chair

Two receptionists can pick the same slot in the same second. The booking is settled inside a
transaction, so exactly one of them gets it and the other is told immediately and offered the next
one. Validating in the browser is courtesy; it is never the thing that prevents a double booking.
