# VISTA account integration

## Teacher workflow

Sign in using a unique name and a password of at least eight characters. Create a task cycle, complete the audit, and save reports after the Initial Audit, AHTR, and Final Audit. Reports preserve submitted answers and include a prompt for continuing in NotebookLM, a Gem, or a Project. The final report includes all stages; no AI-generated analysis is invented.

Teachers may paste an entire submission, drop a TXT/Markdown/searchable PDF/DOCX file, upload audio, or record it. Documents are extracted on the device. Whisper downloads model files once and transcribes on the device. Teachers review and correct the resulting text before accepting it. Accepted text and original files are stored privately in Supabase. Limits: 25 MB per file, 100 PDF pages, 20 minutes per recording. Scanned PDFs require a supplied transcript.

## Activation

Supabase project: `kzbcuoqdxlorhgpoeemi`.

Under Authentication → Sign In / Providers → Email, turn off Confirm email. The public settings endpoint now reports `mailer_autoconfirm: true`; activation is confirmed. Names map to internal addresses under `accounts.vista.invalid`; these are not deliverable emails. New accounts are intentionally blocked by the app until confirmation is disabled. There is no email-based password recovery; users are told to keep their password safe.

## Deployment

Run `npm ci`, `npm run build`, and `npm test`. Vercel builds the static `dist` directory. It includes the pinned speech runtime and PDF worker. Only the public Supabase key is in browser code. Database and storage ownership policies protect saved teacher data.

## Validation completed

- Production build succeeds.
- Eight tests cover name normalization, invalid submissions, text preservation, cumulative reports, and safe report markup.
- Live anonymous requests to cycles, reports, and file metadata return 401.
- Database policies exist for private owner access.

## Remaining browser verification

Live two-account tests passed for signup, password login, cycle persistence across sessions, three report stages, private file upload/download, cross-account isolation, and stale-save rejection. Test cycle data and files were removed afterward. Empty test accounts remain. Browser-based verification was blocked by an unavailable admin-policy check. Recording, actual speech transcription, document extraction, and the rendered account workflow still need a browser check.

Supabase's advisor also reports leaked-password protection disabled. Review availability and configuration in [Supabase password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
