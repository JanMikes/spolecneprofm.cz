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

  /* -------------------------------------------------------- Hero orbit ring */
  // Ported from Homepage.dc.html: the pentagon vertex nearest the cursor reaches
  // toward it, the ring rotates to face the cursor, and each mark counter-rotates
  // (.hp-spin-fix) so logos stay upright.
  function initOrbit() {
    var ring = $("[data-orbit-ring]");
    if (!ring || reduceMotion) return;
    var poly = ring.querySelector("polygon");
    var dots = ring.querySelectorAll("circle");
    var svg = poly ? poly.ownerSVGElement : null;
    var baseVx = [300, 475.9, 408.7, 191.3, 124.1];
    var baseVy = [115, 242.8, 449.7, 449.7, 242.8];
    var off = [0, 0, 0, 0, 0], tgt = [0, 0, 0, 0, 0], pull = 34;
    var cursor = null, lx = null, ly = null, rot = null, fix = null;

    function loop() {
      if (svg && cursor) {
        var m = svg.getScreenCTM();
        if (m) {
          var inv = m.inverse();
          lx = cursor.x * inv.a + cursor.y * inv.c + inv.e;
          ly = cursor.x * inv.b + cursor.y * inv.d + inv.f;
          var best = 0, bd = Infinity;
          for (var k = 0; k < 5; k++) {
            var dd = (baseVx[k] - lx) * (baseVx[k] - lx) + (baseVy[k] - ly) * (baseVy[k] - ly);
            if (dd < bd) { bd = dd; best = k; }
          }
          for (var j = 0; j < 5; j++) tgt[j] = j === best ? 1 : 0;
        }
      }
      var pts = [];
      for (var i = 0; i < 5; i++) {
        off[i] += (tgt[i] - off[i]) * 0.09;
        var x = baseVx[i], y = baseVy[i];
        if (off[i] > 0.002 && lx != null) {
          var dx = lx - x, dy = ly - y, L = Math.hypot(dx, dy) || 1;
          x += off[i] * pull * dx / L;
          y += off[i] * pull * dy / L;
        }
        pts.push(x.toFixed(1) + "," + y.toFixed(1));
        if (dots[i]) { dots[i].setAttribute("cx", x.toFixed(1)); dots[i].setAttribute("cy", y.toFixed(1)); }
      }
      if (poly) poly.setAttribute("points", pts.join(" "));
      requestAnimationFrame(loop);
    }

    on(window, "mousemove", function (e) {
      cursor = { x: e.clientX, y: e.clientY };
      var w = window.innerWidth || 1, h = window.innerHeight || 1;
      var nx = (e.clientX / w) - 0.5, ny = (e.clientY / h) - 0.5;
      var r = (Math.atan2(ny, nx) * 180 / Math.PI) + 90;
      if (rot == null) rot = r;
      var delta = ((r - rot + 540) % 360) - 180;
      rot += delta;
      ring.style.transform = "rotate(" + rot + "deg)";
      if (!fix) fix = document.querySelectorAll(".hp-spin-fix");
      for (var i = 0; i < fix.length; i++) fix[i].style.transform = "rotate(" + (-rot) + "deg)";
    }, { passive: true });
    requestAnimationFrame(loop);
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

  /* ----------------------------------------------- Upcoming events highlight */
  // Mirrors UpcomingEvents from kit.jsx: the soonest still-upcoming event is
  // "filled" and flagged, past events are dimmed.
  function initEvents() {
    var cards = $$(".event-card[data-iso]");
    if (!cards.length) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var nextIdx = -1, nextTime = Infinity;
    cards.forEach(function (c, i) {
      var d = new Date(c.getAttribute("data-iso") + "T00:00:00");
      if (d < today) c.classList.add("event-card--past");
      else if (d.getTime() < nextTime) { nextTime = d.getTime(); nextIdx = i; }
    });
    if (nextIdx >= 0) cards[nextIdx].classList.add("event-card--next");
  }

  /* ----------------------------------------------------------------- Boot */
  function boot() {
    initMobileMenu();
    initOrbit();
    initCardSlider();
    initTable();
    initNewsFilter();
    initProcSlider();
    initEvents();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
