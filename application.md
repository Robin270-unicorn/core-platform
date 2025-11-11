# Crowdfunding Platform – Coding Agent Instructions

## 1. Your Role

You are a coding agent working on a **modern crowdfunding platform**.
Your main goals:

- Implement and maintain a **Next.js** frontend, **NestJS GraphQL** backend, and **PostgreSQL** database.
- Use **Tailwind CSS + shadcn/ui components** for a consistent, modern UI.
- When available, you may call the **shadcn MCP** to explore components, props, and examples to generate high-quality UI code.
- Keep the system **transparent, reliable, and community-driven**.
- Always prefer **clear, auditable code** and **small, well-tested changes**.

When starting any task:

1. Briefly restate the task in your own words.
2. Inspect existing code and docs.
3. Propose a short implementation plan.
4. Implement in small steps with tests.
5. Summarize what changed (files, schema, resolvers, DB migrations).

---

## 2. Domain Overview

### 2.1 Application Description

The application is a **modern crowdfunding platform** that:

- Enables **creators** to launch investment-based campaigns.
- Enables **supporters (small investors)** to contribute.
- Enables **moderators** to verify and publish submissions.

Non-functional focus:

- **Transparency** – all operations are traceable and auditable.
- **Reliability** – robust error handling and consistent state.
- **Community engagement** – comments, surveys, and notifications.

### 2.2 Vision, Mission, Goals, Users, Value

- **Vision**
  > Enable everyone to invest in ideas they believe in through a secure and transparent platform.

- **Mission**
  > Build a secure and transparent crowdfunding platform for investment-based projects, empowering both creators and investors.

- **Key Goals**
  - Simplify micro-investing for individuals.
  - Help startups access funding quickly.
  - Build trust through transparency and data.

- **Target Users**
  - Small investors (supporters).
  - Project creators / entrepreneurs.
  - Moderators / admins.

- **Value Proposition**
  - Investors can earn stable returns while project creators raise funds efficiently and transparently.

Model your features and UX so they support these points.

---

## 3. System Topology & Architecture

### 3.1 Three-Tier Architecture

The application follows a **three-tier client–server architecture**:

| Layer                           | Technology                        | Responsibility |
| --------------------------------| ---------------------------------- | -------------- |
| Presentation Layer (Frontend)   | **Next.js (React)**               | Browser UI for supporters, creators, moderators. Handles routing, auth via JWT cookies, and data fetching from backend. |
| Application Layer (Backend API) | **NestJS (Node.js, GraphQL)**     | Business logic, GraphQL schema/resolvers, authentication / authorization, validation, orchestration of DB operations. |
| Persistence Layer (Database)    | **PostgreSQL**                    | Storage of users, campaigns, wallets, contributions, comments, surveys, notifications, moderation artefacts. |
| Infrastructure & DevOps         | **Docker, Railway, Vercel**       | Containerized deployment, environment configuration, CI/CD, logging, backups. |

All layers communicate via **HTTP(S)** and **GraphQL over JSON**.

### 3.2 Request Flow

For a typical request:

1. **Client sends a GraphQL query/mutation** via HTTPS to the NestJS GraphQL endpoint (e.g. `/graphql`).
2. **Backend validates & processes** the operation, executing domain logic in resolvers/services.
3. **Database stores & retrieves** entities using PostgreSQL transactions.
4. **Backend returns a GraphQL JSON response** to the frontend.
5. **Frontend renders** updated UI dynamically (Next.js SSR or CSR).
6. **Optional webhooks/notifications** are sent asynchronously for updates.

### 3.3 Physical Architecture (High Level)

- **Browser** (supporter / creator / moderator)
  ↔ HTTPS ↔ **Next.js app** (SSR/CSR) deployed e.g. on Vercel.
- **Next.js app**
  ↔ HTTPS / GraphQL ↔ **NestJS GraphQL API** running in Docker (e.g. Railway).
- **NestJS API** connects to:
  - **Primary PostgreSQL DB** (TCP 5432, with backups & PITR).
  - **Object storage** for images/docs (e.g. S3-style bucket).
  - **Centralized logs** (for monitoring, auditing).

The browser **may optionally call the GraphQL endpoint directly**, but default flow is via Next.js.

---

## 4. Main Components & Responsibilities

### 4.1 Frontend (Next.js)

- User-facing pages (at minimum):
  - `CampaignList`
  - `CampaignDetail`
  - `Wallet`
  - `Profile`
  - `Dashboard`
- Use **React hooks / Context API** (or existing state libraries) for:
  - Auth state (JWT cookie presence, user role).
  - Global UI state (loading, toasts, theme, etc.).
- Communicate with backend through the **GraphQL endpoint** (e.g. `/graphql`) using the configured GraphQL client (Apollo, urql, or a thin fetch wrapper).

**Frontend guidelines**

- Use **TypeScript** and functional components.
- Use **shadcn/ui** as the primary component library (e.g. `Button`, `Card`, `Dialog`, `Form`, `Input`, `Table`):
  - Prefer shadcn components over ad-hoc custom components when possible.
  - When unsure about component usage or variations, query the **shadcn MCP** to retrieve patterns and example code.
  - Extend via composition; avoid heavy overrides that break consistency.
- Style with **Tailwind CSS**, following existing design tokens (colors, spacing, typography).
- Prefer **server components/SSR** for SEO-relevant pages (campaign listings, details); CSR where interactivity requires it.
- Handle GraphQL errors gracefully with user-friendly messages (e.g. shadcn `Toast` / `Alert`).
- Centralize GraphQL operations (queries/mutations/fragments) and generated types if codegen is used.
- Respect user roles: hide/disable actions the user is not allowed to perform.

### 4.2 Backend (NestJS, GraphQL)

Core modules (at minimum):

- `User`
- `Campaign`
- `Wallet`
- `Comment`
- `Survey`
- `Notification`
- `Moderation`

**Backend guidelines**

- Use **NestJS modules, resolvers, services** consistently.
- Define **GraphQL schema** (SDL or code-first) with clear types, queries, mutations (and subscriptions if needed).
- Use **DTOs / input types** and **validation pipes** for all incoming data.
- Implement **authentication & authorization via JWT strategy**:
  - Store JWT in HTTP-only cookies from the frontend.
  - Enforce role-based access control (supporter / creator / moderator / admin) inside resolvers/guards.
- Implement **logging and a global error filter** to return consistent GraphQL error shapes (with safe messages).
- Use transactions for critical financial operations (e.g. contributions, wallet updates).
- Optimize with **DataLoader** or equivalent to avoid N+1 query problems.

### 4.3 Database (PostgreSQL)

- Model entities to support:
  - Users & roles.
  - Campaigns (status, funding goal, raised amount, timeline).
  - Contributions / investments.
  - Wallet balances and transactions.
  - Comments, surveys, notifications, moderation logs.
- Use foreign keys, indexes, and constraints to maintain integrity.
- Use migrations (e.g. via TypeORM/Prisma/Knex – follow whatever is already configured).
- Include audit fields where reasonable (`created_at`, `updated_at`, `created_by`, `updated_by`).

### 4.4 Object Storage & Logs

- Store large files (images, documents) in **object storage**, not the DB.
- Always save only the **URL / key** in PostgreSQL.
- Use centralized logs for:
  - GraphQL requests/responses (without leaking secrets).
  - Errors and unusual events (failed payments, suspicious activity).

---

## 5. Cross-Cutting Concerns

When implementing any feature, consider:

1. **Security**
   - Never log secrets or full tokens.
   - Validate all input on the backend, even if validated on the frontend.
   - Protect write operations with authentication & proper roles.

2. **Transparency & Auditability**
   - Prefer append-only transaction tables for financial data.
   - Keep history of important status changes (campaign status, moderation decisions).

3. **Reliability**
   - Graceful error handling (no unhandled promise rejections).
   - Use retries/backoff for transient external failures where applicable.
   - Ensure idempotency for operations that can be retried (e.g. webhook callbacks).

4. **Developer Experience**
   - Keep functions small and single-purpose.
   - Write unit/integration tests for new logic (resolvers, services, DB operations).
   - Update or add schema docs / API docs / README sections when behavior changes.

---

## 6. How to Propose Changes

Whenever you respond with code:

1. Provide a **short summary** of the change.
2. Show **relevant code snippets or diff-style blocks**.
3. Mention **new/changed GraphQL types, queries, mutations, or DB fields**.
4. Include **example GraphQL operations** (queries/mutations) and responses.
5. If a migration is needed, describe it explicitly.

Your output should always be **copy-pasteable** and **build-ready** (no pseudo-code unless explicitly requested).

---
