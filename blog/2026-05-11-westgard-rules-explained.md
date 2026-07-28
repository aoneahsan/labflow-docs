---
slug: westgard-rules-explained
title: Westgard rules for clinical QC, explained
authors: [aoneahsan]
tags: [quality-control, lims, healthcare]
description: A working reference to the six base Westgard rules (1-2s, 1-3s, 2-2s, R-4s, 4-1s, 10-x) — what each rule detects, how to combine them into multi-rule sets, why 1-2s is a warning and not a rejection, and how to read a Levey-Jennings chart.
keywords:
  - Westgard rules
  - 1-3s rule
  - 2-2s rule
  - R-4s rule
  - 4-1s rule
  - 10-x rule
  - Levey-Jennings chart
  - clinical QC multi-rule
  - laboratory quality control
---

**Westgard rules are the statistical patterns a clinical laboratory uses to decide whether a quality-control (QC) run is in-control or out-of-control.** First published by James Westgard in *Clinical Chemistry* in 1981, the six base rules — `1-2s`, `1-3s`, `2-2s`, `R-4s`, `4-1s`, `10-x` — combine into multi-rule sets that catch both random and systematic analytical errors with a low false-rejection rate. This post is a working reference: the precise trigger condition for each rule, the clinical interpretation, why `1-2s` is a warning rather than a rejection, the canonical multi-rule set, and how to read a Levey-Jennings chart that visualises everything together. It is the same reference that the [LabFlow QC module](https://labflow-docs.aoneahsan.com/docs/modules/quality-control) ships as documentation; this post is the standalone primer for anyone who needs the rules without the surrounding product context.

{/* truncate */}

---

## The vocabulary first

A QC measurement is a single reading of a control material — a manufactured substance whose target concentration is known. The lab runs the control through its analyser the same way it runs a patient sample, plots the measured value on a Levey-Jennings chart, and checks the rules. The vocabulary:

| Term | Meaning |
|---|---|
| **Control material** | A purchased liquid (or freeze-dried) with a known target concentration of an analyte (e.g. glucose at 60 mg/dL) |
| **Control level** | A specific control at a specific concentration. A lab typically runs two or three levels per analyte (low, normal, high) |
| **Control lot** | One manufactured batch of a control material with its own lot number, expiry, and manufacturer-assayed mean / SD |
| **Mean** | The average measured value for this lot on this analyser over many QC runs |
| **SD (standard deviation)** | A measure of how spread-out the measurements are around the mean |
| **z-score** | `(measured − mean) / SD` — how many standard deviations the current measurement is from the mean |
| **In-control** | The current QC run is within statistical expectation; patient reporting continues |
| **Out-of-control** | The current QC run violates a rejection rule; patient reporting locks until corrective action |
| **Levey-Jennings chart** | A time-series scatter plot of the QC measurements with horizontal bands at ±1 SD, ±2 SD, ±3 SD |

The mean and SD come from one of two sources. The manufacturer ships an assayed value with each lot (the population mean across many labs); the lab also computes an in-house mean / SD after 20 in-house measurements. The in-house values are typically tighter than the manufacturer's broader-population assay; the lab uses the in-house values once available. This is the canonical pattern documented in [LabFlow's QC lot form](https://labflow-docs.aoneahsan.com/docs/modules/quality-control#qc-lot-form--every-field).

---

## The six base rules

Each rule's name encodes its trigger: "how many consecutive measurements, how many SDs from the mean, on which side".

### 1-2s — the warning, not the rejection

**Trigger:** 1 measurement is more than 2 SD from the mean (either side).

**Verdict:** Warning. Not a rejection rule on its own.

**Why a warning:** About 5% of in-control measurements naturally land outside ±2 SD by chance (the area under a normal distribution beyond ±2 SD is approximately 4.55%). Treating every 1-2s as a rejection produces a 5% false-rejection rate — far too high for a routine workflow. Westgard's original 1981 paper specifically warned against using 1-2s standalone.

**How to use it:** Use 1-2s as the **trigger** that escalates evaluation of the stricter rules. If `1-2s` trips on a measurement, the system evaluates `1-3s`, `2-2s`, `R-4s`, `4-1s`, `10-x` in sequence. If none of those trip, the run is in-control with a 1-2s warning logged. If any of those trip, the run is out-of-control.

### 1-3s — the random-error catcher

**Trigger:** 1 measurement is more than 3 SD from the mean (either side).

**Verdict:** Reject.

**Clinical interpretation:** A measurement at >3 SD has a natural-occurrence probability of about 0.27% (twice the area beyond ±3 SD on a normal distribution). A 1-3s trip on a true in-control run is rare; it usually signals a single random error — a sample mishandling, a pipetting mistake, a one-off analyser glitch. Look at the most recent maintenance or operator change; re-run the QC.

### 2-2s — the systematic-shift catcher

**Trigger:** 2 consecutive measurements (on the same level or across the lab's run grid, see below) are more than 2 SD from the mean **on the same side**.

**Verdict:** Reject.

**Clinical interpretation:** Two consecutive measurements both >2 SD on the same side rarely happens by chance (probability about 0.05%). It usually signals a systematic shift — a new reagent lot needs recalibration, the analyser's calibration has drifted, an instrument temperature is off. The fix is a recalibration or reagent-lot change followed by re-QC.

The "same side" condition is key. Two measurements at +2.1 SD and -2.1 SD do not trip 2-2s; those would trip R-4s instead (random-error increased imprecision). The directional consistency is what makes 2-2s a systematic signal.

### R-4s — the random-imprecision catcher

**Trigger:** Within the same QC run (or across consecutive runs on the same analyser + analyte), 2 measurements differ by more than 4 SD — one above +2 SD and one below −2 SD.

**Verdict:** Reject.

**Clinical interpretation:** Increased random error — the analyser is now imprecise. Common causes: a pipette is jamming, a reagent is partially expired, the analyser's sampling probe is contaminated. The fix is a hardware-side intervention (clean / replace / recalibrate) followed by re-QC.

### 4-1s — the smaller-systematic-shift catcher

**Trigger:** 4 consecutive measurements are more than 1 SD from the mean **on the same side**.

**Verdict:** Reject.

**Clinical interpretation:** Like 2-2s but with smaller individual deviations and a longer pattern. Systematic shift that's persistent but mild — often a recalibration or a reagent-lot change picked up before it grows into a 2-2s. Same fix as 2-2s.

### 10-x — the long-drift catcher

**Trigger:** 10 consecutive measurements are on the same side of the mean (regardless of how close to the mean they are).

**Verdict:** Reject.

**Clinical interpretation:** Long-running systematic drift — the analyser has slowly moved off-target. Common cause: a slow degradation in reagent (an opened vial sitting too long), a calibration that's slowly drifting, a temperature trending. The fix is a fresh calibration followed by re-QC. 10-x is sensitive to mild drifts that the other rules miss.

Some labs use 8-x or 12-x instead of 10-x; the exact number is a configurable parameter in most LIMS. The principle is the same.

---

## The canonical multi-rule set

Westgard's canonical recommendation, still the most-used in 2026:

> **`1-2s` as warning → if trip, evaluate `1-3s` / `2-2s` / `R-4s` / `4-1s` / `10-x` in sequence. Reject on the first hit. If none, in-control with a 1-2s warning logged.**

The evaluation order matters. The strictest rules (`1-3s`) run first; the weakest catchers (`10-x`) run last. A 1-3s trip on the current measurement is a rejection regardless of whether 4-1s would also trip — the system stops at the first rule that fires.

In a flow chart:

```text
new measurement
  ↓
| is 1-2s tripped? |
  ↓ no             ↓ yes
 in-control       check 1-3s
                  ↓ no
                  check 2-2s
                  ↓ no
                  check R-4s
                  ↓ no
                  check 4-1s
                  ↓ no
                  check 10-x
                  ↓ no
                  in-control with 1-2s warning logged
```

Rules that need >1 measurement (`2-2s`, `R-4s`, `4-1s`, `10-x`) consider the current run plus the most-recent N−1 in-control runs on the **same analyte + same analyzer + same level**. The "same analyzer" qualification matters in a multi-instrument lab — a 10-x trend on Cobas-A should not lock reporting on Cobas-B, because the instruments are independent. This is one of the subtleties documented in the [LabFlow QC FAQ](https://labflow-docs.aoneahsan.com/docs/modules/quality-control#frequently-asked-questions).

---

## How to read a Levey-Jennings chart

A Levey-Jennings (LJ) chart plots QC measurements on a single analyte × level over time. The X-axis is the run number or timestamp; the Y-axis is the measured value. Three horizontal bands mark the SD lines:

```
       value
         |
  +3 SD ─┼───────────────────────  reject band (1-3s)
         |
  +2 SD ─┼───────────────────────  warning band (1-2s)
         |
  +1 SD ─┼───────────────────────
         |
   mean  ┼━━━━━━━━━━━━━━━━━━━━━━━  target
         |
  -1 SD ─┼───────────────────────
         |
  -2 SD ─┼───────────────────────  warning band (1-2s)
         |
  -3 SD ─┼───────────────────────  reject band (1-3s)
         |
         └───────────────────────────────────── time / run
```

Each QC measurement is a dot on the chart. Visual patterns to spot:

- **Single outlier above +3 SD or below -3 SD** — 1-3s rejection.
- **Two consecutive dots both above +2 SD (or both below -2 SD)** — 2-2s rejection.
- **One dot above +2 SD and the next below -2 SD** — R-4s rejection.
- **Four consecutive dots above +1 SD (or below)** — 4-1s rejection.
- **Ten consecutive dots all above the mean (or all below)** — 10-x rejection.
- **A consistent slow climb or descent** — drift; 10-x will catch it eventually but a human eye spots it sooner.

A good LJ chart also marks lot transitions (vertical dashed lines) because each new lot resets the in-house mean / SD computation. The [LabFlow QC chart](https://labflow-docs.aoneahsan.com/docs/modules/quality-control#levey-jennings-chart) renders these by default; the chart is interactive and surfaces the violated rule code per point.

---

## What happens when a rule trips

When a rule rejects, the QC run is marked out-of-control and the system locks patient-result reporting for the (analyte + analyzer) pair until the lab acknowledges and acts. The action options:

| Action | When to use |
|---|---|
| **Recalibrate and re-QC** | The analyser's calibration has drifted; recalibrate and run the QC again |
| **New reagent lot** | The reagent is suspected (e.g. 2-2s after a lot change) — switch lots and re-QC |
| **Operator error — re-run** | An obvious one-off (a pipetting error) — re-run with attention |
| **Instrument fault — service call** | A hardware issue; the analyser needs a service technician |
| **Override (with a documented clinical reason)** | A lab manager overrides the lock for a documented reason; the override is audit-logged and surfaces on the affected patient reports as a footnote |

Patient reporting unlocks automatically when the next QC pass is in-control. The override path requires a Lab Manager with the explicit `qc.override` permission, and the audit row carries the manager's name and the reason.

---

## Beyond the six base rules

The six base rules are the canonical set. Extensions exist for specific scenarios:

| Extension | Trigger | Use case |
|---|---|---|
| `2-3s` | 2 consecutive >3 SD same side | Stricter version of 2-2s for highly-controlled methods |
| `3-1s` | 3 consecutive >1 SD same side | Tighter version of 4-1s for shorter run grids |
| `7-T` | 7 consecutive trending in the same direction | Detects gradual drift earlier than 10-x |
| `6-1s` | 6 consecutive >1 SD same side | Intermediate between 4-1s and 10-x |

Most modern LIMS expose these as configurable rule combinations on a per-analyte basis. The default ship is usually the canonical Westgard multi-rule; the custom rules are opt-in. The [LabFlow QC rule editor](https://labflow-docs.aoneahsan.com/docs/modules/quality-control#qc-run-entry) lets a lab pick any combination.

---

## Sigma metrics — the modern complement

Sigma metrics quantify a method's analytical performance as a "sigma value" — roughly, how many SDs of tolerance fit between the method's bias and its allowable error. The formula:

```
sigma = (TEa - |bias|) / CV
```

Where TEa is the total allowable error (often from CLIA limits), `|bias|` is the absolute systematic bias the method shows vs. a reference, and CV is the coefficient of variation (SD / mean × 100).

A method at **sigma ≥ 6** is "world-class" — almost any QC rule set will catch errors before they reach patients. A method at **sigma ≤ 3** is shaky and needs the strictest possible multi-rule set just to stay safe. The Westgard team published charts ("Westgard Sigma Rules") that prescribe which rule combination to use based on the method's sigma value:

| Sigma | Recommended multi-rule |
|---|---|
| ≥ 6 | 1-3s only (very simple) |
| 5 | 1-3s + 2-2s + R-4s |
| 4 | 1-3s + 2-2s + R-4s + 4-1s |
| ≤ 3 | Full canonical 1-2s/1-3s/2-2s/R-4s/4-1s/10-x |

Sigma metrics aren't enforced in rule evaluation; they're an evidence artefact for performance reviews and an input to choosing the multi-rule set. A lab tracks its sigma metrics per analyte and reviews them quarterly.

---

## Frequently asked questions

### Why isn't 1-2s a rejection rule?

Because about 5% of in-control runs naturally trip 1-2s by chance (the area beyond ±2 SD on a normal distribution). Treating every 1-2s as a rejection produces a 5% false-rejection rate — far too high to run a routine clinical workflow. Westgard's 1981 paper specifically warned against this; CLSI EP18 and EP23 echo the warning. Use 1-2s as the trigger that escalates evaluation of the stricter rules.

### How many in-house measurements do I need before I can switch from manufacturer's mean / SD to in-house?

Twenty is the canonical answer — twenty in-house measurements on the same (level + lot + analyzer) lets the in-house mean and SD stabilise enough to use. Some labs use 25-30 for highly-variable analytes; tightening the threshold to 15 is sometimes done but produces noisier in-house statistics. Most modern LIMS default to 20 and let the lab override per analyte.

### How does this work in a multi-instrument lab?

QC is tracked per (analyte + analyzer + level + lot). A lab with two Cobas analysers running the same test runs QC independently on each; the rule evaluation respects the instrument boundary so a 10-x trend on Cobas-A does not lock reporting on Cobas-B. This is the canonical pattern; any LIMS that mixes QC across instruments has a defect.

### What's the difference between Westgard and CLSI rules?

CLSI EP23 and EP18 are the formal standards-body documents that codify and extend Westgard's work for the clinical laboratory. The CLSI documents are normative for accreditation purposes (CAP, CLIA, ISO 15189) and add the procedural overlay — how to run QC, how often, how to document overrides. The Westgard rules themselves remain unchanged; the CLSI documents are the canonical place to find them quoted in a regulator-accepted form.

### Can I run Westgard rules on qualitative tests (positive / negative results)?

Not directly — Westgard rules are designed for quantitative measurements that follow a roughly normal distribution. Qualitative tests use a different QC scheme: typically, a positive control and a negative control are run with each batch, and the QC pass/fail is binary (did the positive control read positive and the negative control read negative?). The CLSI EP12 standard covers qualitative QC.

### What's the false-rejection rate of the canonical multi-rule set?

About 0.03 to 0.05 percent per run — i.e. one false rejection in every 2000-3000 in-control runs. This is well below the 1% threshold most labs target. The false-rejection rate of a poorly-chosen rule set can climb much higher; the canonical multi-rule was specifically designed to keep this low while maintaining good error detection.

### Do I need to learn the rules myself, or does the LIMS handle them?

The LIMS handles the rule evaluation; the lab manager needs to understand what each rejection means to choose the right corrective action. A LIMS like [LabFlow](https://labflow-docs.aoneahsan.com/docs/modules/quality-control) ships every rule out of the box and surfaces the violated-rule code on the run detail page. The clinical knowledge of "1-3s usually means random error → look at the operator or the most recent maintenance" is what the lab manager brings.

### Are Westgard rules used outside clinical chemistry?

Yes — the same rules apply to any quantitative QC, including haematology, immunoassay, molecular diagnostics, environmental testing, and food safety. The "in-control / out-of-control" decision is method-agnostic; the rules are method-agnostic. The reference values (mean, SD) are method-specific; the rule logic is universal.

---

## Where to read more

- [LabFlow's QC module documentation](https://labflow-docs.aoneahsan.com/docs/modules/quality-control) — the same rules implemented in a working LIMS, with the full screen catalogue and form-field reference.
- The original Westgard paper: J.O. Westgard, P.L. Barry, M.R. Hunt, T. Groth, "A Multi-Rule Shewhart Chart for Quality Control in Clinical Chemistry", *Clinical Chemistry* 1981.
- CLSI EP23 (statistical quality control for quantitative measurement procedures) and CLSI EP18 (laboratory quality control) — the accreditation-relevant documents.
- WestgardQC.com — the family's reference site, which has detailed worked examples and additional rule combinations.

---

**About the author**: Ahsan Mahmood is the engineer behind LabFlow. Contact at `aoneahsan@gmail.com` or via [aoneahsan.com](https://aoneahsan.com).
