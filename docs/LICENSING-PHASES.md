# Licensing: what exists and what could come later

## Now (implemented)

- The tool is open and account-free. Nothing technical restricts access, and the site says so.
- `/schools` describes a one-school, one-year licence for organised use of the method and materials, with each item marked available or draft, exclusions listed, and the evidence status stated.
- Inquiry is a form that composes an email. Onboarding is manual: conversation, written terms, invoice, delivery of the facilitator guide.
- Price range (USD 750–1,500 per school per year) is carried over from earlier planning and labelled on the page as an untested hypothesis.

What a school is paying for is still an open question. If the free tool builds good judgment on its own, the licence has to offer something more than permission: facilitator materials, onboarding, and the author's support. The page is honest about this; the offer itself still needs sharpening through the first sales conversations.

## Later, only if a pilot shows it is needed

Do not build these ahead of demand. Each adds cost, support load, and privacy surface.

1. **Licensed materials behind a link.** Smallest step: host facilitator materials at an unlisted, per-school URL or send files. No code.
2. **Real accounts for licensed features.** Use an identity provider with email or school SSO (Supabase Auth, Clerk, or similar). Do not revive the name-and-password scheme in `legacy/cloud`: it has no recovery and no verified identity. Keep the account-free tool as it is; accounts add sync, they do not gate the core.
3. **Entitlements.** A server-side table `organisations(id, name, licence_start, licence_end, seats)` and `memberships(user_id, org_id, role)`. Check entitlement on the server (row-level security or an edge function). A check in browser code is decoration, not enforcement.
4. **Organisation separation.** Every stored row carries `org_id` and `user_id`; policies restrict reads to the owner. Teacher working notes stay owner-only. No leader role can read them.
5. **Sharing and aggregates.** Only artifacts a teacher explicitly shares. Aggregates need more than a minimum group size: in a group of six, a distinctive response identifies its author. Do not build a leader dashboard for small cohorts.
6. **Payment.** Invoice by hand until volume justifies Stripe Checkout or Invoicing. Schools usually buy by purchase order, not card.
7. **AI-responsive feedback** (a paid individual tier in earlier planning). Needs an API budget, a server to hold the key, and a clear answer to what AI feedback does that the fixed protocol cannot.

## Before selling anything

See `RIGHTS-AND-OPEN-ISSUES.md`: employment IP position, SAIL provenance, the unverified citation, and written licence terms reviewed by a lawyer.
