---
sidebar_position: 3
slug: /modules/patient-management
title: Patient Management Module
description: Patient registration, search, medical history, documents, insurance, and deduplication in LabFlow. Six screens, every form field listed, validation rules, MRN allocation, FilesHub document storage, audit trail.
keywords:
  - LabFlow patient management
  - LIMS patient registration
  - electronic medical record patient
  - MRN allocation
  - patient deduplication
  - insurance management LIMS
---

# Patient Management Module

**Patient Management is the source-of-truth registry for every individual a laboratory tests.** The module captures demographics, identity, insurance, medical history, and documents; it allocates a tenant-unique MRN; it surfaces a fast multi-field search; and it provides a deterministic dedupe workflow when the same human gets registered twice. Every mutation writes to the audit log, and every document upload goes through the FilesHub API (not Firebase Storage).

This page lists every screen, every form field, and every option exposed in Patient Management. If you're looking for how to do a specific task, the [Register a patient](/docs/user-guide/patients/registration) recipe is the step-by-step companion.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Pre-analytical |
| Required permission to view list | `patients.read` |
| Required permission to register | `patients.create` |
| Firestore collections | `patients`, `patient_documents`, `insurance`, `patient_audit_logs` |
| File storage | FilesHub (`X-API-Key` header, `visibility: 'public'`) |
| Routes | `/patients`, `/patients/new`, `/patients/:id`, `/patients/:id/edit`, `/patients/:id/documents`, `/patients/:id/insurance`, `/patients/:id/history`, `/patients/:id/audit` |

---

## Screens

| # | Route | Purpose | Required permission |
|---|---|---|---|
| 1 | `/patients` | Tabular list with multi-field search, status filters, role-aware columns | `patients.read` |
| 2 | `/patients/new` | Registration form (multi-step) | `patients.create` |
| 3 | `/patients/:id` | Patient detail page with tabs for Visits, Orders, Results, Documents, Insurance, Audit | `patients.read` |
| 4 | `/patients/:id/edit` | Edit demographics + identity | `patients.update` |
| 5 | `/patients/:id/documents` | Document upload + listing | `patients.documents.read` / `patients.documents.create` |
| 6 | `/patients/:id/insurance` | Insurance card capture, eligibility check, history | `patients.insurance.read` / `patients.insurance.write` |
| 7 | `/patients/:id/history` | Medical history (allergies, conditions, medications) | `patients.history.read` / `patients.history.write` |
| 8 | `/patients/:id/audit` | Per-patient audit trail of every mutation | `patients.audit.read` |

---

## Registration form — every field

The registration form is multi-step and uses `react-hook-form` with `zod` validation. Fields marked **required** must be present; fields marked **server-defaulted** are auto-allocated if left blank.

### Step 1 — Demographics

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| First name | text | required | 1–60 chars | |
| Middle name | text | optional | 0–60 chars | |
| Last name | text | required | 1–60 chars | |
| Date of birth | date | required | not in the future; not before 1900-01-01 | Drives reference-range selection for results |
| Sex (biological) | enum | required | `male` / `female` / `intersex` / `unknown` | Drives reference-range selection |
| Gender identity | text | optional | 0–40 chars free text | Shown separately from biological sex |
| Pronouns | enum | optional | `he/him` / `she/her` / `they/them` / `other` / `prefer-not-to-say` | |
| Photo | image (FilesHub) | optional | jpg / png; max 5 MB | Uploaded with `visibility: 'public'` |

### Step 2 — Contact

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Primary phone | tel | required | E.164 format | SMS / OTP / call channel |
| Secondary phone | tel | optional | E.164 | |
| Email | email | optional | RFC 5322; lowercased on save | Required for patient-portal access |
| Address line 1 | text | required | 1–120 chars | |
| Address line 2 | text | optional | 0–120 chars | |
| City | text | required | 1–60 chars | |
| State / province | text | required | 1–60 chars | |
| Postal code | text | required | 1–20 chars | |
| Country | enum | required | ISO 3166-1 alpha-2 | Drives timezone defaulting |
| Preferred language | enum | required | BCP-47 tag from tenant's enabled-locales list | Defaults to tenant language |
| Preferred contact channel | enum | required | `sms` / `email` / `whatsapp` / `phone` | Communication-hub channel |

### Step 3 — Identity

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| MRN (Medical Record Number) | text | server-defaulted | tenant-unique | Auto-allocated `MRN-<tenantPrefix>-<counter>` if blank |
| National ID | text | conditionally required | per-country rule | E.g. CNIC in PK, SSN in US — country-aware mask |
| Passport number | text | optional | 6–20 chars | |
| Driver's licence | text | optional | 4–20 chars | |

### Step 4 — Insurance (optional)

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Provider | enum | required-if-step | from tenant's `insurance_providers` list | Empty list disables this step |
| Policy number | text | required-if-step | 4–40 chars | |
| Group number | text | optional | 0–40 chars | |
| Policy holder name | text | required-if-step | 1–120 chars | |
| Policy holder relationship | enum | required-if-step | `self` / `spouse` / `parent` / `child` / `other` | |
| Validity from | date | required-if-step | not in the future | |
| Validity to | date | required-if-step | after validity-from | |
| Insurance card image | image (FilesHub) | optional | jpg / png; max 5 MB | Front + back upload supported |

### Step 5 — Medical (optional)

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Blood type | enum | optional | `A+` / `A-` / `B+` / `B-` / `AB+` / `AB-` / `O+` / `O-` / `unknown` | |
| Known allergies | tag-list | optional | each tag 1–60 chars | Stored as array |
| Chronic conditions | tag-list | optional | each tag 1–60 chars | Stored as array; ICD-10 codes optional |
| Current medications | tag-list | optional | each tag 1–80 chars | Free-text, no RXNORM mapping yet |
| Family history | textarea | optional | 0–2000 chars | |

### Step 6 — Emergency contact (optional)

| Field | Type | Required | Validation |
|---|---|---|---|
| Name | text | required-if-step | 1–120 chars |
| Phone | tel | required-if-step | E.164 |
| Relationship | enum | required-if-step | `spouse` / `parent` / `sibling` / `child` / `friend` / `other` |

---

## Search

The patient list at `/patients` carries a unified search box that matches against name, MRN, primary phone, secondary phone, email, national ID, passport number, and driver's licence in a single query. Each patient document carries a precomputed `_search` field (concatenated lowercased values) so the substring match scales to 15,000+ patients per tenant at ~5–10 ms per keystroke without server-side index churn.

Filter chips above the table let you narrow by status (`active` / `archived`), age band, sex, and registration date. Filter state is preserved in URL search params (`?status=active&age=18-65`), so refreshing the page restores the same view.

The table is built on `@tanstack/react-table` with virtualised rows from `@tanstack/react-virtual`; column visibility, sort, and pagination are URL-state-synced too.

---

## Deduplication

When you click **New Patient** and start typing a name, phone, or DOB, the system runs an inline fuzzy search against existing patients and surfaces "Possible matches" above the form. Picking a match opens the existing patient instead of creating a duplicate.

If duplicates already exist, admins with permission `patients.merge` can open **Patient Detail → Actions → Merge** and pick a target. The merge:

1. Copies all visits, orders, results, documents, and insurance from the source patient to the target.
2. Writes a `patient.merged` event to the audit log on both patients.
3. Marks the source patient as `merged-into: <targetId>` and hides it from search by default.
4. Updates every foreign-key reference (`orders.patientId`, `samples.patientId`, etc.) inside a single Firestore batch so the operation is atomic.

Merge is **reversible within 24 hours** via **Admin → Patient Merges → Reverse**; after that, the operation is final and the audit log is the only record of the prior duplicate.

---

## Documents

Patient documents are uploaded via the FilesHub API and stored with `visibility: 'public'` (the file URL is private-by-obscurity — the URL contains a random object ID — but the file itself is publicly retrievable when the URL is known). This is intentional: it sidesteps the need to mint signed URLs on every fetch.

Supported file types and size limits:

| Type | Max size | Notes |
|---|---|---|
| Image (jpg, png, webp) | 5 MB per file | Thumbnails generated server-side |
| PDF | 10 MB per file | First page rendered as preview |
| DICOM | 50 MB per file | Pathology / radiology — viewer integration pending |
| Office (docx, xlsx) | 10 MB per file | No in-browser preview |
| Text (txt, md) | 1 MB per file | |

Document records (`patient_documents` collection) carry `tenantId`, `patientId`, `fileshubObjectId`, `fileName`, `mimeType`, `sizeBytes`, `uploadedBy`, `uploadedAt`, `category` (`id-proof` / `insurance-card` / `prescription` / `result` / `consent` / `other`), and an `archived` flag.

> **Account-deletion rule:** when a patient (or tenant) is deleted, every FilesHub object referenced from that patient's `patient_documents` collection is deleted from FilesHub via `DELETE /api/v1/objects/:id`. The deletion is logged in `patient_audit_logs`.

---

## Required permissions

| Capability | Permission |
|---|---|
| List patients in your tenant | `patients.read` |
| Open patient detail | `patients.read` |
| Register a new patient | `patients.create` |
| Edit demographics / identity | `patients.update` |
| Archive a patient | `patients.archive` |
| Restore an archived patient | `patients.restore` |
| Delete (hard) | `patients.delete` (Super Admin or audit-purge role only) |
| Upload a document | `patients.documents.create` |
| Read documents | `patients.documents.read` |
| Capture / edit insurance | `patients.insurance.write` |
| Read insurance | `patients.insurance.read` |
| Write medical history | `patients.history.write` |
| Read medical history | `patients.history.read` |
| Merge duplicate patients | `patients.merge` |
| View per-patient audit log | `patients.audit.read` |

---

## Frequently asked questions

### Can the same human exist in two tenants?

Yes — the patient is "the same human" only inside a single tenant. Two tenants registering the same individual produces two independent `patients` documents with different MRNs. There is no cross-tenant patient identity; that's a deliberate boundary so PHI never leaks across organisations.

### Does LabFlow support FHIR `Patient` resources?

Yes. The FHIR R4 endpoint at `GET /fhir/Patient/:id` (Batch 08 details) returns a tenant-scoped FHIR `Patient` resource. Inbound `POST /fhir/Patient` accepts the same shape and writes a new `patients` doc. The mapping is documented in the FHIR reference page.

### Can patients sign in to view their own records?

Yes, when **Settings → Patient Portal → Enabled** is on for the tenant. Patients authenticate with the same Firebase Auth providers as staff (email + password / Google / Apple / phone). Their role is `patient`; their permissions are restricted to reading their own records (`patients.read.self`, `results.read.self`, etc.).

### What happens if I try to delete a patient with active orders?

The system blocks hard delete and offers to archive instead. Archived patients don't appear in default lists but their records, audit log, and FilesHub documents are preserved. Hard delete is reserved for legal erasure (GDPR Article 17 / equivalent) and requires the `patients.delete` permission plus an audit-trail reason.

### How is MRN uniqueness guaranteed?

The app increments a tenant-scoped MRN counter in the same Firestore transaction as the patient create (client-side — there is no Cloud Function). If you supply your own MRN at registration, the system verifies uniqueness against an indexed query before commit — a duplicate MRN rejects the registration with a clear inline error.

### Can I import patients in bulk?

Yes — **Patients → Import CSV** (permission `patients.bulk-import`) accepts a CSV with the same columns as the registration form. The importer runs in-app (client-side, in batched writes), dedupes inline, and writes a job report you can download afterwards. Limit per import: 10,000 rows.

---

**Next:** [Test Catalog →](./test-catalog)
