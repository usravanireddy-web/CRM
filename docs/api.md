# API reference

All routes use `/api/v1`. JSON responses use `{ success, data, meta, message }`; errors use `{ success: false, error: { code, message, details } }`. Except for health and sign-in, endpoints require `Authorization: Bearer <token>`. The server loads the user's current role and permissions from PostgreSQL on each request, so changing a user's role takes effect on the next API request.

## Authentication and users

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/health` | Public | API and database health |
| POST | `/auth/register` | Public, rate limited | Create an active account with an allowed non-admin role |
| POST | `/auth/login` | Public, rate limited | Sign in with `{ email, password }`; returns a JWT and role permissions |
| GET | `/auth/me` | Signed in | Current user and permissions |
| PATCH | `/auth/password` | Signed in | Change password; revokes existing sessions and requires sign-in again |
| GET | `/auth/roles` | `users:read` | Available roles and permission keys |
| GET | `/auth/users` | `users:read` | Team accounts |
| POST | `/auth/users` | `users:manage` | Create an account with a role and password (8–64 characters, at most 72 UTF-8 bytes) |
| PATCH | `/auth/users/:id` | `users:manage` | Change a user's role or active state; cannot remove the last active admin |

Create the initial administrator interactively from `backend/` with `npm.cmd run admin:create`. Password input is visibly echoed in the terminal. To change an existing Administrator's password, use `npm.cmd run admin:reset-password`; this invalidates existing sessions. Public registration immediately activates `sales_rep`, `lead_researcher`, `marketing`, and `telecaller` accounts. Administrator and Sales Manager access must be assigned by an existing Administrator. There is no default account or password.

## CRM records

The `leads`, `companies`, `contacts`, `deals`, and `tasks` resource routes share these operations. Each operation checks the matching `<module>:read`, `create`, `update`, or `delete` permission. Create and update requests use the module's Joi schema under `backend/src/modules/{resource}`.

| Method | Path | Description |
| --- | --- | --- |
| GET | `/{resource}?search=&page=1&pageSize=25` | Search and paginate records |
| POST | `/{resource}` | Create a record |
| GET | `/{resource}/:id` | Read one record |
| PATCH | `/{resource}/:id` | Validate and update supplied fields |
| DELETE | `/{resource}/:id` | Delete a record |

Record IDs are positive numeric values. Leads, deals, and tasks are scoped to their assigned user for sales representatives, lead researchers, and telecallers. Newly created records are assigned to the creator when applicable.

## Assignments and reports

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/assignments` | `assignments:manage` | Load active users and assignable leads, deals, and tasks |
| PATCH | `/assignments/:resource/:id` | `assignments:manage` | Set `userId` to an active user's numeric ID or `null` to unassign; resource is `leads`, `deals`, or `tasks` |
| GET | `/reports/summary` | `reports:read` | Live counts by lead status/source, deals, tasks, and companies; scoped for assigned-record roles |

## Email and communications

SMTP settings are read from `backend/.env`; the API never returns SMTP secrets. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` to enable actual delivery.

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/email/status` | `email:read` | SMTP configuration status |
| GET | `/email/logs` | `email:read` | Recent email activity |
| POST | `/email/send` | `email:send` | Send `{ to, subject, text }` through configured SMTP |
| GET | `/campaigns` | `email_campaigns:read` | List campaign drafts and send status |
| POST | `/campaigns` | `email_campaigns:create` | Create a draft with `{ name, subject, body, recipients }` |
| POST | `/campaigns/:id/send` | `email_campaigns:send` | Explicitly send a draft to its recipients through SMTP |
| GET | `/marketing/summary` | `marketing:read` | Campaign and campaign-source lead totals |
| GET | `/telecalling/logs` | `telecalling:read` | Recent manual call records |
| POST | `/telecalling/logs` | `telecalling:create` | Save `{ contactName, phone, outcome, notes }` |
| GET | `/whatsapp/status` | `whatsapp:read` | Reports manual/disconnected status until a provider is configured |

Campaign creation only saves a draft. Sending email or a campaign is an external action, so only the explicit send endpoint delivers messages. Telecalling records call activity but does not dial. No WhatsApp provider is connected.

## Lead Intelligence and settings

| Method | Path | Permission | Description |
| --- | --- | --- | --- |
| GET | `/lead-intelligence/status` | `lead_intelligence:read` | Reports whether a search provider is configured |
| POST | `/lead-intelligence/search` | `lead_intelligence:create` | Validates search filters; returns `409 PROVIDER_NOT_CONFIGURED` until an approved provider exists |
| GET | `/settings` | `settings:read` | CRM status and priority options |

The Lead Intelligence page separately uses a clearly labeled fictional frontend demo dataset for local filters, illustrative charts, and testing the “Add lead” CRM action. Those examples are not real provider results and are not returned by the provider search API.

No paid provider data is fabricated. Provider integrations, tenant isolation, audit logs, password reset, MFA, and production token refresh/cookie handling remain future work; see [README.md](../README.md#known-limitations).
