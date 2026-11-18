const ALLOWED_WORK_TYPES = new Set(["salaried", "self-employed", "other"]);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
function emi(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 1200;
  if (!monthlyRate) return principal / months;
  const growth = Math.pow(1 + monthlyRate, months);
  return principal * monthlyRate * growth / (growth - 1);
}
function principalForPayment(payment, annualRate, months) {
  if (payment <= 0 || months <= 0) return 0;
  const monthlyRate = annualRate / 1200;
  if (!monthlyRate) return payment * months;
  return payment * (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;
}
function validate(input) {
  const fields = {};
  const numeric = ["desiredLoan", "annualRate", "tenureMonths", "monthlyIncome", "existingEmi"];
  const values = Object.fromEntries(numeric.map(key => [key, Number(input[key])]));
  if (!Number.isFinite(values.desiredLoan) || values.desiredLoan < 50000 || values.desiredLoan > 5000000) fields.desiredLoan = "Choose a loan amount from ₹50,000 to ₹50 lakh.";
  if (!Number.isFinite(values.annualRate) || values.annualRate < 8 || values.annualRate > 30) fields.annualRate = "Choose an example rate from 8% to 30%.";
  if (!Number.isInteger(values.tenureMonths) || values.tenureMonths < 12 || values.tenureMonths > 120) fields.tenureMonths = "Choose a term from 12 to 120 months.";
  if (!Number.isFinite(values.monthlyIncome) || values.monthlyIncome < 20000 || values.monthlyIncome > 1000000) fields.monthlyIncome = "Enter a monthly income from ₹20,000 to ₹10 lakh.";
  if (!Number.isFinite(values.existingEmi) || values.existingEmi < 0 || values.existingEmi > 200000) fields.existingEmi = "Enter existing EMIs from ₹0 to ₹2 lakh.";
  if (!ALLOWED_WORK_TYPES.has(input.workType)) fields.workType = "Choose a work profile.";
  return { fields, values };
}
function calculate(input) {
  const { fields, values } = validate(input || {});
  if (Object.keys(fields).length) return { ok: false, fields };
  const { desiredLoan, annualRate, tenureMonths, monthlyIncome, existingEmi } = values;
  // Educational budgeting heuristic only, not a credit or approval model.
  const monthlyCapacity = clamp(monthlyIncome * 0.35 - existingEmi, 0, monthlyIncome);
  const maxAffordable = principalForPayment(monthlyCapacity, annualRate, tenureMonths);
  const estimatedAmount = Math.floor(Math.min(desiredLoan, maxAffordable) / 1000) * 1000;
  const estimatedEmi = emi(estimatedAmount, annualRate, tenureMonths);
  const offset = [Math.max(8, annualRate - 2), annualRate, Math.min(30, annualRate + 3)];
  return {
    ok: true,
    estimate: {
      desiredAmount: Math.round(desiredLoan),
      estimatedAmount: Math.max(0, estimatedAmount),
      estimatedEmi: Math.round(estimatedEmi),
      requestedEmi: Math.round(emi(desiredLoan, annualRate, tenureMonths)),
      monthlyCapacity: Math.round(monthlyCapacity),
      existingEmi: Math.round(existingEmi),
      fitsBudget: emi(desiredLoan, annualRate, tenureMonths) <= monthlyCapacity
    },
    scenarios: offset.map(rate => ({ rate, monthlyEmi: Math.round(emi(estimatedAmount, rate, tenureMonths)) })),
    disclaimer: "Simple educational estimate only. Not a credit decision, financial advice, lender offer, or guarantee of approval. No submitted values are saved by this demo."
  };
}
module.exports = { calculate };
