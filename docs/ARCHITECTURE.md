# Architecture

## Shape

Static site. Vercel runs `npm run build`, which writes `dist/`. No server code, no database, no environment variables.

```
index/schools/method/privacy.html   public pages      css/site.css, js/site.js, js/site-config.js
vista.html                          the tool          inline content + logic, css/tool.css
src/local.js   → assets/local.js    workspace         cycles, autosave, dialogs, backups, reports
src/store.js                        storage logic     pure; storage object injected; unit-tested
src/reports.js                      report building   pure; unit-tested
src/files.js                        document import   pdf.js + mammoth, loaded only on use
src/example.js                      worked example    synthetic cycle, EN and ES
cng/                                fellowship pages  school-specific; not product
legacy/cloud/                       Supabase accounts not built, not deployed
```

`vista.html` remains one large file holding the VISTA content (`STRINGS`, `SCENARIOS`, `PATHWAYS`) and the view builders. Strings added for the product are in one block marked `PRODUCT STRINGS (v3)`; labels for the new stages are in `UI`. Prefer small edits there.

## How the page and the workspace talk

`vista.html` exposes `window.VistaForm` (`capture`, `load`, `lang`, `setLang`, `view`, `show`). `src/local.js` exposes `window.VistaLocal` (`save`, `changed`, `report`, `import`, `openCycles`, `begin`, `resume`, `example`, `nextCycle`, `backup`, `viewChanged`, `languageChanged`). The page calls `VistaLocal` with `?.`, so if the module fails to load the stages still render; nothing is persisted and the save indicator stays empty.

## Storage

`localStorage` keys:

- `vista.v3.index` — `{activeId, cycles:[{id,title,createdAt,updatedAt,rev,example}], legacyImported}`
- `vista.v3.cycle.<id>` — one cycle's responses
- `vista.v3.view.<id>` — last stage viewed, for Resume
- `vista.v3.lang` — interface language
- `dlp_draft_v2` — the single draft from v1/v2. Read once and imported as a cycle; never deleted.

Rules the code enforces:

- Autosave 700 ms after the last change, and on tab hide and page hide. A cycle is created on the first real response, not on page load.
- Each save carries the revision it was based on. If another tab saved in between, the save is refused and the teacher chooses which version to keep. A tab with no unsaved edits follows the other tab.
- If the browser refuses to store (private mode, quota, blocked), a persistent warning appears with a button that downloads the current notes.
- A field that is not on the page at capture time keeps its last saved value.
- Every loaded or imported cycle passes through `sanitizeDraft`, which keeps only known fields with expected types. This matters because a few values (SAIL level, rating, learning types) are placed into page markup.
- Imported backups always create new cycles. Nothing is replaced.

## Data model of a cycle

`meta`, `task`, `learningEvidence`, `humanAI`, `classifier[]`, `rating`, `sail`, `sailJustify`, `light_reflection`, `min_reflection`, `deepdive` (the AI-HTR; the internal key `ahtr`/`deepdive` predates the rename and is kept so saved cycles load; AHTR notes plus `dd4`, `dd4redesign`), `redesign` (`sail`, `evidence`, `supports`), `implementation` (`when`, `ready[]`, `evidence`, `adjustments`), `final_audit` (`fq1`–`fq9`; `fq7`–`fq9` are shown in the Reflection stage), `next` (`uncertain`, `transfer`), `submissions` (reviewed imported text per stage).

Keys from v2 are unchanged, so old drafts and backups load.

## Reports

`reports.js` builds a model from a cycle, then a Markdown text version and a typeset HTML version. The HTML is shown in an iframe and printed with the browser's print dialog (Save as PDF). All teacher text is escaped. Reports are cumulative up to the chosen stage and mark empty fields instead of inferring them.

## Boundaries

| | Where | State |
|---|---|---|
| Public | home, schools, method, privacy | Built |
| Local, account-free | the tool, cycles, backups, reports, document import | Built |
| Licensed materials | `docs/facilitator-guide.md`, delivered by hand | Draft |
| Accounts, organisations, payment | `docs/LICENSING-PHASES.md` | Not built |
| Supabase accounts and file storage | `legacy/cloud/` | Dormant |

## Third parties

The tool and public pages load only Vercel Web Analytics. Fonts are self-hosted from `@fontsource` packages at build time. The routine links out to AI tools; those open in new tabs only when the teacher clicks.
