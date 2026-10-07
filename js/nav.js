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

  var icon = toggle.querySelector(".theme-icon");
  var text = toggle.querySelector(".theme-text");


  function setTheme(theme) {

    var isDark = theme === "dark";

    document.documentElement.setAttribute("data-theme", theme);

    toggle.setAttribute("aria-pressed", isDark ? "true" : "false");

    toggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    if (icon) {
      icon.textContent = isDark ? "☀" : "☾";
    }

    if (text) {
      text.textContent = isDark ? "Light" : "Dark";
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