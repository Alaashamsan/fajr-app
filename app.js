// ========================
// FAJR APP - Main Application
// ========================

// ========================
// 1. STATE MANAGEMENT
// ========================
const APP_STATE = {
  currentView: 'home',
  theme: localStorage.getItem('theme') || 'sunrise',
  userProfile: JSON.parse(localStorage.getItem('userProfile')) || null,
  goals: JSON.parse(localStorage.getItem('goals')) || [],
  transactions: JSON.parse(localStorage.getItem('transactions')) || [],
  chatHistory: JSON.parse(localStorage.getItem('chatHistory')) || [],
  isFirstTime: !localStorage.getItem('onboarded'),
  wizardStep: 0,
  goalTemplate: null,
  selectedGoalMode: null,
};

// ========================
// 2. INITIALIZATION
// ========================
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  // تطبيق الثيم
  applyTheme(APP_STATE.theme);

  // عرض واجهة التفعيل الأولى إذا كانت أول مرة
  if (APP_STATE.isFirstTime) {
    document.getElementById('wizard-bg').classList.remove('hidden');
  } else {
    document.getElementById('wizard-bg').classList.add('hidden');
    renderBottomNav();
    switchView('home');
  }

  // ربط الأحداث
  setupEventListeners();

  // تحديث البيانات على الشاشة
  renderHome();
}

// ========================
// 3. THEME MANAGEMENT
// ========================
function applyTheme(theme) {
  APP_STATE.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateThemeColors();
}

function updateThemeColors() {
  const theme = APP_STATE.theme === 'green';
  const metaTheme = document.getElementById('meta-theme');
  metaTheme.setAttribute('content', theme ? '#F4F8F5' : '#0A0912');
}

function toggleTheme() {
  const newTheme = APP_STATE.theme === 'sunrise' ? 'green' : 'sunrise';
  applyTheme(newTheme);
}

// ========================
// 4. VIEW MANAGEMENT
// ========================
function switchView(viewName) {
  // إخفاء جميع الـ Views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  // عرض الـ View المطلوب
  const view = document.getElementById(`v-${viewName}`);
  if (view) {
    view.classList.add('active');
    APP_STATE.currentView = viewName;

    // تحديث Bottom Nav
    updateBottomNav(viewName);

    // تحديث محتوى الـ View
    switch (viewName) {
      case 'home':
        renderHome();
        break;
      case 'account':
        renderAccount();
        break;
      case 'goals':
        renderGoals();
        break;
      case 'advisor':
        renderAdvisor();
        break;
      case 'more':
        renderMore();
        break;
    }

    // تمرير للأعلى
    window.scrollTo(0, 0);
  }
}

// ========================
// 5. BOTTOM NAVIGATION
// ========================
function renderBottomNav() {
  const nav = document.getElementById('bnav');
  nav.innerHTML = `
    <button class="on" onclick="switchView('home')" title="الرئيسية">
      ${ICONS.home}
      <span>الرئيسية</span>
    </button>
    <button onclick="switchView('account')" title="الحسابات">
      ${ICONS.bank}
      <span>الحسابات</span>
    </button>
    <button onclick="switchView('goals')" title="الأهداف">
      ${ICONS.heart}
      <span>الأهداف</span>
    </button>
    <button onclick="switchView('advisor')" title="المستشار">
      ${ICONS.advisor}
      <span>المستشار</span>
    </button>
    <button onclick="switchView('more')" title="المزيد">
      ${ICONS.bulb}
      <span>المزيد</span>
    </button>
  `;
}

function updateBottomNav(activeView) {
  document.querySelectorAll('.bnav button').forEach((btn, idx) => {
    const views = ['home', 'account', 'goals', 'advisor', 'more'];
    if (views[idx] === activeView) {
      btn.classList.add('on');
    } else {
      btn.classList.remove('on');
    }
  });
}

// ========================
// 6. HOME VIEW
// ========================
function renderHome() {
  const view = document.getElementById('v-home');
  const profile = APP_STATE.userProfile;

  if (!profile) {
    view.innerHTML = `
      <div style="text-align: center; padding: 60px 20px;">
        <div class="empty">
          <div class="e-ic">${ICONS.empty}</div>
          <h3>لم تدخل بيانات بعد</h3>
          <p>ابدأ الآن بإدخال بياناتك المالية لنتمكن من مساعدتك</p>
          <button class="btn btn-p" onclick="switchView('more')">إدخال البيانات</button>
        </div>
      </div>
    `;
    return;
  }

  const salary = profile.salary || 0;
  const extra = profile.extra || 0;
  const income = salary + extra;
  const expenses = (profile.housing || 0) + (profile.bills || 0) + (profile.transport || 0) + (profile.variable || 0) + (profile.debt || 0);
  const surplus = income - expenses;

  view.innerHTML = `
    <!-- Top Bar -->
    <div class="topbar" id="topbar-content">
      <div class="tb-left">
        <button class="tb-btn" onclick="showMenu()">☰</button>
      </div>
      <div class="tb-brand">
        <span class="bn">فجر</span>
      </div>
      <div class="tb-right">
        <button class="tb-btn" onclick="toggleTheme()">🌙</button>
        <button class="tb-btn">
          <div class="avatar">${profile.name?.charAt(0) || 'ف'}</div>
        </button>
      </div>
    </div>

    <!-- Balance Card -->
    <div class="balance" style="margin-bottom: 20px;">
      <div class="balance-in">
        <div class="bal-lbl">
          <button class="eye" onclick="toggleBalance()">👁️</button>
          <span>الرصيد الحالي</span>
        </div>
        <div class="bal-val">
          <span>${formatCurrency(surplus)}</span>
          <span class="cur">ر.س</span>
        </div>
        <button class="bal-pill" onclick="switchView('more')">
          ${ICONS.plus}
          إضافة عملية
        </button>
        <div class="bal-split">
          <div>
            <div class="bs-l">الدخل الشهري</div>
            <div class="bs-v" style="color: var(--mint);">${formatCurrency(income)}</div>
          </div>
          <div>
            <div class="bs-l">المصاريف</div>
            <div class="bs-v" style="color: var(--rose);">${formatCurrency(expenses)}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="sec" style="margin: 24px 0 12px;">
      <h2>الإجراءات السريعة</h2>
    </div>
    <div class="qa-grid">
      <button class="qa" onclick="switchView('data')">
        <div class="qa-ic" style="background: linear-gradient(135deg, var(--coral), var(--orange));">${ICONS.data}</div>
        <div class="qa-lb">بياناتي</div>
      </button>
      <button class="qa" onclick="switchView('goals')">
        <div class="qa-ic" style="background: linear-gradient(135deg, var(--amber), var(--gold));">${ICONS.heart}</div>
        <div class="qa-lb">أهدافي</div>
      </button>
      <button class="qa" onclick="switchView('advisor')">
        <div class="qa-ic" style="background: linear-gradient(135deg, var(--plum), var(--plum-lt));">${ICONS.advisor}</div>
        <div class="qa-lb">المستشار</div>
      </button>
      <button class="qa" onclick="switchView('more')">
        <div class="qa-ic" style="background: linear-gradient(135deg, var(--mint), #00D9A3);">${ICONS.plus}</div>
        <div class="qa-lb">المزيد</div>
      </button>
    </div>

    <!-- Goals Overview -->
    <div class="sec" style="margin: 24px 0 12px;">
      <h2>أهدافي</h2>
      ${APP_STATE.goals.length > 0 ? '<a class="all" onclick="switchView(\'goals\')">عرض الكل</a>' : ''}
    </div>
    <div id="goals-preview">
      ${APP_STATE.goals.length === 0 ? '<div class="empty" style="padding: 20px;"><p>لم تضع أهدافًا بعد</p></div>' : APP_STATE.goals.slice(0, 2).map(renderGoalPreview).join('')}
    </div>
  `;
}

function renderGoalPreview(goal) {
  const progress = (goal.saved / goal.target) * 100;
  const remaining = goal.target - goal.saved;
  return `
    <div class="goal">
      <div class="goal-h">
        <div class="goal-ic" style="background: linear-gradient(135deg, ${getGoalColor(goal.template)});">
          ${getGoalIcon(goal.template)}
        </div>
        <div class="m">
          <h4>${goal.name}</h4>
          <span>${new Date(goal.deadline).toLocaleDateString('ar-SA')}</span>
        </div>
      </div>
      <div class="goal-g">
        <div>
          <div class="l">المبلغ المستهدف</div>
          <div class="v">${formatCurrency(goal.target)}</div>
        </div>
        <div>
          <div class="l">المجمع</div>
          <div class="v">${formatCurrency(goal.saved)}</div>
        </div>
        <div>
          <div class="l">المتبقي</div>
          <div class="v">${formatCurrency(remaining)}</div>
        </div>
      </div>
      <div class="track">
        <div class="fill" style="width: ${Math.min(progress, 100)}%;"></div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <span class="tag tag-ok">${Math.round(progress)}%</span>
        <span class="tag tag-n">${goal.mode === 'cash' ? '💎 ادخار' : '🧩 تقسيط'}</span>
      </div>
    </div>
  `;
}

// ========================
// 7. ACCOUNT VIEW
// ========================
function renderAccount() {
  const view = document.getElementById('v-account');
  const profile = APP_STATE.userProfile;

  view.innerHTML = `
    <div class="vhead">
      <div>
        <h1>حسابي</h1>
        <p>حساباتك وعملياتك في مكان واحد</p>
      </div>
    </div>
    ${!profile ? '<div class="empty"><p>لا توجد بيانات</p></div>' : `
      <div class="card">
        <div class="row" style="border-bottom: none; flex-direction: column; align-items: flex-start;">
          <h3>ملخص المالية</h3>
          <div class="grid g3" style="margin-top: 14px;">
            <div class="stat">
              <div class="stat-l">الدخل الشهري</div>
              <div class="stat-v gold">${formatCurrency(profile.salary + profile.extra)}</div>
            </div>
            <div class="stat">
              <div class="stat-l">المصاريف</div>
              <div class="stat-v down">${formatCurrency(profile.housing + profile.bills + profile.transport + profile.variable + profile.debt)}</div>
            </div>
            <div class="stat">
              <div class="stat-l">الفائض</div>
              <div class="stat-v up">${formatCurrency((profile.salary + profile.extra) - (profile.housing + profile.bills + profile.transport + profile.variable + profile.debt))}</div>
            </div>
          </div>
        </div>
      </div>
      <div style="margin-top: 14px;">
        <h3 style="font-size: 16px; margin-bottom: 12px;">العمليات الأخيرة</h3>
        ${APP_STATE.transactions.length === 0 ? '<div class="empty"><p>لا توجد عمليات</p></div>' : `
          <div class="card">
            ${APP_STATE.transactions.slice(-5).reverse().map(tx => `
              <div class="row">
                <div class="row-ic ${tx.type}">
                  ${tx.type === 'in' ? ICONS.arrowDown : ICONS.arrowUp}
                </div>
                <div class="row-m">
                  <div class="row-t">${tx.desc}</div>
                  <div class="row-s">${new Date(tx.date).toLocaleDateString('ar-SA')}</div>
                </div>
                <div class="row-v ${tx.type}">${tx.type === 'in' ? '+' : '-'}${formatCurrency(tx.amount)}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `}
  `;
}

// ========================
// 8. GOALS VIEW
// ========================
function renderGoals() {
  const view = document.getElementById('v-goals');
  view.innerHTML = `
    <div class="vhead">
      <div>
        <h1>أهدافي</h1>
        <p>خطط لأهم أهدافك الحياتية</p>
      </div>
    </div>
    <button class="btn btn-p btn-b" style="margin-bottom: 14px;" onclick="openGoalModal()">
      ${ICONS.plus} إضافة هدف جديد
    </button>
    ${APP_STATE.goals.length === 0 ? `
      <div class="empty">
        <div class="e-ic">${ICONS.empty}</div>
        <h3>لا توجد أهداف</h3>
        <p>ابدأ بوضع أهدافك المالية لتحقيقها</p>
      </div>
    ` : `
      <div>
        ${APP_STATE.goals.map((goal, idx) => `
          <div class="goal" style="position: relative;">
            <button onclick="deleteGoal(${idx})" style="position: absolute; top: 10px; left: 10px; background: none; border: none; color: var(--rose); cursor: pointer; font-size: 18px;">✕</button>
            <div class="goal-h">
              <div class="goal-ic" style="background: linear-gradient(135deg, ${getGoalColor(goal.template)});">
                ${getGoalIcon(goal.template)}
              </div>
              <div class="m">
                <h4>${goal.name}</h4>
                <span>${new Date(goal.deadline).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
            <div class="goal-g">
              <div>
                <div class="l">المبلغ</div>
                <div class="v">${formatCurrency(goal.target)}</div>
              </div>
              <div>
                <div class="l">المجمع</div>
                <div class="v">${formatCurrency(goal.saved)}</div>
              </div>
              <div>
                <div class="l">النسبة</div>
                <div class="v">${Math.round((goal.saved / goal.target) * 100)}%</div>
              </div>
            </div>
            <div class="track">
              <div class="fill" style="width: ${Math.min((goal.saved / goal.target) * 100, 100)}%;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;
}

// ========================
// 9. ADVISOR VIEW (CHAT)
// ========================
function renderAdvisor() {
  const view = document.getElementById('v-advisor');
  const chatW = document.getElementById('chat-w');
  
  if (APP_STATE.chatHistory.length === 0) {
    chatW.innerHTML = `
      <div class="empty">
        <div class="e-ic">${ICONS.advisor}</div>
        <h3>أهلًا بك في المستشار</h3>
        <p>اسأل أي سؤال عن وضعك المالي أو أهدافك</p>
      </div>
    `;
  } else {
    chatW.innerHTML = APP_STATE.chatHistory.map(msg => `
      <div class="msg ${msg.role === 'user' ? 'msg-u' : 'msg-a'}">
        ${msg.content}
      </div>
    `).join('');
  }
}

function sendMessage() {
  const input = document.getElementById('chat-in');
  const message = input.value.trim();

  if (!message) return;

  // أضف رسالة المستخدم
  APP_STATE.chatHistory.push({
    role: 'user',
    content: message,
  });

  // محاكاة رد الذكاء الاصطناعي
  const response = generateAIResponse(message);
  APP_STATE.chatHistory.push({
    role: 'assistant',
    content: response,
  });

  // حفظ وتحديث
  localStorage.setItem('chatHistory', JSON.stringify(APP_STATE.chatHistory));
  input.value = '';
  renderAdvisor();

  // التمرير للأسفل
  const chatW = document.getElementById('chat-w');
  setTimeout(() => {
    chatW.scrollTop = chatW.scrollHeight;
  }, 100);
}

function generateAIResponse(message) {
  const profile = APP_STATE.userProfile;
  if (!profile) {
    return 'يرجى إدخال بياناتك المالية أولًا لأتمكن من مساعدتك بشكل أفضل.';
  }

  const income = profile.salary + profile.extra;
  const expenses = (profile.housing || 0) + (profile.bills || 0) + (profile.transport || 0) + (profile.variable || 0) + (profile.debt || 0);
  const surplus = income - expenses;

  const responses = [
    `دخلك الشهري ${formatCurrency(income)}, ومصاريفك ${formatCurrency(expenses)}, وفائضك ${formatCurrency(surplus)}. يمكنك توفير جزء من هذا الفائض لتحقيق أهدافك.`,
    `بناءً على بياناتك، نسبة المصاريف من دخلك ${Math.round((expenses / income) * 100)}%. يمكنك تقليل المصاريف المتغيرة لزيادة الفائض.`,
    `أنت في وضع مالي جيد! استمر في ادخار فائضك الشهري وستحقق أهدافك في الوقت المحدد.`,
    `هل تريد معرفة متى ستحقق هدفك المالي؟ بناءً على فائضك الحالي، يمكنك حساب المدة المتبقية.`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

// ========================
// 10. MORE VIEW
// ========================
function renderMore() {
  const view = document.getElementById('v-more');
  view.innerHTML = `
    <div class="vhead">
      <div>
        <h1>المزيد</h1>
        <p>كل خدمات فجر</p>
      </div>
    </div>

    <div class="more-grid">
      <button class="more-t" onclick="switchView('data')">
        <div class="more-ic" style="background: linear-gradient(135deg, var(--coral), var(--orange));">${ICONS.data}</div>
        <span>بياناتي المالية</span>
      </button>
      <button class="more-t" onclick="switchView('projection')">
        <div class="more-ic" style="background: linear-gradient(135deg, var(--amber), var(--gold));">${ICONS.projection}</div>
        <span>الحاسبة المستقبلية</span>
      </button>
      <button class="more-t" onclick="switchView('zakat')">
        <div class="more-ic" style="background: linear-gradient(135deg, var(--plum), var(--plum-lt));">${ICONS.zakat}</div>
        <span>حاسبة الزكاة</span>
      </button>
      <button class="more-t" onclick="switchView('providers')">
        <div class="more-ic" style="background: linear-gradient(135deg, var(--mint), #00D9A3);">${ICONS.providers}</div>
        <span>سوق فجر</span>
      </button>
    </div>

    <div class="sec" style="margin-top: 24px;">
      <h2>الإعدادات</h2>
    </div>
    <div class="card" style="padding: 6px 16px;">
      <button class="row" style="width: 100%;" onclick="startTour()">
        <div class="row-ic" style="background: rgba(255, 181, 71, .14); color: var(--amber);">🎯</div>
        <div class="row-m">
          <div class="row-t">الجولة الإرشادية</div>
          <div class="row-s">تعرف على الميزات</div>
        </div>
      </button>
      <button class="row" style="width: 100%;" onclick="showAbout()">
        <div class="row-ic" style="background: var(--card-3); color: var(--text-2);">ℹ️</div>
        <div class="row-m">
          <div class="row-t">حول التطبيق</div>
          <div class="row-s">الإصدار 1.0.0</div>
        </div>
      </button>
      <button class="row" style="width: 100%;" onclick="resetApp()">
        <div class="row-ic out">🔄</div>
        <div class="row-m">
          <div class="row-t">إعادة تعيين</div>
          <div class="row-s">حذف جميع البيانات</div>
        </div>
      </button>
    </div>
  `;
}

// ========================
// 11. DATA MANAGEMENT
// ========================
function saveProfile() {
  const data = {
    name: document.getElementById('f-salary').dataset.name || 'المستخدم',
    salary: parseFloat(document.getElementById('f-salary').value) || 0,
    extra: parseFloat(document.getElementById('f-extra').value) || 0,
    housing: parseFloat(document.getElementById('f-housing').value) || 0,
    transport: parseFloat(document.getElementById('f-transport').value) || 0,
    bills: parseFloat(document.getElementById('f-bills').value) || 0,
    debt: parseFloat(document.getElementById('f-debt').value) || 0,
    variable: parseFloat(document.getElementById('f-variable').value) || 0,
    savings: parseFloat(document.getElementById('f-savings').value) || 0,
    investment: parseFloat(document.getElementById('f-investment').value) || 0,
  };

  APP_STATE.userProfile = data;
  localStorage.setItem('userProfile', JSON.stringify(data));
  showToast('✓ تم حفظ بياناتك بنجاح');
  switchView('home');
}

// ========================
// 12. GOAL MANAGEMENT
// ========================
function openGoalModal(template = null) {
  APP_STATE.goalTemplate = template;
  openSheet('sheet-goal');
}

function setMode(mode) {
  APP_STATE.selectedGoalMode = mode;
  document.getElementById('pm-cash').classList.toggle('on', mode === 'cash');
  document.getElementById('pm-fin').classList.toggle('on', mode === 'finance');
}

function saveGoal() {
  const name = document.getElementById('g-name').value;
  const target = parseFloat(document.getElementById('g-target').value);
  const saved = parseFloat(document.getElementById('g-saved').value);
  const deadline = document.getElementById('g-date').value;
  const mode = APP_STATE.selectedGoalMode || 'cash';

  if (!name || !target || !deadline) {
    showToast('❌ يرجى ملء جميع الحقول');
    return;
  }

  const goal = {
    name,
    target,
    saved: saved || 0,
    deadline,
    template: APP_STATE.goalTemplate || 'wedding',
    mode,
    createdAt: new Date().toISOString(),
  };

  APP_STATE.goals.push(goal);
  localStorage.setItem('goals', JSON.stringify(APP_STATE.goals));
  showToast('✓ تم إضافة الهدف بنجاح');
  closeSheet('sheet-goal');
  renderGoals();
}

function deleteGoal(index) {
  if (confirm('هل تريد حذف هذا الهدف؟')) {
    APP_STATE.goals.splice(index, 1);
    localStorage.setItem('goals', JSON.stringify(APP_STATE.goals));
    renderGoals();
    showToast('✓ تم حذف الهدف');
  }
}

// ========================
// 13. MODAL MANAGEMENT
// ========================
function openSheet(id) {
  document.getElementById(id).classList.add('open');
}

function closeSheet(id) {
  document.getElementById(id).classList.remove('open');
  // إعادة تعيين النموذج
  document.getElementById(id).querySelector('.sheet').scrollTop = 0;
}

// ========================
// 14. WIZARD MANAGEMENT
// ========================
function wizNext() {
  APP_STATE.wizardStep = 1;
  updateWizardUI();
}

function wizSkip() {
  completeOnboarding();
}

function wizSaveProfile() {
  const salary = parseFloat(document.getElementById('w-salary').value);
  const extra = parseFloat(document.getElementById('w-extra').value) || 0;
  const housing = parseFloat(document.getElementById('w-housing').value) || 0;
  const bills = parseFloat(document.getElementById('w-bills').value) || 0;
  const transport = parseFloat(document.getElementById('w-transport').value) || 0;
  const variable = parseFloat(document.getElementById('w-variable').value) || 0;

  if (!salary) {
    showToast('❌ يرجى إدخال الراتب');
    return;
  }

  APP_STATE.userProfile = {
    salary,
    extra,
    housing,
    bills,
    transport,
    variable,
    debt: 0,
    savings: 0,
    investment: 0,
  };

  localStorage.setItem('userProfile', JSON.stringify(APP_STATE.userProfile));
  APP_STATE.wizardStep = 2;
  updateWizardUI();
}

function wizSaveGoal() {
  const target = parseFloat(document.getElementById('w-gtarget').value);
  const deadline = document.getElementById('w-gdate').value;

  if (!target || !deadline) {
    showToast('❌ يرجى ملء جميع الحقول');
    return;
  }

  const goal = {
    name: document.getElementById('w-goal-title').textContent,
    target,
    saved: 0,
    deadline,
    template: APP_STATE.goalTemplate || 'wedding',
    mode: 'cash',
    createdAt: new Date().toISOString(),
  };

  APP_STATE.goals.push(goal);
  localStorage.setItem('goals', JSON.stringify(APP_STATE.goals));
  completeOnboarding();
}

function updateWizardUI() {
  // إخفاء جميع الخطوات
  document.querySelectorAll('.wiz-step').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.wiz-dot').forEach(d => d.classList.remove('active', 'done'));

  // عرض الخطوة الحالية
  document.getElementById(`ws${APP_STATE.wizardStep}`).classList.add('active');

  // تحديث نقاط التقدم
  for (let i = 0; i < APP_STATE.wizardStep; i++) {
    document.getElementById(`wd${i}`).classList.add('done');
  }
  document.getElementById(`wd${APP_STATE.wizardStep}`).classList.add('active');
}

function completeOnboarding() {
  localStorage.setItem('onboarded', 'true');
  APP_STATE.isFirstTime = false;
  document.getElementById('wizard-bg').classList.add('hidden');
  renderBottomNav();
  switchView('home');
}

// ========================
// 15. UTILITY FUNCTIONS
// ========================
function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-SA', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(Math.round(amount));
}

function getGoalColor(template) {
  const colors = {
    wedding: '#FF6B4A, var(--orange)',
    car: '#FFB547, var(--gold)',
    house: '#34D9A8, #00D9A3',
    travel: '#7A4A9E, var(--plum-lt)',
    education: '#FF5F6D, var(--rose)',
  };
  return colors[template] || '#FF6B4A, var(--orange)';
}

function getGoalIcon(template) {
  const icons = {
    wedding: '💍',
    car: '🚗',
    house: '🏠',
    travel: '✈️',
    education: '📚',
  };
  return icons[template] || '🎯';
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function toggleBalance() {
  // عرض/إخفاء الرصيد
  alert('تم تبديل رؤية الرصيد');
}

function showMenu() {
  alert('قائمة الخيارات');
}

function startTour() {
  showToast('🎯 جولة الميزات قريبًا');
}

function showAbout() {
  alert('فجر - مديرك المالي الرقمي\nالإصدار 1.0.0\nجميع حقوقك محفوظة © 2024');
}

function resetApp() {
  if (confirm('هل أنت متأكد؟ سيتم حذف جميع بياناتك!')) {
    localStorage.clear();
    location.reload();
  }
}

// ========================
// 16. EVENT LISTENERS
// ========================
function setupEventListeners() {
  // الزر العائم للتثبيت
  if (window.deferredPrompt) {
    document.getElementById('install-fab').style.display = 'flex';
  }

  // زر الإرسال في المحادثة
  const chatSend = document.getElementById('chat-send');
  if (chatSend) {
    chatSend.innerHTML = ICONS.send;
    chatSend.onclick = sendMessage;
  }

  // حفظ الملف الشخصي
  const saveProfile = document.getElementById('save-profile');
  if (saveProfile) {
    saveProfile.onclick = () => {
      saveProfile();
    };
  }

  // حفظ الهدف
  const gSave = document.getElementById('g-save');
  if (gSave) {
    gSave.onclick = saveGoal;
  }

  // حفظ العملية
  const tSave = document.getElementById('t-save');
  if (tSave) {
    tSave.onclick = saveTransaction;
  }

  // مسح المحادثة
  const clearChat = document.getElementById('clear-chat');
  if (clearChat) {
    clearChat.onclick = () => {
      APP_STATE.chatHistory = [];
      localStorage.removeItem('chatHistory');
      renderAdvisor();
      showToast('✓ تم مسح المحادثة');
    };
  }

  // إغلاق الـ Sheets عند النقر على الخلفية
  document.querySelectorAll('.sheet-bg').forEach(bg => {
    bg.addEventListener('click', (e) => {
      if (e.target === bg) {
        bg.classList.remove('open');
      }
    });
  });

  // الضغط على Enter في المحادثة
  const chatIn = document.getElementById('chat-in');
  if (chatIn) {
    chatIn.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
}

function saveTransaction() {
  const type = document.getElementById('t-type').value;
  const cat = document.getElementById('t-cat').value;
  const desc = document.getElementById('t-desc').value;
  const amt = parseFloat(document.getElementById('t-amt').value);
  const date = document.getElementById('t-date').value;

  if (!type || !amt || !date) {
    showToast('❌ يرجى ملء جميع الحقول');
    return;
  }

  const transaction = {
    type,
    cat,
    desc,
    amount: amt,
    date,
  };

  APP_STATE.transactions.push(transaction);
  localStorage.setItem('transactions', JSON.stringify(APP_STATE.transactions));
  showToast('✓ تم إضافة العملية');
  closeSheet('sheet-tx');
}

function doInstall() {
  if (window.deferredPrompt) {
    window.deferredPrompt.prompt();
  }
}

// ========================
// 17. SERVICE WORKER REGISTRATION
// ========================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ========================
// 18. APP SHORTCUTS
// ========================
// يمكنك إضافة اختصارات التطبيق هنا
console.log('فجر - تطبيق مديرك المالي الرقمي');
console.log('تم تحميل جميع الدوال بنجاح ✓');
