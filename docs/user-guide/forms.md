---
sidebar_position: 15
slug: /user-guide/forms
title: Forms
description: The LabFlow form builder — the requisition form created on first open, immutable published versions numbered from 1.0, unsaved edits kept on the device, and what the product refuses to publish.
keywords:
  - form builder
  - requisition form
  - form versioning
  - immutable versions
image: /img/labflow-social-card.png
---

# Forms

**`/forms/builder`** builds a form; **`/forms/builder/:formId`** opens a particular one.

*Place a question, then move it with the arrow keys.* Questions are added from a palette of types, worded in the inspector, and reordered with the keyboard rather than a drag handle.

## The requisition form

Opening the builder for the first time creates one form — the **requisition** — from the approved design's own five specimen questions. Opening it again finds that form and creates nothing.

A laboratory has **one requisition to start with**. Minting further forms belongs to a later wave.

## Versions are immutable

A form's first version is **1.0**, and each save publishes the **next minor version, whole**. Nothing ever updates a published version.

The reason is simple to state and expensive to get wrong: *the submissions against 5.2 keep answering 5.2's questions forever*. If a published version could be edited, an old submission would silently start answering questions nobody was asked.

Version numbers are minted under the form's own lock, so two simultaneous saves cannot produce one number.

## Unsaved edits live on your device

A draft is held locally until you save, keyed by the form **and by the version it started from** — so a draft begun against 1.1 is never offered on top of a 1.2 that was published elsewhere.

## What saving refuses

Stated before the round trip, not after it:

- an empty form — *publishing one would put a form in front of people that asks them nothing and still records a submission*
- a blank question
- a choice with no options
- a blank option

An empty form is a legitimate **draft**. It just cannot be published.

## Reading and writing

The browser **reads** forms and never writes them. Both write paths are server-side functions bounded to laboratory owners and managers.

## What is not here yet

The form **list**, the submissions table, and everything that receives an answer are wave 5 and are [not built](../roadmap). Until then the builder is reached by its address, and its "Forms" breadcrumb is plain text rather than a link to a page that does not exist.
