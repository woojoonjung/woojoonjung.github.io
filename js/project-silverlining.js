(function () {
  "use strict";

  // Keep media fallback and anchor behavior attached after shared page navigation.
  var activePage = null;
  var disposePage = function () {};

  function initializePage() {
    var page = document.querySelector("main.silverlining-page");
    if (page === activePage) return;
    disposePage();
    activePage = page;
    if (!page) return;

    var disposed = false;

    var film = page.querySelector(".project-film video");
    var filmSource = film.querySelector("source");
    var fallback = page.querySelector(".project-film__fallback");
    function showFilmFallback() { fallback.hidden = false; }
    film.addEventListener("error", showFilmFallback);
    filmSource.addEventListener("error", showFilmFallback);
    if (film.error) showFilmFallback();

    // The shared smooth-scroll handler does not apply scroll-margin. Keep the
    // opening anchor clear of the fixed portfolio header, including on restore.
    function anchorTarget(hash) {
      if (!hash || hash === "#") return null;
      var id;
      try { id = decodeURIComponent(hash.slice(1)); }
      catch (error) { return null; }
      var target = document.getElementById(id);
      return target && page.contains(target) ? target : null;
    }
    function alignAnchor(target) {
      var header = document.querySelector(".site-header");
      var clearance = header ? header.getBoundingClientRect().bottom + 24 : 24;
      var top = window.scrollY + target.getBoundingClientRect().top - clearance;
      window.scrollTo(0, Math.max(0, top));
    }
    function alignCurrentAnchor() {
      var target = anchorTarget(window.location.hash);
      if (!disposed && target) alignAnchor(target);
    }
    function followAnchor(event) {
      var link = event.target.closest(".silverlining-page a[href^='#']");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey ||
          event.ctrlKey || event.shiftKey || event.altKey) return;
      var hash = link.getAttribute("href");
      var target = anchorTarget(hash);
      if (!target) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.history.replaceState(window.history.state, "", hash);
      alignAnchor(target);
      var heading = target.querySelector("h2") || target;
      var temporaryFocus = !heading.hasAttribute("tabindex");
      if (temporaryFocus) heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
      if (temporaryFocus) heading.addEventListener("blur", function () {
        heading.removeAttribute("tabindex");
      }, { once: true });
    }
    document.addEventListener("click", followAnchor, true);
    window.addEventListener("hashchange", alignCurrentAnchor);
    window.addEventListener("load", alignCurrentAnchor, { once: true });
    window.requestAnimationFrame(alignCurrentAnchor);

    disposePage = function () {
      disposed = true;
      film.removeEventListener("error", showFilmFallback);
      filmSource.removeEventListener("error", showFilmFallback);
      document.removeEventListener("click", followAnchor, true);
      window.removeEventListener("hashchange", alignCurrentAnchor);
      window.removeEventListener("load", alignCurrentAnchor);
    };
  }

  initializePage();
  // The shared portfolio router can restore this document from its page cache.
  // Reattach only when <main> changes; ordinary content mutations are ignored.
  new MutationObserver(initializePage).observe(document.body, { childList: true });
})();
