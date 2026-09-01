---
sidebar_position: 2
slug: /architecture/tenancy-and-rls
title: Tenancy and row-level security
description: How LabFlow keeps two laboratories in one database apart — membership as the record, the role on the membership rather than the profile, deny-by-default row-level security on every table, and the privilege block that closes four roles.
keywords:
  - multi-tenant database
  - row-level security
  - RLS policy
  - tenant isolation
  - Postgres security
  - deny by default
image: /img/labflow-social-card.png
---

# Tenancy and row-level security

Two laboratories share one database and never see each other's patients, orders or results. **The database is what enforces that, not the application.**

## Membership is the record

A laboratory is a tenant. A person's relationship to one is a **membership row**, carrying the role, the release scope, who granted it and when they were last active.

**The role lives on the membership, never on the profile.** A person can work at two laboratories in different roles — a pathologist at one and a quality officer at another is an ordinary arrangement, not an edge case. A single `role` column on the person makes that unrepresentable, and the usual repair is to duplicate it onto the membership as well, at which point the two disagree and authorisation is decided by whichever one the query happened to read.

## Deny by default, on every table

Every table has row-level security enabled and an **explicit policy**. There is no catch-all rule and no table that is readable because nobody wrote a policy for it.

Two rules follow from that, and both are checked:

**A policy must be provable from the query's own filters.** A policy that reads a row's `tenant_id` obliges every list, count and aggregation to carry that filter itself. A query without it is refused rather than silently returning nothing — which is the failure mode that looks like an empty database.

**Every table ships a paired privilege block closing four roles.** Row-level security decides which *rows* a caller sees; table privileges decide whether the caller may touch the table at all, and Postgres's defaults are more generous than they look. Both are declared together with the table, and both are checked against the live database rather than against the files that were meant to write them.

The anonymous role holds **nothing** on any application relation.

## Reads that need more than a policy can express

Row-level security filters **rows, not columns**. Some reads legitimately need to show one column of a colleague's record and not another — a name and a work email, but not a personal phone number.

Those reads are **functions**, not table selects: they return exactly what the approved page prints, to exactly the roles the policy names, and they clamp their own page size. That is narrower than granting a same-tenant read on the whole table, which would expose every column on it.

## The fetch budget

No list read fetches a table to filter it in the browser. **Twenty rows by default, fifty as a hard maximum**, with the database doing the filtering, sorting and counting.

## What is checked, and how

Policies, grants and row-level-security status are verified **against the database's own catalogues**, not against the migration files. A migration whose privilege block never applied leaves a table on Postgres's defaults while every file in the repository says otherwise — that has happened once here, and it is why the check reads the database.
