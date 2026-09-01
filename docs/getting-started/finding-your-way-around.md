---
sidebar_position: 3
slug: /getting-started/finding-your-way-around
title: Finding your way around
description: The LabFlow application shell — the navigation rail and what it shows today, the mobile drawer, the theme control and its ten axes, and how the shipped LIMS screens are reached.
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

The rail is grouped, and **it shows only entries this person can actually open**. A group whose every entry is hidden is not drawn at all, rather than left as an empty heading — offering a door that answers "forbidden" is worse than a shorter rail.

Today it carries:

| Group | Entries |
|---|---|
| **Overview** | Dashboard |
| **The laboratory** | People (laboratory owners and managers only) · Settings |

The rail fills in as later waves land. **The LIMS screens delivered in wave 3 are not yet on it** — they are reached from the dashboard, from links on the records themselves, and by their addresses. The [user guide](../user-guide/overview) names each address.

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
