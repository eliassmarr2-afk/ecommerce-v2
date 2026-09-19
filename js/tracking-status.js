(function () {
  "use strict";

  const money = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  });

  const els = {
    main: document.querySelector(".status-main"),
    orderId: document.getElementById("orderId"),
    statusTitle: document.getElementById("statusTitle"),
    statusBadge: document.getElementById("statusBadge"),
    statusDetail: document.getElementById("statusDetail"),
    progressBar: document.getElementById("progressBar"),
    progressLabel: document.getElementById("progressLabel"),
    etaValue: document.getElementById("etaValue"),
    lastUpdate: document.getElementById("lastUpdate"),

    address: document.getElementById("deliveryAddress"),
    city: document.getElementById("deliveryCity"),
    recipient: document.getElementById("recipientName"),
    phone: document.getElementById("recipientPhone"),
    deliveryWindow: document.getElementById("deliveryWindow"),
    notes: document.getElementById("deliveryNotes"),
    paymentStatus: document.getElementById("paymentStatus"),

    productImage: document.getElementById("productImage"),
    productTitle: document.getElementById("productTitle"),
    productSubtitle: document.getElementById("productSubtitle"),
    productPrice: document.getElementById("productPrice"),
    productQuantity: document.getElementById("productQuantity"),

    trackingId: document.getElementById("trackingIdValue"),
    shippingMethod: document.getElementById("shippingMethod"),
    shippingCarrier: document.getElementById("shippingCarrier"),
    shippingService: document.getElementById("shippingService"),
    shippingEta: document.getElementById("shippingEta"),

    copyButton: document.getElementById("copyTrackingButton"),
    supportButton: document.getElementById("supportButton"),
    menuButton: document.getElementById("statusMenuButton"),
    toast: document.getElementById("statusToast")
  };

  let record = null;

  function getTrackingIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("trackingId") || "").trim();
  }

  function showToast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2200);
  }

  function renderNotFound() {
    els.main.innerHTML = `
      <section class="empty-tracking-state">
        <h1>No encontramos ese seguimiento</h1>
        <p>Revisá el código ingresado o volvé al buscador para intentar nuevamente.</p>
        <a href="seguimiento.html">Volver al buscador</a>
      </section>
    `;
  }

  function render(data) {
    record = data;
    document.title = `${data.status} · Pedido ${data.orderId} · The Camping`;

    els.orderId.textContent = data.orderId;
    els.statusTitle.textContent = data.status;
    els.statusBadge.textContent = data.status;
    els.statusDetail.textContent = data.statusDetail;

    const progress = Math.max(0, Math.min(100, Number(data.progress) || 0));
    els.progressLabel.textContent = `${progress}%`;
    requestAnimationFrame(() => {
      els.progressBar.style.width = `${progress}%`;
    });

    els.etaValue.textContent = `${data.etaLabel} · ${data.etaWindow}`;
    els.lastUpdate.textContent = data.lastUpdate;

    els.address.textContent = data.delivery.address;
    els.city.textContent = data.delivery.city;
    els.recipient.textContent = data.delivery.recipient;
    els.phone.textContent = data.delivery.phone;
    els.deliveryWindow.textContent = data.etaWindow;
    els.notes.textContent = data.delivery.notes;
    els.paymentStatus.textContent = data.paymentStatus;

    els.productImage.src = data.product.image;
    els.productImage.alt = data.product.title;
    els.productTitle.textContent = data.product.title;
    els.productSubtitle.textContent = data.product.subtitle;
    els.productPrice.textContent = money.format(data.product.price);
    els.productQuantity.textContent = `Cantidad: ${data.product.quantity}`;

    els.trackingId.textContent = data.trackingId;
    els.shippingMethod.textContent = data.shipment.method;
    els.shippingCarrier.textContent = data.shipment.carrier;
    els.shippingService.textContent = data.shipment.service;
    els.shippingEta.textContent = `${data.shipment.estimatedDate} · ${data.shipment.estimatedWindow}`;
  }

  async function copyTrackingId() {
    if (!record) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(record.trackingId);
        showToast("Número de seguimiento copiado.");
      } else {
        showToast(`Seguimiento: ${record.trackingId}`);
      }
    } catch {
      showToast(`Seguimiento: ${record.trackingId}`);
    }
  }

  function wireEvents() {
    els.copyButton.addEventListener("click", copyTrackingId);

    els.supportButton.addEventListener("click", () => {
      showToast("El canal de soporte se conectará en una próxima fase.");
    });

    els.menuButton.addEventListener("click", () => {
      showToast("Más opciones estarán disponibles próximamente.");
    });
  }

  async function init() {
    const trackingId = getTrackingIdFromUrl();

    if (!trackingId || !window.TheCampingTracking) {
      renderNotFound();
      return;
    }

    const data = await window.TheCampingTracking.getByTrackingId(trackingId);

    if (!data) {
      renderNotFound();
      return;
    }

    render(data);
    wireEvents();
  }

  init();
})();