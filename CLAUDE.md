# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, conversion-focused website for a real estate company ("Meridian Realty" — a **placeholder brand name**, see Rebranding below). No build step, no package manager, no dependencies: plain HTML, one CSS file, and vanilla JS. Open any `.html` file directly in a browser, or serve the folder with any static file host.

## Commands

There is no build/lint/test tooling in this repo (no `package.json`). To preview:

```
# from the repo root
python -m http.server 8000   # or any static file server
```

There is nothing to compile, lint, or run as automated tests — verify changes by opening the affected page(s) in a browser.

## Architecture

**Pages** (each loads `js/analytics.js` then `js/main.js`, plus its own page-specific script where relevant):

| Page | File | Purpose |
|---|---|---|
| Top Page | `index.html` | Hero + CTAs, membership benefits, featured (locked) property teasers, how-it-works, testimonials, FAQ, final CTA band — everything funnels toward registration. |
| Registration Form | `register.html` | Member sign-up form. Validated client-side by `js/register-form.js`. |
| Thank You | `thank-you.html` | Post-registration confirmation; fires GA4 conversion events; `noindex`. |
| Privacy Policy | `privacy.html` | **Placeholder legal copy**, linked from the registration consent checkbox — must be replaced with real, legally-reviewed text before launch. |

**Shared assets:**
- `css/styles.css` — single stylesheet, no framework. Brand colors are CSS custom properties at the top of the file (`--color-navy`, `--color-gold`, etc.).
- `js/analytics.js` — GA4 setup. **The one file to edit when a real GA4 tag is shared.** Loaded first on every page so a single edit here (`GA_MEASUREMENT_ID`) enables tracking site-wide. Until a real ID is set, it deliberately no-ops `gtag()` (logs a console note) instead of sending traffic to a placeholder property. Exposes the global `trackEvent(eventName, params)` helper used by the other scripts.
- `js/main.js` — shared page behavior: mobile nav toggle, FAQ accordion (single-open), and CTA click tracking. CTA tracking is delegated on `document` (not bound per-element at load) so it also covers elements injected later by `js/quick-inquiry.js`. Any element with `data-cta="some_label"` automatically fires a `cta_click` GA4 event on click — no per-button JS needed, just add the attribute in HTML.
- `js/register-form.js` — registration form validation (per-field validators keyed by field id: `fullName`, `email`, `phone`, `password`, `confirmPassword`, `consent`) and submit handling.
- `js/quick-inquiry.js` — **low-friction lead-gen path.** Injects a floating "Ask a Question" button and a modal (name + phone-or-email + optional message, no password) into every page that loads it. Any element with `data-open-inquiry="<context>"` opens the same modal and tags the resulting lead with that context (e.g. `data-open-inquiry="property:maple-heights-482000"` on a property card's "Ask About This Home" button). Added because the full registration form (with a password field) was previously the *only* conversion path — a real barrier for visitors who just want to ask something.

**Conversion funnel & GA4 events already wired up:**

| Event | Fired from | When |
|---|---|---|
| `page_view` | `js/analytics.js` | Every page load, site-wide (explicit tag; GA4's automatic one is disabled via `send_page_view: false` to avoid double-counting). |
| `cta_click` | any `[data-cta]` element (`js/main.js`) | Every CTA click, labeled by which CTA it was. |
| `sign_up` | `js/register-form.js` | Registration form successfully validated & "submitted" (conversion). |
| `generate_lead` | `js/register-form.js`, `js/quick-inquiry.js` | Registration form OR quick-inquiry modal submitted (conversion); `form_name` param distinguishes `member_registration` vs `quick_inquiry`. |
| `quick_inquiry_open` / `quick_inquiry_submit` | `js/quick-inquiry.js` | Quick-inquiry modal opened / submitted, tagged with `context` (which CTA/page triggered it) for funnel analysis. |
| `view_conversion_page` | `thank-you.html` | Page load of the thank-you page. |

`sign_up` and `generate_lead` are the form-submission conversion events. GA4 only counts an event toward "Conversions" once it's marked as a **Key event** in the GA4 Admin UI (Admin → Events → toggle "Mark as key event") — that's a one-time setup step in the GA4 property itself, not something set in code.

**No backend yet for either form.** `js/register-form.js`'s `handleSubmit()` validates the form, then simulates a submit with `setTimeout(...)` and redirects to `thank-you.html`. `js/quick-inquiry.js`'s submit handler does the same but shows an inline success view instead of redirecting. Before launch, both `setTimeout` blocks must be replaced with real `fetch()` calls to a CRM/lead API (or form backend), only showing success on a confirmed response. Pass the quick-inquiry `context` value through to the CRM so agents know what triggered each lead.

**Known placeholder to update before launch:** the click-to-call `tel:+10000000000` links in the headers of `index.html` and `register.html`.

## Rebranding

The current name, navy/gold color scheme, and all copy/testimonials/stats are placeholders standing in for a real brand:
- Company name: search-and-replace `Meridian Realty` across all `.html` files.
- Colors: edit the CSS custom properties at the top of `css/styles.css`.
- Copy, stats, testimonials, FAQ: edit directly in `index.html`.
- Contact details / social links: footer of `index.html`.
- Property photos: `.property__media` currently uses a CSS gradient placeholder — swap in real photos via `background-image` or an `<img>`.
