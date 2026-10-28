# Legacy migrations (archived, superseded by `0000_baseline.sql`)

These are the migrations that existed before the migration folder was re-baselined on
2026-10-28. They are kept for history only. **Do not run them and do not add to them** —
`drizzle-kit` ignores this folder, since it only reads `../meta/_journal.json`.

## Why they were archived

The chain was never self-consistent and had never been applied end-to-end by `migrate()`:

- `0000_productive_quasimodo.sql` creates 15 MTG card-data tables under *unprefixed* names
  (`cards`, `sets`, `tokens`, …), whereas the schema in `src/db/schema` — and the live
  database — use the `mtg.`-prefixed names (`mtg.cards`, `mtg.sets`, …).
- None of the 27 application tables (`order`, `orderItem`, `shoppingCart`, `profiledata`, …)
  are created by any migration here.
- `0001_add_original_item.sql` runs `ALTER TABLE orderItem`, but no migration in this folder
  ever creates `orderItem`.
- In `meta/_journal.json`, entries `0001`–`0005` were back-dated (`when` ≈ 1713024850000,
  April 2024) to *before* `0000` (`when` = 1728942870241, October 2024). Drizzle's MySQL
  migrator selects only the single most recent `created_at` from `__drizzle_migrations` and
  applies a migration only when `created_at < folderMillis`, so once `0000` was applied all
  five later migrations would have been skipped permanently.
- Snapshots for `0001`–`0005` were never committed, so `drizzle-kit generate` could only diff
  against `0000_snapshot.json` and treated the entire real schema as new.

The schema these migrations were *trying* to reach is fully represented in the new baseline:
`orderItem.originalItem json` (0001), the multilingual help-centre tables (0002–0004), and
both buylist tables (0005) are all present in `../0000_baseline.sql`.
