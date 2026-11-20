---
sidebar_position: 6
slug: /developers/calendar-feed/
title: "Calendar feed"
description: "Subscribe your calendar to LabFlow: patients get their visits as 'LabFlow visit', staff get equipment calibration and service due dates, read only."
keywords:
  - labflow api
  - laboratory api
image: /img/labflow-social-card.png
---

# Calendar feed

**A read-only calendar your calendar app keeps up to date.** Patients get their booked visits, each titled only
*LabFlow visit*, with no test and no address. Staff get calibration and service due dates of their laboratory's
equipment.

Make one under **Sign-in and apps** or **Settings → Apps and assistants**, copy its address and subscribe from Google
Calendar (**From URL**), Outlook (**Subscribe from web**) or Apple Calendar (**New Calendar Subscription**).

The address carries its own `lf_cal_` token, which reads only that feed: treat it like a key. **Remove** stops it at
once.
