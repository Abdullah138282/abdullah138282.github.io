/* Thinkora — number memory test */
(function () {
  "use strict";

  var stage = document.getElementById("n-stage");
  if (!stage) return;

  var levelText = document.getElementById("n-level");
  var bestText = document.getElementById("n-best");
  var numEl = document.getElementById("n-num");
  var hint = document.getElementById("n-hint");
  var bar = document.getElementById("n-bar");
  var barFill = bar.firstElementChild;
  var form = document.getElementById("n-form");
  var field = document.getElementById("n-field");
  var startBtn = document.getElementById("n-start");
  var play = document.getElementById("n-play");
  var result = document.getElementById("n-result");

  var level = 1, answer = "", best = 0, timer = 0;

  function set(state) { stage.setAttribute("data-state", state); }

  function makeNumber(n) {
    var s = String(1 + Math.floor(Math.random() * 9));
    for (var i = 1; i < n; i++) s += Math.floor(Math.random() * 10);
    return s;
  }

  function showNumber() {
    answer = makeNumber(level);
    var ms = 800 + level * 500;
    levelText.textContent = "Level " + level;
    set("show");
    form.hidden = true;
    startBtn.hidden = true;
    numEl.hidden = false;
    numEl.textContent = answer;
    hint.textContent = "Remember this number.";
    bar.hidden = false;
    barFill.style.transition = "none";
    barFill.style.width = "100%";
    void barFill.offsetWidth;
    barFill.style.transition = "width " + ms + "ms linear";
    barFill.style.width = "0%";
    timer = setTimeout(askForNumber, ms);
  }

  function askForNumber() {
    set("input");
    numEl.hidden = true;
    bar.hidden = true;
    hint.textContent = "What was the number?";
    form.hidden = false;
    field.value = "";
    field.focus();
  }

  function finish(typed) {
    var reached = level - 1;
    if (reached > best) best = reached;
    bestText.textContent = best ? "Best: " + best : "";
    document.getElementById("n-score").textContent = reached;
    document.getElementById("n-digits").textContent = reached === 1 ? "digit" : "digits";
    document.getElementById("n-was").textContent = answer;
    document.getElementById("n-typed").textContent = typed || "(nothing)";
    play.hidden = true;
    result.hidden = false;
    result.setAttribute("tabindex", "-1");
    result.focus({ preventScroll: true });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var typed = field.value.replace(/\D/g, "");
    if (typed === answer) {
      set("right");
      form.hidden = true;
      hint.textContent = "Correct!";
      level++;
      timer = setTimeout(showNumber, 800);
    } else {
      finish(typed);
    }
  });

  startBtn.addEventListener("click", function () { level = 1; showNumber(); });

  document.getElementById("n-again").addEventListener("click", function () {
    clearTimeout(timer);
    result.hidden = true;
    play.hidden = false;
    level = 1;
    showNumber();
  });
})();
