# Accessibility and personalisation standard

**Target:** WCAG 2.2 Level AA for the public website and authenticated product surfaces.  
**Status:** Engineering baseline in progress. This document is not a claim of conformance or certification; each release requires automated and manual verification.

## Non-negotiable interaction requirements

- Semantic landmarks and a logical heading hierarchy; one clear page-level heading, labelled navigation, and a skip link to the primary content.
- Every action is operable by keyboard, has a visible focus indicator, and uses native controls or correctly implemented accessible patterns.
- Text contrast of at least 4.5:1 for normal text and 3:1 for large text. Essential control boundaries, states and focus indicators must remain distinguishable.
- Pointer targets meet WCAG 2.2 SC 2.5.8 (minimum 24 by 24 CSS pixels, subject to its exceptions). Prefer 44 by 44 CSS pixels for primary touch controls.
- Reflow without two-dimensional scrolling at 320 CSS pixels, except for content that inherently requires it. No information is conveyed by colour alone.
- Respect reduced-motion preferences; avoid autoplay, flashing, time pressure and unexpected context changes.
- Forms have persistent labels, clear instructions, accessible errors, input purpose/autocomplete where appropriate, and success feedback announced to assistive technology.
- Content remains usable at 200% zoom and with text-spacing overrides. Controls must not be obscured by sticky or floating UI.
- Accessible names, roles, values and states are exposed to assistive technology. Decorative images are hidden from assistive technology; informative images have meaningful alternatives.

## User-controlled display preferences

The global Display settings control offers:
- System, light and dark themes.
- Four accent palettes selected for readable contrast with light text on accent surfaces.
- Default, large and extra-large text settings.
- Standard and high contrast.
- System motion preference, reduced motion or motion enabled.
- Comfortable or wider content layout.

Preferences are local to the browser/device at this stage. Do not write them into patient health tables. When account settings are later available, any cross-device preference sync must be a separate, non-clinical profile setting with clear user control.

## Health product safeguards

- Accessibility settings must not change medical meaning, warning severity, treatment content, alert timing or clinical data.
- Colour is never the only way to communicate a warning; pair it with text and an icon/label.
- Do not use motion to signal urgent clinical information.
- Never hide emergency guidance behind menus or preferences.
- Plain language, translations, screen-reader testing and low-bandwidth support are required for a broad public audience.

## Release verification

Automated scans with axe-core are a useful regression check, not proof of WCAG conformance. Test each primary route in desktop and mobile viewports, with keyboard-only use, screen readers, 200% and 400% zoom, high contrast, reduced motion, large text, and forms with empty/invalid/network-failure states. Review every automated finding manually; test with people who use assistive technology.

Minimum route set: home, Learning Centre, login, registration, feedback, and every future patient/professional workflow. Include authenticated and unauthenticated states once account services are enabled.

## Standards references

- W3C, [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/).
- W3C WAI, [Understanding Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- W3C WAI, [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).
