---
sidebar_position: 4
slug: /developers/mcp/
title: "Connect an AI assistant (MCP)"
description: "Connect Claude, ChatGPT, Claude Code or Cursor to LabFlow through MCP: read-only, approved on LabFlow's own page, patients' assistants see only their own records."
keywords:
  - labflow api
  - laboratory api
image: /img/labflow-social-card.png
---

# Connect an AI assistant (MCP)

**An assistant can read what you let it, and nothing more.** A patient can ask *"what changed between my last two
reports?"*; a lab manager can ask *"which analysers are due for calibration this month?"*. It can never change
anything in LabFlow, and a staff assistant never sees who a patient is.

```text
https://yqsjetrfhjjollsyjyie.supabase.co/functions/v1/mcp
```

The address is also on **Sign-in and apps** (patients) and **Settings → Apps and assistants** (staff), with a copy
button. You never paste a key into an assistant.

## Claude

1. **Settings → Connectors → Add custom connector**, name it LabFlow, paste the address.
2. Press **Connect**, sign in to LabFlow, tick what it may read and approve.

## ChatGPT

1. **Settings → Apps and connectors**, developer mode on under **Advanced**, then **Create**.
2. Name it LabFlow, paste the address, then approve on LabFlow's page.

## Claude Code

```bash
claude mcp add --transport http labflow https://yqsjetrfhjjollsyjyie.supabase.co/functions/v1/mcp
```

Then run `/mcp` and choose **labflow** to sign in.

## Cursor

```json
{ "mcpServers": { "labflow": { "url": "https://yqsjetrfhjjollsyjyie.supabase.co/functions/v1/mcp" } } }
```

## What the approval page shows

The app's name, the address it returns to (shown large), your account, and what it may read, in the same groups
as an [access key](./authentication.md#scopes). With two-factor on you enter a code first.

## Disconnect

**Remove** under Connected apps cuts the assistant off at once, even mid-conversation.
