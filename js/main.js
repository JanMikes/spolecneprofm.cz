/* ===========================================================================
   Společně pro Frýdek-Místek — homepage interactivity
   Vanilla JS, no dependencies. Recreates the behaviour of kit.jsx / Homepage.dc.html.
   =========================================================================== */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var on = function (el, ev, fn, opts) { el && el.addEventListener(ev, fn, opts || false); };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ----------------------------------------------------- Hero map texture */
  // Recreates MapTexture from kit.jsx — a faint Frýdek-Místek street-map weave.
  function buildMapTexture() {
    var svg = $("[data-map-texture]");
    if (!svg) return;
    var paths = "";
    var i, y, x;
    for (i = 0; i < 26; i++) {
      y = i * 46 + (i % 3) * 8;
      paths += '<path d="M-20,' + y + ' Q360,' + (y - 30) + ' 760,' + (y + 10) + ' T1480,' + (y - 12) + '"/>';
    }
    for (i = 0; i < 22; i++) {
      x = i * 70 + (i % 2) * 14;
      paths += '<path d="M' + x + ',-20 Q' + (x + 26) + ',300 ' + (x - 10) + ',640 T' + (x + 20) + ',1100"/>';
    }
    // viewBox covers the full extent the loops draw (x up to ~1504, y up to ~1160)
    // so preserveAspectRatio="…slice" tiles the weave across the whole hero.
    svg.setAttribute("viewBox", "0 0 1500 1160");
    svg.innerHTML = paths;
  }

  /* -------------------------------------------------------- Hero orbit ring */
  // Mouse-driven rotation, mirrors Homepage.dc.html's componentDidMount handler.
  function initOrbit() {
    var ring = $("[data-orbit-ring]");
    if (!ring || reduceMotion) return;
    on(window, "mousemove", function (ev) {
      var w = window.innerWidth || 1, h = window.innerHeight || 1;
      var nx = (ev.clientX / w) - 0.5;
      var ny = (ev.clientY / h) - 0.5;
      ring.style.transform = "rotate(" + ((nx * 40) + (ny * 12)) + "deg)";
    }, { passive: true });
  }

  /* --------------------------------------------------- Candidate card slider */
  function initCardSlider() {
    var track = $("[data-cardslider]");
    if (!track) return;
    var prev = $("[data-cardslider-prev]");
    var next = $("[data-cardslider-next]");
    function update() {
      var atStart = track.scrollLeft <= 4;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (prev) prev.hidden = atStart;
      if (next) next.hidden = atEnd;
    }
    function page(dir) {
      track.scrollBy({ left: dir * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
    }
    on(prev, "click", function () { page(-1); });
    on(next, "click", function () { page(1); });
    on(track, "scroll", update, { passive: true });
    on(window, "resize", update);
    update();
  }

  /* --------------------------------------------------- Candidate name table */
  function initTable() {
    var root = $("[data-table]");
    if (!root) return;
    var rows = $$(".cand-row", root);
    var total = rows.length;
    var step = 12;
    var countEl = $("[data-table-count]", root);
    var moreBtn = $("[data-table-more]", root);
    var allBtn = $("[data-table-all]", root);
    var shown = step;

    function render() {
      rows.forEach(function (r, i) { r.classList.toggle("is-hidden", i >= shown); });
      if (countEl) countEl.textContent = "Zobrazeno " + Math.min(shown, total) + " z " + total + " kandidátů";
      var collapsed = shown >= total;
      if (moreBtn) moreBtn.hidden = collapsed;
      if (allBtn) {
        allBtn.textContent = collapsed ? "Sbalit" : "Zobrazit všechny";
        allBtn.setAttribute("data-mode", collapsed ? "collapse" : "all");
      }
    }
    on(moreBtn, "click", function () { shown = Math.min(shown + step, total); render(); });
    on(allBtn, "click", function () {
      shown = (allBtn.getAttribute("data-mode") === "collapse") ? step : total;
      render();
      if (shown === step) root.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
    render();
  }

  /* ----------------------------------------------------- Aktuality filter */
  function initNewsFilter() {
    var root = $("[data-news]");
    var filters = $("[data-filters]");
    if (!root || !filters) return;
    var cards = $$(".news-card", root);
    var empty = $("[data-news-empty]", root);
    var pills = $$(".cat-pill", filters);

    function apply(cat) {
      var visible = 0;
      cards.forEach(function (c) {
        var match = cat === "all" || c.getAttribute("data-category") === cat;
        c.classList.toggle("is-hidden", !match);
        if (match) visible++;
      });
      if (empty) empty.classList.toggle("is-visible", visible === 0);
    }
    pills.forEach(function (p) {
      on(p, "click", function () {
        pills.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        p.setAttribute("aria-pressed", "true");
        apply(p.getAttribute("data-filter"));
      });
    });
  }

  /* --------------------------------------------------------- Proč slider */
  function initProcSlider() {
    var root = $("[data-proc]");
    if (!root) return;
    var textTrack = $("[data-proc-track-text]", root);
    var photoTrack = $("[data-proc-track-photo]", root);
    var dots = $$("[data-proc-dots] .proc__dot", root);
    var prev = $("[data-proc-prev]", root);
    var next = $("[data-proc-next]", root);
    var count = textTrack ? textTrack.children.length : 0;
    if (!count) return;

    var STORE = "spf_reason_idx";
    var idx = 0;
    try {
      var saved = parseInt(window.localStorage.getItem(STORE), 10);
      if (!isNaN(saved) && saved >= 0 && saved < count) idx = saved;
    } catch (e) {}

    function show(n) {
      idx = ((n % count) + count) % count;
      var pct = idx * 100;
      if (textTrack) textTrack.style.transform = "translateX(-" + pct + "%)";
      if (photoTrack) photoTrack.style.transform = "translateX(-" + pct + "%)";
      dots.forEach(function (d, k) { d.setAttribute("aria-current", k === idx ? "true" : "false"); });
      try { window.localStorage.setItem(STORE, String(idx)); } catch (e) {}
    }

    on(prev, "click", function () { show(idx - 1); reset(); });
    on(next, "click", function () { show(idx + 1); reset(); });
    dots.forEach(function (d, k) { on(d, "click", function () { show(k); reset(); }); });

    var timer = null;
    function reset() { stop(); start(); }
    function start() {
      if (reduceMotion || paused) return;
      stop(); // idempotent — never stack intervals
      timer = window.setInterval(function () { show(idx + 1); }, 6000);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    var paused = false;
    on(root, "mouseenter", function () { paused = true; stop(); });
    on(root, "mouseleave", function () { paused = false; start(); });
    on(document, "visibilitychange", function () {
      if (document.hidden) { stop(); return; }
      // Re-evaluate hover on return so autoplay isn't left permanently paused.
      if (typeof root.matches === "function" && !root.matches(":hover")) paused = false;
      start();
    });

    show(idx);
    start();
  }

  /* ------------------------------------------------------------ Mobile menu */
  function initMobileMenu() {
    var toggle = $("[data-menu-toggle]");
    var menu = $("[data-menu]");
    var bar = $(".topbar");
    if (!toggle || !menu || !bar) return;
    function setOpen(open) {
      menu.hidden = !open;
      bar.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    }
    on(toggle, "click", function () { setOpen(menu.hidden); });
    // close on link click
    $$(".mobile-menu__link, .mobile-menu__cta", menu).forEach(function (a) {
      on(a, "click", function () { setOpen(false); });
    });
    // close on Escape and when leaving mobile width
    on(document, "keydown", function (ev) { if (ev.key === "Escape") setOpen(false); });
    on(window, "resize", function () { if (window.innerWidth > 1000) setOpen(false); });
  }

  /* ----------------------------------------------------------------- Boot */
  function boot() {
    initMobileMenu();
    buildMapTexture();
    initOrbit();
    initCardSlider();
    initTable();
    initNewsFilter();
    initProcSlider();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
