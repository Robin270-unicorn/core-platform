# Coding Agent Context – Crowdfunding App

You are building a **web crowdfunding platform** where small investors (“supporters”) invest in campaigns created by entrepreneurs (“creators”).
Use **React + TypeScript** and **shadcn/ui components** for all common UI elements (buttons, inputs, forms, dialogs, tables, etc.).

---

## 1. Product Vision

- Enable everyone to **invest in ideas they truly believe in**.
- Provide a **secure and transparent crowdfunding ecosystem**.
- Connect **project creators** with **small investors**.
- Key goals:
  - Simplify **micro-investing**.
  - Help startups **access funding quickly**.
  - Build **trust via transparency and data**.
- Value proposition:
  - Investors can earn **stable returns**.
  - Creators can **raise funds efficiently and transparently**.

---

## 2. Roles / Actors

- **Supporter (Investor)**
  - Browses campaigns, contributes money, manages their wallet & history.

- **Creator (Project owner)**
  - Creates campaigns and submits them for moderation.

- **Moderator**
  - Reviews submitted campaigns and **approves / rejects** them with feedback.

- **External Systems**
  - **Payment Gateway** (e.g. Stripe) – processes contributions.
  - **Email Service** – sends confirmations and notifications.

---

## 3. High-Level System Context

- Central app: **Crowdfunding App** (web UI + backend API).
- Data is persisted in an application database (Campaigns, Users, Wallets, Transactions, etc.).
- App talks to:
  - Payment gateway for **payment validation & status**.
  - Email service for **sending confirmations**.

Keep this separation in code:
- UI layer (React + shadcn/ui).
- API / services layer (fetching from backend).
- Domain models (TypeScript types/interfaces).

---

## 4. Core Features & User Stories

### 4.1 Campaign Creation (User Story 1 – Creator)

**Goal:** Allow creators to create a new campaign and submit it for moderation.

**Preconditions**
- Creator is **logged in**.

**Flow (happy path)**
1. Creator opens **“New Campaign”** form.
2. System displays required fields:
   - `name`
   - `description`
   - `fundingTarget`
   - `duration / deadline`
   - `category`
3. Creator fills in fields.
4. System performs **real-time validation** (required fields, formats, ranges).
5. Creator clicks **Submit**.
6. System:
   - Saves campaign with status **`Submitted/PendingReview`**.
   - Shows **success confirmation**.

**Postconditions**
- Campaign exists in DB with status `Submitted/PendingReview`.
- Campaign is **visible to moderators** in their dashboard.
- Creator sees that the request was sent for review.

**UI notes**
- Use shadcn **Form**, **Input**, **Textarea**, **Select**, **Button**, **Alert** for validation messages.
- Show clear error messages inline.
- After success, redirect to a **“campaign submitted”** / detail page.

---

### 4.2 Campaign Contribution (User Story 2 – Supporter)

**Goal:** Allow a supporter to invest in a campaign, process the payment, and update totals.

**Preconditions**
- Supporter is **logged in**.
- At least one campaign is **Active / Approved** and open for investment.
- Payment gateway + email service are available.

**Flow (happy path)**
1. Supporter opens **Public campaign list / overview**.
2. Selects a **specific campaign detail**.
3. Enters **amount to invest** and proceeds to payment.
4. System sends payment to **payment gateway**.
5. On **success**:
   - Transaction is recorded.
   - Campaign’s **total raised amount** is updated.
   - Supporter & creator receive **confirmation (email + on-screen)**.
6. On **failure**:
   - Show **error message**.
   - Offer **retry**.

**UI notes**
- Use shadcn **Card** or **Table** to list campaigns.
- Detail page shows:
  - campaign info,
  - current progress (`raised / target`),
  - investment form.
- Use a **loading** and **error** state around payment.

---

### 4.3 Wallet & History (User Story 3 – Supporter)

**Goal:** Give supporters a wallet view to see balance, filter history, and export records.

**Preconditions**
- Supporter is **logged in**.
- Supporter has a **wallet** with at least one transaction.
- Export feature (PDF/CSV) is available.

**Flow (happy path)**
1. Supporter logs in and opens **Wallet** section.
2. System shows:
   - **Current balance**,
   - Summary of **recent transactions**.
3. Supporter sets filter criteria:
   - `transactionType` (e.g. contribution, payout),
   - `dateRange`,
   - optionally `status`.
4. System applies filters and shows matching transactions.
5. Supporter reviews rows (date, amount, description, status, etc.).
6. Supporter clicks **Export**, chooses **PDF or CSV**.
7. System generates the file, downloads it with an auto filename (e.g. `wallet-YYYY-MM-DD.csv`).

**Postconditions**
- Supporter sees wallet and filtered history.
- Supporter gets a **downloaded file** with the filtered data.

**UI notes**
- Use shadcn **Table**, **Pagination**, **Badge** for statuses.
- Filters in a shadcn **Form** or **Toolbar** (date picker, select, etc.).
- Clear **empty states** (e.g. “No transactions yet”).

---

### 4.4 Moderator Dashboard (User Story 4 – Moderator)

**Goal:** Allow moderators to review and manage submitted campaigns.

**Preconditions**
- Moderator is **logged in**.
- There are campaigns with different statuses: `Pending`, `Approved`, `Rejected`.

**Dashboard capabilities**
- View **all campaigns**, grouped or filtered by **status**.
- Open **campaign detail** page.
- For `Pending` campaign:
  - Review provided info (creator name, title, description, funding target, reports, etc.).
  - Select **Approve** or **Reject**.
  - On reject, enter **feedback message**.
- System updates campaign status and notifies the creator.

**UI notes**
- Use shadcn **DataTable** pattern:
  - columns: name, creator, status, target, createdAt, etc.
  - filters by status.
- Detail view can be a **sheet**, **drawer**, or separate page.
- Use distinct **status badges** and clear call-to-action buttons.

---

## 5. Data Model (Conceptual)

You can assume at least these entities (represent them as TS types/interfaces):

- `User` (shared base for Supporter / Creator / Moderator)
- `Campaign`
  - `id`
  - `creatorId`
  - `name`
  - `description`
  - `fundingTarget`
  - `raisedAmount`
  - `deadline`
  - `category`
  - `status` (`Draft`, `Submitted/PendingReview`, `Approved`, `Rejected`, `Active`, `Completed`, …)
  - timestamps

- `Transaction`
  - `id`
  - `supporterId`
  - `campaignId`
  - `amount`
  - `type` (`Contribution`, `Payout`, …)
  - `status` (`Pending`, `Succeeded`, `Failed`)
  - timestamps

- `Wallet`
  - `supporterId`
  - `balance`
  - relationship to `Transaction[]`.

Use these models consistently across front-end types and API calls.

---

## 6. General Guidelines for the Coding Agent

- Prefer **clear, typed APIs** and **TypeScript types** for all domain objects.
- Keep **business rules** close to the domain (validation, status transitions).
- Always produce **accessible, responsive UI**:
  - Proper labels, validation messages, focus handling.
- Use **shadcn/ui** primitives instead of writing raw HTML for:
  - Forms, inputs, buttons, dialogs, alerts, tables, dropdowns, date pickers, etc.
- Consider **loading**, **error**, and **empty** states for each page.
- When unsure about a detail, follow patterns implied by the user stories:
  - Transparency, security, and clear feedback to the user.

This context should be used for all future code and UI you generate for this project.
