---
slug: /user-guide/research-population-telemedicine
title: Research, population health and telemedicine
description: Three small LabFlow areas and their limits — research registers held against consent, population counts that never become a list of people, and telemedicine that books and explains but never practises medicine.
keywords:
  - biobank consent
  - de-identified export
  - population health counts
  - laboratory telemedicine
  - research specimens
image: /img/labflow-social-card.png
---

# Research, population health and telemedicine

These three areas are deliberately small, and each is a module a platform administrator can switch off for everybody (see [Platform administration](./platform-administration#platform-settings-and-maintenance)). Each has one page with tabs.

## Research

**`/research/biospecimens`**, **`/research/consents`**, **`/research/analytics`**, **`/research/deidentify`**, **`/research/genomics`** — *"Specimens kept for research, and the consent that lets you keep them."*

- **Studies** are added from the Consents tab with a study code and a title.
- **Keeping a specimen for research requires a current consent** for that study; the writer refuses otherwise.
- A consent records the version of the information sheet the patient agreed to. A withdrawal is recorded as history, never as a delete.
- **Cohort counts** use an age band, never a date of birth, and a count under five is not shown.
- **De-identified export** produces a dataset a researcher may take away. The re-identification key stays in the laboratory.
- **Genomics** records a referral to another destination and, later, the date the report arrived.

## Population health

**`/population/surveillance`**, **`/population/chronic-care`**, **`/population/sdoh`**, **`/population/vaccinations`** — *"Counts, not people."* The area answers "how many", never "who".

- **Surveillance** counts positive results by week and test. **LabFlow does not submit notifiable-disease reports.**
- **Chronic care** counts three fixed cohorts matched by LOINC code (HbA1c, eGFR, LDL on the last two results). A test counts only when the laboratory has mapped its LOINC code.
- **Collection-point view** aggregates by collection point only, never by a characteristic of a person, and suppresses every count under five.
- **Serology** counts results *"consistent with immunity"* — never "immune". Which results count is a per-test setting on the test form.

## Telemedicine

**`/telemedicine/consultations`**, **`/telemedicine/education`**, **`/telemedicine/medications`**, **`/telemedicine/symptom-checker`** — *"Four remote surfaces, and none of them practises medicine."*

- **Consultations** — a booking with a clinician, *"a booking, not a clinical record."* Cancelling keeps the booking on record, marked cancelled; nobody is told automatically.
- **Education** — articles that explain a test, never a result.
- **Medications** — self-reported by the patient and labelled that way, with an optional note of which tests a medication may interfere with.
- **Symptom checker** — the page states why it refuses to be one and points to a consultation instead.

**Related:** [Reports and analytics](./analytics) · [Compliance and audit](./compliance-and-audit)
