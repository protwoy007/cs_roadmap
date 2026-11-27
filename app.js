const STORAGE_KEY = "cybergrid_terminal_v2";

let state = loadState();
let activeSectorId = SECTORS[0].id;

function defaultState() {
  return {
    theme: "matrix",
    passedSteps: {},
    watchedVideos: {},
    weaknessHistory: {}
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Object.assign(defaultState(), JSON.parse(raw)) : defaultState();
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- Multi-Color Theme Switcher ---
function applyTheme(themeName) {
  document.documentElement.setAttribute("data-theme", themeName);
  state.theme = themeName;
  saveState();
  document.querySelectorAll(".swatch").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.setTheme === themeName);
  });
  renderTree();
}

document.querySelectorAll(".swatch").forEach(btn => {
  btn.addEventListener("click", () => applyTheme(btn.dataset.setTheme));
});

// --- Unlock & Stats ---
function isStepUnlocked(sector, idx) {
  if (idx === 0) return true;
  return Boolean(state.passedSteps[sector.steps[idx - 1].id]);
}

function getStepVideoStats(step) {
  const total = step.videos.length;
  const done = step.videos.filter(v => state.watchedVideos[v.id]).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

function getSectorStats(sector) {
  const stepsTotal = sector.steps.length;
  const stepsPassed = sector.steps.filter(s => state.passedSteps[s.id]).length;
  let vidsTotal = 0, vidsDone = 0;
  sector.steps.forEach(s => {
    vidsTotal += s.videos.length;
    vidsDone += s.videos.filter(v => state.watchedVideos[v.id]).length;
  });
  return {
    stepsPassed, stepsTotal,
    stepPct: stepsTotal ? Math.round((stepsPassed / stepsTotal) * 100) : 0,
    vidsDone, vidsTotal,
    vidPct: vidsTotal ? Math.round((vidsDone / vidsTotal) * 100) : 0
  };
}

function renderGlobalMetrics() {
  let stTotal = 0, stPassed = 0, vTotal = 0, vDone = 0;
  SECTORS.forEach(sec => {
    const st = getSectorStats(sec);
    stTotal += st.stepsTotal; stPassed += st.stepsPassed;
    vTotal += st.vidsTotal; vDone += st.vidsDone;
  });
  const stPct = stTotal ? Math.round((stPassed / stTotal) * 100) : 0;
  const vPct = vTotal ? Math.round((vDone / vTotal) * 100) : 0;

  document.getElementById("global-steps").textContent = `${stPassed}/${stTotal} (${stPct}%)`;
  document.getElementById("global-videos").textContent = `${vPct}%`;
}

// --- Animated 8-Sector SVG Tree ---
function renderTree() {
  const svg = document.getElementById("tree-svg");
  const wrap = document.getElementById("tree-nodes");
  svg.innerHTML = "";
  wrap.innerHTML = "";

  const accentColor = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const byId = Object.fromEntries(SECTORS.map(s => [s.id, s]));

  TREE_EDGES.forEach(([fromId, toId]) => {
    const a = byId[fromId], b = byId[toId];
    if (!a || !b) return;
    const aDone = getSectorStats(a).stepPct === 100;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.pos.x * 10);
    line.setAttribute("y1", a.pos.y * 4.4);
    line.setAttribute("x2", b.pos.x * 10);
    line.setAttribute("y2", b.pos.y * 4.4);
    line.setAttribute("stroke", aDone ? accentColor : "#2b3b31");
    line.setAttribute("stroke-width", aDone ? "2.6" : "1.8");
    if (!aDone) line.classList.add("edge-flow");
    svg.appendChild(line);
  });

  SECTORS.forEach(sec => {
    const st = getSectorStats(sec);
    const dot = st.stepPct === 100 ? "dot-done" : (st.stepsPassed > 0 || st.vidsDone > 0) ? "dot-active" : "dot-idle";

    const node = document.createElement("button");
    node.className = `tree-node ${sec.id === activeSectorId ? "selected" : ""} ${st.stepPct === 100 ? "completed" : ""}`;
    node.style.left = `${sec.pos.x}%`;
    node.style.top = `${sec.pos.y}%`;
    node.innerHTML = `
      <div class="node-top">
        <span class="node-code">${sec.code}</span>
        <i class="dot ${dot}"></i>
      </div>
      <div class="node-title">${sec.title}</div>
      <div class="node-stats">
        <span class="accent">${st.stepsPassed}/${st.stepsTotal}</span>
        <span class="c-cyan">VID ${st.vidPct}%</span>
      </div>
    `;
    node.addEventListener("click", () => {
      activeSectorId = sec.id;
      renderAll();
      document.getElementById("sector-workspace").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    wrap.appendChild(node);
  });
}

// --- Active Sector Workspace ---
function renderSectorWorkspace() {
  const sector = SECTORS.find(s => s.id === activeSectorId);
  const st = getSectorStats(sector);

  document.getElementById("sector-tag").textContent = `${sector.code} // ACTIVE`;
  document.getElementById("sector-title").textContent = sector.title;
  document.getElementById("sector-desc").textContent = sector.desc;
  document.getElementById("sector-step-pct").textContent = `${st.stepsPassed}/${st.stepsTotal} (${st.stepPct}%)`;
  document.getElementById("sector-step-bar").style.width = `${st.stepPct}%`;
  document.getElementById("sector-vid-pct").textContent = `${st.vidsDone}/${st.vidsTotal} (${st.vidPct}%)`;
  document.getElementById("sector-vid-bar").style.width = `${st.vidPct}%`;

  const grid = document.getElementById("steps-container");
  grid.innerHTML = "";

  sector.steps.forEach((step, idx) => {
    const unlocked = isStepUnlocked(sector, idx);
    const passInfo = state.passedSteps[step.id];
    const vid = getStepVideoStats(step);

    const card = document.createElement("div");
    card.className = `step-card ${unlocked ? "unlocked" : "locked"} ${passInfo ? "passed" : ""}`;

    const pill = passInfo
      ? `<span class="status-pill pill-passed">PASSED ${passInfo.bestScore}%</span>`
      : unlocked
        ? `<span class="status-pill pill-open">OPEN</span>`
        : `<span class="status-pill pill-locked">LOCKED</span>`;

    card.innerHTML = `
      <div>
        <div class="step-head">
          <span class="step-num">STEP ${String(idx + 1).padStart(2, "0")}</span>
          ${pill}
        </div>
        <h3>${step.title}</h3>
        <p class="step-snippet">${step.note.slice(0, 115)}...</p>
      </div>
      <div>
        <div class="step-meta">
          <span class="c-cyan">VIDEOS: ${vid.pct}% (${vid.done}/${vid.total})</span>
          <span class="c-amber">EXAM: ${step.questions.length} Qs</span>
        </div>
        <div class="step-actions" style="margin-top: 12px;">
          ${unlocked
            ? `<button class="btn btn-outline btn-note">NOTES & VIDEOS</button>
               <button class="btn btn-primary btn-exam">${passInfo ? "RE-EXAMINE" : "TAKE EXAM"}</button>`
            : `<button class="btn" disabled>PASS STEP ${idx} (&gt;=90%)</button>`
          }
        </div>
      </div>
    `;

    if (unlocked) {
      card.querySelector(".btn-note").addEventListener("click", e => { e.stopPropagation(); openStepModal(sector, step, idx); });
      card.querySelector(".btn-exam").addEventListener("click", e => { e.stopPropagation(); openExamModal(sector, step, idx); });
      card.addEventListener("click", () => openStepModal(sector, step, idx));
    }
    grid.appendChild(card);
  });
}

// --- Step Detail Modal ---
function openStepModal(sector, step, idx) {
  document.getElementById("modal-step-badge").textContent = `${sector.code} // STEP ${String(idx + 1).padStart(2, "0")}`;
  document.getElementById("modal-step-title").textContent = step.title;
  document.getElementById("modal-step-note").textContent = step.note;
  document.getElementById("modal-step-example").textContent = step.example;

  const topics = [...new Set(step.questions.map(q => q.topic))];
  document.getElementById("modal-step-topics").innerHTML = topics.map(t => `<span class="chip">${t}</span>`).join("");

  renderModalVideos(step);

  const weakBox = document.getElementById("modal-weakness-alert");
  const weak = state.weaknessHistory[step.id];
  if (weak && weak.length && !state.passedSteps[step.id]) {
    weakBox.classList.remove("hidden");
    weakBox.innerHTML = `<strong class="c-red">LACKING AREAS (LAST ATTEMPT):</strong> ${weak.map(w => `${w.topic} (${w.pct}%)`).join(" | ")}`;
  } else {
    weakBox.classList.add("hidden");
  }

  const pass = state.passedSteps[step.id];
  document.getElementById("modal-exam-meta").textContent = `${step.questions.length} Qs | PASS >= ${PASS_THRESHOLD}%` + (pass ? ` | BEST ${pass.bestScore}%` : "");
  const btn = document.getElementById("btn-start-exam");
  btn.textContent = pass ? "RE-EXAMINE" : "START EXAM";
  btn.onclick = () => { closeModals(); openExamModal(sector, step, idx); };

  document.getElementById("step-modal").classList.remove("hidden");
}

function renderModalVideos(step) {
  const st = getStepVideoStats(step);
  document.getElementById("modal-video-pct").textContent = `${st.pct}% (${st.done}/${st.total})`;

  const list = document.getElementById("modal-video-list");
  list.innerHTML = "";
  step.videos.forEach(vid => {
    const checked = Boolean(state.watchedVideos[vid.id]);
    const row = document.createElement("div");
    row.className = "video-item";
    row.innerHTML = `
      <div class="video-left">
        <input type="checkbox" id="chk-${vid.id}" ${checked ? "checked" : ""} />
        <div>
          <label for="chk-${vid.id}">${vid.title}</label>
          <div class="video-creator">${vid.creator}</div>
        </div>
      </div>
      <a class="video-link" href="${vid.url}" target="_blank" rel="noopener noreferrer">WATCH &nearr;</a>
    `;
    row.querySelector("input").addEventListener("change", e => {
      if (e.target.checked) state.watchedVideos[vid.id] = true;
      else delete state.watchedVideos[vid.id];
      saveState();
      renderModalVideos(step);
      renderAll();
    });
    list.appendChild(row);
  });
}

// --- Exam Engine ---
function openExamModal(sector, step, idx) {
  document.getElementById("exam-badge").textContent = `${sector.code} // STEP ${idx + 1} (${step.questions.length} Qs | >= ${PASS_THRESHOLD}%)`;
  document.getElementById("exam-title").textContent = step.title;

  const body = document.getElementById("exam-body");
  body.innerHTML = "";

  step.questions.forEach((q, qIdx) => {
    const card = document.createElement("div");
    card.className = "question-card";
    card.id = `q-card-${qIdx}`;
    card.innerHTML = `
      <div class="q-header">
        <span>Q${qIdx + 1} / ${step.questions.length}</span>
        <span>${q.topic}</span>
      </div>
      <div class="q-text">${q.q}</div>
      <div class="q-options">
        ${q.opts.map((opt, oIdx) => `
          <label class="q-option">
            <input type="radio" name="q_${qIdx}" value="${oIdx}" />
            <span>${opt}</span>
          </label>
        `).join("")}
      </div>
    `;
    body.appendChild(card);
  });

  document.getElementById("exam-progress-text").textContent = `Answer all ${step.questions.length} questions.`;
  const btn = document.getElementById("btn-submit-exam");
  btn.textContent = "SUBMIT ANSWERS";
  btn.onclick = () => gradeExam(sector, step, idx);

  document.getElementById("exam-modal").classList.remove("hidden");
}

function gradeExam(sector, step, idx) {
  const answers = [];
  let missing = false;

  step.questions.forEach((_, qIdx) => {
    const sel = document.querySelector(`input[name="q_${qIdx}"]:checked`);
    const card = document.getElementById(`q-card-${qIdx}`);
    if (!sel) { card.classList.add("unanswered"); missing = true; }
    else { card.classList.remove("unanswered"); answers.push(Number(sel.value)); }
  });

  if (missing) {
    document.getElementById("exam-progress-text").textContent = "Complete all highlighted questions first.";
    return;
  }

  let correct = 0;
  const topicMap = {};
  const missed = [];

  step.questions.forEach((q, i) => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
    topicMap[q.topic].total++;
    if (answers[i] === q.ans) {
      correct++;
      topicMap[q.topic].correct++;
    } else {
      missed.push({ num: i + 1, topic: q.topic, q: q.q, yours: q.opts[answers[i]], right: q.opts[q.ans], exp: q.exp });
    }
  });

  const scorePct = Math.round((correct / step.questions.length) * 100);
  const passed = scorePct >= PASS_THRESHOLD;

  const breakdown = Object.entries(topicMap).map(([topic, d]) => ({
    topic, correct: d.correct, total: d.total, pct: Math.round((d.correct / d.total) * 100)
  }));
  const weak = breakdown.filter(t => t.pct < PASS_THRESHOLD);

  if (passed) {
    const prev = state.passedSteps[step.id];
    state.passedSteps[step.id] = {
      bestScore: prev ? Math.max(prev.bestScore, scorePct) : scorePct,
      attempts: prev ? prev.attempts + 1 : 1,
      lastPassedAt: new Date().toISOString()
    };
    delete state.weaknessHistory[step.id];
  } else {
    state.weaknessHistory[step.id] = weak;
  }

  saveState();
  renderAll();

  const body = document.getElementById("exam-body");
  body.innerHTML = `
    <div class="result-banner ${passed ? "result-pass" : "result-fail"}">
      <div class="result-score">${scorePct}% (${correct}/${step.questions.length})</div>
      <h3>${passed ? "PASSED — SAVED PERMANENTLY" : "FAILED — BELOW 90%"}</h3>
    </div>

    <div class="diagnostic-box">
      <div class="mono small c-cyan" style="margin-bottom:8px;">// TOPIC DIAGNOSTIC</div>
      ${breakdown.map(t => `
        <div class="diag-row">
          <span>${t.topic}</span>
          <span class="${t.pct < PASS_THRESHOLD ? "tag-weak" : "tag-ok"}">
            ${t.correct}/${t.total} (${t.pct}%) ${t.pct < PASS_THRESHOLD ? "— LACKING" : "— SOLID"}
          </span>
        </div>
      `).join("")}
    </div>

    ${missed.length ? `
      <div class="diagnostic-box">
        <div class="mono small c-red" style="margin-bottom:6px;">// MISSED QUESTIONS</div>
        ${missed.map(m => `
          <div class="missed-item">
            <div class="mono small c-amber">Q${m.num} // ${m.topic}</div>
            <div><strong>${m.q}</strong></div>
            <div class="small c-red">Yours: ${m.yours}</div>
            <div class="small accent">Correct: ${m.right}</div>
            <div class="small c-muted">${m.exp}</div>
          </div>
        `).join("")}
      </div>
    ` : ""}
  `;

  document.getElementById("exam-progress-text").textContent = passed ? "Next step unlocked." : "Review lacking topics & retry.";
  const btn = document.getElementById("btn-submit-exam");
  btn.textContent = passed ? "CLOSE" : "RETRY EXAM";
  btn.onclick = () => passed ? closeModals() : openExamModal(sector, step, idx);
}

// --- Controls & Modals ---
function closeModals() {
  document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
}

document.querySelectorAll(".close-modal").forEach(b => b.addEventListener("click", closeModals));
document.getElementById("btn-guide").addEventListener("click", () => document.getElementById("guide-modal").classList.remove("hidden"));
window.addEventListener("keydown", e => { if (e.key === "Escape") closeModals(); });

document.getElementById("btn-export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `cybergrid-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
});

document.getElementById("input-import").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      state = Object.assign(defaultState(), JSON.parse(r.result));
      saveState();
      applyTheme(state.theme || "matrix");
      renderAll();
    } catch { alert("Invalid JSON backup."); }
  };
  r.readAsText(file);
  e.target.value = "";
});

document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("Reset all saved progress?")) {
    state = defaultState();
    saveState();
    applyTheme("matrix");
    renderAll();
  }
});

function renderAll() {
  renderGlobalMetrics();
  renderTree();
  renderSectorWorkspace();
}

applyTheme(state.theme || "matrix");
renderAll();