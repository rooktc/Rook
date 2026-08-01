/* 4Dlabs landing — draft v0.1
   Progressive enhancement only: the page is fully readable with JS off —
   all accordion panels ship open in the HTML; JS collapses items 2+ on load. */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.classList.toggle("is-open", !open);
    });
    // Close the menu after navigating, and on Escape.
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  /* ---------- B2B accordion (first item open by default) ---------- */
  var triggers = document.querySelectorAll(".acc-trigger");
  // No-JS fallback ships every panel open; collapse all but the first now.
  triggers.forEach(function (btn, i) {
    if (i === 0) return;
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", "false");
    if (panel) panel.hidden = true;
    btn.closest(".acc-item").classList.remove("is-open");
  });
  triggers.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var panel = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (panel) panel.hidden = expanded;
      btn.closest(".acc-item").classList.toggle("is-open", !expanded);
    });
  });

  /* ---------- Reveal on scroll (skipped for reduced motion) ---------- */
  if (!reducedMotion && "IntersectionObserver" in window) {
    var revealables = document.querySelectorAll(
      ".section .card, .pipe-step, .step, .flagship, .team-row, .faq-list details, .stats-bar"
    );
    revealables.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
