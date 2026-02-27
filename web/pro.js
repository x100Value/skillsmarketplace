const state = {
  token: localStorage.getItem("proSessionToken") || "",
};

const el = {
  tokenInput: document.getElementById("tokenInput"),
  saveTokenBtn: document.getElementById("saveTokenBtn"),
  usdtInput: document.getElementById("usdtInput"),
  quoteBtn: document.getElementById("quoteBtn"),
  intentBtn: document.getElementById("intentBtn"),
  result: document.getElementById("result"),
  log: document.getElementById("log"),
};

function appendLog(msg, payload) {
  const line = payload ? `${msg}\n${JSON.stringify(payload, null, 2)}` : msg;
  el.log.textContent = `${new Date().toISOString()} ${line}\n\n${el.log.textContent}`;
}

async function api(path, options = {}) {
  const headers = {
    "content-type": "application/json",
    "x-client-surface": "web",
    ...(options.headers || {}),
  };
  if (state.token) {
    headers.authorization = `Bearer ${state.token}`;
  }
  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
}

async function quote() {
  const amountUsdt = Number(el.usdtInput.value);
  const data = await api("/api/pricing/quote", {
    method: "POST",
    body: JSON.stringify({ rail: "ton_usdt", amountUsdt }),
  });
  el.result.textContent = JSON.stringify(data, null, 2);
  appendLog("quote ok", data);
}

async function createIntent() {
  const amountUsdt = Number(el.usdtInput.value);
  const data = await api("/api/payments/ton-usdt/create-intent", {
    method: "POST",
    body: JSON.stringify({ amountUsdt }),
  });
  el.result.textContent = JSON.stringify(data, null, 2);
  appendLog("intent created", data);
}

el.saveTokenBtn.addEventListener("click", () => {
  state.token = el.tokenInput.value.trim();
  localStorage.setItem("proSessionToken", state.token);
  appendLog("token saved");
});

el.quoteBtn.addEventListener("click", () =>
  quote().catch((e) => appendLog(`quote error: ${e.message}`))
);

el.intentBtn.addEventListener("click", () =>
  createIntent().catch((e) => appendLog(`intent error: ${e.message}`))
);

if (state.token) {
  el.tokenInput.value = state.token;
}
