/* ==========================================================
   Thinkora - responsive navigation + theme
   ========================================================== */


/* ==========================================================
   SUBMENUS (one single handler, safe against double-toggle)
   ========================================================== */

(function () {

  /* If this file is accidentally loaded twice, run only once */
  if (window.__thinkoraSubmenuInit) return;
  window.__thinkoraSubmenuInit = true;

  function isTouchLayout() {
    return window.matchMedia("(max-width: 1023px)").matches;
  }

  function closeOthers(current) {
    Array.prototype.forEach.call(
      document.querySelectorAll(".has-sub.open"),
      function (li) {
        if (li === current) return;
        li.classList.remove("open");
        var b = li.querySelector(":scope > .sub-toggle");
        if (b) b.setAttribute("aria-expanded", "false");
      }
    );
  }

  document.addEventListener("click", function (e) {

    /* Click on the arrow button OR on the "Brain games" link text */
    var trigger = e.target.closest(
      ".has-sub > .sub-toggle, .has-sub > a"
    );

    if (!trigger) return;

    var li = trigger.parentElement;
    var btn = li.querySelector(":scope > .sub-toggle");

    if (!btn) return;

    /* On desktop, the link must work normally */
    if (!isTouchLayout()) return;

    e.preventDefault();
    e.stopPropagation();

    var willOpen = !li.classList.contains("open");

    closeOthers(li);

    li.classList.toggle("open", willOpen);
    btn.setAttribute("aria-expanded", willOpen ? "true" : "false");

  }, true);

})();


/* ==========================================================
   LIGHT / DARK THEME
   ========================================================== */

(function () {

  var toggle = document.getElementById("theme-toggle");

  if (!toggle) return;

  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var icon = toggle.querySelector(".theme-icon");
  var text = toggle.querySelector(".theme-text");


  function setTheme(theme) {

    var isDark = theme === "dark";

    document.documentElement.setAttribute("data-theme", theme);

    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");

    toggle.setAttribute(
      "aria-label",
      isDark ? ((window.THINKORA_I18N||{}).toLight || "Switch to light mode") : ((window.THINKORA_I18N||{}).toDark || "Switch to dark mode")
    );

    if (icon) {
      icon.innerHTML = isDark ? SUN : MOON;
    }

    if (text) {
      text.textContent = isDark ? ((window.THINKORA_I18N||{}).light || "Light") : ((window.THINKORA_I18N||{}).dark || "Dark");
    }

    try {
      localStorage.setItem("thinkora-theme", theme);
    } catch (error) {
      /* Ignore storage errors */
    }

  }


  var savedTheme = null;

  try {
    savedTheme = localStorage.getItem("thinkora-theme");
  } catch (error) {
    savedTheme = null;
  }


  if (savedTheme === "dark" || savedTheme === "light") {

    setTheme(savedTheme);

  } else {

    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    setTheme(prefersDark ? "dark" : "light");

  }


  toggle.addEventListener("click", function () {

    var currentTheme =
      document.documentElement.getAttribute("data-theme");

    setTheme(currentTheme === "dark" ? "light" : "dark");

  });

})();