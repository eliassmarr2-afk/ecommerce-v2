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
    nearbyGrid: document.getElementById("nearbyGrid"),
    nearbySection: document.querySelector(".nearby-section"),
    searchInput: document.getElementById("searchInput"),
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
    cartCount: document.getElementById("cartCount"),
    menuDetails: document.getElementById("homeMenu"),
    closeMenuButton: document.getElementById("closeMenuButton"),
    menuCategories: document.getElementById("menuCategories")
  };

  const money = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });

  function iconSvg(name) {
    const icons = {
      combos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16v11H4z"/><path d="M8 8V5h8v3"/><path d="M9 13h6"/></svg>',
      inflables: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4v5M20 12h-5M12 20v-5M4 12h5"/></svg>',
      carpas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20 12 4l9 16H3Z"/><path d="m12 4 3 16"/><path d="m9 20 3-7 3 7"/></svg>',
      pesca: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4c5 1 8 5 8 10v2"/><path d="M13 16a3 3 0 1 0 6 0v-1"/><path d="m17 12 2 3-4 .5"/></svg>',
      anafes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 15c-1.8-2 .1-4.1 1.6-5.7C11 7.8 11.5 6 11 4c4.7 2.4 6.5 5.8 5.3 9.2"/><path d="M7 17h10M8 20h8"/></svg>',
      parrillas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16v5a8 8 0 0 1-16 0V8Z"/><path d="M8 20v2M16 20v2M7 5h10M9 3h6"/></svg>',
      sillas: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v8h10V4"/><path d="M6 12h12v4H6z"/><path d="M8 16v5M16 16v5"/></svg>'
    };

    return icons[name] || icons.combos;
  }

  function heartSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>';
  }

  function starSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.2 6-.9L12 3Z"/></svg>';
  }

  function truckSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v11H3z"/><path d="M14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>';
  }

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
    showToast.timer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2100);
  }

  function renderMenuCategories() {
    els.menuCategories.innerHTML = state.categories.map((category) => `
      <button type="button" data-menu-category="${category.id}">${category.label}</button>
    `).join("");

    els.menuCategories.querySelectorAll("[data-menu-category]").forEach((button) => {
      button.addEventListener("click", () => {
        state.category = button.dataset.menuCategory;
        state.query = "";
        els.searchInput.value = "";
        renderCategories();
        renderProducts();
        closeMenu();
        document.getElementById("featuredTitle").scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
  }

  function renderCategories() {
    els.categoriesTrack.innerHTML = state.categories.map((category) => `
      <button
        class="category-card ${state.category === category.id ? "is-active" : ""}"
        type="button"
        data-category="${category.id}"
        aria-pressed="${state.category === category.id}"
      >
        <span class="category-card__icon">${iconSvg(category.id)}</span>
        <span class="category-card__label">${category.label}</span>
      </button>
    `).join("");

    els.categoriesTrack.querySelectorAll("[data-category]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextCategory = button.dataset.category;
        state.category = state.category === nextCategory ? "all" : nextCategory;
        renderCategories();
        renderProducts();
      });
    });
  }

  function productCard(product) {
    const productUrl = `producto.html?id=${encodeURIComponent(product.id)}`;

    return `
      <button
        class="product-card"
        type="button"
        data-product-url="${productUrl}"
        aria-label="Abrir ${product.title}"
      >
        <div class="product-card__media">
          <img class="product-card__image" src="${product.image}" alt="${product.title}" loading="lazy" draggable="false" />
          <span class="product-card__badge">${product.badge}</span>
          <span class="product-card__heart" aria-hidden="true">${heartSvg()}</span>
        </div>

        <div class="product-card__body">
          <span class="product-card__title">${product.title}</span>

          <div class="product-card__meta">
            <span class="meta-item">${truckSvg()} ${product.deliveryDays <= 1 ? "Despacho hoy" : product.deliveryDays + " días"}</span>
            <span class="meta-item">${starSvg()} ${product.rating}</span>
          </div>

          <div class="product-card__footer">
            <div class="price-stack">
              <strong>${money.format(product.price)}</strong>
              ${product.oldPrice ? `<small>${money.format(product.oldPrice)}</small>` : ""}
            </div>

            <div class="card-proof" aria-label="${product.buyers} compradores">
              <span class="avatar-stack" aria-hidden="true"><i></i><i></i><i></i></span>
              <span class="proof-count">${product.buyers > 99 ? "99+" : product.buyers}</span>
            </div>
          </div>
        </div>
      </button>
    `;
  }

  function nearbyCard(product) {
    return `
      <a class="nearby-card" href="producto.html?id=${encodeURIComponent(product.id)}">
        <div class="nearby-card__media">
          <img src="${product.image}" alt="${product.title}" loading="lazy" />
          <span class="nearby-card__heart">${heartSvg()}</span>
        </div>
        <div class="nearby-card__body">
          <span class="nearby-card__category">${product.badge}</span>
          <span class="nearby-card__title">${product.title}</span>
          <span class="nearby-card__meta">${starSvg()} ${product.rating} · ${product.deliveryLabel}</span>
          <strong class="nearby-card__price">${money.format(product.price)}</strong>
        </div>
      </a>
    `;
  }

  function getFilteredProducts() {
    const q = state.query.trim().toLowerCase();

    return state.products.filter((product) => {
      const searchable = [product.title, product.subtitle, product.category, product.badge]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !q || searchable.includes(q);
      const matchesCategory = state.category === "all" || product.category === state.category;
      const matchesPrice = !state.maxPrice || product.price <= state.maxPrice;
      const matchesDelivery = !state.fastDelivery || product.deliveryDays <= 2;

      return matchesQuery && matchesCategory && matchesPrice && matchesDelivery;
    });
  }

  function renderProducts() {
    const filtered = getFilteredProducts();
    const featured = filtered.slice(0, 3);
    const ranked = [...filtered]
      .sort((a, b) => b.buyers - a.buyers)
      .slice(0, 3);

    els.productsGrid.innerHTML = featured.map(productCard).join("");
    els.nearbyGrid.innerHTML = ranked.map(nearbyCard).join("");

    els.productsGrid.querySelectorAll("[data-product-url]").forEach((card) => {
      card.addEventListener("click", () => {
        window.location.assign(card.dataset.productUrl);
      });
    });

    const hasProducts = filtered.length > 0;
    els.productsGrid.closest(".products-section").hidden = !hasProducts;
    els.nearbySection.hidden = !hasProducts;
    els.emptyState.hidden = hasProducts;
  }

  function closeMenu() {
    if (els.menuDetails) {
      els.menuDetails.open = false;
    }
    document.body.classList.remove("no-scroll");
  }

  function openFilters() {
    els.filterSheet.hidden = false;
    requestAnimationFrame(() => {
      els.filterSheet.classList.add("is-open");
    });
    document.body.classList.add("no-scroll");
  }

  function closeFilters() {
    els.filterSheet.classList.remove("is-open");
    document.body.classList.remove("no-scroll");

    window.setTimeout(() => {
      if (!els.filterSheet.classList.contains("is-open")) {
        els.filterSheet.hidden = true;
      }
    }, 190);
  }

  function syncPriceChips() {
    document.querySelectorAll("[data-price]").forEach((button) => {
      const value = button.dataset.price === "all" ? null : Number(button.dataset.price);
      button.classList.toggle("is-selected", value === state.maxPrice);
    });
  }

  function resetAllFilters() {
    state.query = "";
    state.category = "all";
    state.maxPrice = null;
    state.fastDelivery = false;

    els.searchInput.value = "";
    els.fastDeliveryFilter.checked = false;

    syncPriceChips();
    renderCategories();
    renderMenuCategories();
    renderProducts();
  }

  function wireEvents() {
    els.closeMenuButton.addEventListener("click", closeMenu);

    els.menuDetails.addEventListener("toggle", () => {
      document.body.classList.toggle("no-scroll", els.menuDetails.open);
    });

    document.querySelectorAll("[data-menu-placeholder]").forEach((button) => {
      button.addEventListener("click", () => {
        showToast(`${button.dataset.menuPlaceholder}: se construirá en una próxima etapa.`);
      });
    });

    els.searchInput.addEventListener("input", (event) => {
      state.query = event.target.value;
      renderProducts();
    });

    els.filterButton.addEventListener("click", openFilters);
    els.closeFilters.addEventListener("click", closeFilters);

    els.filterSheet.addEventListener("click", (event) => {
      if (event.target === els.filterSheet) {
        closeFilters();
      }
    });

    document.querySelectorAll("[data-price]").forEach((button) => {
      button.addEventListener("click", () => {
        state.maxPrice = button.dataset.price === "all" ? null : Number(button.dataset.price);
        syncPriceChips();
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
      syncPriceChips();
    });

    els.clearFilters.addEventListener("click", resetAllFilters);
    els.resetCategories.addEventListener("click", resetAllFilters);

    document.querySelectorAll("[data-reset-view]").forEach((button) => {
      button.addEventListener("click", resetAllFilters);
    });

    document.querySelectorAll("[data-category-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        state.category = button.dataset.categoryJump;
        state.query = "";
        els.searchInput.value = "";
        renderCategories();
        renderProducts();
        document.getElementById("featuredTitle").scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });

    document.querySelectorAll("[data-placeholder-tab]").forEach((button) => {
      button.addEventListener("click", () => {
        showToast(`${button.dataset.placeholderTab}: se construirá en la próxima etapa.`);
      });
    });
  }

  async function init() {
    [state.categories, state.products] = await Promise.all([
      window.TheCampingCatalog.getCategories(),
      window.TheCampingCatalog.getProducts()
    ]);

    renderCategories();
    renderMenuCategories();
    renderProducts();
    updateCartCount();
    wireEvents();

    let mouseDown = false;
    let startX = 0;
    let startScrollLeft = 0;

    els.productsGrid.addEventListener("mousedown", (event) => {
      mouseDown = true;
      startX = event.clientX;
      startScrollLeft = els.productsGrid.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      mouseDown = false;
    });

    els.productsGrid.addEventListener("mouseleave", () => {
      mouseDown = false;
    });

    els.productsGrid.addEventListener("mousemove", (event) => {
      if (!mouseDown) return;
      event.preventDefault();
      els.productsGrid.scrollLeft = startScrollLeft - (event.clientX - startX);
    });

    els.productsGrid.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      els.productsGrid.scrollLeft += event.deltaY;
    }, { passive: false });
  }

  init();
})();