---
title: Setting up a licensed deployment
description: What happens between paying for a LabFlow white-label licence and your deployment answering at your domain, step by step.
keywords:
  - LabFlow white-label setup
  - white-label deployment
  - custom domain LIMS
image: /img/labflow-social-card.png
last_update:
  date: 2026-11-14
---

# Setting up a licensed deployment

1. **You choose the platforms and pay.** The [pricing page](https://labflow.aoneahsan.com/white-label/pricing/) asks our licensing service for the total of your selection and opens its payment page for that figure. You pay by bank transfer to our Wise account and enter the transfer reference there.
2. **The licence email arrives.** It is sent once we confirm the transfer, with the licence key and its certificate. The page you return to after paying reads the order once and grants nothing by itself.
3. **You reply with your domain and branding.** The domain stays registered in your name. Send your logo files and colours in the same reply.
4. **We deploy.** We connect the domain, set up its certificate, apply the branding and send you the address once it answers.

No timescale is promised for step 4: it depends on your domain's DNS and on the branding files arriving.

## What the deployment serves

Every licensed deployment serves its licence file at `/.well-known/labflow-white-label-license.json` and its certificate beside it as a PDF. We add both when we deploy; you do not need to. Anyone can check them on the [verify page](https://labflow.aoneahsan.com/verify-license/).
