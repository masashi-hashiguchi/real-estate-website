/* ============================================================
   Registration form: client-side validation + submit handling

   NOTE: There is no backend wired up yet. On successful validation
   this simulates a submit and redirects to thank-you.html so the
   funnel (and the GA4 "sign_up" / "generate_lead" events) can be
   tested end-to-end today.

   TODO before going live: replace the setTimeout() block in
   handleSubmit() with a real fetch() call to your CRM / lead API
   endpoint, and only redirect on a successful response.
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#register-form");
  if (!form) return;

  const statusEl = form.querySelector("[data-form-status]");
  const submitBtn = form.querySelector("[data-submit-btn]");

  const validators = {
    fullName: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Please enter a valid email address.",
    phone: (v) =>
      /^[0-9()+\-\s]{7,20}$/.test(v.trim()) ? "" : "Please enter a valid phone number.",
    password: (v) => (v.length >= 8 ? "" : "Password must be at least 8 characters."),
    confirmPassword: (v) => {
      const pw = form.querySelector("#password")?.value ?? "";
      return v === pw ? "" : "Passwords do not match.";
    },
    consent: (v, el) => (el.checked ? "" : "Please accept the Privacy Policy to continue."),
  };

  function showError(field, message) {
    const row = form.querySelector(`[data-field="${field}"]`);
    const errorEl = row?.querySelector(".form-error");
    if (row) row.classList.toggle("has-error", Boolean(message));
    if (errorEl) errorEl.textContent = message;
  }

  function validateField(field) {
    const el = form.querySelector(`#${field}`);
    if (!el || !validators[field]) return true;
    const message = validators[field](el.value, el);
    showError(field, message);
    return !message;
  }

  // Validate on blur for quicker feedback, without nagging while typing
  Object.keys(validators).forEach((field) => {
    const el = form.querySelector(`#${field}`);
    el?.addEventListener("blur", () => validateField(field));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const results = Object.keys(validators).map(validateField);
    const isValid = results.every(Boolean);

    if (!isValid) {
      statusEl.textContent = "Please fix the highlighted fields above.";
      statusEl.dataset.state = "error";
      form.querySelector(".has-error input")?.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    statusEl.textContent = "";
    statusEl.dataset.state = "";

    // --- Simulated submit (replace with real API call, see TODO above) ---
    setTimeout(() => {
      trackEvent("sign_up", { method: "form" });
      trackEvent("generate_lead", { form_name: "member_registration" });
      window.location.href = "thank-you.html";
    }, 500);
  });
});
