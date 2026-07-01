/* ============================================================
   Woojun Jung portfolio — interactions
   - landing → profile scroll-morph (index)
   - alternating Researcher / Designer tagline (index)
   - reveal-on-scroll (all)
   - work / publication filters (projects, research)
   - working contact form via mailto (index)
   ============================================================ */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var siteLenis = null;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* ---------- Per-page teardown registry ----------
     The client router (initRouter) swaps page content in place without a
     document reload, so per-page setup runs many times against one persistent
     Lenis instance. Anything that outlives the swapped DOM — Lenis scroll
     subscriptions, window listeners, intervals, observers — must be undone
     before the next page boots, or handlers pile up and leak. Listeners bound
     to elements inside <main>/<body> need no cleanup: replacing the DOM drops
     them. */
  var pageCleanups = [];
  function track(fn) { pageCleanups.push(fn); }
  function runCleanups() {
    pageCleanups.forEach(function (fn) { try { fn(); } catch (e) {} });
    pageCleanups = [];
  }

  function getScrollY() {
    return siteLenis ? siteLenis.scroll : (window.scrollY || 0);
  }

  function bindScroll(handler) {
    if (siteLenis) {
      siteLenis.on("scroll", handler);
      track(function () { siteLenis.off("scroll", handler); });
    } else {
      window.addEventListener("scroll", handler, { passive: true });
      track(function () { window.removeEventListener("scroll", handler); });
    }
  }

  /* Window listener that auto-detaches on the next page swap. */
  function onWindow(type, handler, opts) {
    window.addEventListener(type, handler, opts);
    track(function () { window.removeEventListener(type, handler, opts); });
  }

  function readScrollToken(name, fallback) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    var n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  /* ---------- Smooth scroll (Lenis — reference site uses this for inertial wheel) ---------- */
  function initSmoothScroll() {
    if (prefersReduced || typeof Lenis === "undefined") return;
    document.documentElement.classList.add("lenis", "lenis-smooth");

    var morphMs = readScrollToken("--dur-shell-morph", 0);
    var duration = morphMs > 0 ? morphMs / 1000 : readScrollToken("--scroll-duration", 1.35);
    if (duration > 10) duration /= 1000; /* guard if someone uses ms in the token */
    var profileDur = 2.5;

    siteLenis = new Lenis({
      lerp: readScrollToken("--scroll-lerp", 0.08),
      duration: duration,
      smoothWheel: true,
      wheelMultiplier: readScrollToken("--scroll-wheel", 0.85),
      touchMultiplier: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }
    });

    function raf(time) {
      siteLenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      var hash = link.getAttribute("href");
      if (!hash || hash === "#") return;
      if (hash === "#top") {
        e.preventDefault();
        siteLenis.scrollTo(0, { duration: duration });
        return;
      }
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      siteLenis.scrollTo(target, {
        duration: hash === "#profile" ? profileDur : duration
      });
    });

    if (location.hash) {
      var el = document.querySelector(location.hash);
      if (el) siteLenis.scrollTo(el, { immediate: true });
    }
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || prefersReduced) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
    track(function () { io.disconnect(); });
  }

  /* ---------- Landing → profile morph (index only) ---------- */
  function initMorph() {
    var name = document.getElementById("morphName");
    var tag = document.getElementById("morphTag");
    var tagFigure = tag ? tag.querySelector(".morph__tag-figure") : null;
    var nav = document.getElementById("morphNav");
    var bg = document.getElementById("morphBg");
    var cue = document.getElementById("scrollCue");
    var dockLogo = document.getElementById("morphDockLogo");
    if (!name || !nav) return;

    // Nav highlight: nothing is active at the landing; the Profile link lights
    // up once the profile section scrolls up to the docked header.
    var profileLink = nav.querySelector('a[href="#profile"]');
    var profileSection = document.getElementById("profile");

    // Arriving straight at the profile (via the Research/Projects nav, which
    // links to index.html#profile) should show Profile already active, so the
    // cross-page view transition has a `nav-active` element on this side for the
    // highlight to glide onto rather than fade in.
    if (profileLink && location.hash === "#profile") {
      profileLink.setAttribute("aria-current", "page");
    }

    var ticking = false;
    var firstRender = true;
    var lastDocked = null;
    function render() {
      ticking = false;
      var vh = window.innerHeight;
      var scrollY = getScrollY();
      var p = clamp(scrollY / (vh * 1.0), 0, 1);
      var profileTop = profileSection ? profileSection.getBoundingClientRect().top : Infinity;
      var profileIsDocked = location.hash === "#profile" && profileTop <= vh * 0.5;
      // Arriving at #profile: keep the shell docked while the Profile section is
      // actually in view. Lenis/router swaps can briefly report a stale scroll
      // value after navigation; without this guard p dips below 1 and the hero
      // logo flashes a few pixels below the dock logo before snapping back.
      if ((firstRender && location.hash === "#profile") || profileIsDocked) p = 1;
      var e = easeOut(p);

      // name's CSS box is laid out at hero size (see .morph__name); scale DOWN to
      // dock it so the raster is always sampled from a large source — scaling up
      // a small raster is what made the docked→hero direction look blurry.
      // Dock to the EXACT logo box used by the static site-header on
      // Research/Projects: 34px tall (see .site-header__logo img), top edge at
      // 36px (24px header padding + 12px img margin-top). Driving the scale off
      // the rendered height keeps this right at every breakpoint and matches the
      // logo art's true aspect ratio, so all three pages' headers line up.
      var heroH = name.offsetHeight || 110;                  // rendered logo height (unaffected by transform)
      var dockedTargetH = 34;                                // matches .site-header__logo img height
      var dockedScale = dockedTargetH / heroH;
      var scale = lerp(1, dockedScale, e);
      var nameY = lerp(vh * 0.25, 36, e);
      name.style.transform = "translate(-50%, " + nameY + "px) scale(" + scale + ")";

      var navY = lerp(vh * 0.84, 94, e);                     // matches static header nav-pill top
      nav.style.transform = "translate(-50%, " + navY + "px)";

      // Position the figure+tagline block just below the name's RESTING bottom
      // edge (p=0: scale=1, nameY=vh*0.30) — i.e. heroH below where the hero
      // logo sits at the top of the page. Deriving this from the name's actual
      // measured height (rather than a guessed vh constant) is what keeps the
      // figure clear of the wordmark at every viewport: a static vh anchor broke
      // down on wide-short viewports, where the (width-breakpoint-driven) logo
      // box runs taller than the vh gap a fixed percentage assumed. Computed off
      // the RESTING values (not the live, scroll-coupled nameY/scale) so the
      // block doesn't drift while it dissolves away — same fixed spot every
      // frame, like the old static value, just measured instead of guessed.
      if (tag && tagFigure) {
        var nameRestBottom = vh * 0.25 + heroH;
        var figureGap = parseFloat(getComputedStyle(tagFigure).marginBottom) || 0;
        var tagY = nameRestBottom + 23 + tagFigure.offsetHeight + figureGap;
        tag.style.transform = "translate(-50%, " + tagY + "px)";
      }

      // Hand the cross-page `site-logo` identity to whichever logo is actually on
      // screen: the big #morphName while it animates (so the logo-return to the
      // landing still enlarges/descends), and the natively-34px dock logo once
      // fully docked (so Profile <-> Research/Projects morphs between equal 34px
      // boxes — no size wobble). #morphName's docked render and the dock logo are
      // pixel-identical, so the swap at full-dock is invisible. Write on change only.
      var fullyDocked = p >= 1;
      if (dockLogo && fullyDocked !== lastDocked) {
        lastDocked = fullyDocked;
        name.style.opacity = fullyDocked ? "0" : "1";
        dockLogo.style.opacity = fullyDocked ? "1" : "0";
        name.style.setProperty("view-transition-name", fullyDocked ? "none" : "site-logo");
        dockLogo.style.setProperty("view-transition-name", fullyDocked ? "site-logo" : "none");
      }

      // Illustration + scroll cue fade away over the first part of the morph.
      var dissolve = clamp(p / 0.05, 0, 1);
      if (tag) {
        tag.style.opacity = prefersReduced ? (scrollY > 0 ? "0" : "1") : String(1 - dissolve);
      }
      if (bg) bg.style.opacity = String(e);
      if (cue) cue.style.opacity = prefersReduced ? (scrollY > 0 ? "0" : "1") : String(1 - dissolve);

      if (profileLink && profileSection) {
        var reached = profileTop <= vh * 0.25;
        // Don't strip the #profile-arrival highlight on the very first render:
        // the fragment scroll may not have applied yet, and the cross-page view
        // transition snapshots this paint — we want Profile already lit then.
        if (reached) profileLink.setAttribute("aria-current", "page");
        else if (!(firstRender && location.hash === "#profile")) profileLink.removeAttribute("aria-current");
      }
      firstRender = false;
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(render); }
    }
    bindScroll(onScroll);
    onWindow("resize", render);
    render();
  }

  /* ---------- Alternating tagline (index only): fade-out, hold, fade-in ---------- */
  function initTagline() {
    var imgs = document.querySelectorAll("#morphTag .tagline-img");
    if (imgs.length < 2 || prefersReduced) return;

    // Keep in sync with .tagline-img transition duration in site.css.
    // Timed to the APNG cycle (3894ms): first cycle is shorter, then loops.
    var fadeMs = 700;
    var holdMs = 300;
    var initialVisibleMs = 2400;
    var loopVisibleMs = 2794;
    var i = 0; // researcher visible first
    var visibleTimer = null;
    var swapTimer = null;
    var active = true;
    var cycle = 0;

    function scheduleNext() {
      if (!active) return;
      var visibleMs = cycle === 0 ? initialVisibleMs : loopVisibleMs;
      visibleTimer = setTimeout(function () {
        if (!active) return;
        var outgoing = i;
        imgs[outgoing].classList.add("is-faded");
        swapTimer = setTimeout(function () {
          if (!active) return;
          i = (outgoing + 1) % imgs.length;
          imgs[i].classList.remove("is-faded");
          cycle += 1;
          scheduleNext();
        }, fadeMs + holdMs);
      }, visibleMs);
    }

    scheduleNext();
    track(function () {
      active = false;
      clearTimeout(visibleTimer);
      clearTimeout(swapTimer);
    });
  }

  /* ---------- Interests: randomly-placed floating cards behind a centre-pinned intro ---------- */
  function initInterestsFloat() {
    var section = document.getElementById("interests");
    if (!section) return;
    var field = document.getElementById("interestsField");
    if (!field) return;
    var cards = Array.prototype.slice.call(field.querySelectorAll(".float-card"));
    if (!cards.length) return;

    var cardGapPx = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--space-12")
    ) || 40;

    // Roll each card's randomness ONCE per page load; resize only re-derives
    // pixels from these stored fractions, so a resize won't reshuffle the scene.
    cards.forEach(function (card) {
      card._rand = {
        w: 0.5, // fix the width to be consistent for all cards (will result in mid value within the size range)
        x: 0.5  // horizontal position at center of the viewport
      };
    });

    var vh = window.innerHeight;
    function layout() {
      vh = window.innerHeight;
      var fieldW = field.clientWidth;
      var narrow = fieldW <= 640;
      var pad = Math.max(14, fieldW * 0.03);
      var cardWidthScale = 0.85;
      var minW = (narrow ? fieldW * 0.7 : Math.max(210, fieldW * 0.15)) * cardWidthScale;
      var maxW = (narrow ? fieldW * 0.8 : Math.min(420, fieldW * 0.30)) * cardWidthScale;
      var y = vh * 0.1; // first card starts just below the fold
      cards.forEach(function (card) {
        var r = card._rand;
        var w = Math.round(minW + r.w * (maxW - minW));
        var img = card.querySelector("img");
        var ratio = (img && img.naturalWidth) ? img.naturalHeight / img.naturalWidth : 0.72;
        var maxLeft = Math.max(pad, fieldW - w - pad);
        card.style.width = w + "px";
        card.style.left = Math.round(pad + r.x * (maxLeft - pad)) + "px";
        card.style.top = Math.round(y) + "px";
        var h = card.offsetHeight || Math.round(w * ratio);
        y += h + cardGapPx;
      });
      field.style.height = Math.round(y + vh * 1.1) + "px";
    }

    // No scroll-driven JS for the intro: it's centred by CSS (sticky box +
    // flex centering), which locks it to the viewport centre the instant the
    // section arrives there — zero lag, nothing to "catch up" on.
    layout();                       // immediate (fallback ratios)
    onWindow("load", layout);       // again once images report real ratios
    onWindow("resize", layout);
  }

  /* ---------- Filters (projects / research) ---------- */
  function initFilters(filtersId, gridId, emptyId) {
    var filters = document.getElementById(filtersId);
    var grid = document.getElementById(gridId);
    if (!filters || !grid) return;
    var cards = Array.prototype.slice.call(grid.children);
    var empty = document.getElementById(emptyId);
    var buttons = filters.querySelectorAll(".filter");

    function apply(cat) {
      var shown = 0;
      cards.forEach(function (card) {
        var cats = (card.getAttribute("data-cat") || "").split(/\s+/);
        var match = cat === "all" || cats.indexOf(cat) !== -1;
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      if (empty) empty.style.display = shown ? "none" : "block";
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.remove("is-active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        apply(btn.getAttribute("data-filter"));
      });
    });

    // Deep link: ?topic=<filter> selects that filter on load.
    var topic = new URLSearchParams(window.location.search).get("topic");
    if (topic) {
      var target = filters.querySelector('.filter[data-filter="' + topic.replace(/[^a-z-]/gi, "") + '"]');
      if (target) target.click();
    }
  }

  /* ---------- Contact form → opens the visitor's mail client ---------- */
  function initContact() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    var subject = document.getElementById("cfSubject");
    var email = document.getElementById("cfEmail");
    var body = document.getElementById("cfBody");
    var status = document.getElementById("cfStatus");
    var TO = "smallthingsmatter729@gmail.com,woojoon@korea.ac.kr";
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fromEmail = (email.value || "").trim();
      var msg = (body.value || "").trim();
      if (!fromEmail || !emailPattern.test(fromEmail)) {
        status.textContent = "Add a valid email so I can reply.";
        status.classList.add("is-error");
        email.focus();
        return;
      }
      if (!msg) {
        status.textContent = "Add a short message before sending.";
        status.classList.add("is-error");
        body.focus();
        return;
      }
      status.classList.remove("is-error");
      var subj = (subject.value || "").trim() || "Hello from your portfolio";
      var fullMsg = "From: " + fromEmail + "\n\n" + msg;
      var href = "mailto:" + TO +
        "?subject=" + encodeURIComponent(subj) +
        "&body=" + encodeURIComponent(fullMsg);
      window.location.href = href;
      status.textContent = "Opening your mail app…";
      setTimeout(function () {
        status.textContent = "Thanks — your draft is ready to send.";
      }, 1200);
    });
  }

  /* ---------- Restore smooth scrolling after an initial #hash jump settles ---------- */
  function initHashJumpFix() {
    if (!location.hash) return;
    window.addEventListener("load", function () {
      requestAnimationFrame(function () {
        document.documentElement.style.scrollBehavior = "";
        if (siteLenis) {
          var target = document.querySelector(location.hash);
          if (target) siteLenis.scrollTo(target, { immediate: true });
        }
      });
    });
  }

  /* ---------- Single-document router ----------
     The three pages are separate .html files, but instead of letting the
     browser do a full cross-document navigation (reload + re-parse CSS +
     re-run this script + Lenis re-init), we fetch the target's HTML, swap the
     <body> in place, and wrap that swap in a SAME-document view transition.

     Why this and not the cross-document `@view-transition` (still in site.css
     as the no-JS fallback): one persistent Lenis instance and one animation
     engine drive *every* transition, so landing<->profile (scroll-morph) and
     landing<->research/projects (page swap) finally feel like one notebook —
     and same-document view transitions are far more widely supported than
     cross-document ones. The shared `view-transition-name`s already on
     .site-header__logo / .morph__name / .nav-pill make the shell morph for
     free; we just reuse them. */
  var INTERNAL = /(^|\/)(index|research|projects)\.html$/;
  var pageCache = {};
  var canFly = typeof document.createElement("div").animate === "function";

  function easeToken() {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--ease-out").trim() || "cubic-bezier(0.22,0.61,0.36,1)";
  }

  function goScroll(target) {
    if (siteLenis) siteLenis.scrollTo(target, { immediate: true });
    else if (typeof target === "number") window.scrollTo(0, target);
    else if (target && target.scrollIntoView) target.scrollIntoView();
  }

  function swapDocument(doc, hash) {
    // Drop the trailing <script> tags from the fetched body (they'd be inert
    // anyway — scripts inserted via innerHTML don't execute — but we don't want
    // dead nodes). Everything else (morph overlay or static header, main,
    // footer) carries over wholesale.
    var incoming = doc.body;
    incoming.querySelectorAll("script").forEach(function (s) { s.remove(); });

    document.body.replaceChildren.apply(
      document.body,
      Array.prototype.slice.call(incoming.childNodes)
    );

    // Match the new page's <body> identity + document metadata.
    var page = incoming.getAttribute("data-page");
    if (page) document.body.setAttribute("data-page", page);
    if (incoming.id) document.body.id = incoming.id;
    else document.body.removeAttribute("id");
    if (doc.title) document.title = doc.title;
    var newDesc = doc.querySelector('meta[name="description"]');
    var curDesc = document.querySelector('meta[name="description"]');
    if (newDesc && curDesc) curDesc.setAttribute("content", newDesc.getAttribute("content"));

    // Lenis caches scroll bounds from the old content — refresh, then place the
    // viewport: at a #hash target if present (e.g. index.html#profile from a
    // nav tab), otherwise at the top of the fresh page. This MUST happen before
    // bootPage(): the index morph's render() positions the fixed #morphName from
    // the current scroll, so if we boot first it reads the *outgoing* page's
    // stale scroll and docks the logo at the wrong spot — which is then where
    // the flying clone would be told to land. goScroll updates siteLenis.scroll
    // synchronously, so render() below sees the final position.
    if (siteLenis) siteLenis.resize();
    var anchor = hash && document.querySelector(hash);
    if (anchor) goScroll(anchor);
    else goScroll(0);

    bootPage();
  }

  /* ---------- Clone-and-fly shell morph ----------
     The visible logo differs by page/state: the static .site-header__logo on
     Research/Projects, and on the index either the hero #morphName or, once
     docked (or arriving at #profile), the 34px #morphDockLogo. Resolve to
     whichever is actually on screen. `hash` is passed when resolving the
     INCOMING page (its is-morphing class forces logo opacity to 0, so we can't
     read opacity — we infer dock state from the #profile hash instead). */
  function visibleLogo(hash) {
    var header = document.querySelector(".site-header__logo");
    if (header) return header;
    var dock = document.getElementById("morphDockLogo");
    var name = document.getElementById("morphName");
    if (hash !== undefined) return hash === "#profile" ? (dock || name) : (name || dock);
    if (dock && parseFloat(getComputedStyle(dock).opacity) > 0.5) return dock;
    return name || dock;
  }

  function rectOf(el) {
    if (!el) return null;
    var r = el.getBoundingClientRect();
    return (r.width && r.height) ? r : null;
  }

  // Logo endpoint = the inner <img>'s box, not the link/div wrapper. The static
  // .site-header__logo wraps its img in margin (12px 0 8px), so the wrapper box
  // is taller than — and offset from — the visible glyph, while #morphName has
  // no such margin. Measuring the img on both ends makes the FLIP fly between
  // the actual glyphs, so it lands pixel-aligned with the revealed logo.
  function logoRect(el) {
    if (!el) return null;
    return rectOf(el.querySelector("img") || el);
  }

  // Box of `link` relative to `nav`'s top-left (transform-independent enough for
  // our case — the nav is only ever translated, never scaled). getBoundingClientRect
  // gives border-box coords, but the chip is position:absolute and resolves its
  // top/left against the nav's PADDING box — so subtract the nav border, else the
  // gliding chip lands 1px below/right of the resting active-link background.
  function chipBox(link, nav) {
    if (!link || !nav) return null;
    var l = link.getBoundingClientRect(), n = nav.getBoundingClientRect();
    var cs = getComputedStyle(nav);
    var bt = parseFloat(cs.borderTopWidth) || 0, bl = parseFloat(cs.borderLeftWidth) || 0;
    return { left: l.left - n.left - bl, top: l.top - n.top - bt, width: l.width, height: l.height };
  }

  // Fly a live clone of `src` from `from` rect to `to` rect; resolves when done.
  // `prep(clone)` runs after the clone is in the DOM (used to inject the gliding
  // nav chip), so its own sub-animations start on the same frame as the flight.
  function flyClone(src, from, to, dur, ease, prep) {
    return new Promise(function (resolve) {
      var c = src.cloneNode(true);
      c.removeAttribute("id");
      c.setAttribute("aria-hidden", "true");
      c.classList.add("morph-fly");
      var s = c.style;
      s.position = "fixed";
      s.left = from.left + "px";
      s.top = from.top + "px";
      s.width = from.width + "px";
      s.height = from.height + "px";
      s.margin = "0";
      s.transformOrigin = "top left";
      s.transform = "none";
      s.zIndex = "9999";
      document.body.appendChild(c);
      if (prep) prep(c);
      var dx = to.left - from.left, dy = to.top - from.top, sc = to.width / from.width;
      var anim = c.animate(
        [{ transform: "none" },
         { transform: "translate(" + dx + "px," + dy + "px) scale(" + sc + ")" }],
        { duration: dur, easing: ease, fill: "forwards" }
      );
      var fin = function () { c.remove(); resolve(); };
      anim.finished.then(fin, fin);
    });
  }

  function morphSwap(doc, hash) {
    // Capture outgoing shell geometry BEFORE anything changes. (History is
    // already updated by navigate(); pushState doesn't touch the DOM, so the
    // outgoing rects are still valid here.)
    var oldLogo = visibleLogo(), oldNav = document.querySelector(".nav-pill");
    var oldLogoR = logoRect(oldLogo), oldNavR = rectOf(oldNav);
    // Outgoing active-chip box (within the nav), for the gliding highlight.
    var oldChip = oldNav && chipBox(oldNav.querySelector('a[aria-current="page"]'), oldNav);

    document.body.classList.add("is-morphing"); // hold real shell invisible

    swapDocument(doc, hash);

    // Incoming resting geometry, measured after the swap + scroll settle.
    var newLogo = visibleLogo(hash), newNav = document.querySelector(".nav-pill");
    var newLogoR = logoRect(newLogo), newNavR = rectOf(newNav);
    var newChip = newNav && chipBox(newNav.querySelector('a[aria-current="page"]'), newNav);

    var dur = readScrollToken("--dur-shell-nav", 720);
    var ease = easeToken();
    var flights = [];
    if (oldLogo && oldLogoR && newLogoR) flights.push(flyClone(oldLogo, oldLogoR, newLogoR, dur, ease));
    if (oldNav && oldNavR && newNavR) {
      flights.push(flyClone(oldNav, oldNavR, newNavR, dur, ease, function (clone) {
        // The clone is a copy of the OLD nav, so it carries the old active
        // link's baked-in background — strip it, then glide a single chip from
        // the old active item's box to the new one (matching the reference's
        // sliding indicator). If either end is missing (e.g. nothing active on
        // the landing hero), skip the glide; the revealed nav shows the rest
        // state. The chip rides INSIDE the clone, so the pill's own flight and
        // the chip's slide compose into one screen-space glide.
        var marked = clone.querySelector('a[aria-current="page"]');
        if (marked) marked.removeAttribute("aria-current");
        if (!oldChip || !newChip) return;
        var chip = document.createElement("span");
        chip.className = "nav-pill__chip";
        chip.style.top = oldChip.top + "px";
        chip.style.height = oldChip.height + "px";
        clone.insertBefore(chip, clone.firstChild);
        chip.animate(
          [{ left: oldChip.left + "px", width: oldChip.width + "px" },
           { left: newChip.left + "px", width: newChip.width + "px" }],
          { duration: dur, easing: ease, fill: "forwards" }
        );
      }));
    }

    // Content rises + fades in (incoming only — the shell carries continuity).
    var main = document.querySelector("main");
    if (main) {
      main.style.animation = "vt-content-in " + readScrollToken("--dur-content-nav", 460) +
        "ms var(--ease-vt-content) both";
      main.addEventListener("animationend", function clear() {
        main.style.animation = ""; main.removeEventListener("animationend", clear);
      });
    }

    var reveal = function () { document.body.classList.remove("is-morphing"); };
    if (flights.length) Promise.all(flights).then(reveal, reveal);
    else reveal();
  }

  function navigate(href, push) {
    var url;
    try { url = new URL(href, location.href); } catch (e) { location.href = href; return; }

    var run = function (html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      if (push) history.pushState({ spa: true }, "", url.href);
      if (canFly && !prefersReduced) morphSwap(doc, url.hash);
      else swapDocument(doc, url.hash);  // reduced-motion / no WAAPI: instant
    };

    var cached = pageCache[url.pathname];
    if (cached) { run(cached); return; }

    fetch(url.pathname)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(function (html) { pageCache[url.pathname] = html; run(html); })
      .catch(function () { location.href = href; });  // hard-nav fallback
  }

  function initRouter() {
    // Need both the fetch-swap primitive and history API; otherwise leave the
    // default cross-document navigation (with the site.css @view-transition
    // fallback) in place.
    if (!window.history || !window.history.pushState || !window.fetch) return;

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 ||
          e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;

      var url;
      try { url = new URL(a.href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      if (!INTERNAL.test(url.pathname)) return;
      // Same-page #hash links (Profile/Top on the index) belong to the Lenis
      // smooth-scroll handler — let them through untouched.
      if (url.pathname === location.pathname && url.hash &&
          url.search === location.search) return;

      e.preventDefault();
      if (url.href === location.href) return;
      navigate(url.href, true);
    });

    window.addEventListener("popstate", function () {
      navigate(location.href, false);
    });
  }

  /* ---------- boot ----------
     bootGlobal: runs once per real page load; owns the persistent Lenis
     instance, the smooth-scroll click handler, and the router.
     bootPage: runs now AND after every router swap; everything tied to the
     specific page's DOM, torn down via runCleanups() before each re-run. */
  function bootPage() {
    runCleanups();
    initReveal();
    initMorph();
    initTagline();
    initInterestsFloat();
    initFilters("projectFilters", "workGrid", "emptyState");
    initFilters("researchFilters", "pubGrid", "emptyState");
    initContact();
  }

  function bootGlobal() {
    initSmoothScroll();
    initHashJumpFix();
    initRouter();
  }

  bootGlobal();
  bootPage();
})();
