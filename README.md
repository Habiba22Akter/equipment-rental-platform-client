# GearGrid — Equipment Rental Platform

A full-stack equipment rental marketplace where owners list their gear and customers browse, book and rent it for a specific period. GearGrid focuses on transparent rates, verified profiles and a booking flow that gets out of the way.

> **Live URL:** https://equipment-rental-platform-client-six.vercel.app
>
> **Current status:** the client and Express API are deployed on Vercel. The deployed home page and public API checks return HTTP 200. Google/GitHub OAuth initiation returns the deployed callback URLs. A Stripe test-mode webhook endpoint is configured and its signing secret is stored in the server's Vercel Production environment; verify a real test Checkout delivery before relying on payment confirmation. A success redirect alone does not confirm payment.

## Purpose

Renting equipment is still often handled through phone calls, screenshots and unclear deposits. GearGrid gives both sides one place to work from:

- **Customers** can find the right equipment, see a clear daily rate and book it for exact dates.
- **Owners** can turn idle equipment into income, control availability and keep track of every rental.
- **Admins** can moderate listings, users and bookings from a single dashboard.

## Key Features

### Implemented now

- Email and password registration and login with Better Auth.
- Google and GitHub social login (provider credentials are configured; provider-console callback URLs must match the deployed callback paths below).
- Password policy: at least 6 characters, one uppercase letter and one lowercase letter — validated in the form **and** on the server.
- Role-based user model: `Customer`, `Owner`, `Admin`. New email and social accounts default to `Customer`; the sign-up form can create a `Customer` or `Owner` account.
- Admin role can never be self-assigned through the public API. Role updates are stripped from `update-user`.
- Toast feedback for successful login/registration, validation errors and provider failures.
- Profile photo support through a direct image URL or an ImgBB upload (API key stays server-side).
- Session persistence across page reloads with Better Auth's MongoDB adapter.
- JWT issuance through the Better Auth JWT plugin; the 15-minute token carries the verified user ID and role.
- The JWT is retrieved separately from `/api/auth/token`; `better-auth.session_token` remains Better Auth's session cookie and is not the JWT.
- A 7-day `better-auth.session_data` cache cookie is enabled with the JWT strategy. `sessionCookieCache: true` signs this cached session with the JWT plugin's JWKS keys; the regular `session_token` remains in place.
- Express API verification through Better Auth JWKS public keys. Protected routes use verified `req.user` data, not spoofable identity headers.
- Responsive, accessible UI with keyboard focus states, visible labels and reduced-motion support.
- Environment variables for every secret and deployment-specific URL.

### Marketplace flows

- Equipment listing CRUD, category/location search and rental availability checks.
- Customer bookings with date validation, pending reservations and owner/administrative status updates.
- Stripe Checkout, raw-body webhook verification, BDT-to-USD conversion and saved payment records.
- Customer, owner and admin dashboards with role-protected Next.js routes and Express authorization.
- Reviews and ratings for completed rentals.
- The All Equipment page uses server-side pagination (nine cards per page); booking history uses paged results in all role dashboards.
- A light/dark theme toggle saves the visitor's choice in localStorage.
- Paid rentals are marked completed by the server's scheduled job. The server can email both parties through Resend after completion.

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
| `framer-motion` | Home page section and card animations. |
| `jose` | Verify JWTs with Better Auth JWKS in the Express API and session-cache verification in development. |
| `stripe` | Create Checkout Sessions and handle verified payment webhooks. |
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
| `EQUIPMENT_API_URL` | Yes | Server | Express API origin. |
| `EQUIPMENT_API_KEY` | No | Server | Shared internal key that must match the Express `INTERNAL_API_KEY`. |

The repository ignores `.env*` files; only `.env.example` is committed.

## Enabling Google and GitHub Login

### Google

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth client ID** of type **Web application**.
3. Add an authorised redirect URI:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://equipment-rental-platform-client-six.vercel.app/api/auth/callback/google`
   - Add the production origin `https://equipment-rental-platform-client-six.vercel.app` to **Authorized JavaScript origins** as well.
4. Put the client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### GitHub

1. Open **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Set the callback URL:
   - Local: `http://localhost:3000/api/auth/callback/github`
   - Production: `https://equipment-rental-platform-client-six.vercel.app/api/auth/callback/github`
3. Put the client ID and secret in `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

Providers are only registered when both values are present, so the app still boots without them. New social accounts receive the `Customer` role by default.

Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the client Vercel project's **Production** environment, along with `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` set to the production client origin. Redeploy after changing environment variables. OAuth callback URLs must match exactly, including protocol, host and path.

## Production Stripe Webhook

The Stripe **test-mode** endpoint is configured at `https://equipment-rental-platform-server-nine.vercel.app/api/webhooks/stripe` for `checkout.session.completed` and `checkout.session.expired`. Its signing secret is stored in the server Vercel project's Production `STRIPE_WEBHOOK_SECRET`, and the server has been redeployed. Keep `STRIPE_SECRET_KEY` in the same Stripe test mode. If switching to live payments, create a separate live-mode endpoint with the same URL/events, put its signing secret in Vercel, and redeploy.

Send a test event or complete a test Checkout payment and confirm Stripe shows a successful delivery (HTTP 200). Then check MongoDB: the booking should be `paymentStatus: "paid"` and a matching record should exist in `payments`. The success page only reports the booking state; the signed webhook is what updates the database. Local `stripe listen` is separate and does not configure this production endpoint.

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
6. When Next.js calls Express, it gets a short-lived JWT from the active Better Auth session and sends it in `Authorization: Bearer <jwt>`.
7. Express validates the JWT signature and claims through Better Auth's JWKS endpoint, then sets the verified user ID and role as `req.user`.

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
- Express authorization uses a verified JWT and the user's role/ID claims. Express does not accept `x-user-id` or `x-user-role` as authorization.
