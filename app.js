(function () {
  let data = StorageAPI.load();
  const today = () => StorageAPI.todayKey();

  function persist() {
    StorageAPI.save(data);
  }

  function fmt(ms) {
    return (ms / 1000).toFixed(2);
  }

  function avg(list) {
    if (!list.length) return null;
    return list.reduce((a, b) => a + b, 0) / list.length;
  }

  // ── Navigation ──
  function showPanel(name) {
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".bottom-nav button").forEach((b) => b.classList.remove("active"));
    const panel = document.getElementById("panel-" + name);
    if (panel) panel.classList.add("active");
    const nav = document.querySelector(`.bottom-nav button[data-nav="${name}"]`);
    if (nav) nav.classList.add("active");
    if (name === "today") renderToday();
    if (name === "cross") renderCrossStats();
    if (name === "f2l") {
      renderF2lStats();
      renderF2lFilter();
      renderDecisionTree();
      renderQuizFilter();
      renderQuizStats();
      renderF2lList(currentGroupFilter);
    }
    if (name === "me") renderMe();
    if (name === "pll") renderPLLList();
  }

  document.querySelectorAll("[data-nav]").forEach((el) => {
    el.addEventListener("click", () => showPanel(el.getAttribute("data-nav")));
  });

  // ── Today / Plans ──
  function initDaySelects() {
    const sd = document.getElementById("stage-day");
    const fd = document.getElementById("f2l-day");
    sd.innerHTML = "";
    fd.innerHTML = "";
    for (let i = 1; i <= 7; i++) {
      sd.innerHTML += `<option value="${i}">Day ${i}</option>`;
    }
    for (let i = 1; i <= 7; i++) {
      fd.innerHTML += `<option value="${i}">Day ${i}</option>`;
    }
    sd.value = String(data.stageDay || 1);
    const clamped = PlanData.clampF2lDay(data.f2lDay || 1);
    if (clamped !== data.f2lDay) {
      data.f2lDay = clamped;
      persist();
    }
    fd.value = String(clamped);
    sd.addEventListener("change", () => {
      data.stageDay = parseInt(sd.value, 10);
      persist();
      renderToday();
    });
    fd.addEventListener("change", () => {
      data.f2lDay = parseInt(fd.value, 10);
      persist();
      renderToday();
    });
  }

  function renderToday() {
    const plan = PlanData.buildToday(data.stageDay || 1, data.f2lDay || 1);
    document.getElementById("today-labels").textContent =
      plan.crossLabel + " ｜ " + plan.f2lLabel;
    const checks = data.planChecks[today()] || {};
    const root = document.getElementById("today-tasks");
    root.innerHTML = plan.tasks
      .map((t) => {
        const checked = !!checks[t.id];
        return `<div class="task">
          <input type="checkbox" data-task="${t.id}" ${checked ? "checked" : ""} />
          <div class="body">
            <div><span class="pill">${t.section}</span><span class="title">${t.title}</span></div>
            <div class="detail">${t.detail}</div>
          </div>
          <button type="button" class="go" data-go="${t.go}" data-groups="${(t.groups || []).join(",")}" ${t.scrollAtlas ? 'data-scroll-atlas="1"' : ""}>去练</button>
        </div>`;
      })
      .join("");

    root.querySelectorAll("input[data-task]").forEach((inp) => {
      inp.addEventListener("change", () => {
        if (!data.planChecks[today()]) data.planChecks[today()] = {};
        data.planChecks[today()][inp.getAttribute("data-task")] = inp.checked;
        persist();
      });
    });
    root.querySelectorAll("[data-go]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const go = btn.getAttribute("data-go");
        if (go === "finger") {
          showPanel("cross");
          requestAnimationFrame(() => {
            document.getElementById("finger-drill").scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          });
        } else if (go === "f2l" || go === "f2l-timer" || go === "f2l-quiz") {
          const g = btn.getAttribute("data-groups");
          if (g != null) {
            const gs = g.split(",").map((x) => parseInt(x, 10)).filter(Boolean);
            currentGroupFilter = gs.length === 1 ? gs[0] : "all";
            if (gs.length) quizGroupFilter = gs;
          }
          showPanel("f2l");
          if (go === "f2l-timer") {
            document.getElementById("f2l-start").scrollIntoView({ behavior: "smooth", block: "center" });
          }
          if (go === "f2l-quiz") {
            document.getElementById("quiz-next").scrollIntoView({ behavior: "smooth", block: "center" });
          }
          if (btn.hasAttribute("data-scroll-atlas")) {
            const guide = document.getElementById("f2l-guide");
            if (guide) {
              guide.open = true;
              guide.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        } else {
          showPanel(go);
        }
      });
    });
  }

  // ── Cross timer ──
  let crossState = "idle"; // idle | observe | ready | running
  let crossObserveEnds = 0;
  let crossObserveRaf = null;
  let crossStart = 0;
  let crossRaf = null;

  function setCrossHint(text) {
    document.getElementById("cross-hint").textContent = text;
  }

  let crossOptimalAlg = "";
  let crossOptimalShown = false;

  function hideOptimalAlg() {
    crossOptimalShown = false;
    document.getElementById("cross-optimal-alg").classList.add("hidden");
    document.getElementById("cross-optimal-toggle").textContent = "显示公式";
  }

  let crossScrambleBusy = false;

  function setCrossScrambleLoading(loading) {
    const btn = document.getElementById("cross-new-scramble");
    const status = document.getElementById("cross-scramble-status");
    crossScrambleBusy = loading;
    btn.disabled = loading;
    btn.classList.toggle("loading", loading);
    btn.textContent = loading ? "生成中…" : "新打乱";
    status.classList.toggle("hidden", !loading);
    status.textContent = loading ? "正在生成打乱并计算最优十字…" : "";
  }

  function updateOptimalCross(scramble) {
    hideOptimalAlg();
    const meta = document.getElementById("cross-optimal-meta");
    const box = document.getElementById("cross-optimal-alg");
    try {
      const sol = CrossSolver.solveWhiteCross(scramble);
      if (!sol.ok) {
        crossOptimalAlg = "";
        meta.textContent = "最优十字 · 未求出";
        box.textContent = sol.error || "";
        return;
      }
      crossOptimalAlg = sol.alg;
      meta.textContent = sol.length === 0 ? "最优十字 · 已是十字" : `最优十字 · ${sol.length} 步`;
      box.textContent = sol.alg;
    } catch (e) {
      crossOptimalAlg = "";
      meta.textContent = "最优十字 · 出错";
      box.textContent = e.message;
    }
  }

  function newCrossScramble() {
    if (crossScrambleBusy) return;
    setCrossScrambleLoading(true);
    document.getElementById("cross-scramble").textContent = "…";
    document.getElementById("cross-optimal-meta").textContent = "最优十字 · 计算中…";

    const scr = Scramble.randomScramble(16);
    document.getElementById("cross-scramble").textContent = scr;
    crossReset(false);

    setTimeout(() => {
      updateOptimalCross(scr);
      setCrossScrambleLoading(false);
    }, 16);
  }

  function crossReset(keepScramble) {
    crossState = "idle";
    cancelAnimationFrame(crossObserveRaf);
    cancelAnimationFrame(crossRaf);
    document.getElementById("cross-timer").textContent = "0.00";
    document.getElementById("cross-timer").classList.remove("running");
    document.getElementById("cross-observe-bar").style.transform = "scaleX(0)";
    document.getElementById("cross-start").disabled = false;
    document.getElementById("cross-stop").disabled = true;
    document.getElementById("cross-observe").disabled = false;
    setCrossHint("可先「开始观察」规划，也可直接点「开始拧」（观察不必满 15 秒）");
    if (!keepScramble) {
      /* scramble kept by caller */
    }
  }

  function tickObserve() {
    const left = Math.max(0, crossObserveEnds - Date.now());
    const p = 1 - left / 15000;
    document.getElementById("cross-observe-bar").style.transform = `scaleX(${p})`;
    if (crossState === "observe") {
      setCrossHint(`观察中… 剩余 ${(left / 1000).toFixed(1)}s · 随时可点「开始拧」`);
    }
    if (left <= 0) {
      if (crossState === "observe") {
        crossState = "ready";
        setCrossHint("观察时间到 → 点「开始拧」");
      }
      return;
    }
    crossObserveRaf = requestAnimationFrame(tickObserve);
  }

  function tickCross() {
    const ms = Date.now() - crossStart;
    document.getElementById("cross-timer").textContent = fmt(ms);
    crossRaf = requestAnimationFrame(tickCross);
  }

  document.getElementById("cross-optimal-toggle").addEventListener("click", () => {
    if (!crossOptimalAlg) return;
    crossOptimalShown = !crossOptimalShown;
    document.getElementById("cross-optimal-alg").classList.toggle("hidden", !crossOptimalShown);
    document.getElementById("cross-optimal-toggle").textContent = crossOptimalShown ? "隐藏公式" : "显示公式";
  });
  document.getElementById("cross-new-scramble").addEventListener("click", newCrossScramble);
  document.getElementById("cross-reset").addEventListener("click", () => crossReset(true));
  document.getElementById("cross-observe").addEventListener("click", () => {
    crossState = "observe";
    crossObserveEnds = Date.now() + 15000;
    document.getElementById("cross-observe").disabled = true;
    document.getElementById("cross-start").disabled = false;
    tickObserve();
  });
  document.getElementById("cross-start").addEventListener("click", () => {
    if (crossState === "running") return;
    cancelAnimationFrame(crossObserveRaf);
    crossState = "running";
    crossStart = Date.now();
    document.getElementById("cross-timer").classList.add("running");
    document.getElementById("cross-start").disabled = true;
    document.getElementById("cross-stop").disabled = false;
    document.getElementById("cross-observe").disabled = true;
    setCrossHint("拧十字中… 完成后点「十字完成」");
    tickCross();
  });
  document.getElementById("cross-stop").addEventListener("click", () => {
    if (crossState !== "running") return;
    cancelAnimationFrame(crossRaf);
    const ms = Date.now() - crossStart;
    data.crossTimes.push({ t: Date.now(), ms, date: today() });
    persist();
    crossState = "idle";
    document.getElementById("cross-timer").classList.remove("running");
    document.getElementById("cross-stop").disabled = true;
    document.getElementById("cross-observe").disabled = false;
    setCrossHint(`完成 ${fmt(ms)}s · 可点「新打乱」再来一次`);
    renderCrossStats();
  });

  function todaysCross() {
    return data.crossTimes.filter((x) => x.date === today()).map((x) => x.ms);
  }

  function renderCrossStats() {
    const list = todaysCross();
    document.getElementById("cross-count").textContent = String(list.length);
    document.getElementById("cross-last").textContent = list.length ? fmt(list[list.length - 1]) : "—";
    const a = avg(list);
    document.getElementById("cross-avg").textContent = a == null ? "—" : fmt(a);
    document.getElementById("cross-avg").style.color = a != null && a < 8000 ? "var(--green)" : "";
    document.getElementById("cross-times").innerHTML = list
      .slice()
      .reverse()
      .slice(0, 20)
      .map((ms, i) => `<div>#${list.length - i} <strong>${fmt(ms)}</strong>s</div>`)
      .join("");
  }

  // ── F2L full timer ──
  let f2lState = "idle";
  let f2lStart = 0;
  let f2lRaf = null;

  function tickF2l() {
    document.getElementById("f2l-timer").textContent = fmt(Date.now() - f2lStart);
    f2lRaf = requestAnimationFrame(tickF2l);
  }

  document.getElementById("f2l-start").addEventListener("click", () => {
    f2lState = "running";
    f2lStart = Date.now();
    document.getElementById("f2l-timer").classList.add("running");
    document.getElementById("f2l-start").disabled = true;
    document.getElementById("f2l-stop").disabled = false;
    document.getElementById("f2l-hint").textContent = "四组 F2L 进行中…";
    tickF2l();
  });
  document.getElementById("f2l-stop").addEventListener("click", () => {
    if (f2lState !== "running") return;
    cancelAnimationFrame(f2lRaf);
    const ms = Date.now() - f2lStart;
    data.f2lTimes.push({ t: Date.now(), ms, date: today(), mode: "full" });
    persist();
    f2lState = "idle";
    document.getElementById("f2l-timer").classList.remove("running");
    document.getElementById("f2l-start").disabled = false;
    document.getElementById("f2l-stop").disabled = true;
    document.getElementById("f2l-hint").textContent = `完成 ${fmt(ms)}s`;
    renderF2lStats();
  });
  document.getElementById("f2l-reset").addEventListener("click", () => {
    cancelAnimationFrame(f2lRaf);
    f2lState = "idle";
    document.getElementById("f2l-timer").textContent = "0.00";
    document.getElementById("f2l-timer").classList.remove("running");
    document.getElementById("f2l-start").disabled = false;
    document.getElementById("f2l-stop").disabled = true;
    document.getElementById("f2l-hint").textContent = "准备好后开始";
  });

  function todaysF2lFull() {
    return data.f2lTimes.filter((x) => x.date === today() && x.mode === "full").map((x) => x.ms);
  }

  function renderF2lStats() {
    const list = todaysF2lFull();
    document.getElementById("f2l-count").textContent = String(list.length);
    document.getElementById("f2l-last").textContent = list.length ? fmt(list[list.length - 1]) : "—";
    const a = avg(list);
    document.getElementById("f2l-avg").textContent = a == null ? "—" : fmt(a);
  }

  // ── F2L case list ──
  let currentGroupFilter = "all";
  let activeCase = null;
  let caseTimerState = "idle";
  let caseStart = 0;
  let caseRaf = null;

  function renderF2lFilter() {
    const bar = document.getElementById("f2l-filter");
    const groups = F2LData.getGroupNumbers();
    const items = [{ id: "all", label: "全部" }].concat(
      groups.map((g) => ({ id: String(g), label: `组 ${g}` }))
    );
    bar.innerHTML = items
      .map(
        (it) =>
          `<button type="button" data-g="${it.id}" class="${String(currentGroupFilter) === it.id ? "active" : ""}">${it.label}</button>`
      )
      .join("");
    bar.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => {
        currentGroupFilter = b.getAttribute("data-g") === "all" ? "all" : parseInt(b.getAttribute("data-g"), 10);
        renderF2lFilter();
        renderF2lList(currentGroupFilter);
      });
    });
  }

  function renderDecisionTree() {
    const root = document.getElementById("f2l-decision-tree");
    if (!root || !F2LData.DECISION_TREE) return;
    root.innerHTML =
      '<div class="decision-tree">' +
      F2LData.DECISION_TREE.map(
        (block) =>
          `<div class="dt-q">${block.q}</div><ul>${block.a.map((line) => `<li>${line}</li>`).join("")}</ul>`
      ).join("") +
      "</div>";
  }

  function renderF2lList(filter) {
    const grouped = F2LData.byGroup();
    const root = document.getElementById("f2l-list");
    const allGroups = F2LData.getGroupNumbers();
    const groups = filter === "all" ? allGroups : [filter];
    let html = "";
    for (const g of groups) {
      const meta = F2LData.GROUP_META[g];
      html += `<div class="group-head">${meta.title}</div>`;
      html += `<div class="group-decision">怎么认：${meta.decision}</div>`;
      html += `<div class="group-blurb">${meta.blurb}</div>`;
      for (const c of grouped[g] || []) {
        const count = data.casePractice[c.id] || 0;
        let diagram = "";
        try {
          diagram = CubeDraw.drawCase(c.setupAlg);
        } catch (e) {
          diagram = `<p class="muted">示意图生成失败：${e.message}</p>`;
        }
        html += `<div class="case-card" data-case="${c.id}">
          <div class="name">${c.name} <span class="pill">${count} 次</span></div>
          <div class="recog">${c.recognition}</div>
          <div class="diagram">${diagram}</div>
          <div class="alg-label">还原</div>
          <div class="alg-box mono">${c.solveAlg}</div>
          <div class="btn-row">
            <button type="button" class="btn" data-open="${c.id}">对着练</button>
          </div>
        </div>`;
      }
    }
    root.innerHTML = html;
    root.querySelectorAll("[data-open]").forEach((btn) => {
      btn.addEventListener("click", () => openCase(btn.getAttribute("data-open")));
    });
  }

  function openCase(id) {
    activeCase = F2LData.getById(id);
    if (!activeCase) return;
    document.getElementById("modal-title").textContent = activeCase.name;
    document.getElementById("modal-recog").textContent = activeCase.recognition;
    document.getElementById("modal-setup").textContent = activeCase.setupAlg;
    document.getElementById("modal-solve").textContent = activeCase.solveAlg;
    const alt = document.getElementById("modal-alt");
    const altLabel = document.getElementById("modal-alt-label");
    if (activeCase.altAlgs && activeCase.altAlgs.length) {
      alt.classList.remove("hidden");
      altLabel.textContent = "替代公式";
      alt.textContent = activeCase.altAlgs.join("  ｜  ");
    } else {
      alt.classList.add("hidden");
      altLabel.textContent = "";
      alt.textContent = "";
    }
    try {
      document.getElementById("modal-diagram").innerHTML = CubeDraw.drawCase(activeCase.setupAlg);
    } catch (e) {
      document.getElementById("modal-diagram").innerHTML = `<p class="muted">${e.message}</p>`;
    }
    document.getElementById("case-timer").textContent = "0.00";
    document.getElementById("case-timer-start").disabled = false;
    document.getElementById("case-timer-stop").disabled = true;
    document.getElementById("modal-hint").textContent =
      "先按复现公式摆出画面，再按还原插入。可开计时。";
    document.getElementById("case-modal").classList.remove("hidden");
  }

  function closeCase() {
    cancelAnimationFrame(caseRaf);
    caseTimerState = "idle";
    document.getElementById("case-modal").classList.add("hidden");
    activeCase = null;
  }

  document.getElementById("case-close").addEventListener("click", closeCase);
  document.getElementById("case-modal").addEventListener("click", (e) => {
    if (e.target.id === "case-modal") closeCase();
  });

  document.getElementById("case-practiced").addEventListener("click", () => {
    if (!activeCase) return;
    const id = activeCase.id;
    if (id.startsWith("pll-")) {
      data.pllPractice[id] = (data.pllPractice[id] || 0) + 1;
      persist();
      document.getElementById("modal-hint").textContent =
        `已记 1 次 · 本公式共 ${data.pllPractice[id]} 次`;
      renderPLLList();
    } else {
      data.casePractice[id] = (data.casePractice[id] || 0) + 1;
      persist();
      document.getElementById("modal-hint").textContent =
        `已记 1 次 · 本情况共 ${data.casePractice[id]} 次`;
      renderF2lList(currentGroupFilter);
    }
  });

  document.getElementById("case-timer-start").addEventListener("click", () => {
    caseTimerState = "running";
    caseStart = Date.now();
    document.getElementById("case-timer-start").disabled = true;
    document.getElementById("case-timer-stop").disabled = false;
    document.getElementById("modal-hint").textContent = "还原计时中…";
    const tick = () => {
      document.getElementById("case-timer").textContent = fmt(Date.now() - caseStart);
      caseRaf = requestAnimationFrame(tick);
    };
    tick();
  });

  document.getElementById("case-timer-stop").addEventListener("click", () => {
    if (caseTimerState !== "running" || !activeCase) return;
    cancelAnimationFrame(caseRaf);
    const ms = Date.now() - caseStart;
    const id = activeCase.id;
    if (id.startsWith("pll-")) {
      data.pllPractice[id] = (data.pllPractice[id] || 0) + 1;
      persist();
      caseTimerState = "idle";
      document.getElementById("case-timer-start").disabled = false;
      document.getElementById("case-timer-stop").disabled = true;
      document.getElementById("modal-hint").textContent = `还原 ${fmt(ms)}s · 已记入练习`;
      renderPLLList();
    } else {
      data.f2lTimes.push({
        t: Date.now(),
        ms,
        date: today(),
        mode: "case",
        caseId: id,
      });
      data.casePractice[id] = (data.casePractice[id] || 0) + 1;
      persist();
      caseTimerState = "idle";
      document.getElementById("case-timer-start").disabled = false;
      document.getElementById("case-timer-stop").disabled = true;
      document.getElementById("modal-hint").textContent = `还原 ${fmt(ms)}s · 已记入练习`;
      renderF2lList(currentGroupFilter);
    }
  });

  // ── PLL case list ──
  function renderPLLList() {
    const root = document.getElementById("pll-list");
    if (!root) return;
    const cases = PLLData.getCases();
    let html = "";
    for (const c of cases) {
      const count = data.pllPractice[c.id] || 0;
      let diagram = "";
      try {
        diagram = CubeDraw.drawPLLCase(c.setupAlg);
      } catch (e) {
        diagram = `<p class="muted">示意图生成失败：${e.message}</p>`;
      }
      html += `<div class="pll-card">
        <div class="pll-name">${c.name} <span class="pill">${count} 次</span></div>
        <div class="pll-desc">${c.description}</div>
        <div class="pll-recog">识别：${c.recognition}</div>
        <div class="pll-diagram-label">
          <span>← B →</span>
          <span>俯视（黄顶绿前）</span>
          <span>← F →</span>
        </div>
        <div class="pll-diagram">${diagram}</div>
        <div class="alg-label">公式</div>
        <div class="alg-box mono">${c.solveAlg}</div>
        <div class="btn-row">
          <button type="button" class="btn" data-open-pll="${c.id}">对着练</button>
        </div>
      </div>`;
    }
    root.innerHTML = html;
    root.querySelectorAll("[data-open-pll]").forEach((btn) => {
      btn.addEventListener("click", () => openPLLCase(btn.getAttribute("data-open-pll")));
    });
  }

  function openPLLCase(id) {
    const c = PLLData.getById(id);
    if (!c) return;
    activeCase = c;
    document.getElementById("modal-title").textContent = c.name;
    document.getElementById("modal-recog").textContent = c.recognition;
    document.getElementById("modal-setup").textContent = c.setupAlg;
    document.getElementById("modal-solve").textContent = c.solveAlg;
    const alt = document.getElementById("modal-alt");
    const altLabel = document.getElementById("modal-alt-label");
    alt.classList.add("hidden");
    altLabel.textContent = "";
    alt.textContent = "";
    try {
      document.getElementById("modal-diagram").innerHTML = CubeDraw.drawPLLCase(c.setupAlg);
    } catch (e) {
      document.getElementById("modal-diagram").innerHTML = `<p class="muted">${e.message}</p>`;
    }
    document.getElementById("case-timer").textContent = "0.00";
    document.getElementById("case-timer-start").disabled = false;
    document.getElementById("case-timer-stop").disabled = true;
    document.getElementById("modal-hint").textContent =
      "先按「复现」公式摆出 PLL 起始状态，再执行「还原」公式。";
    document.getElementById("case-modal").classList.remove("hidden");
  }

  // ── Recognition quiz ──
  let quizGroupFilter = F2LData.getGroupNumbers();
  let quizCase = null;
  let quizPhase = "idle"; // idle | group | case | done
  let quizAnswered = false;

  function getQuizMode() {
    const el = document.querySelector('input[name="quiz-mode"]:checked');
    return el ? el.value : "group";
  }

  function quizPool() {
    return F2LData.getCases().filter((c) => quizGroupFilter.includes(c.group));
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffleArr(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function ensureQuizStats() {
    if (!data.recognitionQuiz) {
      data.recognitionQuiz = { total: 0, correct: 0, byDate: {} };
    }
  }

  function recordQuiz(correct) {
    ensureQuizStats();
    const d = today();
    data.recognitionQuiz.total += 1;
    if (correct) data.recognitionQuiz.correct += 1;
    if (!data.recognitionQuiz.byDate[d]) data.recognitionQuiz.byDate[d] = { total: 0, correct: 0 };
    data.recognitionQuiz.byDate[d].total += 1;
    if (correct) data.recognitionQuiz.byDate[d].correct += 1;
    persist();
    renderQuizStats();
  }

  function renderQuizStats() {
    const el = document.getElementById("quiz-stats");
    if (!el) return;
    ensureQuizStats();
    const d = today();
    const day = data.recognitionQuiz.byDate[d] || { total: 0, correct: 0 };
    const all = data.recognitionQuiz;
    const dayPct = day.total ? Math.round((day.correct / day.total) * 100) : null;
    const allPct = all.total ? Math.round((all.correct / all.total) * 100) : null;
    el.textContent =
      `今日 ${day.correct}/${day.total}` +
      (dayPct != null ? `（${dayPct}%）` : "") +
      ` ｜ 累计 ${all.correct}/${all.total}` +
      (allPct != null ? `（${allPct}%）` : "");
  }

  function renderQuizFilter() {
    const bar = document.getElementById("quiz-group-filter");
    if (!bar) return;
    const all = F2LData.getGroupNumbers();
    const activeKey = quizGroupFilter.length === all.length ? "all" : quizGroupFilter.join(",");
    const items = [{ id: "all", label: "全部组" }].concat(all.map((g) => ({ id: String(g), label: `组 ${g}` })));
    bar.innerHTML = items
      .map((it) => {
        const on =
          it.id === "all"
            ? quizGroupFilter.length === all.length
            : quizGroupFilter.length === 1 && quizGroupFilter[0] === parseInt(it.id, 10);
        return `<button type="button" data-qg="${it.id}" class="${on ? "active" : ""}">${it.label}</button>`;
      })
      .join("");
    bar.querySelectorAll("button").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-qg");
        quizGroupFilter = id === "all" ? all.slice() : [parseInt(id, 10)];
        renderQuizFilter();
      });
    });
  }

  function setQuizUI({ prompt, optionsHtml, showResult, resultHtml, showReveal, showPractice }) {
    document.getElementById("quiz-prompt").textContent = prompt || "";
    const opt = document.getElementById("quiz-options");
    opt.innerHTML = optionsHtml || "";
    opt.classList.toggle("hidden", !optionsHtml);
    const res = document.getElementById("quiz-result");
    res.innerHTML = resultHtml || "";
    res.classList.toggle("hidden", !showResult);
    document.getElementById("quiz-reveal").classList.toggle("hidden", !showReveal);
    document.getElementById("quiz-practice").classList.toggle("hidden", !showPractice);
  }

  function drawQuizCase(c) {
    try {
      document.getElementById("quiz-diagram").innerHTML = CubeDraw.drawCase(c.setupAlg);
    } catch (e) {
      document.getElementById("quiz-diagram").innerHTML = `<p class="muted">${e.message}</p>`;
    }
  }

  function startQuizQuestion() {
    const pool = quizPool();
    if (!pool.length) {
      setQuizUI({ prompt: "请先选择至少一组", optionsHtml: "", showResult: false, showReveal: false, showPractice: false });
      return;
    }
    quizCase = pickRandom(pool);
    quizAnswered = false;
    drawQuizCase(quizCase);
    const mode = getQuizMode();
    if (mode === "case") {
      quizPhase = "case";
      showCaseOptions();
    } else {
      quizPhase = "group";
      showGroupOptions();
    }
  }

  function showGroupOptions() {
    const correct = quizCase.group;
    const all = F2LData.getGroupNumbers();
    let distractors = all.filter((g) => g !== correct);
    distractors = shuffleArr(distractors).slice(0, 3);
    const opts = shuffleArr([correct, ...distractors]);
    const html = opts
      .map((g) => {
        const meta = F2LData.GROUP_META[g];
        return `<button type="button" data-qg-pick="${g}">第 ${g} 组<br><span class="muted" style="font-size:0.7rem">${meta.title.replace(/第 \d+ 组 · /, "")}</span></button>`;
      })
      .join("");
    setQuizUI({
      prompt: "这是第几组？（四选一）",
      optionsHtml: html,
      showResult: false,
      showReveal: true,
      showPractice: false,
    });
    document.getElementById("quiz-options").querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => onGroupPick(parseInt(btn.getAttribute("data-qg-pick"), 10)));
    });
  }

  function showCaseOptions() {
    const sameGroup = F2LData.getByGroup(quizCase.group);
    let opts = shuffleArr(sameGroup);
    if (opts.length > 4) {
      const rest = opts.filter((c) => c.id !== quizCase.id);
      opts = shuffleArr([quizCase, ...shuffleArr(rest).slice(0, 3)]);
    }
    opts = shuffleArr(opts);
    const html = opts.map((c) => `<button type="button" data-qc-pick="${c.id}">${c.name}</button>`).join("");
    setQuizUI({
      prompt: `第 ${quizCase.group} 组内：是哪一种？`,
      optionsHtml: html,
      showResult: false,
      showReveal: true,
      showPractice: false,
    });
    document.getElementById("quiz-options").querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => onCasePick(btn.getAttribute("data-qc-pick")));
    });
  }

  function onGroupPick(g) {
    if (quizAnswered || !quizCase) return;
    quizAnswered = true;
    const ok = g === quizCase.group;
    recordQuiz(ok);
    highlightQuizButtons("data-qg-pick", String(g), String(quizCase.group), ok);
    const meta = F2LData.GROUP_META[quizCase.group];
    let resultHtml =
      (ok ? "✓ 组认对了！" : `✗ 这是第 ${quizCase.group} 组`) +
      `<br><strong>${meta.title}</strong><br>${meta.decision}`;
    if (getQuizMode() === "group" && ok) {
      quizPhase = "case";
      setQuizUI({
        prompt: "组对了！继续认具体哪一种：",
        optionsHtml: "",
        showResult: true,
        resultHtml,
        showReveal: false,
        showPractice: false,
      });
      setTimeout(() => {
        quizAnswered = false;
        showCaseOptions();
      }, 600);
      return;
    }
    setQuizUI({
      prompt: ok ? "组认对了" : "再看看决策树",
      optionsHtml: "",
      showResult: true,
      resultHtml: resultHtml + `<br><br>${quizCase.name}<br>${quizCase.recognition}`,
      showReveal: false,
      showPractice: true,
    });
    quizPhase = "done";
  }

  function onCasePick(id) {
    if (quizAnswered || !quizCase) return;
    quizAnswered = true;
    const ok = id === quizCase.id;
    recordQuiz(ok);
    highlightQuizButtons("data-qc-pick", id, quizCase.id, ok);
    const resultHtml =
      (ok ? "✓ 情况认对了！" : `✗ 正确：${quizCase.name}`) +
      `<br>${quizCase.recognition}<br><span class="muted">还原：${quizCase.solveAlg}</span>`;
    setQuizUI({
      prompt: ok ? "认对了" : "记住识别特征",
      optionsHtml: "",
      showResult: true,
      resultHtml,
      showReveal: false,
      showPractice: true,
    });
    quizPhase = "done";
  }

  function highlightQuizButtons(attr, picked, correct, ok) {
    document.getElementById("quiz-options").querySelectorAll("button").forEach((btn) => {
      const v = btn.getAttribute(attr);
      btn.disabled = true;
      if (v === correct) btn.classList.add("correct");
      else if (v === picked && !ok) btn.classList.add("wrong");
      else if (v === correct && !ok) btn.classList.add("missed");
    });
  }

  function revealQuizAnswer() {
    if (!quizCase || quizPhase === "done") return;
    const meta = F2LData.GROUP_META[quizCase.group];
    setQuizUI({
      prompt: "答案",
      optionsHtml: "",
      showResult: true,
      resultHtml:
        `<strong>${meta.title}</strong> · ${quizCase.name}<br>${quizCase.recognition}<br><span class="muted">还原：${quizCase.solveAlg}</span>`,
      showReveal: false,
      showPractice: true,
    });
    quizPhase = "done";
    quizAnswered = true;
  }

  document.getElementById("quiz-next").addEventListener("click", startQuizQuestion);
  document.getElementById("quiz-reveal").addEventListener("click", revealQuizAnswer);
  document.getElementById("quiz-practice").addEventListener("click", () => {
    if (quizCase) openCase(quizCase.id);
  });
  document.querySelectorAll('input[name="quiz-mode"]').forEach((inp) => {
    inp.addEventListener("change", () => {
      if (quizCase && quizPhase !== "idle") startQuizQuestion();
    });
  });

  // ── Me / backup ──
  function renderMe() {
    const checks = Object.keys(data.planChecks[today()] || {}).filter(
      (k) => data.planChecks[today()][k]
    ).length;
    const q = data.recognitionQuiz || { total: 0, correct: 0 };
    const pllCount = Object.values(data.pllPractice || {}).reduce((a, b) => a + b, 0);
    document.getElementById("me-summary").textContent =
      `今日勾选 ${checks} 项 · 十字 ${data.crossTimes.length} · F2L 计时 ${data.f2lTimes.length} · F2L 情况 ${Object.values(data.casePractice).reduce((a, b) => a + b, 0)} 次 · PLL ${pllCount} 次 · 认图 ${q.correct}/${q.total}`;
  }

  document.getElementById("btn-export-copy").addEventListener("click", async () => {
    const text = StorageAPI.exportJSON(data);
    try {
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板");
    } catch {
      prompt("复制下面全部内容：", text);
    }
  });

  document.getElementById("btn-export-file").addEventListener("click", () => {
    const text = StorageAPI.exportJSON(data);
    const blob = new Blob([text], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cube-trainer-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  function readImportText() {
    return document.getElementById("import-text").value.trim();
  }

  document.getElementById("import-file").addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById("import-text").value = String(reader.result || "");
    };
    reader.readAsText(file);
  });

  document.getElementById("btn-import-merge").addEventListener("click", () => {
    try {
      const incoming = StorageAPI.parseImport(readImportText());
      data.crossTimes = data.crossTimes.concat(incoming.crossTimes || []);
      data.f2lTimes = data.f2lTimes.concat(incoming.f2lTimes || []);
      data.planChecks = Object.assign({}, incoming.planChecks, data.planChecks);
      for (const [k, v] of Object.entries(incoming.casePractice || {})) {
        data.casePractice[k] = (data.casePractice[k] || 0) + v;
      }
      for (const [k, v] of Object.entries(incoming.pllPractice || {})) {
        data.pllPractice[k] = (data.pllPractice[k] || 0) + v;
      }
      if (incoming.recognitionQuiz) {
        ensureQuizStats();
        data.recognitionQuiz.total += incoming.recognitionQuiz.total || 0;
        data.recognitionQuiz.correct += incoming.recognitionQuiz.correct || 0;
        for (const [d, st] of Object.entries(incoming.recognitionQuiz.byDate || {})) {
          if (!data.recognitionQuiz.byDate[d]) data.recognitionQuiz.byDate[d] = { total: 0, correct: 0 };
          data.recognitionQuiz.byDate[d].total += st.total || 0;
          data.recognitionQuiz.byDate[d].correct += st.correct || 0;
        }
      }
      persist();
      alert("合并导入成功");
      renderMe();
    } catch (err) {
      alert("导入失败：" + err.message);
    }
  });

  document.getElementById("btn-import-replace").addEventListener("click", () => {
    if (!confirm("覆盖将替换本机全部训练数据，确定？")) return;
    try {
      data = StorageAPI.parseImport(readImportText());
      persist();
      alert("覆盖导入成功");
      initDaySelects();
      renderMe();
      renderToday();
    } catch (err) {
      alert("导入失败：" + err.message);
    }
  });

  document.getElementById("btn-clear").addEventListener("click", () => {
    if (!confirm("确定清空本机全部数据？建议先导出备份。")) return;
    if (!confirm("再次确认：无法恢复（除非你有备份）。")) return;
    data = StorageAPI.defaultData();
    persist();
    alert("已清空");
    initDaySelects();
    renderMe();
    renderToday();
    renderCrossStats();
    renderF2lStats();
  });

  // ── Boot ──
  initDaySelects();
  newCrossScramble();
  renderF2lFilter();
  renderDecisionTree();
  renderQuizFilter();
  renderQuizStats();
  renderToday();
  renderCrossStats();
  renderF2lStats();
  renderF2lList("all");
  renderPLLList();
  renderMe();
})();
