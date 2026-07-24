---
sidebar_position: 1
slug: /user-guide/results/validate-and-release
title: Validate and Release a Result
description: How LabFlow moves a result through Draft → Reviewed → Approved → Released, including critical-value acknowledgement before release, the permissions each transition needs, and how the audit trail records every step.
keywords:
  - validate result LabFlow
  - result validation workflow
  - approve release lab result
  - critical value acknowledgement
  - LIMS result lifecycle
---

# Validate and Release a Result

**A LabFlow result is never released in one click — it walks a four-state lifecycle so the wrong number can't reach a patient.** The states are `Draft → Reviewed → Approved → Released`, and each transition needs a different permission, so technical review and clinical sign-off stay separate. Critical values must be acknowledged before release. The state machine, security-rule invariants, and addendum mechanism are documented in full in the [Results Management module](/docs/modules/results-management).

## The four states

| State | Who sets it | Permission |
|---|---|---|
| **Draft** | Technician enters or instrument posts the value | `results.enter` |
| **Reviewed** | Senior Technologist confirms the technical result | `results.review` |
| **Approved** | Pathologist / approver gives clinical sign-off | `results.approve` |
| **Released** | Approver releases to the patient / ordering provider | `results.release` |

A single user generally cannot perform every step — the separation is the point.

## Steps

1. Open **Results** and filter to the queue for your role (e.g. `status=draft` for review, `status=reviewed` for approval). The dashboard's pending-work card links straight here.
2. **Open the result.** Review the value against its reference range and any flags. LabFlow highlights out-of-range and critical values.
3. **Review (technical).** With `results.review`, confirm the result is technically sound and move it to **Reviewed**. Add a note if anything needs the approver's attention.
4. **Approve (clinical).** With `results.approve`, give clinical sign-off. At approval LabFlow records a digital signature (HMAC) bound to the result version.
5. **Acknowledge criticals.** If the result carries a critical value, you must **acknowledge** it — record the notification (who was told, when, how) — before release is allowed. LabFlow blocks release until this is done.
6. **Release.** With `results.release`, release the result. LabFlow generates the branded PDF report (stored via FilesHub), distributes it per the patient's delivery preference, and freezes the record.

## Result

The result reads `Released` and is immutable. Every transition — with the user, timestamp, and previous value — is in the audit log. The report is available in the patient portal and to the ordering provider per their delivery settings.

## Correcting a released result

Released records are never edited in place. Issue an **addendum**: pick a reason from the enumerated list, add the corrected information, and release the addendum. The original and the addendum both remain, versioned and audited.

## Related recipes and references

- [Accession a received sample](../samples/accession) — the step that precedes processing and result entry.
- [Run a quality-control check](../quality-control/run-qc) — QC must be in control before results are trusted.
- [Results Management module](/docs/modules/results-management) — full lifecycle, criticals, addenda, and HL7 ingestion.
- [User Guide overview](../overview) — recipe index by role.
