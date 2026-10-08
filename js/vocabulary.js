/* Thinkora - vocabulary test (20 questions, three levels) */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var panel = $("v-panel");
  if (!panel) return;

  var BANK = {
    1: [
      ["brief", "short in time or length"], ["ancient", "very old"], ["rapid", "happening very fast"],
      ["huge", "extremely large"], ["silent", "making no sound at all"], ["fragile", "easily broken or damaged"],
      ["generous", "happy to give more than is expected"], ["weary", "very tired"], ["crowded", "filled with too many people"],
      ["tiny", "extremely small"], ["bright", "giving out a lot of light"], ["gentle", "soft and kind in the way you act"],
      ["damp", "slightly wet"], ["honest", "telling the truth"], ["empty", "having nothing inside"]
    ],
    2: [
      ["reluctant", "unwilling and hesitant to do something"], ["meticulous", "paying very close attention to small details"],
      ["scarce", "not available in large amounts"], ["obsolete", "no longer used because something newer replaced it"],
      ["candid", "open and direct, even when it is uncomfortable"], ["pragmatic", "focused on what works in practice"],
      ["vague", "not clear or exact"], ["diligent", "hard-working and persistent"],
      ["abundant", "existing in very large amounts"], ["hostile", "unfriendly and openly opposed to someone"],
      ["frugal", "careful about spending money"], ["modest", "not boastful about your own abilities"],
      ["mundane", "ordinary and lacking excitement"], ["thrive", "grow or develop successfully"],
      ["concise", "giving the information in few words"], ["hinder", "make something harder to do"],
      ["tentative", "not certain or final"], ["lenient", "not strict when punishing or judging"]
    ],
    3: [
      ["ephemeral", "lasting only a very short time"], ["ubiquitous", "seeming to be present everywhere"],
      ["laconic", "using very few words"], ["ostentatious", "showy, meant to impress other people"],
      ["perfunctory", "done quickly with little care or interest"], ["sycophant", "someone who flatters important people to gain favor"],
      ["tenacious", "holding firmly to a goal and refusing to give up"], ["pernicious", "harmful in a gradual, hard-to-notice way"],
      ["inscrutable", "impossible to understand or read"], ["magnanimous", "generous and forgiving, especially toward a rival"],
      ["cogent", "clear, logical and convincing"], ["capricious", "changing mood or behavior suddenly and without reason"],
      ["parsimonious", "extremely unwilling to spend money"], ["surreptitious", "done secretly to avoid being noticed"]
    ]
  };
  var PLAN = [[1, 5], [2, 8], [3, 7]];
  var LEVEL_NAMES = { 1: "Everyday words", 2: "Intermediate words", 3: "Advanced words" };

  var intro = $("v-intro"), quiz = $("v-quiz"), result = $("v-result");
  var countEl = $("v-count"), levelEl = $("v-level"), scoreEl = $("v-score"), bar = $("v-bar").firstElementChild;
  var promptEl = $("v-prompt"), optsEl = $("v-options"), nextBtn = $("v-next"), navEl = $("v-nav"), msg = $("v-msg");
  var qs = [], idx = 0, score = 0, answered = false, missed = [];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function build() {
    var out = [];
    PLAN.forEach(function (p) {
      var lvl = p[0], pool = BANK[lvl];
      shuffle(pool).slice(0, p[1]).forEach(function (it) {
        var wrong = shuffle(pool.filter(function (o) { return o[0] !== it[0]; })).slice(0, 3).map(function (o) { return o[1]; });
        out.push({ lvl: lvl, word: it[0], def: it[1], options: shuffle([it[1]].concat(wrong)) });
      });
    });
    return out;
  }

  function show(which) { [intro, quiz, result].forEach(function (p) { p.hidden = p !== which; }); }

  function render() {
    var q = qs[idx];
    answered = false;
    countEl.textContent = "Question " + (idx + 1) + " of " + qs.length;
    levelEl.textContent = LEVEL_NAMES[q.lvl];
    scoreEl.textContent = "Correct: " + score;
    bar.style.width = (idx / qs.length * 100) + "%";
    promptEl.innerHTML = "What does \u201c" + esc(q.word) + "\u201d mean?";
    optsEl.innerHTML = q.options.map(function (o, i) {
      return '<button type="button" class="opt" data-i="' + i + '"><span class="opt-key" aria-hidden="true">' +
        String.fromCharCode(65 + i) + '</span><span class="opt-body">' + esc(cap(o)) + "</span></button>";
    }).join("");
    navEl.hidden = true;
    msg.textContent = "";
  }

  function choose(i) {
    if (answered) return;
    answered = true;
    var q = qs[idx], right = q.options[i] === q.def;
    Array.prototype.forEach.call(optsEl.children, function (b, k) {
      b.disabled = true;
      if (q.options[k] === q.def) b.classList.add("is-right");
      else if (k === i) b.classList.add("is-wrong");
    });
    if (right) { score++; msg.textContent = "Correct."; }
    else { missed.push(q); msg.textContent = "Not quite. \u201c" + q.word + "\u201d means: " + q.def + "."; }
    scoreEl.textContent = "Correct: " + score;
    nextBtn.textContent = idx === qs.length - 1 ? "See my result" : "Next question";
    navEl.hidden = false;
    nextBtn.focus({ preventScroll: true });
  }

  function label(s) {
    if (s >= 18) return "Advanced vocabulary";
    if (s >= 14) return "Strong vocabulary";
    if (s >= 9) return "Good everyday vocabulary";
    return "Still growing";
  }

  function finish() {
    bar.style.width = "100%";
    $("v-final").textContent = score + " / " + qs.length;
    $("v-label").textContent = label(score);
    $("v-note").textContent = missed.length ? "Words to review:" : "You answered every word correctly.";
    $("v-missed").innerHTML = missed.map(function (q) {
      return "<li><strong>" + esc(q.word) + "</strong>: " + esc(q.def) + "</li>";
    }).join("");
    show(result);
    result.setAttribute("tabindex", "-1");
    result.focus({ preventScroll: true });
  }

  function start() {
    qs = build(); idx = 0; score = 0; missed = [];
    show(quiz); render();
  }

  optsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".opt");
    if (b) choose(Number(b.getAttribute("data-i")));
  });
  nextBtn.addEventListener("click", function () {
    if (idx < qs.length - 1) { idx++; render(); promptEl.focus({ preventScroll: true }); } else finish();
  });
  document.addEventListener("keydown", function (e) {
    if (quiz.hidden || e.target.closest("button") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!answered && /^[1-4]$/.test(e.key)) choose(Number(e.key) - 1);
  });
  $("v-start").addEventListener("click", start);
  $("v-again").addEventListener("click", start);
})();
