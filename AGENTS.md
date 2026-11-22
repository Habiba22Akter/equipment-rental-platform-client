# GearGrid Client Agent Notes

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4.
- Better Auth with MongoDB adapter for sessions and role data.
- Express API at `http://localhost:5001` for equipment and booking data.
- MongoDB collections: `equipment`, `favorites`, `bookings`, `payments`, plus Better Auth collections.
- Stripe Checkout for rental payments; shadcn/base-ui components for UI primitives.

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
- Next.js route handlers authenticate the session and forward the user id/role to Express.
- Owner API filtering must use `ownerId=<logged-in-user-id>`.
- Create and edit payload fields:
  - `name`, `description`, `category`, `location`, `imageUrl`
  - `dailyRate`, `weeklyRate`, `monthlyRate`, `rentalType`
  - `availableQuantity`, `terms`
- New owner listings start as `pending`/`approvalStatus: pending`.
- Editing an owner listing resets its approval status to pending.
- Owners cannot edit or delete another owner's equipment.
- Equipment with confirmed or active bookings cannot be deleted.
- The table supports edit and delete actions and shows approval status.

## Favorites and payments

- `/api/favorites` stores favorite equipment for the signed-in customer.
- `/api/customer/favorites` returns hydrated favorite equipment for the dashboard.
- `/api/bookings` authenticates the customer and forwards booking details to Express; Express recalculates the BDT total and creates the Stripe Checkout Session.
- Stripe calls the Express `/api/webhooks/stripe` endpoint. The webhook updates booking/payment records; the frontend success page only thanks the customer.
- Equipment rates and booking totals are shown in BDT; Stripe charges the converted USD amount.
- Never trust a browser-calculated total for checkout; Express recalculates it from MongoDB equipment data.

## Commands

- `npm run dev` - start Next.js on port 3000.
- `npm run build` - type-check and create a production build.
- `npm run lint` - run ESLint.
- Express must run separately with `npm run dev` in the server project.
