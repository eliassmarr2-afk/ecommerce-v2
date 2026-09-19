(function () {
  "use strict";

  const els = {
    form: document.getElementById("supportForm"),
    email: document.getElementById("supportEmail"),
    name: document.getElementById("supportName"),
    subject: document.getElementById("supportSubject"),
    toast: document.getElementById("supportToast")
  };

  /**
   * Future support-context seam.
   *
   * A later Protocol Data V2 adapter can use an opaque token / authenticated
   * session to decide whether the support chat starts with order context or as
   * generic "Soporte". V1 never resolves or persists that context.
   */
  function readSupportEntryContext() {
    const params = new URLSearchParams(window.location.search);

    return {
      hasOpaqueToken: Boolean((params.get("token") || "").trim()),
      hasOrderHint: Boolean((params.get("orderId") || "").trim())
    };
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2300);
  }

  function setError(input, message) {
    const error = document.querySelector(`[data-error-for="${input.id}"]`);
    const hasError = Boolean(message);

    input.setAttribute("aria-invalid", hasError ? "true" : "false");
    error.hidden = !hasError;
    error.textContent = message || "";
  }

  function validate() {
    let valid = true;
    const email = els.email.value.trim();
    const name = els.name.value.trim();
    const subject = els.subject.value;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(els.email, "Ingresá un correo válido.");
      valid = false;
    } else {
      setError(els.email, "");
    }

    if (name.length < 3) {
      setError(els.name, "Ingresá tu nombre y apellido.");
      valid = false;
    } else {
      setError(els.name, "");
    }

    if (!subject) {
      setError(els.subject, "Seleccioná un asunto.");
      valid = false;
    } else {
      setError(els.subject, "");
    }

    return valid;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const request = {
      email: els.email.value.trim(),
      name: els.name.value.trim(),
      subject: els.subject.value,
      contextMode: document.documentElement.dataset.supportContextMode || "generic"
    };

    /*
     * Future:
     * support.startContextualChat(request)
     *
     * Purchased / securely identified customer -> contextual support thread.
     * Otherwise -> generic "Soporte" thread.
     */
    void request;

    showToast("Front de soporte listo. El chat contextual se conectará con Protocol Data V2.");
  }

  function wireEvents() {
    [els.email, els.name, els.subject].forEach((input) => {
      input.addEventListener("input", () => setError(input, ""));
      input.addEventListener("change", () => setError(input, ""));
    });

    els.form.addEventListener("submit", handleSubmit);
  }

  function init() {
    const context = readSupportEntryContext();
    document.documentElement.dataset.supportContextMode =
      context.hasOpaqueToken || context.hasOrderHint ? "context-pending" : "generic";

    wireEvents();
  }

  init();
})();