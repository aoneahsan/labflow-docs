---
sidebar_position: 3
slug: /architecture/records-and-trails
title: Records and trails
description: The LabFlow record-integrity rules — one writer per value, cached values derived from append-only trails, the result status model with a single transition function, and amendment as a new version rather than an edit.
keywords:
  - append-only audit trail
  - one writer per value
  - result status model
  - result versioning
  - amended result
  - data integrity
image: /img/labflow-social-card.png
---

# Records and trails

Three rules decide how LabFlow stores anything that matters. Each exists because its absence was measured in the application this replaces.

## One writer per value

**Anything derived is written by exactly one path, and no client role can write it directly.**

The clearest case is a specimen's status. It is a cache of the last custody row, and **no role holds permission to update it** — it is recomputed from the whole trail by one function whenever an event is appended. That is what makes the status and the trail unable to disagree.

The rule that follows is less obvious and is the one that gets missed: **the constraint lives in the derivation, not in the caller.** Refusing an illegal append in the screen that appends it fixes the path a person takes; it does nothing about the other paths. A rule enforced only where a human can see it is not a rule the data has.

## Trails are appended, never edited

| Trail | Records |
|---|---|
| **Custody** | Every hand a specimen passed through — who, when, where, what condition |
| **Membership events** | Invited, accepted, signed in, role changed, scope changed or cleared, access withdrawn or restored |
| **Result events** | Entered, transitioned, amended, and every rule that fired |
| **Authentication events** | Sign-ins and security alerts, **written only by the server** |

Nothing edits a row in any of them, and no client role holds insert, update or delete on them. The membership trail is written by a **database trigger**, so every writer is recorded — not only the ones that went through the page.

The authentication trail is deliberately server-only: the new-device alert is decided from those rows, and a client that can write its own device history can silence the alert that was warning it about that device.

Each row also **stamps the role that applied when it was written**, rather than leaving it to be looked up later. A role read at query time answers "what can this person do now", which is the wrong question about something that happened in March.

## The result status model

One enum, **one transition function, one writer**. No client role holds insert, update or delete on results — every change goes through the function, which is where the rules about who may release, and within which disciplines, actually live.

This is the single most damaging thing that goes wrong in a laboratory system when it is not done. In the application LabFlow replaces, a result's status had **three writers using two vocabularies**, one of them a raw update from a page, and the field that decides whether a result may reach a clinician was whichever of them wrote last.

### An amendment is a new version

There is no `amended` status, and there will not be one.

A corrected result is a **new row at the next version**, pointing at the row it supersedes. The superseded row **stays released and stays true as of when it was released** — that is the value a clinician acted on, and it is what an investigation asks for. Marking the old row "amended" would destroy exactly that.

Every version above the first requires a reason, and the database enforces it. A unique index guarantees there is exactly one current version of every ordered test at all times.

## Nothing is deleted

A withdrawn membership, a rejected specimen, a retired test, a merged patient record and a superseded result all still exist. Each is referenced by something a laboratory may one day have to explain — and a record that vanishes is a laboratory that cannot explain it.
