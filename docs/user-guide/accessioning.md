---
sidebar_position: 7
slug: /user-guide/accessioning
title: Accessioning and the bench
description: Receiving a delivery in LabFlow — one accession per tube, the accession number format and its check digit, and scanning tubes onto a bench.
keywords:
  - accessioning
  - accession number
  - check digit
  - specimen receipt
  - bench scanning
image: /img/labflow-social-card.png
---

# Accessioning and the bench

## Receiving a delivery

**`/samples/register`** — *receive a delivery, one accession per tube*.

Accessioning is the moment the laboratory takes responsibility for a specimen. It appends one `received` custody event, and it is the point turnaround is measured from.

**One accession per tube.** Two tubes from one order get two numbers, because from here they have separate custody and can have separate outcomes.

### The accession number

The format is `A-YY-NNNNNNN-C`: the issue year, a seven-digit sequence held **per laboratory**, and a **check digit**.

Two facts about it are load-bearing:

- **The number is minted by the database, never by the browser.** Two technicians receiving at the same second must not be able to produce the same one.
- **The check digit is there to be typed wrong.** It exists so a mistyped accession is caught at the point of entry rather than discovered when a result lands on the wrong patient. The same algorithm mints it and re-checks it when it is scanned.

An accession that this laboratory does not hold matches nothing. **Nothing is invented to fill the gap** — no partial match, no nearest guess.

## Scanning onto a bench

**`/samples/scan`** — *scan tubes onto the bench*.

The run starts empty and the log is **newest first**, because a technician looks at the top of a list and not the bottom of one. A tube already on another bench is reported as such rather than silently moved.

A specimen that was rejected cannot be scanned back onto a bench as though nothing had happened. The refusal lives in the database, not only in the screen that asks.

**Next:** [Labels and barcodes →](./labels)
