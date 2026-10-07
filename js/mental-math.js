/* Thinkora - mental math test */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var stage = $("m-stage");
  if (!stage) return;

  var TOTAL = 60000;
  var q = $("m-q"), form = $("m-form"), field = $("m-field"), startBtn = $("m-start");
  var timeEl = $("m-time"), scoreEl = $("m-score"), bar = $("m-bar").firstElementChild;
  var play = $("m-play"), result = $("m-result");
  var correct = 0, wrong = 0, streak = 0, best = 0, ans = 0, end = 0, tick = 0;

  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function make() {
    var lv = Math.floor(correct / 5), max = Math.min(99, 12 + lv * 10);
    var t = rnd(0, lv >= 2 ? 2 : 1), a, b;
    if (t === 0) { a = rnd(2, max); b = rnd(2, max); ans = a + b; q.textContent = a + " + " + b; }
    else if (t === 1) { a = rnd(4, max); b = rnd(2, a); ans = a - b; q.textContent = a + " \u2212 " + b; }
    else { a = rnd(2, Math.min(12, 4 + lv)); b = rnd(2, 12); ans = a * b; q.textContent = a + " \u00d7 " + b; }
  }

  function showScore() {
    scoreEl.textContent = "Correct: " + correct + (streak >= 3 ? "  Streak: " + streak : "");
  }

  function step() {
    var ms = Math.max(0, end - Date.now());
    timeEl.textContent = Math.ceil(ms / 1000) + "s";
    bar.style.width = (ms / TOTAL * 100) + "%";
    if (ms <= 0) finish();
  }

  function finish() {
    clearInterval(tick);
    if (correct > best) best = correct;
    var total = correct + wrong;
    $("m-final").textContent = correct;
    $("m-unit").textContent = correct === 1 ? "correct answer" : "correct answers";
    $("m-note").textContent = (total ? "Accuracy: " + Math.round(correct / total * 100) + "%. " : "") + "Best this visit: " + best;
    play.hidden = true;
    result.hidden = false;
    result.setAttribute("tabindex", "-1");
    result.focus({ preventScroll: true });
  }

  function start() {
    correct = 0; wrong = 0; streak = 0;
    result.hidden = true; play.hidden = false;
    startBtn.hidden = true; form.hidden = false;
    stage.setAttribute("data-state", "play");
    make(); showScore();
    field.value = ""; field.focus();
    end = Date.now() + TOTAL;
    clearInterval(tick);
    tick = setInterval(step, 100);
    step();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = field.value.trim();
    if (v === "") return;
    if (Number(v) === ans) { correct++; streak++; }
    else {
      wrong++; streak = 0;
      field.classList.remove("bad"); void field.offsetWidth; field.classList.add("bad");
    }
    field.value = "";
    make(); showScore();
  });

  startBtn.addEventListener("click", start);
  $("m-again").addEventListener("click", start);
})();
