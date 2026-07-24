---
sidebar_position: 15
slug: /modules/settings
title: Settings Module
description: Tenant branding, locale and timezone, working hours, label and report templates, notification preferences, and integration toggles in LabFlow.
keywords:
  - LabFlow settings
  - LIMS configuration
  - lab branding
  - lab report template
  - barcode label template
  - laboratory locale timezone
  - working hours configuration
---

# Settings Module

**Settings is the per-tenant configuration surface that every other module reads at runtime.** It centralises the choices a lab makes once and then applies everywhere: branding (logo, primary colour, header / footer copy on reports), locale (language, date / time format, number format, units of measure default), timezone, working hours per site, barcode / label templates, report PDF templates, notification preferences and quiet hours, currency setup, tenant-wide feature toggles, and the bridge to external integrations. Every change writes to `tenant_settings` and a versioned `tenant_settings_history` row so a settings rollback is one click.

The module is intentionally one screen of tabs, not a sprawl. A tenant should be able to read its complete configuration in under five minutes; deep customisation that needs more surface area lives in the module that owns it (e.g. price lists in [Billing](./billing-insurance), reference ranges in the [Test Catalog](./test-catalog)).

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Operations / Cross-cutting |
| Required permission to view | `settings.read` |
| Required permission to edit branding | `settings.branding.write` |
| Required permission to edit operational settings | `settings.operations.write` |
| Required permission to edit integrations | `settings.integrations.write` |
| Firestore collections | `tenant_settings`, `tenant_settings_history`, `label_templates`, `report_templates`, `notification_templates`, `sites`, `tenant_feature_flags` |
| Routes | `/settings`, `/settings/branding`, `/settings/locale`, `/settings/working-hours`, `/settings/sites`, `/settings/labels`, `/settings/reports`, `/settings/notifications`, `/settings/integrations`, `/settings/feature-flags`, `/settings/history` |
| Linked modules | Every operational module reads from here at runtime |

---

## Core concepts

| Term | Meaning |
|---|---|
| **Tenant settings** | One Firestore doc holding the active configuration for the tenant. Read on app boot and on relevant route enter. |
| **Settings history** | An append-only log; each save writes a new `tenant_settings_history` row carrying the full document so any past state can be restored. |
| **Site** | A physical location (lab, collection centre, satellite). Sites carry their own working-hours overlay and contact details. |
| **Label template** | The visual + data layout for tube and aliquot labels. Multiple templates per tenant (e.g. one for blood tubes, one for stool containers). |
| **Report template** | The branded PDF layout for patient reports. Multiple templates per tenant (e.g. one for standard, one for hospital partner, one for corporate wellness). |
| **Feature flag** | A tenant-scoped boolean / enum that toggles experimental or paid-tier-only behaviour. |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/settings` | Overview — recent changes, validation status, "missing config" banner | `settings.read` |
| 2 | `/settings/branding` | Logo, colours, header / footer text, contact info on reports | `settings.branding.write` |
| 3 | `/settings/locale` | Language, date / time format, number format, default units | `settings.operations.write` |
| 4 | `/settings/working-hours` | Tenant-default working hours; per-site overrides | `settings.operations.write` |
| 5 | `/settings/sites` | Manage physical sites and addresses | `settings.operations.write` |
| 6 | `/settings/labels` | Label-template editor with live preview | `settings.labels.write` |
| 7 | `/settings/reports` | Report-template editor with live preview | `settings.reports.write` |
| 8 | `/settings/notifications` | Channel preferences, quiet hours, per-event template overrides | `settings.notifications.write` |
| 9 | `/settings/integrations` | Connect / disconnect external integrations | `settings.integrations.write` |
| 10 | `/settings/feature-flags` | Inspect (read-only for tenant admins) the active feature-flag set | `settings.read` |
| 11 | `/settings/history` | View and roll back to any past settings snapshot | `settings.history.read` + `settings.rollback` |

---

## Branding form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Tenant display name | text | required | 2–80 chars | Surfaces in every email, every report header, every page title |
| Tenant short name | text | required | 2–24 chars | Used in space-constrained places (mobile header, label corner) |
| Logo — light theme | file-upload | optional | SVG / PNG ≤ 256 KB via FilesHub | Surfaces on light-theme report headers and the in-app navbar |
| Logo — dark theme | file-upload | optional | SVG / PNG ≤ 256 KB via FilesHub | Used when the rendering surface is dark |
| Logo — print | file-upload | optional | SVG / PNG ≤ 1 MB via FilesHub | Higher-resolution variant for PDF rendering |
| Primary colour | colour-picker | required | hex | Used for navbar accent, primary buttons in branded surfaces; light/dark palettes are derived |
| Accent colour | colour-picker | required | hex | Used for tertiary highlights |
| Report header text | textarea | optional | 0–400 chars | E.g. accreditation IDs, address |
| Report footer text | textarea | optional | 0–400 chars | E.g. disclaimer, contact, fax |
| Email signature block | textarea | optional | 0–500 chars | Appended to all out-bound emails |
| Custom domain (sub-domain) | text | optional | DNS-valid | The tenant's branded URL prefix on the LabFlow platform |
| Patient portal URL | url | optional | https URL | If the lab maintains a separate patient portal; surfaces in invitation emails |

Save fires a re-render of every cached report-PDF template and pushes the colour tokens to the running app via a live reload event.

---

## Locale form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Primary language | enum | required | ISO 639-1 from supported list | Drives in-app translations |
| Secondary language | enum | optional | Different from primary | When set, every UI surface offers a per-user toggle |
| Date format | enum | required | `DD/MM/YYYY` / `MM/DD/YYYY` / `YYYY-MM-DD` / `D MMM YYYY` | Applies to all date display except ISO-required exports |
| Time format | enum | required | `24h` / `12h` | |
| First day of week | enum | required | `Monday` / `Sunday` / `Saturday` | |
| Number format | enum | required | `1,234.56` / `1.234,56` / `1 234,56` | Applies to numeric display |
| Default measurement units | enum | required | `SI` / `conventional` | Drives the default reference-range display in [Test Catalog](./test-catalog) |
| Currency primary | enum | required | ISO 4217 | Matches the [Billing](./billing-insurance) tenant primary currency |
| Additional currencies | multi-select | optional | ISO 4217 | Enables multi-currency invoicing |
| Timezone | enum | required | IANA timezone | Used wherever the system needs to render a wall-clock time |

A change to date / time / timezone re-renders all open dashboards in real time; existing data is unaffected (every timestamp is stored UTC).

---

## Working hours

Working hours drive [Appointments](./appointments) slot templates' defaults, the SLA / TAT analytics in [Reports & Analytics](./reports-analytics) (a turnaround crossing a non-working window is counted from the next working start), and the quiet-hours base for notifications.

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Days of week | multi-checkbox | required-min-1 | Mon–Sun | |
| Start time | time | required | HH:mm in tenant timezone | |
| End time | time | required | > start time | |
| Lunch break | time-range | optional | inside start–end | |
| Site overrides | sub-form | optional | one row per non-default site | Same shape as above, scoped to one site |
| Holidays (default) | date-list | optional | future-dated | Inherited by all sites unless overridden |

---

## Label template editor

The label editor is a visual + JSON-mirror surface. A template is a sequence of blocks; each block has a position, a content type, and a styling object.

| Block type | Purpose | Fields |
|---|---|---|
| `text` | Static or variable text | content (Handlebars), font size, weight, alignment |
| `barcode` | 1D barcode | format (Code-128 default, also Code-39, EAN-13, ITF-14), value (Handlebars), width, height |
| `qrcode` | 2D QR code | value (Handlebars), size, error-correction level |
| `image` | Static image | FilesHub object ID, width, height |
| `line` | Horizontal / vertical line | start, end, weight |
| `box` | Border rectangle | bounds, border-weight |

Available Handlebars variables: `{{sampleBarcode}}`, `{{patientFirstName}}`, `{{patientFamilyName}}`, `{{patientDOB}}`, `{{orderId}}`, `{{tubeType}}`, `{{testCodes}}`, `{{collectedAt}}`, `{{phlebotomistInitials}}`, `{{tenantShortName}}`, `{{site}}`. The live preview renders against a sample record so the user sees the exact output. Templates support pixel-, mm-, and inch-based positioning to match a tenant's label printer.

Each template carries a target dimension (e.g. `38 x 25 mm`, `2 x 1 in`, `100 x 150 px`), a default-flag, and an active-flag. A tenant may run multiple templates and pick which one a tube uses at print time via the [Sample Tracking](./sample-tracking) label-print action.

---

## Report template editor

The report editor uses a similar block model but at PDF-page scale.

| Section | Configurable |
|---|---|
| Header | Logo, header text, page-number style, optional accreditation logos |
| Patient info block | Field order, optional fields (insurance, allergies, ICD-10s) |
| Order info block | Field order, optional fields (referring doctor, clinical notes) |
| Result section | Layout per test category, reference-range display, abnormal flag style, comments treatment |
| Critical-value indicator | Colour + symbol + footnote text |
| Footer | Footer text, signature blocks (number of signatures, role labels), contact info |
| Page setup | Paper size (A4 / Letter / Legal), margins, font family, base font size |

The in-app (client-side) PDF renderer reads the active template at generation time — there is no server-side render path, because LabFlow ships no Cloud Functions. A change to a report template re-renders cached PDFs lazily — the next download triggers a fresh render. The template editor's live preview renders a real-but-anonymised sample report so the user sees the output before saving.

---

## Notification preferences

Notifications drive [Communication Hub](/docs/modules#communication-hub) sends. The Settings module owns the tenant-level defaults; per-user overrides live on each user's profile.

| Field | Type | Required | Notes |
|---|---|---|---|
| Default channels | multi-checkbox | required-min-1 | `sms` / `email` / `whatsapp` / `in-app` / `push` |
| Quiet hours | time-range | optional | Default 22:00–07:00 in tenant timezone; non-urgent events are queued until the next active window |
| Urgent override | boolean | required | default `true`; critical-result and STAT-related notifications bypass quiet hours |
| Per-event template overrides | sub-form | optional | One row per event type (`appointment_reminder`, `result_released`, `critical_alert`, etc.); points to a custom template in `notification_templates` |
| SMS provider | enum | required-if-sms | Tenant's chosen provider; settings live in `/settings/integrations` |
| Email provider | enum | required-if-email | Same |
| WhatsApp Business sender | enum | required-if-whatsapp | Same |
| Test send | action | — | Sends a sample of each event template to a chosen address |

---

## Integrations

The integrations tab is the tenant-side panel for connecting external services. Connectors that ship with LabFlow:

| Connector | Purpose | Auth |
|---|---|---|
| Twilio / MessageBird / locally-hosted SMS gateway | SMS provider | API key |
| SendGrid / Mailgun / Postmark | Email provider | API key |
| WhatsApp Business Cloud API | WhatsApp messages | Token + phone-number ID |
| OneSignal | Push notifications | API key |
| Sentry | Error tracking | DSN |
| Mapbox | Geocoding + routing for [Home Collection](./home-collection) | Token |
| HL7 ingester webhook | Instrument result ingestion (per instrument) | Per-tenant URL + shared secret |
| FHIR R4 subscription | EMR result push (Batch 08) | OAuth client credentials |

Each connector exposes a "Test connection" action that runs a no-op probe against the provider and surfaces the response status. Disabled connectors short-circuit at runtime so the missing key never produces a noisy log; the app raises a setup banner instead.

---

## Settings history & rollback

Every save writes a full snapshot to `tenant_settings_history` with the saving user, timestamp, and a 1–80-char change description (required at save). `/settings/history` lists the snapshots in reverse chronological order with a diff viewer between any two snapshots. A "Restore this version" action with `settings.rollback` writes the historical snapshot as the new active settings — itself producing a new history row, so rollback is a forward-only operation that preserves the timeline.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read settings | `settings.read` |
| Edit branding | `settings.branding.write` |
| Edit locale / working hours / sites | `settings.operations.write` |
| Edit label templates | `settings.labels.write` |
| Edit report templates | `settings.reports.write` |
| Edit notifications | `settings.notifications.write` |
| Edit integrations | `settings.integrations.write` |
| Read settings history | `settings.history.read` |
| Roll back to a past snapshot | `settings.rollback` |

---

## Frequently asked questions

### Are my settings changes applied immediately?

Mostly yes. Branding (colours, header / footer text) goes live on the next page load for every user via a live reload event. Locale, working hours, and notification preferences apply within ~30 seconds via a Firestore snapshot subscription. Report templates and label templates apply on the next render of a given document (already-rendered PDFs in FilesHub are kept; the next download re-renders). The only setting that requires a fresh login is "Force re-auth on tenant policy change" — by design.

### Can I have different settings per site?

Branding and locale are tenant-wide. Working hours, holidays, and contact info can be overridden per site. Label and report templates can be set as defaults at the tenant level and overridden per site by tagging the template with a site filter — this is a deliberate constraint to keep the configuration surface small; deeper per-site variance is a hint that you have separate tenants masquerading as one.

### What languages does LabFlow ship with?

The core in-app translation set ships with English plus a small set of regionally common languages; the actual list depends on the deployment manifest. Adding a language is a deployment-level extension (translate the i18n JSON, ship a new bundle). Patient-facing report templates support any language with full Unicode glyphs; if the report-template editor is set to a non-English template, the report PDF renders in that language regardless of the in-app language.

### How does the report template handle units of measure?

Each test in the catalog carries its canonical units; the report template's "default measurement units" setting controls whether SI or conventional units are displayed. The conversion is computed at render time using the catalog's unit-conversion table — for example, glucose can render as `mg/dL` (conventional, US) or `mmol/L` (SI, most of the rest of the world). The patient's preference (if set) wins over the tenant default.

### Can I send a test report to my own email before going live?

Yes — the `/settings/reports` editor's "Send test" action renders the template against an anonymised sample order and emails the result to the requester. The test email is rate-limited (5 per minute per user) and logged in the audit. It does not touch any real patient record.

### How are integrations tested without sending real messages to users?

Each connector exposes a "Test send" action that targets the editing user's contact details (the verified email on file, the verified phone number on file). The test send is rate-limited and clearly labelled as a test in the message body. For destructive integrations (e.g. EDI claim submission) the test path goes against the payer's clearing-house test endpoint instead of production; if no test endpoint is configured the test is refused with a clear error.

### What happens if my SMS provider's API key is rotated and I forget to update it?

The next send attempt fails. The notification engine retries with exponential back-off (default 3 retries, 1m / 5m / 15m); after three failures it marks the send as `failed` and surfaces an alert on the admin dashboard with the underlying provider error. The notification record is preserved so the admin can retry once the key is updated. No silent drops.

### Can I export and import my settings to bootstrap a sister tenant?

Yes — `/settings/history` includes an "Export current settings" action that produces a JSON file. The receiving tenant's admin uses `/settings` "Import" to apply it. Logo / template-image references are not portable (they reference per-tenant FilesHub objects) and must be re-uploaded after the import; the import surfaces the missing references as warnings.

---

**Next:** [Admin Panel module](/docs/modules/admin-panel).
