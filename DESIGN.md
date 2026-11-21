# Preggy Mom Aid — Design System

The single source of truth for how every page looks and behaves. Implementation: `app/design-system.css` (tokens + primitives) and `components/ds.tsx` (React helpers). `app/globals.css` now only holds legacy base rules and the display-preference hooks; do not add new page styles there.

## Principles

- **Calm and clinically responsible.** Warm off-white canvas, white panels, deep teal for actions, deep rose as a restrained brand accent. Hierarchy comes from type and spacing, not decoration.
- **One way to do each thing.** Pages compose the primitives below. If a page needs something new, add a primitive here first.
- **Safety is visually distinct.** Urgent guidance uses the danger callout or the urgent button only. Never use red for anything else.
- **Honest content.** No invented facilities, testimonials or capabilities. Clinical-review status stays visible on educational content.
- **Accessible by default.** WCAG 2.2 AA contrast in light, dark and high-contrast modes; 44px minimum targets; visible focus; labels on every field.

### Avoid

Eyebrow/kicker labels above headings, 01/02/03 section numbers, rows of identical icon-heading-text cards, gradient text or gradient surfaces, decorative CSS illustrations, unicode glyphs as icons, thick coloured left borders on callouts, and per-page colour overrides.

## Tokens

All colour is consumed through tokens. Dark mode and high contrast are **token swaps only** (`html[data-theme="dark"]`, `html[data-contrast="high"]`).

| Token | Light | Use |
| --- | --- | --- |
| `--ds-canvas` | `#f7f6f2` | Page background |
| `--ds-surface` | `#ffffff` | Panels, sidebar, inputs |
| `--ds-surface-2` | `#f0efe9` | Quiet areas, segmented controls |
| `--ds-line` / `--ds-line-strong` | `#e3e1d8` / `#8b918a` | Dividers / form-control borders (≥3:1) |
| `--ds-ink` / `--ds-ink-2` | `#1d2b25` / `#4b5a53` | Primary / secondary text |
| `--ds-primary` | `#1f6152` | Primary actions, current nav item |
| `--ds-accent` | `var(--pma-accent)` (rose `#a3475c`) | Links, brand emphasis; follows the user's accent preference |
| `--ds-blush` | `#ee8a9c` | Brand mark background only — never text |
| `--ds-danger` / `success` / `warning` / `info` (+ `-soft`) | | Status colours and their tinted backgrounds |

**Type:** Manrope for headings, DM Sans for everything else. Base 16px (`1rem`); the user's text-size preference scales the root (112.5% / 125%).
Roles: `.ds-display` (landing hero), `.ds-h1-lg` (public section titles), `.ds-h1` (app page titles, 28px), `.ds-h2` (panel titles, 22px), `.ds-h3` (18px), `.ds-lede`, `.ds-small`, `.ds-xs`, `.ds-muted`, `.ds-tabular` (all numbers in readings and dates).

**Space:** 4px base — `--ds-1` (4) through `--ds-24` (96). **Radius:** 8 / 12 / 16 / 24 / pill. **Shadow:** `--ds-shadow-sm` (panels), `--ds-shadow` (raised), `--ds-shadow-lg` (overlays).

## Primitives

| Class | Purpose |
| --- | --- |
| `.ds-page` (`.ds-page-narrow`) | Page content container |
| `PageHeader` (`.ds-page-header`) | Every app page starts with title + lede + optional actions |
| `.ds-panel` (`.ds-panel-quiet`, `.ds-panel-header`) | The only card/container style |
| `.ds-btn` + `-primary` / `-accent` / `-danger` / `-urgent` / `-ghost`, sizes `-sm` / `-lg`, `-block` | All buttons and button-like links. One primary per view |
| `.ds-link` (`-quiet`) | Inline text actions |
| `.ds-form`, `.ds-field`, `.ds-field-row`, `.ds-label` (+ `.ds-optional`), `.ds-input`, `.ds-hint` | Forms. Labels are always visible |
| `ComboBox` (`components/combo-box.tsx`) | **All select fields.** Ported from rapkids-frontend (same props). Search appears automatically for lists longer than 7; supports `id` for labels, `name`/`defaultValue` for plain forms, full keyboard and type-ahead. Never use a native `<select>` |
| `.ds-choice`, `.ds-choice-grid`, `.ds-fieldset` | Checkbox/radio options as large tappable rows |
| `PasswordField` | Password input with show/hide |
| `Callout` (`.ds-callout` + `-danger` / `-success` / `-warning` / `-neutral`) | Inline notices. `danger` is reserved for urgent health guidance |
| `.ds-message-error` / `-success` | Form result messages (`role="alert"` / `role="status"`) |
| `.ds-list`, `.ds-list-item`, `.ds-list-main`, `.ds-list-title`, `.ds-list-meta`, `.ds-list-actions` | Records lists (readings, notes, appointments, documents) |
| `.ds-empty` | Empty states — say what will appear and why |
| `.ds-badge` (+ status variants) | Status and category labels |
| `.ds-segmented` | Small mutually exclusive switches |
| `.ds-disclosure` | Expand/collapse content |
| `.ds-linklist` | Navigational lists with descriptions |
| `.ds-split` (form + list), `.ds-grid-2`, `.ds-grid-3`, `.ds-stack`, `.ds-section` | Layout |

## Brand mark

`components/brand.tsx` is the only logo lockup: the heart-pulse mark on the blush tile plus the wordmark. The favicon (`app/icon.svg`), Apple touch icon and PWA icons are generated from the same mark. Do not reintroduce `public/logo.png` or other marks.

## Layouts

- **Public header and footer** (`components/site-header.tsx`, `components/site-footer.tsx`): one navbar for every public and account page — Learn · Hospital directory · Emergency help · For professionals, then Sign in / Create account. On phones the links collapse into a menu whose button sits at the far right.

- **App shell** (`components/patient-shell.tsx`): every signed-in page. Desktop ≥1024px: grouped sidebar (Your health · Find support · Your account) with language and sign-out at its foot, plus a slim top bar with Feedback and Emergency. Below 1024px: compact top bar (brand, emergency, settings, sign out) and a 5-item bottom nav. `/hospitals` and `/emergency` render a public header for signed-out visitors.
- **Account layout** (`components/auth/auth-layout.tsx`): sign in, sign up, password recovery, feedback, professional verification and 404 — form on one side, photograph on the other (stacked on phones).
- **Public site** (`.ds-site`): landing and Learning Centre — sticky header, full-width bands (`.ds-band`, `-quiet`, `-tint`, `-dark`), ruled feature columns (`.ds-feature`), footer.

## Motion

Calm and purposeful, matching a health product. `components/motion-provider.tsx` sets `html[data-anim="on"]` only when the user's Motion preference and device setting allow it; every animation is scoped to that attribute.

- **Scroll reveal:** add `data-reveal` (and `data-reveal-stagger` for groups) to sections. Only content that starts below the fold is deferred, so nothing is hidden if JavaScript is slow.
- **Signature moment:** the landing hero photo settles in; the brand mark gives a small heartbeat on hover.
- **Micro-interactions:** buttons lift and press, arrows nudge forward, choices pop when selected, messages rise in, the pregnancy progress bar fills. 150–700 ms, ease-out, never looping.
- Do not animate form pages on load or add continuous motion, especially near emergency actions.

## Imagery

Use genuine, appropriately licensed maternal photography with credits; decorative photos get empty `alt`. Prioritise respectful, locally relevant Nigerian settings — the current Unsplash images are placeholders until commissioned or locally sourced photography is available.

## Checks before shipping UI

`npm run check:design` (also run in CI) fails on: native `<select>`, `window.confirm`/`prompt`/`alert`, hard-coded colours in TS/TSX, growth of `app/globals.css`, pages without a shared frame, and logo images outside `Brand`. Mark a justified one-line exception with a `design-system-ignore: <reason>` comment.

1. `npm run typecheck`, `npm run check:design` and `npm run build`.
2. `npm run test:a11y` (Playwright + axe, light/dark/high-contrast).
3. Look at the page at 390px and 1440px in light and dark mode.
