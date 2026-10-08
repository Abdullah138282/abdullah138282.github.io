/* Thinkora - anagram speed test */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var stage = $("a-stage");
  if (!stage) return;

  var TOTAL = 60000;
  var WORDS = {
    4: "farm jump wind fish bird gift hand king milk oven pink quiz rock sand tree yarn zoom dark fork girl home junk kite tent vote wish yoga bank cake desk flag jazz mint park tiny twin wave belt frog duck lock silk".split(" "),
    5: "apple beach chair dance eagle fruit house jelly knife money paper queen river uncle voice water yacht zebra bacon candy flame juice koala light piano pizza plant robot sugar tiger wheel young cloud giant clock sheep".split(" "),
    6: "animal basket candle dinner engine hammer island jacket kitten ladder market number orange pencil rabbit school tunnel window yellow bridge castle doctor guitar helmet jungle mirror wallet".split(" "),
    7: "balloon chicken diamond freedom gallery harvest kingdom lantern machine network orchard penguin quarter rainbow village blanket chamber dolphin fishing giraffe history journey kitchen monster picture".split(" ")
  };

  function key(w) { return w.split("").sort().join(""); }
  var INDEX = {};
  [4, 5, 6, 7].forEach(function (n) {
    WORDS[n].forEach(function (w) { (INDEX[key(w)] = INDEX[key(w)] || []).push(w); });
  });

  var tiles = $("a-tiles"), form = $("a-form"), field = $("a-field"), startBtn = $("a-start"), skipBtn = $("a-skip");
  var timeEl = $("a-time"), scoreEl = $("a-score"), bar = $("a-bar").firstElementChild, msg = $("a-msg");
  var play = $("a-play"), result = $("a-result");
  var solved = 0, skipped = 0, longest = 0, best = 0, cur = "", end = 0, tick = 0, pools = {};

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pick(len) {
    if (!pools[len] || !pools[len].length) pools[len] = shuffle(WORDS[len]);
    return pools[len].pop();
  }

  function next() {
    var len = solved < 3 ? 4 : solved < 7 ? 5 : solved < 12 ? 6 : 7;
    cur = pick(len);
    var letters = cur.split(""), s = letters, tries = 0;
    do { s = shuffle(letters); tries++; } while (s.join("") === cur && tries < 30);
    tiles.innerHTML = s.map(function (l) { return '<span class="a-tile">' + l.toUpperCase() + "</span>"; }).join("");
    tiles.setAttribute("aria-label", "Scrambled letters: " + s.join(" ").toUpperCase());
    field.value = "";
    msg.textContent = "";
  }

  function showScore() { scoreEl.textContent = "Solved: " + solved; }

  function step() {
    var ms = Math.max(0, end - Date.now());
    timeEl.textContent = Math.ceil(ms / 1000) + "s";
    bar.style.width = (ms / TOTAL * 100) + "%";
    if (ms <= 0) finish();
  }

  function finish() {
    clearInterval(tick);
    if (solved > best) best = solved;
    $("a-final").textContent = solved;
    $("a-unit").textContent = solved === 1 ? "word unscrambled" : "words unscrambled";
    $("a-note").textContent = (longest ? "Longest word: " + longest + " letters. " : "") +
      (skipped ? "Skipped: " + skipped + ". " : "") + "Best this visit: " + best;
    play.hidden = true;
    result.hidden = false;
    result.setAttribute("tabindex", "-1");
    result.focus({ preventScroll: true });
  }

  function start() {
    solved = 0; skipped = 0; longest = 0; pools = {};
    result.hidden = true; play.hidden = false;
    startBtn.hidden = true; form.hidden = false; skipBtn.hidden = false;
    stage.setAttribute("data-state", "play");
    next(); showScore();
    field.focus();
    end = Date.now() + TOTAL;
    clearInterval(tick);
    tick = setInterval(step, 100);
    step();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = field.value.trim().toLowerCase();
    if (v === "") return;
    if (v.length === cur.length && (INDEX[key(cur)] || []).indexOf(v) > -1) {
      solved++; if (cur.length > longest) longest = cur.length;
      showScore(); next();
    } else {
      msg.textContent = "Not quite. Check the letters again or skip.";
      field.classList.remove("bad"); void field.offsetWidth; field.classList.add("bad");
    }
  });

  skipBtn.addEventListener("click", function () { skipped++; next(); field.focus(); });
  startBtn.addEventListener("click", start);
  $("a-again").addEventListener("click", start);
})();
