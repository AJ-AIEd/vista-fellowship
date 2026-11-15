# VISTA product branch: review report

Branch `product/self-guided-licensable`, two commits on top of `main` (`fbf4c3f`). Prepared 2026-11-15 for independent review. Not merged, not deployed. Merging to `main` deploys production on Vercel, so merging is a release decision.

## 1. Implementation and test status

| Area | State | How it was checked |
|---|---|---|
| Login removed; tool opens without an account | Done | Browser test asserts no password field, immediate access |
| Local multi-cycle storage, autosave, conflict refusal, blocked-storage warning | Done | Unit tests (store) + browser tests (two tabs, blocked storage) |
| Backup export/import; hostile file neutralised | Done | Browser test across two browser contexts |
| TXT/DOCX/PDF import on device, no upload | Done | Browser test asserts no non-GET requests |
| Reports: preview, Markdown, print to PDF, EN/ES | Done | Browser test renders a PDF; unit tests check escaping |
| Six stages with carried-forward recaps | Done | Browser test walks all six and reloads |
| All 15 protected pathways and Minimally path | Unchanged logic | `tests/vista-flow.cjs` |
| Public home, schools, method, privacy; CNG pages under `/cng/` | Done | Link check, redirects, 404, three widths |
| AI-HTR rename (this review) | Done | Tests updated and passing |
| Pilot-first pricing on `/schools` (this review) | Done | Test asserts the pilot framing |

Last run, 2026-11-15, local build served with the same clean-URL and redirect rules as `vercel.json`, headless Chromium:

- `npm run build` — succeeds
- `npm test` — 16/16 pass
- `node tests/vista-flow.cjs` — pass
- `node tests/site.cjs` — pass

Not run: Vercel's own build, Safari, Firefox, physical phones, screen readers, the live print dialog (PDF was rendered by the test browser instead).

## 2. Framework alignment

| Element | What the build does | Alignment | Needs approval? |
|---|---|---|---|
| Initial Audit | Original steps, learning types, offloading rating, SAIL choice; prediction recorded before any AI use | Aligned | No |
| Discipline pathways | Unchanged content, now shown in Redesign rather than inside the routine | Coherent with the brief's Redesign stage | Yes: placement |
| AI-HTR | Three moves in the tool: what AI can do, how far to trust it, what happens in your room. The fourth move ("who does what") opens the Redesign stage. Print protocol still has four moves | Partial. The brief puts "make reasoned decisions" inside the AI-HTR | Yes: is the decision part of AI-HTR or of Redesign? |
| Prediction vs observation vs interpretation | Prediction is separate (Initial Audit, updated at the start of the AI-HTR). AI-HTR step 1 asks in one field whether the prediction was right and what AI did, which mixes observation and interpretation. Implementation now asks for observation only; interpretation is left to the Final Audit (fixed in this review) | Mostly aligned; one combined field | Yes, if you want separate observe/interpret fields in AI-HTR step 1 |
| Redesign | Revised SAIL level, task, evidence plan with limits, supports, and the route without AI for students | Aligned. Fields for evidence and supports were added by Fable | Yes: confirm the two added fields |
| Implementation | Readiness checklist (4 items) and post-teaching notes | Aligned with "minimal, meaningful evidence". Checklist and fields were added by Fable | Yes: confirm |
| Final Audit | Original questions 1–6, with a recap of prediction, decision and collected evidence | Aligned | No |
| Reflection and Next Cycle | Original questions 7–9 moved from the Final Audit, plus two new fields: what remains uncertain, next assessment | Coherent, but restructures the original Final Audit and adds fields | Yes |
| Continuity across the cycle | Read-only recaps at each stage; cumulative reports | Aligned | No |
| Teacher agency | No scoring, no AI calls, fixed guidance labelled as such. Decision banners ("Redesign Required") are pre-existing and prescriptive in tone | Aligned, with one tension | Optional: soften banner wording |
| Teachers who choose not to use AI | AI-HTR requires running an AI tool. No alternative route for the teacher. (Students do have a non-AI route.) | Gap | Yes: decide whether there is a teacher route without AI (for example, analysing a provided AI output) |
| SAIL | Five levels map one-to-one onto the published AIAS; not attributed | Gap | Yes: see blockers |
| UNESCO competency baseline | Not merged into the audit; mentioned as separate | Aligned | No |
| Six vs seven stages | Six stages, as the brief requested. Earlier seven-stage design (Exploration, Play/Tinker) not built | Divergence from earlier plan | Yes |
| Worked example | Synthetic, labelled on every view | Risk: read as a model answer | Optional |

## 3. Critical release blockers

These block a public commercial launch. Items 1–4 also argue against merging to `main`, because merging publishes.

1. **SAIL vs AIAS.** The levels mirror the AIAS (Perkins, Furze, Roe & MacVaugh, 2024). The licence statements found disagree (journal: CC BY-ND 4.0; arXiv page: CC BY-NC-SA 4.0; arXiv PDF: CC BY-NC-ND 4.0), and every one restricts either commercial use or derivatives. Attribution and permission are owner and legal decisions.
2. **Unverifiable citation in the published References view.** "Perkins, Roe, Postmil, McGaughran & Hickerson (2024), The SAIL framework…, JUTLP 21(6)" does not match the article at that volume and issue. Correct or remove it.
3. **Employment IP.** Ownership relative to CNG is unverified.
4. **Public school documents.** `public/docs/` serves fellowship proposals and `Journal_Article_Draft.docx` publicly (already true in production). Product pages no longer link to `/cng/`, but the pages and files still exist. To stop serving them, remove `'public'` (and, if wanted, `'cng'`) from the copy list in `scripts/build.mjs`. That changes production, so it is your call.
5. **Inquiry destination.** `js/site-config.js` has no address; the form cannot reach you.
6. **No written terms** for a pilot or a licence.
7. **Supabase project** still holds test accounts; whether any fellow has real data there is unconfirmed. Do not delete it until you have checked.

Lower-priority but should precede launch: Spanish copy review; cross-browser check; the Statistics scenario's single-classroom claim about Flint; trademark search on "VISTA".

## 4. Prioritised fixes

**P0 (before merge)**
- Decide items 1–4 above.
- Set the inquiry address (handoff task 1).
- Review the branch on a Vercel preview, not production.

**P1 (before selling a pilot)**
- Decide AI-HTR boundary, the teacher route without AI, and the Final Audit / Reflection split, then align the print protocol (handoff task 2).
- Correct the SAIL citation (handoff task 4).
- Review Spanish (tool) and decide on Spanish public pages (handoff task 3).
- Cross-browser pass (handoff task 6).
- Facilitator guide review (handoff task 9).
- Draft written pilot terms.

## 5. Changes made in this review (commit 2)

- Routine renamed to AI–Human Thinking Routine (AI-HTR) in the tool, reports, print protocol, public pages and tests. Internal data keys unchanged for saved-cycle compatibility.
- `/schools`: pilot first, licence after; pilot fee stated as unset; licence range labelled a hypothesis; item states changed from "Available" to Built / Partial / Draft / Service / Agreement; time estimate labelled unmeasured; explicit "no accounts, no school workspace, no administrator features".
- `/method`: corrected the AI-HTR description; removed the school's name and the link to `/cng/`.
- Footer links to `/cng/` removed from product pages.
- `/privacy`: analytics disclosure now lists what Vercel actually collects (pages, referrer, approximate country, browser, OS, device; cookieless daily hash), per Vercel's documentation.
- Implementation stage: observation prompt no longer asks for interpretation.
- Docs updated: `RIGHTS-AND-OPEN-ISSUES.md` (AIAS mapping and licence findings), README, ARCHITECTURE, OPUS-HANDOFF.

No framework components were added in this review.
