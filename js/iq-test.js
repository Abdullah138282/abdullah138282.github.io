/* Thinkora - IQ test (30 original questions) */
(function () {
  "use strict";

  /* ---------------- Settings ---------------- */
  var TOTAL_SECONDS = 20 * 60;
  var OPTION_COUNT = 4;
  // Scoring assumptions (see the Methodology page): a typical adult is expected to
  // land near MEAN_SCORE, with SD_SCORE points of spread. Recalibrate with real data later.
  var MEAN_SCORE = 27;
  var SD_SCORE = 11;

  var DOMAIN_NAMES = {
    spatial: "Spatial reasoning",
    numerical: "Numerical reasoning",
    logical: "Logical reasoning",
    applied: "Applied reasoning"
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Small helpers ---------------- */
  function $(id) { return document.getElementById(id); }
  function esc(t) {
    return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  // Standard normal CDF (Abramowitz–Stegun approximation)
  function cdf(z) {
    var t = 1 / (1 + 0.2316419 * Math.abs(z));
    var d = 0.3989423 * Math.exp(-z * z / 2);
    var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }

  function ratingLabel(iq) {
    if (iq >= 130) return "Very superior";
    if (iq >= 120) return "Superior";
    if (iq >= 110) return "High average";
    if (iq >= 90) return "Average";
    if (iq >= 80) return "Low average";
    if (iq >= 70) return "Borderline";
    return "Extremely low";
  }

  /* ---------------- SVG builders for the picture puzzles ---------------- */
  var F_PATH = "M10 5H30V13H18V19H26V27H18V35H10Z";   // F-shape (no mirror symmetry)
  var G_PATH = "M8 6H24V14H32V34H16V26H8Z";            // S-shape (no mirror symmetry)

  function svg(w, h, inner, maxW) {
    return '<svg viewBox="0 0 ' + w + " " + h + '" xmlns="http://www.w3.org/2000/svg" ' +
      'style="max-width:' + (maxW || Math.round(w * 1.3)) + 'px" aria-hidden="true" focusable="false">' + inner + "</svg>";
  }
  function glyph(path, cx, cy, rot, flip, s) {
    return '<g transform="translate(' + cx + " " + cy + ") rotate(" + rot + ") scale(" +
      (flip ? -s : s) + " " + s + ') translate(-20 -20)"><path class="sv-f" d="' + path + '"/></g>';
  }
  function frame(cx, cy, size) {
    var h = size / 2;
    return '<rect class="sv-box" x="' + (cx - h) + '" y="' + (cy - h) + '" width="' + size +
      '" height="' + size + '" rx="10"/>';
  }
  function qmark(cx, cy) {
    return '<text class="sv-q" x="' + cx + '" y="' + (cy + 12) + '">?</text>';
  }
  function sequence(items) {
    var step = 75, inner = "";
    items.forEach(function (it, i) {
      var cx = 40 + i * step;
      inner += frame(cx, 50, 72);
      inner += it ? glyph(F_PATH, cx, 50, it[0], it[1], 1.5) : qmark(cx, 50);
    });
    return svg(40 + (items.length - 1) * step + 40, 100, inner);
  }
  function target(path, rot) {
    return svg(160, 100, frame(80, 50, 72) + glyph(path, 80, 50, rot, false, 1.5), 200);
  }
  function optGlyph(path, rot, flip) {
    return svg(80, 80, glyph(path, 40, 40, rot, flip, 1.5), 110);
  }

  function shape(kind, color, cx, cy, k) {
    var c = "c-" + color;
    if (kind === "circle") {
      return '<circle class="' + c + '" cx="' + cx + '" cy="' + cy + '" r="' + (14 * k) + '"/>';
    }
    if (kind === "square") {
      return '<rect class="' + c + '" x="' + (cx - 13 * k) + '" y="' + (cy - 13 * k) +
        '" width="' + (26 * k) + '" height="' + (26 * k) + '" rx="3"/>';
    }
    return '<polygon class="' + c + '" points="' + cx + "," + (cy - 15 * k) + " " +
      (cx + 16 * k) + "," + (cy + 12 * k) + " " + (cx - 16 * k) + "," + (cy + 12 * k) + '"/>';
  }
  function optShape(kind, color) { return svg(80, 80, shape(kind, color, 40, 40, 1.4), 110); }

  function grid3(drawCell) {
    var inner = "";
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        var cx = 39 + c * 66, cy = 39 + r * 66;
        inner += frame(cx, cy, 60) + drawCell(r, c, cx, cy);
      }
    }
    return svg(210, 210, inner, 260);
  }

  var DOT_POS = {
    1: [[0, 0]],
    2: [[-10, 0], [10, 0]],
    3: [[-14, 7], [14, 7], [0, -10]],
    4: [[-10, -10], [10, -10], [-10, 10], [10, 10]],
    5: [[-14, -11], [14, -11], [0, 0], [-14, 11], [14, 11]],
    6: [[-14, -11], [0, -11], [14, -11], [-14, 11], [0, 11], [14, 11]]
  };
  function dots(n, cx, cy, k) {
    return DOT_POS[n].map(function (p) {
      return '<circle class="c-violet" cx="' + (cx + p[0] * k) + '" cy="' + (cy + p[1] * k) +
        '" r="' + (4.5 * k) + '"/>';
    }).join("");
  }
  function optDots(n) { return svg(80, 80, dots(n, 40, 40, 1.3), 110); }

  function miniGrid(cells, x0, y0, cell) {
    var on = {}, inner = "";
    cells.forEach(function (p) { on[p[0] + "," + p[1]] = true; });
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 3; c++) {
        inner += '<rect class="' + (on[r + "," + c] ? "sv-on" : "sv-off") + '" x="' + (x0 + c * cell) +
          '" y="' + (y0 + r * cell) + '" width="' + (cell - 3) + '" height="' + (cell - 3) + '" rx="3"/>';
      }
    }
    return inner;
  }
  function optGrid(cells) { return svg(80, 80, miniGrid(cells, 4, 4, 24), 110); }

  /* ---------------- The 30 questions ---------------- */
  var QUESTIONS = [];
  function add(domain, diff, prompt, options, correct, extra) {
    var q = { domain: domain, diff: diff, prompt: prompt, options: options, correct: correct,
      kind: "text", ordered: false, visual: "", alt: "" };
    for (var k in extra) q[k] = extra[k];
    QUESTIONS.push(q);
  }

  /* ----- Numerical (8) ----- */
  add("numerical", 1, "What number comes next? 3, 6, 9, 12, ?", ["14", "15", "16", "18"], 1, { ordered: true });
  add("numerical", 1, "What number comes next? 5, 10, 20, 40, ?", ["60", "70", "80", "100"], 2, { ordered: true });
  add("numerical", 2, "What number comes next? 1, 4, 9, 16, 25, ?", ["30", "34", "36", "49"], 2, { ordered: true });
  add("numerical", 2, "What number comes next? 4, 7, 8, 11, 12, 15, ?", ["16", "17", "18", "19"], 0, { ordered: true });
  add("numerical", 2, "What number comes next? 1, 2, 4, 7, 11, 16, ?", ["20", "21", "22", "23"], 2, { ordered: true });
  add("numerical", 3, "What number comes next? 2, 6, 12, 20, 30, ?", ["40", "42", "44", "48"], 1, { ordered: true });
  add("numerical", 3, "What number comes next? 3, 5, 9, 17, 33, ?", ["57", "63", "65", "66"], 2, { ordered: true });
  add("numerical", 2, "A train covers 150 km in 2.5 hours. At the same speed, how long will it take to cover 240 km?",
    ["3.5 hours", "4 hours", "4.5 hours", "5 hours"], 1, { ordered: true });

  /* ----- Logical (7) ----- */
  add("logical", 1, "Which one does not belong with the others?", ["Apple", "Banana", "Grape", "Carrot"], 3);
  add("logical", 1, "All bloops are razzies. All razzies are lazzies. Are all bloops lazzies?",
    ["Only sometimes", "Yes, always", "No, never", "It cannot be determined"], 1);
  add("logical", 2, "Sam finished before Tia. Uma finished after Tia. Vik finished before Sam. Who finished second?",
    ["Vik", "Tia", "Uma", "Sam"], 3);
  add("logical", 2, "Some artists are musicians. All musicians are creative. Which statement must be true?",
    ["All artists are creative", "No artist is creative", "Some artists are creative", "All creative people are musicians"], 2);
  add("logical", 2, "If it rains, the match is cancelled. The match was not cancelled. What can you conclude?",
    ["It rained", "It did not rain", "The match was cancelled anyway", "Nothing can be concluded"], 1);
  add("logical", 3, "Exactly two of these three statements are true. A: Box 1 contains the key. B: Box 1 is empty. C: Box 2 contains the key. Where is the key?",
    ["Box 1", "Box 2", "Box 3", "It cannot be determined"], 1);
  add("logical", 3, "Five people (Ana, Ben, Cara, Dev and Eli) stand in a line. Cara is at the far right. Ben stands directly to the left of Ana, and Dev stands directly to the right of Ana. Eli does not stand next to Cara. Who is at the far left?",
    ["Ben", "Cara", "Dev", "Eli"], 3);

  /* ----- Applied (7) ----- */
  add("applied", 1, "A recipe uses 3 eggs for 12 muffins. How many eggs are needed for 36 muffins?", ["6", "9", "12", "15"], 1, { ordered: true });
  add("applied", 1, "Bird is to nest as bee is to what?", ["Honey", "Sting", "Flower", "Hive"], 3);
  add("applied", 2, "A shirt costs $40 after a 20% discount. What was the original price?", ["$48", "$50", "$52", "$60"], 1, { ordered: true });
  add("applied", 2, "Ali can paint a fence in 6 hours. Bo can paint the same fence in 3 hours. How long will they take working together?",
    ["1.5 hours", "2 hours", "2.5 hours", "4.5 hours"], 1, { ordered: true });
  add("applied", 2, "A meeting starts at 2:45 PM and lasts 1 hour 50 minutes. A 25-minute break follows it. When does the break end?",
    ["4:50 PM", "5:00 PM", "5:10 PM", "5:15 PM"], 1, { ordered: true });
  add("applied", 3, "What is the angle between the hour hand and the minute hand of a clock at 3:15?",
    ["0\u00b0", "7.5\u00b0", "15\u00b0", "22.5\u00b0"], 1, { ordered: true });
  add("applied", 3, "You have 8 coins that look identical. One is slightly heavier. Using a balance scale, what is the smallest number of weighings that is guaranteed to find it?",
    ["1", "2", "3", "4"], 1, { ordered: true });

  /* ----- Spatial (8) ----- */
  add("spatial", 1, "The shape turns the same way each step. Which shape comes next?", [
    optGlyph(F_PATH, 0, false), optGlyph(F_PATH, 270, true), optGlyph(F_PATH, 270, false), optGlyph(F_PATH, 90, true)
  ], 2, { kind: "svg", visual: sequence([[0, false], [90, false], [180, false], null]),
    alt: "A shape shown turned 0, 90 and 180 degrees clockwise, followed by an empty box" });

  add("spatial", 1, "Which option is the target shape turned around, not flipped over?", [
    optGlyph(F_PATH, 0, true), optGlyph(F_PATH, 180, false), optGlyph(F_PATH, 90, true), optGlyph(F_PATH, 270, true)
  ], 1, { kind: "svg", visual: target(F_PATH, 90), alt: "The target shape, an F turned on its side" });

  add("spatial", 1, "Each box has dots. Which option completes the pattern?", [
    optDots(4), optDots(6), optDots(5), optDots(3)
  ], 2, { kind: "svg", alt: "A three by three grid of dots with the last box empty",
    visual: (function () {
      var v = [[1, 2, 3], [2, 3, 4], [3, 4, null]];
      return grid3(function (r, c, cx, cy) { return v[r][c] ? dots(v[r][c], cx, cy, 1) : qmark(cx, cy); });
    })() });

  add("spatial", 2, "Three of these shapes are the same shape turned to different angles. One is a mirror image. Which is the odd one out?", [
    optGlyph(F_PATH, 90, false), optGlyph(F_PATH, 0, true), optGlyph(F_PATH, 270, false), optGlyph(F_PATH, 180, false)
  ], 1, { kind: "svg" });

  add("spatial", 2, "Each row and each column contains every shape once. Which option goes in the empty box?", [
    optShape("circle", "violet"), optShape("square", "violet"), optShape("triangle", "mint"), optShape("square", "coral")
  ], 3, { kind: "svg", alt: "A three by three grid of circles, squares and triangles with the last box empty",
    visual: (function () {
      var L = [["circle", "square", "triangle"], ["square", "triangle", "circle"], ["triangle", "circle", null]];
      var COL = { circle: "violet", square: "coral", triangle: "mint" };
      return grid3(function (r, c, cx, cy) {
        var k = L[r][c];
        return k ? shape(k, COL[k], cx, cy, 1) : qmark(cx, cy);
      });
    })() });

  add("spatial", 2, "Which option is the target shape turned around, not flipped over?", [
    optGlyph(G_PATH, 45, true), optGlyph(G_PATH, 0, false), optGlyph(G_PATH, 0, true), optGlyph(G_PATH, 90, true)
  ], 1, { kind: "svg", visual: target(G_PATH, 90), alt: "The target shape, an S-shaped block turned on its side" });

  add("spatial", 3, "The shape turns by a bigger amount each step. Which shape comes next?", [
    optGlyph(F_PATH, 45, false), optGlyph(F_PATH, 90, false), optGlyph(F_PATH, 0, false), optGlyph(F_PATH, 90, true)
  ], 1, { kind: "svg", visual: sequence([[0, false], [45, false], [135, false], [270, false], null]),
    alt: "A shape shown turned 0, 45, 135 and 270 degrees clockwise, followed by an empty box" });

  add("spatial", 3, "The shaded squares turn a quarter turn clockwise each step. Which grid comes next?", [
    optGrid([[2, 2], [2, 1], [1, 1]]), optGrid([[0, 0], [1, 0], [1, 1]]),
    optGrid([[2, 0], [1, 0], [1, 1]]), optGrid([[2, 0], [2, 1], [1, 1]])
  ], 2, { kind: "svg", alt: "Three grids of shaded squares turning clockwise, followed by an empty box",
    visual: svg(340, 90,
      miniGrid([[0, 0], [0, 1], [1, 1]], 12, 15, 20) +
      miniGrid([[0, 2], [1, 2], [1, 1]], 96, 15, 20) +
      miniGrid([[2, 2], [2, 1], [1, 1]], 180, 15, 20) +
      frame(294, 45, 64) + qmark(294, 45), 420) });

  /* ---------------- Test state ---------------- */
  var el = {
    start: $("screen-start"), test: $("screen-test"), result: $("screen-result"),
    startBtn: $("start-btn"),
    count: $("t-count"), domain: $("t-domain"), timer: $("t-timer"), bar: $("t-bar"),
    prompt: $("t-prompt"), visual: $("t-visual"), options: $("t-options"),
    back: $("t-back"), next: $("t-next"), msg: $("t-msg"), live: $("t-live")
  };
  if (!el.startBtn) return;

  var state = null;

  function arrange(list) {
    var out = [];
    [1, 2, 3].forEach(function (d) {
      var groups = {};
      shuffle(list.filter(function (q) { return q.diff === d; })).forEach(function (q) {
        (groups[q.domain] = groups[q.domain] || []).push(q);
      });
      var doms = shuffle(Object.keys(groups)), more = true;
      while (more) {
        more = false;
        doms.forEach(function (dm) {
          if (groups[dm].length) { out.push(groups[dm].shift()); more = true; }
        });
      }
    });
    return out;
  }

  function displayOrder(q) {
    var idx = [0, 1, 2, 3];
    if (q.ordered) { if (Math.random() < 0.5) idx.reverse(); return idx; }
    return shuffle(idx);
  }

  function show(which) {
    [el.start, el.test, el.result].forEach(function (p) { p.hidden = p !== which; });
    document.body.classList.toggle("testing", which === el.test);
    var top = document.querySelector(".test-shell");
    if (top) top.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  function startTest() {
    state = {
      qs: arrange(QUESTIONS).map(function (q) { return { q: q, display: displayOrder(q), chosen: null }; }),
      idx: 0,
      endAt: Date.now() + TOTAL_SECONDS * 1000,
      startedAt: Date.now(),
      timerId: 0,
      warned5: false, warned1: false, confirmFinish: false
    };
    show(el.test);
    render();
    tick();
    state.timerId = setInterval(tick, 250);
    window.onbeforeunload = function (e) { e.preventDefault(); e.returnValue = ""; };
  }

  function fmt(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function tick() {
    var left = Math.max(0, Math.round((state.endAt - Date.now()) / 1000));
    el.timer.textContent = fmt(left);
    el.timer.classList.toggle("low", left <= 120);
    if (left <= 300 && !state.warned5) { state.warned5 = true; el.live.textContent = "5 minutes left."; }
    if (left <= 60 && !state.warned1) { state.warned1 = true; el.live.textContent = "1 minute left."; }
    if (left <= 0) finish(true);
  }

  function render() {
    var it = state.qs[state.idx], q = it.q;
    el.count.textContent = "Question " + (state.idx + 1) + " of " + state.qs.length;
    el.domain.textContent = DOMAIN_NAMES[q.domain];
    el.bar.style.transform = "scaleX(" + ((state.idx + 1) / state.qs.length) + ")";
    el.prompt.textContent = q.prompt;

    if (q.visual) {
      el.visual.hidden = false;
      el.visual.innerHTML = q.visual;
      el.visual.setAttribute("role", "img");
      el.visual.setAttribute("aria-label", q.alt || "Puzzle diagram");
    } else {
      el.visual.hidden = true;
      el.visual.innerHTML = "";
    }

    var html = "";
    for (var pos = 0; pos < OPTION_COUNT; pos++) {
      var authored = it.display[pos];
      var letter = String.fromCharCode(65 + pos);
      var body = q.kind === "svg" ? q.options[authored] : esc(q.options[authored]);
      var sel = it.chosen === pos;
      html += '<button type="button" class="opt' + (sel ? " selected" : "") + '" role="radio" aria-checked="' +
        (sel ? "true" : "false") + '" data-pos="' + pos + '"' +
        (q.kind === "svg" ? ' aria-label="Option ' + letter + '"' : "") + ">" +
        '<span class="opt-key" aria-hidden="true">' + letter + "</span>" +
        '<span class="opt-body">' + body + "</span></button>";
    }
    el.options.innerHTML = html;
    el.options.classList.toggle("is-svg", q.kind === "svg");

    el.back.disabled = state.idx === 0;
    updateNext();
    el.msg.textContent = "";
    state.confirmFinish = false;
    el.prompt.focus({ preventScroll: true });
  }

  function updateNext() {
    var it = state.qs[state.idx];
    var last = state.idx === state.qs.length - 1;
    el.next.textContent = last ? "Finish test" : (it.chosen === null ? "Skip" : "Next");
    el.next.classList.toggle("btn-primary", it.chosen !== null || last);
    el.next.classList.toggle("btn-ghost", it.chosen === null && !last);
  }

  function choose(pos) {
    state.qs[state.idx].chosen = pos;
    var btns = el.options.querySelectorAll(".opt");
    Array.prototype.forEach.call(btns, function (b, i) {
      var on = i === pos;
      b.classList.toggle("selected", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
    updateNext();
  }

  function unanswered() {
    return state.qs.filter(function (it) { return it.chosen === null; }).length;
  }

  function next() {
    if (state.idx < state.qs.length - 1) { state.idx++; render(); return; }
    var left = unanswered();
    if (left > 0 && !state.confirmFinish) {
      state.confirmFinish = true;
      el.msg.textContent = "You have " + left + " unanswered question" + (left === 1 ? "" : "s") +
        ". Press Finish test again to submit anyway, or use Back to answer them.";
      return;
    }
    finish(false);
  }

  /* ---------------- Scoring ---------------- */
  function scoreTest() {
    var raw = 0, answered = 0, right = 0;
    var dom = {};
    Object.keys(DOMAIN_NAMES).forEach(function (k) { dom[k] = { got: 0, max: 0 }; });

    state.qs.forEach(function (it) {
      var q = it.q;
      dom[q.domain].max += q.diff;
      if (it.chosen === null) return;
      answered++;
      if (it.display[it.chosen] === q.correct) {
        right++; raw += q.diff; dom[q.domain].got += q.diff;
      } else {
        raw -= q.diff / (OPTION_COUNT - 1);   // penalty so random guessing scores about zero
      }
    });

    var z = (raw - MEAN_SCORE) / SD_SCORE;
    var iq = Math.round(clamp(100 + 15 * z, 55, 145));
    var pct = cdf((iq - 100) / 15) * 100;

    return { iq: iq, pct: pct, answered: answered, right: right, dom: dom };
  }

  /* ---------------- Results ---------------- */
  function drawCurve(svgEl, iq) {
    var NS = "http://www.w3.org/2000/svg";
    var W = 640, PAD = 20, BASE = 210, PEAK_H = 170, MIN = 55, MAX = 145, MEAN = 100, SD = 15;
    function pdf(x) { return Math.exp(-0.5 * Math.pow((x - MEAN) / SD, 2)); }
    function xOf(v) { return PAD + ((v - MIN) / (MAX - MIN)) * (W - PAD * 2); }
    function yOf(v) { return BASE - pdf(v) * PEAK_H; }
    function mk(tag, attrs) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    }
    svgEl.innerHTML = "";
    var line = "";
    for (var v = MIN; v <= MAX; v += 0.5) {
      line += (v === MIN ? "M" : "L") + xOf(v).toFixed(1) + " " + yOf(v).toFixed(1) + " ";
    }
    var area = line + "L" + xOf(MAX) + " " + BASE + " L" + xOf(MIN) + " " + BASE + " Z";
    var x = xOf(iq), y = yOf(iq);

    var defs = mk("defs", {}), clip = mk("clipPath", { id: "r-clip" });
    clip.appendChild(mk("rect", { x: 0, y: 0, width: x, height: 260 }));
    defs.appendChild(clip);
    svgEl.appendChild(defs);
    svgEl.appendChild(mk("path", { d: area, "class": "curve-base" }));
    svgEl.appendChild(mk("path", { d: area, "class": "curve-fill", "clip-path": "url(#r-clip)" }));
    svgEl.appendChild(mk("line", { x1: PAD, x2: W - PAD, y1: BASE, y2: BASE, "class": "curve-axis" }));
    svgEl.appendChild(mk("path", { d: line, "class": "curve-line", pathLength: 1 }));
    [70, 85, 100, 115, 130].forEach(function (t) {
      var tx = mk("text", { x: xOf(t), y: BASE + 28, "class": "curve-tick" });
      tx.textContent = t;
      svgEl.appendChild(tx);
    });
    svgEl.appendChild(mk("line", { x1: x, x2: x, y1: y, y2: BASE, "class": "curve-marker-line" }));
    svgEl.appendChild(mk("circle", { cx: x, cy: y, r: 9, "class": "curve-marker-dot" }));
  }

  function finish(timedOut) {
    clearInterval(state.timerId);
    window.onbeforeunload = null;
    var res = scoreTest();
    var used = Math.min(TOTAL_SECONDS, Math.round((Date.now() - state.startedAt) / 1000));

    show(el.result);

    var scoreEl = $("r-score");
    var target = res.iq;
    if (reduceMotion) {
      scoreEl.textContent = target;
    } else {
      var t0 = null;
      (function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1400, 1);
        scoreEl.textContent = Math.round(55 + (target - 55) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }

    $("r-label").textContent = ratingLabel(res.iq);
    var pctTxt = res.pct > 99.9 ? "99.9" : res.pct < 0.1 ? "0.1" : (res.pct < 10 || res.pct > 90) ? res.pct.toFixed(1) : String(Math.round(res.pct));
    $("r-pct").textContent = "You scored higher than about " + pctTxt + "% of people.";
    $("r-range").textContent = "Likely range: " + clamp(res.iq - 8, 55, 145) + " to " + clamp(res.iq + 8, 55, 145) + ". Online estimates can be off by several points.";
    $("r-time").textContent = (timedOut ? "Time ran out. " : "") + res.right + " of " + state.qs.length +
      " correct, " + res.answered + " answered, " + fmt(used) + " used.";

    var warn = $("r-warn");
    if (res.answered < 10) {
      warn.hidden = false;
      warn.textContent = "You answered only " + res.answered + " of " + state.qs.length +
        " questions, so this estimate is not reliable. Retake the test and answer as many as you can.";
    } else {
      warn.hidden = true;
    }

    drawCurve($("r-curve"), res.iq);

    var bars = "", best = null;
    Object.keys(DOMAIN_NAMES).forEach(function (k) {
      var d = res.dom[k], p = d.max ? Math.round((d.got / d.max) * 100) : 0;
      if (!best || p > best.p) best = { k: k, p: p };
      bars += '<div class="bar-row"><div class="bar-top"><span>' + DOMAIN_NAMES[k] + "</span><strong>" + p +
        '%</strong></div><div class="bar"><span style="--w:' + (p / 100) + '"></span></div></div>';
    });
    $("r-bars").innerHTML = bars;
    $("r-best").textContent = res.answered >= 10 ? "Your strongest skill was " + DOMAIN_NAMES[best.k].toLowerCase() + "." : "";

    // Trigger the bar animation on the next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { $("r-bars").classList.add("go"); });
    });
  }

  /* ---------------- Events ---------------- */
  el.startBtn.addEventListener("click", startTest);

  el.options.addEventListener("click", function (e) {
    var b = e.target.closest(".opt");
    if (b) choose(parseInt(b.getAttribute("data-pos"), 10));
  });
  el.back.addEventListener("click", function () {
    if (state.idx > 0) { state.idx--; render(); }
  });
  el.next.addEventListener("click", next);

  document.addEventListener("keydown", function (e) {
    if (!state || el.test.hidden || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key >= "1" && e.key <= "4") { choose(parseInt(e.key, 10) - 1); }
    else if (e.key === "ArrowRight") { next(); }
    else if (e.key === "ArrowLeft" && state.idx > 0) { state.idx--; render(); }
  });

  $("retake-btn").addEventListener("click", function () {
    show(el.start);
  });
})();
