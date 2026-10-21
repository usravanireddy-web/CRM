# Velvorax Sales CRM

An independently organized frontend and backend for the Velvorax CRM. Git is intentionally not initialized yet; it can be added when the project is ready.

## Project layout

```text
frontend/                 React + TypeScript + Vite + Tailwind
  src/
    app/                  App entry and routing
    components/           Shared layout and UI components
    features/             Feature modules (dashboard, leads, companies, ...)
    lib/                  API client and shared helpers
    types/                Shared frontend types
backend/                  Express + JavaScript API
  src/
    config/               Environment and database configuration
    middleware/           Shared request middleware
    modules/              Feature modules and API routes
    database/             SQL migrations and seed scripts
    utils/                Shared response and error helpers
```

## Requirements

- Node.js 20 or newer and npm
- PostgreSQL 15 or newer

## Local setup

1. Create a PostgreSQL database named `velvorax_crm` (or set another existing database name in `DATABASE_URL`). If PostgreSQL reports that the database does not exist, create it once with `CREATE DATABASE velvorax_crm;` while connected as a PostgreSQL role allowed to create databases. Migrations do not reset existing databases.
2. In PowerShell, from `C:\CRM\backend`, run `Copy-Item .env.example .env`, then set your local PostgreSQL password and a private `JWT_SECRET` with at least 32 random characters. The local `.env` already has a generated JWT signing secret. Keep it private and do not commit it.
3. Add your own SMTP host, port, username, password, and sender address to `backend/.env` to enable email. SMTP settings may be left blank to disable sending. No WhatsApp or paid provider credentials are included.
4. In `backend/`, use `npm.cmd install`, `npm.cmd run db:migrate`, and `npm.cmd run admin:create`. The command asks for the first administrator details and visibly echoes the password while you type. Passwords must be 8–64 characters and at most 72 UTF-8 bytes. Then run `npm.cmd run dev`. Backend source is JavaScript.
5. In another terminal, in `frontend/`, run `npm.cmd install` and `npm.cmd run dev`.
6. Open the URL printed by Vite (normally `http://localhost:5173`). Sign in with the admin account you created. The public API health check is at `http://localhost:5000/api/v1/health`.

### If port 5000 is already in use

Only one process can listen on the API port. Stop the earlier backend with `Ctrl+C` in its terminal, then start the current backend with `npm.cmd start`. To identify a listener in PowerShell, run `netstat -ano | findstr :5000`, then inspect its PID with `Get-Process -Id <PID>` before stopping it. Do not stop a process until you confirm it is the old CRM backend. If another application must keep port 5000, set `PORT=5001` in `backend/.env` and set `VITE_API_BASE_URL=http://localhost:5001/api/v1` in `frontend/.env`, then restart both apps.

If sign-in returns `Route not found` even though the API health endpoint works, the browser is reaching an older backend process. Stop that process, restart the backend from `C:\CRM\backend`, and reload the frontend.

## First login and role accounts

The Register page activates accounts immediately for Sales Representative, Lead Researcher, Marketing, or Telecaller roles. Administrator and Sales Manager roles cannot be requested through public registration and can only be assigned by an existing Administrator. The workspace bell shows real overdue and next-24-hour task reminders for the signed-in user's visible tasks.

1. From `C:\CRM\backend`, run `npm.cmd run admin:create` in an interactive PowerShell terminal. Enter the administrator name, email, and a password of 8–64 characters. The terminal displays the password as you type. This creates the first Administrator in PostgreSQL. If that email already exists, run `npm.cmd run admin:reset-password` to set a new Administrator password.
2. Start the API with `npm.cmd start` and open the frontend. Sign in with the account created in step 1.
3. Staff can create an account at `/register` by selecting an allowed role and sign in immediately. Administrator and Sales Manager roles are only assigned by an existing Administrator. Staff sign in at `/login`; the backend role determines their visible pages and permissions.

Role use:

- **Administrator:** workspace access, team accounts, assignments, and settings.
- **Sales Manager:** team pipeline, reports, and record assignment.
- **Sales Representative:** assigned leads and deals, contacts, and follow-up tasks.
- **Lead Researcher:** assigned prospect work and company/contact research.
- **Marketing:** marketing overview and email campaign work.
- **Telecaller:** assigned follow-up work and call logging.

To see a role's UI, create an account for that role, then sign out and sign in as that user. The role comes from the database account and is never selected at login. Sidebar links, direct page routes, dashboard cards, reports, and API endpoints check role permissions. Sales Representative, Lead Researcher, and Telecaller record lists and dashboard totals are limited to their assigned leads, deals, and tasks where those modules are available. Signing out clears cached account data before another user signs in.

The CRM has separate pages for Dashboard, Leads, Companies, Contacts, Deals, Lead Intelligence, Email, Marketing, Email Campaigns, Telecalling, WhatsApp, Tasks, Reports, Team & roles, Team assignments, Account, Settings, and Help. Core CRM records use PostgreSQL through parameterized queries.

Record IDs use auto-incrementing numeric values. Migration `003_use_numeric_record_ids.sql` preserves each former UUID in the database-only `legacy_uuid` column and updates the deal-to-lead relationship without deleting records. The API returns numeric `id` values and hides the legacy column. Do not remove that column until any external UUID references have been reviewed.

## Authentication and role access

The API uses bcrypt password hashes, signed JWT access tokens, a login rate limit, active-user checks, and database-backed permissions. Use `npm.cmd run admin:create` to create the first admin without a built-in default password. Use `npm.cmd run admin:reset-password` if that Administrator account already exists but its password needs to be changed. Administrators can create accounts and change roles on the Team & roles screen. Passwords must be 8–64 characters and at most 72 UTF-8 bytes. Changing a password revokes existing sessions.

Roles are Administrator, Sales Manager, Sales Representative, Lead Researcher, Marketing, and Telecaller. The API checks each module permission; sales representatives, lead researchers, and telecallers see their assigned leads, deals, and tasks. Users see role-specific navigation and dashboard information. Newly created records belong to their creator; admins and sales managers can assign records from the Team assignments screen. Older records remain unassigned until assigned there.

The JWT is currently stored by the browser as an access token. Before public production deployment, move token storage to secure HTTP-only cookies with refresh-token rotation, add tenant isolation if multiple customer workspaces will share this deployment, and complete operational security review. RBAC is enforced per role, but this app is not yet a multi-tenant hosted service.

Email and campaign routes use Nodemailer with SMTP values from `backend/.env`; secrets are never returned by the API. Email campaigns remain drafts until an authorized user explicitly sends them. Telecalling stores manual call logs and does not place calls. WhatsApp reports as disconnected until an approved provider is configured.

Dashboard charts and counts are calculated from records the signed-in role can access. There is no historical trend or call/activity performance dataset, so the dashboard does not show invented month-over-month growth or team performance.

## Role-based screens

One dashboard layout changes its data, actions and navigation to match the signed-in user's role:

- **Administrator:** workspace pipeline, user and role management, record assignments and settings.
- **Sales Manager:** team pipeline, record assignments, follow-ups and reports.
- **Sales Representative:** assigned leads, deals, tasks and allowed contact/company information.
- **Lead Researcher:** assigned leads and permitted company/contact discovery tools.
- **Marketing:** marketing overview, campaigns and permitted lead/report data.
- **Telecaller:** assigned leads, call logging and follow-up tasks.

The API enforces each module permission and scopes leads, deals and tasks for representatives, researchers and telecallers. Hiding a screen is not the security boundary; the API checks access independently.

## Phase 1 scope

- Separate React/TypeScript frontend and Express/JavaScript backend
- Responsive initial dashboard shell
- API health endpoint and PostgreSQL connectivity check
- Versioned SQL migration runner
- Environment examples and setup instructions
- Separate CRM module pages and API routes with Joi request validation

See [docs/api.md](docs/api.md) for authentication, role permissions, routes and access rules.

## Known limitations

- No real Lead Intelligence provider is configured. The page shows a clearly labeled, fictional local demo dataset with working filters and CRM lead creation; it does not claim to return live or verified provider data. The provider API remains unavailable until an approved provider is configured.
- No WhatsApp Business provider or automated dialer is configured.
- This is single-workspace software. It does not yet isolate multiple customer organizations in one deployment.
- JWT access tokens are stored in browser local storage. Before public production, use secure HTTP-only cookies and refresh-token rotation.
- Self-service forgotten-password recovery, audit logs, and multi-factor authentication are not implemented yet. Administrators can reset their own account password through the local CLI.
- Database credentials are intentionally not included. Configure `backend/.env` locally before running migrations or the API.
- No database migration is applied automatically at server startup. Run `npm run db:migrate` explicitly.
- Do not expose the development configuration or credentials to a public deployment.
