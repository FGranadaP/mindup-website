/* ============================================================
   MIND UP — Web interactions
   ============================================================ */

(function () {
  "use strict";

  /* ── Sticky nav background on scroll ── */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 16) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu toggle ── */
  const menuToggle = document.querySelector(".nav-mobile-toggle");
  const navLinks = document.querySelector(".nav-links");
  const closeMenu = () => {
    nav.classList.remove("is-menu-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  const openMenu = () => {
    nav.classList.add("is-menu-open");
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
  };
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      if (nav.classList.contains("is-menu-open")) closeMenu();
      else openMenu();
    });
  }
  // Close menu when an anchor link inside is tapped
  if (navLinks) {
    navLinks.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });
  }
  // Close menu on resize past mobile breakpoint
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) closeMenu();
  });

  /* ── Reveal-on-scroll (one animation per element, 20% threshold) ── */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

  /* ── Protocol tabs ── */
  const tabs = document.querySelectorAll(".protocol-tab");
  const panels = document.querySelectorAll(".protocol-panel");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const id = tab.getAttribute("data-tab");
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      panels.forEach((p) => {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === id);
      });
    });
  });

  // Hero trio cards deep-link to the protocol tab
  document.querySelectorAll(".hero-trio .card[data-product]").forEach((card) => {
    card.addEventListener("click", (e) => {
      const id = card.getAttribute("data-product");
      const target = document.querySelector(`.protocol-tab[data-tab="${id}"]`);
      if (target) {
        // Wait for smooth scroll to land then switch tab
        setTimeout(() => target.click(), 480);
      }
    });
  });

  /* ── Stack builder ── */
  const PRODUCTS = {
    focus: { name: "Focus", price: 89000, dose: "400mg", time: "Mañana" },
    calm:  { name: "Calm",  price: 85000, dose: "300mg", time: "Tarde" },
    sleep: { name: "Sleep", price: 79000, dose: "200mg", time: "Noche" },
  };
  const BUNDLE_PRICE_3 = 219000;
  const DISCOUNT_PCT_2 = 0.05;

  const stackOptions = document.querySelectorAll(".stack-option");
  const stackList = document.getElementById("stack-list");
  const subtotalEl = document.getElementById("stack-subtotal");
  const discountEl = document.getElementById("stack-discount");
  const totalEl = document.getElementById("stack-total");
  const savingsEl = document.getElementById("stack-savings");
  const pctEl = document.getElementById("stack-pct");
  const ctaEl = document.getElementById("stack-cta");

  const state = new Set(["focus"]); // Focus selected by default

  const copFmt = new Intl.NumberFormat("es-CO");
  function fmt(n) {
    return "$ " + copFmt.format(Math.round(n));
  }

  function render() {
    // Update option visual state
    stackOptions.forEach((opt) => {
      const id = opt.getAttribute("data-id");
      const on = state.has(id);
      opt.classList.toggle("is-on", on);
      opt.setAttribute("aria-pressed", on ? "true" : "false");
    });

    // Build list
    const ids = Array.from(state);
    stackList.innerHTML = "";
    if (ids.length === 0) {
      const row = document.createElement("div");
      row.className = "row is-empty";
      row.innerHTML = `<span class="name" style="font-style:italic;">Tu stack está vacío.</span><span class="v">—</span>`;
      stackList.appendChild(row);
    } else {
      ids.forEach((id) => {
        const p = PRODUCTS[id];
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `
          <span class="name">${p.name}<span class="eyebrow" style="display:block; margin-top:2px; color:var(--mineral);">${p.time} · ${p.dose}</span></span>
          <span class="v">${fmt(p.price)} / mes</span>
        `;
        stackList.appendChild(row);
      });
    }

    // Totals + bundle pricing
    //   1 product:  precio normal, sin descuento
    //   2 products: 5% off del subtotal
    //   3 products: bundle fijo $219.000 ("El Protocolo Claro")
    let subtotal = 0;
    ids.forEach((id) => (subtotal += PRODUCTS[id].price));
    let discount = 0;
    let total = subtotal;
    let pct = 0;
    let savingsLabel = "Ahorras con el protocolo completo";
    if (ids.length === 2) {
      discount = Math.round(subtotal * DISCOUNT_PCT_2);
      total = subtotal - discount;
      pct = 5;
      savingsLabel = "Combo de 2 fórmulas";
    } else if (ids.length === 3) {
      total = BUNDLE_PRICE_3;
      discount = subtotal - total;
      pct = Math.round((discount / subtotal) * 100);
      savingsLabel = "Precio Protocolo Claro · Ahorras " + fmt(discount);
    }

    subtotalEl.textContent = fmt(subtotal);
    discountEl.textContent = discount > 0 ? "— " + fmt(discount) : "— " + fmt(0);
    totalEl.textContent = fmt(total);

    const savingsLabelEl = document.getElementById("stack-savings-label");
    if (discount > 0) {
      savingsEl.classList.remove("is-hidden");
      pctEl.textContent = `${pct}%`;
      if (savingsLabelEl) savingsLabelEl.textContent = savingsLabel;
    } else {
      savingsEl.classList.add("is-hidden");
    }

    // CTA copy
    if (ids.length === 0) {
      ctaEl.innerHTML = `Elige una fórmula <span class="arrow"></span>`;
      ctaEl.disabled = true;
      ctaEl.style.opacity = "0.5";
      ctaEl.style.pointerEvents = "none";
    } else if (ids.length === 3) {
      ctaEl.innerHTML = `Iniciar el Protocolo Claro <span class="arrow"></span>`;
      ctaEl.disabled = false;
      ctaEl.style.opacity = "";
      ctaEl.style.pointerEvents = "";
    } else {
      ctaEl.innerHTML = `Empezar con ${ids.length === 1 ? PRODUCTS[ids[0]].name : "este stack"} <span class="arrow"></span>`;
      ctaEl.disabled = false;
      ctaEl.style.opacity = "";
      ctaEl.style.pointerEvents = "";
    }
  }

  stackOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      const id = opt.getAttribute("data-id");
      if (state.has(id)) state.delete(id);
      else state.add(id);
      render();
    });
  });

  ctaEl.addEventListener("click", () => {
    if (state.size === 0) return;
    const ids = Array.from(state).map((id) => PRODUCTS[id].name).join(" + ");
    // In production this would route to checkout. For demo, animate confirmation.
    const original = ctaEl.innerHTML;
    ctaEl.innerHTML = `Listo · ${ids} <span class="arrow"></span>`;
    ctaEl.style.background = "var(--ink)";
    ctaEl.style.color = "var(--bone)";
    setTimeout(() => {
      ctaEl.innerHTML = original;
      ctaEl.style.background = "";
      ctaEl.style.color = "";
    }, 2200);
  });

  render();

  /* ── Newsletter form ── */
  const newsForm = document.getElementById("news-form");
  if (newsForm) {
    newsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      newsForm.classList.add("is-sent");
    });
  }

  /* ── Footer clock ── */
  const yc = document.getElementById("year-clock");
  if (yc) {
    const fmtClock = () => {
      const d = new Date();
      const opts = { hour: "2-digit", minute: "2-digit", hour12: false };
      const t = d.toLocaleTimeString("es-CL", opts);
      yc.textContent = `Latam · ${t}`;
    };
    fmtClock();
    setInterval(fmtClock, 30000);
  }

  /* ── Smooth anchor scrolling is handled by CSS `scroll-behavior: smooth` + native anchors. ── */
})();
