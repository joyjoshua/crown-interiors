# Crown Interiors 🪚

A mobile-first business management and invoicing application designed specifically for a carpentry business, aimed at digitizing their entire invoice workflow.

## 🚀 Overview
Crown Interiors streamlines the creation, management, and sharing of invoices and estimates. It allows creating highly accurate PDF invoices safely and seamlessly sharing them with customers via WhatsApp.

### Core Features
- **Mobile-First Design**: Optimized for usability on mobile devices with an Apple HIG-inspired minimalistic and Apple-like interface.
- **Bilingual Support**: Full support for English and Tamil interfaces.
- **PDF Generation**: High-quality, customized PDF invoice and estimate generation on the server.
- **Invoice Management**: Complete lifecycle tracking including drafts, sent, and paid statuses, as well as invoice duplication.
- **Secure Authentication**: Password-based authentication ensuring data privacy and proper row-level access control.

---

## 🏗️ Tech Stack & Architecture

The project is architected as a decoupled client-server model supplemented by Supabase for database and authentication needs.

### Client (Frontend)
The frontend is a fast, responsive Single Page Application (SPA).
- **Framework & Build**: React 19, Vite
- **Routing**: React Router DOM (v7)
- **State Management**: Zustand (simple, boilerplate-free state tracking)
- **Forms**: React Hook Form
- **Internationalization**: `react-i18next` / `i18next`
- **Animations & UI**: Framer Motion, react-hot-toast
- **Auth Integration**: `@supabase/supabase-js`

### Server (Backend)
A robust Node.js REST API tasked primarily with secure invoice handling and PDF generation.
- **Runtime & Framework**: Node.js (v18+), Express.js
- **PDF Generation**: `pdfmake` (High-fidelity programmatic PDF creation)
- **Validation & Security**: `joi`, `helmet`, `cors`, `express-rate-limit`
- **Database Access**: `@supabase/supabase-js` (via Service role for elevated permissions)

### Database & Auth (Supabase)
- **Database**: PostgreSQL (managed by Supabase)
- **Security**: Strict Row Level Security (RLS) separating business data safely.
- **Authentication**: GoTrue (Email/Password authentication)
- **Storage**: Supabase Storage buckets for persisting generated PDF documents.

---

## 📂 Repository Structure

```text
crown-interiors/
├── client/                 # React Frontend Application
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/     # Reusable UI, Layout, and Invoice components
│   │   ├── hooks/          # Custom React hooks (auth, language, data)
│   │   ├── i18n/           # Translation files (en.json, ta.json)
│   │   ├── pages/          # Application routes/pages
│   │   ├── services/       # API integration & Supabase initialization
│   │   ├── store/          # Zustand state stores
│   │   └── styles/         # Global CSS and Animations
│   └── package.json        # Client dependencies
│
├── server/                 # Express Node.js Backend Application
│   ├── src/
│   │   ├── controllers/    # API Route handlers
│   │   ├── middleware/     # Auth checks, error handling, rate-limits
│   │   ├── routes/         # Express Router definitions
│   │   ├── services/       # Core business logic and database queries
│   │   ├── utils/          # PDF builders and helpers
│   │   └── validations/    # Joi schema definitions
│   ├── app.js / server.js  # Server entry points
│   └── package.json        # Server dependencies
│
└── docs/                   # Full documentation plans & architectural specs
```

---

## 🛠️ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or above)
- Supabase Project (Database, Auth, and Storage configurated)

### 1. Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env` and fill in Supabase keys and config).
4. Run the development server:
   ```bash
   npm run dev
   ```
   *The server runs on http://localhost:3001 by default.*

### 2. Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (copy `.env.example` to `.env` and configure your local backend URL and Supabase Anon keys).
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client runs on http://localhost:5173 by default.*

---

## 📖 Additional Documentation
For deep-dive architectural design, UI mockups, and database schemas refer to the `docs/` folder:
- `plan.md` - Master implementation plan and architecture
- `backend-plan.md` - API endpoint definitions
- `frontend-plan.md` - Frontend component tree and responsibilities
- `db-auth-plan.md` - DB schema and Supabase RLS specifications
- `ux-plan.md` - Design system and user flows
