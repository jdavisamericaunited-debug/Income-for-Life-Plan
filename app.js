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
};

// Wire up the form
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("client-form");
  const saveStatus = document.getElementById("saveStatus");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      clientCase.timestamp = new Date().toISOString();

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
      clientCase.retirementTiming.targetAgeHis = numOrNull(
        "targetRetireAgeClient"
      );
      clientCase.retirementTiming.targetAgeHer = numOrNull(
        "targetRetireAgeSpouse"
      );
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

      // For now: log to console so you can confirm everything is captured
      console.log("Client case saved:", clientCase);

      if (saveStatus) {
        saveStatus.textContent = "Client data saved (in memory).";
        saveStatus.style.color = "#059669";
      }
    });
  }

  // Step nav buttons (UI only for now)
  const stepButtons = document.querySelectorAll(".ap-step-btn");
  stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = btn.getAttribute("data-step");
      if (!step || btn.disabled) return;

      stepButtons.forEach((b) => b.classList.remove("ap-step-btn-active"));
      btn.classList.add("ap-step-btn-active");

      const sections = ["step-client", "step-inputs", "step-plans", "step-summary"];
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
