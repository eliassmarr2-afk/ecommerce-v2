(function () {
  "use strict";

  const state = {
    products: [],
    categories: [],
    query: "",
    category: "all",
    maxPrice: null,
    fastDelivery: false
  };

  const els = {
    categoriesTrack: document.getElementById("categoriesTrack"),
    productsGrid: document.getElementById("productsGrid"),
    searchInput: document.getElementById("searchInput"),
    resultsCount: document.getElementById("resultsCount"),
    emptyState: document.getElementById("emptyState"),
    filterSheet: document.getElementById("filterSheet"),
    filterButton: document.getElementById("filterButton"),
    closeFilters: document.getElementById("closeFilters"),
    applyFilters: document.getElementById("applyFilters"),
    resetFilters: document.getElementById("resetFilters"),
    clearFilters: document.getElementById("clearFilters"),
    resetCategories: document.getElementById("resetCategories"),
    fastDeliveryFilter: document.getElementById("fastDeliveryFilter"),
    toast: document.getElementById("toast"),
    cartCount: document.getElementById("cartCount")
  };

  const money = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem("theCampingCart") || "[]");
    } catch {
      return [];
    }
  }

  function updateCartCount() {
    const total = getCart().reduce((sum, item) => sum + (item.quantity || 1), 0);
    els.cartCount.textContent = String(total);
    els.cartCount.hidden = total === 0;
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
  }

  function renderCategories() {
    const all = [{ id: "all", label: "Todo", icon: "✦" }, ...state.categories];

    els.categoriesTrack.innerHTML = all.map((category) => `
      <button
        class="category-card ${state.category === category.id ? "is-active" : ""}"
        type="button"
        data-category="${category.id}"
        aria-pressed="${state.category === category.id}"
      >
        <span class="category-icon" aria-hidden="true">${category.icon}</span>
        <span>${category.label}</span>
      </button>
    `).join("");

    els.categoriesTrack.querySelectorAll("[data-category]").forEach((button) => {
      button.addEventListener("click", () => {
        state.category = button.dataset.category;
        renderCategories();
        renderProducts();
      });
    });
  }

  function productCard(product) {
    const savings = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

    return `
      <article class="product-card">
        <a class="product-image-wrap" href="producto.html?id=${encodeURIComponent(product.id)}" aria-label="Ver ${product.title}">
          <img class="product-image" src="${product.image}" alt="${product.title}" loading="lazy" />
          <span class="product-badge">${product.badge}</span>
          <span class="favorite-button" aria-hidden="true">♡</span>
        </a>
        <div class="product-content">
          <div class="rating-row">
            <span class="stars" aria-label="${product.rating} de 5">★ ${product.rating}</span>
            <span>${product.reviews} reseñas</span>
          </div>
          <a class="product-title" href="producto.html?id=${encodeURIComponent(product.id)}">${product.title}</a>
          <p class="product-subtitle">${product.subtitle}</p>
          <div class="social-proof">
            <span class="avatar-stack" aria-hidden="true"><i></i><i></i><i></i></span>
            <span>+${product.buyers} ya lo eligieron</span>
          </div>
          <div class="price-row">
            <strong>${money.format(product.price)}</strong>
            ${product.oldPrice ? `<span class="old-price">${money.format(product.oldPrice)}</span>` : ""}
            ${savings ? `<span class="discount">${savings}% OFF</span>` : ""}
          </div>
          <div class="delivery-line">
            <span aria-hidden="true">↗</span>
            <span>${product.deliveryLabel}</span>
          </div>
        </div>
      </article>
    `;
  }

  function getFilteredProducts() {
    const q = state.query.trim().toLowerCase();

    return state.products.filter((product) => {
      const matchesQuery = !q || [product.title, product.subtitle, product.category]
        .join(" ")
        .toLowerCase()
        .includes(q);
      const matchesCategory = state.category === "all" || product.category === state.category;
      const matchesPrice = !state.maxPrice || product.price <= state.maxPrice;
      const matchesDelivery = !state.fastDelivery || product.deliveryDays <= 2;
      return matchesQuery && matchesCategory && matchesPrice && matchesDelivery;
    });
  }

  function renderProducts() {
    const filtered = getFilteredProducts();
    els.productsGrid.innerHTML = filtered.map(productCard).join("");
    els.resultsCount.textContent = filtered.length === 1 ? "1 producto" : `${filtered.length} productos`;
    els.productsGrid.hidden = filtered.length === 0;
    els.emptyState.hidden = filtered.length !== 0;
  }

  function openFilters() {
    els.filterSheet.hidden = false;
    requestAnimationFrame(() => els.filterSheet.classList.add("is-open"));
    document.body.classList.add("no-scroll");
  }

  function closeFilters() {
    els.filterSheet.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    window.setTimeout(() => {
      if (!els.filterSheet.classList.contains("is-open")) els.filterSheet.hidden = true;
    }, 220);
  }

  function resetAllFilters() {
    state.query = "";
    state.category = "all";
    state.maxPrice = null;
    state.fastDelivery = false;
    els.searchInput.value = "";
    els.fastDeliveryFilter.checked = false;
    document.querySelectorAll("[data-price]").forEach((button) => {
      button.classList.toggle("is-selected", button.dataset.price === "all");
    });
    renderCategories();
    renderProducts();
  }

  function wireEvents() {
    els.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value;
      renderProducts();
    });

    els.filterButton.addEventListener("click", openFilters);
    els.closeFilters.addEventListener("click", closeFilters);
    els.filterSheet.addEventListener("click", (event) => {
      if (event.target === els.filterSheet) closeFilters();
    });

    document.querySelectorAll("[data-price]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-price]").forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
        state.maxPrice = button.dataset.price === "all" ? null : Number(button.dataset.price);
      });
    });

    els.applyFilters.addEventListener("click", () => {
      state.fastDelivery = els.fastDeliveryFilter.checked;
      renderProducts();
      closeFilters();
    });

    els.resetFilters.addEventListener("click", () => {
      state.maxPrice = null;
      state.fastDelivery = false;
      els.fastDeliveryFilter.checked = false;
      document.querySelectorAll("[data-price]").forEach((button) => {
        button.classList.toggle("is-selected", button.dataset.price === "all");
      });
    });

    els.clearFilters.addEventListener("click", resetAllFilters);
    els.resetCategories.addEventListener("click", () => {
      state.category = "all";
      renderCategories();
      renderProducts();
    });

    document.querySelectorAll("[data-category-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        state.category = button.dataset.categoryJump;
        renderCategories();
        renderProducts();
        document.getElementById("featuredTitle").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    document.querySelectorAll("[data-placeholder-tab]").forEach((button) => {
      button.addEventListener("click", () => showToast(`${button.dataset.placeholderTab}: disponible en una próxima fase.`));
    });
  }

  async function init() {
    [state.categories, state.products] = await Promise.all([
      window.TheCampingCatalog.getCategories(),
      window.TheCampingCatalog.getProducts()
    ]);

    renderCategories();
    renderProducts();
    updateCartCount();
    wireEvents();
  }

  init();
})();