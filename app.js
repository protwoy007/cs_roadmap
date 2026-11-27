const STORAGE_KEY = "cybergrid_personal_progress_v1";

let state = loadState();
let activeSectorId = SECTORS[0].id;
let activeStepCtx = null; // { sector, step, stepIdx }

function defaultState() {
  return {
    passedSteps: {},     // { [stepId]: { bestScore, attempts, lastPassedAt } }
    watchedVideos: {},   // { [videoId]: true }
    weaknessHistory: {}  // { [stepId]: [ { topic, pct } ] }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- Progress & Unlock Calculations ---
function isStepUnlocked(sector, stepIdx) {
  if (stepIdx === 0) return true;
  const prevStep = sector.steps[stepIdx - 1];
  return Boolean(state.passedSteps[prevStep.id]);
}

function getStepVideoStats(step) {
  const total = step.videos.length;
  const done = step.videos.filter(v => state.watchedVideos[v.id]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

function getSectorStats(sector) {
  const stepsTotal = sector.steps.length;
  const stepsPassed = sector.steps.filter(s => state.passedSteps[s.id]).length;
  const stepPct = stepsTotal ? Math.round((stepsPassed / stepsTotal) * 100) : 0;

  let vidsTotal = 0;
  let vidsDone = 0;
  sector.steps.forEach(s => {
    vidsTotal += s.videos.length;
    vidsDone += s.videos.filter(v => state.watchedVideos[v.id]).length;
  });
  const vidPct = vidsTotal ? Math.round((vidsDone / vidsTotal) * 100) : 0;

  return { stepsPassed, stepsTotal, stepPct, vidsDone, vidsTotal, vidPct };
}

function getGlobalStats() {
  let stepsTotal = 0, stepsPassed = 0, vidsTotal = 0, vidsDone = 0;
  SECTORS.forEach(sec => {
    const st = getSectorStats(sec);
    stepsTotal += st.stepsTotal;
    stepsPassed += st.stepsPassed;
    vidsTotal += st.vidsTotal;
    vidsDone += st.vidsDone;
  });
  return {
    stepsPassed,
    stepsTotal,
    stepPct: stepsTotal ? Math.round((stepsPassed / stepsTotal) * 100) : 0,
    vidPct: vidsTotal ? Math.round((vidsDone / vidsTotal) * 100) : 0
  };
}

// --- Render Top Metrics ---
function renderGlobalMetrics() {
  const g = getGlobalStats();
  document.getElementById("global-steps").textContent = `${g.stepsPassed} / ${g.stepsTotal} (${g.stepPct}%)`;
  document.getElementById("global-videos").textContent = `${g.vidPct}% Completed`;
}

// --- Render Interactive Dependency Tree ---
function renderTree() {
  const svg = document.getElementById("tree-svg");
  const nodesWrap = document.getElementById("tree-nodes");
  svg.innerHTML = "";
  nodesWrap.innerHTML = "";

  const byId = Object.fromEntries(SECTORS.map(s => [s.id, s]));

  // Draw connecting edges
  TREE_EDGES.forEach(([fromId, toId]) => {
    const a = byId[fromId];
    const b = byId[toId];
    if (!a || !b) return;

    const aDone = getSectorStats(a).stepPct === 100;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.pos.x * 10);
    line.setAttribute("y1", a.pos.y * 3.9);
    line.setAttribute("x2", b.pos.x * 10);
    line.setAttribute("y2", b.pos.y * 3.9);
    line.setAttribute("stroke", aDone ? "#00ff88" : "#243547");
    line.setAttribute("stroke-width", aDone ? "2.6" : "2");
    if (!aDone) line.setAttribute("stroke-dasharray", "6 5");
    svg.appendChild(line);
  });

  // Draw sector nodes
  SECTORS.forEach(sec => {
    const st = getSectorStats(sec);
    const statusDot = st.stepPct === 100 ? "dot-done" : (st.stepsPassed > 0 || st.vidsDone > 0) ? "dot-active" : "dot-idle";

    const btn = document.createElement("button");
    btn.className = `tree-node ${sec.id === activeSectorId ? "selected" : ""} ${st.stepPct === 100 ? "completed" : ""}`;
    btn.style.left = `${sec.pos.x}%`;
    btn.style.top = `${sec.pos.y}%`;
    btn.innerHTML = `
      <div class="node-top">
        <span class="node-code">${sec.code}</span>
        <i class="dot ${statusDot}"></i>
      </div>
      <div class="node-title">${sec.title}</div>
      <div class="node-stats">
        <span class="accent">Steps: ${st.stepsPassed}/${st.stepsTotal}</span>
        <span class="accent-cyan">Vid: ${st.vidPct}%</span>
      </div>
    `;
    btn.addEventListener("click", () => {
      activeSectorId = sec.id;
      renderAll();
      document.getElementById("sector-workspace").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nodesWrap.appendChild(btn);
  });
}

// --- Render Active Sector & Steps ---
function renderSectorWorkspace() {
  const sector = SECTORS.find(s => s.id === activeSectorId);
  const st = getSectorStats(sector);

  document.getElementById("sector-tag").textContent = `${sector.code} // ACTIVE SECTOR`;
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
    const vidStats = getStepVideoStats(step);

    const card = document.createElement("div");
    card.className = `step-card ${unlocked ? "unlocked" : "locked"} ${passInfo ? "passed" : ""}`;

    const pill = passInfo
      ? `<span class="status-pill pill-passed">PASSED ${passInfo.bestScore}%</span>`
      : unlocked
        ? `<span class="status-pill pill-open">UNLOCKED</span>`
        : `<span class="status-pill pill-locked">LOCKED</span>`;

    card.innerHTML = `
      <div>
        <div class="step-head">
          <span class="step-num">STEP ${String(idx + 1).padStart(2, "0")}</span>
          ${pill}
        </div>
        <h3>${step.title}</h3>
        <p class="step-snippet">${step.note.slice(0, 125)}...</p>
      </div>

      <div>
        <div class="step-meta">
          <span class="accent-cyan">Videos: ${vidStats.pct}% (${vidStats.done}/${vidStats.total})</span>
          <span class="muted">Exam: ${step.questions.length} Qs</span>
        </div>
        <div class="step-actions" style="margin-top: 12px;">
          ${unlocked
            ? `<button class="btn btn-outline btn-open-note">Notes & Videos</button>
               <button class="btn btn-primary btn-open-exam">${passInfo ? "Re-Examine" : "Take Exam"}</button>`
            : `<button class="btn" disabled>Pass Step ${idx} (>= 90%) to Unlock</button>`
          }
        </div>
      </div>
    `;

    if (unlocked) {
      card.querySelector(".btn-open-note").addEventListener("click", (e) => {
        e.stopPropagation();
        openStepModal(sector, step, idx);
      });
      card.querySelector(".btn-open-exam").addEventListener("click", (e) => {
        e.stopPropagation();
        openExamModal(sector, step, idx);
      });
      card.addEventListener("click", () => openStepModal(sector, step, idx));
    }

    grid.appendChild(card);
  });
}

// --- Step Detail & Video Modal ---
function openStepModal(sector, step, stepIdx) {
  activeStepCtx = { sector, step, stepIdx };

  document.getElementById("modal-step-badge").textContent = `${sector.code} // STEP ${String(stepIdx + 1).padStart(2, "0")}`;
  document.getElementById("modal-step-title").textContent = step.title;
  document.getElementById("modal-step-note").textContent = step.note;
  document.getElementById("modal-step-example").textContent = step.example;

  // Unique sub-topics
  const topics = [...new Set(step.questions.map(q => q.topic))];
  document.getElementById("modal-step-topics").innerHTML = topics
    .map(t => `<span class="chip">${t}</span>`)
    .join("");

  renderStepModalVideos(step);

  // Previous weakness alert if last attempt failed
  const weakBox = document.getElementById("modal-weakness-alert");
  const weakList = state.weaknessHistory[step.id];
  if (weakList && weakList.length > 0 && !state.passedSteps[step.id]) {
    weakBox.classList.remove("hidden");
    weakBox.innerHTML = `<strong>Last Attempt Weak Areas:</strong> ${weakList.map(w => `${w.topic} (${w.pct}%)`).join(" | ")}`;
  } else {
    weakBox.classList.add("hidden");
  }

  const passInfo = state.passedSteps[step.id];
  document.getElementById("modal-exam-meta").textContent =
    `${step.questions.length} Questions | Pass >= ${PASS_THRESHOLD}%` +
    (passInfo ? ` | Best: ${passInfo.bestScore}%` : "");

  const startBtn = document.getElementById("btn-start-exam");
  startBtn.textContent = passInfo ? "RE-EXAMINE STEP" : "START MASTERY EXAM";
  startBtn.onclick = () => {
    closeModals();
    openExamModal(sector, step, stepIdx);
  };

  document.getElementById("step-modal").classList.remove("hidden");
}

function renderStepModalVideos(step) {
  const stats = getStepVideoStats(step);
  document.getElementById("modal-video-pct").textContent = `${stats.pct}% Completed (${stats.done}/${stats.total})`;

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
          <label for="chk-${vid.id}" style="cursor:pointer; font-weight:600;">${vid.title}</label>
          <div class="video-creator">${vid.creator}</div>
        </div>
      </div>
      <a class="video-link" href="${vid.url}" target="_blank" rel="noopener noreferrer">Watch &nearr;</a>
    `;

    row.querySelector("input").addEventListener("change", (e) => {
      if (e.target.checked) {
        state.watchedVideos[vid.id] = true;
      } else {
        delete state.watchedVideos[vid.id];
      }
      saveState();
      renderStepModalVideos(step);
      renderAll();
    });

    list.appendChild(row);
  });
}

// --- Mastery Exam Engine ---
function openExamModal(sector, step, stepIdx) {
  activeStepCtx = { sector, step, stepIdx };

  document.getElementById("exam-badge").textContent = `${sector.code} // STEP ${stepIdx + 1} EXAM (${step.questions.length} Qs | PASS >= ${PASS_THRESHOLD}%)`;
  document.getElementById("exam-title").textContent = step.title;

  const body = document.getElementById("exam-body");
  body.innerHTML = "";

  step.questions.forEach((q, qIdx) => {
    const card = document.createElement("div");
    card.className = "question-card";
    card.id = `q-card-${qIdx}`;
    card.innerHTML = `
      <div class="q-header">
        <span>QUESTION ${qIdx + 1} / ${step.questions.length}</span>
        <span>TOPIC: ${q.topic}</span>
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

  document.getElementById("exam-progress-text").textContent = `Answer all ${step.questions.length} questions to grade.`;
  const submitBtn = document.getElementById("btn-submit-exam");
  submitBtn.classList.remove("hidden");
  submitBtn.textContent = "SUBMIT ANSWERS";
  submitBtn.onclick = () => gradeExam(sector, step, stepIdx);

  document.getElementById("exam-modal").classList.remove("hidden");
}

function gradeExam(sector, step, stepIdx) {
  const answers = [];
  let missing = false;

  step.questions.forEach((_, qIdx) => {
    const selected = document.querySelector(`input[name="q_${qIdx}"]:checked`);
    const card = document.getElementById(`q-card-${qIdx}`);
    if (!selected) {
      card.classList.add("unanswered");
      missing = true;
    } else {
      card.classList.remove("unanswered");
      answers.push(Number(selected.value));
    }
  });

  if (missing) {
    document.getElementById("exam-progress-text").textContent = "Please answer all highlighted questions before submitting.";
    return;
  }

  let correctCount = 0;
  const topicMap = {}; // { topic: { correct, total } }
  const missedQuestions = [];

  step.questions.forEach((q, idx) => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
    topicMap[q.topic].total += 1;

    if (answers[idx] === q.ans) {
      correctCount += 1;
      topicMap[q.topic].correct += 1;
    } else {
      missedQuestions.push({
        num: idx + 1,
        topic: q.topic,
        q: q.q,
        yourAns: q.opts[answers[idx]],
        correctAns: q.opts[q.ans],
        exp: q.exp
      });
    }
  });

  const scorePct = Math.round((correctCount / step.questions.length) * 100);
  const passed = scorePct >= PASS_THRESHOLD;

  const topicBreakdown = Object.entries(topicMap).map(([topic, d]) => ({
    topic,
    correct: d.correct,
    total: d.total,
    pct: Math.round((d.correct / d.total) * 100)
  }));

  const weakTopics = topicBreakdown.filter(t => t.pct < PASS_THRESHOLD);

  if (passed) {
    const prev = state.passedSteps[step.id];
    state.passedSteps[step.id] = {
      bestScore: prev ? Math.max(prev.bestScore, scorePct) : scorePct,
      attempts: prev ? prev.attempts + 1 : 1,
      lastPassedAt: new Date().toISOString()
    };
    delete state.weaknessHistory[step.id];
  } else {
    state.weaknessHistory[step.id] = weakTopics;
  }

  saveState();
  renderAll();
  showExamResults(sector, step, stepIdx, { scorePct, correctCount, passed, topicBreakdown, weakTopics, missedQuestions });
}

function showExamResults(sector, step, stepIdx, res) {
  const body = document.getElementById("exam-body");
  const nextExists = stepIdx + 1 < sector.steps.length;

  body.innerHTML = `
    <div class="result-banner ${res.passed ? "result-pass" : "result-fail"}">
      <div class="result-score">${res.scorePct}% (${res.correctCount}/${step.questions.length})</div>
      <h3>${res.passed ? "STEP MASTERED — PERMANENTLY SAVED" : "EXAM FAILED — BELOW 90% THRESHOLD"}</h3>
      <p class="small">${res.passed
        ? (nextExists ? `Step ${stepIdx + 2} is now unlocked!` : `You completed all steps in ${sector.title}!`)
        : "Review the weak sub-topics flagged below before retrying."
      }</p>
    </div>

    <div class="diagnostic-box">
      <h3 class="mono small" style="color:var(--cyan); margin-bottom:8px;">// DIAGNOSTIC TOPIC BREAKDOWN</h3>
      ${res.topicBreakdown.map(t => `
        <div class="diag-row">
          <span>${t.topic}</span>
          <span class="${t.pct < PASS_THRESHOLD ? "tag-weak" : "tag-ok"}">
            ${t.correct}/${t.total} (${t.pct}%) ${t.pct < PASS_THRESHOLD ? "— LACKING / REVIEW" : "— SOLID"}
          </span>
        </div>
      `).join("")}
    </div>

    ${res.missedQuestions.length > 0 ? `
      <div class="diagnostic-box">
        <h3 class="mono small" style="color:var(--red); margin-bottom:6px;">// MISSED QUESTIONS & EXPLANATIONS</h3>
        ${res.missedQuestions.map(m => `
          <div class="missed-item">
            <div class="mono small muted">Q${m.num} // ${m.topic}</div>
            <div><strong>${m.q}</strong></div>
            <div class="small" style="color:var(--red);">Your answer: ${m.yourAns}</div>
            <div class="small" style="color:var(--green);">Correct: ${m.correctAns}</div>
            <div class="small muted" style="margin-top:4px;">Why: ${m.exp}</div>
          </div>
        `).join("")}
      </div>
    ` : ""}
  `;

  document.getElementById("exam-progress-text").textContent = res.passed
    ? "Progress auto-saved to browser storage."
    : "Next step remains locked until you score >= 90%.";

  const btn = document.getElementById("btn-submit-exam");
  btn.textContent = res.passed ? "CLOSE & CONTINUE" : "RETRY EXAM";
  btn.onclick = () => {
    if (res.passed) {
      closeModals();
    } else {
      openExamModal(sector, step, stepIdx);
    }
  };
}

// --- Backup Export / Import / Reset ---
document.getElementById("btn-export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `cybergrid-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
});

document.getElementById("input-import").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state = Object.assign(defaultState(), parsed);
      saveState();
      renderAll();
      alert("Backup restored successfully.");
    } catch {
      alert("Invalid backup JSON file.");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

document.getElementById("btn-reset").addEventListener("click", () => {
  if (confirm("Wipe all saved exam passes and video progress? Export a backup first if unsure.")) {
    state = defaultState();
    saveState();
    renderAll();
  }
});

// --- Modal Controls ---
function closeModals() {
  document.getElementById("step-modal").classList.add("hidden");
  document.getElementById("exam-modal").classList.add("hidden");
}

document.getElementById("close-step-modal").addEventListener("click", closeModals);
document.getElementById("close-exam-modal").addEventListener("click", closeModals);
window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });

function renderAll() {
  renderGlobalMetrics();
  renderTree();
  renderSectorWorkspace();
}

renderAll();