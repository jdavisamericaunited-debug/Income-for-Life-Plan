// Helper functions
function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function numOrNull(id) {
  const raw = getVal(id);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function formatCurrency(value) {
  const n = toNumber(value);
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

// Master case object
const clientCase = {
  timestamp: null,

  business: {
    name: "",
    yearsInBusiness: null,
    address: "",
    city: "",
    state: "",
    zip: "",
  },

  client: {
    name: "",
    dob: "",
    phone: "",
  },

  spouse: {
    name: "",
    dob: "",
    phone: "",
  },

  contact: {
    homeAddress: "",
    homeCity: "",
    homeState: "",
    homeZip: "",
    email: "",
  },

  children: [], // {name, age, grandchildren, notes}

  advisors: {
    accountantName: "",
    accountantFirm: "",
    attorneyName: "",
    attorneyFirm: "",
    advisorName: "",
    advisorFirm: "",
  },

  retirementTiming: {
    targetAgeHis: null,
    targetAgeHer: null,
    retiredYearHis: null,
    retiredYearHer: null,
  },

  estate: {
    hasWill: "",
    willYear: null,
    hasFinancialPOA: "",
    hasMedicalPOA: "",
    mpoaFiled: "",
    hasTrust: "",
    trustYear: null,
    termLifeHis: null,
    termLifeHer: null,
    notes: "",
  },

  residences: {
    primary: {
      ownedStatus: "",
      value: null,
      mortgage: null,
      payment: null,
    },
    secondary: {
      ownedStatus: "",
      value: null,
      mortgage: null,
      payment: null,
    },
  },

  portfolioAccounts: [], // {name, owner, type, balance, notes}
  savingsAccounts: [], // {desc, owner, balance}
  annuities: [], // {name, owner, balance, yearOpened, termYears, surrender}
  incomeSources: [], // {who, type, desc, amount, notes}

  livingExpensesAnnual: null,
  desiredIncomeToday: null,
  incomeNotes: "",

  goals: [], // {goalKey, rating, notes}

  documentChecklist: "",
  additionalNotes: "",

  assetSummary: null,

  planInputs: {
    projectionYears: null,
    hisCurrentAge: null,
    herCurrentAge: null,
    hisSSAnnual: null,
    herSSAnnual: null,
    pension1Annual: null,
    pension2Annual: null,
    otherIncomeAnnual: null,
    livingExpensesAnnual: null,
    incomeGrowthPct: null,
    expenseInflationPct: null,
    hisSSStartAge: null,
    herSSStartAge: null,
    pension1StartAge: null,
    pension2StartAge: null,
    pension1SurvivorPct: null,
    pension2SurvivorPct: null,
    hisDeathAge: null,
    herDeathAge: null,
    silver: [], // [{owner, annualIncome, rolloverAmount, startAge}]
    gold: [],   // same structure
  },
};

// Capture everything from the Client Data form into clientCase
function updateClientCaseFromForm() {
  // BUSINESS
  clientCase.business.name = getVal("businessName");
  clientCase.business.yearsInBusiness = numOrNull("yearsInBusiness");
  clientCase.business.address = getVal("businessAddress");
  clientCase.business.city = getVal("businessCity");
  clientCase.business.state = getVal("businessState");
  clientCase.business.zip = getVal("businessZip");

  // PERSONAL
  clientCase.client.name = getVal("clientName");
  clientCase.client.dob = getVal("clientDOB");
  clientCase.client.phone = getVal("clientPhone");

  clientCase.spouse.name = getVal("spouseName");
  clientCase.spouse.dob = getVal("spouseDOB");
  clientCase.spouse.phone = getVal("spousePhone");

  clientCase.contact.homeAddress = getVal("homeAddress");
  clientCase.contact.homeCity = getVal("homeCity");
  clientCase.contact.homeState = getVal("homeState");
  clientCase.contact.homeZip = getVal("homeZip");
  clientCase.contact.email = getVal("clientEmail");

  // CHILDREN
  clientCase.children = [];
  for (let i = 1; i <= 4; i++) {
    const name = getVal(`child${i}Name`);
    const age = numOrNull(`child${i}Age`);
    const grandchildren = numOrNull(`child${i}Grandchildren`);
    const notes = getVal(`child${i}Notes`);

    if (name || age !== null || grandchildren !== null || notes) {
      clientCase.children.push({
        name,
        age,
        grandchildren,
        notes,
      });
    }
  }

  // ADVISORS
  clientCase.advisors.accountantName = getVal("accountantName");
  clientCase.advisors.accountantFirm = getVal("accountantFirm");
  clientCase.advisors.attorneyName = getVal("attorneyName");
  clientCase.advisors.attorneyFirm = getVal("attorneyFirm");
  clientCase.advisors.advisorName = getVal("advisorName");
  clientCase.advisors.advisorFirm = getVal("advisorFirm");

  // RETIREMENT TIMING
  clientCase.retirementTiming.targetAgeHis = numOrNull("targetRetireAgeClient");
  clientCase.retirementTiming.targetAgeHer = numOrNull("targetRetireAgeSpouse");
  clientCase.retirementTiming.retiredYearHis = numOrNull("retiredYearHis");
  clientCase.retirementTiming.retiredYearHer = numOrNull("retiredYearHer");

  // ESTATE
  clientCase.estate.hasWill = getVal("hasWill");
  clientCase.estate.willYear = numOrNull("willYear");
  clientCase.estate.hasFinancialPOA = getVal("hasFinancialPOA");
  clientCase.estate.hasMedicalPOA = getVal("hasMedicalPOA");
  clientCase.estate.mpoaFiled = getVal("mpoaFiled");
  clientCase.estate.hasTrust = getVal("hasTrust");
  clientCase.estate.trustYear = numOrNull("trustYear");
  clientCase.estate.termLifeHis = numOrNull("termLifeHis");
  clientCase.estate.termLifeHer = numOrNull("termLifeHer");
  clientCase.estate.notes = getVal("estateNotes");

  // RESIDENCES
  clientCase.residences.primary.ownedStatus = getVal("primaryOwned");
  clientCase.residences.primary.value = numOrNull("primaryValue");
  clientCase.residences.primary.mortgage = numOrNull("primaryMortgage");
  clientCase.residences.primary.payment = numOrNull("primaryPayment");

  clientCase.residences.secondary.ownedStatus = getVal("secondaryOwned");
  clientCase.residences.secondary.value = numOrNull("secondaryValue");
  clientCase.residences.secondary.mortgage = numOrNull("secondaryMortgage");
  clientCase.residences.secondary.payment = numOrNull("secondaryPayment");

  // PORTFOLIO ACCOUNTS
  clientCase.portfolioAccounts = [];
  for (let i = 1; i <= 5; i++) {
    const name = getVal(`inv${i}Name`);
    const owner = getVal(`inv${i}Owner`);
    const type = getVal(`inv${i}Type`);
    const balance = numOrNull(`inv${i}Balance`);
    const notes = getVal(`inv${i}Notes`);

    if (name || owner || type || balance !== null || notes) {
      clientCase.portfolioAccounts.push({
        name,
        owner,
        type,
        balance,
        notes,
      });
    }
  }

  // SAVINGS ACCOUNTS
  clientCase.savingsAccounts = [];
  for (let i = 1; i <= 5; i++) {
    const desc = getVal(`sav${i}Desc`);
    const owner = getVal(`sav${i}Owner`);
    const balance = numOrNull(`sav${i}Balance`);
    if (desc || owner || balance !== null) {
      clientCase.savingsAccounts.push({ desc, owner, balance });
    }
  }

  // ANNUITIES
  clientCase.annuities = [];
  for (let i = 1; i <= 5; i++) {
    const name = getVal(`ann${i}Name`);
    const owner = getVal(`ann${i}Owner`);
    const balance = numOrNull(`ann${i}Balance`);
    const yearOpened = numOrNull(`ann${i}Year`);
    const termYears = numOrNull(`ann${i}Term`);
    const surrender = getVal(`ann${i}Surrender`);

    if (
      name ||
      owner ||
      balance !== null ||
      yearOpened !== null ||
      termYears !== null ||
      surrender
    ) {
      clientCase.annuities.push({
        name,
        owner,
        balance,
        yearOpened,
        termYears,
        surrender,
      });
    }
  }

  // INCOME SOURCES
  clientCase.incomeSources = [];
  for (let i = 1; i <= 6; i++) {
    const who = getVal(`inc${i}Who`);
    const type = getVal(`inc${i}Type`);
    const desc = getVal(`inc${i}Desc`);
    const amount = numOrNull(`inc${i}Amount`);
    const notes = getVal(`inc${i}Notes`);

    if (who || type || desc || amount !== null || notes) {
      clientCase.incomeSources.push({
        who,
        type,
        desc,
        amount,
        notes,
      });
    }
  }

  // LIVING EXPENSES & DESIRED INCOME
  clientCase.livingExpensesAnnual = numOrNull("livingExpensesAnnual");
  clientCase.desiredIncomeToday = numOrNull("desiredIncomeToday");
  clientCase.incomeNotes = getVal("incomeNotes");

  // GOALS
  clientCase.goals = [];
  for (let i = 1; i <= 7; i++) {
    const rating = numOrNull(`goal${i}Rating`);
    const notes = getVal(`goal${i}Notes`);
    if (rating !== null || notes) {
      clientCase.goals.push({
        goalKey: `goal${i}`,
        rating,
        notes,
      });
    }
  }

  // DOCUMENTS & NOTES
  clientCase.documentChecklist = getVal("documentChecklist");
  clientCase.additionalNotes = getVal("additionalNotes");
}

// Calculate Asset Summary from clientCase
function calculateAssetSummary(caseData) {
  const primaryValue = toNumber(caseData.residences.primary.value);
  const primaryMortgage = toNumber(caseData.residences.primary.mortgage);
  const primaryEquity = primaryValue - primaryMortgage;

  const secondaryValue = toNumber(caseData.residences.secondary.value);
  const secondaryMortgage = toNumber(caseData.residences.secondary.mortgage);
  const secondaryEquity = secondaryValue - secondaryMortgage;

  let portfolioTotal = 0;
  caseData.portfolioAccounts.forEach((acc) => {
    portfolioTotal += toNumber(acc.balance);
  });

  let savingsTotal = 0;
  caseData.savingsAccounts.forEach((acc) => {
    savingsTotal += toNumber(acc.balance);
  });

  let annuitiesTotal = 0;
  caseData.annuities.forEach((ann) => {
    annuitiesTotal += toNumber(ann.balance);
  });

  const totalRealEstateEquity = primaryEquity + secondaryEquity;
  const totalFinancialAssets = portfolioTotal + savingsTotal + annuitiesTotal;
  const totalAssets = totalRealEstateEquity + totalFinancialAssets;

  return {
    primary: {
      value: primaryValue,
      mortgage: primaryMortgage,
      equity: primaryEquity,
    },
    secondary: {
      value: secondaryValue,
      mortgage: secondaryMortgage,
      equity: secondaryEquity,
    },
    portfolio: {
      count: caseData.portfolioAccounts.length,
      total: portfolioTotal,
    },
    savings: {
      count: caseData.savingsAccounts.length,
      total: savingsTotal,
    },
    annuities: {
      count: caseData.annuities.length,
      total: annuitiesTotal,
    },
    totals: {
      realEstateEquity: totalRealEstateEquity,
      financialAssets: totalFinancialAssets,
      allAssets: totalAssets,
    },
  };
}

// Render Asset Summary into the Assets tab
function renderAssetSummary(summary) {
  if (!summary) return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  // Real estate
  setText("as-primary-value", formatCurrency(summary.primary.value));
  setText("as-primary-mortgage", formatCurrency(summary.primary.mortgage));
  setText("as-primary-equity", formatCurrency(summary.primary.equity));

  setText("as-secondary-value", formatCurrency(summary.secondary.value));
  setText("as-secondary-mortgage", formatCurrency(summary.secondary.mortgage));
  setText("as-secondary-equity", formatCurrency(summary.secondary.equity));

  // Financial accounts
  setText("as-portfolio-count", String(summary.portfolio.count));
  setText("as-portfolio-total", formatCurrency(summary.portfolio.total));

  setText("as-savings-count", String(summary.savings.count));
  setText("as-savings-total", formatCurrency(summary.savings.total));

  setText("as-annuities-count", String(summary.annuities.count));
  setText("as-annuities-total", formatCurrency(summary.annuities.total));

  // Totals
  setText(
    "as-total-real-estate-equity",
    formatCurrency(summary.totals.realEstateEquity)
  );
  setText(
    "as-total-financial-assets",
    formatCurrency(summary.totals.financialAssets)
  );
  setText("as-total-assets", formatCurrency(summary.totals.allAssets));
}

// ---------- PLAN INPUTS ----------

function updatePlanInputsFromForm() {
  const pi = clientCase.planInputs;

  pi.projectionYears = numOrNull("piProjectionYears");
  pi.hisCurrentAge = numOrNull("piHisCurrentAge");
  pi.herCurrentAge = numOrNull("piHerCurrentAge");
  pi.hisSSAnnual = numOrNull("piHisSSAnnual");
  pi.herSSAnnual = numOrNull("piHerSSAnnual");
  pi.pension1Annual = numOrNull("piPension1Annual");
  pi.pension2Annual = numOrNull("piPension2Annual");
  pi.otherIncomeAnnual = numOrNull("piOtherIncomeAnnual");
  pi.livingExpensesAnnual = numOrNull("piLivingExpensesAnnual");
  pi.incomeGrowthPct = numOrNull("piIncomeGrowthPct");
  pi.expenseInflationPct = numOrNull("piExpenseInflationPct");

  pi.hisSSStartAge = numOrNull("piHisSSStartAge");
  pi.herSSStartAge = numOrNull("piHerSSStartAge");
  pi.pension1StartAge = numOrNull("piPension1StartAge");
  pi.pension2StartAge = numOrNull("piPension2StartAge");
  pi.pension1SurvivorPct = numOrNull("piPension1SurvivorPct");
  pi.pension2SurvivorPct = numOrNull("piPension2SurvivorPct");
  pi.hisDeathAge = numOrNull("piHisDeathAge");
  pi.herDeathAge = numOrNull("piHerDeathAge");

  // Silver sources
  pi.silver = [];
  for (let i = 1; i <= 4; i++) {
    const owner = getVal(`piSilver${i}Owner`);
    const annualIncome = numOrNull(`piSilver${i}Annual`);
    const rolloverAmount = numOrNull(`piSilver${i}Rollover`);
    const startAge = numOrNull(`piSilver${i}StartAge`);

    if (owner || annualIncome !== null || rolloverAmount !== null || startAge !== null) {
      pi.silver.push({
        owner,
        annualIncome,
        rolloverAmount,
        startAge,
      });
    }
  }

  // Gold sources
  pi.gold = [];
  for (let i = 1; i <= 4; i++) {
    const owner = getVal(`piGold${i}Owner`);
    const annualIncome = numOrNull(`piGold${i}Annual`);
    const rolloverAmount = numOrNull(`piGold${i}Rollover`);
    const startAge = numOrNull(`piGold${i}StartAge`);

    if (owner || annualIncome !== null || rolloverAmount !== null || startAge !== null) {
      pi.gold.push({
        owner,
        annualIncome,
        rolloverAmount,
        startAge,
      });
    }
  }
}

function loadPlanInputsIntoForm() {
  const pi = clientCase.planInputs || {};

  const setVal = (id, value) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = value !== null && value !== undefined ? String(value) : "";
  };

  // Base
  setVal("piProjectionYears", pi.projectionYears);
  setVal("piHisCurrentAge", pi.hisCurrentAge);
  setVal("piHerCurrentAge", pi.herCurrentAge);
  setVal("piHisSSAnnual", pi.hisSSAnnual);
  setVal("piHerSSAnnual", pi.herSSAnnual);
  setVal("piPension1Annual", pi.pension1Annual);
  setVal("piPension2Annual", pi.pension2Annual);
  setVal("piOtherIncomeAnnual", pi.otherIncomeAnnual);
  setVal("piIncomeGrowthPct", pi.incomeGrowthPct);
  setVal("piExpenseInflationPct", pi.expenseInflationPct);

  // Living expenses: if planInputs doesn't have one yet, default from clientCase
  const le =
    pi.livingExpensesAnnual !== null && pi.livingExpensesAnnual !== undefined
      ? pi.livingExpensesAnnual
      : clientCase.livingExpensesAnnual;
  setVal("piLivingExpensesAnnual", le);

  // Timing
  setVal("piHisSSStartAge", pi.hisSSStartAge);
  setVal("piHerSSStartAge", pi.herSSStartAge);
  setVal("piPension1StartAge", pi.pension1StartAge);
  setVal("piPension2StartAge", pi.pension2StartAge);
  setVal("piPension1SurvivorPct", pi.pension1SurvivorPct);
  setVal("piPension2SurvivorPct", pi.pension2SurvivorPct);
  setVal("piHisDeathAge", pi.hisDeathAge);
  setVal("piHerDeathAge", pi.herDeathAge);

  // Silver (up to 4)
  const silver = pi.silver || [];
  for (let i = 1; i <= 4; i++) {
    const src = silver[i - 1] || {};
    setVal(`piSilver${i}Owner`, src.owner);
    setVal(`piSilver${i}Annual`, src.annualIncome);
    setVal(`piSilver${i}Rollover`, src.rolloverAmount);
    setVal(`piSilver${i}StartAge`, src.startAge);
  }

  // Gold (up to 4)
  const gold = pi.gold || [];
  for (let i = 1; i <= 4; i++) {
    const src = gold[i - 1] || {};
    setVal(`piGold${i}Owner`, src.owner);
    setVal(`piGold${i}Annual`, src.annualIncome);
    setVal(`piGold${i}Rollover`, src.rolloverAmount);
    setVal(`piGold${i}StartAge`, src.startAge);
  }

  // Reasonable defaults, if still blank
  const projEl = document.getElementById("piProjectionYears");
  if (projEl && !projEl.value) projEl.value = "30";
}

// Wire up the form & navigation
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("client-form");
  const saveStatus = document.getElementById("saveStatus");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      clientCase.timestamp = new Date().toISOString();
      updateClientCaseFromForm();
      clientCase.assetSummary = calculateAssetSummary(clientCase);
      renderAssetSummary(clientCase.assetSummary);

      console.log("Client case saved:", clientCase);

      if (saveStatus) {
        saveStatus.textContent = "Client data saved (in memory).";
        saveStatus.style.color = "#059669";
      }
    });
  }

  // Save Plan Inputs button
  const savePlanInputsBtn = document.getElementById("save-plan-inputs");
  const planInputsStatus = document.getElementById("planInputsStatus");

  if (savePlanInputsBtn) {
    savePlanInputsBtn.addEventListener("click", () => {
      updatePlanInputsFromForm();
      console.log("Plan inputs saved:", clientCase.planInputs);

      if (planInputsStatus) {
        planInputsStatus.textContent = "Plan inputs saved (in memory).";
        planInputsStatus.style.color = "#059669";
      }
    });
  }

  // Step nav buttons
  const stepButtons = document.querySelectorAll(".ap-step-btn");
  stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = btn.getAttribute("data-step");
      if (!step || btn.disabled) return;

      // If going to Assets, capture latest form data and update summary
      if (step === "assets") {
        clientCase.timestamp = new Date().toISOString();
        updateClientCaseFromForm();
        clientCase.assetSummary = calculateAssetSummary(clientCase);
        renderAssetSummary(clientCase.assetSummary);
      }

      // If going to Inputs, sync data & load plan inputs
      if (step === "inputs") {
        clientCase.timestamp = new Date().toISOString();
        updateClientCaseFromForm(); // so livingExpensesAnnual etc are fresh
        loadPlanInputsIntoForm();
      }

      // Toggle active button styles
      stepButtons.forEach((b) => b.classList.remove("ap-step-btn-active"));
      btn.classList.add("ap-step-btn-active");

      // Toggle sections
      const sections = [
        "step-client",
        "step-assets",
        "step-inputs",
        "step-plans",
        "step-summary",
      ];
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (id === `step-${step}`) {
          el.classList.remove("ap-card-hidden");
        } else {
          el.classList.add("ap-card-hidden");
        }
      });
    });
  });
});
