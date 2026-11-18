# Preggy Mom Aid design system

This document describes the shared visual language introduced by the visual modernisation work. The implementation lives in the final design-refresh section of `app/globals.css`; keep this document aligned when tokens or component rules change.

## Product feel

- Calm, clinically responsible, welcoming and readable.
- Use white and soft neutral surfaces, muted green for reassurance and deep rose as a restrained accent.
- Avoid gradients as the default surface treatment, ornamental 3D effects, dense card grids and low-contrast pastel text.
- Use spacing and typography to create hierarchy before adding decoration.

## Core tokens

| Token | Purpose |
| --- | --- |
| `--pma-ink` | Primary text |
| `--pma-muted` | Supporting text |
| `--pma-canvas` | Page background |
| `--pma-surface` | Cards and navigation surfaces |
| `--pma-surface-soft` | Quiet grouped sections |
| `--pma-border` | Borders and dividers |
| `--pma-rose` | Primary brand accent |
| `--pma-green` | Secondary action and reassurance |
| `--pma-radius-sm/md/lg` | Shared corner radii |
| `--pma-shadow-card/raised` | Restrained elevation |

Theme, accent, text-size, contrast and motion preferences remain controlled by the existing accessibility-preferences component. The design refresh must not override those preferences.

## Components

- **Navigation:** clear active/hover states, visible keyboard focus, minimum 44px targets and a compact mobile menu.
- **Primary actions:** high-contrast solid fill, rounded shape, concise action labels.
- **Secondary actions:** outlined or quiet surface treatment; never rely on colour alone.
- **Cards:** consistent border, radius, spacing and restrained shadow. Hover movement is subtle and disabled for reduced motion.
- **Forms:** persistent visible labels, clear borders, readable text, focus ring and inline error/status messages.
- **Alerts:** distinguish urgent health guidance from routine notices; never use animation as the only warning.
- **Learning content:** source links and clinical-review status remain visible. Education is not a diagnosis or substitute for care.

## Accessibility

Target WCAG 2.2 AA. Preserve semantic HTML, keyboard access, skip navigation, 44px touch targets, visible focus, zoom/reflow, high-contrast mode and reduced-motion support. Run the Playwright + axe suite for every visual change.

## Imagery policy

Use genuine, consented and appropriately licensed maternal-health photography or commissioned illustration only. Prioritise respectful, locally relevant Nigerian settings and diverse family experiences without stereotyping. Images must have useful alternative text when informative, empty alt text when decorative, responsive sizing, compressed modern formats and documented source/licence details. Do not imply that a pictured person is a patient, clinician, partner or testimonial unless that relationship is verified and permission is documented.
