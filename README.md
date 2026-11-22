# GearGrid — Equipment Rental Platform

A full-stack equipment rental marketplace where owners list their gear and customers browse, book and rent it for a specific period. GearGrid focuses on transparent rates, verified profiles and a booking flow that gets out of the way.

> **Live URL:** _Add the deployed Vercel URL here after the first production deployment._
>
> **Current milestone:** authentication (email/password + Google + GitHub) is complete and connected to MongoDB. Equipment, booking, payment and dashboard pages are the next milestones.

## Purpose

Renting equipment is still often handled through phone calls, screenshots and unclear deposits. GearGrid gives both sides one place to work from:

- **Customers** can find the right equipment, see a clear daily rate and book it for exact dates.
- **Owners** can turn idle equipment into income, control availability and keep track of every rental.
- **Admins** can moderate listings, users and bookings from a single dashboard.

## Key Features

### Implemented now

- Email and password registration and login with Better Auth.
- Google and GitHub social login (provider code is ready; add your client IDs and secrets to enable).
- Password policy: at least 6 characters, one uppercase letter and one lowercase letter — validated in the form **and** on the server.
- Role-based user model: `Customer`, `Owner`, `Admin`. New email and social accounts default to `Customer`; the sign-up form can create a `Customer` or `Owner` account.
- Admin role can never be self-assigned through the public API. Role updates are stripped from `update-user`.
- Toast feedback for successful login/registration, validation errors and provider failures.
- Profile photo support through a direct image URL or an ImgBB upload (API key stays server-side).
- Session persistence across page reloads with Better Auth's MongoDB adapter.
- Responsive, accessible UI with keyboard focus states, visible labels and reduced-motion support.
- Environment variables for every secret and deployment-specific URL.

### Planned for the next milestones

- Equipment listing CRUD with images, categories and availability.
- Search and filtering by category, location, date and price.
- Booking flow with date validation and owner approval.
- Secure online payment and payout records.
- Customer, owner and admin dashboards with role-protected routes.
- Reviews and ratings after a completed rental.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS v4, shadcn/ui primitives, Lucide icons |
| Authentication | Better Auth (email/password, Google, GitHub) |
| Database | MongoDB Atlas + `@better-auth/mongo-adapter` |
| Notifications | Sonner |
| Image uploads | ImgBB through a server-side route |

## npm Packages Used

| Package | Why it is used |
| --- | --- |
| `next`, `react`, `react-dom` | App Router, server components and the UI runtime. |
| `better-auth` | Email/password, OAuth providers, sessions and cookies. |
| `@better-auth/mongo-adapter` | Stores Better Auth users, sessions and accounts in MongoDB. |
| `mongodb` | Official MongoDB driver used by the adapter. |
| `tailwindcss`, `tw-animate-css` | Styling, design tokens and small animations. |
| `shadcn`, `@base-ui/react`, `class-variance-authority` | Accessible UI primitives and variant-based component styling. |
| `cn` | Class-name merging for Tailwind components. |
| `lucide-react` | Icon set. |
| `sonner` | Toast notifications. |
| `eslint`, `eslint-config-next`, `typescript` | Linting and type safety. |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

Copy `.env.example` to `.env` (or `.env.local`) and fill in the values:

```bash
BETTER_AUTH_SECRET=your-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

DB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=equipment-rental-platform

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

IMGBB_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

`BETTER_AUTH_SECRET` should be a long random string. On macOS/Linux you can generate one with:

### Demo sign-in accounts

The sign-in page has one-click Customer, Owner and Admin demo buttons. Set the server-only `DEMO_CUSTOMER_*`, `DEMO_OWNER_*` and `DEMO_ADMIN_*` variables in `.env.local`. The first click creates the configured demo account; later clicks sign in normally. Demo passwords must meet the regular password rule. The demo Admin can use the admin dashboard, but changing user roles is hidden in the UI and rejected by the server. Other real Admin accounts keep normal role-management access.

```bash
openssl rand -base64 32
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then visit `/signup` or `/signin`.

### 4. Build for production

```bash
npm run build
npm run start
```

## Environment Variables

| Variable | Required | Scope | Description |
| --- | --- | --- | --- |
| `BETTER_AUTH_SECRET` | Yes | Server | Signs sessions and OAuth state. Keep it private. |
| `BETTER_AUTH_URL` | Yes | Server | Public origin of the app. Used for OAuth callback URLs. |
| `NEXT_PUBLIC_APP_URL` | Yes | Client + server | Same origin, used by the Better Auth browser client. Must be public. |
| `TRUSTED_ORIGINS` | No | Server | Comma-separated extra origins (preview URLs or custom domains). |
| `DB_URL` | Yes | Server | MongoDB connection string. Never commit the real value. |
| `DB_NAME` | No | Server | Database name. Defaults to `equipment-rental-platform`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Server | Enables Google login when both are set. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | No | Server | Enables GitHub login when both are set. |
| `IMGBB_API_KEY` | No | Server | Enables profile-photo uploads. Direct image URLs work without it. |

The repository ignores `.env*` files; only `.env.example` is committed.

## Enabling Google and GitHub Login

### Google

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth client ID** of type **Web application**.
3. Add an authorised redirect URI:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-live-domain.com/api/auth/callback/google`
4. Put the client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### GitHub

1. Open **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set the callback URL:
   - Local: `http://localhost:3000/api/auth/callback/github`
   - Production: `https://your-live-domain.com/api/auth/callback/github`
3. Put the client ID and secret in `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

Providers are only registered when both values are present, so the app still boots without them. New social accounts receive the `Customer` role by default.

## MongoDB Setup

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access.
3. Allow your current IP (and Vercel's IP ranges, or `0.0.0.0/0` for a demo).
4. Copy the connection string into `DB_URL`.
5. Better Auth creates the `user`, `session`, `account` and `verification` collections on first use.

## Project Structure

```text
src/
  app/
    (auth)/
      signin/page.tsx        Sign-in route
      signup/page.tsx        Registration route
    api/
      auth/[...all]/route.ts Better Auth catch-all handler
      upload/route.ts        Server-side ImgBB upload proxy
    layout.tsx               Root layout, fonts and toaster
    page.tsx                 Landing page
    globals.css              Tailwind theme tokens and shared styles
  components/
    auth/                    Auth shell, fields, forms, social buttons
    site/site-header.tsx     Responsive header with session state
    ui/                      shadcn/base-ui primitives
  lib/
    auth.ts                  Server-side Better Auth + MongoDB config
    auth-client.ts           Browser Better Auth client
    auth-error.ts            Friendly error messages
    roles.ts                 Role types and safe normalisation
```

## Authentication Flow

1. A visitor signs up with name, email, password and an optional photo, or continues with Google/GitHub.
2. Better Auth validates the password, creates the user in MongoDB and starts a session using a signed HTTP-only cookie.
3. The session is restored on every reload through `/api/auth/get-session`, so authenticated users are not sent back to the login page.
4. The header reads the session with `useSession()` and shows the user's name, avatar initials and role.
5. Role changes are blocked at the public `update-user` endpoint; only server-side code can promote a user to `Admin`.

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add every required environment variable in **Settings → Environment Variables**:
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (your production URL)
   - `NEXT_PUBLIC_APP_URL` (your production URL)
   - `DB_URL`, `DB_NAME`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   - `IMGBB_API_KEY` (optional)
4. Add the production callback URLs in Google Cloud Console and GitHub.
5. Deploy and test:
   - Landing page loads.
   - `/signin` and `/signup` reload correctly.
   - Email/password login succeeds and survives a hard refresh.
   - Google and GitHub login return to the app.
   - No CORS, 404 or 504 errors in the browser console or Vercel logs.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server on port 3000. |
| `npm run build` | Create an optimised production build. |
| `npm run start` | Run the production build. |
| `npm run lint` | Run ESLint. |
| `npx tsc --noEmit` | Type-check the project without emitting files. |

## Security Notes

- Secrets live in environment variables and are never committed.
- The MongoDB connection string is only read on the server.
- The ImgBB API key is used by a server route, not exposed as a `NEXT_PUBLIC_*` value.
- Passwords are hashed by Better Auth; the app never stores plain text.
- Role escalation through `update-user` is blocked.
- Authentication cookies are HTTP-only and signed by Better Auth.

## Author

Built as part of the **Equipment Rental Platform** assignment.
