# VISTA account integration

## Teacher workflow

Sign in using a unique name and a password of at least eight characters. Create a task cycle, complete the audit, and save reports after the Initial Audit, AHTR, and Final Audit. Reports preserve submitted answers and include a prompt for continuing in NotebookLM, a Gem, or a Project. The final report includes all stages; no AI-generated analysis is invented.

Teachers may paste an entire submission, drop a TXT/Markdown/searchable PDF/DOCX file, upload audio, or record it. Documents are extracted on the device. Whisper downloads model files once and transcribes on the device. Teachers review and correct the resulting text before accepting it. Accepted text and original files are stored privately in Supabase. Limits: 25 MB per file, 100 PDF pages, 20 minutes per recording. Scanned PDFs require a supplied transcript.

## Activation still required

Supabase project: `kzbcuoqdxlorhgpoeemi`.

Under Authentication → Sign In / Providers → Email, turn off Confirm email. The public settings endpoint still reports `mailer_autoconfirm: false` as of this check. Names map to internal addresses under `accounts.vista.invalid`; these are not deliverable emails. New accounts are intentionally blocked by the app until confirmation is disabled. There is no email-based password recovery; users are told to keep their password safe.

## Deployment

Run `npm ci`, `npm run build`, and `npm test`. Vercel builds the static `dist` directory. It includes the pinned speech runtime and PDF worker. Only the public Supabase key is in browser code. Database and storage ownership policies protect saved teacher data.

## Validation completed

- Production build succeeds.
- Eight tests cover name normalization, invalid submissions, text preservation, cumulative reports, and safe report markup.
- Live anonymous requests to cycles, reports, and file metadata return 401.
- Database policies exist for private owner access.

## Required release verification

Create two test accounts after activation. Verify sign-in, reload, sign-out, separate cycles, independent account access, three saved reports, report downloads, document upload, audio transcription and transcript correction. Verify that each account cannot read or overwrite the other's records or files, and that stale saves are rejected. Browser-based verification was blocked by an unavailable admin-policy check, so these flows are not yet confirmed.

Supabase's advisor also reports leaked-password protection disabled. Review availability and configuration in [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
