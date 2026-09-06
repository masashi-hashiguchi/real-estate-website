/* ============================================================
   Shared site behavior: mobile nav, FAQ accordion, CTA tracking
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  // --- Mobile nav toggle ---
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!isOpen));
      navToggle.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  // --- FAQ accordion ---
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-item__q");
    if (!question) return;
    question.addEventListener("click", () => {
      const isOpen = item.getAttribute("data-open") === "true";
      // close any other open items for a tidier single-open accordion
      document.querySelectorAll(".faq-item").forEach((other) => {
        if (other !== item) {
          other.setAttribute("data-open", "false");
          other.querySelector(".faq-item__q")?.setAttribute("aria-expanded", "false");
        }
      });
      item.setAttribute("data-open", String(!isOpen));
      question.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // --- CTA click tracking (any element flagged with data-cta) ---
  // Lets GA4 report which specific button/link drove each conversion,
  // without needing a change once the real measurement ID is in place.
  document.querySelectorAll("[data-cta]").forEach((el) => {
    el.addEventListener("click", () => {
      trackEvent("cta_click", {
        cta_label: el.getAttribute("data-cta"),
        page_location: window.location.pathname,
      });
    });
  });
});
