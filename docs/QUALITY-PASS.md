# Independent quality pass — 15 November 2026

This is an implementation and verification checkpoint, not commercial release approval.

## Verified handoff

The unnumbered Downloads bundle was older. Both numbered copies matched SHA-256 `68c6ae2bc56de68d9052db9c44ae16077a8c63bd6898c5f54374479dac4e881c`.
A fresh GitHub clone supplied prerequisite `fbf4c3f60a94139a0fe3e1e7e7b4ddd3388d1247`. Bundle verification and Git integrity checks passed. Imported history: `8012cbf9e2da447958fea04ae99f83bd31a4605f`, then `083c462209847d8fccb1f4209b6b8c009fceb5e0`. The imported branch remains intact locally; quality changes are on `quality/product-experience`.

Read: attached review and PR description, `docs/REVIEW.md`, `docs/OPUS-HANDOFF.md`, README, build/server scripts, storage and workspace implementation, existing browser suites.

## Problems addressed

- Failed saving did not stop a new cycle or worked example from replacing unsaved text. Cycle changes now stop when saving fails; the rescue download remains available. Browser regression checks reproduce blocked-storage navigation.
- Spanish mode left metadata labels and placeholders in English. Both now switch language; persisted field names remain unchanged.
- Phone fields were small, learning-type cards cramped, and placeholders faint. Working fields now use 16px text on phones, cards use one column, and key secondary controls have 44px minimum height.
- Automated scans found low-contrast secondary text, accents, and learning-type tags. Text accents now distinguish light and dark surfaces.
- Pathway tabs lacked a tablist parent. They now expose their group and support arrow, Home, and End navigation.
- Browser suites required an undeclared Playwright dependency. Tooling is now pinned and pathway checks can select Firefox or WebKit through `VISTA_ENGINE`.
- Screenshots could capture entrance animations mid-frame. Full-page evidence disables animations for stable comparison; this is a test-capture correction, not a product improvement.
- Product builds copied school archives and documents into public output. They now omit `cng/` and `public/`, preserving all source files and legacy redirect definitions. Legacy school destinations return 404 in this branch. Production has not been changed.

## Design direction

Retain the existing navy, teal, warm paper, serif headings, and restrained monospace labels. Improve reading and interaction before adding decoration. Muted instructional text must meet normal-text contrast. Phone working text uses a minimum 16px size in fields; selected state, visible focus, and carried-forward responses remain distinct. No pathway content, rating logic, or assessment decisions are changed.

## Verification scope

Baseline: build passed; 16/16 unit tests passed; both Chromium browser suites passed. Pathway/six-stage suite also passed in Firefox and WebKit. Chromium covers cycles, backups, hostile imports, TXT/DOCX/PDF import, reports, two-tab conflicts, legacy recovery, blocked storage, Spanish persistence, keyboard controls, public links and responsive widths.

Final Chromium functional suites and all 16 unit tests passed after the fixes. All 33 automated WCAG scans passed with no violations for the sampled states.

Accessibility script scans four public pages plus launch and all six stages at 390, 768, and 1280px (33 scans). Its results supplement manual review and do not certify accessibility. Screenshots are captured with synthetic content only.

Not yet verified: physical phones; Safari application; screen readers; live print dialogs; user-observed onboarding time; Spanish linguistic review; actual pilot uptake. Full storage/import/report suite remains Chromium-only because its PDF fixture generation and PDF export use Chromium-specific APIs. Firefox/WebKit checks cover pathways and six-stage flow.

## Owner decisions and remaining work

1. Resolve AI-HTR move four and stage boundaries, observation/interpretation separation, Final Audit/Reflection split, added fields, and six versus earlier seven-stage design. Preserve the present implementation pending decisions.
2. Decide a teacher route without personal AI-tool use; prepared AI output needs a clearly labelled provenance and task fit. No synthetic response should be represented as actual model evidence.
3. Resolve SAIL/AIAS attribution, source and commercial reuse, CNG employment IP, school archive publication, and legacy cloud data governance. No cloud data was inspected or deleted.
4. Supply an inquiry destination and approve pilot terms; current form explicitly says nothing is sent.
5. Align the blank printable protocol with the agreed methodology; it currently covers only audit, routine and final audit. Generated cycle reports already include six stages.
6. Continue first-time journey review with teachers, report/page-break inspection, public-page Spanish, and further failure-mode testing (partial storage writes, corrupted local index, import capacity). Existing green tests do not establish that every storage failure is recoverable.

Do not merge this branch or promote a preview to production until release decisions are made.

## Second iteration: introduction and reasoning record

The start page now uses the working environment's paper/ink palette and a task-first heading. The six stages are grouped before/during/after teaching. Preparation, output, saving, and external AI access are explained before beginning. New English and Spanish copy is implemented; Spanish still needs human linguistic review. Mobile preparation content stacks vertically, and the main action uses the full available width.

Keyboard-triggered stage changes move focus into the destination heading/header. A browser assertion checks that the new stage owns focus after continuing.

Reports now place selected teacher responses before the full stage record: prediction, AI-trial observation, redesign decision, implementation evidence, interpretation of evidence, and uncertainty. These are verbatim fields, not generated summaries. Empty statements are omitted from the selected-response section while remaining marked in the full record. A regression test ensures reports ending at Initial Audit do not include a revised SAIL level or later-stage statements.

Verified: build, 17 unit tests, both Chromium browser suites, and all 33 accessibility scans pass. The synthetic full-cycle PDF has seven A4 pages; every page was rendered and visually inspected with no clipping found. This does not establish behavior for every possible teacher response length. The selected-response section adds length intentionally; the complete record is retained.

The first desktop/mobile review prompted a second layout correction: preparation columns now stack on phones, and the primary action spans the width. The original Fable/Opus branch is untouched.
