---
sidebar_position: 2
slug: /user-guide/patients
title: Patients
description: The LabFlow patient record — searching, the fields that resolve a reference range, medical record number issuance per laboratory, patient alerts, and merging a duplicate without deleting it.
keywords:
  - patient record
  - medical record number
  - MRN issuance
  - patient merge
  - LIMS patient management
image: /img/labflow-social-card.png
---

# Patients

**`/patients`** lists the laboratory's patients. **`/patients/:patientId`** is one record, and **`/patients/:patientId/edit`** is the form behind it.

A patient is a **person, not a visit**. One record carries every order they have ever had.

## Finding a patient

The search box writes what you typed into the address (`?q=`), so a search can be shared, bookmarked and reopened where you left it.

The identifier in the address is an internal one. **It is the only identifier that ever appears in a LabFlow URL, and the reason it is safe there is that it means nothing outside this database** — it is not a name, an MRN or a national number.

## The medical record number

MRN issuance is a **per-laboratory choice**, held on the laboratory's own settings record:

- **Auto** — leave the field blank and LabFlow issues one. The form says so only when auto-issue is on for this laboratory, because a promise that is not kept is worse than no promise.
- **Typed** — you enter it. An MRN coming from a hospital information system is entered here so the two systems agree.

Changing an MRN **re-labels every future specimen and does not re-label the printed ones**. Labels already on tubes stay as they were printed.

## The fields that do clinical work

Most of the record is demographic. Four fields are read by the rest of the system:

| Field | What reads it |
|---|---|
| **Date of birth** | Resolves the age band every reference range is read from. Age is derived from it, never entered |
| **Sex** | Used only to resolve reference ranges |
| **Pregnancy** | Overrides the age band while it is set — TSH, creatinine and haemoglobin all have ranges that differ by trimester |
| **Ordering clinician** | Name and practice. This is who a released report reaches and who a critical result is escalated to, which is why an initial and a surname is not enough |

Ward and bed are free text, because the list differs per site and a fixed one goes stale the first time a ward is renamed. Blank for an outpatient — and **blank is the honest value, not a dash**.

The patient's own contact details are for the patient. They are **never used to send a result**: a result goes to a clinician.

## Patient alerts

An alert is one line, read at a glance, with a tone — a warning or an error. It records **who added it and what it changes**, because that is what stops the next reader deleting it when they cannot tell whether it still applies.

## Merging a duplicate

Two records for one person happen. Merging asks for the record that **survives**; the other becomes its duplicate.

The merge note is **kept on both records permanently**, and the guidance in the form is to write *what you checked*, not *that you checked*. Neither record is deleted — a merged record stays queryable, because a result entered against it must keep pointing at a row that exists.
