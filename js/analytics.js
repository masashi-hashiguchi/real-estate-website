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
  gtag("config", GA_MEASUREMENT_ID);
})();

/**
 * Fire a GA4 event. Safe to call even before the real Measurement ID
 * is configured (falls through to the no-op gtag above).
 *
 * Recommended event names already used across this site:
 *  - "cta_click"    { cta_label, page_location }
 *  - "sign_up"      { method: "form" }               (registration submitted)
 *  - "generate_lead"{ form_name: "member_registration" }
 *  - "view_conversion_page" (fired on thank-you.html)
 */
function trackEvent(eventName, params) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params || {});
  }
}
