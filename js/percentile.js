/* Thinkora - IQ percentile calculator */
(function () {
  "use strict";

  /* ---------- Normal distribution maths ---------- */
  // erf: Abramowitz & Stegun 7.1.26 (abs. error < 1.5e-7)
  function erf(x) {
    var s = x < 0 ? -1 : 1;
    x = Math.abs(x);
    var t = 1 / (1 + 0.3275911 * x);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }

  // Upper tail Q(z) = P(Z > z). Continued fraction in the far tail keeps "1 in N" accurate.
  function upperTail(z) {
    if (z < 0) return 1 - upperTail(-z);
    if (z < 3) return 0.5 * (1 - erf(z / Math.SQRT2));
    var f = z;
    for (var k = 60; k >= 1; k--) f = z + k / f;
    return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI) / f;
  }

  function cdf(z) { return z >= 0 ? 1 - upperTail(z) : upperTail(-z); }

  function inverseCdf(p) {
    var lo = -9, hi = 9;
    for (var i = 0; i < 80; i++) {
      var mid = (lo + hi) / 2;
      if (cdf(mid) < p) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  /* ---------- Helpers ---------- */
  function label(iq15) {
    if (iq15 >= 130) return "Very superior";
    if (iq15 >= 120) return "Superior";
    if (iq15 >= 110) return "High average";
    if (iq15 >= 90) return "Average";
    if (iq15 >= 80) return "Low average";
    if (iq15 >= 70) return "Borderline";
    return "Extremely low";
  }

  function fmtPct(p) {
    if (p >= 99.995) return "99.99";
    if (p < 0.005) return "0.01";
    if (p < 0.1 || p > 99.9) return p.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
    if (p < 1 || p > 99) return p.toFixed(2);
    return p.toFixed(1).replace(/\.0$/, "");
  }

  function fmtRarity(tail) {
    var n = 1 / tail;
    if (n < 10) return n.toFixed(1).replace(/\.0$/, "");
    if (n < 100) return String(Math.round(n));
    if (n < 1000) return String(Math.round(n / 5) * 5);
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function syncCurve(z) {
    var slider = document.getElementById("iq-slider");
    if (!slider) return;
    var v = Math.round(100 + z * 15);
    v = Math.max(parseInt(slider.min, 10), Math.min(parseInt(slider.max, 10), v));
    slider.value = v;
    slider.dispatchEvent(new Event("input"));
  }

  function show(el, on) { if (on) el.removeAttribute("hidden"); else el.setAttribute("hidden", ""); }

  /* ---------- IQ → percentile ---------- */
  var f1 = document.getElementById("form-iq");
  if (f1) {
    var iqIn = document.getElementById("in-iq");
    var sdIn = document.getElementById("in-sd");
    var err1 = document.getElementById("err-iq");
    var out1 = document.getElementById("out-iq");

    f1.addEventListener("submit", function (e) {
      e.preventDefault();
      var iq = parseFloat(iqIn.value);
      var sd = parseFloat(sdIn.value);
      err1.textContent = "";
      if (isNaN(iq) || iq < 40 || iq > 200) {
        err1.textContent = "Enter an IQ score between 40 and 200.";
        show(out1, false);
        iqIn.focus();
        return;
      }
      var z = (iq - 100) / sd;
      var pct = cdf(z) * 100;
      var tail = Math.max(upperTail(Math.abs(z)), 1e-12);
      var iq15 = 100 + z * 15;

      document.getElementById("res-pct").textContent = fmtPct(pct);
      document.getElementById("res-text").textContent =
        "A score of " + iq + " is higher than about " + fmtPct(pct) + "% of people on this scale.";
      document.getElementById("res-rarity").textContent =
        z === 0 ? "This is exactly average."
        : "About 1 in " + fmtRarity(tail) + " people score " + (z > 0 ? "this high or higher." : "this low or lower.");
      document.getElementById("res-z").textContent = z.toFixed(2);
      document.getElementById("res-label").textContent = label(iq15);
      show(out1, true);
      syncCurve(z);
    });
  }

  /* ---------- Percentile → IQ ---------- */
  var f2 = document.getElementById("form-pct");
  if (f2) {
    var pctIn = document.getElementById("in-pct");
    var sd2 = document.getElementById("in-sd2");
    var err2 = document.getElementById("err-pct");
    var out2 = document.getElementById("out-pct");

    f2.addEventListener("submit", function (e) {
      e.preventDefault();
      var p = parseFloat(pctIn.value);
      var sd = parseFloat(sd2.value);
      err2.textContent = "";
      if (isNaN(p) || p < 0.01 || p > 99.99) {
        err2.textContent = "Enter a percentile between 0.01 and 99.99.";
        show(out2, false);
        pctIn.focus();
        return;
      }
      var z = inverseCdf(p / 100);
      var iq = 100 + z * sd;
      document.getElementById("res-iq2").textContent = Math.round(iq);
      document.getElementById("res-text2").textContent =
        "The " + fmtPct(p) + "th percentile matches an IQ of about " + Math.round(iq) + " (standard deviation " + sd + ").";
      document.getElementById("res-label2").textContent = label(100 + z * 15);
      show(out2, true);
      syncCurve(z);
    });
  }
})();
