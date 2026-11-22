# GearGrid Client Agent Notes

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.
- Better Auth with MongoDB adapter for sessions and role data.
- Better Auth JWT plugin; Next.js obtains 15-minute Bearer JWTs from the session.
- The JWT plugin token is separate from the `better-auth.session_token` cookie; get it through `authClient.token()` or the Better Auth `/api/auth/token` endpoint.
- Better Auth session cookie cache is enabled with the `jwt` strategy (7-day cache), so successful sign-in creates `better-auth.session_data` alongside `better-auth.session_token`. The JWT plugin signs this cache cookie with its JWKS keys via `sessionCookieCache: true`.
- Express verifies Bearer JWT signatures through Better Auth's JWKS endpoint and derives `req.user` from the verified payload.
- Express API at `http://localhost:5001` for equipment and booking data.
- MongoDB collections: `equipment`, `favorites`, `bookings`, `payments`, plus Better Auth collections.
- Stripe Checkout for rental payments; shadcn/base-ui components for UI primitives.

## Assignment and release status

- The requested marketplace and Customer/Owner/Admin dashboard flows are implemented in the client and Express API.
- The root layout supplies the global footer; root loading, error and not-found UI are present.
- Do not claim production is deployed or verified until a live URL is added and route reloads, CORS, OAuth and Stripe webhook delivery have been checked.
- Google OAuth is conditional on `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; production must configure both and the matching callback URL.
- Current committed-history counts are 41 client commits and 16 server commits. There may still be uncommitted work; check Git status before submission.

## Next.js 16 rules

- This is Next.js 16: read the local docs in `node_modules/next/dist/docs/` before changing routing or cache behavior.
- Dynamic routes use `params: Promise<{ id: string }>` in server components and route handlers.
- Keep secrets and MongoDB access server-side.
- Do not expose Stripe secret keys or Express internal credentials to client components.

## Roles and routes

- `Customer`: browse and book equipment, manage favorites and rentals.
- `Owner`: create, edit and delete owned equipment; view rental requests.
- `Admin`: review equipment and manage marketplace records.
- Owner dashboard is `/owner/dashboard`.
- Customer dashboard is `/customer/dashboard`.
- Equipment details are private at `/equipment/[id]`.
- The MongoDB equipment `_id` is the complete equipment id in the route.

## Owner equipment workflow

- The owner `My Equipment` tab uses a shadcn Table and Add Equipment shadcn Dialog.
- Client components call `/api/owner/equipments` and `/api/owner/equipments/[id]`.
- Next.js route handlers authenticate the Better Auth session, mint a JWT through `/api/auth/token`, and forward that Bearer token to Express.
- Express must never trust `x-user-id` or `x-user-role`; those headers are not used for authorization.
- Owner API filtering must use `ownerId=<logged-in-user-id>`.
- Create and edit payload fields:
  - `name`, `description`, `category`, `location`, `imageUrl`
  - `dailyRate`, `weeklyRate`, `monthlyRate`, `rentalType`
  - `availableQuantity`, `terms`
- New owner listings start as `pending`/`approvalStatus: pending`.
- Add Equipment accepts a device image, uploads it to ImgBB, previews it, then saves the hosted URL with the listing.
- Set `IMGBB_API_KEY` in the client `.env`; the upload route runs on the Next.js server and keeps this key private.
- Editing an owner listing resets its approval status to pending.
- Owners cannot edit or delete another owner's equipment.
- Equipment with confirmed or active bookings cannot be deleted.
- The table supports edit and delete actions and shows approval status.

## Favorites and payments

- `/api/favorites` stores favorite equipment for the signed-in customer.
- `/api/customer/favorites` returns hydrated favorite equipment for the dashboard.
- `/api/bookings` authenticates the customer and forwards booking details to Express; Express recalculates the BDT total and creates the Stripe Checkout Session.
- Unpaid bookings stay visible in My Rentals with their rental details and a Pay now action that reopens Checkout for the same booking.
- Customers can view transaction details under Payments; the equipment booking form shows remaining units for the selected rental dates.
- Stripe calls the Express `/api/webhooks/stripe` endpoint. The webhook updates booking/payment records; the success page reads the saved booking status and never changes it.
- Equipment rates and booking totals are shown in BDT; Stripe charges the converted USD amount.
- Never trust a browser-calculated total for checkout; Express recalculates it from MongoDB equipment data.

## Demo sign-in

- `/api/demo-signin` uses server-only `DEMO_CUSTOMER_*`, `DEMO_OWNER_*` and `DEMO_ADMIN_*` credentials.
- On first use, the endpoint creates the configured account; later use signs in normally.
- `DEMO_ADMIN_EMAIL` identifies the demo Admin. That account cannot change user roles in the UI or through `/api/admin/users`.
- Real Admin accounts retain the normal role-management controls.

## Commands

- `npm run dev` - start Next.js on port 3000.
- `npm run build` - type-check and create a production build.
- `npm run lint` - run ESLint.
- Express must run separately with `npm run dev` in the server project.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
