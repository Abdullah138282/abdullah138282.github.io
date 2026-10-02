/* ==========================================================
   Thinkora — responsive navigation + theme
   ========================================================== */
/* Mobile/tablet: tapping "Brain games" text also opens the submenu */
document.addEventListener("click", function (e) {
  var link = e.target.closest(".has-sub > a");
  if (!link) return;
  if (!window.matchMedia("(max-width: 1023px)").matches) return;

  e.preventDefault();
  link.parentElement.querySelector(":scope > .sub-toggle").click();
});

/* ==========================================================
   MOBILE SUBMENUS
   ========================================================== */

(function () {

  var items = document.querySelectorAll(".has-sub");

  Array.prototype.forEach.call(items, function (li) {

    var btn = li.querySelector(":scope > .sub-toggle");

    if (!btn) return;


    btn.addEventListener("click", function (event) {

      /* IMPORTANT:
         Do not allow the parent link to open */
      event.preventDefault();
      event.stopPropagation();

      var isOpen = li.classList.contains("open");


      /* Close all other submenus */

      Array.prototype.forEach.call(items, function (otherLi) {

        if (otherLi !== li) {

          otherLi.classList.remove("open");

          var otherBtn =
            otherLi.querySelector(":scope > .sub-toggle");

          if (otherBtn) {

            otherBtn.setAttribute(
              "aria-expanded",
              "false"
            );

          }

        }

      });


      /* Toggle current submenu */

      li.classList.toggle(
        "open",
        !isOpen
      );


      btn.setAttribute(
        "aria-expanded",
        !isOpen ? "true" : "false"
      );

    });


    /* Prevent keyboard activation from opening parent link */

    btn.addEventListener("keydown", function (event) {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        btn.click();

      }

    });

  });

})();


/* ==========================================================
   LIGHT / DARK THEME
   ========================================================== */

(function () {

  var toggle =
    document.getElementById("theme-toggle");

  if (!toggle) return;

  var icon =
    toggle.querySelector(".theme-icon");

  var text =
    toggle.querySelector(".theme-text");


  function setTheme(theme) {

    var isDark = theme === "dark";


    document.documentElement.setAttribute(
      "data-theme",
      theme
    );


    /* Accessibility */

    toggle.setAttribute(
      "aria-pressed",
      isDark ? "true" : "false"
    );

    toggle.setAttribute(
      "aria-label",
      isDark
        ? "Switch to light mode"
        : "Switch to dark mode"
    );


    /* Icon */

    if (icon) {

      icon.textContent =
        isDark ? "☀" : "☾";

    }


    /* Text */

    if (text) {

      text.textContent =
        isDark ? "Light" : "Dark";

    }


    /* Save */

    try {

      localStorage.setItem(
        "thinkora-theme",
        theme
      );

    } catch (error) {

      /* Ignore storage errors */

    }

  }


  /* Read saved theme */

  var savedTheme = null;

  try {

    savedTheme =
      localStorage.getItem(
        "thinkora-theme"
      );

  } catch (error) {

    savedTheme = null;

  }


  /* Existing preference */

  if (
    savedTheme === "dark" ||
    savedTheme === "light"
  ) {

    setTheme(savedTheme);

  }

  /* First visit */

  else {

    var prefersDark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    setTheme(
      prefersDark ? "dark" : "light"
    );

  }


  /* Toggle */

  toggle.addEventListener(
    "click",
    function () {

      var currentTheme =
        document.documentElement.getAttribute(
          "data-theme"
        );

      setTheme(
        currentTheme === "dark"
          ? "light"
          : "dark"
      );

    }
  );

})();