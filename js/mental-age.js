/* Thinkora - mental age calculator (classic ratio formula) */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var f1 = $("form-ma"), f2 = $("form-ratio");
  if (!f1 || !f2) return;

  var ADULT_CAP = 16;

  function yearsMonths(y) {
    var yy = Math.floor(y + 1e-9), mm = Math.round((y - yy) * 12);
    if (mm === 12) { yy++; mm = 0; }
    return yy + (yy === 1 ? " year, " : " years, ") + mm + (mm === 1 ? " month" : " months");
  }
  function one(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function num(id) {
    var v = $(id).value.replace(",", ".").trim();
    return v === "" ? NaN : Number(v);
  }

  f1.addEventListener("submit", function (e) {
    e.preventDefault();
    var age = num("in-age"), iq = num("in-iq"), err = $("err-ma"), out = $("out-ma");
    err.textContent = "";
    if (!(age >= 2 && age <= 100)) { err.textContent = "Enter an actual age between 2 and 100."; out.hidden = true; return; }
    if (!(iq >= 40 && iq <= 200)) { err.textContent = "Enter an IQ score between 40 and 200."; out.hidden = true; return; }
    var ma = age * iq / 100;
    $("res-ma").textContent = one(ma);
    $("res-ma-ym").textContent = "That is " + yearsMonths(ma) + ".";
    $("res-ma-formula").textContent = "Formula: IQ ÷ 100 × actual age = " + iq + " ÷ 100 × " + age + " = " + one(ma) + " years.";
    var capEl = $("res-ma-cap");
    if (age > ADULT_CAP) {
      var capped = ADULT_CAP * iq / 100;
      capEl.textContent = "You are older than " + ADULT_CAP + ", so keep in mind that the formula was built for children. Test manuals traditionally capped actual age at about " +
        ADULT_CAP + " for this calculation, which would give a mental age of " + one(capped) + " years. Mental age stops being a meaningful number in adulthood.";
      capEl.hidden = false;
    } else {
      capEl.hidden = true;
    }
    out.hidden = false;
  });

  f2.addEventListener("submit", function (e) {
    e.preventDefault();
    var ma = num("in-mental"), ca = num("in-actual"), err = $("err-ratio"), out = $("out-ratio");
    err.textContent = "";
    if (!(ma > 0 && ma <= 100)) { err.textContent = "Enter a mental age between 0.1 and 100."; out.hidden = true; return; }
    if (!(ca >= 2 && ca <= 100)) { err.textContent = "Enter an actual age between 2 and 100."; out.hidden = true; return; }
    var iq = ma / ca * 100;
    $("res-iq").textContent = Math.round(iq);
    $("res-iq-formula").textContent = "Formula: mental age ÷ actual age × 100 = " + ma + " ÷ " + ca + " × 100 = " + one(iq) + ".";
    out.hidden = false;
  });
})();
