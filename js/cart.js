(function () {
  "use strict";

  const els = {
    list: document.getElementById("cartItems"),
    empty: document.getElementById("cartEmpty"),
    total: document.getElementById("cartTotal"),
    count: document.getElementById("cartHeaderCount"),
    checkoutBar: document.getElementById("cartCheckoutBar"),
    checkout: document.getElementById("checkoutButton"),
    toast: document.getElementById("cartToast")
  };

  const money = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });

  function trashSvg() {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="m6 7 1 14h10l1-14"/><path d="M10 11v6M14 11v6"/></svg>';
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2200);
  }

  function itemTemplate(item) {
    const typeLabel = item.type === "combo" ? "Combo" : "Producto";
    const url = `producto.html?id=${encodeURIComponent(item.id)}`;

    return `
      <article class="cart-item" data-cart-id="${item.id}">
        <a class="cart-item__image-link" href="${url}" aria-label="Ver ${item.title}">
          <img class="cart-item__image" src="${item.image}" alt="${item.title}" />
        </a>

        <div class="cart-item__content">
          <div class="cart-item__top">
            <div>
              <span class="cart-item__type">${typeLabel}</span>
              <a class="cart-item__title" href="${url}">${item.title}</a>
            </div>

            <button class="cart-item__remove" type="button" data-cart-remove="${item.id}" aria-label="Quitar ${item.title}">
              ${trashSvg()}
            </button>
          </div>

          <strong class="cart-item__price">${money.format(item.price)}</strong>

          <div class="cart-item__bottom">
            <div class="cart-quantity" aria-label="Cantidad">
              <button type="button" data-cart-minus="${item.id}" aria-label="Disminuir cantidad">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-cart-plus="${item.id}" aria-label="Aumentar cantidad">+</button>
            </div>

            <span class="cart-item__subtotal">
              Subtotal
              <strong>${money.format(item.price * item.quantity)}</strong>
            </span>
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    const items = window.TheCampingCart.getItems();
    const count = window.TheCampingCart.getCount();
    const subtotal = window.TheCampingCart.getSubtotal();

    els.count.textContent = String(count);
    els.total.textContent = money.format(subtotal);
    els.empty.hidden = items.length > 0;
    els.checkoutBar.hidden = items.length === 0;
    els.list.innerHTML = items.map(itemTemplate).join("");

    els.list.querySelectorAll("[data-cart-minus]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = window.TheCampingCart.getItems().find(
          (candidate) => candidate.id === button.dataset.cartMinus
        );
        if (!item) return;
        window.TheCampingCart.setQuantity(item.id, item.quantity - 1);
      });
    });

    els.list.querySelectorAll("[data-cart-plus]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = window.TheCampingCart.getItems().find(
          (candidate) => candidate.id === button.dataset.cartPlus
        );
        if (!item) return;
        window.TheCampingCart.setQuantity(item.id, item.quantity + 1);
      });
    });

    els.list.querySelectorAll("[data-cart-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        window.TheCampingCart.remove(button.dataset.cartRemove);
        showToast("Producto quitado del carrito.");
      });
    });
  }

  window.addEventListener(window.TheCampingCart.eventName, render);

  els.checkout.addEventListener("click", () => {
    /*
     * Future Shopify seam:
     * replace this action with the provider checkout URL returned by Shopify.
     * Cart UI and quantity management remain provider-agnostic.
     */
    showToast("El checkout se conectará a Shopify en la migración.");
  });

  render();
})();