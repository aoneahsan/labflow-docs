---
slug: /user-guide/analytics
title: Reports and analytics
description: LabFlow's reporting surfaces — shared saved reports over released results, key figures with their definitions, the volume outlook and peer benchmark, and rule findings computed from recorded data.
keywords:
  - laboratory reports
  - LIMS analytics
  - turnaround time
  - lab KPI
  - peer benchmark
  - Westgard findings
image: /img/labflow-social-card.png
---

# Reports and analytics

Every figure on these pages is computed from **released** results and recorded events. None of them writes anything, so a page failing to load cannot affect a patient record. None of them uses machine learning: where a rule is evaluated, it is arithmetic on data the laboratory recorded.

For the patient-facing report — the frozen, versioned document a patient reads — see [the patient portal](./patient-portal#reports-and-their-versions).

## Saved reports

**`/reports`** — *"Build one, or run one somebody already built."* A report is built over released results, grouped and counted, and can be saved. **A saved report is shared, not personal**, so two people running the same report get the same definition. Work in progress is not countable here, because a figure that changes with the moment it was run is one two people will disagree about.

## Key figures

**`/analytics`** and **`/analytics/kpi`** — *"Every figure names what it counts and when it stops counting."* Released results, turnaround, specimens rejected and critical results escalated, each with a table stating exactly what it counts and what it excludes, plus a breakdown by department.

Turnaround is always qualified: **receipt-to-result** is what the laboratory controls; **collection-to-result** is what a clinician experiences. The product does not print an unqualified "TAT". Fewer than five released results in the month shows the empty state instead of a median.

## Volume outlook and peer benchmark

**`/analytics/forecast`** and **`/analytics/peer-benchmark`** are two tabs of one chart page.

- **Volume outlook** — released results a month, on a y-axis that starts at zero and is fixed per laboratory. The projection is the same month last year multiplied by the recent three-month growth: arithmetic, labelled as projected, drawn only after **twelve measured months**, and it feeds nothing else.
- **Peer benchmark** — turnaround against comparable laboratories on a fixed 0–72 hour scale. The words are computed from the figures; the page never names a cause, because the system cannot derive one. With fewer than five peers there is no benchmark heading.

## Rule findings

**`/analytics/smart-validation`** and its tabs — *Validation, Anomalies, Equipment, Repeat patterns, Report summary, Interpretation, Rejections, Staffing, Add-on tests* — each list findings with a title and a basis line filled from recorded data.

Where the product's data cannot run a rule, it says so rather than faking a result:

- Equipment rules read **service and calibration due dates**, not run counters.
- **Staffing** shows *"This laboratory records no roster, so these rules have nothing to read."* — never "found nothing", which would claim the rules ran.
- A count of people under five is not shown.

## Quality tools

Turnaround, six sigma, stock cover and satisfaction are one screen with four tabs under `/quality/*`, documented with [quality control](./quality-control#the-four-quality-tools).

## Other analytical areas

Research registers, population counts and telemedicine bookings have their own page: [Research, population health and telemedicine](./research-population-telemedicine).

**Related:** [Dashboard](./dashboard) · [Laboratory analytics in My lab](./listing-and-my-lab#my-lab)
