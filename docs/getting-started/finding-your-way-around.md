---
sidebar_position: 3
slug: /getting-started/finding-your-way-around
title: Finding your way around
description: The LabFlow application shell — the navigation rail built for each role, the mobile drawer, the theme control and its ten axes, and how screens are reached by address.
keywords:
  - LabFlow navigation
  - LabFlow app shell
  - LabFlow theme control
  - LabFlow interface
image: /img/labflow-social-card.png
---

# Finding your way around

Signed in, LabFlow is one shell: a navigation rail on the left, a top bar, and the page.

## The navigation rail

The rail is **built for your role**. A technician sees the bench, quality and reference groups; a receptionist sees the front desk; a laboratory manager sees overview, operations, the laboratory and interoperability; a quality officer sees quality, compliance and procedure; a billing clerk sees billing and stock; a laboratory owner sees My laboratory, Requests and Account. Patients and clinicians get their own shells — the [patient portal](../user-guide/patient-portal) and the [clinician portal](../user-guide/clinician-portal) — and platform administrators get [the platform](../user-guide/platform-administration).

**It shows only entries this person can actually open.** A group whose every entry is hidden is not drawn at all, rather than left as an empty heading. An entry belonging to a module a platform administrator has switched off is hidden too, and its address is refused.

Every screen also has an address, and the [user guide](../user-guide/overview) names each one, so a page not on your rail can still be linked to directly — access is still checked when it opens.

Below 1024px the rail is replaced by a burger that opens a drawer carrying the same entries. It is the same application at every width, not a reduced one.

## The top bar

The top bar holds the theme control and your account menu, which is where you sign out.

## The theme control

One control, one panel, **ten axes**: light and dark, colour treatment, corner radius, density, text scale, typeface, surface style, motion, cursor and sound. Every axis is applied before the first paint, so there is no flash of the wrong theme, and the choice is remembered on your device.

It is available signed in and signed out.

## Breadcrumbs and record links

Records link to each other rather than making you navigate. A result names its patient; an order names the patient it was placed for; a specimen names the order it came from. Following those links is usually faster than any menu.

## What travels in a URL, and what does not

**No name, email or employee number ever appears in a LabFlow address.** A person is addressed by a printable reference (`u-1001`), not by anything identifying.

Patient search is the deliberate exception: the search box writes what you typed into `?q=`, so a search can be shared, bookmarked and reopened. That is a decision made with its cost understood — see [architecture](../architecture/overview) for what follows from it.
