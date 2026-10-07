/* Thinkora - cookie and storage consent.
   Essential storage (theme, consent choice) is always on.
   Optional: Google Firebase, used only for browser notifications. It loads
   only after the visitor accepts. */
(function () {
  "use strict";

  var KEY = "thinkora-consent";
  var banner = null;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function write(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* ignore */ }
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  var loaded = false;
  function loadOptional() {
    if (loaded) return;
    loaded = true;
    loadScript("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js")
      .then(function () { return loadScript("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"); })
      .then(function () { return loadScript("/js/notifications.js"); })
      .catch(function () { loaded = false; });
  }

  function closeBanner() {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
    banner = null;
  }

  function choose(value) {
    write(value);
    closeBanner();
    if (value === "all") {
      loadOptional();
    } else if (loaded) {
      location.reload();
    }
  }

  function openBanner() {
    if (banner) return;
    banner = document.createElement("div");
    banner.className = "consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-labelledby", "consent-title");
    var C = (window.THINKORA_I18N || {}).consent || {};
    banner.innerHTML =
      '<h2 id="consent-title">' + (C.title || "Your privacy choices") + "</h2>" +
      (C.body || ("<p>Thinkora stores your light or dark mode choice on your device. " +
      "If you accept optional services, we also load Google Firebase so you can turn on browser notifications. " +
      'Read the <a href="/privacy-policy/#cookies">privacy policy</a>.</p>')) +
      '<div class="consent-actions">' +
      '<button type="button" class="btn btn-primary" data-choice="all">' + (C.accept || "Accept optional") + "</button>" +
      '<button type="button" class="btn btn-ghost" data-choice="essential">' + (C.essential || "Essential only") + "</button>" +
      "</div>";
    banner.addEventListener("click", function (e) {
      var b = e.target.closest("[data-choice]");
      if (b) choose(b.getAttribute("data-choice"));
    });
    document.body.appendChild(banner);
  }

  function addFooterLink() {
    var footer = document.querySelector(".site-footer .wrap");
    if (!footer) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "consent-open";
    btn.textContent = ((window.THINKORA_I18N || {}).consent || {}).settings || "Cookie settings";
    btn.addEventListener("click", openBanner);
    footer.appendChild(btn);
  }

  function init() {
    addFooterLink();
    var saved = read();
    if (saved === "all") loadOptional();
    else if (saved !== "essential") openBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
