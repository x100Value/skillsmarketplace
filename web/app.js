'use strict';

// ── Currency ──────────────────────────────────────────────────────────────────
function fmtUsdt(usdt) { return '$' + Number(usdt).toFixed(2); }
function creditsToUsdt(credits) { return Number(credits) / 100; }

// ── i18n ──────────────────────────────────────────────────────────────────────
const LANGS = {
  en: {
    authTitle:'SkillsMarketplace', authSub:'Marketplace for AI Agent Skills',
    authBtn:'Continue with Telegram', authError:'Please open in Telegram',
    tabMarket:'Market', tabStudio:'Studio', tabAccount:'Ledger',
    topbarSubMarket:'Skill Catalog', topbarSubStudio:'Skill Check Tool', topbarSubAccount:'Your Activity',
    searchPlaceholder:'Search skills...', featuredTitle:'Featured', newTitle:'New',
    catAll:'All', catAgents:'Agents', catAuto:'Automation',
    catData:'Analytics', catWrite:'Writing', catSales:'Sales',
    yourBalance:'Balance', heldLabel:'Held', availableLabel:'Available',
    ledgerTag:'Ledger · Balance', historyTag:'Event Log · Transactions',
    libraryTitle:'My Library', librarySub:'Claimed skills',
    inEscrow:'in escrow',
    checkPanelHeader:'Input Prompt / Skill', llmBadge:'LLM Analysis',
    checkTitle:'Skill Check', resultsTag:'Analysis Results',
    llmAssessment:'LLM Assessment',
    skillTitlePlaceholder:'e.g. Telegram Lead Qualification Agent',
    skillTextPlaceholder:'Paste your full skill or prompt text here (min 80 chars)...',
    getQuoteBtn:'Get Quote', runCheckBtn:'⚡ Run Check',
    publishSkillBtn:'Publish Skill',
    uniquenessScore:'Uniqueness Score', riskLabel:'Risk Level',
    showRaw:'Show details', hideRaw:'Hide details',
    creatorTag:'For Creators', earlyAccessBadge:'Early Access',
    creatorSub:'Publish your AI skills and earn USDT from every sale. Apply for early access.',
    protectionTag:'Uniqueness Engine · 3-Layer Protection',
    layer1Title:'Semantic Similarity', layer1Desc:'Embeddings + cosine distance check against all existing skill prompts. Blocks clones above threshold.', layer1Badge:'Layer 1',
    layer2Title:'Structural Fingerprint', layer2Desc:'Analyzes instruction chains, execution graph, and system prompt block structure.', layer2Badge:'Layer 2',
    layer3Title:'Output Fingerprinting', layer3Desc:'Runs skill on test inputs, compares output embeddings and response structure against known skills.', layer3Badge:'Layer 3',
    bannerHeadline:'Join SkillsMarket',
    refTitle:'Referral Program', refSub:'Earn from your network',
    level1:'Level 1', level2:'Level 2', level3:'Level 3',
    copyBtn:'Copy', totalEarned:'Total earned:',
    languageTitle:'Language', historyTitle:'History', refreshBtn:'Refresh',
    legalTitle:'Legal', openLegal:'Legal Center',
    publicOffer:'Public Offer', privacyPolicy:'Privacy Policy', refundRules:'Refund Policy',
    logoutBtn:'Log out',
    featuredBadge:'Featured', freeBadge:'Free',
    priceLabel:'Price', costLabel:'Cost',
    runsLabel:'runs',
    minCharsToast:'Min 80 chars',
    estimatedCostLabel:'Estimated cost',
    toastSignedOut:'Signed out',
    adminBadge:'Admin',
    historyEvent:'Event', historyAmount:'Amount', historyDate:'Date',
    eventCredit:'Credit',
    eventReferralCredit:'Referral credit',
    eventDebit:'Debit',
    eventHold:'Hold',
    eventRelease:'Release',
    eventWithdrawHold:'Withdraw hold',
    eventWithdrawDebit:'Withdraw debit',
    eventWithdrawRelease:'Withdraw release',
    eventAdminCredit:'Admin credit',
    eventDemoPurchase:'Demo purchase',
    toastCopied:'Link copied!', toastError:'Error, please try again',
    toastOwned:'Already in your library',
    toastSkillPublished:'Skill published to Market (demo)',
    toastRunning:'Running check...',
    toastSignIn:'Sign in to use this feature',
    riskLow:'Low', riskMed:'Medium', riskHigh:'High',
    free:'FREE', emptyHistory:'No history yet', emptyLibrary:'Library is empty',
    openSkillBtn:'Open',
    skillContentTitle:'Skill content', skillContentMissing:'No content yet',
    copyContentBtn:'Copy Content',
    signInPrompt:'Sign in with Telegram to continue',
    signInBtn:'Sign In',
    getBtn:'Get Free', modalClose:'Close',
    skillAdded:'Skill added to your library!',
    alphaBadge:'Alpha', poweredBy:'AI-powered',
    alphaBannerTitle:'🚀 Alpha Testing',
    alphaBannerSub:'We are accepting early creators and buyers. Join the waitlist.',
    alphaApplyBtn:'Apply for Alpha Access →',
    paymentsDisabledTitle:'Payments are disabled during Alpha.',
    paymentsDisabledSub:'Top-up and withdrawals will be available after public launch.',
    toastAlphaApplied:'Application sent! We will contact you soon.',
    alphaModalTitle:'Apply for Early Access',
    alphaModalSub:'Tell us your role',
    alphaRoleLabel:'I want to be a:',
    alphaNotePlaceholder:'Any notes? (optional)',
    sendApplicationBtn:'Send Application',
    cancelBtn:'Cancel',
    roleCreator:'Creator', roleBuyer:'Buyer', roleBoth:'Both',
    connectWallet:'Connect Wallet',
    disconnectWallet:'Disconnect Wallet',
    walletConnected:'Wallet connected',
    walletDisconnected:'Wallet disconnected',
    walletNotConnected:'Wallet not connected',
    walletInitFailed:'Wallet init failed',
    walletConnectFailed:'Wallet connection failed',
    shareCheckBtn:'Share result',
    shareLead:'I checked my skill uniqueness in SkillsMarketplace.',
    shareTryLabel:'Try it',
    toastShareOpened:'Share window opened',
    toastShareCopied:'Share text copied',
  },
  ru: {
    authTitle:'SkillsMarketplace', authSub:'Маркетплейс скилов для AI-агентов',
    authBtn:'Войти через Telegram', authError:'Откройте в Telegram',
    tabMarket:'Маркет', tabStudio:'Студия', tabAccount:'Леджер',
    topbarSubMarket:'Каталог скилов', topbarSubStudio:'Проверка уникальности', topbarSubAccount:'Ваша активность',
    searchPlaceholder:'Поиск скилов...', featuredTitle:'Рекомендуем', newTitle:'Новые',
    catAll:'Все', catAgents:'Агенты', catAuto:'Автоматизация',
    catData:'Аналитика', catWrite:'Тексты', catSales:'Продажи',
    yourBalance:'Баланс', heldLabel:'Удержано', availableLabel:'Доступно',
    ledgerTag:'Леджер · Баланс', historyTag:'Лог событий · Транзакции',
    libraryTitle:'Моя библиотека', librarySub:'Полученные скилы',
    inEscrow:'в эскроу',
    checkPanelHeader:'Ввод промта / скила', llmBadge:'LLM-анализ',
    checkTitle:'Проверка скила', resultsTag:'Результаты анализа',
    llmAssessment:'Оценка LLM',
    skillTitlePlaceholder:'Агент квалификации лидов Telegram',
    skillTextPlaceholder:'Вставьте полный текст скила или промта (мин 80 символов)...',
    getQuoteBtn:'Узнать стоимость', runCheckBtn:'⚡ Запустить',
    publishSkillBtn:'Опубликовать',
    uniquenessScore:'Уникальность', riskLabel:'Уровень риска',
    showRaw:'Детали', hideRaw:'Скрыть детали',
    creatorTag:'Для создателей', earlyAccessBadge:'Ранний доступ',
    creatorSub:'Публикуйте AI-скилы и зарабатывайте USDT с каждой продажи. Подайте заявку на ранний доступ.',
    protectionTag:'Движок уникальности · 3 уровня защиты',
    layer1Title:'Семантическое сходство', layer1Desc:'Embeddings + косинусное расстояние до всех скилов. Блокирует клоны выше порога.', layer1Badge:'Слой 1',
    layer2Title:'Структурный отпечаток', layer2Desc:'Анализирует цепочки инструкций, граф выполнения и структуру системного промта.', layer2Badge:'Слой 2',
    layer3Title:'Отпечаток вывода', layer3Desc:'Запускает скил на тестовых входах, сравнивает embedding вывода и структуру ответа.', layer3Badge:'Слой 3',
    bannerHeadline:'Присоединяйтесь',
    refTitle:'Реферальная программа', refSub:'Зарабатывайте на своей сети',
    level1:'Уровень 1', level2:'Уровень 2', level3:'Уровень 3',
    copyBtn:'Копировать', totalEarned:'Итого заработано:',
    languageTitle:'Язык', historyTitle:'История', refreshBtn:'Обновить',
    legalTitle:'Правовые документы', openLegal:'Правовой центр',
    publicOffer:'Публичная оферта', privacyPolicy:'Политика конфиденциальности', refundRules:'Условия возврата',
    logoutBtn:'Выйти',
    featuredBadge:'Рекомендуем', freeBadge:'Бесплатно',
    priceLabel:'Цена', costLabel:'Стоимость',
    runsLabel:'запусков',
    minCharsToast:'Мин. 80 символов',
    estimatedCostLabel:'Оценка стоимости',
    toastSignedOut:'Вы вышли из аккаунта',
    adminBadge:'Админ',
    historyEvent:'Событие', historyAmount:'Сумма', historyDate:'Дата',
    eventCredit:'Начисление',
    eventReferralCredit:'Реф. начисление',
    eventDebit:'Списание',
    eventHold:'Холд',
    eventRelease:'Разморозка',
    eventWithdrawHold:'Холд вывода',
    eventWithdrawDebit:'Списание вывода',
    eventWithdrawRelease:'Разморозка вывода',
    eventAdminCredit:'Админ начисление',
    eventDemoPurchase:'Демо покупка',
    toastCopied:'Скопировано!', toastError:'Ошибка, попробуйте снова',
    toastOwned:'Уже в вашей библиотеке',
    toastSkillPublished:'Скил опубликован в Маркете (demo)',
    toastRunning:'Запускаем проверку...',
    toastSignIn:'Войдите для доступа к этой функции',
    riskLow:'Низкий', riskMed:'Средний', riskHigh:'Высокий',
    free:'БЕСПЛАТНО', emptyHistory:'История пуста', emptyLibrary:'Библиотека пуста',
    openSkillBtn:'Открыть',
    skillContentTitle:'Контент скила', skillContentMissing:'Контент пока не добавлен',
    copyContentBtn:'Копировать контент',
    signInPrompt:'Войдите через Telegram для доступа',
    signInBtn:'Войти',
    getBtn:'Получить бесплатно', modalClose:'Закрыть',
    skillAdded:'Скил добавлен в вашу библиотеку!',
    alphaBadge:'Альфа', poweredBy:'AI-платформа',
    alphaBannerTitle:'🚀 Альфа-тестирование',
    alphaBannerSub:'Принимаем первых создателей и покупателей. Присоединяйтесь к списку ожидания.',
    alphaApplyBtn:'Подать заявку →',
    paymentsDisabledTitle:'Платежи отключены в период альфа.',
    paymentsDisabledSub:'Пополнение и вывод будут доступны после публичного запуска.',
    toastAlphaApplied:'Заявка отправлена! Мы свяжемся с вами.',
    alphaModalTitle:'Подать заявку на ранний доступ',
    alphaModalSub:'Расскажите о себе',
    alphaRoleLabel:'Я хочу быть:',
    alphaNotePlaceholder:'Дополнительно? (необязательно)',
    sendApplicationBtn:'Отправить заявку',
    cancelBtn:'Отмена',
    roleCreator:'Создатель', roleBuyer:'Покупатель', roleBoth:'Оба варианта',
    connectWallet:'Подключить кошелек',
    disconnectWallet:'Отключить кошелек',
    walletConnected:'Кошелек подключен',
    walletDisconnected:'Кошелек отключен',
    walletNotConnected:'Кошелек не подключен',
    walletInitFailed:'Ошибка инициализации кошелька',
    walletConnectFailed:'Не удалось подключить кошелек',
    shareCheckBtn:'Поделиться результатом',
    shareLead:'Я проверил уникальность своего скила в SkillsMarketplace.',
    shareTryLabel:'Попробуй тоже',
    toastShareOpened:'Открыто окно шаринга',
    toastShareCopied:'Текст для шаринга скопирован',
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
  if (tgLang.startsWith('ru') || (navigator.language ?? '').startsWith('ru')) { lang = 'ru'; return; }
  lang = 'en';
}

function setLang(l) {
  lang = l;
  localStorage.setItem('sm_lang', l);
  applyLang();
  renderSkills();

  const activeScreen = document.querySelector('.nav-btn.active')?.dataset.screen ?? 'market';
  const meta = SCREEN_META[activeScreen] ?? SCREEN_META.market;
  const titleEl = document.getElementById('topbarTitle');
  const subEl = document.getElementById('topbarSub');
  if (titleEl) titleEl.textContent = t(meta.titleKey);
  if (subEl) subEl.textContent = t(meta.subKey);
  if (activeScreen === 'account' && token) loadHistory();
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
let token       = localStorage.getItem('sm_token');
let currentFilter = 'all';
let authInProgress = false;
let currentUser = null;
let lastCheckContext = null;
let cachedReferralLink = null;
const SESSION_TG_UID_KEY  = 'sm_session_tg_uid';
const PURCHASED_SKILLS_KEY = 'sm_purchased_skills';
const PUBLISHED_SKILLS_KEY = 'sm_published_skills';

function getCurrentTelegramUserId() {
  const uid = tg?.initDataUnsafe?.user?.id;
  return uid ? String(uid) : '';
}

function clearSessionToken() {
  token = null; currentUser = null;
  cachedReferralLink = null;
  localStorage.removeItem('sm_token');
  localStorage.removeItem(SESSION_TG_UID_KEY);
}

function getPurchasedSkillIds() {
  try {
    const raw = localStorage.getItem(PURCHASED_SKILLS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set((Array.isArray(parsed) ? parsed : []).map(Number).filter(Number.isFinite));
  } catch { return new Set(); }
}

function savePurchasedSkillIds(set) {
  localStorage.setItem(PURCHASED_SKILLS_KEY, JSON.stringify(Array.from(set)));
}

function hasSkill(id) { return getPurchasedSkillIds().has(Number(id)); }

function markSkillOwned(id) {
  const s = getPurchasedSkillIds(); s.add(Number(id)); savePurchasedSkillIds(s);
}

function getPublishedSkills() {
  try {
    const raw = localStorage.getItem(PUBLISHED_SKILLS_KEY);
    const p = raw ? JSON.parse(raw) : [];
    return Array.isArray(p) ? p : [];
  } catch { return []; }
}

function savePublishedSkills(skills) {
  localStorage.setItem(PUBLISHED_SKILLS_KEY, JSON.stringify(skills));
}

function getAllSkills() { return [...DEMO_SKILLS, ...getPublishedSkills()]; }

function escapeHtml(v) {
  return String(v ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
}


// ── TON Connect ───────────────────────────────────────────────────────────────
let tonConnectUI = null;
let tonWalletAddress = null;

let tonConnectScriptLoading = null;

function ensureTonConnectUiLoaded() {
  if (window.TON_CONNECT_UI) return Promise.resolve(window.TON_CONNECT_UI);
  if (tonConnectScriptLoading) return tonConnectScriptLoading;

  tonConnectScriptLoading = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-tonconnect-ui="1"]');
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.TON_CONNECT_UI) resolve(window.TON_CONNECT_UI);
        else reject(new Error('TON_CONNECT_UI not available after script load'));
      }, { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load TON Connect UI script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = '/tonconnect-ui.min.js';
    script.async = true;
    script.dataset.tonconnectUi = '1';
    script.addEventListener('load', () => {
      if (window.TON_CONNECT_UI) resolve(window.TON_CONNECT_UI);
      else reject(new Error('TON_CONNECT_UI not available after script load'));
    }, { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load TON Connect UI script')), { once: true });
    document.head.appendChild(script);
  });

  return tonConnectScriptLoading;
}

async function initTonConnect() {
  try {
    if (typeof window.TON_CONNECT_UI === 'undefined') {
      await ensureTonConnectUiLoaded();
    }

    if (!tonConnectUI) {
      tonConnectUI = new window.TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://skillsmarketplace.ru/tonconnect-manifest.json',
        actionsConfiguration: {
          twaReturnUrl: 'https://t.me/SkillsMarketplacebot/app',
        },
      });

      tonConnectUI.onStatusChange(
        wallet => {
          syncTonWalletState(wallet).catch(err => {
            console.error('TON wallet state sync error:', err);
          });
        },
        err => {
          console.error('TON Connect status error:', err);
        }
      );
    }

    await syncTonWalletState(tonConnectUI.wallet);

    if (tonConnectUI.connectionRestored && typeof tonConnectUI.connectionRestored.then === 'function') {
      tonConnectUI.connectionRestored
        .then(() => syncTonWalletState(tonConnectUI.wallet))
        .catch(err => console.error('TON Connect restore error:', err));
    }
  } catch (e) {
    console.error('TON Connect init error:', e);
  }
}

async function syncTonWalletState(walletState) {
  const rawAddr = walletState?.account?.address ?? '';
  if (!rawAddr) {
    tonWalletAddress = null;
    updateWalletUI(false, null);
    return;
  }

  let addr = rawAddr;
  try {
    if (window.TON_CONNECT_UI.toUserFriendlyAddress) {
      addr = window.TON_CONNECT_UI.toUserFriendlyAddress(rawAddr);
    }
  } catch (e) {
    console.warn('Address conversion failed:', e);
  }

  tonWalletAddress = addr;
  updateWalletUI(true, addr);
  await saveWalletToBackend(addr);

  try {
    tonConnectUI?.closeModal();
  } catch (e) {
    // Safe to ignore: modal may already be closed.
  }
}

function updateWalletUI(connected, address) {
  const topBtn = document.getElementById('walletConnectBtn');
  const accBtn = document.getElementById('walletConnectBtnAccount');
  const statusEl = document.getElementById('walletStatus');
  const balRow = document.getElementById('walletBalanceRow');

  if (connected && address) {
    const short = address.slice(0,4) + '...' + address.slice(-4);
    if (topBtn) {
      topBtn.textContent = short;
      topBtn.classList.add('connected');
    }
    if (accBtn) {
      accBtn.textContent = t('disconnectWallet');
      accBtn.classList.add('btn-danger');
      accBtn.classList.remove('btn-primary');
    }
    if (statusEl) statusEl.textContent = t('walletConnected') + ': ' + short;
    if (balRow) balRow.style.display = 'block';
  } else {
    if (topBtn) {
      topBtn.textContent = '\u{1f48e}';
      topBtn.classList.remove('connected');
    }
    if (accBtn) {
      accBtn.textContent = t('connectWallet');
      accBtn.classList.remove('btn-danger');
      accBtn.classList.add('btn-primary');
    }
    if (statusEl) statusEl.textContent = t('walletNotConnected');
    if (balRow) balRow.style.display = 'none';
  }
}

async function waitForWalletConnection(timeoutMs = 12000, stepMs = 300) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const walletState = tonConnectUI?.wallet;
    if (walletState?.account?.address) return walletState;
    await new Promise(resolve => setTimeout(resolve, stepMs));
  }
  return null;
}

async function toggleWalletConnection() {
  try {
    if (!tonConnectUI) {
      await initTonConnect();
    }
    if (!tonConnectUI) {
      showToast(t('walletInitFailed'));
      return;
    }

    if (tonConnectUI.wallet || tonWalletAddress) {
      await tonConnectUI.disconnect();
      await syncTonWalletState(null);
      showToast(t('walletDisconnected'));
      return;
    }

    await tonConnectUI.openModal();
    const connectedWallet = await waitForWalletConnection();
    if (connectedWallet) {
      await syncTonWalletState(connectedWallet);
      showToast(t('walletConnected'));
      return;
    }

    await syncTonWalletState(tonConnectUI.wallet);
    if (!tonConnectUI.wallet?.account?.address) {
      showToast(t('walletConnectFailed'));
    }
  } catch (e) {
    console.error('TON wallet connect toggle failed:', e);
    showToast(t('walletConnectFailed'));
  }
}

async function saveWalletToBackend(address) {
  try {
    if (!token) {
      await silentAuth(null);
    }
    if (!token) {
      return;
    }
    await api('POST', '/api/me/wallet', { tonAddress: address });
  } catch (e) {
    console.error('Failed to save wallet:', e);
  }
}

async function payWithTON(skillId, priceUsdt) {
  if (!tonConnectUI || !tonWalletAddress) {
    showToast(t('walletNotConnected'));
    return false;
  }
  try {
    // Create payment intent on backend
    const intent = await api('POST', '/api/payments/ton/create-intent', {
      skillId,
      paymentRail: 'usdt',
    });
    if (!intent || !intent.intentId) {
      showToast(t('tonPaymentFailed'));
      return false;
    }
    // For now, USDT on TON — send jetton transfer
    // Using simplified approach: send TON equivalent
    const amountNano = Math.ceil(priceUsdt * 1e9).toString();
    const tx = {
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [{
        address: intent.walletAddress,
        amount: amountNano,
        payload: intent.memo || '',
      }]
    };
    showToast(t('tonPaymentPending'));
    const result = await tonConnectUI.sendTransaction(tx);
    if (result?.boc) {
      // Poll for confirmation
      let confirmed = false;
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const status = await api('GET', '/api/payments/ton/status/' + intent.intentId);
        if (status?.status === 'confirmed') {
          confirmed = true;
          break;
        }
        if (status?.status === 'failed' || status?.status === 'expired') break;
      }
      if (confirmed) {
        showToast(t('tonPaymentSuccess'));
        markSkillOwned(skillId);
        renderSkills();
        return true;
      }
    }
    showToast(t('tonPaymentFailed'));
    return false;
  } catch (e) {
    console.error('TON payment error:', e);
    showToast(t('tonPaymentFailed'));
    return false;
  }
}


// ── Fiat On-Ramp (Mercuryo) ──────────────────────────────────────────────────
async function openOnramp(cryptoCurrency) {
  if (!tonWalletAddress) {
    showToast(t('noWalletForOnramp'));
    return;
  }
  try {
    const session = await api('POST', '/api/payments/onramp/create', {
      walletAddress: tonWalletAddress,
      cryptoCurrency: cryptoCurrency || 'TON',
      fiatAmount: 10,
    });
    if (session?.widgetUrl) {
      // Open Mercuryo widget in a popup
      const w = 400, h = 600;
      const left = (screen.width - w) / 2;
      const top = (screen.height - h) / 2;
      window.open(session.widgetUrl, 'mercuryo', `width=${w},height=${h},left=${left},top=${top}`);
    } else {
      showToast(session?.error || 'On-ramp unavailable');
    }
  } catch (e) {
    showToast('On-ramp error');
    console.error(e);
  }
}

// ── Invisible watermark ───────────────────────────────────────────────────────
const WM0 = '\u200B', WM1 = '\u200C', WMS = '\u200D';

function encodeInvisibleWatermark(text) {
  const bytes = new TextEncoder().encode(text);
  let out = '';
  for (const byte of bytes) {
    out += byte.toString(2).padStart(8,'0').replaceAll('0',WM0).replaceAll('1',WM1);
    out += WMS;
  }
  return out;
}

function buildWatermarkPayload(skillId) {
  const uid   = String(currentUser?.telegramUserId ?? tg?.initDataUnsafe?.user?.id ?? 'anon');
  const uname = String(currentUser?.username ?? tg?.initDataUnsafe?.user?.username ?? 'unknown');
  return `SM|u:${uid}|n:${uname}|s:${skillId}|t:${Date.now()}`;
}

function buildProtectedExportContent(skill) {
  const plain   = String(skill?.content ?? '');
  const payload = buildWatermarkPayload(skill?.id ?? 'na');
  const hidden  = encodeInvisibleWatermark(payload);
  const fp = `\n\n[SM-LICENSE] buyer=${currentUser?.username ?? currentUser?.telegramUserId ?? 'anon'} skill=${skill?.id ?? 'na'}`;
  return plain + fp + hidden;
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
    if (r.status === 401) { clearSessionToken(); return null; }
    return await r.json();
  } catch { return null; }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function silentAuth(referralCode, force = false) {
  if (authInProgress) return !!token;
  if (token && !force) return true;
  const initData = tg?.initData;
  if (!initData) return false;
  authInProgress = true;
  try {
    const body = { initData };
    if (referralCode) body.referralCode = referralCode;
    const r = await fetch('/api/auth/telegram', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) { console.warn('Auth failed:', r.status); return false; }
    const data = await r.json();
    if (data.token) {
      token = data.token;
      localStorage.setItem('sm_token', token);
      const uid = getCurrentTelegramUserId();
      if (uid) localStorage.setItem(SESSION_TG_UID_KEY, uid);
      else     localStorage.removeItem(SESSION_TG_UID_KEY);
      return true;
    }
    return false;
  } catch(e) { console.error('Auth error:', e); return false; }
  finally { authInProgress = false; }
}

async function requireAuth() {
  const currentUid = getCurrentTelegramUserId();
  const sessionUid = localStorage.getItem(SESSION_TG_UID_KEY) || '';
  if (token && currentUid && sessionUid !== currentUid) clearSessionToken();
  if (token) return true;
  const ok = await silentAuth(null);
  if (!ok) showToast(t('toastSignIn'));
  return ok;
}

function logout() {
  clearSessionToken();
  showToast(t('toastSignedOut'));
}

// ── Navigation ────────────────────────────────────────────────────────────────
const SCREEN_META = {
  market:  { titleKey: 'tabMarket',  subKey: 'topbarSubMarket' },
  studio:  { titleKey: 'tabStudio',  subKey: 'topbarSubStudio' },
  account: { titleKey: 'tabAccount', subKey: 'topbarSubAccount' },
};

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name)?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.screen === name)
  );
  const meta = SCREEN_META[name] ?? SCREEN_META.market;
  const titleEl = document.getElementById('topbarTitle');
  const subEl   = document.getElementById('topbarSub');
  if (titleEl) titleEl.textContent = t(meta.titleKey);
  if (subEl)   subEl.textContent   = t(meta.subKey);
  if (name === 'studio')  onStudioOpen();
  if (name === 'account') onAccountOpen();
}

// ── Studio ────────────────────────────────────────────────────────────────────
async function onStudioOpen() {
  if (!await requireAuth()) { showSignInCard('studio'); return; }
  document.getElementById('studioSignIn')?.remove();
  loadBalance();
}

// ── Account ───────────────────────────────────────────────────────────────────
async function onAccountOpen() {
  if (!await requireAuth()) { showSignInCard('account'); return; }
  document.getElementById('accountSignIn')?.remove();
  loadProfile(); loadReferral(); loadHistory(); loadBalance(); renderLibrary();
}

function showSignInCard(screen) {
  const id = screen + 'SignIn';
  if (document.getElementById(id)) return;
  const el  = document.getElementById('screen-' + screen);
  const div = document.createElement('div');
  div.id = id;
  div.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:32px 20px;text-align:center;margin-bottom:12px';
  div.innerHTML = `
    <div style="font-size:40px;margin-bottom:12px">🔐</div>
    <div style="font-size:16px;font-weight:700;margin-bottom:6px">${t('signInPrompt')}</div>
    <button class="btn btn-primary sign-in-card-btn" style="margin-top:16px;width:100%;max-width:220px">${t('signInBtn')}</button>`;
  el.insertBefore(div, el.firstChild);
  div.querySelector('.sign-in-card-btn')?.addEventListener('click', () => manualAuth(screen));
}

async function manualAuth(screen) {
  if (!tg?.initData) { showToast(t('authError')); return; }
  const ok = await silentAuth(null, true);
  if (ok) {
    document.getElementById(screen + 'SignIn')?.remove();
    if (screen === 'studio')  loadBalance();
    if (screen === 'account') { loadProfile(); loadReferral(); loadHistory(); loadBalance(); renderLibrary(); }
  } else showToast(t('toastError'));
}

// ── Demo skills ───────────────────────────────────────────────────────────────
const DEMO_SKILLS = [
  { id:1,  icon:'🤖', title:'Telegram Lead Qualifier',    desc:'Qualifies leads from Telegram groups using NLP',         cat:'agent', price:2500, price_usdt:2.50, featured:true,
    content:`ROLE\nYou are a Telegram Lead Qualification Agent for {{product_name}}.\n\nOBJECTIVE\n1) Classify lead intent (hot/warm/cold).\n2) Extract budget, timeline, authority, use-case.\n3) Suggest next step and draft reply.\n\nRULES\n- Ask at most 2 clarifying questions.\n- Do not invent data.\n\nOUTPUT JSON\n{"intent":"hot|warm|cold","score_0_100":0,"facts":{},"next_step":"","reply_draft":""}` },
  { id:2,  icon:'✍️', title:'SEO Content Rewriter',        desc:'95%+ unique rewrites preserving full meaning',           cat:'write', price:1800, price_usdt:1.80, featured:true,
    content:`ROLE\nYou are an SEO Content Rewriter.\n\nINPUT\nmode={{mode}}\ntarget_length={{target_words}}\nkeywords={{keywords_csv}}\nsource_text={{source_text}}\n\nRULES\n- Preserve factual meaning.\n- Keep keyword density natural.\n- Avoid plagiarism.\n- Use clear structure.` },
  { id:3,  icon:'📊', title:'Data Analysis Pipeline',     desc:'Auto-cleans CSV/JSON data and generates insights',       cat:'data',  price:3200, price_usdt:3.20, featured:true,
    content:`ROLE\nYou are a Data Analysis Agent.\n\nINPUT\ndata={{raw_data}}\ngoal={{analysis_goal}}\n\nTASK\n1) Profile the dataset.\n2) Detect anomalies.\n3) Generate 5 key insights.\n4) Suggest 3 next actions.\n\nOUTPUT\n- summary, anomalies[], insights[], next_steps[]` },
  { id:4,  icon:'🤝', title:'Sales Script Generator',     desc:'Personalized B2B sales scripts with objection handlers',  cat:'sales', price:1500, price_usdt:1.50, featured:false,
    content:`ROLE\nYou write B2B sales scripts.\n\nINPUT\nproduct={{product}}\nprospect={{prospect_profile}}\npain_points={{pain_points}}\n\nOUTPUT\n- Opening hook\n- Value proposition (30 sec)\n- 3 objection handlers\n- Closing CTA` },
  { id:5,  icon:'⚡', title:'Zapier Flow Builder',        desc:'Generates Zapier automation flows from plain text',       cat:'auto',  price:900, price_usdt:0.90,  featured:false,
    content:`ROLE\nYou are a Zapier automation architect.\n\nINPUT\ngoal={{automation_goal}}\ntools={{available_apps}}\n\nTASK\nDesign a complete Zapier flow:\n- Trigger app + event\n- Filter conditions\n- Action steps\n- Error handling\n\nOUTPUT\nStep-by-step flow with configuration details.` },
  { id:6,  icon:'🧠', title:'Prompt Optimizer Pro',       desc:'Restructures prompts for max token efficiency',           cat:'agent', price:2000, price_usdt:2.00, featured:false,
    content:`ROLE\nYou are a Prompt Engineering expert.\n\nINPUT\noriginal_prompt={{prompt}}\nmodel={{target_model}}\ngoal={{output_goal}}\n\nTASK\n1) Analyze the original prompt.\n2) Identify weaknesses.\n3) Rewrite for clarity and efficiency.\n4) Provide before/after comparison.` },
  { id:7,  icon:'📧', title:'Cold Email Writer',          desc:'Personalized outreach sequences with A/B variants',       cat:'sales', price:1200, price_usdt:1.20, featured:false,
    content:`ROLE\nYou write cold outbound emails.\n\nINPUT\nprospect={{prospect_data}}\noffer={{offer}}\nproof={{proof_points}}\n\nTASK\nCreate subject A/B, email A/B (90-140 words), follow-up #1 and #2.\n\nRULES\n- First line must be personalized.\n- One clear CTA. No hype.` },
  { id:8,  icon:'📰', title:'News Aggregator Agent',      desc:'Monitors 50+ sources, filters & sends digest',           cat:'auto',  price:800, price_usdt:0.80,  featured:false,
    content:`ROLE\nYou build a daily news digest for {{topic}}.\n\nINPUT\narticles={{article_list}}\naudience={{audience_profile}}\n\nTASK\n1) Deduplicate similar stories.\n2) Rank by relevance.\n3) Summarize top 7.\n\nOUTPUT\n- Morning brief (3 bullets)\n- Main digest with headline, why_it_matters, key_fact\n- Watchlist` },
  { id:9,  icon:'📝', title:'Blog Post Generator',        desc:'Long-form SEO posts with meta tags & image prompts',     cat:'write', price:2000, price_usdt:2.00, featured:false,
    content:`ROLE\nYou are an SEO Blog Writer.\n\nINPUT\ntopic={{topic}}\nsearch_intent={{intent}}\nkeywords={{keywords}}\n\nOUTPUT\n1) Outline (H1/H2/H3)\n2) Full article 1200-1800 words\n3) FAQ section (5 Q/A)\n4) Meta title + description\n5) 3 image prompts` },
  { id:10, icon:'🔍', title:'SEO Audit Engine',           desc:'Full on-page SEO analysis with competitor gap detection', cat:'data',  price:1600, price_usdt:1.60, featured:false,
    content:`ROLE\nYou are an SEO Audit specialist.\n\nINPUT\nurl={{page_url}}\ncompetitors={{competitor_urls}}\ntarget_keywords={{keywords}}\n\nOUTPUT\n- On-page score (0-100)\n- Top 10 issues with priority\n- Competitor gaps\n- Actionable recommendations` },
];

// ── Skill cards ───────────────────────────────────────────────────────────────
const CAT_COLORS = {
  agent: 'rgba(0,229,255,0.1)',
  write: 'rgba(124,58,237,0.1)',
  data:  'rgba(16,185,129,0.1)',
  sales: 'rgba(245,158,11,0.1)',
  auto:  'rgba(239,68,68,0.1)',
};

const CAT_BADGE = {
  agent: 'badge-blue',
  write: 'badge-purple',
  data:  'badge-green',
  sales: 'badge-gold',
  auto:  'badge-red',
};

const CAT_LABELS = {
  agent: 'catAgents',
  auto:  'catAuto',
  data:  'catData',
  write: 'catWrite',
  sales: 'catSales',
};

function getCategoryLabel(cat) {
  const key = CAT_LABELS[cat];
  return key ? t(key) : cat;
}

function renderSkillCard(s) {
  const isFree     = !s.price_usdt || s.price_usdt === 0;
  const priceLabel = isFree ? t('free') : fmtUsdt(s.price_usdt);
  const priceClass = isFree ? 'skill-price free' : 'skill-price';
  const bgColor    = CAT_COLORS[s.cat] ?? 'rgba(0,229,255,0.1)';
  const badge      = s.featured
    ? `<span class="badge badge-gold">${t('featuredBadge')}</span>`
    : isFree
      ? `<span class="badge badge-green">${t('freeBadge')}</span>`
      : `<span class="badge ${CAT_BADGE[s.cat] ?? 'badge-blue'}">${escapeHtml(getCategoryLabel(s.cat))}</span>`;

  return `<div class="skill-card" data-skill-id="${s.id}">
    <div class="skill-card-top">
      <div class="skill-icon" style="background:${bgColor}">${s.icon}</div>
      <div class="skill-meta">
        <div class="skill-name">${escapeHtml(s.title)}</div>
        <div class="skill-author">@skillsmarket</div>
      </div>
      ${badge}
    </div>
    <div class="skill-desc">${escapeHtml(s.desc)}</div>
    <div class="skill-footer">
      <span class="${priceClass}">${priceLabel}</span>

      <div class="skill-stats">
        <span>⚡ ${(s.id * 317 % 9000 + 500).toLocaleString()} ${t('runsLabel')}</span>
      </div>
    </div>
  </div>`;
}

function renderSkills() {
  const query  = (document.getElementById('searchInput')?.value ?? '').toLowerCase();
  let skills   = getAllSkills();
  if (currentFilter !== 'all') skills = skills.filter(s => s.cat === currentFilter);
  if (query) skills = skills.filter(s =>
    s.title.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query)
  );
  const featured = skills.filter(s => s.featured);
  const fresh    = skills.filter(s => !s.featured);
  const empty    = `<div style="color:var(--muted);padding:20px;text-align:center;font-family:var(--mono);font-size:12px">—</div>`;
  document.getElementById('skillsGrid').innerHTML    = featured.length ? featured.map(renderSkillCard).join('') : empty;
  document.getElementById('skillsGridNew').innerHTML = fresh.length    ? fresh.map(renderSkillCard).join('') : empty;
}

// ── Skill detail modal ────────────────────────────────────────────────────────
function showSkillDetail(skillId) {
  const s = getAllSkills().find(x => x.id === skillId);
  if (!s) return;
  const isFree       = !s.price_usdt || s.price_usdt === 0;
  const priceUsdt    = s.price_usdt || 0;
  const alreadyOwned = hasSkill(s.id);

  document.getElementById('skillModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'skillModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-body">
        <div class="modal-skill-icon">${s.icon}</div>
        <div class="modal-skill-title">${escapeHtml(s.title)}</div>
        <div class="modal-skill-desc">${escapeHtml(s.desc)}</div>

        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center;margin-bottom:14px">
          ${isFree
            ? `<div style="font-size:20px;font-weight:800;color:var(--accent3)">${t('free')}</div>`
            : `<div style="font-size:12px;color:var(--muted);margin-bottom:2px">${t('priceLabel')}</div>
               <div style="font-size:22px;font-weight:800;color:var(--accent)">💎 ${fmtUsdt(priceUsdt)} USDT</div>`
          }
        </div>

        ${alreadyOwned ? `
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:12px">
            <div style="font-size:10px;color:var(--muted);font-family:var(--mono);text-transform:uppercase;margin-bottom:8px">${t('skillContentTitle')}</div>
            <pre class="terminal" style="margin:0;max-height:200px;overflow-y:auto;padding:10px;font-size:11px">${escapeHtml(s.content ?? t('skillContentMissing'))}</pre>
          </div>` : ''}

        ${!alreadyOwned && !isFree ? `
          <div id="tonPayBlock">
            <button class="btn btn-primary btn-full" id="modalTonPayBtn"
              data-skill-id="${s.id}" data-price-usdt="${s.price_usdt || 0}">
              💎 ${t('payWithTON')} — $${s.price_usdt || '?'}
            </button>
            <button class="btn btn-outline btn-full" style="margin-top:6px" id="modalBuyCardBtn">
              💳 ${t('buyWithCard')}
            </button>
          </div>` : ''}

        ${alreadyOwned || isFree ? `
          <button class="btn ${isFree && !alreadyOwned ? 'btn-success' : 'btn-secondary'} btn-full" id="modalPrimaryAction">
            ${alreadyOwned ? t('copyContentBtn') : t('getBtn')}
          </button>` : ''}

        <button class="btn btn-ghost btn-full" style="margin-top:8px" id="modalCloseBtn">${t('modalClose')}</button>
      </div>
    </div>`;

  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.body.appendChild(modal);

  modal.querySelector('#modalCloseBtn')?.addEventListener('click', closeModal);
  modal.querySelector('#modalAlphaBtn')?.addEventListener('click', alphaApply);

  const primaryBtn = modal.querySelector('#modalPrimaryAction');
  if (alreadyOwned) {
    primaryBtn?.addEventListener('click', async () => {
      const value = buildProtectedExportContent(s);
      const copy = async () => {
        const ok = await navigator.clipboard?.writeText?.(value).then(() => true).catch(() => false);
        if (!ok) {
          const ta = document.createElement('textarea');
          ta.value = value; ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta);
        }
      };
      await copy();
      showToast(t('toastCopied'));
    });
  } else if (isFree) {
    primaryBtn?.addEventListener('click', () => getSkill(s.id));
  }


  // Buy with card button
  modal.querySelector('#modalBuyCardBtn')?.addEventListener('click', () => openOnramp('TON'));

  // TON pay button
  const tonPayBtn = modal.querySelector('#modalTonPayBtn');
  if (tonPayBtn) {
    tonPayBtn.addEventListener('click', async () => {
      const sid = tonPayBtn.dataset.skillId;
      const price = parseFloat(tonPayBtn.dataset.priceUsdt);
      tonPayBtn.disabled = true;
      tonPayBtn.textContent = t('tonPaymentPending');
      const ok = await payWithTON(sid, price);
      if (ok) closeModal();
      else {
        tonPayBtn.disabled = false;
        tonPayBtn.textContent = '\u{1f48e} ' + t('payWithTON');
      }
    });
  }

  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeModal() {
  const m = document.getElementById('skillModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(() => m.remove(), 280);
}

async function getSkill(id) {
  if (!await requireAuth()) return;
  if (hasSkill(id)) { showToast(t('toastOwned')); closeModal(); return; }
  markSkillOwned(id);
  showToast(t('skillAdded')); closeModal();
  renderLibrary();
}

async function buySkill(_id) { alphaApply(); }

// ── Alpha apply ───────────────────────────────────────────────────────────────
function alphaApply() { showAlphaModal(); }

function showAlphaModal() {
  document.getElementById('alphaModal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'alphaModal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-body">
        <div style="text-align:center;margin-bottom:4px">
          <div style="font-size:36px">🚀</div>
        </div>
        <div class="modal-skill-title">${t('alphaModalTitle')}</div>
        <div class="modal-skill-desc">${t('alphaModalSub')}</div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:8px">${t('alphaRoleLabel')}</div>
        <div style="display:flex;gap:8px;margin-bottom:14px">
          <button class="role-btn active" data-role="both">${t('roleBoth')}</button>
          <button class="role-btn" data-role="creator">${t('roleCreator')}</button>
          <button class="role-btn" data-role="buyer">${t('roleBuyer')}</button>
        </div>
        <textarea id="alphaNoteInput" placeholder="${t('alphaNotePlaceholder')}" style="min-height:70px;margin-bottom:12px"></textarea>
        <button class="btn btn-primary btn-full" id="sendAlphaBtn">${t('sendApplicationBtn')}</button>
        <button class="btn btn-ghost btn-full" style="margin-top:8px" id="closeAlphaBtn">${t('cancelBtn')}</button>
      </div>
    </div>`;

  let selectedRole = 'both';
  modal.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedRole = btn.dataset.role;
    });
  });

  modal.querySelector('#sendAlphaBtn')?.addEventListener('click', async () => {
    const note = modal.querySelector('#alphaNoteInput')?.value?.trim() ?? '';
    const sendBtn = modal.querySelector('#sendAlphaBtn');
    if (sendBtn) { sendBtn.disabled = true; sendBtn.textContent = '...'; }
    await sendAlphaApplication(selectedRole, note);
    closeAlphaModal();
    showToast(t('toastAlphaApplied'), 3500);
  });

  modal.querySelector('#closeAlphaBtn')?.addEventListener('click', closeAlphaModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeAlphaModal(); });
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));
}

function closeAlphaModal() {
  const m = document.getElementById('alphaModal');
  if (!m) return;
  m.classList.remove('open');
  setTimeout(() => m.remove(), 280);
}

async function sendAlphaApplication(role, note) {
  if (!token) return;
  try {
    await api('POST', '/api/alpha/apply', { role, note });
  } catch { /* silent fail — toast already shown */ }
}

// ── Balance ───────────────────────────────────────────────────────────────────
async function loadBalance() {
  const data = await api('GET', '/api/me');
  if (!data) return;
  const bal = data.balance ?? {};
  const totalUsdt     = Number(bal.totalUsdt ?? 0);
  const heldUsdt      = Number(bal.heldUsdt ?? 0);
  const availableUsdt = Math.max(0, totalUsdt - heldUsdt);

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('studioBalance',   fmtUsdt(totalUsdt));
  set('studioHeld',      fmtUsdt(heldUsdt));
  set('studioAvailable', fmtUsdt(availableUsdt));
  set('accountBalance',  fmtUsdt(totalUsdt));
  set('accountHeld',     fmtUsdt(heldUsdt));
  set('accountAvailable',fmtUsdt(availableUsdt));
  set('accountStars',    fmtUsdt(totalUsdt));

  const tb = document.getElementById('topbarBalance');
  if (tb) tb.textContent = '💎 ' + fmtUsdt(totalUsdt);
}

// Stubs for disabled features
async function doWithdraw()   { alphaApply(); }

// ── Skill Check ───────────────────────────────────────────────────────────────
function setCheckStatus(dotClass, text, price) {
  const row = document.getElementById('checkStatusRow');
  if (row) row.style.display = 'flex';
  const dot = document.getElementById('checkStatusDot');
  if (dot) dot.className = 'status-dot-check ' + dotClass;
  const txt = document.getElementById('checkStatusText');
  if (txt) txt.textContent = text;
  const priceEl = document.getElementById('checkPrice');
  if (priceEl) priceEl.textContent = price ?? '';
}

async function getQuote() {
  if (!await requireAuth()) return;
  const title     = document.getElementById('skillTitleInput')?.value?.trim() ?? '';
  const skillText = document.getElementById('skillTextInput')?.value?.trim() ?? '';
  const mode      = document.getElementById('skillModeInput')?.value || 'hybrid';
  if (!title || skillText.length < 80) { showToast(t('minCharsToast')); return; }
  setCheckStatus('queued', '...', '');
  const data = await api('POST', '/api/skill-check/quote', { title, skillText, mode });
  if (!data || data.error) { setCheckStatus('failed', data?.error || t('toastError'), ''); return; }
  const costCredits = Number(data.quote?.estimatedTotalCredits ?? 0);
  setCheckStatus('queued', t('estimatedCostLabel'), fmtUsdt(creditsToUsdt(costCredits)));
}

async function runCheck() {
  if (!await requireAuth()) return;
  const title     = document.getElementById('skillTitleInput')?.value?.trim() ?? '';
  const skillText = document.getElementById('skillTextInput')?.value?.trim() ?? '';
  const mode      = document.getElementById('skillModeInput')?.value || 'hybrid';
  if (!title || skillText.length < 80) { showToast(t('minCharsToast')); return; }

  setCheckStatus('running', t('toastRunning'), '');
  const reportCard = document.getElementById('reportCard');
  if (reportCard) reportCard.style.display = 'none';
  const publishBtn = document.getElementById('publishSkillBtn');
  if (publishBtn) publishBtn.style.display = 'none';
  const shareBtn = document.getElementById('shareCheckBtn');
  if (shareBtn) shareBtn.style.display = 'none';
  lastCheckContext = null;

  const data = await api('POST', '/api/skill-check/run', { title, skillText, mode });
  if (!data)        { setCheckStatus('failed', t('toastError'), ''); return; }
  if (data.error)   { setCheckStatus('failed', data.error, '');     return; }

  const report    = data.report ?? {};
  const score     = Number(report.uniquenessScore ?? 0);
  const riskLevel = report.riskLevel ?? (score >= 70 ? 'low' : score >= 40 ? 'medium' : 'high');
  const isLow     = riskLevel === 'low';
  const isMed     = riskLevel === 'medium';
  const dot       = isLow ? 'done' : isMed ? 'queued' : 'failed';
  const riskKey   = isLow ? 'riskLow' : isMed ? 'riskMed' : 'riskHigh';
  const scoreClass = isLow ? 'score-high' : isMed ? 'score-med' : 'score-low';
  const costCredits = Number(data.pricing?.actual?.totalCredits ?? data.pricing?.estimated?.totalCredits ?? 0);

  setCheckStatus(dot, t(riskKey), fmtUsdt(creditsToUsdt(costCredits)));

  if (reportCard) reportCard.style.display = '';
  const scoreEl = document.getElementById('scoreNum');
  if (scoreEl) { scoreEl.textContent = String(score) + '%'; scoreEl.className = 'result-score ' + scoreClass; }
  const riskEl = document.getElementById('riskChip');
  if (riskEl) { riskEl.textContent = t(riskKey); riskEl.className = 'result-score ' + scoreClass; }
  const summaryEl = document.getElementById('reportSummary');
  if (summaryEl) summaryEl.textContent = report.summary ?? '';
  const rawEl = document.getElementById('reportRaw');
  if (rawEl) rawEl.textContent = JSON.stringify(data, null, 2);
  const finalPrice = document.getElementById('checkPriceFinal');
  if (finalPrice) finalPrice.textContent = costCredits > 0 ? `${t('costLabel')}: ${fmtUsdt(creditsToUsdt(costCredits))}` : '';

  lastCheckContext = { title, skillText, score, riskKey };
  if (publishBtn) publishBtn.style.display = '';
  if (shareBtn) shareBtn.style.display = '';
  loadBalance();
}

function publishCheckedSkill() {
  if (!lastCheckContext?.title || !lastCheckContext?.skillText) { showToast(t('toastError')); return; }
  const existing = getPublishedSkills();
  const newId    = existing.reduce((m, s) => Math.max(m, Number(s.id) || 0), 1000) + 1;
  existing.push({
    id: newId, icon: '🆕', title: lastCheckContext.title,
    desc: lastCheckContext.skillText.slice(0, 120),
    cat: 'agent', price: 1000, featured: false,
    content: lastCheckContext.skillText,
    publishedAt: new Date().toISOString(), score: lastCheckContext.score
  });
  savePublishedSkills(existing);
  showToast(t('toastSkillPublished'));
  renderSkills();
}

let rawVisible = false;
function toggleRaw() {
  rawVisible = !rawVisible;
  const el = document.getElementById('reportRaw');
  if (el) el.style.display = rawVisible ? '' : 'none';
  const btn = document.getElementById('toggleRaw');
  if (btn) btn.textContent = rawVisible ? t('hideRaw') : t('showRaw');
}

// ── Profile ───────────────────────────────────────────────────────────────────
async function loadProfile() {
  const data = await api('GET', '/api/me');
  if (!data) return;
  const u = data.user ?? {};
  currentUser = u;
  const profileWallet = typeof u.tonAddress === 'string' ? u.tonAddress.trim() : '';
  if (profileWallet.length >= 10 && !tonWalletAddress) {
    tonWalletAddress = profileWallet;
    updateWalletUI(true, profileWallet);
  }
  const name  = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username || '—';
  const el    = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  el('profileAvatar', (name[0] || '?').toUpperCase());
  el('profileName',   name);
  el('profileId',     u.username ? '@'+u.username : 'ID: '+(u.telegramUserId ?? '—'));
  const badge = document.getElementById('profileBadge');
  if (badge && u.isAppAdmin) {
    badge.innerHTML = `<span class="badge badge-blue">${t('adminBadge')}</span>`;
  }
}

// ── Referral ──────────────────────────────────────────────────────────────────
async function loadReferral() {
  const data = await api('GET', '/api/referral');
  if (!data) return;
  const linkEl = document.getElementById('refLinkText');
  if (linkEl) linkEl.textContent = data.link ?? '—';
  cachedReferralLink = data.link ?? null;
  const totEl = document.getElementById('refTotalEarned');
  if (totEl) totEl.textContent = fmtUsdt(creditsToUsdt(data.totalEarned ?? 0));
  (data.levels ?? []).forEach(lv => {
    const el = document.getElementById('refEarn' + lv.level);
    if (el) el.textContent = fmtUsdt(creditsToUsdt(lv.earned ?? 0));
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

async function getReferralShareLink() {
  if (cachedReferralLink) return cachedReferralLink;
  const data = await api('GET', '/api/referral');
  const link = data?.link;
  if (typeof link === 'string' && link.length >= 8) {
    cachedReferralLink = link;
    return link;
  }
  return 'https://t.me/SkillsMarketplacebot';
}

async function shareCheckResult() {
  if (!lastCheckContext?.score) {
    showToast(t('toastError'));
    return;
  }
  if (!await requireAuth()) return;

  const score = Number(lastCheckContext.score ?? 0);
  const riskKey = score >= 70 ? 'riskLow' : score >= 40 ? 'riskMed' : 'riskHigh';
  const referralLink = await getReferralShareLink();

  const lines = [
    t('shareLead'),
    `${t('uniquenessScore')}: ${score}%`,
    `${t('riskLabel')}: ${t(riskKey)}`,
    '',
    `${t('shareTryLabel')}: ${referralLink}`
  ];

  const shareText = lines.join('\n');
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(lines.slice(0, 4).join('\n'))}`;

  try {
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
      showToast(t('toastShareOpened'));
      return;
    }
  } catch {
    // fallback below
  }

  try {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    showToast(t('toastShareOpened'));
    return;
  } catch {
    // fallback below
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      showToast(t('toastShareCopied'));
      return;
    }
  } catch {
    // fallback below
  }

  const ta = document.createElement('textarea');
  ta.value = shareText;
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast(t('toastShareCopied'));
}

// ── Library ───────────────────────────────────────────────────────────────────
function renderLibrary() {
  const list = document.getElementById('libraryList');
  if (!list) return;
  const ids   = Array.from(getPurchasedSkillIds());
  const items = ids.map(id => getAllSkills().find(s => s.id === Number(id))).filter(Boolean);

  if (!items.length) {
    list.innerHTML = `<div style="color:var(--muted);padding:16px;text-align:center;font-family:var(--mono);font-size:12px">${t('emptyLibrary')}</div>`;
    return;
  }

  list.innerHTML = items.map(s => `
    <div class="library-item">
      <div style="font-size:22px;flex-shrink:0">${s.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(s.title)}</div>
        <div style="font-size:11px;color:var(--muted);font-family:var(--mono)">${!s.price_usdt ? t('free') : fmtUsdt(s.price_usdt)}</div>
      </div>
      <button class="btn btn-ghost btn-sm" data-open-skill="${s.id}">${t('openSkillBtn')}</button>
    </div>`).join('');
}

// ── History as Ledger table ───────────────────────────────────────────────────
const EVENT_BADGES = {
  credit:           'badge-green',
  referral_credit:  'badge-purple',
  debit:            'badge-red',
  hold:             'badge-gold',
  release:          'badge-green',
  withdraw_hold:    'badge-gold',
  withdraw_debit:   'badge-blue',
  withdraw_release: 'badge-green',
  admin_credit:     'badge-blue',
  demo_purchase:    'badge-purple',
};

const EVENT_LABELS = {
  credit: 'eventCredit',
  referral_credit: 'eventReferralCredit',
  debit: 'eventDebit',
  hold: 'eventHold',
  release: 'eventRelease',
  withdraw_hold: 'eventWithdrawHold',
  withdraw_debit: 'eventWithdrawDebit',
  withdraw_release: 'eventWithdrawRelease',
  admin_credit: 'eventAdminCredit',
  demo_purchase: 'eventDemoPurchase',
};

function getEventTypeLabel(type) {
  const key = EVENT_LABELS[type];
  return key ? t(key) : type.replace(/_/g, ' ');
}

async function loadHistory() {
  const container = document.getElementById('historyList');
  if (!container) return;
  container.innerHTML = `<div class="ledger-empty">...</div>`;

  const data  = await api('GET', '/api/history');
  if (!data)  { container.innerHTML = ''; return; }
  const items = Array.isArray(data) ? data : (data.items ?? data.entries ?? []);

  if (!items.length) {
    container.innerHTML = `<div class="ledger-empty">${t('emptyHistory')}</div>`;
    return;
  }

  const rows = items.map(item => {
    const type    = item.type ?? '';
    const isPlus  = type.includes('credit') || type === 'release' || type === 'withdraw_release';
    const usdt    = Number(item.amountUsdt ?? (Number(item.amountCredits ?? item.amount_credits ?? 0) / 100));
    const amtClass = isPlus ? 'amount-pos' : 'amount-neg';
    const amtSign  = isPlus ? '+' : '−';
    const badgeClass = EVENT_BADGES[type] ?? 'badge-blue';
    const dt      = new Date(item.createdAt ?? item.created_at ?? Date.now());
    const date    = dt.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', { month:'short', day:'numeric' });
    return `<tr>
      <td><span class="badge ${badgeClass}" style="font-size:9px">${getEventTypeLabel(type)}</span></td>
      <td class="${amtClass}">${amtSign}${fmtUsdt(usdt)}</td>
      <td style="font-family:var(--mono);font-size:10px;color:var(--muted);white-space:nowrap">${date}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>${t('historyEvent')}</th>
          <th>${t('historyAmount')}</th>
          <th>${t('historyDate')}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  tg?.ready();
  tg?.expand();
  tg?.setHeaderColor?.('secondary_bg_color');
  tg?.setBackgroundColor?.('bg_color');

  // Session security
  const currentUid = getCurrentTelegramUserId();
  const sessionUid = localStorage.getItem(SESSION_TG_UID_KEY) || '';
  if (token && currentUid && sessionUid !== currentUid) clearSessionToken();

  detectLang();
  applyLang();
  renderSkills();

  // Silent background auth
  const startParam = tg?.initDataUnsafe?.start_param ?? '';
  const refCode    = startParam.length >= 4 ? startParam : null;
  if (tg?.initData) silentAuth(refCode, true).then(() => loadBalance());

  // Bottom nav
  document.querySelectorAll('.nav-btn').forEach(btn =>
    btn.addEventListener('click', () => showScreen(btn.dataset.screen))
  );

  // Skill card clicks (event delegation)
  ['skillsGrid','skillsGridNew'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', e => {
      const card = e.target.closest('[data-skill-id]');
      if (card) showSkillDetail(Number(card.dataset.skillId));
    });
  });

  // Filter tabs
  document.getElementById('filterRow')?.addEventListener('click', e => {
    const tab = e.target.closest('[data-cat]');
    if (!tab) return;
    document.querySelectorAll('[data-cat]').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.cat;
    renderSkills();
  });

  // Search
  document.getElementById('searchInput')?.addEventListener('input', renderSkills);

  // Alpha apply buttons
  ['alphaApplyBtnMarket','alphaApplyBtnStudio','alphaApplyBtnAccount'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', alphaApply);
  });

  // Skill check
  document.getElementById('quoteBtn')?.addEventListener('click', getQuote);
  document.getElementById('runBtn')?.addEventListener('click', runCheck);
  document.getElementById('shareCheckBtn')?.addEventListener('click', shareCheckResult);
  document.getElementById('publishSkillBtn')?.addEventListener('click', publishCheckedSkill);
  document.getElementById('toggleRaw')?.addEventListener('click', toggleRaw);

  // Language
  document.querySelectorAll('.lang-btn').forEach(btn =>
    btn.addEventListener('click', () => setLang(btn.dataset.lang))
  );

  // Referral
  document.getElementById('copyRefBtn')?.addEventListener('click', copyRefLink);
  document.getElementById('historyRefreshBtn')?.addEventListener('click', loadHistory);

  // Library open skill
  document.getElementById('libraryList')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-open-skill]');
    if (btn) showSkillDetail(Number(btn.dataset.openSkill));
  });

  // Legal toggle
  document.getElementById('settingsLegal')?.addEventListener('click', () => {
    const c = document.getElementById('legalCard');
    if (c) c.style.display = c.style.display === 'none' ? '' : 'none';
  });

  // Logout
  document.getElementById('settingsLogout')?.addEventListener('click', logout);

  // TON Connect
  initTonConnect();
  document.getElementById('walletConnectBtn')?.addEventListener('click', toggleWalletConnection);
  document.getElementById('walletConnectBtnAccount')?.addEventListener('click', toggleWalletConnection);
  document.getElementById('buyCryptoBtn')?.addEventListener('click', () => openOnramp('TON'));
}

document.addEventListener('DOMContentLoaded', init);
