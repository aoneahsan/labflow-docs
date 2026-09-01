---
sidebar_position: 16
slug: /user-guide/tools
title: Utility tools
description: The LabFlow utility tools — the corrected calcium and anion gap calculators, why there is no save-to-record button, and the document scanner that attaches a requisition to the record that owns it.
keywords:
  - laboratory calculator
  - corrected calcium
  - anion gap
  - document scanner
  - requisition scan
image: /img/labflow-social-card.png
---

# Utility tools

One page, two tabs: **`/tools/calculators`** and **`/tools/document-scanner`**.

## Calculators

Two, both built in:

| Calculator | Formula |
|---|---|
| **Corrected calcium** (albumin-adjusted) | `corrected = total + 0.02 × (40 − albumin)` |
| **Anion gap** (without potassium) | `gap = Na − (Cl + HCO₃)` |

Both print their convention beside the number, because both differ between sites. The 40 g/L reference and the 0.02 factor are laboratory-specific, and the two anion-gap conventions differ by about 4 mmol/L — most of the reference interval — so the convention is stated rather than assumed.

Units are labelled on every field for the same reason: a creatinine in µmol/L put through an mg/dL equation gives a plausible, wrong answer.

### There is no "save to record" button, and there will not be one

A calculated value has no specimen, no method and no quality control behind it. Filed into a patient record it would sit beside measured results and look exactly like one — and a delta check would then compare a real measurement against an arithmetic estimate.

If a laboratory reports a calculated quantity, it is **defined as a calculated test on the panel, ordered, and produced through the same result pipeline as everything else.**

## Document scanner

For requisitions, consent forms and referral letters. JPEG, PNG or PDF, up to 5 MB, at least 1000 × 640, with the whole requisition in frame including the clinician's signature.

Both limits refuse for a reason the page states:

- **Too large** — a photograph at full phone resolution. A flatbed scan or a PDF is smaller and far easier to read.
- **Too small** — *a requisition photographed from across a desk loses the handwriting long before a person notices, so it is refused here rather than filed unreadable.*

A scan is attached to **a patient** (by medical record number) or **an order** (by the accession printed on the specimen label — not the order number, because an order can carry several specimens and the document belongs to one of them). A reference this laboratory does not hold is refused: *a scan filed against the wrong patient is found by an audit, not by the person who filed it.*

**The page itself stores nothing.** The scan is attached through the record that owns it, which is where the retention rule and the audit entry live. A scanner that filed documents on its own would create records nobody could later account for.
