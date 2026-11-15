# Legacy: Supabase accounts (not built, not deployed)

This folder holds the account integration added in September 2026: name-and-password sign-in, cloud-saved cycles, private file storage, and on-device audio transcription. It was removed from the product in v3 because the login blocked the tool and the product is now account-free.

Nothing here is bundled by `scripts/build.mjs`. Its dependencies (`@supabase/supabase-js`, `@huggingface/transformers`) were removed from `package.json`. `cloud.js` expects the page structure of the September version of `vista.html` and will not run against the current one.

Kept for reference: the database migration and row-level policies, `live-account.mjs` (which creates real accounts in the Supabase project when run), and `account-integration.md`. Note that `files.js` here calls `pdf.destroy()`, which fails with the pinned pdf.js; the current `src/files.js` fixes that.

If accounts return, start from `docs/LICENSING-PHASES.md` rather than from this code.
