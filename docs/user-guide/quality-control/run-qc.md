---
sidebar_position: 1
slug: /user-guide/quality-control/run-qc
title: Run a Quality-Control Check
description: How to run quality control in LabFlow — enter QC values for each level, read the Levey-Jennings chart, interpret Westgard rule violations, and complete the corrective-action workflow when a run is out of control.
keywords:
  - run quality control LabFlow
  - Levey-Jennings chart
  - Westgard rules
  - QC corrective action
  - LIMS quality control
---

# Run a Quality-Control Check

**Quality control proves an instrument is producing trustworthy numbers before patient results ride on it.** In LabFlow you enter QC values for each control level, and the system charts them on a Levey-Jennings plot and evaluates the standard Westgard rules automatically — flagging warnings and rejecting out-of-control runs. Required permission: `qc.run`. The rule set, chart bands, and multi-instrument handling are documented in the [Quality Control module](/docs/modules/quality-control).

## Before you start

- The QC levels and lots are configured with their assayed or in-house mean and SD.
- You hold `qc.run` (Lab Technician by default); resolving an out-of-control run may need `qc.resolve`.

## Steps

1. Open **Quality Control** and choose the analyte / instrument you are running.
2. **Select the QC lot and level(s)** you measured (e.g. Level 1 and Level 2).
3. **Enter the measured value** for each level. LabFlow plots each point on the Levey-Jennings chart against the ±1 / ±2 / ±3 SD bands for that lot.
4. **Read the evaluation.** LabFlow applies the Westgard rules and labels the run:
   - **In control** — no rule broken; you may run patient samples.
   - **Warning** (`1-2s`) — one point beyond ±2 SD; inspect before proceeding.
   - **Rejected** (`1-3s`, `2-2s`, `R-4s`, `4-1s`, `10-x`) — the run is out of control; patient results are blocked for that analyte until resolved.
5. **If the run is rejected**, open the corrective-action workflow: record the cause (e.g. reagent lot change, calibration drift), the action taken, and re-run QC. The corrective action is logged.

## Reading the Levey-Jennings chart

Each point is one QC measurement over time. Points hugging the mean are ideal; a drift (steadily rising or falling) or a shift (a sudden step) is what the `4-1s` and `10-x` rules catch even when no single point is wildly out. Hover any point to see its value, run, and operator.

## Result

An in-control run lets patient results for that analyte proceed. A rejected run blocks them and starts the corrective-action record, so an accreditation auditor can trace exactly what happened and how it was fixed.

## Related recipes and references

- [Validate and release a result](../results/validate-and-release) — results depend on QC being in control.
- [Quality Control module](/docs/modules/quality-control) — all six Westgard rules, chart bands, and expiry alerts.
- [User Guide overview](../overview) — recipe index by role.
