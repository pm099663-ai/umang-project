const form = document.getElementById("estimateForm");
const resultContent = document.getElementById("resultContent");
const calculateButton = document.getElementById("calculateButton");
const stepPanels = [...document.querySelectorAll("[data-panel]")];
const stepIndicators = [...document.querySelectorAll("[data-step-indicator]")];
const sliders = [
  ["desiredLoan", "desiredLoanValue", "currency"],
  ["annualRate", "annualRateValue", "rate"],
  ["tenureMonths", "tenureValue", "tenure"],
  ["monthlyIncome", "incomeValue", "currency"],
  ["existingEmi", "existingEmiValue", "currency"]
];
const money = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const formatMoney = amount => "₹" + money.format(Math.max(0, Math.round(Number(amount) || 0)));
const field = id => document.getElementById(id);
const formatValue = (value, kind) => {
  if (kind === "currency") return formatMoney(value);
  if (kind === "rate") return Number(value).toFixed(Number(value) % 1 ? 2 : 0) + "%";
  if (kind === "tenure") return Number(value) / 12 + (Number(value) === 12 ? " year" : " years");
  return value;
};
function updateRange(el) {
  const min = Number(el.min), max = Number(el.max), value = Number(el.value);
  el.style.setProperty("--progress", ((value - min) / (max - min) * 100) + "%");
}
function emi(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const rate = annualRate / 1200;
  if (!rate) return principal / months;
  const factor = Math.pow(1 + rate, months);
  return principal * rate * factor / (factor - 1);
}
function updateLiveSummary() {
  for (const [sliderId, outputId, kind] of sliders) {
    const input = field(sliderId);
    updateRange(input);
    field(outputId).textContent = formatValue(input.value, kind);
  }
  const payment = emi(Number(field("desiredLoan").value), Number(field("annualRate").value), Number(field("tenureMonths").value));
  field("summaryEmi").textContent = money.format(Math.round(payment));
  field("heroEmi").textContent = money.format(Math.round(payment));
  field("summaryLoan").textContent = formatMoney(field("desiredLoan").value);
  field("summaryTenure").textContent = Number(field("tenureMonths").value) / 12 + " years";
  field("summaryRate").textContent = Number(field("annualRate").value).toFixed(2).replace(/\.00$/, "") + "% p.a.";
}
function showStep(step) {
  stepPanels.forEach(panel => panel.classList.toggle("hidden", Number(panel.dataset.panel) !== step));
  stepIndicators.forEach(indicator => {
    const current = Number(indicator.dataset.stepIndicator);
    indicator.classList.toggle("active", current === step);
    indicator.classList.toggle("done", current < step);
  });
  document.querySelector(".calculator-card").scrollIntoView({ behavior: "smooth", block: "start" });
}
function getPayload() {
  return {
    desiredLoan: Number(field("desiredLoan").value),
    annualRate: Number(field("annualRate").value),
    tenureMonths: Number(field("tenureMonths").value),
    monthlyIncome: Number(field("monthlyIncome").value),
    existingEmi: Number(field("existingEmi").value),
    workType: field("workType").value
  };
}
function renderResult(data) {
  const e = data.estimate;
  const fitClass = e.fitsBudget ? "" : " adjust";
  const fitText = e.fitsBudget
    ? "At these example numbers, the requested payment is within this demo’s simple monthly budget estimate."
    : e.monthlyCapacity <= 0
      ? "These example numbers leave no monthly payment capacity under the demo assumption. Try changing the inputs."
      : "The requested payment is above this demo’s simple budget estimate. The amount below is adjusted to fit the example assumption.";
  const scenarios = data.scenarios.map(s => `
    <div class="scenario"><b>${formatMoney(s.monthlyEmi)}</b><span>${s.rate}% example rate</span></div>`).join("");
  resultContent.innerHTML = `
    <div class="result-panel">
      <div class="result-main"><div><div class="result-label">Sample amount within budget</div><div class="result-number">${formatMoney(e.estimatedAmount)}</div><div class="result-sub">Requested: ${formatMoney(e.desiredAmount)}</div></div><div class="result-icon" aria-hidden="true">₹</div></div>
      <div class="result-meta"><div><small>Estimated monthly payment</small><b>${formatMoney(e.estimatedEmi)} / month</b></div><div><small>Existing monthly EMIs</small><b>${formatMoney(e.existingEmi)}</b></div></div>
      <div class="budget-note${fitClass}">${fitText}</div>
    </div>
    <h4 class="scenario-title">Example monthly payments</h4>
    <p class="scenario-note">Same amount and term at illustrative rates. These are not lender offers.</p>
    <div class="scenario-list">${scenarios}</div>
    <p class="disclaimer-mini">${data.disclaimer}</p>`;
}
for (const [sliderId] of sliders) field(sliderId).addEventListener("input", updateLiveSummary);
document.querySelectorAll("[data-next]").forEach(button => button.addEventListener("click", () => showStep(Number(button.dataset.next))));
document.querySelectorAll("[data-back]").forEach(button => button.addEventListener("click", () => showStep(Number(button.dataset.back))));
form.addEventListener("submit", async event => {
  event.preventDefault();
  calculateButton.disabled = true;
  calculateButton.textContent = "Calculating…";
  try {
    const response = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(getPayload()) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not calculate this estimate.");
    renderResult(data);
    showStep(3);
  } catch (error) {
    resultContent.innerHTML = `<div class="budget-note adjust">${String(error.message || "Could not connect to the estimate service.")}</div>`;
    showStep(3);
  } finally {
    calculateButton.disabled = false;
    calculateButton.innerHTML = 'See my estimate <span>→</span>';
  }
});
document.getElementById("startOver").addEventListener("click", () => showStep(1));
updateLiveSummary();
