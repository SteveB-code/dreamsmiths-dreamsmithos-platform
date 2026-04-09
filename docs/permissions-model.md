# DreamsmithsOS Permissions & Dashboard Model

**Status:** Draft for review — Steve & Danielle
**Date:** 9 April 2026

---

## Overview

The platform serves four distinct types of user, each with a different relationship to the business and therefore a different view of the platform. Permissions are layered: a base dashboard determined by user role, plus platform-specific access determined by platform assignments.

---

## User Roles

| Role | Who | Example |
|------|-----|---------|
| **Management** | Founders, operations leads | Steve, Danielle, Elani |
| **Product Lead** | People who lead one or more client platforms | Assigned per platform |
| **Employee** | Permanent staff (non-management) | Designers, office staff |
| **Contractor** | External contractors engaged by Dreamsmiths | ~20 individuals |

> **Note:** A person can only have one user role, but may be assigned to multiple platforms with different platform roles (e.g. Architect on one, Lead Dev on another).

---

## What Each Role Sees

### Management

Full visibility across the entire platform.

| Area | Access |
|------|--------|
| Dashboard | All metrics — people, platforms, compliance, onboarding, financials |
| People | All people records, all onboarding journeys |
| Platforms | All platforms, all assignments |
| Compliance | All compliance records, overdue alerts |
| Onboarding | Trigger and monitor all onboarding journeys |
| Documents | All documents across all platforms and people |
| Financials | Contractor rates, payment history (future) |

### Product Lead

Scoped to the platforms they lead, plus personal info.

| Area | Access |
|------|--------|
| Dashboard | Revenue performance metrics for their platforms, compliance status for their team |
| People | Team members assigned to their platforms |
| Platforms | Only platforms where they are assigned as Product Lead |
| Compliance | Compliance records for people on their platforms |
| Onboarding | View onboarding status of people joining their platforms |
| Documents | Platform docs (Annual Product Review, SLAs, tech docs) for their platforms |
| Financials | Quarterly revenue indicators for their platforms (future) |

### Employee

Personal dashboard focused on their employment relationship with Dreamsmiths.

| Area | Access |
|------|--------|
| Dashboard | Personal employment dashboard |
| Employment docs | Employment contract, company playbooks, policies |
| Compliance | Their own compliance records (e.g. annual declarations) |
| Onboarding | Their own onboarding journey (employee-specific version, future) |
| Platforms | View-only access to platforms they're assigned to |
| Documents | Platform docs relevant to their assignments |

### Contractor

Personal dashboard focused on their contracting relationship, plus platform access based on assignments.

| Area | Access |
|------|--------|
| Dashboard | Personal contractor dashboard — compliance status, hours worked, payment history (future) |
| Onboarding | Their own onboarding journey (the 7-step registration) |
| Compliance | Their own compliance records |
| Platform docs | Key docs for platforms they're assigned to — scoped by platform role |
| Hours & payments | Hours logged, payment history, invoicing (future) |
| Gamification | Engagement features, achievements, contribution metrics (future) |

---

## Platform-Level Access

Beyond the base dashboard, access to platform-specific information is determined by the `platformAssignment` table, which records both *which platform* and *what role*.

| Platform Role | What they can see on that platform |
|---------------|-------------------------------------|
| **Product Administrator** | Everything — settings, billing, all docs |
| **Product Lead** | Annual Product Review, SLAs, team, compliance, revenue metrics |
| **Business Analyst** | Requirements docs, project plans, team |
| **Architect** | Tech stack, architecture docs, Annual Product Review, team |
| **Lead Dev** | Tech docs, architecture docs, team, code standards |
| **Senior Dev / Developer** | Tech docs relevant to their work, team |
| **UX Specialist** | Design system docs, brand guidelines, team |
| **QA** | Test plans, quality docs, team |

> **Key principle:** A contractor who is an Architect on Platform X sees Platform X's technical docs and Annual Product Review, but sees nothing about Platform Y unless also assigned there.

---

## Implementation Notes

### Current State (April 2026)
- User role stored in `user.role` column (currently: `admin`, `product_lead`, `contractor`)
- Platform assignments stored in `platform_assignment` table with `role_on_platform`
- Sidebar already adapts based on role (admin sees full nav, contractors see restricted nav)
- Management users are set to `admin` manually via database

### What Needs to Change
- **Rename/expand user roles**: Current enum is `admin | product_lead | contractor`. Needs to become `management | product_lead | employee | contractor` (or similar — naming TBD)
- **Role assignment UI**: Management should be able to set a user's role from within the platform rather than via database
- **Permission middleware**: API routes need role checks to enforce access rules
- **Scoped queries**: Product Lead API calls need to filter by their platform assignments
- **Employee onboarding**: A separate onboarding flow for employees (different from contractor registration)

### Build Order (Suggested)
1. Finalise role naming with Steve & Danielle
2. Update the user role enum and add role management UI
3. Add permission middleware to API routes
4. Build contractor dashboard (personal view)
5. Build employee dashboard (personal view)
6. Build Product Lead scoped views
7. Add platform-level document access controls

---

## Open Questions

1. **Role naming**: `management` vs `admin`? `member` vs `employee`? What feels right for Dreamsmiths culture?
2. **Product Lead overlap**: Can a Product Lead also be a contractor? (i.e. an external person leading a platform)
3. **Employee onboarding**: Should employees go through a similar multi-step journey, or something simpler?
4. **Gamification for contractors**: What kind of engagement/value-add features are you envisioning? Badges, leaderboards, skill endorsements?
5. **Hours & payments**: Will this integrate with an existing system (Upwork, payroll software) or be standalone?
