(function () {
  "use strict";

  const els = {
    form: document.getElementById("trackingForm"),
    input: document.getElementById("trackingIdInput"),
    error: document.getElementById("trackingError"),
    pasteButton: document.getElementById("pasteTrackingButton"),
    qrButton: document.getElementById("scanQrButton"),
    menuButton: document.getElementById("trackingMenuButton"),
    toast: document.getElementById("trackingToast")
  };

  /**
   * Public access contract for the future logistics integration.
   *
   * Supported entry forms:
   * - seguimiento.html
   * - seguimiento.html?trackingId=123456
   * - seguimiento.html?token=<opaque-public-token>
   *
   * The token is intentionally not persisted, logged or resolved in V1.
   */
  function readTrackingAccessFromUrl() {
    const params = new URLSearchParams(window.location.search);

    return {
      trackingId: (params.get("trackingId") || "").trim(),
      token: (params.get("token") || "").trim()
    };
  }

  /**
   * Future seam:
   * token -> public resolver -> trackingId + initial public order projection.
   *
   * V1 only recognizes that a token exists. It does not call any backend.
   */
  function resolveInitialTrackingAccess(access) {
    if (access.trackingId) {
      return {
        mode: "tracking-id",
        trackingId: access.trackingId
      };
    }

    if (access.token) {
      return {
        mode: "token-pending",
        trackingId: ""
      };
    }

    return {
      mode: "manual",
      trackingId: ""
    };
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2200);
  }

  function setValidationState(message) {
    const hasError = Boolean(message);
    els.error.hidden = !hasError;
    els.error.textContent = message || "";
    els.input.setAttribute("aria-invalid", hasError ? "true" : "false");
  }

  function normalizeTrackingId(value) {
    return String(value || "").trim();
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trackingId = normalizeTrackingId(els.input.value);

    if (!trackingId) {
      setValidationState("Ingresá un ID de seguimiento para continuar.");
      els.input.focus();
      return;
    }

    setValidationState("");

    if (trackingId === "123456") {
      window.location.assign(
        `seguimiento-estado.html?trackingId=${encodeURIComponent(trackingId)}`
      );
      return;
    }

    setValidationState("No encontramos ese ID en esta demo. Probá con 123456.");
    els.input.focus();
  }

  async function handlePaste() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      els.input.focus();
      showToast("Pegá tu ID manualmente en el campo.");
      return;
    }

    try {
      const text = normalizeTrackingId(await navigator.clipboard.readText());

      if (!text) {
        showToast("No encontramos un código en el portapapeles.");
        return;
      }

      els.input.value = text;
      setValidationState("");
      els.input.focus();
    } catch {
      els.input.focus();
      showToast("No pudimos acceder al portapapeles. Pegá el código manualmente.");
    }
  }

  function applyInitialAccess() {
    const access = readTrackingAccessFromUrl();
    const initial = resolveInitialTrackingAccess(access);

    document.documentElement.dataset.trackingAccessMode = initial.mode;

    if (initial.mode === "tracking-id") {
      els.input.value = initial.trackingId;
      return;
    }

    if (initial.mode === "token-pending") {
      /*
       * V1 detects the token but does not persist, log or expose it.
       * A future adapter will exchange it for a public tracking projection.
       */
      els.input.placeholder = "Preparando acceso de seguimiento…";
    }
  }

  function wireEvents() {
    els.form.addEventListener("submit", handleSubmit);

    els.input.addEventListener("input", () => {
      if (els.input.value.trim()) {
        setValidationState("");
      }
    });

    els.pasteButton.addEventListener("click", handlePaste);

    els.qrButton.addEventListener("click", () => {
      showToast("El escáner QR se incorporará en una fase posterior.");
    });

    els.menuButton.addEventListener("click", () => {
      showToast("Más opciones estarán disponibles próximamente.");
    });
  }

  function init() {
    applyInitialAccess();
    wireEvents();
  }

  init();
})();