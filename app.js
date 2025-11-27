// app.js – AmericaPlanning Income-for-Life Plan
// Works with the HTML you pasted (step nav, saving, asset summary, basic plan calcs)

(function () {
  const STORAGE_KEYS = {
    CLIENT: "ap_ifl_client_data",
    INPUTS: "ap_ifl_plan_inputs",
  };

  const state = {
    client: null,
    inputs: null,
    charts: {
      np: null,
      sp: null,
      gp: null,
    },
  };

  // ---------- Utility helpers ----------

  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function toNumber(val) {
    const n = parseFloat(String(val).replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  }

  function fmtCurrency(val) {
    const n = toNumber(val);
    return n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  }

  function fmtPercent(val) {
    const n = toNumber(val);
    return `${n.toFixed(1)}%`;
  }

  function showStatus(el, message) {
    if (!el) return;
    el.textContent = message;
    el.classList.add("ap-save-status-visible");
    setTimeout(() => {
      el.classList.remove("ap-save-status-visible");
    }, 2500);
  }

  // ---------- Local storage ----------

  function saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("LocalStorage save error", e);
    }
  }

  function loadFromStorage(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("LocalStorage load error", e);
      return null;
    }
  }

  // ---------- Step navigation ----------

  function initStepNavigation() {
    const stepButtons = $all(".ap-step-btn");
    const cards = $all(".ap-card");

    function activateStep(stepName) {
      // Buttons
      stepButtons.forEach((btn) => {
        if (btn.dataset.step === stepName) {
          btn.classList.add("ap-step-btn-active");
        } else {
          btn.classList.remove("ap-step-btn-active");
        }
      });

      // Sections
      cards.forEach((card) => {
        if (card.id === `step-${stepName}`) {
          card.classList.remove("ap-card-hidden");
        } else {
          card.classList.add("ap-card-hidden");
        }
      });
    }

    stepButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const stepName = btn.dataset.step;
        if (stepName) activateStep(stepName);
      });
    });

    // Default to first (client)
    activateStep("client");
  }

  // ---------- Client form (Step 1) ----------

  function readClientForm() {
    const ids = [
      "clientName",
      "spouseName",
      "advisorName",
      "planDate",

      "primaryValue",
      "primaryMortgage",
      "secondaryValue",
      "secondaryMortgage",

      "inv1Balance",
      "inv2Balance",
      "inv3Balance",
      "inv4Balance",
      "inv5Balance",

      "sav1Balance",
      "sav2Balance",
      "sav3Balance",
      "sav4Balance",
      "sav5Balance",

      "ann1Balance",
      "ann2Balance",
      "ann3Balance",
      "ann4Balance",
      "ann5Balance",
    ];

    const data = {};
    ids.forEach((id) => {
      const el = $(`#${id}`);
      if (!el) return;
      if (el.type === "number") {
        data[id] = toNumber(el.value);
      } else {
        data[id] = el.value || "";
      }
    });
    return data;
  }

  function fillClientForm(data) {
    if (!data) return;
    Object.keys(data).forEach((id) => {
      const el = $(`#${id}`);
      if (!el) return;
      if (el.type === "number") {
        el.value = data[id] || data[id] === 0 ? data[id] : "";
      } else {
        el.value = data[id] || "";
      }
    });
  }

  function computeAssetSummary(client) {
    if (!client) return {
      primaryValue: 0,
      primaryMortgage: 0,
      secondaryValue: 0,
      secondaryMortgage: 0,
      primaryEquity: 0,
      secondaryEquity: 0,
      totalRealEstateEquity: 0,
      investments: { total: 0, count: 0 },
      savings: { total: 0, count: 0 },
      annuities: { total: 0, count: 0 },
      totalFinancial: 0,
      totalAssets: 0,
    };

    const primaryValue = toNumber(client.primaryValue);
    const primaryMortgage = toNumber(client.primaryMortgage);
    const secondaryValue = toNumber(client.secondaryValue);
    const secondaryMortgage = toNumber(client.secondaryMortgage);

    const primaryEquity = Math.max(0, primaryValue - primaryMortgage);
    const secondaryEquity = Math.max(0, secondaryValue - secondaryMortgage);
    const totalRealEstateEquity = primaryEquity + secondaryEquity;

    const invIds = ["inv1Balance", "inv2Balance", "inv3Balance", "inv4Balance", "inv5Balance"];
    const savIds = ["sav1Balance", "sav2Balance", "sav3Balance", "sav4Balance", "sav5Balance"];
    const annIds = ["ann1Balance", "ann2Balance", "ann3Balance", "ann4Balance", "ann5Balance"];

    function sumCategory(ids) {
      let total = 0;
      let count = 0;
      ids.forEach((id) => {
        const val = toNumber(client[id]);
        if (val > 0) {
          total += val;
          count += 1;
        }
      });
      return { total, count };
    }

    const investments = sumCategory(invIds);
    const savings = sumCategory(savIds);
    const annuities = sumCategory(annIds);

    const totalFinancial = investments.total + savings.total + annuities.total;
    const totalAssets = totalRealEstateEquity + totalFinancial;

    return {
      primaryValue,
      primaryMortgage,
      secondaryValue,
      secondaryMortgage,
      primaryEquity,
      secondaryEquity,
      totalRealEstateEquity,
      investments,
      savings,
      annuities,
      totalFinancial,
      totalAssets,
    };
  }

  function updateAssetSummaryUI(summary) {
    if (!summary) return;

    // Real estate
    $("#as-primary-value").textContent = fmtCurrency(summary.primaryValue);
    $("#as-primary-mortgage").textContent = fmtCurrency(summary.primaryMortgage);
    $("#as-primary-equity").textContent = fmtCurrency(summary.primaryEquity);

    $("#as-secondary-value").textContent = fmtCurrency(summary.secondaryValue);
    $("#as-secondary-mortgage").textContent = fmtCurrency(summary.secondaryMortgage);
    $("#as-secondary-equity").textContent = fmtCurrency(summary.secondaryEquity);

    $("#as-total-real-estate-equity").textContent = fmtCurrency(summary.totalRealEstateEquity);

    // Financial assets
    $("#as-portfolio-count").textContent = summary.investments.count;
    $("#as-portfolio-total").textContent = fmtCurrency(summary.investments.total);

    $("#as-savings-count").textContent = summary.savings.count;
    $("#as-savings-total").textContent = fmtCurrency(summary.savings.total);

    $("#as-annuities-count").textContent = summary.annuities.count;
    $("#as-annuities-total").textContent = fmtCurrency(summary.annuities.total);

    $("#as-total-financial-assets").textContent = fmtCurrency(summary.totalFinancial);

    // Plan allocation base
    $("#plan-alloc-investments").textContent = fmtCurrency(summary.investments.total);
    $("#plan-alloc-savings").textContent = fmtCurrency(summary.savings.total);
    $("#plan-alloc-annuities").textContent = fmtCurrency(summary.annuities.total);
    $("#plan-alloc-total").textContent = fmtCurrency(summary.totalFinancial);

    const total = summary.totalFinancial || 1;
    const invPct = (summary.investments.total / total) * 100;
    const savPct = (summary.savings.total / total) * 100;
    const annPct = (summary.annuities.total / total) * 100;

    $("#plan-alloc-investments-pct").textContent = fmtPercent(invPct);
    $("#plan-alloc-savings-pct").textContent = fmtPercent(savPct);
    $("#plan-alloc-annuities-pct").textContent = fmtPercent(annPct);

    updateCharts(summary);
  }

  // ---------- Plan Inputs (Step 3) ----------

  function readPlanInputs() {
    const ids = [
      "piHisCurrentAge",
      "piHerCurrentAge",
      "piProjectionYears",
      "piHisDeathAge",
      "piHerDeathAge",

      "piHisSSAnnual",
      "piHerSSAnnual",
      "piSSGrowthPct",
      "piHisSSStartAge",
      "piHerSSStartAge",

      "piPension1Annual",
      "piPension1StartAge",
      "piPension1SurvivorPct",

      "piPension2Annual",
      "piPension2StartAge",
      "piPension2SurvivorPct",

      "piPensionGrowthPct",
      "piOtherIncomeAnnual",

      "piLivingExpensesAnnual",
      "piExpenseInflationPct",

      // Silver
      "piSilver1Desc", "piSilver1Owner", "piSilver1StartAge", "piSilver1Annual", "piSilver1Rollover",
      "piSilver2Desc", "piSilver2Owner", "piSilver2StartAge", "piSilver2Annual", "piSilver2Rollover",
      "piSilver3Desc", "piSilver3Owner", "piSilver3StartAge", "piSilver3Annual", "piSilver3Rollover",
      "piSilver4Desc", "piSilver4Owner", "piSilver4StartAge", "piSilver4Annual", "piSilver4Rollover",

      // Gold
      "piGold1Desc", "piGold1Owner", "piGold1StartAge", "piGold1Annual", "piGold1Rollover",
      "piGold2Desc", "piGold2Owner", "piGold2StartAge", "piGold2Annual", "piGold2Rollover",
      "piGold3Desc", "piGold3Owner", "piGold3StartAge", "piGold3Annual", "piGold3Rollover",
      "piGold4Desc", "piGold4Owner", "piGold4StartAge", "piGold4Annual", "piGold4Rollover",
    ];

    const inputs = {};
    ids.forEach((id) => {
      const el = $(`#${id}`);
      if (!el) return;
      if (el.type === "number") {
        inputs[id] = toNumber(el.value);
      } else {
        inputs[id] = el.value || "";
      }
    });

    return inputs;
  }

  function fillPlanInputs(inputs) {
    if (!inputs) return;
    Object.keys(inputs).forEach((id) => {
      const el = $(`#${id}`);
      if (!el) return;
      if (el.type === "number") {
        el.value = inputs[id] || inputs[id] === 0 ? inputs[id] : "";
      } else {
        el.value = inputs[id] || "";
      }
    });

    // Update Silver/Gold column headers with description labels if available
    if (inputs.piSilver1Desc) $("#th-silver1").textContent = inputs.piSilver1Desc;
    if (inputs.piSilver2Desc) $("#th-silver2").textContent = inputs.piSilver2Desc;
    if (inputs.piSilver3Desc) $("#th-silver3").textContent = inputs.piSilver3Desc;
    if (inputs.piSilver4Desc) $("#th-silver4").textContent = inputs.piSilver4Desc;

    if (inputs.piGold1Desc) $("#th-gold1").textContent = inputs.piGold1Desc;
    if (inputs.piGold2Desc) $("#th-gold2").textContent = inputs.piGold2Desc;
    if (inputs.piGold3Desc) $("#th-gold3").textContent = inputs.piGold3Desc;
    if (inputs.piGold4Desc) $("#th-gold4").textContent = inputs.piGold4Desc;
  }

  // ---------- Basic Plan Calculations ----------

  function computeBaseIncome(inputs) {
    if (!inputs) return { baseIncome: 0, expenses: 0 };

    const hisSS = inputs.piHisSSAnnual || 0;
    const herSS = inputs.piHerSSAnnual || 0;
    const p1 = inputs.piPension1Annual || 0;
    const p2 = inputs.piPension2Annual || 0;
    const other = inputs.piOtherIncomeAnnual || 0;
    const expenses = inputs.piLivingExpensesAnnual || 0;

    const baseIncome = hisSS + herSS + p1 + p2 + other;
    return { baseIncome, expenses };
  }

  function computeSilverGoldAddl(inputs, prefix) {
    // prefix = "Silver" or "Gold"
    const annualIds = [`pi${prefix}1Annual`, `pi${prefix}2Annual`, `pi${prefix}3Annual`, `pi${prefix}4Annual`];
    let total = 0;
    annualIds.forEach((id) => {
      total += inputs[id] || 0;
    });
    return total;
  }

  function updatePlanSummaryUI() {
    const inputs = state.inputs || {};
    const { baseIncome, expenses } = computeBaseIncome(inputs);

    const silverAddl = computeSilverGoldAddl(inputs, "Silver");
    const goldAddl = computeSilverGoldAddl(inputs, "Gold");

    // No Plan
    const npIncome = baseIncome;
    const npGap = npIncome - expenses;

    $("#no-plan-income").textContent = fmtCurrency(npIncome);
    $("#no-plan-expenses").textContent = fmtCurrency(expenses);
    $("#no-plan-gap").textContent = fmtCurrency(npGap);

    // Silver Plan
    const spIncome = baseIncome + silverAddl;
    const spGap = spIncome - expenses;

    $("#silver-plan-income").textContent = fmtCurrency(spIncome);
    $("#silver-plan-expenses").textContent = fmtCurrency(expenses);
    $("#silver-plan-gap").textContent = fmtCurrency(spGap);

    // Gold Plan
    const gpIncome = baseIncome + goldAddl;
    const gpGap = gpIncome - expenses;

    $("#gold-plan-income").textContent = fmtCurrency(gpIncome);
    $("#gold-plan-expenses").textContent = fmtCurrency(expenses);
    $("#gold-plan-gap").textContent = fmtCurrency(gpGap);

    // Simple survivor logic: survivor gets the higher SS + full pensions + other + Silver/Gold
    const hisSS = inputs.piHisSSAnnual || 0;
    const herSS = inputs.piHerSSAnnual || 0;
    const p1 = inputs.piPension1Annual || 0;
    const p2 = inputs.piPension2Annual || 0;
    const p1SurvPct = (inputs.piPension1SurvivorPct || 100) / 100;
    const p2SurvPct = (inputs.piPension2SurvivorPct || 100) / 100;
    const other = inputs.piOtherIncomeAnnual || 0;

    const survivorBase = Math.max(hisSS, herSS) + p1 * p1SurvPct + p2 * p2SurvPct + other;

    // No Plan survivors
    $("#np-living-today").textContent = fmtCurrency(expenses);
    $("#np-ret-income").textContent = fmtCurrency(npIncome);
    $("#np-her-survivor").textContent = fmtCurrency(survivorBase);
    $("#np-his-survivor").textContent = fmtCurrency(survivorBase);

    // Silver Plan survivors
    const spSurvivor = survivorBase + silverAddl;
    $("#sp-living-today").textContent = fmtCurrency(expenses);
    $("#sp-ret-income").textContent = fmtCurrency(spIncome);
    $("#sp-her-survivor").textContent = fmtCurrency(spSurvivor);
    $("#sp-his-survivor").textContent = fmtCurrency(spSurvivor);

    // Gold Plan survivors
    const gpSurvivor = survivorBase + goldAddl;
    $("#gp-living-today").textContent = fmtCurrency(expenses);
    $("#gp-ret-income").textContent = fmtCurrency(gpIncome);
    $("#gp-her-survivor").textContent = fmtCurrency(gpSurvivor);
    $("#gp-his-survivor").textContent = fmtCurrency(gpSurvivor);

    // For now, use same A/B/C values across No Plan, Silver, Gold (you can later
    // adjust these to reflect rollovers between C -> B)
    const summary = computeAssetSummary(state.client);
    if (!summary) return;

    $("#np-A").textContent = fmtCurrency(summary.savings.total);
    $("#np-B").textContent = fmtCurrency(summary.annuities.total);
    $("#np-C").textContent = fmtCurrency(summary.investments.total);

    $("#sp-A").textContent = fmtCurrency(summary.savings.total);
    $("#sp-B").textContent = fmtCurrency(summary.annuities.total);
    $("#sp-C").textContent = fmtCurrency(summary.investments.total);

    $("#gp-A").textContent = fmtCurrency(summary.savings.total);
    $("#gp-B").textContent = fmtCurrency(summary.annuities.total);
    $("#gp-C").textContent = fmtCurrency(summary.investments.total);
  }

  // ---------- Chart.js pies ----------

  function createPieChart(ctx, data) {
    if (!window.Chart || !ctx) return null;
    return new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Savings (A)", "Annuities (B)", "Investments (C)"],
        datasets: [
          {
            data: [data.savings, data.annuities, data.investments],
            backgroundColor: ["#facc15", "#16a34a", "#b91c1c"],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    });
  }

  function updateCharts(summary) {
    if (!window.Chart || !summary) return;

    const data = {
      savings: summary.savings.total,
      annuities: summary.annuities.total,
      investments: summary.investments.total,
    };

    const npCtx = $("#np-asset-pie")?.getContext("2d");
    const spCtx = $("#sp-asset-pie")?.getContext("2d");
    const gpCtx = $("#gp-asset-pie")?.getContext("2d");

    // Destroy old charts if any
    ["np", "sp", "gp"].forEach((key) => {
      if (state.charts[key]) {
        state.charts[key].destroy();
        state.charts[key] = null;
      }
    });

    state.charts.np = createPieChart(npCtx, data);
    state.charts.sp = createPieChart(spCtx, data);
    state.charts.gp = createPieChart(gpCtx, data);
  }

  // ---------- Plan tabs (No Plan / Silver / Gold) ----------

  function initPlanTabs() {
    const tabs = $all(".plan-tab");
    const cards = {
      "no-plan": $("#plan-no-plan"),
      silver: $("#plan-silver"),
      gold: $("#plan-gold"),
    };

    function activate(plan) {
      tabs.forEach((t) => {
        if (t.dataset.plan === plan) {
          t.classList.add("plan-tab-active");
        } else {
          t.classList.remove("plan-tab-active");
        }
      });

      Object.keys(cards).forEach((key) => {
        const card = cards[key];
        if (!card) return;
        if (key === plan) {
          card.classList.remove("plan-card-hidden");
        } else {
          card.classList.add("plan-card-hidden");
        }
      });
    }

    tabs.forEach((t) => {
      t.addEventListener("click", () => {
        const plan = t.dataset.plan;
        if (plan) activate(plan);
      });
    });

    activate("no-plan");
  }

  // ---------- Init on DOMContentLoaded ----------

  document.addEventListener("DOMContentLoaded", () => {
    initStepNavigation();
    initPlanTabs();

    // Load existing data from storage
    const storedClient = loadFromStorage(STORAGE_KEYS.CLIENT);
    const storedInputs = loadFromStorage(STORAGE_KEYS.INPUTS);

    if (storedClient) {
      state.client = storedClient;
      fillClientForm(storedClient);
    }
    if (storedInputs) {
      state.inputs = storedInputs;
      fillPlanInputs(storedInputs);
    }

    // Initial calculations
    const summary = computeAssetSummary(state.client);
    updateAssetSummaryUI(summary);
    updatePlanSummaryUI();

    // Handle client form submit
    const clientForm = $("#client-form");
    const saveStatus = $("#saveStatus");
    if (clientForm) {
      clientForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = readClientForm();
        state.client = data;
        saveToStorage(STORAGE_KEYS.CLIENT, data);

        const summary = computeAssetSummary(data);
        updateAssetSummaryUI(summary);
        updatePlanSummaryUI();

        showStatus(saveStatus, "Client data saved.");
      });
    }

    // Handle Save Plan Inputs button
    const saveInputsBtn = $("#save-plan-inputs");
    const planInputsStatus = $("#planInputsStatus");
    if (saveInputsBtn) {
      saveInputsBtn.addEventListener("click", () => {
        const inputs = readPlanInputs();
        state.inputs = inputs;
        saveToStorage(STORAGE_KEYS.INPUTS, inputs);

        // Update headers & summaries
        fillPlanInputs(inputs);
        updatePlanSummaryUI();

        showStatus(planInputsStatus, "Plan inputs saved.");
      });
    }
  });
})();
