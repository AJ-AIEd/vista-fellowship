# Rights, ownership, and open issues

These need the owner's decision. None is resolved by the code.

## Ownership and licensing

1. **Employment IP.** VISTA has been developed by a teacher employed at CNG and used in a CNG fellowship. Whether the school has any claim depends on the employment contract and school policy. Check before any commercial agreement.
2. **SAIL and the AI Assessment Scale.** VISTA's five levels (No AI, Ideate, Edit, Evaluate, Co-Create) map one-to-one onto the original AIAS (Perkins, Furze, Roe & MacVaugh, 2024): No AI; AI-Assisted Idea Generation and Structuring; AI-Assisted Editing; AI Task Completion, Human Evaluation; Full AI. The product does not currently attribute this. Three published licence statements were found and they disagree: the JUTLP article page lists CC BY-ND 4.0; the arXiv abstract page lists CC BY-NC-SA 4.0; the arXiv PDF text states CC BY-NC-ND 4.0. Every one of these restricts either commercial use or derivatives, and none clearly covers the scale separately from the article. Before commercial use, decide: (a) whether SAIL is an adaptation of AIAS, a CNG adaptation of it, or independently derived; (b) how to attribute it; (c) whether to seek permission from the AIAS authors. Not resolvable in code.
3. **A citation that could not be verified.** The tool's references and the CNG proposal cite "Perkins, M., Roe, J., Postmil, D., McGaughran, J., & Hickerson, A. (2024). The SAIL framework…" in *JUTLP 21*(6). The article found at that volume and issue is the AIAS paper above, with different authors and title. The entry was left unchanged pending the owner's check; it should be corrected or removed before publication.
4. **CNG materials.** The fellowship pages now live under `/cng/` with a notice and `noindex`. As of 2026-11-15 no product page links to them, and the method page no longer names the school. `public/docs/` still serves fellowship proposals and `Journal_Article_Draft.docx` at public URLs (only the v9 proposal is linked). Decide whether an unpublished article draft should be publicly downloadable.
5. **Scenario content.** One built-in example (Statistics) refers to a CNG project and says that "in classroom trials, many students chose Flint". That is an observation from one classroom. It is shown under a note that the examples are illustrative, but consider rewording.
6. **Licence terms.** `/schools` summarises an offer. It is not a contract. Written terms need legal review.
7. **Trademark.** "VISTA" is a common name in education and software. No search was done.

## Framework decisions left open

- **Six stages or seven.** This build implements the six-stage cycle requested for it. Earlier planning used seven, with Human-Centered Exploration and Play/Tinker before the audit. The Start view has an optional "New to generative AI?" note, which is not a substitute for those stages.
- **Routine name.** Renamed to "AI–Human Thinking Routine (AI-HTR)" on 2026-11-15 in the tool, reports, print protocol, and public pages. `/cng/` pages keep the old name as a historical record. The Spanish title "Rutina de Pensamiento IA–Humano" is a proposal awaiting approval.
- **Spanish.** The tool is fully bilingual. New Spanish text was written for this build and has not been reviewed by a second Spanish-speaking educator. Public pages are English only.

## Privacy and security

- Teacher data never leaves the browser. The trade-off is fragility: clearing site data, private windows, or browser eviction removes it. The tool warns and offers backups, but cannot prevent loss.
- Backup files are plain JSON. Anyone with the file can read it.
- Vercel Web Analytics remains on every page. It is cookieless but is still a third party; disclosed on `/privacy`.
- The Supabase project referenced in `legacy/cloud/config.js` still exists. Its publishable key is in the repository history (that key is designed to be public; access depends on the row-level policies). Test accounts were left in it. If nobody uses it, pause or delete the project.
- Production was still serving the older local-only version when this work was done, so it is unlikely that fellowship teachers have data in Supabase. This was not confirmed with them.

## Not verified

- No deployment was made. Everything was tested against a local build served with the same clean-URL and redirect rules as `vercel.json`. The Vercel build itself was not run.
- Tested in headless Chromium only. Not tested in Safari, Firefox, or on a physical phone.
- No screen-reader test. Keyboard access and accessible names were checked by script.
- The print dialog itself cannot be automated; the report document was rendered to PDF by the test browser instead.
- Audio transcription from the account version was removed from the product, not tested.
