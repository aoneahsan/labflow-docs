---
sidebar_position: 19
slug: /modules/communication-hub
title: Communication Hub Module
description: SMS, email, WhatsApp, push, and in-app notifications in LabFlow — templates, multi-channel delivery, quiet hours, opt-outs, deliverability tracking, and inbound replies.
keywords:
  - LabFlow communication hub
  - LIMS notifications
  - lab SMS templates
  - lab email deliverability
  - WhatsApp Business healthcare
  - push notifications lab
  - lab notification opt-out
---

# Communication Hub Module

**Communication Hub is the single notification system every other module sends through.** It owns templates, channel selection, recipient resolution, quiet-hour logic, rate limiting, deliverability tracking, opt-out enforcement, inbound-reply matching, and the full delivery audit. Every outbound notification in LabFlow — appointment reminders, critical-result alerts, invoice statements, claim-denial alerts, low-stock alerts, no-show appeals, MFA setup links, every transactional touch — passes through this module. Operational modules emit events; Communication Hub maps the event to a template, resolves recipients, picks channels, applies quiet-hour rules, sends through the tenant's configured provider, tracks delivery, and parks the inbound reply back against the originating record.

The hub is built on the deliberately small set of providers a lab actually needs (Twilio / MessageBird / locally-hosted SMS gateway for SMS, SendGrid / Mailgun / Postmark for email, WhatsApp Business Cloud API, OneSignal for push, in-app via Firestore subscription) — every channel adds operational cost so the inventory stays curated.

---

## At-a-glance

| Property | Value |
|---|---|
| Workflow stage | Cross-cutting |
| Required permission to read templates | `comms.templates.read` |
| Required permission to author templates | `comms.templates.write` |
| Required permission to read delivery log | `comms.deliveries.read` |
| Firestore collections | `notification_templates`, `notification_events`, `notification_deliveries`, `notification_opt_outs`, `notification_quiet_hours`, `inbound_messages`, `comms_audit_logs` |
| Routes | `/comms`, `/comms/templates`, `/comms/templates/:id`, `/comms/templates/new`, `/comms/deliveries`, `/comms/deliveries/:id`, `/comms/inbound`, `/comms/opt-outs`, `/comms/health`, `/comms/test-send`, `/comms/audit` |
| Linked modules | Every operational module emits notification events |

---

## Core concepts

| Term | Meaning |
|---|---|
| **Event** | A semantic action from an operational module that may produce a notification (e.g. `appointment_reminder_24h`, `result_critical_released`). Each event has zero or one active template per tenant. |
| **Template** | The renderable body for a channel + locale combination, with Handlebars variables. |
| **Delivery** | One transmission attempt to one recipient through one channel. A notification can fan out across channels and recipients; each fan-out leg is its own delivery. |
| **Quiet hours** | A tenant-configurable window during which non-urgent deliveries are queued. |
| **Opt-out** | A recipient's recorded refusal for a category of notifications. Enforced at delivery time. |
| **Inbound** | A reply (SMS, email, WhatsApp) routed back to the originating record. |

---

## Screens

| # | Route | Purpose | Permission |
|---|---|---|---|
| 1 | `/comms` | Overview — sends in the last 24h, delivery success rate, inbound queue depth | `comms.read` |
| 2 | `/comms/templates` | Filterable list of templates by event + channel + locale | `comms.templates.read` |
| 3 | `/comms/templates/:id` | Template detail with live preview against a sample payload | `comms.templates.read` |
| 4 | `/comms/templates/new` | Author a new template | `comms.templates.write` |
| 5 | `/comms/deliveries` | Filterable delivery log (status, channel, recipient, date) | `comms.deliveries.read` |
| 6 | `/comms/deliveries/:id` | One delivery — rendered body, provider response, retries | `comms.deliveries.read` |
| 7 | `/comms/inbound` | Inbound replies queue — matched + unmatched | `comms.inbound.read` |
| 8 | `/comms/opt-outs` | Opt-out registry per recipient | `comms.opt-outs.read` |
| 9 | `/comms/health` | Per-provider delivery success rate, latency, throttle counters | `comms.read` |
| 10 | `/comms/test-send` | Send a test message of any template to a verified address | `comms.test-send` |
| 11 | `/comms/audit` | Audit log of template + opt-out changes | `comms.audit.read` |

---

## The event catalogue

Every notification ultimately originates from one of these events. The catalogue is curated — adding a new event is a deployment-level change (a new operational module emitter + a default template).

| Event | Originating module | Default channels | Urgent? |
|---|---|---|---|
| `appointment_reminder_24h` | Appointments | SMS + email | no |
| `appointment_reminder_2h` | Appointments | SMS | no |
| `appointment_reminder_30min` | Appointments | SMS | no |
| `appointment_confirmed` | Appointments | in-app | no |
| `appointment_cancelled` | Appointments | SMS + email | no |
| `appointment_no_show_appeal` | Appointments | in-app to Lab Manager | no |
| `home_visit_en_route` | Home Collection | SMS to patient with live-tracking link | no |
| `home_visit_arrived` | Home Collection | in-app to dispatch | no |
| `home_visit_late` | Home Collection | SMS + in-app to dispatch | yes |
| `sample_rejected` | Sample Tracking | email to ordering provider | no |
| `result_released` | Results | email + push to patient | no |
| `result_critical_released` | Results | SMS + email + push to clinician + in-app | **yes** |
| `result_amended` | Results | email + push to patient | no |
| `invoice_issued` | Billing | email | no |
| `invoice_aged_30/60/90` | Billing | email | no |
| `claim_denied` | Billing | in-app + email to billing clerk | no |
| `payment_received` | Billing | email receipt to payer | no |
| `qc_out_of_control` | Quality Control | in-app + email to Lab Manager | yes |
| `qc_lot_expiring_14d/7d/0d` | Quality Control | in-app to Lab Manager | escalating |
| `stock_low/critical_low/out` | Inventory | in-app + email to procurement | escalating |
| `stock_lot_expiring_30d/14d/7d/0d` | Inventory | in-app to Lab Manager | escalating |
| `user_invited` | User Management | email | no |
| `mfa_setup_required` | User Management | email | no |
| `user_new_device_login` | User Management | email | no |
| `partner_webhook_failed` | EMR Integration | in-app to integration admin | yes |

The `Urgent?` flag governs the quiet-hours interaction (urgent bypasses quiet hours).

---

## Template form — every field

| Field | Type | Required | Validation | Notes |
|---|---|---|---|---|
| Event | search-select | required | one of the catalogued events | A tenant can have at most one **active** template per `event × channel × locale` triple |
| Channel | enum | required | `sms` / `email` / `whatsapp` / `push` / `in-app` | Drives the body shape |
| Locale | enum | required | tenant's enabled locales | |
| Subject | text | required-for-email-whatsapp-push | 1–120 chars | Handlebars-enabled |
| Body | rich-text or plain | required | length depends on channel: SMS ≤ 1600 chars (split-into-segments warning at > 160 chars), push ≤ 240 chars, email no hard cap, WhatsApp ≤ 1024 chars | Handlebars-enabled |
| Attachments | file-upload list | optional | up to 5 files via FilesHub | Email and WhatsApp only |
| From / sender | search-select | required | one of the tenant's verified senders | E.g. the lab's verified Twilio number, the lab's verified email domain |
| Reply-to | text | optional | RFC 5322 | Email only |
| Active | boolean | required | default `false` | Activation requires `comms.templates.activate` |
| Available since | date | required | ≥ today | Tenants schedule template rollouts |
| Available until | date | optional | ≥ available-since | Sunset templates auto-expire |

Each template has a versioned history; the editor's "History" tab shows the diff between any two versions and a one-click restore.

---

## Handlebars variables

Templates use a curated Handlebars subset — variables come from the event payload, the tenant settings, the patient record, the order, the result, the invoice, or the appointment as relevant to the event. The catalogue is published on the template editor and is rule-checked at save time (an unknown variable produces a save-blocking validation error).

Common variables:

| Variable | Source | Example |
|---|---|---|
| `{{patient.firstName}}` | Patient | `Maria` |
| `{{patient.familyName}}` | Patient | `Garcia` |
| `{{patient.preferredLanguage}}` | Patient | `en-US` |
| `{{appointment.slotLocalTime}}` | Appointment | `Tue 7 May 2026, 09:30` |
| `{{appointment.siteName}}` | Appointment | `Mercy Lab — Main` |
| `{{appointment.siteAddress}}` | Appointment | full address |
| `{{appointment.testsList}}` | Appointment | `TSH, FT4, Cholesterol panel` |
| `{{appointment.fastingNote}}` | Appointment | `Please fast for 12 hours before your visit.` |
| `{{appointment.confirmLink}}` | Appointment | one-time URL |
| `{{appointment.cancelLink}}` | Appointment | one-time URL |
| `{{appointment.rescheduleLink}}` | Appointment | one-time URL |
| `{{result.patientReportLink}}` | Result | FilesHub PDF link (signed, 24h TTL) |
| `{{result.criticalValue}}` | Result | the value (numeric or text) |
| `{{result.criticalAcknowledgeLink}}` | Result | one-time URL |
| `{{invoice.amountDue}}` | Invoice | `USD 125.40` |
| `{{invoice.payLink}}` | Invoice | tenant's payment surface URL |
| `{{tenant.shortName}}` | Tenant | `Mercy Lab` |
| `{{tenant.contactPhone}}` | Tenant | E.164 |
| `{{tenant.contactEmail}}` | Tenant | |
| `{{tenant.brandColour}}` | Tenant | hex |

Helpers: `{{formatDate}}`, `{{formatCurrency}}`, `{{lookup}}`, `{{ifEquals}}`, `{{firstName}}` (split-on-space helper). Loops are not supported in templates — if a list has to render (e.g. multiple tests), the event payload pre-renders the list as a comma-joined string.

---

## Recipient resolution + channel selection

When an event fires, the hub resolves recipients in this order:

1. **Explicit recipient list** on the event (e.g. the clinician on a critical result is named in the event payload).
2. **Role-based fan-out** — if the event names a role (`role: lab-manager`), every user holding that role in the tenant is a recipient.
3. **Subscription matches** — partners subscribed via FHIR or webhooks (handled by [EMR Integration](./emr-integration)).

Each recipient's channel set is the intersection of:

- The template's enabled channels for the event.
- The recipient's per-user channel preferences (defined on the user profile).
- The tenant's default channel list (in [Settings](./settings)).
- The tenant's policy for the event's urgency.

The first channel that is enabled and not opted-out is tried. A delivery failure (provider non-2xx, hard bounce) falls forward to the next channel. A patient with `sms` + `email` enabled and an SMS that hard-bounces gets an email follow-up; the original SMS delivery remains in the log with a `failed-with-fallback` status linking to the email delivery.

---

## Quiet hours

Quiet hours default to 22:00–07:00 in the tenant's timezone. Non-urgent notifications generated inside the window are queued — they sit in `notification_deliveries` with status `quiet-hour-queued` and a `unblockAt` timestamp. Delivery is enforced by `unblockAt`: OneSignal push is scheduled for that time, and any in-app delivery is released once the timestamp passes (there is no server cron — LabFlow is 100% client + Firestore). Urgent deliveries bypass quiet hours regardless of recipient or channel.

Per-user overrides exist: a user may set their own quiet-hour window (typically tighter than the tenant default) on their profile. The user's window stacks with the tenant window — a delivery is sent only if both windows are open.

---

## Opt-outs

Recipients opt out per category (`appointment-reminders`, `billing-statements`, `marketing` (if the tenant ever sends; not part of the default catalogue), `lab-results`, `home-collection-tracking`). The opt-out registry is queried at delivery time and the matching delivery is short-circuited with status `opted-out`. Opt-outs are channel-scoped — a patient may opt out of SMS reminders while keeping email.

**Critical results, MFA, and account-security events cannot be opted out of.** The system enforces this in the opt-out flow — clicking "stop all SMS" produces a confirmation step that lists the events that will continue regardless, with a clear "I understand" gate.

The opt-out is captured via:

- An SMS reply `STOP` (locale-aware: `STOP / DETENER / ARRÊT`) routes to the inbound matcher and updates the opt-out registry.
- An email unsubscribe link in every promotional email (RFC 8058 one-click unsubscribe headers honoured).
- The patient portal's notification preferences screen.
- A Lab Manager with `comms.opt-outs.write` can set or revoke opt-outs on behalf of a patient with a captured reason.

---

## Inbound replies

SMS replies route through the tenant's SMS provider's inbound webhook into the hub. WhatsApp replies route similarly. Email replies route through the tenant's email provider's inbound parse webhook. Every inbound message is parsed for:

| Pattern | Action |
|---|---|
| `STOP` / locale variant | Update opt-out registry; reply with confirmation |
| `START` / locale variant | Remove opt-out for the inbound channel; reply with confirmation |
| `HELP` / locale variant | Reply with the tenant's help URL + contact |
| Appointment confirm code (e.g. `LF-7H4K`) | Mark the matching appointment as `confirmed`; no auto-reply unless the template says so |
| Critical-result acknowledge code | Mark the result as `acknowledged` by the named clinician |
| Free-text without a recognised pattern | Route to `/comms/inbound` for human review |

Unmatched messages sit on the inbound queue with the originator's address and a "Match to record" action that lets a staff member attach the message to a patient, an order, or an appointment. Matched messages surface in the affected record's audit log.

---

## Deliverability + provider health

`/comms/health` shows per-provider:

| Signal | Threshold |
|---|---|
| Delivery success rate (24h) | Alert < 95% |
| Hard-bounce rate (24h) | Alert > 2% (email) / > 5% (SMS) |
| Mean latency (queued → provider-accepted) | Alert > 30 s |
| Provider throttle counter | Alert on any |
| Sender-reputation score (if provided by the provider) | Surfaced; no internal threshold |

A provider that crosses a threshold for 15+ minutes auto-pauses outbound on that channel and routes pending sends to the failover provider configured in [Settings → Integrations](./settings#integrations). If no failover exists, deliveries queue with `provider-down` status and surface a banner across the tenant.

---

## Required permissions

| Capability | Permission |
|---|---|
| Read templates + deliveries + inbound | `comms.read`, `comms.templates.read`, `comms.deliveries.read`, `comms.inbound.read` |
| Author / edit templates | `comms.templates.write` |
| Activate / deactivate templates | `comms.templates.activate` |
| Read opt-out registry | `comms.opt-outs.read` |
| Set opt-out on behalf of a recipient | `comms.opt-outs.write` |
| Send a test message | `comms.test-send` |
| Read communications audit log | `comms.audit.read` |

---

## Frequently asked questions

### How is patient PHI protected when sending SMS reminders?

The default templates never include diagnostic details, test names, or result values in SMS bodies. An appointment-reminder SMS reads `You have an appointment with {{tenant.shortName}} on {{appointment.slotLocalTime}}` — no test list, no clinical context. A result-ready SMS reads `Your results are ready. Sign in to {{tenant.shortName}} to view.` — no values, no analyte names. The patient sees the detail only after authenticating to the patient portal or the mobile app. A tenant that wants to override this in a tighter-controlled context (e.g. a corporate wellness program with explicit consent) can edit the template — but the default ships HIPAA-conservative.

### Why is there no SMS for `result_released` to the patient?

The default routes `result_released` to email + push, not SMS. Two reasons: (1) results often arrive in batches, and SMS noise is a known patient-frustration source; (2) SMS provider costs scale with volume in a way that surprises labs at the end of the month. Tenants that want SMS for results can author a template — the channel is supported, it is just not the default.

### Can a critical-result alert be sent to multiple clinicians simultaneously?

Yes. The event payload includes a `recipients[]` array filled by the result module — the ordering provider, the on-call clinician, the patient's primary care provider if recorded — and the hub fans out to each. The acknowledgement deep-link in the SMS / email / push is a one-time token; whichever clinician acknowledges first updates the result's `criticalAcknowledgedBy` field, and the remaining recipients' acknowledgement attempts return a "Already acknowledged by NAME at TIME" page. The full attempt trail is preserved.

### What's the de-duplication policy across channels?

Per event + per recipient + per channel, one delivery. A patient with SMS + email enabled receives the appointment reminder on both. A patient with SMS only receives one delivery; if it hard-bounces, the fallback to email follows the recipient's preference order. Multiple-channel sends are not consolidated into a single "do not duplicate" rule — each channel is independently logged so the deliverability dashboard is honest.

### How does Communication Hub interact with Workflow Automation?

A workflow rule's `comms.send` action posts an event into Communication Hub the same way an operational module does. The rule names the event, the recipients, and the payload variables; the hub does the template resolution, channel selection, quiet-hour evaluation, and delivery. This is the only way for a rule to send messages — it can't construct a raw SMS body, because that would bypass the template + opt-out enforcement.

### Are there inbound webhooks I can subscribe to for delivery status?

Yes — the same partner-webhook surface used by [EMR Integration](./emr-integration) supports `comms.delivery.sent`, `comms.delivery.delivered`, `comms.delivery.failed`, `comms.delivery.bounced`, and `comms.inbound.received`. A partner that wants to mirror LabFlow's notification state in their own system subscribes and reconciles on the `deliveryId` LabFlow emits.

### How do international sending limits / regulatory rules work?

Each tenant configures its sending senders in [Settings → Integrations](./settings#integrations); the provider enforces local regulatory rules (the lab is responsible for using a registered short code in jurisdictions that require it, or a brand-verified WhatsApp Business sender, etc.). Communication Hub does not run jurisdiction-aware compliance checks beyond enforcing the opt-out registry — regulatory compliance is a deployment-level responsibility, mirrored in LabFlow's HIPAA and Play-Console standards.

### Can a template embed a button (rather than a raw link)?

Email templates support HTML and may render branded buttons; the hub's renderer injects safe inline-styled CTAs with text fallbacks. WhatsApp Business templates support quick-reply and URL buttons through the Business Platform's button object — the template editor exposes the button as a structured field rather than free HTML. SMS templates have no button concept; they carry shortened tracking URLs generated at send time and rate-limited to one URL per SMS to keep the segment count predictable.

---

**Next:** Batch 09 covers the surfaces — Mobile (Capacitor), WXT browser extension, EMR Chrome extension — see the [public build plan](https://github.com/aoneahsan/labflow-docs/blob/main/docs/audit/2026-05-10-docs-site-build-plan.md).
