# VISTA Fellowship — CNG AI Innovation Fellowship 2026–2027

Static website and assessment-design tool for the CNG AI Innovation Fellowship.

Andrew Cajina · High School Mathematics · Colegio Nueva Granada · Bogotá, Colombia

## Production

- Live site: https://v2-vista-fellowship.vercel.app
- GitHub: `AJ-AIEd/vista-fellowship`
- Production branch: `main`
- Vercel project: `v2-vista-fellowship`

Do not deploy this repository to the old `vista-fellowship` Vercel project. Its root-directory configuration is broken.

## Routes

| URL | File | Audience |
|---|---|---|
| `/` | `index.html` | Launch page |
| `/teacher-hub` | `teacher-hub.html` | Fellowship teachers |
| `/vista` | `vista.html` | Interactive VISTA protocol |
| `/vista-print` | `vista-print.html` | Printable protocol |
| `/proposal` | `proposal.html` | Administrators and reviewers |
| `/es` | `es.html` | Spanish proposal |
| `/launch` | Redirects to `/` | Legacy route |

`vercel.json` enables clean URLs, so `/vista` serves `vista.html`.

## Technology

- Static HTML, CSS, and vanilla JavaScript
- No framework and no build step
- Shared design tokens in `css/shared.css`
- Page-specific CSS and JavaScript remain inline
- Google Fonts: Fraunces, DM Sans, and DM Mono
- Vercel Web Analytics script on public pages

## VISTA workflow

The interactive tool has four views:

1. Initial Audit — describe a task, classify learning vulnerability, rate cognitive offloading, choose a SAIL level, and record a final flag.
2. Augmented Human Thinking Routine — four teacher-first moves for testing the task with AI and recording a redesign decision.
3. Final Audit — nine reflection questions completed after enactment.
4. References — bibliography grouped by research area.

### Protected decision engine

Do not casually refactor or restyle:

- Initial Audit vulnerability cards
- Cognitive Offloading ratings and decision banners
- Discipline-specific redesign pathways
- The Minimally-rated reflection/exemplar path
- Classifier/rating/pathway coupling

Changes to those areas require explicit scope and regression testing.

## Draft storage and privacy

Drafts are stored only in the current browser under:

```text
dlp_draft_v2
```

There is no backend, login, database, or shared Knowledge Hub submission. The Save buttons write one draft to localStorage on the current device. Clearing browser data removes it.

Uploaded PDFs are not transmitted or persisted. Teachers should not select documents that identify individual students.

If shared submission is added later, define authentication, permissions, retention, deletion, and student-data governance before implementation.

## Documents

Downloadable proposal files live in `public/docs/`. The current public proposal is:

```text
public/docs/CNG_Fellowship_Proposal_v9.docx
```

## Deployment workflow

Work directly on `main` for the current project workflow:

```bash
git add -A
git commit -m "Describe the change"
git push
npx vercel --prod
```

Before accepting the deployment, confirm the CLI reports:

```text
Deploying aj-aieds-projects/v2-vista-fellowship
```

Production must alias to:

```text
https://v2-vista-fellowship.vercel.app
```

## Verification checklist

- All primary routes return HTTP 200.
- `/launch` redirects to `/`.
- Teacher Hub proposal link opens the current PDF.
- VISTA keyboard controls work with Enter and Space.
- Initial Audit task and SAIL level appear correctly in AHTR.
- Saved drafts restore Initial Audit, AHTR, and Final Audit fields.
- Page layouts do not create document-level horizontal overflow at phone width.
- Browser console contains no errors.

## Current architecture constraint

`vista.html` is a large single-file application. Prefer small, targeted edits. Extract content or configuration only when protected pathway behavior is covered by tests.
