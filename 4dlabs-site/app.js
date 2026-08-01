/* 4Dlabs landing — draft v0.3
   Progressive enhancement only: the page is fully readable with JS off.
   Motion families per the module sheet: count-up numbers, module fade-in,
   pipeline light-flow — all disabled under prefers-reduced-motion. */

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

  /* ---------- Stats count-up (motion family 1: rolling numbers) ---------- */
  var counters = document.querySelectorAll(".stat dd[data-count]");
  function renderValue(el, value) {
    var decimals = Number(el.getAttribute("data-decimals") || 0);
    var text = value.toFixed(decimals);
    if (el.hasAttribute("data-comma")) {
      text = Number(text).toLocaleString("en-US");
    }
    el.textContent = text + (el.getAttribute("data-suffix") || "");
  }
  if (!reducedMotion && "IntersectionObserver" in window && counters.length) {
    var counterIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          counterIO.unobserve(entry.target);
          var el = entry.target;
          var target = parseFloat(el.getAttribute("data-count"));
          var start = null;
          var DURATION = 1300;
          function tick(ts) {
            if (start === null) start = ts;
            var t = Math.min((ts - start) / DURATION, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            renderValue(el, target * eased);
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterIO.observe(el); });
  }

  /* ---------- Pipeline light-flow (motion family 3) ---------- */
  var hpipe = document.querySelector(".hpipe");
  if (hpipe && !reducedMotion && "IntersectionObserver" in window) {
    hpipe.classList.add("prime");
    {
      var pipeIO = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              hpipe.classList.add("lit");
              pipeIO.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      pipeIO.observe(hpipe);
    }
  }

  /* ---------- Reveal on scroll (skipped for reduced motion) ---------- */
  if (!reducedMotion && "IntersectionObserver" in window) {
    var revealables = document.querySelectorAll(
      ".section .card, .step, .flagship, .team-row, .faq-list details, .stats-bar, .gradient-chart"
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
