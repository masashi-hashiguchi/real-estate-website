# Meridian Realty — Website (Placeholder Brand)

A simple, static, conversion-focused website for a real estate company. No
build step, no dependencies — just HTML, CSS, and vanilla JS. Open
`index.html` in a browser, or serve the folder with any static file host.

## Pages

| Page | File | Purpose |
|---|---|---|
| Top Page | `index.html` | Hero + CTAs, membership benefits, featured (locked) property teasers, how-it-works, testimonials, FAQ, final CTA band — everything funnels toward registration. |
| Registration Form | `register.html` | Member sign-up form (name, email, phone, area, budget, password, consent). Client-side validated in `js/register-form.js`. |
| Thank You | `thank-you.html` | Post-registration confirmation page. Fires the GA4 conversion events. `noindex` so it doesn't get indexed by search engines. |
| Privacy Policy | `privacy.html` | **Placeholder legal copy** — linked from the registration consent checkbox. Replace with real, legally-reviewed text before launch. |

## Structure

```
index.html
register.html
thank-you.html
privacy.html
css/styles.css        shared styles (single stylesheet, no framework)
js/analytics.js        GA4 setup — the ONLY file to edit when the GA4 tag is shared
js/main.js              shared behavior: mobile nav, FAQ accordion, CTA click tracking
js/register-form.js     registration form validation + submit handling
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
| `cta_click` | any element with `data-cta="..."` (see `js/main.js`) | Every registration/browse button click, labeled by which CTA it was (`hero_register`, `properties_unlock`, `final_cta_register`, etc.) — useful for comparing which CTA converts best. |
| `sign_up` | `js/register-form.js` | Registration form successfully validated & "submitted". |
| `generate_lead` | `js/register-form.js` | Same moment as `sign_up` — GA4's standard lead-gen event, handy if you also want lead-gen reporting. |
| `view_conversion_page` | `thank-you.html` | Page load of the thank-you page — the funnel's destination. |

Once the real Measurement ID is in, mark `sign_up` (or `view_conversion_page`)
as a **Conversion** in the GA4 Admin → Events panel.

## Registration form — backend TODO

There's no backend yet. On submit, `js/register-form.js` validates the form,
simulates a short delay, then redirects to `thank-you.html`. Before launch,
replace the `setTimeout(...)` block in `handleSubmit()` with a real
`fetch()` call to your CRM/lead API (or an email service, form backend like
Formspree, etc.), and only redirect on a successful response.

## Rebranding

"Meridian Realty", the navy/gold color scheme, and all copy/testimonials are
placeholders so the site looks and feels finished. To rebrand:

- Company name: search-and-replace `Meridian Realty` across all `.html` files.
- Colors: edit the CSS custom properties at the top of `css/styles.css`
  (`--color-navy`, `--color-gold`, etc.).
- Copy, stats, testimonials, FAQ: edit directly in `index.html`.
- Contact details / social links: footer of `index.html`.
- Property photos: `.property__media` currently uses a CSS gradient
  placeholder — swap in real photos via `background-image` or an `<img>`.

## Notes

- Fully responsive (mobile nav collapses under ~640px).
- No external fonts or JS libraries — fast load, nothing to break.
- Accessible basics included: focus states, `aria-live` form errors,
  `aria-expanded` on the FAQ accordion and mobile nav toggle.
