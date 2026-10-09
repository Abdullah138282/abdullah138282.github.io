/* Thinkora - reading speed test (one passage, three comprehension questions) */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var panel = $("rs-panel");
  if (!panel) return;

  var PASSAGES = [
    {
      title: "Why the sea has tides",
      text: [
        "Anyone who has spent a day at the coast has seen the sea rise and fall. The cause is mostly the Moon. Its gravity pulls on everything on Earth, but water can move, so the oceans respond most visibly. On the side of Earth facing the Moon, the pull is strongest, and the water bulges toward it. On the opposite side, a second bulge forms, because there the Moon pulls the planet itself more strongly than it pulls the water, so the water is left behind. As Earth turns, a given stretch of coast passes through both bulges each day, which is why most places have two high tides and two low tides roughly every 24 hours and 50 minutes.",
        "The Sun matters too, though less. Its gravity is much stronger than the Moon's in absolute terms, but it is so far away that its effect on the tides is less than half as large. When the Sun, Moon and Earth line up, at new moon and full moon, their pulls add together and produce spring tides, the biggest range between high and low water. A week or so later, when the Sun and Moon pull at right angles, the effects partly cancel and the range is smallest. These are called neap tides.",
        "Local geography changes the picture. In a narrow, funnel-shaped bay, the incoming water is squeezed upward. The Bay of Fundy in Canada is famous for this, with a tidal range that can exceed fifteen meters. On open ocean coasts the range is often under two meters."
      ],
      qs: [
        { q: "Why do most coasts have two high tides a day?",
          o: ["The Moon orbits Earth twice every day", "There are two water bulges on opposite sides of Earth, and the coast passes through both as Earth turns", "The Sun and the Moon take turns pulling on the water", "Wind pushes the water back and forth every twelve hours"], c: 1 },
        { q: "What are spring tides?",
          o: ["Tides that only happen in the spring season", "The smallest range between high and low water", "The biggest range between high and low water, when the Sun, Moon and Earth line up", "Tides found only in funnel-shaped bays"], c: 2 },
        { q: "What can exceed fifteen meters, according to the passage?",
          o: ["The depth of the open ocean", "The tidal range in the Bay of Fundy", "The height of storm waves", "The distance between neap tides"], c: 1 }
      ]
    },
    {
      title: "What really causes the seasons",
      text: [
        "Many people believe that summer happens because Earth is closer to the Sun. In fact, distance has almost nothing to do with it. Earth is closest to the Sun in early January, in the middle of the northern winter. The real cause of the seasons is the tilt of Earth's axis, which leans about 23.5 degrees away from upright compared with the flat plane of the planet's orbit.",
        "Because of this tilt, different parts of Earth lean toward the Sun at different times of the year. In June, the northern half tilts toward the Sun. Sunlight reaches it at a steeper angle, which concentrates the energy on a smaller area, and the days are longer, giving more hours of heating. In December the situation reverses: the northern half leans away, sunlight arrives at a shallow angle and spreads thinner, and the days are short. The southern half of the world has the opposite seasons at the same time, which is why Australia celebrates Christmas in summer.",
        "Near the equator, the effect is small. Days stay close to twelve hours long all year, and many tropical regions are described by wet and dry seasons rather than by hot and cold ones. Near the poles, the tilt creates extremes: in midsummer the Sun may not set at all, while in midwinter it may not rise for weeks."
      ],
      qs: [
        { q: "When is Earth closest to the Sun?",
          o: ["In June", "In early January", "At midsummer in the north", "At the equator"], c: 1 },
        { q: "What is the main cause of the seasons?",
          o: ["Earth's changing distance from the Sun", "The pull of the Moon", "The tilt of Earth's axis", "Changes in the Sun's brightness"], c: 2 },
        { q: "What happens near the equator, according to the passage?",
          o: ["The Sun does not set in midsummer", "Day length stays close to twelve hours all year", "Winters are the coldest on Earth", "The seasons reverse every month"], c: 1 }
      ]
    },
    {
      title: "How bread rises",
      text: [
        "A loaf of bread begins as a dense mix of flour, water, salt and a small amount of yeast. Yeast is a living, single-celled fungus. Once it is mixed into wet dough, it begins to feed on sugars from the flour, and it gives off two things as it does: alcohol and carbon dioxide gas.",
        "The gas is what makes bread rise. When flour and water are kneaded together, two proteins in the flour join to form gluten, a stretchy network that works like a net of tiny balloons. As the yeast produces gas, the bubbles are trapped inside the network and the whole dough slowly expands. Kneading helps by lining up the gluten strands so the network becomes stronger and more elastic. This is why bread flour, which contains more protein, tends to give a taller, chewier loaf than cake flour.",
        "Rising is not finished when the dough goes into the oven. In the first minutes of baking, heat speeds up the yeast and makes the gas bubbles expand further, a burst of growth bakers call oven spring. Soon after, the temperature inside the loaf passes about 60 degrees Celsius, the yeast dies, and the gluten and starches set into a firm structure. Finally, the outside browns because sugars and proteins on the surface react in the heat, creating the color and much of the flavor of the crust."
      ],
      qs: [
        { q: "What makes the dough rise?",
          o: ["Steam from the salt", "Air folded in by kneading", "Carbon dioxide produced by yeast and trapped in the gluten network", "Alcohol turning into flour"], c: 2 },
        { q: "Why does bread flour tend to give a taller, chewier loaf than cake flour?",
          o: ["It contains more yeast", "It contains more protein, so more gluten forms", "It contains more sugar", "It is baked at a higher temperature"], c: 1 },
        { q: "What happens when the inside of the loaf passes about 60 degrees Celsius?",
          o: ["The crust begins to brown", "Oven spring begins", "The gluten dissolves", "The yeast dies and the structure sets"], c: 3 }
      ]
    }
  ];

  var AVERAGE_WPM = 240;

  var intro = $("rs-intro"), read = $("rs-read"), quiz = $("rs-quiz"), result = $("rs-result");
  var titleEl = $("rs-title"), textEl = $("rs-text"), doneBtn = $("rs-done");
  var countEl = $("rs-count"), bar = $("rs-bar").firstElementChild;
  var promptEl = $("rs-prompt"), optsEl = $("rs-options"), nextBtn = $("rs-next"), navEl = $("rs-nav"), msg = $("rs-msg");

  var cur = null, lastIdx = -1, t0 = 0, readSeconds = 0, words = 0;
  var qi = 0, correct = 0, answered = false, missed = [], qs = [];

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function show(which) { [intro, read, quiz, result].forEach(function (p) { p.hidden = p !== which; }); }
  function fmt(sec) {
    var m = Math.floor(sec / 60), s = Math.round(sec % 60);
    if (s === 60) { m++; s = 0; }
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function startReading() {
    var idx;
    do { idx = Math.floor(Math.random() * PASSAGES.length); } while (PASSAGES.length > 1 && idx === lastIdx);
    lastIdx = idx;
    cur = PASSAGES[idx];
    words = cur.text.join(" ").trim().split(/\s+/).length;
    titleEl.textContent = cur.title;
    textEl.innerHTML = cur.text.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
    show(read);
    window.scrollTo(0, 0);
    t0 = performance.now();
  }

  function finishedReading() {
    readSeconds = (performance.now() - t0) / 1000;
    qs = cur.qs.map(function (q) {
      var right = q.o[q.c];
      return { q: q.q, right: right, options: shuffle(q.o) };
    });
    qi = 0; correct = 0; missed = [];
    show(quiz);
    renderQ();
    promptEl.focus({ preventScroll: true });
  }

  function renderQ() {
    var q = qs[qi];
    answered = false;
    countEl.textContent = "Question " + (qi + 1) + " of " + qs.length;
    bar.style.width = (qi / qs.length * 100) + "%";
    promptEl.textContent = q.q;
    optsEl.innerHTML = q.options.map(function (o, i) {
      return '<button type="button" class="opt" data-i="' + i + '"><span class="opt-key" aria-hidden="true">' +
        String.fromCharCode(65 + i) + '</span><span class="opt-body">' + esc(o) + "</span></button>";
    }).join("");
    navEl.hidden = true;
    msg.textContent = "";
  }

  function choose(i) {
    if (answered) return;
    answered = true;
    var q = qs[qi], ok = q.options[i] === q.right;
    Array.prototype.forEach.call(optsEl.children, function (b, k) {
      b.disabled = true;
      if (q.options[k] === q.right) b.classList.add("is-right");
      else if (k === i) b.classList.add("is-wrong");
    });
    if (ok) { correct++; msg.textContent = "Correct."; }
    else { missed.push(q); msg.textContent = "Not quite. The passage says: " + q.right + "."; }
    nextBtn.textContent = qi === qs.length - 1 ? "See my result" : "Next question";
    navEl.hidden = false;
    nextBtn.focus({ preventScroll: true });
  }

  function label(w) {
    if (w < 150) return "Careful reader";
    if (w < 200) return "A little slower than average";
    if (w <= 280) return "Average adult range";
    if (w <= 400) return "Fast reader";
    return "Skimming speed";
  }

  function finish() {
    bar.style.width = "100%";
    var wpm = Math.round(words / readSeconds * 60);
    var tooFast = wpm > 1000;
    var effective = Math.round(wpm * correct / qs.length);
    $("rs-wpm").textContent = wpm;
    $("rs-label").textContent = tooFast ? "Too fast to be reading" : label(wpm);
    $("rs-detail").textContent = words + " words in " + fmt(readSeconds) + ". Comprehension: " + correct + " of " + qs.length +
      ". Effective speed: " + effective + " words per minute.";
    var note;
    if (tooFast) {
      note = "That is faster than people can read with understanding, so your time probably includes skimming or a quick click. Try again and read every line.";
    } else if (correct < 2) {
      note = "You got few comprehension questions right, so your effective speed is much lower than your raw speed. Slowing down a little usually helps.";
    } else if (wpm > 400) {
      note = "Speeds this high usually mean skimming rather than full reading. Your comprehension score shows how much you took in.";
    } else {
      note = "For comparison, research on adults reading non-fiction in English finds an average of roughly " + AVERAGE_WPM + " words per minute.";
    }
    $("rs-note").textContent = note;
    $("rs-missed").innerHTML = missed.map(function (q) {
      return "<li><strong>" + esc(q.q) + "</strong> " + esc(q.right) + "</li>";
    }).join("");
    $("rs-missed-title").hidden = missed.length === 0;
    show(result);
    result.setAttribute("tabindex", "-1");
    result.focus({ preventScroll: true });
  }

  optsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".opt");
    if (b) choose(Number(b.getAttribute("data-i")));
  });
  nextBtn.addEventListener("click", function () {
    if (qi < qs.length - 1) { qi++; renderQ(); promptEl.focus({ preventScroll: true }); } else finish();
  });
  document.addEventListener("keydown", function (e) {
    if (quiz.hidden || e.target.closest("button") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (!answered && /^[1-4]$/.test(e.key)) choose(Number(e.key) - 1);
  });
  $("rs-start").addEventListener("click", startReading);
  doneBtn.addEventListener("click", finishedReading);
  $("rs-again").addEventListener("click", startReading);
})();
