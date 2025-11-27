// AmericaPlanning Income-for-Life Planner JS
// - SS & Pension growth only (annuities level)
// - SS survivor logic (lower benefit lost after first death)
// - Pensions with survivor %
// - Silver/Gold annuity income continues as long as either spouse is alive
// - Final A/B/C asset & income summaries with pies for No Plan, Silver, Gold

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------- Helpers ---------------- */

  const $ = (id) => document.getElementById(id);

  const num = (val) => {
    if (val === undefined || val === null) return 0;
    const n = parseFloat(String(val).replace(/,/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const fmtCurrency = (value) =>
    num(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const fmtPct = (value) =>
    `${num(value).toLocaleString("en-US", {
      maximumFractionDigits: 1,
    })}%`;

  /* ---------------- Global state for assets & charts ---------------- */

  let baseAssets = { savings: 0, annuities: 0, investments: 0 }; // from Client Data
  let npAssetChart = null;
  let spAssetChart = null;
  let gpAssetChart = null;

  const ASSET_COLORS = ["#facc15", "#bbf7d0", "#f87171"]; // A yellow, B green, C red

  const createOrUpdatePie = (existingChart, canvasId, data) => {
    if (!window.Chart) return existingChart;
    const canvas = $(canvasId);
    if (!canvas) return existingChart;
    const ctx = canvas.getContext("2d");

    if (!existingChart) {
      return new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["A: Savings/Checking/CU", "B: Annuities", "C: Investments"],
          datasets: [
            {
              data,
              backgroundColor: ASSET_COLORS,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    } else {
      existingChart.data.datasets[0].data = data;
      existingChart.update();
      return existingChart;
    }
  };

  /* ---------------- Step navigation ---------------- */

  const stepButtons = document.querySelectorAll(".ap-step-btn");
  const stepSections = {
    client: $("step-client"),
    assets: $("step-assets"),
    inputs: $("step-inputs"),
    plans: $("step-plans"),
    summary: $("step-summary"),
  };

  const showStep = (stepName) => {
    stepButtons.forEach((btn) => {
      if (btn.dataset.step === stepName) {
        btn.classList.add("ap-step-btn-active");
      } else {
        btn.classList.remove("ap-step-btn-active");
      }
    });

    Object.entries(stepSections).forEach(([name, section]) => {
      if (!section) return;
      if (name === stepName) {
        section.classList.remove("ap-card-hidden");
      } else {
        section.classList.add("ap-card-hidden");
      }
    });
  };

  stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = btn.dataset.step;
      if (!step || btn.disabled) return;
      showStep(step);
    });
  });

  /* ---------------- Save / load client data ---------------- */

  const clientForm = $("client-form");
  const saveStatus = $("saveStatus");

  const getAllFieldsData = (rootEl) => {
    const data = {};
    if (!rootEl) return data;
    const fields = rootEl.querySelectorAll("input, select, textarea");
    fields.forEach((field) => {
      if (!field.id) return;
      data[field.id] = field.value;
    });
    return data;
  };

  const applyDataToFields = (rootEl, data) => {
    if (!rootEl || !data) return;
    Object.entries(data).forEach(([id, value]) => {
      const el = $(id);
      if (el) el.value = value;
    });
  };

  const updateSaveStatus = (el, msg) => {
    if (!el) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    el.textContent = `${msg} (${timeStr})`;
  };

  const updateAssetsSummary = () => {
    // Real estate
    const primaryVal = num($("primaryValue")?.value);
    const primaryMort = num($("primaryMortgage")?.value);
    const secondaryVal = num($("secondaryValue")?.value);
    const secondaryMort = num($("secondaryMortgage")?.value);

    const primaryEq = Math.max(primaryVal - primaryMort, 0);
    const secondaryEq = Math.max(secondaryVal - secondaryMort, 0);

    $("as-primary-value").textContent = fmtCurrency(primaryVal);
    $("as-primary-mortgage").textContent = fmtCurrency(primaryMort);
    $("as-primary-equity").textContent = fmtCurrency(primaryEq);

    $("as-secondary-value").textContent = fmtCurrency(secondaryVal);
    $("as-secondary-mortgage").textContent = fmtCurrency(secondaryMort);
    $("as-secondary-equity").textContent = fmtCurrency(secondaryEq);

    const totalRealEstateEquity = primaryEq + secondaryEq;

    // Investment / retirement accounts
    const invBalances = [
      "inv1Balance",
      "inv2Balance",
      "inv3Balance",
      "inv4Balance",
      "inv5Balance",
    ].map((id) => num($(id)?.value));
    const invCount = invBalances.filter((v) => v > 0).length;
    const invTotal = invBalances.reduce((a, b) => a + b, 0);

    $("as-portfolio-count").textContent = invCount.toString();
    $("as-portfolio-total").textContent = fmtCurrency(invTotal);

    // Savings / checking / CU
    const savBalances = [
      "sav1Balance",
      "sav2Balance",
      "sav3Balance",
      "sav4Balance",
      "sav5Balance",
    ].map((id) => num($(id)?.value));
    const savCount = savBalances.filter((v) => v > 0).length;
    const savTotal = savBalances.reduce((a, b) => a + b, 0);

    $("as-savings-count").textContent = savCount.toString();
    $("as-savings-total").textContent = fmtCurrency(savTotal);

    // Annuities
    const annBalances = [
      "ann1Balance",
      "ann2Balance",
      "ann3Balance",
      "ann4Balance",
      "ann5Balance",
    ].map((id) => num($(id)?.value));
    const annCount = annBalances.filter((v) => v > 0).length;
    const annTotal = annBalances.reduce((a, b) => a + b, 0);

    $("as-annuities-count").textContent = annCount.toString();
    $("as-annuities-total").textContent = fmtCurrency(annTotal);

    const totalFinancialAssets = invTotal + savTotal + annTotal;
    const totalAssets = totalRealEstateEquity + totalFinancialAssets;

    $("as-total-real-estate-equity").textContent = fmtCurrency(
      totalRealEstateEquity
    );
    $("as-total-financial-assets").textContent = fmtCurrency(
      totalFinancialAssets
    );
    $("as-total-assets").textContent = fmtCurrency(totalAssets);

    // Save base financial assets for plan allocations
    baseAssets = {
      savings: savTotal,
      annuities: annTotal,
      investments: invTotal,
    };

    // Base allocation snapshot in Step 4
    $("plan-alloc-investments").textContent = fmtCurrency(invTotal);
    $("plan-alloc-savings").textContent = fmtCurrency(savTotal);
    $("plan-alloc-annuities").textContent = fmtCurrency(annTotal);
    $("plan-alloc-total").textContent = fmtCurrency(totalFinancialAssets);

    if (totalFinancialAssets > 0) {
      $("plan-alloc-investments-pct").textContent = fmtPct(
        (invTotal / totalFinancialAssets) * 100
      );
      $("plan-alloc-savings-pct").textContent = fmtPct(
        (savTotal / totalFinancialAssets) * 100
      );
      $("plan-alloc-annuities-pct").textContent = fmtPct(
        (annTotal / totalFinancialAssets) * 100
      );
    } else {
      $("plan-alloc-investments-pct").textContent = "0%";
      $("plan-alloc-savings-pct").textContent = "0%";
      $("plan-alloc-annuities-pct").textContent = "0%";
    }
  };

  if (clientForm) {
    clientForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = getAllFieldsData(clientForm);
      localStorage.setItem("apClientData", JSON.stringify(data));
      updateSaveStatus(saveStatus, "Client data saved");
      updateAssetsSummary();
      buildSchedules();
    });
  }

  const loadClientData = () => {
    const raw = localStorage.getItem("apClientData");
    if (!raw || !clientForm) return;
    try {
      const data = JSON.parse(raw);
      applyDataToFields(clientForm, data);
      updateAssetsSummary();
    } catch (e) {
      console.error("Error loading client data", e);
    }
  };

  /* ---------------- Save / load plan inputs ---------------- */

  const planInputsSection = $("step-inputs");
  const planInputsStatus = $("planInputsStatus");
  const savePlanInputsBtn = $("save-plan-inputs");

  const savePlanInputs = () => {
    if (!planInputsSection) return;
    const data = getAllFieldsData(planInputsSection);
    localStorage.setItem("apPlanInputs", JSON.stringify(data));
    updateSaveStatus(planInputsStatus, "Plan inputs saved");
    updateScheduleHeaders();
    buildSchedules();
  };

  const loadPlanInputs = () => {
    const raw = localStorage.getItem("apPlanInputs");
    if (!raw || !planInputsSection) return;
    try {
      const data = JSON.parse(raw);
      applyDataToFields(planInputsSection, data);
      updateScheduleHeaders();
    } catch (e) {
      console.error("Error loading plan inputs", e);
    }
  };

  if (savePlanInputsBtn) {
    savePlanInputsBtn.addEventListener("click", savePlanInputs);
  }

  /* ---------------- Plan tabs (No Plan / Silver / Gold) ---------------- */

  const planTabs = document.querySelectorAll(".plan-tab");
  const planCards = {
    "no-plan": $("plan-no-plan"),
    silver: $("plan-silver"),
    gold: $("plan-gold"),
  };

  const showPlanCard = (planKey) => {
    planTabs.forEach((btn) => {
      if (btn.dataset.plan === planKey) {
        btn.classList.add("plan-tab-active");
      } else {
        btn.classList.remove("plan-tab-active");
      }
    });

    Object.entries(planCards).forEach(([key, card]) => {
      if (!card) return;
      if (key === planKey) {
        card.classList.remove("plan-card-hidden");
      } else {
        card.classList.add("plan-card-hidden");
      }
    });
  };

  planTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const plan = btn.dataset.plan;
      if (!plan) return;
      showPlanCard(plan);
    });
  });

  /* ---------------- Schedule headers from Inputs ------------- */

  const updateScheduleHeaders = () => {
    const getDesc = (inputId, fallback) => {
      const el = $(inputId);
      if (!el) return fallback;
      const v = (el.value || "").trim();
      return v || fallback;
    };

    const setHeader = (thId, text) => {
      const el = $(thId);
      if (el) el.textContent = text;
    };

    // Silver plan column titles – use insurance company / contract description
    setHeader("th-silver1", getDesc("piSilver1Desc", "Silver 1 Income"));
    setHeader("th-silver2", getDesc("piSilver2Desc", "Silver 2 Income"));
    setHeader("th-silver3", getDesc("piSilver3Desc", "Silver 3 Income"));
    setHeader("th-silver4", getDesc("piSilver4Desc", "Silver 4 Income"));

    // Gold plan column titles
    setHeader("th-gold1", getDesc("piGold1Desc", "Gold 1 Income"));
    setHeader("th-gold2", getDesc("piGold2Desc", "Gold 2 Income"));
    setHeader("th-gold3", getDesc("piGold3Desc", "Gold 3 Income"));
    setHeader("th-gold4", getDesc("piGold4Desc", "Gold 4 Income"));
  };

  /* ---------------- Year-by-year schedules ---------------- */

  const clearSchedules = () => {
    [
      "no-plan-schedule-body",
      "silver-schedule-body",
      "gold-schedule-body",
    ].forEach((id) => {
      const tbody = $(id);
      if (tbody) tbody.innerHTML = "";
    });
  };

  const updatePlanSummaryCards = ({ noPlan, silver, gold }) => {
    const updateCard = (prefix, data) => {
      const incomeEl = $(`${prefix}-income`);
      const expEl = $(`${prefix}-expenses`);
      const gapEl = $(`${prefix}-gap`);

      if (!incomeEl || !expEl || !gapEl) return;

      incomeEl.textContent = fmtCurrency(data.income);
      expEl.textContent = fmtCurrency(data.expenses);

      const gap = data.income - data.expenses;
      gapEl.textContent = fmtCurrency(gap);
      gapEl.classList.remove(
        "plan-metric-gap-positive",
        "plan-metric-gap-negative"
      );
      if (gap >= 0) {
        gapEl.classList.add("plan-metric-gap-positive");
      } else {
        gapEl.classList.add("plan-metric-gap-negative");
      }
    };

    updateCard("no-plan", noPlan);
    updateCard("silver-plan", silver);
    updateCard("gold-plan", gold);
  };

  const updatePlanSummaryPanels = (
    summaries,
    assetsNoPlan,
    assetsSilver,
    assetsGold
  ) => {
    const map = {
      noPlan: {
        prefix: "np",
        assets: assetsNoPlan,
      },
      silver: {
        prefix: "sp",
        assets: assetsSilver,
      },
      gold: {
        prefix: "gp",
        assets: assetsGold,
      },
    };

    Object.entries(map).forEach(([key, cfg]) => {
      const s = summaries[key];
      if (!s) return;

      const p = cfg.prefix;
      const assets = cfg.assets || { savings: 0, annuities: 0, investments: 0 };

      // A/B/C values
      const aEl = $(`${p}-A`);
      const bEl = $(`${p}-B`);
      const cEl = $(`${p}-C`);
      if (aEl) aEl.textContent = fmtCurrency(assets.savings);
      if (bEl) bEl.textContent = fmtCurrency(assets.annuities);
      if (cEl) cEl.textContent = fmtCurrency(assets.investments);

      // Income lines
      const livingEl = $(`${p}-living-today`);
      const retEl = $(`${p}-ret-income`);
      const herEl = $(`${p}-her-survivor`);
      const hisEl = $(`${p}-his-survivor`);

      if (livingEl) livingEl.textContent = fmtCurrency(s.livingToday);
      if (retEl) retEl.textContent = fmtCurrency(s.retirementIncome);
      if (herEl) herEl.textContent = fmtCurrency(s.herSurvivorIncome);
      if (hisEl) hisEl.textContent = fmtCurrency(s.hisSurvivorIncome);
    });

    // Update pies
    const npData = [
      assetsNoPlan.savings,
      assetsNoPlan.annuities,
      assetsNoPlan.investments,
    ];
    const spData = [
      assetsSilver.savings,
      assetsSilver.annuities,
      assetsSilver.investments,
    ];
    const gpData = [
      assetsGold.savings,
      assetsGold.annuities,
      assetsGold.investments,
    ];

    npAssetChart = createOrUpdatePie(npAssetChart, "np-asset-pie", npData);
    spAssetChart = createOrUpdatePie(spAssetChart, "sp-asset-pie", spData);
    gpAssetChart = createOrUpdatePie(gpAssetChart, "gp-asset-pie", gpData);
  };

  const buildSchedules = () => {
    clearSchedules();
    updateScheduleHeaders();

    const projectionYears = num($("piProjectionYears")?.value);
    if (!projectionYears || projectionYears <= 0) {
      updatePlanSummaryCards({
        noPlan: { income: 0, expenses: 0 },
        silver: { income: 0, expenses: 0 },
        gold: { income: 0, expenses: 0 },
      });
      return;
    }

    const hisAge0 = num($("piHisCurrentAge")?.value);
    const herAge0 = num($("piHerCurrentAge")?.value);

    const hisDeathAge = num($("piHisDeathAge")?.value) || (hisAge0 + 30);
    const herDeathAge = num($("piHerDeathAge")?.value) || (herAge0 + 30);

    const ssGrowthPct = num($("piSSGrowthPct")?.value) / 100;
    const pensionGrowthPct = num($("piPensionGrowthPct")?.value) / 100;
    const expenseInflationPct = num($("piExpenseInflationPct")?.value) / 100;

    // Base annual amounts (year 1)
    const hisSSAnnual = num($("piHisSSAnnual")?.value);
    const herSSAnnual = num($("piHerSSAnnual")?.value);
    const pension1Annual = num($("piPension1Annual")?.value);
    const pension2Annual = num($("piPension2Annual")?.value);
    const otherIncomeAnnual = num($("piOtherIncomeAnnual")?.value);
    const livingExpensesAnnual = num($("piLivingExpensesAnnual")?.value);

    const hisSSStartAge = num($("piHisSSStartAge")?.value) || hisAge0;
    const herSSStartAge = num($("piHerSSStartAge")?.value) || herAge0;
    const pension1StartAge = num($("piPension1StartAge")?.value) || hisAge0;
    const pension2StartAge = num($("piPension2StartAge")?.value) || herAge0;

    const pension1SurvivorPct = num($("piPension1SurvivorPct")?.value) / 100;
    const pension2SurvivorPct = num($("piPension2SurvivorPct")?.value) / 100;

    // Determine which SS is higher/lower (for survivor logic)
    const ssHighIsHis = hisSSAnnual >= herSSAnnual;

    // Silver additional income sources (level, no growth; joint-life to survivor)
    const silverSources = [1, 2, 3, 4].map((i) => ({
      owner: ($(`piSilver${i}Owner`)?.value || "").toLowerCase(),
      annual: num($(`piSilver${i}Annual`)?.value),
      startAge: num($(`piSilver${i}StartAge`)?.value),
      rollover: num($(`piSilver${i}Rollover`)?.value),
    }));

    // Gold additional income sources (level, no growth; joint-life to survivor)
    const goldSources = [1, 2, 3, 4].map((i) => ({
      owner: ($(`piGold${i}Owner`)?.value || "").toLowerCase(),
      annual: num($(`piGold${i}Annual`)?.value),
      startAge: num($(`piGold${i}StartAge`)?.value),
      rollover: num($(`piGold${i}Rollover`)?.value),
    }));

    const noPlanBody = $("no-plan-schedule-body");
    const silverBody = $("silver-schedule-body");
    const goldBody = $("gold-schedule-body");

    let firstYearNoPlan = null;
    let firstYearSilver = null;
    let firstYearGold = null;

    // Survivor income trackers (first year after one spouse has died, the other is alive)
    let herSurvNoPlan = null;
    let hisSurvNoPlan = null;
    let herSurvSilver = null;
    let hisSurvSilver = null;
    let herSurvGold = null;
    let hisSurvGold = null;

    // Extra incomes (annuities) are level and continue as long as either spouse is alive
    const sourceIncomeForYear = (src, hisAge, herAge, hisDeath, herDeath) => {
      if (!src.annual || !src.startAge) return 0;

      // Turn-on condition based on owner + start age
      let active = false;

      if (src.owner.startsWith("h")) {
        if (hisAge && hisAge >= src.startAge) active = true;
      } else if (src.owner.startsWith("s") || src.owner.startsWith("w")) {
        if (herAge && herAge >= src.startAge) active = true;
      } else {
        // If "both" or blank, treat as joint: use later of their ages
        const jointAge = Math.max(hisAge || 0, herAge || 0);
        if (jointAge >= src.startAge) active = true;
      }

      // Joint-life style: income continues as long as either spouse is alive
      const hisAlive = hisAge ? hisAge <= hisDeath : false;
      const herAlive = herAge ? herAge <= herDeath : false;
      const anyAlive = hisAlive || herAlive;

      if (active && anyAlive) {
        return src.annual; // LEVEL payout – no growth
      }
      return 0;
    };

    for (let yearIndex = 0; yearIndex < projectionYears; yearIndex++) {
      const yr = yearIndex + 1;
      const hisAge = hisAge0 ? hisAge0 + yearIndex : "";
      const herAge = herAge0 ? herAge0 + yearIndex : "";

      const hisAlive = hisAge0 ? hisAge <= hisDeathAge : false;
      const herAlive = herAge0 ? herAge <= herDeathAge : false;
      const anyAlive = hisAlive || herAlive;

      const ssGrowthFactor = Math.pow(1 + ssGrowthPct, yearIndex);
      const pensionGrowthFactor = Math.pow(1 + pensionGrowthPct, yearIndex);
      const expenseGrowthFactor = Math.pow(1 + expenseInflationPct, yearIndex);

      // ---- Social Security with survivor logic (lose lower benefit) ----
      let hisSS = 0;
      let herSS = 0;

      const bothAlive = hisAlive && herAlive;

      if (bothAlive) {
        if (hisAge >= hisSSStartAge) {
          hisSS = hisSSAnnual * ssGrowthFactor;
        }
        if (herAge >= herSSStartAge) {
          herSS = herSSAnnual * ssGrowthFactor;
        }
      } else if (hisAlive && !herAlive) {
        // He is survivor
        if (ssHighIsHis) {
          if (hisAge >= hisSSStartAge) {
            hisSS = hisSSAnnual * ssGrowthFactor;
          }
        } else {
          if (hisAge >= herSSStartAge) {
            hisSS = herSSAnnual * ssGrowthFactor;
          }
        }
      } else if (!hisAlive && herAlive) {
        // She is survivor
        if (ssHighIsHis) {
          if (herAge >= hisSSStartAge) {
            herSS = hisSSAnnual * ssGrowthFactor;
          }
        } else {
          if (herAge >= herSSStartAge) {
            herSS = herSSAnnual * ssGrowthFactor;
          }
        }
      }
      // else both dead: both 0

      // ---- Pensions with survivor % (100% or 50%) ----
      let pension1 = 0;
      let pension2 = 0;

      if (anyAlive && pension1Annual && hisAge >= pension1StartAge) {
        pension1 = pension1Annual * pensionGrowthFactor;

        const firstDeathAge = Math.min(
          hisDeathAge || 999,
          herDeathAge || 999
        );
        const bothDead = !hisAlive && !herAlive;

        if (!bothDead && (hisAge > firstDeathAge || herAge > firstDeathAge)) {
          // After first death, apply survivor %
          const pct = pension1SurvivorPct || 1;
          pension1 = pension1 * pct;
        }
      }

      if (anyAlive && pension2Annual && herAge >= pension2StartAge) {
        pension2 = pension2Annual * pensionGrowthFactor;

        const firstDeathAge = Math.min(
          hisDeathAge || 999,
          herDeathAge || 999
        );
        const bothDead = !hisAlive && !herAlive;

        if (!bothDead && (hisAge > firstDeathAge || herAge > firstDeathAge)) {
          const pct = pension2SurvivorPct || 1;
          pension2 = pension2 * pct;
        }
      }

      // ---- Other income (level for now) ----
      let otherIncome = 0;
      if (anyAlive) {
        otherIncome = otherIncomeAnnual; // no growth
      }

      const baseIncome = hisSS + herSS + pension1 + pension2 + otherIncome;
      const expenses = livingExpensesAnnual * expenseGrowthFactor;

      // ---- Silver / Gold additional incomes (level, joint-life) ----
      const silverIncomes = silverSources.map((src) =>
        sourceIncomeForYear(src, hisAge, herAge, hisDeathAge, herDeathAge)
      );
      const silverAddTotal = silverIncomes.reduce((a, b) => a + b, 0);

      const goldIncomes = goldSources.map((src) =>
        sourceIncomeForYear(src, hisAge, herAge, hisDeathAge, herDeathAge)
      );
      const goldAddTotal = goldIncomes.reduce((a, b) => a + b, 0);

      const noPlanTotal = baseIncome;
      c
