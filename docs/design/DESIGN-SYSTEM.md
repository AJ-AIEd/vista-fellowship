# Navigating Ambiguity: VISTA design system

## Purpose and visual source

The owner designated the latest AMISA Navigating Ambiguity deck as the visual and philosophical source. The site uses its warm paper, dark ink, sea-blue support and yellow beacon accent. The metaphor expresses orientation amid uncertainty; it does not label teachers by a claimed level of competence.

- Heading: self-hosted Lexend, 500–700; titles 30–58px, working section headings 20–25px.
- Reading and interface: self-hosted Mulish, 400–700; working text 15–18px; phone fields at least 16px.
- Ink `#312603`; sea `#355966`; paper `#FDFCF9`; working background `#F6F3EB`; beacon `#FFC727`; secondary text `#665F50`; rule `#D8D2C4`.
- Yellow signals a primary action, not success or competence. Blue distinguishes context and support. Recorded content is not represented as completed learning.
- Visible focus uses a 3px warm outline. Native buttons, labels, selects, details and dialogs supply semantics. Modal closure returns focus to the launcher.
- Spacing follows 8/12/16/24/32/48px increments. Rules and document sections do most of the grouping; cards are reserved for selection and comparison where useful.

## Layout and interaction

The workspace separates five professional-learning arcs from the six assessment stages within learning design. Four entry points reach one local record: assessment, tool exploration, dilemma and research. Support is a teacher-chosen preference that can change at any time, not inferred adaptation.

Desktop uses a persistent rail and working toolbar. Below 1000px, the rail becomes a native collapsible menu. Fields, comparisons and experimental records stack on phones. Saving feedback remains visible in the menu summary when the compact top bar cannot accommodate it.

Guidance uses progressive disclosure. A teacher can open purpose, an example, a supported decision, source attribution, annotation or comparison without losing their draft. Focus mode changes visibility only; all original questions and saved values remain intact.

## Data and accountability

Existing storage keys and local cycle structure are retained. Optional `learning` fields and exact-passage annotations extend the same cycle and its backups/reports; they do not replace the separate relational evidence database or purport to implement a private research system.

Optional accounts use a lazy-loaded overlay. Guest notes do not upload on sign-in. A teacher explicitly saves a new account copy and imports account copies as new local cycles. This is deliberate copy/restore, not continuous cross-device sync. Account ownership policies are enforced in Supabase. Signing out preserves local work and explains the shared-device implication.

Reports retain teacher wording and mark absent responses. Exploration, model-comparison notes and annotations are included, with HTML escaping. The static field guide gives a purpose, an experience, a source check and a decision—not a list of product capabilities or an implied endorsement.

## Boundaries

The lighthouse does not stand for certainty, an AI assistant or a score. No decorative animation, automatic evaluation, hidden personalization, gamified progress, classroom surveillance, or school administrator dashboard has been added. School archives and documents remain excluded from the build while their source files are preserved.
