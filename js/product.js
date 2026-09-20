(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  const ACTIVE_PRODUCT_CHAT_KEY = "theCampingActiveProductChat";
  let product;

  const money = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });

  const categoryNames = {
    combos: "Combos",
    inflables: "Inflables",
    carpas: "Carpas",
    pesca: "Pesca",
    anafes: "Anafes",
    parrillas: "Parrillas",
    sillas: "Sillas"
  };

  const els = {
    image: document.getElementById("productImage"),
    category: document.getElementById("productCategory"),
    title: document.getElementById("productTitle"),
    rating: document.getElementById("productRating"),
    deliveryShort: document.getElementById("deliveryShort"),
    buyers: document.getElementById("productBuyers"),
    price: document.getElementById("productPrice"),
    oldPrice: document.getElementById("oldPrice"),
    delivery: document.getElementById("deliveryLabel"),
    description: document.getElementById("productDescription"),
    features: document.getElementById("featureGrid"),
    addToCart: document.getElementById("addToCart"),
    favorite: document.getElementById("favoriteButton"),
    share: document.getElementById("shareButton"),
    reviewsButton: document.getElementById("reviewsButton"),
    readMoreButton: document.getElementById("readMoreButton"),
    galleryButton: document.querySelector(".gallery-pill"),
    detailSection: document.querySelector(".detail-section"),
    toast: document.getElementById("toast"),
    phoneSupportButton: document.querySelector('.seller-actions button[aria-label="Consultar por teléfono"]'),
    productSupportButton: document.getElementById("productSupportButton"),
    productSupportBackdrop: document.getElementById("productSupportBackdrop"),
    productSupportSheet: document.getElementById("productSupportSheet"),
    closeProductSupport: document.getElementById("closeProductSupport"),
    productSupportFormView: document.getElementById("productSupportFormView"),
    productSupportChatView: document.getElementById("productSupportChatView"),
    productSupportForm: document.getElementById("productSupportForm"),
    productSupportName: document.getElementById("productSupportName"),
    productSupportEmail: document.getElementById("productSupportEmail"),
    productSupportNameError: document.getElementById("productSupportNameError"),
    productSupportEmailError: document.getElementById("productSupportEmailError"),
    supportProductImage: document.getElementById("supportProductImage"),
    supportProductTitle: document.getElementById("supportProductTitle"),
    supportProductPrice: document.getElementById("supportProductPrice"),
    productSupportMessages: document.getElementById("productSupportMessages"),
    productSupportQuickQuestions: document.getElementById("productSupportQuickQuestions"),
    productSupportMessageForm: document.getElementById("productSupportMessageForm"),
    productSupportMessageInput: document.getElementById("productSupportMessageInput")
  };

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2100);
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem("theCampingCart") || "[]");
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem("theCampingCart", JSON.stringify(cart));
  }

  function render() {
    document.title = `${product.title} · The Camping`;
    els.image.src = product.image;
    els.image.alt = product.title;
    els.category.textContent = categoryNames[product.category] || product.category;
    els.title.textContent = product.title;
    els.rating.textContent = `${product.rating} · ${product.reviews} reseñas`;
    els.deliveryShort.textContent = product.deliveryDays <= 1 ? "Despacho en el día" : `Entrega en ${product.deliveryDays} días`;
    els.buyers.textContent = `${product.buyers.toLocaleString("es-AR")}+`;
    els.price.textContent = money.format(product.price);
    els.oldPrice.textContent = product.oldPrice ? money.format(product.oldPrice) : "";
    els.delivery.textContent = product.deliveryLabel;
    els.description.textContent = product.description;
    els.features.innerHTML = product.features.map((feature) => `
      <div class="feature-item">
        <span class="feature-item__check">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
        </span>
        <span>${feature}</span>
      </div>
    `).join("");
  }

  function addToCart() {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = Math.min((existing.quantity || 1) + 1, product.stock || 99);
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }

    saveCart(cart);
    showToast(`${product.title} agregado al carrito.`);
  }

  function setProductSupportError(input, errorEl, message) {
    const hasError = Boolean(message);
    input.setAttribute("aria-invalid", hasError ? "true" : "false");
    errorEl.hidden = !hasError;
    errorEl.textContent = message || "";
  }

  function resetProductSupportSheet() {
    els.productSupportForm.reset();
    setProductSupportError(els.productSupportName, els.productSupportNameError, "");
    setProductSupportError(els.productSupportEmail, els.productSupportEmailError, "");
    els.productSupportFormView.hidden = false;
    els.productSupportChatView.hidden = true;
    els.productSupportMessages.innerHTML = "";
  }

  function openProductSupport() {
    resetProductSupportSheet();

    els.supportProductImage.src = product.image;
    els.supportProductImage.alt = product.title;
    els.supportProductTitle.textContent = product.title;
    els.supportProductPrice.textContent = money.format(product.price);
    const storedSession = loadProductSupportSession();
    if (storedSession) {
      showProductSupportChat(storedSession);
    }

    els.productSupportBackdrop.hidden = false;
    requestAnimationFrame(() => {
      els.productSupportBackdrop.classList.add("is-open");
    });

    document.body.classList.add("no-scroll");
  }

  function closeProductSupport() {
    els.productSupportBackdrop.classList.remove("is-open");
    document.body.classList.remove("no-scroll");

    window.setTimeout(() => {
      if (!els.productSupportBackdrop.classList.contains("is-open")) {
        els.productSupportBackdrop.hidden = true;
      }
    }, 190);
  }

  function getProductSupportSessionKey() {
    return `theCampingProductChat:${product.id}`;
  }

  function saveProductSupportSession(session) {
    try {
      sessionStorage.setItem(getProductSupportSessionKey(), JSON.stringify(session));
      sessionStorage.setItem(ACTIVE_PRODUCT_CHAT_KEY, JSON.stringify({
        productId: session.product.id,
        productTitle: session.product.title,
        sessionKey: getProductSupportSessionKey()
      }));
    } catch {
      // Front-only persistence is best effort.
    }
  }

  function loadProductSupportSession() {
    try {
      const raw = sessionStorage.getItem(getProductSupportSessionKey());
      if (!raw) return null;

      const session = JSON.parse(raw);
      if (!session || session.product?.id !== product.id) return null;
      return session;
    } catch {
      return null;
    }
  }

  function renderProductSupportMessages(session) {
    els.productSupportMessages.innerHTML = session.messages.map((message) => {
      const customer = message.role === "customer";
      const sender = customer ? session.customer.name : "Operador";

      return `
        <div class="product-support-message ${customer ? "product-support-message--customer" : "product-support-message--operator"}">
          <span class="product-support-message__sender">${sender}</span>
          <div class="product-support-message__bubble"></div>
        </div>
      `;
    }).join("");

    const bubbles = els.productSupportMessages.querySelectorAll(".product-support-message__bubble");
    session.messages.forEach((message, index) => {
      if (bubbles[index]) {
        bubbles[index].textContent = message.text;
      }
    });

    els.productSupportMessages.scrollTop = els.productSupportMessages.scrollHeight;
  }

  function renderProductSupportQuickQuestions() {
    const questions = Array.isArray(product.supportQuestions)
      ? product.supportQuestions.filter((question) => String(question || "").trim())
      : [];

    els.productSupportQuickQuestions.replaceChildren();

    if (!questions.length) {
      els.productSupportQuickQuestions.hidden = true;
      return;
    }

    els.productSupportQuickQuestions.hidden = false;

    questions.forEach((question) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "product-support-quick-question";
      button.textContent = question;

      button.addEventListener("click", () => {
        sendProductSupportMessage(question, "preset_question");
      });

      els.productSupportQuickQuestions.appendChild(button);
    });
  }

  function showProductSupportChat(session) {
    els.productSupportFormView.hidden = true;
    els.productSupportChatView.hidden = false;
    renderProductSupportMessages(session);
    renderProductSupportQuickQuestions();

    requestAnimationFrame(() => {
      els.productSupportMessageInput.focus();
    });
  }

  function createProductSupportSession() {
    const supportIntent = buildProductSupportIntent();
    const firstName = supportIntent.customer.name.split(/\s+/)[0] || supportIntent.customer.name;

    const session = {
      version: 1,
      type: "product_inquiry",
      status: "open",
      startedAt: new Date().toISOString(),
      customer: supportIntent.customer,
      product: supportIntent.product,
      source: supportIntent.source,
      entrySurface: supportIntent.entrySurface,
      operatorUnreadCount: 0,
      messages: [
        {
          role: "operator",
          text: `Hola ${firstName}, ¿qué te gustaría saber de ${product.title}?`,
          createdAt: new Date().toISOString()
        }
      ]
    };

    saveProductSupportSession(session);

    window.dispatchEvent(new CustomEvent("thecamping:product-support-started", {
      detail: JSON.parse(JSON.stringify(session))
    }));

    return session;
  }

  function sendProductSupportMessage(text, source = "composer") {
    const normalized = String(text || "").trim();
    if (!normalized) return;

    const session = loadProductSupportSession();
    if (!session) return;

    const message = {
      role: "customer",
      text: normalized,
      source,
      createdAt: new Date().toISOString()
    };

    session.messages.push(message);
    saveProductSupportSession(session);
    renderProductSupportMessages(session);

    window.dispatchEvent(new CustomEvent("thecamping:product-support-message", {
      detail: {
        context: {
          type: session.type,
          customer: session.customer,
          product: session.product,
          source: session.source,
          entrySurface: session.entrySurface
        },
        message: JSON.parse(JSON.stringify(message))
      }
    }));
  }

  window.TheCampingSupportHook = {
    getCurrentContext() {
      const session = loadProductSupportSession();
      if (!session) return null;

      return JSON.parse(JSON.stringify({
        type: session.type,
        status: session.status,
        customer: session.customer,
        product: session.product,
        source: session.source,
        entrySurface: session.entrySurface
      }));
    },

    openCurrentConversation() {
      const session = loadProductSupportSession();
      if (!session) return false;

      openProductSupport();
      return true;
    }
  };

  function validateProductSupport() {
    const name = els.productSupportName.value.trim();
    const email = els.productSupportEmail.value.trim();
    let valid = true;

    if (name.length < 3) {
      setProductSupportError(
        els.productSupportName,
        els.productSupportNameError,
        "Ingresá tu nombre y apellido."
      );
      valid = false;
    } else {
      setProductSupportError(els.productSupportName, els.productSupportNameError, "");
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setProductSupportError(
        els.productSupportEmail,
        els.productSupportEmailError,
        "Ingresá un correo válido."
      );
      valid = false;
    } else {
      setProductSupportError(els.productSupportEmail, els.productSupportEmailError, "");
    }

    return valid;
  }

  function buildProductSupportIntent() {
    return {
      type: "product_inquiry",
      entrySurface: "product_detail",
      customer: {
        name: els.productSupportName.value.trim(),
        email: els.productSupportEmail.value.trim()
      },
      product: {
        id: product.id,
        title: product.title,
        category: product.category,
        price: product.price,
        image: product.image,
        supportQuestions: Array.isArray(product.supportQuestions)
          ? product.supportQuestions.slice()
          : []
      },
      source: {
        url: window.location.href
      }
    };
  }

  function handleProductSupportSubmit(event) {
    event.preventDefault();

    if (!validateProductSupport()) {
      return;
    }

    /*
     * Front-only V1:
     * create the contextual chat immediately.
     *
     * Future Protocol Data V2 seam:
     * this exact session/context becomes the payload for the public
     * Conversations endpoint. No network call is made yet.
     */
    const session = createProductSupportSession();
    showProductSupportChat(session);
  }

  function handleProductSupportMessageSubmit(event) {
    event.preventDefault();

    const text = els.productSupportMessageInput.value.trim();
    if (!text) {
      els.productSupportMessageInput.focus();
      return;
    }

    sendProductSupportMessage(text, "composer");
    els.productSupportMessageInput.value = "";
    els.productSupportMessageInput.focus();
  }

  function wireEvents() {
    els.addToCart.addEventListener("click", addToCart);

    els.favorite.addEventListener("click", () => {
      els.favorite.classList.toggle("is-favorite");
      showToast(
        els.favorite.classList.contains("is-favorite")
          ? "Guardado en favoritos."
          : "Quitado de favoritos."
      );
    });

    els.share.addEventListener("click", async () => {
      const shareData = {
        title: product.title,
        text: `Mirá ${product.title} en The Camping`,
        url: window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          showToast("Enlace copiado.");
        } else {
          showToast("Copiá la URL para compartir este producto.");
        }
      } catch (error) {
        if (error && error.name !== "AbortError") {
          showToast("No se pudo compartir.");
        }
      }
    });

    els.readMoreButton.addEventListener("click", () => {
      const expanded = els.detailSection.classList.toggle("is-expanded");
      els.readMoreButton.textContent = expanded ? "Ver menos" : "Leer más";
    });

    els.reviewsButton.addEventListener("click", () => {
      showToast(`${product.rating} ★ · ${product.reviews} reseñas verificadas de ejemplo.`);
    });

    els.galleryButton.addEventListener("click", () => {
      showToast("La galería completa se incorporará en la siguiente fase.");
    });

    els.phoneSupportButton.addEventListener("click", () => {
      showToast("El canal telefónico se conectará en una fase posterior.");
    });

    els.productSupportButton.addEventListener("click", openProductSupport);

    els.closeProductSupport.addEventListener("click", closeProductSupport);

    els.productSupportBackdrop.addEventListener("click", (event) => {
      if (event.target === els.productSupportBackdrop) {
        closeProductSupport();
      }
    });

    els.productSupportName.addEventListener("input", () => {
      if (els.productSupportName.value.trim()) {
        setProductSupportError(els.productSupportName, els.productSupportNameError, "");
      }
    });

    els.productSupportEmail.addEventListener("input", () => {
      if (els.productSupportEmail.value.trim()) {
        setProductSupportError(els.productSupportEmail, els.productSupportEmailError, "");
      }
    });

    els.productSupportForm.addEventListener("submit", handleProductSupportSubmit);
    els.productSupportMessageForm.addEventListener("submit", handleProductSupportMessageSubmit);
  }

  async function init() {
    product = await window.TheCampingCatalog.getProductById(productId);
    render();
    wireEvents();

    if (params.get("supportChat") === "1" && loadProductSupportSession()) {
      openProductSupport();
    }
  }

  init();
})();