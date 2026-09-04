---
sidebar_position: 20
slug: /user-guide/documents-and-workflow
title: Documents, the SOP library and workflow rules
description: LabFlow's document library, its controlled-document register with versions and sign-off, and the workflow builder — including why nothing in its palette can release a result and why the QC block is a gate rather than a rule.
keywords:
  - document library
  - SOP library
  - controlled document
  - document retention
  - workflow automation
  - auto-validation
image: /img/labflow-social-card.png
---

# Documents, the SOP library and workflow rules

## The library is one register read three ways

**`/files`** — everything the laboratory holds that is not a result: controlled documents and
scanned requisitions, in a keyboard-navigable tree.

The same controlled-document register is also read by `/compliance/documents`, which asks whether a
document is in review date, and by `/knowledgebase`, which asks what it says. **Same rows, different
questions** — and the three pages will therefore never disagree about which documents exist.

A document in force whose text this product does not yet hold shows **no size**, rather than being
omitted. Absent content and an absent document are different facts.

**Retention is a property of the document, not of the patient's account.** A patient may ask for
their account to be deleted; the laboratory still has a statutory obligation to keep the issued
report and the record of who read it. A product that treats deletion as "remove everything" breaks
the second obligation silently.

**Opening a document is a disclosure** and is recorded with the actor. That is why the preview does
not auto-load every file a cursor passes over — it would generate an audit log nobody can read.

## The SOP library is append-only, and a draft is not in force

**`/knowledgebase`** — procedures, with versions and sign-off.

A version is **immutable once published**. `published_at is null` is the whole definition of a draft,
and a document being edited does not change the one people are following.

> A procedure that changed the moment someone typed into it would mean the document people follow
> depends on who has an editor open.

There is **one draft per document**, enforced rather than assumed — two drafts of the same next
version by different people is how a published procedure ends up missing a criterion somebody wrote
and nobody merged.

## Nothing in the workflow palette releases a result

**`/workflow`** — rules the laboratory runs on its own work: a trigger, conditions, and actions,
placed by clicking and reordered with the arrow keys.

The palette offers six kinds of step — trigger, condition, notify, flag for review, wait, escalate —
and **there is no seventh**. Auto-validation may only ever suggest; a person with the capability
approves.

> An automation builder offering "release result" would specify exactly the thing a regulated
> laboratory may not do, and it would be the most natural-looking item on the list.

This is not enforced by leaving a button out of the screen. The database's own step type has those
six values and refuses any other, so a release step **cannot be stored** by any caller.

**Flag for review** is the honest equivalent: it queues a human decision.

## The QC block is a gate, not a rule

It appears in the list of rules in force, because a quality officer has to see it — and it carries
**no steps**, because it does not run here. It gates the result pipeline directly.

> A notification can be missed and a gate cannot.

Modelling it as an ordinary rule would put a patient-safety control behind a pause button on a
builder screen.
