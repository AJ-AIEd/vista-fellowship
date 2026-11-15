# VISTA: design research, audit and concept decision

15 November 2026. Implementation review, not an observed teacher usability study.

## The problem being addressed

The imported product made a single assessment cycle its entire organising structure. Its welcome page required substantial reading; help and prior reasoning competed with the current task; the stages used different visual conventions. It did not provide a supported tool-learning route, an exploration record, task annotations, cycle comparison, or an optional account overlay. The production account dependency was inactive when inspected. These are findings from the code, rendered screens, interactions and service status, not claims about how all teachers behave.

The owner subsequently chose the whole VISTA experience, with the assessment tool inside it, and identified the latest AMISA deck as the philosophical and visual reference. The implementation retains the six assessment stages and all 15 protected pathways. The wider journey includes exploration and dialogue before an informed task audit. It does not collapse the methodology into the four-stage overview in a reference brief.

## References: observed pattern, proposed use, limits

The public pages below were read; Brilliant, Notion, Linear and Observable were also opened in a browser. These were public product presentations, not authenticated hands-on evaluations of their full applications. Recommendations in the last two columns are our design decisions.

| Reference | Pattern observed in the source | Pattern used in VISTA | What we did not copy |
|---|---|---|---|
| [Brilliant](https://brilliant.org/) | Its current public presentation describes guided questions, a shared interactive canvas, help on demand and visual progression. | A focused option that reveals one existing section at a time; guidance is available when requested. | Its mascot, branding, gamification, mastery claims, or AI tutor. |
| [Notion](https://www.notion.com/product) | Its public workspace examples combine documents, context and persistent navigation. | A durable inquiry record and calm reading surface. | Databases, agents, team permissions, or branding we have not implemented. |
| [Linear](https://linear.app/) | Its public product example distinguishes workspace navigation, projects, properties and activity. | Separate navigation for the wider journey, the current assessment cycle and contextual support. | Issue-tracker language, productivity metrics, dark effects or agent workflows. |
| [Observable](https://observablehq.com/) | It describes notebooks that place explanations, representations and working outputs together. | Original/revised tasks and the teacher's interpretation remain adjacent; reports preserve a cumulative record. | A code notebook runtime or its computational architecture. |
| [Hypothesis](https://web.hypothes.is/) | Its public description places comments and highlights directly over source material. | Notes attach to an exact passage from the teacher's task. | Its social network, LMS integrations, outcome claims or proprietary interface. |
| [Project Zero](https://pz.harvard.edu/thinking-routines) | Its library organises short thinking routines by purpose and subject, with documentation of thinking. | Purposeful support and a return to previous thinking. | Its published routines as VISTA-owned methodology, or an assertion that they validate this product. |

## Open-source compatibility and licenses

No interface implementation was copied from these projects, and no React/Tailwind migration was made.

| Source | License evidence | Architecture assessment and decision |
|---|---|---|
| [shadcn blocks](https://ui.shadcn.com/blocks), [sidebars](https://ui.shadcn.com/blocks/sidebar) | [MIT license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md). | React components. Useful hierarchy and disclosure references; importing them would require a new runtime and component migration. Native HTML provides the needed controls here. |
| [React Form Wizard](https://github.com/parsajiravand/react-form-wizard) | Repository identifies an MIT license. | React-specific. Its step navigation is relevant; mandatory wizard validation would conflict with revisiting uncertain judgments. Implemented optional focus with existing DOM/fields. |
| [Seminar](https://github.com/tailthemes/seminar) | Repository identifies MIT licensing; separately licensed fonts. | Next.js/React plus a distinct static HTML edition. The lesson/work-in-progress distinction is useful; VISTA is not a course completion system. No dependency imported. |
| [Foundry](https://github.com/tailthemes/foundry) | [MIT license](https://github.com/tailthemes/foundry/blob/main/LICENSE), with separate font licenses. | Next.js/React and a separate static edition. Token coherence is relevant, but agency/portfolio content and migration costs are unsuitable. No code imported. |

New Lexend and Mulish font files are self-hosted; their SIL Open Font License notices are shipped with the fonts. The lighthouse SVG is original code, not extracted slide artwork. Third-party bundle legal comments are retained in linked notices.

## Three functional concepts

All concepts operate on the actual local workspace and labelled synthetic example. They are available through `/prototypes`; editing, saving, reports and language switching use the real application. The comparison below is heuristic design review, not measured user performance.

| Criterion | A: Guided Inquiry Studio | B: Teacher Research Notebook | C: Professional Learning Workspace |
|---|---|---|---|
| First-time use | Smallest immediate decision; one section at a time. | Clear record metaphor, but substantial scrolling. | Four starting points and persistent orientation. |
| Cognitive load | Lower visible load; more section transitions. | More simultaneous information. | Moderate; support is optional and grouped. |
| Previous reasoning | Recaps and examples available, but context can sit outside focus. | All stages visible in one editable document. | Relevant recaps, task comparison and cumulative reports. |
| Professional credibility | Focused working environment. | Strong sense of a professional record. | Strongest fit for the wider fellowship and school use. |
| Accessibility | Native buttons, focus transitions and a clear section counter. | Long document needs deliberate navigation. | Native navigation and disclosure; mobile menu required refinement. |
| Mobile | Manageable current section; additional navigation. | Longest scroll. | Collapsible navigation; layouts stack and support opens on demand. |
| Maintenance | Shared fields/storage; optional visibility controller. | Shared fields/storage; document presentation. | Shared fields/storage plus small support and account modules. |
| Methodology | All questions remain; no mandatory conclusion. | Preserves the complete six-stage record. | Five wider arcs contain the protected assessment workflow. |
| Complexity | Medium. | Low presentation cost, higher reading/navigation burden. | Medium; best extensibility without a framework rewrite. |

**Decision:** use C as the integrated experience, offer A as a reversible support preference, and retain B's cumulative-record strengths in reports and comparisons. This combines functions deliberately; it does not mix three visual brands.

## Changes made after visual and interaction review

- Tool comparison originally exposed too many fields. It now opens as an optional subsection.
- The mobile support selector had a hidden label; it now has an explicit accessible name.
- Warm-paper footers inherited white text. Contrast was corrected across public pages.
- Modal focus initially returned to the body during asynchronous account loading. It now returns to the account launcher.
- Notebook navigation now scrolls to the requested stage rather than returning to the top.
- Synthetic example notices remain visible on phones without being hidden behind the fixed header.
- SAIL is explained at the point of choice, with a verified AIAS citation. The incorrect prior reference was replaced.

## Decisions and limitations

The AMISA seven-part fellowship description, later five-arc model and six-stage assessment tool are treated as different levels of organisation. No protected pathway or assessment prompt was rewritten. The AI-HTR boundary, exact official adoption of AIAS wording, and rights/employment-IP questions remain owner decisions.

The AIAS journal article lists a NoDerivatives license; the official framework site describes non-commercial use. Attribution is implemented but is not evidence of permission to commercialise a local adaptation. See [the original article](https://doi.org/10.53761/q3azde36) and [the current official framework](https://aiassessmentscale.com/). No external party was contacted.

The new experience has not been tested by an independent teacher. No claim is made that a demo occurred, a teacher became more independent, or student learning improved. A facilitated try-out followed by an independent try-out is the next validation step.
