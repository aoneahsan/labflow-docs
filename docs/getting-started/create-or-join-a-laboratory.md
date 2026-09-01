---
sidebar_position: 2
slug: /getting-started/create-or-join-a-laboratory
title: Create or join a laboratory
description: The LabFlow setup wizard — the five steps that create a laboratory in one transaction, the departments vocabulary, accreditation, inviting colleagues, and how the taken-name rule works.
keywords:
  - LabFlow onboarding
  - create a laboratory
  - laboratory setup wizard
  - lab departments
  - accreditation certificate
  - invite colleagues
image: /img/labflow-social-card.png
---

# Create or join a laboratory

Everything inside LabFlow belongs to a laboratory. A signed-in account with no active membership is sent to **`/onboarding`** from every internal route, because there is nowhere else it can usefully be.

Anyone signed in can open the wizard.

## The five steps

`/onboarding` carries the step in the URL (`?step=`), so a half-finished setup survives a refresh. `/onboarding/setup-laboratory` is the same wizard, opened at the laboratory step.

| Step | What it asks |
|---|---|
| **Your details** | Given name, family name, the sign-in address, a direct phone number |
| **The laboratory** | Its name, its town or city, and its accreditation — CAP, a national or regional scheme, or none declared. A scheme takes a certificate number, an expiry date, and optionally the certificate itself |
| **Departments** | Which departments actually run here |
| **Colleagues** | Their Google sign-in addresses, so invitations go out with the laboratory |
| **Review** | Everything, before anything is created |

The review step exists because the whole wizard is **one write**. Nothing is created until you finish it, and then the laboratory, its settings, its departments, your owner membership, your profile and its draft public listing are all created **in a single transaction** — all of it, or none of it.

## The taken-name rule

A laboratory name is refused when a **published** listing already carries it, or when the same name already exists **in the same town**. Two laboratories called "City Lab" in two different towns stay allowed; two in one town do not.

The check runs **before any file is uploaded**, so a rejected name never costs you an upload.

## Departments are one vocabulary

The departments you tick are the same nine words used everywhere else in the product: on your public listing, and as the **release scope** granted to each colleague at `/users`. One vocabulary, so a technician's permission to release haematology means the same thing as the laboratory's declaration that it runs haematology.

## The time zone

The wizard derives a time zone from the town you entered, falling back to the device's own zone. It is **shown in the field** — never a silent UTC — and it becomes the laboratory's setting.

## Inviting colleagues

Invitations are sent as part of creating the laboratory. **An invitation whose email fails to send is removed**, so no half-invitation is left behind; the page tells you which addresses went. A failed invitation does not undo the laboratory.

Colleagues accept by signing in with the invited address and choosing the laboratory. More can be added later — see [users and access](../user-guide/users-and-access).

## The accreditation certificate

If you attach one, it is uploaded as a **private object**. Its storage identifier is not readable by the browser at all — the same rule that protects [identity documents](../user-guide/profile-and-identity).

## What the wizard does not do

It creates the laboratory, its people and its draft listing. It does **not** load a test catalogue, reference ranges or critical-value thresholds — those are yours to configure, and the wizard says so at the end rather than pretending otherwise. LabFlow ships no pre-loaded national test menu and no default clinical reference intervals; shipping either would mean shipping somebody else's clinical decisions as your default.

Start with [the test catalogue](../user-guide/test-catalogue).

**Next:** [Finding your way around →](./finding-your-way-around)
