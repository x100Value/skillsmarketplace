'use strict';

// ── Stardust currency ─────────────────────────────────────────────────────────
const STARDUST_RATE = 10;        // 1 ⭐ Star = 10 ✨ Stardust
const SD = '✨';                  // Stardust symbol
const STAR = '⭐';                // Star symbol

function toStardust(stars) { return stars * STARDUST_RATE; }
function toStars(stardust)  { return Math.ceil(stardust / STARDUST_RATE); }
function fmtSD(stars)       { return toStardust(stars).toLocaleString() + ' ' + SD; }

// ── i18n ──────────────────────────────────────────────────────────────────────
const LANGS = {
  en: {
    authTitle:'SkillsMarketplace', authSub:'Marketplace for AI Agent Skills',
    authBtn:'Sign in with Telegram', authError:'Please open in Telegram',
    tabMarket:'Market', tabStudio:'Studio', tabAccount:'Account',
    searchPlaceholder:'Search skills...', featuredTitle:'Featured', newTitle:'New',
    catAll:'All', catAgents:'Agents', catAuto:'Automation',
    catData:'Analytics', catWrite:'Writing', catSales:'Sales',
    yourBalance:'Your Balance', heldLabel:'Held', availableLabel:'Available',
    balanceSub:'Balance in Stardust',
    walletTitle:'Wallet', walletSub:'Top up and withdrawals',
    adminTopupTitle:'Admin Test Balance', adminTopupSub:'Quickly add Stars for test purchases',
    libraryTitle:'My Library', librarySub:'Purchased and free claimed skills',
    topUpTitle:'Top Up', topUpSub:'Buy Stardust via Telegram Stars',
    checkTitle:'Skill Uniqueness Check', checkSub:'Verify before publishing',
    openBtn:'Open', closeBtn:'Close',
    skillTitleLabel:'Skill title', skillTitlePlaceholder:'Telegram Lead Qualification Agent',
    providerModeLabel:'Search mode', modeHybrid:'Hybrid', modePaid:'Paid only', modeFree:'Free only',
    checkModeHint:'MVP mode: Hybrid (safe default)',
    skillTextLabel:'Skill / Prompt text',
    skillTextPlaceholder:'Paste your full skill or prompt text here (min 80 chars)',
    getQuoteBtn:'Get Quote', runCheckBtn:'Run Check',
    publishSkillBtn:'Publish Skill',
    uniquenessScore:'Uniqueness score', showRaw:'Show details', hideRaw:'Hide details',
    withdrawTitle:'Withdrawal', withdrawLabel:'Amount (Stardust)', withdrawBtn:'Create Request',
    withdrawHoldHint:'Funds are held for 22 days before payout decision.',
    refTitle:'Referral Program', refSub:'Earn from your network',
    level1:'Level 1', level2:'Level 2', level3:'Level 3',
    copyBtn:'Copy', totalEarned:'Total earned:',
    languageTitle:'Language', historyTitle:'History', refreshBtn:'Refresh',
    legalTitle:'Legal', openLegal:'Legal Center',
    publicOffer:'Public Offer', privacyPolicy:'Privacy Policy', refundRules:'Refund Policy',
    logoutBtn:'Log out',
    toastCopied:'Link copied!', toastError:'Error, please try again',
    toastTopupPending:'Opening payment...', toastWithdrawOk:'Withdrawal request created. Hold: 22 days.',
    toastWithdrawMin:'Minimum withdrawal: 10 Stardust (1 Star)',
    toastWithdrawDisabled:'Withdrawals are temporarily disabled in MVP',
    toastTopupAdminOk:'Admin test balance credited',
    toastOwned:'Already in your library',
    toastBuyDone:'Skill purchased',
    toastSkillPublished:'Skill published to Market (demo)',
    toastNoBalance:'Insufficient balance', toastRunning:'Running check...',
    toastSignIn:'Sign in to use this feature',
    riskLow:'Low risk', riskMed:'Medium risk', riskHigh:'High risk',
    free:'FREE', emptyHistory:'No history yet',
    emptyLibrary:'Library is empty',
    openSkillBtn:'Open',
    skillContentTitle:'Skill content',
    skillContentMissing:'No content yet',
    copyContentBtn:'Copy Content',
    signInPrompt:'Sign in with Telegram to continue',
    signInBtn:'Sign In',
    buyBtn:'Buy', getBtn:'Get Free',
    modalRating:'Rating', modalReviews:'Reviews', modalClose:'Cancel',
    comingSoon:'Purchase feature coming soon',
    skillAdded:'Skill added to your library!',
  },
  ru: {
    authTitle:'SkillsMarketplace', authSub:'Маркетплейс скилов для AI-агентов',
    authBtn:'Войти через Telegram', authError:'Откройте в Telegram',
    tabMarket:'Маркет', tabStudio:'Студия', tabAccount:'Аккаунт',
    searchPlaceholder:'Поиск скилов...', featuredTitle:'Рекомендуем', newTitle:'Новые',
    catAll:'Все', catAgents:'Агенты', catAuto:'Автоматизация',
    catData:'Аналитика', catWrite:'Тексты', catSales:'Продажи',
    yourBalance:'Баланс', heldLabel:'Удержано', availableLabel:'Доступно',
    balanceSub:'Баланс в Звёздной Пыли',
    walletTitle:'Кошелёк', walletSub:'Пополнение и вывод',
    adminTopupTitle:'Тестовый баланс админа', adminTopupSub:'Быстрое пополнение Stars для тестовых покупок',
    libraryTitle:'Моя библиотека', librarySub:'Купленные и бесплатно полученные скиллы',
    topUpTitle:'Пополнить', topUpSub:'Купить Звёздную Пыль за Telegram Stars',
    checkTitle:'Проверка уникальности', checkSub:'Проверьте перед публикацией',
    openBtn:'Открыть', closeBtn:'Закрыть',
    skillTitleLabel:'Название скила', skillTitlePlaceholder:'Агент квалификации лидов',
    providerModeLabel:'Режим поиска', modeHybrid:'Гибридный', modePaid:'Только платный', modeFree:'Только бесплатный',
    checkModeHint:'Режим MVP: гибридный (безопасный по умолчанию)',
    skillTextLabel:'Скил / промт',
    skillTextPlaceholder:'Вставьте полный текст скила или промта (мин 80 символов)',
    getQuoteBtn:'Узнать стоимость', runCheckBtn:'Запустить проверку',
    publishSkillBtn:'Опубликовать скил',
    uniquenessScore:'Оценка уникальности', showRaw:'Показать детали', hideRaw:'Скрыть детали',
    withdrawTitle:'Вывод', withdrawLabel:'Сумма (Звёздная Пыль)', withdrawBtn:'Создать запрос',
    withdrawHoldHint:'Средства удерживаются 22 дня перед решением по выплате.',
    refTitle:'Реферальная программа', refSub:'Зарабатывайте на своей сети',
    level1:'Уровень 1', level2:'Уровень 2', level3:'Уровень 3',
    copyBtn:'Копировать', totalEarned:'Итого заработано:',
    languageTitle:'Язык', historyTitle:'История', refreshBtn:'Обновить',
    legalTitle:'Правовые документы', openLegal:'Правовой центр',
    publicOffer:'Публичная оферта', privacyPolicy:'Политика конфиденциальности', refundRules:'Условия возврата',
    logoutBtn:'Выйти',
    toastCopied:'Ссылка скопирована!', toastError:'Ошибка, попробуйте снова',
    toastTopupPending:'Открываем оплату...', toastWithdrawOk:'Запрос на вывод создан. Холд: 22 дня.',
    toastWithdrawMin:'Минимальный вывод: 10 Звёздной Пыли (1 Star)',
    toastWithdrawDisabled:'Вывод временно отключён в MVP',
    toastTopupAdminOk:'Тестовый админ-баланс пополнен',
    toastOwned:'Уже в вашей библиотеке',
    toastBuyDone:'Скил куплен',
    toastSkillPublished:'Скил опубликован в Маркете (demo)',
    toastNoBalance:'Недостаточно средств', toastRunning:'Запускаем проверку...',
    toastSignIn:'Войдите для доступа к этой функции',
    riskLow:'Низкий риск', riskMed:'Средний риск', riskHigh:'Высокий риск',
    free:'БЕСПЛАТНО', emptyHistory:'История пуста',
    emptyLibrary:'Библиотека пуста',
    openSkillBtn:'Открыть',
    skillContentTitle:'Контент скила',
    skillContentMissing:'Контент пока не добавлен',
    copyContentBtn:'Копировать контент',
    signInPrompt:'Войдите через Telegram для доступа',
    signInBtn:'Войти',
    buyBtn:'Купить', getBtn:'Получить бесплатно',
    modalRating:'Рейтинг', modalReviews:'Отзывы', modalClose:'Отмена',
    comingSoon:'Функция покупки скоро будет доступна',
    skillAdded:'Скил добавлен в вашу библиотеку!',
  }
};

let lang = 'en';
function t(k) { return LANGS[lang]?.[k] ?? LANGS.en[k] ?? k; }

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n; if (k) el.textContent = t(k);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const k = el.dataset.i18nPlaceholder; if (k) el.placeholder = t(k);
  });
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === lang)
  );
  updateLegalLinks();
}

function detectLang() {
  const stored = localStorage.getItem('sm_lang');
  if (stored === 'ru' || stored === 'en') { lang = stored; return; }
  const tgLang = tg?.initDataUnsafe?.user?.language_code ?? '';
  if (tgLang.startsWith('ru')) { lang = 'ru'; return; }
  if ((navigator.language ?? '').startsWith('ru')) { lang = 'ru'; return; }
  lang = 'en';
}

function setLang(l) {
  lang = l; localStorage.setItem('sm_lang', l); applyLang();
}

function updateLegalLinks() {
  const suffix = lang === 'ru' ? 'RU' : 'EN';
  const links = {
    openLegal:    '/legal',
    publicOffer:  `/doc?f=LEGAL_OFFER_${suffix}.md`,
    privacyPolicy:`/doc?f=PRIVACY_POLICY_${suffix}.md`,
    refundRules:  `/doc?f=REFUND_POLICY_${suffix}.md`,
  };
  Object.entries(links).forEach(([key, href]) => {
    const el = document.querySelector(`[data-legal="${key}"]`);
    if (el) { el.href = href; el.textContent = t(key); }
  });
}

// ── Telegram WebApp ───────────────────────────────────────────────────────────
const tg = window.Telegram?.WebApp;

// ── State ─────────────────────────────────────────────────────────────────────
let token = localStorage.getItem('sm_token');
let currentFilter = 'all';
let authInProgress = false;
let currentUser = null;
let currentFeatures = { withdrawalsEnabled: true };
let lastCheckContext = null;
const PURCHASED_SKILLS_KEY = 'sm_purchased_skills';
const PUBLISHED_SKILLS_KEY = 'sm_published_skills';

function getPurchasedSkillIds() {
  try {
    const raw = localStorage.getItem(PURCHASED_SKILLS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map(Number).filter(Number.isFinite));
  } catch {
    return new Set();
  }
}

function savePurchasedSkillIds(set) {
  localStorage.setItem(PURCHASED_SKILLS_KEY, JSON.stringify(Array.from(set)));
}

function hasSkill(skillId) {
  return getPurchasedSkillIds().has(Number(skillId));
}

function markSkillOwned(skillId) {
  const set = getPurchasedSkillIds();
  set.add(Number(skillId));
  savePurchasedSkillIds(set);
}

function getPublishedSkills() {
  try {
    const raw = localStorage.getItem(PUBLISHED_SKILLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePublishedSkills(skills) {
  localStorage.setItem(PUBLISHED_SKILLS_KEY, JSON.stringify(skills));
}

function getAllSkills() {
  return [...DEMO_SKILLS, ...getPublishedSkills()];
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toggleWithdrawalCard(isVisible) {
  const card = document.getElementById('withdrawCard');
  if (card) card.style.display = isVisible ? '' : 'none';
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg, ms = 2500) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}

// ── API ───────────────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const opts = { method, headers: { 'content-type': 'application/json' } };
  if (token) opts.headers['authorization'] = 'Bearer ' + token;
  if (body !== undefined) opts.body = JSON.stringify(body);
  try {
    const r = await fetch(path, opts);
    if (r.status === 401) { token = null; localStorage.removeItem('sm_token'); return null; }
    return await r.json();
  } catch { return null; }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function silentAuth(referralCode) {
  if (authInProgress || token) return !!token;
  const initData = tg?.initData;
  if (!initData) return false;
  authInProgress = true;
  try {
    const body = { initData };
    if (referralCode) body.referralCode = referralCode;
    const r = await fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) { console.warn('Auth failed:', r.status, await r.text()); return false; }
    const data = await r.json();
    if (data.token) {
      token = data.token;
      localStorage.setItem('sm_token', token);
      return true;
    }
    console.warn('Auth no token:', data);
    return false;
  } catch(e) { console.error('Auth error:', e); return false; }
  finally { authInProgress = false; }
}

async function requireAuth() {
  if (token) return true;
  const ok = await silentAuth(null);
  if (!ok) showToast(t('toastSignIn'));
  return ok;
}

function logout() {
  token = null; localStorage.removeItem('sm_token');
  showToast(lang === 'ru' ? 'Вы вышли из аккаунта' : 'Signed out');
  document.getElementById('studioSignIn')?.remove();
  document.getElementById('accountSignIn')?.remove();
}

// ── Navigation ────────────────────────────────────────────────────────────────
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name)?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.screen === name)
  );
  if (name === 'studio')  onStudioOpen();
  if (name === 'account') onAccountOpen();
}

// ── Studio ────────────────────────────────────────────────────────────────────
async function onStudioOpen() {
  if (!token) {
    const ok = await silentAuth(null);
    if (!ok) { showSignInCard('studio'); return; }
  }
  document.getElementById('studioSignIn')?.remove();
  loadBalance();
}

// ── Account ───────────────────────────────────────────────────────────────────
async function onAccountOpen() {
  if (!token) {
    const ok = await silentAuth(null);
    if (!ok) { showSignInCard('account'); return; }
  }
  document.getElementById('accountSignIn')?.remove();
  loadProfile(); loadReferral(); loadHistory(); loadBalance(); renderLibrary();
}

function showSignInCard(screen) {
  const id = screen + 'SignIn';
  if (document.getElementById(id)) return;
  const el = document.getElementById('screen-' + screen);
  const div = document.createElement('div');
  div.id = id; div.className = 'card';
  div.style.cssText = 'text-align:center;padding:32px 20px';
  div.innerHTML = `
    <div style="font-size:44px;margin-bottom:12px">🔐</div>
    <div style="font-size:16px;font-weight:700;margin-bottom:6px">${t('signInPrompt')}</div>
    <button class="btn btn-primary sign-in-card-btn" style="margin-top:16px;width:100%;max-width:220px">${t('signInBtn')}</button>`;
  el.insertBefore(div, el.firstChild);
  div.querySelector('.sign-in-card-btn')?.addEventListener('click', () => manualAuth(screen));
}

async function manualAuth(screen) {
  if (!tg?.initData) { showToast(t('authError')); return; }
  const ok = await silentAuth(null);
  if (ok) {
    document.getElementById(screen + 'SignIn')?.remove();
    if (screen === 'studio')  { loadBalance(); }
    if (screen === 'account') { loadProfile(); loadReferral(); loadHistory(); loadBalance(); renderLibrary(); }
  } else {
    showToast(t('toastError'));
  }
}

// ── Skill cards ───────────────────────────────────────────────────────────────
// Prices are in Stardust directly
const DEMO_SKILLS = [
  { id:1,  icon:'🤖', title:'Telegram Lead Qualifier',  desc:'Qualifies leads from Telegram groups using NLP',      cat:'agent', price:2500, featured:true,  content:'System prompt + lead scoring flow for Telegram inbound leads.' },
  { id:2,  icon:'✍️', title:'SEO Content Rewriter',     desc:'95%+ unique rewrites preserving full meaning',         cat:'write', price:1800, featured:true,  content:'Prompt template for rewrite modes: factual, engaging, concise.' },
  { id:3,  icon:'💰', title:'Sales Funnel Automation',  desc:'Full CRM pipeline with AI qualification & follow-ups', cat:'sales', price:5000, featured:true,  content:'Pipeline map + message scripts + qualification logic.' },
  { id:4,  icon:'📊', title:'Data Analytics Agent',     desc:'Insights & auto-charts from CSV/Excel data',           cat:'data',  price:3200, featured:true,  content:'Analysis prompt + chart generation checklist.' },
  { id:5,  icon:'📅', title:'Social Media Scheduler',   desc:'AI content calendar, auto-posts to 5 platforms',       cat:'auto',  price:1500, featured:false, content:'Calendar generation template + posting rules.' },
  { id:6,  icon:'💬', title:'Customer Support Bot',     desc:'FAQ, escalations and ticket creation on autopilot',    cat:'agent', price:4000, featured:false, content:'Support routing prompt + escalation conditions.' },
  { id:7,  icon:'🧾', title:'Invoice Parser',            desc:'Extracts PDF invoice fields with 99% accuracy',        cat:'data',  price:0,    featured:false, content:'Demo parsing schema for invoice fields and totals.' },
  { id:8,  icon:'📧', title:'Cold Email Writer',         desc:'Personalized outreach sequences with A/B variants',    cat:'sales', price:1200, featured:false, content:'Cold outreach prompt with personalization slots.' },
  { id:9,  icon:'📰', title:'News Aggregator Agent',    desc:'Monitors 50+ sources, filters & sends digest',         cat:'auto',  price:800,  featured:false, content:'Digest prompt and ranking rules for source prioritization.' },
  { id:10, icon:'📝', title:'Blog Post Generator',      desc:'Long-form SEO posts with meta tags & image prompts',   cat:'write', price:2000, featured:false, content:'Article generation template with SEO sections.' },
];

function renderSkillCard(s) {
  const priceLabel = s.price === 0 ? t('free') : s.price.toLocaleString() + ' ' + SD;
  const priceColor = s.price === 0 ? 'var(--success)' : 'var(--accent)';
  return `<div class="skill-card" data-skill-id="${s.id}" style="cursor:pointer">
    <div class="skill-icon">${s.icon}</div>
    <div class="skill-name">${s.title}</div>
    <div class="skill-author">${s.desc}</div>
    <div class="skill-footer">
      <span class="skill-price" style="color:${priceColor}">${priceLabel}</span>
    </div>
  </div>`;
}

function renderSkills() {
  const query = (document.getElementById('searchInput')?.value ?? '').toLowerCase();
  let skills = getAllSkills();
  if (currentFilter !== 'all') skills = skills.filter(s => s.cat === currentFilter);
  if (query) skills = skills.filter(s =>
    s.title.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query)
  );
  const featured = skills.filter(s => s.featured);
  const fresh    = skills.filter(s => !s.featured);
  const empty = '<div style="color:var(--hint);padding:16px;text-align:center">—</div>';
  document.getElementById('skillsGrid').innerHTML    = featured.length ? featured.map(renderSkillCard).join('') : empty;
  document.getElementById('skillsGridNew').innerHTML = fresh.length    ? fresh.map(renderSkillCard).join('')    : empty;
}

// ── Skill detail modal ────────────────────────────────────────────────────────
function showSkillDetail(skillId) {
  const s = getAllSkills().find(x => x.id === skillId);
  if (!s) return;
  const isFree = s.price === 0;
  const priceStars = isFree ? 0 : toStars(s.price);
  const alreadyOwned = hasSkill(s.id);

  const existing = document.getElementById('skillModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'skillModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-body">
        <div class="modal-skill-icon">${s.icon}</div>
        <div class="modal-skill-title">${s.title}</div>
        <div class="modal-skill-desc">${s.desc}</div>
        <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;text-align:center;margin-bottom:16px">
          ${isFree
            ? `<div style="font-size:22px;font-weight:800;color:var(--success)">${t('free')}</div>`
            : `<div style="font-size:13px;color:var(--hint);margin-bottom:4px">Price</div>
               <div style="font-size:24px;font-weight:800;color:var(--accent)">${s.price.toLocaleString()} ${SD}</div>
                <div style="font-size:12px;color:var(--hint);margin-top:2px">${STAR} ${priceStars} Stars</div>`
          }
        </div>
        ${alreadyOwned
          ? `<div style="background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;margin-bottom:10px;text-align:left">
               <div style="font-size:12px;color:var(--hint);margin-bottom:6px">${t('skillContentTitle')}</div>
               <pre class="code-block" style="margin-top:0">${escapeHtml(s.content ?? t('skillContentMissing'))}</pre>
             </div>`
          : ''
        }
        <button class="btn ${isFree ? 'btn-success' : 'btn-primary'} btn-full" id="modalPrimaryAction">
          ${alreadyOwned ? t('copyContentBtn') : (isFree ? t('getBtn') : `${SD} ${t('buyBtn')} — ${s.price.toLocaleString()} ✨`)}
        </button>
        <button class="btn btn-secondary btn-full" style="margin-top:8px" id="modalCloseBtn">${t('modalClose')}</button>
      </div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.body.appendChild(modal);
  const primaryBtn = modal.querySelector('#modalPrimaryAction');
  const closeBtn = modal.querySelector('#modalCloseBtn');
  closeBtn?.addEventListener('click', closeModal);
  if (alreadyOwned) {
    if (primaryBtn) primaryBtn.className = 'btn btn-secondary btn-full';
    primaryBtn?.addEventListener('click', async () => {
      const value = s.content ?? t('skillContentMissing');
      const ok = await navigator.clipboard?.writeText?.(value).then(() => true).catch(() => false);
      if (!ok) {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast(t('toastCopied'));
    });
  } else if (isFree) {
    primaryBtn?.addEventListener('click', () => getSkill(s.id));
  } else {
    primaryBtn?.addEventListener('click', () => buySkill(s.id));
  }
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeModal() {
  const m = document.getElementById('skillModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(() => m.remove(), 280);
}

async function buySkill(id) {
  if (!await requireAuth()) return;
  if (hasSkill(id)) {
    showToast(t('toastOwned'));
    closeModal();
    return;
  }
  const skill = getAllSkills().find((s) => s.id === Number(id));
  if (!skill || skill.price <= 0) {
    showToast(t('toastError'));
    return;
  }

  const amountStars = toStars(skill.price);
  const data = await api('POST', '/api/me/dev/purchase', { skillId: String(skill.id), amountStars });
  if (!data || data.error) {
    showToast(data?.error === 'Insufficient available balance' ? t('toastNoBalance') : (data?.error || t('toastError')));
    return;
  }

  markSkillOwned(skill.id);
  showToast(t('toastBuyDone'));
  closeModal();
  loadBalance();
  loadHistory();
  renderLibrary();
}

async function getSkill(id) {
  if (!await requireAuth()) return;
  if (hasSkill(id)) {
    showToast(t('toastOwned'));
    closeModal();
    return;
  }
  markSkillOwned(id);
  showToast(t('skillAdded')); closeModal();
  renderLibrary();
}

// ── Balance ───────────────────────────────────────────────────────────────────
async function loadBalance() {
  const data = await api('GET', '/api/me');
  if (!data) return;
  currentFeatures = data.features ?? currentFeatures;
  toggleWithdrawalCard(currentFeatures.withdrawalsEnabled !== false);
  const bal = data.balance ?? { total:0, held:0, available:0 };
  const totalStars = Math.max(0, Number(bal.total ?? 0));
  const heldStars = Math.max(0, Math.min(totalStars, Number(bal.held ?? 0)));
  const availableStars = Math.max(0, totalStars - heldStars);

  const totalSd = toStardust(totalStars).toLocaleString();
  const heldSd = toStardust(heldStars).toLocaleString();
  const availableSd = toStardust(availableStars).toLocaleString();

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('studioBalance', totalSd);
  setText('studioHeld', heldSd);
  setText('studioAvailable', availableSd);
  setText('accountBalance', totalSd);
  setText('accountHeld', heldSd);
  setText('accountAvailable', availableSd);
  setText('accountStars', totalStars.toLocaleString());
}

// ── Stars Top-up ──────────────────────────────────────────────────────────────
async function topUp(stars) {
  if (!await requireAuth()) return;
  if (!tg) { showToast(t('authError')); return; }
  showToast(t('toastTopupPending'));
  const data = await api('POST', '/api/payments/stars/invoice', { amountStars: stars });
  const invoiceLink = data?.invoiceLink ?? data?.invoiceUrl;
  if (!invoiceLink) { showToast(data?.error || t('toastError')); return; }
  tg.openInvoice(invoiceLink, status => {
    if (status === 'paid') {
      showToast('✅ +' + toStardust(stars).toLocaleString() + ' ' + SD);
      setTimeout(loadBalance, 1500);
    } else if (status === 'cancelled' || status === 'failed') {
      showToast(t('toastError'));
    }
  });
}

// ── Top-up button labels ──────────────────────────────────────────────────────
function updateTopupLabels() {
  document.querySelectorAll('.topup-btn').forEach(btn => {
    const stars = Number(btn.dataset.stars);
    btn.innerHTML = `${STAR}${stars} → ${toStardust(stars).toLocaleString()} ${SD}`;
  });
}

// ── Skill Check ───────────────────────────────────────────────────────────────
let checkOpen = false;

function toggleCheckForm() {
  checkOpen = !checkOpen;
  document.getElementById('checkForm').style.display = checkOpen ? '' : 'none';
  document.getElementById('toggleCheckForm').textContent = checkOpen ? t('closeBtn') : t('openBtn');
}

function setCheckStatus(dotClass, text, price) {
  document.getElementById('checkStatusRow').style.display = 'flex';
  document.getElementById('checkStatusDot').className = 'status-dot ' + dotClass;
  document.getElementById('checkStatusText').textContent = text;
  document.getElementById('checkPrice').textContent = price ?? '';
}

async function getQuote() {
  if (!await requireAuth()) return;
  const title = document.getElementById('skillTitleInput').value.trim();
  const skillText  = document.getElementById('skillTextInput').value.trim();
  const mode  = document.getElementById('skillModeInput')?.value || 'hybrid';
  if (!title || skillText.length < 80) { showToast(lang==='ru'?'Мин. 80 символов текста':'Min 80 chars of text'); return; }
  setCheckStatus('queued', '...', '');
  const data = await api('POST', '/api/skill-check/quote', { title, skillText, mode });
  if (!data || data.error) { setCheckStatus('failed', data?.error || t('toastError'), ''); return; }
  const costStars = Number(data.quote?.estimatedTotalCredits ?? data.quote?.pricing?.totalStars ?? 0);
  const label = lang === 'ru' ? 'Оценка стоимости' : 'Estimated cost';
  setCheckStatus('queued', label, toStardust(costStars).toLocaleString() + ' ' + SD);
}

async function runCheck() {
  if (!await requireAuth()) return;
  const title = document.getElementById('skillTitleInput').value.trim();
  const skillText  = document.getElementById('skillTextInput').value.trim();
  const mode  = document.getElementById('skillModeInput')?.value || 'hybrid';
  if (!title || skillText.length < 80) { showToast(lang==='ru'?'Мин. 80 символов текста':'Min 80 chars of text'); return; }
  setCheckStatus('running', t('toastRunning'), '');
  document.getElementById('reportCard').style.display = 'none';
  const publishBtn = document.getElementById('publishSkillBtn');
  if (publishBtn) publishBtn.style.display = 'none';
  lastCheckContext = null;
  const data = await api('POST', '/api/skill-check/run', { title, skillText, mode });
  if (!data) { setCheckStatus('failed', t('toastError'), ''); return; }
  if (data.error) { setCheckStatus('failed', data.error, ''); return; }

  const report = data.report ?? {};
  const score = Number(report.uniquenessScore ?? 0);
  const riskLevel = report.riskLevel ?? (score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high');
  const isHigh = riskLevel === 'low';
  const isMed = riskLevel === 'medium';
  const riskKey = isHigh ? 'riskLow' : isMed ? 'riskMed' : 'riskHigh';
  const dot     = isHigh ? 'done' : isMed ? 'queued' : 'failed';
  const chip    = isHigh ? 'chip-success' : isMed ? 'chip-warn' : 'chip-danger';
  const costStars = Number(data.pricing?.actual?.totalStars ?? data.pricing?.estimated?.totalStars ?? 0);
  setCheckStatus(dot, t(riskKey), toStardust(costStars).toLocaleString() + ' ' + SD);
  document.getElementById('reportCard').style.display = '';
  const scoreEl = document.getElementById('scoreNum');
  scoreEl.textContent = String(score);
  scoreEl.className = 'score-num ' + (isHigh ? 'high' : isMed ? 'medium' : 'low');
  const chipEl = document.getElementById('riskChip');
  chipEl.textContent = t(riskKey); chipEl.className = 'chip ' + chip;
  document.getElementById('reportSummary').textContent = report.summary ?? '';
  document.getElementById('reportRaw').textContent = JSON.stringify(data, null, 2);
  lastCheckContext = {
    title,
    skillText,
    score
  };
  if (publishBtn) publishBtn.style.display = '';
  loadBalance();
}

function publishCheckedSkill() {
  if (!lastCheckContext?.title || !lastCheckContext?.skillText) {
    showToast(t('toastError'));
    return;
  }

  const existing = getPublishedSkills();
  const newId = existing.reduce((maxId, s) => Math.max(maxId, Number(s.id) || 0), 1000) + 1;
  const publishedSkill = {
    id: newId,
    icon: '🆕',
    title: lastCheckContext.title,
    desc: lastCheckContext.skillText.slice(0, 120),
    cat: 'agent',
    price: 1000,
    featured: false,
    content: lastCheckContext.skillText,
    publishedAt: new Date().toISOString(),
    score: lastCheckContext.score
  };
  existing.push(publishedSkill);
  savePublishedSkills(existing);
  showToast(t('toastSkillPublished'));
  renderSkills();
}

let rawVisible = false;
function toggleRaw() {
  rawVisible = !rawVisible;
  document.getElementById('reportRaw').style.display = rawVisible ? '' : 'none';
  document.getElementById('toggleRaw').textContent = rawVisible ? t('hideRaw') : t('showRaw');
}

// ── Withdrawal ────────────────────────────────────────────────────────────────
async function doWithdraw() {
  if (!await requireAuth()) return;
  if (currentFeatures.withdrawalsEnabled === false) {
    showToast(t('toastWithdrawDisabled'));
    return;
  }
  const stardust = parseInt(document.getElementById('withdrawInput').value, 10);
  if (!Number.isInteger(stardust) || stardust < STARDUST_RATE) {
    showToast(t('toastWithdrawMin'));
    return;
  }
  const stars = toStars(stardust);
  const me = await api('GET', '/api/me');
  const availableStars = Number(me?.balance?.available ?? 0);
  if (!Number.isFinite(availableStars) || stars > availableStars) {
    showToast(t('toastNoBalance'));
    return;
  }

  const data = await api('POST', '/api/withdrawals/request', { amountStars: stars });
  if (!data) return;
  if (data.withdrawalId) { showToast(t('toastWithdrawOk')); loadBalance(); }
  else if (String(data.error || '').toLowerCase().includes('disabled')) showToast(t('toastWithdrawDisabled'));
  else showToast(data.error === 'Insufficient available balance' ? t('toastNoBalance') : (data.error || t('toastError')));
}

// ── Profile ───────────────────────────────────────────────────────────────────
async function loadProfile() {
  const data = await api('GET', '/api/me');
  if (!data) return;
  const u = data.user ?? {};
  currentFeatures = data.features ?? currentFeatures;
  toggleWithdrawalCard(currentFeatures.withdrawalsEnabled !== false);
  currentUser = u;
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '—';
  document.getElementById('profileAvatar').textContent = (name[0] || '?').toUpperCase();
  document.getElementById('profileName').textContent   = name;
  document.getElementById('profileId').textContent     = u.username ? '@'+u.username : 'ID: '+(u.telegramUserId??'—');
  const badge = document.getElementById('profileBadge');
  const isAppAdmin = !!u.isAppAdmin;
  if (badge) {
    badge.textContent = isAppAdmin ? 'Admin' : '';
    badge.className = isAppAdmin ? 'chip chip-active' : '';
  }
  toggleAdminTopup(isAppAdmin);
}

function toggleAdminTopup(isVisible) {
  const card = document.getElementById('adminTopupCard');
  if (card) card.style.display = isVisible ? '' : 'none';
}

async function adminTopUp(stars) {
  if (!await requireAuth()) return;
  if (!currentUser?.isAppAdmin) {
    showToast(t('toastError'));
    return;
  }
  const data = await api('POST', '/api/me/dev/topup', {
    amountStars: stars,
    reason: 'miniapp_admin_test_topup'
  });
  if (!data || data.error) {
    showToast(data?.error || t('toastError'));
    return;
  }
  showToast(`${t('toastTopupAdminOk')}: +${toStardust(stars).toLocaleString()} ${SD}`);
  loadBalance();
  loadHistory();
}

// ── Referral ──────────────────────────────────────────────────────────────────
async function loadReferral() {
  const data = await api('GET', '/api/referral');
  if (!data) return;
  const linkEl = document.getElementById('refLinkText');
  if (linkEl) linkEl.textContent = data.link ?? '—';
  const totEl = document.getElementById('refTotalEarned');
  if (totEl) totEl.textContent = toStardust(data.totalEarned ?? 0).toLocaleString() + ' ' + SD;
  (data.levels ?? []).forEach(lv => {
    const el = document.getElementById('refEarn' + lv.level);
    if (el) el.textContent = toStardust(lv.earned ?? 0).toLocaleString() + ' ' + SD;
  });
}

function copyRefLink() {
  const link = document.getElementById('refLinkText')?.textContent;
  if (!link || link === '—') return;
  const fallback = () => {
    const el = document.createElement('textarea');
    el.value = link; el.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(el); el.select();
    document.execCommand('copy'); document.body.removeChild(el);
    showToast(t('toastCopied'));
  };
  navigator.clipboard ? navigator.clipboard.writeText(link).then(() => showToast(t('toastCopied'))).catch(fallback) : fallback();
}

// ── Library ───────────────────────────────────────────────────────────────────
function renderLibrary() {
  const list = document.getElementById('libraryList');
  if (!list) return;

  const purchased = Array.from(getPurchasedSkillIds());
  if (!purchased.length) {
    list.innerHTML = '<div style="color:var(--hint);padding:12px;text-align:center">' + t('emptyLibrary') + '</div>';
    return;
  }

  const items = purchased
    .map((id) => getAllSkills().find((s) => s.id === Number(id)))
    .filter(Boolean);

  if (!items.length) {
    list.innerHTML = '<div style="color:var(--hint);padding:12px;text-align:center">' + t('emptyLibrary') + '</div>';
    return;
  }

  list.innerHTML = items.map((s) => {
    const isFree = s.price === 0;
    return `<div class="history-item">
      <div class="history-item-icon">${s.icon}</div>
      <div style="flex:1">
        <div class="history-item-title">${s.title}</div>
        <div class="history-item-meta">${isFree ? t('free') : (s.price.toLocaleString() + ' ' + SD)}</div>
      </div>
      <button class="btn btn-secondary btn-sm" data-open-skill="${s.id}">${t('openSkillBtn')}</button>
    </div>`;
  }).join('');
}

// ── History ───────────────────────────────────────────────────────────────────
const TYPE_ICONS = {
  credit:'💰', referral_credit:'🤝', debit:'⬇️',
  hold:'🔒', release:'🔓', withdraw_hold:'📤', withdraw_debit:'✅', withdraw_release:'↩️',
  admin_credit:'🛠️', demo_purchase:'🛒'
};

async function loadHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '<div style="color:var(--hint);padding:12px;text-align:center">...</div>';
  const data = await api('GET', '/api/history');
  if (!data) { list.innerHTML = ''; return; }
  const items = Array.isArray(data) ? data : (data.items ?? data.entries ?? []);
  if (!items.length) {
    list.innerHTML = '<div style="color:var(--hint);padding:12px;text-align:center">' + t('emptyHistory') + '</div>';
    return;
  }
  list.innerHTML = items.map(item => {
    const type = item.type ?? '';
    const isPlus = type.includes('credit') || type === 'release' || type === 'withdraw_release';
    const color  = isPlus ? 'var(--success)' : 'var(--danger)';
    const sign   = isPlus ? '+' : '-';
    const sd     = toStardust(item.amountStars ?? item.amount_stars ?? 0);
    const icon   = TYPE_ICONS[type] ?? '📋';
    const dt     = new Date(item.createdAt ?? item.created_at ?? Date.now());
    const date   = dt.toLocaleDateString(lang==='ru' ? 'ru-RU':'en-US', {month:'short', day:'numeric'});
    return `<div class="history-item">
      <div class="history-item-icon">${icon}</div>
      <div style="flex:1">
        <div class="history-item-title">${type.replace(/_/g,' ')}</div>
        <div class="history-item-meta">${date}</div>
      </div>
      <div class="history-item-amount" style="color:${color}">${sign}${sd.toLocaleString()} ${SD}</div>
    </div>`;
  }).join('');
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  tg?.ready();
  tg?.expand();
  detectLang();
  applyLang();
  updateTopupLabels();
  renderSkills();

  // Silent background auth
  const startParam = tg?.initDataUnsafe?.start_param ?? '';
  const refCode = startParam.length >= 4 ? startParam : null;
  if (!token && tg?.initData) silentAuth(refCode);

  // Bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.addEventListener('click', () => showScreen(btn.dataset.screen))
  );

  // Skill card clicks — event delegation on both grids
  ['skillsGrid','skillsGridNew'].forEach(gridId => {
    document.getElementById(gridId)?.addEventListener('click', e => {
      const card = e.target.closest('[data-skill-id]');
      if (card) showSkillDetail(Number(card.dataset.skillId));
    });
  });

  // Filter chips
  document.getElementById('filterRow')?.addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.cat;
    renderSkills();
  });

  // Search
  document.getElementById('searchInput')?.addEventListener('input', renderSkills);

  // Top-up
  document.querySelectorAll('.topup-btn').forEach(btn =>
    btn.addEventListener('click', () => topUp(Number(btn.dataset.stars)))
  );
  document.querySelectorAll('.admin-topup-btn').forEach(btn =>
    btn.addEventListener('click', () => adminTopUp(Number(btn.dataset.stars)))
  );

  // Skill check
  document.getElementById('toggleCheckForm')?.addEventListener('click', toggleCheckForm);
  document.getElementById('quoteBtn')?.addEventListener('click', getQuote);
  document.getElementById('runBtn')?.addEventListener('click', runCheck);
  document.getElementById('publishSkillBtn')?.addEventListener('click', publishCheckedSkill);
  document.getElementById('toggleRaw')?.addEventListener('click', toggleRaw);

  // Withdrawal
  document.getElementById('withdrawBtn')?.addEventListener('click', doWithdraw);

  // Language
  document.querySelectorAll('.lang-btn').forEach(btn =>
    btn.addEventListener('click', () => setLang(btn.dataset.lang))
  );

  // Referral
  document.getElementById('copyRefBtn')?.addEventListener('click', copyRefLink);
  document.getElementById('historyRefreshBtn')?.addEventListener('click', loadHistory);
  document.getElementById('libraryList')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-skill]');
    if (!btn) return;
    showSkillDetail(Number(btn.dataset.openSkill));
  });

  // Legal
  document.getElementById('settingsLegal')?.addEventListener('click', () => {
    const c = document.getElementById('legalCard');
    if (c) c.style.display = c.style.display === 'none' ? '' : 'none';
  });

  // Logout
  document.getElementById('settingsLogout')?.addEventListener('click', logout);

  tg?.setHeaderColor?.('secondary_bg_color');
  tg?.setBackgroundColor?.('bg_color');
}

document.addEventListener('DOMContentLoaded', init);
