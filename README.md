# Meridian Realty — Website (Placeholder Brand)

A simple, static, conversion-focused website for a real estate company. No
build step, no dependencies — just HTML, CSS, and vanilla JS. Open
`index.html` in a browser, or serve the folder with any static file host.

## Pages

| Page | File | Purpose |
|---|---|---|
| Top Page | `index.html` | Hero + CTAs, membership benefits, featured (locked) property teasers, how-it-works, testimonials, FAQ, final CTA band — everything funnels toward registration **or** the low-friction quick-inquiry path. |
| Registration Form | `register.html` | Member sign-up form (name, email, phone, area, budget, password, consent). Client-side validated in `js/register-form.js`. Also offers the quick-inquiry alternative for visitors not ready to create an account. |
| Thank You | `thank-you.html` | Post-registration confirmation page. Fires the GA4 conversion events. `noindex` so it doesn't get indexed by search engines. |
| Privacy Policy | `privacy.html` | **Placeholder legal copy** — linked from the registration consent checkbox and the quick-inquiry modal. Replace with real, legally-reviewed text before launch. |

## Lead-generation / "more inquiries" features

The original site only had one conversion path: the full membership
registration form (with a password). That's a real barrier for visitors
who just want to ask a question. The following were added to capture more
of that demand:

- **Floating "Ask a Question" button** (`js/quick-inquiry.js`) — visible on
  every page, bottom-right, at all times (including while scrolling).
  Opens a lightweight modal.
- **Quick Inquiry modal** — no password, no account. Just name + (phone
  or email) + an optional message. Any element with
  `data-open-inquiry="<context>"` opens it and tags the lead with where it
  came from (e.g. `property:maple-heights-482000`, `hero`, `faq`,
  `final_cta`, `footer`, `register_page`, `fab`). Still links out to full
  registration for visitors who do want an account.
- **Per-property "Ask About This Home" buttons** on each featured listing
  card on the homepage — captures interest in a *specific* property
  instead of forcing a generic sign-up.
- **Click-to-call "Call Now" button** in the header on `index.html` and
  `register.html` — an immediate channel for visitors who'd rather talk
  than fill out a form. Update the `tel:` number (currently a placeholder,
  `+10000000000`) before launch.
- **Secondary "just ask a question" links** next to the hero CTAs, in the
  FAQ answer about agents, on the final CTA band, in the footer, and next
  to the registration form — so the full-registration form is never the
  *only* option on the page.
- **Mobile header bug fix** — the header's primary "Register Free" button
  (and the new "Call Now" button) used to be hidden entirely on small
  screens (`display: none`); they now shrink to fit instead, so mobile
  visitors — likely a majority of traffic — aren't silently dropped from
  the funnel.

## Structure

```
index.html
register.html
thank-you.html
privacy.html
css/styles.css          shared styles (single stylesheet, no framework)
js/analytics.js         GA4 setup — the ONLY file to edit when the GA4 tag is shared
js/main.js              shared behavior: mobile nav, FAQ accordion, CTA click tracking
js/register-form.js     registration form validation + submit handling
js/quick-inquiry.js     floating button + low-friction inquiry modal (site-wide)
```

## Setting up Google Analytics 4

You mentioned the GA4 tag will be shared later — here's the one-line change
needed when it arrives:

1. Open `js/analytics.js`.
2. Replace the placeholder on this line with the real Measurement ID:
   ```js
   const GA_MEASUREMENT_ID = "G-XXXXXXXXXX";
   ```
3. That's it. Every page (`index.html`, `register.html`, `thank-you.html`,
   `privacy.html`) already loads `js/analytics.js` first, so tracking goes
   live everywhere at once — no per-page edits needed.

Until a real ID is set, `js/analytics.js` intentionally **skips loading**
`gtag.js` (you'll see a note in the browser console) so no traffic is sent
to a placeholder property.

### Events already wired up (for conversion tracking in GA4)

| Event | Fired from | When |
|---|---|---|
| `cta_click` | any element with `data-cta="..."` (see `js/main.js`) | Every registration/browse/inquiry button click, labeled by which CTA it was (`hero_register`, `properties_unlock`, `final_cta_register`, `fab_quick_inquiry`, `property_ask_maple_heights`, etc.) — useful for comparing which CTA converts best. |
| `sign_up` | `js/register-form.js` | Registration form successfully validated & "submitted". |
| `generate_lead` | `js/register-form.js`, `js/quick-inquiry.js` | Registration form **or** the quick-inquiry modal successfully submitted — fires with `form_name: "member_registration"` or `form_name: "quick_inquiry"` respectively, so both lead sources roll up into the same GA4 lead metric while staying distinguishable by `form_name`. |
| `quick_inquiry_open` | `js/quick-inquiry.js` | Quick-inquiry modal opened, tagged with `context` (which button/page opened it) — good for measuring interest even before a lead is captured. |
| `quick_inquiry_submit` | `js/quick-inquiry.js` | Quick-inquiry modal submitted, tagged with the same `context`. |
| `view_conversion_page` | `thank-you.html` | Page load of the thank-you page — the registration funnel's destination. |

Once the real Measurement ID is in, mark `sign_up` and `generate_lead`
as **Key events** in the GA4 Admin → Events panel so both the full
registration funnel and the new quick-inquiry funnel count as conversions.

## Backend TODO (both lead forms)

There's no backend yet for either form:

- `js/register-form.js` validates the registration form, simulates a
  short delay, then redirects to `thank-you.html`.
- `js/quick-inquiry.js` validates the quick-inquiry modal, simulates a
  short delay, then shows an inline success message (no redirect).

Before launch, replace the `setTimeout(...)` block in each file's
submit handler with a real `fetch()` call to your CRM/lead API (or an
email service, form backend like Formspree, etc.), and only show
success on a confirmed response. Since quick-inquiry leads are tagged
with a `context` value (e.g. `property:maple-heights-482000`), pass
that through to the CRM too so agents know what prompted the inquiry.

## Rebranding

"Meridian Realty", the navy/gold color scheme, and all copy/testimonials are
placeholders so the site looks and feels finished. To rebrand:

- Company name: search-and-replace `Meridian Realty` across all `.html` files.
- Colors: edit the CSS custom properties at the top of `css/styles.css`
  (`--color-navy`, `--color-gold`, etc.).
- Copy, stats, testimonials, FAQ: edit directly in `index.html`.
- Contact details / social links: footer of `index.html`. Also update the
  placeholder `tel:+10000000000` click-to-call links in the headers of
  `index.html` and `register.html` to the real phone number.
- Property photos: `.property__media` currently uses a CSS gradient
  placeholder — swap in real photos via `background-image` or an `<img>`.

## Notes

- Fully responsive (mobile nav collapses under ~640px).
- No external fonts or JS libraries — fast load, nothing to break.
- Accessible basics included: focus states, `aria-live` form errors,
  `aria-expanded` on the FAQ accordion and mobile nav toggle.
