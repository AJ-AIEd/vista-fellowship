# Follow-up tasks

Each task is self-contained. Before any of them: `npm ci --ignore-scripts && npm run build && npm test`, then `npm run serve` and `npm run test:browser`. All must pass before and after. Do not change the protected decision logic listed in the README.

1. **Set the inquiry address.** In `js/site-config.js`, set `inquiryEmail` to the address the owner gives you. In `tests/site.cjs`, change the assertion on `#inquiryNote` from `/nothing has been sent/` to `/email app should open/`.
2. **Extend the printable protocol to six stages.** `vista-print.html` covers the audit, routine, and final audit. Add Redesign, Implementation, and Reflection pages using the labels in the `UI` object in `vista.html`. Then update the "Printable protocol" row on `schools.html`.
3. **Spanish public pages.** Create `es/index.html`, `es/schools.html`, `es/method.html`, `es/privacy.html` from the English pages, add a language link in the header, and add the routes to the link check in `tests/site.cjs`. Flag the translation for human review; do not mark it final.
4. **Correct the SAIL reference** once the owner confirms the source (see `RIGHTS-AND-OPEN-ISSUES.md`, items 2 and 3). It appears in `BIBLIOGRAPHY` and in `rebuildRefs` in `vista.html`, and in `cng/proposal.html`.
5. ~~Rename the routine to AI-HTR.~~ Done 2026-11-15. Spanish title "Rutina de Pensamiento IA–Humano" awaits owner approval.
6. **Cross-browser pass.** Run `tests/vista-flow.cjs` and `tests/site.cjs` with Playwright's `firefox` and `webkit`. Fix only what fails.
7. **Translate `data-k-meta` labels.** The Teacher / Department / Assessment / Date labels in the meta bars stay English in Spanish mode. Add keys and apply them in `applyStrings`.
8. **Remove unused code in `vista.html`**: `buildScenarios`, `buildReflection`, `checkReflection`, `buildUploadSubmit`, `handleFiles`, `dragOver`, `dragLeave`, `dropFile`, the `r1`–`r4` reflection group, and their strings. Confirm each has no caller first.
9. **Review the facilitator guide** with the owner and, once approved, change its status on `schools.html` from Draft to Available.
10. **Reduce inline styles** in the AI-HTR builders by moving repeated style strings into classes in `css/tool.css`. No visual change.
