/* Thinkora — reaction time test */
(function () {
  "use strict";

  var ROUNDS = 5, MIN_WAIT = 1500, MAX_WAIT = 4000;

  var pad = document.getElementById("g-pad");
  if (!pad) return;
  var big = document.getElementById("g-big");
  var sub = document.getElementById("g-sub");
  var roundText = document.getElementById("g-round");
  var lastText = document.getElementById("g-last");
  var dots = document.querySelectorAll(".g-rounds li");
  var play = document.getElementById("g-play");
  var result = document.getElementById("g-result");

  var state = "idle", times = [], timer = 0, t0 = 0;

  function set(s, title, hint) {
    state = s;
    pad.setAttribute("data-state", s);
    big.textContent = title;
    sub.textContent = hint;
  }

  function progress() {
    roundText.textContent = "Round " + Math.min(times.length + 1, ROUNDS) + " of " + ROUNDS;
    Array.prototype.forEach.call(dots, function (d, i) { d.classList.toggle("done", i < times.length); });
  }

  function begin() {
    set("waiting", "Wait for green", "Do not click yet.");
    timer = setTimeout(function () {
      set("ready", "Click now!", "");
      t0 = performance.now();
    }, MIN_WAIT + Math.random() * (MAX_WAIT - MIN_WAIT));
  }

  function finish() {
    var sum = times.reduce(function (a, b) { return a + b; }, 0);
    var avg = Math.round(sum / times.length), best = Math.min.apply(null, times);
    document.getElementById("g-avg").textContent = avg;
    document.getElementById("g-best").textContent = best;
    document.getElementById("g-list").innerHTML = times.map(function (t) { return "<li>" + t + " ms</li>"; }).join("");
    play.hidden = true;
    result.hidden = false;
    result.setAttribute("tabindex", "-1");
    result.focus({ preventScroll: true });
  }

  function press() {
    if (state === "idle") { begin(); return; }
    if (state === "early") { progress(); begin(); return; }
    if (state === "waiting") {
      clearTimeout(timer);
      set("early", "Too soon", "Click to try this round again.");
      return;
    }
    if (state === "ready") {
      var ms = Math.round(performance.now() - t0);
      times.push(ms);
      lastText.textContent = "Last: " + ms + " ms";
      progress();
      if (times.length >= ROUNDS) { finish(); return; }
      set("idle", ms + " ms", "Click to start round " + (times.length + 1) + ".");
    }
  }

  // pointerdown for the lowest input delay; keyboard handled separately
  pad.addEventListener("pointerdown", function (e) { e.preventDefault(); press(); });
  pad.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (!e.repeat) press(); }
  });
  pad.addEventListener("click", function (e) { e.preventDefault(); });

  document.getElementById("g-again").addEventListener("click", function () {
    times = [];
    lastText.textContent = "";
    result.hidden = true;
    play.hidden = false;
    progress();
    set("idle", "Click to start", "When the box turns green, click as fast as you can.");
    pad.focus({ preventScroll: true });
  });

  progress();
})();
