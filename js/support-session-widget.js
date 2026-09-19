(function () {
  "use strict";

  const ACTIVE_CHAT_KEY = "theCampingActiveProductChat";
  const SESSION_PREFIX = "theCampingProductChat:";

  function getActiveConversation() {
    try {
      const pointerRaw = sessionStorage.getItem(ACTIVE_CHAT_KEY);
      if (!pointerRaw) return null;

      const pointer = JSON.parse(pointerRaw);
      if (!pointer || !pointer.productId) return null;

      const sessionRaw = sessionStorage.getItem(SESSION_PREFIX + pointer.productId);
      if (!sessionRaw) {
        sessionStorage.removeItem(ACTIVE_CHAT_KEY);
        return null;
      }

      const session = JSON.parse(sessionRaw);
      if (!session || session.status !== "open" || !session.product?.id) {
        sessionStorage.removeItem(ACTIVE_CHAT_KEY);
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  function removeWidget() {
    document.getElementById("activeConversationWidget")?.remove();
  }

  function getMountTarget() {
    const selectors = [
      ".product-intro",
      ".home-header",
      ".tracking-copy",
      ".route-card",
      ".support-heading"
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) return element;
    }

    return document.querySelector("main");
  }

  function openConversation(session) {
    const params = new URLSearchParams(window.location.search);
    const currentProductId = params.get("id");
    const onProductPage = /(?:^|\/)producto\.html$/.test(window.location.pathname);

    if (
      onProductPage &&
      currentProductId === session.product.id &&
      window.TheCampingSupportHook?.openCurrentConversation
    ) {
      window.TheCampingSupportHook.openCurrentConversation();
      return;
    }

    const url = new URL("producto.html", window.location.href);
    url.searchParams.set("id", session.product.id);
    url.searchParams.set("supportChat", "1");
    window.location.href = url.href;
  }

  function mountWidget() {
    removeWidget();

    const session = getActiveConversation();
    if (!session) return;

    const target = getMountTarget();
    if (!target) return;

    const wrapper = document.createElement("div");
    wrapper.id = "activeConversationWidget";
    wrapper.className = "conversation-resume-widget";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "conversation-resume-widget__button";
    button.setAttribute(
      "aria-label",
      `Seguí tu conversación sobre ${session.product.title}`
    );

    const icon = document.createElement("span");
    icon.className = "conversation-resume-widget__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/>
        <path d="M8 10h8M8 14h5"/>
      </svg>
    `;

    const copy = document.createElement("span");
    copy.className = "conversation-resume-widget__copy";

    const label = document.createElement("span");
    label.className = "conversation-resume-widget__label";
    label.textContent = "Seguí tu conversación sobre";

    const title = document.createElement("strong");
    title.textContent = session.product.title;

    copy.append(label, title);

    const chevron = document.createElement("span");
    chevron.className = "conversation-resume-widget__chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.innerHTML = '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>';

    button.append(icon, copy, chevron);
    button.addEventListener("click", () => openConversation(session));
    wrapper.appendChild(button);

    target.insertAdjacentElement("afterend", wrapper);
  }

  window.addEventListener("thecamping:product-support-started", mountWidget);
  window.addEventListener("thecamping:product-support-message", mountWidget);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountWidget, { once: true });
  } else {
    mountWidget();
  }
})();