---
sidebar_position: 13
slug: /user-guide/profile-and-identity
title: Your profile and identity verification
description: The LabFlow profile and identity verification — what belongs to you rather than to a laboratory, what each laboratory verifies independently, the file checks that are actually performed, and why nobody can view an uploaded document here.
keywords:
  - identity verification
  - profile
  - identity document
  - private upload
  - laboratory verification
image: /img/labflow-social-card.png
---

# Your profile and identity verification

## Your profile

**`/profile`** holds what belongs to **you**, not to a laboratory: given name, family name and a direct phone number. Your display name is built from the two names by the same save.

Your email address lives on the account itself and is changed through the account, not here.

Anything that belongs to a laboratory — your role, your release scope, your job title — is per-laboratory and lives on the membership. See [users and access](./users-and-access).

## Identity verification

**`/profile/verification`**.

**Each laboratory verifies independently.** One verification record exists per person **per laboratory**, because a laboratory that has satisfied itself about who you are has not done so on another laboratory's behalf. Resubmitting restarts the review on the same record rather than opening a new one.

### What is checked

Exactly three things, and they are mechanical:

1. The file is a **supported type** — JPEG, PNG or PDF, determined from the bytes rather than from the file name.
2. It is **within the size limit** (5 MB).
3. **The file opened**, and an image is at least 1000 × 640.

:::info There is no OCR and no name matching
LabFlow does not read the document, does not extract a name or a date, and does not compare either against your profile. Claiming otherwise would describe a check that is not performed.
:::

### Nobody views the document here

An uploaded document is stored as a **private object**, and its storage identifier is **not readable by the browser at all** — not yours, not anyone's. The page promises "no view here, for you or for anybody else", and the permission model is what makes that true rather than a policy nobody can check.

The reviewer's side of this — opening a document server-side, recording that it was opened, and deleting it thirty days after a decision — belongs to platform administration and is [not built](../roadmap).
