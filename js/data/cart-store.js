/**
 * THE CAMPING — V1 cart adapter
 *
 * UI contract intentionally isolated from the storage/provider implementation.
 * Today: localStorage.
 * Future: Shopify Cart API can replace this adapter while preserving callers.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "theCampingCart";
  const UPDATED_EVENT = "thecamping:cart-updated";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeItem(item) {
    const quantity = Math.max(1, Number(item?.quantity || 1));
    const stock = Math.max(1, Number(item?.stock || 99));

    return {
      id: String(item?.id || ""),
      title: String(item?.title || "Producto"),
      price: Number(item?.price || 0),
      image: String(item?.image || ""),
      category: String(item?.category || ""),
      type: item?.type === "combo" || item?.category === "combos" ? "combo" : "product",
      stock,
      quantity: Math.min(quantity, stock)
    };
  }

  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed)
        ? parsed.map(normalizeItem).filter((item) => item.id)
        : [];
    } catch {
      return [];
    }
  }

  function emit(items) {
    window.dispatchEvent(new CustomEvent(UPDATED_EVENT, {
      detail: {
        items: clone(items),
        count: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      }
    }));
  }

  function write(items) {
    const normalized = items.map(normalizeItem).filter((item) => item.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    emit(normalized);
    return normalized;
  }

  function getItems() {
    return clone(read());
  }

  function add(product, quantity = 1) {
    const items = read();
    const id = String(product?.id || "");
    if (!id) return getItems();

    const existing = items.find((item) => item.id === id);
    const stock = Math.max(1, Number(product?.stock || existing?.stock || 99));
    const increment = Math.max(1, Number(quantity || 1));

    if (existing) {
      existing.quantity = Math.min(existing.quantity + increment, stock);
      existing.stock = stock;
      existing.title = product.title || existing.title;
      existing.price = Number(product.price ?? existing.price);
      existing.image = product.image || existing.image;
      existing.category = product.category || existing.category;
      existing.type = product.category === "combos" ? "combo" : (existing.type || "product");
    } else {
      items.push(normalizeItem({
        id,
        title: product.title,
        price: product.price,
        image: product.image,
        category: product.category,
        type: product.category === "combos" ? "combo" : "product",
        stock,
        quantity: increment
      }));
    }

    return clone(write(items));
  }

  function setQuantity(id, quantity) {
    const items = read();
    const item = items.find((candidate) => candidate.id === String(id));
    if (!item) return getItems();

    const next = Number(quantity || 0);
    if (next <= 0) {
      return remove(id);
    }

    item.quantity = Math.min(Math.max(1, next), item.stock || 99);
    return clone(write(items));
  }

  function remove(id) {
    const items = read().filter((item) => item.id !== String(id));
    return clone(write(items));
  }

  function clear() {
    return clone(write([]));
  }

  function getCount() {
    return read().reduce((sum, item) => sum + item.quantity, 0);
  }

  function getSubtotal() {
    return read().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  window.TheCampingCart = {
    getItems,
    add,
    setQuantity,
    remove,
    clear,
    getCount,
    getSubtotal,
    eventName: UPDATED_EVENT
  };
})();