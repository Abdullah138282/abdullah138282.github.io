/* Thinkora - pattern memory game */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var grid = $("e-grid");
  if (!grid) return;

  var pads = Array.prototype.slice.call(grid.querySelectorAll(".e-pad"));
  var status = $("e-status"), scoreEl = $("e-score"), startBtn = $("e-start"), soundBtn = $("e-sound");
  var play = $("e-play"), result = $("e-result");
  var FREQ = [262, 330, 392, 523];
  var seq = [], pos = 0, busy = true, best = 0, sound = true, ctx = null;

  function tone(i) {
    if (!sound) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = FREQ[i]; g.gain.value = 0.15;
      o.connect(g); g.connect(ctx.destination); o.start();
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  function flash(i, ms) {
    pads[i].classList.add("lit");
    tone(i);
    setTimeout(function () { pads[i].classList.remove("lit"); }, ms);
  }

  function setBusy(b) { busy = b; grid.setAttribute("data-busy", b ? "1" : "0"); }

  function playSequence() {
    setBusy(true);
    status.textContent = "Watch the pattern";
    var step = Math.max(250, 650 - seq.length * 30), i = 0;
    (function next() {
      if (i >= seq.length) { pos = 0; setBusy(false); status.textContent = "Your turn"; return; }
      flash(seq[i], step * 0.7);
      i++;
      setTimeout(next, step);
    })();
  }

  function nextRound() {
    seq.push(Math.floor(Math.random() * 4));
    scoreEl.textContent = "Round " + seq.length;
    setTimeout(playSequence, 700);
  }

  function press(i) {
    if (busy) return;
    flash(i, 160);
    if (i !== seq[pos]) { finish(); return; }
    pos++;
    if (pos === seq.length) { setBusy(true); status.textContent = "Nice!"; nextRound(); }
  }

  function finish() {
    setBusy(true);
    var done = seq.length - 1;
    if (done > best) best = done;
    $("e-final").textContent = done;
    $("e-unit").textContent = done === 1 ? "round completed" : "rounds completed";
    $("e-note").textContent = "Best this visit: " + best;
    play.hidden = true;
    result.hidden = false;
    result.setAttribute("tabindex", "-1");
    result.focus({ preventScroll: true });
  }

  function start() {
    seq = []; pos = 0;
    result.hidden = true; play.hidden = false;
    startBtn.textContent = "Restart";
    nextRound();
  }

  pads.forEach(function (p, i) { p.addEventListener("click", function () { press(i); }); });
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.key < "1" || e.key > "4") return;
    if (play.hidden) return;
    press(parseInt(e.key, 10) - 1);
  });
  startBtn.addEventListener("click", start);
  $("e-again").addEventListener("click", start);
  soundBtn.addEventListener("click", function () {
    sound = !sound;
    soundBtn.textContent = "Sound: " + (sound ? "on" : "off");
    soundBtn.setAttribute("aria-pressed", sound ? "true" : "false");
  });
})();
