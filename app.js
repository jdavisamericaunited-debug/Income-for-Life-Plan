// AmericaPlanning Income-for-Life Planner JS
// Handles step navigation, saving/loading, asset summary,
// plan comparisons, and year-by-year schedules.

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
    $("as-total-financial-assets").textContent =
      fmtCurrency(totalFinancialAssets);
    $("as-total-assets").textContent = fmtCurrency(totalAssets);

    // Plan allocation snapshot (Step 4)
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
    buildSchedules();
  };

  const loadPlanInputs = () => {
    const raw = localStorage.getItem("apPlanInputs");
    if (!raw || !planInputsSection) return;
    try {
      const data = JSON.parse(raw);
      applyDataToFields(planInputsSection, data);
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

  /* ---------------- Year-by-year schedules ---------------- */

  const clearSchedules = () => {
    const bodies = [
      "no-plan-schedule-body",
      "silver-schedule-body",
      "gold-schedule-body",
    ];
    bodies.forEach((id) => {
      const tbody = $(id);
      if (tbody) tbody.innerHTML = "";
    });
  };

  const buildSchedules = () => {
    clearSchedules();

    const projectionYears = num($("piProjectionYears")?.value);
    if (!projectionYears || projectionYears <= 0) {
      // Still update summary cards to zeros
      updatePlanSummaryCards({
        noPlan: { income: 0, expenses: 0, add: 0 },
        silver: { income: 0, expenses: 0, add: 0 },
        gold: { income: 0, expenses: 0, add: 0 },
      });
      return;
    }

    const hisAge0 = num($("piHisCurrentAge")?.value);
    const herAge0 = num($("piHerCurrentAge")?.value);

    const hisDeathAge = num($("piHisDeathAge")?.value) || (hisAge0 + 30);
    const herDeathAge = num($("piHerDeathAge")?.value) || (herAge0 + 30);

    const incomeGrowthPct = num($("piIncomeGrowthPct")?.value) / 100;
    const expenseInflationPct = num($("piExpenseInflationPct")?.value) / 100;

    // Base annual amounts (first year amounts before growth)
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

    // Silver additional income sources
    const silverSources = [1, 2, 3, 4].map((i) => ({
      owner: ($(`piSilver${i}Owner`)?.value || "").toLowerCase(),
      annual: num($(`piSilver${i}Annual`)?.value),
      startAge: num($(`piSilver${i}StartAge`)?.value),
    }));

    // Gold additional income sources
    const goldSources = [1, 2, 3, 4].map((i) => ({
      owner: ($(`piGold${i}Owner`)?.value || "").toLowerCase(),
      annual: num($(`piGold${i}Annual`)?.value),
      startAge: num($(`piGold${i}StartAge`)?.value),
    }));

    const noPlanBody = $("no-plan-schedule-body");
    const silverBody = $("silver-schedule-body");
    const goldBody = $("gold-schedule-body");

    let firstYearNoPlan = null;
    let firstYearSilver = null;
    let firstYearGold = null;

    for (let yearIndex = 0; yearIndex < projectionYears; yearIndex++) {
      const yr = yearIndex + 1;
      const hisAge = hisAge0 ? hisAge0 + yearIndex : "";
      const herAge = herAge0 ? herAge0 + yearIndex : "";

      const hisAlive = !hisAge0 ? false : hisAge <= hisDeathAge;
      const herAlive = !herAge0 ? false : herAge <= herDeathAge;

      const incomeGrowthFactor = Math.pow(1 + incomeGrowthPct, yearIndex);
      const expenseGrowthFactor = Math.pow(1 + expenseInflationPct, yearIndex);

      // ---- Base income components (No Plan) ----
      let hisSS = 0;
      if (hisAlive && hisAge >= hisSSStartAge) {
        hisSS = hisSSAnnual * incomeGrowthFactor;
      }

      let herSS = 0;
      if (herAlive && herAge >= herSSStartAge) {
        herSS = herSSAnnual * incomeGrowthFactor;
      }

      // Simple pension logic: full amount once start age is reached,
      // reduced to survivor percentage after first death,
      // zero when both have passed their death ages.
      const anyAlive = hisAlive || herAlive;

      let pension1 = 0;
      if (anyAlive && hisAge >= pension1StartAge) {
        pension1 = pension1Annual * incomeGrowthFactor;
        const firstDeathAge = Math.min(hisDeathAge || 999, herDeathAge || 999);
        if ((hisAge > firstDeathAge || herAge > firstDeathAge) && (hisAge <= hisDeathAge || herAge <= herDeathAge)) {
          pension1 = pension1 * (pension1SurvivorPct || 1);
        }
      }

      let pension2 = 0;
      if (anyAlive && herAge >= pension2StartAge) {
        pension2 = pension2Annual * incomeGrowthFactor;
        const firstDeathAge = Math.min(hisDeathAge || 999, herDeathAge || 999);
        if ((hisAge > firstDeathAge || herAge > firstDeathAge) && (hisAge <= hisDeathAge || herAge <= herDeathAge)) {
          pension2 = pension2 * (pension2SurvivorPct || 1);
        }
      }

      let otherIncome = 0;
      if (anyAlive) {
        otherIncome = otherIncomeAnnual * incomeGrowthFactor;
      }

      const baseIncome = hisSS + herSS + pension1 + pension2 + otherIncome;
      const expenses = livingExpensesAnnual * expenseGrowthFactor;

      // ---- Additional Silver / Gold incomes ----
      const calcAdditionalIncome = (sources) => {
        let total = 0;
        sources.forEach((src) => {
          if (!src.annual || !src.startAge) return;
          let ownerAge = null;
          let ownerDeathAge = null;

          if (src.owner.startsWith("h")) {
            ownerAge = hisAge;
            ownerDeathAge = hisDeathAge;
          } else if (src.owner.startsWith("s") || src.owner.startsWith("w")) {
            ownerAge = herAge;
            ownerDeathAge = herDeathAge;
          } else {
            // assume joint / either
            ownerAge = Math.max(hisAge || 0, herAge || 0);
            ownerDeathAge = Math.max(hisDeathAge || 0, herDeathAge || 0);
          }

          if (!ownerAge) return;

          const alive = ownerAge <= ownerDeathAge;
          if (alive && ownerAge >= src.startAge) {
            total += src.annual * incomeGrowthFactor;
          }
        });
        return total;
      };

      const silverAdd = calcAdditionalIncome(silverSources);
      const goldAdd = calcAdditionalIncome(goldSources);

      const noPlanTotal = baseIncome;
      const silverTotal = baseIncome + silverAdd;
      const goldTotal = baseIncome + goldAdd;

      const noPlanGap = noPlanTotal - expenses;
      const silverGap = silverTotal - expenses;
      const goldGap = goldTotal - expenses;

      const rowHtml = (planType) => {
        let addIncome = 0;
        let totalIncome = 0;
        let gap = 0;

        if (planType === "no") {
          addIncome = 0;
          totalIncome = noPlanTotal;
          gap = noPlanGap;
        } else if (planType === "silver") {
          addIncome = silverAdd;
          totalIncome = silverTotal;
          gap = silverGap;
        } else {
          addIncome = goldAdd;
          totalIncome = goldTotal;
          gap = goldGap;
        }

        const gapClass =
          gap >= 0 ? "plan-metric-gap-positive" : "plan-metric-gap-negative";

        return `
          <tr>
            <td>${yr}</td>
            <td>${hisAge || ""}</td>
            <td>${herAge || ""}</td>
            <td>${fmtCurrency(baseIncome)}</td>
            <td>${fmtCurrency(addIncome)}</td>
            <td>${fmtCurrency(totalIncome)}</td>
            <td>${fmtCurrency(expenses)}</td>
            <td><span class="${gapClass}">${fmtCurrency(gap)}</span></td>
          </tr>
        `;
      };

      if (noPlanBody) noPlanBody.insertAdjacentHTML("beforeend", rowHtml("no"));
      if (silverBody) silverBody.insertAdjacentHTML("beforeend", rowHtml("silver"));
      if (goldBody) goldBody.insertAdjacentHTML("beforeend", rowHtml("gold"));

      if (yearIndex === 0) {
        firstYearNoPlan = {
          income: noPlanTotal,
          expenses: expenses,
          add: 0,
          gap: noPlanGap,
        };
        firstYearSilver = {
          income: silverTotal,
          expenses: expenses,
          add: silverAdd,
          gap: silverGap,
        };
        firstYearGold = {
          income: goldTotal,
          expenses: expenses,
          add: goldAdd,
          gap: goldGap,
        };
      }
    }

    updatePlanSummaryCards({
      noPlan: firstYearNoPlan || { income: 0, expenses: 0, add: 0, gap: 0 },
      silver: firstYearSilver || { income: 0, expenses: 0, add: 0, gap: 0 },
      gold: firstYearGold || { income: 0, expenses: 0, add: 0, gap: 0 },
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
      gapEl.classList.remove("plan-metric-gap-positive", "plan-metric-gap-negative");
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

  /* ---------------- Initial load ---------------- */

  loadClientData();
  loadPlanInputs();
  updateAssetsSummary();
  buildSchedules();
  showStep("client");
});
