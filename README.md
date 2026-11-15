# VISTA — Visibility Into Student Thinking and Agency

A self-guided professional-learning tool for auditing and redesigning assessment in AI-rich classrooms, with a public site for teachers and schools. Author: Andrew Cajina.

- Production: https://v2-vista-fellowship.vercel.app (Vercel project `v2-vista-fellowship`). Do not deploy to the old `vista-fellowship` project.
- Production branch: `main`. Work on feature branches and review a Vercel preview before merging.

## What is in the site

| URL | File | Purpose |
|---|---|---|
| `/` | `index.html` | Public home |
| `/schools` | `schools.html` | School offer, licence, evidence status, inquiry form |
| `/method` | `method.html` | The methodology and its limits |
| `/privacy` | `privacy.html` | What is stored and where |
| `/vista` | `vista.html` | The tool: six stages, account-free |
| `/vista-print` | `vista-print.html` | Blank printable protocol (audit, routine, final audit only) |
| `/cng/…` | `cng/*.html` | CNG fellowship pages, kept as a record. Not part of the product. Old URLs redirect here. |

## The tool

Six stages: Initial Audit → AI–Human Thinking Routine (AI-HTR) → Redesign → Implementation → Final Audit → Reflection and Next Cycle. English and Spanish.

There is no login and no backend. Cycles are stored in the browser's `localStorage`; teachers can keep several cycles, export and import backup files, and print or save reports as PDF. See `docs/ARCHITECTURE.md`.

### Protected decision logic

Do not casually change: the learning-type cards, the offloading ratings and decision banners, the discipline pathways (`PATHWAYS`), the Minimally-rated reflection path, and how classifier, rating, and pathways are coupled. `tests/vista-flow.cjs` covers all 15 pathways and must keep passing.

## Develop

```bash
npm ci --ignore-scripts
npm run build        # bundles src/ into assets/ and writes dist/
npm test             # unit tests: storage, reports, imports
npm run serve        # serves dist/ on http://127.0.0.1:8765 with clean URLs and redirects
npm run test:browser # in another terminal; needs Playwright with Chromium
```

Set `VISTA_URL` to run the browser tests against a deployment and `VISTA_SHOTS` to choose where screenshots go.

## Before going live

1. Set `inquiryEmail` in `js/site-config.js`. Until then the inquiry form shows the message for copying and says nothing was sent.
2. Read `docs/RIGHTS-AND-OPEN-ISSUES.md`. Several items need the owner's decision before any commercial use.

## Documents

- `docs/ARCHITECTURE.md` — how the tool is put together and where the boundaries are
- `docs/LICENSING-PHASES.md` — the current offer and how access control, organisations, and payment could be added later
- `docs/RIGHTS-AND-OPEN-ISSUES.md` — ownership, citation, privacy, and unverified items
- `docs/facilitator-guide.md` — draft guide for licensed schools (not published on the site)
- `docs/OPUS-HANDOFF.md` — routine follow-up tasks
- `docs/REVIEW.md` — independent-review report: test status, framework alignment, release blockers, decisions
- `docs/research-quote-provenance.md` — sources of the two quotations in the tool
- `legacy/cloud/` — the earlier Supabase account integration, not built or deployed

## Independent quality review

See `docs/QUALITY-PASS.md` for verified changes, limitations, and owner decisions. Product builds preserve but exclude `cng/` and `public/` from deployment output.

Run `npx playwright install chromium firefox webkit` once for browser checks. `npm run test:a11y` scans public pages and teacher stages at three widths. `VISTA_ENGINE=firefox node tests/vista-flow.cjs` (or `webkit`) checks the protected pathways and six-stage flow; the full PDF suite uses Chromium.
