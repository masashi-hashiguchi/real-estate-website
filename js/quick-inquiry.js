/* ============================================================
   Quick Inquiry modal — low-friction contact path
   ------------------------------------------------------------
   WHY THIS EXISTS
   The only conversion path on this site used to be the full
   membership registration form (name/email/phone/password...).
   That's a real barrier for the large slice of visitors who just
   want to ask a question or request a callback and aren't ready
   to create a password-protected account yet.

   This module injects, on every page that includes it:
   - A floating "Ask a question" button, always visible,
     bottom-right, on every page.
   - A lightweight modal with just name + phone-or-email + an
     optional message — no password, no account. Optimized for the
     lowest possible friction to capture a lead.
   - Any element with [data-open-inquiry] on the page also opens
     the same modal (used by per-property "Ask about this home"
     buttons, footer links, etc.). An optional
     data-open-inquiry="property:<label>" value is captured as the
     inquiry's context so leads are pre-tagged with which property
     or CTA triggered them.

   BACKEND TODO: like js/register-form.js, there's no backend yet.
   Replace the setTimeout() block in handleSubmit() below with a
   real fetch() call to your CRM / lead API before launch.
   ============================================================ */
(function () {
  const MODAL_HTML = `
    <div class="modal-overlay" id="quick-inquiry-overlay" hidden>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="quick-inquiry-title">
        <button type="button" class="modal__close" data-inquiry-close aria-label="Close">&times;</button>

        <div data-inquiry-form-view>
          <span class="eyebrow">Free &middot; No account needed</span>
          <h2 id="quick-inquiry-title">Ask us anything</h2>
          <p style="margin-bottom:24px;">Just your name and a way to reach you. A local agent will follow up within 24 hours &mdash; no obligation.</p>

          <form id="quick-inquiry-form" novalidate>
            <input type="hidden" name="context" data-inquiry-context />

            <div class="form-row" data-field="qiName">
              <label for="qiName">Full name</label>
              <input type="text" id="qiName" name="qiName" autocomplete="name" required />
              <div class="form-error" role="alert"></div>
            </div>

            <div class="form-row--2col" style="margin-bottom:20px;">
              <div class="form-row" data-field="qiPhone" style="margin-bottom:0;">
                <label for="qiPhone">Phone number</label>
                <input type="tel" id="qiPhone" name="qiPhone" autocomplete="tel" />
              </div>
              <div class="form-row" data-field="qiEmail" style="margin-bottom:0;">
                <label for="qiEmail">Email address</label>
                <input type="email" id="qiEmail" name="qiEmail" autocomplete="email" />
              </div>
            </div>
            <p class="form-hint" style="margin-top:-10px;margin-bottom:20px;">Please provide at least a phone number or an email address.</p>

            <div class="form-row" data-field="qiMessage">
              <label for="qiMessage">What can we help with? (optional)</label>
              <textarea id="qiMessage" name="qiMessage" rows="3" placeholder="A property, a neighborhood, best time to reach you..."></textarea>
            </div>

            <div class="checkbox-row" data-field="qiConsent">
              <input type="checkbox" id="qiConsent" name="qiConsent" required />
              <label for="qiConsent">I agree to the <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.</label>
            </div>
            <div class="form-error" data-field="qiConsent" style="margin-top:-12px;margin-bottom:12px;"></div>

            <button type="submit" class="btn btn--primary btn--block btn--lg" data-inquiry-submit data-cta="quick_inquiry_submit">
              Send My Question
            </button>
            <div class="form-status" data-inquiry-status role="status"></div>
            <p class="form-hint" style="text-align:center;margin-top:14px;">
              Want full access to listings and alerts?
              <a href="register.html" data-cta="quick_inquiry_to_register">Create a free account instead</a>.
            </p>
          </form>
        </div>

        <div class="modal__success" data-inquiry-success hidden>
          <div class="simple-page__icon" aria-hidden="true" style="margin:0 auto 20px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <h2>Thanks &mdash; we've got it!</h2>
          <p>A local agent will reach out within 24 hours. Need something faster? Feel free to call us directly.</p>
          <div class="simple-page__actions">
            <button type="button" class="btn btn--outline" data-inquiry-close>Close</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const FAB_HTML = `
    <button type="button" class="inquiry-fab" data-open-inquiry="fab" data-cta="fab_quick_inquiry" aria-haspopup="dialog">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>Ask a Question</span>
    </button>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    document.body.insertAdjacentHTML("beforeend", MODAL_HTML);
    document.body.insertAdjacentHTML("beforeend", FAB_HTML);

    const overlay = document.getElementById("quick-inquiry-overlay");
    const formView = overlay.querySelector("[data-inquiry-form-view]");
    const successView = overlay.querySelector("[data-inquiry-success]");
    const form = document.getElementById("quick-inquiry-form");
    const statusEl = form.querySelector("[data-inquiry-status]");
    const submitBtn = form.querySelector("[data-inquiry-submit]");
    const contextInput = form.querySelector("[data-inquiry-context]");
    let lastFocusedEl = null;

    function openModal(context) {
      lastFocusedEl = document.activeElement;
      contextInput.value = context || "general";
      overlay.hidden = false;
      document.body.style.overflow = "hidden";
      formView.hidden = false;
      successView.hidden = true;
      window.requestAnimationFrame(() => {
        overlay.querySelector("#qiName")?.focus();
      });
      if (typeof trackEvent === "function") {
        trackEvent("quick_inquiry_open", { context: context || "general" });
      }
    }

    function closeModal() {
      overlay.hidden = true;
      document.body.style.overflow = "";
      if (lastFocusedEl && typeof lastFocusedEl.focus === "function") {
        lastFocusedEl.focus();
      }
    }

    // Any element on the page tagged data-open-inquiry opens this modal.
    // Value (if any) after ":" is passed through as tracking context,
    // e.g. data-open-inquiry="property:maple-heights"
    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-open-inquiry]");
      if (!trigger) return;
      event.preventDefault();
      openModal(trigger.getAttribute("data-open-inquiry"));
    });

    overlay.querySelectorAll("[data-inquiry-close]").forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !overlay.hidden) closeModal();
    });

    function showFieldError(field, message) {
      const row = form.querySelector(`[data-field="${field}"]`);
      const errorEl = row?.querySelector(".form-error") || overlay.querySelector(`.form-error[data-field="${field}"]`);
      if (row) row.classList.toggle("has-error", Boolean(message));
      if (errorEl) errorEl.textContent = message;
    }

    function validate() {
      let ok = true;

      const name = form.querySelector("#qiName").value.trim();
      if (name.length < 2) {
        showFieldError("qiName", "Please enter your name.");
        ok = false;
      } else {
        showFieldError("qiName", "");
      }

      const phone = form.querySelector("#qiPhone").value.trim();
      const email = form.querySelector("#qiEmail").value.trim();
      const phoneOk = phone === "" || /^[0-9()+\-\s]{7,20}$/.test(phone);
      const emailOk = email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const hasOne = phone !== "" || email !== "";

      if (!hasOne || !phoneOk || !emailOk) {
        showFieldError(
          "qiPhone",
          !hasOne
            ? "Please provide a phone number or an email address."
            : !phoneOk
            ? "Please enter a valid phone number."
            : ""
        );
        showFieldError("qiEmail", !emailOk ? "Please enter a valid email address." : "");
        ok = false;
      } else {
        showFieldError("qiPhone", "");
        showFieldError("qiEmail", "");
      }

      const consent = form.querySelector("#qiConsent");
      if (!consent.checked) {
        showFieldError("qiConsent", "Please accept the Privacy Policy to continue.");
        ok = false;
      } else {
        showFieldError("qiConsent", "");
      }

      return ok;
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!validate()) {
        statusEl.textContent = "Please fix the highlighted fields above.";
        statusEl.dataset.state = "error";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      statusEl.textContent = "";
      statusEl.dataset.state = "";

      const context = contextInput.value || "general";

      // --- Simulated submit (replace with real API call before launch,
      //     same as the TODO in js/register-form.js) ---
      setTimeout(() => {
        if (typeof trackEvent === "function") {
          trackEvent("generate_lead", { form_name: "quick_inquiry", context });
          trackEvent("quick_inquiry_submit", { context });
        }
        formView.hidden = true;
        successView.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Send My Question";
        form.reset();
        successView.querySelector("[data-inquiry-close]")?.focus();
      }, 500);
    });
  });
})();
