/**
 * THE CAMPING — Tracking demo adapter
 *
 * This file is intentionally isolated from the tracking UI.
 * In production it can be replaced by a public Protocol Data / Shopify
 * projection without rewriting seguimiento-estado.html.
 */
(function () {
  "use strict";

  const records = {
    "123456": {
      trackingId: "123456",
      orderId: "TC-1048",
      status: "En camino",
      statusTone: "in-transit",
      statusDetail: "Tu pedido salió del centro de distribución y está viajando hacia el domicilio de entrega.",
      progress: 72,
      etaLabel: "Hoy",
      etaWindow: "14:00–18:00",
      lastUpdate: "Actualizado hoy · 11:48",
      paymentStatus: "Pagado",

      delivery: {
        address: "Av. Santa Fe 3250, CABA",
        recipient: "Martín López",
        phone: "+54 11 5555-0184",
        notes: "Entregar en recepción.",
        city: "Ciudad Autónoma de Buenos Aires"
      },

      shipment: {
        method: "Envío estándar a domicilio",
        carrier: "Andreani",
        service: "Entrega a domicilio",
        estimatedDate: "Hoy",
        estimatedWindow: "14:00–18:00"
      },

      product: {
        id: "combo-escapada-2",
        title: "Combo Escapada para 2",
        subtitle: "Carpa + 2 sillas + anafe portátil",
        price: 189990,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=82"
      }
    }
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  window.TheCampingTracking = {
    async getByTrackingId(trackingId) {
      const normalized = String(trackingId || "").trim();
      return records[normalized] ? clone(records[normalized]) : null;
    }
  };
})();