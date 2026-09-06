/* ============================================================
   Google Analytics 4 (GA4) configuration
   ------------------------------------------------------------
   This is the ONLY place the Measurement ID needs to be set.
   Every page loads this file before anything else, so once the
   ID below is updated, tracking + all trackEvent() calls across
   the whole site go live automatically.

   TODO: Replace with the real GA4 Measurement ID (format: G-XXXXXXXXXX)
   ============================================================ */
const GA_MEASUREMENT_ID = "G-YVX2YS5FMT";

(function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") {
    // Not configured yet — skip loading gtag.js so we don't send
    // requests to a placeholder ID. A note is logged so it's obvious
    // in devtools why no GA4 traffic shows up yet.
    console.info(
      "[GA4] Measurement ID not set yet — analytics is disabled. " +
        "Set GA_MEASUREMENT_ID in js/analytics.js to enable tracking."
    );
    window.gtag = function () {}; // no-op stand-in so trackEvent() never throws
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag("js", new Date());
  // send_page_view is turned off here so we can fire our own explicit
  // "page_view" event below (with the same params GA4's automatic one
  // would use) instead of relying on an implicit, config-triggered hit.
  gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
})();

/**
 * Fire a GA4 event. Safe to call even before the real Measurement ID
 * is configured (falls through to the no-op gtag above).
 *
 * Recommended event names already used across this site:
 *  - "page_view"    { page_title, page_location, page_path } (every page load, below)
 *  - "cta_click"    { cta_label, page_location }
 *  - "sign_up"      { method: "form" }               (registration submitted — conversion)
 *  - "generate_lead"{ form_name: "member_registration" } (registration submitted — conversion)
 *  - "view_conversion_page" (fired on thank-you.html)
 */
function trackEvent(eventName, params) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params || {});
  }
}

// Pageview tag — every page loads this file first (see table in
// CLAUDE.md), so this one call is all that's needed to tag page views
// site-wide; no per-page script required.
trackEvent("page_view", {
  page_title: document.title,
  page_location: window.location.href,
  page_path: window.location.pathname + window.location.search,
});
