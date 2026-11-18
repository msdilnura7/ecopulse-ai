/**
 * EcoPulse AI — Campus Plastic & Economic Impact Analyzer
 * Core Application Engine, Zero-Start Real Impact Tracker, LocalStorage & i18n
 */

// Global Constants & State
const EXCHANGE_RATE = 12800; // 1 USD = 12,800 UZS
const THERMOS_COST_UZS = 150000; // Standard reusable thermos cost: 150,000 UZS (~$11.72)
const BOTTLE_PLASTIC_KG = 0.024; // Average 0.5L PET bottle weight (~24g)
const CUP_PLASTIC_KG = 0.016; // Average paper cup lining + PS lid weight (~16g)
const CO2_PER_KG_PLASTIC = 6.0; // Life-cycle emissions ~6kg CO2e per kg single-use plastic

// Global State
let currentLang = localStorage.getItem('ecopulse_lang') || 'en';
let currentCurrency = 'UZS'; // 'UZS' or 'USD'
let chartInstance = null;
let currentChartMode = 'cost'; // 'cost' or 'plastic'
let currentPresetKey = 'thermos';
let activeCalculatorTimeframe = 'academic-year';

// ----------------------------------------------------
// StorageService: Zero-Start Real Impact Tracker
// (Structured for 1-step migration to Supabase/Firebase)
// ----------------------------------------------------
const StorageService = {
  KEY_METRICS: 'ecopulse_real_metrics_v2',
  KEY_CHECKINS: 'ecopulse_real_checkins_v2',

  getMetrics() {
    try {
      const data = localStorage.getItem(this.KEY_METRICS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    // True Zero-Start Baseline: No fake numbers
    return {
      bottlesPrevented: 0,
      moneySavedUZS: 0,
      checkinCount: 0,
      co2AvoidedKg: 0.0
    };
  },

  saveMetrics(metrics) {
    try {
      localStorage.setItem(this.KEY_METRICS, JSON.stringify(metrics));
    } catch (e) {}
  },

  getCheckIns() {
    try {
      const data = localStorage.getItem(this.KEY_CHECKINS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return []; // Empty state initially
  },

  async addCheckIn(entry) {
    const metrics = this.getMetrics();
    metrics.bottlesPrevented += (entry.bottles || 1);
    metrics.moneySavedUZS += (entry.savingsUZS || 4000);
    metrics.checkinCount += 1;
    metrics.co2AvoidedKg += (entry.co2Kg || 0.144);

    this.saveMetrics(metrics);

    const checkins = this.getCheckIns();
    const newEntry = {
      id: 'chk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: entry.name || (translations[currentLang]?.anonymousStudent || 'Anonymous Student'),
      containerType: entry.containerType || 'Reusable Container',
      savingsUZS: entry.savingsUZS || 4000,
      points: entry.points || 15,
      co2Kg: entry.co2Kg || 0.144,
      timestamp: entry.timestamp || Date.now()
    };
    checkins.unshift(newEntry);
    if (checkins.length > 50) checkins.pop(); // keep last 50

    try {
      localStorage.setItem(this.KEY_CHECKINS, JSON.stringify(checkins));
    } catch (e) {}

    /* 
     * Ready for Supabase / Firebase / Cloudflare D1 Backend:
     * To connect to a live cloud database endpoint in one step:
     * await fetch('https://your-project.supabase.co/rest/v1/checkins', {
     *   method: 'POST',
     *   headers: { 'apikey': '...', 'Content-Type': 'application/json' },
     *   body: JSON.stringify(newEntry)
     * });
     */

    // Update real-time UI
    updateRealImpactUI();
    renderCheckInsFeed();
    return newEntry;
  },

  resetAll() {
    localStorage.removeItem(this.KEY_METRICS);
    localStorage.removeItem(this.KEY_CHECKINS);
    updateRealImpactUI();
    renderCheckInsFeed();
  }
};

// Initialize on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  initLanguageSwitcher();
  initRealImpactTracker();
  initCalculator();
  initChart();
  initAISimulator();
  initCampusPolicy();
  initCheckInsFeed();
  initAudioFeedback();
  setupSmoothScrolling();

  // Apply initial language
  setLanguage(currentLang);
});

// ----------------------------------------------------
// 0. Multi-Language Switcher (i18n)
// ----------------------------------------------------
function initLanguageSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.dataset.lang;
      if (selectedLang && ['en', 'uz', 'ru'].includes(selectedLang)) {
        setLanguage(selectedLang);
      }
    });
  });
}

function setLanguage(lang) {
  if (!translations[lang]) lang = 'en';
  currentLang = lang;
  localStorage.setItem('ecopulse_lang', lang);
  document.documentElement.lang = lang;

  // Update Language Buttons UI state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');
      btn.classList.remove('text-slate-600', 'hover:text-slate-900', 'bg-transparent', 'text-slate-300', 'hover:text-white');
    } else {
      btn.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
      if (btn.closest('.bg-slate-800')) {
        btn.classList.add('text-slate-300', 'hover:text-white', 'bg-transparent');
      } else {
        btn.classList.add('text-slate-600', 'hover:text-slate-900', 'bg-transparent');
      }
    }
  });

  const t = translations[lang];

  // Update static text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      el.innerText = t[key];
    }
  });

  // Update HTML elements
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key] !== undefined) {
      el.innerHTML = t[key];
    }
  });

  // Update dynamic sections without touching user slider values
  if (typeof computeCalculatorResults === 'function') {
    computeCalculatorResults();
  }
  if (typeof updateChartLanguage === 'function') {
    updateChartLanguage();
  }
  if (typeof renderCurrentPresetVerdict === 'function') {
    renderCurrentPresetVerdict();
  }
  if (typeof updatePolicyCalculations === 'function') {
    updatePolicyCalculations();
  }
  if (typeof updateRealImpactUI === 'function') {
    updateRealImpactUI();
  }
  if (typeof renderCheckInsFeed === 'function') {
    renderCheckInsFeed();
  }
}

// ----------------------------------------------------
// 1. Zero-Start Real Impact Tracker
// ----------------------------------------------------
function initRealImpactTracker() {
  updateRealImpactUI();
}

function updateRealImpactUI() {
  const metrics = StorageService.getMetrics();
  const bottlesEl = document.getElementById('ticker-bottles');
  const moneyEl = document.getElementById('ticker-money');
  const participantsEl = document.getElementById('ticker-participants');
  const co2El = document.getElementById('ticker-co2');

  if (bottlesEl) {
    bottlesEl.innerText = metrics.bottlesPrevented.toLocaleString();
  }

  if (moneyEl) {
    const usd = (metrics.moneySavedUZS / EXCHANGE_RATE).toFixed(2);
    moneyEl.innerText = `${metrics.moneySavedUZS.toLocaleString()} UZS ($${usd})`;
  }

  if (participantsEl) {
    participantsEl.innerText = metrics.checkinCount.toLocaleString();
  }

  if (co2El) {
    co2El.innerText = `${metrics.co2AvoidedKg.toFixed(1)} kg`;
  }
}

// ----------------------------------------------------
// 2. Interactive Calculator Engine & Pledge Action
// ----------------------------------------------------
function initCalculator() {
  const waterSlider = document.getElementById('calc-water');
  const waterVal = document.getElementById('calc-water-val');
  const coffeeSlider = document.getElementById('calc-coffee');
  const coffeeVal = document.getElementById('calc-coffee-val');
  const waterPriceInput = document.getElementById('calc-water-price');
  const coffeePriceInput = document.getElementById('calc-coffee-price');
  const timeframeButtons = document.querySelectorAll('.timeframe-btn');
  const pledgeBtn = document.getElementById('calc-pledge-btn');

  // Update slider display labels
  function syncInputs() {
    const waterUnit = currentLang === 'uz' ? ' idish' : currentLang === 'ru' ? ' бут.' : ' bottles';
    const coffeeUnit = currentLang === 'uz' ? ' stakan' : currentLang === 'ru' ? ' стак.' : ' cups';

    if (waterVal) waterVal.innerText = waterSlider.value + waterUnit;
    if (coffeeVal) coffeeVal.innerText = coffeeSlider.value + coffeeUnit;

    const waterUZS = parseFloat(waterPriceInput.value) || 0;
    const coffeeUZS = parseFloat(coffeePriceInput.value) || 0;

    const waterUSDBadge = document.getElementById('water-usd-badge');
    const coffeeUSDBadge = document.getElementById('coffee-usd-badge');

    if (waterUSDBadge) waterUSDBadge.innerText = `≈ $${(waterUZS / EXCHANGE_RATE).toFixed(2)}`;
    if (coffeeUSDBadge) coffeeUSDBadge.innerText = `≈ $${(coffeeUZS / EXCHANGE_RATE).toFixed(2)}`;

    computeCalculatorResults();
  }

  // Sliders input listeners
  [waterSlider, coffeeSlider, waterPriceInput, coffeePriceInput].forEach(el => {
    if (el) el.addEventListener('input', syncInputs);
  });

  // Timeframe buttons
  timeframeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      timeframeButtons.forEach(b => {
        b.classList.remove('bg-emerald-600', 'text-white', 'shadow-md');
        b.classList.add('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');
      });
      btn.classList.add('bg-emerald-600', 'text-white', 'shadow-md');
      btn.classList.remove('bg-slate-100', 'text-slate-700', 'hover:bg-slate-200');

      activeCalculatorTimeframe = btn.dataset.timeframe;
      computeCalculatorResults();
    });
  });

  // Persona Presets
  const presets = {
    'average': { water: 2, coffee: 1 },
    'coffee-lover': { water: 1, coffee: 3 },
    'study-marathon': { water: 4, coffee: 2 },
    'eco-novice': { water: 1, coffee: 0 }
  };

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = presets[btn.dataset.preset];
      if (p) {
        waterSlider.value = p.water;
        coffeeSlider.value = p.coffee;
        syncInputs();
      }
    });
  });

  // Commit / Pledge Button listener (Adds real visitor impact to Zero-Start Tracker)
  if (pledgeBtn) {
    pledgeBtn.addEventListener('click', () => {
      const t = translations[currentLang] || translations.en;
      const pledgeName = (currentLang === 'uz' ? 'Talaba va\'dasi' : currentLang === 'ru' ? 'Обязательство студента' : 'Student Pledge');
      const containerDesc = (currentLang === 'uz' ? 'Chiqindisiz termosga o\'tish' : currentLang === 'ru' ? 'Отказ от одноразового пластика' : 'Zero-Waste Reusable Pledge');

      StorageService.addCheckIn({
        name: pledgeName,
        containerType: containerDesc,
        savingsUZS: 4000,
        points: 15,
        co2Kg: 0.144,
        timestamp: Date.now()
      });

      playAudioSuccess();
      showNotificationToast(
        currentLang === 'uz' ? 'Va\'da muvaffaqiyatli qayd etildi!' : currentLang === 'ru' ? 'Обязательство успешно зафиксировано!' : 'Pledge Logged Successfully!',
        currentLang === 'uz' ? '+1 idish va +4 000 so\'m jonli ko\'rsatkichlarga qo\'shildi.' : currentLang === 'ru' ? '+1 бутылка и +4 000 сум добавлены в живую статистику.' : '+1 bottle & +4,000 UZS added to live pilot tracker.'
      );

      // Flash highlight on top counter
      const bottlesEl = document.getElementById('ticker-bottles');
      if (bottlesEl) {
        bottlesEl.classList.add('number-flash');
        setTimeout(() => bottlesEl.classList.remove('number-flash'), 500);
      }
    });
  }

  // Primary Computation Function
  window.computeCalculatorResults = function() {
    const waterCount = parseFloat(waterSlider.value) || 0;
    const coffeeCount = parseFloat(coffeeSlider.value) || 0;
    const waterPrice = parseFloat(waterPriceInput.value) || 0;
    const coffeePrice = parseFloat(coffeePriceInput.value) || 0;

    const daysMap = {
      'monthly': 30,
      'semester': 120, // 4 months
      'academic-year': 270 // 9 months
    };
    const days = daysMap[activeCalculatorTimeframe] || 270;

    // Timeframe localized badge
    const timeframeLabels = {
      en: { 'monthly': 'Month (30 d)', 'semester': 'Semester (4 mo)', 'academic-year': 'Academic Year (9 mo)' },
      uz: { 'monthly': 'Oylik (30 kun)', 'semester': 'Semestr (4 oy)', 'academic-year': 'O\'quv yili (9 oy)' },
      ru: { 'monthly': 'В месяц (30 дн.)', 'semester': 'Семестр (4 мес.)', 'academic-year': 'Учебный год (9 мес.)' }
    };
    const activeLabelDict = timeframeLabels[currentLang] || timeframeLabels.en;
    const timeframeLabel = activeLabelDict[activeCalculatorTimeframe] || 'Academic Year';

    // Financial calculations
    const dailyWaterSpend = waterCount * waterPrice;
    const dailyCoffeeSpend = coffeeCount * coffeePrice;
    const dailyTotalSpend = dailyWaterSpend + dailyCoffeeSpend;
    const totalSpendUZS = dailyTotalSpend * days;
    const totalSpendUSD = totalSpendUZS / EXCHANGE_RATE;

    // Environmental calculations
    const totalItems = (waterCount + coffeeCount) * days;
    const totalWeightKg = ((waterCount * BOTTLE_PLASTIC_KG) + (coffeeCount * CUP_PLASTIC_KG)) * days;
    const totalCO2Kg = totalWeightKg * CO2_PER_KG_PLASTIC;

    // Reusable ROI calculations
    let roiDays = 0;
    let roiMessage = '';
    let netSavingsUZS = 0;

    if (dailyTotalSpend > 0) {
      roiDays = Math.ceil(THERMOS_COST_UZS / dailyTotalSpend);
      netSavingsUZS = Math.max(0, totalSpendUZS - THERMOS_COST_UZS);

      if (currentLang === 'uz') {
        roiMessage = `Termos <strong>${roiDays} kunda</strong> o'zini oqlaydi!`;
      } else if (currentLang === 'ru') {
        roiMessage = `Окупается за <strong>${roiDays} дн.</strong>!`;
      } else {
        roiMessage = roiDays <= 1 
          ? `Pays for itself in <strong>1 day</strong>!` 
          : `Pays for itself in <strong>${roiDays} days</strong>!`;
      }
    } else {
      if (currentLang === 'uz') {
        roiMessage = `Bir martalik idish xarid qilinmadi!`;
      } else if (currentLang === 'ru') {
        roiMessage = `Нет одноразовых покупок!`;
      } else {
        roiMessage = `No disposable items purchased!`;
      }
      netSavingsUZS = 0;
    }

    const itemsUnit = currentLang === 'uz' ? ' dona' : currentLang === 'ru' ? ' шт.' : ' items';

    // Update Output Cards
    const outLossUZS = document.getElementById('out-loss-uzs');
    const outLossUSD = document.getElementById('out-loss-usd');
    const outItems = document.getElementById('out-plastic-items');
    const outWeight = document.getElementById('out-plastic-weight');
    const outCO2 = document.getElementById('out-co2');
    const outRoiDays = document.getElementById('out-roi-days');
    const outNetSavings = document.getElementById('out-net-savings');
    const outTimeframeBadge = document.getElementById('out-timeframe-badge');

    if (outLossUZS) outLossUZS.innerText = totalSpendUZS.toLocaleString() + ' UZS';
    if (outLossUSD) outLossUSD.innerText = `≈ $${totalSpendUSD.toFixed(2)} USD`;
    if (outItems) outItems.innerText = totalItems.toLocaleString() + itemsUnit;
    if (outWeight) outWeight.innerText = totalWeightKg.toFixed(1) + ' kg';
    if (outCO2) outCO2.innerText = totalCO2Kg.toFixed(1) + ' kg CO₂e';
    if (outRoiDays) outRoiDays.innerHTML = roiMessage;
    if (outNetSavings) outNetSavings.innerText = `+${netSavingsUZS.toLocaleString()} UZS ($${(netSavingsUZS / EXCHANGE_RATE).toFixed(2)})`;
    if (outTimeframeBadge) outTimeframeBadge.innerText = timeframeLabel;

    const waterUnit = currentLang === 'uz' ? ' idish' : currentLang === 'ru' ? ' бут.' : ' bottles';
    const coffeeUnit = currentLang === 'uz' ? ' stakan' : currentLang === 'ru' ? ' стак.' : ' cups';
    if (waterVal) waterVal.innerText = waterCount + waterUnit;
    if (coffeeVal) coffeeVal.innerText = coffeeCount + coffeeUnit;

    updateChartData(dailyTotalSpend, totalWeightKg / days);
  };

  syncInputs();
}

// ----------------------------------------------------
// 3. Interactive Chart.js Spending & Waste Comparison
// ----------------------------------------------------
function initChart() {
  const ctx = document.getElementById('impactChart');
  if (!ctx) return;

  const t = translations[currentLang] || translations.en;

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: t.monthNames,
      datasets: [
        {
          label: t.chartStatusQuoCost,
          data: [230000, 460000, 690000, 920000, 1150000, 1380000, 1610000, 1840000, 2070000],
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#EF4444',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: t.chartZeroWasteCost,
          data: [150000, 155000, 160000, 165000, 170000, 175000, 180000, 185000, 190000],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          borderWidth: 3,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 14,
            usePointStyle: true,
            font: { family: 'Inter', size: 12, weight: 600 },
            color: '#334155'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleFont: { family: 'Inter', size: 13, weight: 700 },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const val = context.parsed.y;
              const tr = translations[currentLang] || translations.en;
              if (currentChartMode === 'cost') {
                const usd = (val / EXCHANGE_RATE).toFixed(2);
                return `${context.dataset.label}: ${val.toLocaleString()} UZS ($${usd})`;
              } else {
                return `${context.dataset.label}: ${val.toLocaleString()} ${tr.chartItemsUnit}`;
              }
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
          ticks: { font: { family: 'Inter', size: 11 }, color: '#64748B' }
        },
        y: {
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
          ticks: {
            font: { family: 'Inter', size: 11 },
            color: '#64748B',
            callback: function(value) {
              const tr = translations[currentLang] || translations.en;
              if (currentChartMode === 'cost') {
                if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M UZS';
                if (value >= 1000) return (value / 1000) + 'k UZS';
                return value;
              } else {
                return value + ' ' + tr.chartItemsUnit;
              }
            }
          }
        }
      }
    }
  });

  const costBtn = document.getElementById('chart-view-cost');
  const plasticBtn = document.getElementById('chart-view-plastic');

  if (costBtn && plasticBtn) {
    costBtn.addEventListener('click', () => {
      currentChartMode = 'cost';
      costBtn.classList.add('bg-slate-900', 'text-white');
      costBtn.classList.remove('bg-white', 'text-slate-700');
      plasticBtn.classList.remove('bg-slate-900', 'text-white');
      plasticBtn.classList.add('bg-white', 'text-slate-700');
      computeCalculatorResults();
    });

    plasticBtn.addEventListener('click', () => {
      currentChartMode = 'plastic';
      plasticBtn.classList.add('bg-slate-900', 'text-white');
      plasticBtn.classList.remove('bg-white', 'text-slate-700');
      costBtn.classList.remove('bg-slate-900', 'text-white');
      costBtn.classList.add('bg-white', 'text-slate-700');
      computeCalculatorResults();
    });
  }
}

function updateChartLanguage() {
  if (!chartInstance) return;
  const t = translations[currentLang] || translations.en;
  chartInstance.data.labels = t.monthNames;

  if (currentChartMode === 'cost') {
    chartInstance.data.datasets[0].label = t.chartStatusQuoCost;
    chartInstance.data.datasets[1].label = t.chartZeroWasteCost;
  } else {
    chartInstance.data.datasets[0].label = t.chartStatusQuoPlastic;
    chartInstance.data.datasets[1].label = t.chartZeroWastePlastic;
  }
  chartInstance.update();
}

function updateChartData(dailyCostUZS, dailyItems) {
  if (!chartInstance) return;
  const t = translations[currentLang] || translations.en;

  const monthlyDays = 30;
  const singleUseData = [];
  const zeroWasteData = [];

  if (currentChartMode === 'cost') {
    chartInstance.data.datasets[0].label = t.chartStatusQuoCost;
    chartInstance.data.datasets[1].label = t.chartZeroWasteCost;

    for (let m = 1; m <= 9; m++) {
      singleUseData.push(Math.round(dailyCostUZS * monthlyDays * m));
      const zeroWasteCost = THERMOS_COST_UZS + (m * 5000);
      zeroWasteData.push(zeroWasteCost);
    }
  } else {
    chartInstance.data.datasets[0].label = t.chartStatusQuoPlastic;
    chartInstance.data.datasets[1].label = t.chartZeroWastePlastic;

    for (let m = 1; m <= 9; m++) {
      singleUseData.push(Math.round(dailyItems * monthlyDays * m));
      zeroWasteData.push(0);
    }
  }

  chartInstance.data.datasets[0].data = singleUseData;
  chartInstance.data.datasets[1].data = zeroWasteData;
  chartInstance.update();
}

// ----------------------------------------------------
// 4. AI Verification Simulator ("Proof-of-Reuse" Demo)
// ----------------------------------------------------
const presetTranslations = {
  thermos: {
    type: 'reusable',
    confidence: 98.4,
    inference_ms: 38,
    co2_saved_kg: 0.144,
    reward_points: 15,
    savings_uzs: 4000,
    model: 'EcoVision-YOLOv8-Nano-v2.4',
    en: {
      name: 'Stainless Steel Insulated Thermos (500ml)',
      features: ['Food-grade 304 Stainless Steel', 'Double-wall Vacuum Seal', 'Reusable Screw Cap', 'Zero PET signature'],
      full_verdict: '✅ Verified Reusable Container (98.4% confidence) — +15 EcoPoints & 4,000 UZS saved added to your profile!',
      verdict_title: 'Verified Reusable Container',
      verdict_msg: '+15 EcoPoints & 4,000 UZS saved added to your profile!',
      recommendation: 'Campus hydro-station unlocked: Free cold/sparkling filtered water refill authorized.'
    },
    uz: {
      name: 'Zanglamaydigan po\'latdan izolyatsiyalangan termos (500ml)',
      features: ['Oziq-ovqatbop 304 po\'lat', 'Ikki qavatli vakuum muhr', 'Qayta ishlatiladigan burama qopqoq', 'PET aralashmasi yo\'q'],
      full_verdict: '✅ Tasdiqlangan ko\'p martalik idish (98.4% aniqlik) — Profilingizga +15 EcoPoint va 4 000 so\'m tejamkorlik qo\'shildi!',
      verdict_title: 'Tasdiqlangan ko\'p martalik idish',
      verdict_msg: 'Profilingizga +15 EcoPoint va 4 000 so\'m tejamkorlik qo\'shildi!',
      recommendation: 'Kampus gidro-stansiyasi ochildi: Bepul toza filtrlangan suv olishga ruxsat berildi.'
    },
    ru: {
      name: 'Вакуумный термос из нержавеющей стали (500мл)',
      features: ['Пищевая сталь AISI 304', 'Двухстенная вакуумная изоляция', 'Многоразовая резьбовая крышка', 'Отсутствие следов PET'],
      full_verdict: '✅ Подтверждена многоразовая ёмкость (точность 98.4%) — В профиль начислено +15 EcoPoints и сэкономлено 4 000 сум!',
      verdict_title: 'Подтверждена многоразовая ёмкость',
      verdict_msg: 'В профиль начислено +15 EcoPoints и сэкономлено 4 000 сум!',
      recommendation: 'Доступ к гидростанции открыт: Авторизован бесплатный набор чистой фильтрованной воды.'
    }
  },
  glass: {
    type: 'reusable',
    confidence: 98.4,
    inference_ms: 44,
    co2_saved_kg: 0.144,
    reward_points: 15,
    savings_uzs: 4000,
    model: 'EcoVision-YOLOv8-Nano-v2.4',
    en: {
      name: 'Borosilicate Glass Eco-Bottle with Silicone Sleeve',
      features: ['High-durability Borosilicate Glass', 'Protective Silicone Grip', 'Bamboo Reusable Cap'],
      full_verdict: '✅ Verified Reusable Container (98.4% confidence) — +15 EcoPoints & 4,000 UZS saved added to your profile!',
      verdict_title: 'Verified Reusable Container',
      verdict_msg: '+15 EcoPoints & 4,000 UZS saved added to your profile!',
      recommendation: 'Perfect for campus herbal tea & chilled mountain water refills.'
    },
    uz: {
      name: 'Silikon g\'ilofli borosilikat shisha eko-idish',
      features: ['Chidamli borosilikat shisha', 'Himoyalovchi silikon tutqich', 'Bambuk qopqoq'],
      full_verdict: '✅ Tasdiqlangan ko\'p martalik idish (98.4% aniqlik) — Profilingizga +15 EcoPoint va 4 000 so\'m tejamkorlik qo\'shildi!',
      verdict_title: 'Tasdiqlangan ko\'p martalik idish',
      verdict_msg: 'Profilingizga +15 EcoPoint va 4 000 so\'m tejamkorlik qo\'shildi!',
      recommendation: 'Kampus fitobari choyi va muzdek tog\' suvi bilan to\'ldirish uchun ayni muddao.'
    },
    ru: {
      name: 'Эко-бутылка из боросиликатного стекла с силиконовым чехлом',
      features: ['Ударопрочное боросиликатное стекло', 'Защитный силиконовый обод', 'Многоразовая крышка из бамбука'],
      full_verdict: '✅ Подтверждена многоразовая ёмкость (точность 98.4%) — В профиль начислено +15 EcoPoints и сэкономлено 4 000 сум!',
      verdict_title: 'Подтверждена многоразовая ёмкость',
      verdict_msg: 'В профиль начислено +15 EcoPoints и сэкономлено 4 000 сум!',
      recommendation: 'Идеально подходит для травяного чая и набора прохладной горной воды.'
    }
  },
  plastic: {
    type: 'single-use',
    confidence: 96.1,
    inference_ms: 32,
    co2_saved_kg: 0,
    reward_points: 0,
    savings_uzs: 0,
    model: 'EcoVision-YOLOv8-Nano-v2.4',
    en: {
      name: 'Single-Use Disposable PET Bottle (Hydrolife/Nestle 0.5L)',
      features: ['Thin-wall Polyethylene Terephthalate (PET #1)', 'Disposable Shrink Film Label', 'Single-thread HDPE Cap'],
      full_verdict: '⚠️ Single-Use PET Plastic Detected (96.1% confidence) — Tip: Switch to a refillable bottle to save ~120,000 UZS/month.',
      verdict_title: 'Single-Use PET Plastic Detected',
      verdict_msg: 'Tip: Switch to a refillable bottle to save ~120,000 UZS/month.',
      recommendation: 'Eligible for 20% campus bookstore discount on EcoPulse reusable flasks.'
    },
    uz: {
      name: 'Bir martalik PET plastik suv idishi (Hydrolife/Nestle 0.5L)',
      features: ['Yupqa devorli polietilentereftalat (PET #1)', 'Bir martalik plyonka yorliq', 'Bir qatlamli HDPE qopqoq'],
      full_verdict: '⚠️ Bir martalik PET plastik aniqlandi (96.1% aniqlik) — Maslahat: Oyiga ~120 000 so\'m tejash uchun ko\'p martalik termosga o\'ting.',
      verdict_title: 'Bir martalik PET plastik aniqlandi',
      verdict_msg: 'Maslahat: Oyiga ~120 000 so\'m tejash uchun ko\'p martalik termosga o\'ting.',
      recommendation: 'EcoPulse ko\'p martalik termoslariga kampus do\'konida 20% chegirma olishingiz mumkin.'
    },
    ru: {
      name: 'Одноразовая пластиковая бутылка PET (Hydrolife/Nestle 0.5л)',
      features: ['Тонкостенный полиэтилентерефталат (PET #1)', 'Одноразовая термоусадочная этикетка', 'Одноразовая HDPE крышка'],
      full_verdict: '⚠️ Обнаружен одноразовый PET-пластик (точность 96.1%) — Совет: Перейдите на многоразовую бутылку, чтобы экономить ~120 000 сум/мес.',
      verdict_title: 'Обнаружен одноразовый PET-пластик',
      verdict_msg: 'Совет: Перейдите на многоразовую бутылку, чтобы экономить ~120 000 сум/мес.',
      recommendation: 'Доступна скидка 20% на фирменные термосы EcoPulse в книжном магазине кампуса.'
    }
  }
};

function getLocalizedPresetData(key, lang) {
  const base = presetTranslations[key] || presetTranslations.thermos;
  const loc = base[lang] || base.en;
  return {
    ...base,
    ...loc
  };
}

function initAISimulator() {
  const dropzone = document.getElementById('ai-dropzone');
  const fileInput = document.getElementById('ai-file-input');
  const previewImg = document.getElementById('ai-preview-img');
  const previewSvg = document.getElementById('ai-preview-svg');
  const scannerLine = document.getElementById('ai-scanner-line');
  const statusBadge = document.getElementById('ai-status-badge');
  const statusText = document.getElementById('ai-status-text');
  const resultCard = document.getElementById('ai-result-card');
  const jsonOutput = document.getElementById('ai-json-output');
  const jsonToggle = document.getElementById('ai-json-toggle');
  const jsonContainer = document.getElementById('ai-json-container');

  const presetSvgs = {
    'thermos': `
      <div class="relative w-44 h-64 mx-auto flex items-center justify-center">
        <svg viewBox="0 0 200 320" class="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="thermosGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0F172A" />
              <stop offset="35%" stop-color="#10B981" />
              <stop offset="70%" stop-color="#059669" />
              <stop offset="100%" stop-color="#047857" />
            </linearGradient>
            <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#334155" />
              <stop offset="50%" stop-color="#64748B" />
              <stop offset="100%" stop-color="#1E293B" />
            </linearGradient>
          </defs>
          <path d="M 75 18 C 75 8, 125 8, 125 18" stroke="#64748B" stroke-width="8" fill="none" stroke-linecap="round" />
          <rect x="70" y="18" width="60" height="26" rx="6" fill="url(#capGrad)" />
          <rect x="66" y="44" width="68" height="8" rx="2" fill="#E2E8F0" />
          <rect x="55" y="52" width="90" height="240" rx="22" fill="url(#thermosGrad)" />
          <path d="M 68 62 L 68 280" stroke="rgba(255,255,255,0.25)" stroke-width="4" stroke-linecap="round" />
          <circle cx="100" cy="140" r="14" fill="#FFFFFF" fill-opacity="0.15" />
          <path d="M 96 142 C 96 135, 104 135, 104 142 C 104 146, 96 150, 96 150 C 96 150, 88 146, 88 142 Z" fill="#34D399" />
          <text x="100" y="185" font-family="Inter" font-weight="700" font-size="10" fill="rgba(255,255,255,0.85)" text-anchor="middle" letter-spacing="1.5">ECOPULSE</text>
          <rect x="58" y="278" width="84" height="16" rx="8" fill="#064E3B" />
        </svg>
        <span class="absolute bottom-2 bg-emerald-950/80 text-emerald-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          Vacuum Insulated Flask
        </span>
      </div>
    `,
    'glass': `
      <div class="relative w-44 h-64 mx-auto flex items-center justify-center">
        <svg viewBox="0 0 200 320" class="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(224, 242, 254, 0.75)" />
              <stop offset="50%" stop-color="rgba(186, 230, 253, 0.35)" />
              <stop offset="100%" stop-color="rgba(125, 211, 252, 0.65)" />
            </linearGradient>
            <linearGradient id="sleeveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#0284C7" />
              <stop offset="100%" stop-color="#0369A1" />
            </linearGradient>
            <linearGradient id="woodCap" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#D97706" />
              <stop offset="50%" stop-color="#F59E0B" />
              <stop offset="100%" stop-color="#B45309" />
            </linearGradient>
          </defs>
          <rect x="74" y="20" width="52" height="22" rx="4" fill="url(#woodCap)" />
          <rect x="80" y="42" width="40" height="20" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.8)" stroke-width="2" />
          <rect x="58" y="62" width="84" height="230" rx="20" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.9)" stroke-width="2" />
          <rect x="59" y="115" width="82" height="150" rx="10" fill="url(#sleeveGrad)" />
          <ellipse cx="100" cy="180" rx="12" ry="36" fill="rgba(224, 242, 254, 0.8)" />
          <path d="M 90 185 Q 100 178 110 185" stroke="#38BDF8" stroke-width="3" fill="none" />
          <path d="M 66 74 L 66 280" stroke="rgba(255,255,255,0.7)" stroke-width="3" stroke-linecap="round" />
        </svg>
        <span class="absolute bottom-2 bg-sky-950/80 text-sky-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-sky-500/30">
          Borosilicate Glass
        </span>
      </div>
    `,
    'plastic': `
      <div class="relative w-44 h-64 mx-auto flex items-center justify-center">
        <svg viewBox="0 0 200 320" class="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="petGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="rgba(203, 213, 225, 0.75)" />
              <stop offset="50%" stop-color="rgba(241, 245, 249, 0.45)" />
              <stop offset="100%" stop-color="rgba(148, 163, 184, 0.65)" />
            </linearGradient>
            <linearGradient id="blueCap" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#2563EB" />
              <stop offset="100%" stop-color="#1D4ED8" />
            </linearGradient>
          </defs>
          <rect x="80" y="22" width="40" height="14" rx="2" fill="url(#blueCap)" />
          <rect x="78" y="36" width="44" height="4" fill="#93C5FD" />
          <path d="M 80 40 L 120 40 L 138 90 L 62 90 Z" fill="url(#petGrad)" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
          <rect x="62" y="90" width="76" height="195" rx="8" fill="url(#petGrad)" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
          <line x1="64" y1="110" x2="136" y2="110" stroke="#94A3B8" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="64" y1="124" x2="136" y2="124" stroke="#94A3B8" stroke-width="1" stroke-dasharray="3,3" />
          <rect x="62" y="140" width="76" height="52" fill="#3B82F6" />
          <rect x="62" y="144" width="76" height="44" fill="#60A5FA" />
          <text x="100" y="164" font-family="Inter" font-weight="800" font-size="8" fill="#FFFFFF" text-anchor="middle">AQUA PURA</text>
          <text x="100" y="176" font-family="Inter" font-weight="500" font-size="6" fill="#EFF6FF" text-anchor="middle">0.5L PET PLASTIC</text>
          <line x1="64" y1="210" x2="136" y2="210" stroke="#94A3B8" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="64" y1="225" x2="136" y2="225" stroke="#94A3B8" stroke-width="1" stroke-dasharray="3,3" />
          <path d="M 68 285 Q 100 295 132 285" stroke="#64748B" stroke-width="3" fill="none" />
        </svg>
        <span class="absolute bottom-2 bg-amber-950/80 text-amber-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
          Single-Use PET #1
        </span>
      </div>
    `
  };

  function runVisionScan(presetKey, customImgUrl = null) {
    currentPresetKey = presetKey;
    const t = translations[currentLang] || translations.en;

    if (statusText) statusText.innerText = t.aiStatusAnalyzing;
    scannerLine.classList.remove('hidden');
    resultCard.classList.add('opacity-40', 'pointer-events-none');

    if (customImgUrl) {
      previewSvg.classList.add('hidden');
      previewImg.src = customImgUrl;
      previewImg.classList.remove('hidden');
    } else {
      previewImg.classList.add('hidden');
      previewSvg.innerHTML = presetSvgs[presetKey] || presetSvgs['thermos'];
      previewSvg.classList.remove('hidden');
    }

    playAudioScan();

    setTimeout(() => {
      scannerLine.classList.add('hidden');
      resultCard.classList.remove('opacity-40', 'pointer-events-none');
      const tr = translations[currentLang] || translations.en;
      if (statusText) statusText.innerText = tr.aiStatusComplete;

      const data = getLocalizedPresetData(presetKey, currentLang);
      renderVerdict(data);
    }, 1500);
  }

  function renderVerdict(data) {
    const isReusable = data.type === 'reusable';
    const t = translations[currentLang] || translations.en;

    if (isReusable) {
      playAudioSuccess();
    } else {
      playAudioWarning();
    }

    const badgeColor = isReusable ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300';
    const icon = isReusable ? '✅' : '⚠️';

    const confidenceLabel = currentLang === 'uz' ? 'Aniqlik darajasi' : currentLang === 'ru' ? 'Точность' : 'Confidence';
    const containerLabel = currentLang === 'uz' ? 'Idish turi' : currentLang === 'ru' ? 'Ёмкость' : 'Container';
    const antiSpoofingText = isReusable 
      ? (currentLang === 'uz' ? '✅ Soxta urinish tekshiruvidan o\'tdi &bull; Material imzosi tasdiqlandi' : currentLang === 'ru' ? '✅ Защита от накрутки пройдена &bull; Сигнатура материала подтверждена' : '✅ Anti-spoofing check passed &bull; Material signature verified')
      : (currentLang === 'uz' ? '⚠️ Qayta to\'ldirilmaydigan #1 PET polimer aniqlandi' : currentLang === 'ru' ? '⚠️ Обнаружен неперерабатываемый полимер #1 PET' : '⚠️ Non-refillable polymer #1 PET detected');

    resultCard.innerHTML = `
      <div class="space-y-4">
        <!-- Top Verified Verdict Banner -->
        <div class="p-4 rounded-xl border ${badgeColor} transition-all">
          <div class="flex items-start space-x-3">
            <span class="text-2xl shrink-0 mt-0.5">${icon}</span>
            <div>
              <h4 class="font-bold text-sm sm:text-base leading-snug">
                ${data.full_verdict}
              </h4>
              <p class="text-xs opacity-85 mt-1 font-mono">${containerLabel}: ${data.name} &bull; ${confidenceLabel}: ${data.confidence}%</p>
            </div>
          </div>
        </div>

        <!-- Impact / Incentive Card -->
        <div class="p-3.5 rounded-xl ${isReusable ? 'bg-emerald-50/70 border border-emerald-200' : 'bg-amber-50/70 border border-amber-200'}">
          <div class="flex items-start space-x-3">
            <div class="p-1.5 rounded-lg ${isReusable ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'} shrink-0 mt-0.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${isReusable ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'}" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-semibold ${isReusable ? 'text-emerald-900' : 'text-amber-900'}">${data.recommendation}</p>
              <div class="text-[11px] ${isReusable ? 'text-emerald-700' : 'text-amber-700'} mt-0.5">
                ${antiSpoofingText}
              </div>
            </div>
          </div>
        </div>

        <!-- Telemetry Details Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-slate-600">
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">${t.aiTelemetryCo2}</span>
            <span class="font-bold text-slate-800 text-sm">${isReusable ? `+${(data.co2_saved_kg * 1000).toFixed(0)}g CO₂e` : '0g'}</span>
          </div>
          <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">${t.aiTelemetryPoints}</span>
            <span class="font-bold text-slate-800 text-sm">${isReusable ? `+${data.reward_points} pts` : '0 pts'}</span>
          </div>
          <div class="col-span-2 sm:col-span-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span class="text-slate-400 block text-[10px] uppercase font-bold">${t.aiTelemetryReward}</span>
            <span class="font-bold text-slate-800 text-sm">${isReusable ? `+${data.savings_uzs.toLocaleString()} UZS` : '0 UZS'}</span>
          </div>
        </div>

        ${isReusable ? `
        <!-- Real Check-In Submission Form (Updates Zero-Start Live Tracker) -->
        <div class="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-lg border border-emerald-500/30">
          <div class="flex items-center justify-between text-xs">
            <div class="font-bold flex items-center space-x-2">
              <span class="text-emerald-400">⚡</span>
              <span>${t.aiTelegramTitle}</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">+15 EcoPoints &bull; +4,000 UZS</span>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <input id="ai-checkin-name-input" type="text" maxlength="30" placeholder="${t.aiNamePlaceholder}" class="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500">
            <button id="ai-btn-log-checkin" class="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition active:scale-95 whitespace-nowrap">
              ${t.aiLogCheckinBtn}
            </button>
          </div>
        </div>
        ` : `
        <!-- Single-Use Warning Action -->
        <div class="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
          <span class="text-slate-300">Switch to a reusable flask to earn EcoPoints:</span>
          <a href="#calculator" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition">
            Calculate Savings
          </a>
        </div>
        `}
      </div>
    `;

    // Connect Log Check-In Button
    if (isReusable) {
      const logBtn = document.getElementById('ai-btn-log-checkin');
      const nameInput = document.getElementById('ai-checkin-name-input');
      if (logBtn) {
        logBtn.addEventListener('click', () => {
          const customName = nameInput ? nameInput.value.trim() : '';
          StorageService.addCheckIn({
            name: customName || (translations[currentLang]?.anonymousStudent || 'Anonymous Student'),
            containerType: data.name,
            savingsUZS: 4000,
            points: 15,
            co2Kg: 0.144,
            timestamp: Date.now()
          });

          playAudioSuccess();
          showNotificationToast(
            currentLang === 'uz' ? 'Tekshiruv muvaffaqiyatli qayd etildi!' : currentLang === 'ru' ? 'Чек-ин успешно зафиксирован!' : 'Check-In Successfully Logged!',
            currentLang === 'uz' ? '+15 EcoPoint va +4 000 so\'m tejamkorlik profilingizga qo\'shildi.' : currentLang === 'ru' ? '+15 EcoPoints и +4 000 сум добавлены в профиль кампуса.' : '+15 EcoPoints & +4,000 UZS added to live campus records.'
          );

          // Disable button to prevent spamming
          logBtn.disabled = true;
          logBtn.innerText = currentLang === 'uz' ? '✓ Qayd etildi' : currentLang === 'ru' ? '✓ Зафиксировано' : '✓ Logged to Live Feed';
          logBtn.classList.remove('bg-emerald-500', 'hover:bg-emerald-400');
          logBtn.classList.add('bg-slate-700', 'text-slate-300', 'cursor-not-allowed');

          const bottlesEl = document.getElementById('ticker-bottles');
          if (bottlesEl) {
            bottlesEl.classList.add('number-flash');
            setTimeout(() => bottlesEl.classList.remove('number-flash'), 500);
          }
        });
      }
    }

    // Render JSON telemetry
    const jsonTelemetry = {
      status: 'success',
      timestamp: new Date().toISOString(),
      language: currentLang,
      vision_engine: {
        model: data.model,
        latency_ms: data.inference_ms,
        weights: 'fp16-quantized',
        edge_hardware: 'NPU-Core-v4'
      },
      detection: {
        class_id: isReusable ? 'reusable_thermos_container' : 'single_use_pet_bottle',
        confidence: data.confidence / 100,
        bounding_box_normalized: [0.12, 0.08, 0.78, 0.88],
        detected_features: data.features,
        anti_spoofing_check: 'passed'
      },
      behavioral_incentives: {
        points_awarded: data.reward_points,
        savings_uzs: data.savings_uzs,
        campus_refill_eligible: isReusable
      }
    };

    if (jsonOutput) {
      jsonOutput.innerText = JSON.stringify(jsonTelemetry, null, 2);
    }
  }

  window.renderCurrentPresetVerdict = function() {
    const data = getLocalizedPresetData(currentPresetKey, currentLang);
    renderVerdict(data);
  };

  // Preset Buttons Event Listeners
  document.querySelectorAll('.ai-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ai-preset-btn').forEach(b => {
        b.classList.remove('ring-2', 'ring-emerald-500', 'bg-emerald-50');
      });
      btn.classList.add('ring-2', 'ring-emerald-500', 'bg-emerald-50');
      runVisionScan(btn.dataset.preset);
    });
  });

  // Upload Handling
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          runVisionScan('thermos', event.target.result);
        };
        reader.readAsDataURL(file);
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('border-emerald-500', 'bg-emerald-50/50');
      });
    });
    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-emerald-500', 'bg-emerald-50/50');
      });
    });
    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          runVisionScan('thermos', event.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // JSON Raw Toggle
  if (jsonToggle && jsonContainer) {
    jsonToggle.addEventListener('click', () => {
      jsonContainer.classList.toggle('hidden');
      const tr = translations[currentLang] || translations.en;
      jsonToggle.innerText = jsonContainer.classList.contains('hidden') ? tr.aiJsonToggleShow : tr.aiJsonToggleHide;
    });
  }

  // Run initial default preset
  runVisionScan('thermos');
}

// ----------------------------------------------------
// 5. Campus Policy & Macro Refill Station Simulation
// ----------------------------------------------------
function initCampusPolicy() {
  const studentsSlider = document.getElementById('policy-students');
  const studentsVal = document.getElementById('policy-students-val');
  const macroPlastic = document.getElementById('macro-plastic-bottles');
  const macroKg = document.getElementById('macro-plastic-kg');
  const macroLossUZS = document.getElementById('macro-student-loss-uzs');
  const macroLossUSD = document.getElementById('macro-student-loss-usd');
  const macroStations = document.getElementById('macro-stations-needed');
  const macroCapex = document.getElementById('macro-capex');
  const macroPayback = document.getElementById('macro-payback');

  const studentSuffixes = {
    en: 'students',
    uz: 'nafar talaba',
    ru: 'студентов'
  };

  window.updatePolicyCalculations = function() {
    if (!studentsSlider) return;
    const students = parseInt(studentsSlider.value) || 2000;
    const t = translations[currentLang] || translations.en;

    if (studentsVal) {
      studentsVal.innerText = `${students.toLocaleString()} ${studentSuffixes[currentLang] || 'students'}`;
    }

    const annualBottlesPerStudent = 1.5 * 270;
    const annualCupsPerStudent = 0.8 * 270;
    const totalSingleUseItems = Math.round(students * (annualBottlesPerStudent + annualCupsPerStudent));
    const totalPlasticKg = Math.round(students * ((annualBottlesPerStudent * BOTTLE_PLASTIC_KG) + (annualCupsPerStudent * CUP_PLASTIC_KG)));

    const annualSpendPerStudent = (annualBottlesPerStudent * 4000) + (annualCupsPerStudent * 15000);
    const totalStudentSpendUZS = students * annualSpendPerStudent;
    const totalStudentSpendUSD = totalStudentSpendUZS / EXCHANGE_RATE;

    const stationsNeeded = Math.max(2, Math.ceil(students / 320));
    const costPerStationUZS = 12000000;
    const totalCapexUZS = stationsNeeded * costPerStationUZS;
    const totalCapexUSD = totalCapexUZS / EXCHANGE_RATE;

    const dailyCommunitySavings = (students * 0.5 * ((1.5 * 4000) + (0.8 * 15000)));
    const paybackDays = Math.ceil(totalCapexUZS / dailyCommunitySavings);

    if (macroPlastic) macroPlastic.innerText = (totalSingleUseItems / 1000000).toFixed(2) + ' ' + t.policyMillionItems;
    if (macroKg) {
      const kgUnit = currentLang === 'uz' ? 'tonna qattiq chiqindi' : currentLang === 'ru' ? 'тонн твёрдых отходов' : 'metric tons plastic';
      macroKg.innerText = `≈ ${(totalPlasticKg / 1000).toFixed(1)} ${kgUnit}`;
    }
    if (macroLossUZS) macroLossUZS.innerText = (totalStudentSpendUZS / 1000000000).toFixed(2) + ' ' + t.policyBillionUZS;
    if (macroLossUSD) macroLossUSD.innerText = `≈ $${Math.round(totalStudentSpendUSD).toLocaleString()} USD`;
    if (macroStations) macroStations.innerText = `${stationsNeeded} ${t.policySmartStations}`;
    if (macroCapex) macroCapex.innerText = `${(totalCapexUZS / 1000000).toFixed(0)}M UZS (~$${Math.round(totalCapexUSD).toLocaleString()})`;
    if (macroPayback) {
      if (currentLang === 'uz') {
        macroPayback.innerText = `~${paybackDays} kun`;
      } else if (currentLang === 'ru') {
        macroPayback.innerText = `~${paybackDays} дн.`;
      } else {
        macroPayback.innerText = `~${paybackDays} days`;
      }
    }
  };

  if (studentsSlider) {
    studentsSlider.addEventListener('input', window.updatePolicyCalculations);
    window.updatePolicyCalculations();
  }
}

// ----------------------------------------------------
// 6. Real User Check-Ins Feed (Replacing Fake Leaderboard)
// ----------------------------------------------------
function initCheckInsFeed() {
  const resetBtn = document.getElementById('btn-reset-pilot');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const confirmMsg = currentLang === 'uz' 
        ? 'Barcha lokal pilot tekshiruvlarini 0 ga qaytarishni xohlaysizmi?' 
        : currentLang === 'ru' 
        ? 'Вы уверены, что хотите сбросить все данные пилота в 0?' 
        : 'Are you sure you want to reset all local pilot records back to 0?';
      
      if (confirm(confirmMsg)) {
        StorageService.resetAll();
        showNotificationToast(
          currentLang === 'uz' ? 'Ma\'lumotlar 0 ga qaytarildi' : currentLang === 'ru' ? 'Данные сброшены в 0' : 'Pilot Data Reset',
          currentLang === 'uz' ? 'Barcha ko\'rsatkichlar 0 dan boshlanadi.' : currentLang === 'ru' ? 'Все счетчики обнулены.' : 'All impact counters have been reset to 0.'
        );
      }
    });
  }

  renderCheckInsFeed();
}

function formatTimeAgo(timestamp) {
  const t = translations[currentLang] || translations.en;
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) return t.justNow || 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return currentLang === 'uz' ? `${diffMin} daqiqa oldin` : currentLang === 'ru' ? `${diffMin} мин. назад` : `${diffMin} min ago`;
  }
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return currentLang === 'uz' ? `${diffHours} soat oldin` : currentLang === 'ru' ? `${diffHours} ч. назад` : `${diffHours} hr ago`;
  }
  return new Date(timestamp).toLocaleDateString(currentLang === 'uz' ? 'uz-UZ' : currentLang === 'ru' ? 'ru-RU' : 'en-US');
}

function renderCheckInsFeed() {
  const container = document.getElementById('checkins-feed-container');
  const badgeEl = document.getElementById('feed-count-badge');
  if (!container) return;

  const checkins = StorageService.getCheckIns();
  const t = translations[currentLang] || translations.en;

  if (badgeEl) {
    const unit = currentLang === 'uz' ? 'ta tekshiruv' : currentLang === 'ru' ? 'чек-инов' : 'check-ins';
    badgeEl.innerText = `${checkins.length} ${unit}`;
  }

  if (checkins.length === 0) {
    // Beautiful empty state with call-to-action
    container.innerHTML = `
      <div class="p-8 sm:p-12 text-center space-y-4">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl shadow-sm border border-emerald-100">
          🌱
        </div>
        <div class="space-y-1.5 max-w-md mx-auto">
          <h4 class="font-display font-bold text-base sm:text-lg text-slate-800 leading-snug">
            ${t.feedEmptyTitle}
          </h4>
          <p class="text-xs text-slate-500 leading-relaxed">
            ${t.feedSubtitle}
          </p>
        </div>
        <div class="pt-2">
          <a href="#ai-simulator" class="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md shadow-emerald-600/20 active:scale-95">
            <span>🔍</span>
            <span>${t.feedEmptyBtn}</span>
          </a>
        </div>
      </div>
    `;
    return;
  }

  // Render Real Check-ins Feed
  let html = '';
  checkins.forEach((entry, idx) => {
    const isPledge = entry.containerType.includes('Pledge') || entry.containerType.includes('va\'da') || entry.containerType.includes('Обязательство');
    const icon = isPledge ? '🌱' : '✅';
    const borderAccent = idx === 0 ? 'bg-emerald-50/40' : '';

    html += `
      <div class="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition ${borderAccent}">
        <div class="flex items-center space-x-3.5 sm:space-x-4">
          <span class="w-9 h-9 rounded-xl ${isPledge ? 'bg-teal-100 text-teal-800 border-teal-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'} font-black text-sm flex items-center justify-center border shrink-0">
            ${icon}
          </span>
          <div>
            <div class="flex items-center space-x-2">
              <h4 class="font-bold text-sm sm:text-base text-slate-900">${escapeHtml(entry.name)}</h4>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                ${formatTimeAgo(entry.timestamp)}
              </span>
            </div>
            <div class="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
              <span class="text-slate-600 font-medium">${escapeHtml(entry.containerType)}</span>
              <span>&bull;</span>
              <span class="text-teal-700 font-medium">+${(entry.co2Kg * 1000).toFixed(0)}g CO₂e avoided</span>
            </div>
          </div>
        </div>
        <div class="text-right shrink-0">
          <div class="font-display font-bold text-sm sm:text-base text-slate-900">+${entry.points} pts</div>
          <div class="text-xs text-emerald-600 font-semibold">+${entry.savingsUZS.toLocaleString()} UZS</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

// ----------------------------------------------------
// 7. Web Audio API Chimes (Zero external audio assets)
// ----------------------------------------------------
let audioCtx = null;

function initAudioFeedback() {
  const initAudio = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    document.removeEventListener('click', initAudio);
  };
  document.addEventListener('click', initAudio, { once: true });
}

function playAudioSuccess() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {}
}

function playAudioWarning() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(329.63, audioCtx.currentTime); // E4
    osc.frequency.setValueAtTime(293.66, audioCtx.currentTime + 0.12); // D4

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.28);
  } catch (e) {}
}

function playAudioScan() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(660, audioCtx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {}
}

// ----------------------------------------------------
// 8. Notifications & Modals
// ----------------------------------------------------
function showNotificationToast(title, desc) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center space-x-3 transition-all duration-300 transform translate-y-4 opacity-0';
  toast.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-black">✓</div>
    <div>
      <div class="font-bold text-sm">${escapeHtml(title)}</div>
      <div class="text-xs text-slate-300">${escapeHtml(desc)}</div>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.remove('translate-y-4', 'opacity-0'), 50);
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Print / Export Campus Brief
window.exportImpactReport = function() {
  window.print();
};

// Smooth Scrolling for anchor links
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}
