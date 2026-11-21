# Preggy Mom Aid — instructions for AI agents and contributors

Maternal-health support platform for pregnant women and mothers in Nigeria. Next.js 15 (App Router), React 19, TypeScript, Supabase (auth, Postgres with RLS, storage), deployed on Vercel. Real product for public use — not a demo.

## Commands

| Task | Command |
| --- | --- |
| Run locally without Supabase (fake backend, TEST ONLY data) | `npm run dev:mock` → http://localhost:3001 · reset with `npm run mock:reset` |
| Run against Supabase | `npm run dev` (needs `.env.local`, see `.env.example`) |
| Type-check | `npm run typecheck` |
| Design-system check | `npm run check:design` |
| Build | `npm run build` |
| Accessibility tests (Playwright + axe) | `npm run test:a11y` |

In demo mode any email signs in as the demo patient; an email starting with `pro` signs in as a demo professional.

## UI work: follow the design system (required)

Read **`DESIGN.md`** before changing any UI. The system lives in `app/design-system.css` (tokens + primitives) and these components:

- **Page frames:** `components/patient-shell.tsx` for signed-in pages, `components/auth/auth-layout.tsx` for account/single-task pages, `components/site-header.tsx` + `site-footer.tsx` for public pages. Do not build new headers, navbars or sidebars.
- **Logo:** `components/brand.tsx` only.
- **Dropdowns:** `ComboBox` from `components/combo-box.tsx`. Never a native `<select>`.
- **Confirmations:** `useConfirmations().openConfirmModal(message, onConfirm, options)` from `contexts/confirmations-provider`. Never `window.confirm`, `prompt` or `alert`.
- **Building blocks:** `PageHeader`, `Callout` (`components/ds.tsx`), `PasswordField`, and the `ds-*` classes (`ds-btn`, `ds-panel`, `ds-field`, `ds-input`, `ds-list`, `ds-badge`, …).
- **Colours:** only design tokens (`var(--ds-*)`) or existing classes. No hard-coded colours in TS/TSX. Dark mode and high contrast must work through tokens alone.
- **New styles** go in `app/design-system.css`. `app/globals.css` is frozen legacy CSS: it may shrink, never grow.
- **Avoid:** eyebrow labels above headings, 01/02/03 numbering, rows of identical icon cards, gradient text, decorative CSS illustrations, unicode glyphs as icons, thick coloured left borders, per-page colour overrides.
- **Motion:** only inside `html[data-anim="on"]` rules; use `data-reveal` for scroll reveals. Keep it calm; no looping motion near emergency actions.
- **Accessibility:** WCAG 2.2 AA in light, dark and high contrast; visible labels; 44px targets; keyboard support; reduced motion.

`npm run check:design` enforces the mechanical rules and runs in CI. A deliberate, justified exception can be marked on its line with a `design-system-ignore: <reason>` comment.

## Product and safety rules (non-negotiable)

- **No fake production data.** Never create fictional patients, readings, appointments, hospitals, professionals, credentials, partnerships or testimonials. Synthetic fixtures must be labelled TEST ONLY and kept out of production.
- **Patient privacy:** records are private by default and enforced with Supabase RLS and server-side checks, not just the UI. Professionals never see patient data without explicit, recorded, revocable patient consent. Professional access requires verification.
- **Clinical safety:** do not diagnose, triage, give unsupported medical advice, claim emergency monitoring, or invent facility capabilities, phone numbers or opening hours. Health content is introductory and awaiting clinical review — keep that status visible.
- **Secrets:** never request, commit or print service-role keys, secret keys, database passwords or tokens. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are client config. Never set `NEXT_PUBLIC_PMA_MOCK` outside local development.
- **Deployment honesty:** a merged PR is not a deployment. Check build, deployment and live behaviour separately, and never claim authentication works without a real signup + email-confirmation test.
- **Schema changes** go through migrations in `supabase/migrations`; no unreviewed direct changes to production data.

## Workflow

1. Inspect existing code first; reuse existing patterns and Supabase clients (`lib/supabase/*`).
2. Work on a feature branch; open a PR against `master`; the project owner reviews and merges.
3. Before finishing: `npm run typecheck`, `npm run check:design`, `npm run build`, `npm run test:a11y`, and look at changed pages at 390px and 1440px in light and dark (`npm run dev:mock`).
4. Commits and PRs are authored by the human maintainer. Do not add AI attribution (no `Co-Authored-By` AI trailers or "Generated with …" footers).
