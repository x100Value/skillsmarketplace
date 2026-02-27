const state = {
  token: localStorage.getItem("sessionToken") || "",
  activeTab: "home",
  me: null,
  history: { ledger: [], tasks: [], skillChecks: [] },
};

const el = {
  authBadge: document.getElementById("authBadge"),
  initDataInput: document.getElementById("initDataInput"),
  authBtn: document.getElementById("authBtn"),
  meBtn: document.getElementById("meBtn"),
  authState: document.getElementById("authState"),
  primaryActionBtn: document.getElementById("primaryActionBtn"),
  tryDemoBtn: document.getElementById("tryDemoBtn"),
  homeRefreshBtn: document.getElementById("homeRefreshBtn"),
  homeBalance: document.getElementById("homeBalance"),
  homeAvailable: document.getElementById("homeAvailable"),
  lastActivityList: document.getElementById("lastActivityList"),
  skillTitleInput: document.getElementById("skillTitleInput"),
  skillModeInput: document.getElementById("skillModeInput"),
  skillTextInput: document.getElementById("skillTextInput"),
  quoteBtn: document.getElementById("quoteBtn"),
  runBtn: document.getElementById("runBtn"),
  toolStatus: document.getElementById("toolStatus"),
  toolPrice: document.getElementById("toolPrice"),
  toolQuote: document.getElementById("toolQuote"),
  skillReport: document.getElementById("skillReport"),
  taskResult: document.getElementById("taskResult"),
  historyRefreshBtn: document.getElementById("historyRefreshBtn"),
  historyList: document.getElementById("historyList"),
  walletTotal: document.getElementById("walletTotal"),
  walletHeld: document.getElementById("walletHeld"),
  walletAvailable: document.getElementById("walletAvailable"),
  withdrawInput: document.getElementById("withdrawInput"),
  withdrawBtn: document.getElementById("withdrawBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  log: document.getElementById("log"),
  tabButtons: Array.from(document.querySelectorAll(".tab-btn")),
  tabPanels: Array.from(document.querySelectorAll(".tab-panel")),
  topupBtns: Array.from(document.querySelectorAll(".topup-btn")),
};

function appendLog(msg, payload) {
  const line = payload ? `${msg}\n${JSON.stringify(payload, null, 2)}` : msg;
  el.log.textContent = `${new Date().toISOString()} ${line}\n\n${el.log.textContent}`;
}

function setAuthState(text) {
  el.authState.textContent = text;
}

function setAuthBadge(text, cls) {
  el.authBadge.textContent = text;
  el.authBadge.className = `status-chip ${cls}`;
}

function setTab(name) {
  state.activeTab = name;
  for (const panel of el.tabPanels) {
    panel.classList.toggle("active", panel.id === `tab-${name}`);
  }
  for (const btn of el.tabButtons) {
    btn.classList.toggle("active", btn.dataset.tab === name);
  }
}

function setToolStatus(status) {
  el.toolStatus.textContent = status;
  const cls =
    status === "done"
      ? "chip-done"
      : status === "failed"
      ? "chip-failed"
      : status === "running" || status === "queued"
      ? "chip-running"
      : "chip-muted";
  el.toolStatus.className = `status-chip ${cls}`;
}

async function api(path, options = {}) {
  const headers = {
    "content-type": "application/json",
    "x-client-surface": "telegram",
    ...(options.headers || {}),
  };
  if (state.token) {
    headers.authorization = `Bearer ${state.token}`;
  }

  const res = await fetch(path, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json;
}

function renderActivityList(target, items) {
  target.innerHTML = "";
  if (!items.length) {
    const li = document.createElement("li");
    li.className = "activity-item";
    li.innerHTML = `<p class="title">No activity yet</p><p class="meta">Actions and transactions will appear here.</p>`;
    target.appendChild(li);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.className = "activity-item";
    li.innerHTML = `<p class="title">${item.title}</p><p class="meta">${item.meta}</p>`;
    target.appendChild(li);
  }
}

function buildActivityView() {
  const rows = [];

  for (const entry of state.history.ledger.slice(0, 50)) {
    rows.push({
      ts: new Date(entry.createdAt).getTime(),
      title: `${entry.type} · ${entry.amountStars} stars`,
      meta: `${entry.refType}:${entry.refId} · ${new Date(entry.createdAt).toLocaleString()}`,
    });
  }

  for (const task of state.history.tasks.slice(0, 50)) {
    rows.push({
      ts: new Date(task.createdAt).getTime(),
      title: `task ${task.status} · ${task.actualStars} stars`,
      meta: `${task.id.slice(0, 8)} · ${new Date(task.createdAt).toLocaleString()}`,
    });
  }

  for (const check of state.history.skillChecks.slice(0, 50)) {
    rows.push({
      ts: new Date(check.createdAt).getTime(),
      title: `skill check ${check.status} · score ${check.uniquenessScore ?? "-"} · ${check.actualStars} stars`,
      meta: `${check.riskLevel ?? "unknown"} risk · ${new Date(check.createdAt).toLocaleString()}`,
    });
  }

  rows.sort((a, b) => b.ts - a.ts);
  return rows;
}

function renderBalances() {
  const balance = state.me?.balance ?? { total: 0, held: 0, available: 0 };
  el.homeBalance.textContent = String(balance.total);
  el.homeAvailable.textContent = String(balance.available);
  el.walletTotal.textContent = String(balance.total);
  el.walletHeld.textContent = String(balance.held);
  el.walletAvailable.textContent = String(balance.available);
}

function renderHistory() {
  const rows = buildActivityView();
  renderActivityList(el.lastActivityList, rows.slice(0, 5));
  renderActivityList(el.historyList, rows.slice(0, 50));
}

async function refreshMe() {
  if (!state.token) {
    throw new Error("No session token");
  }
  const [me, history] = await Promise.all([
    api("/api/me"),
    api("/api/history?limit=50"),
  ]);
  state.me = me;
  state.history = history;
  renderBalances();
  renderHistory();
  setAuthState(`Authorized: id=${me.user.id}, @${me.user.username || "unknown"}`);
  setAuthBadge("Connected", "chip-done");
}

async function auth() {
  const tgInitData = window.Telegram?.WebApp?.initData || "";
  const initData = (el.initDataInput.value || tgInitData).trim();
  if (!initData) {
    appendLog("initData is empty");
    return;
  }
  const data = await api("/api/auth/telegram", {
    method: "POST",
    body: JSON.stringify({ initData }),
  });
  state.token = data.token;
  localStorage.setItem("sessionToken", state.token);
  await refreshMe();
  appendLog("auth ok", data.user);
}

function buildSkillPayload() {
  return {
    title: el.skillTitleInput.value.trim() || undefined,
    mode: el.skillModeInput.value,
    skillText: el.skillTextInput.value.trim(),
  };
}

async function quoteSkillCheck() {
  const payload = buildSkillPayload();
  const data = await api("/api/skill-check/quote", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  el.toolQuote.textContent = JSON.stringify(data.quote, null, 2);
  el.toolPrice.textContent = `${data.quote.estimatedTotalCredits} credits`;
  return data;
}

async function runSkillCheck() {
  const payload = buildSkillPayload();
  if (payload.skillText.length < 80) {
    appendLog("skillText must be at least 80 chars");
    return;
  }

  setToolStatus("queued");
  try {
    await quoteSkillCheck();
    setToolStatus("running");
    const data = await api("/api/skill-check/run", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setToolStatus("done");
    el.skillReport.textContent = JSON.stringify(data.report, null, 2);
    el.taskResult.textContent = JSON.stringify(
      {
        pricing: data.pricing,
        providerUsed: data.providerUsed,
        queries: data.queries,
        sources: data.sources.slice(0, 8),
      },
      null,
      2
    );
    appendLog("skill check done", {
      checkId: data.checkId,
      uniquenessScore: data.report?.uniquenessScore,
      riskLevel: data.report?.riskLevel,
    });
    await refreshMe();
  } catch (error) {
    setToolStatus("failed");
    throw error;
  }
}

async function requestWithdrawal() {
  const amountStars = Number(el.withdrawInput.value);
  const data = await api("/api/withdrawals/request", {
    method: "POST",
    body: JSON.stringify({ amountStars }),
  });
  appendLog("withdrawal requested", data);
  await refreshMe();
}

function runDemo() {
  setTab("tool");
  setToolStatus("done");
  el.toolPrice.textContent = "15 credits";
  el.skillReport.textContent = JSON.stringify(
    {
      summary:
        "Medium uniqueness risk. There are conceptually similar public prompts, but your structure is partially unique.",
      uniquenessScore: 58,
      riskLevel: "medium",
      topSignals: [
        "Top match similarity: 46.2%",
        "Average top-5 similarity: 31.0%",
        "Checked sources: 14",
      ],
      recommendations: [
        "Add proprietary scoring rubric and edge-case rules.",
        "Inject domain-specific examples from your own dataset.",
      ],
    },
    null,
    2
  );
}

function logout() {
  state.token = "";
  state.me = null;
  state.history = { ledger: [], tasks: [], skillChecks: [] };
  localStorage.removeItem("sessionToken");
  setAuthBadge("Guest", "chip-muted");
  setAuthState("Not authorized");
  renderBalances();
  renderHistory();
  setToolStatus("idle");
  el.toolPrice.textContent = "not calculated";
  appendLog("logged out");
}

for (const btn of el.tabButtons) {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    if (tab) {
      setTab(tab);
    }
  });
}

for (const btn of el.topupBtns) {
  btn.addEventListener("click", () => {
    const pack = btn.dataset.package;
    appendLog(`stars package selected: ${pack}`);
    setTab("wallet");
  });
}

el.authBtn.addEventListener("click", () =>
  auth().catch((e) => appendLog(`auth error: ${e.message}`))
);
el.meBtn.addEventListener("click", () =>
  refreshMe().catch((e) => appendLog(`refresh error: ${e.message}`))
);
el.homeRefreshBtn.addEventListener("click", () =>
  refreshMe().catch((e) => appendLog(`refresh error: ${e.message}`))
);
el.primaryActionBtn.addEventListener("click", () => setTab("tool"));
el.tryDemoBtn.addEventListener("click", runDemo);
el.quoteBtn.addEventListener("click", () =>
  quoteSkillCheck().catch((e) => appendLog(`quote error: ${e.message}`))
);
el.runBtn.addEventListener("click", () =>
  runSkillCheck().catch((e) => appendLog(`skill check error: ${e.message}`))
);
el.historyRefreshBtn.addEventListener("click", () =>
  refreshMe().catch((e) => appendLog(`history refresh error: ${e.message}`))
);
el.withdrawBtn.addEventListener("click", () =>
  requestWithdrawal().catch((e) => appendLog(`withdraw error: ${e.message}`))
);
el.logoutBtn.addEventListener("click", logout);

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}

if (state.token) {
  refreshMe().catch(() => logout());
} else {
  renderBalances();
  renderHistory();
}
