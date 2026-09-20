(function () {
  "use strict";

  const els = {
    welcome: document.getElementById("authWelcome"),
    login: document.getElementById("authLogin"),
    openLogin: document.getElementById("openLoginButton"),
    back: document.getElementById("backToWelcome"),
    googleTop: document.getElementById("googleLoginButton"),
    createTop: document.getElementById("createAccountButton"),
    googleCard: document.getElementById("googleLoginCardButton"),
    createInline: document.getElementById("createAccountInline"),
    forgot: document.getElementById("forgotPassword"),
    form: document.getElementById("loginForm"),
    email: document.getElementById("loginEmail"),
    password: document.getElementById("loginPassword"),
    emailError: document.getElementById("loginEmailError"),
    passwordError: document.getElementById("loginPasswordError"),
    togglePassword: document.getElementById("togglePassword"),
    toast: document.getElementById("authToast")
  };

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2300);
  }

  function openLogin() {
    els.welcome.hidden = true;
    els.login.hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
    window.setTimeout(() => els.email.focus(), 120);
  }

  function closeLogin() {
    els.login.hidden = true;
    els.welcome.hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function setError(input, error, message) {
    const invalid = Boolean(message);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
    error.hidden = !invalid;
    error.textContent = message || "";
  }

  function validate() {
    const email = els.email.value.trim();
    const password = els.password.value;
    let valid = true;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(els.email, els.emailError, "Ingresá un correo válido.");
      valid = false;
    } else {
      setError(els.email, els.emailError, "");
    }

    if (!password) {
      setError(els.password, els.passwordError, "Ingresá tu contraseña.");
      valid = false;
    } else {
      setError(els.password, els.passwordError, "");
    }

    return valid;
  }

  function futureShopifyNotice(label) {
    showToast(`${label}: quedará conectado cuando migremos la autenticación a Shopify.`);
  }

  els.openLogin.addEventListener("click", openLogin);
  els.back.addEventListener("click", closeLogin);

  els.googleTop.addEventListener("click", () => futureShopifyNotice("Google"));
  els.googleCard.addEventListener("click", () => futureShopifyNotice("Google"));
  els.createTop.addEventListener("click", () => futureShopifyNotice("Crear cuenta"));
  els.createInline.addEventListener("click", () => futureShopifyNotice("Crear cuenta"));
  els.forgot.addEventListener("click", () => futureShopifyNotice("Recuperar contraseña"));

  els.togglePassword.addEventListener("click", () => {
    const visible = els.password.type === "text";
    els.password.type = visible ? "password" : "text";
    els.togglePassword.setAttribute(
      "aria-label",
      visible ? "Mostrar contraseña" : "Ocultar contraseña"
    );
  });

  els.email.addEventListener("input", () => {
    if (els.email.value.trim()) setError(els.email, els.emailError, "");
  });

  els.password.addEventListener("input", () => {
    if (els.password.value) setError(els.password, els.passwordError, "");
  });

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validate()) return;
    futureShopifyNotice("Ingresar");
  });
})();