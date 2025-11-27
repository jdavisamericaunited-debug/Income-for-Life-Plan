// Simple in-memory "case" object.
// Later, we will expand this and feed it into the calculation engine.
const clientCase = {
  clientName: "",
  clientDOB: "",
  clientEmail: "",
  clientPhone: "",
  clientCity: "",
  clientState: "",
  spouseName: "",
  spouseDOB: "",
  targetRetireAgeClient: null,
  targetRetireAgeSpouse: null,
  desiredIncomeToday: null,
  notesGoals: "",
};

// Wire up the Client Goals & Data form.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("client-form");
  const saveStatus = document.getElementById("saveStatus");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Grab values from the form fields
    clientCase.clientName = document.getElementById("clientName").value.trim();
    clientCase.clientDOB = document.getElementById("clientDOB").value;
    clientCase.clientEmail = document.getElementById("clientEmail").value.trim();
    clientCase.clientPhone = document.getElementById("clientPhone").value.trim();
    clientCase.clientCity = document.getElementById("clientCity").value.trim();
    clientCase.clientState = document.getElementById("clientState").value.trim();

    clientCase.spouseName = document.getElementById("spouseName").value.trim();
    clientCase.spouseDOB = document.getElementById("spouseDOB").value;

    const retireClientVal = document.getElementById("targetRetireAgeClient").value;
    const retireSpouseVal = document.getElementById("targetRetireAgeSpouse").value;
    const desiredIncomeVal = document.getElementById("desiredIncomeToday").value;

    clientCase.targetRetireAgeClient = retireClientVal
      ? Number(retireClientVal)
      : null;
    clientCase.targetRetireAgeSpouse = retireSpouseVal
      ? Number(retireSpouseVal)
      : null;
    clientCase.desiredIncomeToday = desiredIncomeVal
      ? Number(desiredIncomeVal)
      : null;

    clientCase.notesGoals = document.getElementById("notesGoals").value.trim();

    // For now, just log the case so we can verify data capture
    console.log("Client case saved:", clientCase);

    // Update status indicator
    if (saveStatus) {
      saveStatus.textContent = "Client data saved (in memory).";
      saveStatus.style.color = "#059669"; // green-ish
    }

    // Later: move on to Step 2 automatically, or enable tabs.
  });

  // Step buttons are mostly placeholders right now.
  const stepButtons = document.querySelectorAll(".ap-step-btn");
  stepButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = btn.getAttribute("data-step");
      if (!step || btn.disabled) return;

      // Toggle active button styles
      stepButtons.forEach((b) => b.classList.remove("ap-step-btn-active"));
      btn.classList.add("ap-step-btn-active");

      // Toggle sections
      const sections = [
        "step-client",
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
