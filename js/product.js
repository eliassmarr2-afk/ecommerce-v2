(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");
  let product;
  let quantity = 1;

  const money = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });

  const els = {
    image: document.getElementById("productImage"),
    badge: document.getElementById("productBadge"),
    category: document.getElementById("productCategory"),
    title: document.getElementById("productTitle"),
    subtitle: document.getElementById("productSubtitle"),
    rating: document.getElementById("productRating"),
    reviews: document.getElementById("productReviews"),
    stock: document.getElementById("productStock"),
    buyers: document.getElementById("productBuyers"),
    oldPrice: document.getElementById("oldPrice"),
    price: document.getElementById("productPrice"),
    discount: document.getElementById("discountBadge"),
    installments: document.getElementById("installments"),
    delivery: document.getElementById("deliveryLabel"),
    description: document.getElementById("productDescription"),
    features: document.getElementById("featureGrid"),
    barPrice: document.getElementById("barPrice"),
    quantity: document.getElementById("quantityValue"),
    decrease: document.getElementById("decreaseQty"),
    increase: document.getElementById("increaseQty"),
    addToCart: document.getElementById("addToCart"),
    favorite: document.getElementById("favoriteButton"),
    share: document.getElementById("shareButton"),
    toast: document.getElementById("toast")
  };

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
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

  function updateQuantity(nextQuantity) {
    quantity = Math.max(1, Math.min(product.stock || 99, nextQuantity));
    els.quantity.textContent = String(quantity);
    els.barPrice.textContent = money.format(product.price * quantity);
    els.decrease.disabled = quantity <= 1;
    els.increase.disabled = quantity >= product.stock;
  }

  function render() {
    const savings = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
    const installmentValue = Math.ceil(product.price / 6);

    document.title = `${product.title} · The Camping`;
    els.image.src = product.image;
    els.image.alt = product.title;
    els.badge.textContent = product.badge;
    els.category.textContent = product.category;
    els.title.textContent = product.title;
    els.subtitle.textContent = product.subtitle;
    els.rating.textContent = `★ ${product.rating}`;
    els.reviews.textContent = `${product.reviews} reseñas`;
    els.stock.textContent = `${product.stock} disponibles`;
    els.buyers.textContent = `Más de ${product.buyers} personas ya lo eligieron`;
    els.oldPrice.textContent = product.oldPrice ? money.format(product.oldPrice) : "";
    els.price.textContent = money.format(product.price);
    els.discount.textContent = savings ? `${savings}% OFF` : "";
    els.discount.hidden = !savings;
    els.installments.textContent = `o 6 cuotas estimadas de ${money.format(installmentValue)}`;
    els.delivery.textContent = product.deliveryLabel;
    els.description.textContent = product.description;
    els.features.innerHTML = product.features.map((feature) => `
      <div class="feature-item">
        <span aria-hidden="true">✓</span>
        <div>${feature}</div>
      </div>
    `).join("");

    updateQuantity(1);
  }

  function addToCart() {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = Math.min((existing.quantity || 1) + quantity, product.stock);
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity
      });
    }

    saveCart(cart);
    showToast(`${quantity} × ${product.title} agregado al carrito.`);
  }

  function wireEvents() {
    els.decrease.addEventListener("click", () => updateQuantity(quantity - 1));
    els.increase.addEventListener("click", () => updateQuantity(quantity + 1));
    els.addToCart.addEventListener("click", addToCart);

    els.favorite.addEventListener("click", () => {
      els.favorite.classList.toggle("is-favorite");
      const active = els.favorite.classList.contains("is-favorite");
      els.favorite.textContent = active ? "♥" : "♡";
      showToast(active ? "Guardado en favoritos." : "Quitado de favoritos.");
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
        if (error && error.name !== "AbortError") showToast("No se pudo compartir.");
      }
    });
  }

  async function init() {
    product = await window.TheCampingCatalog.getProductById(productId);
    render();
    wireEvents();
  }

  init();
})();