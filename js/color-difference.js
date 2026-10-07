/* Thinkora - color difference test */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var board = $("c-board");
  if (!board) return;

  var TOTAL = 60000, PENALTY = 4000;
  var timeEl = $("c-time"), levelEl = $("c-level"), bar = $("c-bar").firstElementChild;
  var startBtn = $("c-start"), play = $("c-play"), result = $("c-result");
  var level = 1, score = 0, bestScore = 0, end = 0, tick = 0, running = false;

  function build() {
    var n = Math.min(8, 2 + Math.floor((level - 1) / 2));
    var d = Math.max(2.5, 18 * Math.pow(0.92, level - 1));
    var h = Math.floor(Math.random() * 360);
    var odd = Math.floor(Math.random() * n * n);
    var base = "hsl(" + h + ",62%,52%)";
    var diff = "hsl(" + h + ",62%," + (52 + (Math.random() < 0.5 ? d : -d)).toFixed(1) + "%)";
    var html = "";
    for (var i = 0; i < n * n; i++) {
      html += '<button type="button" class="c-tile" data-o="' + (i === odd ? 1 : 0) +
        '" style="background:' + (i === odd ? diff : base) + '" aria-label="Tile ' + (i + 1) + '"></button>';
    }
    board.style.gridTemplateColumns = "repeat(" + n + ",1fr)";
    board.innerHTML = html;
    levelEl.textContent = "Found: " + score;
  }

  function step() {
    var ms = Math.max(0, end - Date.now());
    timeEl.textContent = Math.ceil(ms / 1000) + "s";
    bar.style.width = (ms / TOTAL * 100) + "%";
    if (ms <= 0) finish();
  }

  function finish() {
    clearInterval(tick);
    running = false;
    if (score > bestScore) bestScore = score;
    $("c-final").textContent = score;
    $("c-unit").textContent = score === 1 ? "odd shade found" : "odd shades found";
    $("c-note").textContent = "Best this visit: " + bestScore;
    play.hidden = true;
    result.hidden = false;
    result.setAttribute("tabindex", "-1");
    result.focus({ preventScroll: true });
  }

  function start() {
    level = 1; score = 0; running = true;
    result.hidden = true; play.hidden = false;
    startBtn.hidden = true;
    board.hidden = false;
    build();
    end = Date.now() + TOTAL;
    clearInterval(tick);
    tick = setInterval(step, 100);
    step();
  }

  board.addEventListener("click", function (e) {
    var t = e.target.closest(".c-tile");
    if (!t || !running) return;
    if (t.getAttribute("data-o") === "1") {
      score++; level++; build();
    } else {
      end -= PENALTY;
      board.classList.remove("bad");
      void board.offsetWidth;
      board.classList.add("bad");
      step();
    }
  });

  startBtn.addEventListener("click", start);
  $("c-again").addEventListener("click", start);
})();
