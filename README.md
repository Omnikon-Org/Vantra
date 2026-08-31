# Vantra — Enterprise Financial Operations & Reconciliation Platform

<div align="center">

**A secure, multi-tenant financial infrastructure platform designed for transaction management, automated 5-pass reconciliation, variance exception resolution, and immutable audit compliance.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.19-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.0-336791.svg)](https://www.postgresql.org/)

</div>

---

## 🌟 Overview

**Vantra** is an enterprise-grade FinTech SaaS platform that unifies internal double-entry ledgers with external banking statements. It provides end-to-end financial integrity through automated multi-pass matching algorithms, configurable date/amount tolerances, exception management workflows, and tamper-proof append-only audit logging.

---

## 🏗️ Architecture & Core Modules

```
                    ┌──────────────────────────────────────────────┐
                    │               VANTRA PLATFORM                │
                    └──────────────────────┬───────────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  Multi-Tenancy   │             │   Double-Entry   │             │  Reconciliation  │
│   & JWT Auth     │             │  Ledger Engine   │             │  5-Pass Engine   │
└────────┬─────────┘             └────────┬─────────┘             └────────┬─────────┘
         │                                │                                │
         │                                │                                │
         ▼                                ▼                                ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  Tenant Boundary │             │ Accounts, Txns,  │             │ Exact, Fuzzy,    │
│  Prisma Scoping  │             │ Entries & Bal    │             │ Tolerance Scans  │
└────────┬─────────┘             └────────┬─────────┘             └────────┬─────────┘
         │                                │                                │
         └────────────────────────────────┼────────────────────────────────┘
                                          │
                                          ▼
                         ┌──────────────────────────────────┐
                         │   Exception & Audit Management   │
                         │  • Severity-based Discrepancies  │
                         │  • Atomic Resolutions & Notes    │
                         │  • Append-Only Compliance Logs   │
                         └──────────────────────────────────┘
```

### 1. 🏢 Multi-Tenant Security & Auth (Step 3)
- **Tenant Isolation**: Every database entity is tied to a `tenantId`. Tenant A can never query, alter, or infer Tenant B records.
- **Cryptographic Auth**: Password hashing with BCrypt (10 rounds) and stateless JWT Bearer token claims.
- **Role-Based Access**: Granular roles (`ADMIN`, `ACCOUNTANT`, `MEMBER`).

### 2. 💳 Transaction Ingestion & Double-Entry Ledger (Step 4)
- **Account Types**: Operating Bank Accounts (`BANK`), Credit Facilities (`CREDIT`), and Cash Reserves (`CASH`).
- **Balanced Ledgers**: Transactions generate debit and credit `LedgerEntry` pairs guaranteeing zero balance drift.
- **Dynamic Aggregation**: Account balances computed in real-time directly from ledger entry sums.

### 3. ⚖️ 5-Pass Reconciliation Engine (Step 5)
- **Pass 1 — Exact Reference Match**: Matches statement records to ledger transactions by exact reference code.
- **Pass 2 — Exact Amount & Date Match**: Matches unreferenced items by precise currency, amount, and timestamp.
- **Pass 3 — Fuzzy Date Tolerance Match**: Matches records with configurable day variances (e.g. 1–3 business day settlement lag).
- **Pass 4 — Discrepancy Isolation**: Flags amount mismatches for same-day references with calculated difference values.
- **Pass 5 — Unmatched Exception Isolation**: Surfaces missing bank credits or unrepresented internal txns.

### 4. 🛡️ Audit & Exception Management (Step 6)
- **Exception Lifecycle**: `OPEN` $\rightarrow$ `IN_REVIEW` $\rightarrow$ `RESOLVED` with resolver metadata (`resolvedBy`, `resolvedAt`, `resolutionNotes`).
- **Dynamic Severity**: Categorizes variances into `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL` based on amount thresholds.
- **Immutable Audit Trail**: Append-only log of every financial action (`ACCOUNT_CREATED`, `TRANSACTION_CREATED`, `RECONCILIATION_CREATED`, `EXCEPTION_RESOLVED`) with automatic redaction of sensitive credentials.

### 5. 🎨 Modern FinTech Frontend Dashboard (Step 7)
- **Design System**: Slate, Deep Navy (`#060B14`, `#0B1322`), Emerald Green (`#10B981`), and Cyan (`#06B6D4`) palette.
- **Public Marketing Homepage**: Complete landing page with pipeline architecture overview, trust badges, feature cards, and interactive demo.
- **Command Center Dashboard**: Live KPI cards (Net Balance, Inflow, Outflow, Reconciliation Health), active exception alert banners, recent transaction table, and live audit feed.
- **Responsive Layout**: Desktop navigation sidebar and mobile hamburger drawer.

---

## 📁 Repository Structure

```
Vantra/
├── backend/                         # Node.js + Express + Prisma API Server
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema & relations
│   │   └── migrations/              # Applied PostgreSQL migrations
│   ├── src/
│   │   ├── controllers/             # Express route controllers
│   │   ├── middleware/              # Auth & Error handling middlewares
│   │   ├── routes/                  # API router definitions
│   │   ├── services/                # Core business logic (Ledger, Recon, Audit, Exceptions)
│   │   ├── validators/              # Zod schema validation rules
│   │   ├── app.ts                   # Express application setup
│   │   └── server.ts                # Server entry point
│   ├── test_auth.sh                 # Authentication test suite
│   ├── test_financial.sh            # Accounts & Transactions ledger test suite
│   ├── test_reconciliation.sh       # Reconciliation engine test suite
│   └── test_audit_exceptions.sh     # Audit trail & Exceptions test suite
│
├── frontend/                        # React + TypeScript + Vite Dashboard
│   ├── src/
│   │   ├── api/                     # Centralized API client & endpoint bindings
│   │   ├── components/              # Common UI components (Modal, KPICard, Badge, etc.)
│   │   ├── context/                 # Global AuthContext & state
│   │   ├── layouts/                 # AppLayout with sidebar & header
│   │   ├── pages/                   # Public HomePage, Auth, Dashboard, Accounts, Txns, Recon, Exceptions, Audit
│   │   ├── routes/                  # AppRoutes with ProtectedRoute guards
│   │   ├── styles/                  # Global design tokens, tokens, utilities
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── infra/
│   └── docker-compose.yml           # PostgreSQL container setup (port 5434)
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Docker**: For running PostgreSQL database container

---

### Step 1: Clone and Start Database

```bash
# Clone the repository
git clone https://github.com/your-org/vantra.git
cd Vantra

# Start PostgreSQL database container
cd infra
docker compose up -d
cd ..
```

---

### Step 2: Configure & Start Backend

```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Start development server (Port 5001)
npm run dev
```

Backend will be live at `http://localhost:5001`. Verify with:
```bash
curl http://localhost:5001/api/health
# {"success":true,"message":"Vantra API is running"}
```

---

### Step 3: Configure & Start Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite development server (Port 3000)
npm run dev -- --port 3000
```

Open your browser and navigate to **`http://localhost:3000`** to explore the public landing page or register a new organization account.

---

## 🧪 Running Automated Test Suites

From the `backend/` directory, execute the dedicated test suites:

```bash
cd backend

# 1. Authentication & Multi-Tenant Isolation Suite
./test_auth.sh

# 2. Account & Transaction Double-Entry Ledger Suite
./test_financial.sh

# 3. 5-Pass Reconciliation Engine Suite
./test_reconciliation.sh

# 4. Audit Trail & Exception Management Suite
./test_audit_exceptions.sh
```

---

## 🔑 Google OAuth Setup (Google Cloud Console)

Follow these steps to configure Google OAuth 2.0 / OpenID Connect for Vantra:

1. **Open Google Cloud Console**: Navigate to [https://console.cloud.google.com/](https://console.cloud.google.com/).
2. **Create/Select a Project**: Create a new project (e.g. `Vantra-Financial-Platform`) or select an existing one.
3. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services** $\rightarrow$ **OAuth consent screen**.
   - Select **External** (or Internal for Google Workspace organizations).
   - Enter App Name (`Vantra`), User support email, and Developer contact information.
   - Add scopes: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
   - Save and proceed.
4. **Create OAuth Client ID**:
   - Go to **APIs & Services** $\rightarrow$ **Credentials** $\rightarrow$ **Create Credentials** $\rightarrow$ **OAuth Client ID**.
   - Application type: **Web application**.
   - Name: `Vantra Web Client`.
5. **Add Authorized JavaScript Origins**:
   - **Development**: `http://localhost:3000`
   - **Production**: `https://your-domain.com`
6. **Add Authorized Redirect URIs**:
   - **Development**: `http://localhost:5001/api/auth/google/callback`
   - **Production**: `https://api.your-domain.com/api/auth/google/callback`
7. **Copy Credentials**:
   - Copy the generated **Client ID** and **Client Secret**.
8. **Configure Backend Environment**:
   - In `backend/.env`, add:
     ```env
     GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
     FRONTEND_URL=http://localhost:3000
     ```

---

## 📡 API Reference Overview

| Endpoint | Method | Auth | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register new organization tenant & admin user |
| `/api/auth/login` | `POST` | Public | Authenticate user & receive JWT token |
| `/api/auth/google` | `GET` | Public | Initiate Google OAuth 2.0 redirect flow |
| `/api/auth/google/callback` | `GET` | Public | Handle Google OAuth callback & redirect to frontend |
| `/api/auth/me` | `GET` | Bearer | Get authenticated user context |
| `/api/accounts` | `GET` | Bearer | List tenant accounts with computed balances |
| `/api/accounts` | `POST` | Bearer | Create operating bank, credit, or cash account |
| `/api/transactions` | `GET` | Bearer | Paginated ledger search & filter |
| `/api/transactions` | `POST` | Bearer | Ingest double-entry balanced transaction |
| `/api/reconciliation` | `POST` | Bearer | Run 5-pass reconciliation against statement feed |
| `/api/reconciliation/:id/manual-match` | `POST` | Bearer | Manually link unmatched statement to internal txn |
| `/api/reconciliation/:id/resolve` | `POST` | Bearer | Mark discrepancy item as resolved with reason |
| `/api/exceptions` | `GET` | Bearer | List discrepancy & unmatched exceptions |
| `/api/exceptions/:id/status` | `PATCH` | Bearer | Update exception status (`OPEN` / `IN_REVIEW`) |
| `/api/exceptions/:id/resolve` | `POST` | Bearer | Resolve exception with mandatory audit notes |
| `/api/audit-logs` | `GET` | Bearer | Paginated immutable audit trail (Read-Only) |

---

## 🔒 Security & Compliance Principles

- **Zero Cross-Tenant Leakage**: Automatic schema-level `tenantId` enforcement in all database queries.
- **Append-Only Immutability**: No `UPDATE` or `DELETE` endpoints exist for audit logs.
- **Secret Redaction**: Passwords, authorization headers, and API keys are automatically stripped from audit metadata payloads.
- **Double-Entry Enforcement**: Transactions enforce matching debit/credit ledger records to prevent ungrounded balance creations.
- **Cryptographic OAuth Protection**: Secure server-side identity verification and CSRF state token protection.

---

## 📄 License

MIT License. Copyright © 2026 Vantra Inc. All rights reserved.
