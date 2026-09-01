---
sidebar_position: 8
slug: /user-guide/labels
title: Labels and barcodes
description: The LabFlow label designer and print queue — templates saved per laboratory and stock size, why a printed job is kept rather than removed, why a reprint is a new job, and the standalone Code 128 barcode generator.
keywords:
  - specimen label
  - label template
  - print queue
  - Code 128
  - barcode generator
  - quiet zone
image: /img/labflow-social-card.png
---

# Labels and barcodes

## The label designer

**`/labels`** — *what prints on a tube, and exactly where*.

> A label is the last thing between a tube and the wrong result.

A **template** is saved for this laboratory, at a stock size, in millimetres. That is what makes two tubes printed a month apart land identically on the same roll, so a bench reads a position instead of hunting for a field.

**Saving a template changes nothing already queued.** A job carries the template it was queued with.

## The print queue

Accessioning tells the person holding the rack that labels are queued. The queue is where they wait, which is what makes that sentence true rather than hopeful: the tube is numbered at the desk in one transaction, and the sticker prints in a batch a minute later, without anybody standing at a printer holding a specimen.

Two rules in it are deliberate:

- **A printed job is kept, greyed and unselectable, rather than removed.** *"Was this label ever produced?"* is a question about a tube that may still be travelling.
- **A reprint is a new job, never a re-run of the old one.** The first label exists somewhere — possibly on a tube, possibly on a floor. A queue that quietly reissued it could not answer how many labels for this accession were produced, or when, which is the only question anybody asks after two tubes turn up wearing the same number.

## The barcode generator

**`/tools/barcode-generator`** — *a real Code 128 symbol, not a picture of one*.

It also states what makes a printed barcode fail, because these are the failures that reach a bench:

| Failure | Why |
|---|---|
| **No quiet zone** | A symbol butted against a border or another element does not scan. The white margin around the bars is load-bearing, not decorative |
| **No human-readable line** | Scanners fail and labels smudge. A specimen whose barcode will not read and whose value is not printed underneath has to be traced by hand |
| **Printed too small** | Below the scanner's resolution the bars merge |
| **Stretched out of ratio** | The bar-to-space ratio is the encoding; distorting it destroys it |
