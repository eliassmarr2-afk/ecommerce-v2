(function () {
  "use strict";

  const ACTIVE_CHAT_KEY = "theCampingActiveProductChat";
  const SESSION_PREFIX = "theCampingProductChat:";

  function getActiveConversation() {
    try {
      const pointerRaw = sessionStorage.getItem(ACTIVE_CHAT_KEY);

      if (pointerRaw) {
        const pointer = JSON.parse(pointerRaw);

        if (pointer?.productId) {
          const sessionRaw = sessionStorage.getItem(SESSION_PREFIX + pointer.productId);

          if (sessionRaw) {
            const session = JSON.parse(sessionRaw);

            if (session?.status === "open" && session.product?.id) {
              return session;
            }
          }
        }
      }

      // Backfill support for conversations created before the global pointer existed.
      const candidates = [];

      for (let index = 0; index < sessionStorage.length; index += 1) {
        const key = sessionStorage.key(index);
        if (!key || !key.startsWith(SESSION_PREFIX)) continue;

        try {
          const session = JSON.parse(sessionStorage.getItem(key) || "null");
          if (session?.status === "open" && session.product?.id) {
            candidates.push(session);
          }
        } catch {
          // Ignore malformed front-only demo sessions.
        }
      }

      candidates.sort((a, b) => {
        return new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime();
      });

      const session = candidates[0] || null;

      if (session) {
        sessionStorage.setItem(ACTIVE_CHAT_KEY, JSON.stringify({
          productId: session.product.id,
          productTitle: session.product.title,
          sessionKey: SESSION_PREFIX + session.product.id
        }));
        return session;
      }

      sessionStorage.removeItem(ACTIVE_CHAT_KEY);
      return null;
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
      ".support-heading",
      ".auth-access-panel",
      ".cart-header"
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

    const operatorUnreadCount = Math.max(
      0,
      Number(session.operatorUnreadCount || 0)
    );

    const status = document.createElement("span");
    status.className = "conversation-resume-widget__status";

    if (operatorUnreadCount > 0) {
      const badge = document.createElement("span");
      badge.className = "conversation-resume-widget__badge";
      badge.textContent = operatorUnreadCount > 99 ? "99+" : String(operatorUnreadCount);
      badge.setAttribute(
        "aria-label",
        `${operatorUnreadCount} ${operatorUnreadCount === 1 ? "respuesta nueva" : "respuestas nuevas"} del operador`
      );
      status.appendChild(badge);
    } else {
      const chevron = document.createElement("span");
      chevron.className = "conversation-resume-widget__chevron";
      chevron.setAttribute("aria-hidden", "true");
      chevron.innerHTML = '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>';
      status.appendChild(chevron);
    }

    button.append(icon, copy, status);
    button.addEventListener("click", () => openConversation(session));
    wrapper.appendChild(button);

    target.insertAdjacentElement("afterend", wrapper);
  }

  window.TheCampingConversationWidget = {
    refresh: mountWidget
  };

  window.addEventListener("thecamping:product-support-started", mountWidget);
  window.addEventListener("thecamping:product-support-message", mountWidget);
  window.addEventListener("thecamping:product-support-operator-update", mountWidget);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountWidget, { once: true });
  } else {
    mountWidget();
  }
})();