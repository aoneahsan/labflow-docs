---
slug: /user-guide/interoperability
title: Interoperability — instruments, EMR systems and HL7/FHIR files
description: What LabFlow's interoperability area actually does — HL7 v2 and FHIR R4 as files you download or import, a register of partner EMR systems, instrument pages built from typed-in results, and a slide viewer. There is no live interface.
keywords:
  - HL7 v2 export
  - FHIR R4 DiagnosticReport
  - HL7 ORM import
  - EMR integration
  - analyser interface
  - pathology slide viewer
image: /img/labflow-social-card.png
---

# Interoperability — instruments, EMR systems and HL7/FHIR files

:::warning No live interface exists
LabFlow has **no live connection** to any analyser, EMR or hospital system. It sends no messages and receives none. HL7 v2 and FHIR move **as files**, which a person downloads or imports. Every page in this area says so where it matters.
:::

## HL7 v2 and FHIR R4 as files

Both directions run in the browser; nothing is sent to a server for conversion.

**Export.** A released report downloads as an **HL7 v2 `ORU^R01` message** or a **FHIR R4 `DiagnosticReport` bundle**, from the report's **Download** group in the [patient portal](./patient-portal#reports-and-their-versions). What happens to the file afterwards is up to the person who downloaded it.

**Import.** On **`/orders`**, **Import an HL7 order** reads one HL7 v2 order message (`ORM^O01`), pasted or chosen as a `.hl7` or `.txt` file up to 64 KB. It creates a **draft** order: *"Nothing is created until you confirm it."* In the order drawer a person then chooses **Place this order** or **Discard draft**. A file that is not an `ORM^O01` message is refused and nothing is read from it.

No validation has been performed against any EMR vendor's implementation.

## EMR connections — a register

**`/emr/connections`** and **`/emr/connections/:connectionId`** — *"This is a register."* Each row records a partner system: its name, protocol, endpoint, the contact on their side and its status. **The endpoint is for the record only; LabFlow sends nothing to it.** The detail page carries the stated line *"No messages are exchanged through LabFlow yet."*

Systems are added and edited in a **Register a system** dialog. A laboratory cannot register two systems with the same name.

## Instrument links and the live board

**`/integration/instruments`** — *"Every analyser, and how its results reach LabFlow."* Built from what is recorded: runs per instrument, results with their entry times, and what is unreleased. The page states that no analyser interface exists and that **the times shown are when a result was entered, not when the analyser produced it.**

**`/integration/equipment-hub`** — the **Live board**, for a screen on a laboratory wall: each analyser's latest run, how many results are unreleased, and whether quality control holds its results. It shows **no utilisation, throughput or efficiency figure**, because nothing measures them.

## Slide viewer

**`/integration/pathology-viewer`** — one uploaded image per specimen (JPG or PNG, up to 15 MB) with findings marked on it. Open it by entering a specimen's accession (`?specimen=<accession>`), or from the **Slide viewer** link on a specimen record. Each mark records its position, magnification, who made it and when. A mark is withdrawn with a reason, never deleted. There is no whole-slide imaging and no tiling.

## Settings → Integrations

`/settings/integrations` lists the registered partner systems and the analysers results are entered from. Nothing in it says "Connected".

**Related:** [Orders](./orders) · [Stock and equipment](./inventory-and-equipment)
