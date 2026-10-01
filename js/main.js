/* Thinkora — main.js */
window.__thinkoraReady = true;

/* ---------- Mobile navigation ---------- */
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");

    toggle.setAttribute(
      "aria-expanded",
      open ? "true" : "false"
    );
  });
})();

/* ==========================================================
   NON-CRITICAL PAGE INITIALIZATION
   Delay visual/interactive work until after first paint.
   ========================================================== */

function thinkoraAfterFirstPaint(callback) {
  if ("requestAnimationFrame" in window) {
    requestAnimationFrame(function () {
      requestAnimationFrame(callback);
    });
  } else {
    setTimeout(callback, 50);
  }
}

thinkoraAfterFirstPaint(function () {

  /* ---------- Interactive bell curve ---------- */
  (function () {
    var svg = document.getElementById("curve");
    var slider = document.getElementById("iq-slider");

    if (!svg || !slider) return;

    var NS = "http://www.w3.org/2000/svg";

    var W = 640;
    var H = 300;
    var PAD_X = 20;
    var BASE = 250;
    var PEAK_H = 200;

    var MIN = 55;
    var MAX = 145;
    var MEAN = 100;
    var SD = 15;

    function pdf(x) {
      return (
        Math.exp(
          -0.5 *
          Math.pow(
            (x - MEAN) / SD,
            2
          )
        ) /
        (SD * Math.sqrt(2 * Math.PI))
      );
    }

    var PEAK = pdf(MEAN);

    function xOf(iq) {
      return (
        PAD_X +
        ((iq - MIN) / (MAX - MIN)) *
        (W - PAD_X * 2)
      );
    }

    function yOf(iq) {
      return (
        BASE -
        (pdf(iq) / PEAK) * PEAK_H
      );
    }

    /* ---------- Standard normal CDF ---------- */
    function cdf(z) {
      var t =
        1 /
        (1 +
          0.2316419 *
          Math.abs(z));

      var d =
        0.3989423 *
        Math.exp(
          (-z * z) / 2
        );

      var p =
        d *
        t *
        (
          0.3193815 +
          t *
          (
            -0.3565638 +
            t *
            (
              1.781478 +
              t *
              (
                -1.821256 +
                t * 1.330274
              )
            )
          )
        );

      return z > 0 ? 1 - p : p;
    }

    function label(iq) {
      if (iq >= 130) return "Very superior";
      if (iq >= 120) return "Superior";
      if (iq >= 110) return "High average";
      if (iq >= 90) return "Average";
      if (iq >= 80) return "Low average";
      if (iq >= 70) return "Borderline";

      return "Extremely low";
    }

    function make(tag, attrs) {
      var el = document.createElementNS(NS, tag);

      for (var k in attrs) {
        el.setAttribute(k, attrs[k]);
      }

      return el;
    }

    /* ---------- Build curve path ---------- */

    var line = "";

    for (
      var iq = MIN;
      iq <= MAX;
      iq += 0.5
    ) {
      line +=
        (iq === MIN ? "M" : "L") +
        xOf(iq).toFixed(1) +
        " " +
        yOf(iq).toFixed(1) +
        " ";
    }

    var area =
      line +
      "L" +
      xOf(MAX) +
      " " +
      BASE +
      " L" +
      xOf(MIN) +
      " " +
      BASE +
      " Z";

    /* ---------- SVG definitions ---------- */

    var defs = make("defs", {});

    var clip = make("clipPath", {
      id: "fill-clip"
    });

    var clipRect = make("rect", {
      x: 0,
      y: 0,
      width: 0,
      height: H
    });

    clip.appendChild(clipRect);
    defs.appendChild(clip);
    svg.appendChild(defs);

    /* ---------- Curve area ---------- */

    svg.appendChild(
      make("path", {
        d: area,
        "class": "curve-base"
      })
    );

    svg.appendChild(
      make("path", {
        d: area,
        "class": "curve-fill",
        "clip-path": "url(#fill-clip)"
      })
    );

    /* ---------- Axis ---------- */

    svg.appendChild(
      make("line", {
        x1: PAD_X,
        x2: W - PAD_X,
        y1: BASE,
        y2: BASE,
        "class": "curve-axis"
      })
    );

    /* ---------- Curve line ---------- */

    svg.appendChild(
      make("path", {
        d: line,
        "class": "curve-line",
        pathLength: 1
      })
    );

    /* ---------- Curve ticks ---------- */

    [70, 85, 100, 115, 130].forEach(
      function (t) {
        var tick = make("text", {
          x: xOf(t),
          y: BASE + 28,
          "class": "curve-tick"
        });

        tick.textContent = t;
        svg.appendChild(tick);
      }
    );

    /* ---------- Marker ---------- */

    var markerLine = make("line", {
      "class": "curve-marker-line",
      y2: BASE
    });

    var markerDot = make("circle", {
      r: 9,
      "class": "curve-marker-dot"
    });

    svg.appendChild(markerLine);
    svg.appendChild(markerDot);

    /* ---------- Readout ---------- */

    var scoreEl = document.getElementById(
      "readout-score"
    );

    var textEl = document.getElementById(
      "readout-text"
    );

    function update() {
      var v = parseInt(slider.value, 10);

      var x = xOf(v);
      var y = yOf(v);

      clipRect.setAttribute("width", x);

      markerLine.setAttribute("x1", x);
      markerLine.setAttribute("x2", x);
      markerLine.setAttribute("y1", y);

      markerDot.setAttribute("cx", x);
      markerDot.setAttribute("cy", y);

      var pct =
        cdf((v - MEAN) / SD) * 100;

      var pctText =
        pct > 99.9
          ? "99.9"
          : pct < 0.1
            ? "0.1"
            : pct < 10 || pct > 90
              ? pct.toFixed(1)
              : Math.round(pct);

      scoreEl.textContent = v;

      textEl.innerHTML =
        "<strong>" +
        label(v) +
        "</strong><br>Higher than about " +
        pctText +
        "% of people";

      slider.setAttribute(
        "aria-valuetext",
        v +
        ", " +
        label(v) +
        ", " +
        pctText +
        " percent"
      );
    }

    slider.addEventListener(
      "input",
      update
    );

    update();
  })();

  /* ==========================================================
     POLISH LAYER — scroll effects
     ========================================================== */

  (function () {
    var reduce =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    /* ---------- Split hero headline into words ---------- */

    document
      .querySelectorAll(".split")
      .forEach(function (el) {
        var words =
          el.textContent
            .trim()
            .split(/\s+/);

        el.setAttribute(
          "aria-label",
          el.textContent.trim()
        );

        el.innerHTML =
          words
            .map(function (w, i) {
              return (
                '<span class="w" aria-hidden="true" style="--i:' +
                i +
                '">' +
                w +
                "</span>"
              );
            })
            .join(" ");
      });

    /* ---------- Animated counters ---------- */

    function runCounter(el) {
      var target = parseInt(
        el.getAttribute("data-count"),
        10
      );

      if (reduce) {
        el.textContent = target;
        return;
      }

      var start = null;
      var dur = 1300;

      function tick(ts) {
        if (!start) {
          start = ts;
        }

        var p = Math.min(
          (ts - start) / dur,
          1
        );

        var eased =
          1 -
          Math.pow(1 - p, 3);

        el.textContent =
          Math.round(
            target * eased
          );

        if (p < 1) {
          requestAnimationFrame(tick);
        }
      }

      requestAnimationFrame(tick);
    }

    /* ---------- Reveal on scroll ---------- */

    var items =
      document.querySelectorAll(
        "[data-reveal]"
      );

    if (
      !("IntersectionObserver" in window)
    ) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });

      document
        .querySelectorAll("[data-count]")
        .forEach(runCounter);
    } else {
      var io =
        new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) {
                return;
              }

              entry.target.classList.add(
                "is-visible"
              );

              entry.target
                .querySelectorAll(
                  "[data-count]"
                )
                .forEach(runCounter);

              io.unobserve(entry.target);
            });
          },
          {
            threshold: 0.15,
            rootMargin: "0px 0px -6% 0px"
          }
        );

      items.forEach(function (el) {
        io.observe(el);
      });
    }

    /* ---------- Scroll-linked effects ---------- */

    var bar =
      document.querySelector(
        ".scroll-progress"
      );

    var header =
      document.querySelector(
        ".site-header"
      );

    var heroBg =
      document.querySelector(
        ".hero-bg"
      );

    var steps =
      document.querySelector(
        ".steps"
      );

    var stepItems = steps
      ? steps.querySelectorAll(".step")
      : null;

    var stepsStart = 0;
    var stepsEnd = 0;
    var lineHeight = 0;

    function updateStepMetrics() {
      if (
        !steps ||
        !stepItems ||
        !stepItems.length
      ) {
        return;
      }

      var stepsRect =
        steps.getBoundingClientRect();

      var firstRect =
        stepItems[0].getBoundingClientRect();

      var lastRect =
        stepItems[
          stepItems.length - 1
        ].getBoundingClientRect();

      var lineStart =
        firstRect.top -
        stepsRect.top +
        26;

      var lineEnd =
        lastRect.top -
        stepsRect.top +
        26;

      lineHeight =
        Math.max(
          0,
          lineEnd - lineStart
        );

      stepsStart =
        stepsRect.top +
        lineStart +
        window.pageYOffset;

      stepsEnd =
        stepsRect.top +
        lineEnd +
        window.pageYOffset;

      steps.style.setProperty(
        "--line-height",
        lineHeight.toFixed(2) + "px"
      );
    }

    var ticking = false;

    function onScroll() {
      var y = window.pageYOffset;

      var max =
        document.documentElement
          .scrollHeight -
        window.innerHeight;

      /* ---------- Top scroll progress ---------- */

      if (bar) {
        var pageProgress =
          max > 0
            ? Math.max(
                0,
                Math.min(1, y / max)
              )
            : 0;

        bar.style.transform =
          "scaleX(" +
          pageProgress.toFixed(4) +
          ")";
      }

      /* ---------- Header ---------- */

      if (header) {
        header.classList.toggle(
          "scrolled",
          y > 8
        );
      }

      /* ---------- Hero parallax ---------- */

      if (
        heroBg &&
        !reduce &&
        y <
          window.innerHeight * 1.2
      ) {
        heroBg.style.transform =
          "translate3d(0," +
          (y * 0.18).toFixed(1) +
          "px,0)";
      }

      /* ---------- How It Works progress ---------- */

      if (
        steps &&
        stepItems &&
        stepItems.length &&
        stepsEnd > stepsStart
      ) {
        var triggerPoint =
          y +
          window.innerHeight * 0.65;

        var p =
          (triggerPoint - stepsStart) /
          (stepsEnd - stepsStart);

        p = Math.max(
          0,
          Math.min(1, p)
        );

        steps.style.setProperty(
          "--p",
          p.toFixed(4)
        );
      }

      ticking = false;
    }

    /* ---------- Scroll listener ---------- */

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;

          requestAnimationFrame(
            onScroll
          );
        }
      },
      {
        passive: true
      }
    );

    /* ---------- Resize ---------- */

    window.addEventListener(
      "resize",
      function () {
        updateStepMetrics();
        onScroll();
      }
    );

    /*
     * Do the initial layout measurement after
     * the first visual paint rather than during
     * the critical rendering path.
     */
    thinkoraAfterFirstPaint(function () {
      updateStepMetrics();
      onScroll();
    });
  })();

});