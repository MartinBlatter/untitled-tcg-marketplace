# Untitled TCG Marketplace

A trading card game marketplace platform, focused on Magic: The Gathering. Sellers
list inventory, buyers search and check out, and the whole order lifecycle —
picking lists, shipping, funds, buylists, wishlists and messaging — is handled
in-app.

> **Project status:** this is a personal, unfinished side project, published as a
> code reference. It is not a hosted service, it has never been operated
> commercially, and several areas are incomplete (see
> [Known limitations](#known-limitations--security-notes)). It is an unofficial
> fan project with no affiliation to Wizards of the Coast — see
> [Data sources & attribution](#data-sources--attribution).

## Live demo

**[tcg-snowy.vercel.app](https://tcg-snowy.vercel.app/)**

A deployment of this repository, for looking around without setting anything up.
Register an account to reach the signed-in areas — registration is open and takes
nothing but an email address and a password, and no mail is ever sent to it (see
[Authentication](#authentication)). **On the demo, new accounts are given a
starting balance of 100** so that you can fill a cart and take a checkout
through to the end without having to sell something first. That is a convenience
of the hosted demo only — it is not behaviour of this repository, where a new
account starts at zero.

A few things to expect, so the demo is not mistaken for a finished product:

- It is a **demo, not a service.** Treat the data as disposable; use a throwaway
  password, and do not enter anything you would mind losing or being seen.
- **Nothing is really bought or sold.** Payments are internal bookkeeping only —
  no payment provider is involved anywhere.
- **Uploaded images do not survive a redeploy.** Uploads go to local disk, which
  is ephemeral on Vercel.
- The catalogue reflects whatever MTGJSON dump was last imported, and card art
  is served from a separate image host, so some images may be missing.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript 7 |
| UI | MUI v9 + MUI X (DataGrid, Charts, Date Pickers), Emotion |
| Database | MySQL 8 via `mysql2`, Drizzle ORM 0.45 + drizzle-kit |
| Auth | Project-local email + password; scrypt hashes and a signed session cookie, no third-party identity provider |
| i18n | next-intl 4 — English is complete (~1,140 keys) and German close behind (~94%); Spanish, French and Italian sit near 57% |
| State / forms | Zustand, Formik + Yup |
| Tests | Jest 30 + Testing Library, Playwright (e2e, minimal) |
| Tooling | pnpm, oxlint, husky |

## Getting started

### Prerequisites

- **Node.js >= 20.9.0**
- **pnpm 11.9.0** — pinned via `packageManager` in `package.json`; run `corepack enable` to have the right version used automatically
- **MySQL 8** database you can create a schema in
- *(Optional)* an SFTP-reachable host if you want to serve card images yourself

### 1. Install

```bash
git clone https://github.com/MartinBlatter/untitled-tcg-marketplace.git
cd untitled-tcg-marketplace
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Then fill in the values — see [Environment variables](#environment-variables).

### 3. Create the database schema

Create an empty MySQL schema matching `DB_SCHEMA`, then apply the migrations.
There are no `db:*` package scripts — drizzle-kit is invoked directly:

```bash
pnpm drizzle-kit migrate
```

Configuration lives in `drizzle.config.ts`; the schema source of truth is
`src/db/schema/`, and the current migration baseline is
`drizzle/0000_baseline.sql`. See `drizzle/legacy/README.md` for why the original
migration chain was re-baselined.

### 4. Import the card data

**The app has no cards until you do this** — search and browse will return
nothing. Card data comes from [MTGJSON](https://mtgjson.com) and is *not*
bundled with this repository.

1. Download **`AllPrintings.sql`** from [mtgjson.com/downloads/all-files](https://mtgjson.com/downloads/all-files/)
   (roughly 550 MB).
2. Place it at `importdata/AllPrintings.sql`. That directory is gitignored, and
   nothing downloads the file automatically.
3. Register an account at `/register`, then give it the `Admin` role — the
   import endpoint is gated on it, and a fresh installation has no admin:

   ```bash
   pnpm tsx scripts/grant-role.ts you@example.com Admin
   ```

   Log out and back in afterwards: roles are carried in the session cookie, so
   the grant only reaches you on your next login.
4. Start the app (`pnpm dev`) and call the import endpoint **as that signed-in
   user**. The simplest way is to open
   <http://localhost:3000/api/magic/import> in the browser you are logged in
   with, which streams progress as it goes. With `curl` you have to pass the
   session cookie yourself:

   ```bash
   curl -b 'tcg.session=<your cookie value>' http://localhost:3000/api/magic/import
   ```

   This streams the dump into MySQL, raises `max_allowed_packet` to 16 MB for the
   duration, and records the data version date in the `mtgMeta` table. It takes a
   while.
5. After **any** reimport, relink existing inventory rows to the new card IDs —
   same account, same cookie:

   ```bash
   curl -b 'tcg.session=<your cookie value>' http://localhost:3000/api/magic/update-inventory-keys
   ```

### 5. Run it

```bash
pnpm dev
```

The app is then on http://localhost:3000.

## Environment variables

Every variable lives in `.env`; `.env.example` is the template. `src/env.ts`
declares the required set and the root `instrumentation.ts` validates it once
when the server boots, so a missing variable aborts startup with a single error
listing everything that is absent, rather than surfacing later as a runtime
failure. Validation is deliberately skipped during `next build`, which evaluates
route modules before the environment is necessarily complete. `NEXT_PUBLIC_*`
values are inlined at build time, so they must be set when you build, not only
when you run.

| Variable | Required | Purpose |
|---|---|---|
| `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_SCHEMA` | yes | MySQL connection (`src/db/mysql.ts`, `drizzle.config.ts`, import routes) |
| `SESSION_SECRET` | yes | Signs the session cookie — generate with `openssl rand -base64 32`. Changing it logs everybody out |
| `NEXT_PUBLIC_IMAGE_HOST` | yes | Public base URL card images are served from. `next.config.mjs` derives the `next/image` remote pattern from this, so set it before building. The front-page banners do not use it — they ship in `public/banners/` |
| `CRON_SECRET` | in production | Shared secret for the `/api/cron/*` endpoints — see [Scheduled jobs](#scheduled-jobs). Unset means those endpoints refuse to run and return 503 |
| `DB_LOG_QUERIES` | no | Set to `true` to log every Drizzle query to the console. Off by default |
| `NEXT_PUBLIC_SYSTEM_ENV` | no | Declared historically; not read by current code |

## Authentication

Accounts live entirely in this project's database — there is no identity
provider to configure. `SESSION_SECRET` is the only setting.

- **Registration** (`/register`) takes an email and a password, writes a
  `profiledata` row plus its `funds` row, and signs the user in. Passwords are
  hashed with `node:crypto` scrypt (`N=32768, r=8, p=1`) and stored as a
  self-describing `scrypt$params$salt$hash` string, so the cost can be raised
  later without a migration. See `src/lib/auth/password.ts`.
- **Sessions** are a `jose`-signed JWT in an httpOnly cookie (`tcg.session`),
  carrying `userId`, `email`, `userName` and `roles`. Reading a session
  therefore costs no database queries. The trade-off is staleness: both
  `userName` and `roles` are snapshots from login, so anything that changes
  them re-issues the cookie. See `src/lib/auth/session.ts`.
- **Authorisation** lives in `src/lib/auth/dal.ts` (`requireSession`,
  `requireRole`, `getCurrentUser`). `proxy.ts` also redirects signed-out users
  away from the logged-in pages, but that is an optimistic check only — it runs
  on prefetches and reads nothing but the cookie.
- **Onboarding.** A new account has no `userName`, so
  `src/components/ProfileRedirect/ProfileRedirect.tsx` sends the user to
  `/profile` once to choose one and fill in the address that checkout needs.
- **Roles** are a comma-separated `profiledata.roles` column, parsed only in
  `src/lib/auth/roles.ts`. Grant one with `pnpm tsx scripts/grant-role.ts`;
  it takes effect on the user's next login. Two exist: `Business` unlocks the
  seller profile at `/profile/business`, and `Admin` is required by the
  catalogue-maintenance endpoints under `/api/magic` — the MTGJSON import, the
  inventory key rewrite and the image tooling. **A fresh installation has no
  admin**, so grant one before running the import in
  [step 4](#4-import-the-card-data):

  ```bash
  pnpm tsx scripts/grant-role.ts you@example.com Admin
  ```

### Password reset

There is **no email** anywhere in this project, so there is no reset-by-link
flow. Reset a password from the command line and pass it on yourself:

```bash
pnpm tsx scripts/set-password.ts someone@example.com
```

The `authTokens` table and the `profiledata.emailVerifiedAt` column already
exist for single-use reset and verification tokens, so adding a mailer later
needs no migration — only a sender.

## Card images

Card art is sourced from [Scryfall](https://scryfall.com) and served from
`NEXT_PUBLIC_IMAGE_HOST`. The update flow is driven by `getImages.bat`
(`pnpm update-images`), which:

1. calls `/api/magic/image-update-report?format=csv` to work out which images
   changed, writing `images.csv`;
2. calls `/api/magic/download-card-images` to fetch the art and upload it.

Both endpoints now require the `Admin` role, and `getImages.bat` sends no
session cookie, so it gets a `401` as written. Add a `-b 'tcg.session=...'` to
both `curl` lines with the cookie of a signed-in admin before running it.

**This second step is currently disabled.** The endpoint returns
`{"status": "unavailable"}` — the previous implementation was removed because it
carried hardcoded SFTP credentials. To re-enable it, reimplement the Scryfall
download and upload in `app/api/magic/download-card-images/route.ts`, reading the
connection details from environment variables. Note also that `getImages.bat` is
a Windows batch file: it drives the two endpoints with `curl`, so it needs a dev
server already running on `http://localhost:3000`, and it does not run as-is on
Linux or macOS.

### Front-page banners

The home-page carousel shows three banners from `public/banners/1.svg`, `2.svg`
and `3.svg`. Unlike card art these **are** committed: they are original
placeholder artwork drawn for this project — abstract card shapes in the app's
own palette, carrying no third-party imagery and so no licensing question. All
three together are about 12 kB.

Being local and same-origin, they need no `NEXT_PUBLIC_IMAGE_HOST` and cannot be
blocked as mixed content when the site is served over https. `next/image` skips
optimisation for any `.svg` source automatically, so they are served as authored.

To use your own, replace the three files. Keep the roughly 3.8:1 aspect ratio
(the viewBox is `0 0 1900 500`) and keep anything important near the centre: the
carousel renders them with `object-fit: cover` at a fixed 500px height, so a
narrow viewport crops the sides away.

## Scheduled jobs

Three endpoints under `app/api/cron/` do the time-based work. They mutate orders
and move funds, so every request must authenticate.

| Endpoint | Schedule | Does |
|---|---|---|
| `/api/cron/cleanup-carts` | hourly — `0 * * * *` | Deletes shopping carts older than 12 hours and returns the reserved items to inventory |
| `/api/cron/pay-orders` | daily 02:15 UTC — `15 2 * * *` | Debits buyer funds for orders still pending payment |
| `/api/cron/auto-mark-delivered` | daily 03:30 UTC — `30 3 * * *` | Marks orders shipped over 30 days ago as delivered and credits the seller |

Set `CRON_SECRET` in `.env` and in the hosting project's environment. Each
request needs an `Authorization: Bearer $CRON_SECRET` header; anything else gets
`401`, and if `CRON_SECRET` is unset the endpoints refuse to run and return
`503`.

```bash
curl -i -H "Authorization: Bearer $CRON_SECRET"   http://localhost:3000/api/cron/cleanup-carts
```

`vercel.json` holds the schedules above. Vercel Cron reads `CRON_SECRET` from the
project environment and sends the header itself, so no further wiring is needed.
Note that the Hobby plan allows two cron jobs at daily granularity — running all
three, with `cleanup-carts` hourly, needs Pro or an external scheduler calling
the URLs with the same header.

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve a production build |
| `pnpm lint` / `pnpm lint:fix` | Run oxlint |
| `pnpm test` | Jest in watch mode |
| `pnpm test:ci` | Jest once, CI mode |
| `pnpm test:cron` | Only the cron endpoint tests (also the pre-commit hook) |
| `pnpm update-images` | Card image update flow (Windows; partly disabled) |
| `pnpm tsx scripts/set-password.ts <email>` | Set a user's password (the password reset — there is no mailer) |
| `pnpm tsx scripts/grant-role.ts <email> <role> [--remove]` | Add or remove a role |

## Testing

- **Unit / component:** Jest with Testing Library, configured in `jest.config.js`.
  Ten suites, 95 tests. Coverage is uneven — the auth layer under
  `__tests__/lib/auth/` and the cron endpoints are covered properly; most
  feature code is not covered at all.
- **End-to-end:** Playwright, configured in `playwright.config.ts`. There is no
  package script, and `webServer`/`baseURL` are commented out, so start the dev
  server yourself and run:

  ```bash
  pnpm exec playwright test
  ```

- **Pre-commit:** husky runs the cron endpoint tests (`pnpm test:cron`).

## Updating

Routine update after pulling changes:

```bash
git pull
pnpm install
pnpm drizzle-kit migrate
```

Refresh the card data whenever MTGJSON publishes a newer dump by repeating
[step 4](#4-import-the-card-data).

To change the database schema, edit the definitions in `src/db/schema/`, then:

```bash
pnpm drizzle-kit generate   # writes a new migration into drizzle/
# review the generated SQL, then:
pnpm drizzle-kit migrate
```

`.gitattributes` pins `*.sql` and `drizzle/meta/*.json` to LF so the drizzle
per-file checksums stay stable across machines — keep it that way.

## Project layout

```
app/            Next.js App Router pages and ~100 API route handlers
app/api/        REST endpoints (inventory, orders, magic, cron, ...)
src/components/ React components, one folder per feature area
src/db/         Drizzle schema, relations and the MySQL pool
src/store/      Zustand stores
src/actions/    Server actions
drizzle/        Migrations, baseline SQL and generated snapshots
messages/       next-intl translation files, one folder per locale
i18n/           next-intl configuration
scripts/        One-off table creation helpers (run with tsx)
__tests__/      Jest tests
tests/          Playwright specs
proxy.ts        Route protection (the Next 16 rename of middleware)
```

## Features

### Seller features

**Inventory management**
- **Card listing** — add cards with condition, language, price and other attributes
- **Bulk import** — CSV import, including Moxfield, ManaBox and an internal format
- **Image management** — upload and manage card images
- **Inventory reports** — track inventory status and updates

**Sales management**
- **Order processing** — view and manage incoming orders
- **Status tracking** — in-cart (reserved), paid, packed, shipped, delivered, cancelled, not-arrived
- **Picking lists** — generate lists for efficient fulfilment
- **Relist items** — return unsold items to inventory

**Financial management**
- **Funds** — track balance from sales
- **Transaction history** — review past transactions
- **Sales statistics** — analyse performance
- **Payment collection** — record incoming payments

**Business profile**
- **Company profile** — manage seller information
- **Shipping settings** — configure options and rates
- **Business settings** — seller-specific preferences

### Buyer features

**Shopping**
- **Card search** — browse and search Magic cards
- **Set browsing** — browse by expansion
- **Product details** — detailed card information
- **Shopping cart** — manage items before purchase
- **Checkout** — complete purchases

**Wishlists & collection**
- **Wishlist creation** — multiple named wishlists
- **Wishlist sharing** — share with other users
- **Import/export** — CSV in and out (see `public/examples/wantslist.csv`)
- **Card collection** — track owned cards

**Purchase management**
- **Status tracking** — unpaid, paid, shipped, delivered, cancelled, not-arrived
- **Purchase history** — review past purchases
- **Purchase statistics** — analyse buying patterns

**Buylist**
- **Buylist access** — see what sellers want to buy
- **Card selling** — sell cards to other users

### Shared features

- **Accounts** — profile, address management, preferences
- **Messaging** — conversations, read status, notifications
- **Help & support** — multilingual help articles, support tickets, bug reports
- **Multi-language UI** — English, German, Spanish, French, Italian
- **Card database** — full Magic: The Gathering card data
- **Statistics** — platform activity and metrics

## Known limitations & security notes

Published as-is, with the rough edges documented rather than hidden. Review these
before deploying anything:

- **Payments are bookkeeping only.** No payment provider is integrated; funds and
  order payment are internal records. New accounts start at a zero balance, so
  funds can only be earned by selling something — which means a fresh account
  cannot complete a checkout until it has.
- **Uploads are stored on local disk** under `public/uploads`, which is ephemeral
  on serverless hosts and does not survive redeploys.
- **The card image pipeline is partly disabled** — see [Card images](#card-images).
- **The MTGJSON import executes a third-party SQL dump verbatim.**
  `app/api/magic/import/route.ts` requires a logged-in session, then streams every
  statement of `importdata/AllPrintings.sql` into MySQL and renames the resulting
  tables. Extracted table names are restricted to `[A-Za-z0-9_]` before being used
  as SQL identifiers, but the dump's own statements are not sandboxed — only import
  files you downloaded from MTGJSON yourself.
- **Roles are a snapshot from login.** The catalogue-maintenance endpoints under
  `app/api/magic/` are now gated on the `Admin` role, but roles are carried in
  the session cookie, so granting or revoking one only takes effect at the
  user's next login. Revoking access to a live session means changing
  `SESSION_SECRET`, which signs everybody out.
- **Registration is open and unverified.** Anyone can create an account with
  any email address; nothing is sent to it and nothing confirms it. There is no
  rate limiting on `/login` either, so a deployment facing the internet wants
  both.
- **No CI.** No workflow is committed; `vercel.json` (cron schedules) is the only
  deployment configuration.
- **Uneven test coverage** — ten Jest suites (95 tests) concentrated on auth and
  the cron endpoints, and an effectively empty Playwright setup. Most feature
  code has no tests.

## Data sources & attribution

This repository contains **no card data and no card imagery**. Both are fetched
at setup time from third parties:

- **Card data:** [MTGJSON](https://mtgjson.com) — the `AllPrintings.sql` dump
  imported in [step 4](#4-import-the-card-data). MTGJSON aggregates and
  normalises Magic card data, and is the reason columns such as `mtgjsonV4Id`
  exist in the schema.
- **Card images:** [Scryfall](https://scryfall.com) — fetched by the image update
  flow described in [Card images](#card-images).

Two sets of images do ship with the repository:

- `public/banners/` — the three home-page banners. Original placeholder artwork
  drawn for this project, with no third-party content in them.
- `public/images/magic/editions/` — expansion-symbol SVGs, included because the
  UI needs them offline. **These are Wizards of the Coast property**; if that is
  a concern for your deployment, replace or remove them.

Magic: The Gathering, all card names, card text, card images and set symbols are
the property of **Wizards of the Coast LLC**. This project is unofficial fan
content. It is not produced, endorsed, supported or affiliated with Wizards of
the Coast, nor with MTGJSON or Scryfall. If you deploy this, review the
[Wizards Fan Content Policy](https://company.wizards.com/en/legal/fancontentpolicy),
the [MTGJSON terms of use](https://mtgjson.com/terms-of-use/) and the Scryfall
guidelines, and respect the Scryfall API rate limits when fetching images.

## AI assistance disclosure

**AI tooling was used in the later stages of this project.** The earlier work was
written by hand. Because the degree of assistance was never tracked at the time,
the honest answer is a range rather than a single number.

**Roughly 65% to 70% of the code was written by hand**, the rest either with AI
assistance or by AI.

This repository is published as a single squashed commit, so the history behind
that estimate is not visible here — it lives in the original private repository.

## License

[MIT](LICENSE) — commercial and non-commercial use, modification and
redistribution are all permitted, provided the copyright notice and license text
are retained. The software is provided without warranty, and the author accepts
no liability for any damage arising from its use.
